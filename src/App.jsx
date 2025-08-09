import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ServicesPage from "./pages/ServicesPage";
import AboutPage from "./pages/AboutPage";
import BookingPage from "./pages/BookingPage";
import TestimonialsPage from "./pages/TestimonialsPage";
import ContactPage from "./pages/ContactPage";
import Navbar from "./components/Navbar";
import ScrollToTopButton from "./components/ScrollToTopButton";
import ThreeBackground from "./components/ThreeBackground";

export default function App() {
  return (
    <Router>
      <ThreeBackground />
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/testimonials" element={<TestimonialsPage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Routes>
      </main>
      <ScrollToTopButton />
    </Router>
  );
}
