"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { toaster } from "@/components/ui/toaster";

interface EmployeeRow {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  createdAt: string;
}

export default function AdminEmployeesPage() {
  const [employees, setEmployees] = useState<EmployeeRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    sickLeave: 10,
    personalLeave: 12,
  });

  const fetchEmployees = async () => {
    try {
      const res = await axios.get("/api/admin/users");
      setEmployees(res.data.data ?? []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    void fetchEmployees();
  }, []);

  const handleChange = (field: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    try {
      await axios.post("/api/admin/users", form);
      toaster.create({
        title: "Employee created",
        type: "success",
      });
      setForm({
        name: "",
        email: "",
        password: "",
        sickLeave: 10,
        personalLeave: 12,
      });
      await fetchEmployees();
    } catch (error: any) {
      const message =
        error?.response?.data?.error?.message ?? "Unable to create employee.";
      toaster.create({
        title: "Error",
        description: message,
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-lg border border-border bg-card shadow-sm">
        <div className="border-b border-border px-4 py-3">
          <h2 className="text-sm font-medium text-foreground">
            Create Employee
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Admin creates employee accounts and shares credentials manually.
          </p>
        </div>
        <div className="px-4 py-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">Name</label>
              <input
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">
                Temporary Password
              </label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => handleChange("password", e.target.value)}
                className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground">
                  Initial Sick Leave
                </label>
                <input
                  type="number"
                  min={0}
                  value={form.sickLeave}
                  onChange={(e) =>
                    handleChange("sickLeave", Number(e.target.value) || 0)
                  }
                  className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground">
                  Initial Personal Leave
                </label>
                <input
                  type="number"
                  min={0}
                  value={form.personalLeave}
                  onChange={(e) =>
                    handleChange("personalLeave", Number(e.target.value) || 0)
                  }
                  className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex w-full items-center justify-center rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLoading ? "Creating..." : "Create Employee"}
            </button>
          </form>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card shadow-sm">
        <div className="border-b border-border px-4 py-3">
          <h2 className="text-sm font-medium text-foreground">Employees</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">
                  Name
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">
                  Email
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">
                  Active
                </th>
              </tr>
            </thead>
            <tbody>
              {employees.map((e) => (
                <tr
                  key={e.id}
                  className="border-t border-border hover:bg-muted/60"
                >
                  <td className="px-4 py-2 text-foreground">{e.name}</td>
                  <td className="px-4 py-2 text-foreground">{e.email}</td>
                  <td className="px-4 py-2 text-foreground">
                    {e.isActive ? "Yes" : "No"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

