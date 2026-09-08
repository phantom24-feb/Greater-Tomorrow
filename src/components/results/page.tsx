import { redirect } from "next/navigation";
import dynamic from "next/dynamic";
import { createClient } from "@/lib/supabase/server";
import type { ComponentProps } from "react";

const ResultsView = dynamic(() => import("@/components/results/ResultsView"));
type ResultRow = ComponentProps<typeof ResultsView>["results"][number];

export default async function ResultsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: student } = await supabase
    .from("students")
    .select("id, first_name, last_name, admission_no, classes ( name )")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!student) {
    return (
      <div className="mx-auto max-w-[700px] px-6 py-14">
        <p className="text-[14.5px] text-muted">
          No student record is linked to this account. If you believe this is a
          mistake, please contact the school office.
        </p>
      </div>
    );
  }

  const { data: results } = await supabase
    .from("results")
    .select("id, term, session, subject, score, grade, remarks")
    .eq("student_id", student.id)
    .order("session", { ascending: false });

  return (
    <ResultsView
      studentName={`${student.first_name} ${student.last_name}`}
      admissionNo={student.admission_no}
      className={
        (student.classes as { name: string }[] | null)?.[0]?.name ?? "—"
      }
      results={(results ?? []) as ResultRow[]}
    />
  );
}
