"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Bell,
  Shield,
  UserCheck,
  ChevronDown,
  Building2,
  Clock,
  LogOut,
} from "lucide-react";
import { useSIMRS } from "@/lib/demo-store";
import { ROLE_LABELS, ROLE_COLORS } from "@/lib/permissions/rbac";
import { UserRole } from "@/types";
import { INITIAL_USERS } from "@/lib/demo-data";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

export function Header() {
  const router = useRouter();
  const { currentUser, switchRole, hospitalSettings, notifications, patients } = useSIMRS();
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResultsOpen, setSearchResultsOpen] = useState(false);

  const unreadNotifs = notifications.filter((n) => !n.is_read).length;

  const filteredPatients = searchQuery.trim()
    ? patients.filter(
        (p) =>
          p.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.mrn.includes(searchQuery) ||
          p.nik.includes(searchQuery)
      )
    : [];

  const handleSelectPatient = (patientId: string) => {
    setSearchResultsOpen(false);
    setSearchQuery("");
    router.push(`/patients?id=${patientId}`);
  };

  const roleStyle = ROLE_COLORS[currentUser.role] || {
    bg: "bg-slate-100",
    text: "text-slate-800",
    border: "border-slate-300",
  };

  return (
    <>
      <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between gap-4 sticky top-0 z-20 shadow-2xs">
        {/* Left: Quick Patient Search */}
        <div className="relative flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari Pasien (No. RM, NIK, atau Nama)..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSearchResultsOpen(true);
              }}
              onFocus={() => setSearchResultsOpen(true)}
              className="w-full h-9 pl-9 pr-4 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
            />
          </div>

          {/* Quick Search Dropdown */}
          {searchResultsOpen && searchQuery.trim() && (
            <div className="absolute left-0 right-0 top-11 bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden z-50">
              <div className="p-2 border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Hasil Pencarian Pasien ({filteredPatients.length})
              </div>
              <div className="max-h-60 overflow-y-auto divide-y divide-slate-100">
                {filteredPatients.length > 0 ? (
                  filteredPatients.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handleSelectPatient(p.id)}
                      className="w-full text-left p-3 hover:bg-slate-50 transition-colors flex items-center justify-between group"
                    >
                      <div>
                        <div className="text-xs font-semibold text-slate-900 group-hover:text-teal-600">
                          {p.full_name}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          RM: <span className="font-mono font-medium text-slate-700">{p.mrn}</span> • Lahir: {p.birth_date} • {p.gender === "L" ? "Laki-laki" : "Perempuan"}
                        </div>
                      </div>
                      <span className="text-[10px] font-mono bg-teal-50 text-teal-700 px-2 py-0.5 rounded border border-teal-200">
                        {p.insurance_type}
                      </span>
                    </button>
                  ))
                ) : (
                  <div className="p-4 text-center text-xs text-slate-500">
                    Tidak ditemukan pasien dengan kata kunci &quot;{searchQuery}&quot;
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Action Bar */}
        <div className="flex items-center gap-3">
          {/* Hospital Unit Indicator */}
          <div className="hidden lg:flex items-center gap-2 text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-md border border-slate-200">
            <Building2 className="h-3.5 w-3.5 text-teal-600" />
            <span className="font-medium text-slate-800">{hospitalSettings.hospital_name}</span>
          </div>

          {/* Role Switcher Button */}
          <button
            onClick={() => setRoleModalOpen(true)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium cursor-pointer transition-all hover:shadow-xs ${roleStyle.bg} ${roleStyle.text} ${roleStyle.border}`}
            title="Klik untuk beralih peran pengujian (Role Testing)"
          >
            <Shield className="h-3.5 w-3.5 shrink-0" />
            <span className="font-semibold">{ROLE_LABELS[currentUser.role]}</span>
            <ChevronDown className="h-3 w-3 opacity-60" />
          </button>

          {/* Notifications Trigger */}
          <Link
            href="/notifications"
            className="relative p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            title="Notifikasi Sistem"
          >
            <Bell className="h-4 w-4" />
            {unreadNotifs > 0 && (
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
            )}
          </Link>

          {/* User Profile Mini */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
            <div className="h-8 w-8 rounded-full bg-teal-700 text-white font-bold text-xs flex items-center justify-center shadow-xs">
              {currentUser.full_name.slice(0, 2).toUpperCase()}
            </div>
            <div className="hidden md:block text-left">
              <div className="text-xs font-semibold text-slate-900 leading-tight">
                {currentUser.full_name}
              </div>
              <div className="text-[10px] text-slate-500 leading-tight">
                {currentUser.nip ? `NIP: ${currentUser.nip}` : currentUser.email}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Role Switcher Modal (Comprehensive 11-role testing) */}
      <Modal
        isOpen={roleModalOpen}
        onClose={() => setRoleModalOpen(false)}
        title="Ganti Peran Pengguna (Role Switcher)"
        description="Pilih salah satu dari 11 peran untuk memvalidasi batasan hak akses (RBAC), menu, dan aksi klinis."
        maxWidth="2xl"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
          {INITIAL_USERS.map((user) => {
            const isCurrent = user.role === currentUser.role;
            const style = ROLE_COLORS[user.role];

            return (
              <button
                key={user.id}
                onClick={() => {
                  switchRole(user.role);
                  setRoleModalOpen(false);
                }}
                className={`text-left p-3 rounded-lg border transition-all flex flex-col justify-between cursor-pointer ${
                  isCurrent
                    ? "border-teal-600 bg-teal-50/60 ring-2 ring-teal-500/20 shadow-xs"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${style.bg} ${style.text} ${style.border}`}
                  >
                    {ROLE_LABELS[user.role]}
                  </span>
                  {isCurrent && (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-teal-700">
                      <UserCheck className="h-3.5 w-3.5" />
                      Aktif
                    </span>
                  )}
                </div>
                <div className="text-xs font-semibold text-slate-900 mt-1">{user.full_name}</div>
                <div className="text-[11px] text-slate-500 mt-0.5 truncate">{user.department_name}</div>
              </button>
            );
          })}
        </div>

        <div className="mt-5 p-3 rounded-md bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
          <span>Hak akses menu & tindakan berubah secara instan sesuai matriks RBAC.</span>
          <Button size="sm" variant="outline" onClick={() => setRoleModalOpen(false)}>
            Tutup
          </Button>
        </div>
      </Modal>
    </>
  );
}
