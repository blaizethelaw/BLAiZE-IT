import React, { useState, useEffect, useRef } from 'react';

// NOTE: Make sure you have a 'tailwind.config.js' and your 'index.css' is set up
// to use Tailwind CSS. You will also need to add the custom fonts and animations
// to your main CSS file.

// You can add these styles to your index.css or equivalent global stylesheet:
/*
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&family=Orbitron:wght@400;700&display=swap');

body {
    font-family: 'Inter', sans-serif;
    background-color: #000000;
    color: #ffffff;
    overflow-x: hidden; // Prevents horizontal scroll
}

.font-orbitron {
    font-family: 'Orbitron', sans-serif;
}

::-webkit-scrollbar {
    width: 8px;
}
::-webkit-scrollbar-track {
    background: #0a0a0a;
}
::-webkit-scrollbar-thumb {
    background: linear-gradient(45deg, #8A2BE2, #4B0082);
    border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(45deg, #9932CC, #8A2BE2);
}

@keyframes glowing {
    0% { box-shadow: 0 0 5px #8A2BE2, 0 0 10px #8A2BE2, 0 0 15px #8A2BE2; }
    50% { box-shadow: 0 0 20px #4B0082, 0 0 30px #4B0082, 0 0 40px #4B0082; }
    100% { box-shadow: 0 0 5px #8A2BE2, 0 0 10px #8A2BE2, 0 0 15px #8A2BE2; }
}
.glowing-button {
    animation: glowing 3s infinite ease-in-out;
}
*/

// "We Are All One" Cosmic Web Background Component
const CosmicWebBackground = () => {
    const canvasRef = useRef(null);
    const particles = useRef([]);
    const mouse = useRef({ x: null, y: null, radius: 150 });
    const running = useRef(true);

    // --- CONFIG ---
    const PARTICLE_COUNT = 100;
    const CONNECT_DISTANCE = 120;
    const MOUSE_PULL_FACTOR = 0.5;
    const PALETTE = [
        [210, 100, 70],  // Blue
        [265, 100, 73],  // Purple
        [320, 97, 65],   // Pink
        [185, 100, 66],  // Aqua
    ];

    class Particle {
        constructor(x, y, dpr) {
            this.x = x;
            this.y = y;
            this.vx = Math.random() * 0.4 - 0.2;
            this.vy = Math.random() * 0.4 - 0.2;
            this.radius = (Math.random() * 1.5 + 0.5) * dpr;
            const [h, s, l] = PALETTE[Math.floor(Math.random() * PALETTE.length)];
            this.color = `hsl(${h}, ${s}%, ${l}%)`;
        }

        draw(ctx) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
            ctx.fillStyle = this.color;
            ctx.fill();
        }

        update(canvas, dpr) {
            // Move particle
            this.x += this.vx * dpr;
            this.y += this.vy * dpr;

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
                    ctx.strokeStyle = `rgba(200, 220, 255, ${opacityValue})`;
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
                zIndex: -1, // Place it behind all content
                background: "black"
            }}
            aria-hidden="true"
            tabIndex={-1}
        />
    );
};


// DarkModeToggle Component
const DarkModeToggle = () => {
    const [isDark, setIsDark] = useState(true);
    return (
        <button onClick={() => setIsDark(!isDark)} className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition">
            {isDark ? '☀️' : '🌙'}
        </button>
    );
};

// Navbar Component
const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const navLinks = ["Home", "About", "Services", "Contact"];

    return (
        <nav className="fixed top-0 left-0 right-0 bg-black bg-opacity-50 backdrop-blur-md p-4 z-50">
            <div className="container mx-auto flex justify-between items-center">
                <div className="flex items-center space-x-2">
                    <img src="https://placehold.co/40x40/8A2BE2/FFFFFF?text=B" alt="Blaize Logo" className="h-10 w-10 rounded-full" />
                    <span className="text-2xl font-orbitron font-bold text-white">BLAiZE IT</span>
                </div>
                <div className="hidden md:flex items-center space-x-6">
                    {navLinks.map(link => (
                        <a key={link} href={`#${link.toLowerCase()}`} className="text-lg text-gray-300 hover:text-white transition duration-300">{link}</a>
                    ))}
                    <DarkModeToggle />
                </div>
                <div className="md:hidden">
                    <button onClick={() => setIsOpen(!isOpen)} className="text-white text-3xl">
                        {isOpen ? '✕' : '☰'}
                    </button>
                </div>
            </div>
            {isOpen && (
                <div className="md:hidden mt-4 bg-gray-900 bg-opacity-80 rounded-lg p-4">
                    {navLinks.map(link => (
                        <a key={link} href={`#${link.toLowerCase()}`} className="block text-lg text-gray-300 hover:text-white py-2 transition duration-300" onClick={() => setIsOpen(false)}>{link}</a>
                    ))}
                    <div className="mt-4">
                        <DarkModeToggle />
                    </div>
                </div>
            )}
        </nav>
    );
};

// HeroSection Component
const HeroSection = () => (
    <section id="home" className="min-h-screen flex items-center justify-center text-center relative overflow-hidden pt-20">
        <div className="container mx-auto px-4 z-10">
            <h1 className="text-5xl md:text-7xl font-bold font-orbitron text-white mb-4">
                Your Vision, <span className="text-purple-400">Amplified</span>.
            </h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-8">
                We are a collective of digital artisans, tech wizards, and creative strategists dedicated to forging the future of web presence. We don't just build websites; we BLAiZE digital experiences.
            </p>
            <a href="#contact" className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-full text-lg transition duration-300 transform hover:scale-105 glowing-button">
                Start Your Project
            </a>
        </div>
    </section>
);

