"use client";

import React, { useState } from "react";
import {
  Stethoscope,
  HeartPulse,
  Pill,
  FlaskConical,
  Scan,
  CheckCircle,
  FileText,
  Clock,
  User,
  AlertCircle,
  Lock,
  Save,
  PenTool,
  Printer,
} from "lucide-react";
import { useSIMRS } from "@/lib/demo-store";
import { ClinicalNote, VitalSigns } from "@/types";
import { formatTime, formatDate } from "@/lib/formatters";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";

export default function OutpatientPage() {
  const {
    currentUser,
    queues,
    patients,
    clinicalNotes,
    saveClinicalNote,
    addPrescription,
    addLabOrder,
    medications,
    updateQueueStatus,
  } = useSIMRS();

  // Outpatient queue tickets
  const outpatientQueues = queues.filter((q) => q.unit_type === "rawat_jalan");
  const [selectedQueueId, setSelectedQueueId] = useState<string>(
    outpatientQueues.find((q) => q.status === "dilayani" || q.status === "dipanggil")?.id ||
      outpatientQueues[0]?.id ||
      ""
  );

  const selectedQueue = queues.find((q) => q.id === selectedQueueId);
  const selectedPatient = selectedQueue
    ? patients.find((p) => p.id === selectedQueue.patient_id)
    : null;

  // Existing note for this encounter/patient
  const existingNote = clinicalNotes.find(
    (n) => n.patient_id === selectedPatient?.id && n.unit_type === "rawat_jalan"
  );

  // SOAP State
  const [chiefComplaint, setChiefComplaint] = useState(
    existingNote?.subjective.chief_complaint || "Kontrol rutin berkala dan evaluasi tekanan darah"
  );
  const [hpi, setHpi] = useState(
    existingNote?.subjective.history_of_present_illness || "Keluhan berdenyut di tengkuk sejak 3 hari lalu"
  );
  const [pastHistory, setPastHistory] = useState(
    existingNote?.subjective.past_medical_history || "Hipertensi Stage II, Dislipidemia"
  );

  // Vitals
  const [systolic, setSystolic] = useState(existingNote?.objective.vital_signs.systolic_bp || 140);
  const [diastolic, setDiastolic] = useState(existingNote?.objective.vital_signs.diastolic_bp || 90);
  const [heartRate, setHeartRate] = useState(existingNote?.objective.vital_signs.heart_rate || 80);
  const [rr, setRr] = useState(existingNote?.objective.vital_signs.respiratory_rate || 18);
  const [temperature, setTemperature] = useState(
    existingNote?.objective.vital_signs.body_temperature || 36.5
  );
  const [spo2, setSpo2] = useState(existingNote?.objective.vital_signs.oxygen_saturation || 99);
  const [weight, setWeight] = useState(existingNote?.objective.vital_signs.weight_kg || 68);
  const [height, setHeight] = useState(existingNote?.objective.vital_signs.height_cm || 165);
  const [painScale, setPainScale] = useState(existingNote?.objective.vital_signs.pain_scale || 2);
  const [physicalExam, setPhysicalExam] = useState(
    existingNote?.objective.physical_examination ||
      "Kepala: Anemis (-/-), Sklera Ikterik (-/-)\nThorax: S1-S2 reguler, bising (-), vesikuler simetris, ronkhi (-/-)\nAbdomen: Datar, supel, bising usus normal, nyeri tekan (-)"
  );

  // Assessment ICD-10
  const [diagCode, setDiagCode] = useState(
    existingNote?.assessment.primary_diagnosis_code || "I10"
  );
  const [diagName, setDiagName] = useState(
    existingNote?.assessment.primary_diagnosis_name || "Hipertensi Esensial Primer"
  );
  const [planTreatment, setPlanTreatment] = useState(
    existingNote?.plan.treatment_plan ||
      "1. Terapi farmakologis Amlodipine 10mg 1x1 tab malam.\n2. Edukasi diet rendah garam dan olahraga teratur.\n3. Kontrol kembali 1 bulan mendatang."
  );

  // Quick Order Modal
  const [rxModalOpen, setRxModalOpen] = useState(false);
  const [labModalOpen, setLabModalOpen] = useState(false);
  const [selectedMedId, setSelectedMedId] = useState("");
  const [medDosage, setMedDosage] = useState("1 x 1 sehari sesudah makan");
  const [medQty, setMedQty] = useState(30);

  const calculatedBMI =
    weight && height ? (weight / Math.pow(height / 100, 2)).toFixed(1) : "-";

  const handleSaveSOAP = (status: "draft" | "final") => {
    if (!selectedPatient) return;

    saveClinicalNote({
      encounter_id: `enc-${Date.now()}`,
      patient_id: selectedPatient.id,
      doctor_id: currentUser.id,
      doctor_name: currentUser.full_name,
      unit_type: "rawat_jalan",
      clinic_name: selectedQueue?.clinic_name || "Poli Spesialis",
      status,
      subjective: {
        chief_complaint: chiefComplaint,
        history_of_present_illness: hpi,
        past_medical_history: pastHistory,
        family_history: "Keluarga memiliki riwayat hipertensi",
        allergy_notes: selectedPatient.allergies.join(", "),
      },
      objective: {
        vital_signs: {
          systolic_bp: Number(systolic),
          diastolic_bp: Number(diastolic),
          heart_rate: Number(heartRate),
          respiratory_rate: Number(rr),
          body_temperature: Number(temperature),
          oxygen_saturation: Number(spo2),
          weight_kg: Number(weight),
          height_cm: Number(height),
          bmi: Number(calculatedBMI),
          gcs_e: 4,
          gcs_v: 5,
          gcs_m: 6,
          pain_scale: Number(painScale),
          consciousness: "COMPOS MENTIS",
        },
        physical_examination: physicalExam,
      },
      assessment: {
        primary_diagnosis_code: diagCode,
        primary_diagnosis_name: diagName,
        secondary_diagnoses: [],
        clinical_rationale: "Hasil evaluasi klinis menunjukkan perbaikan tekanan darah",
      },
      plan: {
        treatment_plan: planTreatment,
        procedures_conducted: [{ code: "89.07", name: "Konsultasi dan Edukasi Spesialis" }],
        education_provided: "Pembatasan natrium harian dan kepatuhan konsumsi obat kronis",
        prognosis: "BONAM",
      },
      signed_at: status === "final" ? new Date().toISOString() : undefined,
      signed_by: status === "final" ? currentUser.full_name : undefined,
    });

    if (selectedQueue && status === "final") {
      updateQueueStatus(selectedQueue.id, "selesai");
    }

    alert(`Catatan SOAP berhasil disimpan sebagai [${status.toUpperCase()}].`);
  };

  const handleCreatePrescription = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient || !selectedMedId) return;

    const med = medications.find((m) => m.id === selectedMedId);
    if (!med) return;

    addPrescription({
      encounter_id: `enc-${Date.now()}`,
      patient_id: selectedPatient.id,
      patient_name: selectedPatient.full_name,
      patient_mrn: selectedPatient.mrn,
      doctor_id: currentUser.id,
      doctor_name: currentUser.full_name,
      clinic_name: selectedQueue?.clinic_name || "Poli Penyakit Dalam",
      status: "menunggu_telaah",
      items: [
        {
          id: `rxi-${Date.now()}`,
          medication_id: med.id,
          medication_name: med.name,
          dosage: "Sesuai etiket",
          frequency: medDosage,
          duration_days: 30,
          quantity: Number(medQty),
          unit: med.unit,
          dispensed_status: "menunggu",
        },
      ],
    });

    setRxModalOpen(false);
    alert(`Resep obat ${med.name} berhasil dikirim ke Instalasi Farmasi.`);
  };

  const handleOrderLab = (testCode: string, testName: string, sample: any, ref: string, unit: string) => {
    if (!selectedPatient) return;
    addLabOrder({
      encounter_id: `enc-${Date.now()}`,
      patient_id: selectedPatient.id,
      patient_name: selectedPatient.full_name,
      patient_mrn: selectedPatient.mrn,
      doctor_id: currentUser.id,
      doctor_name: currentUser.full_name,
      priority: "biasa",
      status: "diminta",
      items: [
        {
          id: `li-${Date.now()}`,
          test_code: testCode,
          test_name: testName,
          sample_type: sample,
          reference_range: ref,
          unit,
        },
      ],
    });
    setLabModalOpen(false);
    alert(`Order laboratorium ${testName} berhasil diajukan.`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Stethoscope className="h-5 w-5 text-teal-600" />
            Pelayanan Poliklinik & Rekam Medis SOAP
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pemeriksaan klinis, rekam medis terstruktur, peresepan elektronik, dan order penunjang.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Clinic Queue Patients List */}
        <div className="lg:col-span-1 space-y-3">
          <Card className="border-slate-200/90 shadow-2xs">
            <CardHeader className="p-4 border-b border-slate-100 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-bold text-slate-900">
                Antrean Poli Hari Ini ({outpatientQueues.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 space-y-1.5 max-h-[75vh] overflow-y-auto">
              {outpatientQueues.length > 0 ? (
                outpatientQueues.map((q) => {
                  const isSelected = q.id === selectedQueueId;
                  return (
                    <button
                      key={q.id}
                      onClick={() => setSelectedQueueId(q.id)}
                      className={`w-full text-left p-3 rounded-lg border transition-all text-xs cursor-pointer ${
                        isSelected
                          ? "bg-teal-50 border-teal-500 ring-2 ring-teal-500/20 shadow-xs"
                          : "bg-white border-slate-200 hover:bg-slate-50/80"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-teal-700">{q.ticket_number}</span>
                        <span
                          className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                            q.status === "dilayani"
                              ? "bg-teal-600 text-white"
                              : q.status === "dipanggil"
                              ? "bg-blue-600 text-white animate-pulse"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {q.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="font-semibold text-slate-900 mt-1 truncate">{q.patient_name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">RM: {q.patient_mrn}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{q.clinic_name}</div>
                    </button>
                  );
                })
              ) : (
                <div className="p-4 text-center text-xs text-slate-500">Tidak ada antrean poli aktif.</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: EMR SOAP Workstation */}
        <div className="lg:col-span-3 space-y-6">
          {selectedPatient ? (
            <Card className="border-slate-200/90 shadow-2xs">
              {/* Patient Banner */}
              <div className="p-4 bg-slate-900 text-white rounded-t-lg flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">{selectedPatient.full_name}</h3>
                    <span className="font-mono text-xs bg-teal-600 px-2 py-0.5 rounded text-white font-bold">
                      RM: {selectedPatient.mrn}
                    </span>
                  </div>
                  <div className="text-xs text-slate-300 mt-1">
                    NIK: {selectedPatient.nik} • {selectedPatient.gender === "L" ? "Laki-laki" : "Perempuan"} •{" "}
                    {formatDate(selectedPatient.birth_date)} • Penjamin: {selectedPatient.insurance_type}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setRxModalOpen(true)}
                    className="h-8 text-xs bg-slate-800 text-white border-slate-700 hover:bg-slate-700"
                  >
                    <Pill className="h-3.5 w-3.5 mr-1 text-teal-400" />
                    + Resep Obat
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setLabModalOpen(true)}
                    className="h-8 text-xs bg-slate-800 text-white border-slate-700 hover:bg-slate-700"
                  >
                    <FlaskConical className="h-3.5 w-3.5 mr-1 text-cyan-400" />
                    + Order Lab
                  </Button>
                </div>
              </div>

              {/* SOAP Form Content */}
              <CardContent className="p-6 space-y-6 text-xs">
                {/* S: Subjektif */}
                <div className="space-y-3 p-4 rounded-lg bg-slate-50/70 border border-slate-200">
                  <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <span className="h-5 w-5 rounded bg-teal-600 text-white flex items-center justify-center text-xs font-bold">
                      S
                    </span>
                    Subjektif (Anamnesis & Keluhan Pasien)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Keluhan Utama *</label>
                      <Input
                        value={chiefComplaint}
                        onChange={(e) => setChiefComplaint(e.target.value)}
                        placeholder="Keluhan utama yang dirasakan pasien"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">
                        Riwayat Penyakit Sekarang (RPS)
                      </label>
                      <Input
                        value={hpi}
                        onChange={(e) => setHpi(e.target.value)}
                        placeholder="Onset, durasi, perburukan, gejala penyerta"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="font-semibold text-slate-700 block mb-1">
                        Riwayat Penyakit Dahulu & Pengobatan Sebelumnya
                      </label>
                      <Input
                        value={pastHistory}
                        onChange={(e) => setPastHistory(e.target.value)}
                        placeholder="Penyakit kronis, riwayat operasi, konsumsi obat rutin"
                      />
                    </div>
                  </div>
                </div>

                {/* O: Objektif & Vital Signs */}
                <div className="space-y-3 p-4 rounded-lg bg-slate-50/70 border border-slate-200">
                  <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <span className="h-5 w-5 rounded bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                      O
                    </span>
                    Objektif (Tanda Vital & Pemeriksaan Fisik)
                  </h4>

                  {/* Vital Signs Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                    <div>
                      <label className="text-[11px] text-slate-600 font-semibold block mb-1">TD Sistolik</label>
                      <div className="relative">
                        <Input
                          type="number"
                          value={systolic}
                          onChange={(e) => setSystolic(Number(e.target.value))}
                          className="h-8 font-mono text-center"
                        />
                        <span className="text-[10px] text-slate-400 absolute right-2 top-1.5">mmHg</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] text-slate-600 font-semibold block mb-1">TD Diastolik</label>
                      <div className="relative">
                        <Input
                          type="number"
                          value={diastolic}
                          onChange={(e) => setDiastolic(Number(e.target.value))}
                          className="h-8 font-mono text-center"
                        />
                        <span className="text-[10px] text-slate-400 absolute right-2 top-1.5">mmHg</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] text-slate-600 font-semibold block mb-1">Nadi (HR)</label>
                      <div className="relative">
                        <Input
                          type="number"
                          value={heartRate}
                          onChange={(e) => setHeartRate(Number(e.target.value))}
                          className="h-8 font-mono text-center"
                        />
                        <span className="text-[10px] text-slate-400 absolute right-2 top-1.5">x/m</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] text-slate-600 font-semibold block mb-1">Respirasi (RR)</label>
                      <div className="relative">
                        <Input
                          type="number"
                          value={rr}
                          onChange={(e) => setRr(Number(e.target.value))}
                          className="h-8 font-mono text-center"
                        />
                        <span className="text-[10px] text-slate-400 absolute right-2 top-1.5">x/m</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] text-slate-600 font-semibold block mb-1">Suhu Tubuh</label>
                      <div className="relative">
                        <Input
                          type="number"
                          step="0.1"
                          value={temperature}
                          onChange={(e) => setTemperature(Number(e.target.value))}
                          className="h-8 font-mono text-center"
                        />
                        <span className="text-[10px] text-slate-400 absolute right-2 top-1.5">°C</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] text-slate-600 font-semibold block mb-1">Saturasi O2</label>
                      <div className="relative">
                        <Input
                          type="number"
                          value={spo2}
                          onChange={(e) => setSpo2(Number(e.target.value))}
                          className="h-8 font-mono text-center"
                        />
                        <span className="text-[10px] text-slate-400 absolute right-2 top-1.5">%</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] text-slate-600 font-semibold block mb-1">Berat Badan</label>
                      <div className="relative">
                        <Input
                          type="number"
                          value={weight}
                          onChange={(e) => setWeight(Number(e.target.value))}
                          className="h-8 font-mono text-center"
                        />
                        <span className="text-[10px] text-slate-400 absolute right-2 top-1.5">kg</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] text-slate-600 font-semibold block mb-1">Tinggi Badan</label>
                      <div className="relative">
                        <Input
                          type="number"
                          value={height}
                          onChange={(e) => setHeight(Number(e.target.value))}
                          className="h-8 font-mono text-center"
                        />
                        <span className="text-[10px] text-slate-400 absolute right-2 top-1.5">cm</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] text-slate-600 font-semibold block mb-1">IMT / BMI</label>
                      <div className="h-8 px-2 rounded border border-slate-200 bg-white flex items-center justify-center font-mono font-bold text-slate-800">
                        {calculatedBMI}
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] text-slate-600 font-semibold block mb-1">Skala Nyeri (0-10)</label>
                      <Input
                        type="number"
                        min="0"
                        max="10"
                        value={painScale}
                        onChange={(e) => setPainScale(Number(e.target.value))}
                        className="h-8 font-mono text-center"
                      />
                    </div>
                  </div>

                  {/* Physical Examination Textarea */}
                  <div className="mt-3">
                    <label className="font-semibold text-slate-700 block mb-1">Pemeriksaan Fisik Terstruktur</label>
                    <textarea
                      rows={3}
                      value={physicalExam}
                      onChange={(e) => setPhysicalExam(e.target.value)}
                      className="w-full p-2.5 rounded-md border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                    />
                  </div>
                </div>

                {/* A: Asesmen ICD-10 */}
                <div className="space-y-3 p-4 rounded-lg bg-slate-50/70 border border-slate-200">
                  <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <span className="h-5 w-5 rounded bg-amber-600 text-white flex items-center justify-center text-xs font-bold">
                      A
                    </span>
                    Asesmen & Diagnosis ICD-10
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Kode ICD-10 Primer *</label>
                      <select
                        value={diagCode}
                        onChange={(e) => {
                          setDiagCode(e.target.value);
                          if (e.target.value === "I10") setDiagName("Hipertensi Esensial Primer");
                          if (e.target.value === "E11.9") setDiagName("Diabetes Melitus Tipe 2");
                          if (e.target.value === "A09") setDiagName("Gastroenteritis Akut");
                          if (e.target.value === "J06.9") setDiagName("Infeksi Saluran Pernapasan Akut (ISPA)");
                          if (e.target.value === "K29.7") setDiagName("Gastritis Tidak Spesifik");
                        }}
                        className="w-full h-9 px-3 rounded-md border border-slate-200 bg-white text-xs font-mono font-bold text-teal-700"
                      >
                        <option value="I10">I10 - Hipertensi Esensial</option>
                        <option value="E11.9">E11.9 - DM Tipe 2</option>
                        <option value="A09">A09 - Gastroenteritis Akut</option>
                        <option value="J06.9">J06.9 - ISPA</option>
                        <option value="K29.7">K29.7 - Gastritis</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="font-semibold text-slate-700 block mb-1">Nama Diagnosis *</label>
                      <Input value={diagName} onChange={(e) => setDiagName(e.target.value)} />
                    </div>
                  </div>
                </div>

                {/* P: Plan / Rencana Terapi */}
                <div className="space-y-3 p-4 rounded-lg bg-slate-50/70 border border-slate-200">
                  <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <span className="h-5 w-5 rounded bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
                      P
                    </span>
                    Planning (Rencana Tindakan & Edukasi Pasien)
                  </h4>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Rencana Terapi Medis & Edukasi</label>
                    <textarea
                      rows={3}
                      value={planTreatment}
                      onChange={(e) => setPlanTreatment(e.target.value)}
                      className="w-full p-2.5 rounded-md border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200">
                  <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                    <Lock className="h-3.5 w-3.5 text-slate-400" />
                    Catatan Final akan dikunci dan ditandatangani secara digital oleh DPJP.
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSaveSOAP("draft")}
                      className="border-slate-300 hover:bg-slate-50 text-slate-700"
                    >
                      <Save className="h-4 w-4 mr-1 text-slate-500" />
                      Simpan Sebagai Draft
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleSaveSOAP("final")}
                      className="bg-teal-600 hover:bg-teal-700 text-white shadow-xs font-medium"
                    >
                      <PenTool className="h-4 w-4 mr-1.5" />
                      Finalisasi & Tanda Tangan DPJP
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="p-12 text-center border-slate-200/90 shadow-2xs">
              <User className="h-8 w-8 text-slate-300 mx-auto mb-2" />
              <h3 className="text-sm font-semibold text-slate-700">Tidak ada pasien yang dipilih</h3>
              <p className="text-xs text-slate-400 mt-1">
                Pilih pasien dari daftar antrean poliklinik di sebelah kiri untuk membuka rekam medis SOAP.
              </p>
            </Card>
          )}
        </div>
      </div>

      {/* Modal: Peresepan Elektronik Cepat */}
      <Modal
        isOpen={rxModalOpen}
        onClose={() => setRxModalOpen(false)}
        title="Buat Resep Elektronik Pasien"
        description="Pilih obat dari katalog formularium rumah sakit."
        maxWidth="md"
      >
        <form onSubmit={handleCreatePrescription} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Pilih Obat (Katalog FEFO) *</label>
            <select
              required
              value={selectedMedId}
              onChange={(e) => setSelectedMedId(e.target.value)}
              className="w-full h-9 px-3 rounded-md border border-slate-200 bg-white text-xs"
            >
              <option value="">-- Pilih Obat --</option>
              {medications.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.generic_name}) [Stok: {m.total_stock} {m.unit}]
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Jumlah (Quantity) *</label>
            <Input
              type="number"
              min="1"
              required
              value={medQty}
              onChange={(e) => setMedQty(Number(e.target.value))}
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Signa / Aturan Pakai *</label>
            <Input
              required
              value={medDosage}
              onChange={(e) => setMedDosage(e.target.value)}
              placeholder="Contoh: 3 x 1 tablet sesudah makan"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setRxModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" size="sm" className="bg-teal-600 hover:bg-teal-700 text-white">
              Kirim ke Farmasi
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Order Laboratorium Cepat */}
      <Modal
        isOpen={labModalOpen}
        onClose={() => setLabModalOpen(false)}
        title="Order Pemeriksaan Laboratorium"
        description="Pilih tes laboratorium untuk dikerjakan analis patologi klinik."
        maxWidth="md"
      >
        <div className="space-y-2.5 text-xs">
          <button
            onClick={() => handleOrderLab("DL", "Darah Lengkap Rutin (CBC)", "DARAH", "Normal", "Paket")}
            className="w-full text-left p-3 rounded-lg border border-slate-200 hover:bg-teal-50/50 hover:border-teal-300 transition-colors flex items-center justify-between"
          >
            <div>
              <div className="font-bold text-slate-900">Darah Lengkap Rutin (CBC)</div>
              <div className="text-[11px] text-slate-500">Hb, Leukosit, Trombosit, Hematokrit, Eritrosit</div>
            </div>
            <span className="font-mono text-teal-700 font-semibold text-[10px] bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
              DARAH
            </span>
          </button>

          <button
            onClick={() => handleOrderLab("GDS", "Glukosa Darah Sewaktu (GDS)", "DARAH", "< 140", "mg/dL")}
            className="w-full text-left p-3 rounded-lg border border-slate-200 hover:bg-teal-50/50 hover:border-teal-300 transition-colors flex items-center justify-between"
          >
            <div>
              <div className="font-bold text-slate-900">Glukosa Darah Sewaktu (GDS)</div>
              <div className="text-[11px] text-slate-500">Skrining diabetes & regulasi glikemik</div>
            </div>
            <span className="font-mono text-teal-700 font-semibold text-[10px] bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
              DARAH
            </span>
          </button>

          <button
            onClick={() => handleOrderLab("RFT", "Fungsi Ginjal (Ureum & Kreatinin)", "DARAH", "Normal", "mg/dL")}
            className="w-full text-left p-3 rounded-lg border border-slate-200 hover:bg-teal-50/50 hover:border-teal-300 transition-colors flex items-center justify-between"
          >
            <div>
              <div className="font-bold text-slate-900">Fungsi Ginjal (Ureum & Kreatinin)</div>
              <div className="text-[11px] text-slate-500">Evaluasi laju filtrasi glomerulus</div>
            </div>
            <span className="font-mono text-teal-700 font-semibold text-[10px] bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
              DARAH
            </span>
          </button>
        </div>
      </Modal>
    </div>
  );
}
