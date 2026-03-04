import { NextRequest, NextResponse } from "next/server";
import { ensureEmployee } from "@/lib/roleMiddleware";
import { LeaveRequestRepository } from "@/src/repositories/leave-request.repository";
import { createEmployeeLeaveSchema } from "@/src/dtos/employee-leave.dto";
import { Types } from "mongoose";

const leaveRequestRepository = new LeaveRequestRepository();

function calculateTotalDays(
  startDate: Date,
  endDate: Date,
  isHalfDay: boolean,
): number {
  if (isHalfDay) {
    return 0.5;
  }

  const diffMs = endDate.getTime() - startDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return diffDays + 1;
}

export async function GET(req: NextRequest) {
  try {
    const employee = await ensureEmployee(req);
    const requests = await leaveRequestRepository.listByUser(
      new Types.ObjectId(employee.userId),
    );

    return NextResponse.json({
      success: true,
      data: requests.map((r) => ({
        id: r._id.toString(),
        leaveType: r.leaveType,
        startDate: r.startDate,
        endDate: r.endDate,
        isHalfDay: r.isHalfDay,
        halfDaySession: r.halfDaySession,
        totalDays: r.totalDays,
        reason: r.reason,
        status: r.status,
        adminMessage: r.adminMessage,
        createdAt: r.createdAt,
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

    console.error("List employee leave requests error", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_SERVER_ERROR" } },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const employee = await ensureEmployee(req);

    const json = await req.json();
    const parsed = createEmployeeLeaveSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", details: parsed.error.flatten() } },
        { status: 400 },
      );
    }

    const { leaveType, startDate, endDate, isHalfDay, halfDaySession, reason } =
      parsed.data;

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "INVALID_DATE", message: "Invalid start or end date." },
        },
        { status: 400 },
      );
    }

    if (end < start) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_RANGE",
            message: "End date cannot be before start date.",
          },
        },
        { status: 400 },
      );
    }

    const totalDays = calculateTotalDays(start, end, isHalfDay);

    const request = await leaveRequestRepository.createRequest({
      userId: new Types.ObjectId(employee.userId),
      leaveType,
      startDate: start,
      endDate: end,
      isHalfDay,
      halfDaySession: isHalfDay ? halfDaySession ?? "FIRST_HALF" : null,
      totalDays,
      reason,
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          id: request._id.toString(),
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

    console.error("Create employee leave request error", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_SERVER_ERROR" } },
      { status: 500 },
    );
  }
}

