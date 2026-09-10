import type { Metadata } from "next";
import "./globals.css";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/getCurrentUser";
import AppShell from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "Greater Tomorrow School",
  description: "Check results, view tuition, apply for admission, and more.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  let role: "admin" | "student" | null = null;

  if (user) {
    const supabase = await createClient();
    const { data: admin } = await supabase
      .from("admins")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    role = admin ? "admin" : "student";
  }

  return (
    <html lang="en">
      <body>
        <AppShell role={role}>{children}</AppShell>
      </body>
    </html>
  );
}
