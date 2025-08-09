// src/components/HeroSection.jsx
import React from "react";
import AnimatedLogo from "./AnimatedLogo";

export default function HeroSection() {
  return (
    <div className="w-full bg-black">
      <section className="flex flex-col items-center justify-center text-center pt-12 md:pt-20">
        <div className="w-full flex justify-center items-center py-4">
          {/* This now directly uses the new animated logo component */}
          <AnimatedLogo />
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold bg-gradient-to-r from-blaize-green to-blaize-orange bg-clip-text text-transparent mb-6 -mt-8 md:-mt-12">
          BLAiZE IT Solutions
        </h1>
        <p className="text-lg md:text-2xl text-white/80 mb-10 max-w-xl px-4">
          IT Solutions for Business and Home
        </p>
      </section>
    </div>
  );
}
