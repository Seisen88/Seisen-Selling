"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { categoryToSlug } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  Windows: "OS tools, activators & system software",
  Adobe: "Creative Cloud apps & design tools",
  Krisp: "Noise cancellation & audio tools",
  Utilities: "Productivity & system utilities",
  Others: "Miscellaneous software & tools",
  Games: "PC games & gaming software",
  "Microsoft Office": "Word, Excel, PowerPoint & more",
  "Engineering Software": "CAD, simulation & engineering tools",
};

const CATEGORY_EMOJI: Record<string, string> = {
  Windows: "W",
  Adobe: "A",
  Krisp: "K",
  Utilities: "U",
  Others: "O",
  Games: "G",
  "Microsoft Office": "M",
  "Engineering Software": "E",
};

const IMAGE_EXTENSIONS = ["png", "svg", "webp", "jpg", "jpeg", "gif"];

/** Extract the dominant vibrant color from an image URL using canvas */
function extractDominantColor(src: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const size = 64;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) { resolve("#ffffff"); return; }
        ctx.drawImage(img, 0, 0, size, size);

        let data: Uint8ClampedArray;
        try {
          data = ctx.getImageData(0, 0, size, size).data;
        } catch {
          // Canvas tainted by CORS — fallback
          resolve("#ffffff");
          return;
        }

        // Bucket colors and find the most vibrant one
        const colorBuckets: Record<string, { r: number; g: number; b: number; count: number }> = {};

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
          // Skip transparent pixels
          if (a < 100) continue;
          // Skip near-black and near-white/gray pixels
          const brightness = (r + g + b) / 3;
          if (brightness < 30 || brightness > 200) continue;
          // Skip low-saturation (gray-ish) pixels
          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          const sat = max > 0 ? (max - min) / max : 0;
          if (sat < 0.15) continue;
          // Quantize to reduce noise
          const qr = (r >> 4) << 4;
          const qg = (g >> 4) << 4;
          const qb = (b >> 4) << 4;
          const key = `${qr},${qg},${qb}`;
          if (!colorBuckets[key]) {
            colorBuckets[key] = { r: qr, g: qg, b: qb, count: 0 };
          }
          colorBuckets[key].count++;
        }

        // Pick the most frequent saturated color
        let best: { r: number; g: number; b: number } | null = null;
        let bestScore = 0;

        for (const bucket of Object.values(colorBuckets)) {
          const max = Math.max(bucket.r, bucket.g, bucket.b);
          const min = Math.min(bucket.r, bucket.g, bucket.b);
          const saturation = max > 0 ? (max - min) / max : 0;
          // Heavily boost saturated colors
          const score = bucket.count * (0.2 + saturation * 5);
          if (score > bestScore) {
            bestScore = score;
            best = bucket;
          }
        }

        if (best) {
          // Boost the color slightly to make it more vivid
          const factor = 1.2;
          const br = Math.min(255, Math.round(best.r * factor));
          const bg = Math.min(255, Math.round(best.g * factor));
          const bb = Math.min(255, Math.round(best.b * factor));
          resolve(`rgb(${br}, ${bg}, ${bb})`);
        } else {
          resolve("#ffffff");
        }
      } catch {
        resolve("#ffffff");
      }
    };
    img.onerror = () => resolve("#ffffff");
    img.src = src;
  });
}

function CategoryIcon({ slug, category, onColorExtracted }: { slug: string; category: string; onColorExtracted: (color: string) => void }) {
  const [extIndex, setExtIndex] = useState(0);
  const [failed, setFailed] = useState(false);
  const [imgSrc, setImgSrc] = useState(`/images/categories/${slug}.${IMAGE_EXTENSIONS[0]}`);

  useEffect(() => {
    setImgSrc(`/images/categories/${slug}.${IMAGE_EXTENSIONS[extIndex]}`);
  }, [slug, extIndex]);

  const handleLoad = useCallback(() => {
    extractDominantColor(imgSrc).then(onColorExtracted);
  }, [imgSrc, onColorExtracted]);

  if (failed) {
    return (
      <span className="text-5xl font-bold text-white/30 flex items-center justify-center w-full h-full">
        {CATEGORY_EMOJI[category] || "?"}
      </span>
    );
  }

  return (
    <img
      src={imgSrc}
      alt={category}
      className="w-full h-full object-contain drop-shadow-lg"
      onLoad={handleLoad}
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
  const [color, setColor] = useState("#ffffff");
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
          <CategoryIcon slug={slug} category={category} onColorExtracted={setColor} />
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
