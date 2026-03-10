"use client";

import { useState, useEffect } from "react";

interface NavbarProps {
  onLoginClick: () => void;
}

export default function Navbar({ onLoginClick }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen]);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const offsetTop = element.offsetTop - 80;
      window.scrollTo({
        top: offsetTop,
        behavior: "smooth",
      });
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled || mobileMenuOpen
          ? "bg-[#0A0A0F]/95 backdrop-blur-xl shadow-lg shadow-primary-400/5 border-b border-primary-400/10"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <button
            onClick={() => scrollToSection("hero")}
            className={`text-xl sm:text-2xl font-bold transition-colors duration-300 ${
              isScrolled
                ? "text-primary-400 hover:text-primary-500"
                : "text-white hover:text-accent-400"
            }`}
          >
            Logo Ipsum
          </button>

          {/* Navigation Links — Desktop */}
          <div className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => scrollToSection("products")}
              className={`font-medium transition-all duration-300 hover:scale-105 ${
                isScrolled
                  ? "text-slate-300 hover:text-primary-400"
                  : "text-slate-200 hover:text-white"
              }`}
            >
              Products
            </button>
            <button
              onClick={() => scrollToSection("why-us")}
              className={`font-medium transition-all duration-300 hover:scale-105 ${
                isScrolled
                  ? "text-slate-300 hover:text-primary-400"
                  : "text-slate-200 hover:text-white"
              }`}
            >
              Why Us
            </button>
            <button
              onClick={() => scrollToSection("testimonials")}
              className={`font-medium transition-all duration-300 hover:scale-105 ${
                isScrolled
                  ? "text-slate-300 hover:text-primary-400"
                  : "text-slate-200 hover:text-white"
              }`}
            >
              Testimonials
            </button>
          </div>

          {/* Right: Login + Hamburger */}
          <div className="flex items-center gap-2">
            {/* Login Button */}
            <button
              onClick={onLoginClick}
              className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-full font-semibold text-sm sm:text-base transition-all duration-300 hover:scale-105 ${
                isScrolled
                  ? "bg-gradient-to-r from-primary-400 to-primary-500 text-white hover:from-primary-500 hover:to-primary-600 shadow-md shadow-primary-400/20 hover:shadow-xl hover:shadow-primary-400/30"
                  : "bg-white/5 backdrop-blur-md text-white border-2 border-primary-400/30 hover:bg-white/10 hover:border-primary-400/60"
              }`}
            >
              Login
            </button>

            {/* Hamburger — Mobile only */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800/50 bg-[#0A0A0F]/98 backdrop-blur-xl">
          <div className="container mx-auto px-4 py-4 space-y-1">
            {[
              { label: "Products", id: "products" },
              { label: "Why Us", id: "why-us" },
              { label: "Testimonials", id: "testimonials" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="block w-full text-left px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-xl font-medium transition-colors"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
