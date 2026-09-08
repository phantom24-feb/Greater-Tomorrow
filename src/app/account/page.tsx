import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

interface Guardian {
  id: string;
  relationship: string | null;
  full_name: string;
  phone: string | null;
  email: string | null;
}

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: adminRow } = await supabase
    .from("admins")
    .select("full_name")
    .eq("user_id", user.id)
    .maybeSingle();

  if (adminRow) {
    return (
      <div className="mx-auto max-w-[500px] px-6 py-14">
        <h1 className="mb-1 font-display text-2xl font-semibold text-navy">
          My Account
        </h1>
        <p className="mb-6 text-[14.5px] text-muted">Administrator</p>
        <div className="rounded-md border border-bordersoft bg-white p-5 text-[14px]">
          <p className="mb-2 flex justify-between">
            <span className="text-muted">Name</span>
            <span className="font-medium text-ink">{adminRow.full_name}</span>
          </p>
          <p className="flex justify-between">
            <span className="text-muted">Email</span>
            <span className="font-medium text-ink">{user.email ?? "—"}</span>
          </p>
        </div>
      </div>
    );
  }

  const { data: student } = await supabase
    .from("students")
    .select(
      "*, classes ( name ), guardians ( id, relationship, full_name, phone, email )",
    )
    .eq("user_id", user.id)
    .maybeSingle();

  if (!student) {
    return (
      <div className="mx-auto max-w-[700px] px-6 py-14">
        <p className="text-[14.5px] text-muted">
          No student record is linked to this account.
        </p>
      </div>
    );
  }

  const guardians: Guardian[] = student.guardians ?? [];
  const className = (student.classes as { name: string } | null)?.name ?? "—";

  const fields: { label: string; value: string | null }[] = [
    {
      label: "Full Name",
      value:
        `${student.first_name} ${student.other_name ?? ""} ${student.last_name}`
          .replace(/\s+/g, " ")
          .trim(),
    },
    { label: "Admission Number", value: student.admission_no },
    { label: "Class", value: className },
    { label: "Gender", value: student.gender },
    { label: "Date of Birth", value: student.date_of_birth },
    { label: "Religion", value: student.religion },
    { label: "Address", value: student.address },
    { label: "Previous School", value: student.previous_school },
    { label: "Email", value: student.email },
    { label: "Phone", value: student.phone },
  ];

  return (
    <div className="mx-auto max-w-[700px] px-6 py-10">
      <div className="mb-7 flex items-center gap-4">
        {student.photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={student.photo_url}
            alt={student.first_name}
            className="h-16 w-16 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-bgsoft text-[12px] text-muted">
            No photo
          </div>
        )}
        <div>
          <h1 className="font-display text-2xl font-semibold text-navy">
            My Account
          </h1>
          <p className="text-[14px] text-muted">{student.admission_no}</p>
        </div>
      </div>

      <div className="mb-8 overflow-hidden rounded-md border border-bordersoft bg-white">
        {fields.map((f) => (
          <div
            key={f.label}
            className="flex justify-between border-b border-bordersoft px-5 py-3 text-[14px] last:border-0"
          >
            <span className="text-muted">{f.label}</span>
            <span className="font-medium text-ink">{f.value || "—"}</span>
          </div>
        ))}
      </div>

      <h2 className="mb-3 font-display text-lg font-semibold text-navy">
        Guardians
      </h2>
      <div className="overflow-hidden rounded-md border border-bordersoft bg-white">
        {guardians.length === 0 ? (
          <p className="px-5 py-4 text-[14px] text-muted">
            No guardian info on file.
          </p>
        ) : (
          guardians.map((g) => (
            <div
              key={g.id}
              className="border-b border-bordersoft px-5 py-3 text-[14px] last:border-0"
            >
              <p className="font-medium text-ink">
                {g.relationship ?? "Guardian"}: {g.full_name}
              </p>
              <p className="text-muted">
                {g.phone ?? "—"} {g.email ? `· ${g.email}` : ""}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
