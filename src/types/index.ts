export type UserRole =
  | "super_admin"
  | "hospital_admin"
  | "doctor"
  | "nurse"
  | "registration_staff"
  | "pharmacist"
  | "lab_technician"
  | "radiology_technician"
  | "cashier"
  | "inpatient_staff"
  | "management";

export type PermissionAction =
  | "view"
  | "create"
  | "update"
  | "verify"
  | "approve"
  | "cancel"
  | "export"
  | "manage";

export type ModuleKey =
  | "dashboard"
  | "patients"
  | "registrations"
  | "outpatient"
  | "inpatient"
  | "emergency"
  | "doctor_schedules"
  | "medical_records"
  | "clinical_assessments"
  | "prescriptions"
  | "pharmacy_inventory"
  | "laboratory"
  | "radiology"
  | "billing"
  | "insurance_claims"
  | "staff"
  | "reports"
  | "notifications"
  | "settings";

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  phone?: string;
  avatar_url?: string;
  nip?: string;
  sip_str?: string;
  department_id?: string;
  department_name?: string;
  is_active: boolean;
  created_at: string;
}

export interface HospitalSettings {
  id: string;
  hospital_name: string;
  hospital_code: string;
  license_number: string;
  address: string;
  city: string;
  province: string;
  postal_code: string;
  phone: string;
  email: string;
  website: string;
  timezone: string; // e.g. "Asia/Makassar"
  currency: string;
  tax_identification_number: string;
  logo_url?: string;
  motto: string;
  bpjs_bridge_status: "BELUM TERINTEGRASI" | "TERINTEGRASI" | "UJI COBA";
  satusehat_bridge_status: "BELUM TERINTEGRASI" | "TERINTEGRASI" | "UJI COBA";
}

export interface Patient {
  id: string;
  mrn: string; // Medical Record Number format XX-XX-XX
  nik: string; // 16 digits
  full_name: string;
  gender: "L" | "P";
  birth_date: string; // YYYY-MM-DD
  birth_place: string;
  blood_type?: "A" | "B" | "AB" | "O" | "TIDAK TAHU";
  rhesus?: "+" | "-";
  marital_status: "BELUM KAWIN" | "KAWIN" | "CERAI HIDUP" | "CERAI MATI";
  religion: "ISLAM" | "KRISTEN" | "KATOLIK" | "HINDU" | "BUDDHA" | "KONGHUCU" | "LAINNYA";
  education?: string;
  occupation?: string;
  address_street: string;
  address_village?: string;
  address_district?: string;
  address_city: string;
  address_province: string;
  phone_number: string;
  emergency_contact_name: string;
  emergency_contact_relation: string;
  emergency_contact_phone: string;
  allergies: string[];
  insurance_type: "UMUM" | "BPJS_KESEHATAN" | "ASURANSI_SWASTA";
  insurance_number?: string;
  created_at: string;
  updated_at: string;
}

export type QueueStatus =
  | "terdaftar"
  | "menunggu"
  | "dipanggil"
  | "dilayani"
  | "selesai"
  | "batal"
  | "tidak_hadir";

export interface QueueTicket {
  id: string;
  ticket_number: string; // e.g. POLI-INT-001 or IGD-001
  patient_id: string;
  patient_mrn: string;
  patient_name: string;
  unit_type: "rawat_jalan" | "igd" | "farmasi" | "laboratorium" | "radiologi" | "kasir";
  clinic_id?: string;
  clinic_name?: string;
  doctor_id?: string;
  doctor_name?: string;
  status: QueueStatus;
  priority: "biasa" | "prioritas" | "emergency";
  created_at: string;
  called_at?: string;
  served_at?: string;
  completed_at?: string;
  notes?: string;
}

export interface Registration {
  id: string;
  registration_number: string;
  patient_id: string;
  patient_mrn: string;
  patient_name: string;
  visit_type: "rawat_jalan" | "rawat_inap" | "igd";
  clinic_id?: string;
  clinic_name?: string;
  doctor_id?: string;
  doctor_name?: string;
  insurance_type: "UMUM" | "BPJS_KESEHATAN" | "ASURANSI_SWASTA";
  insurance_number?: string;
  referral_source?: string;
  queue_ticket_id: string;
  queue_ticket_number: string;
  status: "aktif" | "selesai" | "batal";
  created_at: string;
  created_by: string;
}

export interface VitalSigns {
  systolic_bp: number; // mmHg
  diastolic_bp: number; // mmHg
  heart_rate: number; // x/menit
  respiratory_rate: number; // x/menit
  body_temperature: number; // °C
  oxygen_saturation: number; // %
  weight_kg: number;
  height_cm: number;
  bmi: number;
  gcs_e: number; // 1-4
  gcs_v: number; // 1-5
  gcs_m: number; // 1-6
  pain_scale: number; // 0-10
  consciousness: "COMPOS MENTIS" | "APATIS" | "SOMNOLEN" | "SOPOR" | "COMA";
}

