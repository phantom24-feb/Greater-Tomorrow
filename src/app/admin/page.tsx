"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { compressImage } from "@/lib/compress-image";

export default function AdminLogin() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [message, setMessage] = useState("");
  const router = useRouter();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const supabase = createClient();
    if (mode === "login") {
      setMessage("Signing you in...");
      const { error } = await supabase.auth.signInWithPassword({
        email: String(form.get("email")),
        password: String(form.get("password")),
      });
      if (error) {
        setMessage(error.message);
        return;
      }
      router.push("/admin/dashboard");
      return;
    }
    setMessage("Creating your staff account...");
    const firstName = String(form.get("first_name"));
    const lastName = String(form.get("last_name"));
    const { data, error } = await supabase.auth.signUp({
      email: String(form.get("email")),
      password: String(form.get("password")),
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          full_name: `${firstName} ${lastName}`,
        },
      },
    });
    if (error) {
      setMessage(error.message);
      return;
    }
    if (data.user && data.session) {
      const avatar = form.get("avatar") as File;
      let avatarUrl: string | null = null;
      if (avatar?.size) {
        const compressed = await compressImage(avatar, 600, 0.78);
        const path = `${data.user.id}/${crypto.randomUUID()}-${compressed.name}`;
        const upload = await supabase.storage
          .from("staff-avatars")
          .upload(path, compressed, {
            contentType: compressed.type,
            cacheControl: "31536000",
          });
        if (upload.error) {
          setMessage(upload.error.message);
          return;
        }
        avatarUrl = supabase.storage.from("staff-avatars").getPublicUrl(path)
          .data.publicUrl;
      }
      const profile = await supabase
        .from("staff_profiles")
        .upsert({
          id: data.user.id,
          email: String(form.get("email")),
          first_name: firstName,
          last_name: lastName,
          full_name: `${firstName} ${lastName}`,
          avatar_url: avatarUrl,
        });
      if (profile.error) {
        setMessage(profile.error.message);
        return;
      }
    }
    setMessage(
      data.session
        ? "Account created. You can sign in now."
        : "Account created. Confirm the account in Supabase Auth Users before signing in.",
    );
    setMode("login");
  }

  return (
    <main className="paper-grid flex min-h-[calc(100vh-88px)] items-center px-6 py-16 lg:px-10">
      <div className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-3xl bg-[#123b70] text-white shadow-[12px_12px_0_#d94848] md:grid-cols-2">
        <div className="p-8 sm:p-12">
          <p className="text-xs font-bold uppercase tracking-[.3em] text-[#d94848]">
            Staff space
          </p>
          <h1 className="mt-6 text-5xl font-bold leading-none tracking-[-.04em]">
            Keep the
            <br />
            <span className="text-[#d94848]">good work</span>
            <br />
            moving.
          </h1>
          <p className="mt-7 max-w-sm leading-7 text-white/80">
            Manage reports, fees and the reading lists from one quiet corner.
          </p>
        </div>
        <form onSubmit={submit} className="bg-white p-8 text-[#123b70] sm:p-12">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">
              {mode === "login" ? "Sign in" : "Create staff account"}
            </h2>
            <button
              type="button"
              onClick={() => {
                setMode(mode === "login" ? "signup" : "login");
                setMessage("");
              }}
              className="text-sm font-bold text-[#d94848]"
            >
              {mode === "login" ? "Sign up" : "Back to sign in"}
            </button>
          </div>
          <div className="mt-8 space-y-5">
            {mode === "signup" && (
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm">
                  First name
                  <input
                    required
                    name="first_name"
                    className="mt-2 w-full rounded-lg border border-[#123b70]/20 px-4 py-3 outline-none focus:border-[#d94848]"
                  />
                </label>
                <label className="block text-sm">
                  Last name
                  <input
                    required
                    name="last_name"
                    className="mt-2 w-full rounded-lg border border-[#123b70]/20 px-4 py-3 outline-none focus:border-[#d94848]"
                  />
                </label>
              </div>
            )}
            <label className="block text-sm">
              Email
              <input
                required
                name="email"
                type="email"
                className="mt-2 w-full rounded-lg border border-[#123b70]/20 px-4 py-3 outline-none focus:border-[#d94848]"
              />
            </label>
            <label className="block text-sm">
              Password
              <input
                required
                minLength={6}
                name="password"
                type="password"
                className="mt-2 w-full rounded-lg border border-[#123b70]/20 px-4 py-3 outline-none focus:border-[#d94848]"
              />
            </label>
            {mode === "signup" && (
              <label className="block text-sm">
                Profile picture
                <input
                  name="avatar"
                  type="file"
                  accept="image/*"
                  className="mt-2 block w-full text-sm"
                />
              </label>
            )}
            <button className="w-full rounded-lg bg-[#d94848] px-5 py-3.5 font-bold text-white hover:bg-[#123b70]">
              {mode === "login" ? "Enter dashboard" : "Create account"} ↗
            </button>
            {message && <p className="text-sm text-[#d94848]">{message}</p>}
          </div>
        </form>
      </div>
    </main>
  );
}
