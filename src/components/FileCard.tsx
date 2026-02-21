"use client";

import type { FileRecord } from "@/lib/types";
import { resolveThumbnailUrl, formatFileSize, getFileStatus } from "@/lib/utils";

const CATEGORY_COLORS: Record<string, string> = {
  Windows: "#00ADEF",
  Adobe: "#FF0000",
  Krisp: "#a3a3a3",
  Utilities: "#F59E0B",
  Others: "#10B981",
  Games: "#a3a3a3",
  "Microsoft Office": "#D97706",
};

export default function FileCard({ file, onClick }: { file: FileRecord; onClick?: () => void }) {
  const color = CATEGORY_COLORS[file.category] || "#ffffff";
  const thumbUrl = resolveThumbnailUrl(file.thumbnail_url);
  const status = getFileStatus(file.upload_date, file.updated_at);

  return (
    <div className="relative w-full z-10 hover:z-50">
      {/* Status Badge */}
      {status && (
        <div className={`absolute -top-3 -right-3 z-20 px-3 py-1.5 rounded-lg font-extrabold text-[10px] tracking-wider shadow-lg ${
          file.status === "old"
            ? "bg-gray-600 text-white shadow-gray-600/30"
            : status === "NEW" 
            ? "bg-[#65d045] text-black shadow-[#65d045]/30" 
            : "bg-blue-500 text-white shadow-blue-500/30"
        }`}>
          {/* Glowing ray light effect */}
          <div className={`absolute inset-0 rounded-lg blur-md opacity-60 -z-10 ${
            file.status === "old" ? "bg-gray-600" : status === "NEW" ? "bg-[#65d045]" : "bg-blue-500"
          }`} />
          <div className={`absolute -inset-1 rounded-lg blur-lg opacity-20 group-hover:-inset-2 group-hover:blur-xl group-hover:opacity-60 transition-all duration-500 -z-10 ${
            file.status === "old" ? "bg-gray-600" : status === "NEW" ? "bg-[#65d045]" : "bg-blue-500"
          }`} />
          
          <span className="relative z-10">{file.status === "old" ? "OLD VERSION" : status}</span>
        </div>
      )}

      <div 
        onClick={onClick}
        role={onClick ? "button" : undefined}
        tabIndex={onClick ? 0 : undefined}
        className={`group flex flex-col rounded-2xl overflow-hidden bg-[#0c0c0c] border border-[#1e1e1e] transition-all duration-300 w-full h-full relative text-left ${onClick ? 'cursor-pointer hover:border-[#3a3a3a] hover:-translate-y-1' : 'hover:border-[#3a3a3a]'}`}
      >
        {/* Light ray bar - positioned absolutely at the top */}
        <div className="absolute top-0 left-0 right-0 h-1 z-10" style={{ backgroundColor: color }}>
          <div
            className="absolute inset-0 blur-md opacity-70"
            style={{ backgroundColor: color }}
          />
          <div
            className="absolute -bottom-4 left-0 right-0 h-8 blur-xl opacity-15 group-hover:opacity-40 transition-opacity duration-500"
            style={{ backgroundColor: color }}
          />
        </div>
        
        <div className="flex flex-col w-full h-full relative z-0">
          {/* ── Icon / Thumbnail ── */}
          <div className="flex-1 flex flex-col items-center justify-start px-5 pt-8 pb-3">
            {thumbUrl ? (
              <div className="w-32 h-32 group-hover:scale-110 transition-transform duration-300 drop-shadow-lg mb-5">
                <img
                  src={thumbUrl}
                  alt={file.file_name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
            ) : (
              <div className="w-32 h-32 flex items-center justify-center bg-[#1e1e1e] rounded-2xl mb-5 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
              </div>
            )}

            {/* Title */}
            <h3 className="text-base font-bold text-white text-center tracking-wide line-clamp-2">
              {file.file_name}
            </h3>

            {/* Description */}
            {file.description && (
              <p className="text-[12px] text-gray-500 mt-1.5 text-center leading-relaxed px-2 line-clamp-2">
                {file.description}
              </p>
            )}

            {/* File size badge */}
            {formatFileSize(file.file_size) && (
              <div
                className="mt-4 text-[11px] font-semibold px-3 py-1 rounded-full border"
                style={{ color: color, borderColor: `${color}33`, backgroundColor: `${color}10` }}
              >
                {formatFileSize(file.file_size)}
              </div>
            )}
          </div>

          {/* ── Download / View button ── */}
          <div className="px-4 pb-5 mt-auto">
            {onClick ? (
              <div
                className="flex items-center justify-center gap-2 text-[#0c0c0c] text-xs font-bold text-center py-3 rounded-xl hover:opacity-90 transition-opacity uppercase tracking-wider w-full"
                style={{ backgroundColor: color }}
              >
                View Content
              </div>
            ) : (
              <a
                href={`/api/download/${file.id}/0`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 text-[#0c0c0c] text-xs font-bold text-center py-3 rounded-xl hover:opacity-90 transition-opacity uppercase tracking-wider w-full"
                style={{ backgroundColor: color }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download
              </a>
            )}
          </div>
        </div>
    </div>
  </div>
  );
}
