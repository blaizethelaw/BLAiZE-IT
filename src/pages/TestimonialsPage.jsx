import React from "react";

export default function TestimonialsPage() {
  const testimonials = [
    {
      name: "Sarah L.",
      text: "BLAiZE IT revamped our entire network. We’ve never felt more secure.",
      role: "Office Manager, Daylight Dental"
    },
    {
      name: "Mark G.",
      text: "They saved our business during a ransomware attack. Total pros.",
      role: "COO, Gresham Logistics"
    },
    {
      name: "Priya R.",
      text: "Super fast home install. Tech was courteous and explained everything clearly.",
      role: "Homeowner, Delaware County"
    },
  ];
  return (
    <section className="max-w-3xl mx-auto py-20 px-6 text-center">
      <h2 className="text-4xl font-bold mb-10 bg-gradient-to-r from-blaize-green via-blaize-yellow to-blaize-orange text-transparent bg-clip-text">
        What Our Clients Say
      </h2>
      <div className="grid gap-8">
        {testimonials.map((t, i) => (
          <div key={i} className="bg-zinc-900 rounded-xl p-6 shadow-glow border border-blaize-green/30">
            <p className="italic text-lg mb-3 text-blaize-yellow">“{t.text}”</p>
            <div className="font-bold text-blaize-green">{t.name}</div>
            <div className="text-xs text-blaize-orange">{t.role}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
