import React, { useState, useEffect, useRef, Suspense } from "react";
import { Menu, X, CheckCircle, XCircle, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import InteractiveNebula from './components/InteractiveNebula';

// Utility Components
function FadeInWhenVisible({ children, className = '', delay = 0, duration = 700 }) {
  const domRef = useRef();
  const [isVisible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !isVisible) {
        setVisible(true);
        observer.unobserve(domRef.current);
      }
    }, {
      rootMargin: '0px 0px -10% 0px',
      threshold: 0.1
    });

    if (domRef.current) {
      observer.observe(domRef.current);
    }

    return () => {
      if (domRef.current) {
        observer.unobserve(domRef.current);
      }
      observer.disconnect();
    };
  }, [isVisible]);

  return (
    <div
      ref={domRef}
      className={`
        transition-all ease-out duration-${duration}
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
        ${className}
      `}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

function SectionDivider({ flip = false }) {
  return (
    <div className={`relative w-full overflow-hidden ${flip ? 'transform rotate-180' : ''}`}>
      <svg
        className="block w-full h-24 text-blaize-dark"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 100 100"
      >
        <path
          d="M0,0 L0,100 L100,100 L100,0 C70,50 30,50 0,0 Z"
          fill="currentColor"
        ></path>
      </svg>
    </div>
  );
}

function BookingButton() {
  const handleBookingClick = () => {
    // Scroll to contact section
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="flex justify-center py-12">
      <button
        onClick={handleBookingClick}
        className="relative px-8 py-4 rounded-full font-bold text-black text-xl
                   bg-gradient-to-r from-blaize-green via-blaize-yellow to-blaize-orange
                   shadow-lg shadow-blaize-green/40 transition-all duration-500
                   transform hover:scale-105 focus:outline-none overflow-hidden group
                   before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent
                   before:translate-x-[-200%] hover:before:translate-x-[200%] before:transition-transform before:duration-700
                   after:absolute after:inset-0 after:bg-gradient-to-r after:from-cyan-400/0 after:via-cyan-400/30 after:to-cyan-400/0
                   after:blur-xl after:scale-y-0 hover:after:scale-y-100 after:transition-transform after:duration-500"
      >
        <span className="relative z-10">Book a Consultation Now!</span>
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-purple-400/20 blur-2xl group-hover:blur-3xl transition-all duration-500 animate-pulse"></div>
      </button>
    </div>
  );
}

// Navbar Component
function Navbar({ currentPage, setCurrentPage }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { name: "Home", path: "home" },
    { name: "Services", path: "services" },
    { name: "About", path: "about" },
    { name: "Testimonials", path: "testimonials" },
    { name: "Contact", path: "contact" },
  ];

  const handleNavLinkClick = (path) => {
    setCurrentPage(path);
    setIsMenuOpen(false);
    const section = document.getElementById(path);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-black/30 backdrop-blur-md transition-all duration-300">
      <div className="flex items-center justify-between max-w-7xl mx-auto px-4 py-2">
        <button onClick={() => handleNavLinkClick("home")}>
          <div className="h-9 w-24 bg-gradient-to-r from-blaize-green via-blaize-yellow to-blaize-orange rounded-md flex items-center justify-center">
            <span className="text-black font-bold text-sm">BLAiZE IT</span>
          </div>
        </button>

        <nav className="hidden md:flex flex-1 justify-end">
          <ul className="flex gap-6 text-lg font-semibold">
            {navItems.map((item) => (
              <li key={item.name}>
                <button
                  onClick={() => handleNavLinkClick(item.path)}
                  className={`
                    relative group
                    ${
                      currentPage === item.path
                        ? "text-blaize-green"
                        : "text-white/90 hover:text-blaize-green transition-colors duration-300"
                    }
                    after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-gradient-to-r after:from-cyan-400 after:to-blaize-green after:scale-x-0 after:transition-transform after:duration-300 after:ease-out
                    ${currentPage === item.path ? "after:scale-x-100" : "group-hover:after:scale-x-100"}
                  `}
                >
                  {item.name}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="md:hidden flex items-center">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-white focus:outline-none">
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      <div
        className={`
          md:hidden fixed inset-0 bg-blaize-slate/95 backdrop-blur-md z-40
          transform transition-transform duration-300 ease-in-out
          ${isMenuOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex flex-col items-center justify-center h-full pt-16">
          <ul className="flex flex-col gap-8 text-2xl font-semibold">
            {navItems.map((item) => (
              <li key={item.name}>
                <button
                  onClick={() => handleNavLinkClick(item.path)}
                  className={`
                    ${
                      currentPage === item.path
                        ? "text-blaize-green"
                        : "text-white/90 hover:text-blaize-green transition-colors duration-300"
                    }
                    block py-2 text-center
                  `}
                >
                  {item.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </header>
  );
}

// Page Sections
function HeroSection() {
  return (
    <section id="home" className="relative h-screen flex items-center justify-center">
      <div className="relative z-10 text-center text-white p-4 max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-extrabold mb-4 leading-tight drop-shadow-lg">
          <span className="bg-gradient-to-r from-blaize-green via-blaize-yellow to-blaize-orange text-transparent bg-clip-text">
            BLAiZE IT
          </span>
          <br />
          Advanced WebGL Solutions
        </h1>
        <p className="text-lg md:text-xl mb-8 opacity-90">
          Cutting-edge GPU-accelerated nebula rendering with mobile-optimized performance and realistic space effects.
        </p>
        <button
          onClick={() => document.getElementById('services').scrollIntoView({ behavior: 'smooth' })}
          className="px-8 py-3 rounded-full font-bold text-black text-lg
                     bg-gradient-to-r from-blaize-yellow to-blaize-orange
                     shadow-lg shadow-blaize-yellow/40 hover:brightness-110 transition-all duration-300
                     transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blaize-yellow/50"
        >
          Explore Our Tech
        </button>
      </div>
    </section>
  );
}

// Services Data with WebGL focus
const servicesData = [
  {
    title: "GPU-Accelerated Rendering",
    description: "Transform feedback and Three.js GPUComputationRenderer for 100K-1M particles at 60fps.",
    icon: "🚀",
    tech: "WebGL 2.0, GLSL"
  },
  {
    title: "Mobile Optimization",
    description: "Adaptive quality scaling with automatic performance monitoring and resource management.",
    icon: "📱",
    tech: "Progressive Enhancement"
  },
  {
    title: "Volumetric Rendering",
    description: "Realistic raymarching with Beer's Law light scattering and Henyey-Greenstein phase functions.",
    icon: "🌌",
    tech: "Advanced Shaders"
  },
  {
    title: "Real-time Physics",
    description: "GPU-based particle simulation with fractal Brownian motion and curl noise dynamics.",
    icon: "⚡",
    tech: "Compute Shaders"
  },
  {
    title: "Cross-Platform Performance",
    description: "Optimized for iOS Safari, Android Chrome, and desktop with VRAM budgeting systems.",
    icon: "🎯",
    tech: "Universal Compatibility"
  },
];

function ServicesCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextService = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % servicesData.length);
  };

  const prevService = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? servicesData.length - 1 : prevIndex - 1
    );
  };

  return (
    <section id="services" className="py-20 px-4 bg-blaize-dark text-white">
      <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center bg-gradient-to-r from-blaize-green via-blaize-yellow to-blaize-orange text-transparent bg-clip-text">
        Advanced WebGL Technologies
      </h2>
      <div className="relative max-w-5xl mx-auto">
        <div className="flex items-center justify-center">
          <div className="relative bg-zinc-900 border border-blaize-green/30 rounded-xl p-8 shadow-glow w-full md:w-3/4 lg:w-2/3 text-center
                          transition-all duration-500 hover:border-blaize-green/60 hover:shadow-2xl hover:shadow-green-400/20 group">
            <div className="absolute -inset-px bg-gradient-to-r from-cyan-400/30 to-blaize-green/30 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="text-6xl mb-4">{servicesData[currentIndex].icon}</div>
            <h3 className="text-2xl font-semibold mb-3 text-blaize-green">
              {servicesData[currentIndex].title}
            </h3>
            <p className="text-white/80 leading-relaxed mb-4">
              {servicesData[currentIndex].description}
            </p>
            <div className="inline-block px-3 py-1 bg-blaize-yellow/20 rounded-full text-blaize-yellow text-sm font-medium">
              {servicesData[currentIndex].tech}
            </div>
          </div>
        </div>

        <button
          onClick={prevService}
          className="absolute left-0 top-1/2 -translate-y-1/2 p-3 bg-blaize-green/70 rounded-full text-white transition-all duration-300 z-10 ml-2
                    hover:bg-blaize-green hover:shadow-glow hover:scale-110"
          aria-label="Previous service"
        >
          <ChevronLeft size={24} />
        </button>
        <button
          onClick={nextService}
          className="absolute right-0 top-1/2 -translate-y-1/2 p-3 bg-blaize-green/70 rounded-full text-white transition-all duration-300 z-10 mr-2
                    hover:bg-blaize-green hover:shadow-glow hover:scale-110"
          aria-label="Next service"
        >
          <ChevronRight size={24} />
        </button>
      </div>
    </section>
  );
}

function AboutSection() {
  return (
    <section id="about" className="py-20 px-4 text-white bg-blaize-slate">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-8 bg-gradient-to-r from-blaize-orange via-blaize-yellow to-blaize-green text-transparent bg-clip-text">
          High-Performance WebGL Research
        </h2>
        <p className="text-lg leading-relaxed mb-6">
          Our advanced mobile WebGL nebula rendering system achieves desktop-quality visuals while maintaining 60fps on mobile devices. Through GPU-accelerated particle systems, optimized volumetric shaders, and intelligent quality scaling, we create photorealistic space environments that work across all platforms.
        </p>
        <p className="text-lg leading-relaxed mb-10">
          Using cutting-edge techniques like transform feedback, blue noise dithering, and adaptive LOD systems, our solutions push the boundaries of what's possible with real-time graphics in the browser.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="relative bg-zinc-900 p-6 rounded-lg shadow-md border border-blaize-yellow/30 overflow-hidden group
                          transition-all duration-500 hover:border-blaize-yellow/60 hover:shadow-xl hover:shadow-yellow-400/20">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <h3 className="text-xl font-semibold text-blaize-yellow mb-2">GPU Acceleration</h3>
            <p className="text-white/80">Transform feedback and compute shaders for massive particle systems</p>
          </div>
          <div className="relative bg-zinc-900 p-6 rounded-lg shadow-md border border-blaize-green/30 overflow-hidden group
                          transition-all duration-500 hover:border-blaize-green/60 hover:shadow-xl hover:shadow-green-400/20">
            <div className="absolute inset-0 bg-gradient-to-br from-green-400/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <h3 className="text-xl font-semibold text-blaize-green mb-2">Mobile First</h3>
            <p className="text-white/80">Adaptive quality scaling and VRAM budgeting for all devices</p>
          </div>
          <div className="relative bg-zinc-900 p-6 rounded-lg shadow-md border border-blaize-orange/30 overflow-hidden group
                          transition-all duration-500 hover:border-blaize-orange/60 hover:shadow-xl hover:shadow-orange-400/20">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-400/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <h3 className="text-xl font-semibold text-blaize-orange mb-2">Realistic Physics</h3>
            <p className="text-white/80">Physically-based rendering with advanced noise functions</p>
          </div>
        </div>
      </div>
    </section>
  );
}

// Performance Metrics Display
function PerformanceMetrics({ adaptiveQualityManager }) {
  const [metrics, setMetrics] = useState({
    fps: 60,
    particleCount: 100000,
    pixelRatio: 1.0,
    quality: 'High'
  });

  useEffect(() => {
    const interval = setInterval(() => {
      if (adaptiveQualityManager.current) {
        const manager = adaptiveQualityManager.current;
        const avgFrameTime = manager.performanceMonitor.frameTimes.length > 0 ?
          manager.performanceMonitor.frameTimes.reduce((a, b) => a + b, 0) / manager.performanceMonitor.frameTimes.length : 16;

        setMetrics({
          fps: Math.round(1000 / avgFrameTime),
          particleCount: Math.round(manager.qualitySettings.particleCount),
          pixelRatio: manager.qualitySettings.pixelRatio.toFixed(2),
          quality: manager.performanceMonitor.stable ? 'Optimal' : 'Adapting'
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [adaptiveQualityManager]);

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 backdrop-blur-md text-white p-4 rounded-lg border border-blaize-green/30 z-40 text-sm">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="text-blaize-green font-semibold">FPS</div>
          <div>{metrics.fps}</div>
        </div>
        <div>
          <div className="text-blaize-yellow font-semibold">Particles</div>
          <div>{metrics.particleCount.toLocaleString()}</div>
        </div>
        <div>
          <div className="text-blaize-orange font-semibold">Pixel Ratio</div>
          <div>{metrics.pixelRatio}</div>
        </div>
        <div>
          <div className="text-cyan-400 font-semibold">Quality</div>
          <div>{metrics.quality}</div>
        </div>
      </div>
    </div>
  );
}

// Testimonials Data
const testimonialsData = [
  {
    quote: "Incredible GPU performance! The nebula effects run smoothly even on older mobile devices.",
    author: "Dr. Sarah Chen",
    title: "Graphics Researcher, MIT",
    avatar: "👩‍🔬",
  },
  {
    quote: "The adaptive quality system is brilliant - maintains 60fps across all our target devices.",
    author: "Marcus Rodriguez",
    title: "Senior Developer, Pixar",
    avatar: "👨‍💻",
  },
  {
    quote: "Best WebGL optimization I've seen. The particle systems scale beautifully to millions of points.",
    author: "Elena Vasquez",
    title: "Lead Engineer, Epic Games",
    avatar: "👩‍🚀",
  },
];

function TestimonialsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextTestimonial = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonialsData.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? testimonialsData.length - 1 : prevIndex - 1
    );
  };

  return (
    <section id="testimonials" className="py-20 px-4 bg-blaize-dark text-white">
      <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center bg-gradient-to-r from-blaize-green via-blaize-yellow to-blaize-orange text-transparent bg-clip-text">
        Industry Recognition
      </h2>
      <div className="relative max-w-4xl mx-auto">
        <div className="flex items-center justify-center">
          <div className="relative bg-zinc-900 border border-blaize-yellow/30 rounded-xl p-8 shadow-glow w-full text-center
                          transition-all duration-500 hover:border-blaize-yellow/60 hover:shadow-2xl hover:shadow-yellow-400/20 group">
            <div className="absolute -inset-px bg-gradient-to-r from-blaize-yellow/30 to-transparent rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="text-6xl mb-6">{testimonialsData[currentIndex].avatar}</div>
            <p className="text-xl italic text-white/90 mb-6 leading-relaxed">
              "{testimonialsData[currentIndex].quote}"
            </p>
            <p className="font-semibold text-blaize-yellow">
              {testimonialsData[currentIndex].author}
            </p>
            <p className="text-sm text-white/70">
              {testimonialsData[currentIndex].title}
            </p>
          </div>
        </div>

        <button
          onClick={prevTestimonial}
          className="absolute left-0 top-1/2 -translate-y-1/2 p-3 bg-blaize-green/70 rounded-full text-white hover:bg-blaize-green transition-colors duration-300 z-10 ml-2"
          aria-label="Previous testimonial"
        >
          <ChevronLeft size={24} />
        </button>
        <button
          onClick={nextTestimonial}
          className="absolute right-0 top-1/2 -translate-y-1/2 p-3 bg-blaize-green/70 rounded-full text-white hover:bg-blaize-green transition-colors duration-300 z-10 mr-2"
          aria-label="Next testimonial"
        >
          <ChevronRight size={24} />
        </button>
      </div>
    </section>
  );
}

function ContactSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [submissionStatus, setSubmissionStatus] = useState("idle");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
    }
  };

  const validateForm = () => {
    let newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = "Name is required.";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email address is invalid.";
    }
    if (!formData.message.trim()) {
      newErrors.message = "Message is required.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmissionStatus("loading");

    if (validateForm()) {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
        setSubmissionStatus("success");
        setFormData({ name: "", email: "", message: "" });
      } catch (error) {
        setSubmissionStatus("error");
      }
    } else {
      setSubmissionStatus("idle");
    }
  };

  return (
    <section id="contact" className="flex flex-col items-center py-20 px-4 min-h-screen justify-center bg-blaize-slate">
      <h2 className="text-3xl md:text-4xl font-bold mb-8 bg-gradient-to-r from-blaize-green via-blaize-yellow to-blaize-orange text-transparent bg-clip-text text-center">
        Get in Touch
      </h2>
      <div className="bg-zinc-900 border border-blaize-yellow/30 rounded-xl p-8 shadow-glow w-full max-w-xl
                      transition-all duration-500 hover:border-blaize-yellow/60 hover:shadow-2xl hover:shadow-yellow-400/20">
        <div className="mb-6 text-white/80 text-center">
          <div className="mb-2">
            <b>Email:</b>{" "}
            <a className="text-blaize-green hover:underline" href="mailto:research@blaizeit.com">
              research@blaizeit.com
            </a>
          </div>
          <div>
            <b>GitHub:</b>{" "}
            <a className="text-blaize-yellow hover:underline" href="#" target="_blank" rel="noopener noreferrer">
              github.com/blaizeit-webgl
            </a>
          </div>
        </div>
        <div onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <input
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your Name"
              className={`bg-black/80 border ${
                errors.name ? "border-red-500" : "border-blaize-green/50"
              } rounded px-4 py-3 text-white w-full focus:outline-none focus:ring-2 focus:ring-blaize-green transition-all duration-300
                 hover:border-blaize-green/80`}
            />
            {errors.name && (
              <p className="text-red-400 text-sm mt-1">{errors.name}</p>
            )}
          </div>
          <div>
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Your Email"
              className={`bg-black/80 border ${
                errors.email ? "border-red-500" : "border-blaize-yellow/50"
              } rounded px-4 py-3 text-white w-full focus:outline-none focus:ring-2 focus:ring-blaize-yellow transition-all duration-300
                 hover:border-blaize-yellow/80`}
            />
            {errors.email && (
              <p className="text-red-400 text-sm mt-1">{errors.email}</p>
            )}
          </div>
          <div>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Tell us about your WebGL project or performance requirements"
              rows={4}
              className={`bg-black/80 border ${
                errors.message ? "border-red-500" : "border-blaize-orange/50"
              } rounded px-4 py-3 text-white w-full focus:outline-none focus:ring-2 focus:ring-blaize-orange transition-all duration-300
                 hover:border-blaize-orange/80`}
            />
            {errors.message && (
              <p className="text-red-400 text-sm mt-1">{errors.message}</p>
            )}
          </div>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submissionStatus === "loading"}
            className={`
              relative py-3 rounded font-bold text-black shadow-glow transition-all duration-500
              flex items-center justify-center gap-2 overflow-hidden group
              ${
                submissionStatus === "loading"
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-gradient-to-r from-blaize-green via-blaize-yellow to-blaize-orange hover:brightness-110"
              }
            `}
          >
            <span className="absolute inset-0 bg-gradient-to-r from-white/30 to-transparent -translate-x-full group-hover:translate-x-0 transition-transform duration-500"></span>
            {submissionStatus === "loading" && (
              <Loader2 className="animate-spin relative z-10" size={20} />
            )}
            <span className="relative z-10">{submissionStatus === "loading" ? "Sending..." : "Send Message"}</span>
          </button>
        </div>

        {submissionStatus === "success" && (
          <div className="mt-6 p-4 bg-green-800/60 text-white rounded-md flex items-center gap-2">
            <CheckCircle size={24} className="text-green-400" />
            <span>Thank you! We'll get back to you about your WebGL project soon.</span>
          </div>
        )}
        {submissionStatus === "error" && (
          <div className="mt-6 p-4 bg-red-800/60 text-white rounded-md flex items-center gap-2">
            <XCircle size={24} className="text-red-400" />
            <span>Failed to send message. Please try again later.</span>
          </div>
        )}
      </div>
    </section>
  );
}

// Main App Component
export default function App() {
  const [currentPage, setCurrentPage] = useState("home");

  useEffect(() => {
    const section = document.getElementById("home");
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  return (
    <div className="font-sans antialiased bg-blaize-slate text-white">
      <style jsx>{`
        :root {
          --blaize-green: #4D9900;
          --blaize-orange: #FF8400;
          --blaize-slate: #181c20;
          --blaize-dark: #0a0a0a;
          --blaize-yellow: #ffd400;
        }
        .shadow-glow {
          box-shadow: 0 0 20px rgba(77, 153, 0, 0.3);
        }
        .text-blaize-green { color: var(--blaize-green); }
        .text-blaize-orange { color: var(--blaize-orange); }
        .text-blaize-yellow { color: var(--blaize-yellow); }
        .bg-blaize-slate { background-color: var(--blaize-slate); }
        .bg-blaize-dark { background-color: var(--blaize-dark); }
        .border-blaize-green\/30 { border-color: rgba(77, 153, 0, 0.3); }
        .border-blaize-green\/50 { border-color: rgba(77, 153, 0, 0.5); }
        .border-blaize-green\/60 { border-color: rgba(77, 153, 0, 0.6); }
        .border-blaize-green\/80 { border-color: rgba(77, 153, 0, 0.8); }
        .border-blaize-yellow\/30 { border-color: rgba(255, 212, 0, 0.3); }
        .border-blaize-yellow\/50 { border-color: rgba(255, 212, 0, 0.5); }
        .border-blaize-yellow\/60 { border-color: rgba(255, 212, 0, 0.6); }
        .border-blaize-yellow\/80 { border-color: rgba(255, 212, 0, 0.8); }
        .border-blaize-orange\/30 { border-color: rgba(255, 132, 0, 0.3); }
        .border-blaize-orange\/50 { border-color: rgba(255, 132, 0, 0.5); }
        .border-blaize-orange\/60 { border-color: rgba(255, 132, 0, 0.6); }
        .border-blaize-orange\/80 { border-color: rgba(255, 132, 0, 0.8); }
        .bg-gradient-to-r {
          background: linear-gradient(to right, var(--tw-gradient-stops));
        }
        .from-blaize-green { --tw-gradient-from: var(--blaize-green); }
        .via-blaize-yellow { --tw-gradient-via: var(--blaize-yellow); }
        .to-blaize-orange { --tw-gradient-to: var(--blaize-orange); }
        .bg-clip-text {
          -webkit-background-clip: text;
          background-clip: text;
        }
        .text-transparent { color: transparent; }
      `}</style>

      <Suspense fallback={<div className="fixed inset-0 bg-black flex items-center justify-center text-white">Loading WebGL...</div>}>
        <InteractiveNebula />
      </Suspense>

      <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} />

      <main className="pt-16">
        <HeroSection />
        <FadeInWhenVisible delay={100}>
          <SectionDivider />
        </FadeInWhenVisible>
        <FadeInWhenVisible delay={200}>
          <ServicesCarousel />
        </FadeInWhenVisible>
        <FadeInWhenVisible delay={100}>
          <SectionDivider flip />
        </FadeInWhenVisible>
        <FadeInWhenVisible delay={200}>
          <AboutSection />
        </FadeInWhenVisible>
        <FadeInWhenVisible delay={300}>
          <BookingButton />
        </FadeInWhenVisible>
        <FadeInWhenVisible delay={100}>
          <SectionDivider />
        </FadeInWhenVisible>
        <FadeInWhenVisible delay={200}>
          <TestimonialsCarousel />
        </FadeInWhenVisible>
        <FadeInWhenVisible delay={100}>
          <SectionDivider flip />
        </FadeInWhenVisible>
        <FadeInWhenVisible delay={200}>
          <ContactSection />
        </FadeInWhenVisible>
      </main>
    </div>
  );
}
