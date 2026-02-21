"use client";

import { resolveThumbnailUrl, formatFileSize, getFileStatus } from "@/lib/utils";
import type { FileRecord } from "@/lib/types";

export default function GameCard({
  file,
  onClick,
}: {
  file: FileRecord;
  onClick: () => void;
}) {
  const thumbUrl = resolveThumbnailUrl(file.thumbnail_url);
  const status = getFileStatus(file.upload_date, file.updated_at);

  return (
    <button
      onClick={onClick}
      className="group relative flex flex-col rounded-2xl bg-[#0c0c0c] border border-[#1e1e1e] hover:border-white/20 transition-all duration-300 hover:-translate-y-1 cursor-pointer text-left w-full h-full z-10 hover:z-50"
    >
      {/* Status Badge - positioned floating outside the card */}
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

      {/* Inner Mask for contents */}
      <div className="relative w-full h-full flex flex-col overflow-hidden rounded-[15px]">
        {/* Light ray bar */}
        <div className="h-1.5 w-full relative bg-white shrink-0">
          <div className="absolute inset-0 blur-md opacity-80 bg-white" />
          <div className="absolute -bottom-4 left-0 right-0 h-8 blur-xl opacity-20 group-hover:opacity-50 transition-opacity duration-500 bg-white" />
        </div>

        {/* Title bar */}
        <div className="px-3 py-2 bg-[#0f0f0f] border-b border-[#1e1e1e]">
          <p className="text-[13px] font-semibold text-white truncate">
            {file.file_name}
          </p>
        </div>

      {/* Thumbnail */}
      <div className="relative w-full aspect-[16/10] overflow-hidden bg-[#080808]">
        {file.genre && (
          <div className="absolute top-2 left-2 z-10">
            <span className="bg-white/80 backdrop-blur-md border border-white/30 text-black text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md shadow-lg shadow-black/50">
              {file.genre}
            </span>
          </div>
        )}
        {thumbUrl ? (
          <img
            src={thumbUrl}
            alt={file.file_name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-3 py-2.5 flex items-center justify-between bg-[#0a0a0a]">
        <span className="text-[11px] text-gray-500">
          {formatFileSize(file.file_size)}
        </span>
        <span className="text-[11px] text-gray-400 font-medium flex items-center gap-1 group-hover:text-white transition-colors">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
              clipRule="evenodd"
            />
          </svg>
          more
        </span>
      </div>
     </div>
    </button>
  );
}
