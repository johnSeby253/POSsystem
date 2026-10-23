
import { useState } from "react";
import { Plus } from "lucide-react";
import CustomModal from "../../common/CustomModal";
import Button from "../../common/Button";

const initialForm = {
  employee_name: "",
  email: "",
  phone: "",
  role: "admin",
  salary: "",
  status: "Active",
};

const inputClass =
  "mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";

const AddEmployeeModal = ({ open, onClose, onSubmit }) => {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
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

    const salary = Number(form.salary);

    if (!form.employee_name.trim()) {
      setError("Employee name is required.");
      return;
    }

    if (!form.email.trim()) {
      setError("Email is required.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setError("Enter a valid email address.");
      return;
    }

    if (!/^\d{10}$/.test(form.phone.trim())) {
      setError("Enter a valid 10-digit phone number.");
      return;
    }

    if (form.salary === "" || !Number.isFinite(salary) || salary < 0) {
      setError("Enter a valid salary.");
      return;
    }

    try {
      await onSubmit?.({
        employee_name: form.employee_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        role: form.role,
        salary,
        status: form.status,
      });

      setForm(initialForm);
      onClose?.();
    } catch (err) {
      setError(err?.message || "Unable to add employee.");
    }
  };

  return (
    <CustomModal
      open={open}
      onClose={handleClose}
      title="Add Employee"
      description="Enter the employee's information below."
      size="lg"
      footer={
        <>
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
          >
            Cancel
          </Button>

          <Button type="submit" form="add-employee-form">
            <Plus size={16} />
            Save Employee
          </Button>
        </>
      }
    >
      <form
        id="add-employee-form"
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
            htmlFor="employee_name"
            className="text-sm font-medium text-slate-700"
          >
            Full Name *
          </label>
          <input
            id="employee_name"
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
              htmlFor="email"
              className="text-sm font-medium text-slate-700"
            >
              Email Address *
            </label>
            <input
              id="email"
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
              htmlFor="phone"
              className="text-sm font-medium text-slate-700"
            >
              Phone Number *
            </label>
            <input
              id="phone"
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
              htmlFor="role"
              className="text-sm font-medium text-slate-700"
            >
              Employee Role *
            </label>
            <select
              id="role"
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
              htmlFor="salary"
              className="text-sm font-medium text-slate-700"
            >
              Monthly Salary (₹) 
            </label>
            <input
              id="salary"
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
            htmlFor="status"
            className="text-sm font-medium text-slate-700"
          >
            Status *
          </label>
          <select
            id="status"
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

export default AddEmployeeModal;
