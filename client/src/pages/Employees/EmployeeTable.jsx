import { useMemo, useState } from "react";
import { Plus, Search, Pencil, Trash2, Users } from "lucide-react";

import DataTable from "../../common/DataTable";
import AddEmployeeModal from "./AddEmployeeModal";
import EditEmployeeModal from "./EditEmployeeModal";
import DeleteConfirmModal from "../../common/DeleteConfirmModal";
import Button from "../../common/Button";
import {
  useCreateNewUser,
  useDeleteUser,
  useEditUser,
  useGetAllUsers,
} from "../../Apis/query";

const EmployeeTable = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const createUserMutation = useCreateNewUser();
  const editUserMutation = useEditUser();
  const deleteUserMutation = useDeleteUser();

  // Fetch users from the backend.
  const { data: usersResponse, isLoading, isError, error } = useGetAllUsers();

  // Supports common response shapes:
  // [users], { users: [...] }, { data: [...] }, { data: { users: [...] } }
  const users = useMemo(() => {
    const response = usersResponse?.data ?? usersResponse;

    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.users)) return response.users;
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response?.data?.users)) return response.data.users;

    return [];
  }, [usersResponse]);

  // Map API fields to the fields used by the existing table.
  const employees = useMemo(
    () =>
      users.map((user) => ({
        ...user,
        _id: user._id ?? user.id,
        employee_name:
          user.username ?? user.name ?? user.employee_name ?? "Unnamed User",
        employee_code:
          user.employee_code ?? user.employeeCode ?? user._id ?? user.id ?? "—",
        email: user.email ?? "—",
        phone: user.phone ?? user.phone_number ?? user.phoneNumber ?? "—",
        role: user.role ?? "—",
        salary: user.salary ?? null,
        status: user.status ?? null,
      })),
    [users],
  );

  // Client-side search across the fetched user list.
  const filteredEmployees = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return employees;

    return employees.filter((employee) =>
      [
        employee.employee_name,
        employee.employee_code,
        employee.email,
        employee.phone,
        employee.role,
        employee.status,
      ].some((value) =>
        String(value ?? "")
          .toLowerCase()
          .includes(query),
      ),
    );
  }, [employees, search]);

  // Client-side pagination.
  const paginatedEmployees = useMemo(() => {
    const startIndex = (page - 1) * limit;
    return filteredEmployees.slice(startIndex, startIndex + limit);
  }, [filteredEmployees, page, limit]);

  const columns = [
    {
      label: "User",
      key: "employee_name",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700">
            {row.employee_name
              .split(" ")
              .map((part) => part[0])
              .slice(0, 2)
              .join("")
              .toUpperCase()}
          </div>

          <div className="min-w-0">
            <p className="truncate font-medium text-slate-800">
              {row.employee_name}
            </p>
            <p className="text-xs text-slate-500">ID: {row.employee_code}</p>
          </div>
        </div>
      ),
    },
    {
      label: "Contact",
      key: "email",
      render: (row) => (
        <div>
          <p className="text-sm text-slate-700">{row.email}</p>
          <p className="mt-1 text-xs text-slate-500">{row.phone}</p>
        </div>
      ),
    },
    {
      label: "Role",
      key: "role",
      render: (row) => (
        <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
          {row.role}
        </span>
      ),
    },
    {
      label: "Salary",
      key: "salary",
      render: (row) => (
        <span className="font-medium text-slate-800">
          {row.salary == null
            ? "—"
            : Number(row.salary).toLocaleString("en-IN", {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 0,
              })}
        </span>
      ),
    },
    // {
    //   label: "Status",
    //   key: "status",
    //   render: (row) => {
    //     const isActive = String(row.status ?? "").toLowerCase() === "active";

    //     return row.status ? (
    //       <span
    //         className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
    //           isActive
    //             ? "bg-emerald-50 text-emerald-700"
    //             : "bg-red-50 text-red-600"
    //         }`}
    //       >
    //         {row.status}
    //       </span>
    //     ) : (
    //       <span className="text-slate-400">—</span>
    //     );
    //   },
    // },
    {
      label: "Actions",
      key: "_id",
      render: (row) => (
        <div className="flex items-center gap-1">
          <button
            type="button"
            title="Edit user"
            onClick={() => {
              setSelectedEmployee(row);
              setIsEditModalOpen(true);
            }}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-indigo-50 hover:text-indigo-600"
          >
            <Pencil size={16} />
          </button>

          <button
            type="button"
            title="Delete user"
            onClick={() => {
              setSelectedEmployee(row);
              setIsDeleteModalOpen(true);
            }}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  const handleAddEmployee = async (employeeData) => {
    await createUserMutation.mutateAsync({
      username: employeeData.employee_name,
      email: employeeData.email,
      phone: employeeData.phone,
      role: employeeData.role,
      ...(employeeData.salary !== "" &&
        employeeData.salary != null && {
          salary: Number(employeeData.salary),
        }),
      ...(employeeData.status && { status: employeeData.status }),
    });

    setIsAddModalOpen(false);
    setSearch("");
    setPage(1);
  };

  const activeCount = employees.filter(
    (employee) => String(employee.status ?? "").toLowerCase() === "active",
  ).length;

  const inactiveCount = employees.filter(
    (employee) => String(employee.status ?? "").toLowerCase() === "inactive",
  ).length;

  return (
    <div className="space-y-6">
      {/* Heading */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Employees
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            View and manage registered employees.
          </p>
        </div>

        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus size={18} />
          Add Employees
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">
              Total Employees
            </p>
            <Users size={20} className="text-indigo-600" />
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900">
            {isLoading ? "…" : employees.length}
          </p>
        </div>

        {/* <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-medium text-slate-500">Active Employees</p>
          <p className="mt-3 text-2xl font-bold text-emerald-600">
            {isLoading ? "…" : activeCount}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-medium text-slate-500">
            Inactive Employees
          </p>
          <p className="mt-3 text-2xl font-bold text-red-600">
            {isLoading ? "…" : inactiveCount}
          </p>
        </div> */}
      </div>

      {/* User table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-slate-900">All Employees</h2>
            <p className="mt-1 text-xs text-slate-500">
              {filteredEmployees.length} user(s) found
            </p>
          </div>

          <div className="relative w-full sm:max-w-xs">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search by name, email, phone..."
              className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>
        </div>

        {isError ? (
          <div className="p-6 text-sm text-red-600">
            {error?.response?.data?.message ||
              error?.message ||
              "Failed to fetch Employees."}
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={paginatedEmployees}
            loading={isLoading}
            pagination={{
              page,
              limit,
              total: filteredEmployees.length,
            }}
            onPageChange={setPage}
            onLimitChange={(newLimit) => {
              setLimit(newLimit);
              setPage(1);
            }}
            rowKey="_id"
            pageSizeOptions={[5, 10, 20, 50]}
            emptyMessage={
              search ? "No matching Employees found." : "No Employees found."
            }
          />
        )}
      </div>

      {/* Add user */}
      <AddEmployeeModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddEmployee}
      />

      {/* Edit user: connect this to your edit mutation before saving */}
      <EditEmployeeModal
        open={isEditModalOpen}
        employee={selectedEmployee}
        isSubmitting={editUserMutation.isPending}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedEmployee(null);
        }}
        onSubmit={async (updatedEmployee) => {
          await editUserMutation.mutateAsync({
            id: selectedEmployee._id,
            data: {
              username: updatedEmployee.employee_name,
              email: updatedEmployee.email,
              phone: updatedEmployee.phone,
              role: updatedEmployee.role,
              ...(updatedEmployee.salary != null && {
                salary: Number(updatedEmployee.salary),
              }),
              status: updatedEmployee.status,
            },
          });

          setIsEditModalOpen(false);
          setSelectedEmployee(null);
        }}
      />

      {/* Delete user: connect this to your delete mutation before confirming */}
      <DeleteConfirmModal
        open={isDeleteModalOpen}
        size="md"
        onClose={() => {
          if (deleteUserMutation.isPending) return;

          setIsDeleteModalOpen(false);
          setSelectedEmployee(null);
        }}
        title="Delete Employee?"
        message="Are you sure you want to delete this employee? This action cannot be undone."
        itemName={selectedEmployee?.employee_name}
        confirmText="Delete Employee"
        loading={deleteUserMutation.isPending}
        onConfirm={async () => {
          if (!selectedEmployee?._id) {
            throw new Error("Employee ID is missing.");
          }

          await deleteUserMutation.mutateAsync(selectedEmployee._id);

          setIsDeleteModalOpen(false);
          setSelectedEmployee(null);
        }}
      />
    </div>
  );
};

export default EmployeeTable;