// SectionDivider Component
const SectionDivider = () => (
    <div className="w-full h-1 my-16 bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>
);

// AboutSection Component
const AboutSection = () => (
    <section id="about" className="py-20">
        <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold font-orbitron mb-8">About Us</h2>
            <p className="text-lg text-gray-400 max-w-4xl mx-auto">
               BLAiZE IT was forged in the crucible of digital innovation. We are a team of passionate developers, designers, and dreamers who believe in the power of technology to transform ideas into reality. Our mission is to push the boundaries of what's possible on the web, creating immersive and impactful digital solutions for our clients. We thrive on challenges and are committed to excellence in every line of code and every pixel we design.
            </p>
        </div>
    </section>
);

// ServicesCarousel Component
const ServicesCarousel = () => {
    const services = [
        { title: "Web Development", description: "Cutting-edge websites with the latest technologies.", icon: "💻" },
        { title: "UI/UX Design", description: "Intuitive and beautiful user interfaces.", icon: "🎨" },
        { title: "AI Integration", description: "Leverage the power of AI for your business.", icon: "🤖" },
        { title: "Branding", description: "Crafting unique brand identities that stand out.", icon: "💡" },
        { title: "Cloud Solutions", description: "Scalable and secure cloud infrastructure.", icon: "☁️" }
    ];

    const [currentIndex, setCurrentIndex] = useState(0);

    const nextService = () => setCurrentIndex((prevIndex) => (prevIndex + 1) % services.length);
    const prevService = () => setCurrentIndex((prevIndex) => (prevIndex - 1 + services.length) % services.length);

    return (
        <section id="services" className="py-20">
            <div className="container mx-auto px-4 text-center">
                <h2 className="text-4xl font-bold font-orbitron mb-12">Our Services</h2>
                <div className="relative max-w-2xl mx-auto">
                    <div className="overflow-hidden relative h-64">
                        {services.map((service, index) => (
                            <div
                                key={service.title}
                                className={`absolute w-full h-full transition-transform duration-500 ease-in-out ${index === currentIndex ? 'translate-x-0' : index < currentIndex ? '-translate-x-full' : 'translate-x-full'}`}
                            >
                                <div className="bg-gray-900 bg-opacity-50 p-8 rounded-2xl border border-purple-500/30 h-full flex flex-col justify-center items-center">
                                    <div className="text-5xl mb-4">{service.icon}</div>
                                    <h3 className="text-2xl font-bold font-orbitron mb-2">{service.title}</h3>
                                    <p className="text-gray-400">{service.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button onClick={prevService} className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-12 bg-gray-800 p-2 rounded-full text-2xl hover:bg-purple-700 transition">
                        &larr;
                    </button>
                    <button onClick={nextService} className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-12 bg-gray-800 p-2 rounded-full text-2xl hover:bg-purple-700 transition">
                        &rarr;
                    </button>
                </div>
            </div>
        </section>
    );
};

// ContactSection Component
const ContactSection = () => {
    const [status, setStatus] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        setStatus("Sending...");
        setTimeout(() => {
            setStatus("Message sent! We'll get back to you soon.");
            e.target.reset();
            setTimeout(() => setStatus(""), 3000);
        }, 2000);
    };

    return (
        <section id="contact" className="py-20">
            <div className="container mx-auto px-4">
                <h2 className="text-4xl font-bold font-orbitron text-center mb-12">Get in Touch</h2>
                <form onSubmit={handleSubmit} className="max-w-xl mx-auto bg-gray-900 bg-opacity-50 p-8 rounded-2xl border border-purple-500/30">
                    <div className="mb-4">
                        <label htmlFor="name" className="block text-gray-300 mb-2">Name</label>
                        <input type="text" id="name" name="name" required className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500"/>
                    </div>
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-gray-300 mb-2">Email</label>
                        <input type="email" id="email" name="email" required className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500"/>
                    </div>
                    <div className="mb-4">
                        <label htmlFor="message" className="block text-gray-300 mb-2">Message</label>
                        <textarea id="message" name="message" rows="5" required className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500"></textarea>
                    </div>
                    <div className="text-center">
                        <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-full text-lg transition duration-300 transform hover:scale-105 glowing-button">
                            Send Message
                        </button>
                    </div>
                    {status && <p className="text-center mt-4 text-green-400">{status}</p>}
                </form>
            </div>
        </section>
    );
};

// Footer Component
const Footer = () => (
    <footer className="py-8 bg-black bg-opacity-70">
        <div className="container mx-auto px-4 text-center text-gray-500">
            <p>&copy; {new Date().getFullYear()} BLAiZE IT. All Rights Reserved.</p>
            <p className="mt-2">Forging the Future of Digital Experiences.</p>
        </div>
    </footer>
);

// ScrollToTopButton Component
const ScrollToTopButton = () => {
    const [isVisible, setIsVisible] = useState(false);

    const toggleVisibility = () => {
        if (window.pageYOffset > 300) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    };

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    useEffect(() => {
        window.addEventListener('scroll', toggleVisibility);
        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    return (
        <button
            onClick={scrollToTop}
            className={`fixed bottom-5 right-5 bg-purple-600 text-white p-3 rounded-full shadow-lg hover:bg-purple-700 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
        >
            &uarr;
        </button>
    );
};


// Main App Component
export default function App() {
    return (
        // The `bg-black` class has been removed from this div to prevent it from
        // covering the canvas background.
        <div>
            <CosmicWebBackground />
            <Navbar />
            <main className="relative z-10">
                <HeroSection />
                <SectionDivider />
                <AboutSection />
                <SectionDivider />
                <ServicesCarousel />
                <SectionDivider />
                <ContactSection />
            </main>
            <Footer />
            <ScrollToTopButton />
        </div>
    );
}
