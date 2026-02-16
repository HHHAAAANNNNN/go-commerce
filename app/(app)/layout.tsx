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
      
      {/* Fixed Sidebar */}
      <div className="fixed left-0 top-[73px] h-[calc(100vh-73px)] z-30">
        <Sidebar isCollapsed={isSidebarCollapsed} />
      </div>
      
      {/* Main Content with margin to avoid overlap */}
      <main 
        className={`pb-6 px-6 transition-all duration-300 ${
          isSidebarCollapsed ? "ml-20" : "ml-64"
        }`}
        style={{ marginTop: '20px' }}
      >
        {children}
      </main>
    </div>
  );
}
