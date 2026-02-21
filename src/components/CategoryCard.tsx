"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { categoryToSlug } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";

const CATEGORY_COLORS: Record<string, string> = {
  Windows: "#00ADEF",
  Adobe: "#FF0000",
  Krisp: "#a3a3a3",
  Utilities: "#F59E0B",
  Others: "#10B981",
  Games: "#a3a3a3",
  "Microsoft Office": "#D97706",
};

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  Windows: "OS tools, activators & system software",
  Adobe: "Creative Cloud apps & design tools",
  Krisp: "Noise cancellation & audio tools",
  Utilities: "Productivity & system utilities",
  Others: "Miscellaneous software & tools",
  Games: "PC games & gaming software",
  "Microsoft Office": "Word, Excel, PowerPoint & more",
};

const CATEGORY_EMOJI: Record<string, string> = {
  Windows: "W",
  Adobe: "A",
  Krisp: "K",
  Utilities: "U",
  Others: "O",
  Games: "G",
  "Microsoft Office": "M",
};

const IMAGE_EXTENSIONS = ["png", "svg", "webp", "jpg", "jpeg", "gif"];

function CategoryIcon({ slug, category }: { slug: string; category: string }) {
  const [extIndex, setExtIndex] = useState(0);
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span className="text-5xl font-bold text-white/30 flex items-center justify-center w-full h-full">
        {CATEGORY_EMOJI[category] || "?"}
      </span>
    );
  }

  return (
    <img
      src={`/images/categories/${slug}.${IMAGE_EXTENSIONS[extIndex]}`}
      alt={category}
      className="w-full h-full object-contain drop-shadow-lg"
      onError={() => {
        if (extIndex < IMAGE_EXTENSIONS.length - 1) {
          setExtIndex(extIndex + 1);
        } else {
          setFailed(true);
        }
      }}
    />
  );
}

export default function CategoryCard({ category }: { category: string }) {
  const slug = categoryToSlug(category);
  const color = CATEGORY_COLORS[category] || "#ffffff";
  const [fileCount, setFileCount] = useState<number | null>(null);

  useEffect(() => {
    const supabase = createClient();
    async function getCount() {
      const { count } = await supabase
        .from("files")
        .select("*", { count: "exact", head: true })
        .eq("category", category);
      setFileCount(count ?? 0);
    }
    getCount();
  }, [category]);

  return (
    <Link
      href={`/category/${slug}`}
      className="group relative flex flex-col rounded-2xl overflow-hidden bg-[#0c0c0c] border border-[#1e1e1e] hover:border-[#3a3a3a] transition-all duration-300 hover:-translate-y-1"
    >
      {/* ── Light ray bar ── */}
      <div
        className="h-1.5 w-full relative"
        style={{ backgroundColor: color }}
      >
        <div
          className="absolute inset-0 blur-md opacity-80"
          style={{ backgroundColor: color }}
        />
        <div
          className="absolute -bottom-4 left-0 right-0 h-8 blur-xl opacity-30 group-hover:opacity-60 transition-opacity duration-500"
          style={{ backgroundColor: color }}
        />
      </div>

      {/* ── Icon + content ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 pt-8 pb-3">
        <div className="w-20 h-20 group-hover:scale-110 transition-transform duration-300">
          <CategoryIcon slug={slug} category={category} />
        </div>

        {/* Category name */}
        <h3 className="text-lg font-bold text-white mt-4 text-center tracking-wide">
          {category}
        </h3>

        {/* Description */}
        <p className="text-[12px] text-gray-500 mt-1.5 text-center leading-relaxed px-2">
          {CATEGORY_DESCRIPTIONS[category] || "Browse available files"}
        </p>

        {/* File count badge */}
        <div
          className="mt-4 text-[11px] font-semibold px-3 py-1 rounded-full border"
          style={{ color: color, borderColor: `${color}33`, backgroundColor: `${color}10` }}
        >
          {fileCount !== null ? `${fileCount} file${fileCount !== 1 ? "s" : ""}` : "..."}
        </div>
      </div>

      {/* ── View content button ── */}
      <div className="px-4 pb-5">
        <div className="bg-white text-[#0c0c0c] text-xs font-bold text-center py-3 rounded-xl hover:bg-gray-100 transition-colors uppercase tracking-wider">
          View Content
        </div>
      </div>
    </Link>
  );
}
