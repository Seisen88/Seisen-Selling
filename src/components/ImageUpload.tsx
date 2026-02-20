"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { resolveThumbnailUrl } from "@/lib/utils";

export default function ImageUpload({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) {
  const [mode, setMode] = useState<"url" | "upload">(value ? "url" : "url");
  const [uploading, setUploading] = useState(false);
  const [imgError, setImgError] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const supabase = createClient();
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from("file-images")
      .upload(fileName, file);

    if (error) {
      alert("Error uploading image: " + error.message);
      setUploading(false);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("file-images").getPublicUrl(data.path);

    onChange(publicUrl);
    setImgError(false);
    setUploading(false);
  };

  const handleUrlChange = (newUrl: string) => {
    onChange(newUrl);
    setImgError(false);
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setMode("url")}
          className={`px-3 py-1 text-xs rounded-lg font-medium cursor-pointer transition-all ${
            mode === "url"
              ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
              : "bg-[#1a1a35] text-gray-400 border border-[#2a2a4a]"
          }`}
        >
          URL
        </button>
        <button
          type="button"
          onClick={() => setMode("upload")}
          className={`px-3 py-1 text-xs rounded-lg font-medium cursor-pointer transition-all ${
            mode === "upload"
              ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
              : "bg-[#1a1a35] text-gray-400 border border-[#2a2a4a]"
          }`}
        >
          Upload
        </button>
      </div>

      {mode === "url" ? (
        <input
          type="text"
          value={value}
          onChange={(e) => handleUrlChange(e.target.value)}
          placeholder="Paste a direct image URL (e.g. .png, .jpg, .webp)"
          className="w-full px-3 py-2.5 rounded-xl bg-[#0f0f1a] border border-[#2a2a4a] focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition text-sm text-gray-200 placeholder-gray-500"
        />
      ) : (
        <div>
          <input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            disabled={uploading}
            className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-purple-500/15 file:text-purple-300 hover:file:bg-purple-500/25 file:cursor-pointer file:border file:border-purple-500/20"
          />
          {uploading && (
            <p className="text-xs text-gray-500 mt-1">Uploading...</p>
          )}
        </div>
      )}

      {/* Preview */}
      {value && (
        <div className="mt-2">
          {imgError ? (
            <div className="h-20 w-20 flex items-center justify-center rounded-xl border border-red-500/30 bg-red-500/5">
              <div className="text-center">
                <p className="text-[10px] text-red-400 font-medium">Can&apos;t load</p>
                <p className="text-[9px] text-gray-500 mt-0.5">Try Upload instead</p>
              </div>
            </div>
          ) : (
            <img
              src={resolveThumbnailUrl(value)}
              alt="Preview"
              className="h-20 w-20 object-cover rounded-xl border border-[#2a2a4a]"
              referrerPolicy="no-referrer"
              onError={() => setImgError(true)}
            />
          )}
        </div>
      )}

      {/* Help text */}
      {mode === "url" && (
        <p className="text-[10px] text-gray-600">
          Tip: Right-click an image → &quot;Copy image address&quot;. Some sites block hotlinking — use Upload if the URL doesn&apos;t work.
        </p>
      )}
    </div>
  );
}
