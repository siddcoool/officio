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
import { Calendar } from "@/components/ui/calendar";
import { Skeleton } from "@/components/ui/skeleton";

interface HolidayRow {
  id: string;
  title: string;
  date: string;
  description?: string;
}

export default function AdminHolidaysPage() {
  const [holidays, setHolidays] = useState<HolidayRow[]>([]);
  const [form, setForm] = useState({
    title: "",
    date: "",
    description: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isListLoading, setIsListLoading] = useState(true);

  const fetchHolidays = async () => {
    try {
      const res = await axios.get("/api/admin/holidays");
      setHolidays(res.data.data ?? []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsListLoading(false);
    }
  };

  useEffect(() => {
    void fetchHolidays();
  }, []);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    try {
      await axios.post("/api/admin/holidays", form);
      toaster.create({
        title: "Holiday added",
        type: "success",
      });
      setForm({ title: "", date: "", description: "" });
      await fetchHolidays();
    } catch (error: any) {
      const message =
        error?.response?.data?.error?.message ?? "Unable to add holiday.";
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
          <CardTitle>Add Holiday</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">
                Title
              </label>
              <input
                value={form.title}
                onChange={(e) => handleChange("title", e.target.value)}
                className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">
                Date
              </label>
              <div className="rounded-md border border-input bg-background p-2">
                <Calendar
                  mode="single"
                  selected={form.date ? new Date(form.date) : undefined}
                  onSelect={(day) =>
                    handleChange(
                      "date",
                      day ? day.toISOString().substring(0, 10) : ""
                    )
                  }
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">
                Description
              </label>
              <input
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
                className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Saving..." : "Add Holiday"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Holidays</CardTitle>
          <p className="mt-1 text-xs text-muted-foreground">
            Employees can view this list in their own dashboard.
          </p>
        </CardHeader>
        <CardContent>
          {isListLoading ? (
            <Skeleton className="h-40 w-full" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {holidays.map((h) => (
                  <TableRow key={h.id}>
                    <TableCell>{h.title}</TableCell>
                    <TableCell>{dayjs(h.date).format("DD MMM YYYY")}</TableCell>
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

