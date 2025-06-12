import React from "react";
import { motion } from "framer-motion";

export default function ContactSection() {
  return (
    <section className="py-20 bg-blaize-dark text-white flex flex-col items-center">
      <h2 className="text-3xl md:text-4xl font-bold mb-8 bg-gradient-to-r from-blaize-green to-blaize-orange bg-clip-text text-transparent">
        Get In Touch
      </h2>
      <motion.form
        className="w-full max-w-lg space-y-6 bg-[#232332] rounded-xl p-8 shadow-xl"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true }}
        action="mailto:youremail@blaizeit.com"
        method="POST"
      >
        <input
          className="w-full px-4 py-2 rounded-lg bg-blaize-dark text-white border border-blaize-orange mb-4"
          type="text"
          name="name"
          placeholder="Your Name"
          required
        />
        <input
          className="w-full px-4 py-2 rounded-lg bg-blaize-dark text-white border border-blaize-orange mb-4"
          type="email"
          name="email"
          placeholder="Your Email"
          required
        />
        <textarea
          className="w-full px-4 py-2 rounded-lg bg-blaize-dark text-white border border-blaize-orange mb-4"
          name="message"
          placeholder="Your Message"
          required
        ></textarea>
        <button
          type="submit"
          className="w-full py-2 rounded-lg bg-blaize-orange text-white font-bold hover:bg-blaize-green transition-colors"
        >
          Send
        </button>
      </motion.form>
    </section>
  );
}
