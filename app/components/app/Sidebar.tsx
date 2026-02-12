"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { icon: "📊", label: "Dashboard", href: "/dashboard" },
    { icon: "🛍️", label: "Products", href: "/products" },
    { icon: "🎫", label: "Vouchers", href: "/vouchers" },
    { icon: "📞", label: "Support", href: "/support" },
  ];

  return (
    <aside className="w-64 bg-[#0A0A0F] border-r border-slate-800/50 min-h-screen">
      <div className="p-6">
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                pathname === item.href
                  ? "bg-gradient-to-r from-primary-400/10 to-secondary-400/10 text-primary-400 border border-primary-400/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/40"
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
}
