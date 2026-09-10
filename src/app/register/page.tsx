"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PublicHeader from "@/components/layout/PublicHeader";
import { createClient } from "@/lib/supabase/client";
import { compressAndUploadImage } from "@/lib/storage/uploadImage";

type Step = "student" | "guardians" | "review" | "done";

interface ClassOption {
  id: string;
  name: string;
}

interface StudentInfo {
  firstName: string;
  lastName: string;
  otherName: string;
  dateOfBirth: string;
  gender: string;
  nationality: string;
  stateOfOrigin: string;
  lga: string;
  religion: string;
  bloodGroup: string;
  genotype: string;
  address: string;
  previousSchool: string;
  classApplyingFor: string;
  sessionApplyingFor: string;
  medicalNotes: string;
}

interface GuardianInfo {
  relationship: string;
  fullName: string;
  phone: string;
  email: string;
  occupation: string;
  religion: string;
  address: string;
}

const emptyStudent: StudentInfo = {
  firstName: "",
  lastName: "",
  otherName: "",
  dateOfBirth: "",
  gender: "",
  nationality: "Nigerian",
  stateOfOrigin: "",
  lga: "",
  religion: "",
  bloodGroup: "",
  genotype: "",
  address: "",
  previousSchool: "",
  classApplyingFor: "",
  sessionApplyingFor: "2026/2027",
  medicalNotes: "",
};

const emptyGuardian: GuardianInfo = {
  relationship: "Father",
  fullName: "",
  phone: "",
  email: "",
  occupation: "",
  religion: "",
  address: "",
};

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const GENOTYPES = ["AA", "AS", "SS", "AC"];

