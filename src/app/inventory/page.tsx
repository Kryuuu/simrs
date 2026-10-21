"use client";

import React, { useState } from "react";
import {
  Boxes,
  Plus,
  AlertTriangle,
  Clock,
  Search,
  Package,
  Layers,
  CheckCircle,
  ArrowDownRight,
  TrendingDown,
  DollarSign,
} from "lucide-react";
import { useSIMRS } from "@/lib/demo-store";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";

export default function InventoryPage() {
  const { medications, addMedicationStock } = useSIMRS();

  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("ALL");
  const [addStockModalOpen, setAddStockModalOpen] = useState(false);

  // Form State
  const [selectedMedId, setSelectedMedId] = useState("");
  const [batchNumber, setBatchNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("2028-12-31");
  const [quantity, setQuantity] = useState(100);
  const [buyPrice, setBuyPrice] = useState(500);
  const [sellPrice, setSellPrice] = useState(1000);

  const filteredMedications = medications.filter((m) => {
    const matchSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.generic_name.toLowerCase().includes(search.toLowerCase()) ||
      m.code.toLowerCase().includes(search.toLowerCase());
    const matchCategory = filterCategory === "ALL" || m.category === filterCategory;
    return matchSearch && matchCategory;
  });

  // Calculate alerts
  const lowStockMeds = medications.filter((m) => m.total_stock <= m.min_stock_alert);
  const [nearExpiryBatches, setNearExpiryBatches] = useState<any[]>([]);

  React.useEffect(() => {
    const now = new Date();
    const batches: any[] = [];
    medications.forEach((m) => {
      m.batches.forEach((b) => {
        const exp = new Date(b.expiry_date);
        const diffMonths = (exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30);
        if (diffMonths < 6 && b.stock_quantity > 0) {
          batches.push({ ...b, medName: m.name, diffMonths: Math.round(diffMonths) });
        }
      });
    });
    setNearExpiryBatches(batches);
  }, [medications]);

  const totalAssetValue = medications.reduce((acc, m) => {
    const medVal = m.batches.reduce((sum, b) => sum + b.stock_quantity * b.buy_price, 0);
    return acc + medVal;
  }, 0);

  const handleStockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMedId || !batchNumber || !quantity) return;

    addMedicationStock(
      selectedMedId,
      batchNumber,
      expiryDate,
      Number(quantity),
      Number(buyPrice),
      Number(sellPrice)
    );

    setAddStockModalOpen(false);
    setSelectedMedId("");
    setBatchNumber("");
    alert(`Mutasi stok batch ${batchNumber} sebanyak ${quantity} unit berhasil ditambahkan.`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Boxes className="h-5 w-5 text-indigo-600" />
            Inventaris Obat, Alkes & Manajemen Batch FEFO
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pengendalian stok per batch, lot kedaluwarsa, peringatan stok minimum, dan mutasi penerimaan.
          </p>
        </div>

        <Button
          onClick={() => setAddStockModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs self-start sm:self-auto font-medium"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          + Penerimaan Stok Masuk (Mutasi)
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-red-200 bg-red-50/40 shadow-2xs">
          <CardContent className="p-4">
            <div className="text-[11px] font-bold text-red-800 uppercase tracking-wider flex items-center justify-between">
              <span>Peringatan Stok Minimum</span>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </div>
            <div className="text-2xl font-black text-red-600 mt-1">{lowStockMeds.length} Obat</div>
            <div className="text-[10px] text-red-700 font-medium mt-0.5">Stok berada di bawah batas aman pengadaan</div>
          </CardContent>
        </Card>

        <Card className="border-amber-200 bg-amber-50/40 shadow-2xs">
          <CardContent className="p-4">
            <div className="text-[11px] font-bold text-amber-800 uppercase tracking-wider flex items-center justify-between">
              <span>Mendekati Kedaluwarsa (&lt; 6 Bulan)</span>
              <Clock className="h-4 w-4 text-amber-600" />
            </div>
            <div className="text-2xl font-black text-amber-700 mt-1">{nearExpiryBatches.length} Batch</div>
            <div className="text-[10px] text-amber-700 font-medium mt-0.5">Rekomendasi percepatan dispensing FEFO</div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-2xs">
          <CardContent className="p-4">
            <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center justify-between">
              <span>Nilai Aset Farmasi</span>
              <DollarSign className="h-4 w-4 text-slate-500" />
            </div>
            <div className="text-2xl font-black text-slate-900 mt-1">{formatCurrency(totalAssetValue)}</div>
            <div className="text-[10px] text-slate-500 font-medium mt-0.5">Total valuasi harga beli formularium</div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Cari nama obat, kode, atau zat aktif generik..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Kategori:</span>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="h-9 px-3 rounded-md bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700"
          >
            <option value="ALL">Semua Kategori</option>
            <option value="OBAT_KERAS">Obat Keras</option>
            <option value="OBAT_BEBAS">Obat Bebas</option>
            <option value="ALKES">Alkes / Cairan</option>
          </select>
        </div>
      </div>

      {/* Medication Inventory Table with Batches */}
      <Card className="border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Kode & Nama Obat</th>
                <th className="px-4 py-3">Generik & Kategori</th>
                <th className="px-4 py-3">Satuan</th>
                <th className="px-4 py-3">Batas Minimum</th>
                <th className="px-4 py-3">Total Stok</th>
                <th className="px-4 py-3">Rincian Batch Aktif (FEFO)</th>
                <th className="px-4 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal">
              {filteredMedications.map((med) => {
                const isLow = med.total_stock <= med.min_stock_alert;
                return (
                  <tr key={med.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-900">{med.name}</div>
                      <div className="font-mono text-[11px] text-slate-400">{med.code}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="text-slate-800">{med.generic_name}</div>
                      <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[10px] bg-slate-100 font-medium text-slate-600">
                        {med.category.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-medium text-slate-800">{med.unit}</td>
                    <td className="px-4 py-3.5 font-mono text-slate-600">{med.min_stock_alert}</td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`font-mono font-bold text-sm ${
                          isLow ? "text-red-600" : "text-emerald-700"
                        }`}
                      >
                        {med.total_stock}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="space-y-1">
                        {med.batches.map((b) => (
                          <div key={b.id} className="text-[11px] font-mono flex items-center gap-2">
                            <span className="font-bold text-slate-800">{b.batch_number}</span>
                            <span className="text-slate-500">({b.stock_quantity} {med.unit})</span>
                            <span className="text-[10px] text-amber-700 bg-amber-50 px-1 rounded border border-amber-200">
                              Exp: {formatDate(b.expiry_date)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      {isLow ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800">
                          STOK MINIMUM
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          AMAN
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal: Mutasi Penerimaan Stok Masuk */}
      <Modal
        isOpen={addStockModalOpen}
        onClose={() => setAddStockModalOpen(false)}
        title="Formulir Penerimaan Stok Obat Masuk"
        description="Pencatatan batch baru dari supplier untuk alur pengeluaran FEFO."
        maxWidth="lg"
      >
        <form onSubmit={handleStockSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Pilih Master Obat *</label>
            <select
              required
              value={selectedMedId}
              onChange={(e) => setSelectedMedId(e.target.value)}
              className="w-full h-9 px-3 rounded-md border border-slate-200 bg-white text-xs"
            >
              <option value="">-- Pilih Obat --</option>
              {medications.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.generic_name}) - Satuan: {m.unit}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Nomor Batch Pabrik *</label>
              <Input
                required
                placeholder="Contoh: BATCH-2026-X01"
                value={batchNumber}
                onChange={(e) => setBatchNumber(e.target.value)}
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Tanggal Kedaluwarsa (Exp Date) *</label>
              <Input
                type="date"
                required
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Jumlah Masuk (Unit/Tablet) *</label>
              <Input
                type="number"
                min="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Harga Beli Satuan (Rp)</label>
              <Input
                type="number"
                min="0"
                value={buyPrice}
                onChange={(e) => setBuyPrice(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setAddStockModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium">
              Simpan Mutasi Masuk
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
