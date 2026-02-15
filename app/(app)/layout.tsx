"use client";

import { useState } from "react";
import AppNavbar from "../components/app/AppNavbar";
import Sidebar from "../components/app/Sidebar";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      <AppNavbar onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
      <div className="flex">
        <div className="sticky top-0 h-screen z-40">
          <Sidebar isCollapsed={isSidebarCollapsed} />
        </div>
        <main className="flex-1 p-6 relative z-0">
          {children}
        </main>
      </div>
    </div>
  );
}
