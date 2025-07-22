import React from 'react';

export default function GradientBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <div className="absolute -inset-20 bg-gradient-to-br from-blaize-green via-blaize-yellow to-blaize-orange opacity-30 blur-3xl animate-spin-slow"></div>
    </div>
  );
}
