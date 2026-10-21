"use client";

import React, { useState } from "react";
import {
  ReceiptText,
  CreditCard,
  Printer,
  CheckCircle2,
  Clock,
  QrCode,
  DollarSign,
  Search,
  FileCheck,
  Building,
  User,
} from "lucide-react";
import { useSIMRS } from "@/lib/demo-store";
import { Invoice } from "@/types";
import { formatCurrency, formatTime, formatDate } from "@/lib/formatters";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";

export default function BillingPage() {
  const { invoices, payInvoice, hospitalSettings, currentUser } = useSIMRS();

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [payModalInvoice, setPayModalInvoice] = useState<Invoice | null>(null);
  const [printModalInvoice, setPrintModalInvoice] = useState<Invoice | null>(null);
  const [printDateStr, setPrintDateStr] = useState("21 Oktober 2026");

  React.useEffect(() => {
    setPrintDateStr(formatDate(new Date()));
  }, []);

  // Payment Form State
  const [payAmount, setPayAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<Invoice["payments"][0]["payment_method"]>("QRIS");
  const [referenceNumber, setReferenceNumber] = useState<string>("");

  const filteredInvoices = invoices.filter((inv) => {
    const matchSearch =
      inv.patient_name.toLowerCase().includes(search.toLowerCase()) ||
      inv.invoice_number.includes(search) ||
      inv.patient_mrn.includes(search);
    const matchStatus = filterStatus === "ALL" || inv.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const totalCollectedToday = invoices
    .filter((inv) => inv.status === "lunas" || inv.status === "sebagian")
    .reduce((acc, inv) => acc + inv.paid_amount, 0);

  const pendingReceivables = invoices
    .filter((inv) => inv.status !== "lunas" && inv.status !== "batal")
    .reduce((acc, inv) => acc + inv.remaining_amount, 0);

  const handleOpenPayModal = (inv: Invoice) => {
    setPayModalInvoice(inv);
    setPayAmount(inv.remaining_amount);
    setReferenceNumber(`PAY-REF-${Math.floor(Math.random() * 900000 + 100000)}`);
  };

  const handlePaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payModalInvoice || payAmount <= 0) return;

    payInvoice(payModalInvoice.id, Number(payAmount), paymentMethod, referenceNumber);
    setPayModalInvoice(null);
    alert(`Pembayaran Rp ${payAmount.toLocaleString("id-ID")} berhasil diproses.`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ReceiptText className="h-5 w-5 text-emerald-600" />
            Kasir, Billing & Pembayaran Pasien
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Konsolidasi rincian biaya tindakan, obat, kamar, pembayaran multi-metode (Tunai/QRIS), dan kuitansi resmi.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-emerald-200 bg-emerald-50/40 shadow-2xs">
          <CardContent className="p-4">
            <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider flex items-center justify-between">
              <span>Total Penerimaan Kasir Hari Ini</span>
              <CreditCard className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-emerald-700 mt-1">
              {formatCurrency(totalCollectedToday)}
            </div>
            <div className="text-[10px] text-emerald-700 font-medium mt-0.5">Sudah tervalidasi & tercatat mutasi</div>
          </CardContent>
        </Card>

        <Card className="border-amber-200 bg-amber-50/40 shadow-2xs">
          <CardContent className="p-4">
            <div className="text-[11px] font-bold text-amber-800 uppercase tracking-wider flex items-center justify-between">
              <span>Sisa Piutang Menunggu Bayar</span>
              <Clock className="h-4 w-4 text-amber-600" />
            </div>
            <div className="text-2xl font-black text-amber-700 mt-1">
              {formatCurrency(pendingReceivables)}
            </div>
            <div className="text-[10px] text-amber-700 font-medium mt-0.5">Menunggu pelunasan atau proses klaim</div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-2xs">
          <CardContent className="p-4">
            <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center justify-between">
              <span>Total Transaksi Tagihan</span>
              <ReceiptText className="h-4 w-4 text-slate-500" />
            </div>
            <div className="text-2xl font-black text-slate-900 mt-1">{invoices.length} Invoice</div>
            <div className="text-[10px] text-slate-500 font-medium mt-0.5">Pasien Rawat Jalan, IGD & Rawat Inap</div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Cari No. Tagihan, Nama Pasien, atau No. RM..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Status Bayar:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="h-9 px-3 rounded-md bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700"
          >
            <option value="ALL">Semua Tagihan</option>
            <option value="belum_bayar">Belum Bayar</option>
            <option value="sebagian">Sebagian (Partial)</option>
            <option value="lunas">Lunas</option>
          </select>
        </div>
      </div>

      {/* Invoices List Table */}
      <Card className="border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">No. Tagihan</th>
                <th className="px-4 py-3">Nama Pasien & No. RM</th>
                <th className="px-4 py-3">Penjamin</th>
                <th className="px-4 py-3">Rincian Item Biaya</th>
                <th className="px-4 py-3">Total Tagihan</th>
                <th className="px-4 py-3">Sudah Dibayar</th>
                <th className="px-4 py-3">Sisa Tagihan</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Aksi Kasir</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal">
              {filteredInvoices.map((inv) => {
                const isPaid = inv.status === "lunas";
                return (
                  <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3.5 font-mono font-bold text-slate-900">{inv.invoice_number}</td>
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-900">{inv.patient_name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">RM: {inv.patient_mrn}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-mono text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                        {inv.insurance_type}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 max-w-xs">
                      <div className="space-y-0.5">
                        {inv.items.map((it) => (
                          <div key={it.id} className="text-[11px] flex justify-between">
                            <span className="truncate">{it.item_name}</span>
                            <span className="font-mono text-slate-500 ml-2">
                              {formatCurrency(it.total_price)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-mono font-bold text-slate-900">
                      {formatCurrency(inv.grand_total)}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-emerald-700 font-semibold">
                      {formatCurrency(inv.paid_amount)}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-amber-700 font-semibold">
                      {formatCurrency(inv.remaining_amount)}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          isPaid
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                            : "bg-amber-50 text-amber-800 border-amber-200"
                        }`}
                      >
                        {inv.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right space-x-1.5">
                      {!isPaid && (
                        <Button
                          size="sm"
                          onClick={() => handleOpenPayModal(inv)}
                          className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                        >
                          <CreditCard className="h-3.5 w-3.5 mr-1" />
                          Bayar
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setPrintModalInvoice(inv)}
                        className="h-7 text-xs border-slate-200 hover:bg-slate-50 text-slate-700"
                      >
                        <Printer className="h-3.5 w-3.5 mr-1 text-slate-500" />
                        Kuitansi
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal: Proses Pembayaran Kasir */}
      {payModalInvoice && (
        <Modal
          isOpen={Boolean(payModalInvoice)}
          onClose={() => setPayModalInvoice(null)}
          title={`Proses Pembayaran Kasir: ${payModalInvoice.invoice_number}`}
          description={`Pasien: ${payModalInvoice.patient_name} (RM: ${payModalInvoice.patient_mrn})`}
          maxWidth="md"
        >
          <form onSubmit={handlePaySubmit} className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Total Tagihan:</span>
                <span className="font-mono font-bold text-slate-900">
                  {formatCurrency(payModalInvoice.grand_total)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Sisa Piutang:</span>
                <span className="font-mono font-bold text-red-600">
                  {formatCurrency(payModalInvoice.remaining_amount)}
                </span>
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Metode Pembayaran *</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full h-9 px-3 rounded-md border border-slate-200 bg-white text-xs font-semibold"
              >
                <option value="QRIS">QRIS Dinamis</option>
                <option value="TUNAI">Tunai (Cash)</option>
                <option value="TRANSFER_BANK">Transfer Bank / Virtual Account</option>
                <option value="DEBIT_CARD">Kartu Debit</option>
                <option value="BPJS_KESEHATAN">Dijamin Penuh BPJS Kesehatan</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Jumlah yang Dibayarkan (Rp) *</label>
              <Input
                type="number"
                min="1000"
                max={payModalInvoice.remaining_amount}
                required
                value={payAmount}
                onChange={(e) => setPayAmount(Number(e.target.value))}
                className="font-mono text-base font-bold text-emerald-700"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Nomor Referensi Transaksi</label>
              <Input
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                className="font-mono"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setPayModalInvoice(null)}>
                Batal
              </Button>
              <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium">
                <CheckCircle2 className="h-4 w-4 mr-1" />
                Terima Pembayaran
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: Cetak Kuitansi Resmi Rumah Sakit */}
      {printModalInvoice && (
        <Modal
          isOpen={Boolean(printModalInvoice)}
          onClose={() => setPrintModalInvoice(null)}
          title="Kuitansi Pembayaran Resmi"
          maxWidth="2xl"
        >
          <div className="p-6 bg-white border border-slate-200 rounded-lg space-y-4 font-sans text-xs printable-area">
            {/* Kop */}
            <div className="border-b-2 border-slate-900 pb-3 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 tracking-tight">
                  {hospitalSettings.hospital_name}
                </h3>
                <p className="text-[11px] text-slate-600">{hospitalSettings.address}</p>
                <p className="text-[10px] text-slate-500 font-mono">NPWP: {hospitalSettings.tax_identification_number}</p>
              </div>
              <div className="text-right">
                <div className="text-sm font-extrabold font-mono text-emerald-800">KUITANSI PEMBAYARAN</div>
                <div className="text-[11px] font-mono font-bold text-slate-700">{printModalInvoice.invoice_number}</div>
              </div>
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-3 rounded border border-slate-200">
              <div>
                Telah Terima Dari: <strong>{printModalInvoice.patient_name}</strong>
              </div>
              <div>
                No. Rekam Medis: <strong className="font-mono">{printModalInvoice.patient_mrn}</strong>
              </div>
              <div>
                Penjamin: <span>{printModalInvoice.insurance_type}</span>
              </div>
              <div>
                Tanggal Kuitansi: <span className="font-mono">{formatDate(printModalInvoice.created_at)}</span>
              </div>
            </div>

            {/* Items Breakdown Table */}
            <table className="w-full text-left text-xs border border-slate-300">
              <thead className="bg-slate-100 font-bold border-b border-slate-300">
                <tr>
                  <th className="p-2 border-r border-slate-300">Kategori & Uraian Biaya</th>
                  <th className="p-2 border-r border-slate-300 text-center">Qty</th>
                  <th className="p-2 border-r border-slate-300 text-right">Harga Satuan</th>
                  <th className="p-2 text-right">Jumlah</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {printModalInvoice.items.map((it) => (
                  <tr key={it.id}>
                    <td className="p-2 border-r border-slate-300">
                      <span className="font-semibold text-slate-900 block">{it.item_name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{it.category}</span>
                    </td>
                    <td className="p-2 border-r border-slate-300 text-center font-mono">{it.quantity}</td>
                    <td className="p-2 border-r border-slate-300 text-right font-mono">
                      {formatCurrency(it.unit_price)}
                    </td>
                    <td className="p-2 text-right font-mono font-semibold">
                      {formatCurrency(it.total_price)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50 font-bold border-t border-slate-300">
                <tr>
                  <td colSpan={3} className="p-2 text-right border-r border-slate-300">
                    Grand Total Tagihan:
                  </td>
                  <td className="p-2 text-right font-mono">{formatCurrency(printModalInvoice.grand_total)}</td>
                </tr>
                <tr>
                  <td colSpan={3} className="p-2 text-right border-r border-slate-300 text-emerald-700">
                    Total Sudah Dibayar:
                  </td>
                  <td className="p-2 text-right font-mono text-emerald-700">
                    {formatCurrency(printModalInvoice.paid_amount)}
                  </td>
                </tr>
                {printModalInvoice.remaining_amount > 0 && (
                  <tr>
                    <td colSpan={3} className="p-2 text-right border-r border-slate-300 text-red-700">
                      Sisa Piutang:
                    </td>
                    <td className="p-2 text-right font-mono text-red-700">
                      {formatCurrency(printModalInvoice.remaining_amount)}
                    </td>
                  </tr>
                )}
              </tfoot>
            </table>

            {/* Signature */}
            <div className="pt-6 flex justify-between text-center text-xs">
              <div className="text-left text-[10px] text-slate-400 font-mono">
                * Kuitansi ini adalah bukti pembayaran yang sah.<br />
                Dicetak pada: {printDateStr}
              </div>
              <div className="w-56">
                <p className="text-slate-500">Kasir Perbendaharaan,</p>
                <div className="h-10" />
                <p className="font-bold text-slate-900">{currentUser.full_name}</p>
                <p className="text-[10px] text-slate-400 font-mono">Kasir SIMRS Terverifikasi</p>
              </div>
            </div>

            <div className="pt-4 no-print flex justify-end gap-2">
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => window.print()}>
                <Printer className="h-4 w-4 mr-1" /> Cetak Kuitansi Resmi
              </Button>
              <Button size="sm" variant="outline" onClick={() => setPrintModalInvoice(null)}>
                Tutup
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
