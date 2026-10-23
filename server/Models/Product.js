const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    product_name: {
      type: String,
      required: true,
      trim: true,
    },

    product_Id: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },

    category_id: {
      //   type: mongoose.Schema.Types.ObjectId,
      type: String,
      ref: "Category",
      required: true,
    },

    unit: {
      type: String,
      enum: ["piece", "kg", "gram", "litre", "ml", "pack"],
      default: "piece",
      required: true,
    },

    purchase_price: {
      type: Number,
      required: true,
      min: 0,
    },

    selling_price: {
      type: Number,
      required: true,
      min: 0,
    },

    wholesale_price: {
      type: Number,
      default: null,
      min: 0,
    },

    stock_quantity: {
      type: Number,
      default: 0,
      min: 0,
    },

    expiry_date: {
      type: Date,
      default: null,
    },

    agency_id: {
      //   type: mongoose.Schema.Types.ObjectId,
      type: String,
      ref: "Agency",
      required: true,
    },

    is_active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
);

module.exports = mongoose.model("Product", productSchema);
