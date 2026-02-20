import Link from "next/link";
import type { Bundle } from "@/lib/types";
import { getFileStatus } from "@/lib/utils";

const CATEGORY_COLORS: Record<string, string> = {
  Windows: "#00ADEF",
  Adobe: "#FF0000",
  Krisp: "#7C3AED",
  Utilities: "#F59E0B",
  Others: "#10B981",
  Games: "#A855F7",
  "Microsoft Office": "#D97706",
};

export default function BundleCard({ bundle }: { bundle: Bundle }) {
  const fileCount = bundle.files?.length || 0;
  const color = CATEGORY_COLORS[bundle.category] || "#7C3AED";
  const status = getFileStatus(bundle.upload_date, bundle.updated_at);

  return (
    <Link
      href={`/bundle/${bundle.id}`}
      className="group relative flex flex-col rounded-2xl bg-[#0c0c14] border border-[#1e1e30] hover:border-[#2e2e50] transition-all duration-300 hover:-translate-y-1 w-full h-full z-10 hover:z-50"
    >
      {/* Status Badge */}
      {status && (
        <div className={`absolute -top-3 -right-3 z-20 px-3 py-1.5 rounded-lg font-extrabold text-[10px] tracking-wider shadow-lg ${
          status === "NEW" 
            ? "bg-[#65d045] text-black shadow-[#65d045]/30" 
            : "bg-blue-500 text-white shadow-blue-500/30"
        }`}>
          {/* Glowing ray light effect */}
          <div className={`absolute inset-0 rounded-lg blur-md opacity-60 -z-10 ${
            status === "NEW" ? "bg-[#65d045]" : "bg-blue-500"
          }`} />
          <div className={`absolute -inset-1 rounded-lg blur-lg opacity-20 group-hover:-inset-2 group-hover:blur-xl group-hover:opacity-60 transition-all duration-500 -z-10 ${
            status === "NEW" ? "bg-[#65d045]" : "bg-blue-500"
          }`} />
          
          <span className="relative z-10">{status}</span>
        </div>
      )}

      {/* Inner Mask for contents */}
      <div className="relative w-full h-full flex flex-col overflow-hidden rounded-[15px]">
        {/* ── Light ray bar ── */}
        <div
          className="h-1.5 w-full relative shrink-0"
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

      {/* ── Icon ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 pt-10 pb-3">
        <div className="group-hover:scale-110 transition-transform duration-300">
          <svg viewBox="0 0 88 88" className="w-20 h-20" fill="none">
            <path d="M20 30L44 16L68 30V58L44 72L20 58V30Z" fill={color} fillOpacity="0.9" />
            <path d="M44 16V72" stroke="#0C0C14" strokeWidth="2" />
            <path d="M20 30L68 58" stroke="#0C0C14" strokeWidth="2" />
            <path d="M68 30L20 58" stroke="#0C0C14" strokeWidth="2" />
            <text x="44" y="48" textAnchor="middle" fill="#0C0C14" fontSize="18" fontWeight="bold">
              {fileCount}
            </text>
          </svg>
        </div>

        {/* Bundle name */}
        <h3 className="text-sm font-bold text-white text-center mt-3 group-hover:text-gray-200 transition-colors">
          {bundle.file_name}
        </h3>

        {/* Helper text */}
        <p className="text-[13px] text-gray-400 mt-1 text-center">
          {fileCount} file{fileCount !== 1 ? "s" : ""} inside
        </p>
      </div>

      {/* ── View button ── */}
      <div className="px-4 pb-5">
        <div className="bg-white text-[#0c0c14] text-xs font-bold text-center py-3 rounded-xl hover:bg-gray-100 transition-colors uppercase tracking-wider">
          View Bundle
        </div>
      </div>
     </div>
    </Link>
  );
}
