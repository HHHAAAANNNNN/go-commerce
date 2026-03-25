"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface SidebarProps {
  isCollapsed: boolean;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export default function Sidebar({ isCollapsed, isMobileOpen = false, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const [role, setRole] = useState<string>("customer");

  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (raw) {
        const user = JSON.parse(raw) as { role?: string };
        setRole(user.role ?? "customer");
      }
    } catch {
      setRole("customer");
    }
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    onMobileClose?.();
  }, [pathname]);

  const isAdmin = role === "admin";

  const allMenuItems = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      label: "Dashboard",
      href: "/dashboard",
      roles: ["admin", "customer"],
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ),
      label: "Products",
      href: "/products",
      roles: ["admin", "customer"],
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      label: "Cart",
      href: "/cart",
      roles: ["customer"],
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
      label: "Orders",
      href: "/orders",
      roles: ["admin", "customer"],
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
        </svg>
      ),
      label: "Vouchers",
      href: "/vouchers",
      roles: ["admin"],
    },
  ];

  const menuItems = allMenuItems.filter(item => item.roles.includes(role));

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 top-[73px] bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={`
          bg-[#0A0A0F] border-r border-slate-800/50 h-[calc(100vh-73px)] transition-all duration-300 flex flex-col
          fixed top-[73px] left-0 z-[60]
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
          w-64
          md:translate-x-0 md:static md:z-auto
          ${isCollapsed ? "md:w-20" : "md:w-64"}
        `}
      >
        {isAdmin && (
          <div className={`px-4 pt-4 ${isCollapsed ? "text-center" : ""}`}>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary-400/10 border border-primary-400/20 text-primary-400 rounded-full text-xs font-semibold ${isCollapsed ? "px-2" : ""}`}>
              <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {!isCollapsed && "Admin"}
            </span>
          </div>
        )}
        <div className="flex-1 p-4">
          <nav className="space-y-1 mt-4">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${isActive
                    ? "bg-gradient-to-r from-primary-400/10 to-secondary-400/10 text-primary-400 border border-primary-400/20 shadow-lg shadow-primary-400/10"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/40"
                    } ${isCollapsed && !isMobileOpen ? "justify-center" : ""}`}
                  title={isCollapsed && !isMobileOpen ? item.label : ""}
                >
                  <span className={isActive ? "text-primary-400" : ""}>
                    {item.icon}
                  </span>
                  {(!isCollapsed || isMobileOpen) && (
                    <span className="font-medium text-sm">{item.label}</span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Profile Section at Bottom */}
        <div className="border-t border-slate-800/50 p-4">
          {(!isCollapsed || isMobileOpen) ? (
            <Link
              href="/profile"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/40 transition-all"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="font-medium text-sm">Profile</span>
            </Link>
          ) : (
            <Link
              href="/profile"
              className="flex items-center justify-center px-3 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/40 transition-all"
              title="Profile"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </Link>
          )}
        </div>
      </aside>
    </>
  );
}
