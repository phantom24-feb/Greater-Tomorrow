import { unstable_cache } from "next/cache";
import { createClient } from "@supabase/supabase-js";

export const getLatestAnnouncement = unstable_cache(
  async () => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    const { data } = await supabase
      .from("announcements")
      .select("id, title, created_at")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    return data;
  },
  ["latest-announcement"],
  { revalidate: 3600 },
);