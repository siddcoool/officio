"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";

interface Balance {
  sickLeave: number;
  personalLeave: number;
}

interface LeaveRow {
  id: string;
  leaveType: "SICK" | "PERSONAL";
  startDate: string;
  endDate: string;
  totalDays: number;
  status: string;
}

interface HolidayRow {
  id: string;
  title: string;
  date: string;
}

export default function EmployeeDashboardPage() {
  const [balance, setBalance] = useState<Balance | null>(null);
  const [requests, setRequests] = useState<LeaveRow[]>([]);
  const [holidays, setHolidays] = useState<HolidayRow[]>([]);

  useEffect(() => {
    void (async () => {
      try {
        const [balanceRes, reqRes, holidayRes] = await Promise.all([
          axios.get("/api/employee/leave-balance"),
          axios.get("/api/employee/leave-requests"),
          axios.get("/api/holidays"),
        ]);
        setBalance(balanceRes.data.data);
        setRequests((reqRes.data.data ?? []).slice(0, 5));
        setHolidays((holidayRes.data.data ?? []).slice(0, 5));
      } catch (error) {
        console.error(error);
      }
    })();
  }, []);

  const pendingCount = requests.filter((r) => r.status === "PENDING").length;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-foreground">
        Employee Dashboard
      </h1>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">Sick Leave Remaining</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">
            {balance ? balance.sickLeave.toFixed(1) : "--"}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">
            Personal Leave Remaining
          </p>
          <p className="mt-2 text-2xl font-semibold text-foreground">
            {balance ? balance.personalLeave.toFixed(1) : "--"}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">Pending Requests</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">
            {pendingCount}
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border border-border bg-card shadow-sm">
          <div className="border-b border-border px-4 py-3">
            <h2 className="text-sm font-medium text-foreground">
              Recent Leave Requests
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">
                    Type
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">
                    Dates
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => (
                  <tr
                    key={r.id}
                    className="border-t border-border hover:bg-muted/60"
                  >
                    <td className="px-4 py-2 text-foreground">
                      {r.leaveType}
                    </td>
                    <td className="px-4 py-2 text-foreground">
                      {dayjs(r.startDate).format("DD MMM YYYY")} –{" "}
                      {dayjs(r.endDate).format("DD MMM YYYY")}
                    </td>
                    <td className="px-4 py-2 text-foreground">{r.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card shadow-sm">
          <div className="border-b border-border px-4 py-3">
            <h2 className="text-sm font-medium text-foreground">
              Upcoming Holidays
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">
                    Title
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {holidays.map((h) => (
                  <tr
                    key={h.id}
                    className="border-t border-border hover:bg-muted/60"
                  >
                    <td className="px-4 py-2 text-foreground">{h.title}</td>
                    <td className="px-4 py-2 text-foreground">
                      {dayjs(h.date).format("DD MMM YYYY")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

