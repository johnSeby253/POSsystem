import React, { useEffect, useState } from "react";
import CustomModal from "../../common/CustomModal";

const emptyForm = {
  supplierCompanyName: "",
  supplierName: "",
  supplierPhone: "",
  companyAddress: "",
  isActive: true,
};

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100";

const AddSupplierModal = ({ open, onClose, onSubmit, supplier = null }) => {
  const [form, setForm] = useState({ ...emptyForm });
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setForm(
        supplier
          ? {
              supplierCompanyName: supplier.supplierCompanyName || "",
              supplierName: supplier.supplierName || "",
              supplierPhone: supplier.supplierPhone || "",
              companyAddress: supplier.companyAddress || "",
              isActive: supplier.isActive ?? true,
            }
          : { ...emptyForm },
      );

      setError("");
    }
  }, [open, supplier]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const supplierCompanyName = form.supplierCompanyName.trim();
    const supplierName = form.supplierName.trim();
    const supplierPhone = form.supplierPhone.trim();
    const companyAddress = form.companyAddress.trim();

    if (
      !supplierCompanyName ||
      !supplierName ||
      !supplierPhone ||
      !companyAddress
    ) {
      setError(
        "Company name, supplier name, phone number, and address are required.",
      );
      return;
    }

    if (!/^[0-9+\-\s()]{7,20}$/.test(supplierPhone)) {
      setError("Please enter a valid phone number.");
      return;
    }

    try {
      await onSubmit({
        supplierCompanyName,
        supplierName,
        supplierPhone,
        companyAddress,
        isActive: form.isActive,
      });
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to save supplier. Please try again.",
      );
    }
  };

  return (
    <CustomModal
      open={open}
      onClose={onClose}
      title={supplier ? "Edit Supplier" : "Add New Supplier"}
      description="Enter the supplier's contact information."
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Company Name *
          </label>
          <input
            type="text"
            name="supplierCompanyName"
            required
            value={form.supplierCompanyName}
            onChange={handleChange}
            placeholder="Enter company name"
            className={inputClass}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Supplier Name *
          </label>
          <input
            type="text"
            name="supplierName"
            required
            value={form.supplierName}
            onChange={handleChange}
            placeholder="Enter supplier name"
            className={inputClass}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Phone Number *
          </label>
          <input
            type="tel"
            name="supplierPhone"
            required
            value={form.supplierPhone}
            onChange={handleChange}
            placeholder="Enter phone number"
            className={inputClass}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Company Address *
          </label>
          <textarea
            name="companyAddress"
            rows={3}
            required
            value={form.companyAddress}
            onChange={handleChange}
            placeholder="Enter company address"
            className={`${inputClass} resize-none`}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Status
          </label>
          <select
            name="isActive"
            value={String(form.isActive)}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                isActive: event.target.value === "true",
              }))
            }
            className={inputClass}
          >
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>

        {error && (
          <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-700"
          >
            {supplier ? "Save Changes" : "Add Supplier"}
          </button>
        </div>
      </form>
    </CustomModal>
  );
};

export default AddSupplierModal;
