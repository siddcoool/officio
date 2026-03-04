import { NextRequest, NextResponse } from "next/server";
import { ensureAdmin } from "@/lib/roleMiddleware";
import { LeaveRequestRepository } from "@/src/repositories/leave-request.repository";
import { LeaveBalanceRepository } from "@/src/repositories/leave-balance.repository";
import { approveLeaveSchema } from "@/src/dtos/leave-approval.dto";
import { Types } from "mongoose";

const leaveRequestRepository = new LeaveRequestRepository();
const leaveBalanceRepository = new LeaveBalanceRepository();

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const admin = await ensureAdmin(req);
    const id = params.id;

    const json = await req.json();
    const parsed = approveLeaveSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", details: parsed.error.flatten() } },
        { status: 400 },
      );
    }

    const existingList = await leaveRequestRepository.listPending();
    const existing = existingList.find((r) => r._id.toString() === id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND" } },
        { status: 404 },
      );
    }

    const balance = await leaveBalanceRepository.deductIfSufficient(
      new Types.ObjectId(existing.userId),
      existing.leaveType,
      existing.totalDays,
    );

    if (!balance) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INSUFFICIENT_BALANCE",
            message: "Insufficient leave balance.",
          },
        },
        { status: 400 },
      );
    }

    const updated = await leaveRequestRepository.updateStatus(id, "APPROVED", {
      adminMessage: parsed.data.adminMessage,
      reviewedBy: new Types.ObjectId(admin.userId),
      reviewedAt: new Date(),
    });

    return NextResponse.json(
      { success: true, data: { id: updated?._id.toString() } },
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

    console.error("Approve leave request error", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_SERVER_ERROR" } },
      { status: 500 },
    );
  }
}

