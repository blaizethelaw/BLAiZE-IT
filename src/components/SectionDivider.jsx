// src/components/SectionDivider.jsx
import React from "react";

export default function SectionDivider({ flip }) {
  return (
    <svg
      className={`w-full h-16 md:h-20 ${flip ? "rotate-180" : ""}`}
      viewBox="0 0 1440 100"
      preserveAspectRatio="none"
    >
      <polygon
        fill="#1d1d22"
        fillOpacity="1"
        points="0,100 1440,0 1440,100"
      />
    </svg>
  );
}
