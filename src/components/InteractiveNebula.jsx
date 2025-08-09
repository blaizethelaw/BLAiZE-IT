import React, { useRef, useEffect } from "react";

// Minimal canvas component used for testing purposes
export default function InteractiveNebula() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, []);

  return <canvas ref={canvasRef} width={300} height={150} />;
}

