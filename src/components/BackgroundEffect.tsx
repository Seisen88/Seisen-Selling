"use client";

import { useEffect, useState } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";

// Three distinct organic shapes for the blob to morph between
const SHAPE_1 = "M18.8,-27C24.4,-20.8,29.1,-14.8,32.3,-7.4C35.5,0.1,37.2,9.1,33.5,15.6C29.8,22.2,20.8,26.4,12.1,30.3C3.3,34.2,-5.1,37.7,-13.7,36.5C-22.3,35.2,-31.1,29.2,-35.1,20.8C-39.1,12.3,-38.3,1.4,-35.5,-8.4C-32.6,-18.2,-27.7,-27,-20.6,-32.5C-13.4,-38,-4,-40.1,2.8,-43.3C9.6,-46.5,13.3,-33.2,18.8,-27Z";
const SHAPE_2 = "M21.9,-30.1C27.9,-25.3,32.1,-17.8,34.9,-9.5C37.8,-1.2,39.3,8,35.7,14.6C32.1,21.3,23.3,25.4,15,30.3C6.7,35.2,-1,40.9,-9.5,41.4C-18,41.9,-27.3,37.2,-33.1,29.6C-39,22.1,-41.4,11.8,-40.5,2.1C-39.6,-7.6,-35.5,-16.7,-29.6,-24.1C-23.8,-31.5,-16.1,-37.2,-7.5,-38.6C1.1,-40,15.9,-34.9,21.9,-30.1Z";
const SHAPE_3 = "M25.4,-33.9C31.5,-28.9,34.2,-19.5,35.3,-10.1C36.4,-0.7,35.9,8.6,32.1,16.5C28.4,24.4,21.5,31,13.1,35.1C4.7,39.3,-5.1,41,-14.5,39.1C-23.9,37.2,-32.8,31.7,-38.1,23.5C-43.3,15.3,-44.8,4.5,-41.4,-4.3C-38,-13,-29.6,-19.7,-22,-25.5C-14.4,-31.3,-7.2,-36.2,1.2,-37.7C9.6,-39.2,19.3,-38.9,25.4,-33.9Z";

export default function BackgroundEffect() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // Apply butter-smooth spring physics to the mouse tracking
  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  useEffect(() => {
    // Center the effect initially
    mouseX.set(window.innerWidth / 2);
    mouseY.set(window.innerHeight / 2);

    const handleMouseMove = (e: MouseEvent) => {
      // Offset by 300px (half the 600px size) to center the blob under cursor
      mouseX.set(e.clientX - 300);
      mouseY.set(e.clientY - 300);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden bg-[#08080f] pointer-events-none">
      
      {/* Background Mesh Grid */}
      <div 
        className="absolute inset-0 opacity-[0.03]" 
        style={{
          backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      {/* Frame Motion Interactive Swirl Blob */}
      <motion.div
        style={{
          x: springX,
          y: springY,
        }}
        className="absolute w-[600px] h-[600px] pointer-events-none mix-blend-screen"
      >
        <motion.svg
          viewBox="-50 -50 100 100"
          className="w-full h-full opacity-60 drop-shadow-[0_0_80px_rgba(139,92,246,0.6)]"
          style={{ filter: "blur(50px)" }}
        >
          {/* Linear gradient fill for the blob */}
          <defs>
            <linearGradient id="blobGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7c3aed" />  {/* Purple-600 */}
              <stop offset="50%" stopColor="#60a5fa" /> {/* Blue-400 */}
              <stop offset="100%" stopColor="#c084fc" /> {/* Purple-400 */}
            </linearGradient>
          </defs>
          <motion.path
            fill="url(#blobGrad)"
            animate={{
              d: [SHAPE_1, SHAPE_2, SHAPE_3, SHAPE_1],
              rotate: [0, 90, 180, 270, 360],
            }}
            transition={{
              repeat: Infinity,
              duration: 20,
              ease: "linear",
            }}
          />
        </motion.svg>
      </motion.div>

      {/* Floating Ambient Orbs (Provides depth behind the blob) */}
      <div className="absolute top-[10%] left-[20%] w-[40%] h-[40%] rounded-full bg-purple-600/10 blur-[120px] mix-blend-screen animate-float" />
      <div className="absolute bottom-[10%] right-[10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[120px] mix-blend-screen animate-float-delayed" />

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
