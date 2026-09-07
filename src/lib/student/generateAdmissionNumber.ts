import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Generates a unique admission number in the format GT-<CLASSCODE>-<SEQ>,
 * e.g. GT-JSS1-001. The sequence is based on how many students are
 * currently in that class, so numbers stay in enrollment order per class.
 */
export async function generateAdmissionNumber(
  supabase: SupabaseClient,
  classId: string,
  offset = 0,
): Promise<string> {
  const { data: classInfo, error: classError } = await supabase
    .from("classes")
    .select("code")
    .eq("id", classId)
    .single();

  if (classError || !classInfo?.code) {
    throw new Error("This class has no admission code configured.");
  }

  const { count } = await supabase
    .from("students")
    .select("*", { count: "exact", head: true })
    .eq("class_id", classId);

  const nextNumber = (count ?? 0) + 1 + offset;
  const sequence = String(nextNumber).padStart(3, "0");

  return `GT-${classInfo.code}-${sequence}`;
}
