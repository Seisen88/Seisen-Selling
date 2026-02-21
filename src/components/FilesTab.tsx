"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { FileRecord } from "@/lib/types";
import { resolveThumbnailUrl, formatFileSize } from "@/lib/utils";
import SearchBar from "./SearchBar";
import FileForm from "./FileForm";
import ExportFilesButton from "./ExportFilesButton";

export default function FilesTab() {
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const perPage = 20;
  const supabase = createClient();

  const fetchFiles = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("files")
      .select("*")
      .neq("category", "Games")
      .order("category")
      .order("file_name");
    setFiles(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this file?")) return;
    await supabase.from("files").delete().eq("id", id);
    fetchFiles();
  };

  const filtered = files.filter(
    (f) =>
      f.file_name.toLowerCase().includes(search.toLowerCase()) ||
      f.category.toLowerCase().includes(search.toLowerCase()) ||
      f.description?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const grouped = paginated.reduce<Record<string, FileRecord[]>>((acc, file) => {
    if (!acc[file.category]) acc[file.category] = [];
    acc[file.category].push(file);
    return acc;
  }, {});

  useEffect(() => {
    setPage(1);
  }, [search]);

  return (
    <div className="space-y-4">
      <div className="flex gap-3 items-center">
        <div className="flex-1">
          <SearchBar onSearch={setSearch} placeholder="Search files..." />
        </div>
        <ExportFilesButton files={files} />
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 skeleton rounded-xl" />
          ))}
        </div>
      ) : Object.keys(grouped).length === 0 ? (
        <p className="text-gray-500 text-center py-8">No files found.</p>
      ) : (
        <>
        <div className="flex items-center justify-between text-xs text-gray-500 px-1">
          <span>{filtered.length} file{filtered.length !== 1 ? "s" : ""}</span>
          {totalPages > 1 && <span>Page {page} of {totalPages}</span>}
        </div>
        {Object.entries(grouped).map(([cat, catFiles]) => (
          <div key={cat}>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              {cat} ({catFiles.length})
            </h3>
            <div className="space-y-2 mb-6">
              {catFiles.map((file) => (
                <div key={file.id}>
                  {/* File row */}
                  <div
                    className={`bg-[#0c0c0c] rounded-xl border p-4 flex items-center justify-between gap-4 transition-all ${
                      editingId === file.id
                        ? "border-white/30 rounded-b-none"
                        : "border-[#1e1e1e] hover:border-[#3a3a3a]"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {file.thumbnail_url && (
                        <img
                          src={resolveThumbnailUrl(file.thumbnail_url)}
                          alt=""
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-[#2a2a2a]"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                      )}
                      <div className="min-w-0">
                        <p className="font-medium text-gray-200 truncate">
                          {file.file_name}
                        </p>
                        <p className="text-xs text-gray-500">{formatFileSize(file.file_size)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() =>
                          setEditingId(editingId === file.id ? null : file.id)
                        }
                        className={`text-sm font-medium cursor-pointer transition-colors ${
                          editingId === file.id
                            ? "text-yellow-400 hover:text-yellow-300"
                            : "text-gray-400 hover:text-white"
                        }`}
                      >
                        {editingId === file.id ? "Close" : "Edit"}
                      </button>
                      <button
                        onClick={() => handleDelete(file.id)}
                        className="text-sm text-red-400 hover:text-red-300 font-medium cursor-pointer transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* Inline edit form */}
                  {editingId === file.id && (
                    <div className="border border-t-0 border-white/30 rounded-b-xl overflow-hidden">
                      <FileForm
                        file={file}
                        onSaved={() => {
                          setEditingId(null);
                          fetchFiles();
                        }}
                        onCancel={() => setEditingId(null)}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-4">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-3 py-2 rounded-xl text-sm font-medium bg-[#161616] border border-[#1e1e1e] text-gray-400 hover:text-white hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              Prev
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-9 h-9 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  p === page
                    ? "bg-white text-black"
                    : "bg-[#161616] border border-[#1e1e1e] text-gray-400 hover:text-white hover:border-white/20"
                }`}
              >
                {p}
              </button>
            ))}

            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-3 py-2 rounded-xl text-sm font-medium bg-[#161616] border border-[#1e1e1e] text-gray-400 hover:text-white hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              Next
            </button>
          </div>
        )}
        </>
      )}
    </div>
  );
}
