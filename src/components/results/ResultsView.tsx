"use client";

import { useMemo, useState } from "react";

interface ResultRow {
  id: string;
  term: string;
  session: string;
  subject: string;
  score: number | null;
  grade: string | null;
  remarks: string | null;
}

interface ResultsViewProps {
  studentName: string;
  admissionNo: string;
  className: string;
  results: ResultRow[];
}

const TERM_ORDER = ["First Term", "Second Term", "Third Term"];

export default function ResultsView({
  studentName,
  admissionNo,
  className,
  results,
}: ResultsViewProps) {
  const sessions = useMemo(
    () =>
      Array.from(new Set(results.map((r) => r.session)))
        .sort()
        .reverse(),
    [results],
  );
  const [selectedSession, setSelectedSession] = useState(sessions[0] ?? "");

  const sessionResults = results.filter((r) => r.session === selectedSession);
  const byTerm = TERM_ORDER.map((term) => ({
    term,
    rows: sessionResults.filter((r) => r.term === term),
  })).filter((group) => group.rows.length > 0);

  return (
    <div className="mx-auto max-w-[800px] px-6 py-10">
      <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="mb-1 font-display text-2xl font-semibold text-navy">
            Results
          </h1>
          <p className="text-[14.5px] text-muted">
            {studentName} · {admissionNo} · {className}
          </p>
        </div>
        {sessions.length > 0 && (
          <div>
            <label className="mb-1.5 block text-[12.5px] font-medium text-ink">
              Session
            </label>
            <select
              value={selectedSession}
              onChange={(e) => setSelectedSession(e.target.value)}
              className="rounded border border-bordersoft px-3.5 py-2 text-[14px] outline-none focus:border-navy"
            >
              {sessions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {results.length === 0 ? (
        <div className="rounded-md border border-bordersoft bg-white p-8 text-center">
          <p className="text-[14.5px] text-muted">
            No results are available yet. Check back once the school has
            published them.
          </p>
        </div>
      ) : byTerm.length === 0 ? (
        <div className="rounded-md border border-bordersoft bg-white p-8 text-center">
          <p className="text-[14.5px] text-muted">
            No results found for {selectedSession}.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {byTerm.map((group) => (
            <div key={group.term}>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold text-navy">
                  {group.term}
                </h2>
                <button
                  onClick={() => window.print()}
                  className="text-[13px] font-medium text-oxblood hover:underline print:hidden"
                >
                  Print
                </button>
              </div>
              <div className="overflow-x-auto rounded-md border border-bordersoft bg-white">
                <table className="w-full text-left text-[13.5px]">
                  <thead>
                    <tr className="border-b border-bordersoft bg-bgsoft text-ink">
                      <th className="px-4 py-2.5 font-medium">Subject</th>
                      <th className="px-4 py-2.5 font-medium">Score</th>
                      <th className="px-4 py-2.5 font-medium">Grade</th>
                      <th className="px-4 py-2.5 font-medium">Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.rows.map((r) => (
                      <tr
                        key={r.id}
                        className="border-b border-bordersoft last:border-0"
                      >
                        <td className="px-4 py-2.5">{r.subject}</td>
                        <td className="px-4 py-2.5">{r.score ?? "—"}</td>
                        <td className="px-4 py-2.5">{r.grade ?? "—"}</td>
                        <td className="px-4 py-2.5">{r.remarks ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="mt-8 text-[12.5px] text-muted">
        Note: a proper printable report card with the school logo and letterhead
        is coming in a later step — the Print button above uses your
        browser&apos;s basic print for now.
      </p>
    </div>
  );
}
