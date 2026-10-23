
import React, { useMemo, useState } from "react";
import {
  Plus,
  Search,
  RotateCcw,
  Pencil,
  Trash2,
  Users,
  Package,
} from "lucide-react";

import DataTable from "../../common/DataTable";
import AddSupplierModal from "../../pages/Suppliers/AddSupplierModal";
import ReturnProductsModal from "../../pages/Suppliers/ReturnProductsModal";
import DeleteConfirmModal from "../../common/DeleteConfirmModal";

import {
  useGetSuppliers,
  useCreateSupplier,
  useDeleteSupplier,
  useEditSupplier,
} from "../../Apis/query";

const Suppliers = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [returnSupplier, setReturnSupplier] = useState(null);
  const [deleteSupplier, setDeleteSupplier] = useState(null);

  const {
    data: suppliersResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetSuppliers();

  const createSupplierMutation = useCreateSupplier();
  const updateSupplierMutation = useEditSupplier();
  const deleteSupplierMutation = useDeleteSupplier();

  const isSaving =
    createSupplierMutation.isPending ||
    updateSupplierMutation.isPending;

  // Backend response: { success, suppliers, pagination }
  const suppliers = useMemo(() => {
    const list = Array.isArray(suppliersResponse?.suppliers)
      ? suppliersResponse.suppliers
      : [];

    return list.map((supplier) => ({
      ...supplier,
      id: supplier._id ?? supplier.id,
      returningProductDetails: Array.isArray(
        supplier.returningProductDetails
      )
        ? supplier.returningProductDetails
        : [],
    }));
  }, [suppliersResponse]);

  const filteredSuppliers = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return suppliers.filter((supplier) => {
      const matchesSearch = [
        supplier.supplierCompanyName,
        supplier.supplierName,
        supplier.supplierPhone,
        supplier.companyAddress,
      ].some((value) =>
        String(value ?? "").toLowerCase().includes(searchValue)
      );

      const matchesStatus =
        statusFilter === "All" ||
        (statusFilter === "Active" && supplier.isActive === true) ||
        (statusFilter === "Inactive" && supplier.isActive === false);

      return matchesSearch && matchesStatus;
    });
  }, [suppliers, search, statusFilter]);

  const totalReturnItems = suppliers.reduce(
    (total, supplier) =>
      total +
      supplier.returningProductDetails.reduce(
        (sum, item) => sum + Number(item.quantity ?? 0),
        0
      ),
    0
  );

  const openAddModal = () => {
    setSelectedSupplier(null);
    setIsAddModalOpen(true);
  };

  const openEditModal = (supplier) => {
    setSelectedSupplier(supplier);
    setIsAddModalOpen(true);
  };

  // Create or update supplier
  const handleSaveSupplier = async (formData) => {
    const payload = {
      supplierCompanyName: formData.supplierCompanyName?.trim(),
      supplierName: formData.supplierName?.trim(),
      supplierPhone: String(formData.supplierPhone ?? "").trim(),
      companyAddress: formData.companyAddress?.trim(),
      isActive: formData.isActive ?? true,
    };

    try {
      if (selectedSupplier) {
        await updateSupplierMutation.mutateAsync({
          id: selectedSupplier.id,
          data: payload,
        });
      } else {
        await createSupplierMutation.mutateAsync(payload);
      }

      setIsAddModalOpen(false);
      setSelectedSupplier(null);
    } catch (err) {
      // The React Query mutation should display the error toast.
      console.error("Failed to save supplier:", err);
    }
  };

  // Delete supplier
  const handleDeleteSupplier = async () => {
    if (!deleteSupplier?.id) return;

    try {
      await deleteSupplierMutation.mutateAsync(deleteSupplier.id);
      setDeleteSupplier(null);
    } catch (err) {
      // Keep the modal open if deletion fails so the user can retry.
      console.error("Failed to delete supplier:", err);
    }
  };

  const columns = [
    {
      key: "supplierCompanyName",
      label: "Supplier Company",
      render: (supplier) => (
        <p className="font-semibold text-slate-800">
          {supplier.supplierCompanyName || "—"}
        </p>
      ),
    },
    {
      key: "supplierName",
      label: "Contact Details",
      render: (supplier) => (
        <div>
          <p className="text-sm text-slate-700">
            {supplier.supplierName || "—"}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {supplier.supplierPhone || "—"}
          </p>
        </div>
      ),
    },
    {
      key: "companyAddress",
      label: "Company Address",
      render: (supplier) => (
        <span className="text-sm text-slate-600">
          {supplier.companyAddress || "—"}
        </span>
      ),
    },
    {
      key: "returningProductDetails",
      label: "Products to Return",
      render: (supplier) => {
        const quantity = supplier.returningProductDetails.reduce(
          (total, item) => total + Number(item.quantity ?? 0),
          0
        );

        return (
          <button
            type="button"
            onClick={() => setReturnSupplier(supplier)}
            className="inline-flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
          >
            <RotateCcw size={14} />
            {quantity} units
          </button>
        );
      },
    },
    {
      key: "isActive",
      label: "Status",
      render: (supplier) => (
        <span
          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
            supplier.isActive
              ? "bg-emerald-50 text-emerald-700"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          {supplier.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (supplier) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            title="Edit supplier"
            onClick={() => openEditModal(supplier)}
            disabled={isSaving || deleteSupplierMutation.isPending}
            className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Pencil size={15} />
          </button>

          <button
            type="button"
            title="Delete supplier"
            onClick={() => setDeleteSupplier(supplier)}
            disabled={isSaving || deleteSupplierMutation.isPending}
            className="rounded-lg border border-rose-100 p-2 text-rose-600 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Trash2 size={15} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Suppliers
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage supplier information and product returns.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          disabled={isSaving}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-700 disabled:opacity-50"
        >
          <Plus size={18} />
          Add Supplier
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5">
          <div className="rounded-xl bg-orange-50 p-3 text-orange-600">
            <Users size={22} />
          </div>
          <div>
            <p className="text-sm text-slate-500">Total Suppliers</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">
              {suppliersResponse?.pagination?.totalSuppliers ??
                suppliers.length}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5">
          <div className="rounded-xl bg-rose-50 p-3 text-rose-600">
            <Package size={22} />
          </div>
          <div>
            <p className="text-sm text-slate-500">Units to Return</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">
              {totalReturnItems}
            </p>
          </div>
        </div>
      </div>

      {/* Supplier table */}
      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-slate-900">
              Supplier List
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              View and manage your registered suppliers.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search suppliers..."
                className="w-full rounded-lg border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-orange-400 sm:w-64"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-orange-400"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="p-10 text-center text-sm text-slate-500">
            Loading suppliers...
          </div>
        ) : isError ? (
          <div className="p-10 text-center">
            <p className="text-sm text-red-600">
              {error?.response?.data?.message ||
                error?.message ||
                "Failed to load suppliers."}
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-3 rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700"
            >
              Try Again
            </button>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={filteredSuppliers}
            rowKey="id"
            emptyMessage="No suppliers found."
          />
        )}
      </div>

      {/* Add/Edit modal */}
      <AddSupplierModal
        open={isAddModalOpen}
        onClose={() => {
          if (isSaving) return;

          setIsAddModalOpen(false);
          setSelectedSupplier(null);
        }}
        onSubmit={handleSaveSupplier}
        supplier={selectedSupplier}
      />

      {/* Returning products modal */}
      <ReturnProductsModal
        open={Boolean(returnSupplier)}
        onClose={() => setReturnSupplier(null)}
        supplier={returnSupplier}
      />

      {/* Delete confirmation */}
      <DeleteConfirmModal
        open={Boolean(deleteSupplier)}
        onClose={() => {
          if (deleteSupplierMutation.isPending) return;
          setDeleteSupplier(null);
        }}
        onConfirm={handleDeleteSupplier}
        title="Delete Supplier"
        message="Are you sure you want to delete this supplier? This action cannot be undone."
        itemName={deleteSupplier?.supplierCompanyName}
        isLoading={deleteSupplierMutation.isPending}
      />
    </div>
  );
};

export default Suppliers;
