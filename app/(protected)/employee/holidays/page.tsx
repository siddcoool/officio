"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";

interface HolidayRow {
  id: string;
  title: string;
  date: string;
}

export default function EmployeeHolidaysPage() {
  const [holidays, setHolidays] = useState<HolidayRow[]>([]);

  useEffect(() => {
    void (async () => {
      try {
        const res = await axios.get("/api/holidays");
        setHolidays(res.data.data ?? []);
      } catch (error) {
        console.error(error);
      }
    })();
  }, []);

  return (
    <div className="rounded-lg border border-border bg-card shadow-sm">
      <div className="border-b border-border px-4 py-3">
        <h2 className="text-sm font-medium text-foreground">Holidays</h2>
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
  );
}

