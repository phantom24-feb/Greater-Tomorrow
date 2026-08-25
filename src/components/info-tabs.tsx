"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
type SchoolClass = {
  id: number;
  name: string;
  section: "nursery" | "primary" | "secondary";
  tuition_fee: number;
};
type Fee = { id: string; description: string; price: number };
type Book = {
  id: string;
  subject: string;
  book_title: string;
  author: string;
  cover_url: string | null;
};
const sections = [
  { key: "nursery", label: "Nursery" },
  { key: "primary", label: "Primary" },
  { key: "secondary", label: "Secondary" },
] as const;
export function InfoTabs() {
  const [tab, setTab] = useState<"fees" | "books">(() =>
    typeof window !== "undefined" && window.location.hash === "#books"
      ? "books"
      : "fees",
  );
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [section, setSection] = useState<SchoolClass["section"] | null>(null);
  const [selected, setSelected] = useState<SchoolClass | null>(null);
  const [fees, setFees] = useState<Fee[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  useEffect(() => {
    createClient()
      .from("classes")
      .select("id,name,section,tuition_fee")
      .order("section")
      .order("name")
      .then(({ data }) => setClasses(data ?? []));
  }, []);
  async function chooseClass(item: SchoolClass) {
    setSection(null);
    setSelected(item);
    setFees([]);
    setBooks([]);
    if (tab === "fees") {
      const response = await createClient()
        .from("tuition_items")
        .select("id,description,price")
        .eq("class_id", item.id)
        .order("description");
      setFees(response.data ?? []);
    } else {
      const response = await createClient()
        .from("books")
        .select("id,subject,book_title,author,cover_url")
        .eq("class_id", item.id)
        .order("subject");
      setBooks(response.data ?? []);
    }
  }
  function close() {
    setSection(null);
    setSelected(null);
    setFees([]);
    setBooks([]);
  }
  return (
    <div className="mt-10" id="fees">
      <div className="flex flex-wrap gap-2 border-b border-[#18302d]/15 pb-3">
        <button
          onClick={() => {
            setTab("fees");
            close();
          }}
          className={`rounded-full px-5 py-3 text-sm font-bold ${tab === "fees" ? "bg-[#d94848] text-white" : "text-[#53635f]"}`}
        >
          Tuition fees
        </button>
        <button
          onClick={() => {
            setTab("books");
            close();
          }}
          className={`rounded-full px-5 py-3 text-sm font-bold ${tab === "books" ? "bg-[#d94848] text-white" : "text-[#53635f]"}`}
        >
          Recommended books
        </button>
      </div>
      <div className="mt-7 grid gap-4 sm:grid-cols-3">
        {sections.map((item) => (
          <button
            key={item.key}
            onClick={() => setSection(item.key)}
            className="rounded-2xl border border-[#123b70]/15 bg-white p-6 text-left transition hover:-translate-y-1 hover:border-[#d94848]"
          >
            <span className="text-xs font-bold uppercase tracking-widest text-[#d94848]">
              {item.label}
            </span>
            <h2 className="mt-10 text-xl font-bold text-[#123b70]">
              {tab === "fees" ? "View tuition" : "View booklist"}
              <span className="float-right">↗</span>
            </h2>
          </button>
        ))}
      </div>
      {section && (
        <div className="fixed inset-0 z-40 flex items-center justify-center overflow-y-auto bg-[#123b70]/60 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 text-[#123b70] shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Select a class</h2>
              <button onClick={close} className="text-2xl" aria-label="Close">
                ×
              </button>
            </div>
            <p className="mt-2 text-sm text-[#123b70]/70">
              {sections.find((item) => item.key === section)?.label} classes
            </p>
            <div className="mt-5 space-y-2">
              {classes
                .filter((item) => item.section === section)
                .map((item) => (
                  <button
                    key={item.id}
                    onClick={() => chooseClass(item)}
                    className="w-full rounded-xl border border-[#123b70]/15 px-4 py-4 text-left font-bold hover:border-[#d94848]"
                  >
                    {item.name}
                    <span className="float-right text-[#d94848]">↗</span>
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}
      {selected && (
        <div className="fixed inset-0 z-40 flex items-center justify-center overflow-y-auto bg-[#123b70]/60 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 text-[#123b70] shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[#d94848]">
                  {selected.section}
                </p>
                <h2 className="text-2xl font-bold">{selected.name}</h2>
              </div>
              <button onClick={close} className="text-2xl" aria-label="Close">
                ×
              </button>
            </div>
            {tab === "fees" ? (
              <div className="mt-6 space-y-3">
                {fees.map((fee) => (
                  <div
                    key={fee.id}
                    className="flex justify-between border-b border-[#123b70]/10 py-3"
                  >
                    <span>{fee.description}</span>
                    <strong>₦{Number(fee.price).toLocaleString()}</strong>
                  </div>
                ))}
                <div className="flex justify-between pt-3 text-lg font-bold">
                  <span>Total tuition</span>
                  <span>
                    ₦
                    {fees
                      .reduce((total, fee) => total + Number(fee.price), 0)
                      .toLocaleString()}
                  </span>
                </div>
                {!fees.length && (
                  <p className="text-sm text-[#123b70]/70">
                    No tuition details have been added for this class.
                  </p>
                )}
              </div>
            ) : (
              <div className="mt-6 space-y-3">
                {books.map((book) => (
                  <article
                    key={book.id}
                    className="flex gap-3 rounded-xl border border-[#123b70]/10 p-3"
                  >
                    {book.cover_url && (
                      <Image
                        src={book.cover_url}
                        alt=""
                        width={48}
                        height={64}
                        className="h-16 w-12 rounded object-cover"
                      />
                    )}
                    <div>
                      <p className="text-xs font-bold uppercase text-[#d94848]">
                        {book.subject}
                      </p>
                      <h3 className="font-bold">{book.book_title}</h3>
                      <p className="text-sm text-[#123b70]/70">{book.author}</p>
                    </div>
                  </article>
                ))}
                {!books.length && (
                  <p className="text-sm text-[#123b70]/70">
                    No recommended books have been added for this class.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
