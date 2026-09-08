import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AdminStudentsPage() {
  const supabase = await createClient();

  const [{ data: classes }, { data: students }] = await Promise.all([
    supabase.from("classes").select("id, name, level").order("level"),
    supabase.from("students").select("class_id"),
  ]);

  const counts = new Map<string, number>();
  (students ?? []).forEach((s) => {
    if (s.class_id) counts.set(s.class_id, (counts.get(s.class_id) ?? 0) + 1);
  });

  return (
    <div className="mx-auto max-w-[1000px] px-6 py-10">
      <div className="mb-7 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="mb-1 font-display text-2xl font-semibold text-navy">
            Students
          </h1>
          <p className="text-[14.5px] text-muted">
            Select a class to view its students.
          </p>
        </div>
        <Link
          href="/admin/students/import"
          className="inline-flex items-center justify-center rounded bg-oxblood px-5 py-2.5 text-[14.5px] font-semibold text-white transition-all hover:bg-oxblood-dark active:scale-[0.97]"
        >
          Import students
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(classes ?? []).map((c) => {
          const count = counts.get(c.id) ?? 0;
          return (
            <Link
              key={c.id}
              href={`/admin/students/${c.id}`}
              className="flex items-center justify-between rounded-md border border-bordersoft bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-oxblood hover:shadow-[0_8px_20px_rgba(20,33,61,0.08)] active:scale-[0.98]"
            >
              <span className="font-display text-[16px] font-semibold text-navy">
                {c.name}
              </span>
              <span className="text-[13px] text-muted">
                {count} student{count === 1 ? "" : "s"}
              </span>
            </Link>
          );
        })}
        {(classes ?? []).length === 0 && (
          <p className="text-[14px] text-muted">
            No classes found. Check that schema.sql seed data ran.
          </p>
        )}
      </div>
    </div>
  );
}
