const mongoose = require("mongoose");

const billItemSchema = new mongoose.Schema(
  {
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    product_name: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0.001,
    },
    unit_price: {
      type: Number,
      required: true,
      min: 0,
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false },
);

const billSchema = new mongoose.Schema(
  {
    bill_number: {
      type: String,
      required: true,
      unique: true,
    },
    items: {
      type: [billItemSchema],
      required: true,
      validate: {
        validator: (items) => items.length > 0,
        message: "A bill must contain at least one item",
      },
    },
    customer_name: {
      type: String,
      trim: true,
      default: "Walk-in Customer",
    },
    customer_phone: {
      type: String,
      trim: true,
      default: null,
    },
    total_amount: {
      type: Number,
      required: true,
      min: 0,
    },
    payment_type: {
      type: String,
      enum: ["cash", "card", "upi", "other"],
      required: true,
    },
    amount_paid: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    balance_due: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    payment_status: {
      type: String,
      enum: ["paid", "pending", "partially_paid"],
      required: true,
      default: "pending",
    },
    purchase_date: {
      type: Date,
      default: Date.now,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
);

module.exports = mongoose.model("Bill", billSchema);
