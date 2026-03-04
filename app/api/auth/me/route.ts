import { NextRequest, NextResponse } from "next/server";
import { getAuthContext } from "@/lib/roleMiddleware";

export async function GET(req: NextRequest) {
  const auth = await getAuthContext(req);

  if (!auth) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHENTICATED", message: "Not authenticated." } },
      { status: 401 },
    );
  }

  return NextResponse.json(
    {
      success: true,
      data: auth,
    },
    { status: 200 },
  );
}

