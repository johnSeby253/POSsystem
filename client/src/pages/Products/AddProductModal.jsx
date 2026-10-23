import { useState } from "react";
import { Plus } from "lucide-react";
import CustomModal from "../../common/CustomModal";
import Button from "../../common/Button";
import { useAddProduct } from "../../Apis/query";
import { toast } from "sonner";

const categories = [
  { id: "CAT001", name: "Fruits & Vegetables" },
  { id: "CAT002", name: "Dairy Products & Eggs" },
  { id: "CAT003", name: "Bakery & Bread" },
  { id: "CAT004", name: "Rice, Grains & Pulses" },
  { id: "CAT005", name: "Cooking Oils & Ghee" },
  { id: "CAT006", name: "Spices & Masalas" },
  { id: "CAT007", name: "Snacks & Biscuits" },
  { id: "CAT008", name: "Chocolates & Sweets" },
  { id: "CAT009", name: "Beverages & Juices" },
  { id: "CAT010", name: "Tea & Coffee" },
  { id: "CAT011", name: "Packaged & Canned Foods" },
  { id: "CAT012", name: "Frozen Foods" },
  { id: "CAT013", name: "Meat, Fish & Seafood" },
  { id: "CAT014", name: "Personal Care" },
  { id: "CAT015", name: "Household Cleaning" },
  { id: "CAT016", name: "Home & Kitchen Supplies" },
  { id: "CAT017", name: "Baby Care" },
  { id: "CAT018", name: "Pet Supplies" },
  { id: "CAT019", name: "Stationery & Office Supplies" },
  { id: "CAT020", name: "Other" },
];

const units = [
  { value: "piece", label: "Piece" },
  { value: "kg", label: "Kilogram (kg)" },
  { value: "gram", label: "Gram (g)" },
  { value: "litre", label: "Litre (L)" },
  { value: "ml", label: "Millilitre (ml)" },
  { value: "pack", label: "Pack" },
];

const initialForm = {
  product_name: "",
  category_id: "",
  unit: "piece",
  purchase_price: "",
  selling_price: "",
  wholesale_price: "",
  stock_quantity: "0",
  expiry_date: "",
  agency_id: "",
  is_active: true,
};

const inputClass =
  "mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";

