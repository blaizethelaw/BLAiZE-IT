import React from "react";
import { motion } from "framer-motion";

export default function HeroSection() {
  return (
    <div className="w-full bg-black">
      <section className="flex flex-col items-center justify-center text-center pt-20">
        <div className="w-full flex justify-center items-center py-8">
          <motion.img
            src="/blaize-logo.png"
            alt="BLAiZE IT Logo"
            className="w-52 h-auto"
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", duration: 0.7, delay: 0.1 }}
          />
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
