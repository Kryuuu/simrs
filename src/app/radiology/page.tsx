"use client";

import React, { useState } from "react";
import {
  Scan,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Printer,
  ShieldCheck,
  Search,
  FileText,
  Eye,
} from "lucide-react";
import { useSIMRS } from "@/lib/demo-store";
import { RadiologyOrder } from "@/types";
import { formatTime, formatDate } from "@/lib/formatters";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";

export default function RadiologyPage() {
  const { currentUser, radiologyOrders, completeRadiologyReport, hospitalSettings } = useSIMRS();

  const [search, setSearch] = useState("");
  const [filterModality, setFilterModality] = useState<string>("ALL");
  const [reportModalOrder, setReportModalOrder] = useState<RadiologyOrder | null>(null);
  const [printOrder, setPrintOrder] = useState<RadiologyOrder | null>(null);

  // Form State
  const [expertise, setExpertise] = useState("");
  const [conclusion, setConclusion] = useState("");

  const filteredOrders = radiologyOrders.filter((order) => {
    const matchSearch =
      order.patient_name.toLowerCase().includes(search.toLowerCase()) ||
      order.order_number.includes(search) ||
      order.patient_mrn.includes(search);
    const matchModality = filterModality === "ALL" || order.modality === filterModality;
    return matchSearch && matchModality;
  });

  const handleOpenReportModal = (order: RadiologyOrder) => {
    setReportModalOrder(order);
    setExpertise(
      order.expertise_report ||
        "Cor: Batas-batas jantung normal, CTR < 50%.\nPulmo: Corakan bronkovaskular dalam batas normal, tidak tampak infiltrat aktif.\nSinus kostofrenikus tajam, diafragma licin."
    );
    setConclusion(order.conclusion || "Cor dan pulmo dalam batas normal, tidak tampak kelainan radiologis nyata.");
  };

  const handleSaveReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportModalOrder) return;

    completeRadiologyReport(reportModalOrder.id, expertise, conclusion);
    setReportModalOrder(null);
    alert(`Ekspertise radiologi order ${reportModalOrder.order_number} berhasil disimpan.`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Scan className="h-5 w-5 text-sky-600" />
            Instalasi Radiologi & Pencitraan Diagnostik
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manajemen order modalitas X-Ray, USG, CT-Scan, dan ekspertise dokter spesialis radiologi (Sp.Rad).
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Cari No. Order Radiologi, Pasien, atau No. RM..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Modalitas:</span>
          <select
            value={filterModality}
            onChange={(e) => setFilterModality(e.target.value)}
            className="h-9 px-3 rounded-md bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700"
          >
            <option value="ALL">Semua Modalitas</option>
            <option value="X-RAY">Foto X-Ray / Rontgen</option>
            <option value="USG">Ultrasonografi (USG)</option>
            <option value="CT-SCAN">CT-Scan Multislice</option>
            <option value="MRI">Magnetic Resonance (MRI)</option>
          </select>
        </div>
      </div>

      {/* Radiology Orders Table */}
      <Card className="border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">No. Order</th>
                <th className="px-4 py-3">Nama Pasien & No. RM</th>
                <th className="px-4 py-3">Modalitas</th>
                <th className="px-4 py-3">Jenis Pemeriksaan</th>
                <th className="px-4 py-3">Indikasi Klinis</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Dokter Radiolog</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => {
                  const isDone = order.status === "hasil_selesai";
                  const isCito = order.priority === "cito";

                  return (
                    <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3.5 font-mono font-bold text-slate-900">{order.order_number}</td>
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-slate-900">{order.patient_name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">RM: {order.patient_mrn}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="font-mono font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                          {order.modality}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-slate-800">{order.examination_name}</td>
                      <td className="px-4 py-3.5 text-slate-600 max-w-xs truncate">{order.clinical_indication}</td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            isDone
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                              : "bg-amber-50 text-amber-800 border-amber-200"
                          }`}
                        >
                          {order.status.toUpperCase().replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-500">{order.radiologist_name || "-"}</td>
                      <td className="px-4 py-3.5 text-right space-x-1.5">
                        {!isDone && (
                          <Button
                            size="sm"
                            onClick={() => handleOpenReportModal(order)}
                            className="h-7 text-xs bg-sky-700 hover:bg-sky-800 text-white font-medium"
                          >
                            Isi Ekspertise
                          </Button>
                        )}
                        {isDone && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setPrintOrder(order)}
                            className="h-7 text-xs border-slate-200 hover:bg-slate-50 text-slate-700"
                          >
                            <Printer className="h-3.5 w-3.5 mr-1 text-slate-500" />
                            Cetak Laporan
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">
                    Tidak ada order radiologi pada filter ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal: Input Ekspertise Radiologi */}
      {reportModalOrder && (
        <Modal
          isOpen={Boolean(reportModalOrder)}
          onClose={() => setReportModalOrder(null)}
          title={`Ekspertise Radiologi: ${reportModalOrder.examination_name}`}
          description={`Pasien: ${reportModalOrder.patient_name} (RM: ${reportModalOrder.patient_mrn}) • Modalitas: ${reportModalOrder.modality}`}
          maxWidth="2xl"
        >
          <form onSubmit={handleSaveReport} className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Uraian Temuan Pencitraan Radiologis *
              </label>
              <textarea
                rows={5}
                required
                value={expertise}
                onChange={(e) => setExpertise(e.target.value)}
                className="w-full p-2.5 rounded-md border border-slate-200 bg-white text-xs font-sans text-slate-800"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Kesimpulan Klinis Radiologis *
              </label>
              <Input
                required
                value={conclusion}
                onChange={(e) => setConclusion(e.target.value)}
                placeholder="Contoh: Kardiomegali tanpa edema paru akut"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setReportModalOrder(null)}>
                Batal
              </Button>
              <Button type="submit" size="sm" className="bg-sky-700 hover:bg-sky-800 text-white font-medium">
                <CheckCircle2 className="h-4 w-4 mr-1" />
                Simpan & Tandatangani Ekspertise
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: Cetak Laporan Radiologi Resmi */}
      {printOrder && (
        <Modal
          isOpen={Boolean(printOrder)}
          onClose={() => setPrintOrder(null)}
          title="Laporan Hasil Pemeriksaan Radiologi"
          maxWidth="2xl"
        >
          <div className="p-6 bg-white border border-slate-200 rounded-lg space-y-4 font-sans text-xs printable-area">
            {/* Header Kop */}
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
                <div className="text-[11px] font-bold uppercase tracking-wider text-sky-700">
                  INSTALASI RADIOLOGI & DIAGNOSTIK
                </div>
                <div className="text-[10px] font-mono text-slate-500">Unit Pencitraan Digital</div>
              </div>
            </div>

            {/* Patient Header */}
            <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-3 rounded border border-slate-200">
              <div>
                No. Rekam Medis: <strong className="font-mono">{printOrder.patient_mrn}</strong>
              </div>
              <div>
                No. Order: <strong className="font-mono">{printOrder.order_number}</strong>
              </div>
              <div>
                Nama Pasien: <strong>{printOrder.patient_name}</strong>
              </div>
              <div>
                Modalitas: <strong className="font-mono">{printOrder.modality}</strong>
              </div>
              <div>
                Pemeriksaan: <strong className="text-slate-800">{printOrder.examination_name}</strong>
              </div>
              <div>
                Tgl Selesai: <span className="font-mono">{formatDate(printOrder.created_at)}</span>
              </div>
            </div>

            {/* Indication */}
            <div>
              <strong className="text-slate-700 block mb-1">Indikasi Klinis:</strong>
              <p className="text-slate-600 bg-slate-50/50 p-2 rounded border border-slate-100">
                {printOrder.clinical_indication}
              </p>
            </div>

            {/* Findings */}
            <div>
              <strong className="text-slate-700 block mb-1">Temuan Radiologis (Ekspertise):</strong>
              <div className="p-3 bg-slate-50 rounded border border-slate-200 whitespace-pre-line text-slate-800 leading-relaxed">
                {printOrder.expertise_report}
              </div>
            </div>

            {/* Conclusion */}
            <div className="p-3 bg-sky-50/50 border border-sky-200 rounded">
              <strong className="text-sky-900 block mb-0.5">Kesimpulan:</strong>
              <p className="font-semibold text-slate-900">{printOrder.conclusion}</p>
            </div>

            {/* Signatures */}
            <div className="pt-8 flex justify-end text-center text-xs">
              <div className="w-56">
                <p className="text-slate-500">Dokter Spesialis Radiologi,</p>
                <div className="h-12" />
                <p className="font-bold text-slate-900">
                  {printOrder.radiologist_name || "dr. Hendrawan, Sp.Rad"}
                </p>
                <p className="text-[10px] text-slate-400 font-mono">SIP: 503/SIP.D-Sp/098/2023</p>
              </div>
            </div>

            <div className="pt-4 no-print flex justify-end gap-2">
              <Button size="sm" className="bg-sky-700 hover:bg-sky-800 text-white" onClick={() => window.print()}>
                <Printer className="h-4 w-4 mr-1" /> Cetak Lembar Ekspertise
              </Button>
              <Button size="sm" variant="outline" onClick={() => setPrintOrder(null)}>
                Tutup
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
