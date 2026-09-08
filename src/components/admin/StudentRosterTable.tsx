"use client";

import { Fragment, useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { compressAndUploadImage } from "@/lib/storage/uploadImage";

interface Guardian {
  id: string;
  relationship: string | null;
  full_name: string;
  phone: string | null;
  email: string | null;
}

export interface RosterStudent {
  id: string;
  admission_no: string;
  first_name: string;
  last_name: string;
  other_name: string | null;
  gender: string | null;
  date_of_birth: string | null;
  status: string;
  photo_url: string | null;
  guardians: Guardian[];
}

export default function StudentRosterTable({
  initialStudents,
}: {
  initialStudents: RosterStudent[];
}) {
  const [students, setStudents] = useState<RosterStudent[]>(initialStudents);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  async function handlePhotoChange(studentId: string, file: File) {
    setError(null);
    setUploadingId(studentId);

    try {
      const url = await compressAndUploadImage(file, {
        bucket: "student-photos",
      });

      const { error: updateError } = await supabase
        .from("students")
        .update({ photo_url: url })
        .eq("id", studentId);

      if (updateError) throw new Error(updateError.message);

      setStudents((prev) =>
        prev.map((s) => (s.id === studentId ? { ...s, photo_url: url } : s)),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not upload photo.");
    } finally {
      setUploadingId(null);
    }
  }

  return (
    <div>
      {error && <p className="mb-4 text-[13.5px] text-oxblood">{error}</p>}

      <div className="overflow-x-auto rounded-md border border-bordersoft bg-white">
        <table className="w-full text-left text-[13.5px]">
          <thead>
            <tr className="border-b border-bordersoft bg-bgsoft text-ink">
              <th className="px-4 py-2.5 font-medium">Photo</th>
              <th className="px-4 py-2.5 font-medium">Admission No</th>
              <th className="px-4 py-2.5 font-medium">Name</th>
              <th className="px-4 py-2.5 font-medium">Status</th>
              <th className="px-4 py-2.5 font-medium" />
            </tr>
          </thead>
          <tbody>
            {students.map((s) => {
              const isOpen = expandedId === s.id;
              const isUploading = uploadingId === s.id;

              return (
                <Fragment key={s.id}>
                  <tr className="border-b border-bordersoft last:border-0">
                    <td className="px-4 py-2.5">
                      <label className="group relative block h-10 w-10 cursor-pointer">
                        {s.photo_url ? (
                          <Image
                            src={s.photo_url}
                            alt={`${s.first_name} ${s.last_name}`}
                            width={40}
                            height={40}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-bgsoft text-[10px] text-muted">
                            None
                          </div>
                        )}
                        <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 text-[9px] font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
                          {isUploading ? "…" : "Edit"}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={isUploading}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handlePhotoChange(s.id, file);
                          }}
                        />
                      </label>
                    </td>
                    <td className="px-4 py-2.5">{s.admission_no}</td>
                    <td className="px-4 py-2.5">
                      {s.first_name} {s.other_name} {s.last_name}
                    </td>
                    <td className="px-4 py-2.5 capitalize">{s.status}</td>
                    <td className="px-4 py-2.5">
                      <button
                        onClick={() => setExpandedId(isOpen ? null : s.id)}
                        className="text-[13px] font-medium text-oxblood hover:underline"
                      >
                        {isOpen ? "Hide" : "Details"}
                      </button>
                    </td>
                  </tr>
                  {isOpen && (
                    <tr className="border-b border-bordersoft bg-bgsoft last:border-0">
                      <td colSpan={5} className="px-4 py-4">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div>
                            <p className="mb-1 text-[12px] font-medium uppercase tracking-wide text-muted">
                              Student Info
                            </p>
                            <p className="text-[13.5px] text-ink">
                              Gender: {s.gender ?? "—"}
                            </p>
                            <p className="text-[13.5px] text-ink">
                              Date of birth: {s.date_of_birth ?? "—"}
                            </p>
                          </div>
                          <div>
                            <p className="mb-1 text-[12px] font-medium uppercase tracking-wide text-muted">
                              Guardians
                            </p>
                            {s.guardians.length === 0 ? (
                              <p className="text-[13.5px] text-muted">
                                No guardian info on file.
                              </p>
                            ) : (
                              s.guardians.map((g) => (
                                <p
                                  key={g.id}
                                  className="text-[13.5px] text-ink"
                                >
                                  {g.relationship ?? "Guardian"}: {g.full_name}
                                  {g.phone ? ` — ${g.phone}` : ""}
                                  {g.email ? ` — ${g.email}` : ""}
                                </p>
                              ))
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
            {students.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-4 text-muted">
                  No students in this class yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
