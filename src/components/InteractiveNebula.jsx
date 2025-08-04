import React, { useRef, useEffect } from "react";

/**
 * Fast random noise (similar to Perlin/simplex)
 * For organic movement, no dependencies!
 */
function pseudoNoise(x, y, t) {
  return Math.sin(x * 0.3 + y * 0.3 + t * 0.8 + Math.cos(y + t)) * 0.5 +
    Math.sin(x * 0.5 - y * 0.2 + t * 1.3) * 0.5;
}

// Config
const LAYERS = [
  { color: [250, 100, 84], baseR: 48, amp: 22, speed: 1.1, alpha: 0.09 },
  { color: [185, 100, 65], baseR: 105, amp: 35, speed: 0.7, alpha: 0.045 },
  { color: [300, 100, 82], baseR: 73, amp: 40, speed: 0.85, alpha: 0.07 },
  { color: [50, 100, 58], baseR: 63, amp: 22, speed: 0.55, alpha: 0.05 }
];
const SPARKLE_COUNT = 45;
const SPARKLE_AREA = 110;
const SPARKLE_BASE_SIZE = 2.7;

const LivingNebulaCursor = () => {
  const canvasRef = useRef(null);
  const mouse = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2, moved: false });
  const timeRef = useRef(0);
  const running = useRef(true);

  // Sparkle objects
  const sparkles = useRef(
    Array.from({ length: SPARKLE_COUNT }).map(() => ({
      offsetX: (Math.random() - 0.5) * SPARKLE_AREA,
      offsetY: (Math.random() - 0.5) * SPARKLE_AREA,
      phase: Math.random() * Math.PI * 2,
      color: `hsla(${Math.floor(180 + Math.random()*100)},100%,85%,1)`
    }))
  );

  // Mouse movement
  useEffect(() => {
    const move = (e) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
      mouse.current.moved = true;
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  // Responsive
  useEffect(() => {
    const setSize = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        const dpr = window.devicePixelRatio || 1;
        canvas.width = window.innerWidth * dpr;
        canvas.height = window.innerHeight * dpr;
        canvas.style.width = "100vw";
        canvas.style.height = "100vh";
      }
    };
    setSize();
    window.addEventListener("resize", setSize);
    return () => window.removeEventListener("resize", setSize);
  }, []);

  // Animation loop
  useEffect(() => {
    running.current = true;
    let last = performance.now();

    function animate(now) {
      if (!running.current) return;
      const dt = (now - last) / 1000;
      last = now;
      timeRef.current += dt;
      const t = timeRef.current;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      const dpr = window.devicePixelRatio || 1;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Responsive mouse fallback (center if no move)
      const cx = mouse.current.x || window.innerWidth / 2;
      const cy = mouse.current.y || window.innerHeight / 2;

      // Nebula layers: morphing, breathing
      for (let l = 0; l < LAYERS.length; l++) {
        const { color, baseR, amp, speed, alpha } = LAYERS[l];
        const r = baseR + Math.sin(t * speed + l) * amp * (0.82 + 0.16 * Math.sin(t * 0.9 + l));
        const angleN = pseudoNoise(cx * 0.03 + l, cy * 0.03 - l, t * 0.15 + l) * Math.PI;
        const shiftX = Math.cos(angleN + t * 0.07 + l) * amp * 0.55;
        const shiftY = Math.sin(angleN + t * 0.1 - l) * amp * 0.5;

        const g = ctx.createRadialGradient(
          (cx + shiftX) * dpr, (cy + shiftY) * dpr, 0,
          (cx + shiftX) * dpr, (cy + shiftY) * dpr, r * dpr
        );
        g.addColorStop(0, `hsla(${color[0]},${color[1]}%,${color[2]+7}%,${alpha * 2.4})`);
        g.addColorStop(0.35, `hsla(${color[0]},${color[1]}%,${color[2]}%,${alpha})`);
        g.addColorStop(1, `hsla(${color[0]},${color[1]}%,${color[2]-28}%,0)`);
        ctx.save();
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = "lighter";
        ctx.beginPath();
        ctx.arc((cx + shiftX) * dpr, (cy + shiftY) * dpr, r * dpr, 0, 2 * Math.PI);
        ctx.fillStyle = g;
        ctx.fill();
        ctx.restore();
      }

      // Living nexus core
      const corePulse = 0.88 + Math.sin(t * 2.7) * 0.13;
      ctx.save();
      ctx.globalAlpha = 0.78 + 0.14 * Math.cos(t*1.2);
      ctx.globalCompositeOperation = "lighter";
      ctx.beginPath();
      ctx.arc(cx * dpr, cy * dpr, 27 * corePulse * dpr, 0, 2 * Math.PI);
      ctx.fillStyle = "rgba(255,255,255,0.38)";
      ctx.shadowColor = "white";
      ctx.shadowBlur = 46 * corePulse * dpr;
      ctx.fill();
      ctx.restore();

      // SPARKLES: each with organic flicker, orbit, and "twinkle"
      for (let i = 0; i < SPARKLE_COUNT; i++) {
        const sp = sparkles.current[i];
        // Orbit/flicker
        const ang = Math.atan2(sp.offsetY, sp.offsetX) + Math.sin(t * 0.37 + i) * 0.34;
        const dist = Math.sqrt(sp.offsetX ** 2 + sp.offsetY ** 2) +
          12 * Math.sin(t * 0.85 + i * 1.1 + sp.phase);
        const orbX = cx + Math.cos(ang) * dist;
        const orbY = cy + Math.sin(ang) * dist;
        // Flicker/twinkle
        const flicker = 0.8 + 0.38 * Math.abs(Math.sin(t*2.2 + sp.phase + i*0.6));
        ctx.save();
        ctx.globalAlpha = 0.38 * flicker + 0.09 * Math.random();
        ctx.globalCompositeOperation = "lighter";
        ctx.beginPath();
        ctx.arc(orbX * dpr, orbY * dpr, SPARKLE_BASE_SIZE * flicker * dpr, 0, 2 * Math.PI);
        ctx.fillStyle = sp.color;
        ctx.shadowColor = "white";
        ctx.shadowBlur = 14 * flicker * dpr;
        ctx.fill();
        ctx.restore();
      }

      requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
    return () => { running.current = false; };
  }, []);

  // Hide on touch devices
  if (typeof window !== "undefined" && ("ontouchstart" in window || navigator.maxTouchPoints > 0)) return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        zIndex: 9999,
        background: "transparent"
      }}
      aria-hidden="true"
      tabIndex={-1}
    />
  );
};

export default LivingNebulaCursor;