const AddProductModal = ({ open, onClose, onSubmit, agencies = [] }) => {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");

  const { mutate: addProductMutation, isPending } = useAddProduct();

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));

    setError("");
  };

  const handleClose = () => {
    setForm(initialForm);
    setError("");
    onClose?.();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const purchasePrice = Number(form.purchase_price);
    const sellingPrice = Number(form.selling_price);
    const wholesalePrice =
      form.wholesale_price === "" ? null : Number(form.wholesale_price);
    const stockQuantity = Number(form.stock_quantity);

    if (!form.product_name.trim()) {
      setError("Product name is required.");
      return;
    }

    if (!form.category_id) {
      setError("Please select a category.");
      return;
    }

    if (!form.agency_id.trim()) {
      setError("Agency is required.");
      return;
    }

    if (
      form.purchase_price === "" ||
      !Number.isFinite(purchasePrice) ||
      purchasePrice < 0
    ) {
      setError("Enter a valid purchase price.");
      return;
    }

    if (
      form.selling_price === "" ||
      !Number.isFinite(sellingPrice) ||
      sellingPrice < 0
    ) {
      setError("Enter a valid selling price.");
      return;
    }

    if (
      wholesalePrice !== null &&
      (!Number.isFinite(wholesalePrice) || wholesalePrice < 0)
    ) {
      setError("Wholesale price must be a valid non-negative number.");
      return;
    }

    if (
      form.stock_quantity === "" ||
      !Number.isFinite(stockQuantity) ||
      stockQuantity < 0
    ) {
      setError("Stock quantity must be zero or greater.");
      return;
    }

    const productData = {
      product_name: form.product_name.trim(),
      category_id: form.category_id,
      unit: form.unit,
      purchase_price: purchasePrice,
      selling_price: sellingPrice,
      wholesale_price: wholesalePrice,
      stock_quantity: stockQuantity,
      expiry_date: form.expiry_date || null,
      agency_id: form.agency_id.trim(),
      is_active: form.is_active,
    };

    try {
      await addProductMutation(productData);

      toast.success("Product added successfully!");

      setForm(initialForm);
      setError("");
      onClose?.();
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Unable to add product.";

      setError(message);
      toast.error(message);
    }
  };

  return (
    <CustomModal
      open={open}
      onClose={handleClose}
      title="Add Product"
      description="Enter the product details for your supermarket inventory."
      size="xl"
      footer={
        <>
          <Button type="submit" form="add-product-form" disabled={isPending}>
            <Plus size={16} />
            {isPending ? "Saving..." : "Save Product"}
          </Button>
        </>
      }
    >
      <form id="add-product-form" onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {/* Product name */}
        <div>
          <label
            htmlFor="product_name"
            className="text-sm font-medium text-slate-700"
          >
            Product Name *
          </label>
          <input
            id="product_name"
            name="product_name"
            value={form.product_name}
            onChange={handleChange}
            placeholder="e.g. Basmati Rice"
            className={inputClass}
            required
          />
        </div>

        {/* Category and unit */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="category_id"
              className="text-sm font-medium text-slate-700"
            >
              Category *
            </label>
            <select
              id="category_id"
              name="category_id"
              value={form.category_id}
              onChange={handleChange}
              className={inputClass}
              required
            >
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="unit"
              className="text-sm font-medium text-slate-700"
            >
              Unit *
            </label>
            <select
              id="unit"
              name="unit"
              value={form.unit}
              onChange={handleChange}
              className={inputClass}
              required
            >
              {units.map((unit) => (
                <option key={unit.value} value={unit.value}>
                  {unit.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Prices */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="purchase_price"
              className="text-sm font-medium text-slate-700"
            >
              Purchase Price (₹) *
            </label>
            <input
              id="purchase_price"
              name="purchase_price"
              type="number"
              min="0"
              step="0.01"
              value={form.purchase_price}
              onChange={handleChange}
              placeholder="0.00"
              className={inputClass}
              required
            />
          </div>

          <div>
            <label
              htmlFor="selling_price"
              className="text-sm font-medium text-slate-700"
            >
              Selling Price (₹) *
            </label>
            <input
              id="selling_price"
              name="selling_price"
              type="number"
              min="0"
              step="0.01"
              value={form.selling_price}
              onChange={handleChange}
              placeholder="0.00"
              className={inputClass}
              required
            />
          </div>
        </div>

        {/* Stock and expiry */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="stock_quantity"
              className="text-sm font-medium text-slate-700"
            >
              Stock Quantity *
            </label>
            <input
              id="stock_quantity"
              name="stock_quantity"
              type="number"
              min="0"
              step="any"
              value={form.stock_quantity}
              onChange={handleChange}
              className={inputClass}
              required
            />
          </div>

          <div>
            <label
              htmlFor="expiry_date"
              className="text-sm font-medium text-slate-700"
            >
              Expiry Date
            </label>
            <input
              id="expiry_date"
              name="expiry_date"
              type="date"
              value={form.expiry_date}
              onChange={handleChange}
              className={inputClass}
            />
          </div>
        </div>

        {/* Agency */}
        <div>
          <label
            htmlFor="agency_id"
            className="text-sm font-medium text-slate-700"
          >
            Agency *
          </label>

          {agencies.length > 0 ? (
            <select
              id="agency_id"
              name="agency_id"
              value={form.agency_id}
              onChange={handleChange}
              className={inputClass}
              required
            >
              <option value="">Select agency</option>
              {agencies.map((agency) => (
                <option
                  key={agency._id || agency.id}
                  value={agency._id || agency.id}
                >
                  {agency.agency_name || agency.name}
                </option>
              ))}
            </select>
          ) : (
            <input
              id="agency_id"
              name="agency_id"
              value={form.agency_id}
              onChange={handleChange}
              placeholder="Enter agency ID"
              className={inputClass}
              required
            />
          )}

          <p className="mt-1 text-xs text-slate-500">
            Select an agency or enter its ID.
          </p>
        </div>

        {/* Active status */}
        <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 p-3">
          <input
            type="checkbox"
            name="is_active"
            checked={form.is_active}
            onChange={handleChange}
            className="h-4 w-4 rounded border-slate-300 accent-indigo-600"
          />

          <span>
            <span className="block text-sm font-medium text-slate-800">
              Active Product
            </span>
            <span className="block text-xs text-slate-500">
              Make this product available for billing.
            </span>
          </span>
        </label>
      </form>
    </CustomModal>
  );
};

export default AddProductModal;
