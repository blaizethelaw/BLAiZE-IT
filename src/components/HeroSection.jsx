// src/components/HeroSection.jsx
import React, { useState, useEffect } from "react";
import AnimatedLogo from "./AnimatedLogo";

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
    <div className="w-full bg-black">
      <section className="flex flex-col items-center justify-center text-center pt-20">
        <div className="w-full flex justify-center items-center py-8">
          {allowAnimation ? (
            <AnimatedLogo />
          ) : (
            <img
              src="https://i.imgur.com/VHCRCEn.png"
              alt="BLAiZE IT Logo"
              className="w-52 h-auto"
            />
          )}
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
