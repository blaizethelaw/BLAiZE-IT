
import React from "react";
import { Link, useLocation } from "react-router-dom";


const navItems = [
  { name: "Home", path: "/" },
  { name: "Services", path: "/services" },
  { name: "About", path: "/about" },
  { name: "Booking", path: "/booking" },
  { name: "Testimonials", path: "/testimonials" },
  { name: "Contact", path: "/contact" },
];

export default function MainLayout({ children }) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-blaize-dark text-white font-sans flex flex-col">
      <header className="sticky top-0 bg-blaize-dark/80 backdrop-blur shadow-glow z-40">
        <div className="flex items-center max-w-7xl mx-auto px-4 py-3">
          <img src="/blaize-logo.png" alt="BLAiZE IT Logo" className="h-14 mr-4 drop-shadow-lg" />
          <nav className="flex-1">
            <ul className="flex gap-5 text-lg font-bold">
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={
                      "transition-colors " +
                      (location.pathname === item.path
                        ? "text-blaize-green"
                        : "text-white hover:text-blaize-yellow")
                    }
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>
      <main className="flex-1 w-full max-w-7xl mx-auto">{children}</main>
      <footer className="mt-10 text-center text-sm text-blaize-yellow py-8">
        &copy; {new Date().getFullYear()} BLAiZE IT Solutions &mdash; IT Solutions for Business and Home
      </footer>
    </div>
  );
}
