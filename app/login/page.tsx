"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { signIn } from "next-auth/react";
import { toaster } from "@/components/ui/toaster";

export default function LoginPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<0 | 1>(0);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [isLoginLoading, setIsLoginLoading] = useState(false);

  const [isAdminSignup, setIsAdminSignup] = useState(false);
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [isSignupLoading, setIsSignupLoading] = useState(false);

  const handleLoginSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoginLoading(true);
    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: loginEmail,
        password: loginPassword,
      });

      if (result?.error) {
        toaster.create({
          title: "Login failed",
          description: result.error,
          type: "error",
        });
        return;
      }

      toaster.create({
        title: "Logged in",
        description: "Welcome back!",
        type: "success",
      });

      // Route based on the selected tab (expected role)
      if (activeTab === 1) {
        router.push("/admin/dashboard");
      } else {
        router.push("/employee/dashboard");
      }
    } catch (error: any) {
      const message =
        error?.message ?? "Unable to login. Please try again.";
      toaster.create({
        title: "Login failed",
        description: message,
        type: "error",
      });
    } finally {
      setIsLoginLoading(false);
    }
  };

  const handleAdminSignup = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSignupLoading(true);
    try {
      const response = await axios.post("/api/auth/admin-signup", {
        name: adminName,
        email: adminEmail,
        password: adminPassword,
      });
      void response;

      const result = await signIn("credentials", {
        redirect: false,
        email: adminEmail,
        password: adminPassword,
      });

      if (result?.error) {
        toaster.create({
          title: "Signup failed",
          description: result.error,
          type: "error",
        });
        return;
      }

      toaster.create({
        title: "Admin account created",
        description: "You are now signed in as admin.",
        type: "success",
      });

      router.push("/admin/dashboard");
    } catch (error: any) {
      const message =
        error?.response?.data?.error?.message ??
        "Unable to create admin account. Please try again.";
      toaster.create({
        title: "Signup failed",
        description: message,
        type: "error",
      });
    } finally {
      setIsSignupLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-lg">
        <div className="mb-4 space-y-1">
          <h1 className="text-lg font-semibold">Officio Login</h1>
          <p className="text-sm text-muted-foreground">
            Choose your role to sign in or create the first admin.
          </p>
        </div>

        <div className="mb-4 inline-flex w-full rounded-md border border-border bg-muted p-1 text-sm">
          <button
            type="button"
            onClick={() => {
              setActiveTab(0);
              setIsAdminSignup(false);
            }}
            className={`flex-1 rounded-md px-3 py-1.5 ${
              activeTab === 0
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            Employee
          </button>
          <button
            type="button"
            onClick={() => setActiveTab(1)}
            className={`flex-1 rounded-md px-3 py-1.5 ${
              activeTab === 1
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            Admin
          </button>
        </div>

        {activeTab === 0 && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Email</label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none ring-0 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">
                Password
              </label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none ring-0 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              />
            </div>
            <button
              type="submit"
              disabled={isLoginLoading}
              className="inline-flex w-full items-center justify-center rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLoginLoading ? "Signing in..." : "Sign in as Employee"}
            </button>
          </form>
        )}

        {activeTab === 1 && (
          <div>
            <div className="mb-4 flex items-center justify-between gap-2">
              <p className="text-sm text-muted-foreground">
                {isAdminSignup
                  ? "Create the first admin account."
                  : "Sign in with your admin credentials."}
              </p>
              <button
                type="button"
                onClick={() => setIsAdminSignup((prev) => !prev)}
                className="text-sm font-medium text-primary hover:brightness-110"
              >
                {isAdminSignup
                  ? "Have an account? Login"
                  : "Need admin? Sign up"}
              </button>
            </div>

            {isAdminSignup ? (
              <form onSubmit={handleAdminSignup} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium">
                    Name
                  </label>
                  <input
                    type="text"
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none ring-0 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">
                    Email
                  </label>
                  <input
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none ring-0 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">
                    Password
                  </label>
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none ring-0 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSignupLoading}
                  className="inline-flex w-full items-center justify-center rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSignupLoading ? "Creating admin..." : "Sign up as Admin"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium">
                    Email
                  </label>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none ring-0 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">
                    Password
                  </label>
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none ring-0 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoginLoading}
                  className="inline-flex w-full items-center justify-center rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isLoginLoading ? "Signing in..." : "Sign in as Admin"}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

