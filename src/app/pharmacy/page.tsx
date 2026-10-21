"use client";

import React, { useState } from "react";
import {
  Pill,
  CheckCircle2,
  Clock,
  AlertTriangle,
  UserCheck,
  ShieldCheck,
  Printer,
  FileCheck,
  Search,
  PackageCheck,
} from "lucide-react";
import { useSIMRS } from "@/lib/demo-store";
import { Prescription } from "@/types";
import { formatTime, formatDate } from "@/lib/formatters";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";

export default function PharmacyPage() {
  const {
    currentUser,
    prescriptions,
    medications,
    verifyPrescription,
    dispensePrescription,
    hospitalSettings,
  } = useSIMRS();

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [verifyModalPrescription, setVerifyModalPrescription] = useState<Prescription | null>(null);
  const [printLabelPrescription, setPrintLabelPrescription] = useState<Prescription | null>(null);
  const [pharmacistNotes, setPharmacistNotes] = useState(
    "Telaah 7 Benar selesai: Tidak ada interaksi obat mayor, dosis dan rute pemberian sesuai kondisi klinis pasien."
  );

  const filteredPrescriptions = prescriptions.filter((rx) => {
    const matchSearch =
      rx.patient_name.toLowerCase().includes(search.toLowerCase()) ||
      rx.prescription_number.includes(search) ||
      rx.patient_mrn.includes(search);
    const matchStatus = filterStatus === "ALL" || rx.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const pendingVerificationCount = prescriptions.filter((p) => p.status === "menunggu_telaah").length;
  const verifiedCount = prescriptions.filter((p) => p.status === "terverifikasi").length;
  const completedCount = prescriptions.filter((p) => p.status === "selesai").length;

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyModalPrescription) return;

    verifyPrescription(verifyModalPrescription.id, pharmacistNotes);
    setVerifyModalPrescription(null);
    alert(`Resep ${verifyModalPrescription.prescription_number} berhasil diverifikasi oleh Apoteker.`);
  };

  const handleDispense = (rxId: string) => {
    dispensePrescription(rxId);
    alert("Obat berhasil diserahkan ke pasien dan stok batch FEFO berkurang secara atomik.");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Pill className="h-5 w-5 text-indigo-600" />
            Instalasi Farmasi & Pelayanan Resep Elektronik
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Telaah resep 7 benar oleh Apoteker, dispensing batch FEFO (First Expired First Out), dan pencetakan etiket.
          </p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-amber-200 bg-amber-50/40 shadow-2xs">
          <CardContent className="p-4">
            <div className="text-[11px] font-bold text-amber-800 uppercase tracking-wider flex items-center justify-between">
              <span>Menunggu Telaah Apoteker</span>
              <Clock className="h-4 w-4 text-amber-600" />
            </div>
            <div className="text-2xl font-black text-amber-700 mt-1">{pendingVerificationCount} Resep</div>
            <div className="text-[10px] text-amber-700 font-medium mt-0.5">Memerlukan telaah administratif & klinis</div>
          </CardContent>
        </Card>

        <Card className="border-teal-200 bg-teal-50/40 shadow-2xs">
          <CardContent className="p-4">
            <div className="text-[11px] font-bold text-teal-800 uppercase tracking-wider flex items-center justify-between">
              <span>Terverifikasi (Siap Racik)</span>
              <CheckCircle2 className="h-4 w-4 text-teal-600" />
            </div>
            <div className="text-2xl font-black text-teal-700 mt-1">{verifiedCount} Resep</div>
            <div className="text-[10px] text-teal-700 font-medium mt-0.5">Siap dispensing & pengurangan batch FEFO</div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-2xs">
          <CardContent className="p-4">
            <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center justify-between">
              <span>Resep Selesai / Diserahkan</span>
              <PackageCheck className="h-4 w-4 text-slate-500" />
            </div>
            <div className="text-2xl font-black text-slate-900 mt-1">{completedCount} Resep</div>
            <div className="text-[10px] text-slate-500 font-medium mt-0.5">Penyerahan obat ke pasien selesai</div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Cari berdasarkan No. Resep, Pasien, atau No. RM..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Status:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="h-9 px-3 rounded-md bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700"
          >
            <option value="ALL">Semua Status</option>
            <option value="menunggu_telaah">Menunggu Telaah</option>
            <option value="terverifikasi">Terverifikasi</option>
            <option value="selesai">Selesai Diserahkan</option>
          </select>
        </div>
      </div>

      {/* Prescriptions List Table */}
      <Card className="border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">No. Resep</th>
                <th className="px-4 py-3">Nama Pasien & No. RM</th>
                <th className="px-4 py-3">Dokter Penulis Resep</th>
                <th className="px-4 py-3">Rincian Obat & Dosis</th>
                <th className="px-4 py-3">Status Verifikasi</th>
                <th className="px-4 py-3">Waktu Masuk</th>
                <th className="px-4 py-3 text-right">Aksi Farmasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal">
              {filteredPrescriptions.length > 0 ? (
                filteredPrescriptions.map((rx) => {
                  const isPending = rx.status === "menunggu_telaah";
                  const isVerified = rx.status === "terverifikasi";
                  const isDone = rx.status === "selesai";

                  return (
                    <tr key={rx.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3.5 font-mono font-bold text-slate-900">{rx.prescription_number}</td>
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-slate-900">{rx.patient_name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">RM: {rx.patient_mrn}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-medium text-slate-800">{rx.doctor_name}</div>
                        <div className="text-[10px] text-slate-400">{rx.clinic_name || "Rawat Jalan"}</div>
                      </td>
                      <td className="px-4 py-3.5 max-w-xs">
                        <div className="space-y-1">
                          {rx.items.map((item) => (
                            <div key={item.id} className="text-[11px] leading-tight">
                              <strong>{item.medication_name}</strong> ({item.quantity} {item.unit}) •{" "}
                              <span className="text-slate-500">{item.frequency}</span>
                            </div>
                          ))}
                        </div>
                        {rx.pharmacist_notes && (
                          <div className="text-[10px] text-teal-700 mt-1 italic">
                            Catatan Apoteker: &quot;{rx.pharmacist_notes}&quot;
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            isPending
                              ? "bg-amber-50 text-amber-800 border-amber-200"
                              : isVerified
                              ? "bg-teal-50 text-teal-800 border-teal-200"
                              : "bg-emerald-50 text-emerald-800 border-emerald-200"
                          }`}
                        >
                          {rx.status.toUpperCase().replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-[11px] text-slate-500">
                        {formatTime(rx.created_at)}
                      </td>
                      <td className="px-4 py-3.5 text-right space-x-1.5">
                        {isPending && (
                          <Button
                            size="sm"
                            onClick={() => setVerifyModalPrescription(rx)}
                            className="h-7 text-xs bg-amber-600 hover:bg-amber-700 text-white font-medium"
                          >
                            <ShieldCheck className="h-3.5 w-3.5 mr-1" />
                            Telaah 7 Benar
                          </Button>
                        )}

                        {isVerified && (
                          <Button
                            size="sm"
                            onClick={() => handleDispense(rx.id)}
                            className="h-7 text-xs bg-teal-600 hover:bg-teal-700 text-white font-medium"
                          >
                            <PackageCheck className="h-3.5 w-3.5 mr-1" />
                            Dispensing FEFO
                          </Button>
                        )}

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setPrintLabelPrescription(rx)}
                          className="h-7 text-xs border-slate-200 hover:bg-slate-50 text-slate-700"
                          title="Cetak Etiket Aturan Pakai"
                        >
                          <Printer className="h-3.5 w-3.5 mr-1 text-slate-500" />
                          Etiket
                        </Button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    Tidak ada resep yang sesuai dengan filter atau kata kunci.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal: Telaah Resep 7 Benar oleh Apoteker */}
      {verifyModalPrescription && (
        <Modal
          isOpen={Boolean(verifyModalPrescription)}
          onClose={() => setVerifyModalPrescription(null)}
          title={`Telaah Resep Klinis: ${verifyModalPrescription.prescription_number}`}
          description={`Pasien: ${verifyModalPrescription.patient_name} (RM: ${verifyModalPrescription.patient_mrn})`}
          maxWidth="lg"
        >
          <form onSubmit={handleVerifySubmit} className="space-y-4 text-xs">
            {/* Checklist 7 Benar Standar Kemenkes */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
              <span className="font-bold text-slate-900 block text-xs">
                Checklist Prinsip 7 Benar Dispensing Obat:
              </span>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-700">
                <label className="flex items-center gap-1.5">
                  <input type="checkbox" defaultChecked className="rounded text-teal-600" /> 1. Benar Pasien
                </label>
                <label className="flex items-center gap-1.5">
                  <input type="checkbox" defaultChecked className="rounded text-teal-600" /> 2. Benar Obat
                </label>
                <label className="flex items-center gap-1.5">
                  <input type="checkbox" defaultChecked className="rounded text-teal-600" /> 3. Benar Dosis
                </label>
                <label className="flex items-center gap-1.5">
                  <input type="checkbox" defaultChecked className="rounded text-teal-600" /> 4. Benar Rute
                </label>
                <label className="flex items-center gap-1.5">
                  <input type="checkbox" defaultChecked className="rounded text-teal-600" /> 5. Benar Waktu
                </label>
                <label className="flex items-center gap-1.5">
                  <input type="checkbox" defaultChecked className="rounded text-teal-600" /> 6. Benar Dokumentasi
                </label>
                <label className="flex items-center gap-1.5 col-span-2">
                  <input type="checkbox" defaultChecked className="rounded text-teal-600" /> 7. Benar Informasi & Edukasi
                </label>
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Catatan Telaah Klinis / Alergi / Duplikasi Obat oleh Apoteker *
              </label>
              <textarea
                rows={3}
                required
                value={pharmacistNotes}
                onChange={(e) => setPharmacistNotes(e.target.value)}
                className="w-full p-2.5 rounded-md border border-slate-200 bg-white text-xs text-slate-800"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setVerifyModalPrescription(null)}>
                Batal
              </Button>
              <Button type="submit" size="sm" className="bg-teal-600 hover:bg-teal-700 text-white font-medium">
                <CheckCircle2 className="h-4 w-4 mr-1" />
                Verifikasi & Siapkan Racikan
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: Cetak Etiket Aturan Pakai Obat */}
      {printLabelPrescription && (
        <Modal
          isOpen={Boolean(printLabelPrescription)}
          onClose={() => setPrintLabelPrescription(null)}
          title="Cetak Etiket Aturan Pakai Obat"
          maxWidth="sm"
        >
          <div className="space-y-4 font-sans text-xs printable-area">
            {printLabelPrescription.items.map((item, idx) => (
              <div
                key={item.id}
                className="p-3.5 border-2 border-slate-800 rounded bg-white text-slate-900 space-y-1.5"
              >
                <div className="border-b border-slate-300 pb-1 text-center">
                  <div className="font-bold text-[11px] uppercase tracking-wide">
                    {hospitalSettings.hospital_name}
                  </div>
                  <div className="text-[9px] text-slate-500 font-mono">
                    INSTALASI FARMASI • SIPA: 440/SIPA-023
                  </div>
                </div>

                <div className="flex justify-between text-[10px] font-mono border-b border-slate-200 pb-1">
                  <span>No: {printLabelPrescription.prescription_number}</span>
                  <span>Tgl: {formatDate(printLabelPrescription.created_at)}</span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500">Pasien:</span>
                  <div className="font-bold text-xs">
                    {printLabelPrescription.patient_name} ({printLabelPrescription.patient_mrn})
                  </div>
                </div>

                <div className="my-1.5 p-1.5 bg-slate-50 border border-slate-200 rounded text-center">
                  <div className="font-bold text-xs text-teal-800">{item.medication_name}</div>
                  <div className="text-[11px] font-bold text-slate-900 mt-0.5">{item.frequency}</div>
                </div>

                <div className="text-[9px] text-slate-500 text-center italic">
                  * Simpan di tempat sejuk & kering, jauhkan dari jangkauan anak.
                </div>
              </div>
            ))}

            <div className="pt-2 no-print flex gap-2">
              <Button
                size="sm"
                className="w-full bg-teal-600 hover:bg-teal-700 text-white"
                onClick={() => window.print()}
              >
                <Printer className="h-4 w-4 mr-1" /> Cetak Etiket
              </Button>
              <Button size="sm" variant="outline" onClick={() => setPrintLabelPrescription(null)}>
                Tutup
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
