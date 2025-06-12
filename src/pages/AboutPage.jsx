import React from "react";

export default function AboutPage() {
  return (
    <section className="max-w-3xl mx-auto py-20 px-6 text-center">
      <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-blaize-green via-blaize-yellow to-blaize-orange text-transparent bg-clip-text">About BLAiZE IT</h2>
      <p className="text-white/80 text-lg mb-8">
        BLAiZE IT Solutions is your modern, responsive IT partner. We blend security-first thinking, personal service, and high-end technical expertise to solve real business and home technology problems fast.
      </p>
      <div className="flex flex-col gap-2 items-center">
        <div className="flex gap-2">
          <span className="text-blaize-green font-bold">• Certified Experts</span>
          <span className="text-blaize-yellow font-bold">• Local Support</span>
          <span className="text-blaize-orange font-bold">• Blazing Fast Response</span>
        </div>
      </div>
    </section>
  );
}
