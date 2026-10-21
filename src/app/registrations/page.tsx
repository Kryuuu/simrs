"use client";

import React, { useState } from "react";
import {
  ClipboardList,
  Volume2,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Printer,
  PlusCircle,
  UserCheck,
  Stethoscope,
  Siren,
  Search,
} from "lucide-react";
import { useSIMRS } from "@/lib/demo-store";
import { QUEUE_STATUS_INFO, formatTime, formatDate } from "@/lib/formatters";
import { QueueStatus } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";

export default function RegistrationsPage() {
  const {
    currentUser,
    patients,
    queues,
    registrations,
    doctorSchedules,
    hospitalSettings,
    addQueue,
    updateQueueStatus,
    addRegistration,
  } = useSIMRS();

  const [activeTab, setActiveTab] = useState<"antrean" | "daftar">("antrean");
  const [selectedUnit, setSelectedUnit] = useState<string>("ALL");
  const [printTicketModal, setPrintTicketModal] = useState<any | null>(null);

  // Registration Form State
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [visitType, setVisitType] = useState<"rawat_jalan" | "igd" | "rawat_inap">("rawat_jalan");
  const [selectedScheduleId, setSelectedScheduleId] = useState<string>("");
  const [insuranceType, setInsuranceType] = useState<"UMUM" | "BPJS_KESEHATAN" | "ASURANSI_SWASTA">("BPJS_KESEHATAN");
  const [insuranceNumber, setInsuranceNumber] = useState<string>("");
  const [priority, setPriority] = useState<"biasa" | "prioritas" | "emergency">("biasa");

  const filteredQueues = queues.filter((q) => {
    if (selectedUnit === "ALL") return true;
    return q.unit_type === selectedUnit;
  });

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const patient = patients.find((p) => p.id === selectedPatientId);
    if (!patient) {
      alert("Harap pilih pasien terlebih dahulu.");
      return;
    }

    let clinicId = "cl-general";
    let clinicName = "Klinik Umum";
    let doctorId = "dr-01";
    let doctorName = "Dokter Jaga";
    let prefix = "POLI";

    if (visitType === "rawat_jalan") {
      const schedule = doctorSchedules.find((s) => s.id === selectedScheduleId);
      if (schedule) {
        clinicId = schedule.clinic_id;
        clinicName = schedule.clinic_name;
        doctorId = schedule.doctor_id;
        doctorName = schedule.doctor_name;
        prefix = schedule.clinic_id.includes("pd") ? "POLI-INT" : "POLI-ANK";
      }
    } else if (visitType === "igd") {
      prefix = "IGD";
      clinicName = "Instalasi Gawat Darurat";
      doctorName = "Dokter Jaga IGD";
    }

    // Generate atomic ticket number
    const countSamePrefix = queues.filter((q) => q.ticket_number.startsWith(prefix)).length + 1;
    const ticketNumber = `${prefix}-${String(countSamePrefix).padStart(3, "0")}`;

    // 1. Create Queue Ticket
    const newQueue = addQueue({
      ticket_number: ticketNumber,
      patient_id: patient.id,
      patient_mrn: patient.mrn,
      patient_name: patient.full_name,
      unit_type: visitType === "igd" ? "igd" : "rawat_jalan",
      clinic_id: clinicId,
      clinic_name: clinicName,
      doctor_id: doctorId,
      doctor_name: doctorName,
      status: "menunggu",
      priority: visitType === "igd" ? "emergency" : priority,
    });

    // 2. Create Registration
    const newReg = addRegistration({
      patient_id: patient.id,
      patient_mrn: patient.mrn,
      patient_name: patient.full_name,
      visit_type: visitType,
      clinic_id: clinicId,
      clinic_name: clinicName,
      doctor_id: doctorId,
      doctor_name: doctorName,
      insurance_type: insuranceType,
      insurance_number: insuranceNumber || patient.insurance_number,
      queue_ticket_id: newQueue.id,
      queue_ticket_number: ticketNumber,
      status: "aktif",
      created_by: currentUser.full_name,
    });

    // Offer ticket print
    setPrintTicketModal({
      ticketNumber,
      patientName: patient.full_name,
      mrn: patient.mrn,
      clinicName,
      doctorName,
      time: new Date().toISOString(),
      waitingBefore: queues.filter((q) => q.status === "menunggu" && q.clinic_name === clinicName).length,
    });

    // Reset Form
    setSelectedPatientId("");
    setActiveTab("antrean");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-teal-600" />
            Pendaftaran & Manajemen Antrean Loket
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Penerbitan nomor antrean poliklinik dan admisi rawat jalan/IGD yang terintegrasi.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-white border border-slate-200 rounded-lg p-0.5 text-xs shadow-2xs flex">
            <button
              onClick={() => setActiveTab("antrean")}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeTab === "antrean" ? "bg-teal-600 text-white" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Monitor Antrean
            </button>
            <button
              onClick={() => setActiveTab("daftar")}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1 ${
                activeTab === "daftar" ? "bg-teal-600 text-white" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <PlusCircle className="h-3.5 w-3.5" /> Registrasi Kunjungan
            </button>
          </div>
        </div>
      </div>

      {/* Tab 1: Monitor Antrean Realtime */}
      {activeTab === "antrean" && (
        <div className="space-y-6">
          {/* Unit Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="text-slate-400 font-medium">Filter Unit:</span>
            {["ALL", "rawat_jalan", "igd", "farmasi", "laboratorium"].map((unit) => (
              <button
                key={unit}
                onClick={() => setSelectedUnit(unit)}
                className={`px-3 py-1.5 rounded-md border font-medium transition-all ${
                  selectedUnit === unit
                    ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
              >
                {unit === "ALL"
                  ? "Semua Unit"
                  : unit === "rawat_jalan"
                  ? "Rawat Jalan / Poli"
                  : unit === "igd"
                  ? "IGD"
                  : unit === "farmasi"
                  ? "Farmasi"
                  : "Laboratorium"}
              </button>
            ))}
          </div>

          {/* Active Queue Calling Boards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {queues
              .filter((q) => q.status === "dilayani" || q.status === "dipanggil")
              .slice(0, 3)
              .map((calling) => (
                <div
                  key={calling.id}
                  className="bg-teal-900 text-white p-5 rounded-xl border border-teal-700 shadow-lg relative overflow-hidden flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-wider text-teal-300 font-bold">
                      {calling.clinic_name || "POLI AKTIF"}
                    </span>
                    <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
                  </div>
                  <div className="my-4">
                    <div className="text-3xl font-extrabold tracking-wider font-mono text-emerald-300">
                      {calling.ticket_number}
                    </div>
                    <div className="text-sm font-semibold text-white mt-1 truncate">{calling.patient_name}</div>
                    <div className="text-xs text-teal-200 font-mono">RM: {calling.patient_mrn}</div>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-3 border-t border-teal-800">
                    <span className="text-teal-300">Status: {calling.status.toUpperCase()}</span>
                    <Button
                      size="sm"
                      onClick={() => updateQueueStatus(calling.id, "selesai")}
                      className="h-7 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-medium"
                    >
                      Selesai Dilayani
                    </Button>
                  </div>
                </div>
              ))}
          </div>

          {/* Queues List Table */}
          <Card className="border-slate-200/90 shadow-2xs overflow-hidden">
            <CardHeader className="p-4 border-b border-slate-100 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold text-slate-900">
                Daftar Antrean Pasien Hari Ini ({filteredQueues.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">No. Antrean</th>
                      <th className="px-4 py-3">No. RM & Nama Pasien</th>
                      <th className="px-4 py-3">Tujuan Poli / Unit</th>
                      <th className="px-4 py-3">Dokter Penanggung Jawab</th>
                      <th className="px-4 py-3">Status Antrean</th>
                      <th className="px-4 py-3">Jam Masuk</th>
                      <th className="px-4 py-3 text-right">Aksi Loket</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-normal">
                    {filteredQueues.length > 0 ? (
                      filteredQueues.map((queue) => {
                        const statusMeta = QUEUE_STATUS_INFO[queue.status];
                        return (
                          <tr key={queue.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="px-4 py-3.5 font-mono font-bold text-base text-slate-900">
                              {queue.ticket_number}
                            </td>
                            <td className="px-4 py-3.5">
                              <div className="font-semibold text-slate-900">{queue.patient_name}</div>
                              <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                                RM: {queue.patient_mrn}
                              </div>
                            </td>
                            <td className="px-4 py-3.5 font-medium text-slate-800">
                              {queue.clinic_name || queue.unit_type.toUpperCase()}
                            </td>
                            <td className="px-4 py-3.5 text-slate-600">{queue.doctor_name || "-"}</td>
                            <td className="px-4 py-3.5">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold border ${statusMeta.badge}`}
                              >
                                {statusMeta.label}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 font-mono text-slate-500">
                              {formatTime(queue.created_at)}
                            </td>
                            <td className="px-4 py-3.5 text-right space-x-1">
                              {queue.status === "menunggu" && (
                                <Button
                                  size="sm"
                                  onClick={() => updateQueueStatus(queue.id, "dipanggil")}
                                  className="h-7 text-xs bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                  <Volume2 className="h-3 w-3 mr-1" />
                                  Panggil
                                </Button>
                              )}
                              {queue.status === "dipanggil" && (
                                <Button
                                  size="sm"
                                  onClick={() => updateQueueStatus(queue.id, "dilayani")}
                                  className="h-7 text-xs bg-teal-600 hover:bg-teal-700 text-white"
                                >
                                  Layani
                                </Button>
                              )}
                              {queue.status === "dilayani" && (
                                <Button
                                  size="sm"
                                  onClick={() => updateQueueStatus(queue.id, "selesai")}
                                  className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                                >
                                  Selesai
                                </Button>
                              )}
                              {queue.status !== "selesai" && queue.status !== "batal" && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => updateQueueStatus(queue.id, "batal")}
                                  className="h-7 text-xs text-red-600 hover:bg-red-50"
                                >
                                  Batal
                                </Button>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-500">
                          Tidak ada antrean terdaftar di unit ini.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab 2: Registrasi Kunjungan Pasien */}
      {activeTab === "daftar" && (
        <Card className="max-w-3xl mx-auto border-slate-200/90 shadow-2xs">
          <CardHeader className="p-6 border-b border-slate-100">
            <CardTitle className="text-base font-bold text-slate-900">
              Formulir Registrasi Kunjungan Pasien
            </CardTitle>
            <p className="text-xs text-slate-500 mt-1">
              Pilih pasien terdaftar dari master data untuk menerbitkan nomor antrean poliklinik atau IGD.
            </p>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleRegisterSubmit} className="space-y-5 text-xs">
              {/* Patient Selector */}
              <div>
                <label className="font-semibold text-slate-700 block mb-1.5">
                  Pilih Pasien Terdaftar *
                </label>
                <select
                  required
                  value={selectedPatientId}
                  onChange={(e) => {
                    setSelectedPatientId(e.target.value);
                    const p = patients.find((item) => item.id === e.target.value);
                    if (p) {
                      setInsuranceType(p.insurance_type);
                      setInsuranceNumber(p.insurance_number || "");
                    }
                  }}
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                >
                  <option value="">-- Cari / Pilih Pasien Berdasarkan No. RM / Nama --</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      [{p.mrn}] {p.full_name} • NIK: {p.nik} • {p.insurance_type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Visit Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1.5">Jenis Kunjungan *</label>
                  <select
                    value={visitType}
                    onChange={(e) => setVisitType(e.target.value as any)}
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-xs"
                  >
                    <option value="rawat_jalan">Rawat Jalan (Poliklinik Spesialis)</option>
                    <option value="igd">Instalasi Gawat Darurat (IGD)</option>
                    <option value="rawat_inap">Admisi Masuk Rawat Inap</option>
                  </select>
                </div>

                {/* Priority */}
                <div>
                  <label className="font-semibold text-slate-700 block mb-1.5">Tingkat Prioritas</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-xs"
                  >
                    <option value="biasa">Biasa / Reguler</option>
                    <option value="prioritas">Prioritas (Lansia / Disabilitas / Balita)</option>
                    <option value="emergency">Emergency / Cito</option>
                  </select>
                </div>
              </div>

              {/* Clinic and Doctor Schedule Selector (For Outpatient) */}
              {visitType === "rawat_jalan" && (
                <div>
                  <label className="font-semibold text-slate-700 block mb-1.5">
                    Poli Spesialis & Jadwal Dokter Praktik *
                  </label>
                  <select
                    required
                    value={selectedScheduleId}
                    onChange={(e) => setSelectedScheduleId(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-xs"
                  >
                    <option value="">-- Pilih Poliklinik & Dokter --</option>
                    {doctorSchedules.map((sch) => (
                      <option key={sch.id} value={sch.id}>
                        {sch.clinic_name} - {sch.doctor_name} ({sch.day_of_week}, {sch.start_time}-{sch.end_time} WITA) [Kuota: {sch.current_booked}/{sch.max_patient_quota}]
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Insurance & Payment Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1.5">Penjamin Kunjungan *</label>
                  <select
                    value={insuranceType}
                    onChange={(e) => setInsuranceType(e.target.value as any)}
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-xs"
                  >
                    <option value="BPJS_KESEHATAN">BPJS Kesehatan (JKN)</option>
                    <option value="UMUM">Pasien Umum (Biaya Sendiri)</option>
                    <option value="ASURANSI_SWASTA">Asuransi Perusahaan / Swasta</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1.5">
                    Nomor Rujukan / Nomor Polis
                  </label>
                  <Input
                    placeholder="Nomor rujukan faskes tingkat 1"
                    value={insuranceNumber}
                    onChange={(e) => setInsuranceNumber(e.target.value)}
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <Button type="button" variant="outline" size="sm" onClick={() => setActiveTab("antrean")}>
                  Batal
                </Button>
                <Button type="submit" size="sm" className="bg-teal-600 hover:bg-teal-700 text-white">
                  <Printer className="h-4 w-4 mr-1.5" />
                  Daftarkan & Cetak Tiket
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Modal: Cetak Slip Tiket Antrean (Printable) */}
      {printTicketModal && (
        <Modal
          isOpen={Boolean(printTicketModal)}
          onClose={() => setPrintTicketModal(null)}
          title="Tiket Antrean Berhasil Diterbitkan"
          maxWidth="sm"
        >
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-center space-y-3 font-sans printable-area">
            <div className="border-b border-slate-200 pb-2">
              <h4 className="font-bold text-sm text-slate-900">{hospitalSettings.hospital_name}</h4>
              <p className="text-[10px] text-slate-500">{hospitalSettings.address}</p>
            </div>

            <div className="my-2">
              <div className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
                Nomor Antrean Anda
              </div>
              <div className="text-4xl font-extrabold font-mono text-teal-700 tracking-wider my-1">
                {printTicketModal.ticketNumber}
              </div>
              <div className="text-xs font-semibold text-slate-900">{printTicketModal.clinicName}</div>
              <div className="text-[11px] text-slate-600">{printTicketModal.doctorName}</div>
            </div>

            <div className="text-left text-[11px] bg-white p-3 rounded border border-slate-200 space-y-1">
              <div>
                Nama: <strong>{printTicketModal.patientName}</strong>
              </div>
              <div>
                No. RM: <strong className="font-mono">{printTicketModal.mrn}</strong>
              </div>
              <div>
                Waktu Registrasi:{" "}
                <span className="font-mono">{formatTime(printTicketModal.time)} WITA</span>
              </div>
              <div className="text-slate-500 text-[10px] pt-1">
                * Harap perhatikan layar panggilan loket.
              </div>
            </div>

            <div className="pt-2 no-print flex gap-2">
              <Button
                size="sm"
                className="w-full bg-teal-600 hover:bg-teal-700 text-white"
                onClick={() => window.print()}
              >
                <Printer className="h-4 w-4 mr-1" /> Cetak Slip
              </Button>
              <Button size="sm" variant="outline" onClick={() => setPrintTicketModal(null)}>
                Tutup
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
