import { NextRequest, NextResponse } from "next/server";
import { adminSignupSchema } from "@/src/dtos/auth.dto";
import { UserRepository } from "@/src/repositories/user.repository";
import { hashPassword } from "@/lib/auth";

const userRepository = new UserRepository();

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = adminSignupSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", details: parsed.error.flatten() } },
        { status: 400 },
      );
    }

    const { name, email, password } = parsed.data;

    const hasAdmin = await userRepository.hasAdmin();
    if (hasAdmin) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "ADMIN_ALREADY_EXISTS",
            message: "An admin account already exists.",
          },
        },
        { status: 403 },
      );
    }

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
      role: "ADMIN",
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Admin signup error", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Something went wrong." } },
      { status: 500 },
    );
  }
}

