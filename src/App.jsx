import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";

const HomePage = lazy(() => import("./pages/HomePage"));
const ServicesPage = lazy(() => import("./pages/ServicesPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const BookingPage = lazy(() => import("./pages/BookingPage"));
const TestimonialsPage = lazy(() => import("./pages/TestimonialsPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));

function App() {
  return (
    <Router>
      <Navbar />
      <Suspense fallback={<div className="p-4 text-white">Loading...</div>}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/testimonials" element={<TestimonialsPage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
