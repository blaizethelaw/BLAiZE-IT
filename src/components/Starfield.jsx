import React, { useRef, useEffect } from 'react';

export default function Starfield() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;
    const stars = new Array(250).fill().map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      z: Math.random() * width
    }));
    const update = () => {
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.fillRect(0,0,width,height);
      for (let s of stars) {
        s.z -= 2;
        if (s.z <= 0) s.z = width;
        const k = 128 / s.z;
        const px = s.x * k + width/2;
        const py = s.y * k + height/2;
        if (px >= 0 && px <= width && py >= 0 && py <= height) {
          const size = (1 - s.z / width) * 2;
          ctx.fillStyle = '#fff';
          ctx.fillRect(px, py, size, size);
        }
      }
      requestAnimationFrame(update);
    };
    update();
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
