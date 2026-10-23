import { useEffect, useState } from "react";
import { Save } from "lucide-react";

import CustomModal from "../../common/CustomModal";
import Button from "../../common/Button";

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

const formatDateForInput = (value) => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const EditProductModal = ({
  open,
  onClose,
  product,
  agencies = [],
  onSave,
}) => {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  

  useEffect(() => {
    if (!open || !product) return;

    setForm({
      product_name: product.product_name ?? "",
      category_id: product.category_id ?? "",
      unit: product.unit ?? "piece",
      purchase_price: String(product.purchase_price ?? ""),
      selling_price: String(product.selling_price ?? ""),
      wholesale_price:
        product.wholesale_price == null
          ? ""
          : String(product.wholesale_price),
      stock_quantity: String(product.stock_quantity ?? 0),
      expiry_date: formatDateForInput(product.expiry_date),
      agency_id: product.agency_id ?? "",
      is_active: product.is_active ?? true,
    });

    setError("");
  }, [open, product]);

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

  const handleSubmit = (event) => {
    event.preventDefault();
    setError("");

    const purchasePrice = Number(form.purchase_price);
    const sellingPrice = Number(form.selling_price);
    const stockQuantity = Number(form.stock_quantity);
    const wholesalePrice =
      form.wholesale_price === ""
        ? null
        : Number(form.wholesale_price);

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
      setError("Enter a valid wholesale price.");
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

    // Pass the edited data to the parent component.
    onSave?.(productData);
  };

  return (
    <CustomModal
      open={open}
      onClose={handleClose}
      title="Edit Product"
      description="Update the product details in your inventory."
      size="xl"
      footer={
        <Button
          type="submit"
          form="edit-product-form"
        >
          <Save size={16} />
          Update Product
        </Button>
      }
    >
      <form
        id="edit-product-form"
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        {error && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {/* Product Name */}
        <div>
          <label
            htmlFor="edit_product_name"
            className="text-sm font-medium text-slate-700"
          >
            Product Name *
          </label>

          <input
            id="edit_product_name"
            name="product_name"
            value={form.product_name}
            onChange={handleChange}
            className={inputClass}
            placeholder="Enter product name"
            required
          />
        </div>

        {/* Category and Unit */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="edit_category_id"
              className="text-sm font-medium text-slate-700"
            >
              Category *
            </label>

            <select
              id="edit_category_id"
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
              htmlFor="edit_unit"
              className="text-sm font-medium text-slate-700"
            >
              Unit *
            </label>

            <select
              id="edit_unit"
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

        {/* Purchase and Selling Price */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="edit_purchase_price"
              className="text-sm font-medium text-slate-700"
            >
              Purchase Price (₹) *
            </label>

            <input
              id="edit_purchase_price"
              name="purchase_price"
              type="number"
              min="0"
              step="0.01"
              value={form.purchase_price}
              onChange={handleChange}
              className={inputClass}
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <label
              htmlFor="edit_selling_price"
              className="text-sm font-medium text-slate-700"
            >
              Selling Price (₹) *
            </label>

            <input
              id="edit_selling_price"
              name="selling_price"
              type="number"
              min="0"
              step="0.01"
              value={form.selling_price}
              onChange={handleChange}
              className={inputClass}
              placeholder="0.00"
              required
            />
          </div>
        </div>

        {/* Wholesale Price and Stock */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="edit_wholesale_price"
              className="text-sm font-medium text-slate-700"
            >
              Wholesale Price (₹)
            </label>

            <input
              id="edit_wholesale_price"
              name="wholesale_price"
              type="number"
              min="0"
              step="0.01"
              value={form.wholesale_price}
              onChange={handleChange}
              className={inputClass}
              placeholder="Optional"
            />
          </div>

          <div>
            <label
              htmlFor="edit_stock_quantity"
              className="text-sm font-medium text-slate-700"
            >
              Stock Quantity *
            </label>

            <input
              id="edit_stock_quantity"
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
        </div>

        {/* Expiry Date */}
        <div>
          <label
            htmlFor="edit_expiry_date"
            className="text-sm font-medium text-slate-700"
          >
            Expiry Date
          </label>

          <input
            id="edit_expiry_date"
            name="expiry_date"
            type="date"
            value={form.expiry_date}
            onChange={handleChange}
            className={inputClass}
          />
        </div>

        {/* Agency */}
        <div>
          <label
            htmlFor="edit_agency_id"
            className="text-sm font-medium text-slate-700"
          >
            Agency *
          </label>

          {agencies.length > 0 ? (
            <select
              id="edit_agency_id"
              name="agency_id"
              value={form.agency_id}
              onChange={handleChange}
              className={inputClass}
              required
            >
              <option value="">Select agency</option>

              {agencies.map((agency) => {
                const agencyId = agency._id || agency.id;

                return (
                  <option key={agencyId} value={agencyId}>
                    {agency.agency_name || agency.name}
                  </option>
                );
              })}
            </select>
          ) : (
            <input
              id="edit_agency_id"
              name="agency_id"
              value={form.agency_id}
              onChange={handleChange}
              className={inputClass}
              placeholder="Enter agency ID"
              required
            />
          )}
        </div>

        {/* Active Status */}
        <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 p-3 transition hover:bg-slate-50">
          <input
            type="checkbox"
            name="is_active"
            checked={form.is_active}
            onChange={handleChange}
            className="h-4 w-4 accent-indigo-600"
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

export default EditProductModal;