import { createClient } from "@/lib/supabase/server";
import { StudentDirectory } from "@/components/student-directory";

type Student = {
  id: string;
  full_name: string;
  reg_number: string;
  gender: string | null;
  passport_url: string | null;
  class_name: string;
  section: string;
};

export default async function StudentsPage() {
  const supabase = await createClient();
  const { data: students, error } = await supabase
    .from("student_directory")
    .select("*")
    .order("full_name");

  return (
    <main className="paper-grid min-h-screen px-6 pb-24 pt-12 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <button
          onClick={() => history.back()}
          className="mb-8 text-sm font-bold text-[#d94848]"
        >
          ← Back
        </button>
        <p className="text-xs font-bold uppercase tracking-[.3em] text-[#d94848]">
          Student directory
        </p>
        <h1 className="mt-3 text-5xl font-bold tracking-tight text-[#123b70]">
          Every learner,
          <br />
          <span className="text-[#d94848]">clearly seen.</span>
        </h1>
        {error ? (
          <p className="mt-8 rounded-xl bg-[#d94848] p-5 text-white">
            {error.message}
          </p>
        ) : (
          <StudentDirectory students={(students as Student[]) ?? []} />
        )}
        {!error && !students?.length && (
          <p className="mt-8 text-[#123b70]/70">
            No student profiles have been added yet.
          </p>
        )}
      </div>
    </main>
  );
}
