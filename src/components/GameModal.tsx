"use client";

import { useEffect, useState } from "react";
import { resolveThumbnailUrl, formatFileSize } from "@/lib/utils";
import type { FileRecord } from "@/lib/types";

export default function GameModal({
  file,
  olderVersions = [],
  onClose,
}: {
  file: FileRecord;
  olderVersions?: FileRecord[];
  onClose: () => void;
}) {
  const thumbUrl = resolveThumbnailUrl(file.thumbnail_url);
  const [partCount, setPartCount] = useState(0);
  const [loadingParts, setLoadingParts] = useState(true);

  // Track part counts for older versions
  const [olderPartCounts, setOlderPartCounts] = useState<Record<string, number>>({});
  const [loadingOlderParts, setLoadingOlderParts] = useState<Record<string, boolean>>({});
  const [expandedOlder, setExpandedOlder] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetch(`/api/files/${file.id}/parts`)
      .then((r) => r.json())
      .then((d) => {
        setPartCount(d.count || 0);
        setLoadingParts(false);
      })
      .catch(() => setLoadingParts(false));
  }, [file.id]);

  // Fetch part counts for older versions when expanded
  const fetchOlderParts = (oldFile: FileRecord) => {
    if (olderPartCounts[oldFile.id] !== undefined) return;
    setLoadingOlderParts((prev) => ({ ...prev, [oldFile.id]: true }));
    fetch(`/api/files/${oldFile.id}/parts`)
      .then((r) => r.json())
      .then((d) => {
        setOlderPartCounts((prev) => ({ ...prev, [oldFile.id]: d.count || 0 }));
        setLoadingOlderParts((prev) => ({ ...prev, [oldFile.id]: false }));
      })
      .catch(() => {
        setLoadingOlderParts((prev) => ({ ...prev, [oldFile.id]: false }));
      });
  };

  const toggleOlderVersion = (oldFile: FileRecord) => {
    const isExpanding = !expandedOlder[oldFile.id];
    setExpandedOlder((prev) => ({ ...prev, [oldFile.id]: isExpanding }));
    if (isExpanding) {
      fetchOlderParts(oldFile);
    }
  };

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
        className="relative w-full max-w-3xl max-h-[85vh] bg-[#0c0c14] border border-[#2a2a4a] rounded-2xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e1e30] bg-[#0a0a16] shrink-0">
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
          <div className="sm:w-1/2 flex flex-col border-r border-[#1e1e30] overflow-y-auto">
            {/* Thumbnail */}
            {thumbUrl && (
              <div className="w-full aspect-[16/10] overflow-hidden bg-[#08080f] shrink-0">
                <img
                  src={thumbUrl}
                  alt={file.file_name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
            )}

            <div className="p-5 space-y-4">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2">
                {file.genre && (
                  <span className="text-[11px] font-semibold px-3 py-1 rounded-full border text-white border-purple-400/30 bg-purple-600/80 uppercase tracking-wider">
                    {file.genre}
                  </span>
                )}
                {formatFileSize(file.file_size) && (
                  <span className="text-[11px] font-semibold px-3 py-1 rounded-full border text-purple-400 border-purple-500/20 bg-purple-500/10">
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
                {partCount === 1 ? "Download" : `Download Parts (${partCount})`}
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
                      className="flex items-center gap-3 p-3 rounded-xl bg-[#14142a] border border-[#1e1e30] hover:border-purple-500/30 hover:bg-purple-500/5 transition-all group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-purple-500/15 flex items-center justify-center shrink-0">
                        <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </div>
                      <p className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors">
                        {partCount === 1 ? "Download" : `Part ${index + 1}`}
                      </p>
                      <svg className="w-4 h-4 text-gray-600 group-hover:text-purple-400 transition-colors shrink-0 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No download links available.</p>
              )}
            </div>

            {/* Older Versions Section */}
            {olderVersions.length > 0 && (
              <div className="px-5 pb-5">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Older Versions ({olderVersions.length})
                </h3>
                <div className="space-y-2">
                  {olderVersions.map((oldFile) => {
                    const oldThumb = resolveThumbnailUrl(oldFile.thumbnail_url);
                    const isExpanded = expandedOlder[oldFile.id];
                    const pCount = olderPartCounts[oldFile.id];
                    const isLoadingParts = loadingOlderParts[oldFile.id];

                    return (
                      <div
                        key={oldFile.id}
                        className="rounded-xl border border-[#1e1e30] bg-[#0f0f1a] overflow-hidden"
                      >
                        {/* Older version header — clickable to expand */}
                        <button
                          onClick={() => toggleOlderVersion(oldFile)}
                          className="w-full flex items-center gap-3 p-3 hover:bg-[#14142a] transition-colors cursor-pointer"
                        >
                          {/* Thumbnail mini */}
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#08080f] shrink-0">
                            {oldThumb ? (
                              <img
                                src={oldThumb}
                                alt={oldFile.file_name}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = "none";
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-lg">
                                🎮
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0 text-left">
                            <p className="text-sm font-medium text-gray-300 truncate">
                              {oldFile.file_name}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-600/50 text-gray-400 uppercase">
                                Old Version
                              </span>
                              {formatFileSize(oldFile.file_size) && (
                                <span className="text-[10px] text-gray-500">
                                  {formatFileSize(oldFile.file_size)}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Expand/collapse arrow */}
                          <svg
                            className={`w-4 h-4 text-gray-500 transition-transform duration-200 shrink-0 ${
                              isExpanded ? "rotate-180" : ""
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </button>

                        {/* Expanded download parts */}
                        {isExpanded && (
                          <div className="px-3 pb-3 border-t border-[#1e1e30]">
                            <div className="pt-3 space-y-1.5">
                              {isLoadingParts ? (
                                <div className="space-y-1.5">
                                  {[1, 2].map((i) => (
                                    <div key={i} className="h-10 skeleton rounded-lg" />
                                  ))}
                                </div>
                              ) : pCount && pCount > 0 ? (
                                Array.from({ length: pCount }, (_, index) => (
                                  <a
                                    key={index}
                                    href={`/api/download/${oldFile.id}/${index}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2.5 p-2.5 rounded-lg bg-[#14142a] border border-[#1e1e30] hover:border-gray-500/30 hover:bg-gray-500/5 transition-all group"
                                  >
                                    <div className="w-6 h-6 rounded-md bg-gray-500/15 flex items-center justify-center shrink-0">
                                      <svg
                                        className="w-3 h-3 text-gray-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2.5}
                                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                                        />
                                      </svg>
                                    </div>
                                    <p className="text-xs font-medium text-gray-400 group-hover:text-gray-200 transition-colors">
                                      {pCount === 1 ? "Download" : `Part ${index + 1}`}
                                    </p>
                                    <svg
                                      className="w-3.5 h-3.5 text-gray-600 group-hover:text-gray-400 transition-colors shrink-0 ml-auto"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                      />
                                    </svg>
                                  </a>
                                ))
                              ) : (
                                <p className="text-xs text-gray-600 py-1">
                                  No download links available.
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
