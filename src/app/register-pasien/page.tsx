import { Metadata } from "next";
import Link from "next/link";
import {
  Activity,
  ShieldCheck,
  User,
  ArrowRight,
  HeartHandshake,
  Sparkles,
  CheckCircle2,
  FileText,
  CreditCard,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Pilih Kategori Pasien | Kios Pendaftaran Mandiri SIMRS",
  description: "Pilih kategori pasien: Pasien Umum atau Pasien BPJS Kesehatan (JKN) sebelum masuk ke formulir pendaftaran.",
};

export default function RegisterPasienSelectionPage() {
  return (
    <div className="min-h-screen bg-linear-to-b from-slate-900 via-slate-950 to-slate-950 text-slate-100 flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8">
      {/* Top Navbar */}
      <header className="max-w-5xl w-full mx-auto flex items-center justify-between pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-lg shadow-teal-600/30">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <span className="font-bold text-white text-base tracking-tight block">
              RSUD Pratama Sehat Mandiri
            </span>
            <span className="text-[11px] text-teal-400 font-mono tracking-wider">
              KIOS PENDAFTARAN PASIEN MANDIRI
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-xs text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700 px-3.5 py-2 rounded-lg font-medium transition-all"
          >
            Portal Petugas Medis
          </Link>
        </div>
      </header>

      {/* Main Choice Screen */}
      <main className="max-w-4xl w-full mx-auto my-10 space-y-8">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5 text-teal-400" />
            Layanan Admisi Mandiri & Penerbitan No. RM Digital
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Pilih Kategori Pasien
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            Sebelum masuk ke portal pendaftaran, silakan tentukan jalur kepesertaan pasien di bawah ini:
          </p>
        </div>

        {/* 2 Big Choice Cards: BPJS JKN vs UMUM */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: BPJS Kesehatan JKN */}
          <div className="group relative rounded-3xl bg-linear-to-b from-slate-900 via-slate-900 to-emerald-950/40 border-2 border-emerald-500/40 hover:border-emerald-400 p-7 sm:p-8 flex flex-col justify-between transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-emerald-900/30">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="h-14 w-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shadow-inner group-hover:bg-emerald-500 group-hover:text-white transition-all">
                  <ShieldCheck className="h-8 w-8" />
                </div>
                <span className="text-[11px] font-mono font-bold text-emerald-300 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
                  vClaim BPJS Aktif
                </span>
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block mb-1">
                  Jalur Jaminan Sosial
                </span>
                <h2 className="text-2xl font-black text-white tracking-tight">
                  Pasien BPJS Kesehatan (JKN)
                </h2>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  Cukup memasukkan <strong>Nomor Polis / Kartu BPJS 13 Digit</strong>. Seluruh identitas kependudukan, TTL, dan alamat langsung disesuaikan otomatis dari server BPJS.
                </p>
              </div>

              <div className="pt-2 space-y-2 border-t border-slate-800 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Hanya input Nomor Kartu BPJS 13 digit</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Data NIK, Nama & Alamat otomatis terisi</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Penerbitan Surat Eligibilitas Peserta (SEP)</span>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <Link
                href="/register-pasien/bpjs"
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm shadow-lg shadow-emerald-950/60 transition-all cursor-pointer group-hover:translate-x-1"
              >
                Masuk Jalur Pasien BPJS <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Card 2: Pasien Umum */}
          <div className="group relative rounded-3xl bg-linear-to-b from-slate-900 via-slate-900 to-teal-950/40 border-2 border-teal-500/30 hover:border-teal-400 p-7 sm:p-8 flex flex-col justify-between transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-teal-900/30">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="h-14 w-14 rounded-2xl bg-teal-500/20 border border-teal-500/40 text-teal-400 flex items-center justify-center shadow-inner group-hover:bg-teal-500 group-hover:text-white transition-all">
                  <User className="h-8 w-8" />
                </div>
                <span className="text-[11px] font-mono font-bold text-teal-300 bg-teal-500/10 px-3 py-1 rounded-full border border-teal-500/30">
                  Bayar Mandiri / Kasir
                </span>
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-teal-400 block mb-1">
                  Jalur Non-BPJS
                </span>
                <h2 className="text-2xl font-black text-white tracking-tight">
                  Pasien Umum / Mandiri
                </h2>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  Untuk pasien tanpa jaminan BPJS. Pengisian data identitas lengkap secara mandiri dan pembayaran biaya pelayanan langsung di kasir rumah sakit.
                </p>
              </div>

              <div className="pt-2 space-y-2 border-t border-slate-800 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-teal-400 shrink-0" />
                  <span>Pengisian formulir identitas kependudukan</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-teal-400 shrink-0" />
                  <span>Tanpa kewajiban nomor kepesertaan BPJS</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-teal-400 shrink-0" />
                  <span>Pembayaran tunai, debit, atau QRIS kasir</span>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <Link
                href="/register-pasien/umum"
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-5 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-extrabold text-sm shadow-lg shadow-teal-950/60 transition-all cursor-pointer group-hover:translate-x-1"
              >
                Masuk Jalur Pasien Umum <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-center text-xs text-slate-400">
          Sudah memiliki Nomor Rekam Medis (No. RM) sebelumnya? Silakan langsung menuju mesin antrean poliklinik atau loket admisi rawat jalan.
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-5xl w-full mx-auto pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-teal-400" />
          <span>Kerahasiaan data dilindungi UU Perlindungan Data Pribadi No. 27/2022</span>
        </div>
        <div className="flex items-center gap-2">
          <HeartHandshake className="h-4 w-4 text-emerald-400" />
          <span>Layanan Cepat Tanggap SIMRS Enterprise</span>
        </div>
      </footer>
    </div>
  );
}
