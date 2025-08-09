import React from "react";
import AnimatedLogo from "./AnimatedLogo";

export default function HeroSection() {
  return (
    <div className="w-full bg-black">
      <section className="flex flex-col items-center justify-center text-center min-h-[70vh] pt-10 md:pt-16 relative overflow-hidden">
        {/* Soft spotlight behind the logo */}
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(1200px 600px at 50% 20%, rgba(20,50,20,0.55), transparent 70%)",
          }}
        />

        {/* Animated flame logo */}
        <div className="w-full flex justify-center items-center py-6 md:py-8">
          <AnimatedLogo logoUrl={"https://i.imgur.com/VHCRCEn.png"} width={420} quality="high" />
        </div>

        {/* Headline & sub */}
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-[#9BE22A] via-[#EABA2A] to-[#FF8400] bg-clip-text text-transparent mb-4">
          BLAiZE IT Solutions
        </h1>
        <p className="text-base md:text-2xl text-white/80 mb-10 px-6 max-w-2xl">
          IT Solutions for Business and Home
        </p>
      </section>
    </div>
  );
}
