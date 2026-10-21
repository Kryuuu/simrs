"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Activity,
  Shield,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Building2,
  Stethoscope,
  Pill,
  CreditCard,
  UserCheck,
  Sparkles,
} from "lucide-react";
import { useSIMRS } from "@/lib/demo-store";
import { INITIAL_USERS } from "@/lib/demo-data";
import { ROLE_LABELS, ROLE_COLORS } from "@/lib/permissions/rbac";
import { UserRole } from "@/types";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const router = useRouter();
  const { setCurrentUser, hospitalSettings, recordAudit } = useSIMRS();

  const [email, setEmail] = useState("superadmin@simrs.local");
  const [password, setPassword] = useState("password123");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      // 1. If live Supabase client is configured, attempt real authentication
      if (isSupabaseConfigured) {
        const supabase = createClient();
        if (supabase) {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (!error && data.user) {
            // Match profile or find matching demo user
            const matchedUser = INITIAL_USERS.find((u) => u.email === email) || {
              id: data.user.id,
              email: data.user.email || email,
              full_name: data.user.user_metadata?.full_name || "Petugas SIMRS",
              role: (data.user.user_metadata?.role as UserRole) || "hospital_admin",
              is_active: true,
              created_at: new Date().toISOString(),
            };
            setCurrentUser(matchedUser);
            recordAudit("LOGIN", "auth", matchedUser.id, `Pengguna ${matchedUser.full_name} berhasil login via Supabase Auth`);
            router.push("/dashboard");
            return;
          }
        }
      }

      // 2. Demo mode / local verification fallback
      const matchedUser = INITIAL_USERS.find(
        (u) => u.email.toLowerCase() === email.toLowerCase()
      );

      if (matchedUser) {
        setCurrentUser(matchedUser);
        recordAudit("LOGIN", "auth", matchedUser.id, `Pengguna ${matchedUser.full_name} berhasil login (${ROLE_LABELS[matchedUser.role]})`);
        router.push("/dashboard");
      } else {
        // Allow login with newly created user credentials
        const genericUser = {
          id: `user-${Date.now()}`,
          email,
          full_name: email.split("@")[0].toUpperCase(),
          role: "hospital_admin" as UserRole,
          is_active: true,
          created_at: new Date().toISOString(),
        };
        setCurrentUser(genericUser);
        router.push("/dashboard");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal masuk ke sistem. Silakan periksa kredensial Anda.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickRoleSelect = (userRole: UserRole) => {
    const user = INITIAL_USERS.find((u) => u.role === userRole);
    if (user) {
      setEmail(user.email);
      setPassword("password123");
      setCurrentUser(user);
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-slate-950 text-slate-100 font-sans selection:bg-teal-500 selection:text-white">
      {/* Left Column: Hospital Branding & Clinical Highlights */}
      <div className="lg:w-1/2 p-8 lg:p-16 flex flex-col justify-between relative overflow-hidden bg-radial from-slate-900 via-slate-950 to-slate-950 border-b lg:border-b-0 lg:border-r border-slate-800/80">
        {/* Subtle Ambient Glow */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-linear-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white shadow-lg shadow-teal-500/20 ring-1 ring-white/20">
              <Activity className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">
                {hospitalSettings.hospital_name}
              </h1>
              <p className="text-xs font-mono text-teal-400 tracking-wider">
                SIMRS ENTERPRISE EDITION
              </p>
            </div>
          </div>

          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-[11px] text-teal-300">
            <Sparkles className="h-3.5 w-3.5 text-teal-400" />
            Akreditasi Paripurna Kemenkes RI • Standar Permenkes No. 24/2022
          </div>
        </div>

        {/* Center Presentation */}
        <div className="my-12 relative z-10 space-y-6 max-w-lg">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-snug">
            Sistem Informasi Rumah Sakit yang{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-teal-400 to-emerald-400">
              Aman, Cepat, dan Terintegrasi.
            </span>
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Menghubungkan rekam medis elektronik, admisi pasien, triase IGD darurat, farmasi FEFO,
            laboratorium, hingga kasir pembayaran dalam satu arsitektur terpadu.
          </p>

          <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xs">
              <Shield className="h-4 w-4 text-teal-400 mb-2" />
              <div className="font-semibold text-white">Privasi UU PDP Terlindungi</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Penyamaran NIK & Audit Log Immutability</div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xs">
              <Pill className="h-4 w-4 text-emerald-400 mb-2" />
              <div className="font-semibold text-white">Farmasi Presisi FEFO</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Telaah 7 benar & pencegahan stok kedaluwarsa</div>
            </div>
          </div>
        </div>

        {/* Bottom Disclaimer */}
        <div className="relative z-10 text-[11px] text-slate-500 pt-6 border-t border-slate-900 flex items-center justify-between">
          <span>{hospitalSettings.license_number}</span>
          <span className="font-mono">Zona: {hospitalSettings.timezone}</span>
        </div>
      </div>

      {/* Right Column: Portal Login Form & 1-Click Role Switcher */}
      <div className="lg:w-1/2 p-6 sm:p-12 lg:p-16 flex flex-col justify-center items-center relative bg-slate-950">
        <div className="w-full max-w-md space-y-6">
          {/* Header Title */}
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              Masuk ke Portal Petugas Medis
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Gunakan email dinas dan kata sandi Anda untuk mengakses rekam medis & operasional.
            </p>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 rounded-lg bg-red-950/60 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Public Patient Kiosk Registration Banner */}
          <div className="p-4 rounded-2xl bg-linear-to-r from-teal-950/70 to-emerald-950/60 border border-teal-500/40 backdrop-blur-md space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-teal-300 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-teal-400" />
                Pendaftaran Mandiri Pasien Baru
              </span>
              <span className="text-[10px] text-teal-400 font-mono bg-teal-500/10 px-2 py-0.5 rounded-full border border-teal-500/30">
                Pilih Kategori
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Pasien baru dapat mendaftar mandiri. Pilih kategori Anda (Pasien BPJS JKN atau Pasien Umum) sebelum masuk ke formulir.
            </p>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <Link
                href="/register-pasien/bpjs"
                className="inline-flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold shadow-md shadow-emerald-950/40 transition-all text-center"
              >
                <span>Pasien BPJS (JKN)</span> <ArrowRight className="h-3 w-3" />
              </Link>
              <Link
                href="/register-pasien/umum"
                className="inline-flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-[11px] font-bold shadow-md shadow-teal-950/40 transition-all text-center"
              >
                <span>Pasien Umum</span> <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
            <div>
              <label className="font-medium text-slate-300 block mb-1.5">
                Email Dinas / Pengguna
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@simrs.local"
                  className="w-full h-10 pl-9 pr-4 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-medium text-slate-300">Kata Sandi</label>
                <button
                  type="button"
                  className="text-[11px] text-teal-400 hover:text-teal-300"
                  onClick={() => alert("Silakan hubungi Administrator IT SIMRS untuk reset kredensial.")}
                >
                  Lupa kata sandi?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full h-10 pl-9 pr-10 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-10 text-xs font-semibold bg-linear-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 text-white shadow-lg shadow-teal-900/30 transition-all mt-2"
            >
              {isLoading ? (
                <span>Memvalidasi Akses...</span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Masuk ke SIMRS <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
          </form>

          {/* Quick 1-Click Role Switcher Demo Credentials */}
          <div className="pt-6 border-t border-slate-900 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Pilih Akses Cepat Peran (1-Click Login):
              </span>
              <span className="text-[10px] text-teal-400 font-mono">11 Role RBAC</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickRoleSelect("super_admin")}
                className="p-2 rounded-lg bg-slate-900/80 border border-purple-500/30 hover:border-purple-400 text-left text-[11px] transition-all group cursor-pointer"
              >
                <div className="font-bold text-purple-300 group-hover:text-purple-200">Super Admin</div>
                <div className="text-[10px] text-slate-500 truncate">Hendra Pratama</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickRoleSelect("doctor")}
                className="p-2 rounded-lg bg-slate-900/80 border border-teal-500/30 hover:border-teal-400 text-left text-[11px] transition-all group cursor-pointer"
              >
                <div className="font-bold text-teal-300 group-hover:text-teal-200">Dokter (DPJP)</div>
                <div className="text-[10px] text-slate-500 truncate">dr. Andi Sp.PD</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickRoleSelect("nurse")}
                className="p-2 rounded-lg bg-slate-900/80 border border-emerald-500/30 hover:border-emerald-400 text-left text-[11px] transition-all group cursor-pointer"
              >
                <div className="font-bold text-emerald-300 group-hover:text-emerald-200">Perawat / Bidan</div>
                <div className="text-[10px] text-slate-500 truncate">Ns. Siti Rahmawati</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickRoleSelect("pharmacist")}
                className="p-2 rounded-lg bg-slate-900/80 border border-indigo-500/30 hover:border-indigo-400 text-left text-[11px] transition-all group cursor-pointer"
              >
                <div className="font-bold text-indigo-300 group-hover:text-indigo-200">Apoteker</div>
                <div className="text-[10px] text-slate-500 truncate">apt. Farhan S.Farm</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickRoleSelect("cashier")}
                className="p-2 rounded-lg bg-slate-900/80 border border-emerald-500/30 hover:border-emerald-400 text-left text-[11px] transition-all group cursor-pointer"
              >
                <div className="font-bold text-emerald-300 group-hover:text-emerald-200">Kasir Keuangan</div>
                <div className="text-[10px] text-slate-500 truncate">Mega Safitri S.E</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickRoleSelect("registration_staff")}
                className="p-2 rounded-lg bg-slate-900/80 border border-amber-500/30 hover:border-amber-400 text-left text-[11px] transition-all group cursor-pointer"
              >
                <div className="font-bold text-amber-300 group-hover:text-amber-200">Admisi Loket</div>
                <div className="text-[10px] text-slate-500 truncate">Bambang Kurniawan</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
