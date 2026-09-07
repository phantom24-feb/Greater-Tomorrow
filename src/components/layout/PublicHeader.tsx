"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function PublicHeader() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setIsLoggedIn(!!data.user));
  }, []);

  // Render nothing until we know, and nothing at all once logged in —
  // navigation lives in the side nav instead once a session exists.
  if (isLoggedIn !== false) {
    return null;
  }

  return (
    <header className="sticky top-0 z-20 bg-navy">
      <div className="mx-auto flex max-w-[1160px] items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/35 font-display text-[15px] font-semibold text-white">
            GS
          </div>
          <span className="font-display text-lg font-semibold tracking-wide text-white">
            Greenfield Secondary School
          </span>
        </Link>
        <nav className="hidden items-center gap-7 sm:flex">
          <Link
            href="/announcements"
            className="text-[14.5px] font-medium text-white/80 transition-colors hover:text-white"
          >
            Announcements
          </Link>
          <Link
            href="/tuition"
            className="text-[14.5px] font-medium text-white/80 transition-colors hover:text-white"
          >
            Tuition
          </Link>
          <Link
            href="/books"
            className="text-[14.5px] font-medium text-white/80 transition-colors hover:text-white"
          >
            Books
          </Link>
          <Link
            href="/register"
            className="text-[14.5px] font-medium text-white/80 transition-colors hover:text-white"
          >
            Register
          </Link>
          <Link
            href="/login"
            className="rounded border border-white/40 px-4 py-[7px] text-[14.5px] font-medium text-white/80 transition-colors hover:bg-white hover:text-navy"
          >
            Login
          </Link>
        </nav>
      </div>
    </header>
  );
}
