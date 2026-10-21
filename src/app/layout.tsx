import type { Metadata, Viewport } from "next";
import "./globals.css";
import { DemoStoreProvider } from "@/lib/demo-store";
import { DemoBanner } from "@/components/layout/demo-banner";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { PWAPrompt } from "@/components/layout/pwa-prompt";

export const metadata: Metadata = {
  title: "SIMRS Modern - Sistem Informasi Manajemen Rumah Sakit",
  description:
    "Sistem Informasi Manajemen Rumah Sakit Modern, Terintegrasi, dan Berstandar Kemenkes RI",
  applicationName: "SIMRS Modern",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icons/icon.svg",
    apple: "/icons/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#0d9488",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="min-h-full bg-slate-50 text-slate-900 font-sans flex flex-col">
        <DemoStoreProvider>
          <DemoBanner />
          <div className="flex-1 flex w-full">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
              <Header />
              <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                {children}
              </main>
            </div>
          </div>
          <PWAPrompt />
        </DemoStoreProvider>
      </body>
    </html>
  );
}
