"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Siren,
  Menu,
} from "lucide-react";
import { useSidebar } from "./sidebar-context";
import { cn } from "@/lib/utils";

export function MobileBottomNav() {
  const pathname = usePathname();
  const { toggleMobile } = useSidebar();

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Pasien", href: "/patients", icon: Users },
    { label: "Antrean", href: "/registrations", icon: ClipboardList },
    { label: "IGD", href: "/emergency", icon: Siren },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200/90 py-1.5 px-2 flex items-center justify-around shadow-lg">
      {navItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all duration-200 active:scale-90",
              isActive
                ? "text-teal-600 font-bold bg-teal-50/80 shadow-2xs"
                : "text-slate-500 hover:text-slate-800"
            )}
          >
            <Icon className={cn("h-5 w-5 mb-0.5 transition-transform duration-200", isActive && "stroke-[2.5px] scale-110")} />
            <span className="text-[10px] tracking-tight">{item.label}</span>
          </Link>
        );
      })}

      {/* Menu Drawer Toggle */}
      <button
        type="button"
        onClick={toggleMobile}
        className="flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl text-slate-600 hover:text-slate-900 transition-all duration-200 active:scale-90 cursor-pointer"
      >
        <Menu className="h-5 w-5 mb-0.5" />
        <span className="text-[10px] tracking-tight">Semua</span>
      </button>
    </nav>
  );
}
