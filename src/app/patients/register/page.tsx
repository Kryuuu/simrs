"use client";

import React, { useState } from "react";
import { PatientRegistrationWizard } from "@/components/patients/patient-registration-wizard";
import { BPJSPatientRegistration } from "@/components/patients/bpjs-patient-registration";
import { ShieldCheck, User, Sparkles, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function PatientRegistrationPage() {
  const [selectedCategory, setSelectedCategory] = useState<"BPJS" | "UMUM">("BPJS");

  return (
    <div className="space-y-6">
      {/* Top Category Selector Tabs for Admisi Staff */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 block">
              Admisi Pasien Baru Rumah Sakit
            </span>
            <h2 className="text-base font-extrabold text-slate-900">
              Pilih Jalur Pendaftaran: Pasien BPJS Kesehatan atau Pasien Umum?
            </h2>
          </div>

          <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => setSelectedCategory("BPJS")}
              className={cn(
                "px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer",
                selectedCategory === "BPJS"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              <ShieldCheck className="h-4 w-4" />
              <span>Pasien BPJS Kesehatan</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedCategory("UMUM")}
              className={cn(
                "px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer",
                selectedCategory === "UMUM"
                  ? "bg-teal-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              <User className="h-4 w-4" />
              <span>Pasien Umum / Mandiri</span>
            </button>
          </div>
        </div>
      </div>

      {/* Render Appropriate Workflow */}
      {selectedCategory === "BPJS" ? (
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200">
          <BPJSPatientRegistration isPublicKiosk={false} />
        </div>
      ) : (
        <PatientRegistrationWizard isPublicKiosk={false} initialCategory="UMUM" />
      )}
    </div>
  );
}
