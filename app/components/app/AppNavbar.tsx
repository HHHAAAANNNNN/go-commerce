"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";

interface AppNavbarProps {
  onToggleSidebar?: () => void;
}

export default function AppNavbar({ onToggleSidebar }: AppNavbarProps) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const getPageTitle = () => {
    if (pathname.includes("/dashboard")) return "Dashboard";
    if (pathname.includes("/products")) return "Products";
    if (pathname.includes("/cart")) return "Shopping Cart";
    if (pathname.includes("/checkout")) return "Checkout";
    if (pathname.includes("/orders")) return "Order History";
    if (pathname.includes("/vouchers")) return "Vouchers";
    if (pathname.includes("/profile")) return "Profile Settings";
    if (pathname.includes("/support")) return "Support";
    return "Dashboard";
  };

  const handleLogout = () => {
    // TODO: Implement logout logic
    router.push("/");
  };

  return (
    <nav className="bg-[#0A0A0F] border-b border-slate-800/50 sticky top-0 z-50 backdrop-blur-sm">
      <div className="px-6 py-4 flex items-center justify-between">
        {/* Left Section: Logo + Menu Toggle */}
        <div className="flex items-center gap-4">
          <button
            onClick={onToggleSidebar}
            className="p-2 hover:bg-slate-800/40 rounded-lg transition-colors text-slate-400 hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="text-xl font-bold bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
            Logo Ipsum
          </div>
        </div>

        {/* Center: Page Title */}
        <div className="text-white text-lg font-semibold">
          {getPageTitle()}
        </div>

        {/* Right: User Profile */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800/40 transition-colors"
          >
            <div className="text-right hidden md:block">
              <p className="text-white text-sm font-semibold">Farhan Nugraha</p>
              <p className="text-slate-400 text-xs">Premium Member</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary-400 to-secondary-400 flex items-center justify-center text-white font-semibold">
              FN
            </div>
          </button>

          {/* Dropdown Menu */}
          {showProfileMenu && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowProfileMenu(false)}
              />
              
              {/* Menu */}
              <div className="absolute right-0 mt-2 w-56 bg-slate-900/95 backdrop-blur-md border border-slate-700/50 rounded-xl shadow-2xl shadow-primary-400/10 z-50 overflow-hidden">
                <div className="p-3 border-b border-slate-700/50">
                  <p className="text-white font-semibold">Farhan Nugraha</p>
                  <p className="text-slate-400 text-xs">farhan@example.com</p>
                </div>
                <div className="py-2">
                  <button
                    onClick={() => {
                      router.push("/profile");
                      setShowProfileMenu(false);
                    }}
                    className="w-full px-4 py-2.5 text-left text-slate-300 hover:bg-primary-400/10 hover:text-white transition-colors flex items-center gap-3"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Edit Profile
                  </button>
                  <button
                    onClick={() => {
                      router.push("/cart");
                      setShowProfileMenu(false);
                    }}
                    className="w-full px-4 py-2.5 text-left text-slate-300 hover:bg-primary-400/10 hover:text-white transition-colors flex items-center gap-3"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    My Cart
                    <span className="ml-auto bg-primary-400/20 text-primary-400 text-xs font-semibold px-2 py-0.5 rounded-full">3</span>
                  </button>
                </div>
                <div className="border-t border-slate-700/50">
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2.5 text-left text-red-400 hover:bg-red-400/10 transition-colors flex items-center gap-3"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
