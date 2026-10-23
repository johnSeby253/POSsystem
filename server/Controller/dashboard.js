
const Bill = require("../Models/Billing");
const Product = require("../Models/Product");
const Supplier = require("../Models/Supplier");
const Transaction = require("../Models/transaction");
const User = require("../Models/User");

const getDashboardData = async (req, res) => {
  try {
    const now = new Date();

    // Local calendar-day boundaries for the server's timezone.
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    const startOfTomorrow = new Date(startOfToday);
    startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

    const startOfMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    );

    const startOfPreviousMonth = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1
    );

    const startOfSevenDays = new Date(startOfToday);
    startOfSevenDays.setDate(startOfSevenDays.getDate() - 6);

    // Only fully paid bills contribute to collected sales revenue.
    // If partially paid bills should count toward revenue, change this
    // to use amount_paid instead of total_amount.
    const paidBillMatch = {
      payment_status: "paid",
    };

    const [
      todaySalesResult,
      monthSalesResult,
      previousMonthSalesResult,
      todayBillCount,
      totalBillCount,
      paymentSummary,
      totalProducts,
      lowStockCount,
      lowStockProducts,
      inventoryValueResult,
      activeSuppliers,
      returnedProductSummary,
      totalStaff,
      totalAdmins,
      recentTransactions,
      transactionSummary,
      dailySales,
      recentBills,
    ] = await Promise.all([
      // Today's collected sales
      Bill.aggregate([
        {
          $match: {
            ...paidBillMatch,
            purchase_date: {
              $gte: startOfToday,
              $lt: startOfTomorrow,
            },
          },
        },
        {
          $group: {
            _id: null,
            revenue: { $sum: "$total_amount" },
            bills: { $sum: 1 },
            averageBill: { $avg: "$total_amount" },
          },
        },
      ]),

      // Current month's paid sales
      Bill.aggregate([
        {
          $match: {
            ...paidBillMatch,
            purchase_date: { $gte: startOfMonth, $lt: startOfTomorrow },
          },
        },
        {
          $group: {
            _id: null,
            revenue: { $sum: "$total_amount" },
            bills: { $sum: 1 },
          },
        },
      ]),

      // Previous month's paid sales
      Bill.aggregate([
        {
          $match: {
            ...paidBillMatch,
            purchase_date: {
              $gte: startOfPreviousMonth,
              $lt: startOfMonth,
            },
          },
        },
        {
          $group: {
            _id: null,
            revenue: { $sum: "$total_amount" },
          },
        },
      ]),

      // Bills created today, regardless of payment status
      Bill.countDocuments({
        purchase_date: {
          $gte: startOfToday,
          $lt: startOfTomorrow,
        },
      }),

      Bill.countDocuments(),

      // Payment method and status breakdown
      Bill.aggregate([
        {
          $group: {
            _id: {
              payment_type: "$payment_type",
              payment_status: "$payment_status",
            },
            count: { $sum: 1 },
            total: { $sum: "$total_amount" },
            paid: { $sum: "$amount_paid" },
            outstanding: { $sum: "$balance_due" },
          },
        },
        {
          $sort: { "_id.payment_type": 1 },
        },
      ]),

      Product.countDocuments({ is_active: true }),

      // Low stock threshold: 10 units or fewer.
      // Adjust this threshold to suit your store.
      Product.countDocuments({
        is_active: true,
        stock_quantity: { $lte: 10 },
      }),

      Product.find({
        is_active: true,
        stock_quantity: { $lte: 10 },
      })
        .select(
          "product_name product_Id category_id stock_quantity unit purchase_price selling_price"
        )
        .sort({ stock_quantity: 1 })
        .limit(10)
        .lean(),

      // Estimated inventory value at purchase cost
      Product.aggregate([
        { $match: { is_active: true } },
        {
          $group: {
            _id: null,
            stockUnits: { $sum: "$stock_quantity" },
            costValue: {
              $sum: {
                $multiply: ["$stock_quantity", "$purchase_price"],
              },
            },
            sellingValue: {
              $sum: {
                $multiply: ["$stock_quantity", "$selling_price"],
              },
            },
          },
        },
      ]),

      Supplier.countDocuments({ isActive: true }),

      // Supplier return details
      Supplier.aggregate([
        { $match: { isActive: true } },
        {
          $group: {
            _id: null,
            suppliersWithReturns: {
              $sum: { $cond: ["$returningProducts", 1, 0] },
            },
            returnedUnits: {
              $sum: "$noOfReturningProducts",
            },
          },
        },
      ]),

      User.countDocuments({ role: "staff" }),
      User.countDocuments({ role: "admin" }),

      // Recent stock and transaction activity
      Transaction.find()
        .sort({ created_at: -1 })
        .limit(10)
        .populate("performed_by", "username")
        .select(
          "invoice_number product_name transaction_type quantity amount payment_method description created_at performed_by"
        )
        .lean(),

      // Transaction activity grouped by type
      Transaction.aggregate([
        {
          $group: {
            _id: "$transaction_type",
            count: { $sum: 1 },
            amount: { $sum: "$amount" },
            quantity: { $sum: "$quantity" },
          },
        },
        { $sort: { count: -1 } },
      ]),

      // Seven calendar days of paid sales, including days with zero sales
      Bill.aggregate([
        {
          $match: {
            ...paidBillMatch,
            purchase_date: {
              $gte: startOfSevenDays,
              $lt: startOfTomorrow,
            },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$purchase_date",
                timezone: "Asia/Kolkata",
              },
            },
            revenue: { $sum: "$total_amount" },
            bills: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      // Recent bills for the billing activity table
      Bill.find()
        .sort({ purchase_date: -1 })
        .limit(10)
        .select(
          "bill_number customer_name customer_phone total_amount amount_paid balance_due payment_type payment_status purchase_date discount"
        )
        .lean(),
    ]);

    const todaySales = todaySalesResult[0] || {
      revenue: 0,
      bills: 0,
      averageBill: 0,
    };

    const monthSales = monthSalesResult[0] || {
      revenue: 0,
      bills: 0,
    };

    const previousMonthSales = previousMonthSalesResult[0] || {
      revenue: 0,
    };

    const inventory = inventoryValueResult[0] || {
      stockUnits: 0,
      costValue: 0,
      sellingValue: 0,
    };

    const returns = returnedProductSummary[0] || {
      suppliersWithReturns: 0,
      returnedUnits: 0,
    };

    // Calculate month-over-month growth safely.
    let monthlyGrowth = null;

    if (previousMonthSales.revenue > 0) {
      monthlyGrowth =
        ((monthSales.revenue - previousMonthSales.revenue) /
          previousMonthSales.revenue) *
        100;
    } else if (monthSales.revenue > 0) {
      monthlyGrowth = 100;
    } else {
      monthlyGrowth = 0;
    }

    // Fill dates with zero sales so the chart always has 7 points.
    const salesByDate = new Map(
      dailySales.map((item) => [item._id, item])
    );

    const lastSevenDays = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfSevenDays);
      date.setDate(date.getDate() + i);

      const dateKey = [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0"),
      ].join("-");

      const dayData = salesByDate.get(dateKey);

      lastSevenDays.push({
        date: dateKey,
        day: date.toLocaleDateString("en-IN", {
          weekday: "short",
        }),
        revenue: dayData?.revenue || 0,
        bills: dayData?.bills || 0,
      });
    }

    const paymentBreakdown = paymentSummary.map((item) => ({
      paymentType: item._id.payment_type,
      paymentStatus: item._id.payment_status,
      bills: item.count,
      billedAmount: item.total,
      amountPaid: item.paid,
      balanceDue: item.outstanding,
    }));

    return res.status(200).json({
      success: true,
      message: "Dashboard data fetched successfully",
      data: {
        overview: {
          todayRevenue: todaySales.revenue,
          todayPaidBills: todaySales.bills,
          todayBillCount,
          averageBillValue: todaySales.averageBill,
          totalBills: totalBillCount,
          monthlyRevenue: monthSales.revenue,
          monthlyBills: monthSales.bills,
          previousMonthRevenue: previousMonthSales.revenue,
          monthlyGrowth: Number(monthlyGrowth.toFixed(2)),
        },

        inventory: {
          totalProducts,
          lowStockCount,
          lowStockProducts,
          totalStockUnits: inventory.stockUnits,
          estimatedCostValue: inventory.costValue,
          estimatedSellingValue: inventory.sellingValue,
        },

        suppliers: {
          activeSuppliers,
          suppliersWithReturns: returns.suppliersWithReturns,
          returnedUnits: returns.returnedUnits,
        },

        employees: {
          totalStaff,
          totalAdmins,
          totalUsers: totalStaff + totalAdmins,
        },

        payments: paymentBreakdown,

        salesChart: lastSevenDays,

        transactions: {
          recent: recentTransactions,
          summary: transactionSummary,
        },

        recentBills,
      },
    });
  } catch (error) {
    console.error("getDashboardData error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard data",
    });
  }
};

module.exports = { getDashboardData };
