import type { Metadata, Viewport } from "next";
import "./globals.css";
import { DemoStoreProvider } from "@/lib/demo-store";
import { AppShell } from "@/components/layout/app-shell";

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
      <body className="min-h-full bg-slate-900 font-sans antialiased text-slate-900">
        <DemoStoreProvider>
          <AppShell>{children}</AppShell>
        </DemoStoreProvider>
      </body>
    </html>
  );
}
