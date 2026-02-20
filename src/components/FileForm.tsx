"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { CATEGORIES, type FileRecord, type Bundle } from "@/lib/types";
import ImageUpload from "./ImageUpload";

interface FileFormProps {
  file?: FileRecord | null;
  onSaved: () => void;
  onCancel: () => void;
}

export default function FileForm({ file, onSaved, onCancel }: FileFormProps) {
  const [name, setName] = useState(file?.file_name || "");
  const [url, setUrl] = useState(file?.storage_url || "");
  const [urlParts, setUrlParts] = useState<string[]>(
    file?.category === "Games" && file?.storage_url
      ? file.storage_url.split("\n")
      : [""]
  );

  // file_size is stored as bigint (bytes) in the database
  // Convert bytes to human-readable for the form
  const UNITS = ["KB", "MB", "GB", "TB"];
  const UNIT_BYTES: Record<string, number> = {
    KB: 1024,
    MB: 1024 ** 2,
    GB: 1024 ** 3,
    TB: 1024 ** 4,
  };

  function bytesToHuman(bytes: number): { value: string; unit: string } {
    if (!bytes || bytes <= 0) return { value: "", unit: "GB" };
    if (bytes >= UNIT_BYTES.TB) return { value: (bytes / UNIT_BYTES.TB).toFixed(2).replace(/\.?0+$/, ""), unit: "TB" };
    if (bytes >= UNIT_BYTES.GB) return { value: (bytes / UNIT_BYTES.GB).toFixed(2).replace(/\.?0+$/, ""), unit: "GB" };
    if (bytes >= UNIT_BYTES.MB) return { value: (bytes / UNIT_BYTES.MB).toFixed(2).replace(/\.?0+$/, ""), unit: "MB" };
    return { value: (bytes / UNIT_BYTES.KB).toFixed(2).replace(/\.?0+$/, ""), unit: "KB" };
  }

  const parsed = bytesToHuman(Number(file?.file_size) || 0);
  const [sizeValue, setSizeValue] = useState(parsed.value);
  const [sizeUnit, setSizeUnit] = useState(parsed.unit);
  const [category, setCategory] = useState(file?.category || CATEGORIES[0]);
  const [parentId, setParentId] = useState(file?.parent_id || "");
  const [isBundle, setIsBundle] = useState(file?.is_bundle || false);
  const [description, setDescription] = useState(file?.description || "");
  const [genre, setGenre] = useState(file?.genre || "");
  const [thumbnailUrl, setThumbnailUrl] = useState(file?.thumbnail_url || "");
  const [bundles, setBundles] = useState<FileRecord[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fetchingGenre, setFetchingGenre] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function fetchBundles() {
      if (category === "Games" || isBundle) {
        setBundles([]);
        return;
      }

      const { data } = await supabase
        .from("files")
        .select("*")
        .eq("is_bundle", true)
        .eq("category", category)
        .neq("id", file?.id || "");

      setBundles(data || []);
    }

    fetchBundles();
  }, [category, isBundle, file?.id]);

  useEffect(() => {
    if (category !== "Games" || !name.trim()) return;

    // Don't auto-fetch if we already have a genre (e.g. editing)
    if (genre && file?.file_name === name) return;

    const timer = setTimeout(() => {
      handleAutoDetectGenre(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, [name, category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const fileSize = isBundle ? 0 : Math.round(parseFloat(sizeValue || "0") * UNIT_BYTES[sizeUnit]);
    const finalUrl = isBundle ? "" : (category === "Games" ? urlParts.filter(p => p.trim()).join("\n") : url);

    const payload = {
      file_name: name,
      storage_url: finalUrl,
      file_size: fileSize,
      category,
      parent_id: isBundle ? null : (parentId || null),
      is_bundle: isBundle,
      description: description || null,
      genre: category === "Games" ? (genre || null) : null,
      thumbnail_url: thumbnailUrl || null,
      updated_at: new Date().toISOString(),
    };

    let result;
    if (file) {
      result = await supabase
        .from("files")
        .update(payload)
        .eq("id", file.id);
    } else {
      result = await supabase.from("files").insert(payload);
    }

    if (result.error) {
      setError(result.error.message);
      setSaving(false);
      return;
    }

    setSaving(false);
    onSaved();
  };

  const handleAutoDetectGenre = async (silent = false) => {
    if (!name.trim() || category !== "Games") return;
    setFetchingGenre(true);
    try {
      const res = await fetch(`/api/genre?q=${encodeURIComponent(name)}`);
      const data = await res.json();
      if (data.genre) {
        setGenre(data.genre);
      } else if (!silent) {
        alert("Could not automatically find a genre for this game.");
      }
    } catch (err) {
      console.error(err);
      if (!silent) alert("Failed to fetch genre.");
    } finally {
      setFetchingGenre(false);
    }
  };

  const inputClass =
    "w-full px-3 py-2.5 rounded-xl bg-[#0f0f1a] border border-[#2a2a4a] focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition text-sm text-gray-200 placeholder-gray-500";

  return (
    <div className="bg-[#14142a] rounded-xl border border-[#2a2a4a] p-6">
      <h3 className="text-lg font-semibold text-gray-100 mb-4">
        {file ? "Edit File" : "Add New File"}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className={inputClass}
            />
          </div>
          {!isBundle && (
            <>
              {category === "Games" ? (
                <div className="col-span-1 sm:col-span-2 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-300">
                      Game Download Parts (URLs) *
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setUrlParts([...urlParts, ""])}
                        className="text-xs bg-purple-500/15 text-purple-300 px-2.5 py-1 rounded-lg hover:bg-purple-500/25 transition-colors cursor-pointer border border-purple-500/20"
                      >
                        +1 Part
                      </button>
                      <button
                        type="button"
                        onClick={() => setUrlParts([...urlParts, ...Array(9).fill("")])}
                        className="text-xs bg-purple-500/15 text-purple-300 px-2.5 py-1 rounded-lg hover:bg-purple-500/25 transition-colors cursor-pointer border border-purple-500/20"
                      >
                        +9 Parts
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {urlParts.map((part, index) => (
                      <div key={index} className="relative group">
                        <input
                          type="url"
                          value={part}
                          onChange={(e) => {
                            const newParts = [...urlParts];
                            newParts[index] = e.target.value;
                            setUrlParts(newParts);
                          }}
                          required={index === 0}
                          placeholder={`Part ${index + 1} URL`}
                          className={`${inputClass} pr-8`}
                        />
                        {urlParts.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const newParts = urlParts.filter((_, i) => i !== index);
                              setUrlParts(newParts);
                            }}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-red-400 transition-colors"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    URL Link *
                  </label>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    required
                    placeholder="https://..."
                    className={inputClass}
                  />
                </div>
              )}
            </>
          )}
          {!isBundle && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                File Size *
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={sizeValue}
                  onChange={(e) => setSizeValue(e.target.value)}
                  required
                  placeholder="2.5"
                  className={`${inputClass} w-full`}
                  style={{ flex: "3 1 0" }}
                />
                <select
                  value={sizeUnit}
                  onChange={(e) => setSizeUnit(e.target.value)}
                  className={inputClass}
                  style={{ flex: "1 1 0" }}
                >
                  <option value="KB">KB</option>
                  <option value="MB">MB</option>
                  <option value="GB">GB</option>
                  <option value="TB">TB</option>
                </select>
              </div>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Category *
            </label>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setParentId("");
              }}
              className={inputClass}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          {category === "Games" && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-gray-300">
                  Genre
                </label>
                <button
                  type="button"
                  onClick={() => handleAutoDetectGenre(false)}
                  disabled={!name.trim() || fetchingGenre}
                  className="text-xs bg-purple-500/15 text-purple-300 px-2 py-0.5 rounded-lg hover:bg-purple-500/25 transition-colors cursor-pointer border border-purple-500/20 disabled:opacity-50 flex items-center gap-1"
                >
                  {fetchingGenre ? (
                    <div className="w-3 h-3 border-2 border-purple-300 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    "✨ Auto-Detect"
                  )}
                </button>
              </div>
              <input
                type="text"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                placeholder="e.g. Action RPG, Simulator"
                className={inputClass}
              />
            </div>
          )}
        </div>

        {category !== "Games" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-[#2a2a4a] pt-4">
            <div className="flex items-center gap-2 py-2">
              <input
                type="checkbox"
                id="isBundle"
                checked={isBundle}
                onChange={(e) => {
                  setIsBundle(e.target.checked);
                  if (e.target.checked) setParentId("");
                }}
                className="w-4 h-4 text-purple-600 rounded border-[#2a2a4a] bg-[#0f0f1a] focus:ring-purple-500"
              />
              <label htmlFor="isBundle" className="text-sm font-medium text-gray-300 cursor-pointer">
                Is this a Bundle?
              </label>
            </div>

            {!isBundle && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Add to Bundle
                </label>
                <select
                  value={parentId}
                  onChange={(e) => setParentId(e.target.value)}
                  className={inputClass}
                >
                  <option value="">None (Standalone File)</option>
                  {bundles.map((b) => (
                    <option key={b.id} value={b.id}>
                      📦 {b.file_name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className={`${inputClass} resize-none`}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            Thumbnail
          </label>
          <ImageUpload value={thumbnailUrl} onChange={setThumbnailUrl} />
        </div>

        {error && (
          <div className="bg-red-500/10 text-red-400 text-sm px-4 py-3 rounded-xl border border-red-500/20">
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-purple-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-purple-500 transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-purple-500/20"
          >
            {saving ? "Saving..." : file ? "Update File" : "Add File"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="bg-[#1a1a35] text-gray-300 px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#252547] transition-colors cursor-pointer border border-[#2a2a4a]"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
