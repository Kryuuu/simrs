"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Eye,
  EyeOff,
  AlertTriangle,
  FileText,
  Clock,
  Pill,
  HeartPulse,
  Edit,
  CheckCircle,
  X,
  Phone,
  Shield,
  ShieldCheck,
  User,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { useSIMRS } from "@/lib/demo-store";
import { Patient } from "@/types";
import { maskNIK, formatDate, formatMRN } from "@/lib/formatters";
import { hasPermission } from "@/lib/permissions/rbac";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { lookupBPJSParticipant, BPJSParticipant, SAMPLE_BPJS_DATABASE } from "@/lib/bpjs-jkn";
import { cn } from "@/lib/utils";

export default function PatientsPage() {
  const {
    currentUser,
    patients,
    addPatient,
    updatePatient,
    registrations,
    prescriptions,
    clinicalNotes,
  } = useSIMRS();

  const [search, setSearch] = useState("");
  const [filterInsurance, setFilterInsurance] = useState<string>("ALL");
  const [unmaskedNIKs, setUnmaskedNIKs] = useState<Record<string, boolean>>({});
  const [currentYear, setCurrentYear] = useState(2026);

  React.useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  // Modals state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [activeTab, setActiveTab] = useState<"profil" | "kunjungan" | "resep" | "emr" | "edit">("profil");

  // Patient Category Selection: BPJS JKN vs Pasien Umum
  const [patientCategory, setPatientCategory] = useState<"BPJS_KESEHATAN" | "UMUM">("BPJS_KESEHATAN");
  const [bpjsCardInput, setBpjsCardInput] = useState("0001892837461");
  const [bpjsLoading, setBpjsLoading] = useState(false);
  const [verifiedBPJS, setVerifiedBPJS] = useState<BPJSParticipant | null>(null);

  // New Patient Form State
  const [newPatient, setNewPatient] = useState({
    nik: "",
    full_name: "",
    gender: "L" as "L" | "P",
    birth_date: "1990-01-01",
    birth_place: "Makassar",
    blood_type: "O" as "A" | "B" | "AB" | "O" | "TIDAK TAHU",
    rhesus: "+" as "+" | "-",
    marital_status: "KAWIN" as "BELUM KAWIN" | "KAWIN" | "CERAI HIDUP" | "CERAI MATI",
    religion: "ISLAM" as "ISLAM" | "KRISTEN" | "KATOLIK" | "HINDU" | "BUDDHA" | "KONGHUCU" | "LAINNYA",
    education: "SMA",
    occupation: "Karyawan",
    address_street: "",
    address_city: "Kota Makassar",
    address_province: "Sulawesi Selatan",
    phone_number: "",
    emergency_contact_name: "",
    emergency_contact_relation: "Keluarga",
    emergency_contact_phone: "",
    allergies: "",
    insurance_type: "BPJS_KESEHATAN" as "UMUM" | "BPJS_KESEHATAN" | "ASURANSI_SWASTA",
    insurance_number: "",
  });

  const handleBPJSLookupModal = async (cardNum?: string) => {
    const target = (cardNum || bpjsCardInput).replace(/\D/g, "");
    if (!target) {
      alert("Masukkan nomor kartu/polis BPJS terlebih dahulu");
      return;
    }
    setBpjsLoading(true);
    try {
      const data = await lookupBPJSParticipant(target);
      setVerifiedBPJS(data);
      setNewPatient((prev) => ({
        ...prev,
        nik: data.nik,
        full_name: data.nama,
        gender: data.jenis_kelamin,
        birth_date: data.tanggal_lahir,
        birth_place: data.tempat_lahir,
        blood_type: data.golongan_darah,
        rhesus: data.rhesus,
        address_street: data.alamat_jalan,
        address_city: data.kota,
        address_province: data.provinsi,
        phone_number: data.nomor_telepon,
        emergency_contact_name: data.nama_kontak_darurat,
        emergency_contact_relation: data.hubungan_darurat,
        emergency_contact_phone: data.telepon_darurat,
        insurance_type: "BPJS_KESEHATAN",
        insurance_number: data.nomor_kartu,
        allergies: data.alergi?.join(", ") || prev.allergies,
      }));
    } catch (err: any) {
      alert("Gagal menarik data dari server BPJS: " + err.message);
    } finally {
      setBpjsLoading(false);
    }
  };

  // Duplicate warning detection
  const duplicateByNIK = newPatient.nik
    ? patients.find((p) => p.nik === newPatient.nik)
    : null;
  const duplicateByNameAndDOB = newPatient.full_name && newPatient.birth_date
    ? patients.find(
        (p) =>
          p.full_name.toLowerCase().trim() === newPatient.full_name.toLowerCase().trim() &&
          p.birth_date === newPatient.birth_date
      )
    : null;

  const canCreatePatient = hasPermission(currentUser.role, "patients", "create");
  const canUpdatePatient = hasPermission(currentUser.role, "patients", "update");

  const toggleShowNIK = (id: string) => {
    setUnmaskedNIKs((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredPatients = patients.filter((p) => {
    const matchSearch =
      p.full_name.toLowerCase().includes(search.toLowerCase()) ||
      p.mrn.includes(search) ||
      p.nik.includes(search);
    const matchInsurance =
      filterInsurance === "ALL" || p.insurance_type === filterInsurance;
    return matchSearch && matchInsurance;
  });

  const handleCreatePatientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatient.full_name || !newPatient.nik || !newPatient.phone_number) {
      alert("Harap lengkapi Nama, NIK, dan Nomor Telepon pasien.");
      return;
    }

    const allergiesArray = newPatient.allergies
      ? newPatient.allergies.split(",").map((a) => a.trim()).filter(Boolean)
      : [];

    const created = addPatient({
      ...newPatient,
      allergies: allergiesArray,
    });

    setAddModalOpen(false);
    setSelectedPatient(created);
    setActiveTab("profil");
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="h-5 w-5 text-teal-600" />
            Master Data Pasien & Rekam Medis
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pencarian data pasien terpusat, privasi NIK terlindungi (UU PDP), dan riwayat kunjungan.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <Link
            href="/register-pasien"
            target="_blank"
            className="text-xs font-semibold text-teal-700 hover:text-teal-800 bg-teal-50 border border-teal-200/80 hover:bg-teal-100/70 px-3 py-2 rounded-xl transition-all flex items-center gap-1.5"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Kios Mandiri Pasien
          </Link>

          {canCreatePatient && (
            <>
              <Button
                variant="outline"
                onClick={() => setAddModalOpen(true)}
                className="text-xs border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl"
              >
                Modal Ringkas
              </Button>

              <Link
                href="/patients/register"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md shadow-teal-700/20 transition-all hover:scale-[1.02]"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Registrasi Pasien Baru (Page Lengkap)
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Cari berdasarkan Nama Pasien, No. Rekam Medis (RM), atau NIK..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 flex items-center gap-1 shrink-0">
            <Filter className="h-3.5 w-3.5" /> Penjamin:
          </span>
          <select
            value={filterInsurance}
            onChange={(e) => setFilterInsurance(e.target.value)}
            className="h-9 px-3 rounded-md bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          >
            <option value="ALL">Semua Penjamin</option>
            <option value="BPJS_KESEHATAN">BPJS Kesehatan</option>
            <option value="UMUM">Pasien Umum</option>
            <option value="ASURANSI_SWASTA">Asuransi Swasta</option>
          </select>
        </div>
      </div>

      {/* Patients Table */}
      <Card className="border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/80 text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">No. RM</th>
                <th className="px-4 py-3">Nama Lengkap</th>
                <th className="px-4 py-3">NIK (UU PDP)</th>
                <th className="px-4 py-3">L/P & Usia</th>
                <th className="px-4 py-3">No. Kontak</th>
                <th className="px-4 py-3">Penjamin</th>
                <th className="px-4 py-3">Alergi</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal">
              {filteredPatients.length > 0 ? (
                filteredPatients.map((patient) => {
                  const isUnmasked = Boolean(unmaskedNIKs[patient.id]);
                  return (
                    <tr
                      key={patient.id}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      onClick={() => {
                        setSelectedPatient(patient);
                        setActiveTab("profil");
                      }}
                    >
                      <td className="px-4 py-3.5 font-mono font-bold text-teal-700">
                        {patient.mrn}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-slate-900 group-hover:text-teal-700 transition-colors">
                          {patient.full_name}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Tgl Lahir: {formatDate(patient.birth_date)}
                        </div>
                      </td>
                      <td
                        className="px-4 py-3.5 font-mono text-[11px]"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center gap-1.5">
                          <span>{isUnmasked ? patient.nik : maskNIK(patient.nik)}</span>
                          <button
                            type="button"
                            onClick={() => toggleShowNIK(patient.id)}
                            className="text-slate-400 hover:text-slate-600 p-0.5"
                            title={isUnmasked ? "Sembunyikan NIK" : "Tampilkan NIK Lengkap"}
                          >
                            {isUnmasked ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="font-medium text-slate-800">
                          {patient.gender === "L" ? "Laki-laki" : "Perempuan"}
                        </span>
                        <div className="text-[11px] text-slate-400">
                          {currentYear - Number(patient.birth_date.slice(0, 4))} tahun
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-[11px]">{patient.phone_number}</td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold font-mono border ${
                            patient.insurance_type === "BPJS_KESEHATAN"
                              ? "bg-teal-50 text-teal-700 border-teal-200"
                              : patient.insurance_type === "UMUM"
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : "bg-purple-50 text-purple-700 border-purple-200"
                          }`}
                        >
                          {patient.insurance_type}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        {patient.allergies && patient.allergies.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {patient.allergies.map((allergy, idx) => (
                              <span
                                key={idx}
                                className="px-1.5 py-0.2 rounded text-[10px] bg-red-50 text-red-700 border border-red-200 font-medium"
                              >
                                {allergy}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Tidak ada alergi</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedPatient(patient);
                            setActiveTab("profil");
                          }}
                          className="h-7 text-xs px-2.5 hover:bg-teal-50 hover:text-teal-700 border-slate-200"
                        >
                          Detail Pasien
                        </Button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">
                    Tidak ada pasien yang sesuai dengan filter atau kata kunci.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal: Tambah Pasien Baru */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Registrasi Pasien Baru"
        description="Pendaftaran identitas pasien baru ke basis data master rekam medis."
        maxWidth="3xl"
      >
        <form onSubmit={handleCreatePatientSubmit} className="space-y-4">
          {/* Warning Duplicate Checker */}
          {(duplicateByNIK || duplicateByNameAndDOB) && (
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-start gap-2.5">
              <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold">Potensi Duplikasi Data Terdeteksi:</strong>
                {duplicateByNIK && (
                  <p className="mt-0.5">
                    NIK <strong>{newPatient.nik}</strong> sudah terdaftar atas nama{" "}
                    <strong>{duplicateByNIK.full_name}</strong> (No. RM: {duplicateByNIK.mrn}).
                  </p>
                )}
                {duplicateByNameAndDOB && (
                  <p className="mt-0.5">
                    Pasien dengan nama <strong>{newPatient.full_name}</strong> dan tanggal lahir{" "}
                    <strong>{newPatient.birth_date}</strong> sudah ada di sistem (No. RM:{" "}
                    {duplicateByNameAndDOB.mrn}).
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Patient Category Selector: BPJS JKN vs Pasien Umum */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 block">
                  Kategori Pasien & Penjamin
                </span>
                <span className="text-xs font-bold text-slate-900">
                  Pilih Jenis Pasien: BPJS Kesehatan (JKN) atau Pasien Umum?
                </span>
              </div>
              <span className="text-[10px] font-mono text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full border border-emerald-300 font-semibold">
                ✓ Bridging JKN
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setPatientCategory("BPJS_KESEHATAN");
                  setNewPatient((prev) => ({ ...prev, insurance_type: "BPJS_KESEHATAN" }));
                }}
                className={cn(
                  "p-3 rounded-xl border text-left transition-all cursor-pointer relative",
                  patientCategory === "BPJS_KESEHATAN"
                    ? "border-emerald-500 bg-emerald-50/70 ring-2 ring-emerald-500/20 shadow-xs"
                    : "border-slate-200 bg-white hover:bg-slate-100/80"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    <span>Pasien BPJS Kesehatan (JKN)</span>
                  </div>
                  {patientCategory === "BPJS_KESEHATAN" && (
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                  )}
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Cukup masukkan nomor kartu/polis BPJS, data identitas langsung terisi otomatis.
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPatientCategory("UMUM");
                  setVerifiedBPJS(null);
                  setNewPatient((prev) => ({ ...prev, insurance_type: "UMUM", insurance_number: "" }));
                }}
                className={cn(
                  "p-3 rounded-xl border text-left transition-all cursor-pointer relative",
                  patientCategory === "UMUM"
                    ? "border-teal-500 bg-teal-50/70 ring-2 ring-teal-500/20 shadow-xs"
                    : "border-slate-200 bg-white hover:bg-slate-100/80"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <User className="h-4 w-4 text-teal-600" />
                    <span>Pasien Umum / Mandiri</span>
                  </div>
                  {patientCategory === "UMUM" && (
                    <CheckCircle className="h-3.5 w-3.5 text-teal-600" />
                  )}
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Pasien bayar tunai/mandiri. Pengisian identitas secara manual.
                </p>
              </button>
            </div>

            {/* BPJS Polis Lookup Box if BPJS Selected */}
            {patientCategory === "BPJS_KESEHATAN" && (
              <div className="p-3 rounded-xl bg-linear-to-br from-emerald-50 to-teal-50/40 border border-emerald-300 space-y-2.5 animate-fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                    Masukkan Nomor Polis / Kartu BPJS (13 Digit):
                  </span>
                  <span className="text-[9px] font-mono font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                    AUTO-FILL vClaim
                  </span>
                </div>

                <div className="flex gap-2">
                  <Input
                    type="text"
                    maxLength={13}
                    value={bpjsCardInput}
                    onChange={(e) => setBpjsCardInput(e.target.value.replace(/\D/g, ""))}
                    placeholder="Contoh: 0001892837461 (13 Digit)"
                    className="font-mono text-xs tracking-wider bg-white border-emerald-300"
                  />
                  <Button
                    type="button"
                    onClick={() => handleBPJSLookupModal()}
                    disabled={bpjsLoading || !bpjsCardInput.trim()}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shrink-0"
                  >
                    {bpjsLoading ? "Menarik..." : "Tarik Data BPJS"}
                  </Button>
                </div>

                {/* Sample Buttons */}
                <div className="flex flex-wrap items-center gap-1 text-[10px]">
                  <span className="text-slate-400 font-semibold mr-1">Contoh Cepat:</span>
                  {Object.entries(SAMPLE_BPJS_DATABASE).slice(0, 3).map(([cardNum, p]) => (
                    <button
                      key={cardNum}
                      type="button"
                      onClick={() => {
                        setBpjsCardInput(cardNum);
                        handleBPJSLookupModal(cardNum);
                      }}
                      className="px-2 py-0.5 rounded bg-white border border-emerald-200 text-slate-700 hover:bg-emerald-50 font-mono text-[10px]"
                    >
                      {cardNum} ({p.nama.split(" ")[0]})
                    </button>
                  ))}
                </div>

                {/* Verified Participant Badge */}
                {verifiedBPJS && (
                  <div className="p-2.5 rounded-lg bg-white border border-emerald-300 text-xs space-y-1">
                    <div className="flex items-center justify-between text-emerald-800 font-bold">
                      <span className="flex items-center gap-1">
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-600" /> Data Peserta BPJS Berhasil Ditarik:
                      </span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                        {verifiedBPJS.status_peserta}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-700">
                      <strong>{verifiedBPJS.nama}</strong> • NIK: <span className="font-mono">{verifiedBPJS.nik}</span> • Hak: {verifiedBPJS.kelas_rawat} • Faskes 1: {verifiedBPJS.faskes_1}
                    </div>
                    <p className="text-[10px] text-emerald-700 font-medium">
                      ✓ Seluruh kolom di bawah terisi otomatis dari data polis BPJS JKN.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* NIK */}
            <div>
              <label className="font-semibold text-slate-700 block mb-1 flex items-center justify-between">
                <span>Nomor Induk Kependudukan (NIK 16 Digit) *</span>
                {verifiedBPJS && patientCategory === "BPJS_KESEHATAN" && (
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-medium border border-emerald-200">
                    ✓ Dari Polis JKN
                  </span>
                )}
              </label>
              <Input
                required
                maxLength={16}
                placeholder="Contoh: 7371091508890001"
                value={newPatient.nik}
                onChange={(e) => setNewPatient({ ...newPatient, nik: e.target.value.replace(/\D/g, "") })}
              />
            </div>

            {/* Nama Lengkap */}
            <div>
              <label className="font-semibold text-slate-700 block mb-1 flex items-center justify-between">
                <span>Nama Lengkap Pasien *</span>
                {verifiedBPJS && patientCategory === "BPJS_KESEHATAN" && (
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-medium border border-emerald-200">
                    ✓ Dari Polis JKN
                  </span>
                )}
              </label>
              <Input
                required
                placeholder="Nama lengkap sesuai KTP / Akta"
                value={newPatient.full_name}
                onChange={(e) => setNewPatient({ ...newPatient, full_name: e.target.value })}
              />
            </div>

            {/* Jenis Kelamin */}
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Jenis Kelamin *</label>
              <select
                value={newPatient.gender}
                onChange={(e) => setNewPatient({ ...newPatient, gender: e.target.value as "L" | "P" })}
                className="w-full h-9 px-3 rounded-md border border-slate-200 bg-white text-xs"
              >
                <option value="L">Laki-laki (L)</option>
                <option value="P">Perempuan (P)</option>
              </select>
            </div>

            {/* Tanggal Lahir */}
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Tanggal Lahir *</label>
              <Input
                type="date"
                required
                value={newPatient.birth_date}
                onChange={(e) => setNewPatient({ ...newPatient, birth_date: e.target.value })}
              />
            </div>

            {/* Tempat Lahir */}
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Tempat Lahir</label>
              <Input
                value={newPatient.birth_place}
                onChange={(e) => setNewPatient({ ...newPatient, birth_place: e.target.value })}
              />
            </div>

            {/* Golongan Darah */}
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Golongan Darah</label>
              <select
                value={newPatient.blood_type}
                onChange={(e) =>
                  setNewPatient({ ...newPatient, blood_type: e.target.value as "A" | "B" | "AB" | "O" | "TIDAK TAHU" })
                }
                className="w-full h-9 px-3 rounded-md border border-slate-200 bg-white text-xs"
              >
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="AB">AB</option>
                <option value="O">O</option>
                <option value="TIDAK TAHU">Tidak Tahu</option>
              </select>
            </div>

            {/* Nomor HP */}
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Nomor Telepon / WhatsApp *</label>
              <Input
                required
                placeholder="Contoh: 08123456789"
                value={newPatient.phone_number}
                onChange={(e) => setNewPatient({ ...newPatient, phone_number: e.target.value })}
              />
            </div>

            {/* Penjamin */}
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Jenis Pembiayaan / Penjamin *</label>
              <select
                value={newPatient.insurance_type}
                onChange={(e) =>
                  setNewPatient({ ...newPatient, insurance_type: e.target.value as Patient["insurance_type"] })
                }
                className="w-full h-9 px-3 rounded-md border border-slate-200 bg-white text-xs"
              >
                <option value="BPJS_KESEHATAN">BPJS Kesehatan</option>
                <option value="UMUM">Pasien Umum (Bayar Mandiri)</option>
                <option value="ASURANSI_SWASTA">Asuransi Swasta</option>
              </select>
            </div>

            {/* No Asuransi / BPJS */}
            {newPatient.insurance_type !== "UMUM" && (
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nomor Kartu BPJS / Polis Asuransi</label>
                <Input
                  placeholder="Nomor kartu peserta"
                  value={newPatient.insurance_number}
                  onChange={(e) => setNewPatient({ ...newPatient, insurance_number: e.target.value })}
                />
              </div>
            )}

            {/* Alamat Domisili */}
            <div className="md:col-span-2">
              <label className="font-semibold text-slate-700 block mb-1">Alamat Lengkap KTP / Domisili *</label>
              <Input
                required
                placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan"
                value={newPatient.address_street}
                onChange={(e) => setNewPatient({ ...newPatient, address_street: e.target.value })}
              />
            </div>

            {/* Kontak Darurat */}
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Nama Kontak Darurat</label>
              <Input
                placeholder="Nama keluarga terdekat"
                value={newPatient.emergency_contact_name}
                onChange={(e) => setNewPatient({ ...newPatient, emergency_contact_name: e.target.value })}
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">No. HP Kontak Darurat</label>
              <Input
                placeholder="Nomor HP keluarga"
                value={newPatient.emergency_contact_phone}
                onChange={(e) => setNewPatient({ ...newPatient, emergency_contact_phone: e.target.value })}
              />
            </div>

            {/* Riwayat Alergi */}
            <div className="md:col-span-2">
              <label className="font-semibold text-slate-700 block mb-1">
                Riwayat Alergi Obat / Makanan (Pisahkan dengan koma)
              </label>
              <Input
                placeholder="Contoh: Amoxicillin, Seafood, Debu"
                value={newPatient.allergies}
                onChange={(e) => setNewPatient({ ...newPatient, allergies: e.target.value })}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setAddModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" size="sm" className="bg-teal-600 hover:bg-teal-700 text-white">
              <CheckCircle className="h-4 w-4 mr-1" />
              Simpan & Terbitkan No. RM
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Detail Pasien & EMR Tabs */}
      {selectedPatient && (
        <Modal
          isOpen={Boolean(selectedPatient)}
          onClose={() => setSelectedPatient(null)}
          title={`Detail Pasien: ${selectedPatient.full_name} (${selectedPatient.mrn})`}
          description="Rekam jejak komprehensif, riwayat kunjungan masa lalu, dan catatan klinis."
          maxWidth="4xl"
        >
          {/* Tabs Navigation */}
          <div className="flex items-center gap-1 border-b border-slate-200 pb-2 mb-4 text-xs font-semibold overflow-x-auto">
            <button
              onClick={() => setActiveTab("profil")}
              className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
                activeTab === "profil" ? "bg-teal-600 text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Users className="h-3.5 w-3.5" /> Profil Demografis
            </button>
            <button
              onClick={() => setActiveTab("kunjungan")}
              className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
                activeTab === "kunjungan" ? "bg-teal-600 text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Clock className="h-3.5 w-3.5" /> Riwayat Kunjungan
            </button>
            <button
              onClick={() => setActiveTab("resep")}
              className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
                activeTab === "resep" ? "bg-teal-600 text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Pill className="h-3.5 w-3.5" /> Riwayat Resep Farmasi
            </button>
            <button
              onClick={() => setActiveTab("emr")}
              className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
                activeTab === "emr" ? "bg-teal-600 text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <HeartPulse className="h-3.5 w-3.5" /> Catatan Medis (SOAP)
            </button>
          </div>

          {/* Tab 1: Profil */}
          {activeTab === "profil" && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div>
                  <span className="text-slate-500 block">Nomor Rekam Medis (MRN)</span>
                  <span className="text-sm font-bold font-mono text-teal-700">{selectedPatient.mrn}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Nomor Induk Kependudukan (NIK)</span>
                  <span className="text-sm font-bold font-mono text-slate-800">{selectedPatient.nik}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Penjamin & No. Kartu</span>
                  <span className="text-sm font-semibold text-slate-800">
                    {selectedPatient.insurance_type}{" "}
                    {selectedPatient.insurance_number ? `(${selectedPatient.insurance_number})` : ""}
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 block">Tempat, Tanggal Lahir</span>
                  <span className="font-medium text-slate-800">
                    {selectedPatient.birth_place}, {formatDate(selectedPatient.birth_date)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Golongan Darah & Rhesus</span>
                  <span className="font-medium text-slate-800">
                    {selectedPatient.blood_type} (Rh {selectedPatient.rhesus || "+"})
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Status Perkawinan</span>
                  <span className="font-medium text-slate-800">{selectedPatient.marital_status}</span>
                </div>

                <div className="md:col-span-2">
                  <span className="text-slate-500 block">Alamat Tinggal</span>
                  <span className="font-medium text-slate-800">
                    {selectedPatient.address_street}, {selectedPatient.address_city},{" "}
                    {selectedPatient.address_province}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Kontak Telepon</span>
                  <span className="font-medium font-mono text-slate-800">{selectedPatient.phone_number}</span>
                </div>

                <div>
                  <span className="text-slate-500 block">Kontak Darurat</span>
                  <span className="font-medium text-slate-800">
                    {selectedPatient.emergency_contact_name} ({selectedPatient.emergency_contact_relation})
                  </span>
                  <span className="block font-mono text-[11px] text-slate-500">
                    {selectedPatient.emergency_contact_phone}
                  </span>
                </div>
                <div className="md:col-span-2">
                  <span className="text-slate-500 block">Riwayat Alergi Relevan</span>
                  {selectedPatient.allergies && selectedPatient.allergies.length > 0 ? (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedPatient.allergies.map((al, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded text-[11px] font-semibold bg-red-100 text-red-800 border border-red-200"
                        >
                          {al}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-slate-500 italic">Tidak ada catatan alergi obat/makanan.</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Kunjungan */}
          {activeTab === "kunjungan" && (
            <div className="space-y-3 text-xs">
              {registrations.filter((r) => r.patient_id === selectedPatient.id).length > 0 ? (
                registrations
                  .filter((r) => r.patient_id === selectedPatient.id)
                  .map((reg) => (
                    <div
                      key={reg.id}
                      className="p-3 rounded-lg border border-slate-200 bg-white flex items-center justify-between shadow-2xs"
                    >
                      <div>
                        <div className="font-semibold text-slate-900">
                          {reg.clinic_name || "Instalasi Gawat Darurat (IGD)"}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          No. Reg: <span className="font-mono text-slate-700">{reg.registration_number}</span> • No. Antrean:{" "}
                          <span className="font-mono font-bold text-teal-700">{reg.queue_ticket_number}</span>
                        </div>
                        {reg.doctor_name && (
                          <div className="text-[11px] text-slate-600 mt-0.5">Dokter: {reg.doctor_name}</div>
                        )}
                      </div>
                      <span className="px-2 py-1 rounded text-[10px] font-semibold bg-teal-50 text-teal-700 border border-teal-200">
                        {reg.status.toUpperCase()}
                      </span>
                    </div>
                  ))
              ) : (
                <p className="p-4 text-center text-slate-500">Belum ada catatan kunjungan pendaftaran.</p>
              )}
            </div>
          )}

          {/* Tab 3: Resep */}
          {activeTab === "resep" && (
            <div className="space-y-3 text-xs">
              {prescriptions.filter((p) => p.patient_id === selectedPatient.id).length > 0 ? (
                prescriptions
                  .filter((p) => p.patient_id === selectedPatient.id)
                  .map((rx) => (
                    <div key={rx.id} className="p-3 rounded-lg border border-slate-200 bg-white shadow-2xs">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
                        <span className="font-mono font-bold text-slate-900">{rx.prescription_number}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {rx.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="space-y-1">
                        {rx.items.map((it) => (
                          <div key={it.id} className="flex justify-between text-[11px]">
                            <span>
                              <strong>{it.medication_name}</strong> ({it.quantity} {it.unit}) - {it.frequency}
                            </span>
                            <span className="text-slate-400 font-mono">{it.dispensed_status}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
              ) : (
                <p className="p-4 text-center text-slate-500">Belum ada resep obat tercatat untuk pasien ini.</p>
              )}
            </div>
          )}

          {/* Tab 4: EMR SOAP */}
          {activeTab === "emr" && (
            <div className="space-y-3 text-xs">
              {clinicalNotes.filter((n) => n.patient_id === selectedPatient.id).length > 0 ? (
                clinicalNotes
                  .filter((n) => n.patient_id === selectedPatient.id)
                  .map((note) => (
                    <div key={note.id} className="p-4 rounded-lg border border-slate-200 bg-white space-y-2.5">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <div>
                          <span className="font-semibold text-slate-900">{note.clinic_name || "Rawat Jalan"}</span>
                          <span className="text-[11px] text-slate-500 ml-2">Oleh: {note.doctor_name}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                          {note.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
                        <div>
                          <strong className="text-slate-700 block">S (Subjektif):</strong>
                          <p className="text-slate-600">{note.subjective.chief_complaint}</p>
                        </div>
                        <div>
                          <strong className="text-slate-700 block">O (Objektif):</strong>
                          <p className="text-slate-600">
                            TD: {note.objective.vital_signs.systolic_bp}/{note.objective.vital_signs.diastolic_bp} mmHg, HR:{" "}
                            {note.objective.vital_signs.heart_rate}x/m, Suhu: {note.objective.vital_signs.body_temperature}°C
                          </p>
                        </div>
                        <div className="md:col-span-2">
                          <strong className="text-slate-700 block">A (Asesmen / Diagnosis ICD-10):</strong>
                          <p className="font-semibold text-teal-700">
                            {note.assessment.primary_diagnosis_code} - {note.assessment.primary_diagnosis_name}
                          </p>
                        </div>
                        <div className="md:col-span-2">
                          <strong className="text-slate-700 block">P (Planning / Terapi):</strong>
                          <p className="text-slate-600 whitespace-pre-line">{note.plan.treatment_plan}</p>
                        </div>
                      </div>
                    </div>
                  ))
              ) : (
                <p className="p-4 text-center text-slate-500">Belum ada rekam medis SOAP tercatat.</p>
              )}
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <Button size="sm" variant="outline" onClick={() => setSelectedPatient(null)}>
              Tutup
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
