const Product = require("../Models/Product");
const crypto = require("crypto");


exports.addProduct = async (req, res) => {
  try {
    const {
      product_name,
      category_id,
      agency_id,
      unit,
      purchase_price,
      selling_price,
      wholesale_price,
      stock_quantity,
      expiry_date,
      is_active,
    } = req.body;

    if (
      !product_name?.trim() ||
      !category_id ||
      !agency_id ||
      purchase_price === undefined ||
      selling_price === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Product name, category, agency, purchase price, and selling price are required",
      });
    }

    const purchasePrice = Number(purchase_price);
    const sellingPrice = Number(selling_price);
    const stockQuantity =
      stock_quantity === undefined || stock_quantity === ""
        ? 0
        : Number(stock_quantity);

    const wholesalePrice =
      wholesale_price === undefined ||
      wholesale_price === null ||
      wholesale_price === ""
        ? null
        : Number(wholesale_price);

    if (
      !Number.isFinite(purchasePrice) ||
      purchasePrice < 0 ||
      !Number.isFinite(sellingPrice) ||
      sellingPrice < 0 ||
      !Number.isFinite(stockQuantity) ||
      stockQuantity < 0 ||
      (wholesalePrice !== null &&
        (!Number.isFinite(wholesalePrice) || wholesalePrice < 0))
    ) {
      return res.status(400).json({
        success: false,
        message: "Prices and stock must be valid non-negative numbers",
      });
    }

    const productId = generateProductId(expiry_date);

    const product = await Product.create({
      product_name: product_name.trim(),
      product_Id: productId,
      category_id,
      agency_id,
      unit,
      purchase_price: purchasePrice,
      selling_price: sellingPrice,
      wholesale_price: wholesalePrice,
      stock_quantity: stockQuantity,
      expiry_date: expiry_date || null,
      is_active: is_active ?? true,
    });

    return res.status(201).json({
      success: true,
      message: "Product added successfully",
      data: product,
    });
  } catch (err) {
    console.log("Error at adding product", err);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const generateProductId = (expiryDate) => {
  const randomId = crypto
    .randomBytes(6)
    .toString("base64url")
    .replace(/[-_]/g, "")
    .slice(0, 8);

  const date = new Date(expiryDate);

  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const year = date.getUTCFullYear();

  return `${randomId}-${day}${month}${year}`;
};

exports.getAllProducts = async (req, res) => {
  try {
    const { search = "", page = 1, limit = 10 } = req.query;

    const currentPage = Math.max(1, parseInt(page, 10) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));

    const skip = (currentPage - 1) * pageSize;

    // Search by product name
    const filter = {};

    if (search.trim()) {
      filter.product_name = {
        $regex: search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        $options: "i",
      };
    }

    // Fetch paginated products and total count simultaneously
    const [products, totalProducts] = await Promise.all([
      Product.find(filter)
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(pageSize)
        .lean(),

      Product.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalProducts / pageSize);

    return res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      data: products,
      pagination: {
        totalProducts,
        currentPage,
        pageSize,
        totalPages,
        hasNextPage: currentPage < totalPages,
        hasPreviousPage: currentPage > 1,
      },
    });
  } catch (err) {
    console.error("Error at getting all products:", err);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch products",
    });
  }
};

exports.updateProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { $set: req.body },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: updatedProduct,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update product",
      error: error.message,
    });
  }
};
