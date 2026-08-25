"use client";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { compressImage } from "@/lib/compress-image";
import { UploadField } from "@/components/upload-field";
type SchoolClass = {
  id: number;
  name: string;
  section: string;
  tuition_fee: number;
};
type FeeRow = { description: string; price: string };
export default function Dashboard() {
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [notice, setNotice] = useState("");
  const [modal, setModal] = useState<
    "class" | "student" | "fees" | "books" | null
  >(null);
  const [studentSection, setStudentSection] = useState("");
  const [feeRows, setFeeRows] = useState<FeeRow[]>([
    { description: "", price: "" },
  ]);
  const router = useRouter();
  function loadClasses() {
    createClient()
      .from("classes")
      .select("id,name,section,tuition_fee")
      .order("section")
      .order("name")
      .then(({ data, error }) => {
        if (error) setNotice(error.message);
        else setClasses(data ?? []);
      });
  }
  useEffect(() => {
    loadClasses();
  }, []);
  async function createClass(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const { error } = await createClient()
      .from("classes")
      .insert({
        name: String(form.get("name")).trim(),
        section: form.get("section"),
      });
    setNotice(error ? error.message : "Class created successfully.");
    if (!error) {
      closeModal();
      loadClasses();
    }
  }
  async function createStudent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const supabase = createClient();
    const passport = form.get("passport") as File;
    let passportUrl: string | null = null;
    if (passport?.size) {
      const compressed = await compressImage(passport, 900, 0.76);
      const upload = await supabase.storage
        .from("student-passports")
        .upload(
          `students/${crypto.randomUUID()}-${compressed.name}`,
          compressed,
          { contentType: compressed.type, cacheControl: "31536000" },
        );
      if (upload.error) {
        setNotice(upload.error.message);
        return;
      }
      passportUrl = supabase.storage
        .from("student-passports")
        .getPublicUrl(upload.data.path).data.publicUrl;
    }
    const firstName = String(form.get("first_name")).trim();
    const lastName = String(form.get("last_name")).trim();
    const { error } = await supabase
      .from("students")
      .insert({
        first_name: firstName,
        last_name: lastName,
        full_name: `${firstName} ${lastName}`,
        reg_number: String(form.get("reg_number")).trim(),
        class_id: Number(form.get("class_id")),
        access_pin: String(form.get("access_pin")),
        gender: form.get("gender"),
        passport_url: passportUrl,
        parent_guardian_name: form.get("parent_guardian_name"),
        parent_guardian_phone: form.get("parent_guardian_phone"),
        country_of_origin: form.get("country_of_origin"),
        state_of_origin: form.get("state_of_origin"),
        local_government_of_origin: form.get("local_government_of_origin"),
      });
    setNotice(error ? error.message : "Student profile saved.");
    if (!error) closeModal();
  }
  async function saveTuition(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const classId = Number(new FormData(event.currentTarget).get("class_id"));
    const rows = feeRows
      .filter((row) => row.description.trim() && row.price !== "")
      .map((row) => ({
        class_id: classId,
        description: row.description.trim(),
        price: Number(row.price),
      }));
    if (
      !rows.length ||
      rows.some((row) => row.price < 0 || Number.isNaN(row.price))
    ) {
      setNotice("Add a description and valid price for at least one fee.");
      return;
    }
    const { error } = await createClient().from("tuition_items").insert(rows);
    setNotice(error ? error.message : "Tuition items saved successfully.");
    if (!error) closeModal();
  }
  async function addBook(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const supabase = createClient();
    const cover = form.get("cover") as File;
    let coverUrl: string | null = null;
    if (cover?.size) {
      const compressed = await compressImage(cover, 1200, 0.8);
      const upload = await supabase.storage
        .from("book-covers")
        .upload(`books/${crypto.randomUUID()}-${compressed.name}`, compressed, {
          contentType: compressed.type,
          cacheControl: "31536000",
        });
      if (upload.error) {
        setNotice(upload.error.message);
        return;
      }
      coverUrl = supabase.storage
        .from("book-covers")
        .getPublicUrl(upload.data.path).data.publicUrl;
    }
    const { error } = await supabase
      .from("books")
      .insert({
        class_id: Number(form.get("class_id")),
        subject: form.get("subject"),
        book_title: form.get("book_title"),
        author: form.get("author"),
        cover_url: coverUrl,
      });
    setNotice(
      error ? error.message : "Recommended book uploaded successfully.",
    );
    if (!error) closeModal();
  }
  async function signOut() {
    await createClient().auth.signOut();
    router.push("/admin");
  }
  function closeModal() {
    setModal(null);
    setStudentSection("");
    setFeeRows([{ description: "", price: "" }]);
  }
  const filteredClasses = classes.filter(
    (item) => item.section === studentSection,
  );
  return (
    <main className="paper-grid min-h-screen px-4 pb-24 pt-8 sm:px-6 sm:pt-12 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.3em] text-[#d94848]">
              Authenticated workspace
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-6xl">
              School data,
              <br />
              <span className="text-[#d94848]">your structure.</span>
            </h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => router.push("/admin/dashboard/students")}
              className="rounded-full border border-[#123b70]/20 px-3 py-2 text-xs font-bold sm:px-4 sm:text-sm"
            >
              View students
            </button>
            <button
              type="button"
              onClick={signOut}
              className="rounded-full border border-[#123b70]/20 px-3 py-2 text-xs font-bold sm:px-4 sm:text-sm"
            >
              Sign out
            </button>
          </div>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <ActionButton
            index="01 / Classes"
            title="Create a class"
            text="Add a custom class without a tuition field."
            onClick={() => setModal("class")}
            dark
          />
          <ActionButton
            index="02 / Students"
            title="Add student profile"
            text="Save a complete learner profile."
            onClick={() => setModal("student")}
          />
          <ActionButton
            index="03 / Tuition"
            title="Edit tuition"
            text="Add multiple fees per class."
            onClick={() => setModal("fees")}
          />
          <ActionButton
            index="04 / Books"
            title="Upload books"
            text="Add book details and a cover image."
            onClick={() => setModal("books")}
          />
        </div>
        {notice && (
          <p className="mt-6 rounded-xl bg-[#d94848] px-5 py-4 text-sm font-semibold text-white">
            {notice}
          </p>
        )}
        {modal === "class" && (
          <Modal title="Create a custom class" onClose={closeModal}>
            <form onSubmit={createClass}>
              <input
                required
                name="name"
                placeholder="Class name e.g. JSS1 B"
                className="field"
              />
              <select required name="section" className="field">
                <option value="nursery">Nursery</option>
                <option value="primary">Primary</option>
                <option value="secondary">Secondary</option>
              </select>
              <ModalActions onCancel={closeModal} label="Create class" />
            </form>
          </Modal>
        )}
        {modal === "fees" && (
          <Modal title="Add tuition fees" onClose={closeModal}>
            <form onSubmit={saveTuition}>
              <select required name="class_id" className="field">
                <option value="">Select class</option>
                {classes.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
              {feeRows.map((row, index) => (
                <div key={index} className="mt-3 flex gap-2">
                  <input
                    required
                    value={row.description}
                    onChange={(event) =>
                      setFeeRows((current) =>
                        current.map((item, itemIndex) =>
                          itemIndex === index
                            ? { ...item, description: event.target.value }
                            : item,
                        ),
                      )
                    }
                    placeholder="Description"
                    className="field mt-0"
                  />
                  <input
                    required
                    value={row.price}
                    onChange={(event) =>
                      setFeeRows((current) =>
                        current.map((item, itemIndex) =>
                          itemIndex === index
                            ? { ...item, price: event.target.value }
                            : item,
                        ),
                      )
                    }
                    type="number"
                    min="0"
                    placeholder="Price"
                    className="field mt-0 max-w-[140px]"
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={() =>
                  setFeeRows((current) => [
                    ...current,
                    { description: "", price: "" },
                  ])
                }
                className="mt-4 rounded-lg border border-[#123b70]/20 px-4 py-2 font-bold text-[#123b70]"
              >
                + Add another fee
              </button>
              <ModalActions onCancel={closeModal} label="Save tuition" />
            </form>
          </Modal>
        )}
        {modal === "books" && (
          <Modal title="Upload recommended book" onClose={closeModal}>
            <form onSubmit={addBook}>
              <select required name="class_id" className="field">
                <option value="">Select class</option>
                {classes.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
              <input
                required
                name="book_title"
                placeholder="Book title"
                className="field"
              />
              <input
                required
                name="subject"
                placeholder="Subject"
                className="field"
              />
              <input
                required
                name="author"
                placeholder="Author"
                className="field"
              />
              <UploadField name="cover" label="Book cover image" />
              <ModalActions onCancel={closeModal} label="Upload book" />
            </form>
          </Modal>
        )}
        {modal === "student" && (
          <Modal title="Add student profile" onClose={closeModal}>
            <form onSubmit={createStudent}>
              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  required
                  name="first_name"
                  placeholder="First name"
                  className="field mt-0"
                />
                <input
                  required
                  name="last_name"
                  placeholder="Last name"
                  className="field mt-0"
                />
              </div>
              <input
                required
                name="reg_number"
                placeholder="Registration number"
                className="field"
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <select
                  required
                  name="section"
                  value={studentSection}
                  onChange={(event) => setStudentSection(event.target.value)}
                  className="field"
                >
                  <option value="">Select section</option>
                  <option value="nursery">Nursery</option>
                  <option value="primary">Primary</option>
                  <option value="secondary">Secondary</option>
                </select>
                <select
                  required
                  name="class_id"
                  disabled={!studentSection}
                  className="field"
                >
                  <option value="">
                    {studentSection ? "Select class" : "Select section first"}
                  </option>
                  {filteredClasses.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>
              <select required name="gender" className="field">
                <option value="">Gender</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other</option>
              </select>
              <input
                required
                name="access_pin"
                inputMode="numeric"
                placeholder="Student result PIN"
                className="field"
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  required
                  name="parent_guardian_name"
                  placeholder="Parent or guardian name"
                  className="field mt-0"
                />
                <input
                  required
                  name="parent_guardian_phone"
                  type="tel"
                  placeholder="Parent or guardian phone"
                  className="field mt-0"
                />
                <input
                  required
                  name="country_of_origin"
                  placeholder="Country of origin"
                  className="field mt-0"
                />
                <input
                  required
                  name="state_of_origin"
                  placeholder="State of origin"
                  className="field mt-0"
                />
                <input
                  required
                  name="local_government_of_origin"
                  placeholder="Local government of origin"
                  className="field mt-0"
                />
              </div>
              <UploadField name="passport" label="Student passport image" />
              <ModalActions onCancel={closeModal} label="Save student" />
            </form>
          </Modal>
        )}
      </div>
    </main>
  );
}
function ActionButton({
  index,
  title,
  text,
  onClick,
  dark = false,
}: {
  index: string;
  title: string;
  text: string;
  onClick: () => void;
  dark?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl p-6 text-left transition hover:-translate-y-1 ${dark ? "bg-[#123b70] text-white" : "border border-[#123b70]/15 bg-white text-[#123b70]"}`}
    >
      <p className="text-xs font-bold uppercase tracking-widest text-[#d94848]">
        {index}
      </p>
      <h2 className="mt-8 text-2xl font-bold">{title}</h2>
      <p
        className={`mt-2 text-sm ${dark ? "text-white/75" : "text-[#123b70]/70"}`}
      >
        {text}
      </p>
      <span className="mt-6 inline-block rounded-lg bg-[#d94848] px-4 py-3 text-sm font-bold text-white">
        Open form ↗
      </span>
    </button>
  );
}
function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center overflow-y-auto bg-[#123b70]/60 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-6 text-[#123b70] shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-2xl"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}
function ModalActions({
  onCancel,
  label,
}: {
  onCancel: () => void;
  label: string;
}) {
  return (
    <div className="mt-5 flex gap-3">
      <button
        type="button"
        onClick={onCancel}
        className="w-full rounded-lg border border-[#123b70]/20 px-4 py-3 font-bold"
      >
        Cancel
      </button>
      <button
        type="submit"
        className="w-full rounded-lg bg-[#d94848] px-4 py-3 font-bold text-white"
      >
        {label}
      </button>
    </div>
  );
}