export interface ClinicalNote {
  id: string;
  encounter_id: string;
  patient_id: string;
  doctor_id: string;
  doctor_name: string;
  unit_type: "rawat_jalan" | "rawat_inap" | "igd";
  clinic_name?: string;
  status: "draft" | "final" | "addendum";
  subjective: {
    chief_complaint: string;
    history_of_present_illness: string;
    past_medical_history: string;
    family_history: string;
    allergy_notes: string;
  };
  objective: {
    vital_signs: VitalSigns;
    physical_examination: string;
    diagnostic_findings?: string;
  };
  assessment: {
    primary_diagnosis_code: string; // ICD-10
    primary_diagnosis_name: string;
    secondary_diagnoses: { code: string; name: string }[];
    clinical_rationale: string;
  };
  plan: {
    treatment_plan: string;
    procedures_conducted: { code: string; name: string }[];
    education_provided: string;
    prognosis: "BONAM" | "DUBIA AD BONAM" | "DUBIA AD MALAM" | "MALAM";
    follow_up_date?: string;
  };
  signed_at?: string;
  signed_by?: string;
  addendum_reason?: string;
  addendum_notes?: string;
  created_at: string;
  updated_at: string;
}

export type TriageCategory = "P1_RESUSITASI" | "P2_EMERGENSI" | "P3_URGENSI" | "P4_SEMI_URGENSI" | "P5_NON_URGENSI";

export interface EmergencyEncounter {
  id: string;
  registration_id: string;
  patient_id: string;
  patient_name: string;
  patient_mrn: string;
  arrival_time: string;
  transport_method: "SENDIRI" | "AMBULANS_118" | "AMBULANS_SWASTA" | "DIRUJUK_RS_LAIN" | "POLISI";
  triage_level: TriageCategory;
  triage_nurse_id: string;
  triage_nurse_name: string;
  attending_doctor_id?: string;
  attending_doctor_name?: string;
  status: "triase" | "penanganan_akut" | "observasi" | "rawat_inap" | "rujuk_keluar" | "pulang" | "meninggal";
  triage_notes: string;
  disposition_time?: string;
  discharge_summary?: string;
}

export interface Bed {
  id: string;
  room_id: string;
  room_number: string;
  room_class: "VVIP" | "VIP" | "KELAS_1" | "KELAS_2" | "KELAS_3" | "ICU" | "ISOLASI" | "NICU";
  bed_number: string; // e.g. Bed 01
  status: "TERSEDIA" | "TERISI" | "RESERVASI" | "PERBAIKAN" | "DIBERSIHKAN";
  current_admission_id?: string;
  patient_id?: string;
  patient_name?: string;
  patient_mrn?: string;
  tariff_per_night: number;
}

export interface Room {
  id: string;
  name: string;
  ward: string; // Bangsal Melati, Bangsal Mawar, ICU Gedung A
  class: "VVIP" | "VIP" | "KELAS_1" | "KELAS_2" | "KELAS_3" | "ICU" | "ISOLASI" | "NICU";
  floor: number;
  total_beds: number;
  available_beds: number;
  gender_policy: "SEMUA" | "PRIA" | "WANITA" | "ANAK";
}

export interface InpatientAdmission {
  id: string;
  registration_id: string;
  patient_id: string;
  patient_name: string;
  patient_mrn: string;
  admit_date: string;
  discharge_date?: string;
  primary_doctor_id: string;
  primary_doctor_name: string;
  room_id: string;
  room_name: string;
  bed_id: string;
  bed_number: string;
  initial_diagnosis: string;
  status: "aktif" | "pindah_kamar" | "persiapan_pulang" | "pulang_sembuh" | "pulang_aps" | "rujuk" | "meninggal";
  notes?: string;
}

export interface DoctorSchedule {
  id: string;
  doctor_id: string;
  doctor_name: string;
  specialty: string;
  clinic_id: string;
  clinic_name: string;
  day_of_week: "SENIN" | "SELASA" | "RABU" | "KAMIS" | "JUMAT" | "SABTU" | "MINGGU";
  start_time: string; // e.g. "08:00"
  end_time: string;   // e.g. "12:00"
  max_patient_quota: number;
  current_booked: number;
  is_active: boolean;
}

export interface MedicationBatch {
  id: string;
  medication_id: string;
  batch_number: string;
  lot_number: string;
  expiry_date: string; // YYYY-MM-DD
  stock_quantity: number;
  buy_price: number;
  sell_price: number;
  received_date: string;
}

export interface MedicationItem {
  id: string;
  code: string; // e.g. MED-001
  name: string;
  generic_name: string;
  category: "OBAT_KERAS" | "OBAT_BEBAS" | "OBAT_BEBAS_TERBATAS" | "NARKOTIKA" | "PSIKOTROPIKA" | "ALKES";
  unit: "TABLET" | "KAPSUL" | "SIRUP" | "INJEKSI" | "AMPUL" | "TUBE" | "BOTOL" | "PCS";
  min_stock_alert: number;
  total_stock: number;
  is_active: boolean;
  batches: MedicationBatch[];
}

