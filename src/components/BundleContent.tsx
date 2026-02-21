"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { FileRecord } from "@/lib/types";
import Navbar from "@/components/Navbar";
import FileCard from "@/components/FileCard";
import FileModal from "@/components/FileModal";
import Link from "next/link";

export default function BundleContent({ bundleId }: { bundleId: string }) {
  const [bundle, setBundle] = useState<FileRecord | null>(null);
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchBundle() {
      setLoading(true);

      // Fetch the bundle itself
      const { data: bundleData } = await supabase
        .from("files")
        .select("*")
        .eq("id", bundleId)
        .single();

      // Fetch files in this bundle
      const { data: filesData } = await supabase
        .from("files")
        .select("*")
        .eq("parent_id", bundleId)
        .order("file_name");

      setBundle(bundleData);
      setFiles(filesData || []);
      setLoading(false);
    }

    fetchBundle();
  }, [bundleId]);

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Back button */}
        <Link
          href={bundle ? `/category/${bundle.category.toLowerCase().replace(/\s+/g, "-")}` : "/"}
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 text-sm font-medium"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </Link>

        {loading ? (
          <div className="space-y-4">
            <div className="h-10 skeleton rounded-xl w-1/3" />
            <div className="h-6 skeleton rounded-xl w-1/2" />
            <div className="space-y-4 mt-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 skeleton rounded-2xl" />
              ))}
            </div>
          </div>
        ) : !bundle ? (
          <div className="text-center py-20 bg-[#161616] rounded-2xl border border-[#2a2a2a]">
            <p className="text-gray-500">Bundle not found.</p>
          </div>
        ) : (
          <>
            {/* Bundle header */}
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-3">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                <div>
                  <h1 className="text-2xl font-bold text-white">{bundle.file_name}</h1>
                  {bundle.description && (
                    <p className="text-gray-400 mt-1">{bundle.description}</p>
                  )}
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <span className="text-xs uppercase tracking-wider bg-white/10 text-gray-300 px-3 py-1.5 rounded-full font-semibold border border-white/20">
                  {bundle.category}
                </span>
                <span className="text-xs uppercase tracking-wider bg-[#1a1a1a] text-gray-400 px-3 py-1.5 rounded-full font-semibold border border-[#2a2a2a]">
                  {files.length} {files.length === 1 ? "file" : "files"}
                </span>
              </div>
            </div>

            {/* Files grid */}
            {files.length === 0 ? (
              <div className="text-center py-16 bg-[#161616] rounded-2xl border border-[#2a2a2a]">
                <p className="text-gray-500">No files in this bundle yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-5">
                {files.map((file) => (
                  <FileCard key={file.id} file={file} onClick={() => setSelectedFile(file)} />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* File Modal */}
      {selectedFile && (
        <FileModal
          file={selectedFile}
          onClose={() => setSelectedFile(null)}
        />
      )}
    </>
  );
}
