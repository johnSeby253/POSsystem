import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addProduct,
  addReturningProductService,
  createBills,
  createNewUserService,
  createSupplierService,
  deleteSupplierService,
  deleteUserService,
  editSupplierService,
  editUserService,
  getAllProducts,
  getAllTranscationHis,
  getAllUsersService,
  getSuppliersService,
  getTranscationSummary,
  updateProducts,
  updateReturningProductService,
  userLogin,
} from "./url";
import { toast } from "sonner";
import { getDashboardApiCall } from ".";

export const useLoginUser = () => {
  return useMutation({
    mutationFn: userLogin,

    onSuccess: (data) => {
      console.log("Login successful:", data);
    },

    onError: (error) => {
      console.error(
        "Login failed:",
        error.response?.data?.message || error.message,
      );
    },
  });
};

// :::: Product useQuerys :::: //

export const useAddProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addProduct,

    onSuccess: (data) => {
      console.log("Product added successfully:", data);

      // Refresh the products list
      queryClient.invalidateQueries({
        queryKey: ["products"],
      });
    },

    onError: (error) => {
      console.error("Error adding product:", error);
    },
  });
};

export const useGetAllProducts = (page, limit, search) => {
  return useQuery({
    queryKey: ["products", page, limit, search],

    queryFn: () =>
      getAllProducts({
        page,
        limit,
        search,
      }),

    placeholderData: (previousData) => previousData,
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProducts,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["products"],
      });
    },

    onError: (error) => {
      console.error(
        "Failed to update product:",
        error.response?.data?.message || error.message,
      );
    },
  });
};

export const useCreateBill = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBills,

    onSuccess: async (data) => {
      // Refresh products after bill creation
      await queryClient.invalidateQueries({
        queryKey: ["products"],
        exact: false,
      });

      // Refresh bills list
      await queryClient.invalidateQueries({
        queryKey: ["bills"],
        exact: false,
      });
    },

    onError: (error) => {
      console.error(
        "Error creating bill:",
        error.response?.data?.message || error.message,
      );
    },
  });
};

export const useGetTransactionHistory = ({
  fromDate = "",
  toDate = "",
  payment_method = "",
  search = "",
  page = 1,
  limit = 10,
} = {}) => {
  return useQuery({
    queryKey: [
      "transaction-histories",
      { fromDate, toDate, payment_method, search, page, limit },
    ],
    queryFn: () =>
      getAllTranscationHis({
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
        payment_method: payment_method || undefined,
        search: search.trim() || undefined,
        page,
        limit,
      }),
    placeholderData: (previousData) => previousData,
  });
};

export const useGetTransactionSummary = () => {
  return useQuery({
    queryKey: ["transaction-summary"],
    queryFn: getTranscationSummary,
  });
};

// ::: Users :::: //

export const useGetAllUsers = (params = {}) => {
  return useQuery({
    queryKey: ["users", params],
    queryFn: () => getAllUsersService(params),
  });
};

// CREATE user
export const useCreateNewUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createNewUserService,

    onSuccess: (data) => {
      toast.success(data?.message || "User created successfully!");

      queryClient.invalidateQueries({ queryKey: ["users"] });
    },

    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to create user.");
    },
  });
};

export const useEditUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: editUserService,

    onSuccess: (data) => {
      toast.success(data?.message || "User updated successfully!");

      queryClient.invalidateQueries({
        queryKey: ["users"],
      });
    },

    onError: (error) => {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to update user.",
      );
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteUserService,

    onSuccess: (data) => {
      toast.success(data?.message || "User deleted successfully!");

      queryClient.invalidateQueries({
        queryKey: ["users"],
      });
    },

    onError: (error) => {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to delete user.",
      );
    },
  });
};



// ::: Supplier ::::: //

export const supplierKeys = {
  all: ["suppliers"],
};

// Get all suppliers
export const useGetSuppliers = () => {
  return useQuery({
    queryKey: supplierKeys.all,
    queryFn: getSuppliersService,
  });
};

// Create supplier
export const useCreateSupplier = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSupplierService,

    onSuccess: (data) => {
      toast.success(data?.message || "Supplier created successfully!");
      queryClient.invalidateQueries({
        queryKey: supplierKeys.all,
      });
    },

    onError: (error) => {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to create supplier."
      );
    },
  });
};

// Edit supplier
export const useEditSupplier = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: editSupplierService,

    onSuccess: (data) => {
      toast.success(data?.message || "Supplier updated successfully!");
      queryClient.invalidateQueries({
        queryKey: supplierKeys.all,
      });
    },

    onError: (error) => {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to update supplier."
      );
    },
  });
};

// Delete supplier
export const useDeleteSupplier = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSupplierService,

    onSuccess: (data) => {
      toast.success(data?.message || "Supplier deleted successfully!");
      queryClient.invalidateQueries({
        queryKey: supplierKeys.all,
      });
    },

    onError: (error) => {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to delete supplier."
      );
    },
  });
};

// Add returning product
export const useAddReturningProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addReturningProductService,

    onSuccess: (data) => {
      toast.success(
        data?.message || "Returning product added successfully!"
      );

      queryClient.invalidateQueries({
        queryKey: supplierKeys.all,
      });
    },

    onError: (error) => {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to add returning product."
      );
    },
  });
};

// Update returning product
export const useUpdateReturningProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateReturningProductService,

    onSuccess: (data) => {
      toast.success(
        data?.message || "Returning product updated successfully!"
      );

      queryClient.invalidateQueries({
        queryKey: supplierKeys.all,
      });
    },

    onError: (error) => {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to update returning product."
      );
    },
  });
};


export const useDashboardQuery = () => {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const response = await getDashboardApiCall();
      return response.data;
    },
    staleTime: 60 * 1000,
    refetchOnWindowFocus: true,
  });
};