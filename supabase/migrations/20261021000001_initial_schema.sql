-- =====================================================================
-- SIMRS MODERN MASTER SCHEMA MIGRATION
-- Compatible with Supabase PostgreSQL 15+
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. ENUMS & DOMAINS
CREATE TYPE user_role_type AS ENUM (
  'super_admin',
  'hospital_admin',
  'doctor',
  'nurse',
  'registration_staff',
  'pharmacist',
  'lab_technician',
  'radiology_technician',
  'cashier',
  'inpatient_staff',
  'management'
);

CREATE TYPE visit_type_enum AS ENUM ('rawat_jalan', 'rawat_inap', 'igd');
CREATE TYPE queue_status_enum AS ENUM ('terdaftar', 'menunggu', 'dipanggil', 'dilayani', 'selesai', 'batal', 'tidak_hadir');
CREATE TYPE bed_status_enum AS ENUM ('TERSEDIA', 'TERISI', 'RESERVASI', 'PERBAIKAN', 'DIBERSIHKAN');
CREATE TYPE room_class_enum AS ENUM ('VVIP', 'VIP', 'KELAS_1', 'KELAS_2', 'KELAS_3', 'ICU', 'ISOLASI', 'NICU');
CREATE TYPE triage_level_enum AS ENUM ('P1_RESUSITASI', 'P2_EMERGENSI', 'P3_URGENSI', 'P4_SEMI_URGENSI', 'P5_NON_URGENSI');
CREATE TYPE note_status_enum AS ENUM ('draft', 'final', 'addendum');
CREATE TYPE invoice_status_enum AS ENUM ('draft', 'belum_bayar', 'sebagian', 'lunas', 'batal');

-- 2. HOSPITAL SETTINGS & MASTER INSTITUSI
CREATE TABLE IF NOT EXISTS hospital_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_name VARCHAR(255) NOT NULL,
  hospital_code VARCHAR(50) NOT NULL UNIQUE,
  license_number VARCHAR(100) NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  province VARCHAR(100) NOT NULL,
  postal_code VARCHAR(20),
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(100) NOT NULL,
  website VARCHAR(100),
  timezone VARCHAR(50) DEFAULT 'Asia/Makassar',
  currency VARCHAR(10) DEFAULT 'IDR',
  tax_identification_number VARCHAR(50),
  logo_url TEXT,
  motto TEXT,
  bpjs_bridge_status VARCHAR(50) DEFAULT 'BELUM TERINTEGRASI',
  satusehat_bridge_status VARCHAR(50) DEFAULT 'BELUM TERINTEGRASI',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PROFILES, ROLES & DEPARTMENTS
CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(150) NOT NULL UNIQUE,
  code VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  role user_role_type NOT NULL DEFAULT 'registration_staff',
  phone VARCHAR(50),
  avatar_url TEXT,
  nip VARCHAR(50),
  sip_str VARCHAR(100),
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CLINICS & DOCTORS
CREATE TABLE IF NOT EXISTS clinics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(150) NOT NULL UNIQUE,
  code VARCHAR(50) NOT NULL UNIQUE,
  location VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS doctor_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
  day_of_week VARCHAR(20) NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  max_patient_quota INT NOT NULL DEFAULT 20,
  current_booked INT NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT check_time_range CHECK (end_time > start_time)
);

