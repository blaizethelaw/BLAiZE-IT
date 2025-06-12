import React from "react";
import SectionDivider from "../components/SectionDivider";
import BookingButton from "../components/BookingButton";
import HeroSection from "../components/HeroSection";
import ServicesCarousel from "../components/ServicesCarousel";
import AboutSection from "../components/AboutSection";
import TestimonialsCarousel from "../components/TestimonialsCarousel";
import ContactSection from "../components/ContactSection";

export default function HomePage() {
  return (
    <main className="bg-blaize-slate min-h-screen">
      <HeroSection />
      <SectionDivider />
      <ServicesCarousel />
      <SectionDivider flip />
      <AboutSection />
      <BookingButton />
      <SectionDivider />
      <TestimonialsCarousel />
      <SectionDivider flip />
      <ContactSection />
    </main>
  );
}