export default function RegisterPage() {
  const [step, setStep] = useState<Step>("student");
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [student, setStudent] = useState<StudentInfo>(emptyStudent);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [guardians, setGuardians] = useState<GuardianInfo[]>([
    { ...emptyGuardian },
  ]);
  const [declarationAccepted, setDeclarationAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadClasses() {
      const supabase = createClient();
      const { data } = await supabase
        .from("classes")
        .select("id, name")
        .order("level");
      setClasses(data ?? []);
    }
    loadClasses();
  }, []);

  function updateStudent(field: keyof StudentInfo, value: string) {
    setStudent((prev) => ({ ...prev, [field]: value }));
  }

  function updateGuardian(
    index: number,
    field: keyof GuardianInfo,
    value: string,
  ) {
    setGuardians((prev) =>
      prev.map((g, i) => (i === index ? { ...g, [field]: value } : g)),
    );
  }

  function addGuardian() {
    setGuardians((prev) => [
      ...prev,
      { ...emptyGuardian, relationship: "Guardian" },
    ]);
  }

  function removeGuardian(index: number) {
    setGuardians((prev) => prev.filter((_, i) => i !== index));
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  function handleStudentContinue(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const required: [string, string][] = [
      [student.firstName, "First name"],
      [student.lastName, "Last name"],
      [student.dateOfBirth, "Date of birth"],
      [student.gender, "Gender"],
      [student.nationality, "Nationality"],
      [student.stateOfOrigin, "State of origin"],
      [student.lga, "Local government area"],
      [student.religion, "Religion"],
      [student.bloodGroup, "Blood group"],
      [student.genotype, "Genotype"],
      [student.address, "Home address"],
      [
        student.previousSchool,
        'Previous school (write "None" if not applicable)',
      ],
      [student.classApplyingFor, "Class applying for"],
      [student.sessionApplyingFor, "Session applying for"],
      [student.medicalNotes, 'Medical notes (write "None" if not applicable)'],
    ];

    const missing = required.find(([value]) => !value.trim());
    if (missing) {
      setError(`${missing[1]} is required.`);
      return;
    }

    if (!photoFile) {
      setError("A student photo is required.");
      return;
    }

    setStep("guardians");
  }

  function handleGuardiansContinue(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    for (const [index, g] of guardians.entries()) {
      const required: [string, string][] = [
        [g.fullName, "Full name"],
        [g.phone, "Phone number"],
        [g.email, "Email"],
        [g.occupation, "Occupation"],
        [g.religion, "Religion"],
        [g.address, "Address"],
      ];
      const missing = required.find(([value]) => !value.trim());
      if (missing) {
        setError(`Guardian ${index + 1}: ${missing[1]} is required.`);
        return;
      }
    }

    setStep("review");
  }

  async function handleSubmit() {
    setError(null);

    if (!declarationAccepted) {
      setError("Please confirm the declaration before submitting.");
      return;
    }

    setSubmitting(true);

    const supabase = createClient();

    let photoUrl: string | null = null;
    if (photoFile) {
      try {
        photoUrl = await compressAndUploadImage(photoFile, {
          bucket: "student-photos",
        });
      } catch (err) {
        setSubmitting(false);
        setError(
          err instanceof Error ? err.message : "Could not upload photo.",
        );
        return;
      }
    }

    const guardianPayload = guardians.map((g) => ({
      relationship: g.relationship,
      full_name: g.fullName.trim(),
      phone: g.phone.trim(),
      email: g.email.trim(),
      occupation: g.occupation.trim(),
      religion: g.religion.trim(),
      address: g.address.trim(),
    }));

    const { error: insertError } = await supabase.from("registrations").insert({
      first_name: student.firstName.trim(),
      last_name: student.lastName.trim(),
      other_name: student.otherName.trim() || null,
      date_of_birth: student.dateOfBirth,
      gender: student.gender,
      religion: student.religion.trim(),
      address: student.address.trim(),
      previous_school: student.previousSchool.trim(),
      class_applying_for: student.classApplyingFor,
      photo_url: photoUrl,
      guardians: guardianPayload,
      status: "pending",
    });

    setSubmitting(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    setStep("done");
  }

  const className =
    classes.find((c) => c.id === student.classApplyingFor)?.name ?? "—";

  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />

      <div className="mx-auto max-w-[640px] px-6 py-14">
        <h1 className="mb-1 font-display text-3xl font-semibold text-navy">
          Online Registration
        </h1>
        <p className="mb-8 text-[15px] text-muted">
          Apply for admission. All fields are required. Applications are
          reviewed by the school office before an admission number is assigned.
        </p>

        {step !== "done" && (
          <div className="mb-8 flex items-center gap-2 text-[12.5px] font-medium text-muted">
            <span className={step === "student" ? "text-oxblood" : ""}>
              1. Student
            </span>
            <span>—</span>
            <span className={step === "guardians" ? "text-oxblood" : ""}>
              2. Parent/Guardian
            </span>
            <span>—</span>
            <span className={step === "review" ? "text-oxblood" : ""}>
              3. Review & Declaration
            </span>
          </div>
        )}

        {error && <p className="mb-5 text-[13.5px] text-oxblood">{error}</p>}

        {/* STEP 1: Student Info */}
        {step === "student" && (
          <form
            onSubmit={handleStudentContinue}
            className="flex flex-col gap-4"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-[13.5px] font-medium text-ink">
                  First Name *
                </label>
                <input
                  type="text"
                  value={student.firstName}
                  onChange={(e) => updateStudent("firstName", e.target.value)}
                  className="w-full rounded border border-bordersoft px-3.5 py-2.5 text-[15px] outline-none focus:border-navy"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[13.5px] font-medium text-ink">
                  Last Name *
                </label>
                <input
                  type="text"
                  value={student.lastName}
                  onChange={(e) => updateStudent("lastName", e.target.value)}
                  className="w-full rounded border border-bordersoft px-3.5 py-2.5 text-[15px] outline-none focus:border-navy"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-[13.5px] font-medium text-ink">
                Other Name
              </label>
              <input
                type="text"
                value={student.otherName}
                onChange={(e) => updateStudent("otherName", e.target.value)}
                className="w-full rounded border border-bordersoft px-3.5 py-2.5 text-[15px] outline-none focus:border-navy"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-[13.5px] font-medium text-ink">
                  Date of Birth *
                </label>
                <input
                  type="date"
                  value={student.dateOfBirth}
                  onChange={(e) => updateStudent("dateOfBirth", e.target.value)}
                  className="w-full rounded border border-bordersoft px-3.5 py-2.5 text-[15px] outline-none focus:border-navy"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[13.5px] font-medium text-ink">
                  Gender *
                </label>
                <select
                  value={student.gender}
                  onChange={(e) => updateStudent("gender", e.target.value)}
                  className="w-full rounded border border-bordersoft px-3.5 py-2.5 text-[15px] outline-none focus:border-navy"
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-[13.5px] font-medium text-ink">
                  Nationality *
                </label>
                <input
                  type="text"
                  value={student.nationality}
                  onChange={(e) => updateStudent("nationality", e.target.value)}
                  className="w-full rounded border border-bordersoft px-3.5 py-2.5 text-[15px] outline-none focus:border-navy"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[13.5px] font-medium text-ink">
                  State of Origin *
                </label>
                <input
                  type="text"
                  value={student.stateOfOrigin}
                  onChange={(e) =>
                    updateStudent("stateOfOrigin", e.target.value)
                  }
                  className="w-full rounded border border-bordersoft px-3.5 py-2.5 text-[15px] outline-none focus:border-navy"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[13.5px] font-medium text-ink">
                  L.G.A. *
                </label>
                <input
                  type="text"
                  value={student.lga}
                  onChange={(e) => updateStudent("lga", e.target.value)}
                  className="w-full rounded border border-bordersoft px-3.5 py-2.5 text-[15px] outline-none focus:border-navy"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-[13.5px] font-medium text-ink">
                Religion *
              </label>
              <input
                type="text"
                value={student.religion}
                onChange={(e) => updateStudent("religion", e.target.value)}
                className="w-full rounded border border-bordersoft px-3.5 py-2.5 text-[15px] outline-none focus:border-navy"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-[13.5px] font-medium text-ink">
                  Blood Group *
                </label>
                <select
                  value={student.bloodGroup}
                  onChange={(e) => updateStudent("bloodGroup", e.target.value)}
                  className="w-full rounded border border-bordersoft px-3.5 py-2.5 text-[15px] outline-none focus:border-navy"
                >
                  <option value="">Select</option>
                  {BLOOD_GROUPS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-[13.5px] font-medium text-ink">
                  Genotype *
                </label>
                <select
                  value={student.genotype}
                  onChange={(e) => updateStudent("genotype", e.target.value)}
                  className="w-full rounded border border-bordersoft px-3.5 py-2.5 text-[15px] outline-none focus:border-navy"
                >
                  <option value="">Select</option>
                  {GENOTYPES.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-[13.5px] font-medium text-ink">
                Home Address *
              </label>
              <textarea
                rows={2}
                value={student.address}
                onChange={(e) => updateStudent("address", e.target.value)}
                className="w-full resize-none rounded border border-bordersoft px-3.5 py-2.5 text-[15px] outline-none focus:border-navy"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[13.5px] font-medium text-ink">
                Previous School *
              </label>
              <input
                type="text"
                value={student.previousSchool}
                onChange={(e) =>
                  updateStudent("previousSchool", e.target.value)
                }
                placeholder='Write "None" if this is the first school'
                className="w-full rounded border border-bordersoft px-3.5 py-2.5 text-[15px] outline-none focus:border-navy"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-[13.5px] font-medium text-ink">
                  Class Applying For *
                </label>
                <select
                  value={student.classApplyingFor}
                  onChange={(e) =>
                    updateStudent("classApplyingFor", e.target.value)
                  }
                  className="w-full rounded border border-bordersoft px-3.5 py-2.5 text-[15px] outline-none focus:border-navy"
                >
                  <option value="">Select class</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-[13.5px] font-medium text-ink">
                  Session Applying For *
                </label>
                <input
                  type="text"
                  value={student.sessionApplyingFor}
                  onChange={(e) =>
                    updateStudent("sessionApplyingFor", e.target.value)
                  }
                  className="w-full rounded border border-bordersoft px-3.5 py-2.5 text-[15px] outline-none focus:border-navy"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-[13.5px] font-medium text-ink">
                Known Allergies / Medical Conditions *
              </label>
              <textarea
                rows={2}
                value={student.medicalNotes}
                onChange={(e) => updateStudent("medicalNotes", e.target.value)}
                placeholder='Write "None" if not applicable'
                className="w-full resize-none rounded border border-bordersoft px-3.5 py-2.5 text-[15px] outline-none focus:border-navy"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[13.5px] font-medium text-ink">
                Student Photo *
              </label>
              <div className="flex items-center gap-4">
                {photoPreview && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="h-16 w-16 rounded-full object-cover"
                  />
                )}
                <label className="inline-flex cursor-pointer items-center justify-center rounded border border-bordersoft px-4 py-2 text-[13.5px] font-medium text-ink transition-colors hover:bg-bgsoft">
                  {photoFile ? "Change photo" : "Choose photo"}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="mt-1.5 text-[12px] text-muted">
                A clear, recent passport-style photo.
              </p>
            </div>

            <button
              type="submit"
              className="mt-2 inline-flex items-center justify-center self-start rounded bg-oxblood px-6 py-3 text-[15px] font-semibold text-white transition-all hover:bg-oxblood-dark active:scale-[0.97]"
            >
              Continue
            </button>
          </form>
        )}

        {/* STEP 2: Guardian Info */}
        {step === "guardians" && (
          <form
            onSubmit={handleGuardiansContinue}
            className="flex flex-col gap-6"
          >
            {guardians.map((g, index) => (
              <div
                key={index}
                className="rounded-md border border-bordersoft p-5"
              >
                <div className="mb-4 flex items-center justify-between">
                  <p className="font-display text-[15px] font-semibold text-navy">
                    Parent/Guardian {index + 1}
                  </p>
                  {guardians.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeGuardian(index)}
                      className="text-[13px] font-medium text-oxblood hover:underline"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="flex flex-col gap-4">
                  <div>
                    <label className="mb-1.5 block text-[13.5px] font-medium text-ink">
                      Relationship *
                    </label>
                    <select
                      value={g.relationship}
                      onChange={(e) =>
                        updateGuardian(index, "relationship", e.target.value)
                      }
                      className="w-full rounded border border-bordersoft px-3.5 py-2.5 text-[15px] outline-none focus:border-navy"
                    >
                      <option value="Father">Father</option>
                      <option value="Mother">Mother</option>
                      <option value="Guardian">Guardian</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-[13.5px] font-medium text-ink">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={g.fullName}
                        onChange={(e) =>
                          updateGuardian(index, "fullName", e.target.value)
                        }
                        className="w-full rounded border border-bordersoft px-3.5 py-2.5 text-[15px] outline-none focus:border-navy"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[13.5px] font-medium text-ink">
                        Phone *
                      </label>
                      <input
                        type="tel"
                        value={g.phone}
                        onChange={(e) =>
                          updateGuardian(index, "phone", e.target.value)
                        }
                        className="w-full rounded border border-bordersoft px-3.5 py-2.5 text-[15px] outline-none focus:border-navy"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-[13.5px] font-medium text-ink">
                        Email *
                      </label>
                      <input
                        type="email"
                        value={g.email}
                        onChange={(e) =>
                          updateGuardian(index, "email", e.target.value)
                        }
                        className="w-full rounded border border-bordersoft px-3.5 py-2.5 text-[15px] outline-none focus:border-navy"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[13.5px] font-medium text-ink">
                        Occupation *
                      </label>
                      <input
                        type="text"
                        value={g.occupation}
                        onChange={(e) =>
                          updateGuardian(index, "occupation", e.target.value)
                        }
                        className="w-full rounded border border-bordersoft px-3.5 py-2.5 text-[15px] outline-none focus:border-navy"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-[13.5px] font-medium text-ink">
                        Religion *
                      </label>
                      <input
                        type="text"
                        value={g.religion}
                        onChange={(e) =>
                          updateGuardian(index, "religion", e.target.value)
                        }
                        className="w-full rounded border border-bordersoft px-3.5 py-2.5 text-[15px] outline-none focus:border-navy"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[13.5px] font-medium text-ink">
                        Address *
                      </label>
                      <input
                        type="text"
                        value={g.address}
                        onChange={(e) =>
                          updateGuardian(index, "address", e.target.value)
                        }
                        className="w-full rounded border border-bordersoft px-3.5 py-2.5 text-[15px] outline-none focus:border-navy"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addGuardian}
              className="self-start text-[13.5px] font-medium text-oxblood hover:underline"
            >
              + Add another parent/guardian
            </button>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep("student")}
                className="inline-flex items-center justify-center rounded border border-bordersoft px-6 py-3 text-[15px] font-medium text-ink transition-colors hover:bg-bgsoft"
              >
                Back
              </button>
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded bg-oxblood px-6 py-3 text-[15px] font-semibold text-white transition-all hover:bg-oxblood-dark active:scale-[0.97]"
              >
                Continue
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: Review & Declaration */}
        {step === "review" && (
          <div className="flex flex-col gap-6">
            <div className="rounded-md border border-bordersoft bg-white p-5">
              <p className="mb-3 font-display text-[15px] font-semibold text-navy">
                Student
              </p>
              <p className="text-[14px] text-ink">
                {student.firstName} {student.otherName} {student.lastName}
              </p>
              <p className="text-[13.5px] text-muted">
                {className} · {student.sessionApplyingFor} · DOB{" "}
                {student.dateOfBirth} · {student.gender}
              </p>
              <p className="text-[13.5px] text-muted">
                {student.nationality} · {student.stateOfOrigin} ({student.lga})
                · {student.religion}
              </p>
              <p className="text-[13.5px] text-muted">
                Blood group {student.bloodGroup} · Genotype {student.genotype}
              </p>
              <p className="text-[13.5px] text-muted">
                Previous school: {student.previousSchool}
              </p>
              <p className="text-[13.5px] text-muted">
                Medical notes: {student.medicalNotes}
              </p>
            </div>

            <div className="rounded-md border border-bordersoft bg-white p-5">
              <p className="mb-3 font-display text-[15px] font-semibold text-navy">
                Parent/Guardian(s)
              </p>
              {guardians.map((g, i) => (
                <p key={i} className="text-[14px] text-ink">
                  {g.relationship}: {g.fullName} — {g.phone} — {g.email}
                </p>
              ))}
            </div>

            <label className="flex items-start gap-2.5 rounded-md border border-bordersoft bg-bgsoft p-4 text-[13.5px] text-ink">
              <input
                type="checkbox"
                checked={declarationAccepted}
                onChange={(e) => setDeclarationAccepted(e.target.checked)}
                className="mt-0.5"
              />
              <span>
                I/We declare that the information provided in this application
                is true and correct to the best of my/our knowledge, and
                understand that false information may result in the application
                being rejected or admission withdrawn.
              </span>
            </label>

            <div className="flex gap-3">
              <button
                onClick={() => setStep("guardians")}
                disabled={submitting}
                className="inline-flex items-center justify-center rounded border border-bordersoft px-6 py-3 text-[15px] font-medium text-ink transition-colors hover:bg-bgsoft disabled:opacity-60"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting || !declarationAccepted}
                className="inline-flex items-center justify-center rounded bg-oxblood px-6 py-3 text-[15px] font-semibold text-white transition-all hover:bg-oxblood-dark active:scale-[0.97] disabled:opacity-50"
              >
                {submitting ? "Submitting…" : "Submit application"}
              </button>
            </div>
          </div>
        )}

        {/* DONE */}
        {step === "done" && (
          <div className="rounded-md border border-bordersoft bg-white p-8 text-center">
            <p className="mb-2 font-display text-xl font-semibold text-navy">
              Application submitted
            </p>
            <p className="mb-6 text-[14.5px] text-muted">
              The school office will review your application. Once approved, an
              admission number will be assigned and you&apos;ll be able to
              create a login at{" "}
              <Link
                href="/create-account"
                className="text-oxblood hover:underline"
              >
                /create-account
              </Link>
              .
            </p>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded bg-navy px-6 py-3 text-[15px] font-semibold text-white transition-all hover:bg-navy-ink active:scale-[0.97]"
            >
              Back to homepage
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
