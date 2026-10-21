"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Stethoscope,
  BedDouble,
  Siren,
  CalendarDays,
  FileHeart,
  Pill,
  Boxes,
  FlaskConical,
  Scan,
  ReceiptText,
  ShieldCheck,
  UserCog,
  FileSpreadsheet,
  Bell,
  Settings,
  History,
  ChevronLeft,
  ChevronRight,
  Activity,
  UserPlus,
  X,
} from "lucide-react";
import { useSIMRS } from "@/lib/demo-store";
import { canAccessModule } from "@/lib/permissions/rbac";
import { ModuleKey } from "@/types";
import { cn } from "@/lib/utils";
import { useSidebar } from "./sidebar-context";

interface NavGroup {
  label: string;
  items: {
    label: string;
    href: string;
    icon: React.ElementType;
    moduleKey: ModuleKey;
    badgeCount?: number;
    badgeVariant?: "alert" | "warning" | "neutral";
  }[];
}

export function Sidebar() {
  const pathname = usePathname();
  const { currentUser, hospitalSettings, queues, prescriptions, labOrders, emergencyEncounters } = useSIMRS();
  const { mobileOpen, closeMobile } = useSidebar();
  const [collapsed, setCollapsed] = useState(false);

  // Dynamic badge counts
  const waitingQueues = queues.filter((q) => q.status === "menunggu" || q.status === "terdaftar").length;
  const pendingRx = prescriptions.filter((p) => p.status === "menunggu_telaah" || p.status === "terverifikasi").length;
  const pendingLabs = labOrders.filter((l) => l.status === "diminta" || l.status === "dalam_proses" || l.status === "menunggu_validasi").length;
  const activeER = emergencyEncounters.filter((e) => e.status !== "pulang" && e.status !== "meninggal").length;

  const navGroups: NavGroup[] = [
    {
      label: "Utama",
      items: [
        {
          label: "Dashboard",
          href: "/dashboard",
          icon: LayoutDashboard,
          moduleKey: "dashboard",
        },
        {
          label: "Pasien",
          href: "/patients",
          icon: Users,
          moduleKey: "patients",
        },
        {
          label: "Registrasi Pasien Baru",
          href: "/patients/register",
          icon: UserPlus,
          moduleKey: "patients",
        },
        {
          label: "Pendaftaran & Antrean",
          href: "/registrations",
          icon: ClipboardList,
          moduleKey: "registrations",
          badgeCount: waitingQueues > 0 ? waitingQueues : undefined,
          badgeVariant: "neutral",
        },
      ],
    },
    {
      label: "Pelayanan Klinis",
      items: [
        {
          label: "Instalasi Gawat Darurat",
          href: "/emergency",
          icon: Siren,
          moduleKey: "emergency",
          badgeCount: activeER > 0 ? activeER : undefined,
          badgeVariant: "alert",
        },
        {
          label: "Rawat Jalan (Poli)",
          href: "/outpatient",
          icon: Stethoscope,
          moduleKey: "outpatient",
        },
        {
          label: "Rawat Inap & Tempat Tidur",
          href: "/inpatient",
          icon: BedDouble,
          moduleKey: "inpatient",
        },
        {
          label: "Jadwal Dokter",
          href: "/schedules",
          icon: CalendarDays,
          moduleKey: "doctor_schedules",
        },
        {
          label: "Rekam Medis (EMR)",
          href: "/medical-records",
          icon: FileHeart,
          moduleKey: "medical_records",
        },
      ],
    },
    {
      label: "Penunjang & Farmasi",
      items: [
        {
          label: "Farmasi & Resep",
          href: "/pharmacy",
          icon: Pill,
          moduleKey: "prescriptions",
          badgeCount: pendingRx > 0 ? pendingRx : undefined,
          badgeVariant: "warning",
        },
        {
          label: "Inventaris Obat & Alkes",
          href: "/inventory",
          icon: Boxes,
          moduleKey: "pharmacy_inventory",
        },
        {
          label: "Laboratorium",
          href: "/laboratory",
          icon: FlaskConical,
          moduleKey: "laboratory",
          badgeCount: pendingLabs > 0 ? pendingLabs : undefined,
          badgeVariant: "warning",
        },
        {
          label: "Radiologi & Pencitraan",
          href: "/radiology",
          icon: Scan,
          moduleKey: "radiology",
        },
      ],
    },
    {
      label: "Administrasi & Keuangan",
      items: [
        {
          label: "Kasir & Billing",
          href: "/billing",
          icon: ReceiptText,
          moduleKey: "billing",
        },
        {
          label: "Penjamin & E-Klaim",
          href: "/insurance",
          icon: ShieldCheck,
          moduleKey: "insurance_claims",
        },
        {
          label: "Kepegawaian (SDM)",
          href: "/staff",
          icon: UserCog,
          moduleKey: "staff",
        },
        {
          label: "Laporan & Statistik",
          href: "/reports",
          icon: FileSpreadsheet,
          moduleKey: "reports",
        },
      ],
    },
    {
      label: "Sistem & Audit",
      items: [
        {
          label: "Pusat Notifikasi",
          href: "/notifications",
          icon: Bell,
          moduleKey: "notifications",
        },
        {
          label: "Audit Log & Jejak",
          href: "/audit",
          icon: History,
          moduleKey: "settings",
        },
        {
          label: "Pengaturan Rumah Sakit",
          href: "/settings",
          icon: Settings,
          moduleKey: "settings",
        },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          onClick={closeMobile}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-40 md:hidden animate-in fade-in duration-200"
        />
      )}

      <aside
        className={cn(
          "h-screen flex flex-col bg-slate-900 text-slate-300 border-r border-slate-800 transition-all duration-300 select-none",
          // Desktop positioning
          "hidden md:flex md:sticky md:top-0 md:z-30",
          collapsed ? "md:w-16" : "md:w-64",
          // Mobile Drawer positioning
          mobileOpen &&
            "flex fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] shadow-2xl animate-in slide-in-from-left duration-200"
        )}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800 bg-slate-950/60">
          {!collapsed && (
            <Link
              href="/dashboard"
              onClick={closeMobile}
              className="flex items-center gap-2.5 overflow-hidden"
            >
              <div className="h-8 w-8 rounded-lg bg-teal-600 flex items-center justify-center text-white shrink-0 shadow-md">
                <Activity className="h-5 w-5" />
              </div>
              <div className="truncate">
                <h1 className="text-sm font-bold text-white tracking-tight truncate">
                  {hospitalSettings.hospital_name}
                </h1>
                <p className="text-[10px] text-teal-400 font-mono tracking-wider">
                  SIMRS ENTERPRISE
                </p>
              </div>
            </Link>
          )}
          {collapsed && (
            <Link href="/dashboard" onClick={closeMobile} className="mx-auto">
              <div className="h-8 w-8 rounded-lg bg-teal-600 flex items-center justify-center text-white shadow-md">
                <Activity className="h-5 w-5" />
              </div>
            </Link>
          )}

          <div className="flex items-center gap-1">
            {/* Desktop Collapse Toggle */}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 hidden md:block cursor-pointer"
              title={collapsed ? "Perluas Sidebar" : "Ciutkan Sidebar"}
            >
              {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>

            {/* Mobile Close Button */}
            <button
              type="button"
              onClick={closeMobile}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 md:hidden cursor-pointer"
              title="Tutup Menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Navigation Groups */}
        <div className="flex-1 overflow-y-auto px-2 py-4 space-y-6">
          {navGroups.map((group) => {
            // Filter items based on user role permissions
            const accessibleItems = group.items.filter((item) =>
              canAccessModule(currentUser.role, item.moduleKey)
            );

            if (accessibleItems.length === 0) return null;

            return (
              <div key={group.label} className="space-y-1">
                {!collapsed && (
                  <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    {group.label}
                  </div>
                )}
                {accessibleItems.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={closeMobile}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-all group relative",
                        isActive
                          ? "bg-teal-600/20 text-teal-300 font-semibold border-l-2 border-teal-500"
                          : "text-slate-400 hover:bg-slate-800/80 hover:text-slate-200"
                      )}
                      title={collapsed ? item.label : undefined}
                    >
                      <Icon
                        className={cn(
                          "h-4 w-4 shrink-0 transition-colors",
                          isActive ? "text-teal-400" : "text-slate-400 group-hover:text-slate-300"
                        )}
                      />
                      {!collapsed && <span className="truncate flex-1">{item.label}</span>}
                      {!collapsed && item.badgeCount !== undefined && (
                        <span
                          className={cn(
                            "px-1.5 py-0.2 rounded-full text-[10px] font-semibold shrink-0",
                            item.badgeVariant === "alert"
                              ? "bg-red-500 text-white animate-pulse"
                              : item.badgeVariant === "warning"
                              ? "bg-amber-500 text-slate-950 font-bold"
                              : "bg-slate-700 text-slate-300"
                          )}
                        >
                          {item.badgeCount}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Hospital Footer */}
        {!collapsed && (
          <div className="p-3 border-t border-slate-800 bg-slate-950/40 text-[11px] text-slate-500 flex items-center justify-between">
            <span className="truncate">Zona: {hospitalSettings.timezone}</span>
            <span className="h-2 w-2 rounded-full bg-emerald-500" title="Sistem Aktif" />
          </div>
        )}
      </aside>
    </>
  );
}
