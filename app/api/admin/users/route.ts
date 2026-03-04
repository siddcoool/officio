import { NextRequest, NextResponse } from "next/server";
import { ensureAdmin } from "@/lib/roleMiddleware";
import { UserRepository } from "@/src/repositories/user.repository";
import { LeaveBalanceRepository } from "@/src/repositories/leave-balance.repository";
import { createEmployeeSchema } from "@/src/dtos/admin-users.dto";
import { hashPassword } from "@/lib/auth";
import { Types } from "mongoose";

const userRepository = new UserRepository();
const leaveBalanceRepository = new LeaveBalanceRepository();

export async function GET(req: NextRequest) {
  try {
    await ensureAdmin(req);
    const employees = await userRepository.listEmployees();
    return NextResponse.json({
      success: true,
      data: employees.map((u) => ({
        id: u._id.toString(),
        name: u.name,
        email: u.email,
        isActive: u.isActive,
        createdAt: u.createdAt,
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
    console.error("List employees error", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_SERVER_ERROR" } },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await ensureAdmin(req);
    void admin; // currently unused but validates access

    const json = await req.json();
    const parsed = createEmployeeSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", details: parsed.error.flatten() } },
        { status: 400 },
      );
    }

    const { name, email, password, sickLeave, personalLeave } = parsed.data;

    const existing = await userRepository.findByEmail(email);
    if (existing) {
      return NextResponse.json(
        { success: false, error: { code: "EMAIL_TAKEN", message: "Email already in use." } },
        { status: 409 },
      );
    }

    const passwordHash = await hashPassword(password);
    const user = await userRepository.createEmployee({
      name,
      email,
      passwordHash,
      role: "EMPLOYEE",
    });

    await leaveBalanceRepository.createDefault({
      userId: new Types.ObjectId(user._id),
      sickLeave,
      personalLeave,
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
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
    console.error("Create employee error", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_SERVER_ERROR" } },
      { status: 500 },
    );
  }
}

