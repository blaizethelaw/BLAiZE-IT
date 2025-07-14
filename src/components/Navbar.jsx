// src/components/Navbar.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import DarkModeToggle from "./DarkModeToggle";

const navItems = [
  { name: "Home", path: "/" },
  { name: "Services", path: "/services" },
  { name: "About", path: "/about" },
  { name: "Booking", path: "/booking" },
  { name: "Testimonials", path: "/testimonials" },
  { name: "Contact", path: "/contact" },
];

export default function Navbar() {
  const location = useLocation();

  return (
    <header
      className="fixed top-0 left-0 w-full z-50 bg-black/30 backdrop-blur-md transition-all duration-300"
      style={{ boxShadow: "0 2px 12px 0 rgba(0,0,0,0.12)" }}
    >
      <div className="flex items-center max-w-7xl mx-auto px-4 py-2">
        <img
          src="/blaize-logo.png"
          alt="BLAiZE IT Logo"
          className="h-9 mr-3"
          draggable={false}
        />
        <nav className="flex-1">
          <ul className="flex gap-6 text-lg font-semibold">
            {navItems.map((item) => (
              <li key={item.name}>
                <Link
                  to={item.path}
                  className={`${
                    location.pathname === item.path
                      ? "text-blaize-green"
                      : "text-white/90 hover:text-blaize-green transition"
                  }`}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <DarkModeToggle />
      </div>
    </header>
  );
}
