import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

/**
 * Authoritative current-user check (uses getUser(), which validates the
 * token against Supabase's Auth server — unlike getSession(), which just
 * decodes the cookie locally and shouldn't be trusted server-side for
 * anything that gates rendering).
 *
 * Wrapped in React's cache() so that no matter how many places call this
 * within a single request (layout.tsx, HomeContent.tsx, etc.), Supabase
 * is only actually hit once — not once per call site.
 */
export const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});
