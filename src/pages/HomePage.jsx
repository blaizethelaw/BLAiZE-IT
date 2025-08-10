import React from "react";
import SectionDivider from "../components/SectionDivider";
import BookingButton from "../components/BookingButton";
import HeroLogo from "../components/HeroLogo";
import ServicesCarousel from "../components/ServicesCarousel";
import AboutSection from "../components/AboutSection";
import TestimonialsCarousel from "../components/TestimonialsCarousel";
import ContactSection from "../components/ContactSection";

export default function HomePage() {
  return (
    <main>
      <HeroLogo logoSrc="https://i.imgur.com/KvRnUTU.png" />
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
