"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Users,
  Stethoscope,
  Siren,
  BedDouble,
  Clock,
  Pill,
  FlaskConical,
  CreditCard,
  TrendingUp,
  Activity,
  ArrowUpRight,
  ShieldAlert,
  Calendar,
  Filter,
} from "lucide-react";
import { useSIMRS } from "@/lib/demo-store";
import { formatCurrency, formatTime, TRIAGE_INFO } from "@/lib/formatters";
import { hasPermission } from "@/lib/permissions/rbac";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function DashboardPage() {
  const {
    currentUser,
    patients,
    registrations,
    queues,
    beds,
    admissions,
    prescriptions,
    labOrders,
    invoices,
    emergencyEncounters,
    auditLogs,
  } = useSIMRS();

  const [timeFilter, setTimeFilter] = useState<"today" | "week" | "month">("today");

  // Metrics computation
  const totalPatients = patients.length;
  const outpatientVisits = registrations.filter((r) => r.visit_type === "rawat_jalan").length;
  const activeERCount = emergencyEncounters.filter(
    (e) => e.status !== "pulang" && e.status !== "meninggal"
  ).length;
  const activeInpatients = admissions.filter((a) => a.status === "aktif").length;
  const occupiedBeds = beds.filter((b) => b.status === "TERISI").length;
  const totalBeds = beds.length;
  const borPercentage = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  const currentWaitingQueues = queues.filter(
    (q) => q.status === "menunggu" || q.status === "terdaftar"
  ).length;
  const pendingPrescriptions = prescriptions.filter(
    (p) => p.status === "menunggu_telaah" || p.status === "terverifikasi"
  ).length;
  const pendingLabs = labOrders.filter(
    (l) => l.status === "diminta" || l.status === "dalam_proses"
  ).length;

  // Financial computation (Role protected)
  const canViewFinancial = hasPermission(currentUser.role, "billing", "view");
  const totalRevenue = invoices
    .filter((inv) => inv.status === "lunas" || inv.status === "sebagian")
    .reduce((acc, inv) => acc + inv.paid_amount, 0);

  // Visit trend data for charts
  const visitTrendData = [
    { jam: "07:00", rawatJalan: 4, igd: 2, total: 6 },
    { jam: "08:00", rawatJalan: 12, igd: 3, total: 15 },
    { jam: "09:00", rawatJalan: 18, igd: 4, total: 22 },
    { jam: "10:00", rawatJalan: 24, igd: 6, total: 30 },
    { jam: "11:00", rawatJalan: 15, igd: 5, total: 20 },
    { jam: "12:00", rawatJalan: 8, igd: 3, total: 11 },
    { jam: "13:00", rawatJalan: 14, igd: 4, total: 18 },
    { jam: "14:00", rawatJalan: 9, igd: 2, total: 11 },
  ];

  // Insurance distribution
  const insuranceData = [
    { name: "BPJS Kesehatan", value: 68, color: "#0d9488" },
    { name: "Pasien Umum", value: 24, color: "#3b82f6" },
    { name: "Asuransi Swasta", value: 8, color: "#8b5cf6" },
  ];

  return (
    <div className="space-y-6">
      {/* Page Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Dashboard Operasional Rumah Sakit
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Ringkasan indikator mutu pelayanan, sensus pasien, dan alur kerja real-time.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 text-xs shadow-2xs">
            <button
              onClick={() => setTimeFilter("today")}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                timeFilter === "today" ? "bg-teal-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Hari Ini
            </button>
            <button
              onClick={() => setTimeFilter("week")}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                timeFilter === "week" ? "bg-teal-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Minggu Ini
            </button>
            <button
              onClick={() => setTimeFilter("month")}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                timeFilter === "month" ? "bg-teal-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Bulan Ini
            </button>
          </div>

          <Link href="/registrations">
            <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-white shadow-xs">
              <Users className="h-3.5 w-3.5 mr-1" />
              Pendaftaran Baru
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Outpatient */}
        <Card className="hover:shadow-sm transition-shadow border-slate-200/80">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 p-4">
            <CardTitle className="text-xs font-medium text-slate-600">
              Kunjungan Rawat Jalan
            </CardTitle>
            <div className="p-2 rounded-lg bg-teal-50 text-teal-600">
              <Stethoscope className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-slate-900">{outpatientVisits}</div>
            <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
              <span className="text-emerald-600 font-semibold flex items-center">
                <TrendingUp className="h-3 w-3 mr-0.5" /> +12%
              </span>{" "}
              dari periode kemarin
            </p>
          </CardContent>
        </Card>

        {/* Emergency IGD */}
        <Card className="hover:shadow-sm transition-shadow border-slate-200/80">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 p-4">
            <CardTitle className="text-xs font-medium text-slate-600">
              Pasien IGD Aktif
            </CardTitle>
            <div className="p-2 rounded-lg bg-red-50 text-red-600">
              <Siren className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-red-600">{activeERCount}</div>
            <p className="text-[11px] text-slate-500 mt-1">
              Termasuk kasus Triase P1 & P2 darurat
            </p>
          </CardContent>
        </Card>

        {/* Inpatient & BOR */}
        <Card className="hover:shadow-sm transition-shadow border-slate-200/80">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 p-4">
            <CardTitle className="text-xs font-medium text-slate-600">
              Rawat Inap & BOR Bed
            </CardTitle>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <BedDouble className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-slate-900">
              {occupiedBeds} <span className="text-sm font-normal text-slate-500">/ {totalBeds} Bed</span>
            </div>
            <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  borPercentage > 85 ? "bg-red-500" : borPercentage > 65 ? "bg-teal-500" : "bg-blue-500"
                }`}
                style={{ width: `${borPercentage}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Bed Occupancy Rate (BOR): {borPercentage}%</p>
          </CardContent>
        </Card>

        {/* Financial / Cashier Revenue (Protected by RBAC) */}
        {canViewFinancial ? (
          <Card className="hover:shadow-sm transition-shadow border-slate-200/80 bg-linear-to-br from-white to-teal-50/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 p-4">
              <CardTitle className="text-xs font-medium text-slate-600">
                Penerimaan Kasir Hari Ini
              </CardTitle>
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                <CreditCard className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold text-slate-900">{formatCurrency(totalRevenue)}</div>
              <p className="text-[11px] text-emerald-600 font-medium mt-1">
                Lunas & tervalidasi bendahara
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="hover:shadow-sm transition-shadow border-slate-200/80">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 p-4">
              <CardTitle className="text-xs font-medium text-slate-600">
                Antrean Berjalan
              </CardTitle>
              <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                <Clock className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold text-slate-900">{currentWaitingQueues}</div>
              <p className="text-[11px] text-slate-500 mt-1">
                Pasien menunggu pemanggilan poli & admisi
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Secondary Operational Status Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-white p-3 rounded-lg border border-slate-200 text-xs shadow-2xs">
        <div className="flex items-center gap-3 p-2 rounded-md hover:bg-slate-50">
          <div className="p-2 rounded bg-amber-100/70 text-amber-800">
            <Clock className="h-4 w-4" />
          </div>
          <div>
            <div className="text-slate-500 text-[11px]">Antrean Menunggu</div>
            <div className="font-bold text-slate-900 text-sm">{currentWaitingQueues} Pasien</div>
          </div>
        </div>

        <div className="flex items-center gap-3 p-2 rounded-md hover:bg-slate-50">
          <div className="p-2 rounded bg-indigo-100/70 text-indigo-800">
            <Pill className="h-4 w-4" />
          </div>
          <div>
            <div className="text-slate-500 text-[11px]">Resep Menunggu Telaah</div>
            <div className="font-bold text-slate-900 text-sm">{pendingPrescriptions} Resep</div>
          </div>
        </div>

        <div className="flex items-center gap-3 p-2 rounded-md hover:bg-slate-50">
          <div className="p-2 rounded bg-cyan-100/70 text-cyan-800">
            <FlaskConical className="h-4 w-4" />
          </div>
          <div>
            <div className="text-slate-500 text-[11px]">Order Lab Pending</div>
            <div className="font-bold text-slate-900 text-sm">{pendingLabs} Sampel</div>
          </div>
        </div>

        <div className="flex items-center gap-3 p-2 rounded-md hover:bg-slate-50">
          <div className="p-2 rounded bg-emerald-100/70 text-emerald-800">
            <Users className="h-4 w-4" />
          </div>
          <div>
            <div className="text-slate-500 text-[11px]">Total Master Pasien</div>
            <div className="font-bold text-slate-900 text-sm">{totalPatients} Pasien</div>
          </div>
        </div>
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Trend Kunjungan */}
        <Card className="lg:col-span-2 border-slate-200/90 shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between p-5 pb-0">
            <div>
              <CardTitle className="text-sm font-bold text-slate-900">
                Tren Kunjungan Pasien Per Jam
              </CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Pola arus kedatangan pasien Rawat Jalan dan Instalasi Gawat Darurat (WITA)
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="h-2.5 w-2.5 rounded-full bg-teal-500" />
                Rawat Jalan
              </span>
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                IGD
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-4">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={visitTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRj" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0d9488" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorIgd" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="jam" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      color: "#fff",
                      borderRadius: "6px",
                      fontSize: "12px",
                      border: "none",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="rawatJalan"
                    name="Rawat Jalan"
                    stroke="#0d9488"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRj)"
                  />
                  <Area
                    type="monotone"
                    dataKey="igd"
                    name="IGD"
                    stroke="#ef4444"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorIgd)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Right: Distribusi Penjamin & Asuransi */}
        <Card className="border-slate-200/90 shadow-2xs">
          <CardHeader className="p-5 pb-0">
            <CardTitle className="text-sm font-bold text-slate-900">
              Distribusi Pembiayaan
            </CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">Proporsi penjamin pasien terdaftar</p>
          </CardHeader>
          <CardContent className="p-5 flex flex-col items-center justify-center">
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={insuranceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {insuranceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      color: "#fff",
                      borderRadius: "6px",
                      fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="w-full space-y-2 mt-2">
              {insuranceData.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 text-slate-600">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    {item.name}
                  </span>
                  <span className="font-semibold text-slate-900">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Grid: IGD Triage Status & Recent Audit Trail */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* IGD Status & Triage */}
        <Card className="border-slate-200/90 shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between p-5 pb-3 border-b border-slate-100">
            <div>
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Siren className="h-4 w-4 text-red-600" />
                Daftar Pasien IGD Terkini
              </CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">Kategori triase ATS darurat</p>
            </div>
            <Link href="/emergency">
              <Button size="sm" variant="ghost" className="text-xs h-7 text-teal-600 hover:text-teal-700">
                Buka IGD <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100 text-xs">
              {emergencyEncounters.slice(0, 4).map((encounter) => {
                const triageMeta = TRIAGE_INFO[encounter.triage_level];
                return (
                  <div key={encounter.id} className="p-4 flex items-center justify-between hover:bg-slate-50/80">
                    <div>
                      <div className="font-semibold text-slate-900">{encounter.patient_name}</div>
                      <div className="text-slate-500 text-[11px] mt-0.5">
                        RM: <span className="font-mono text-slate-700">{encounter.patient_mrn}</span> • Jam: {formatTime(encounter.arrival_time)} WITA
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1 line-clamp-1 italic">
                        &quot;{encounter.triage_notes}&quot;
                      </p>
                    </div>
                    <span className={`px-2.5 py-1 rounded text-[10px] font-bold ${triageMeta.badge}`}>
                      {triageMeta.label.split(" - ")[0]}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Live System Activity / Audit Trail */}
        <Card className="border-slate-200/90 shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between p-5 pb-3 border-b border-slate-100">
            <div>
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Activity className="h-4 w-4 text-teal-600" />
                Aktivitas Sistem & Log Audit
              </CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">Jejak perubahan transaksi klinis & administratif</p>
            </div>
            <Link href="/audit">
              <Button size="sm" variant="ghost" className="text-xs h-7 text-teal-600 hover:text-teal-700">
                Semua Log <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100 text-xs">
              {auditLogs.slice(0, 4).map((log) => (
                <div key={log.id} className="p-4 hover:bg-slate-50/80 flex items-start gap-3">
                  <div className="h-2 w-2 rounded-full bg-teal-500 mt-1.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-slate-900 truncate">{log.user_name}</span>
                      <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                        {formatTime(log.created_at)}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5">{log.details}</p>
                    <span className="inline-block mt-1 text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded">
                      {log.action}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
