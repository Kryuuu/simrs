"use client";

import React, { useState } from "react";
import { UserCog, Search, Filter, ShieldCheck, Mail, Phone, Building } from "lucide-react";
import { useSIMRS } from "@/lib/demo-store";
import { INITIAL_USERS } from "@/lib/demo-data";
import { ROLE_LABELS, ROLE_COLORS } from "@/lib/permissions/rbac";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function StaffPage() {
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<string>("ALL");

  const filteredStaff = INITIAL_USERS.filter((user) => {
    const matchSearch =
      user.full_name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      (user.nip && user.nip.includes(search));
    const matchRole = filterRole === "ALL" || user.role === filterRole;
    return matchSearch && matchRole;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <UserCog className="h-5 w-5 text-teal-600" />
            Kepegawaian & Tenaga Medis (SDM)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Data tenaga medis, nomor STR/SIP dokter, perawat, apoteker, dan penugasan departemen unit kerja.
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Cari nama pegawai, NIP, atau email dinas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Peran:</span>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="h-9 px-3 rounded-md bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700"
          >
            <option value="ALL">Semua Peran</option>
            <option value="doctor">Dokter</option>
            <option value="nurse">Perawat / Bidan</option>
            <option value="pharmacist">Apoteker</option>
            <option value="lab_technician">Analis Lab</option>
            <option value="radiology_technician">Radiografer</option>
            <option value="cashier">Kasir</option>
            <option value="registration_staff">Petugas Pendaftaran</option>
            <option value="hospital_admin">Admin Rumah Sakit</option>
          </select>
        </div>
      </div>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStaff.map((staff) => {
          const style = ROLE_COLORS[staff.role];
          return (
            <Card key={staff.id} className="border-slate-200/90 shadow-2xs hover:shadow-xs transition-shadow">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${style.bg} ${style.text} ${style.border}`}
                    >
                      {ROLE_LABELS[staff.role]}
                    </span>
                    <h3 className="font-bold text-sm text-slate-900 mt-2">{staff.full_name}</h3>
                    <p className="text-xs text-slate-500">{staff.department_name}</p>
                  </div>
                  <div className="h-9 w-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs">
                    {staff.full_name.slice(0, 2).toUpperCase()}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1.5 font-mono">
                  {staff.nip && (
                    <div className="text-[11px] text-slate-600 truncate">
                      NIP: <span className="font-semibold text-slate-800">{staff.nip}</span>
                    </div>
                  )}
                  {staff.sip_str && (
                    <div className="text-[10px] text-teal-800 font-sans truncate">
                      {staff.sip_str}
                    </div>
                  )}
                  <div className="text-[11px] text-slate-500 font-sans truncate flex items-center gap-1.5 pt-1 border-t border-slate-200">
                    <Mail className="h-3 w-3 text-slate-400" /> {staff.email}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
