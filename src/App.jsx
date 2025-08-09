import React, { useState } from 'react';
import HomePage from './pages/HomePage';
import ServicesPage from './pages/ServicesPage';
import AboutPage from './pages/AboutPage';
import BookingPage from './pages/BookingPage';
import TestimonialsPage from './pages/TestimonialsPage';
import ContactPage from './pages/ContactPage';
import Navbar from './components/Navbar';
import ScrollToTopButton from './components/ScrollToTopButton';
import ThreeBackground from './components/ThreeBackground';
import './index.css';

function App() {
  const [currentPage, setCurrentPage] = useState('home');

  const renderPage = () => {
    switch (currentPage) {
      case 'services':
        return <ServicesPage />;
      case 'about':
        return <AboutPage />;
      case 'booking':
        return <BookingPage />;
      case 'testimonials':
        return <TestimonialsPage />;
      case 'contact':
        return <ContactPage />;
      case 'home':
      default:
        return <HomePage />;
    }
  };

  return (
    <>
      <ThreeBackground />
      <Navbar setCurrentPage={setCurrentPage} currentPage={currentPage} />
      <main>{renderPage()}</main>
      <ScrollToTopButton />
    </>
  );
}

export default App;
