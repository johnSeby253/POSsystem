import React, { useEffect, useState } from "react";
import { Package, RotateCcw, Plus, Search, X, Minus } from "lucide-react";
import CustomModal from "../../common/CustomModal";
import { useGetAllProducts } from "../../Apis/query";

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100";

const ReturnProductsModal = ({
  open,
  onClose,
  supplier,
  onSearchProduct,
  onAddReturnProduct,
  isSearching = false,
  isAdding = false,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [productId, setProductId] = useState("");
  const [foundProduct, setFoundProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const {
    data: response,
    isLoading,
    isFetching,
    isError,
  } = useGetAllProducts();

  // API response:
  // { success: true, data: [...products], pagination: {...} }
  const products = Array.isArray(response?.data) ? response.data : [];

  const returnItems = Array.isArray(supplier?.returningProductDetails)
    ? supplier.returningProductDetails
    : [];

  const totalQuantity = returnItems.reduce(
    (total, item) => total + Number(item.quantity || 0),
    0,
  );

  useEffect(() => {
    if (open) {
      setShowAddForm(false);
      setProductId("");
      setFoundProduct(null);
      setQuantity(1);
      setReason("");
      setError("");
    }
  }, [open, supplier?._id]);

  const handleSearchProduct = (event) => {
    event.preventDefault();
    setError("");
    setFoundProduct(null);
    setQuantity(1);

    const searchId = productId.trim().toLowerCase();

    if (!searchId) {
      setError("Please enter a product ID or product code.");
      return;
    }

    if (isLoading || isFetching) {
      setError("Products are still loading. Please try again.");
      return;
    }

    if (isError) {
      setError("Failed to load products. Please try again.");
      return;
    }

    // Match either MongoDB _id or custom product_Id.
    const product = products.find(
      (item) =>
        item._id?.toLowerCase() === searchId ||
        item.product_Id?.toLowerCase() === searchId,
    );

    if (!product) {
      setError("No product found with that ID or code.");
      return;
    }

    setFoundProduct(product);
  };

  const handleDecrease = () => {
    setQuantity((current) => Math.max(1, current - 1));
  };

  const handleIncrease = () => {
    setQuantity((current) => current + 1);
  };

  const handleAddReturn = async (event) => {
    event.preventDefault();
    setError("");

    if (!foundProduct) {
      setError("Search for a product first.");
      return;
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      setError("Return quantity must be a positive whole number.");
      return;
    }

    if (typeof onAddReturnProduct !== "function") {
      setError("Add-return API has not been connected yet.");
      return;
    }

    try {
      await onAddReturnProduct({
        supplierId: supplier?._id ?? supplier?.id,

        // Actual product model fields
        productId: foundProduct._id,
        productCode: foundProduct.product_Id,
        productName: foundProduct.product_name,

        quantity,
        reason: reason.trim(),
      });

      setShowAddForm(false);
      setProductId("");
      setFoundProduct(null);
      setQuantity(1);
      setReason("");
      setError("");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to add the return item.",
      );
    }
  };

  return (
    <CustomModal
      open={open}
      onClose={onClose}
      title="Products to Return"
      description={
        supplier
          ? supplier.supplierCompanyName || supplier.supplierName || "Supplier"
          : "Supplier return details"
      }
      size="lg"
    >
      {supplier && (
        <div className="space-y-4">
          {/* Summary */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-sm text-slate-500">Product Types</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {returnItems.length}
              </p>
            </div>

            <div className="rounded-xl border border-rose-100 bg-rose-50 p-4">
              <p className="text-sm text-rose-700">Total Return Units</p>
              <p className="mt-2 text-2xl font-bold text-rose-700">
                {totalQuantity}
              </p>
            </div>
          </div>

          {!showAddForm ? (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(true);
                  setError("");
                }}
                className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-700"
              >
                <Plus size={17} />
                Add New Return
              </button>
            </div>
          ) : (
            <div className="space-y-4 rounded-xl border border-orange-200 bg-orange-50/40 p-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-semibold text-slate-800">
                  Add Product Return
                </h3>

                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setFoundProduct(null);
                    setProductId("");
                    setQuantity(1);
                    setReason("");
                    setError("");
                  }}
                  className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
                  aria-label="Close add return form"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Product search */}
              <form
                onSubmit={handleSearchProduct}
                className="flex flex-col gap-2 sm:flex-row"
              >
                <input
                  type="text"
                  value={productId}
                  onChange={(event) => {
                    setProductId(event.target.value);
                    setFoundProduct(null);
                    setError("");
                  }}
                  placeholder="Enter product ID or product code"
                  className={`${inputClass} flex-1`}
                />

                <button
                  type="submit"
                  disabled={isLoading || isFetching || isSearching}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-900 disabled:opacity-50"
                >
                  <Search size={16} />
                  {isLoading || isFetching || isSearching
                    ? "Searching..."
                    : "Search"}
                </button>
              </form>

              {/* Product found */}
              {foundProduct && (
                <form onSubmit={handleAddReturn} className="space-y-4">
                  <div className="rounded-lg border border-emerald-200 bg-white p-4">
                    <div className="flex items-start gap-3">
                      <div className="rounded-lg bg-emerald-50 p-2 text-emerald-700">
                        <Package size={21} />
                      </div>

                      <div className="min-w-0 flex-1">
                        {/* Product name */}
                        <p className="font-semibold text-slate-800">
                          {foundProduct.product_name}
                        </p>

                        {/* Custom product ID under the name */}
                        <p className="mt-1 break-all text-xs text-slate-500">
                          Product ID: {foundProduct.product_Id}
                        </p>

                        {/* MongoDB ID */}
                        <p className="mt-1 break-all text-xs text-slate-500">
                          Database ID: {foundProduct._id}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          Unit: {foundProduct.unit || "—"}
                        </p>
                      </div>

                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                        Found
                      </span>
                    </div>
                  </div>

                  {/* Quantity counter and reason */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">
                        Return Quantity *
                      </label>

                      <div className="flex w-fit items-center overflow-hidden rounded-lg border border-slate-200 bg-white">
                        <button
                          type="button"
                          onClick={handleDecrease}
                          disabled={quantity <= 1 || isAdding}
                          className="p-3 text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={16} />
                        </button>

                        <span className="min-w-14 border-x border-slate-200 px-4 py-2.5 text-center font-semibold text-slate-800">
                          {quantity}
                        </span>

                        <button
                          type="button"
                          onClick={handleIncrease}
                          disabled={isAdding}
                          className="p-3 text-slate-600 hover:bg-slate-100 disabled:opacity-40"
                          aria-label="Increase quantity"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="flex lg:py-3 justify-end">
                      <button
                        type="submit"
                        disabled={isAdding}
                        className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Plus size={16} />
                        {isAdding ? "Adding..." : "Add to Return List"}
                      </button>
                    </div>
                  </div>

                  {/* Add to return */}
                </form>
              )}

              {error && (
                <p
                  role="alert"
                  className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700"
                >
                  {error}
                </p>
              )}
            </div>
          )}

          {/* Existing return items */}
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Product ID</th>
                  <th className="px-4 py-3 font-semibold">Product Name</th>
                  <th className="px-4 py-3 font-semibold">Reason</th>
                  <th className="px-4 py-3 text-right font-semibold">
                    Return Qty
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {returnItems.length > 0 ? (
                  returnItems.map((item, index) => (
                    <tr key={item._id ?? item.id ?? index}>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                        {item.productCode || item.productId || "—"}
                      </td>

                      <td className="px-4 py-3 font-medium text-slate-800">
                        {item.productName || "—"}
                      </td>

                      <td className="px-4 py-3 text-slate-600">
                        {item.reason || "—"}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <span className="inline-flex min-w-10 justify-center rounded-lg bg-rose-50 px-3 py-1.5 font-semibold text-rose-700">
                          {item.quantity ?? 0}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-4 py-10 text-center">
                      <Package
                        size={28}
                        className="mx-auto mb-2 text-slate-300"
                      />
                      <p className="font-medium text-slate-700">
                        No products to return
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Use Add New Return to search for a product.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>

              {returnItems.length > 0 && (
                <tfoot className="border-t border-slate-200 bg-slate-50">
                  <tr>
                    <td
                      colSpan={3}
                      className="px-4 py-3 font-semibold text-slate-700"
                    >
                      Total Return Quantity
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-rose-700">
                      {totalQuantity}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>

          <div className="flex justify-end border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </CustomModal>
  );
};

export default ReturnProductsModal;
