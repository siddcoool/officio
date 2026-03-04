import { NextRequest, NextResponse } from "next/server";
import { loginSchema } from "@/src/dtos/auth.dto";
import { UserRepository } from "@/src/repositories/user.repository";
import { verifyPassword, createAuthToken, setAuthCookie } from "@/lib/auth";

const userRepository = new UserRepository();

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = loginSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", details: parsed.error.flatten() } },
        { status: 400 },
      );
    }

    const { email, password } = parsed.data;

    const user = await userRepository.findByEmail(email);
    if (!user || !user.isActive) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_CREDENTIALS", message: "Invalid email or password." } },
        { status: 401 },
      );
    }

    const passwordValid = await verifyPassword(password, user.password);
    if (!passwordValid) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_CREDENTIALS", message: "Invalid email or password." } },
        { status: 401 },
      );
    }

    const token = createAuthToken(user);
    setAuthCookie(token);

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
      { status: 200 },
    );
  } catch (error) {
    console.error("Login error", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Something went wrong." } },
      { status: 500 },
    );
  }
}

