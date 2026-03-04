import { NextRequest, NextResponse } from "next/server";
import { ensureAdmin } from "@/lib/roleMiddleware";
import { HolidayRepository } from "@/src/repositories/holiday.repository";
import { createHolidaySchema } from "@/src/dtos/holiday.dto";
import { Types } from "mongoose";

const holidayRepository = new HolidayRepository();

export async function GET(req: NextRequest) {
  try {
    await ensureAdmin(req);
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
  } catch (error: any) {
    if (error?.message === "UNAUTHENTICATED") {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHENTICATED" } },
        { status: 401 },
      );
    }
    if (error?.message === "FORBIDDEN") {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN" } },
        { status: 403 },
      );
    }
    console.error("List holidays error", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_SERVER_ERROR" } },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await ensureAdmin(req);

    const json = await req.json();
    const parsed = createHolidaySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", details: parsed.error.flatten() } },
        { status: 400 },
      );
    }

    const { title, date, description } = parsed.data;
    const holiday = await holidayRepository.createHoliday({
      title,
      date: new Date(date),
      description,
      createdBy: new Types.ObjectId(admin.userId),
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          id: holiday._id.toString(),
          title: holiday.title,
          date: holiday.date,
          description: holiday.description,
        },
      },
      { status: 201 },
    );
  } catch (error: any) {
    if (error?.message === "UNAUTHENTICATED") {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHENTICATED" } },
        { status: 401 },
      );
    }
    if (error?.message === "FORBIDDEN") {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN" } },
        { status: 403 },
      );
    }
    console.error("Create holiday error", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_SERVER_ERROR" } },
      { status: 500 },
    );
  }
}

