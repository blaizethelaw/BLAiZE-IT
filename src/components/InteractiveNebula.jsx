import React, { useRef, useEffect } from "react";

// --- CONFIG ---
const PARTICLE_CAP = 60;
const PARTICLES_PER_FRAME = 1;
const ORBITERS = 12;
const NEXUS_RADIUS = 40;
const PARTICLE_LIFESPAN = 0.8;
const PARTICLE_MIN_SIZE = 6;
const PARTICLE_MAX_SIZE = 16;
const PALETTE = [
  [210, 100, 70],  // Blue
  [265, 100, 73],  // Purple
  [320, 97, 65],   // Pink
  [185, 100, 66],  // Aqua
  [55, 95, 56]     // Yellow
];

const NexusNebulaCursor = () => {
  const canvasRef = useRef(null);
  const particles = useRef([]);
  const mouse = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2, moved: false });
  const running = useRef(true);
  const time = useRef(0);

  // Utility for palette cycling
  const pickColor = () => {
    const idx = Math.floor(Math.random() * PALETTE.length);
    const [h, s, l] = PALETTE[idx];
    return `hsl(${h},${s}%,${l}%)`;
  };

  // Particle class with gentle spiral
  class Particle {
    constructor(x, y) {
      this.baseAngle = Math.random() * Math.PI * 2;
      this.radius = 30 + Math.random() * 30;
      this.angularSpeed = 0.6 + Math.random() * 0.7;
      this.x0 = x;
      this.y0 = y;
      this.size = Math.random() * (PARTICLE_MAX_SIZE - PARTICLE_MIN_SIZE) + PARTICLE_MIN_SIZE;
      this.life = 1;
      this.color = pickColor();
      this.age = 0;
    }
    update(dt, t, centerX, centerY) {
      this.age += dt;
      this.life -= dt / PARTICLE_LIFESPAN;
      // Swirl/orbit
      const angle = this.baseAngle + t * this.angularSpeed + this.age * 0.8;
      this.x = centerX + Math.cos(angle) * this.radius * (1 - (1 - this.life) * 0.35);
      this.y = centerY + Math.sin(angle) * this.radius * (1 - (1 - this.life) * 0.35);
      this.size *= 0.985;
    }
    draw(ctx, dpr) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, this.life) * 0.34;
      ctx.globalCompositeOperation = "lighter";
      const grad = ctx.createRadialGradient(
        this.x * dpr, this.y * dpr, 0,
        this.x * dpr, this.y * dpr, this.size * dpr
      );
      grad.addColorStop(0, this.color);
      grad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.beginPath();
      ctx.arc(this.x * dpr, this.y * dpr, this.size * dpr, 0, 2 * Math.PI);
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.restore();
    }
  }

  // Orbiters for the animated ring
  const drawOrbiters = (ctx, dpr, centerX, centerY, t) => {
    for (let i = 0; i < ORBITERS; i++) {
      const angle = (t * 0.8) + (i * ((Math.PI * 2) / ORBITERS));
      const r = NEXUS_RADIUS + 13 + Math.sin(t * 2 + i) * 6;
      const orbX = centerX + Math.cos(angle) * r;
      const orbY = centerY + Math.sin(angle) * r;
      const [h, s, l] = PALETTE[i % PALETTE.length];
      ctx.save();
      ctx.globalAlpha = 0.35 + 0.13 * Math.sin(t * 1.7 + i * 1.3);
      ctx.globalCompositeOperation = "lighter";
      ctx.beginPath();
      ctx.arc(orbX * dpr, orbY * dpr, 7 * dpr, 0, 2 * Math.PI);
      ctx.fillStyle = `hsl(${h},${s}%,${l}%)`;
      ctx.shadowColor = `hsl(${h},${s}%,90%)`;
      ctx.shadowBlur = 32 * dpr;
      ctx.fill();
      ctx.restore();
    }
  };

  // Central glowing nexus
  const drawNexus = (ctx, dpr, centerX, centerY, t) => {
    const g = ctx.createRadialGradient(
      centerX * dpr, centerY * dpr, 0,
      centerX * dpr, centerY * dpr, NEXUS_RADIUS * dpr
    );
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.19, "rgba(255,245,236,0.75)");
    g.addColorStop(0.6, "rgba(145,185,255,0.38)");
    g.addColorStop(1, "rgba(55, 40, 155, 0.09)");

    ctx.save();
    ctx.globalAlpha = 0.94 + 0.05 * Math.sin(t * 2.3);
    ctx.globalCompositeOperation = "lighter";
    ctx.beginPath();
    ctx.arc(centerX * dpr, centerY * dpr, NEXUS_RADIUS * dpr, 0, 2 * Math.PI);
    ctx.fillStyle = g;
    ctx.shadowColor = "white";
    ctx.shadowBlur = 48 * dpr;
    ctx.fill();
    ctx.restore();
  };

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

  // Resize
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
      time.current += dt;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      const dpr = window.devicePixelRatio || 1;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const centerX = mouse.current.x || window.innerWidth / 2;
      const centerY = mouse.current.y || window.innerHeight / 2;

      // Draw central nexus
      drawNexus(ctx, dpr, centerX, centerY, time.current);

      // Draw orbiters
      drawOrbiters(ctx, dpr, centerX, centerY, time.current);

      // Add new nebula particles
      if (mouse.current.moved && particles.current.length < PARTICLE_CAP) {
        for (let i = 0; i < PARTICLES_PER_FRAME; i++) {
          particles.current.push(new Particle(centerX, centerY));
        }
        mouse.current.moved = false;
      }

      // Draw/animate nebula particles
      for (let i = particles.current.length - 1; i >= 0; i--) {
        const p = particles.current[i];
        p.update(dt, time.current, centerX, centerY);
        p.draw(ctx, dpr);
        if (p.life <= 0 || p.size < 0.5) particles.current.splice(i, 1);
      }

      requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
    return () => { running.current = false; };
  }, []);

  // No effect on touch devices (optional)
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

export default NexusNebulaCursor;
