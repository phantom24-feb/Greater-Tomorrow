import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import StudentRosterTable, {
  type RosterStudent,
} from "@/components/admin/StudentRosterTable";

export default async function ClassStudentsPage({
  params,
}: {
  params: Promise<{ classId: string }>;
}) {
  const { classId } = await params;
  const supabase = await createClient();

  const { data: classInfo } = await supabase
    .from("classes")
    .select("id, name")
    .eq("id", classId)
    .single();

  if (!classInfo) {
    notFound();
  }

  const { data: students } = await supabase
    .from("students")
    .select(
      "id, admission_no, first_name, last_name, other_name, gender, date_of_birth, status, photo_url, guardians(id, relationship, full_name, phone, email)",
    )
    .eq("class_id", classId)
    .order("last_name");

  const rosterStudents: RosterStudent[] = (students ?? []).map((s) => ({
    ...s,
    guardians: s.guardians ?? [],
  }));

  return (
    <div className="mx-auto max-w-[1000px] px-6 py-10">
      <Link
        href="/admin/students"
        className="mb-4 inline-block text-[13.5px] font-medium text-oxblood hover:underline"
      >
        ← All classes
      </Link>
      <h1 className="mb-1 font-display text-2xl font-semibold text-navy">
        {classInfo.name}
      </h1>
      <p className="mb-7 text-[14.5px] text-muted">
        {rosterStudents.length} student{rosterStudents.length === 1 ? "" : "s"}{" "}
        in this class. Click a photo to upload or change it; click &quot;Details&quot; for
        guardian info.
      </p>

      <StudentRosterTable initialStudents={rosterStudents} />
    </div>
  );
}
