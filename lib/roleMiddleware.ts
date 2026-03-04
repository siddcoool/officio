import type { NextRequest } from "next/server";
import { getAppSession } from "@/lib/nextauth-session";

export interface AuthContext {
  userId: string;
  role: "ADMIN" | "EMPLOYEE";
  name: string;
  email: string;
}

export async function getAuthContext(_req?: NextRequest): Promise<AuthContext | null> {
  const session = await getAppSession();

  if (!session?.user) {
    return null;
  }

  const role = (session.user as any).role as AuthContext["role"] | undefined;
  const id = (session.user as any).id as string | undefined;

  if (!role || !id) {
    return null;
  }

  return {
    userId: id,
    role,
    name: session.user.name ?? "",
    email: session.user.email ?? "",
  };
}

export async function ensureAuthenticated(
  req?: NextRequest,
): Promise<AuthContext> {
  const ctx = await getAuthContext(req);
  if (!ctx) {
    throw new Error("UNAUTHENTICATED");
  }
  return ctx;
}

export async function ensureAdmin(req?: NextRequest): Promise<AuthContext> {
  const ctx = await ensureAuthenticated(req);
  if (ctx.role !== "ADMIN") {
    throw new Error("FORBIDDEN");
  }
  return ctx;
}

export async function ensureEmployee(req?: NextRequest): Promise<AuthContext> {
  const ctx = await ensureAuthenticated(req);
  if (ctx.role !== "EMPLOYEE") {
    throw new Error("FORBIDDEN");
  }
  return ctx;
}

