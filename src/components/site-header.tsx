"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Profile = {
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
};

export function SiteHeader() {
  const pathname = usePathname();
  const [profile, setProfile] = useState<Profile | null>(null);
  useEffect(() => {
    createClient()
      .auth.getUser()
      .then(async ({ data }) => {
        if (!data.user) return;
        const { data: staff } = await createClient()
          .from("staff_profiles")
          .select("first_name,last_name,avatar_url")
          .eq("id", data.user.id)
          .maybeSingle();
        setProfile(staff);
      });
  }, []);
  const initials =
    `${profile?.first_name?.[0] ?? ""}${profile?.last_name?.[0] ?? ""}`.toUpperCase() ||
    "GT";
  const isAdmin = pathname.startsWith("/admin");
  return (
    <header className="relative z-10 mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 sm:py-6 lg:px-10">
      <Link href="/" className="flex min-w-0 items-center gap-2 sm:gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#d94848] text-xs font-bold text-white sm:h-10 sm:w-10 sm:text-sm">
          GT
        </span>
        <span className="max-w-[190px] truncate text-[10px] font-bold uppercase tracking-[.12em] sm:max-w-none sm:text-sm sm:tracking-[.16em]">
          GREATER TOMORROW SCHOOLS
        </span>
      </Link>
      <nav className="flex w-full items-center justify-between gap-2 text-xs font-semibold sm:w-auto sm:gap-3 sm:text-sm">
        <NavLink href="/" label="Home" active={pathname === "/"} />
        <NavLink
          href="/info"
          label="School life"
          active={pathname === "/info"}
        />
        <NavLink
          href="/results"
          label="Results"
          active={pathname === "/results"}
        />
        <Link
          href="/admin"
          aria-label="Staff profile"
          className="relative flex items-center gap-2 rounded-full px-3 py-2 sm:px-4 sm:py-2.5"
        >
          <span className="relative z-10 flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-white text-[10px] font-bold text-[#123b70]">
            {profile?.avatar_url ? (
              <Image
                src={profile.avatar_url}
                alt="Staff profile"
                width={28}
                height={28}
                className="h-full w-full object-cover"
              />
            ) : (
              initials
            )}
          </span>
          <span className="relative z-10 hidden sm:inline">
            {profile ? "Profile" : "Staff login"}
          </span>
          {isAdmin && (
            <motion.span
              layoutId="active-navigation"
              className="absolute inset-0 rounded-full bg-[#d94848]"
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
            />
          )}
        </Link>
      </nav>
    </header>
  );
}

function NavLink({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className="relative rounded-full px-3 py-2 sm:px-4 sm:py-2.5"
    >
      <span className="relative z-10">{label}</span>
      {active && (
        <motion.span
          layoutId="active-navigation"
          className="absolute inset-0 rounded-full bg-[#d94848]"
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
        />
      )}
    </Link>
  );
}
