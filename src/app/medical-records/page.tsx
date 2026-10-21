"use client";

import React, { useState } from "react";
import {
  FileHeart,
  Search,
  Calendar,
  Stethoscope,
  Pill,
  FlaskConical,
  Scan,
  Printer,
  Clock,
  Shield,
  Lock,
  User,
} from "lucide-react";
import { useSIMRS } from "@/lib/demo-store";
import { formatTime, formatDate } from "@/lib/formatters";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";

export default function MedicalRecordsPage() {
  const { patients, clinicalNotes, prescriptions, labOrders, hospitalSettings, currentUser } = useSIMRS();

  const [selectedPatientId, setSelectedPatientId] = useState<string>(patients[0]?.id || "");
  const [printResumeModalOpen, setPrintResumeModalOpen] = useState(false);
  const [printDateStr, setPrintDateStr] = useState("21 Oktober 2026");

  React.useEffect(() => {
    setPrintDateStr(formatDate(new Date()));
  }, []);

  const selectedPatient = patients.find((p) => p.id === selectedPatientId);
  const patientNotes = clinicalNotes.filter((n) => n.patient_id === selectedPatientId);
  const patientRx = prescriptions.filter((p) => p.patient_id === selectedPatientId);
  const patientLabs = labOrders.filter((l) => l.patient_id === selectedPatientId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileHeart className="h-5 w-5 text-teal-600" />
            Rekam Medis Elektronik Terintegrasi (EMR)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Lini masa riwayat medis longitudinal, riwayat resep, penunjang diagnostik, dan ringkasan klinis (Resume Medis).
          </p>
        </div>

        {selectedPatient && (
          <Button
            size="sm"
            onClick={() => setPrintResumeModalOpen(true)}
            className="bg-teal-600 hover:bg-teal-700 text-white shadow-xs self-start sm:self-auto font-medium"
          >
            <Printer className="h-4 w-4 mr-1.5" />
            Cetak Resume Medis Pasien
          </Button>
        )}
      </div>

      {/* Patient Selector */}
      <Card className="border-slate-200/90 shadow-2xs p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex-1 max-w-xl">
            <label className="font-semibold text-slate-700 block mb-1">Pilih Rekam Medis Pasien:</label>
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            >
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  [{p.mrn}] {p.full_name} • NIK: {p.nik} • {p.gender === "L" ? "Laki-laki" : "Perempuan"}
                </option>
              ))}
            </select>
          </div>

          {selectedPatient && (
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-center gap-4 text-xs font-mono">
              <div>
                <span className="text-slate-400 block text-[10px]">GOLONGAN DARAH</span>
                <span className="font-bold text-slate-900">{selectedPatient.blood_type}</span>
              </div>
              <div className="border-l border-slate-200 pl-4">
                <span className="text-slate-400 block text-[10px]">PENJAMIN</span>
                <span className="font-bold text-teal-700">{selectedPatient.insurance_type}</span>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Longitudinal Timeline Section */}
      <div className="space-y-4">
        <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
          <Clock className="h-4 w-4 text-slate-500" />
          Lini Masa Catatan Klinis Masa Lalu
        </h3>

        {patientNotes.length > 0 ? (
          <div className="space-y-4">
            {patientNotes.map((note) => (
              <Card key={note.id} className="border-slate-200/90 shadow-2xs">
                <CardHeader className="p-4 bg-slate-50 border-b border-slate-100 flex flex-row items-center justify-between">
                  <div>
                    <span className="font-bold text-xs text-slate-900">{note.clinic_name || "Rawat Jalan"}</span>
                    <span className="text-slate-500 text-[11px] ml-2">
                      {formatDate(note.created_at)} • {formatTime(note.created_at)} WITA
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                      STATUS: {note.status.toUpperCase()}
                    </span>
                    {note.signed_by && (
                      <span className="text-[10px] text-slate-500 flex items-center gap-1">
                        <Lock className="h-3 w-3 text-slate-400" /> Ditandatangani: {note.signed_by}
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-5 space-y-4 text-xs">
                  {/* S & O */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 bg-slate-50/50 rounded border border-slate-100">
                      <strong className="text-slate-900 block mb-1">Subjektif (S):</strong>
                      <p className="text-slate-700">{note.subjective.chief_complaint}</p>
                      {note.subjective.history_of_present_illness && (
                        <p className="text-slate-500 text-[11px] mt-1">
                          RPS: {note.subjective.history_of_present_illness}
                        </p>
                      )}
                    </div>

                    <div className="p-3 bg-slate-50/50 rounded border border-slate-100">
                      <strong className="text-slate-900 block mb-1">Objektif (O) & Tanda Vital:</strong>
                      <div className="grid grid-cols-3 gap-1 text-[11px] font-mono text-slate-700">
                        <div>TD: {note.objective.vital_signs.systolic_bp}/{note.objective.vital_signs.diastolic_bp}</div>
                        <div>HR: {note.objective.vital_signs.heart_rate} x/m</div>
                        <div>Suhu: {note.objective.vital_signs.body_temperature}°C</div>
                        <div>RR: {note.objective.vital_signs.respiratory_rate} x/m</div>
                        <div>SpO2: {note.objective.vital_signs.oxygen_saturation}%</div>
                        <div>BMI: {note.objective.vital_signs.bmi}</div>
                      </div>
                    </div>
                  </div>

                  {/* A & P */}
                  <div className="p-3 bg-teal-50/30 rounded border border-teal-100">
                    <strong className="text-teal-950 block mb-0.5">Asesmen Diagnosis (A):</strong>
                    <div className="font-bold text-teal-800 font-mono text-xs">
                      {note.assessment.primary_diagnosis_code} - {note.assessment.primary_diagnosis_name}
                    </div>
                    {note.assessment.clinical_rationale && (
                      <p className="text-[11px] text-slate-600 mt-1 italic">{note.assessment.clinical_rationale}</p>
                    )}
                  </div>

                  <div className="p-3 bg-slate-50/50 rounded border border-slate-100">
                    <strong className="text-slate-900 block mb-1">Planning Terapi & Edukasi (P):</strong>
                    <p className="text-slate-700 whitespace-pre-line">{note.plan.treatment_plan}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center border-slate-200">
            <p className="text-xs text-slate-500">Belum ada catatan SOAP masa lalu untuk pasien ini.</p>
          </Card>
        )}
      </div>

      {/* Modal: Cetak Resume Medis Pasien */}
      {printResumeModalOpen && selectedPatient && (
        <Modal
          isOpen={printResumeModalOpen}
          onClose={() => setPrintResumeModalOpen(false)}
          title="Resume Medis Pasien (Clinical Summary)"
          maxWidth="3xl"
        >
          <div className="p-6 bg-white border border-slate-200 rounded-lg space-y-4 font-sans text-xs printable-area">
            {/* Kop */}
            <div className="border-b-2 border-slate-900 pb-3 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 tracking-tight">
                  {hospitalSettings.hospital_name}
                </h3>
                <p className="text-[11px] text-slate-600">{hospitalSettings.address}</p>
                <p className="text-[10px] text-slate-500 font-mono">
                  Telp: {hospitalSettings.phone} • Email: {hospitalSettings.email}
                </p>
              </div>
              <div className="text-right">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  RESUME MEDIS ELEKTRONIK
                </div>
                <div className="text-[10px] font-mono text-slate-400">Permenkes No. 24 Tahun 2022</div>
              </div>
            </div>

            {/* Patient Header */}
            <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-3 rounded border border-slate-200">
              <div>
                No. Rekam Medis: <strong className="font-mono text-teal-800">{selectedPatient.mrn}</strong>
              </div>
              <div>
                Nama Lengkap: <strong>{selectedPatient.full_name}</strong>
              </div>
              <div>
                Tanggal Lahir: <span>{formatDate(selectedPatient.birth_date)}</span>
              </div>
              <div>
                Jenis Kelamin: <span>{selectedPatient.gender === "L" ? "Laki-laki" : "Perempuan"}</span>
              </div>
              <div>
                Alergi Relevan:{" "}
                <span className="font-semibold text-red-700">
                  {selectedPatient.allergies.length > 0 ? selectedPatient.allergies.join(", ") : "Tidak Ada"}
                </span>
              </div>
              <div>
                Penjamin: <span>{selectedPatient.insurance_type}</span>
              </div>
            </div>

            {/* Diagnosis History */}
            <div className="space-y-2">
              <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wide">
                1. Diagnosis Utama & Masalah Kesehatan (ICD-10)
              </h4>
              <div className="p-3 bg-slate-50 rounded border border-slate-200 text-xs">
                {patientNotes.map((n) => (
                  <div key={n.id} className="py-1 flex justify-between border-b border-slate-100 last:border-0">
                    <span className="font-semibold">
                      {n.assessment.primary_diagnosis_code} - {n.assessment.primary_diagnosis_name}
                    </span>
                    <span className="text-slate-500 font-mono text-[11px]">{formatDate(n.created_at)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Medications History */}
            <div className="space-y-2">
              <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wide">
                2. Terapi Obat Terakhir yang Diberikan
              </h4>
              <div className="p-3 bg-slate-50 rounded border border-slate-200 text-xs space-y-1">
                {patientRx.map((rx) =>
                  rx.items.map((it) => (
                    <div key={it.id} className="flex justify-between border-b border-slate-100 last:border-0 py-1">
                      <span>
                        <strong>{it.medication_name}</strong> - {it.frequency}
                      </span>
                      <span className="font-mono text-slate-500">{it.quantity} {it.unit}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Signatures */}
            <div className="pt-8 flex justify-between text-center text-xs">
              <div className="text-left text-[10px] text-slate-400 font-mono">
                Dicetak pada: {printDateStr}
              </div>
              <div className="w-56">
                <p className="text-slate-500">Dokter Penanggung Jawab,</p>
                <div className="h-12" />
                <p className="font-bold text-slate-900">{patientNotes[0]?.doctor_name || currentUser.full_name}</p>
                <p className="text-[10px] text-slate-400 font-mono">Tanda Tangan Elektronik Sah</p>
              </div>
            </div>

            <div className="pt-4 no-print flex justify-end gap-2">
              <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-white" onClick={() => window.print()}>
                <Printer className="h-4 w-4 mr-1" /> Cetak Lembar Resume
              </Button>
              <Button size="sm" variant="outline" onClick={() => setPrintResumeModalOpen(false)}>
                Tutup
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
