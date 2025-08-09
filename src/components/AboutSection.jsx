import React from "react";
import { motion } from "framer-motion";

export default function AboutSection() {
  return (
    <section className="py-20 bg-blaize-dark text-white flex flex-col md:flex-row items-center max-w-6xl mx-auto px-4 gap-10">
      <motion.div
        className="flex-1 flex justify-center"
        initial={{ opacity: 0, x: -40 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true }}
      >
        <img
          src="https://i.imgur.com/VHCRCEn.png"
          alt="BLAiZE IT Founder"
          className="rounded-full w-52 h-52 object-contain shadow-2xl bg-white/10"
        />
      </motion.div>
      <motion.div
        className="flex-1"
        initial={{ opacity: 0, x: 40 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true }}
      >
        <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-blaize-green to-blaize-orange bg-clip-text text-transparent">
          About BLAiZE IT
        </h2>
        <p className="text-white/80 text-lg mb-6">
          Blaize IT is dedicated to providing top-tier IT solutions for both businesses and homes, offering managed services, cybersecurity, cloud migrations, and expert consulting.
        </p>
      </motion.div>
    </section>
  );
}
