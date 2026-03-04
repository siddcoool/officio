import { ReactNode } from "react";
import ProtectedLayout from "@/app/(protected)/layout";

export default function EmployeeSectionLayout({ children }: { children: ReactNode }) {
  return <ProtectedLayout>{children}</ProtectedLayout>;
}

