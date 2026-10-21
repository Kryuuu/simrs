"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { DemoBanner } from "@/components/layout/demo-banner";
import { PWAPrompt } from "@/components/layout/pwa-prompt";
import { SidebarProvider } from "@/components/layout/sidebar-context";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isStandalonePage =
    pathname === "/login" ||
    pathname === "/reset-password" ||
    pathname === "/register-pasien";

  if (isStandalonePage) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
        <main className="flex-1 flex flex-col">{children}</main>
        <PWAPrompt />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-slate-900 text-slate-900 flex flex-col">
        <DemoBanner />
        <div className="flex-1 flex w-full relative">
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50">
            <Header />
            <main
              key={pathname}
              className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 lg:p-8 pb-20 md:pb-8 animate-fade-in"
            >
              {children}
            </main>
          </div>
        </div>
        <MobileBottomNav />
        <PWAPrompt />
      </div>
    </SidebarProvider>
  );
}
