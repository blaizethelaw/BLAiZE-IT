import React, { useState, useEffect, useRef, Suspense, lazy } from "react";
// No need for react-router-dom as we'll simulate routing internally for a single file app
// import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { Menu, X, CheckCircle, XCircle, Loader2, ChevronLeft, ChevronRight } from 'lucide-react'; // Icons
import Starfield from './components/Starfield';
import HolographicGrid from './components/HolographicGrid';
import ThreeScene from './components/ThreeScene';

// --- Utility Components ---

/**
 * A component that animates its children to fade in and slide up
 * when they become visible in the viewport.
 *
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - The content to be animated.
 * @param {string} [props.className] - Optional additional CSS classes for the wrapper div.
 * @param {number} [props.delay=0] - Optional delay in milliseconds before the animation starts.
 * @param {number} [props.duration=700] - Optional duration in milliseconds for the animation.
 */
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

// --- Shared Components ---

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
  // In a real app, this would link to a booking page or open a modal
  const handleBookingClick = () => {
    // For this single-file demo, we'll just log or show a simple message
    alert("Booking functionality would be implemented here!");
  };

  return (
    <div className="flex justify-center py-12">
      <button
        onClick={handleBookingClick}
        className="px-8 py-4 rounded-full font-bold text-black text-xl
                   bg-gradient-to-r from-blaize-green via-blaize-yellow to-blaize-orange
                   shadow-lg shadow-blaize-green/40 hover:brightness-110 transition-all duration-300
                   transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blaize-green/50"
      >
        Book a Consultation Now!
      </button>
    </div>
  );
}

