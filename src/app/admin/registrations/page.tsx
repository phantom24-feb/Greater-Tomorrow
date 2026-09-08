"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { generateAdmissionNumber } from "@/lib/student/generateAdmissionNumber";

interface GuardianInfo {
  relationship?: string;
  full_name?: string;
  phone?: string;
  email?: string;
  occupation?: string;
  religion?: string;
  address?: string;
}

interface Registration {
  id: string;
  first_name: string;
  last_name: string;
  other_name: string | null;
  date_of_birth: string;
  gender: string;
  religion: string | null;
  address: string | null;
  previous_school: string | null;
  class_applying_for: string | null;
  photo_url: string | null;
  guardians: GuardianInfo[] | null;
  status: string;
  submitted_at: string;
}

interface ClassOption {
  id: string;
  name: string;
}

export default function AdminRegistrationsPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastAdmissionNo, setLastAdmissionNo] = useState<string | null>(null);

  const supabase = createClient();

  async function loadData() {
    const [{ data: regData }, { data: classData }] = await Promise.all([
      supabase
        .from("registrations")
        .select("*")
        .eq("status", "pending")
        .order("submitted_at", { ascending: true }),
      supabase.from("classes").select("id, name"),
    ]);
    setRegistrations(regData ?? []);
    setClasses(classData ?? []);
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadData();
    }, 0);

    return () => window.clearTimeout(timer);
    // loadData is intentionally run once when the page mounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleApprove(reg: Registration) {
    if (!reg.class_applying_for) {
      setError(
        "This application has no class selected — cannot generate an admission number.",
      );
      return;
    }

    setError(null);
    setLastAdmissionNo(null);
    setProcessingId(reg.id);

    let admissionNo: string;
    try {
      admissionNo = await generateAdmissionNumber(
        supabase,
        reg.class_applying_for,
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not generate an admission number.",
      );
      setProcessingId(null);
      return;
    }

    const { data: newStudent, error: studentError } = await supabase
      .from("students")
      .insert({
        admission_no: admissionNo,
        first_name: reg.first_name,
        last_name: reg.last_name,
        other_name: reg.other_name,
        date_of_birth: reg.date_of_birth,
        gender: reg.gender,
        religion: reg.religion,
        address: reg.address,
        previous_school: reg.previous_school,
        photo_url: reg.photo_url,
        class_id: reg.class_applying_for,
        status: "active",
      })
      .select("id")
      .single();

    if (studentError || !newStudent) {
      setError(studentError?.message || "Could not create student record.");
      setProcessingId(null);
      return;
    }

    if (reg.guardians && reg.guardians.length > 0) {
      await supabase.from("guardians").insert(
        reg.guardians.map((g) => ({
          student_id: newStudent.id,
          relationship: g.relationship || null,
          full_name: g.full_name || "Unknown",
          phone: g.phone || null,
          email: g.email || null,
          occupation: g.occupation || null,
          religion: g.religion || null,
          address: g.address || null,
        })),
      );
    }

    await supabase
      .from("registrations")
      .update({ status: "approved", reviewed_at: new Date().toISOString() })
      .eq("id", reg.id);

    setLastAdmissionNo(admissionNo);
    setProcessingId(null);
    loadData();
  }

  async function handleReject(id: string) {
    setProcessingId(id);
    await supabase
      .from("registrations")
      .update({ status: "rejected", reviewed_at: new Date().toISOString() })
      .eq("id", id);
    setProcessingId(null);
    loadData();
  }

  return (
    <div className="mx-auto max-w-[1000px] px-6 py-10">
      <h1 className="mb-1 font-display text-2xl font-semibold text-navy">
        Registrations
      </h1>
      <p className="mb-7 text-[14.5px] text-muted">
        Review new applications. Approving auto-generates an admission number
        (e.g. GT-JSS1-004) and creates the student record.
      </p>

      {error && <p className="mb-4 text-[13.5px] text-oxblood">{error}</p>}
      {lastAdmissionNo && (
        <p className="mb-4 rounded-md border border-bordersoft bg-white p-3 text-[13.5px] text-ink">
          Approved — admission number assigned:{" "}
          <span className="font-semibold">{lastAdmissionNo}</span>
        </p>
      )}

      <div className="flex flex-col gap-4">
        {registrations.map((reg) => (
          <div
            key={reg.id}
            className="flex gap-4 rounded-md border border-bordersoft bg-white p-5"
          >
            {reg.photo_url ? (
              <Image
                src={reg.photo_url}
                alt={`${reg.first_name} ${reg.last_name}`}
                width={64}
                height={64}
                className="h-16 w-16 flex-shrink-0 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-bgsoft text-[12px] text-muted">
                No photo
              </div>
            )}

            <div className="flex-1">
              <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-display text-[16px] font-semibold text-navy">
                    {reg.first_name} {reg.other_name} {reg.last_name}
                  </p>
                  <p className="text-[13px] text-muted">
                    Applying for{" "}
                    {classes.find((c) => c.id === reg.class_applying_for)
                      ?.name ?? "Unknown class"}
                    {" · "}
                    DOB {reg.date_of_birth}
                    {" · "}
                    {reg.gender}
                  </p>
                </div>
                <span className="text-[12px] text-muted">
                  Submitted {new Date(reg.submitted_at).toLocaleDateString()}
                </span>
              </div>

              {reg.guardians && reg.guardians.length > 0 && (
                <div className="mb-4 rounded bg-bgsoft p-3 text-[13px] text-ink">
                  {reg.guardians.map((g, i) => (
                    <p key={i}>
                      {g.relationship ?? "Guardian"}: {g.full_name} —{" "}
                      {g.phone ?? "no phone"} {g.email ? `— ${g.email}` : ""}
                    </p>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => handleApprove(reg)}
                  disabled={processingId === reg.id}
                  className="inline-flex items-center justify-center rounded bg-oxblood px-4 py-2 text-[13.5px] font-semibold text-white transition-all hover:bg-oxblood-dark active:scale-[0.97] disabled:opacity-60"
                >
                  {processingId === reg.id ? "Approving…" : "Approve"}
                </button>
                <button
                  onClick={() => handleReject(reg.id)}
                  disabled={processingId === reg.id}
                  className="inline-flex items-center justify-center rounded border border-bordersoft px-4 py-2 text-[13.5px] font-medium text-ink transition-colors hover:bg-bgsoft disabled:opacity-60"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        ))}

        {registrations.length === 0 && (
          <p className="rounded-md border border-bordersoft bg-white p-6 text-center text-[14px] text-muted">
            No pending registrations.
          </p>
        )}
      </div>
    </div>
  );
}
