"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { compressAndUploadImage } from "@/lib/storage/uploadImage";

interface ClassOption {
  id: string;
  name: string;
}

interface Book {
  id: string;
  class_id: string;
  subject: string | null;
  title: string;
  author: string | null;
  cover_image_url: string | null;
  is_required: boolean;
}

export default function AdminBooksPage() {
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [classId, setClassId] = useState("");
  const [subject, setSubject] = useState("");
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [isRequired, setIsRequired] = useState(true);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  async function loadData() {
    const [{ data: classData }, { data: bookData }] = await Promise.all([
      supabase.from("classes").select("id, name").order("level"),
      supabase
        .from("books")
        .select(
          "id, class_id, subject, title, author, cover_image_url, is_required",
        )
        .order("created_at", { ascending: false }),
    ]);
    setClasses(classData ?? []);
    setBooks(bookData ?? []);
  }

  useEffect(() => {
    loadData();
  }, []);

  function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!classId || !title.trim()) {
      setError("Class and book title are required.");
      return;
    }

    setLoading(true);

    let coverImageUrl: string | null = null;
    if (coverFile) {
      setUploadingCover(true);
      try {
        coverImageUrl = await compressAndUploadImage(coverFile, {
          bucket: "book-covers",
        });
      } catch (err) {
        setUploadingCover(false);
        setLoading(false);
        setError(
          err instanceof Error ? err.message : "Could not upload cover image.",
        );
        return;
      }
      setUploadingCover(false);
    }

    const { error: insertError } = await supabase.from("books").insert({
      class_id: classId,
      subject: subject.trim() || null,
      title: title.trim(),
      author: author.trim() || null,
      cover_image_url: coverImageUrl,
      is_required: isRequired,
    });

    setLoading(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    setSubject("");
    setTitle("");
    setAuthor("");
    setIsRequired(true);
    setCoverFile(null);
    setCoverPreview(null);
    loadData();
  }

  async function handleDelete(id: string) {
    await supabase.from("books").delete().eq("id", id);
    loadData();
  }

  return (
    <div className="mx-auto max-w-[900px] px-6 py-10">
      <h1 className="mb-1 font-display text-2xl font-semibold text-navy">
        Recommended Books
      </h1>
      <p className="mb-7 text-[14.5px] text-muted">
        Manage the book list shown per class.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mb-10 grid grid-cols-1 gap-4 rounded-md border border-bordersoft bg-white p-6 sm:grid-cols-2"
      >
        <div>
          <label className="mb-1.5 block text-[13.5px] font-medium text-ink">
            Class
          </label>
          <select
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
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
            Subject
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full rounded border border-bordersoft px-3.5 py-2.5 text-[15px] outline-none focus:border-navy"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-[13.5px] font-medium text-ink">
            Book Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded border border-bordersoft px-3.5 py-2.5 text-[15px] outline-none focus:border-navy"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-[13.5px] font-medium text-ink">
            Author
          </label>
          <input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="w-full rounded border border-bordersoft px-3.5 py-2.5 text-[15px] outline-none focus:border-navy"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-[13.5px] font-medium text-ink">
            Cover Image (optional)
          </label>
          <div className="flex items-center gap-4">
            {coverPreview && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={coverPreview}
                alt="Cover preview"
                className="h-16 w-12 rounded object-cover"
              />
            )}
            <label className="inline-flex cursor-pointer items-center justify-center rounded border border-bordersoft px-4 py-2 text-[13.5px] font-medium text-ink transition-colors hover:bg-bgsoft">
              {coverFile ? "Change image" : "Choose image"}
              <input
                type="file"
                accept="image/*"
                onChange={handleCoverChange}
                className="hidden"
              />
            </label>
            {uploadingCover && (
              <span className="text-[13px] text-muted">
                Compressing & uploading…
              </span>
            )}
          </div>
          <p className="mt-1.5 text-[12px] text-muted">
            Images are automatically compressed before upload to keep storage
            usage low.
          </p>
        </div>

        <label className="flex items-center gap-2 text-[14px] text-ink sm:col-span-2">
          <input
            type="checkbox"
            checked={isRequired}
            onChange={(e) => setIsRequired(e.target.checked)}
          />
          Required (uncheck for optional/recommended reading)
        </label>

        {error && (
          <p className="text-[13.5px] text-oxblood sm:col-span-2">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center self-start rounded bg-oxblood px-5 py-2.5 text-[14.5px] font-semibold text-white transition-all hover:bg-oxblood-dark active:scale-[0.97] disabled:opacity-60 sm:col-span-2"
        >
          {loading ? "Adding…" : "Add book"}
        </button>
      </form>

      <h2 className="mb-4 font-display text-lg font-semibold text-navy">
        Book list
      </h2>
      <div className="overflow-x-auto rounded-md border border-bordersoft bg-white">
        <table className="w-full text-left text-[13.5px]">
          <thead>
            <tr className="border-b border-bordersoft bg-bgsoft text-ink">
              <th className="px-4 py-2.5 font-medium">Cover</th>
              <th className="px-4 py-2.5 font-medium">Class</th>
              <th className="px-4 py-2.5 font-medium">Subject</th>
              <th className="px-4 py-2.5 font-medium">Title</th>
              <th className="px-4 py-2.5 font-medium">Author</th>
              <th className="px-4 py-2.5 font-medium">Type</th>
              <th className="px-4 py-2.5 font-medium" />
            </tr>
          </thead>
          <tbody>
            {books.map((b) => (
              <tr
                key={b.id}
                className="border-b border-bordersoft last:border-0"
              >
                <td className="px-4 py-2.5">
                  {b.cover_image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={b.cover_image_url}
                      alt={b.title}
                      className="h-12 w-9 rounded object-cover"
                    />
                  ) : (
                    <div className="h-12 w-9 rounded bg-bgsoft" />
                  )}
                </td>
                <td className="px-4 py-2.5">
                  {classes.find((c) => c.id === b.class_id)?.name ?? "—"}
                </td>
                <td className="px-4 py-2.5">{b.subject ?? "—"}</td>
                <td className="px-4 py-2.5">{b.title}</td>
                <td className="px-4 py-2.5">{b.author ?? "—"}</td>
                <td className="px-4 py-2.5">
                  {b.is_required ? "Required" : "Optional"}
                </td>
                <td className="px-4 py-2.5">
                  <button
                    onClick={() => handleDelete(b.id)}
                    className="text-[13px] font-medium text-oxblood hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {books.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-4 text-muted">
                  No books added yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
