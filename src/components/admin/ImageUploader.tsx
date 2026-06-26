"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Upload, X, Loader2 } from "lucide-react";

interface Props {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

export default function ImageUploader({ value, onChange, label = "Image" }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError("");
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Erreur upload"); return; }
      onChange(data.url);
    } finally {
      setUploading(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  return (
    <div>
      <label className="text-[11px] font-sans font-medium tracking-[0.08em] uppercase text-[#7A6E66] block mb-2">{label}</label>

      {value ? (
        <div className="relative w-full max-w-[260px] aspect-[4/3] rounded-lg overflow-hidden bg-[#F5EDE2] group">
          <Image src={value} alt="preview" fill className="object-cover" sizes="260px" />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-2 right-2 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center text-[#1A1714] hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100 shadow-sm"
          >
            <X size={13} />
          </button>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className="w-full max-w-[260px] aspect-[4/3] border-2 border-dashed border-[#E8E0D6] rounded-lg flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-[#C9A86C] hover:bg-[#FAF6F1] transition-all"
        >
          {uploading ? (
            <Loader2 size={24} className="text-[#C9A86C] animate-spin" />
          ) : (
            <>
              <Upload size={22} className="text-[#B5A99E]" />
              <p className="text-[12px] font-sans font-medium text-[#7A6E66]">Cliquez ou glissez une photo</p>
              <p className="text-[10px] font-sans font-light text-[#B5A99E]">JPG, PNG, WEBP</p>
            </>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
      />

      {error && <p className="text-[12px] font-sans text-red-500 mt-2">{error}</p>}
    </div>
  );
}
