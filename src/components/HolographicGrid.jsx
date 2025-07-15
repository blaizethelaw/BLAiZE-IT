import React, { useRef, useEffect } from 'react';

export default function HolographicGrid() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;
    let animationFrameId;
    const render = (time = 0) => {
      ctx.clearRect(0, 0, width, height);
      ctx.strokeStyle = 'rgba(0,255,255,0.3)';
      ctx.lineWidth = 1;
      const spacing = 40;
      const offset = Math.sin(time / 1000) * 20;
      ctx.beginPath();
      for (let x = -spacing; x <= width + spacing; x += spacing) {
        ctx.moveTo(x + offset, 0);
        ctx.lineTo(x - offset, height);
      }
      for (let y = -spacing; y <= height + spacing; y += spacing) {
        ctx.moveTo(0, y + offset);
        ctx.lineTo(width, y - offset);
      }
      ctx.stroke();
      animationFrameId = requestAnimationFrame(render);
    };
    render();
    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 -z-10 mix-blend-overlay pointer-events-none" />;
}
