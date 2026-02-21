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
      fpsLimit: 60,
      interactivity: {
        events: {
          onHover: {
            enable: true,
            mode: "grab",
          },
        },
        modes: {
          grab: {
            distance: 140,
            links: {
              opacity: 0.4,
              color: "#ffffff",
            },
          },
        },
      },
      particles: {
        color: {
          value: ["#ffffff", "#d4d4d4", "#a0a0a0"],
        },
        links: {
          color: "#ffffff",
          distance: 130,
          enable: true,
          opacity: 0.06,
          width: 1,
        },
        move: {
          enable: true,
          speed: 0.8,
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
          value: 50,
          limit: { value: 60 },
        },
        opacity: {
          value: { min: 0.2, max: 0.5 },
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
      {/* Large REIYA watermark text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none overflow-hidden">
        <img
          src="/images/reiya.png"
          alt=""
          className="w-[20vw] h-[20vw] object-contain brightness-0 invert opacity-[0.06] mb-4"
        />
        <h1
          className="text-[12vw] font-extrabold tracking-[0.2em] uppercase"
          style={{
            fontFamily: "var(--font-japan-ramen), sans-serif",
            color: "transparent",
            WebkitTextStroke: "1px rgba(255, 255, 255, 0.06)",
            textShadow: "0 0 80px rgba(255, 255, 255, 0.03)",
            userSelect: "none",
          }}
        >
          REIYA 零夜
        </h1>
      </div>

      {/* Subtle radial glow behind the text */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 50% 50%, rgba(255, 255, 255, 0.03) 0%, transparent 70%)",
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
