"use client";

import { useEffect, useState } from "react";
import PublicHeader from "@/components/layout/PublicHeader";
import { createClient } from "@/lib/supabase/client";

interface ClassOption {
  id: string;
  name: string;
}

interface FeeItem {
  label: string;
  amount: number;
}

interface Fee {
  id: string;
  class_id: string;
  term: string;
  session: string;
  amount: number;
  breakdown: FeeItem[] | null;
}

export default function TuitionPage() {
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [fees, setFees] = useState<Fee[]>([]);
  const [openClassId, setOpenClassId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const [{ data: classData }, { data: feeData }] = await Promise.all([
        supabase.from("classes").select("id, name").order("level"),
        supabase
          .from("fees")
          .select("id, class_id, term, session, amount, breakdown")
          .order("session", { ascending: false }),
      ]);
      setClasses(classData ?? []);
      setFees(feeData ?? []);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />
      <div className="mx-auto max-w-[800px] px-6 py-14">
        <h1 className="mb-2 font-display text-3xl font-semibold text-navy">
          Tuition Fees
        </h1>
        <p className="mb-10 text-[15px] text-muted">
          Select a class to view its fees by term.
        </p>

        {loading && <p className="text-[14px] text-muted">Loading…</p>}

        <div className="flex flex-col gap-3">
          {classes.map((c) => {
            const classFees = fees.filter((f) => f.class_id === c.id);
            const isOpen = openClassId === c.id;
            return (
              <div
                key={c.id}
                className="rounded-md border border-bordersoft bg-white"
              >
                <button
                  onClick={() => setOpenClassId(isOpen ? null : c.id)}
                  className="flex w-full items-center justify-between px-5 py-4 text-left"
                >
                  <span className="font-display text-[16px] font-semibold text-navy">
                    {c.name}
                  </span>
                  <span className="text-[13px] text-muted">
                    {classFees.length === 0
                      ? "No fees set"
                      : `${classFees.length} term${classFees.length === 1 ? "" : "s"}`}
                  </span>
                </button>
                {isOpen && classFees.length > 0 && (
                  <div className="border-t border-bordersoft px-5 py-4">
                    {classFees.map((f) => (
                      <div key={f.id} className="mb-4 last:mb-0">
                        <p className="mb-1.5 text-[14px] font-medium text-ink">
                          {f.term} · {f.session} —{" "}
                          <span className="text-navy">
                            ₦{f.amount.toLocaleString()}
                          </span>
                        </p>
                        {f.breakdown && (
                          <ul className="flex flex-col gap-1 pl-3">
                            {f.breakdown.map((item, i) => (
                              <li
                                key={i}
                                className="flex justify-between text-[13px] text-muted"
                              >
                                <span>{item.label}</span>
                                <span>₦{item.amount.toLocaleString()}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          {classes.length === 0 && !loading && (
            <p className="text-[14px] text-muted">No classes found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
