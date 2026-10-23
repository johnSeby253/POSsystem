import axiosInstance from "../service/axiosInstance";

export const userLoginApiCall = (data) =>
  axiosInstance.post("/login", data, { withCredentials: true });

// :::: User/Employee ::::: //

export const createNewUserApiCall = (data) =>
  axiosInstance.post("/create-user", data);

export const getAllUsersApicall = (params) =>
  axiosInstance.get("/get-all-user", { params });

export const editUsersApicall = ({ id, data }) =>
  axiosInstance.put(`/edit-user/${id}`, data);

export const deleteUsersApicall = (id) =>
  axiosInstance.delete(`/delete-user/${id}`);
// :::: Products api calls ::: //

export const addProductApiCall = (data) =>
  axiosInstance.post("/add-products", data);

export const getAllproductApiCall = (params) =>
  axiosInstance.get("/get-all-products", {
    params,
  });

export const updateProductByIdApiCall = (id, data) =>
  axiosInstance.put(`/update-products/${id}`, data);

//   ::: Billing api calls :::  //

export const createBillApiCall = (data) =>
  axiosInstance.post("/create-bill", data);

export const transactionHistoryApiCall = (params) =>
  axiosInstance.get("/transaction-histories", { params });

export const getTransactionSummaryApiCall = () =>
  axiosInstance.get("/transaction-summary");

// ::::Suppliers:::: //

export const createSupplierApiCall = (data) =>
  axiosInstance.post("/create-supplier", data);

export const getSuppliersApiCall = () => axiosInstance.get("/get-supplier");

export const editSupplierApiCall = ({ id, data }) =>
  axiosInstance.put(`/edit-supplier/${id}`, data);

export const deleteSupplierApiCall = (id) =>
  axiosInstance.delete(`/delete-supplier/${id}`);

// Returning product APIs
export const addReturningProductApiCall = ({ id, data }) =>
  axiosInstance.post(`/return/${id}/returning-products`, data);

export const updateReturningProductApiCall = ({ id, productId, data }) =>
  axiosInstance.put(`/return/${id}/returning-products/${productId}`, data);

export const getDashboardApiCall = () => axiosInstance.get("/get-dashboard");
