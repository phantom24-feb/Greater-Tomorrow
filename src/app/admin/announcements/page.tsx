"use client";

import { useEffect, useState } from "react";
import PublicHeader from "@/components/layout/PublicHeader";
import { createClient } from "@/lib/supabase/client";

interface Announcement {
  id: string;
  title: string;
  body: string;
  created_at: string;
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from("announcements")
        .select("id, title, body, created_at")
        .order("created_at", { ascending: false });
      setAnnouncements(data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  async function handlePublish(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !body.trim()) {
      setError("Title and announcement text are required.");
      return;
    }

    setPublishing(true);
    const supabase = createClient();
    const { error: insertError } = await supabase.from("announcements").insert({
      title: title.trim(),
      body: body.trim(),
    });
    setPublishing(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    setTitle("");
    setBody("");
    setLoading(true);
    const { data } = await supabase
      .from("announcements")
      .select("id, title, body, created_at")
      .order("created_at", { ascending: false });
    setAnnouncements(data ?? []);
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />
      <div className="mx-auto max-w-[760px] px-6 py-14">
        <h1 className="mb-2 font-display text-3xl font-semibold text-navy">
          Announcements
        </h1>
        <p className="mb-10 text-[15px] text-muted">
          All notices from the school.
        </p>

        <form
          onSubmit={handlePublish}
          className="mb-10 flex flex-col gap-4 rounded-md border border-bordersoft bg-white p-6"
        >
          <h2 className="font-display text-lg font-semibold text-navy">
            Publish announcement
          </h2>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Announcement title"
            className="rounded border border-bordersoft px-3.5 py-2.5 text-[15px] outline-none focus:border-navy"
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write the announcement"
            rows={4}
            className="rounded border border-bordersoft px-3.5 py-2.5 text-[15px] outline-none focus:border-navy"
          />
          {error && <p className="text-[13.5px] text-oxblood">{error}</p>}
          <button
            type="submit"
            disabled={publishing}
            className="inline-flex items-center justify-center self-start rounded bg-oxblood px-5 py-2.5 text-[14.5px] font-semibold text-white transition-all hover:bg-oxblood-dark disabled:opacity-60"
          >
            {publishing ? "Publishing..." : "Publish announcement"}
          </button>
        </form>

        {loading && <p className="text-[14px] text-muted">Loading…</p>}

        <ul className="list-none border-t border-bordersoft p-0">
          {announcements.map((a) => (
            <li
              key={a.id}
              className="border-b border-bordersoft border-l-[3px] border-l-oxblood px-[18px] py-5"
            >
              <p className="text-[15.5px] font-medium text-ink">{a.title}</p>
              <p className="mt-1 text-[14px] text-muted">{a.body}</p>
              <p className="mt-2 text-[12.5px] text-muted">
                {new Date(a.created_at).toLocaleDateString()}
              </p>
            </li>
          ))}
          {announcements.length === 0 && !loading && (
            <li className="py-6 text-[14px] text-muted">
              No announcements yet.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
