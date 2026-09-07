"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  parseStudentCsv,
  validateRows,
  type ValidatedRow,
} from "@/lib/csv/parsestudents";

const TEMPLATE_HEADERS = [
  "First Name",
  "Last Name",
  "Other Name",
  "Date of Birth",
  "Gender",
  "Class Name",
  "Religion",
  "Address",
  "Previous School",
];

const TEMPLATE_EXAMPLE = [
  "Chidinma",
  "Okafor",
  "",
  "2012-04-18",
  "female",
  "JSS1",
  "Christianity",
  "14 Market Road, Port Harcourt",
  "Bright Stars Nursery/Primary",
];

function downloadTemplate() {
  const csv = [TEMPLATE_HEADERS.join(","), TEMPLATE_EXAMPLE.join(",")].join(
    "\n",
  );
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "student_import_template.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export default function AdminStudentImportPage() {
  const [rows, setRows] = useState<ValidatedRow[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    inserted: number;
    failed: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setResult(null);
    setFileName(file.name);
    setLoading(true);

    const supabase = createClient();

    const [{ data: classes }, parsedRows] = await Promise.all([
      supabase.from("classes").select("id, name, code"),
      parseStudentCsv(file),
    ]);

    const classMap = new Map(
      (classes ?? []).map((c) => [c.name.trim().toLowerCase(), c.id]),
    );

    const validated = validateRows(parsedRows, classMap);
    setRows(validated);
    setLoading(false);
  }

  async function handleImport() {
    const validRows = rows.filter((r) => r.errors.length === 0);
    if (validRows.length === 0) return;

    setLoading(true);
    setError(null);

    const supabase = createClient();

    // Admission numbers are generated per class, continuing from however
    // many students are already in that class. Track an offset per class
    // so multiple rows for the same class in this batch don't collide.
    const { data: classCodes } = await supabase
      .from("classes")
      .select("id, code");
    const codeByClassId = new Map(
      (classCodes ?? []).map((c) => [c.id, c.code as string | null]),
    );

    const { data: existingCounts } = await supabase
      .from("students")
      .select("class_id");
    const countByClassId = new Map<string, number>();
    (existingCounts ?? []).forEach((s) => {
      if (s.class_id)
        countByClassId.set(
          s.class_id,
          (countByClassId.get(s.class_id) ?? 0) + 1,
        );
    });

    const payload = validRows.map((r) => {
      const classId = r.class_id as string;
      const code = codeByClassId.get(classId);
      const currentCount = countByClassId.get(classId) ?? 0;
      countByClassId.set(classId, currentCount + 1);
      const admissionNo = `GT-${code}-${String(currentCount + 1).padStart(3, "0")}`;

      return {
        admission_no: admissionNo,
        first_name: r.first_name,
        last_name: r.last_name,
        other_name: r.other_name || null,
        date_of_birth: r.date_of_birth,
        gender: r.gender,
        class_id: classId,
        religion: r.religion || null,
        address: r.address || null,
        previous_school: r.previous_school || null,
        status: "active",
      };
    });

    const { error: insertError, data } = await supabase
      .from("students")
      .insert(payload)
      .select("id");

    setLoading(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    setResult({
      inserted: data?.length ?? 0,
      failed: rows.length - validRows.length,
    });
    setRows([]);
    setFileName(null);
  }

  const validCount = rows.filter((r) => r.errors.length === 0).length;
  const errorCount = rows.length - validCount;

  return (
    <div className="mx-auto max-w-[1000px] px-6 py-10">
      <a
        href="/admin/students"
        className="mb-4 inline-block text-[13.5px] font-medium text-oxblood hover:underline"
      >
        ← All students
      </a>
      <h1 className="mb-1 font-display text-2xl font-semibold text-navy">
        Import Students
      </h1>
      <p className="mb-7 text-[14.5px] text-muted">
        Upload a spreadsheet of already-enrolled students. Admission numbers are
        generated automatically (e.g. GT-JSS1-001) based on class and enrollment
        order — you don&apos;t need to include them in the file. Students can
        then create their own login at{" "}
        <span className="font-medium text-ink">/create-account</span> using
        their admission number and date of birth.
      </p>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <label className="inline-flex cursor-pointer items-center justify-center rounded bg-oxblood px-5 py-2.5 text-[14.5px] font-semibold text-white transition-all hover:bg-oxblood-dark active:scale-[0.97]">
          Choose CSV file
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
        <button
          onClick={downloadTemplate}
          className="text-[14px] font-medium text-oxblood hover:underline"
        >
          Download CSV template
        </button>
        {fileName && (
          <span className="text-[13.5px] text-muted">{fileName}</span>
        )}
      </div>

      {loading && <p className="text-[14px] text-muted">Processing…</p>}
      {error && <p className="text-[14px] text-oxblood">{error}</p>}

      {result && (
        <div className="mb-6 rounded-md border border-bordersoft bg-white p-4 text-[14.5px]">
          <span className="font-medium text-ink">
            {result.inserted} student(s) imported.
          </span>
          {result.failed > 0 && (
            <span className="ml-2 text-muted">
              {result.failed} row(s) were skipped due to errors.
            </span>
          )}
        </div>
      )}

      {rows.length > 0 && (
        <>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-[14px] text-muted">
              <span className="font-medium text-ink">{validCount}</span> ready
              to import
              {errorCount > 0 && (
                <>
                  {" · "}
                  <span className="font-medium text-oxblood">
                    {errorCount}
                  </span>{" "}
                  with errors
                </>
              )}
            </p>
            <button
              onClick={handleImport}
              disabled={validCount === 0 || loading}
              className="inline-flex items-center justify-center rounded bg-navy px-5 py-2.5 text-[14.5px] font-semibold text-white transition-all hover:bg-navy-ink active:scale-[0.97] disabled:opacity-50"
            >
              Import {validCount} student{validCount === 1 ? "" : "s"}
            </button>
          </div>

          <div className="overflow-x-auto rounded-md border border-bordersoft bg-white">
            <table className="w-full text-left text-[13.5px]">
              <thead>
                <tr className="border-b border-bordersoft bg-bgsoft text-ink">
                  <th className="px-4 py-2.5 font-medium">Row</th>
                  <th className="px-4 py-2.5 font-medium">Name</th>
                  <th className="px-4 py-2.5 font-medium">Class</th>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row.rowNumber}
                    className="border-b border-bordersoft last:border-0"
                  >
                    <td className="px-4 py-2.5 text-muted">{row.rowNumber}</td>
                    <td className="px-4 py-2.5">
                      {row.first_name} {row.last_name}
                    </td>
                    <td className="px-4 py-2.5">{row.class_name || "—"}</td>
                    <td className="px-4 py-2.5">
                      {row.errors.length === 0 ? (
                        <span className="text-[13px] font-medium text-green-700">
                          Ready
                        </span>
                      ) : (
                        <span className="text-[13px] font-medium text-oxblood">
                          {row.errors.join("; ")}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
