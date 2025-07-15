import React, { useRef, useEffect } from 'react';

export default function WarpTunnel() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;
    const radiusMax = Math.min(width, height) / 2;
    const stars = new Array(600).fill().map(() => ({
      angle: Math.random() * Math.PI * 2,
      radius: Math.random() * radiusMax,
      depth: Math.random() * 400 + 100
    }));
    let lastTime = performance.now();

    const update = (time) => {
      const delta = time - lastTime;
      lastTime = time;
      ctx.fillStyle = 'rgba(0,0,20,0.6)';
      ctx.fillRect(0, 0, width, height);
      ctx.save();
      ctx.translate(width / 2, height / 2);
      for (const star of stars) {
        star.depth -= delta * 0.2;
        star.angle += delta * 0.0008;
        if (star.depth <= 0) {
          star.depth = Math.random() * 400 + 100;
          star.radius = Math.random() * radiusMax;
        }
        const scale = 300 / star.depth;
        const x = Math.cos(star.angle) * star.radius * scale;
        const y = Math.sin(star.angle) * star.radius * scale;
        const size = (1 - star.depth / 400) * 3;
        const hue = 200 + (star.depth / 2);
        ctx.fillStyle = `hsl(${hue},80%,70%)`;
        ctx.fillRect(x, y, size, size);
      }
      ctx.restore();
      requestAnimationFrame(update);
    };
    requestAnimationFrame(update);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 -z-10" />;
}
