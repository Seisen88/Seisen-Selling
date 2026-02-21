import Navbar from "@/components/Navbar";
import CategoryGrid from "@/components/CategoryGrid";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <div className="relative min-h-screen overflow-hidden flex flex-col">
        {/* Background decorations */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Grid pattern overlay */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)`,
              backgroundSize: "60px 60px",
            }}
          />

          {/* Large glow orbs */}
          <div className="absolute top-20 -left-40 w-[500px] h-[500px] rounded-full bg-white/3 blur-[120px]" />
          <div className="absolute top-60 -right-40 w-[400px] h-[400px] rounded-full bg-white/2 blur-[120px]" />
          <div className="absolute bottom-20 left-1/3 w-[350px] h-[350px] rounded-full bg-white/2 blur-[100px]" />

          {/* Decorative dots */}
          <div className="absolute top-32 right-20 w-2 h-2 rounded-full bg-white/20" />
          <div className="absolute top-48 right-32 w-1.5 h-1.5 rounded-full bg-white/15" />
          <div className="absolute top-40 left-28 w-1.5 h-1.5 rounded-full bg-white/15" />
          <div className="absolute bottom-40 right-1/4 w-2 h-2 rounded-full bg-white/15" />
          <div className="absolute bottom-60 left-20 w-1 h-1 rounded-full bg-white/20" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1">
          {/* Hero section — left aligned, compact */}
          <div className="mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-gray-300 text-[11px] font-medium mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              Premium Software Hub
            </div>

            <h1 className="text-3xl font-extrabold text-white mb-1.5 tracking-tight">
              Browse Categories
            </h1>
            <p className="text-gray-500 text-sm">
              Select a category to explore available files
            </p>
          </div>

          <CategoryGrid />
        </div>

        {/* Footer text */}
        <div className="text-center py-6">
          <p className="text-[11px] text-white uppercase tracking-widest">
            Powered by Reiya 零夜
          </p>
        </div>
      </div>
    </>
  );
}
