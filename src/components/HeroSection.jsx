// src/components/HeroSection.jsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import AnimatedLogo from "./AnimatedLogo";

// Toggle which animated logo to use when motion is allowed:
// true  -> InteractiveLogo (below)
// false -> AnimatedLogo (imported)
const USE_INTERACTIVE_LOGO = true;

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
      className="relative w-full h-full flex items-center justify-center"
      onMouseMove={handleMouseMove}
      animate={{ x: offset.x, y: offset.y }}
      transition={{ type: "spring", stiffness: 80, damping: 10 }}
    >
      <motion.img
        src="/logo.png"
        alt="BLAiZE IT Logo"
        className="w-full h-auto relative z-10 pointer-events-none select-none"
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1, y: [0, -4, 0] }}
        transition={{
          type: "spring",
          duration: 0.7,
          delay: 0.1,
          y: { repeat: Infinity, repeatType: "mirror", duration: 3 },
        }}
        draggable={false}
      />

      {/* Nebula overlay */}
      <div className="absolute inset-0 pointer-events-none mix-blend-screen opacity-70 blur-sm bg-[radial-gradient(circle_at_center,rgba(255,132,0,0.6),rgba(77,153,0,0.2),transparent)]" />
    </motion.div>
  );
}

export default function HeroSection() {
  const [allowAnimation, setAllowAnimation] = useState(true);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = () => setAllowAnimation(!mediaQuery.matches);
    handleChange();
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return (
    <div className="w-full bg-black text-white">
      <section className="flex flex-col items-center justify-center text-center pt-20">
        <div className="w-full flex justify-center items-center py-8">
          {/* Sized wrapper controls logo dimensions */}
          <div className="relative w-52 h-52 flex items-center justify-center">
            {allowAnimation ? (
              USE_INTERACTIVE_LOGO ? (
                <InteractiveLogo />
              ) : (
                <AnimatedLogo />
              )
            ) : (
              <img
                src="https://i.imgur.com/VHCRCEn.png"
                alt="BLAiZE IT Logo"
                className="w-full h-auto"
              />
            )}
          </div>
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
