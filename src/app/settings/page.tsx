"use client";

import React, { useState } from "react";
import {
  Settings,
  Building2,
  Shield,
  Database,
  CheckCircle2,
  Save,
  Server,
  Lock,
} from "lucide-react";
import { useSIMRS } from "@/lib/demo-store";
import { ROLE_PERMISSIONS, ROLE_LABELS } from "@/lib/permissions/rbac";
import { ModuleKey, UserRole } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SettingsPage() {
  const { hospitalSettings, updateHospitalSettings, isDemoMode, currentUser } = useSIMRS();

  const [activeTab, setActiveTab] = useState<"rs" | "rbac" | "supabase">("rs");

  // Hospital settings form state
  const [formSettings, setFormSettings] = useState({
    hospital_name: hospitalSettings.hospital_name,
    hospital_code: hospitalSettings.hospital_code,
    license_number: hospitalSettings.license_number,
    address: hospitalSettings.address,
    city: hospitalSettings.city,
    province: hospitalSettings.province,
    phone: hospitalSettings.phone,
    email: hospitalSettings.email,
    timezone: hospitalSettings.timezone,
    tax_identification_number: hospitalSettings.tax_identification_number,
    motto: hospitalSettings.motto,
  });

  const [selectedRoleMatrix, setSelectedRoleMatrix] = useState<UserRole>("doctor");

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateHospitalSettings(formSettings);
    alert("Profil konfigurasi rumah sakit berhasil diperbarui.");
  };

  const modulesList: { key: ModuleKey; label: string }[] = [
    { key: "dashboard", label: "Dashboard & Statistik" },
    { key: "patients", label: "Pasien & Master Data" },
    { key: "registrations", label: "Pendaftaran & Antrean" },
    { key: "outpatient", label: "Rawat Jalan (Poli)" },
    { key: "inpatient", label: "Rawat Inap & Bed" },
    { key: "emergency", label: "IGD & Triase" },
    { key: "doctor_schedules", label: "Jadwal Dokter" },
    { key: "medical_records", label: "Rekam Medis (EMR)" },
    { key: "prescriptions", label: "Resep & Farmasi" },
    { key: "pharmacy_inventory", label: "Inventaris Obat" },
    { key: "laboratory", label: "Laboratorium" },
    { key: "radiology", label: "Radiologi" },
    { key: "billing", label: "Kasir & Billing" },
    { key: "insurance_claims", label: "Penjamin & Klaim" },
    { key: "staff", label: "Kepegawaian (SDM)" },
    { key: "reports", label: "Laporan Operasional" },
    { key: "settings", label: "Pengaturan & Audit" },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Settings className="h-5 w-5 text-teal-600" />
            Pengaturan Sistem, Profil RS & Hak Akses (RBAC)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Konfigurasi identitas fasilitas kesehatan, zona waktu, dan matriks permission granular.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveTab("rs")}
          className={`px-3.5 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
            activeTab === "rs" ? "bg-teal-600 text-white" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Building2 className="h-4 w-4" /> Identitas Rumah Sakit
        </button>
        <button
          onClick={() => setActiveTab("rbac")}
          className={`px-3.5 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
            activeTab === "rbac" ? "bg-teal-600 text-white" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Shield className="h-4 w-4" /> Matriks Role & Permissions
        </button>
        <button
          onClick={() => setActiveTab("supabase")}
          className={`px-3.5 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
            activeTab === "supabase" ? "bg-teal-600 text-white" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Database className="h-4 w-4" /> Status Supabase & Cloud
        </button>
      </div>

      {/* Tab 1: Identitas Rumah Sakit */}
      {activeTab === "rs" && (
        <Card className="border-slate-200/90 shadow-2xs">
          <CardHeader className="p-5 border-b border-slate-100">
            <CardTitle className="text-sm font-bold text-slate-900">
              Konfigurasi Profil Rumah Sakit
            </CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">
              Identitas ini dicetak pada semua kop surat resmi, resep, kuitansi kasir, dan hasil laboratorium.
            </p>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Nama Rumah Sakit *</label>
                  <Input
                    required
                    value={formSettings.hospital_name}
                    onChange={(e) => setFormSettings({ ...formSettings, hospital_name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Kode Faskes Rumah Sakit *</label>
                  <Input
                    required
                    value={formSettings.hospital_code}
                    onChange={(e) => setFormSettings({ ...formSettings, hospital_code: e.target.value })}
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Nomor Izin Operasional *</label>
                  <Input
                    required
                    value={formSettings.license_number}
                    onChange={(e) => setFormSettings({ ...formSettings, license_number: e.target.value })}
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Zona Waktu Layanan *</label>
                  <select
                    value={formSettings.timezone}
                    onChange={(e) => setFormSettings({ ...formSettings, timezone: e.target.value })}
                    className="w-full h-9 px-3 rounded-md border border-slate-200 bg-white text-xs font-semibold"
                  >
                    <option value="Asia/Makassar">Asia/Makassar (WITA)</option>
                    <option value="Asia/Jakarta">Asia/Jakarta (WIB)</option>
                    <option value="Asia/Jayapura">Asia/Jayapura (WIT)</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="font-semibold text-slate-700 block mb-1">Alamat Fasilitas Kesehatan *</label>
                  <Input
                    required
                    value={formSettings.address}
                    onChange={(e) => setFormSettings({ ...formSettings, address: e.target.value })}
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Kota / Kabupaten *</label>
                  <Input
                    required
                    value={formSettings.city}
                    onChange={(e) => setFormSettings({ ...formSettings, city: e.target.value })}
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Provinsi *</label>
                  <Input
                    required
                    value={formSettings.province}
                    onChange={(e) => setFormSettings({ ...formSettings, province: e.target.value })}
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Nomor Telepon Layanan *</label>
                  <Input
                    required
                    value={formSettings.phone}
                    onChange={(e) => setFormSettings({ ...formSettings, phone: e.target.value })}
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Email Resmi *</label>
                  <Input
                    type="email"
                    required
                    value={formSettings.email}
                    onChange={(e) => setFormSettings({ ...formSettings, email: e.target.value })}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="font-semibold text-slate-700 block mb-1">Semboyan / Motto Layanan</label>
                  <Input
                    value={formSettings.motto}
                    onChange={(e) => setFormSettings({ ...formSettings, motto: e.target.value })}
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <Button type="submit" size="sm" className="bg-teal-600 hover:bg-teal-700 text-white font-medium">
                  <Save className="h-4 w-4 mr-1.5" />
                  Simpan Perubahan Profil RS
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Tab 2: Matriks RBAC Visual */}
      {activeTab === "rbac" && (
        <Card className="border-slate-200/90 shadow-2xs">
          <CardHeader className="p-5 border-b border-slate-100 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold text-slate-900">
                Matriks Hak Akses & Kewenangan Peran (RBAC)
              </CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Prinsip least privilege: Tinjau aksi yang diizinkan (View, Create, Update, Verify, Approve, Cancel) untuk setiap role.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Pilih Role:</span>
              <select
                value={selectedRoleMatrix}
                onChange={(e) => setSelectedRoleMatrix(e.target.value as UserRole)}
                className="h-9 px-3 rounded-md bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800"
              >
                {Object.keys(ROLE_LABELS).map((role) => (
                  <option key={role} value={role}>
                    {ROLE_LABELS[role as UserRole]}
                  </option>
                ))}
              </select>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Modul Sistem</th>
                    <th className="px-4 py-3 text-center">Akses Modul</th>
                    <th className="px-4 py-3">Aksi yang Diizinkan (Permissions)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-normal">
                  {modulesList.map((m) => {
                    const permissions = ROLE_PERMISSIONS[selectedRoleMatrix]?.[m.key] || [];
                    const canAccess = permissions.length > 0;

                    return (
                      <tr key={m.key} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3 font-semibold text-slate-800">{m.label}</td>
                        <td className="px-4 py-3 text-center">
                          {canAccess ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              DIIZINKAN
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500">
                              DIBATASI
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {permissions.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {permissions.map((action) => (
                                <span
                                  key={action}
                                  className="px-2 py-0.5 rounded text-[10px] font-mono bg-teal-50 text-teal-700 border border-teal-200"
                                >
                                  {action}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-slate-400 italic text-[11px]">Tidak ada akses</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab 3: Supabase Cloud Setup Guide */}
      {activeTab === "supabase" && (
        <Card className="border-slate-200/90 shadow-2xs space-y-4">
          <CardHeader className="p-5 border-b border-slate-100">
            <CardTitle className="text-sm font-bold text-slate-900">
              Konfigurasi Koneksi Supabase PostgreSQL
            </CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">
              Panduan menghubungkan SIMRS ke instance database Supabase live dengan RLS.
            </p>
          </CardHeader>
          <CardContent className="p-6 space-y-4 text-xs">
            <div className="p-4 rounded-lg bg-teal-50 border border-teal-200 text-teal-900 space-y-2">
              <h4 className="font-bold flex items-center gap-1.5 text-sm">
                <CheckCircle2 className="h-4 w-4 text-teal-700" />
                Skrip Migrasi Skema Lengkap Telah Siap:
              </h4>
              <p className="text-xs leading-relaxed">
                File migrasi <code>supabase/migrations/20261021000001_initial_schema.sql</code> dan seed data{" "}
                <code>supabase/seed.sql</code> telah dibuat di dalam workspace, mencakup 40+ tabel, check constraint,
                foreign keys, triggers, dan Row Level Security (RLS) policies.
              </p>
            </div>

            <div className="space-y-2">
              <strong className="text-slate-800 block text-xs">Langkah Setup Live Supabase:</strong>
              <ol className="list-decimal list-inside space-y-1 text-slate-600 pl-1">
                <li>Buat proyek baru di dashboard Supabase (https://supabase.com).</li>
                <li>Buka menu SQL Editor di Supabase, lalu salin dan jalankan seluruh isi file <code>supabase/migrations/20261021000001_initial_schema.sql</code>.</li>
                <li>Jalankan file <code>supabase/seed.sql</code> untuk mempopulasikan data awal rumah sakit.</li>
                <li>Salin <strong>Project URL</strong> dan <strong>Anon Key</strong> ke dalam file <code>.env.local</code> di komputer Anda.</li>
                <li>Restart dev server untuk langsung beralih dari Mode Demo ke Mode Live Supabase!</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
