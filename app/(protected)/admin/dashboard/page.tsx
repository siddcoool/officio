"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

interface AdminDashboardMetrics {
  totalEmployees: number;
  totalHolidays: number;
  pendingRequests: number;
  approvedThisMonth: number;
  recentRequests: {
    id: string;
    leaveType: string;
    startDate: string;
    endDate: string;
    status: string;
  }[];
}

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<AdminDashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      try {
        const res = await axios.get("/api/admin/dashboard");
        setMetrics(res.data.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const summaryData =
    metrics == null
      ? []
      : [
          {
            label: "Employees",
            value: metrics.totalEmployees,
            key: "totalEmployees",
          },
          {
            label: "Holidays",
            value: metrics.totalHolidays,
            key: "totalHolidays",
          },
          {
            label: "Pending",
            value: metrics.pendingRequests,
            key: "pendingRequests",
          },
          {
            label: "Approved",
            value: metrics.approvedThisMonth,
            key: "approvedThisMonth",
          },
        ];

  const chartConfig: ChartConfig = {
    totalEmployees: {
      label: "Employees",
      color: "hsl(24 95% 53%)",
    },
    totalHolidays: {
      label: "Holidays",
      color: "hsl(142 71% 45%)",
    },
    pendingRequests: {
      label: "Pending",
      color: "hsl(48 96% 53%)",
    },
    approvedThisMonth: {
      label: "Approved",
      color: "hsl(199 89% 48%)",
    },
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-foreground">Admin Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-4">
        {["Total Employees", "Total Holidays", "Pending Requests", "Approved This Month"].map(
          (label, index) => (
            <Card key={label}>
              <CardContent className="space-y-1">
                <p className="text-sm text-muted-foreground">{label}</p>
                {loading ? (
                  <Skeleton className="mt-2 h-7 w-16" />
                ) : (
                  <p className="mt-2 text-2xl font-semibold text-foreground">
                    {[
                      metrics?.totalEmployees,
                      metrics?.totalHolidays,
                      metrics?.pendingRequests,
                      metrics?.approvedThisMonth,
                    ][index] ?? "--"}
                  </p>
                )}
              </CardContent>
            </Card>
          )
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Overview</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <ChartContainer config={chartConfig} className="w-full">
              <BarChart data={summaryData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <ChartTooltip
                  cursor={{ fill: "hsl(var(--muted))" }}
                  content={<ChartTooltipContent />}
                />
                <Bar
                  dataKey="value"
                  radius={6}
                  fill="var(--color-totalEmployees)"
                />
                <ChartLegend content={<ChartLegendContent />} />
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Leave Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-40 w-full" />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border-t border-border text-sm">
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
                  {metrics?.recentRequests?.map((r) => (
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}

