"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

function buildCredentials(identifier: string, password: string) {
  const trimmed = identifier.trim();
  return trimmed.includes("@")
    ? { email: trimmed, password }
    : { phone: trimmed.replace(/\s+/g, ""), password };
}

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/account";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword(
      buildCredentials(identifier, password),
    );

    setLoading(false);

    if (signInError) {
      setError("Incorrect email/phone number or password.");
      return;
    }

    window.location.assign(redirectTo);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bgsoft px-6">
      <div className="w-full max-w-[400px] rounded-lg bg-white p-8 shadow-[0_10px_30px_rgba(20,33,61,0.08)]">
        <h1 className="mb-1 font-display text-2xl font-semibold text-navy">
          Welcome back
        </h1>
        <p className="mb-7 text-[14.5px] text-muted">
          Log in to check results, view your account, and more.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label
              htmlFor="identifier"
              className="mb-1.5 block text-[13.5px] font-medium text-ink"
            >
              Email or Phone Number
            </label>
            <input
              id="identifier"
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full rounded border border-bordersoft px-3.5 py-2.5 text-[15px] outline-none focus:border-navy"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-[13.5px] font-medium text-ink"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded border border-bordersoft px-3.5 py-2.5 text-[15px] outline-none focus:border-navy"
            />
          </div>

          {error && <p className="text-[13.5px] text-oxblood">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 inline-flex items-center justify-center rounded bg-oxblood px-6 py-3 text-[15px] font-semibold text-white transition-all hover:bg-oxblood-dark active:scale-[0.98] disabled:opacity-60"
          >
            {loading ? "Logging in…" : "Log in"}
          </button>
        </form>

        <p className="mt-6 text-center text-[13.5px] text-muted">
          Existing student without a password yet?{" "}
          <Link
            href="/create-account"
            className="font-medium text-oxblood hover:underline"
          >
            Create your account
          </Link>
        </p>
        <p className="mt-2 text-center text-[13.5px] text-muted">
          New to the school?{" "}
          <Link
            href="/register"
            className="font-medium text-oxblood hover:underline"
          >
            Apply for admission
          </Link>
        </p>
      </div>
    </div>
  );
}
