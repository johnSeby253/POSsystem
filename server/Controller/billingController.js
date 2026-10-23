const mongoose = require("mongoose");
const crypto = require("crypto");

const Product = require("../Models/Product"); // Adjust path
const Bill = require("../Models/Billing");
const Transaction = require("../Models/transaction");

exports.createBill = async (req, res) => {
  const session = await mongoose.startSession();
  let transactionStarted = false;

  try {
    const {
      items,
      customer_name,
      customer_phone,
      payment_type,
      amount_paid,
      purchase_date,
      discount = 0,
    } = req.body;

    console.log("Req", req.body);

    // 1. Validate items
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: "At least one item is required",
      });
    }

    // Match the payment types allowed by your Bill schema
    if (!["cash", "card", "upi", "other"].includes(payment_type)) {
      return res.status(400).json({
        message: "Invalid payment type",
      });
    }

    // 2. Validate IDs and quantities
    for (const item of items) {
      if (!mongoose.Types.ObjectId.isValid(item.product_id)) {
        return res.status(400).json({
          message: `Invalid product ID: ${item.product_id}`,
        });
      }

      const quantity = Number(item.quantity);

      if (!Number.isFinite(quantity) || quantity <= 0) {
        return res.status(400).json({
          message: "Each item must have a positive quantity",
        });
      }
    }

    const discountValue = Number(discount);
    const paidValue = Number(amount_paid ?? 0);

    console.log("Discount", discountValue);

    if (!Number.isFinite(discountValue) || discountValue < 0) {
      return res.status(400).json({
        message: "Discount must be a valid non-negative number",
      });
    }

    if (!Number.isFinite(paidValue) || paidValue < 0) {
      return res.status(400).json({
        message: "Amount paid must be a valid non-negative number",
      });
    }

    if (
      purchase_date !== undefined &&
      Number.isNaN(new Date(purchase_date).getTime())
    ) {
      return res.status(400).json({
        message: "Invalid purchase date",
      });
    }

    // 3. Combine duplicate product IDs into a single line item
    const quantityMap = new Map();

    for (const item of items) {
      const id = item.product_id.toString();
      const quantity = Number(item.quantity);

      quantityMap.set(id, (quantityMap.get(id) || 0) + quantity);
    }

    const requestedItems = [...quantityMap.entries()].map(
      ([product_id, quantity]) => ({
        product_id,
        quantity,
      }),
    );

    const productIds = requestedItems.map((item) => item.product_id);

    // 4. Start MongoDB transaction
    session.startTransaction();
    transactionStarted = true;

    const products = await Product.find({
      _id: { $in: productIds },
      is_active: true,
    }).session(session);

    if (products.length !== productIds.length) {
      await session.abortTransaction();
      transactionStarted = false;

      return res.status(400).json({
        message: "One or more products were not found or are inactive",
      });
    }

    const productMap = new Map(
      products.map((product) => [product._id.toString(), product]),
    );

    // 5. Calculate bill items using database prices
    let subtotal = 0;
    const billItems = [];

    for (const item of requestedItems) {
      const product = productMap.get(item.product_id);
      const quantity = item.quantity;

      if (product.stock_quantity < quantity) {
        await session.abortTransaction();
        transactionStarted = false;

        return res.status(400).json({
          message: `Insufficient stock for ${product.product_name}`,
          available_stock: product.stock_quantity,
          requested_quantity: quantity,
        });
      }

      const unitPrice = Number(product.selling_price);
      const lineSubtotal = Number((unitPrice * quantity).toFixed(2));

      subtotal += lineSubtotal;

      billItems.push({
        product_id: product._id,
        product_name: product.product_name,
        category_id: product.category_id,
        unit: product.unit,
        purchase_price: Number(product.purchase_price),
        unit_price: unitPrice,
        quantity,
        subtotal: lineSubtotal,
      });
    }

    subtotal = Number(subtotal.toFixed(2));

    // 6. Apply discount
    if (discountValue > subtotal) {
      await session.abortTransaction();
      transactionStarted = false;

      return res.status(400).json({
        message: "Discount cannot exceed the subtotal",
      });
    }

    const totalAmount = Number((subtotal - discountValue).toFixed(2));

    if (paidValue > totalAmount) {
      await session.abortTransaction();
      transactionStarted = false;

      return res.status(400).json({
        message: "Amount paid cannot exceed the final bill total",
      });
    }

    const balanceDue = Number((totalAmount - paidValue).toFixed(2));

    let paymentStatus = "pending";

    if (balanceDue === 0) {
      paymentStatus = "paid";
    } else if (paidValue > 0) {
      paymentStatus = "partially_paid";
    }

    // 7. Deduct stock safely
    // The stock condition prevents selling inventory that has
    // already been consumed by another checkout.
    for (const item of requestedItems) {
      const result = await Product.updateOne(
        {
          _id: item.product_id,
          is_active: true,
          stock_quantity: { $gte: item.quantity },
        },
        {
          $inc: {
            stock_quantity: -item.quantity,
          },
        },
        { session },
      );

      if (result.modifiedCount !== 1) {
        throw new Error(
          `Stock changed during checkout for product ${item.product_id}. Please retry.`,
        );
      }
    }

    // 8. Create and save the bill
    const billNumber = `BILL-${Date.now()}-${crypto
      .randomBytes(3)
      .toString("hex")
      .toUpperCase()}`;

    const [bill] = await Bill.create(
      [
        {
          bill_number: billNumber,
          items: billItems,
          customer_name: customer_name?.trim() || "Walk-in Customer",
          customer_phone: customer_phone?.trim() || null,
          discount: discountValue,
          total_amount: totalAmount,
          payment_type,
          amount_paid: paidValue,
          balance_due: balanceDue,
          payment_status: paymentStatus,
          purchase_date: purchase_date ? new Date(purchase_date) : new Date(),
        },
      ],
      { session },
    );

    // 9. Create transaction history
    await createTransactionHistory({
      bill,
      session,
      performed_by: req.user?._id || null,
    });

    // 10. Commit bill, stock changes, and transaction history
    await session.commitTransaction();
    transactionStarted = false;

    return res.status(201).json({
      message: "Bill created successfully",
      bill: {
        _id: bill._id,
        bill_number: bill.bill_number,
        items: bill.items,
        customer_name: bill.customer_name,
        customer_phone: bill.customer_phone,
        subtotal,
        discount: bill.discount,
        total_amount: bill.total_amount,
        payment_type: bill.payment_type,
        amount_paid: bill.amount_paid,
        balance_due: bill.balance_due,
        payment_status: bill.payment_status,
        purchase_date: bill.purchase_date,
      },
    });
  } catch (err) {
    if (transactionStarted) {
      await session.abortTransaction();
    }

    console.error("Error creating bill:", err);

    return res.status(500).json({
      message: "Failed to create bill",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  } finally {
    await session.endSession();
  }
};

const createTransactionHistory = async ({
  bill,
  session,
  performed_by = null,
}) => {
  const transactions = bill.items.map((item) => ({
    billing_id: bill._id,
    invoice_number: bill.bill_number,

    product_id: item.product_id,
    product_name: item.product_name,

    transaction_type: "SALE",
    quantity: item.quantity,

    amount: Number(
      (Number(item.unit_price) * Number(item.quantity)).toFixed(2),
    ),

    payment_method: bill.payment_type,

    description: `Sale of ${item.product_name} - Invoice ${bill.bill_number}`,

    performed_by,
  }));

  return Transaction.insertMany(transactions, { session });
};



exports.getTransactionHistories = async (req, res) => {
  try {
    const {
      fromDate,
      toDate,
      payment_method,
      search,
      page = 1,
      limit = 10,
    } = req.query;

    const currentPage = Math.max(1, parseInt(page, 10) || 1);
    const pageLimit = Math.min(
      100,
      Math.max(1, parseInt(limit, 10) || 10)
    );

    // Build filters
    const filter = {};

    // Filter by date range
    if (fromDate || toDate) {
      filter.created_at = {};

      if (fromDate) {
        const startDate = new Date(fromDate);

        if (Number.isNaN(startDate.getTime())) {
          return res.status(400).json({
            success: false,
            message: "Invalid fromDate",
          });
        }

        startDate.setHours(0, 0, 0, 0);
        filter.created_at.$gte = startDate;
      }

      if (toDate) {
        const endDate = new Date(toDate);

        if (Number.isNaN(endDate.getTime())) {
          return res.status(400).json({
            success: false,
            message: "Invalid toDate",
          });
        }

        endDate.setHours(23, 59, 59, 999);
        filter.created_at.$lte = endDate;
      }

      if (
        filter.created_at.$gte &&
        filter.created_at.$lte &&
        filter.created_at.$gte > filter.created_at.$lte
      ) {
        return res.status(400).json({
          success: false,
          message: "fromDate cannot be after toDate",
        });
      }
    }

    // Filter by payment method
    if (payment_method) {
      const allowedMethods = ["cash", "card", "upi", "other"];

      if (!allowedMethods.includes(payment_method.toLowerCase())) {
        return res.status(400).json({
          success: false,
          message: "Invalid payment method",
        });
      }

      filter.payment_method = payment_method.toLowerCase();
    }

    // Search by product name, invoice number, or description
    if (search?.trim()) {
      const escapedSearch = search.trim().replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );

      const searchRegex = new RegExp(escapedSearch, "i");

      filter.$or = [
        { product_name: searchRegex },
        { invoice_number: searchRegex },
        { description: searchRegex },
      ];
    }

    // Fetch paginated transactions and total count
    const [transactions, totalRecords] = await Promise.all([
      Transaction.find(filter)
        .populate("product_id", "product_name")
        .populate("performed_by", "name username")
        .sort({ created_at: -1, _id: -1 })
        .skip((currentPage - 1) * pageLimit)
        .limit(pageLimit)
        .lean(),

      Transaction.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalRecords / pageLimit);

    return res.status(200).json({
      success: true,
      message: "Transaction histories fetched successfully",
      data: transactions,
      pagination: {
        currentPage,
        limit: pageLimit,
        totalRecords,
        totalPages,
        hasNextPage: currentPage < totalPages,
        hasPrevPage: currentPage > 1,
      },
    });
  } catch (error) {
    console.error("Get transaction histories error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch transaction histories",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
};

exports.getTransactionSummary = async (req, res) => {
  try {
    const summary = await Transaction.aggregate([
      {
        $group: {
          _id: null,

          totalTransactions: {
            $sum: 1,
          },

          totalSales: {
            $sum: {
              $cond: [
                { $eq: ["$transaction_type", "SALE"] },
                1,
                0,
              ],
            },
          },

          totalSalesAmount: {
            $sum: {
              $cond: [
                { $eq: ["$transaction_type", "SALE"] },
                "$amount",
                0,
              ],
            },
          },
        },
      },
    ]);

    const result = summary[0] || {
      totalTransactions: 0,
      totalSales: 0,
      totalSalesAmount: 0,
    };

    return res.status(200).json({
      success: true,
      message: "Transaction summary fetched successfully",
      data: {
        totalTransactions: result.totalTransactions,
        totalSales: result.totalSales,
        totalSalesAmount: Number(
          result.totalSalesAmount.toFixed(2)
        ),
      },
    });
  } catch (error) {
    console.error("Transaction summary error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch transaction summary",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
};