"use client";

import { ChangeEvent, useState } from "react";

export function UploadField({
  name,
  label,
  accept = "image/*",
}: {
  name: string;
  label: string;
  accept?: string;
}) {
  const [fileName, setFileName] = useState("");
  function onChange(event: ChangeEvent<HTMLInputElement>) {
    setFileName(event.target.files?.[0]?.name ?? "");
  }
  return (
    <label className="block cursor-pointer text-sm font-semibold text-[#123b70]">
      <span>{label}</span>
      <span className="mt-2 flex items-center justify-between rounded-lg border border-dashed border-[#123b70]/30 bg-[#123b70]/5 px-4 py-3 font-normal transition hover:border-[#d94848]">
        <span className="truncate pr-3">{fileName || "Upload an image"}</span>
        <span className="shrink-0 rounded bg-[#d94848] px-3 py-1.5 text-xs font-bold text-white">
          Browse
        </span>
      </span>
      <input
        name={name}
        type="file"
        accept={accept}
        onChange={onChange}
        className="sr-only"
      />
    </label>
  );
}
