"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  parseResultsCsv,
  validateResultRows,
  type ValidatedResultRow,
} from "@/lib/csv/parseResults";

const TEMPLATE_HEADERS = [
  "Admission No",
  "Subject",
  "Score",
  "Grade",
  "Remarks",
  "Term",
  "Session",
];
const TEMPLATE_EXAMPLE = [
  "GS/2023/014",
  "Mathematics",
  "78",
  "B2",
  "Good effort",
  "First Term",
  "2025/2026",
];

function downloadTemplate() {
  const csv = [TEMPLATE_HEADERS.join(","), TEMPLATE_EXAMPLE.join(",")].join(
    "\n",
  );
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "results_import_template.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export default function AdminResultsPage() {
  const [rows, setRows] = useState<ValidatedResultRow[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [importResult, setImportResult] = useState<{
    inserted: number;
    failed: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [publishTerm, setPublishTerm] = useState("First Term");
  const [publishSession, setPublishSession] = useState("2025/2026");
  const [publishList, setPublishList] = useState("");
  const [publishLoading, setPublishLoading] = useState(false);
  const [publishMessage, setPublishMessage] = useState<string | null>(null);

  const supabase = createClient();

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setImportResult(null);
    setFileName(file.name);
    setLoading(true);

    const [{ data: students }, parsedRows] = await Promise.all([
      supabase.from("students").select("id, admission_no"),
      parseResultsCsv(file),
    ]);

    const studentMap = new Map(
      (students ?? []).map((s) => [s.admission_no, s.id]),
    );
    setRows(validateResultRows(parsedRows, studentMap));
    setLoading(false);
  }

  async function handleImport() {
    const validRows = rows.filter((r) => r.errors.length === 0);
    if (validRows.length === 0) return;

    setLoading(true);
    setError(null);

    const payload = validRows.map((r) => ({
      student_id: r.student_id,
      term: r.term.trim(),
      session: r.session.trim(),
      subject: r.subject.trim(),
      score: r.score ? Number(r.score) : null,
      grade: r.grade?.trim() || null,
      remarks: r.remarks?.trim() || null,
      is_published: false,
    }));

    const { error: insertError, data } = await supabase
      .from("results")
      .upsert(payload, { onConflict: "student_id,term,session,subject" })
      .select("id");

    setLoading(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    setImportResult({
      inserted: data?.length ?? 0,
      failed: rows.length - validRows.length,
    });
    setRows([]);
    setFileName(null);
  }

  async function handlePublish() {
    setPublishMessage(null);
    setPublishLoading(true);

    const admissionNos = publishList
      .split(/[\n,]/)
      .map((s) => s.trim())
      .filter(Boolean);

    if (admissionNos.length === 0) {
      setPublishMessage("Enter at least one admission number.");
      setPublishLoading(false);
      return;
    }

    const { data: students } = await supabase
      .from("students")
      .select("id")
      .in("admission_no", admissionNos);
    const studentIds = (students ?? []).map((s) => s.id);

    const { error: publishError } = await supabase
      .from("results")
      .update({ is_published: true })
      .eq("term", publishTerm)
      .eq("session", publishSession)
      .in("student_id", studentIds);

    setPublishLoading(false);

    if (publishError) {
      setPublishMessage(publishError.message);
      return;
    }

    setPublishMessage(`Published results for ${studentIds.length} student(s).`);
    setPublishList("");
  }

  const validCount = rows.filter((r) => r.errors.length === 0).length;
  const errorCount = rows.length - validCount;

  return (
    <div className="mx-auto max-w-[1000px] px-6 py-10">
      <h1 className="mb-1 font-display text-2xl font-semibold text-navy">
        Upload Results
      </h1>
      <p className="mb-7 text-[14.5px] text-muted">
        Upload a class&apos;s results in one file. New uploads stay hidden from
        students until published below.
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

      {importResult && (
        <div className="mb-6 rounded-md border border-bordersoft bg-white p-4 text-[14.5px]">
          <span className="font-medium text-ink">
            {importResult.inserted} result row(s) uploaded (unpublished).
          </span>
          {importResult.failed > 0 && (
            <span className="ml-2 text-muted">
              {importResult.failed} row(s) were skipped due to errors.
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
              Import {validCount} result{validCount === 1 ? "" : "s"}
            </button>
          </div>

          <div className="mb-10 overflow-x-auto rounded-md border border-bordersoft bg-white">
            <table className="w-full text-left text-[13.5px]">
              <thead>
                <tr className="border-b border-bordersoft bg-bgsoft text-ink">
                  <th className="px-4 py-2.5 font-medium">Row</th>
                  <th className="px-4 py-2.5 font-medium">Admission No</th>
                  <th className="px-4 py-2.5 font-medium">Subject</th>
                  <th className="px-4 py-2.5 font-medium">Score</th>
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
                    <td className="px-4 py-2.5">{row.admission_no || "—"}</td>
                    <td className="px-4 py-2.5">{row.subject}</td>
                    <td className="px-4 py-2.5">{row.score || "—"}</td>
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

      <div className="rounded-md border border-bordersoft bg-white p-6">
        <h2 className="mb-1 font-display text-lg font-semibold text-navy">
          Publish Results
        </h2>
        <p className="mb-5 text-[14px] text-muted">
          Uploaded results stay hidden until published. Paste the admission
          numbers of students who should see their results (e.g. those who have
          paid).
        </p>

        <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-[13.5px] font-medium text-ink">
              Term
            </label>
            <select
              value={publishTerm}
              onChange={(e) => setPublishTerm(e.target.value)}
              className="w-full rounded border border-bordersoft px-3.5 py-2.5 text-[15px] outline-none focus:border-navy"
            >
              <option>First Term</option>
              <option>Second Term</option>
              <option>Third Term</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-[13.5px] font-medium text-ink">
              Session
            </label>
            <input
              type="text"
              value={publishSession}
              onChange={(e) => setPublishSession(e.target.value)}
              className="w-full rounded border border-bordersoft px-3.5 py-2.5 text-[15px] outline-none focus:border-navy"
            />
          </div>
        </div>

        <label className="mb-1.5 block text-[13.5px] font-medium text-ink">
          Admission numbers to publish (comma or new line separated)
        </label>
        <textarea
          rows={4}
          value={publishList}
          onChange={(e) => setPublishList(e.target.value)}
          placeholder={"GS/2023/014\nGS/2023/015"}
          className="mb-4 w-full resize-none rounded border border-bordersoft px-3.5 py-2.5 text-[15px] outline-none focus:border-navy"
        />

        {publishMessage && (
          <p className="mb-4 text-[13.5px] text-ink">{publishMessage}</p>
        )}

        <button
          onClick={handlePublish}
          disabled={publishLoading}
          className="inline-flex items-center justify-center rounded bg-oxblood px-5 py-2.5 text-[14.5px] font-semibold text-white transition-all hover:bg-oxblood-dark active:scale-[0.97] disabled:opacity-60"
        >
          {publishLoading ? "Publishing…" : "Publish results"}
        </button>
      </div>
    </div>
  );
}
