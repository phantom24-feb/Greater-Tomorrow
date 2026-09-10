"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Step = "verify" | "password" | "done";

export default function CreateAccountPage() {
  const [step, setStep] = useState<Step>("verify");
  const [admissionNo, setAdmissionNo] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [loginMethod, setLoginMethod] = useState<"email" | "phone">("email");
  const [loginValue, setLoginValue] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  function handleContinue(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!admissionNo.trim() || !dateOfBirth) {
      setError("Please fill in both fields.");
      return;
    }

    // Identity is actually checked server-side on final submit — this just
    // collects the details before asking for a password.
    setStep("password");
  }

  async function handleCreateAccount(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!loginValue.trim()) {
      setError(
        `Please enter your ${loginMethod === "email" ? "email address" : "phone number"}.`,
      );
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

    const res = await fetch("/api/create-account", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        admissionNo: admissionNo.trim(),
        dateOfBirth,
        loginMethod,
        loginValue: loginValue.trim(),
        password,
      }),
    });

    let data: { error?: string; success?: boolean } = {};
    try {
      data = await res.json();
    } catch {
      setLoading(false);
      setError("The account service is temporarily unavailable. Please try again.");
      return;
    }
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Something went wrong. Please try again.");
      return;
    }

    setStep("done");
    setTimeout(() => router.push("/login"), 2000);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bgsoft px-6">
      <div className="w-full max-w-[420px] rounded-lg bg-white p-8 shadow-[0_10px_30px_rgba(20,33,61,0.08)]">
        <h1 className="mb-1 font-display text-2xl font-semibold text-navy">
          Create your account
        </h1>
        <p className="mb-7 text-[14.5px] text-muted">
          Already enrolled? Use the admission number and date of birth given by the school office. New applicants should use{" "}
          <Link href="/register" className="text-oxblood hover:underline">
            Online Registration
          </Link>{" "}
          instead.
        </p>

        {step === "verify" && (
          <form onSubmit={handleContinue} className="flex flex-col gap-4">
            <div>
              <label
                htmlFor="admissionNo"
                className="mb-1.5 block text-[13.5px] font-medium text-ink"
              >
                Admission Number
              </label>
              <input
                id="admissionNo"
                type="text"
                required
                value={admissionNo}
                onChange={(e) => setAdmissionNo(e.target.value)}
                className="w-full rounded border border-bordersoft px-3.5 py-2.5 text-[15px] outline-none focus:border-navy"
                autoComplete="off"
              />
            </div>
            <div>
              <label
                htmlFor="dob"
                className="mb-1.5 block text-[13.5px] font-medium text-ink"
              >
                Date of Birth
              </label>
              <input
                id="dob"
                type="date"
                required
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="w-full rounded border border-bordersoft px-3.5 py-2.5 text-[15px] outline-none focus:border-navy"
              />
            </div>

            {error && <p className="text-[13.5px] text-oxblood">{error}</p>}

            <button
              type="submit"
              className="mt-2 inline-flex items-center justify-center rounded bg-oxblood px-6 py-3 text-[15px] font-semibold text-white transition-all hover:bg-oxblood-dark active:scale-[0.98]"
            >
              Continue
            </button>
          </form>
        )}

        {step === "password" && (
          <form onSubmit={handleCreateAccount} className="flex flex-col gap-4">
            <div>
              <label className="mb-1.5 block text-[13.5px] font-medium text-ink">
                Log in with
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-1.5 text-[14px] text-ink">
                  <input
                    type="radio"
                    name="loginMethod"
                    checked={loginMethod === "email"}
                    onChange={() => setLoginMethod("email")}
                  />
                  Email
                </label>
                <label className="flex items-center gap-1.5 text-[14px] text-ink">
                  <input
                    type="radio"
                    name="loginMethod"
                    checked={loginMethod === "phone"}
                    onChange={() => setLoginMethod("phone")}
                  />
                  Phone Number
                </label>
              </div>
            </div>
            <div>
              <label
                htmlFor="loginValue"
                className="mb-1.5 block text-[13.5px] font-medium text-ink"
              >
                {loginMethod === "email" ? "Email Address" : "Phone Number"}
              </label>
              <input
                id="loginValue"
                type={loginMethod === "email" ? "email" : "tel"}
                required
                value={loginValue}
                onChange={(e) => setLoginValue(e.target.value)}
                placeholder={
                  loginMethod === "email" ? "you@example.com" : "+234..."
                }
                className="w-full rounded border border-bordersoft px-3.5 py-2.5 text-[15px] outline-none focus:border-navy"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-[13.5px] font-medium text-ink"
              >
                Create Password
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

            <button
              type="submit"
              disabled={loading}
              className="mt-2 inline-flex items-center justify-center rounded bg-oxblood px-6 py-3 text-[15px] font-semibold text-white transition-all hover:bg-oxblood-dark active:scale-[0.98] disabled:opacity-60"
            >
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>
        )}

        {step === "done" && (
          <p className="text-[15px] text-ink">
            Account created! Redirecting you to login…
          </p>
        )}
      </div>
    </div>
  );
}
