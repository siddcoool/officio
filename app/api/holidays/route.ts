import { NextRequest, NextResponse } from "next/server";
import { HolidayRepository } from "@/src/repositories/holiday.repository";

const holidayRepository = new HolidayRepository();

export async function GET(req: NextRequest) {
  void req;
  try {
    const holidays = await holidayRepository.listHolidays();
    return NextResponse.json({
      success: true,
      data: holidays.map((h) => ({
        id: h._id.toString(),
        title: h.title,
        date: h.date,
        description: h.description,
      })),
    });
  } catch (error) {
    console.error("Public holidays error", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_SERVER_ERROR" } },
      { status: 500 },
    );
  }
}

