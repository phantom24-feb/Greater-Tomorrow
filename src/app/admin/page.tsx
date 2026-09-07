import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { NavIcon, type NavIconName } from "@/components/icons/NavIcons";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [
    { count: studentCount },
    { count: pendingCount },
    { count: announcementCount },
  ] = await Promise.all([
    supabase.from("students").select("*", { count: "exact", head: true }),
    supabase
      .from("registrations")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase.from("announcements").select("*", { count: "exact", head: true }),
  ]);

  const stats = [
    { label: "Total Students", value: studentCount ?? 0 },
    { label: "Pending Registrations", value: pendingCount ?? 0 },
    { label: "Announcements", value: announcementCount ?? 0 },
  ];

  const shortcuts: { label: string; href: string; icon: NavIconName }[] = [
    { label: "Import Students", href: "/admin/students", icon: "students" },
    { label: "Upload Results", href: "/admin/results", icon: "results" },
    { label: "Manage Fees", href: "/admin/fees", icon: "tuition" },
    { label: "Manage Books", href: "/admin/books", icon: "books" },
    {
      label: "Post Announcement",
      href: "/admin/announcements",
      icon: "announcements",
    },
    {
      label: "Review Registrations",
      href: "/admin/registrations",
      icon: "register",
    },
  ];

  return (
    <div className="mx-auto max-w-[1000px] px-6 py-10">
      <h1 className="mb-1 font-display text-2xl font-semibold text-navy">
        Dashboard
      </h1>
      <p className="mb-8 text-[14.5px] text-muted">
        Overview of the school portal.
      </p>

      <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-md border border-bordersoft bg-white p-5"
          >
            <p className="mb-1 text-[13px] text-muted">{stat.label}</p>
            <p className="font-display text-3xl font-semibold text-navy">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <h2 className="mb-4 font-display text-lg font-semibold text-navy">
        Quick actions
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {shortcuts.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="flex items-center gap-3 rounded-md border border-bordersoft bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-oxblood hover:shadow-[0_8px_20px_rgba(20,33,61,0.08)] active:scale-[0.98]"
          >
            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-bgsoft text-navy">
              <span className="h-[18px] w-[18px]">
                <NavIcon name={s.icon} />
              </span>
            </span>
            <span className="text-[14.5px] font-medium text-ink">
              {s.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
