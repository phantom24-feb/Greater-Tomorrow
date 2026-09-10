"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { NavIcon, type NavIconName } from "@/components/icons/NavIcons";

interface NavItem {
  label: string;
  href: string;
  icon: NavIconName;
}

const studentItems: NavItem[] = [
  { label: "Account", href: "/account", icon: "account" },
  { label: "Check Results", href: "/results", icon: "results" },
  { label: "View Tuition", href: "/tuition", icon: "tuition" },
  { label: "View Books", href: "/books", icon: "books" },
  { label: "Settings", href: "/settings", icon: "settings" },
];

const adminItems: NavItem[] = [
  { label: "Home", href: "/", icon: "home" },
  { label: "Dashboard", href: "/admin", icon: "dashboard" },
  { label: "Students", href: "/admin/students", icon: "students" },
  { label: "Results", href: "/admin/results", icon: "results" },
  { label: "Fees", href: "/admin/fees", icon: "tuition" },
  { label: "Books", href: "/admin/books", icon: "books" },
  {
    label: "Announcements",
    href: "/admin/announcements",
    icon: "announcements",
  },
  { label: "Registrations", href: "/admin/registrations", icon: "register" },
  { label: "Account", href: "/account", icon: "account" },
  { label: "Settings", href: "/settings", icon: "settings" },
];

interface SideNavProps {
  role: "admin" | "student";
  mobileOpen: boolean;
  onClose: () => void;
}

export default function SideNav({ role, mobileOpen, onClose }: SideNavProps) {
  const pathname = usePathname();
  const items = role === "admin" ? adminItems : studentItems;

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut({ scope: "local" });
    window.location.assign("/login");
  }

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-30 flex w-[248px] flex-shrink-0 flex-col bg-navy transition-transform duration-200 lg:static lg:translate-x-0 ${
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex items-center gap-2.5 px-6 py-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/35 font-display text-[13px] font-semibold text-white">
          GS
        </div>
        <span className="font-display text-[15px] font-semibold text-white">
          {role === "admin" ? "Admin Panel" : "Student Portal"}
        </span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3">
        {items.map((item) => {
          const active =
            item.href === "/admin"
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-[14.5px] font-medium transition-colors ${
                active
                  ? "bg-oxblood text-white"
                  : "text-white/75 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span className="h-[18px] w-[18px] flex-shrink-0">
                <NavIcon name={item.icon} />
              </span>
              {item.label}
            </Link>
          );
        })}
        {role === "admin" && (
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 rounded-md px-3 py-2.5 text-left text-[14.5px] font-medium text-white/75 transition-colors hover:bg-white/10 hover:text-white"
          >
            <span className="h-[18px] w-[18px] flex-shrink-0">
              <NavIcon name="logout" />
            </span>
            Log out
          </button>
        )}
      </nav>
    </aside>
  );
}
