"use client";

import React, { useState } from "react";
import {
  FileSpreadsheet,
  Download,
  Printer,
  Calendar,
  Filter,
  BarChart3,
  TrendingUp,
  FileText,
} from "lucide-react";
import { useSIMRS } from "@/lib/demo-store";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ReportsPage() {
  const {
    hospitalSettings,
    patients,
    registrations,
    clinicalNotes,
    beds,
    invoices,
    medications,
    currentUser,
  } = useSIMRS();

  const [reportType, setReportType] = useState<"kunjungan" | "penyakit" | "bor" | "pendapatan">("kunjungan");
  const [currentDateStr, setCurrentDateStr] = useState("21 Oktober 2026");

  React.useEffect(() => {
    setCurrentDateStr(formatDate(new Date()));
  }, []);

  // Export CSV handler
  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,\uFEFF"; // UTF-8 BOM for Excel

    if (reportType === "kunjungan") {
      csvContent += "No Registrasi,Nama Pasien,No RM,Jenis Kunjungan,Poli/Unit,Dokter,Penjamin,Status,Waktu\r\n";
      registrations.forEach((r) => {
        csvContent += `"${r.registration_number}","${r.patient_name}","${r.patient_mrn}","${r.visit_type}","${r.clinic_name || '-'}","${r.doctor_name || '-'}","${r.insurance_type}","${r.status}","${r.created_at}"\r\n`;
      });
    } else if (reportType === "penyakit") {
      csvContent += "Kode ICD-10,Nama Diagnosis Penyakit,Jumlah Kasus\r\n";
      csvContent += `"I10","Hipertensi Esensial Primer",12\r\n`;
      csvContent += `"E11.9","Diabetes Melitus Tipe 2",8\r\n`;
      csvContent += `"A09","Gastroenteritis dan Diare Akut",5\r\n`;
      csvContent += `"J06.9","Infeksi Saluran Pernapasan Akut (ISPA)",4\r\n`;
      csvContent += `"K29.7","Gastritis Tidak Spesifik",3\r\n`;
    } else if (reportType === "pendapatan") {
      csvContent += "No Tagihan,Nama Pasien,No RM,Penjamin,Grand Total,Sudah Dibayar,Sisa,Status,Waktu\r\n";
      invoices.forEach((inv) => {
        csvContent += `"${inv.invoice_number}","${inv.patient_name}","${inv.patient_mrn}","${inv.insurance_type}",${inv.grand_total},${inv.paid_amount},${inv.remaining_amount},"${inv.status}","${inv.created_at}"\r\n`;
      });
    } else {
      csvContent += "Nomor Bed,Ruangan,Kelas,Status,Tarif Per Malam\r\n";
      beds.forEach((b) => {
        csvContent += `"${b.bed_number}","${b.room_number}","${b.room_class}","${b.status}",${b.tariff_per_night}\r\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Laporan_SIMRS_${reportType}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-teal-600" />
            Laporan Operasional & Statistik Rumah Sakit
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Ekspor data kunjungan, rekapitulasi penyakit 10 besar (ICD-10), okupansi tempat tidur, dan keuangan kasir.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleExportCSV}
            className="border-slate-300 text-slate-700 hover:bg-slate-50"
          >
            <Download className="h-4 w-4 mr-1 text-teal-600" />
            Ekspor ke CSV (Excel)
          </Button>
          <Button
            size="sm"
            onClick={() => window.print()}
            className="bg-teal-600 hover:bg-teal-700 text-white shadow-xs font-medium"
          >
            <Printer className="h-4 w-4 mr-1" />
            Cetak Laporan PDF
          </Button>
        </div>
      </div>

      {/* Report Type Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-print">
        <button
          onClick={() => setReportType("kunjungan")}
          className={`px-3.5 py-2 rounded-lg border font-semibold transition-all ${
            reportType === "kunjungan"
              ? "bg-teal-600 text-white border-teal-600 shadow-xs"
              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
          }`}
        >
          Laporan Kunjungan Pasien
        </button>
        <button
          onClick={() => setReportType("penyakit")}
          className={`px-3.5 py-2 rounded-lg border font-semibold transition-all ${
            reportType === "penyakit"
              ? "bg-teal-600 text-white border-teal-600 shadow-xs"
              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
          }`}
        >
          10 Besar Penyakit (ICD-10)
        </button>
        <button
          onClick={() => setReportType("bor")}
          className={`px-3.5 py-2 rounded-lg border font-semibold transition-all ${
            reportType === "bor"
              ? "bg-teal-600 text-white border-teal-600 shadow-xs"
              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
          }`}
        >
          Okupansi Bed (BOR Rawat Inap)
        </button>
        <button
          onClick={() => setReportType("pendapatan")}
          className={`px-3.5 py-2 rounded-lg border font-semibold transition-all ${
            reportType === "pendapatan"
              ? "bg-teal-600 text-white border-teal-600 shadow-xs"
              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
          }`}
        >
          Rekapitulasi Keuangan Kasir
        </button>
      </div>

      {/* Printable Report Paper Layout */}
      <Card className="border-slate-200/90 shadow-2xs printable-area bg-white p-6 space-y-6">
        {/* Kop Resmi Laporan */}
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
              LAPORAN RESMI OPERASIONAL
            </div>
            <div className="text-[11px] text-slate-500">
              Periode: {currentDateStr}
            </div>
            <div className="text-[10px] font-mono text-slate-400">Dicetak oleh: {currentUser.full_name}</div>
          </div>
        </div>

        {/* Content Table 1: Kunjungan */}
        {reportType === "kunjungan" && (
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-slate-900">Rekapitulasi Registrasi & Kunjungan Pasien</h4>
            <table className="w-full text-left text-xs border border-slate-200">
              <thead className="bg-slate-50 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-2 border-r border-slate-200">No. Registrasi</th>
                  <th className="p-2 border-r border-slate-200">Nama Pasien & RM</th>
                  <th className="p-2 border-r border-slate-200">Jenis Layanan</th>
                  <th className="p-2 border-r border-slate-200">Poli / Dokter</th>
                  <th className="p-2 border-r border-slate-200">Penjamin</th>
                  <th className="p-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-normal">
                {registrations.map((r) => (
                  <tr key={r.id}>
                    <td className="p-2 font-mono font-bold border-r border-slate-200">{r.registration_number}</td>
                    <td className="p-2 border-r border-slate-200">
                      <strong>{r.patient_name}</strong> ({r.patient_mrn})
                    </td>
                    <td className="p-2 border-r border-slate-200 uppercase">{r.visit_type}</td>
                    <td className="p-2 border-r border-slate-200">
                      {r.clinic_name || "IGD"} - {r.doctor_name || "-"}
                    </td>
                    <td className="p-2 border-r border-slate-200">{r.insurance_type}</td>
                    <td className="p-2 text-right uppercase font-semibold text-teal-700">{r.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Content Table 2: 10 Besar Penyakit */}
        {reportType === "penyakit" && (
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-slate-900">
              Laporan 10 Besar Penyakit Rawat Jalan & IGD (Kode ICD-10)
            </h4>
            <table className="w-full text-left text-xs border border-slate-200">
              <thead className="bg-slate-50 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-2 border-r border-slate-200 w-16 text-center">Peringkat</th>
                  <th className="p-2 border-r border-slate-200 w-32 font-mono">Kode ICD-10</th>
                  <th className="p-2 border-r border-slate-200">Deskripsi Diagnosis Penyakit</th>
                  <th className="p-2 text-right w-32">Jumlah Kasus</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-normal">
                <tr>
                  <td className="p-2 text-center font-bold border-r border-slate-200">1</td>
                  <td className="p-2 font-mono font-bold text-teal-700 border-r border-slate-200">I10</td>
                  <td className="p-2 border-r border-slate-200 font-semibold text-slate-900">
                    Hipertensi Esensial Primer
                  </td>
                  <td className="p-2 text-right font-mono font-bold">12 Pasien</td>
                </tr>
                <tr>
                  <td className="p-2 text-center font-bold border-r border-slate-200">2</td>
                  <td className="p-2 font-mono font-bold text-teal-700 border-r border-slate-200">E11.9</td>
                  <td className="p-2 border-r border-slate-200 font-semibold text-slate-900">
                    Diabetes Melitus Tipe 2 Tanpa Komplikasi
                  </td>
                  <td className="p-2 text-right font-mono font-bold">8 Pasien</td>
                </tr>
                <tr>
                  <td className="p-2 text-center font-bold border-r border-slate-200">3</td>
                  <td className="p-2 font-mono font-bold text-teal-700 border-r border-slate-200">A09</td>
                  <td className="p-2 border-r border-slate-200 font-semibold text-slate-900">
                    Gastroenteritis dan Diare Akut
                  </td>
                  <td className="p-2 text-right font-mono font-bold">5 Pasien</td>
                </tr>
                <tr>
                  <td className="p-2 text-center font-bold border-r border-slate-200">4</td>
                  <td className="p-2 font-mono font-bold text-teal-700 border-r border-slate-200">J06.9</td>
                  <td className="p-2 border-r border-slate-200 font-semibold text-slate-900">
                    Infeksi Saluran Pernapasan Akut (ISPA)
                  </td>
                  <td className="p-2 text-right font-mono font-bold">4 Pasien</td>
                </tr>
                <tr>
                  <td className="p-2 text-center font-bold border-r border-slate-200">5</td>
                  <td className="p-2 font-mono font-bold text-teal-700 border-r border-slate-200">K29.7</td>
                  <td className="p-2 border-r border-slate-200 font-semibold text-slate-900">
                    Gastritis Tidak Spesifik
                  </td>
                  <td className="p-2 text-right font-mono font-bold">3 Pasien</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Content Table 3: BOR Tempat Tidur */}
        {reportType === "bor" && (
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-slate-900">
              Laporan Sensus Harian & Okupansi Tempat Tidur (BOR)
            </h4>
            <table className="w-full text-left text-xs border border-slate-200">
              <thead className="bg-slate-50 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-2 border-r border-slate-200">Nomor Bed</th>
                  <th className="p-2 border-r border-slate-200">Ruangan & Kelas</th>
                  <th className="p-2 border-r border-slate-200">Status Saat Ini</th>
                  <th className="p-2 border-r border-slate-200">Pasien Terisi</th>
                  <th className="p-2 text-right">Tarif / Malam</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-normal">
                {beds.map((b) => (
                  <tr key={b.id}>
                    <td className="p-2 font-bold font-mono border-r border-slate-200">{b.bed_number}</td>
                    <td className="p-2 border-r border-slate-200">
                      {b.room_number} (Kelas {b.room_class})
                    </td>
                    <td className="p-2 border-r border-slate-200">
                      <span className="font-semibold">{b.status}</span>
                    </td>
                    <td className="p-2 border-r border-slate-200">
                      {b.patient_name ? `${b.patient_name} (${b.patient_mrn})` : "-"}
                    </td>
                    <td className="p-2 text-right font-mono">{formatCurrency(b.tariff_per_night)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Content Table 4: Keuangan Kasir */}
        {reportType === "pendapatan" && (
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-slate-900">Rekapitulasi Penerimaan Kasir & Tagihan</h4>
            <table className="w-full text-left text-xs border border-slate-200">
              <thead className="bg-slate-50 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-2 border-r border-slate-200">No. Tagihan</th>
                  <th className="p-2 border-r border-slate-200">Nama Pasien & RM</th>
                  <th className="p-2 border-r border-slate-200">Penjamin</th>
                  <th className="p-2 border-r border-slate-200 text-right">Grand Total</th>
                  <th className="p-2 border-r border-slate-200 text-right">Sudah Dibayar</th>
                  <th className="p-2 border-r border-slate-200 text-right">Sisa Piutang</th>
                  <th className="p-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-normal">
                {invoices.map((inv) => (
                  <tr key={inv.id}>
                    <td className="p-2 font-mono font-bold border-r border-slate-200">{inv.invoice_number}</td>
                    <td className="p-2 border-r border-slate-200">
                      <strong>{inv.patient_name}</strong> ({inv.patient_mrn})
                    </td>
                    <td className="p-2 border-r border-slate-200">{inv.insurance_type}</td>
                    <td className="p-2 text-right font-mono border-r border-slate-200">
                      {formatCurrency(inv.grand_total)}
                    </td>
                    <td className="p-2 text-right font-mono font-semibold text-emerald-700 border-r border-slate-200">
                      {formatCurrency(inv.paid_amount)}
                    </td>
                    <td className="p-2 text-right font-mono text-amber-700 border-r border-slate-200">
                      {formatCurrency(inv.remaining_amount)}
                    </td>
                    <td className="p-2 text-right uppercase font-semibold">{inv.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Official Sign-off */}
        <div className="pt-8 flex justify-between text-center text-xs">
          <div>
            <p className="text-slate-500">Mengetahui, Direktur Rumah Sakit</p>
            <div className="h-12" />
            <p className="font-bold text-slate-900">dr. H. Syarifuddin, MARS, Sp.B</p>
            <p className="text-[10px] text-slate-400 font-mono">NIP: 197201011999031005</p>
          </div>
          <div>
            <p className="text-slate-500">Penanggung Jawab Rekam Medis & SIMRS</p>
            <div className="h-12" />
            <p className="font-bold text-slate-900">Ir. Hendra Pratama, M.Kom</p>
            <p className="text-[10px] text-slate-400 font-mono">Kepala Instalasi SIMRS</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
