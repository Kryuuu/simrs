"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  CreditCard,
  Phone,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Printer,
  QrCode,
  ShieldCheck,
  Building2,
  Calendar,
  HeartPulse,
  Sparkles,
  FileCheck2,
  Share2,
  Search,
  RefreshCw,
  Shield,
  CheckCircle,
} from "lucide-react";
import { useSIMRS } from "@/lib/demo-store";
import { Patient } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { lookupBPJSParticipant, BPJSParticipant, SAMPLE_BPJS_DATABASE } from "@/lib/bpjs-jkn";
import { cn } from "@/lib/utils";

interface PatientWizardProps {
  isPublicKiosk?: boolean;
  initialCategory?: "BPJS_KESEHATAN" | "UMUM";
}

export function PatientRegistrationWizard({ isPublicKiosk = false, initialCategory = "UMUM" }: PatientWizardProps) {
  const router = useRouter();
  const { addPatient, hospitalSettings, addQueue } = useSIMRS();

  const [currentStep, setCurrentStep] = useState(1);
  const [createdPatient, setCreatedPatient] = useState<Patient | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Identitas
    nik: "",
    full_name: "",
    gender: "L" as "L" | "P",
    birth_place: "Makassar",
    birth_date: "1995-05-15",
    blood_type: "O" as "A" | "B" | "AB" | "O" | "TIDAK TAHU",
    rhesus: "+" as "+" | "-",
    marital_status: "KAWIN" as "BELUM KAWIN" | "KAWIN" | "CERAI HIDUP" | "CERAI MATI",
    religion: "ISLAM" as "ISLAM" | "KRISTEN" | "KATOLIK" | "HINDU" | "BUDDHA" | "KONGHUCU" | "LAINNYA",
    education: "S1 / Sarjana",
    occupation: "Karyawan Swasta",

    // Step 2: Kontak & Domisili
    address_street: "",
    address_village: "",
    address_district: "",
    address_city: "Makassar",
    address_province: "Sulawesi Selatan",
    phone_number: "",

    // Step 3: Penjamin
    insurance_type: initialCategory as "UMUM" | "BPJS_KESEHATAN" | "ASURANSI_SWASTA",
    insurance_number: "",

    // Step 4: Kontak Darurat & Alergi
    emergency_contact_name: "",
    emergency_contact_relation: "Suami / Istri",
    emergency_contact_phone: "",
    allergyInput: "",
    allergies: [] as string[],
  });

  // Patient Category Selection: "BPJS_KESEHATAN" vs "UMUM"
  const [patientCategory, setPatientCategory] = useState<"BPJS_KESEHATAN" | "UMUM">(initialCategory);
  const [bpjsCardNumber, setBpjsCardNumber] = useState("0001892837461");
  const [bpjsLookupLoading, setBpjsLookupLoading] = useState(false);
  const [verifiedBPJS, setVerifiedBPJS] = useState<BPJSParticipant | null>(null);

  const handleBPJSLookup = async (cardNumToLookup?: string) => {
    const target = (cardNumToLookup || bpjsCardNumber).replace(/\D/g, "");
    if (!target) {
      alert("Silakan masukkan Nomor Kartu BPJS / Nomor Polis terlebih dahulu.");
      return;
    }
    setBpjsLookupLoading(true);
    try {
      const data = await lookupBPJSParticipant(target);
      setVerifiedBPJS(data);
      // Auto-fill all fields from BPJS JKN policy
      setFormData((prev) => ({
        ...prev,
        nik: data.nik,
        full_name: data.nama,
        gender: data.jenis_kelamin,
        birth_place: data.tempat_lahir,
        birth_date: data.tanggal_lahir,
        blood_type: data.golongan_darah,
        rhesus: data.rhesus,
        address_street: data.alamat_jalan,
        address_village: data.kelurahan,
        address_district: data.kecamatan,
        address_city: data.kota,
        address_province: data.provinsi,
        phone_number: data.nomor_telepon,
        emergency_contact_name: data.nama_kontak_darurat,
        emergency_contact_relation: data.hubungan_darurat,
        emergency_contact_phone: data.telepon_darurat,
        insurance_type: "BPJS_KESEHATAN",
        insurance_number: data.nomor_kartu,
        allergies: data.alergi && data.alergi.length > 0 ? data.alergi : prev.allergies,
      }));
      setErrors({});
    } catch (err: any) {
      alert("Gagal menarik data dari server BPJS: " + err.message);
    } finally {
      setBpjsLookupLoading(false);
    }
  };

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep = (step: number): boolean => {
    const err: Record<string, string> = {};

    if (step === 1) {
      if (patientCategory === "BPJS_KESEHATAN" && !verifiedBPJS && !bpjsCardNumber.trim()) {
        err.bpjs = "Nomor kartu/polis BPJS wajib diisi (13 digit).";
      }

      if (!formData.nik.trim()) {
        err.nik = "NIK Wajib diisi";
      } else if (!/^\d{16}$/.test(formData.nik.trim())) {
        err.nik = "NIK harus terdiri dari 16 digit angka sesuai KTP";
      }

      if (!formData.full_name.trim()) {
        err.full_name = "Nama lengkap wajib diisi";
      }
      if (!formData.birth_place.trim()) {
        err.birth_place = "Tempat lahir wajib diisi";
      }
      if (!formData.birth_date) {
        err.birth_date = "Tanggal lahir wajib diisi";
      }
    }

    if (step === 2) {
      if (!formData.address_street.trim()) {
        err.address_street = "Alamat jalan / RT / RW wajib diisi";
      }
      if (!formData.address_city.trim()) {
        err.address_city = "Kabupaten / Kota wajib diisi";
      }
      if (!formData.phone_number.trim()) {
        err.phone_number = "Nomor Handphone / WhatsApp wajib diisi";
      } else if (!/^\+?[0-9]{9,15}$/.test(formData.phone_number.replace(/\s|-/g, ""))) {
        err.phone_number = "Format nomor handphone tidak valid (min 10 digit)";
      }
    }

    if (step === 3) {
      if (formData.insurance_type !== "UMUM" && !formData.insurance_number.trim()) {
        err.insurance_number = "Nomor kepesertaan asuransi / BPJS wajib diisi";
      }
    }

    if (step === 4) {
      if (!formData.emergency_contact_name.trim()) {
        err.emergency_contact_name = "Nama kontak darurat wajib diisi";
      }
      if (!formData.emergency_contact_phone.trim()) {
        err.emergency_contact_phone = "Nomor kontak darurat wajib diisi";
      }
    }

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleNext = async () => {
    if (currentStep === 1 && patientCategory === "BPJS_KESEHATAN" && !verifiedBPJS) {
      const num = bpjsCardNumber.replace(/\D/g, "");
      if (num.length >= 10) {
        await handleBPJSLookup(num);
        setCurrentStep(2);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      } else {
        setErrors({ bpjs: "Masukkan 13 digit nomor polis / kartu BPJS Anda" });
        return;
      }
    }

    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 5));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAddAllergy = () => {
    if (formData.allergyInput.trim() && !formData.allergies.includes(formData.allergyInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        allergies: [...prev.allergies, prev.allergyInput.trim()],
        allergyInput: "",
      }));
    }
  };

  const handleRemoveAllergy = (allergy: string) => {
    setFormData((prev) => ({
      ...prev,
      allergies: prev.allergies.filter((a) => a !== allergy),
    }));
  };

  const handleSubmit = async () => {
    if (!validateStep(1) || !validateStep(2) || !validateStep(3) || !validateStep(4)) {
      alert("Harap lengkapi semua kolom yang wajib diisi sebelum menyimpan data pasien.");
      return;
    }

    setIsSubmitting(true);
    try {
      const patient = addPatient({
        nik: formData.nik.trim(),
        full_name: formData.full_name.trim().toUpperCase(),
        gender: formData.gender,
        birth_place: formData.birth_place.trim(),
        birth_date: formData.birth_date,
        blood_type: formData.blood_type,
        rhesus: formData.rhesus,
        marital_status: formData.marital_status,
        religion: formData.religion,
        education: formData.education,
        occupation: formData.occupation,
        address_street: formData.address_street.trim(),
        address_village: formData.address_village.trim(),
        address_district: formData.address_district.trim(),
        address_city: formData.address_city.trim(),
        address_province: formData.address_province.trim(),
        phone_number: formData.phone_number.trim(),
        emergency_contact_name: formData.emergency_contact_name.trim(),
        emergency_contact_relation: formData.emergency_contact_relation,
        emergency_contact_phone: formData.emergency_contact_phone.trim(),
        allergies: formData.allergies,
        insurance_type: formData.insurance_type,
        insurance_number: formData.insurance_number.trim() || undefined,
      });

      setCreatedPatient(patient);
      setCurrentStep(6); // Success confirmation step
    } catch (e: any) {
      alert("Terjadi kesalahan saat menyimpan pasien: " + (e.message || "Unknown error"));
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
    alert(`Nomor Antrean Pelayanan Berhasil Diterbitkan: ${ticket.ticket_number} (${ticket.clinic_name}). Silakan menuju ruang tunggu.`);
    if (isPublicKiosk) {
      router.push("/login");
    } else {
      router.push("/registrations");
    }
  };

  // Steps Navigation Meta
  const steps = [
    { num: 1, title: "Identitas Diri", desc: "NIK, Nama, Tempat/Tanggal Lahir" },
    { num: 2, title: "Domisili & Kontak", desc: "Alamat KTP, No. WhatsApp" },
    { num: 3, title: "Penjamin Biaya", desc: "BPJS / Umum / Asuransi Swasta" },
    { num: 4, title: "Kontak & Klinis", desc: "Kerabat Darurat & Riwayat Alergi" },
    { num: 5, title: "Tinjauan Akhir", desc: "Verifikasi Data & Konfirmasi" },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-xs font-semibold mb-2">
            <Sparkles className="h-3.5 w-3.5 text-teal-600" />
            {isPublicKiosk ? "Pendaftaran Mandiri Pasien Baru (Kios Online)" : "Admisi Pasien Baru Rumah Sakit"}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Formulir Pendaftaran Pasien Baru
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Penerbitan Nomor Rekam Medis (No. RM) resmi & Kartu Berobat Digital Rumah Sakit.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isPublicKiosk ? (
            <Link
              href="/login"
              className="text-xs text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:border-slate-300 px-3 py-2 rounded-lg font-medium transition-all shadow-xs"
            >
              Kembali ke Login Petugas
            </Link>
          ) : (
            <Link
              href="/patients"
              className="text-xs text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:border-slate-300 px-3 py-2 rounded-lg font-medium transition-all shadow-xs"
            >
              Kembali ke Daftar Pasien
            </Link>
          )}
        </div>
      </div>

      {/* Step Indicator Progress (Only visible when not yet completed) */}
      {currentStep <= 5 && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-4">
            {steps.map((s) => {
              const isPast = currentStep > s.num;
              const isCurrent = currentStep === s.num;

              return (
                <div
                  key={s.num}
                  className={`flex flex-col p-2.5 rounded-xl border transition-all ${
                    isCurrent
                      ? "border-teal-500 bg-teal-50/60 ring-2 ring-teal-500/20"
                      : isPast
                      ? "border-emerald-200 bg-emerald-50/40"
                      : "border-slate-200 bg-slate-50/50 opacity-60"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                        isCurrent
                          ? "bg-teal-600 text-white"
                          : isPast
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-300 text-slate-700"
                      }`}
                    >
                      {isPast ? <CheckCircle2 className="h-4 w-4" /> : s.num}
                    </div>
                    <span className="text-xs font-bold text-slate-800 truncate">{s.title}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 line-clamp-1 hidden sm:block">
                    {s.desc}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* STEP 1: DATA IDENTITAS DIRI & KEPENDUDUKAN                    */}
      {/* ============================================================ */}
      {currentStep === 1 && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
          {/* Patient Category Selector: BPJS JKN vs Pasien Umum */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 block">
                  Kategori Pasien & Penjamin
                </span>
                <h3 className="text-sm font-bold text-slate-900">
                  Pilih Jenis Pasien: BPJS Kesehatan (JKN) atau Pasien Umum?
                </h3>
              </div>
              <span className="text-[10px] font-mono text-emerald-700 bg-emerald-100/70 px-2.5 py-1 rounded-full border border-emerald-300 font-semibold self-start sm:self-auto">
                ✓ Bridging BPJS Terintegrasi
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Opsi 1: BPJS Kesehatan JKN */}
              <button
                type="button"
                onClick={() => {
                  setPatientCategory("BPJS_KESEHATAN");
                  setFormData((prev) => ({ ...prev, insurance_type: "BPJS_KESEHATAN" }));
                }}
                className={cn(
                  "p-4 rounded-xl border text-left transition-all cursor-pointer relative",
                  patientCategory === "BPJS_KESEHATAN"
                    ? "border-emerald-500 bg-emerald-50/70 ring-2 ring-emerald-500/20 shadow-xs"
                    : "border-slate-200 bg-white hover:bg-slate-100/80"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    <span>Pasien BPJS Kesehatan (JKN / KIS)</span>
                  </div>
                  {patientCategory === "BPJS_KESEHATAN" && (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  Hanya memasukkan nomor kartu/polis BPJS. Seluruh data identitas, TTL & alamat otomatis ditarik dari BPJS.
                </p>
              </button>

              {/* Opsi 2: Pasien Umum */}
              <button
                type="button"
                onClick={() => {
                  setPatientCategory("UMUM");
                  setVerifiedBPJS(null);
                  setFormData((prev) => ({ ...prev, insurance_type: "UMUM", insurance_number: "" }));
                }}
                className={cn(
                  "p-4 rounded-xl border text-left transition-all cursor-pointer relative",
                  patientCategory === "UMUM"
                    ? "border-teal-500 bg-teal-50/70 ring-2 ring-teal-500/20 shadow-xs"
                    : "border-slate-200 bg-white hover:bg-slate-100/80"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-2">
                    <User className="h-4 w-4 text-teal-600" />
                    <span>Pasien Umum / Mandiri (Non-BPJS)</span>
                  </div>
                  {patientCategory === "UMUM" && (
                    <CheckCircle2 className="h-4 w-4 text-teal-600 shrink-0" />
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  Pasien tanpa jaminan BPJS / bayar mandiri langsung di kasir SIMRS. Pengisian formulir secara manual.
                </p>
              </button>
            </div>

            {/* BPJS Polis Lookup Box if BPJS Selected */}
            {patientCategory === "BPJS_KESEHATAN" && (
              <div className="p-4 rounded-xl bg-linear-to-br from-emerald-50 to-teal-50/50 border border-emerald-300 shadow-xs space-y-3 pt-3 mt-2 animate-fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">
                        Masukkan Nomor Polis / Kartu BPJS (13 Digit)
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Sistem akan otomatis mencocokkan data kepesertaan vClaim & mengisi seluruh kolom.
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-bold hidden sm:inline">
                    AUTO-FILL ON
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Input
                      type="text"
                      maxLength={13}
                      value={bpjsCardNumber}
                      onChange={(e) => {
                        setBpjsCardNumber(e.target.value.replace(/\D/g, ""));
                        if (errors.bpjs) {
                          setErrors((prev) => {
                            const next = { ...prev };
                            delete next.bpjs;
                            return next;
                          });
                        }
                      }}
                      placeholder="Contoh: 0001892837461 (13 Digit)"
                      className="font-mono text-sm tracking-widest bg-white border-emerald-300 focus:ring-emerald-500"
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={() => handleBPJSLookup()}
                    disabled={bpjsLookupLoading || !bpjsCardNumber.trim()}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 text-xs shadow-md shadow-emerald-700/20 shrink-0"
                  >
                    {bpjsLookupLoading ? (
                      <span>Menarik Data BPJS...</span>
                    ) : (
                      <span className="flex items-center gap-1.5">
                        <Search className="h-3.5 w-3.5" />
                        Tarik Data Peserta JKN
                      </span>
                    )}
                  </Button>
                </div>
                {errors.bpjs && (
                  <p className="text-[11px] text-red-600 font-semibold">{errors.bpjs}</p>
                )}

                {/* Quick Sample Numbers for Easy Testing */}
                <div className="pt-1">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                    Atau Klik Contoh Nomor Kartu BPJS Uji Coba:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(SAMPLE_BPJS_DATABASE).map(([cardNum, p]) => (
                      <button
                        key={cardNum}
                        type="button"
                        onClick={() => {
                          setBpjsCardNumber(cardNum);
                          handleBPJSLookup(cardNum);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-white border border-emerald-200 hover:border-emerald-400 text-slate-700 text-[11px] font-medium transition-all hover:bg-emerald-50 flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <span className="font-mono font-bold text-emerald-700">{cardNum}</span>
                        <span className="text-slate-500">({p.nama.split(" ")[0]} - {p.jenis_peserta.split(" ")[0]})</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Verified Participant Card */}
                {verifiedBPJS && (
                  <div className="p-4 rounded-xl bg-white border border-emerald-300 shadow-xs space-y-3 mt-3 animate-scale-in">
                    <div className="flex items-center justify-between pb-2 border-b border-emerald-100">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        <span className="font-bold text-xs text-emerald-900">
                          Data Peserta JKN Berhasil Disinkronkan
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                        STATUS: {verifiedBPJS.status_peserta}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Nama Peserta:</span>
                        <span className="font-bold text-slate-900">{verifiedBPJS.nama}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">NIK Terdaftar:</span>
                        <span className="font-mono text-slate-800">{verifiedBPJS.nik}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Faskes 1 (Rujukan):</span>
                        <span className="text-slate-800 font-medium truncate block">{verifiedBPJS.faskes_1}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Hak Kelas Rawat:</span>
                        <span className="font-bold text-emerald-700">{verifiedBPJS.kelas_rawat}</span>
                      </div>
                    </div>

                    <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs border-t border-emerald-100">
                      <span className="text-[11px] text-emerald-700 flex items-center gap-1 font-medium">
                        ✓ Seluruh kolom identitas & domisili di bawah ini telah terisi otomatis.
                      </span>
                      <Button
                        type="button"
                        onClick={() => {
                          setCurrentStep(5);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs self-start sm:self-auto"
                      >
                        Langsung ke Tinjauan & Terbitkan No. RM →
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="h-10 w-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                1. Data Identitas Kependudukan (Sesuai KTP / KK)
              </h2>
              <p className="text-xs text-slate-500">
                {patientCategory === "BPJS_KESEHATAN" && verifiedBPJS
                  ? "Data otomatis terisi dari server BPJS Kesehatan. Anda dapat memeriksa kembali sebelum disimpan."
                  : "Data NIK divalidasi dan dijamin kerahasiaannya sesuai UU Perlindungan Data Pribadi (UU PDP)."}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 text-xs">
            {/* NIK */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="font-semibold text-slate-700 flex items-center justify-between">
                <span>Nomor Induk Kependudukan (NIK 16 Digit) <span className="text-red-500">*</span></span>
                <span className="text-[11px] font-mono text-slate-400">
                  {formData.nik.length}/16 Digit
                </span>
              </label>
              <Input
                type="text"
                maxLength={16}
                value={formData.nik}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "");
                  setFormData({ ...formData, nik: val });
                }}
                placeholder="Contoh: 7371012305950001"
                className={`font-mono text-sm tracking-widest ${errors.nik ? "border-red-500 ring-red-200" : ""}`}
              />
              {errors.nik ? (
                <p className="text-[11px] text-red-600 font-medium">{errors.nik}</p>
              ) : (
                <p className="text-[11px] text-slate-400">
                  Pastikan 16 digit sesuai dengan e-KTP atau Kartu Keluarga pasien.
                </p>
              )}
            </div>

            {/* Nama Lengkap */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="font-semibold text-slate-700">
                Nama Lengkap Pasien (Tanpa Singkatan) <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="Contoh: MUHAMMAD RIZKY PRATAMA"
                className={`uppercase font-medium ${errors.full_name ? "border-red-500" : ""}`}
              />
              {errors.full_name && <p className="text-[11px] text-red-600 font-medium">{errors.full_name}</p>}
            </div>

            {/* Jenis Kelamin */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">
                Jenis Kelamin <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, gender: "L" })}
                  className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                    formData.gender === "L"
                      ? "border-teal-600 bg-teal-50/70 text-teal-900 ring-2 ring-teal-500/20"
                      : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <span>Laki-Laki (L)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, gender: "P" })}
                  className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                    formData.gender === "P"
                      ? "border-teal-600 bg-teal-50/70 text-teal-900 ring-2 ring-teal-500/20"
                      : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <span>Perempuan (P)</span>
                </button>
              </div>
            </div>

            {/* Golongan Darah & Rhesus */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">Golongan Darah & Rhesus</label>
              <div className="flex gap-2">
                <select
                  value={formData.blood_type}
                  onChange={(e) => setFormData({ ...formData, blood_type: e.target.value as any })}
                  className="flex-1 h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                >
                  <option value="A">Golongan A</option>
                  <option value="B">Golongan B</option>
                  <option value="AB">Golongan AB</option>
                  <option value="O">Golongan O</option>
                  <option value="TIDAK TAHU">Tidak Tahu / Belum Cek</option>
                </select>
                <select
                  value={formData.rhesus}
                  onChange={(e) => setFormData({ ...formData, rhesus: e.target.value as any })}
                  className="w-24 h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                >
                  <option value="+">Rh (+)</option>
                  <option value="-">Rh (-)</option>
                </select>
              </div>
            </div>

            {/* Tempat Lahir */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">
                Tempat Lahir <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                value={formData.birth_place}
                onChange={(e) => setFormData({ ...formData, birth_place: e.target.value })}
                placeholder="Contoh: Makassar"
              />
              {errors.birth_place && <p className="text-[11px] text-red-600 font-medium">{errors.birth_place}</p>}
            </div>

            {/* Tanggal Lahir */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">
                Tanggal Lahir <span className="text-red-500">*</span>
              </label>
              <Input
                type="date"
                value={formData.birth_date}
                onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
              />
              {errors.birth_date && <p className="text-[11px] text-red-600 font-medium">{errors.birth_date}</p>}
            </div>

            {/* Agama */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">Agama</label>
              <select
                value={formData.religion}
                onChange={(e) => setFormData({ ...formData, religion: e.target.value as any })}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              >
                <option value="ISLAM">Islam</option>
                <option value="KRISTEN">Kristen Protestan</option>
                <option value="KATOLIK">Katolik</option>
                <option value="HINDU">Hindu</option>
                <option value="BUDDHA">Buddha</option>
                <option value="KONGHUCU">Konghucu</option>
                <option value="LAINNYA">Lainnya</option>
              </select>
            </div>

            {/* Status Pernikahan */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">Status Pernikahan</label>
              <select
                value={formData.marital_status}
                onChange={(e) => setFormData({ ...formData, marital_status: e.target.value as any })}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              >
                <option value="BELUM KAWIN">Belum Kawin</option>
                <option value="KAWIN">Kawin / Menikah</option>
                <option value="CERAI HIDUP">Cerai Hidup</option>
                <option value="CERAI MATI">Cerai Mati</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <Button
              type="button"
              onClick={handleNext}
              className="bg-teal-600 hover:bg-teal-500 text-white px-6 font-semibold flex items-center gap-2"
            >
              Lanjut: Domisili & Kontak <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* STEP 2: DOMISILI & KONTAK                                     */}
      {/* ============================================================ */}
      {currentStep === 2 && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="h-10 w-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
              <Phone className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">2. Kontak & Alamat Domisili Pasien</h2>
              <p className="text-xs text-slate-500">
                Alamat domisili digunakan untuk konfirmasi rujukan faskes dan komunikasi hasil laboratorium.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 text-xs">
            {/* Alamat Jalan */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="font-semibold text-slate-700">
                Alamat Lengkap (Jalan, No. Rumah, RT / RW) <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                value={formData.address_street}
                onChange={(e) => setFormData({ ...formData, address_street: e.target.value })}
                placeholder="Contoh: Jl. Perintis Kemerdekaan KM. 10 No. 45 RT 02 / RW 05"
                className={errors.address_street ? "border-red-500" : ""}
              />
              {errors.address_street && <p className="text-[11px] text-red-600 font-medium">{errors.address_street}</p>}
            </div>

            {/* Kelurahan & Kecamatan */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">Kelurahan / Desa</label>
              <Input
                type="text"
                value={formData.address_village}
                onChange={(e) => setFormData({ ...formData, address_village: e.target.value })}
                placeholder="Contoh: Tamalanrea Indah"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">Kecamatan</label>
              <Input
                type="text"
                value={formData.address_district}
                onChange={(e) => setFormData({ ...formData, address_district: e.target.value })}
                placeholder="Contoh: Tamalanrea"
              />
            </div>

            {/* Kota / Kabupaten */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">
                Kabupaten / Kota <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                value={formData.address_city}
                onChange={(e) => setFormData({ ...formData, address_city: e.target.value })}
                placeholder="Contoh: Kota Makassar"
                className={errors.address_city ? "border-red-500" : ""}
              />
              {errors.address_city && <p className="text-[11px] text-red-600 font-medium">{errors.address_city}</p>}
            </div>

            {/* Provinsi */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">Provinsi</label>
              <Input
                type="text"
                value={formData.address_province}
                onChange={(e) => setFormData({ ...formData, address_province: e.target.value })}
                placeholder="Contoh: Sulawesi Selatan"
              />
            </div>

            {/* Nomor HP / WA */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="font-semibold text-slate-700">
                Nomor Telepon / WhatsApp Aktif <span className="text-red-500">*</span>
              </label>
              <Input
                type="tel"
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                placeholder="Contoh: 081234567890 atau +6281234567890"
                className={errors.phone_number ? "border-red-500 font-mono" : "font-mono"}
              />
              {errors.phone_number ? (
                <p className="text-[11px] text-red-600 font-medium">{errors.phone_number}</p>
              ) : (
                <p className="text-[11px] text-slate-400">
                  Digunakan untuk notifikasi jadwal kontrol, pengingat resep obat, dan konfirmasi BPJS.
                </p>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrev}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" /> Kembali
            </Button>
            <Button
              type="button"
              onClick={handleNext}
              className="bg-teal-600 hover:bg-teal-500 text-white px-6 font-semibold flex items-center gap-2"
            >
              Lanjut: Penjamin Biaya <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* STEP 3: PENJAMIN BIAYA & ASURANSI                            */}
      {/* ============================================================ */}
      {currentStep === 3 && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="h-10 w-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">3. Kategori Penjamin Biaya Pasien</h2>
              <p className="text-xs text-slate-500">
                Pilih metode pembiayaan pelayanan: Pasien Mandiri (Umum), BPJS Kesehatan, atau Asuransi Swasta.
              </p>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            {/* Payment Category Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, insurance_type: "BPJS_KESEHATAN" })}
                className={`p-4 rounded-xl border text-left transition-all relative ${
                  formData.insurance_type === "BPJS_KESEHATAN"
                    ? "border-emerald-500 bg-emerald-50/70 ring-2 ring-emerald-500/20"
                    : "border-slate-200 bg-slate-50 hover:bg-slate-100"
                }`}
              >
                <div className="font-bold text-sm text-slate-900 flex items-center justify-between">
                  <span>BPJS Kesehatan</span>
                  {formData.insurance_type === "BPJS_KESEHATAN" && (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  JKN / KIS PBI & Non-PBI dengan Surat Eligibilitas Peserta (SEP).
                </p>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, insurance_type: "UMUM", insurance_number: "" })}
                className={`p-4 rounded-xl border text-left transition-all relative ${
                  formData.insurance_type === "UMUM"
                    ? "border-teal-500 bg-teal-50/70 ring-2 ring-teal-500/20"
                    : "border-slate-200 bg-slate-50 hover:bg-slate-100"
                }`}
              >
                <div className="font-bold text-sm text-slate-900 flex items-center justify-between">
                  <span>Pasien Umum / Mandiri</span>
                  {formData.insurance_type === "UMUM" && (
                    <CheckCircle2 className="h-4 w-4 text-teal-600" />
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Pembayaran tunai / debit / QRIS langsung di kasir SIMRS.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, insurance_type: "ASURANSI_SWASTA" })}
                className={`p-4 rounded-xl border text-left transition-all relative ${
                  formData.insurance_type === "ASURANSI_SWASTA"
                    ? "border-purple-500 bg-purple-50/70 ring-2 ring-purple-500/20"
                    : "border-slate-200 bg-slate-50 hover:bg-slate-100"
                }`}
              >
                <div className="font-bold text-sm text-slate-900 flex items-center justify-between">
                  <span>Asuransi Swasta / Koorporat</span>
                  {formData.insurance_type === "ASURANSI_SWASTA" && (
                    <CheckCircle2 className="h-4 w-4 text-purple-600" />
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Prudential, Allianz, Mandiri Inhealth, Sinarmas, dll.
                </p>
              </button>
            </div>

            {/* Conditional Insurance Number Input */}
            {formData.insurance_type !== "UMUM" && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 mt-4">
                <label className="font-semibold text-slate-800 block">
                  Nomor Kartu {formData.insurance_type === "BPJS_KESEHATAN" ? "BPJS Kesehatan / KIS (13 Digit)" : "Polis Asuransi Swasta"} <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  value={formData.insurance_number}
                  onChange={(e) => setFormData({ ...formData, insurance_number: e.target.value })}
                  placeholder={formData.insurance_type === "BPJS_KESEHATAN" ? "Contoh: 0001234567890" : "Contoh: POLIS-PRU-992120"}
                  className={`font-mono text-xs ${errors.insurance_number ? "border-red-500" : ""}`}
                />
                {errors.insurance_number && (
                  <p className="text-[11px] text-red-600 font-medium">{errors.insurance_number}</p>
                )}
                {formData.insurance_type === "BPJS_KESEHATAN" && (
                  <div className="space-y-1.5 mt-2">
                    {verifiedBPJS && (
                      <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                          <span>
                            Peserta JKN Terverifikasi: <strong>{verifiedBPJS.nama}</strong> ({verifiedBPJS.kelas_rawat}) • Faskes: {verifiedBPJS.faskes_1}
                          </span>
                        </div>
                        <span className="font-bold text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                          {verifiedBPJS.status_peserta}
                        </span>
                      </div>
                    )}
                    <div className="inline-flex items-center gap-1.5 text-[11px] text-emerald-700 bg-emerald-100/60 px-2.5 py-1 rounded-md">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Sistem SIMRS siap bridging vClaim BPJS Kesehatan secara otomatis saat penerbitan SEP.
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrev}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" /> Kembali
            </Button>
            <Button
              type="button"
              onClick={handleNext}
              className="bg-teal-600 hover:bg-teal-500 text-white px-6 font-semibold flex items-center gap-2"
            >
              Lanjut: Kontak Darurat & Alergi <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* STEP 4: KONTAK DARURAT & ALERGI KLINIS                        */}
      {/* ============================================================ */}
      {currentStep === 4 && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="h-10 w-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
              <HeartPulse className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">4. Kontak Darurat & Catatan Alergi Pasien</h2>
              <p className="text-xs text-slate-500">
                Penting untuk keselamatan pasien (Patient Safety) saat penanganan darurat dan telaah resep farmasi.
              </p>
            </div>
          </div>

          <div className="space-y-6 text-xs">
            {/* Emergency Contact Group */}
            <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200 space-y-4">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <Phone className="h-4 w-4 text-teal-600" /> Kontak Kerabat / Keluarga Darurat
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700">
                    Nama Kerabat <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    value={formData.emergency_contact_name}
                    onChange={(e) => setFormData({ ...formData, emergency_contact_name: e.target.value })}
                    placeholder="Contoh: Siti Aisyah"
                    className={errors.emergency_contact_name ? "border-red-500" : ""}
                  />
                  {errors.emergency_contact_name && (
                    <p className="text-[11px] text-red-600 font-medium">{errors.emergency_contact_name}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700">Hubungan Keluarga</label>
                  <select
                    value={formData.emergency_contact_relation}
                    onChange={(e) => setFormData({ ...formData, emergency_contact_relation: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  >
                    <option value="Suami / Istri">Suami / Istri</option>
                    <option value="Orang Tua (Ayah / Ibu)">Orang Tua (Ayah / Ibu)</option>
                    <option value="Anak Kandung">Anak Kandung</option>
                    <option value="Saudara Kandung">Saudara Kandung</option>
                    <option value="Wali / Kerabat Dekat">Wali / Kerabat Dekat</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700">
                    Nomor Telepon Darurat <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="tel"
                    value={formData.emergency_contact_phone}
                    onChange={(e) => setFormData({ ...formData, emergency_contact_phone: e.target.value })}
                    placeholder="081987654321"
                    className={errors.emergency_contact_phone ? "border-red-500 font-mono" : "font-mono"}
                  />
                  {errors.emergency_contact_phone && (
                    <p className="text-[11px] text-red-600 font-medium">{errors.emergency_contact_phone}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Clinical Allergies Tagging */}
            <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-amber-900 text-sm flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600" /> Riwayat Alergi Obat & Makanan
                  </h3>
                  <p className="text-[11px] text-amber-700 mt-0.5">
                    Alergi akan ditampilkan mencolok sebagai peringatan klinis merah di EMR dokter dan telaah resep apoteker.
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Input
                  type="text"
                  value={formData.allergyInput}
                  onChange={(e) => setFormData({ ...formData, allergyInput: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddAllergy();
                    }
                  }}
                  placeholder="Ketik alergi (contoh: Amoxicillin, Paracetamol, Seafood, Penicillin) lalu klik Tambah"
                  className="bg-white"
                />
                <Button
                  type="button"
                  onClick={handleAddAllergy}
                  className="bg-amber-600 hover:bg-amber-500 text-white shrink-0"
                >
                  Tambah Alergi
                </Button>
              </div>

              {formData.allergies.length > 0 ? (
                <div className="flex flex-wrap gap-2 pt-2">
                  {formData.allergies.map((allergy) => (
                    <span
                      key={allergy}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 border border-red-300 text-red-800 text-xs font-semibold"
                    >
                      <AlertTriangle className="h-3 w-3 text-red-600" />
                      {allergy}
                      <button
                        type="button"
                        onClick={() => handleRemoveAllergy(allergy)}
                        className="text-red-500 hover:text-red-700 ml-1 font-bold"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-slate-500 italic">
                  Belum ada alergi yang dicatat. Pasien dinyatakan tidak memiliki riwayat alergi obat berbahaya.
                </p>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrev}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" /> Kembali
            </Button>
            <Button
              type="button"
              onClick={handleNext}
              className="bg-teal-600 hover:bg-teal-500 text-white px-6 font-semibold flex items-center gap-2"
            >
              Lanjut: Tinjauan Akhir <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* STEP 5: TINJAUAN AKHIR & KONFIRMASI PENERBITAN NO. RM        */}
      {/* ============================================================ */}
      {currentStep === 5 && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="h-10 w-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
              <FileCheck2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">5. Tinjauan Data & Penerbitan No. Rekam Medis (RM)</h2>
              <p className="text-xs text-slate-500">
                Periksa kembali data pasien sebelum disimpan ke sistem rekam medis rumah sakit.
              </p>
            </div>
          </div>

          {/* Review Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="font-bold text-slate-900 uppercase tracking-wider text-[11px] text-teal-700">
                Data Kependudukan
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">NIK:</span>
                <span className="font-mono font-bold text-slate-900">{formData.nik}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Nama Lengkap:</span>
                <span className="font-bold text-slate-900">{formData.full_name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Jenis Kelamin:</span>
                <span>{formData.gender === "L" ? "Laki-Laki" : "Perempuan"}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">TTL:</span>
                <span>{formData.birth_place}, {formData.birth_date}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Golongan Darah:</span>
                <span className="font-bold text-teal-700">{formData.blood_type} ({formData.rhesus})</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="font-bold text-slate-900 uppercase tracking-wider text-[11px] text-teal-700">
                Kontak & Jaminan Kesehatan
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">No. WhatsApp / HP:</span>
                <span className="font-mono font-bold text-slate-900">{formData.phone_number}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Domisili:</span>
                <span className="text-right text-slate-800">{formData.address_street}, {formData.address_city}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Penjamin:</span>
                <span className="font-bold text-emerald-700">{formData.insurance_type.replace("_", " ")}</span>
              </div>
              {formData.insurance_number && (
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">No. Kartu:</span>
                  <span className="font-mono font-bold text-slate-900">{formData.insurance_number}</span>
                </div>
              )}
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Kontak Darurat:</span>
                <span>{formData.emergency_contact_name} ({formData.emergency_contact_relation}) - {formData.emergency_contact_phone}</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 text-teal-600 shrink-0 mt-0.5" />
            <div className="text-xs">
              <div className="font-bold">Konfirmasi Pernyataan Pasien</div>
              <p className="text-[11px] text-teal-800 mt-0.5">
                Dengan menekan tombol konfirmasi di bawah ini, data pasien akan didaftarkan ke basis data SIMRS rumah sakit dan langsung diterbitkan Nomor Rekam Medis (No. RM) permanen.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrev}
              disabled={isSubmitting}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" /> Kembali
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 font-bold shadow-lg shadow-emerald-700/20 flex items-center gap-2"
            >
              {isSubmitting ? (
                <span>Menyimpan ke SIMRS...</span>
              ) : (
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" /> Konfirmasi & Terbitkan No. RM
                </span>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* STEP 6: SUKSES & CETAK KARTU PASIEN DIGITAL                  */}
      {/* ============================================================ */}
      {currentStep === 6 && createdPatient && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-md space-y-6">
            <div className="text-center max-w-lg mx-auto space-y-2">
              <div className="h-16 w-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Pendaftaran Pasien Baru Berhasil!
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Nomor Rekam Medis (No. RM) resmi telah diterbitkan secara otomatis dan tersimpan di database SIMRS.
              </p>
            </div>

            {/* Digital Patient Card for Printing */}
            <div className="max-w-md mx-auto rounded-2xl p-6 bg-linear-to-br from-slate-900 via-teal-950 to-slate-900 text-white shadow-2xl border border-teal-500/30 relative overflow-hidden print:border-slate-800 print:text-black print:bg-white">
              {/* Watermark / Hospital Emblem */}
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
                      KARTU BEROBAT PASIEN DIGITAL
                    </p>
                  </div>
                </div>
                <QrCode className="h-8 w-8 text-teal-300 opacity-90" />
              </div>

              {/* Patient Core Credentials */}
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
                    <span className="font-mono text-[11px] text-slate-200">{createdPatient.nik}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 block">TTL:</span>
                    <span className="text-[11px] text-slate-200">{createdPatient.birth_date}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 block">PENJAMIN:</span>
                    <span className="text-[11px] font-bold text-emerald-400">{createdPatient.insurance_type.replace("_", " ")}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 block">GOL. DARAH:</span>
                    <span className="text-[11px] font-bold text-teal-300">{createdPatient.blood_type || "-"} ({createdPatient.rhesus || "+"})</span>
                  </div>
                </div>
              </div>

              {/* Barcode & Footer Notice */}
              <div className="pt-3 border-t border-teal-500/20 flex items-center justify-between text-[9px] text-slate-400">
                <span className="font-mono">VALIDASI RESMI SIMRS</span>
                <span className="font-mono">{new Date().toLocaleDateString("id-ID")}</span>
              </div>
            </div>

            {/* Quick Actions after registration */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => window.print()}
                className="w-full sm:w-auto text-xs font-semibold flex items-center justify-center gap-2 border-slate-300"
              >
                <Printer className="h-4 w-4" /> Cetak Kartu Pasien (Print)
              </Button>

              <Button
                type="button"
                onClick={handleTakeQueueTicket}
                className="w-full sm:w-auto text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white flex items-center justify-center gap-2 shadow-md shadow-teal-700/20"
              >
                <HeartPulse className="h-4 w-4" /> Ambil Antrean Poli Rawat Jalan
              </Button>

              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setCreatedPatient(null);
                  setCurrentStep(1);
                  setFormData({
                    nik: "",
                    full_name: "",
                    gender: "L",
                    birth_place: "Makassar",
                    birth_date: "1995-05-15",
                    blood_type: "O",
                    rhesus: "+",
                    marital_status: "KAWIN",
                    religion: "ISLAM",
                    education: "S1 / Sarjana",
                    occupation: "Karyawan Swasta",
                    address_street: "",
                    address_village: "",
                    address_district: "",
                    address_city: "Makassar",
                    address_province: "Sulawesi Selatan",
                    phone_number: "",
                    insurance_type: "BPJS_KESEHATAN",
                    insurance_number: "",
                    emergency_contact_name: "",
                    emergency_contact_relation: "Suami / Istri",
                    emergency_contact_phone: "",
                    allergyInput: "",
                    allergies: [],
                  });
                }}
                className="w-full sm:w-auto text-xs text-slate-600 hover:text-slate-900"
              >
                + Daftarkan Pasien Baru Lainnya
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
