"use client";

import { useEffect, useState } from "react";
import { resolveThumbnailUrl, formatFileSize } from "@/lib/utils";
import type { FileRecord } from "@/lib/types";

const CATEGORY_COLORS: Record<string, string> = {
  Windows: "#0ea5e9", // sky blue
  Adobe: "#ef4444", // red
  Krisp: "#a3a3a3", // gray
  Utilities: "#f59e0b", // amber
  Others: "#10b981", // emerald
  Games: "#ec4899", // pink
  "Microsoft Office": "#f97316", // orange
  Bundles: "#ffffff", // white
};

export default function FileModal({
  file,
  onClose,
}: {
  file: FileRecord;
  onClose: () => void;
}) {
  const thumbUrl = resolveThumbnailUrl(file.thumbnail_url);
  const color = CATEGORY_COLORS[file.category] || "#ffffff";
  const [partCount, setPartCount] = useState(0);
  const [loadingParts, setLoadingParts] = useState(true);

  useEffect(() => {
    fetch(`/api/files/${file.id}/parts`)
      .then((r) => r.json())
      .then((d) => {
        setPartCount(d.count || 0);
        setLoadingParts(false);
      })
      .catch(() => setLoadingParts(false));
  }, [file.id]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Modal */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl max-h-[85vh] bg-[#0c0c0c] border border-[#2a2a2a] rounded-2xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e1e1e] bg-[#0a0a0a] shrink-0">
          <h2 className="text-lg font-bold text-white truncate pr-4">
            {file.file_name}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white transition-colors shrink-0 cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body — two columns */}
        <div className="flex flex-col sm:flex-row flex-1 min-h-0">
          {/* Left: image + size + description */}
          <div className="sm:w-1/2 flex flex-col border-r border-[#1e1e1e] overflow-y-auto">
            {/* Thumbnail */}
            <div className="w-full aspect-[16/10] overflow-hidden bg-[#080808] shrink-0 flex items-center justify-center p-6 border-b border-[#1e1e1e]">
              {thumbUrl ? (
                <img
                  src={thumbUrl}
                  alt={file.file_name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain drop-shadow-lg"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              ) : (
                <div className="w-32 h-32 flex items-center justify-center bg-[#1e1e1e] rounded-2xl shadow-lg">
                  <svg className="w-14 h-14 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
                </div>
              )}
            </div>

            <div className="p-5 space-y-4">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <span 
                  className="text-[11px] font-semibold px-3 py-1 rounded-full border text-white uppercase tracking-wider"
                  style={{ backgroundColor: color, borderColor: `${color}80` }}
                >
                  {file.category}
                </span>
                {file.genre && (
                  <span className="text-[11px] font-semibold px-3 py-1 rounded-full border text-gray-300 border-gray-600 bg-gray-800 uppercase tracking-wider">
                    {file.genre}
                  </span>
                )}
                {formatFileSize(file.file_size) && (
                  <span 
                    className="text-[11px] font-semibold px-3 py-1 rounded-full border"
                    style={{ color: color, borderColor: `${color}33`, backgroundColor: `${color}10` }}
                  >
                    {formatFileSize(file.file_size)}
                  </span>
                )}
              </div>

              {/* Description */}
              {file.description && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Description
                  </h3>
                  <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {file.description}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right: download parts — URLs never sent to client */}
          <div className="sm:w-1/2 flex flex-col overflow-y-auto">
            <div className="p-5">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                Download Parts ({partCount})
              </h3>

              {loadingParts ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-14 skeleton rounded-xl" />
                  ))}
                </div>
              ) : partCount > 0 ? (
                <div className="space-y-2">
                  {Array.from({ length: partCount }, (_, index) => (
                    <a
                      key={index}
                      href={`/api/download/${file.id}/${index}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-xl bg-[#161616] border border-[#1e1e1e] transition-all group"
                      style={{
                        '--hover-border': `${color}4d`,
                        '--hover-bg': `${color}1a`
                      } as React.CSSProperties}
                    >
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${color}26` }}
                      >
                        <svg className="w-4 h-4" style={{ color: color }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </div>
                      <p className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors">
                        Part {index + 1}
                      </p>
                      <svg 
                        className="w-4 h-4 text-gray-600 transition-colors shrink-0 ml-auto" 
                        style={{ '--hover-color': color } as React.CSSProperties}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <style>{`.group:hover svg[stroke="currentColor"] { color: var(--hover-color) !important;}`}</style>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  ))}
                  {/* Inline style block for dynamic css variables */}
                  <style>{`
                    .group { transition: all 0.2s; }
                    .group:hover {
                      border-color: var(--hover-border) !important;
                      background-color: var(--hover-bg) !important;
                    }
                  `}</style>
                </div>
              ) : (
                <p className="text-sm text-gray-500">No download links available.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
