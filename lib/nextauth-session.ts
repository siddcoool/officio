import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/nextauth";

export async function getAppSession() {
  return getServerSession(authOptions);
}

