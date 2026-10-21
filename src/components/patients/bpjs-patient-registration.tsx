"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  Printer,
  QrCode,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  User,
  HeartPulse,
  Building2,
  Calendar,
  Phone,
  AlertCircle,
  FileCheck2,
} from "lucide-react";
import { useSIMRS } from "@/lib/demo-store";
import { Patient } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { lookupBPJSParticipant, BPJSParticipant, SAMPLE_BPJS_DATABASE } from "@/lib/bpjs-jkn";
import { cn } from "@/lib/utils";

interface BPJSPatientRegistrationProps {
  isPublicKiosk?: boolean;
}

export function BPJSPatientRegistration({ isPublicKiosk = true }: BPJSPatientRegistrationProps) {
  const router = useRouter();
  const { addPatient, hospitalSettings, addQueue } = useSIMRS();

  const [cardNumber, setCardNumber] = useState("0001892837461");
  const [loading, setLoading] = useState(false);
  const [verifiedBPJS, setVerifiedBPJS] = useState<BPJSParticipant | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdPatient, setCreatedPatient] = useState<Patient | null>(null);

  const handleLookup = async (cardToLookup?: string) => {
    const target = (cardToLookup || cardNumber).replace(/\D/g, "");
    if (!target) {
      setErrorMsg("Silakan masukkan Nomor Kartu / Nomor Polis BPJS Anda.");
      return;
    }
    if (target.length < 10) {
      setErrorMsg("Nomor Kartu BPJS harus terdiri dari 13 digit angka.");
      return;
    }

    setErrorMsg(null);
    setLoading(true);
    try {
      const data = await lookupBPJSParticipant(target);
      setVerifiedBPJS(data);
    } catch (err: any) {
      setErrorMsg("Gagal menarik data dari server BPJS: " + (err.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAndRegister = () => {
    if (!verifiedBPJS) return;
    setIsSubmitting(true);

    try {
      const newPatient = addPatient({
        nik: verifiedBPJS.nik,
        full_name: verifiedBPJS.nama,
        gender: verifiedBPJS.jenis_kelamin,
        birth_place: verifiedBPJS.tempat_lahir,
        birth_date: verifiedBPJS.tanggal_lahir,
        blood_type: verifiedBPJS.golongan_darah,
        rhesus: verifiedBPJS.rhesus,
        marital_status: "KAWIN",
        religion: "ISLAM",
        education: "SMA",
        occupation: "Karyawan / Peserta JKN",
        address_street: verifiedBPJS.alamat_jalan,
        address_city: verifiedBPJS.kota,
        address_province: verifiedBPJS.provinsi,
        phone_number: verifiedBPJS.nomor_telepon,
        emergency_contact_name: verifiedBPJS.nama_kontak_darurat,
        emergency_contact_relation: verifiedBPJS.hubungan_darurat,
        emergency_contact_phone: verifiedBPJS.telepon_darurat,
        insurance_type: "BPJS_KESEHATAN",
        insurance_number: verifiedBPJS.nomor_kartu,
        allergies: verifiedBPJS.alergi || [],
      });

      setCreatedPatient(newPatient);
    } catch (err: any) {
      alert("Terjadi kesalahan saat mendaftarkan pasien: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTakeQueueTicket = () => {
    if (!createdPatient) return;
    const ticket = addQueue({
      ticket_number: `A-${Math.floor(100 + Math.random() * 899)}`,
      patient_id: createdPatient.id,
      patient_name: createdPatient.full_name,
      patient_mrn: createdPatient.mrn,
      unit_type: "rawat_jalan",
      clinic_id: "clinic-int",
      clinic_name: "Poli Penyakit Dalam",
      priority: "biasa",
      status: "menunggu",
    });
    alert(
      `Nomor Antrean Pelayanan Berhasil Diterbitkan: ${ticket.ticket_number} (${ticket.clinic_name}). Silakan menuju ruang tunggu poliklinik.`
    );
    if (isPublicKiosk) {
      router.push("/login");
    } else {
      router.push("/registrations");
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold mb-2">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            Jalur Khusus Pasien BPJS Kesehatan (JKN / KIS)
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Pendaftaran Mandiri Pasien BPJS
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Hanya memasukkan <strong>Nomor Kartu / Polis BPJS</strong>. Seluruh data identitas kependudukan, TTL, dan alamat otomatis ditarik dari server BPJS.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/register-pasien"
            className="text-xs text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:border-slate-300 px-3.5 py-2 rounded-lg font-medium transition-all shadow-xs flex items-center gap-1.5"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Ganti Jalur (Umum)
          </Link>
        </div>
      </div>

      {/* Main Content: Not yet registered */}
      {!createdPatient ? (
        <div className="space-y-6">
          {/* Card Input & BPJS Lookup */}
          <div className="bg-linear-to-br from-emerald-50/80 via-white to-teal-50/50 rounded-2xl border-2 border-emerald-300 p-6 sm:p-8 shadow-sm space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0" />
                  Masukkan 13 Digit Nomor Polis / Kartu BPJS Anda
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Sistem SIMRS terhubung langsung dengan bridging vClaim BPJS Kesehatan untuk mencocokkan kepesertaan aktif.
                </p>
              </div>
              <span className="text-[10px] font-mono text-emerald-800 bg-emerald-100/80 px-2.5 py-1 rounded-full border border-emerald-300 font-bold hidden sm:inline shrink-0">
                BRIDGING vCLAIM AKTIF
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Input
                  type="text"
                  maxLength={13}
                  value={cardNumber}
                  onChange={(e) => {
                    setCardNumber(e.target.value.replace(/\D/g, ""));
                    setErrorMsg(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleLookup();
                    }
                  }}
                  placeholder="Contoh: 0001892837461 (13 Digit)"
                  className="h-12 font-mono text-base tracking-widest bg-white border-emerald-300 focus:ring-emerald-500 text-slate-900"
                />
              </div>
              <Button
                type="button"
                onClick={() => handleLookup()}
                disabled={loading || !cardNumber.trim()}
                className="h-12 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 text-sm shadow-md shadow-emerald-700/20 shrink-0 flex items-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <span>Menghubungi BPJS...</span>
                ) : (
                  <>
                    <Search className="h-4 w-4" /> Tarik Data Polis BPJS
                  </>
                )}
              </Button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 animate-fade-in">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Quick Test Sample Numbers */}
            <div className="pt-2 border-t border-emerald-100/80 space-y-2">
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                Atau Klik Contoh Nomor Kartu BPJS Uji Coba:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                {Object.entries(SAMPLE_BPJS_DATABASE).map(([cardNum, p]) => (
                  <button
                    key={cardNum}
                    type="button"
                    onClick={() => {
                      setCardNumber(cardNum);
                      handleLookup(cardNum);
                    }}
                    className={cn(
                      "p-2.5 rounded-xl border text-left transition-all cursor-pointer bg-white hover:bg-emerald-50 shadow-2xs",
                      cardNumber === cardNum && verifiedBPJS?.nomor_kartu === cardNum
                        ? "border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/50"
                        : "border-slate-200 hover:border-emerald-300"
                    )}
                  >
                    <div className="font-mono font-bold text-xs text-emerald-800">{cardNum}</div>
                    <div className="text-[11px] font-semibold text-slate-800 truncate">{p.nama}</div>
                    <div className="text-[10px] text-slate-500 truncate">{p.jenis_peserta}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Verified Participant Card & Auto-Filled Profile */}
          {verifiedBPJS && (
            <div className="bg-white rounded-2xl border-2 border-emerald-400 p-6 sm:p-8 shadow-md space-y-6 animate-scale-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-emerald-100">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">
                      Data Peserta JKN Berhasil Disinkronkan
                    </h3>
                    <p className="text-xs text-emerald-700">
                      Terhubung dengan server BPJS Kesehatan • Status Kepesertaan: <strong>{verifiedBPJS.status_peserta}</strong>
                    </p>
                  </div>
                </div>

                <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300 self-start sm:self-auto">
                  STATUS: {verifiedBPJS.status_peserta}
                </span>
              </div>

              {/* Data Grid: Entire demographic filled from JKN */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                    Nama Lengkap Peserta
                  </span>
                  <span className="text-sm font-bold text-slate-900 block">{verifiedBPJS.nama}</span>
                  <span className="text-[11px] text-slate-500">
                    {verifiedBPJS.jenis_kelamin === "L" ? "Laki-Laki" : "Perempuan"} • Golongan Darah {verifiedBPJS.golongan_darah} ({verifiedBPJS.rhesus})
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                    Nomor Induk Kependudukan (NIK)
                  </span>
                  <span className="text-sm font-bold font-mono text-slate-900 block">{verifiedBPJS.nik}</span>
                  <span className="text-[11px] text-slate-500">
                    TTL: {verifiedBPJS.tempat_lahir}, {verifiedBPJS.tanggal_lahir}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                    Faskes Rujukan & Hak Kelas
                  </span>
                  <span className="text-sm font-bold text-emerald-700 block">{verifiedBPJS.kelas_rawat}</span>
                  <span className="text-[11px] text-slate-500 truncate block">
                    Faskes 1: {verifiedBPJS.faskes_1}
                  </span>
                </div>

                <div className="md:col-span-2 p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                    Alamat KTP / Domisili
                  </span>
                  <span className="text-xs font-medium text-slate-800 block">
                    {verifiedBPJS.alamat_jalan}, Kel. {verifiedBPJS.kelurahan}, Kec. {verifiedBPJS.kecamatan}, {verifiedBPJS.kota}, {verifiedBPJS.provinsi}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                    Kontak Pasien & Kerabat
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-900 block">
                    {verifiedBPJS.nomor_telepon}
                  </span>
                  <span className="text-[11px] text-slate-500 block truncate">
                    Darurat: {verifiedBPJS.nama_kontak_darurat} ({verifiedBPJS.telepon_darurat})
                  </span>
                </div>
              </div>

              {/* Confirmation Notice & 1-Click RM Issuance */}
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="text-xs text-emerald-900 space-y-0.5">
                  <div className="font-bold flex items-center gap-1.5 text-sm">
                    <Sparkles className="h-4 w-4 text-emerald-600" /> Data Lengkap & Siap Diterbitkan
                  </div>
                  <p className="text-[11px] text-emerald-800">
                    Seluruh kolom data telah disesuaikan dengan data resmi BPJS JKN. Anda tidak perlu mengisi formulir panjang.
                  </p>
                </div>

                <Button
                  type="button"
                  onClick={handleConfirmAndRegister}
                  disabled={isSubmitting}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm px-7 py-5 shadow-lg shadow-emerald-700/20 shrink-0 flex items-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <span>Menerbitkan No. RM...</span>
                  ) : (
                    <>
                      <FileCheck2 className="h-4 w-4" /> Konfirmasi & Dapatkan No. RM
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Success Screen: Patient Created & Digital Card Issued */
        <div className="space-y-6 animate-scale-in">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-md space-y-6">
            <div className="text-center max-w-lg mx-auto space-y-2">
              <div className="h-16 w-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Pendaftaran Pasien BPJS Berhasil!
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Nomor Rekam Medis (No. RM) resmi telah diterbitkan secara otomatis dan tersimpan di basis data SIMRS Rumah Sakit.
              </p>
            </div>

            {/* Digital Card Preview */}
            <div className="max-w-md mx-auto rounded-2xl p-6 bg-linear-to-br from-slate-900 via-teal-950 to-slate-900 text-white shadow-2xl border border-teal-500/30 relative overflow-hidden print:border-slate-800 print:text-black print:bg-white">
              <div className="flex items-center justify-between pb-4 border-b border-teal-500/20">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-teal-500 flex items-center justify-center text-white font-black text-sm">
                    RS
                  </div>
                  <div>
                    <h3 className="font-bold text-xs tracking-tight text-white uppercase">
                      {hospitalSettings.hospital_name}
                    </h3>
                    <p className="text-[9px] text-teal-400 font-mono">
                      KARTU BEROBAT PASIEN BPJS DIGITAL
                    </p>
                  </div>
                </div>
                <QrCode className="h-8 w-8 text-teal-300 opacity-90" />
              </div>

              <div className="my-5 space-y-4">
                <div>
                  <span className="text-[10px] text-teal-300/80 font-mono uppercase tracking-wider block">
                    NOMOR REKAM MEDIS (NO. RM)
                  </span>
                  <span className="text-3xl font-black tracking-widest font-mono text-white">
                    {createdPatient.mrn}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                    NAMA LENGKAP PASIEN
                  </span>
                  <span className="text-base font-bold text-white tracking-wide">
                    {createdPatient.full_name}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-teal-500/20">
                  <div>
                    <span className="text-[9px] text-slate-400 block">NIK:</span>
                    <span className="font-mono text-slate-200">{createdPatient.nik}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 block">NO. KARTU BPJS:</span>
                    <span className="font-mono text-emerald-400 font-bold">{createdPatient.insurance_number}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-teal-500/20 flex items-center justify-between text-[10px] text-teal-300/80">
                <span>TERDAFTAR: {new Date().toLocaleDateString("id-ID")}</span>
                <span>STATUS: JKN AKTIF</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => window.print()}
                className="w-full sm:w-auto flex items-center gap-2"
              >
                <Printer className="h-4 w-4" /> Cetak Kartu Pasien
              </Button>

              <Button
                type="button"
                onClick={handleTakeQueueTicket}
                className="w-full sm:w-auto bg-teal-600 hover:bg-teal-500 text-white font-bold flex items-center gap-2 shadow-md shadow-teal-700/20"
              >
                <Sparkles className="h-4 w-4" /> Ambil Antrean Poliklinik Sekarang
              </Button>

              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  if (isPublicKiosk) {
                    router.push("/login");
                  } else {
                    router.push("/patients");
                  }
                }}
                className="w-full sm:w-auto text-slate-600 text-xs"
              >
                Selesai & Keluar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
