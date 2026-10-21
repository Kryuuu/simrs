"use client";

import React, { useState } from "react";
import {
  FlaskConical,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Printer,
  ShieldCheck,
  Search,
  FileText,
  UserCheck,
} from "lucide-react";
import { useSIMRS } from "@/lib/demo-store";
import { LabOrder } from "@/types";
import { formatTime, formatDate } from "@/lib/formatters";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";

export default function LaboratoryPage() {
  const { currentUser, labOrders, updateLabResult, validateLabOrder, hospitalSettings } = useSIMRS();

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [inputResultOrder, setInputResultOrder] = useState<LabOrder | null>(null);
  const [printOrder, setPrintOrder] = useState<LabOrder | null>(null);

  // Result input state for active item
  const [itemResults, setItemResults] = useState<Record<string, { val: string; interp: any }>>({});

  const filteredOrders = labOrders.filter((order) => {
    const matchSearch =
      order.patient_name.toLowerCase().includes(search.toLowerCase()) ||
      order.order_number.includes(search) ||
      order.patient_mrn.includes(search);
    const matchStatus = filterStatus === "ALL" || order.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleOpenResultModal = (order: LabOrder) => {
    setInputResultOrder(order);
    const initial: Record<string, { val: string; interp: any }> = {};
    order.items.forEach((it) => {
      initial[it.id] = { val: it.result_value || "", interp: it.interpretation || "NORMAL" };
    });
    setItemResults(initial);
  };

  const handleSaveResults = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputResultOrder) return;

    inputResultOrder.items.forEach((it) => {
      const res = itemResults[it.id];
      if (res && res.val) {
        updateLabResult(inputResultOrder.id, it.id, res.val, res.interp);
      }
    });

    validateLabOrder(inputResultOrder.id);
    setInputResultOrder(null);
    alert(`Hasil pemeriksaan ${inputResultOrder.order_number} berhasil divalidasi oleh analis.`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FlaskConical className="h-5 w-5 text-cyan-600" />
            Laboratorium Patologi Klinik
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Penerimaan spesimen, entri hasil dengan nilai rujukan, validasi analis medis, dan cetak hasil resmi.
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Cari No. Order Lab, Pasien, atau No. RM..."
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
            <option value="diminta">Diminta</option>
            <option value="dalam_proses">Dalam Proses</option>
            <option value="menunggu_validasi">Menunggu Validasi</option>
            <option value="selesai">Selesai Divalidasi</option>
          </select>
        </div>
      </div>

      {/* Lab Orders Table */}
      <Card className="border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">No. Order Lab</th>
                <th className="px-4 py-3">Nama Pasien & No. RM</th>
                <th className="px-4 py-3">Prioritas</th>
                <th className="px-4 py-3">Dokter Perujuk</th>
                <th className="px-4 py-3">Pemeriksaan yang Diminta</th>
                <th className="px-4 py-3">Status Pemeriksaan</th>
                <th className="px-4 py-3">Validator</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => {
                  const isDone = order.status === "selesai";
                  const isCito = order.priority === "cito";

                  return (
                    <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3.5 font-mono font-bold text-slate-900">{order.order_number}</td>
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-slate-900">{order.patient_name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">RM: {order.patient_mrn}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isCito ? "bg-red-600 text-white animate-pulse" : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {order.priority.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">{order.doctor_name}</td>
                      <td className="px-4 py-3.5 max-w-xs">
                        <div className="space-y-1">
                          {order.items.map((it) => (
                            <div key={it.id} className="text-[11px]">
                              <strong>{it.test_name}</strong>
                              {it.result_value && (
                                <span className="ml-1 text-teal-700 font-mono font-bold">
                                  : {it.result_value} {it.unit}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </td>
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
                      <td className="px-4 py-3.5 text-slate-500">{order.validator_name || "-"}</td>
                      <td className="px-4 py-3.5 text-right space-x-1.5">
                        {!isDone && (
                          <Button
                            size="sm"
                            onClick={() => handleOpenResultModal(order)}
                            className="h-7 text-xs bg-cyan-700 hover:bg-cyan-800 text-white"
                          >
                            Entri Hasil & Validasi
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
                            Cetak Hasil
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">
                    Tidak ada order laboratorium pada filter ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal: Input Hasil Lab & Validasi */}
      {inputResultOrder && (
        <Modal
          isOpen={Boolean(inputResultOrder)}
          onClose={() => setInputResultOrder(null)}
          title={`Entri Hasil Laboratorium: ${inputResultOrder.order_number}`}
          description={`Pasien: ${inputResultOrder.patient_name} (RM: ${inputResultOrder.patient_mrn})`}
          maxWidth="2xl"
        >
          <form onSubmit={handleSaveResults} className="space-y-4 text-xs">
            <div className="space-y-3">
              {inputResultOrder.items.map((item) => (
                <div key={item.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900">{item.test_name}</span>
                      <span className="text-slate-500 text-[11px] ml-2">
                        Sampel: <strong className="font-mono">{item.sample_type}</strong>
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 font-mono">
                      Nilai Rujukan: {item.reference_range} {item.unit}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                        Nilai Hasil Pemeriksaan *
                      </label>
                      <Input
                        required
                        placeholder={`Contoh: 14.5 (${item.unit})`}
                        value={itemResults[item.id]?.val || ""}
                        onChange={(e) =>
                          setItemResults((prev) => ({
                            ...prev,
                            [item.id]: {
                              ...prev[item.id],
                              val: e.target.value,
                            },
                          }))
                        }
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                        Interpretasi Hasil
                      </label>
                      <select
                        value={itemResults[item.id]?.interp || "NORMAL"}
                        onChange={(e) =>
                          setItemResults((prev) => ({
                            ...prev,
                            [item.id]: {
                              ...prev[item.id],
                              interp: e.target.value as any,
                            },
                          }))
                        }
                        className="w-full h-9 px-3 rounded-md border border-slate-200 bg-white text-xs font-semibold"
                      >
                        <option value="NORMAL">Normal</option>
                        <option value="RENDAH">Rendah (Low)</option>
                        <option value="TINGGI">Tinggi (High)</option>
                        <option value="KRITIS">Kritis (Panic Value)</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setInputResultOrder(null)}>
                Batal
              </Button>
              <Button type="submit" size="sm" className="bg-cyan-700 hover:bg-cyan-800 text-white font-medium">
                <CheckCircle2 className="h-4 w-4 mr-1" />
                Simpan & Validasi Hasil
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: Cetak Hasil Laboratorium Resmi */}
      {printOrder && (
        <Modal
          isOpen={Boolean(printOrder)}
          onClose={() => setPrintOrder(null)}
          title="Hasil Pemeriksaan Laboratorium Patologi Klinik"
          maxWidth="2xl"
        >
          <div className="p-6 bg-white border border-slate-200 rounded-lg space-y-4 font-sans text-xs printable-area">
            {/* Kop Surat Rumah Sakit */}
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
                <div className="text-[11px] font-bold uppercase tracking-wider text-teal-700">
                  INSTALASI LABORATORIUM
                </div>
                <div className="text-[10px] font-mono text-slate-500">Kemenkes Akreditasi Paripurna</div>
              </div>
            </div>

            {/* Patient Header Details */}
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
                Tgl Selesai: <span className="font-mono">{formatDate(printOrder.created_at)}</span>
              </div>
              <div>
                Dokter Pengirim: <span>{printOrder.doctor_name}</span>
              </div>
              <div>
                Validator: <span>{printOrder.validator_name || currentUser.full_name}</span>
              </div>
            </div>

            {/* Results Table */}
            <table className="w-full text-left text-xs border border-slate-300">
              <thead className="bg-slate-100 font-bold border-b border-slate-300">
                <tr>
                  <th className="p-2 border-r border-slate-300">Pemeriksaan</th>
                  <th className="p-2 border-r border-slate-300">Hasil</th>
                  <th className="p-2 border-r border-slate-300">Satuan</th>
                  <th className="p-2 border-r border-slate-300">Nilai Rujukan</th>
                  <th className="p-2">Interpretasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono">
                {printOrder.items.map((it) => (
                  <tr key={it.id}>
                    <td className="p-2 font-sans font-medium border-r border-slate-300">{it.test_name}</td>
                    <td className="p-2 font-bold text-slate-900 border-r border-slate-300">{it.result_value || "-"}</td>
                    <td className="p-2 border-r border-slate-300">{it.unit}</td>
                    <td className="p-2 border-r border-slate-300">{it.reference_range}</td>
                    <td className="p-2">
                      <span
                        className={`font-sans font-bold text-[10px] px-1.5 py-0.2 rounded ${
                          it.interpretation === "NORMAL"
                            ? "text-emerald-700 bg-emerald-50"
                            : "text-red-700 bg-red-50"
                        }`}
                      >
                        {it.interpretation || "NORMAL"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Signatures */}
            <div className="pt-8 flex justify-between text-center text-xs">
              <div>
                <p className="text-slate-500">Petugas Analis,</p>
                <div className="h-12" />
                <p className="font-semibold text-slate-900">Dewi Anggraeni, A.Md.AK</p>
              </div>
              <div>
                <p className="text-slate-500">Dokter Penanggung Jawab Lab,</p>
                <div className="h-12" />
                <p className="font-semibold text-slate-900">
                  {printOrder.validator_name || currentUser.full_name}
                </p>
              </div>
            </div>

            <div className="pt-4 no-print flex justify-end gap-2">
              <Button size="sm" className="bg-cyan-700 hover:bg-cyan-800 text-white" onClick={() => window.print()}>
                <Printer className="h-4 w-4 mr-1" /> Cetak Hasil Lab
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
