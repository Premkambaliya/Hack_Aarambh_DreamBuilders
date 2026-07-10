import React, { useState, useEffect } from "react";
import { Users, Plus, Mail, Shield, X, Briefcase, Key, User, ArrowRight } from "lucide-react";
import { usersApi } from "../api/api";
import EmployeeIntelligence from "./EmployeeIntelligence";

const Employees = ({ user, token }) => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    designation: ""
  });
  const [formError, setFormError] = useState("");

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await usersApi.getEmployees(token);
      setEmployees(response.employees || []);
    } catch (err) {
      setError("Failed to load employees. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [token]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setFormError("");
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      setFormError("Name, Email, and Password are required.");
      return;
    }
    
    setAdding(true);
    try {
      await usersApi.addEmployee(formData, token);
      setIsModalOpen(false);
      setFormData({ name: "", email: "", password: "", designation: "" });
      fetchEmployees(); // Refresh list after adding
    } catch (err) {
      setFormError(err.message || "Failed to add employee.");
    } finally {
      setAdding(false);
    }
  };

  if (user?.role !== "admin") {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
        <Shield size={48} className="mb-4 text-rose-500 opacity-50" />
        <h2 className="text-xl font-bold text-gray-900">Access Denied</h2>
        <p className="mt-2 text-gray-500">Only company administrators can access this workspace.</p>
      </div>
    );
  }

  // If an employee is clicked, show specific intelligence view
  if (selectedEmployee) {
    return <EmployeeIntelligence employee={selectedEmployee} token={token} onBack={() => setSelectedEmployee(null)} />;
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header Area */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users size={24} className="text-orange-500" />
            Company Employees
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your sales team and their access to the {user.companyName || user.company_name || "Company"} workspace.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-orange-500 px-4 text-sm font-semibold text-gray-900 shadow-[0_0_15px_rgba(99,102,241,0.4)] transition hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-[#ffffff]"
        >
          <Plus size={16} />
          Add Employee
        </button>
      </div>

      {/* Main Content Area */}
      <div className="rounded-2xl border border-gray-200 bg-[#ffffff]/90 p-5 shadow-[0_16px_50px_rgba(0,0,0,0.25)] backdrop-blur-md">
        {loading ? (
          <div className="flex min-h-[200px] flex-col items-center justify-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-orange-500" />
            <span className="text-sm font-medium text-gray-500">Loading team...</span>
          </div>
        ) : error ? (
          <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-6 text-center text-rose-300">
            {error}
          </div>
        ) : employees.length === 0 ? (
          <div className="flex min-h-[200px] flex-col items-center justify-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-50 text-gray-500">
              <Users size={24} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">No Employees Yet</h3>
            <p className="mt-1 max-w-sm text-sm text-gray-500">
              You haven't added any employees to your workspace. Add your first team member to start collaborating.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-[#f8f9fa] text-xs font-semibold uppercase tracking-wider text-gray-400">
                <tr>
                  <th className="rounded-tl-lg px-6 py-4">Name</th>
                  <th className="px-6 py-4">Designation</th>
                  <th className="px-6 py-4">Email Address</th>
                  <th className="rounded-tr-lg px-6 py-4">Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {employees.map((emp) => (
                  <tr 
                    key={emp._id} 
                    onClick={() => setSelectedEmployee(emp)}
                    className="group cursor-pointer transition hover:bg-orange-500/10"
                  >
                    <td className="whitespace-nowrap px-6 py-4 font-medium text-gray-900 transition group-hover:text-orange-500">
                      {emp.name}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      {emp.designation || "Sales Representative"}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      {emp.email}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                        emp.role === "admin" 
                          ? "border-amber-500/30 bg-amber-500/10 text-amber-300" 
                          : "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                      }`}>
                        {emp.role || "employee"}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right">
                       <ArrowRight size={16} className="text-gray-400 transition group-hover:translate-x-1 group-hover:text-orange-500 opacity-50 group-hover:opacity-100" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Employee Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md scale-100 rounded-2xl border border-gray-200 bg-[#ffffff] p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Add New Employee</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-gray-500 transition hover:bg-white/10 hover:text-gray-900"
              >
                <X size={20} />
              </button>
            </div>
            
            {formError && (
              <div className="mb-4 rounded-lg border border-rose-500/20 bg-rose-500/10 p-3 text-sm text-rose-300">
                {formError}
              </div>
            )}

            <form onSubmit={handleAddEmployee} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Full Name</label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-gray-200 bg-[#ffffff] py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-slate-500 outline-none transition focus:border-orange-500/50 focus:bg-gray-50 focus:ring-1 focus:ring-orange-500/50"
                    placeholder="Jane Doe"
                    disabled={adding}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Email Address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-gray-200 bg-[#ffffff] py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-slate-500 outline-none transition focus:border-orange-500/50 focus:bg-gray-50 focus:ring-1 focus:ring-orange-500/50"
                    placeholder="jane@company.com"
                    disabled={adding}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Designation (Optional)</label>
                <div className="relative">
                  <Briefcase size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="designation"
                    value={formData.designation}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-gray-200 bg-[#ffffff] py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-slate-500 outline-none transition focus:border-orange-500/50 focus:bg-gray-50 focus:ring-1 focus:ring-orange-500/50"
                    placeholder="e.g. Senior Account Executive"
                    disabled={adding}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Temporary Password</label>
                <div className="relative">
                  <Key size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-gray-200 bg-[#ffffff] py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-slate-500 outline-none transition focus:border-orange-500/50 focus:bg-gray-50 focus:ring-1 focus:ring-orange-500/50"
                    placeholder="••••••••"
                    disabled={adding}
                  />
                </div>
              </div>

              <div className="mt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={adding}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-white/10 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adding}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 py-2.5 text-sm font-semibold text-gray-900 shadow-[0_0_15px_rgba(99,102,241,0.3)] transition hover:bg-orange-500 disabled:opacity-50"
                >
                  {adding ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                  ) : "Create Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;
