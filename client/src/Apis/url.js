import {
  addProductApiCall,
  addReturningProductApiCall,
  createBillApiCall,
  createNewUserApiCall,
  createSupplierApiCall,
  deleteSupplierApiCall,
  deleteUsersApicall,
  editSupplierApiCall,
  editUsersApicall,
  getAllproductApiCall,
  getAllUsersApicall,
  getSuppliersApiCall,
  getTransactionSummaryApiCall,
  transactionHistoryApiCall,
  updateProductByIdApiCall,
  updateReturningProductApiCall,
  userLoginApiCall,
} from ".";

export const userLogin = async (data) => {
  try {
    const response = await userLoginApiCall(data);
    console.log("Login Data",response.data);
    
    return response.data;
  } catch (err) {
    console.error("Error at login user:::>>>", err);
  }
};

// :::: Product Service Function :::: //

export const addProduct = async (data) => {
  try {
    const response = await addProductApiCall(data);
    return response.data;
  } catch (err) {
    console.error("Error at Adding new Product ---- >", err);
  }
};

export const getAllProducts = async (params) => {
  try {
    const response = await getAllproductApiCall(params);
    return response.data;
  } catch (err) {
    console.error("Error fetching products:", err);
    throw err;
  }
};

export const updateProducts = async ({ id, data }) => {
  try {
    const response = await updateProductByIdApiCall(id, data);
    return response.data;
  } catch (err) {
    console.error("Error updating product:", err);
    throw err;
  }
};

//  :::: Billing Service Function :::  //

export const createBills = async (data) => {
  try {
    const response = await createBillApiCall(data);
    return response.data;
  } catch (err) {
    console.error("Error at Creating Bill ---- >", err);
  }
};

export const getAllTranscationHis = async (params) => {
  try {
    const response = await transactionHistoryApiCall(params);
    return response.data;
  } catch (err) {
    console.error(
      "Error fetching transaction history:",
      err.response?.data?.message || err.message,
    );
    throw err;
  }
};

export const getTranscationSummary = async () => {
  try {
    const response = await getTransactionSummaryApiCall();
    return response.data;
  } catch (err) {
    console.error(
      "Error fetching transaction Summary:",
      err.response?.data?.message || err.message,
    );
    throw err;
  }
};

export const createNewUserService = async (data) => {
  try {
    const response = await createNewUserApiCall(data);
    return response.data;
  } catch (error) {
    console.error(
      "Error creating user:",
      error.response?.data?.message || error.message,
    );
    throw error;
  }
};

export const getAllUsersService = async (params = {}) => {
  try {
    const response = await getAllUsersApicall(params);
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching users:",
      error.response?.data?.message || error.message,
    );
    throw error;
  }
};

export const editUserService = async ({ id, data }) => {
  try {
    const response = await editUsersApicall({ id, data });
    return response.data;
  } catch (error) {
    console.error(
      "Error updating user:",
      error.response?.data?.message || error.message,
    );
    throw error;
  }
};

export const deleteUserService = async (id) => {
  try {
    const response = await deleteUsersApicall(id);
    return response.data;
  } catch (error) {
    console.error(
      "Error deleting user:",
      error.response?.data?.message || error.message,
    );
    throw error;
  }
};

// :::: Suppliers :::: //

export const createSupplierService = async (data) => {
  const response = await createSupplierApiCall(data);
  return response.data;
};

// Get all suppliers
export const getSuppliersService = async () => {
  const response = await getSuppliersApiCall();
  return response.data;
};

// Edit supplier
export const editSupplierService = async ({ id, data }) => {
  const response = await editSupplierApiCall({ id, data });
  return response.data;
};

// Delete supplier
export const deleteSupplierService = async (id) => {
  const response = await deleteSupplierApiCall(id);
  return response.data;
};

// Add returning product
export const addReturningProductService = async ({ id, data }) => {
  const response = await addReturningProductApiCall({ id, data });
  return response.data;
};

// Update returning product
export const updateReturningProductService = async ({
  id,
  productId,
  data,
}) => {
  const response = await updateReturningProductApiCall({
    id,
    productId,
    data,
  });
  return response.data;
};
