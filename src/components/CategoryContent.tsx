"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { FileRecord, Bundle } from "@/lib/types";
import Navbar from "./Navbar";
import SearchBar from "./SearchBar";
import BundleCard from "./BundleCard";
import FileCard from "./FileCard";
import GameCard from "./GameCard";
import GameModal from "./GameModal";
import FileModal from "./FileModal";
import Link from "next/link";

const GAMES_PER_PAGE = 12;

export default function CategoryContent({ category }: { category: string }) {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [standaloneFiles, setStandaloneFiles] = useState<FileRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedGame, setSelectedGame] = useState<FileRecord | null>(null);
  const [selectedFile, setSelectedFile] = useState<FileRecord | null>(null);
  const [oldVersionFiles, setOldVersionFiles] = useState<FileRecord[]>([]);
  const [gamesPage, setGamesPage] = useState(1);
  const [accessDenied, setAccessDenied] = useState(false);
  const [sortBy, setSortBy] = useState<"recent" | "az" | "za">("recent");
  const supabase = createClient();
  const isGames = category === "Games";

  useEffect(() => {
    async function fetchData() {
      setLoading(true);

      // Check user access
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("users")
          .select("role, allowed_categories")
          .eq("id", user.id)
          .single();

        if (profile && profile.role !== "admin") {
          if (!profile.allowed_categories) {
            setAccessDenied(true);
            setLoading(false);
            return;
          }
          if (profile.allowed_categories !== "all") {
            const allowed = profile.allowed_categories.split(",").filter(Boolean);
            if (!allowed.includes(category)) {
              setAccessDenied(true);
              setLoading(false);
              return;
            }
          }
        }
      }

      // Fetch bundles (is_bundle = true)
      const { data: bundlesData } = await supabase
        .from("files")
        .select("*, files!parent_id(*)")
        .eq("category", category)
        .eq("is_bundle", true)
        .order("updated_at", { ascending: false });

      // Fetch standalone files (no parent_id and not a bundle)
      const { data: filesData } = await supabase
        .from("files")
        .select("*")
        .eq("category", category)
        .is("parent_id", null)
        .eq("is_bundle", false)
        .neq("status", "old")
        .order("updated_at", { ascending: false });

      // Fetch old version files separately
      const { data: oldFilesData } = await supabase
        .from("files")
        .select("*")
        .eq("category", category)
        .is("parent_id", null)
        .eq("is_bundle", false)
        .eq("status", "old")
        .order("updated_at", { ascending: false });

      // Strip storage_url from client-side data
      const stripUrl = (f: any) => { const { storage_url, ...rest } = f; return rest; };

      setBundles(
        (bundlesData || []).map((b: any) => ({
          ...stripUrl(b),
          files: b.files?.map(stripUrl),
        }))
      );
      setStandaloneFiles((filesData || []).map(stripUrl));
      setOldVersionFiles((oldFilesData || []).map(stripUrl));
      setLoading(false);
    }

    fetchData();
  }, [category]);

  const filteredBundles = bundles.filter(
    (b) =>
      b.file_name.toLowerCase().includes(search.toLowerCase()) ||
      b.files?.some((f) =>
        f.file_name.toLowerCase().includes(search.toLowerCase())
      )
  );

  // Include all bundle files in the search pool so they show up individually when searching
  const allSearchableFiles = search 
    ? [...standaloneFiles, ...bundles.flatMap(b => b.files || [])]
    : standaloneFiles;

  const filteredFiles = allSearchableFiles
    .filter(
      (f) =>
        f.file_name.toLowerCase().includes(search.toLowerCase()) ||
        f.description?.toLowerCase().includes(search.toLowerCase()) ||
        f.genre?.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "recent") {
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      }
      if (sortBy === "az") {
        return a.file_name.localeCompare(b.file_name);
      }
      if (sortBy === "za") {
        return b.file_name.localeCompare(a.file_name);
      }
      return 0;
    });

  // Pagination for games
  const totalGamesPages = Math.ceil(filteredFiles.length / GAMES_PER_PAGE);
  const paginatedGames = isGames
    ? filteredFiles.slice(
        (gamesPage - 1) * GAMES_PER_PAGE,
        gamesPage * GAMES_PER_PAGE
      )
    : filteredFiles;

  // Reset to page 1 when search changes
  useEffect(() => {
    setGamesPage(1);
  }, [search]);

  // Find older versions for a given game by matching the base name
  const getOlderVersions = (game: FileRecord): FileRecord[] => {
    // Strip version suffixes: "Game v2.0" -> "Game"
    const extractBase = (name: string) => {
      const match = name.match(/^(.*?)(?:\s+(?:v\d|version\s*\d|edition|\(|\[|-).*?)?$/i);
      return (match ? match[1].trim() : name.trim()).toLowerCase();
    };
    const baseName = extractBase(game.file_name);
    if (baseName.length <= 2) return [];

    return oldVersionFiles.filter((f) => {
      if (f.id === game.id) return false;
      const fBase = extractBase(f.file_name);
      return fBase === baseName || f.file_name.toLowerCase() === game.file_name.toLowerCase();
    });
  };

  return (
    <>
      <Navbar />
      {accessDenied ? (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center py-20 bg-[#161616] rounded-2xl border border-[#2a2a2a]">
            <svg className="w-12 h-12 text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
            <p className="text-gray-500 mb-6">You don&apos;t have permission to view this category.</p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      ) : (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link
            href="/"
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-2xl font-bold text-white">{category}</h1>
        </div>

        <div className="mb-8 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="w-full sm:max-w-md">
            <SearchBar onSearch={setSearch} placeholder={`Search ${category} (try genre)...`} />
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <label className="text-sm text-gray-400 whitespace-nowrap hidden sm:block">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "recent" | "az" | "za")}
              className="px-4 py-2.5 rounded-xl bg-[#111111] border border-[#2a2a2a] text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-white/20 w-full sm:w-48 transition-colors cursor-pointer"
            >
              <option value="recent">Recently Uploaded</option>
              <option value="az">Name (A - Z)</option>
              <option value="za">Name (Z - A)</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-48 skeleton rounded-2xl" />
            ))}
          </div>
        ) : isGames ? (
          /* ── Games layout: grid cards + pagination ── */
          <div className="space-y-8">
            {paginatedGames.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-5">
                  {paginatedGames.map((file) => (
                    <GameCard
                      key={file.id}
                      file={file}
                      onClick={() => setSelectedGame(file)}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalGamesPages > 1 && (
                  <div className="flex items-center justify-center gap-2 pt-4">
                    <button
                      onClick={() => setGamesPage(Math.max(1, gamesPage - 1))}
                      disabled={gamesPage === 1}
                      className="px-3 py-2 rounded-xl text-sm font-medium bg-[#161616] border border-[#1e1e1e] text-gray-400 hover:text-white hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                    >
                      ← Prev
                    </button>

                    {Array.from({ length: totalGamesPages }, (_, i) => i + 1).map(
                      (page) => (
                        <button
                          key={page}
                          onClick={() => setGamesPage(page)}
                          className={`w-10 h-10 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                            page === gamesPage
                              ? "bg-white text-black"
                              : "bg-[#161616] border border-[#1e1e1e] text-gray-400 hover:text-white hover:border-white/20"
                          }`}
                        >
                          {page}
                        </button>
                      )
                    )}

                    <button
                      onClick={() =>
                        setGamesPage(Math.min(totalGamesPages, gamesPage + 1))
                      }
                      disabled={gamesPage === totalGamesPages}
                      className="px-3 py-2 rounded-xl text-sm font-medium bg-[#161616] border border-[#1e1e1e] text-gray-400 hover:text-white hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                    >
                      Next →
                    </button>
                  </div>
                )}

                <p className="text-center text-xs text-gray-600">
                  Showing {(gamesPage - 1) * GAMES_PER_PAGE + 1}–
                  {Math.min(gamesPage * GAMES_PER_PAGE, filteredFiles.length)} of{" "}
                  {filteredFiles.length} games
                </p>
              </>
            ) : (
              <div className="text-center py-20 bg-[#161616] rounded-2xl border border-[#2a2a2a]">
                <svg className="w-12 h-12 text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <p className="text-gray-500">No games found.</p>
              </div>
            )}
          </div>
        ) : (
          /* ── Regular category layout: bundles + files ── */
          <div className="space-y-10">
            {filteredBundles.length > 0 && (
              <div>
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-5">
                  Bundles
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-5">
                  {filteredBundles.map((bundle) => (
                    <BundleCard key={bundle.id} bundle={bundle} />
                  ))}
                </div>
              </div>
            )}

            {filteredFiles.length > 0 && (
              <div>
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-5">
                  Files
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-5">
                  {filteredFiles.map((file) => (
                    <FileCard key={file.id} file={file} onClick={() => setSelectedFile(file)} />
                  ))}
                </div>
              </div>
            )}

            {filteredBundles.length === 0 && filteredFiles.length === 0 && (
              <div className="text-center py-20 bg-[#161616] rounded-2xl border border-[#2a2a2a]">
                <svg className="w-12 h-12 text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <p className="text-gray-500">No content found in {category}.</p>
              </div>
            )}
          </div>
        )}
      </div>
      )}

      {/* Game modal */}
      {selectedGame && (
        <GameModal
          file={selectedGame}
          olderVersions={getOlderVersions(selectedGame)}
          onClose={() => setSelectedGame(null)}
        />
      )}

      {/* File modal */}
      {selectedFile && (
        <FileModal file={selectedFile} onClose={() => setSelectedFile(null)} />
      )}
    </>
  );
}
