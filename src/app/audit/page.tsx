"use client";

import React, { useState } from "react";
import {
  History,
  ShieldCheck,
  Search,
  Filter,
  Lock,
  User,
  Clock,
  Layers,
} from "lucide-react";
import { useSIMRS } from "@/lib/demo-store";
import { formatTime, formatDate } from "@/lib/formatters";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function AuditPage() {
  const { auditLogs } = useSIMRS();

  const [search, setSearch] = useState("");
  const [filterAction, setFilterAction] = useState<string>("ALL");

  const filteredLogs = auditLogs.filter((log) => {
    const matchSearch =
      log.user_name.toLowerCase().includes(search.toLowerCase()) ||
      log.details.toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.resource_id.includes(search);
    const matchAction = filterAction === "ALL" || log.action === filterAction;
    return matchSearch && matchAction;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <History className="h-5 w-5 text-teal-600" />
            Audit Log & Rekam Jejak Sistem (Append-Only)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Log kepatuhan forensik digital, pencatatan mutasi transaksi klinis, finansial, dan autentikasi.
          </p>
        </div>
      </div>

      {/* Security Disclaimer Banner */}
      <div className="p-4 rounded-lg bg-slate-900 text-white flex items-center justify-between text-xs shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-teal-600/30 text-teal-400">
            <Lock className="h-4 w-4" />
          </div>
          <div>
            <span className="font-bold text-teal-300 block">Integritas Log Terjamin (Immutability):</span>
            <p className="text-slate-300 text-[11px] mt-0.5">
              Seluruh rekaman audit log berstatus append-only dan tidak dapat diubah atau dihapus (hard delete) oleh pengguna biasa.
            </p>
          </div>
        </div>
        <span className="hidden sm:inline font-mono text-[11px] text-teal-400 bg-slate-800 px-3 py-1 rounded border border-slate-700">
          Total Rekaman: {auditLogs.length}
        </span>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Cari aktor pengguna, aksi, atau ID entitas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Kategori Aksi:</span>
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="h-9 px-3 rounded-md bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700"
          >
            <option value="ALL">Semua Aksi</option>
            <option value="CREATE_PATIENT">Registrasi Pasien Baru</option>
            <option value="TRIAGE_ENTRY">Triase IGD</option>
            <option value="SAVE_CLINICAL_NOTE">Simpan Rekam Medis SOAP</option>
            <option value="PROCESS_PAYMENT">Pembayaran Kasir</option>
            <option value="STOCK_MUTATION">Mutasi Stok Farmasi</option>
            <option value="ROLE_SWITCH">Beralih Peran Pengguna</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <Card className="border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Waktu (WITA)</th>
                <th className="px-4 py-3">Aktor Pengguna</th>
                <th className="px-4 py-3">Peran (Role)</th>
                <th className="px-4 py-3">Jenis Tindakan</th>
                <th className="px-4 py-3">Modul / Resource</th>
                <th className="px-4 py-3">Rincian Perubahan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3.5 font-mono text-slate-700 whitespace-nowrap">
                    {formatDate(log.created_at)} • {formatTime(log.created_at)}
                  </td>
                  <td className="px-4 py-3.5 font-semibold text-slate-900">{log.user_name}</td>
                  <td className="px-4 py-3.5">
                    <span className="font-mono text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                      {log.user_role}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="font-mono font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 font-mono text-slate-500">
                    {log.resource} ({log.resource_id})
                  </td>
                  <td className="px-4 py-3.5 text-slate-700 font-sans">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
