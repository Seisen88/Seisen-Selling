"use client";

import { useEffect, useState } from "react";

export default function BackgroundEffect() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden bg-[#08080f] pointer-events-none">
      <div className="absolute inset-0 w-full h-full opacity-60 mix-blend-screen">
        {/* Blob 1: Vibrant Green */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-green-500/20 rounded-full blur-[120px] animate-blob mix-blend-screen" />
        
        {/* Blob 2: Emerald/Teal */}
        <div className="absolute top-[20%] right-[-10%] w-[600px] h-[600px] bg-emerald-600/20 rounded-full blur-[120px] animate-blob animation-delay-2000 mix-blend-screen" />
        
        {/* Blob 3: Deep Forest Green */}
        <div className="absolute bottom-[-10%] left-[20%] w-[550px] h-[550px] bg-green-700/20 rounded-full blur-[120px] animate-blob animation-delay-4000 mix-blend-screen" />
      </div>

      {/* Background Mesh Grid (optional, provides texture) */}
      <div 
        className="absolute inset-0 opacity-[0.03]" 
        style={{
          backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      {/* Overlay noise texture for premium grainy feel */}
      <div 
        className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }}
      />
    </div>
  );
}
