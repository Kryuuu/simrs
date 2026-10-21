"use client";

import React, { useState } from "react";
import {
  BedDouble,
  DoorOpen,
  ArrowRightLeft,
  UserCheck,
  UserMinus,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  Building,
  Filter,
} from "lucide-react";
import { useSIMRS } from "@/lib/demo-store";
import { Bed, Room } from "@/types";
import { formatCurrency, formatTime, formatDate } from "@/lib/formatters";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";

export default function InpatientPage() {
  const {
    currentUser,
    rooms,
    beds,
    admissions,
    patients,
    doctorSchedules,
    admitPatient,
    dischargePatient,
    transferBed,
    updateBedStatus,
  } = useSIMRS();

  const [selectedClass, setSelectedClass] = useState<string>("ALL");
  const [admitModalOpen, setAdmitModalOpen] = useState(false);
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [dischargeModalOpen, setDischargeModalOpen] = useState(false);

  const [targetBed, setTargetBed] = useState<Bed | null>(null);
  const [targetAdmissionId, setTargetAdmissionId] = useState<string>("");

  // Admit form state
  const [patientId, setPatientId] = useState("");
  const [bedId, setBedId] = useState("");
  const [initialDiagnosis, setInitialDiagnosis] = useState("");
  const [selectedDoctorName, setSelectedDoctorName] = useState("dr. Andi Makassau, Sp.PD, K-GEH");

  // Transfer form state
  const [newBedId, setNewBedId] = useState("");

  const filteredBeds = beds.filter((b) => {
    if (selectedClass === "ALL") return true;
    return b.room_class === selectedClass;
  });

  const totalBedsCount = beds.length;
  const occupiedBedsCount = beds.filter((b) => b.status === "TERISI").length;
  const availableBedsCount = beds.filter((b) => b.status === "TERSEDIA").length;
  const cleaningBedsCount = beds.filter((b) => b.status === "DIBERSIHKAN").length;
  const bor = totalBedsCount > 0 ? Math.round((occupiedBedsCount / totalBedsCount) * 100) : 0;

  const handleAdmitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const patient = patients.find((p) => p.id === patientId);
    const bed = beds.find((b) => b.id === (targetBed?.id || bedId));
    if (!patient || !bed) {
      alert("Harap pilih pasien dan tempat tidur yang tersedia.");
      return;
    }

    if (bed.status !== "TERSEDIA") {
      alert("Tempat tidur ini sedang tidak tersedia atau terisi!");
      return;
    }

    const room = rooms.find((r) => r.id === bed.room_id);

    admitPatient({
      registration_id: `reg-${Date.now()}`,
      patient_id: patient.id,
      patient_name: patient.full_name,
      patient_mrn: patient.mrn,
      primary_doctor_id: "user-doctor-1",
      primary_doctor_name: selectedDoctorName,
      room_id: bed.room_id,
      room_name: room?.name || "Bangsal Rawat Inap",
      bed_id: bed.id,
      bed_number: bed.bed_number,
      initial_diagnosis: initialDiagnosis || "Observasi Klinis Rawat Inap",
      status: "aktif",
      notes: "Pasien diterima di bangsal dan orientasi ruangan selesai.",
    });

    setAdmitModalOpen(false);
    setTargetBed(null);
    setPatientId("");
    setInitialDiagnosis("");
  };

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const chosenBed = beds.find((b) => b.id === newBedId);
    if (!chosenBed || chosenBed.status !== "TERSEDIA") {
      alert("Tempat tidur tujuan harus berstatus TERSEDIA.");
      return;
    }

    const room = rooms.find((r) => r.id === chosenBed.room_id);

    transferBed(
      targetAdmissionId,
      chosenBed.id,
      chosenBed.room_id,
      room?.name || "Bangsal Rawat Inap",
      chosenBed.bed_number
    );

    setTransferModalOpen(false);
    setTargetAdmissionId("");
    setNewBedId("");
    alert("Mutasi tempat tidur pasien berhasil dilakukan.");
  };

  const handleDischargeConfirm = () => {
    if (!targetAdmissionId) return;
    dischargePatient(targetAdmissionId);
    setDischargeModalOpen(false);
    setTargetAdmissionId("");
    alert("Pasien berhasil dipulangkan. Tempat tidur dialihkan ke status DIBERSIHKAN.");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BedDouble className="h-5 w-5 text-teal-600" />
            Manajemen Rawat Inap & Tempat Tidur
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Peta ketersediaan bed interaktif, penerimaan pasien, mutasi kamar, dan pencegahan double-booking.
          </p>
        </div>

        <Button
          onClick={() => {
            setTargetBed(null);
            setAdmitModalOpen(true);
          }}
          className="bg-teal-600 hover:bg-teal-700 text-white shadow-xs self-start sm:self-auto"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Admisi Pasien Masuk Bed
        </Button>
      </div>

      {/* Bed Census Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-slate-200/90 shadow-2xs">
          <CardContent className="p-4">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Total Kapasitas Bed
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-1">{totalBedsCount} Bed</div>
            <div className="text-[11px] text-teal-600 font-medium mt-0.5">BOR Terkini: {bor}%</div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/90 shadow-2xs bg-emerald-50/30">
          <CardContent className="p-4">
            <div className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider">
              Bed Tersedia (Ready)
            </div>
            <div className="text-2xl font-bold text-emerald-700 mt-1">{availableBedsCount} Bed</div>
            <div className="text-[11px] text-emerald-600 mt-0.5">Siap menerima pasien baru</div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/90 shadow-2xs bg-blue-50/30">
          <CardContent className="p-4">
            <div className="text-[11px] font-semibold text-blue-800 uppercase tracking-wider">
              Bed Terisi (Occupied)
            </div>
            <div className="text-2xl font-bold text-blue-700 mt-1">{occupiedBedsCount} Bed</div>
            <div className="text-[11px] text-blue-600 mt-0.5">Sedang dalam perawatan</div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/90 shadow-2xs bg-amber-50/30">
          <CardContent className="p-4">
            <div className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider">
              Dibersihkan / Sanitasi
            </div>
            <div className="text-2xl font-bold text-amber-700 mt-1">{cleaningBedsCount} Bed</div>
            <div className="text-[11px] text-amber-600 mt-0.5">Proses desinfeksi kamar</div>
          </CardContent>
        </Card>
      </div>

      {/* Class Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-400 font-medium shrink-0 flex items-center gap-1">
          <Filter className="h-3 w-3" /> Kelas Kamar:
        </span>
        {["ALL", "VVIP", "VIP", "KELAS_1", "KELAS_2", "KELAS_3", "ICU"].map((cls) => (
          <button
            key={cls}
            onClick={() => setSelectedClass(cls)}
            className={`px-3 py-1.5 rounded-md border font-medium transition-all ${
              selectedClass === cls
                ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            {cls === "ALL" ? "Semua Kelas" : cls.replace("_", " ")}
          </button>
        ))}
      </div>

      {/* Visual Bed Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredBeds.map((bed) => {
          const room = rooms.find((r) => r.id === bed.room_id);
          const admission = admissions.find((a) => a.bed_id === bed.id && a.status === "aktif");

          const isAvailable = bed.status === "TERSEDIA";
          const isOccupied = bed.status === "TERISI";
          const isCleaning = bed.status === "DIBERSIHKAN";

          return (
            <div
              key={bed.id}
              className={`rounded-xl border p-4 transition-all relative flex flex-col justify-between ${
                isAvailable
                  ? "bg-white border-emerald-300 hover:border-emerald-500 hover:shadow-md"
                  : isOccupied
                  ? "bg-white border-slate-300 shadow-xs"
                  : "bg-amber-50/40 border-amber-300"
              }`}
            >
              <div>
                {/* Header Bed Card */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
                  <div>
                    <span className="font-bold text-sm text-slate-900">{bed.bed_number}</span>
                    <span className="text-[11px] text-slate-500 block truncate">
                      {room?.name || bed.room_number}
                    </span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      isAvailable
                        ? "bg-emerald-100 text-emerald-800"
                        : isOccupied
                        ? "bg-blue-100 text-blue-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {bed.status}
                  </span>
                </div>

                {/* Body Content */}
                {isOccupied && (
                  <div className="space-y-1.5 my-2 text-xs">
                    <div className="font-semibold text-slate-900 truncate">
                      {bed.patient_name || admission?.patient_name}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      RM: {bed.patient_mrn || admission?.patient_mrn}
                    </div>
                    {admission && (
                      <div className="text-[11px] text-slate-600 line-clamp-1 italic">
                        {admission.initial_diagnosis}
                      </div>
                    )}
                    <div className="text-[10px] text-slate-400 font-mono">
                      Tarif: {formatCurrency(bed.tariff_per_night)} / malam
                    </div>
                  </div>
                )}

                {isAvailable && (
                  <div className="py-4 text-center">
                    <p className="text-xs text-emerald-700 font-medium">Tempat Tidur Siap Digunakan</p>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                      Tarif: {formatCurrency(bed.tariff_per_night)} / malam
                    </p>
                  </div>
                )}

                {isCleaning && (
                  <div className="py-4 text-center">
                    <p className="text-xs text-amber-700 font-medium">Sedang Dibersihkan</p>
                    <button
                      onClick={() => updateBedStatus(bed.id, "TERSEDIA")}
                      className="mt-2 text-[10px] text-teal-700 font-semibold underline cursor-pointer"
                    >
                      Tandai Sudah Selesai Dibersihkan
                    </button>
                  </div>
                )}
              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-1 text-xs">
                {isAvailable && (
                  <Button
                    size="sm"
                    onClick={() => {
                      setTargetBed(bed);
                      setAdmitModalOpen(true);
                    }}
                    className="w-full h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <UserCheck className="h-3.5 w-3.5 mr-1" /> Admisi Pasien
                  </Button>
                )}

                {isOccupied && admission && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setTargetAdmissionId(admission.id);
                        setTransferModalOpen(true);
                      }}
                      className="h-7 text-xs flex-1 border-slate-200 hover:bg-slate-50"
                      title="Mutasi / Pindah Tempat Tidur"
                    >
                      <ArrowRightLeft className="h-3 w-3 mr-1" /> Mutasi
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        setTargetAdmissionId(admission.id);
                        setDischargeModalOpen(true);
                      }}
                      className="h-7 text-xs flex-1 bg-red-600 hover:bg-red-700"
                      title="Pulangkan Pasien (Discharge)"
                    >
                      <UserMinus className="h-3 w-3 mr-1" /> Pulang
                    </Button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Admisi Pasien Masuk Bed */}
      <Modal
        isOpen={admitModalOpen}
        onClose={() => setAdmitModalOpen(false)}
        title="Admisi Masuk Pasien Rawat Inap"
        description="Tempatkan pasien terdaftar ke tempat tidur yang berstatus TERSEDIA."
        maxWidth="lg"
      >
        <form onSubmit={handleAdmitSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Pilih Pasien Terdaftar *</label>
            <select
              required
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              className="w-full h-9 px-3 rounded-md border border-slate-200 bg-white text-xs"
            >
              <option value="">-- Pilih Pasien --</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  [{p.mrn}] {p.full_name} • NIK: {p.nik} • {p.insurance_type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Pilih Tempat Tidur (Hanya yang Tersedia) *
            </label>
            {targetBed ? (
              <div className="p-2.5 rounded border border-emerald-200 bg-emerald-50 text-emerald-900 font-medium">
                {targetBed.bed_number} - {rooms.find((r) => r.id === targetBed.room_id)?.name} (Kelas:{" "}
                {targetBed.room_class})
              </div>
            ) : (
              <select
                required
                value={bedId}
                onChange={(e) => setBedId(e.target.value)}
                className="w-full h-9 px-3 rounded-md border border-slate-200 bg-white text-xs"
              >
                <option value="">-- Pilih Bed Kosong --</option>
                {beds
                  .filter((b) => b.status === "TERSEDIA")
                  .map((b) => {
                    const r = rooms.find((room) => room.id === b.room_id);
                    return (
                      <option key={b.id} value={b.id}>
                        {b.bed_number} - {r?.name} (Kelas {b.room_class}) - {formatCurrency(b.tariff_per_night)}
                        /malam
                      </option>
                    );
                  })}
              </select>
            )}
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Dokter Penanggung Jawab (DPJP) *</label>
            <select
              value={selectedDoctorName}
              onChange={(e) => setSelectedDoctorName(e.target.value)}
              className="w-full h-9 px-3 rounded-md border border-slate-200 bg-white text-xs"
            >
              <option value="dr. Andi Makassau, Sp.PD, K-GEH">dr. Andi Makassau, Sp.PD, K-GEH (Penyakit Dalam)</option>
              <option value="dr. Citra Lestari, Sp.A, M.Biomed">dr. Citra Lestari, Sp.A, M.Biomed (Anak)</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Diagnosis Awal Masuk *</label>
            <Input
              required
              placeholder="Contoh: I10 - Hipertensi Krisis dengan Dehidrasi"
              value={initialDiagnosis}
              onChange={(e) => setInitialDiagnosis(e.target.value)}
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setAdmitModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" size="sm" className="bg-teal-600 hover:bg-teal-700 text-white">
              Konfirmasi Admisi
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Mutasi / Pindah Tempat Tidur */}
      <Modal
        isOpen={transferModalOpen}
        onClose={() => setTransferModalOpen(false)}
        title="Mutasi / Pindah Kamar Pasien"
        description="Pindahkan pasien ke kamar atau tempat tidur lain yang kosong."
        maxWidth="md"
      >
        <form onSubmit={handleTransferSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Pilih Tempat Tidur Tujuan *</label>
            <select
              required
              value={newBedId}
              onChange={(e) => setNewBedId(e.target.value)}
              className="w-full h-9 px-3 rounded-md border border-slate-200 bg-white text-xs"
            >
              <option value="">-- Pilih Bed Kosong --</option>
              {beds
                .filter((b) => b.status === "TERSEDIA")
                .map((b) => {
                  const r = rooms.find((room) => room.id === b.room_id);
                  return (
                    <option key={b.id} value={b.id}>
                      {b.bed_number} - {r?.name} ({b.room_class})
                    </option>
                  );
                })}
            </select>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setTransferModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" size="sm" className="bg-teal-600 hover:bg-teal-700 text-white">
              Proses Mutasi Bed
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Konfirmasi Pemulangan (Discharge) */}
      <Modal
        isOpen={dischargeModalOpen}
        onClose={() => setDischargeModalOpen(false)}
        title="Konfirmasi Pemulangan Pasien (Discharge)"
        description="Pasien akan dipulangkan, status perawatan ditutup, dan tempat tidur dialihkan ke pembersihan."
        maxWidth="sm"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-600">
            Apakah Anda yakin ingin menyelesaikan perawatan rawat inap untuk pasien ini? Semua tagihan kamar
            akan difinalisasi di modul Kasir & Billing.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button size="sm" variant="outline" onClick={() => setDischargeModalOpen(false)}>
              Batal
            </Button>
            <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white" onClick={handleDischargeConfirm}>
              Ya, Pulangkan Pasien
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
