
const mongoose = require("mongoose");
const Supplier = require("../Models/Supplier"); // Adjust path if needed

// 1. Add new supplier
exports.createSupplier = async (req, res) => {
  try {
    const {
      supplierCompanyName,
      supplierName,
      supplierPhone,
      companyAddress,
      isActive,
    } = req.body;

    if (
      !supplierCompanyName?.trim() ||
      !supplierName?.trim() ||
      !supplierPhone?.trim() ||
      !companyAddress?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Supplier company name, supplier name, phone, and address are required",
      });
    }

    const supplier = await Supplier.create({
      supplierCompanyName,
      supplierName,
      supplierPhone,
      companyAddress,
      ...(isActive !== undefined && { isActive }),
    });

    return res.status(201).json({
      success: true,
      message: "Supplier created successfully",
      supplier,
    });
  } catch (err) {
    console.error("Error creating supplier:", err);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


// 2. Edit supplier by ID
exports.updateSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      supplierCompanyName,
      supplierName,
      supplierPhone,
      companyAddress,
      isActive,
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid supplier ID",
      });
    }

    const updateData = {};

    if (supplierCompanyName !== undefined)
      updateData.supplierCompanyName = supplierCompanyName;

    if (supplierName !== undefined)
      updateData.supplierName = supplierName;

    if (supplierPhone !== undefined)
      updateData.supplierPhone = supplierPhone;

    if (companyAddress !== undefined)
      updateData.companyAddress = companyAddress;

    if (isActive !== undefined) {
      if (typeof isActive !== "boolean") {
        return res.status(400).json({
          success: false,
          message: "isActive must be true or false",
        });
      }

      updateData.isActive = isActive;
    }

    const supplier = await Supplier.findByIdAndUpdate(
      id,
      { $set: updateData },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: "Supplier not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Supplier updated successfully",
      supplier,
    });
  } catch (err) {
    console.error("Error updating supplier:", err);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


// 3. Delete supplier by ID
exports.deleteSupplier = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid supplier ID",
      });
    }

    const supplier = await Supplier.findByIdAndDelete(id);

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: "Supplier not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Supplier deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting supplier:", err);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


// 4. Get suppliers with pagination and status filter
exports.getSuppliers = async (req, res) => {
  try {
    let { page = 1, limit = 10, status = "all", search = "" } =
      req.query;

    page = Math.max(1, parseInt(page, 10) || 1);
    limit = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));

    const query = {};

    // Status: all, active, inactive
    if (status === "active") {
      query.isActive = true;
    } else if (status === "inactive") {
      query.isActive = false;
    } else if (status !== "all") {
      return res.status(400).json({
        success: false,
        message: "Status must be all, active, or inactive",
      });
    }

    // Search by company name, supplier name, or phone
    const searchText = search.trim();

    if (searchText) {
      const escapedSearch = searchText.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );

      query.$or = [
        { supplierCompanyName: { $regex: escapedSearch, $options: "i" } },
        { supplierName: { $regex: escapedSearch, $options: "i" } },
        { supplierPhone: { $regex: escapedSearch, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;

    const [suppliers, totalSuppliers] = await Promise.all([
      Supplier.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      Supplier.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      suppliers,
      pagination: {
        totalSuppliers,
        currentPage: page,
        totalPages: Math.ceil(totalSuppliers / limit),
        limit,
        hasNextPage: page * limit < totalSuppliers,
        hasPrevPage: page > 1,
      },
    });
  } catch (err) {
    console.error("Error fetching suppliers:", err);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


// 5. Add a returning product to a supplier
exports.addReturningProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { productName, productCode, quantity, reason, returnDate } =
      req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid supplier ID",
      });
    }

    if (!productName?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Product name is required",
      });
    }

    const parsedQuantity = Number(quantity);

    if (
      quantity === undefined ||
      quantity === "" ||
      !Number.isInteger(parsedQuantity) ||
      parsedQuantity < 1
    ) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a positive whole number",
      });
    }

    const supplier = await Supplier.findById(id);

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: "Supplier not found",
      });
    }

    supplier.returningProductDetails.push({
      productName,
      productCode,
      quantity: parsedQuantity,
      reason,
      ...(returnDate && { returnDate }),
    });

    // The schema's pre-validation hook recalculates the total
    await supplier.save();

    return res.status(201).json({
      success: true,
      message: "Returning product added successfully",
      supplier,
    });
  } catch (err) {
    console.error("Error adding returning product:", err);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


// 6. Edit a returning product by supplier ID and returning product ID
exports.updateReturningProduct = async (req, res) => {
  try {
    const { id, productId } = req.params;
    const { productName, productCode, quantity, reason, returnDate } =
      req.body;

    if (
      !mongoose.Types.ObjectId.isValid(id) ||
      !mongoose.Types.ObjectId.isValid(productId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid supplier ID or returning product ID",
      });
    }

    const supplier = await Supplier.findById(id);

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: "Supplier not found",
      });
    }

    const product = supplier.returningProductDetails.id(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Returning product not found",
      });
    }

    if (productName !== undefined) {
      if (!productName.trim()) {
        return res.status(400).json({
          success: false,
          message: "Product name cannot be empty",
        });
      }

      product.productName = productName;
    }

    if (productCode !== undefined) product.productCode = productCode;
    if (reason !== undefined) product.reason = reason;

    if (quantity !== undefined) {
      const parsedQuantity = Number(quantity);

      if (
        quantity === "" ||
        !Number.isInteger(parsedQuantity) ||
        parsedQuantity < 1
      ) {
        return res.status(400).json({
          success: false,
          message: "Quantity must be a positive whole number",
        });
      }

      product.quantity = parsedQuantity;
    }

    if (returnDate !== undefined) {
      const parsedDate = new Date(returnDate);

      if (Number.isNaN(parsedDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid return date",
        });
      }

      product.returnDate = parsedDate;
    }

    await supplier.save();

    return res.status(200).json({
      success: true,
      message: "Returning product updated successfully",
      supplier,
    });
  } catch (err) {
    console.error("Error updating returning product:", err);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
