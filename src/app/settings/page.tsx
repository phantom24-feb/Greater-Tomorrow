"use client";

import { useState, useSyncExternalStore } from "react";
import { createClient } from "@/lib/supabase/client";

export default function SettingsPage() {
  const theme = useSyncExternalStore(
    (onStoreChange) => {
      window.addEventListener("school-theme-change", onStoreChange);
      return () => window.removeEventListener("school-theme-change", onStoreChange);
    },
    () => (window.localStorage.getItem("school-theme") === "dark" ? "dark" : "light"),
    () => "light",
  );
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function handleThemeChange(nextTheme: "light" | "dark") {
    window.localStorage.setItem("school-theme", nextTheme);
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
    window.dispatchEvent(new Event("school-theme-change"));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!currentPassword) {
      setError("Enter your current password.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user?.email) {
      setLoading(false);
      setError("Your session has expired. Please sign in again.");
      return;
    }

    const { error: verificationError } = await supabase.auth.signInWithPassword({
      email: userData.user.email,
      password: currentPassword,
    });

    if (verificationError) {
      setLoading(false);
      setError("Current password is incorrect.");
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setSuccess(true);
    setCurrentPassword("");
    setPassword("");
    setConfirmPassword("");
  }

  return (
    <div className="mx-auto max-w-[500px] px-6 py-10">
      <h1 className="mb-1 font-display text-2xl font-semibold text-navy">
        Settings
      </h1>
      <p className="mb-7 text-[14.5px] text-muted">
        Manage your appearance and account security.
      </p>

      <section className="mb-6 rounded-md border border-bordersoft bg-white p-6">
        <h2 className="mb-3 font-display text-lg font-semibold text-navy">
          Appearance
        </h2>
        <div className="flex gap-2" role="group" aria-label="Theme">
          {(["light", "dark"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => handleThemeChange(option)}
              aria-pressed={theme === option}
              className={`rounded border px-4 py-2 text-[13.5px] font-medium capitalize transition-colors ${
                theme === option
                  ? "border-oxblood bg-oxblood text-white"
                  : "border-bordersoft text-ink hover:bg-bgsoft"
              }`}
            >
              {option} mode
            </button>
          ))}
        </div>
      </section>

      {!changingPassword ? (
        <button
          type="button"
          onClick={() => {
            setChangingPassword(true);
            setError(null);
            setSuccess(false);
          }}
          className="inline-flex items-center justify-center rounded bg-oxblood px-5 py-2.5 text-[14.5px] font-semibold text-white transition-all hover:bg-oxblood-dark active:scale-[0.97]"
        >
          Change password
        </button>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 rounded-md border border-bordersoft bg-white p-6"
        >
        <div>
          <label
            htmlFor="currentPassword"
            className="mb-1.5 block text-[13.5px] font-medium text-ink"
          >
            Current Password
          </label>
          <input
            id="currentPassword"
            type="password"
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full rounded border border-bordersoft px-3.5 py-2.5 text-[15px] outline-none focus:border-navy"
          />
        </div>
        <div>
          <label
            htmlFor="password"
            className="mb-1.5 block text-[13.5px] font-medium text-ink"
          >
            New Password
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
        <div>
          <label
            htmlFor="confirmPassword"
            className="mb-1.5 block text-[13.5px] font-medium text-ink"
          >
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full rounded border border-bordersoft px-3.5 py-2.5 text-[15px] outline-none focus:border-navy"
          />
        </div>

        {error && <p className="text-[13.5px] text-oxblood">{error}</p>}
        {success && (
          <p className="text-[13.5px] text-ink">
            Password updated successfully.
          </p>
        )}

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center rounded bg-oxblood px-5 py-2.5 text-[14.5px] font-semibold text-white transition-all hover:bg-oxblood-dark active:scale-[0.97] disabled:opacity-60"
            >
              {loading ? "Saving…" : "Update password"}
            </button>
            <button
              type="button"
              onClick={() => setChangingPassword(false)}
              className="rounded border border-bordersoft px-5 py-2.5 text-[14.5px] font-medium text-ink hover:bg-bgsoft"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
