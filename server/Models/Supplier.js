const mongoose = require("mongoose");

const returningProductSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: true,
      trim: true,
    },

    productCode: {
      type: String,
      trim: true,
      default: "",
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    reason: {
      type: String,
      trim: true,
      default: "",
    },

    returnDate: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const supplierSchema = new mongoose.Schema(
  {
    supplierCompanyName: {
      type: String,
      required: true,
      trim: true,
    },

    supplierName: {
      type: String,
      required: true,
      trim: true,
    },

    supplierPhone: {
      type: String,
      required: true,
      trim: true,
    },

    companyAddress: {
      type: String,
      required: true,
      trim: true,
    },

    returningProducts: {
      type: Boolean,
      default: false,
    },

    noOfReturningProducts: {
      type: Number,
      default: 0,
      min: 0,
    },

    returningProductDetails: {
      type: [returningProductSchema],
      default: [],
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Automatically calculate the total number of returned units
supplierSchema.pre("validate", function () {
  this.noOfReturningProducts = this.returningProductDetails.reduce(
    (total, product) => total + (product.quantity || 0),
    0
  );

  this.returningProducts = this.noOfReturningProducts > 0;
});

module.exports = mongoose.model("Supplier", supplierSchema);