"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import AppNavbar from "../components/app/AppNavbar";
import Sidebar from "../components/app/Sidebar";

// Pages that only admin can access
const ADMIN_ONLY_PATHS = ["/vouchers"];
// Pages that only customer can access
const CUSTOMER_ONLY_PATHS = ["/cart", "/checkout"];

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (!raw) {
      router.replace("/");
      return;
    }
    try {
      const user = JSON.parse(raw) as { role?: string };
      const role = user.role ?? "customer";

      // Block customers from admin-only pages
      if (role !== "admin" && ADMIN_ONLY_PATHS.some(p => pathname.startsWith(p))) {
        router.replace("/dashboard");
        return;
      }
      // Block admins from customer-only pages
      if (role === "admin" && CUSTOMER_ONLY_PATHS.some(p => pathname.startsWith(p))) {
        router.replace("/dashboard");
        return;
      }
      setAuthed(true);
    } catch {
      router.replace("/");
    }
  }, [router, pathname]);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileDrawerOpen(false);
  }, [pathname]);

  const handleToggleSidebar = () => {
    // On mobile: toggle drawer. On desktop: toggle collapse.
    if (window.innerWidth < 768) {
      setIsMobileDrawerOpen(!isMobileDrawerOpen);
    } else {
      setIsSidebarCollapsed(!isSidebarCollapsed);
    }
  };

  if (!authed) return null;

  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      <AppNavbar onToggleSidebar={handleToggleSidebar} />
      
      {/* Sidebar — hidden on mobile, fixed on desktop */}
      <div className="hidden md:block fixed left-0 top-[73px] h-[calc(100vh-73px)] z-30">
        <Sidebar isCollapsed={isSidebarCollapsed} />
      </div>

      {/* Mobile Sidebar Drawer */}
      <div className="md:hidden">
        <Sidebar
          isCollapsed={false}
          isMobileOpen={isMobileDrawerOpen}
          onMobileClose={() => setIsMobileDrawerOpen(false)}
        />
      </div>
      
      {/* Main Content — no margin on mobile, sidebar margin on desktop */}
      <main 
        className={`pb-6 px-4 md:px-6 transition-all duration-300 ${
          isSidebarCollapsed ? "md:ml-20" : "md:ml-64"
        }`}
        style={{ marginTop: '20px' }}
      >
        {children}
      </main>
    </div>
  );
}
