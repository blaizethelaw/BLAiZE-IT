// src/components/HeroSection.jsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import AnimatedLogo from "./AnimatedLogo";

function InteractiveLogo() {
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left - rect.width / 2) / rect.width) * 20;
    const y = ((e.clientY - rect.top - rect.height / 2) / rect.height) * 20;
    setOffset({ x, y });
  };

  return (
    <motion.div
      className="relative w-52 h-52 flex items-center justify-center"
      onMouseMove={handleMouseMove}
      animate={{ x: offset.x, y: offset.y }}
      transition={{ type: "spring", stiffness: 80, damping: 10 }}
    >
      <motion.img
        src="https://i.imgur.com/VHCRCEn.png"
        alt="BLAiZE IT Logo"
        className="w-52 h-auto relative z-10 pointer-events-none"
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1, y: [0, -4, 0] }}
        transition={{
          type: "spring",
          duration: 0.7,
          delay: 0.1,
          y: {
            repeat: Infinity,
            repeatType: "mirror",
            duration: 3,
          },
        }}
      />
      <div className="absolute inset-0 pointer-events-none mix-blend-screen opacity-70 animate-nebula bg-[radial-gradient(circle_at_center,rgba(255,132,0,0.6),rgba(77,153,0,0.2),transparent)] blur-sm" />
    </motion.div>
  );
}

export default function HeroSection() {
  const [useInteractive, setUseInteractive] = useState(true);

  useEffect(() => {
    // Check for browser animation support
    let supportsAnimation = true;
    try {
      const test = document.createElement("div");
      test.animate({ opacity: [0, 1] }, { duration: 100 });
    } catch {
      supportsAnimation = false;
    }

    // Check for OS "Reduce Motion" preference
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (!supportsAnimation || prefersReducedMotion) {
      setUseInteractive(false);
    }
  }, []);

  return (
    <div className="w-full bg-black">
      <section className="flex flex-col items-center justify-center text-center pt-20">
        <div className="w-full flex justify-center items-center py-8">
          {useInteractive ? <InteractiveLogo /> : <AnimatedLogo />}
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold bg-gradient-to-r from-blaize-green to-blaize-orange bg-clip-text text-transparent mb-6">
          BLAiZE IT Solutions
        </h1>
        <p className="text-lg md:text-2xl text-white/80 mb-10 max-w-xl">
          IT Solutions for Business and Home
        </p>
      </section>
    </div>
  );
}
