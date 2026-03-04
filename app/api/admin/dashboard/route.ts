import { NextRequest, NextResponse } from "next/server";
import { ensureAdmin } from "@/lib/roleMiddleware";
import { UserRepository } from "@/src/repositories/user.repository";
import { HolidayRepository } from "@/src/repositories/holiday.repository";
import { LeaveRequestRepository } from "@/src/repositories/leave-request.repository";

const userRepository = new UserRepository();
const holidayRepository = new HolidayRepository();
const leaveRequestRepository = new LeaveRequestRepository();

export async function GET(req: NextRequest) {
  try {
    await ensureAdmin(req);

    const [totalEmployees, holidays, pendingCount, approvedThisMonth, recent] =
      await Promise.all([
        userRepository.countEmployees(),
        holidayRepository.listHolidays(),
        leaveRequestRepository.countPending(),
        (async () => {
          const now = new Date();
          const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
          const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
          return leaveRequestRepository.countApprovedInMonth(monthStart, monthEnd);
        })(),
        leaveRequestRepository.listRecent(10),
      ]);

    return NextResponse.json(
      {
        success: true,
        data: {
          totalEmployees,
          totalHolidays: holidays.length,
          pendingRequests: pendingCount,
          approvedThisMonth,
          recentRequests: recent.map((r) => ({
            id: r._id.toString(),
            leaveType: r.leaveType,
            startDate: r.startDate,
            endDate: r.endDate,
            status: r.status,
          })),
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

    console.error("Admin dashboard error", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_SERVER_ERROR" } },
      { status: 500 },
    );
  }
}

