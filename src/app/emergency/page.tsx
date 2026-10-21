"use client";

import React, { useState } from "react";
import {
  Siren,
  Clock,
  AlertTriangle,
  HeartPulse,
  UserCheck,
  Ambulance,
  Plus,
  ArrowRight,
  ShieldAlert,
  Printer,
  FileCheck,
} from "lucide-react";
import { useSIMRS } from "@/lib/demo-store";
import { EmergencyEncounter, TriageCategory } from "@/types";
import { TRIAGE_INFO, formatTime, formatDate } from "@/lib/formatters";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";

export default function EmergencyPage() {
  const {
    currentUser,
    emergencyEncounters,
    patients,
    addEmergencyEncounter,
    addQueue,
  } = useSIMRS();

  const [triageModalOpen, setTriageModalOpen] = useState(false);
  const [filterLevel, setFilterLevel] = useState<string>("ALL");

  // Intake Form State
  const [patientId, setPatientId] = useState("");
  const [transport, setTransport] = useState<EmergencyEncounter["transport_method"]>("AMBULANS_118");
  const [triageLevel, setTriageLevel] = useState<TriageCategory>("P2_EMERGENSI");
  const [triageNotes, setTriageNotes] = useState("");
  const [attendingDoctor, setAttendingDoctor] = useState("dr. Andi Makassau, Sp.PD, K-GEH");

  const filteredEncounters = emergencyEncounters.filter((e) => {
    if (filterLevel === "ALL") return true;
    return e.triage_level === filterLevel;
  });

  const p1Count = emergencyEncounters.filter((e) => e.triage_level === "P1_RESUSITASI").length;
  const p2Count = emergencyEncounters.filter((e) => e.triage_level === "P2_EMERGENSI").length;
  const p3Count = emergencyEncounters.filter((e) => e.triage_level === "P3_URGENSI").length;
  const activeCount = emergencyEncounters.filter((e) => e.status !== "pulang" && e.status !== "meninggal").length;

  const handleTriageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const patient = patients.find((p) => p.id === patientId);
    if (!patient) {
      alert("Pilih pasien yang terdaftar di master data.");
      return;
    }

    addEmergencyEncounter({
      registration_id: `reg-${Date.now()}`,
      patient_id: patient.id,
      patient_name: patient.full_name,
      patient_mrn: patient.mrn,
      transport_method: transport,
      triage_level: triageLevel,
      triage_nurse_id: currentUser.id,
      triage_nurse_name: currentUser.full_name,
      attending_doctor_id: "user-doctor-1",
      attending_doctor_name: attendingDoctor,
      status: "penanganan_akut",
      triage_notes: triageNotes || "Pasien datang dalam kondisi emergensi, triase dilakukan segera.",
    });

    // Generate atomic IGD queue ticket
    const igdNum = `IGD-${String(emergencyEncounters.length + 1).padStart(3, "0")}`;
    addQueue({
      ticket_number: igdNum,
      patient_id: patient.id,
      patient_mrn: patient.mrn,
      patient_name: patient.full_name,
      unit_type: "igd",
      doctor_name: attendingDoctor,
      status: "dilayani",
      priority: "emergency",
    });

    setTriageModalOpen(false);
    setPatientId("");
    setTriageNotes("");
    alert(`Pasien ${patient.full_name} berhasil dicatat di IGD dengan kategori ${triageLevel}.`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Siren className="h-5 w-5 text-red-600 animate-pulse" />
            Instalasi Gawat Darurat (IGD) & Triase Klinis
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Penerimaan kegawatdaruratan medis berstandar ATS (Australian Triage Scale) dan pemantauan klinis.
          </p>
        </div>

        <Button
          onClick={() => setTriageModalOpen(true)}
          className="bg-red-600 hover:bg-red-700 text-white shadow-xs self-start sm:self-auto font-medium"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          + Triase Pasien Baru IGD
        </Button>
      </div>

      {/* Triage Level Quick Census Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-red-200 bg-red-50/40 shadow-2xs">
          <CardContent className="p-4">
            <div className="text-[11px] font-bold text-red-800 uppercase tracking-wider flex items-center justify-between">
              <span>P1 - Resusitasi</span>
              <span className="h-2 w-2 rounded-full bg-red-600 animate-ping" />
            </div>
            <div className="text-2xl font-black text-red-600 mt-1">{p1Count} Pasien</div>
            <div className="text-[10px] text-red-700 font-medium mt-0.5">Penanganan seketika tanpa tunda</div>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50/40 shadow-2xs">
          <CardContent className="p-4">
            <div className="text-[11px] font-bold text-orange-800 uppercase tracking-wider">
              P2 - Emergensi
            </div>
            <div className="text-2xl font-black text-orange-600 mt-1">{p2Count} Pasien</div>
            <div className="text-[10px] text-orange-700 font-medium mt-0.5">Respon time &lt; 10 menit</div>
          </CardContent>
        </Card>

        <Card className="border-amber-200 bg-amber-50/40 shadow-2xs">
          <CardContent className="p-4">
            <div className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">
              P3 - Urgensi
            </div>
            <div className="text-2xl font-black text-amber-600 mt-1">{p3Count} Pasien</div>
            <div className="text-[10px] text-amber-700 font-medium mt-0.5">Respon time &lt; 30 menit</div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-2xs">
          <CardContent className="p-4">
            <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              Total Pasien IGD Aktif
            </div>
            <div className="text-2xl font-black text-slate-900 mt-1">{activeCount} Pasien</div>
            <div className="text-[10px] text-slate-500 font-medium mt-0.5">Sedang dalam penanganan/observasi</div>
          </CardContent>
        </Card>
      </div>

      {/* Filter by Triage */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-400 font-medium shrink-0">Filter Tingkat Triase:</span>
        {["ALL", "P1_RESUSITASI", "P2_EMERGENSI", "P3_URGENSI", "P4_SEMI_URGENSI", "P5_NON_URGENSI"].map(
          (lvl) => (
            <button
              key={lvl}
              onClick={() => setFilterLevel(lvl)}
              className={`px-3 py-1.5 rounded-md border font-medium transition-all ${
                filterLevel === lvl
                  ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              {lvl === "ALL" ? "Semua Kategori" : lvl.replace("_", " ")}
            </button>
          )
        )}
      </div>

      {/* Emergency Encounters Table */}
      <Card className="border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Tingkat Triase</th>
                <th className="px-4 py-3">Nama Pasien & No. RM</th>
                <th className="px-4 py-3">Jam Kedatangan</th>
                <th className="px-4 py-3">Transportasi Datang</th>
                <th className="px-4 py-3">Dokter & Perawat Triase</th>
                <th className="px-4 py-3">Catatan Klinis Triase</th>
                <th className="px-4 py-3">Disposisi & Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal">
              {filteredEncounters.length > 0 ? (
                filteredEncounters.map((enc) => {
                  const meta = TRIAGE_INFO[enc.triage_level];
                  return (
                    <tr key={enc.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3.5">
                        <span className={`px-2.5 py-1 rounded text-[10px] font-bold ${meta.badge}`}>
                          {meta.label}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-slate-900">{enc.patient_name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">RM: {enc.patient_mrn}</div>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-slate-700">
                        {formatTime(enc.arrival_time)} WITA
                      </td>
                      <td className="px-4 py-3.5 font-medium text-slate-700">
                        {enc.transport_method.replace(/_/g, " ")}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-medium text-slate-800">{enc.attending_doctor_name || "-"}</div>
                        <div className="text-[10px] text-slate-400">Triase: {enc.triage_nurse_name}</div>
                      </td>
                      <td className="px-4 py-3.5 max-w-xs">
                        <p className="text-[11px] text-slate-700 line-clamp-2">{enc.triage_notes}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                          {enc.status.toUpperCase()}
                        </span>
                        {enc.discharge_summary && (
                          <div className="text-[10px] text-teal-700 mt-1 line-clamp-1 italic">
                            {enc.discharge_summary}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    Tidak ada pasien IGD pada filter kategori ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal: Triase Pasien Baru IGD */}
      <Modal
        isOpen={triageModalOpen}
        onClose={() => setTriageModalOpen(false)}
        title="Formulir Triase Klinis Pasien Gawat Darurat (IGD)"
        description="Penilaian kegawatdaruratan klinis berdasarkan protokol Australian Triage Scale."
        maxWidth="2xl"
      >
        <form onSubmit={handleTriageSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Pilih Pasien Terdaftar *</label>
            <select
              required
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              className="w-full h-9 px-3 rounded-md border border-slate-200 bg-white text-xs font-medium"
            >
              <option value="">-- Pilih Pasien --</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  [{p.mrn}] {p.full_name} • NIK: {p.nik} • {p.insurance_type}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Metode Transportasi Kedatangan *</label>
              <select
                value={transport}
                onChange={(e) => setTransport(e.target.value as any)}
                className="w-full h-9 px-3 rounded-md border border-slate-200 bg-white text-xs"
              >
                <option value="AMBULANS_118">Ambulans 118 / Gawat Darurat</option>
                <option value="SENDIRI">Kendaraan Sendiri / Keluarga</option>
                <option value="DIRUJUK_RS_LAIN">Rujukan Rumah Sakit / Faskes Lain</option>
                <option value="POLISI">Mobil Polisi / Patroli</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Kategori Triase Klinis (ATS Protocol) *
              </label>
              <select
                value={triageLevel}
                onChange={(e) => setTriageLevel(e.target.value as any)}
                className="w-full h-9 px-3 rounded-md border border-slate-200 bg-white text-xs font-bold text-red-600"
              >
                <option value="P1_RESUSITASI">P1 - Resusitasi (Merah: Segera / Ancam Jiwa)</option>
                <option value="P2_EMERGENSI">P2 - Emergensi (Oranye: &lt; 10 Menit)</option>
                <option value="P3_URGENSI">P3 - Urgensi (Kuning: &lt; 30 Menit)</option>
                <option value="P4_SEMI_URGENSI">P4 - Semi Urgensi (Hijau: &lt; 60 Menit)</option>
                <option value="P5_NON_URGENSI">P5 - Non Urgensi (Biru: &lt; 120 Menit)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Dokter Penanggung Jawab Jaga IGD *</label>
            <select
              value={attendingDoctor}
              onChange={(e) => setAttendingDoctor(e.target.value)}
              className="w-full h-9 px-3 rounded-md border border-slate-200 bg-white text-xs"
            >
              <option value="dr. Andi Makassau, Sp.PD, K-GEH">dr. Andi Makassau, Sp.PD, K-GEH</option>
              <option value="dr. Citra Lestari, Sp.A, M.Biomed">dr. Citra Lestari, Sp.A, M.Biomed</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Catatan Asesmen Triase Awal & Tanda Vital *
            </label>
            <textarea
              required
              rows={3}
              value={triageNotes}
              onChange={(e) => setTriageNotes(e.target.value)}
              placeholder="Contoh: Pasien datang sesak napas akut SpO2 92%, TD 180/100, kesadaran somnolen, nyeri dada kiri menjalar..."
              className="w-full p-2.5 rounded-md border border-slate-200 bg-white text-xs text-slate-800"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setTriageModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" size="sm" className="bg-red-600 hover:bg-red-700 text-white font-medium">
              Simpan Triase & Masukkan ke Ruang Tindakan
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
