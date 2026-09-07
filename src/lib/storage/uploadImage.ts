import imageCompression from "browser-image-compression";
import { createClient } from "@/lib/supabase/client";

interface UploadImageOptions {
  bucket: "book-covers" | "student-photos";
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
}

/**
 * Compresses an image in the browser before uploading it to Supabase
 * Storage, then returns its public URL. Keeps the database/storage small
 * even if admins upload many full-resolution photos.
 */
export async function compressAndUploadImage(
  file: File,
  { bucket, maxSizeMB = 0.3, maxWidthOrHeight = 800 }: UploadImageOptions,
): Promise<string> {
  const compressed = await imageCompression(file, {
    maxSizeMB,
    maxWidthOrHeight,
    useWebWorker: true,
  });

  const supabase = createClient();
  const fileName = `${crypto.randomUUID()}.jpg`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(fileName, compressed, {
      contentType: compressed.type || "image/jpeg",
      upsert: false,
    });

  if (error) {
    throw new Error(error.message);
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
  return data.publicUrl;
}
