"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import type { ISourceOptions } from "@tsparticles/engine";

export default function BackgroundEffect() {
  const [init, setInit] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  const particlesLoaded = useCallback(async () => {}, []);

  const options: ISourceOptions = useMemo(
    () => ({
      fullScreen: { enable: false },
      background: { color: { value: "transparent" } },
      fpsLimit: 120,
      interactivity: {
        events: {
          onHover: {
            enable: true,
            mode: "grab",
          },
          onClick: {
            enable: true,
            mode: "push",
          },
        },
        modes: {
          grab: {
            distance: 180,
            links: {
              opacity: 0.5,
              color: "#a78bfa",
            },
          },
          push: {
            quantity: 4,
          },
          repulse: {
            distance: 150,
            duration: 0.4,
          },
        },
      },
      particles: {
        color: {
          value: ["#8b5cf6", "#a855f7", "#7c3aed", "#6366f1", "#818cf8", "#c084fc"],
        },
        links: {
          color: "#8b5cf6",
          distance: 150,
          enable: true,
          opacity: 0.15,
          width: 1,
        },
        move: {
          enable: true,
          speed: 1.2,
          direction: "none" as const,
          random: true,
          straight: false,
          outModes: {
            default: "bounce" as const,
          },
        },
        number: {
          density: {
            enable: true,
          },
          value: 100,
        },
        opacity: {
          value: { min: 0.3, max: 0.7 },
          animation: {
            enable: true,
            speed: 0.5,
            sync: false,
          },
        },
        shape: {
          type: "circle",
        },
        size: {
          value: { min: 1, max: 3 },
        },
      },
      detectRetina: true,
    }),
    []
  );

  if (!init) return null;

  return (
    <div className="fixed inset-0 z-[-1]" style={{ background: "var(--bg-primary)" }}>
      {/* Large SEISEN watermark text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
        <h1
          className="text-[12vw] font-extrabold tracking-[0.2em] uppercase"
          style={{
            color: "transparent",
            WebkitTextStroke: "1px rgba(139, 92, 246, 0.08)",
            textShadow: "0 0 80px rgba(139, 92, 246, 0.05)",
            userSelect: "none",
          }}
        >
          SEISEN
        </h1>
      </div>

      {/* Subtle radial glow behind the text */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 50% 50%, rgba(139, 92, 246, 0.06) 0%, transparent 70%)",
        }}
      />

      {/* Particles layer */}
      <Particles
        id="tsparticles"
        particlesLoaded={particlesLoaded}
        options={options}
        className="absolute inset-0 w-full h-full"
      />
    </div>
  );
}
