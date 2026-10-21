"use client";

import React, { useState } from "react";
import {
  CalendarDays,
  Clock,
  UserCheck,
  Plus,
  AlertCircle,
  Building,
  CheckCircle,
  Users,
} from "lucide-react";
import { useSIMRS } from "@/lib/demo-store";
import { DoctorSchedule } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";

export default function SchedulesPage() {
  const { doctorSchedules, hospitalSettings, addDoctorSchedule } = useSIMRS();

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [filterDay, setFilterDay] = useState<string>("ALL");

  // Form State
  const [doctorName, setDoctorName] = useState("dr. Andi Makassau, Sp.PD, K-GEH");
  const [specialty, setSpecialty] = useState("Spesialis Penyakit Dalam");
  const [clinicName, setClinicName] = useState("Poli Penyakit Dalam");
  const [clinicId, setClinicId] = useState("cl-pd");
  const [dayOfWeek, setDayOfWeek] = useState<DoctorSchedule["day_of_week"]>("SENIN");
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("12:00");
  const [quota, setQuota] = useState(25);

  const filteredSchedules = doctorSchedules.filter((sch) => {
    if (filterDay === "ALL") return true;
    return sch.day_of_week === filterDay;
  });

  const handleAddScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Check for schedule conflict for same doctor on same day
    const conflict = doctorSchedules.find(
      (s) =>
        s.doctor_name === doctorName &&
        s.day_of_week === dayOfWeek &&
        ((startTime >= s.start_time && startTime < s.end_time) ||
          (endTime > s.start_time && endTime <= s.end_time))
    );

    if (conflict) {
      alert(
        `Benturan Jadwal Terdeteksi! Dokter ${doctorName} sudah memiliki jadwal praktik di ${conflict.clinic_name} pada ${dayOfWeek} pukul ${conflict.start_time}-${conflict.end_time} WITA.`
      );
      return;
    }

    addDoctorSchedule({
      doctor_id: "user-doctor-1",
      doctor_name: doctorName,
      specialty,
      clinic_id: clinicId,
      clinic_name: clinicName,
      day_of_week: dayOfWeek,
      start_time: startTime,
      end_time: endTime,
      max_patient_quota: Number(quota),
      is_active: true,
    });

    setAddModalOpen(false);
    alert(`Jadwal praktik dokter ${doctorName} pada hari ${dayOfWeek} berhasil ditambahkan.`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-teal-600" />
            Jadwal Praktik Dokter & Poliklinik
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manajemen jam praktik poliklinik, kuota kapasitas pasien harian, dan zona waktu {hospitalSettings.timezone}.
          </p>
        </div>

        <Button
          onClick={() => setAddModalOpen(true)}
          className="bg-teal-600 hover:bg-teal-700 text-white shadow-xs self-start sm:self-auto font-medium"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Tambah Jadwal Praktik
        </Button>
      </div>

      {/* Filter by Day */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-400 font-medium shrink-0">Filter Hari:</span>
        {["ALL", "SENIN", "SELASA", "RABU", "KAMIS", "JUMAT", "SABTU"].map((day) => (
          <button
            key={day}
            onClick={() => setFilterDay(day)}
            className={`px-3 py-1.5 rounded-md border font-medium transition-all ${
              filterDay === day
                ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            {day === "ALL" ? "Semua Hari" : day}
          </button>
        ))}
      </div>

      {/* Schedules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSchedules.map((sch) => {
          const bookedPct = Math.round((sch.current_booked / sch.max_patient_quota) * 100);
          return (
            <Card key={sch.id} className="border-slate-200/90 shadow-2xs hover:shadow-xs transition-shadow">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                      {sch.day_of_week}
                    </span>
                    <h3 className="font-bold text-sm text-slate-900 mt-2">{sch.doctor_name}</h3>
                    <p className="text-xs text-slate-500">{sch.specialty}</p>
                  </div>
                  <span className="h-2 w-2 rounded-full bg-emerald-500" title="Aktif" />
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-1">
                      <Building className="h-3.5 w-3.5 text-slate-400" /> Poliklinik:
                    </span>
                    <span className="font-semibold text-slate-800">{sch.clinic_name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-slate-400" /> Jam Praktik:
                    </span>
                    <span className="font-mono font-bold text-slate-900">
                      {sch.start_time} - {sch.end_time} WITA
                    </span>
                  </div>
                </div>

                {/* Quota Progress */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-500">Kapasitas Kuota Pasien</span>
                    <span className="font-semibold text-slate-900">
                      {sch.current_booked} / {sch.max_patient_quota} Pasien ({bookedPct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        bookedPct >= 90 ? "bg-red-500" : bookedPct >= 70 ? "bg-amber-500" : "bg-teal-500"
                      }`}
                      style={{ width: `${bookedPct}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Modal: Tambah Jadwal Praktik Dokter */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Tambah Jadwal Praktik Poliklinik"
        description="Pencegahan benturan jam praktik dan penetapan kuota pasien otomatis."
        maxWidth="lg"
      >
        <form onSubmit={handleAddScheduleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Dokter Spesialis *</label>
            <select
              value={doctorName}
              onChange={(e) => {
                setDoctorName(e.target.value);
                if (e.target.value.includes("Citra")) {
                  setSpecialty("Spesialis Kesehatan Anak");
                  setClinicName("Poli Kesehatan Anak");
                  setClinicId("cl-ank");
                } else {
                  setSpecialty("Spesialis Penyakit Dalam");
                  setClinicName("Poli Penyakit Dalam");
                  setClinicId("cl-pd");
                }
              }}
              className="w-full h-9 px-3 rounded-md border border-slate-200 bg-white text-xs font-medium"
            >
              <option value="dr. Andi Makassau, Sp.PD, K-GEH">dr. Andi Makassau, Sp.PD, K-GEH</option>
              <option value="dr. Citra Lestari, Sp.A, M.Biomed">dr. Citra Lestari, Sp.A, M.Biomed</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Hari Praktik *</label>
              <select
                value={dayOfWeek}
                onChange={(e) => setDayOfWeek(e.target.value as any)}
                className="w-full h-9 px-3 rounded-md border border-slate-200 bg-white text-xs"
              >
                <option value="SENIN">Senin</option>
                <option value="SELASA">Selasa</option>
                <option value="RABU">Rabu</option>
                <option value="KAMIS">Kamis</option>
                <option value="JUMAT">Jumat</option>
                <option value="SABTU">Sabtu</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Kapasitas Kuota Pasien *</label>
              <Input
                type="number"
                min="5"
                max="60"
                required
                value={quota}
                onChange={(e) => setQuota(Number(e.target.value))}
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Jam Mulai Praktik (WITA) *</label>
              <Input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Jam Selesai Praktik (WITA) *</label>
              <Input
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setAddModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" size="sm" className="bg-teal-600 hover:bg-teal-700 text-white">
              Simpan Jadwal Praktik
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
