"use client";
import { useState } from "react";
import Image from "next/image";
type Student = {
  id: string;
  full_name: string;
  reg_number: string;
  gender: string | null;
  passport_url: string | null;
  class_name: string;
  section: string;
};
export function StudentDirectory({ students }: { students: Student[] }) {
  const [activeClass, setActiveClass] = useState<string | null>(null);
  const classes = [
    ...new Set(students.map((student) => student.class_name)),
  ].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  const visible = activeClass
    ? students.filter((student) => student.class_name === activeClass)
    : [];
  return (
    <>
      <div className="mt-8 flex flex-wrap gap-3">
        {classes.map((name) => (
          <button
            key={name}
            onClick={() => setActiveClass(name)}
            className={`rounded-full border px-4 py-2 text-sm font-bold ${activeClass === name ? "border-[#d94848] bg-[#d94848] text-white" : "border-[#123b70]/20 text-[#123b70]"}`}
          >
            {name}
          </button>
        ))}
      </div>
      {activeClass && (
        <section className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-[#123b70]">
              Students in {activeClass}
            </h2>
            <button
              onClick={() => setActiveClass(null)}
              className="text-sm font-bold text-[#d94848]"
            >
              All classes
            </button>
          </div>
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((student) => (
              <article
                key={student.id}
                className="overflow-hidden rounded-2xl border border-[#123b70]/15 bg-white"
              >
                <div className="relative flex h-52 items-center justify-center bg-[#123b70]/10">
                  {student.passport_url ? (
                    <Image
                      src={student.passport_url}
                      alt={`${student.full_name} passport`}
                      fill
                      sizes="(max-width: 640px) 100vw, 50vw"
                      className="object-cover"
                    />
                  ) : (
                    <span className="text-5xl font-bold text-[#d94848]">
                      {student.full_name.charAt(0)}
                    </span>
                  )}
                </div>
                <div className="p-5">
                  <p className="text-xs font-bold uppercase tracking-widest text-[#d94848]">
                    {student.section}
                  </p>
                  <h3 className="mt-2 text-xl font-bold text-[#123b70]">
                    {student.full_name}
                  </h3>
                  <p className="mt-1 text-sm text-[#123b70]/70">
                    {student.reg_number}
                  </p>
                  <p className="mt-4 border-t border-[#123b70]/10 pt-3 text-sm font-semibold text-[#123b70]">
                    {student.gender ?? "Gender not set"}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
