import { useMemo, useState } from "react";
import { Pencil, Plus, Search } from "lucide-react";
import DataTable from "../../common/DataTable";
import AddProductModal from "./AddProductModal";
import { useDebounce } from "use-debounce";
import { useGetAllProducts, useUpdateProduct } from "../../Apis/query";
import EditProductModal from "./EditProductModal";
import { toast } from "sonner";

const ProductsTable = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Wait until the user pauses typing before calling the API.
  const [debouncedSearch] = useDebounce(search, 300);

  const {
    data: response,
    isLoading,
    isFetching,
    isError,
    error,
  } = useGetAllProducts(page, limit, debouncedSearch);
  const updateProductMutation = useUpdateProduct();

  const products = response?.data ?? [];
  const pagination = response?.pagination;

  const handleSearch = (value) => {
    setSearch(value);
    setPage(1);
  };

  const handleLimitChange = (newLimit) => {
    setLimit(newLimit);
    setPage(1);
  };

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setIsEditModalOpen(true);
  };

  const handleEditSave = (productData) => {
    if (!selectedProduct?._id) return;

    updateProductMutation.mutate(
      {
        id: selectedProduct._id,
        data: productData,
      },
      {
        onSuccess: () => {
          setIsEditModalOpen(false);
          setSelectedProduct(null);
          toast.success("Product updated successfully");
        },
        onError: (error) => {
          const errorMessage =
            error?.response?.data?.message ||
            error?.message ||
            "Failed to update product. Please try again.";

          toast.error(errorMessage);
        },
      },
    );
  };

  const columns = [
    {
      key: "product_name",
      label: "Product",
      render: (product) => (
        <div>
          <p className="font-medium text-slate-900">{product.product_name}</p>
          <p className="mt-1 text-xs text-slate-500">ID: {product._id}</p>
        </div>
      ),
    },
    {
      key: "category_id",
      label: "Category",
    },
    {
      key: "selling_price",
      label: "Price",
      render: (product) => (
        <span className="font-medium">
          ₹{Number(product.selling_price || 0).toLocaleString("en-IN")}
        </span>
      ),
    },
    {
      key: "stock_quantity",
      label: "Stock",
      render: (product) => (
        <span
          className={
            product.stock_quantity <= 5
              ? "font-medium text-red-600"
              : "text-slate-700"
          }
        >
          {product.stock_quantity}
        </span>
      ),
    },
    {
      key: "is_active",
      label: "Status",
      render: (product) => (
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
            product.is_active
              ? "bg-emerald-50 text-emerald-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {product.is_active ? "Active" : "Inactive"}
        </span>
      ),
    },

    {
      key: "actions",
      label: "Actions",
      render: (product) => (
        <button
          type="button"
          onClick={() => handleEdit(product)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 px-3 py-1.5 text-sm font-medium text-indigo-600 transition hover:bg-indigo-50"
          aria-label={`Edit ${product.product_name}`}
        >
          <Pencil size={15} />
          Edit
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Products</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your store inventory.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
        >
          <Plus size={18} />
          Add Product
        </button>
      </div>

      {/* Search */}
      <div className="relative w-full sm:max-w-sm">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          value={search}
          onChange={(event) => handleSearch(event.target.value)}
          placeholder="Search products..."
          className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        />
      </div>

      {/* Loading indicator */}
      {isFetching && !isLoading && (
        <p className="text-sm text-slate-500">Searching products...</p>
      )}

      {/* Error */}
      {isError && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error?.message || "Failed to fetch products."}
        </p>
      )}

      {/* Products table */}
      <DataTable
        columns={columns}
        data={products}
        loading={isLoading}
        pagination={{
          page: pagination?.currentPage ?? page,
          limit: pagination?.pageSize ?? limit,
          total: pagination?.totalProducts ?? 0,
        }}
        onPageChange={setPage}
        onLimitChange={handleLimitChange}
        rowKey="_id"
        emptyMessage="No products found."
      />

      {/* Add product modal */}
      <AddProductModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
      <EditProductModal
        open={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
        onSave={handleEditSave}
      />
    </div>
  );
};

export default ProductsTable;
