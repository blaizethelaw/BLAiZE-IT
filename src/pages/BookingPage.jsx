import React from "react";

export default function BookingPage() {
  return (
    <div className="flex flex-col items-center py-20 px-4">
      <h2 className="text-3xl font-bold mb-8 bg-gradient-to-r from-blaize-green via-blaize-yellow to-blaize-orange text-transparent bg-clip-text">
        Book a Consultation
      </h2>
      <div className="bg-zinc-900 border border-blaize-green/30 rounded-xl p-8 shadow-glow w-full max-w-xl">
        <form
          action="https://formspree.io/f/mzbllgza"
          method="POST"
          className="flex flex-col gap-5"
        >
          <input
            name="name"
            type="text"
            required
            placeholder="Your Name"
            className="bg-black/80 border-blaize-green/50 border rounded px-4 py-3 text-white"
          />
          <input
            name="email"
            type="email"
            required
            placeholder="Your Email"
            className="bg-black/80 border-blaize-yellow/50 border rounded px-4 py-3 text-white"
          />
          <textarea
            name="message"
            required
            placeholder="Tell us about your project or IT needs"
            rows={4}
            className="bg-black/80 border-blaize-orange/50 border rounded px-4 py-3 text-white"
          />
          <button
            type="submit"
            className="py-3 rounded font-bold bg-gradient-to-r from-blaize-green via-blaize-yellow to-blaize-orange text-black shadow-glow hover:brightness-110 transition"
          >
            Send Request
          </button>
        </form>
      </div>
    </div>
  );
}
