import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import CustomModal from "../../common/CustomModal";
import Button from "../../common/Button";

const initialForm = {
  employee_name: "",
  email: "",
  phone: "",
  role: "staff",
  salary: "",
  status: "Active",
};

const inputClass =
  "mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";

const EditEmployeeModal = ({
  open,
  onClose,
  onSubmit,
  employee,
  isSubmitting = false,
}) => {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open && employee) {
      setForm({
        employee_name:
          employee.employee_name ?? employee.username ?? employee.name ?? "",
        email: employee.email ?? "",
        phone:
          employee.phone ?? employee.phone_number ?? employee.phoneNumber ?? "",
        role: employee.role ?? "staff",
        salary: employee.salary ?? "",
        status: employee.status ?? "Active",
      });

      setError("");
    }
  }, [open, employee]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  };

  const handleClose = () => {
    if (isSubmitting) return;

    setError("");
    onClose?.();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const name = form.employee_name.trim();
    const email = form.email.trim();
    const phone = form.phone.trim();
    const salary = Number(form.salary);

    if (!name) {
      setError("Employee name is required.");
      return;
    }

    if (!email) {
      setError("Email address is required.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email address.");
      return;
    }

    if (!/^\d{10}$/.test(phone)) {
      setError("Enter a valid 10-digit phone number.");
      return;
    }

    if (
      form.salary !== "" &&
      (!Number.isFinite(salary) || salary < 0)
    ) {
      setError("Enter a valid salary.");
      return;
    }

    try {
      await onSubmit?.({
        ...employee,
        employee_name: name,
        email,
        phone,
        role: form.role,
        ...(form.salary !== "" ? { salary } : {}),
        status: form.status,
      });
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to update employee.",
      );
    }
  };

  return (
    <CustomModal
      open={open}
      onClose={handleClose}
      title="Edit Employee"
      description="Update the employee's information below."
      size="lg"
      footer={
        <>
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            form="edit-employee-form"
            disabled={isSubmitting || !employee}
          >
            <Save size={16} />
            {isSubmitting ? "Updating..." : "Update Employee"}
          </Button>
        </>
      }
    >
      <form
        id="edit-employee-form"
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        {error && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        <div>
          <label
            htmlFor="edit_employee_name"
            className="text-sm font-medium text-slate-700"
          >
            Full Name *
          </label>
          <input
            id="edit_employee_name"
            name="employee_name"
            value={form.employee_name}
            onChange={handleChange}
            placeholder="Enter employee name"
            className={inputClass}
            required
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="edit_email"
              className="text-sm font-medium text-slate-700"
            >
              Email Address *
            </label>
            <input
              id="edit_email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="employee@example.com"
              className={inputClass}
              required
            />
          </div>

          <div>
            <label
              htmlFor="edit_phone"
              className="text-sm font-medium text-slate-700"
            >
              Phone Number *
            </label>
            <input
              id="edit_phone"
              name="phone"
              type="tel"
              inputMode="numeric"
              maxLength={10}
              value={form.phone}
              onChange={handleChange}
              placeholder="10-digit mobile number"
              className={inputClass}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="edit_role"
              className="text-sm font-medium text-slate-700"
            >
              Employee Role *
            </label>
            <select
              id="edit_role"
              name="role"
              value={form.role}
              onChange={handleChange}
              className={inputClass}
              required
            >
              <option value="admin">Admin</option>
              <option value="staff">Staff</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="edit_salary"
              className="text-sm font-medium text-slate-700"
            >
              Monthly Salary (₹)
            </label>
            <input
              id="edit_salary"
              name="salary"
              type="number"
              min="0"
              step="0.01"
              value={form.salary}
              onChange={handleChange}
              placeholder="e.g. 18000"
              className={inputClass}
            />
          </div>
        </div>

        {/* <div>
          <label
            htmlFor="edit_status"
            className="text-sm font-medium text-slate-700"
          >
            Status *
          </label>
          <select
            id="edit_status"
            name="status"
            value={form.status}
            onChange={handleChange}
            className={inputClass}
            required
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div> */}
      </form>
    </CustomModal>
  );
};

export default EditEmployeeModal;
