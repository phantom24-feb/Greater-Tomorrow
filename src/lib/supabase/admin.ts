import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// SERVER-ONLY. Uses the service role key, which bypasses Row Level Security
// entirely. Only ever import this inside API routes / server actions —
// never in a Client Component, and never expose SUPABASE_SERVICE_ROLE_KEY
// with the NEXT_PUBLIC_ prefix.
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
