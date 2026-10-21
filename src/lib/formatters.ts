import { TriageCategory, QueueStatus } from "@/types";

/**
 * Format currency to Indonesian Rupiah (IDR)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format Date to Indonesian format: 21 Oktober 2026
 */
export function formatDate(dateString: string | Date | undefined): string {
  if (!dateString) return "-";
  const date = typeof dateString === "string" ? new Date(dateString) : dateString;
  if (isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

/**
 * Format Date with Time: 21 Okt 2026, 14:30 WITA
 */
export function formatDateTime(
  dateString: string | Date | undefined,
  timeZone: string = "Asia/Makassar"
): string {
  if (!dateString) return "-";
  const date = typeof dateString === "string" ? new Date(dateString) : dateString;
  if (isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone,
  }).format(date);
}

/**
 * Format Time only: 14:30
 */
export function formatTime(
  dateString: string | Date | undefined,
  timeZone: string = "Asia/Makassar"
): string {
  if (!dateString) return "-";
  const date = typeof dateString === "string" ? new Date(dateString) : dateString;
  if (isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone,
  }).format(date);
}

/**
 * Mask NIK for data privacy (UU Perlindungan Data Pribadi)
 * Example: 7371123456780001 -> 7371********0001
 */
export function maskNIK(nik: string | undefined): string {
  if (!nik) return "-";
  if (nik.length < 8) return "******";
  return `${nik.slice(0, 4)}********${nik.slice(-4)}`;
}

/**
 * Format Medical Record Number to standard padded 6-digit hospital format:
 * 1234 -> "00-12-34"
 */
export function formatMRN(mrn: string | number): string {
  const str = String(mrn).replace(/\D/g, "").padStart(6, "0");
  return `${str.slice(0, 2)}-${str.slice(2, 4)}-${str.slice(4, 6)}`;
}

/**
 * Triage ATS Categories metadata
 */
export const TRIAGE_INFO: Record<
  TriageCategory,
  { label: string; badge: string; text: string; bg: string; border: string; desc: string }
> = {
  P1_RESUSITASI: {
    label: "P1 - Resusitasi (Merah)",
    badge: "bg-red-600 text-white",
    text: "text-red-700",
    bg: "bg-red-50",
    border: "border-red-200",
    desc: "Ancaman jiwa segera, penanganan seketika tanpa tunda",
  },
  P2_EMERGENSI: {
    label: "P2 - Emergensi (Oranye)",
    badge: "bg-orange-600 text-white",
    text: "text-orange-700",
    bg: "bg-orange-50",
    border: "border-orange-200",
    desc: "Kondisi gawat berpotensi ancam jiwa, penanganan < 10 menit",
  },
  P3_URGENSI: {
    label: "P3 - Urgensi (Kuning)",
    badge: "bg-amber-500 text-white",
    text: "text-amber-800",
    bg: "bg-amber-50",
    border: "border-amber-200",
    desc: "Kondisi darurat stabil, penanganan < 30 menit",
  },
  P4_SEMI_URGENSI: {
    label: "P4 - Semi Urgensi (Hijau)",
    badge: "bg-emerald-600 text-white",
    text: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    desc: "Kondisi ringan berpotensi komplikasi, penanganan < 60 menit",
  },
  P5_NON_URGENSI: {
    label: "P5 - Non Urgensi (Biru)",
    badge: "bg-blue-600 text-white",
    text: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
    desc: "Kondisi tidak gawat dan tidak darurat, penanganan < 120 menit",
  },
};

/**
 * Queue status labels & badge styles
 */
export const QUEUE_STATUS_INFO: Record<
  QueueStatus,
  { label: string; badge: string }
> = {
  terdaftar: { label: "Terdaftar", badge: "bg-slate-100 text-slate-700 border-slate-200" },
  menunggu: { label: "Menunggu", badge: "bg-amber-50 text-amber-700 border-amber-200" },
  dipanggil: { label: "Dipanggil", badge: "bg-blue-50 text-blue-700 border-blue-200 animate-pulse" },
  dilayani: { label: "Sedang Dilayani", badge: "bg-teal-50 text-teal-700 border-teal-200" },
  selesai: { label: "Selesai", badge: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  batal: { label: "Batal", badge: "bg-rose-50 text-rose-700 border-rose-200" },
  tidak_hadir: { label: "Tidak Hadir", badge: "bg-slate-200 text-slate-600 border-slate-300" },
};
