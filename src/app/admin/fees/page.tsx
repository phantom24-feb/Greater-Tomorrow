"use client";

import { Fragment, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface ClassOption {
  id: string;
  name: string;
}

interface FeeItemInput {
  label: string;
  amount: string;
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

const TERMS = ["First Term", "Second Term", "Third Term"];

export default function AdminFeesPage() {
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [fees, setFees] = useState<Fee[]>([]);
  const [classId, setClassId] = useState("");
  const [term, setTerm] = useState(TERMS[0]);
  const [session, setSession] = useState("2025/2026");
  const [items, setItems] = useState<FeeItemInput[]>([
    { label: "Tuition", amount: "" },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const supabase = createClient();

  async function loadData() {
    const [{ data: classData }, { data: feeData }] = await Promise.all([
      supabase.from("classes").select("id, name").order("level"),
      supabase
        .from("fees")
        .select("id, class_id, term, session, amount, breakdown")
        .order("session", { ascending: false }),
    ]);
    setClasses(classData ?? []);
    setFees(feeData ?? []);
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadData();
    }, 0);

    return () => window.clearTimeout(timer);
    // loadData is intentionally run once when the page mounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function updateItem(index: number, field: keyof FeeItemInput, value: string) {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  }

  function addItem() {
    setItems((prev) => [...prev, { label: "", amount: "" }]);
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!classId) {
      setError("Select a class.");
      return;
    }

    const validItems: FeeItem[] = items
      .filter((item) => item.label.trim() && Number(item.amount) > 0)
      .map((item) => ({
        label: item.label.trim(),
        amount: Number(item.amount),
      }));

    if (validItems.length === 0) {
      setError("Add at least one fee item with a description and amount.");
      return;
    }

    const total = validItems.reduce((sum, item) => sum + item.amount, 0);

    setLoading(true);

    const { error: upsertError } = await supabase.from("fees").upsert(
      {
        class_id: classId,
        term,
        session,
        amount: total,
        breakdown: validItems,
      },
      { onConflict: "class_id,term,session" },
    );

    setLoading(false);

    if (upsertError) {
      setError(upsertError.message);
      return;
    }

    setItems([{ label: "Tuition", amount: "" }]);
    loadData();
  }

  return (
    <div className="mx-auto max-w-[900px] px-6 py-10">
      <h1 className="mb-1 font-display text-2xl font-semibold text-navy">
        Tuition Fees
      </h1>
      <p className="mb-7 text-[14.5px] text-muted">
        Set fees per class, per term, per session. Add as many fee items as you
        need — tuition, PTA levy, exam fee, uniform, etc. Saving an existing
        class/term/session combination updates it.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mb-10 flex flex-col gap-4 rounded-md border border-bordersoft bg-white p-6"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-[13.5px] font-medium text-ink">
              Class
            </label>
            <select
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              className="w-full rounded border border-bordersoft px-3.5 py-2.5 text-[15px] outline-none focus:border-navy"
            >
              <option value="">Select class</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-[13.5px] font-medium text-ink">
              Term
            </label>
            <select
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              className="w-full rounded border border-bordersoft px-3.5 py-2.5 text-[15px] outline-none focus:border-navy"
            >
              {TERMS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-[13.5px] font-medium text-ink">
              Session
            </label>
            <input
              type="text"
              value={session}
              onChange={(e) => setSession(e.target.value)}
              placeholder="2025/2026"
              className="w-full rounded border border-bordersoft px-3.5 py-2.5 text-[15px] outline-none focus:border-navy"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-[13.5px] font-medium text-ink">
            Fee items
          </label>
          <div className="flex flex-col gap-2.5">
            {items.map((item, index) => (
              <div key={index} className="flex items-center gap-2.5">
                <input
                  type="text"
                  placeholder="Description (e.g. Tuition, PTA Levy, Exam Fee)"
                  value={item.label}
                  onChange={(e) => updateItem(index, "label", e.target.value)}
                  className="flex-1 rounded border border-bordersoft px-3.5 py-2.5 text-[15px] outline-none focus:border-navy"
                />
                <input
                  type="number"
                  placeholder="Amount (₦)"
                  value={item.amount}
                  onChange={(e) => updateItem(index, "amount", e.target.value)}
                  className="w-[140px] rounded border border-bordersoft px-3.5 py-2.5 text-[15px] outline-none focus:border-navy"
                />
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="flex-shrink-0 px-2 text-[13px] font-medium text-oxblood hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addItem}
            className="mt-3 text-[13.5px] font-medium text-oxblood hover:underline"
          >
            + Add another fee item
          </button>
        </div>

        {error && <p className="text-[13.5px] text-oxblood">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center self-start rounded bg-oxblood px-5 py-2.5 text-[14.5px] font-semibold text-white transition-all hover:bg-oxblood-dark active:scale-[0.97] disabled:opacity-60"
        >
          {loading ? "Saving…" : "Save fee"}
        </button>
      </form>

      <h2 className="mb-4 font-display text-lg font-semibold text-navy">
        Current fees
      </h2>
      <div className="overflow-x-auto rounded-md border border-bordersoft bg-white">
        <table className="w-full text-left text-[13.5px]">
          <thead>
            <tr className="border-b border-bordersoft bg-bgsoft text-ink">
              <th className="px-4 py-2.5 font-medium">Class</th>
              <th className="px-4 py-2.5 font-medium">Term</th>
              <th className="px-4 py-2.5 font-medium">Session</th>
              <th className="px-4 py-2.5 font-medium">Total</th>
              <th className="px-4 py-2.5 font-medium" />
            </tr>
          </thead>
          <tbody>
            {fees.map((f) => (
              <Fragment key={f.id}>
                <tr className="border-b border-bordersoft last:border-0">
                  <td className="px-4 py-2.5">
                    {classes.find((c) => c.id === f.class_id)?.name ?? "—"}
                  </td>
                  <td className="px-4 py-2.5">{f.term}</td>
                  <td className="px-4 py-2.5">{f.session}</td>
                  <td className="px-4 py-2.5">₦{f.amount.toLocaleString()}</td>
                  <td className="px-4 py-2.5">
                    {f.breakdown && f.breakdown.length > 0 && (
                      <button
                        onClick={() =>
                          setExpandedId(expandedId === f.id ? null : f.id)
                        }
                        className="text-[13px] font-medium text-oxblood hover:underline"
                      >
                        {expandedId === f.id ? "Hide" : "Breakdown"}
                      </button>
                    )}
                  </td>
                </tr>
                {expandedId === f.id && f.breakdown && (
                  <tr className="border-b border-bordersoft bg-bgsoft last:border-0">
                    <td colSpan={5} className="px-4 py-3">
                      <ul className="flex flex-col gap-1">
                        {f.breakdown.map((item, i) => (
                          <li
                            key={i}
                            className="flex justify-between text-[13px] text-ink"
                          >
                            <span>{item.label}</span>
                            <span>₦{item.amount.toLocaleString()}</span>
                          </li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
            {fees.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-4 text-muted">
                  No fees set yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
