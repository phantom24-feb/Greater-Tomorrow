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
  const [loading, setLoading] = useState(true);

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
