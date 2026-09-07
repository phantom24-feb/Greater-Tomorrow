import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

type IconName = "results" | "tuition" | "register" | "books";

interface QuickLink {
  label: string;
  description: string;
  href: string;
  icon: IconName;
}

const quickLinks: QuickLink[] = [
  {
    label: "Check Results",
    description: "View term results by session",
    href: "/results",
    icon: "results",
  },
  {
    label: "View Tuition",
    description: "Fees by class and term",
    href: "/tuition",
    icon: "tuition",
  },
  {
    label: "Online Registration",
    description: "Apply for admission",
    href: "/register",
    icon: "register",
  },
  {
    label: "View Books",
    description: "Recommended books by class",
    href: "/books",
    icon: "books",
  },
];

interface IconProps {
  name: IconName;
}

function Icon({ name }: IconProps) {
  switch (name) {
    case "results":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          className="h-full w-full"
        >
          <path d="M6 3h9l4 4v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
          <path d="M14 3v4a1 1 0 0 0 1 1h4" />
          <path d="M8.5 13.5l2 2 4-4.5" />
        </svg>
      );
    case "tuition":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          className="h-full w-full"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M9.5 9.2c0-1.1 1-2 2.5-2s2.5.7 2.5 1.7c0 2.4-5 1.6-5 4.3 0 1.1 1.1 1.9 2.5 1.9s2.5-.8 2.5-1.9" />
          <path d="M12 6v1.3M12 16.7V18" />
        </svg>
      );
    case "register":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          className="h-full w-full"
        >
          <rect x="3.5" y="5" width="17" height="14" rx="1.5" />
          <circle cx="9" cy="10.3" r="2" />
          <path d="M5.8 16.5c.6-1.7 1.9-2.6 3.2-2.6s2.6.9 3.2 2.6" />
          <path d="M15 9.5h3.2M15 12.5h3.2" />
        </svg>
      );
    case "books":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          className="h-full w-full"
        >
          <path d="M4 5.5C5.5 4.6 7.5 4.2 9 4.5c1 .2 1.8.6 2.5 1.1V19c-.7-.5-1.5-.9-2.5-1.1-1.5-.3-3.5.1-5 1V5.5Z" />
          <path d="M20 5.5c-1.5-.9-3.5-1.3-5-1-1 .2-1.8.6-2.5 1.1V19c.7-.5 1.5-.9 2.5-1.1 1.5-.3 3.5.1 5 1V5.5Z" />
        </svg>
      );
    default:
      return null;
  }
}

export default async function HomeContent() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: latestAnnouncement } = await supabase
    .from("announcements")
    .select("id, title, created_at")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (
    <div className="bg-white text-ink">
      {!user && (
        <header className="sticky top-0 z-20 bg-navy">
          <div className="mx-auto flex max-w-[1160px] items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              {/* Replace with an <img> of the real school crest/logo */}
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/35 font-display text-[15px] font-semibold text-white">
                GS
              </div>
              <span className="font-display text-lg font-semibold tracking-wide text-white">
                Greenfield Secondary School
              </span>
            </div>
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
      )}

      {/* Hero */}
      <section className="bg-navy px-6 pb-24 pt-20">
        <div className="mx-auto max-w-[720px] animate-hero-rise text-center">
          <p className="mb-4 text-sm font-medium text-white/60">
            Session 2025/2026
          </p>
          <h1 className="mb-5 font-display text-[clamp(32px,4.4vw,48px)] font-semibold leading-[1.18] text-white">
            Grounded in discipline, built for what comes next.
          </h1>
          <p className="mx-auto mb-9 max-w-[480px] text-[17px] leading-relaxed text-white/80">
            Check results, review tuition, and apply for admission — all in one
            place.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded bg-oxblood px-6 py-3 text-[15px] font-semibold text-white transition-all hover:-translate-y-px hover:bg-oxblood-dark hover:shadow-[0_6px_16px_rgba(92,26,36,0.35)] active:translate-y-0 active:scale-[0.97]"
            >
              Apply for admission
            </Link>
          </div>
        </div>
      </section>

      {/* Notice board */}
      <section id="notice-board" className="bg-white px-6 py-18">
        <div className="mx-auto max-w-[760px]">
          <h2 className="mb-7 font-display text-2xl font-semibold text-navy">
            Notice board
          </h2>

          {latestAnnouncement ? (
            <div className="border-y border-bordersoft border-l-[3px] border-l-oxblood px-[18px] py-[18px]">
              <p className="text-[15.5px] font-medium text-ink">
                {latestAnnouncement.title}
              </p>
              <p className="mt-1 text-[13.5px] text-muted">
                {new Date(latestAnnouncement.created_at).toLocaleDateString()}
              </p>
            </div>
          ) : (
            <p className="border-y border-bordersoft px-[18px] py-[18px] text-[14.5px] text-muted">
              No announcements yet.
            </p>
          )}

          <Link
            href="/announcements"
            className="mt-6 inline-flex items-center justify-center rounded border border-navy/20 px-6 py-3 text-[15px] font-semibold text-navy transition-all hover:border-navy hover:bg-bgsoft active:scale-[0.97]"
          >
            See all announcements
          </Link>
        </div>
      </section>

      {/* Quick access */}
      <section className="bg-bgsoft px-6 py-18 pb-20">
        <div className="mx-auto max-w-[1000px]">
          <h2 className="mb-7 font-display text-2xl font-semibold text-navy">
            Quick access
          </h2>
          <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2 lg:grid-cols-4">
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex flex-col gap-2.5 rounded-md bg-navy p-7 transition-all hover:-translate-y-[3px] hover:bg-oxblood hover:shadow-[0_10px_24px_rgba(20,33,61,0.25)] active:translate-y-[-1px] active:scale-[0.98]"
              >
                <span className="h-[30px] w-[30px] text-white">
                  <Icon name={link.icon} />
                </span>
                <span className="font-display text-[16.5px] font-semibold text-white">
                  {link.label}
                </span>
                <span className="text-[13px] leading-snug text-white/70">
                  {link.description}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-navy-ink px-6 py-10 text-white/70">
        <div className="mx-auto flex max-w-[1160px] flex-wrap items-start justify-between gap-6">
          <div>
            <div className="mb-1.5 font-display text-base text-white">
              Greenfield Secondary School
            </div>
            <p className="text-[13.5px]">
              12 Aggrey Road, Port Harcourt, Rivers State
            </p>
          </div>
          <div className="flex gap-5">
            <Link
              href="/tuition"
              className="text-[13.5px] text-white/70 hover:text-white"
            >
              Tuition
            </Link>
            <Link
              href="/books"
              className="text-[13.5px] text-white/70 hover:text-white"
            >
              Books
            </Link>
            <Link
              href="/register"
              className="text-[13.5px] text-white/70 hover:text-white"
            >
              Registration
            </Link>
            <Link
              href="/login"
              className="text-[13.5px] text-white/70 hover:text-white"
            >
              Login
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