export interface PrescriptionItem {
  id: string;
  medication_id: string;
  medication_name: string;
  dosage: string; // e.g. 500mg
  frequency: string; // e.g. 3 x 1 sehari sesudah makan
  duration_days: number;
  quantity: number;
  unit: string;
  dispensed_batch_id?: string;
  dispensed_quantity?: number;
  dispensed_status: "menunggu" | "terverifikasi" | "diserahkan";
  notes?: string;
}

export interface Prescription {
  id: string;
  prescription_number: string;
  encounter_id: string;
  patient_id: string;
  patient_name: string;
  patient_mrn: string;
  doctor_id: string;
  doctor_name: string;
  clinic_name?: string;
  status: "menunggu_telaah" | "terverifikasi" | "sedang_diracik" | "siap_ambil" | "selesai" | "batal";
  pharmacist_notes?: string;
  verified_by?: string;
  verified_at?: string;
  dispensed_by?: string;
  dispensed_at?: string;
  items: PrescriptionItem[];
  created_at: string;
}

export interface LabOrderItem {
  id: string;
  test_code: string;
  test_name: string;
  sample_type: "DARAH" | "URINE" | "SPUTUM" | "FAECES" | "SWAB" | "CAIRAN_TUBUH";
  reference_range: string;
  unit: string;
  result_value?: string;
  interpretation?: "NORMAL" | "RENDAH" | "TINGGI" | "KRITIS";
  verified_at?: string;
}

export interface LabOrder {
  id: string;
  order_number: string;
  encounter_id: string;
  patient_id: string;
  patient_name: string;
  patient_mrn: string;
  doctor_id: string;
  doctor_name: string;
  priority: "biasa" | "cito";
  specimen_collected_at?: string;
  specimen_collector?: string;
  status: "diminta" | "diterima" | "dalam_proses" | "menunggu_validasi" | "selesai" | "batal";
  technician_id?: string;
  technician_name?: string;
  validator_id?: string;
  validator_name?: string;
  items: LabOrderItem[];
  created_at: string;
}

export interface RadiologyOrder {
  id: string;
  order_number: string;
  encounter_id: string;
  patient_id: string;
  patient_name: string;
  patient_mrn: string;
  doctor_id: string;
  doctor_name: string;
  modality: "X-RAY" | "USG" | "CT-SCAN" | "MRI" | "PANORAMIK";
  examination_name: string;
  clinical_indication: string;
  priority: "biasa" | "cito";
  status: "diminta" | "dijadwalkan" | "pemeriksaan_selesai" | "hasil_selesai" | "batal";
  radiologist_id?: string;
  radiologist_name?: string;
  expertise_report?: string;
  conclusion?: string;
  attachment_urls?: string[];
  created_at: string;
}

export interface InvoiceItem {
  id: string;
  category: "PENDAFTARAN" | "KONSULTASI_DOKTER" | "TINDAKAN" | "FARMASI" | "LABORATORIUM" | "RADIOLOGI" | "KAMAR_RAWAT_INAP";
  item_name: string;
  quantity: number;
  unit_price: number;
  discount: number;
  total_price: number;
}

export interface PaymentRecord {
  id: string;
  invoice_id: string;
  payment_number: string;
  amount: number;
  payment_method: "TUNAI" | "QRIS" | "DEBIT_CARD" | "CREDIT_CARD" | "TRANSFER_BANK" | "BPJS_KESEHATAN" | "ASURANSI";
  reference_number?: string;
  cashier_id: string;
  cashier_name: string;
  paid_at: string;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  patient_id: string;
  patient_name: string;
  patient_mrn: string;
  encounter_id: string;
  insurance_type: "UMUM" | "BPJS_KESEHATAN" | "ASURANSI_SWASTA";
  subtotal: number;
  discount_total: number;
  grand_total: number;
  paid_amount: number;
  remaining_amount: number;
  status: "draft" | "belum_bayar" | "sebagian" | "lunas" | "batal";
  items: InvoiceItem[];
  payments: PaymentRecord[];
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  user_name: string;
  user_role: UserRole;
  action: string; // e.g. "UPDATE_PATIENT", "FINALIZE_SOAP", "DISPENSE_MEDICATION", "PROCESS_PAYMENT"
  resource: string; // e.g. "patients", "clinical_notes", "invoices"
  resource_id: string;
  details: string;
  ip_address?: string;
  created_at: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  category: "antrean" | "resep" | "laboratorium" | "radiologi" | "stok" | "sistem";
  severity: "info" | "warning" | "alert";
  is_read: boolean;
  link?: string;
  created_at: string;
}
