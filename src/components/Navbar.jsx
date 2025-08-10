import React from "react";
import DarkModeToggle from "./DarkModeToggle";
import InteractiveLogo from "./InteractiveLogo";

const navItems = [
  { name: "Home", path: "home" },
  { name: "Services", path: "services" },
  { name: "About", path: "about" },
  { name: "Booking", path: "booking" },
  { name: "Testimonials", path: "testimonials" },
  { name: "Contact", path: "contact" },
];

export default function Navbar({ setCurrentPage, currentPage }) {
  return (
    <header
      className="fixed top-0 left-0 w-full z-50 bg-black/30 backdrop-blur-md transition-all duration-300"
      style={{ boxShadow: "0 2px 12px 0 rgba(0,0,0,0.12)" }}
    >
      <div className="flex items-center max-w-7xl mx-auto px-4 py-2">
        <div onClick={() => setCurrentPage("home")} className="cursor-pointer mr-3">
          <InteractiveLogo />
        </div>
        <nav className="flex-1">
          <ul className="flex gap-6 text-lg font-semibold">
            {navItems.map((item) => (
              <li key={item.name}>
                <button
                  onClick={() => setCurrentPage(item.path)}
                  className={`${
                    currentPage === item.path
                      ? "text-blaize-green"
                      : "text-white/90 hover:text-blaize-green transition"
                  }`}
                >
                  {item.name}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <DarkModeToggle />
      </div>
    </header>
  );
}