// --- Navbar Component ---
function Navbar({ currentPage, setCurrentPage }) {
  // const location = useLocation(); // Not used in single-file app
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { name: "Home", path: "home" },
    { name: "Services", path: "services" },
    { name: "About", path: "about" },
    { name: "Booking", path: "booking" },
    { name: "Testimonials", path: "testimonials" },
    { name: "Contact", path: "contact" },
  ];

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleNavLinkClick = (path) => {
    setCurrentPage(path);
    closeMenu();
    // Smooth scroll to the section
    const section = document.getElementById(path);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      className="fixed top-0 left-0 w-full z-50 bg-black/30 backdrop-blur-md transition-all duration-300"
      style={{ boxShadow: "0 2px 12px 0 rgba(0,0,0,0.12)" }}
    >
      <div className="flex items-center justify-between max-w-7xl mx-auto px-4 py-2">
        <button onClick={() => handleNavLinkClick("home")}> {/* Use button for logo click */}
          <img
            src="https://placehold.co/100x36/0a0a0a/ffffff?text=BLAiZE+IT"
            alt="BLAiZE IT Logo"
            className="h-9 mr-3 rounded-md"
            draggable={false}
          />
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
                    after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-blaize-green after:scale-x-0 after:transition-transform after:duration-300 after:ease-out
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
          <button onClick={toggleMenu} className="text-white focus:outline-none">
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

// --- Page Sections (with placeholder content) ---

function HeroSection() {
  return (
    <section id="home" className="relative h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: "url('https://placehold.co/1920x1080/1a1a1a/ffffff?text=Your+Hero+Image')" }}>
      <div className="absolute inset-0 bg-black/60"></div> {/* Overlay */}
      <div className="relative z-10 text-center text-white p-4 max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-extrabold mb-4 leading-tight drop-shadow-lg">
          <span className="bg-gradient-to-r from-blaize-green via-blaize-yellow to-blaize-orange text-transparent bg-clip-text">
            BLAiZE IT
          </span>
          <br />
          Your Partner in Digital Excellence
        </h1>
        <p className="text-lg md:text-xl mb-8 opacity-90">
          Transforming ideas into impactful digital solutions with cutting-edge technology and creative design.
        </p>
        <button className="px-8 py-3 rounded-full font-bold text-black text-lg
                           bg-gradient-to-r from-blaize-yellow to-blaize-orange
                           shadow-lg shadow-blaize-yellow/40 hover:brightness-110 transition-all duration-300
                           transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blaize-yellow/50">
          Learn More
        </button>
      </div>
    </section>
  );
}

// Mock Data for Services
const servicesData = [
  {
    title: "Web Development",
    description: "Building responsive, high-performance websites tailored to your needs.",
    icon: "https://placehold.co/64x64/blaize-green/ffffff?text=WEB",
  },
  {
    title: "Mobile App Development",
    description: "Creating intuitive and powerful mobile applications for iOS and Android.",
    icon: "https://placehold.co/64x64/blaize-yellow/000000?text=APP",
  },
  {
    title: "Cloud Solutions",
    description: "Leveraging cloud technologies for scalable, secure, and efficient infrastructure.",
    icon: "https://placehold.co/64x64/blaize-orange/ffffff?text=CLOUD",
  },
  {
    title: "UI/UX Design",
    description: "Crafting engaging user interfaces and seamless user experiences.",
    icon: "https://placehold.co/64x64/blaize-green/ffffff?text=UI/UX",
  },
  {
    title: "Digital Marketing",
    description: "Boosting your online presence with effective SEO, social media, and content strategies.",
    icon: "https://placehold.co/64x64/blaize-yellow/000000?text=MARKETING",
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
        Our Services
      </h2>
      <div className="relative max-w-5xl mx-auto">
        <div className="flex items-center justify-center">
          {/* Carousel Card */}
          <div className="bg-zinc-900 border border-blaize-green/30 rounded-xl p-8 shadow-glow w-full md:w-3/4 lg:w-2/3 text-center">
            <img
              src={servicesData[currentIndex].icon}
              alt={servicesData[currentIndex].title}
              className="h-16 w-16 mx-auto mb-4 rounded-full"
            />
            <h3 className="text-2xl font-semibold mb-3 text-blaize-green">
              {servicesData[currentIndex].title}
            </h3>
            <p className="text-white/80 leading-relaxed">
              {servicesData[currentIndex].description}
            </p>
          </div>
        </div>

        {/* Navigation Buttons */}
        <button
          onClick={prevService}
          className="absolute left-0 top-1/2 -translate-y-1/2 p-3 bg-blaize-green/70 rounded-full text-white hover:bg-blaize-green transition-colors duration-300 z-10 ml-2"
          aria-label="Previous service"
        >
          <ChevronLeft size={24} />
        </button>
        <button
          onClick={nextService}
          className="absolute right-0 top-1/2 -translate-y-1/2 p-3 bg-blaize-green/70 rounded-full text-white hover:bg-blaize-green transition-colors duration-300 z-10 mr-2"
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
          About BLAiZE IT
        </h2>
        <p className="text-lg leading-relaxed mb-6">
          At BLAiZE IT, we are passionate about crafting innovative digital experiences that drive growth and connect businesses with their audience. Our team of dedicated experts combines technical prowess with creative vision to deliver solutions that are not just functional, but truly exceptional.
        </p>
        <p className="text-lg leading-relaxed">
          We believe in a collaborative approach, working closely with our clients to understand their unique challenges and goals. From concept to deployment, we are committed to transparency, quality, and delivering results that exceed expectations.
        </p>
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-zinc-900 p-6 rounded-lg shadow-md border border-blaize-yellow/30">
            <h3 className="text-xl font-semibold text-blaize-yellow mb-2">Innovation</h3>
            <p className="text-white/80">Constantly exploring new technologies to keep you ahead.</p>
          </div>
          <div className="bg-zinc-900 p-6 rounded-lg shadow-md border border-blaize-green/30">
            <h3 className="text-xl font-semibold text-blaize-green mb-2">Quality</h3>
            <p className="text-white/80">Delivering robust and reliable solutions every time.</p>
          </div>
          <div className="bg-zinc-900 p-6 rounded-lg shadow-md border border-blaize-orange/30">
            <h3 className="text-xl font-semibold text-blaize-orange mb-2">Client Focus</h3>
            <p className="text-white/80">Your success is our top priority, built on strong partnerships.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

// Mock Data for Testimonials
const testimonialsData = [
  {
    quote: "BLAiZE IT transformed our online presence. Their web development skills are truly top-notch!",
    author: "Jane Doe",
    title: "CEO, Tech Solutions",
    avatar: "https://placehold.co/80x80/blaize-green/ffffff?text=JD",
  },
  {
    quote: "The mobile app they built for us is incredibly intuitive and has significantly boosted our customer engagement.",
    author: "John Smith",
    title: "Founder, Innovate Corp",
    avatar: "https://placehold.co/80x80/blaize-yellow/000000?text=JS",
  },
  {
    quote: "Exceptional design and seamless user experience. BLAiZE IT truly understands modern digital needs.",
    author: "Alice Johnson",
    title: "Marketing Director, Global Brands",
    avatar: "https://placehold.co/80x80/blaize-orange/ffffff?text=AJ",
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
        What Our Clients Say
      </h2>
      <div className="relative max-w-4xl mx-auto">
        <div className="flex items-center justify-center">
          {/* Testimonial Card */}
          <div className="bg-zinc-900 border border-blaize-yellow/30 rounded-xl p-8 shadow-glow w-full text-center">
            <img
              src={testimonialsData[currentIndex].avatar}
              alt={testimonialsData[currentIndex].author}
              className="h-20 w-20 rounded-full mx-auto mb-6 border-2 border-blaize-green"
            />
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

        {/* Navigation Buttons */}
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
  const [submissionStatus, setSubmissionStatus] = useState("idle"); // 'idle', 'loading', 'success', 'error'

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
        // Using a generic Formspree endpoint for demonstration.
        // In a real application, you'd use your specific Formspree endpoint or a backend API.
        const response = await fetch("https://formspree.io/f/mzbllgza", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          setSubmissionStatus("success");
          setFormData({ name: "", email: "", message: "" });
        } else {
          setSubmissionStatus("error");
          console.error("Formspree submission error:", await response.json());
        }
      } catch (error) {
        setSubmissionStatus("error");
        console.error("Network or submission error:", error);
      }
    } else {
      setSubmissionStatus("idle");
    }
  };

  return (
    <section id="contact" className="flex flex-col items-center py-20 px-4 min-h-screen justify-center bg-blaize-slate">
      <h2 className="text-3xl md:text-4xl font-bold mb-8 bg-gradient-to-r from-blaize-green via-blaize-yellow to-blaize-orange text-transparent bg-clip-text text-center">
        Contact Us
      </h2>
      <div className="bg-zinc-900 border border-blaize-yellow/30 rounded-xl p-8 shadow-glow w-full max-w-xl">
        <div className="mb-6 text-white/80 text-center">
          <div className="mb-2">
            <b>Email:</b>{" "}
            <a className="text-blaize-green hover:underline" href="mailto:info@blaizeit.com">
              info@blaizeit.com
            </a>
          </div>
          <div>
            <b>Phone:</b>{" "}
            <a className="text-blaize-yellow hover:underline" href="tel:+1610-329-4445">
              (610) 329-4445
            </a>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <input
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your Name"
              className={`bg-black/80 border ${
                errors.name ? "border-red-500" : "border-blaize-green/50"
              } rounded px-4 py-3 text-white w-full focus:outline-none focus:ring-2 focus:ring-blaize-green`}
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
              } rounded px-4 py-3 text-white w-full focus:outline-none focus:ring-2 focus:ring-blaize-yellow`}
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
              placeholder="How can we help?"
              rows={4}
              className={`bg-black/80 border ${
                errors.message ? "border-red-500" : "border-blaize-orange/50"
              } rounded px-4 py-3 text-white w-full focus:outline-none focus:ring-2 focus:ring-blaize-orange`}
            />
            {errors.message && (
              <p className="text-red-400 text-sm mt-1">{errors.message}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={submissionStatus === "loading"}
            className={`
              py-3 rounded font-bold text-black shadow-glow transition
              flex items-center justify-center gap-2
              ${
                submissionStatus === "loading"
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-gradient-to-r from-blaize-green via-blaize-yellow to-blaize-orange hover:brightness-110"
              }
            `}
          >
            {submissionStatus === "loading" && (
              <Loader2 className="animate-spin" size={20} />
            )}
            {submissionStatus === "loading" ? "Sending..." : "Send Message"}
          </button>
        </form>

        {submissionStatus === "success" && (
          <div className="mt-6 p-4 bg-green-800/60 text-white rounded-md flex items-center gap-2">
            <CheckCircle size={24} className="text-green-400" />
            <span>Thank you for your message! We'll get back to you soon.</span>
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


// --- Main App Component ---
export default function App() {
  // State to manage the current "page" or section in this single-file app
  const [currentPage, setCurrentPage] = useState("home");

  // This useEffect will handle initial scroll to the home section on load
  useEffect(() => {
    const section = document.getElementById("home");
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  }, []); // Empty dependency array means this runs once on mount

  return (
    <div className="font-sans antialiased bg-blaize-slate text-white">
      {/* Tailwind CSS CDN - IMPORTANT for styling */}
      <script src="https://cdn.tailwindcss.com"></script>
      {/* Custom Tailwind Configuration - Now injected correctly */}
      <script dangerouslySetInnerHTML={{
        __html: `
          tailwind.config = {
            theme: {
              extend: {
                colors: {
                  'blaize-green': '#4D9900',
                  'blaize-orange': '#FF8400',
                  'blaize-slate': '#181c20',
                  'blaize-dark': '#0a0a0a',
                  'blaize-yellow': '#ffd400',
                },
                dropShadow: {
                  glow: '0 0 16px #4D9900cc',
                },
              },
            },
            plugins: [],
          };
        `
      }}></script>

      <Starfield />
      <ThreeScene />
      <HolographicGrid />
      <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} />

      <main className="pt-16"> {/* Add padding top to account for fixed navbar */}
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
