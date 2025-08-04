import React, { useRef, useEffect } from 'react';

// NEW: Interactive Bio-Structure Background
const BioStructureBackground = () => {
    const canvasRef = useRef(null);
    const particles = useRef([]);
    const mouse = useRef({ x: null, y: null, radius: 150 });
    const running = useRef(true);

    // --- CONFIG ---
    const PARTICLE_COUNT = 80;
    const CONNECT_DISTANCE = 140;
    const MOUSE_PULL_FACTOR = 0.3;
    const PALETTE = {
        'A': 'hsla(160, 70%, 70%, 0.9)', // Teal
        'T': 'hsla(205, 80%, 75%, 0.9)', // Blue
        'G': 'hsla(50, 90%, 70%, 0.9)',  // Yellow
        'C': 'hsla(30, 90%, 65%, 0.9)'   // Orange
    };
    const BASE_TYPES = Object.keys(PALETTE);

    class Particle {
        constructor(x, y, dpr) {
            this.x = x;
            this.y = y;
            this.vx = Math.random() * 0.4 - 0.2;
            this.vy = Math.random() * 0.4 - 0.2;

            this.type = Math.random() > 0.95 ? 'helix' : 'amino_acid';

            if (this.type === 'helix') {
                this.radius = (Math.random() * 3 + 2) * dpr;
                this.rotation = Math.random() * Math.PI * 2;
                this.rotationSpeed = (Math.random() - 0.5) * 0.02;
            } else {
                this.radius = (Math.random() * 1.5 + 0.5) * dpr;
                const base = BASE_TYPES[Math.floor(Math.random() * BASE_TYPES.length)];
                this.color = PALETTE[base];
            }
        }

        draw(ctx) {
            if (this.type === 'helix') {
                this.drawHelix(ctx);
            } else {
                this.drawAminoAcid(ctx);
            }
        }

        drawAminoAcid(ctx) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
            ctx.fillStyle = this.color;
            ctx.fill();
        }

        drawHelix(ctx) {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            const helixLength = this.radius * 5;
            const helixWidth = this.radius * 1.5;
            ctx.strokeStyle = 'rgba(200, 220, 255, 0.7)';
            ctx.lineWidth = 1.5;

            // Draw backbones
            ctx.beginPath();
            for (let i = -helixLength / 2; i < helixLength / 2; i++) {
                const xPos = i;
                const yPos = Math.sin(i / (helixLength / (Math.PI * 2))) * helixWidth;
                if (i === -helixLength / 2) ctx.moveTo(xPos, yPos);
                else ctx.lineTo(xPos, yPos);
            }
            ctx.stroke();

            ctx.beginPath();
            for (let i = -helixLength / 2; i < helixLength / 2; i++) {
                const xPos = i;
                const yPos = -Math.sin(i / (helixLength / (Math.PI * 2))) * helixWidth;
                if (i === -helixLength / 2) ctx.moveTo(xPos, yPos);
                else ctx.lineTo(xPos, yPos);
            }
            ctx.stroke();
            ctx.restore();
        }

        update(canvas, dpr) {
            // Move particle
            this.x += this.vx * dpr;
            this.y += this.vy * dpr;
            if (this.type === 'helix') {
                this.rotation += this.rotationSpeed;
            }

            // Mouse interaction
            if (mouse.current.x) {
                const dx = mouse.current.x * dpr - this.x;
                const dy = mouse.current.y * dpr - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < mouse.current.radius * dpr) {
                    const forceDirectionX = dx / dist;
                    const forceDirectionY = dy / dist;
                    const force = (mouse.current.radius * dpr - dist) / (mouse.current.radius * dpr);
                    this.vx += forceDirectionX * force * MOUSE_PULL_FACTOR;
                    this.vy += forceDirectionY * force * MOUSE_PULL_FACTOR;
                }
            }

            // Friction
            this.vx *= 0.99;
            this.vy *= 0.99;

            // Wall collision / wrap around
            if (this.x < 0) this.x = canvas.width;
            if (this.x > canvas.width) this.x = 0;
            if (this.y < 0) this.y = canvas.height;
            if (this.y > canvas.height) this.y = 0;
        }
    }

    const connect = (ctx, dpr) => {
        let opacityValue = 1;
        for (let a = 0; a < particles.current.length; a++) {
            for (let b = a; b < particles.current.length; b++) {
                const p1 = particles.current[a];
                const p2 = particles.current[b];
                const distance = Math.sqrt(
                    ((p1.x - p2.x) * (p1.x - p2.x)) +
                    ((p1.y - p2.y) * (p1.y - p2.y))
                );

                if (distance < CONNECT_DISTANCE * dpr) {
                    opacityValue = 1 - (distance / (CONNECT_DISTANCE * dpr));
                    ctx.strokeStyle = `rgba(200, 220, 255, ${opacityValue * 0.5})`;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.stroke();
                }
            }
        }
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;

        const setSize = () => {
            canvas.width = window.innerWidth * dpr;
            canvas.height = window.innerHeight * dpr;
            canvas.style.width = "100vw";
            canvas.style.height = "100vh";

            particles.current = [];
            for (let i = 0; i < PARTICLE_COUNT; i++) {
                particles.current.push(new Particle(
                    Math.random() * canvas.width,
                    Math.random() * canvas.height,
                    dpr
                ));
            }
        };

        const handleMouseMove = (e) => {
            mouse.current.x = e.clientX;
            mouse.current.y = e.clientY;
        };

        const handleMouseOut = () => {
            mouse.current.x = null;
            mouse.current.y = null;
        };

        setSize();
        window.addEventListener("resize", setSize);
        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseout", handleMouseOut);

        const animate = () => {
            if (!running.current) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.current.forEach(p => {
                p.update(canvas, dpr);
                p.draw(ctx);
            });
            connect(ctx, dpr);
            requestAnimationFrame(animate);
        };

        running.current = true;
        animate();

        return () => {
            running.current = false;
            window.removeEventListener("resize", setSize);
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseout", handleMouseOut);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: "fixed",
                inset: 0,
                width: "100vw",
                height: "100vh",
                pointerEvents: "none",
                zIndex: 0,
                background: "#0a0f18"
            }}
            aria-hidden="true"
            tabIndex={-1}
        />
    );
};

export default BioStructureBackground;
