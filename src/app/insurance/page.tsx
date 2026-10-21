"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  AlertCircle,
  FileText,
  Key,
  Layers,
  CheckCircle,
  ExternalLink,
  Lock,
} from "lucide-react";
import { useSIMRS } from "@/lib/demo-store";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function InsurancePage() {
  const { hospitalSettings, clinicalNotes, patients } = useSIMRS();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-teal-600" />
            Penjamin, E-Klaim & Bridging Integrasi Nasional
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manajemen penjamin pembiayaan pasien, kepatuhan regulasi BPJS VClaim dan Kemenkes SATUSEHAT.
          </p>
        </div>
      </div>

      {/* Integration Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* BPJS VClaim Card */}
        <Card className="border-amber-300 bg-amber-50/30 shadow-2xs">
          <CardHeader className="p-5 pb-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-slate-900">BPJS Kesehatan (VClaim / TrustMark)</span>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300">
                BELUM TERINTEGRASI
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-0 text-xs space-y-3">
            <p className="text-slate-600 leading-relaxed">
              Koneksi bridging VClaim BPJS membutuhkan perjanjian kerja sama resmi (PKS), uji coba TrustMark
              dari BPJS Kesehatan, serta konfigurasi parameter aman:
            </p>
            <div className="p-3 bg-white rounded border border-amber-200 font-mono text-[11px] space-y-1 text-slate-700">
              <div>ConsID: <span className="text-slate-400">Belum dikonfigurasi</span></div>
              <div>SecretKey: <span className="text-slate-400">••••••••••••••••</span></div>
              <div>UserKey: <span className="text-slate-400">••••••••••••••••</span></div>
            </div>
            <p className="text-[11px] text-amber-800 italic">
              * Sesuai prinsip kehati-hatian, sistem tidak memalsukan status atau membuat klaim fiktif sebelum pengujian TrustMark resmi.
            </p>
          </CardContent>
        </Card>

        {/* SATUSEHAT Kemenkes Card */}
        <Card className="border-amber-300 bg-amber-50/30 shadow-2xs">
          <CardHeader className="p-5 pb-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-slate-900">Kemenkes SATUSEHAT (FHIR R4)</span>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300">
                BELUM TERINTEGRASI
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-0 text-xs space-y-3">
            <p className="text-slate-600 leading-relaxed">
              Integrasi FHIR R4 Kementerian Kesehatan RI memerlukan kredensial resmi Organization ID & Client ID
              resmi dari DTO Kemenkes:
            </p>
            <div className="p-3 bg-white rounded border border-amber-200 font-mono text-[11px] space-y-1 text-slate-700">
              <div>Organization ID: <span className="text-slate-400">10002xxxx (Belum terisi)</span></div>
              <div>Client ID: <span className="text-slate-400">••••••••••••••••</span></div>
              <div>Auth Token: <span className="text-slate-400">Bearer &lt;OAuth2 Token&gt;</span></div>
            </div>
            <p className="text-[11px] text-amber-800 italic">
              * Data klinis EMR internal telah distandardisasi dengan kode ICD-10 dan SNOMED-CT untuk kemudahan bridging saat kredensial siap.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Master Penjamin Terdaftar */}
      <Card className="border-slate-200/90 shadow-2xs">
        <CardHeader className="p-4 border-b border-slate-100">
          <CardTitle className="text-sm font-bold text-slate-900">
            Daftar Penjamin Pembiayaan Rumah Sakit
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Nama Penjamin</th>
                  <th className="px-4 py-3">Jenis Kerjasama</th>
                  <th className="px-4 py-3">Status Klaim</th>
                  <th className="px-4 py-3">Ketentuan Co-Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-normal">
                <tr>
                  <td className="px-4 py-3.5 font-bold text-slate-900">BPJS Kesehatan (JKN-KIS)</td>
                  <td className="px-4 py-3.5">Fasilitas Kesehatan Tingkat Lanjutan (FKTL)</td>
                  <td className="px-4 py-3.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                      AKTIF / PKS BERJALAN
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-slate-600">Sesuai hak kelas rawat, selisih biaya bila naik kelas rawat inap</td>
                </tr>
                <tr>
                  <td className="px-4 py-3.5 font-bold text-slate-900">Pasien Umum (Mandiri)</td>
                  <td className="px-4 py-3.5">Tunai / QRIS / Transfer Bank</td>
                  <td className="px-4 py-3.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                      LANGSUNG
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-slate-600">Tarif Perda Rumah Sakit Kelas C</td>
                </tr>
                <tr>
                  <td className="px-4 py-3.5 font-bold text-slate-900">PT Asuransi Jiwa Prudential</td>
                  <td className="px-4 py-3.5">Third Party Administrator (TPA) / AdMedika</td>
                  <td className="px-4 py-3.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-800 border border-purple-200">
                      CASHLESS TPA
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-slate-600">Sesuai limit plafon polis kartu peserta</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
