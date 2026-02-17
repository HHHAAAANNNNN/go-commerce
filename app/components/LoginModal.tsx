"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegisterClick: () => void;
}

export default function LoginModal({ isOpen, onClose, onRegisterClick }: LoginModalProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validation
    if (!email.trim() || !password.trim()) {
      toast.error("Email dan password harus diisi");
      return;
    }

    setIsLoading(true);

    try {
      console.log("Sending login request to backend...");
      console.log("Email:", email);
      
      const response = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password,
        }),
      });

      console.log("Response status:", response.status);
      
      const data = await response.json();
      console.log("Response data:", data);

      if (!response.ok) {
        throw new Error(data.message || "Login gagal");
      }

      // Success - save user data to localStorage
      if (data.data && data.data.user) {
        localStorage.setItem("user", JSON.stringify(data.data.user));
        if (rememberMe) {
          localStorage.setItem("rememberMe", "true");
        }
      }

      toast.success("Login berhasil!");
      
      // Redirect to dashboard after short delay
      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    } catch (error: any) {
      // Better error handling for network errors
      if (error.message === "Failed to fetch" || error.name === "TypeError") {
        toast.error("Tidak dapat terhubung ke server. Pastikan backend server sudah running di port 8080");
      } else {
        toast.error(error.message || "Login gagal, silakan coba lagi");
      }
      // Refresh page on error
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } finally {
      setIsLoading(false);
    }
  };

  // Close modal on ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/75 z-[60] transition-opacity duration-300 animate-fade-in"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="fixed inset-0 z-[60] flex items-start justify-center pt-20 px-4 pointer-events-none">
        <div 
          className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl max-w-md w-full pointer-events-auto animate-slide-down"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">Welcome Back</h2>
              <p className="text-slate-400 text-sm">Login to continue shopping</p>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-800/50 rounded-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Email */}
            <div>
              <label htmlFor="loginEmail" className="block text-slate-300 text-sm font-medium mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="loginEmail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-primary-400/50 focus:ring-2 focus:ring-primary-400/20 transition-all"
                placeholder="john@example.com"
                autoFocus
                required
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="loginPassword" className="block text-slate-300 text-sm font-medium mb-2">
                Password
              </label>
              <input
                type="password"
                id="loginPassword"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-primary-400/50 focus:ring-2 focus:ring-primary-400/20 transition-all"
                placeholder="••••••••"
                required
              />
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 bg-slate-800/50 border border-slate-700/50 rounded text-primary-400 focus:ring-2 focus:ring-primary-400/20"
                />
                <span className="text-slate-400 text-sm">Remember me</span>
              </label>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-primary-400 to-secondary-400 text-white rounded-lg font-semibold hover:from-primary-500 hover:to-secondary-500 transition-all duration-300 hover:scale-105 shadow-lg shadow-primary-400/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Logging in..." : "Login"}
            </button>

            {/* Register Link */}
            <div className="text-center pt-0">
              <button
                type="button"
                onClick={onRegisterClick}
                className="text-slate-400 hover:text-white transition-colors duration-300 text-sm inline-block"
              >
                <span className="flex items-center gap-1">
                  Don't have an account? 
                  <span className="text-primary-400 hover:text-secondary-400 transition-colors underline underline-offset-2">Register here</span>
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
