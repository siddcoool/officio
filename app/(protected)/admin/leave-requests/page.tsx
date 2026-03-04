"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import { toaster } from "@/components/ui/toaster";

interface LeaveRequestRow {
  id: string;
  userId: string;
  leaveType: "SICK" | "PERSONAL";
  startDate: string;
  endDate: string;
  isHalfDay: boolean;
  halfDaySession?: "FIRST_HALF" | "SECOND_HALF" | null;
  totalDays: number;
  reason: string;
  status: string;
}

export default function AdminLeaveRequestsPage() {
  const [requests, setRequests] = useState<LeaveRequestRow[]>([]);
  const [messageById, setMessageById] = useState<Record<string, string>>({});
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      const res = await axios.get("/api/admin/leave-requests");
      setRequests(res.data.data ?? []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    void fetchRequests();
  }, []);

  const handleApprove = async (id: string) => {
    setLoadingId(id);
    try {
      await axios.post(`/api/admin/leave-requests/${id}/approve`, {
        adminMessage: messageById[id] || undefined,
      });
      toaster.create({
        title: "Leave approved",
        type: "success",
      });
      await fetchRequests();
    } catch (error: any) {
      const message =
        error?.response?.data?.error?.message ??
        error?.response?.data?.error?.code ??
        "Unable to approve leave.";
      toaster.create({
        title: "Error",
        description: message,
        type: "error",
      });
    } finally {
      setLoadingId(null);
    }
  };

  const handleReject = async (id: string) => {
    setLoadingId(id);
    try {
      await axios.post(`/api/admin/leave-requests/${id}/reject`, {
        adminMessage: messageById[id] || "Rejected",
      });
      toaster.create({
        title: "Leave rejected",
        type: "success",
      });
      await fetchRequests();
    } catch (error: any) {
      const message =
        error?.response?.data?.error?.message ??
        error?.response?.data?.error?.code ??
        "Unable to reject leave.";
      toaster.create({
        title: "Error",
        description: message,
        type: "error",
      });
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="rounded-lg border border-border bg-card shadow-sm">
      <div className="border-b border-border px-4 py-3">
        <h2 className="text-sm font-medium text-foreground">
          Pending Leave Requests
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Approve or reject employee leave requests and optionally add a
          message.
        </p>
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
                Days
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">
                Reason
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">
                Admin Message
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {requests.map((r) => (
              <tr
                key={r.id}
                className="border-t border-border align-top hover:bg-muted/60"
              >
                <td className="px-4 py-2 text-foreground">{r.leaveType}</td>
                <td className="px-4 py-2 text-foreground">
                  {dayjs(r.startDate).format("DD MMM YYYY")} –{" "}
                  {dayjs(r.endDate).format("DD MMM YYYY")}
                  {r.isHalfDay && r.halfDaySession
                    ? ` (${
                        r.halfDaySession === "FIRST_HALF"
                          ? "First half"
                          : "Second half"
                      })`
                    : null}
                </td>
                <td className="px-4 py-2 text-foreground">{r.totalDays}</td>
                <td className="max-w-xs px-4 py-2 text-foreground">
                  <p className="line-clamp-2">{r.reason}</p>
                </td>
                <td className="max-w-xs px-4 py-2">
                  <textarea
                    className="block w-full rounded-md border border-input bg-background px-2 py-1 text-xs text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    rows={3}
                    value={messageById[r.id] ?? ""}
                    onChange={(e) =>
                      setMessageById((prev) => ({
                        ...prev,
                        [r.id]: e.target.value,
                      }))
                    }
                    placeholder="Optional message"
                  />
                </td>
                <td className="px-4 py-2">
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <button
                      type="button"
                      disabled={loadingId === r.id}
                      onClick={() => handleApprove(r.id)}
                      className="inline-flex items-center justify-center rounded-md bg-primary px-3 py-1 text-xs font-medium text-primary-foreground shadow-sm transition-colors hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {loadingId === r.id ? "Saving..." : "Approve"}
                    </button>
                    <button
                      type="button"
                      disabled={loadingId === r.id}
                      onClick={() => handleReject(r.id)}
                      className="inline-flex items-center justify-center rounded-md border border-red-500 px-3 py-1 text-xs font-medium text-red-400 shadow-sm transition-colors hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {loadingId === r.id ? "Saving..." : "Reject"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

