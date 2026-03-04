"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import { toaster } from "@/components/ui/toaster";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Skeleton } from "@/components/ui/skeleton";

interface LeaveRow {
  id: string;
  leaveType: "SICK" | "PERSONAL";
  startDate: string;
  endDate: string;
  isHalfDay: boolean;
  halfDaySession?: "FIRST_HALF" | "SECOND_HALF" | null;
  totalDays: number;
  reason: string;
  status: string;
  adminMessage?: string;
}

export default function EmployeeLeavePage() {
  const [requests, setRequests] = useState<LeaveRow[]>([]);
  const [form, setForm] = useState({
    leaveType: "SICK" as "SICK" | "PERSONAL",
    startDate: "",
    endDate: "",
    isHalfDay: false,
    halfDaySession: "FIRST_HALF" as "FIRST_HALF" | "SECOND_HALF",
    reason: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isListLoading, setIsListLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const res = await axios.get("/api/employee/leave-requests");
      setRequests(res.data.data ?? []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsListLoading(false);
    }
  };

  useEffect(() => {
    void fetchRequests();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    try {
      await axios.post("/api/employee/leave-requests", {
        ...form,
        startDate: form.startDate,
        endDate: form.endDate || form.startDate,
      });
      toaster.create({
        title: "Leave requested",
        type: "success",
      });
      setForm((prev) => ({
        ...prev,
        startDate: "",
        endDate: "",
        reason: "",
      }));
      await fetchRequests();
    } catch (error: any) {
      const message =
        error?.response?.data?.error?.message ??
        error?.response?.data?.error?.code ??
        "Unable to request leave.";
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
      <Card>
        <CardHeader>
          <CardTitle>Request Leave</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <span className="text-sm font-medium text-foreground">
                Leave Type
              </span>
              <div className="mt-1 flex gap-4 text-sm text-foreground">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="radio"
                    className="h-3 w-3 rounded border-input bg-background text-primary"
                    checked={form.leaveType === "SICK"}
                    onChange={() =>
                      setForm((prev) => ({ ...prev, leaveType: "SICK" }))
                    }
                  />
                  <span>Sick</span>
                </label>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="radio"
                    className="h-3 w-3 rounded border-input bg-background text-primary"
                    checked={form.leaveType === "PERSONAL"}
                    onChange={() =>
                      setForm((prev) => ({ ...prev, leaveType: "PERSONAL" }))
                    }
                  />
                  <span>Personal</span>
                </label>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">
                Start Date
              </label>
              <div className="rounded-md border border-input bg-background p-2">
                <Calendar
                  mode="single"
                  selected={form.startDate ? new Date(form.startDate) : undefined}
                  onSelect={(day) =>
                    setForm((prev) => ({
                      ...prev,
                      startDate: day
                        ? day.toISOString().substring(0, 10)
                        : "",
                    }))
                  }
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">
                End Date
              </label>
              <div className="rounded-md border border-input bg-background p-2">
                <Calendar
                  mode="single"
                  selected={form.endDate ? new Date(form.endDate) : undefined}
                  onSelect={(day) =>
                    setForm((prev) => ({
                      ...prev,
                      endDate: day
                        ? day.toISOString().substring(0, 10)
                        : "",
                    }))
                  }
                  disabled={form.isHalfDay}
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-2">
              <span className="text-sm text-foreground">Half Day</span>
              <Switch
                checked={form.isHalfDay}
                onCheckedChange={(checked) =>
                  setForm((prev) => ({ ...prev, isHalfDay: checked }))
                }
              />
            </div>

            {form.isHalfDay && (
              <div className="space-y-1">
                <span className="text-sm font-medium text-foreground">
                  Half-Day Session
                </span>
                <div className="mt-1 flex gap-4 text-sm text-foreground">
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="radio"
                      className="h-3 w-3 rounded border-input bg-background text-primary"
                      checked={form.halfDaySession === "FIRST_HALF"}
                      onChange={() =>
                        setForm((prev) => ({
                          ...prev,
                          halfDaySession: "FIRST_HALF",
                        }))
                      }
                    />
                    <span>First Half</span>
                  </label>
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="radio"
                      className="h-3 w-3 rounded border-input bg-background text-primary"
                      checked={form.halfDaySession === "SECOND_HALF"}
                      onChange={() =>
                        setForm((prev) => ({
                          ...prev,
                          halfDaySession: "SECOND_HALF",
                        }))
                      }
                    />
                    <span>Second Half</span>
                  </label>
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">
                Reason
              </label>
              <textarea
                value={form.reason}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, reason: e.target.value }))
                }
                className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                rows={4}
              />
            </div>

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Submitting..." : "Submit Request"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>My Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {isListLoading ? (
            <Skeleton className="h-40 w-full" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Admin Message</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{r.leaveType}</TableCell>
                    <TableCell>
                      {dayjs(r.startDate).format("DD MMM YYYY")} –{" "}
                      {dayjs(r.endDate).format("DD MMM YYYY")}
                    </TableCell>
                    <TableCell>{r.status}</TableCell>
                    <TableCell className="max-w-xs">
                      <p className="line-clamp-2">{r.adminMessage}</p>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

