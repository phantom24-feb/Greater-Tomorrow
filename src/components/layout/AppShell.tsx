"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import SideNav from "./SideNav";

type Role = "admin" | "student" | null;

interface AppShellProps {
  role: Role;
  children: React.ReactNode;
}

// Pages that always render on their own, without the side nav —
// only the auth screens themselves, since you're never "logged in"
// while looking at them in practice.
const NO_SHELL_PATHS = ["/login", "/create-account"];

export default function AppShell({ role, children }: AppShellProps) {
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const skipShell = !role || NO_SHELL_PATHS.includes(pathname);

  if (skipShell) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-bgsoft">
      <SideNav
        role={role}
        mobileOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
      />

      {mobileNavOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 lg:hidden"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-3 border-b border-bordersoft bg-white px-4 py-3 lg:hidden">
          <button
            onClick={() => setMobileNavOpen(true)}
            aria-label="Open menu"
            className="flex h-9 w-9 items-center justify-center rounded-md text-navy hover:bg-bgsoft"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-5 w-5"
            >
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="font-display text-[15px] font-semibold text-navy">
            {role === "admin" ? "Admin Panel" : "Student Portal"}
          </span>
        </div>

        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
