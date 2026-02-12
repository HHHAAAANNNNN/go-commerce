"use client";

export default function AppNavbar() {
  return (
    <nav className="bg-[#0A0A0F] border-b border-slate-800/50 sticky top-0 z-50">
      <div className="px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="text-xl font-bold bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
          Logo Ipsum
        </div>

        {/* Page Title */}
        <div className="text-white text-lg font-semibold">
          Dashboard
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-3">
          <button className="w-10 h-10 rounded-full bg-gradient-to-r from-primary-400 to-secondary-400 flex items-center justify-center text-white font-semibold">
            U
          </button>
        </div>
      </div>
    </nav>
  );
}
