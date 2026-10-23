const express = require("express");
const router = express.Router();

const {
  createUser,
  loginUser,
  getUsers,
  updateUser,
  deleteUser,
} = require("../Controller/userAuth");
const {
  addProduct,
  getAllProducts,
  updateProductById,
} = require("../Controller/product");
const {
  createBill,
  getTransactionHistories,
  getTransactionSummary,
} = require("../Controller/billingController");
const {
  createSupplier,
  updateSupplier,
  deleteSupplier,
  getSuppliers,
  addReturningProduct,
  updateReturningProduct,
} = require("../Controller/Supplier");
const { getDashboardData } = require("../Controller/dashboard");

router.post("/create-user", createUser);
router.get("/get-all-user", getUsers);
router.put("/edit-user/:id", updateUser);
router.delete("/delete-user/:id", deleteUser);
router.post("/login", loginUser);

router.post("/add-products", addProduct);
router.get("/get-all-products", getAllProducts);
router.put("/update-products/:id", updateProductById);

router.post("/create-bill", createBill);
router.get("/transaction-histories", getTransactionHistories);
router.get("/transaction-summary", getTransactionSummary);

router.post("/create-supplier", createSupplier);
router.get("/get-supplier", getSuppliers);
router.put("/edit-supplier/:id", updateSupplier);
router.delete("/delete-supplier/:id", deleteSupplier);
router.post("/return/:id/returning-products", addReturningProduct);
router.put("/return/:id/returning-products/:productId", updateReturningProduct);

router.get("/get-dashboard", getDashboardData);

module.exports = router;
