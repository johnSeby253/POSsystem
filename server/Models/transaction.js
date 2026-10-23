
const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {


    billing_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Billing",
      default: null,
    },

    invoice_number: {
      type: String,
      default: null,
    },

    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      default: null,
    },

    product_name: {
      type: String,
      required: true,
    },

    transaction_type: {
      type: String,
      enum: [
        "SALE",
        "PURCHASE",
        "STOCK_IN",
        "STOCK_OUT",
        "RETURN",
        "ADJUSTMENT",
        "BILL_CANCELLED",
      ],
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 0,
    },

    amount: {
      type: Number,
      default: 0,
      min: 0,
    },

    payment_method: {
      type: String,
      default: null,
    },

    description: {
      type: String,
      default: "",
    },

    performed_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

transactionSchema.index({ billing_id: 1 });
transactionSchema.index({ product_id: 1, created_at: -1 });

module.exports = mongoose.model("Transaction", transactionSchema);
