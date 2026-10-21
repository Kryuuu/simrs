import { Metadata } from "next";
import { PatientRegistrationWizard } from "@/components/patients/patient-registration-wizard";
import { Activity, ShieldCheck, HeartHandshake } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pendaftaran Mandiri Pasien Baru | SIMRS Modern",
  description: "Formulir pendaftaran pasien baru mandiri dan penerbitan Nomor Rekam Medis (No. RM) resmi.",
};

export default function RegisterPasienPage() {
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

      {/* Main Registration Content Container */}
      <main className="max-w-5xl w-full mx-auto my-8">
        <div className="bg-white text-slate-900 rounded-3xl p-6 sm:p-10 shadow-2xl border border-slate-200">
          <PatientRegistrationWizard isPublicKiosk={true} />
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
