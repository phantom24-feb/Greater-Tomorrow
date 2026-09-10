"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const navLinks = [
  { href: "/announcements", label: "Announcements" },
  { href: "/tuition", label: "Tuition" },
  { href: "/books", label: "Books" },
  { href: "/register", label: "Register" },
];

interface PublicHeaderProps {
  /**
   * Pass this when the caller already knows login state server-side
   * (e.g. HomeContent, via getCurrentUser()). When provided, this
   * component renders correctly on the very first paint with no
   * client-side check or flash of nothing.
   *
   * If omitted (older call sites not yet updated), falls back to a
   * client-side getSession() check — fine for a UI-only toggle, but
   * will show nothing until it resolves.
   */
  isLoggedIn?: boolean;
}

export default function PublicHeader({
  isLoggedIn: isLoggedInProp,
}: PublicHeaderProps) {
  const [isLoggedInState, setIsLoggedInState] = useState<boolean | null>(
    isLoggedInProp ?? null,
  );
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    // Server already told us — skip the client-side check entirely.
    if (isLoggedInProp !== undefined) return;

    const supabase = createClient();
    supabase.auth
      .getSession()
      .then(({ data }) => setIsLoggedInState(!!data.session?.user));
  }, [isLoggedInProp]);

  const isLoggedIn = isLoggedInProp ?? isLoggedInState;

  // Render nothing once logged in — navigation lives in the side nav instead.
  if (isLoggedIn !== false) {
    return null;
  }

  return (
    <header className="sticky top-0 z-20 bg-navy">
      <div className="mx-auto flex max-w-[1160px] items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="flex items-center gap-3"
          onClick={() => setMenuOpen(false)}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/35 font-display text-[15px] font-semibold text-white">
            GS
          </div>
          <span className="font-display text-lg font-semibold tracking-wide text-white">
            Greater Tomorrow School
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-7 sm:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[14.5px] font-medium text-white/80 transition-colors hover:text-white"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/login"
            className="rounded border border-white/40 px-4 py-[7px] text-[14.5px] font-medium text-white/80 transition-colors hover:bg-white hover:text-navy"
          >
            Login
          </Link>
        </nav>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          className="flex h-9 w-9 items-center justify-center rounded-md text-white sm:hidden"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-5 w-5"
          >
            {menuOpen ? (
              <path d="M6 6l12 12M18 6L6 18" />
            ) : (
              <path d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu panel */}
      {menuOpen && (
        <div className="border-t border-white/10 bg-navy px-6 py-4 sm:hidden">
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="rounded px-2 py-2.5 text-[15px] font-medium text-white/85 transition-colors hover:bg-white/10"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/login"
              onClick={() => setMenuOpen(false)}
              className="mt-2 rounded bg-white/10 px-2 py-2.5 text-center text-[15px] font-semibold text-white transition-colors hover:bg-white/20"
            >
              Login
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
