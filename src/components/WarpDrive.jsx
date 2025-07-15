import React, { useRef, useEffect } from 'react';

/**
 * WarpDrive renders a hyper-speed starfield effect on a canvas.
 * Stars accelerate toward the viewer creating streaks similar to
 * entering hyperspace. It is purely aesthetic and runs with minimal overhead.
 */
export default function WarpDrive() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    // Generate stars with random positions in 3D space
    let stars = new Array(400).fill().map(() => ({
      x: (Math.random() * 2 - 1) * width,
      y: (Math.random() * 2 - 1) * height,
      z: Math.random() * width
    }));

    const update = () => {
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.fillRect(0,0,width,height);
      for (let s of stars) {
        s.z -= 4; // accelerate towards the viewer
        if (s.z <= 0) {
          s.x = (Math.random() * 2 - 1) * width;
          s.y = (Math.random() * 2 - 1) * height;
          s.z = width;
        }
        const k = 128 / s.z;
        const px = s.x * k + width / 2;
        const py = s.y * k + height / 2;
        if (px >= 0 && px < width && py >= 0 && py < height) {
          const tailX = px + (px - width/2) * 0.02;
          const tailY = py + (py - height/2) * 0.02;
          const alpha = 1 - s.z / width;
          ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
          ctx.beginPath();
          ctx.moveTo(tailX, tailY);
          ctx.lineTo(px, py);
          ctx.stroke();
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