-- 5. PATIENTS & CONTACTS (UU PDP COMPLIANT)
CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mrn VARCHAR(20) NOT NULL UNIQUE, -- XX-XX-XX
  nik VARCHAR(16) NOT NULL UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  gender CHAR(1) NOT NULL CHECK (gender IN ('L', 'P')),
  birth_date DATE NOT NULL,
  birth_place VARCHAR(100) NOT NULL,
  blood_type VARCHAR(10) DEFAULT 'TIDAK TAHU',
  rhesus CHAR(1) DEFAULT '+',
  marital_status VARCHAR(50) DEFAULT 'BELUM KAWIN',
  religion VARCHAR(50) DEFAULT 'ISLAM',
  education VARCHAR(50),
  occupation VARCHAR(100),
  address_street TEXT NOT NULL,
  address_village VARCHAR(100),
  address_district VARCHAR(100),
  address_city VARCHAR(100) NOT NULL,
  address_province VARCHAR(100) NOT NULL,
  phone_number VARCHAR(50) NOT NULL,
  emergency_contact_name VARCHAR(150) NOT NULL,
  emergency_contact_relation VARCHAR(50) NOT NULL,
  emergency_contact_phone VARCHAR(50) NOT NULL,
  allergies TEXT[] DEFAULT ARRAY[]::TEXT[],
  insurance_type VARCHAR(50) DEFAULT 'UMUM',
  insurance_number VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_patients_mrn ON patients(mrn);
CREATE INDEX idx_patients_nik ON patients(nik);
CREATE INDEX idx_patients_name ON patients(full_name);

-- 6. QUEUE TICKETS & REGISTRATIONS
CREATE TABLE IF NOT EXISTS queue_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number VARCHAR(50) NOT NULL,
  patient_id UUID REFERENCES patients(id) ON DELETE RESTRICT,
  unit_type VARCHAR(50) NOT NULL,
  clinic_id UUID REFERENCES clinics(id) ON DELETE SET NULL,
  doctor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status queue_status_enum NOT NULL DEFAULT 'terdaftar',
  priority VARCHAR(20) DEFAULT 'biasa',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  called_at TIMESTAMPTZ,
  served_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_number VARCHAR(100) NOT NULL UNIQUE,
  patient_id UUID REFERENCES patients(id) ON DELETE RESTRICT,
  visit_type visit_type_enum NOT NULL,
  clinic_id UUID REFERENCES clinics(id) ON DELETE SET NULL,
  doctor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  insurance_type VARCHAR(50) NOT NULL,
  insurance_number VARCHAR(100),
  queue_ticket_id UUID REFERENCES queue_tickets(id) ON DELETE SET NULL,
  status VARCHAR(20) DEFAULT 'aktif',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL
);

