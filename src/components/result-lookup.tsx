"use client";

import { FormEvent, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type SchoolClass = { id: number; name: string; section: string };
type Student = { id: string; full_name: string };
type Result = {
  student_name: string;
  class_name: string;
  pdf_url: string | null;
};

export function ResultLookup() {
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [className, setClassName] = useState("");
  const [section, setSection] = useState("");
  const [status, setStatus] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  useEffect(() => {
    createClient()
      .from("classes")
      .select("id,name,section")
      .order("name")
      .then(({ data }) => setClasses(data ?? []));
  }, []);
  async function loadStudents(nextClass: string, nextSection: string) {
    setClassName(nextClass);
    setStudents([]);
    setStatus("");
    if (!nextClass || !nextSection) return;
    const { data, error } = await createClient().rpc(
      "list_students_for_result",
      { lookup_class_name: nextClass, lookup_section: nextSection },
    );
    if (error) {
      setStatus(
        "Student names are unavailable until the latest Supabase migration is run.",
      );
      return;
    }
    setStudents(data ?? []);
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("Checking result...");
    setResult(null);
    const form = new FormData(event.currentTarget);
    const { data, error } = await createClient().rpc("lookup_result", {
      lookup_class_name: form.get("class_name"),
      lookup_section: form.get("section"),
      lookup_student_id: form.get("student_id"),
      lookup_session: form.get("session"),
      lookup_term: form.get("term"),
      lookup_pin: form.get("pin"),
    });
    if (error || !data?.[0]) {
      setStatus("Incorrect PIN or no result found for this student.");
      return;
    }
    setStatus("");
    setResult(data[0]);
  }
  return (
    <div className="rounded-3xl bg-[#123b70] p-7 text-white shadow-[10px_10px_0_#d94848] sm:p-10">
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Find a report</h2>
        <span className="text-2xl text-[#d94848]">↘</span>
      </div>
      <form onSubmit={submit} className="space-y-5">
        <label className="block text-sm">
          Section
          <select
            required
            name="section"
            value={section}
            onChange={(event) => {
              setSection(event.target.value);
              setStudents([]);
              setClassName("");
            }}
            className="mt-2 w-full rounded-lg border border-white/30 bg-[#123b70] px-4 py-3"
          >
            <option value="">Select section</option>
            <option value="nursery">Nursery</option>
            <option value="primary">Primary</option>
            <option value="secondary">Secondary</option>
          </select>
        </label>
        <label className="block text-sm">
          Class
          <select
            required
            name="class_name"
            value={className}
            disabled={!section}
            onChange={(event) => loadStudents(event.target.value, section)}
            className="mt-2 w-full rounded-lg border border-white/30 bg-[#123b70] px-4 py-3 disabled:opacity-60"
          >
            <option value="">
              {section ? "Select class" : "Select section first"}
            </option>
            {classes
              .filter((item) => item.section === section)
              .map((item) => (
                <option key={item.id} value={item.name}>
                  {item.name}
                </option>
              ))}
          </select>
        </label>
        <label className="block text-sm">
          Student name
          <select
            required
            name="student_id"
            disabled={!className}
            className="mt-2 w-full rounded-lg border border-white/30 bg-[#123b70] px-4 py-3 disabled:opacity-60"
          >
            <option value="">
              {className ? "Select student" : "Select class first"}
            </option>
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.full_name}
              </option>
            ))}
          </select>
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            Session year
            <select
              required
              name="session"
              className="mt-2 w-full rounded-lg border border-white/30 bg-[#123b70] px-4 py-3"
            >
              <option value="">Select year</option>
              {Array.from({ length: 6 }, (_, index) => 2025 + index).map(
                (year) => (
                  <option key={year} value={`${year}/${year + 1}`}>
                    {year}/{year + 1}
                  </option>
                ),
              )}
            </select>
          </label>
          <label className="block text-sm">
            Term
            <select
              required
              name="term"
              className="mt-2 w-full rounded-lg border border-white/30 bg-[#123b70] px-4 py-3"
            >
              <option>First Term</option>
              <option>Second Term</option>
              <option>Third Term</option>
            </select>
          </label>
        </div>
        <label className="block text-sm">
          Student PIN
          <input
            required
            name="pin"
            type="password"
            inputMode="numeric"
            className="mt-2 w-full rounded-lg border border-white/30 bg-transparent px-4 py-3 outline-none focus:border-[#d94848]"
          />
        </label>
        <button className="w-full rounded-lg bg-[#d94848] px-5 py-3.5 font-bold text-white transition hover:bg-white hover:text-[#123b70]">
          View result <span className="float-right">↗</span>
        </button>
      </form>
      {status && <p className="mt-5 text-sm text-[#d94848]">{status}</p>}
      {result && (
        <div className="mt-6 rounded-xl bg-white p-5 text-[#123b70]">
          <p className="text-xs uppercase tracking-widest text-[#d94848]">
            Result found
          </p>
          <h3 className="mt-2 text-xl font-bold">{result.student_name}</h3>
          <p className="text-sm">{result.class_name}</p>
          {result.pdf_url && (
            <a
              className="mt-4 inline-block font-bold text-[#d94848]"
              href={result.pdf_url}
              target="_blank"
              rel="noreferrer"
            >
              Download report ↗
            </a>
          )}
        </div>
      )}
    </div>
  );
}
