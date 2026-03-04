import { NextRequest, NextResponse } from "next/server";
import { ensureEmployee } from "@/lib/roleMiddleware";
import { LeaveBalanceRepository } from "@/src/repositories/leave-balance.repository";
import { Types } from "mongoose";

const leaveBalanceRepository = new LeaveBalanceRepository();

export async function GET(req: NextRequest) {
  try {
    const employee = await ensureEmployee(req);
    const balance = await leaveBalanceRepository.getByUser(
      new Types.ObjectId(employee.userId),
    );

    if (!balance) {
      return NextResponse.json(
        {
          success: true,
          data: {
            sickLeave: 0,
            personalLeave: 0,
          },
        },
        { status: 200 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          sickLeave: balance.sickLeave,
          personalLeave: balance.personalLeave,
        },
      },
      { status: 200 },
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

    console.error("Get employee leave balance error", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_SERVER_ERROR" } },
      { status: 500 },
    );
  }
}

