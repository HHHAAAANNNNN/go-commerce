"use client";

import { useState, useEffect } from "react";

interface NavbarProps {
  onLoginClick: () => void;
}

export default function Navbar({ onLoginClick }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
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
        isScrolled
          ? "bg-[#0A0A0F]/95 backdrop-blur-xl shadow-lg shadow-primary-400/5 border-b border-primary-400/10"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <button
            onClick={() => scrollToSection("hero")}
            className={`text-2xl font-bold transition-colors duration-300 ${
              isScrolled
                ? "text-primary-400 hover:text-primary-500"
                : "text-white hover:text-accent-400"
            }`}
          >
            Logo Ipsum
          </button>

          {/* Navigation Links */}
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

          {/* Login Button */}
          <button
            onClick={onLoginClick}
            className={`px-6 py-2.5 rounded-full font-semibold transition-all duration-300 hover:scale-105 ${
              isScrolled
                ? "bg-gradient-to-r from-primary-400 to-primary-500 text-white hover:from-primary-500 hover:to-primary-600 shadow-md shadow-primary-400/20 hover:shadow-xl hover:shadow-primary-400/30"
                : "bg-white/5 backdrop-blur-md text-white border-2 border-primary-400/30 hover:bg-white/10 hover:border-primary-400/60"
            }`}
          >
            Login
          </button>
        </div>
      </div>
    </nav>
  );
}
