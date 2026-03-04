import { NextRequest, NextResponse } from "next/server";
import { ensureAdmin } from "@/lib/roleMiddleware";
import { LeaveRequestRepository } from "@/src/repositories/leave-request.repository";

const leaveRequestRepository = new LeaveRequestRepository();

export async function GET(req: NextRequest) {
  try {
    await ensureAdmin(req);
    const requests = await leaveRequestRepository.listPending(100);

    return NextResponse.json({
      success: true,
      data: requests.map((r) => ({
        id: r._id.toString(),
        userId: r.userId.toString(),
        leaveType: r.leaveType,
        startDate: r.startDate,
        endDate: r.endDate,
        isHalfDay: r.isHalfDay,
        halfDaySession: r.halfDaySession,
        totalDays: r.totalDays,
        reason: r.reason,
        status: r.status,
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

    console.error("List pending leave requests error", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_SERVER_ERROR" } },
      { status: 500 },
    );
  }
}

