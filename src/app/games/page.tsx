"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { resolveThumbnailUrl, formatFileSize, getFileStatus } from "@/lib/utils";

interface PublicGame {
  id: string;
  file_name: string;
  thumbnail_url: string | null;
  upload_date: string;
  updated_at: string;
  status?: string;
  genre?: string | null;
  file_size: string;
}

export default function GamesListPage() {
  const [games, setGames] = useState<PublicGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 20;

  useEffect(() => {
    fetch("/api/games/public")
      .then((res) => res.json())
      .then((data) => {
        setGames(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = games.filter((g) =>
    g.file_name.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  // Reset to page 1 when search changes
  useEffect(() => {
    setPage(1);
  }, [search]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#0a0a0a]/80 border-b border-[#2a2a2a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link
              href="/games"
              className="flex items-center gap-2 text-xl font-bold text-white"
              style={{ fontFamily: "var(--font-japan-ramen), sans-serif" }}
            >
              <img
                src="/images/reiya.png"
                alt="Reiya"
                className="w-9 h-9 object-contain brightness-0 invert"
              />
              Reiya 零夜
            </Link>
            <Link
              href="/login"
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Title & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Games Library</h1>
            <p className="text-sm text-gray-500 mt-1">
              {loading ? "Loading..." : `${filtered.length} games available`}
            </p>
          </div>
          <div className="relative w-full sm:w-72">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search games..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#161616] border border-[#2a2a2a] text-sm text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent transition"
            />
          </div>
        </div>

        {/* Games Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="skeleton rounded-2xl aspect-[3/4]" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-[#161616] rounded-2xl border border-[#2a2a2a]">
            <svg
              className="w-12 h-12 text-gray-500 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <p className="text-gray-500">No games found.</p>
          </div>
        ) : (
          <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {paginated.map((game) => {
              const thumbUrl = resolveThumbnailUrl(game.thumbnail_url);
              const status = game.status === "old" ? "OLD VERSION" : getFileStatus(game.upload_date, game.updated_at);

              return (
                <div
                  key={game.id}
                  className="group relative flex flex-col rounded-2xl bg-[#0c0c0c] border border-[#1e1e1e] transition-all duration-300 hover:-translate-y-1 hover:border-white/20 w-full h-full"
                >
                  {/* Status Badge */}
                  {status && (
                    <div
                      className={`absolute -top-3 -right-3 z-20 px-3 py-1.5 rounded-lg font-extrabold text-[10px] tracking-wider shadow-lg ${
                        status === "OLD VERSION"
                          ? "bg-gray-600 text-white shadow-gray-600/30"
                          : status === "NEW"
                          ? "bg-[#65d045] text-black shadow-[#65d045]/30"
                          : "bg-blue-500 text-white shadow-blue-500/30"
                      }`}
                    >
                      <div
                        className={`absolute inset-0 rounded-lg blur-md opacity-60 -z-10 ${
                          status === "OLD VERSION"
                            ? "bg-gray-600"
                            : status === "NEW"
                            ? "bg-[#65d045]"
                            : "bg-blue-500"
                        }`}
                      />
                      <span className="relative z-10">{status}</span>
                    </div>
                  )}

                  {/* Inner content */}
                  <div className="relative w-full h-full flex flex-col overflow-hidden rounded-[15px]">
                    {/* Light bar */}
                    <div className="h-1.5 w-full relative bg-white shrink-0">
                      <div className="absolute inset-0 blur-md opacity-80 bg-white" />
                    </div>

                    {/* Title */}
                    <div className="px-3 py-2 bg-[#0f0f0f] border-b border-[#1e1e1e]">
                      <p className="text-[13px] font-semibold text-white truncate">
                        {game.file_name}
                      </p>
                    </div>

                    {/* Thumbnail */}
                    <div className="relative w-full aspect-[16/10] overflow-hidden bg-[#080808]">
                      {game.genre && (
                        <div className="absolute top-2 left-2 z-10">
                          <span className="bg-white/80 backdrop-blur-md border border-white/30 text-black text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md shadow-lg shadow-black/50">
                            {game.genre}
                          </span>
                        </div>
                      )}
                      {thumbUrl ? (
                        <img
                          src={thumbUrl}
                          alt={game.file_name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg
                            className="w-10 h-10 text-gray-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                            />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="px-3 py-2.5 flex items-center justify-between bg-[#0a0a0a]">
                      <span className="text-[11px] text-gray-500">
                        {formatFileSize(game.file_size)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-8">
              <button
                onClick={() => { setPage(Math.max(1, page - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                disabled={page === 1}
                className="px-3 py-2 rounded-xl text-sm font-medium bg-[#161616] border border-[#1e1e1e] text-gray-400 hover:text-white hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                ← Prev
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className={`w-10 h-10 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                    p === page
                      ? "bg-white text-black"
                      : "bg-[#161616] border border-[#1e1e1e] text-gray-400 hover:text-white hover:border-white/20"
                  }`}
                >
                  {p}
                </button>
              ))}

              <button
                onClick={() => { setPage(Math.min(totalPages, page + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                disabled={page === totalPages}
                className="px-3 py-2 rounded-xl text-sm font-medium bg-[#161616] border border-[#1e1e1e] text-gray-400 hover:text-white hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                Next →
              </button>
            </div>
          )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#2a2a2a] mt-12 py-6 text-center text-xs text-gray-600">
        Powered by Reiya 零夜
      </footer>
    </div>
  );
}