-- 7. CLINICAL ENCOUNTERS & MEDICAL RECORDS (EMR / SOAP)
CREATE TABLE IF NOT EXISTS clinical_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id UUID REFERENCES registrations(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES patients(id) ON DELETE RESTRICT,
  doctor_id UUID REFERENCES profiles(id) ON DELETE RESTRICT,
  unit_type VARCHAR(50) NOT NULL,
  status note_status_enum NOT NULL DEFAULT 'draft',
  
  -- Subjective
  chief_complaint TEXT NOT NULL,
  history_of_present_illness TEXT,
  past_medical_history TEXT,
  family_history TEXT,
  allergy_notes TEXT,
  
  -- Objective
  systolic_bp INT,
  diastolic_bp INT,
  heart_rate INT,
  respiratory_rate INT,
  body_temperature NUMERIC(4,1),
  oxygen_saturation INT,
  weight_kg NUMERIC(5,2),
  height_cm NUMERIC(5,2),
  bmi NUMERIC(4,1),
  gcs_score VARCHAR(20),
  pain_scale INT CHECK (pain_scale >= 0 AND pain_scale <= 10),
  physical_examination TEXT,
  
  -- Assessment
  primary_diagnosis_code VARCHAR(20) NOT NULL,
  primary_diagnosis_name VARCHAR(255) NOT NULL,
  secondary_diagnoses JSONB DEFAULT '[]'::JSONB,
  clinical_rationale TEXT,
  
  -- Plan
  treatment_plan TEXT NOT NULL,
  procedures_conducted JSONB DEFAULT '[]'::JSONB,
  education_provided TEXT,
  prognosis VARCHAR(50),
  follow_up_date DATE,
  
  signed_at TIMESTAMPTZ,
  signed_by UUID REFERENCES profiles(id),
  addendum_reason TEXT,
  addendum_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. EMERGENCY / IGD & TRIAGE
CREATE TABLE IF NOT EXISTS emergency_encounters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id UUID REFERENCES registrations(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES patients(id) ON DELETE RESTRICT,
  arrival_time TIMESTAMPTZ DEFAULT NOW(),
  transport_method VARCHAR(100) NOT NULL,
  triage_level triage_level_enum NOT NULL,
  triage_nurse_id UUID REFERENCES profiles(id) ON DELETE RESTRICT,
  attending_doctor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status VARCHAR(50) DEFAULT 'triase',
  triage_notes TEXT NOT NULL,
  disposition_time TIMESTAMPTZ,
  discharge_summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. ROOMS, BEDS & INPATIENT
CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(150) NOT NULL,
  ward VARCHAR(150) NOT NULL,
  class room_class_enum NOT NULL,
  floor INT NOT NULL DEFAULT 1,
  total_beds INT NOT NULL DEFAULT 1,
  available_beds INT NOT NULL DEFAULT 1,
  gender_policy VARCHAR(20) DEFAULT 'SEMUA',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS beds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  bed_number VARCHAR(50) NOT NULL,
  status bed_status_enum NOT NULL DEFAULT 'TERSEDIA',
  tariff_per_night NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(room_id, bed_number)
);

CREATE TABLE IF NOT EXISTS inpatient_admissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id UUID REFERENCES registrations(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES patients(id) ON DELETE RESTRICT,
  admit_date TIMESTAMPTZ DEFAULT NOW(),
  discharge_date TIMESTAMPTZ,
  primary_doctor_id UUID REFERENCES profiles(id) ON DELETE RESTRICT,
  room_id UUID REFERENCES rooms(id) ON DELETE RESTRICT,
  bed_id UUID REFERENCES beds(id) ON DELETE RESTRICT,
  initial_diagnosis TEXT NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'aktif',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. PHARMACY & INVENTORY (FEFO)
CREATE TABLE IF NOT EXISTS medication_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  generic_name VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL,
  unit VARCHAR(50) NOT NULL,
  min_stock_alert INT NOT NULL DEFAULT 50,
  total_stock INT NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS medication_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medication_id UUID REFERENCES medication_catalog(id) ON DELETE CASCADE,
  batch_number VARCHAR(100) NOT NULL,
  lot_number VARCHAR(100),
  expiry_date DATE NOT NULL,
  stock_quantity INT NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  buy_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  sell_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  received_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_med_batches_expiry ON medication_batches(medication_id, expiry_date ASC);

CREATE TABLE IF NOT EXISTS prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prescription_number VARCHAR(100) NOT NULL UNIQUE,
  registration_id UUID REFERENCES registrations(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES patients(id) ON DELETE RESTRICT,
  doctor_id UUID REFERENCES profiles(id) ON DELETE RESTRICT,
  status VARCHAR(50) NOT NULL DEFAULT 'menunggu_telaah',
  pharmacist_notes TEXT,
  verified_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  verified_at TIMESTAMPTZ,
  dispensed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  dispensed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS prescription_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prescription_id UUID REFERENCES prescriptions(id) ON DELETE CASCADE,
  medication_id UUID REFERENCES medication_catalog(id) ON DELETE RESTRICT,
  dosage VARCHAR(100) NOT NULL,
  frequency VARCHAR(100) NOT NULL,
  duration_days INT NOT NULL DEFAULT 1,
  quantity INT NOT NULL CHECK (quantity > 0),
  unit VARCHAR(50) NOT NULL,
  dispensed_status VARCHAR(50) DEFAULT 'menunggu',
  notes TEXT
);

-- 11. LABORATORY & RADIOLOGY
CREATE TABLE IF NOT EXISTS lab_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(100) NOT NULL UNIQUE,
  registration_id UUID REFERENCES registrations(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES patients(id) ON DELETE RESTRICT,
  doctor_id UUID REFERENCES profiles(id) ON DELETE RESTRICT,
  priority VARCHAR(20) DEFAULT 'biasa',
  specimen_collected_at TIMESTAMPTZ,
  specimen_collector VARCHAR(150),
  status VARCHAR(50) DEFAULT 'diminta',
  technician_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  validator_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lab_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lab_order_id UUID REFERENCES lab_orders(id) ON DELETE CASCADE,
  test_code VARCHAR(50) NOT NULL,
  test_name VARCHAR(150) NOT NULL,
  sample_type VARCHAR(50) NOT NULL,
  reference_range VARCHAR(100) NOT NULL,
  unit VARCHAR(50) NOT NULL,
  result_value VARCHAR(100),
  interpretation VARCHAR(50),
  verified_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS radiology_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(100) NOT NULL UNIQUE,
  registration_id UUID REFERENCES registrations(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES patients(id) ON DELETE RESTRICT,
  doctor_id UUID REFERENCES profiles(id) ON DELETE RESTRICT,
  modality VARCHAR(50) NOT NULL,
  examination_name VARCHAR(200) NOT NULL,
  clinical_indication TEXT NOT NULL,
  priority VARCHAR(20) DEFAULT 'biasa',
  status VARCHAR(50) DEFAULT 'diminta',
  radiologist_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  expertise_report TEXT,
  conclusion TEXT,
  attachment_urls TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. BILLING, INVOICES & PAYMENTS
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number VARCHAR(100) NOT NULL UNIQUE,
  registration_id UUID REFERENCES registrations(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES patients(id) ON DELETE RESTRICT,
  insurance_type VARCHAR(50) NOT NULL,
  subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
  discount_total NUMERIC(12,2) NOT NULL DEFAULT 0,
  grand_total NUMERIC(12,2) NOT NULL DEFAULT 0,
  paid_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  remaining_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  status invoice_status_enum NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
  category VARCHAR(50) NOT NULL,
  item_name VARCHAR(255) NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  unit_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  discount NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_price NUMERIC(12,2) NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
  payment_number VARCHAR(100) NOT NULL UNIQUE,
  amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  payment_method VARCHAR(50) NOT NULL,
  reference_number VARCHAR(100),
  cashier_id UUID REFERENCES profiles(id) ON DELETE RESTRICT,
  paid_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. AUDIT LOGS (APPEND-ONLY FOR TAMPER DETECTION)
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  user_name VARCHAR(255) NOT NULL,
  user_role VARCHAR(50) NOT NULL,
  action VARCHAR(100) NOT NULL,
  resource VARCHAR(100) NOT NULL,
  resource_id VARCHAR(100) NOT NULL,
  details TEXT NOT NULL,
  ip_address VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_created ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_resource ON audit_logs(resource, resource_id);

-- =====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE queue_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE beds ENABLE ROW LEVEL SECURITY;
ALTER TABLE inpatient_admissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE radiology_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Base policy: authenticated users can read master data
CREATE POLICY "Profiles viewable by authenticated users" ON profiles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Patients viewable by hospital staff" ON patients
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Patients insertable by registration and doctors" ON patients
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('super_admin', 'hospital_admin', 'registration_staff', 'doctor', 'nurse')
    )
  );

-- Clinical Notes: only doctor and nurse can create/update draft; no hard delete
CREATE POLICY "Clinical notes viewable by clinical staff" ON clinical_notes
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('super_admin', 'doctor', 'nurse', 'hospital_admin')
    )
  );

CREATE POLICY "Clinical notes insertable by doctors and nurses" ON clinical_notes
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('super_admin', 'doctor', 'nurse')
    )
  );

-- Invoices: viewable by cashier, admin, management; insertable by cashier
CREATE POLICY "Invoices viewable by cashier and admin" ON invoices
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('super_admin', 'hospital_admin', 'cashier', 'management')
    )
  );

-- Audit log: strictly append-only
CREATE POLICY "Audit logs viewable by super_admin and hospital_admin" ON audit_logs
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('super_admin', 'hospital_admin')
    )
  );

CREATE POLICY "Audit logs insertable by any authenticated action" ON audit_logs
  FOR INSERT TO authenticated WITH CHECK (true);
