"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ColorModeButton } from "@/components/ui/color-mode";
import { useSession } from "next-auth/react";
import axios from "axios";
import { toaster } from "@/components/ui/toaster";

interface ProtectedLayoutProps {
  children: ReactNode;
}

const navLinks = [
  { href: "/admin/dashboard", label: "Admin Dashboard", section: "admin" },
  { href: "/admin/employees", label: "Employees", section: "admin" },
  { href: "/admin/holidays", label: "Admin Holidays", section: "admin" },
  { href: "/admin/leave-requests", label: "Leave Requests", section: "admin" },
  { href: "/employee/dashboard", label: "Employee Dashboard", section: "employee" },
  { href: "/employee/leave", label: "My Leaves", section: "employee" },
  { href: "/employee/holidays", label: "Company Holidays", section: "employee" },
];

export default function ProtectedLayout({ children }: ProtectedLayoutProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await axios.post("/api/auth/logout");
    } finally {
      toaster.create({
        title: "Logged out",
        type: "success",
      });
      router.push("/login");
    }
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="sticky top-0 hidden h-screen w-64 flex-none flex-col gap-6 border-r border-sidebar-border bg-sidebar px-4 py-6 md:flex md:w-72">
        <div>
          <div className="text-lg font-bold text-sidebar-foreground">
            Officio
          </div>
          <div className="text-sm text-muted-foreground">
            Leave Management
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-1 text-sm">
          {navLinks
            .filter((link) =>
              pathname.startsWith("/admin")
                ? link.section === "admin"
                : link.section === "employee"
            )
            .map((link) => {
              const isActive = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`inline-flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
        </nav>

        <button
          type="button"
          onClick={handleLogout}
          className="mt-auto inline-flex w-full items-center justify-start rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          Logout
        </button>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border bg-card px-4 py-3">
          <div className="flex items-center gap-2 md:hidden">
            <span className="text-md font-semibold">Officio</span>
          </div>
          <div className="flex items-center gap-3">
            <ColorModeButton />
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-2 py-1 text-sm text-foreground shadow-sm transition-colors hover:bg-muted"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {(session?.user?.email ?? session?.user?.name ?? "U")
                    .toString()
                    .charAt(0)
                    .toUpperCase()}
                </span>
                <span className="hidden max-w-[140px] truncate text-xs font-medium sm:inline">
                  {session?.user?.email ?? session?.user?.name ?? "Logged in"}
                </span>
                <svg
                  className="h-3 w-3 text-muted-foreground"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M5 7.5L10 12.5L15 7.5"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              {menuOpen && (
                <div className="absolute right-0 z-20 mt-2 w-52 rounded-md border border-border bg-popover text-sm shadow-lg">
                  <div className="border-b border-border px-3 py-2">
                    <p className="truncate text-xs font-medium text-foreground">
                      {session?.user?.email ?? session?.user?.name ?? "User"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center justify-between px-3 py-2 text-xs text-destructive hover:bg-muted"
                  >
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}

