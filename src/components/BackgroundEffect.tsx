"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

// Dynamically import to prevent Next.js SSR build errors since the library relies on the Window object
const Swirl = dynamic(() => import("ambient-cbg").then(mod => mod.Swirl), { 
  ssr: false 
});

export default function BackgroundEffect() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none" style={{ backgroundColor: "#08080f" }}>
      {mounted && (
        <div className="w-full h-full opacity-60 pointer-events-auto">
          {/* This is the EXACT animation from the Webflow demo provided by the user */}
          <Swirl 
             color="#22c55e"    // Green color requested by the user
             particleCount={400} // Dense amount of swirling particles
             speed={0.8}        // Slow cinematic movement
             baseSpeed={0.3}
             size={2}
          />
        </div>
      )}

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
