// src/components/BookingButton.jsx
import React from "react";

export default function BookingButton() {
  return (
    <div className="flex justify-center my-8">
      <a
        href="/booking"
        className="px-8 py-4 text-xl rounded-full font-bold bg-gradient-to-r from-blaize-green via-blaize-yellow to-blaize-orange shadow-xl text-white hover:scale-105 transition-transform"
      >
        Book a Free Consultation
      </a>
    </div>
  );
}
