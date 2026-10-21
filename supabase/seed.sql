-- =====================================================================
-- SIMRS SEED DATA (INDONESIAN HOSPITAL PRODUCTION-READY SEED)
-- =====================================================================

INSERT INTO hospital_settings (
  hospital_name, hospital_code, license_number, address, city, province, postal_code,
  phone, email, website, timezone, currency, motto, bpjs_bridge_status, satusehat_bridge_status
) VALUES (
  'RSUD Pratama Sehat Mandiri',
  'RS7371099',
  '445/098/SIP-RS/DINKES/2024',
  'Jl. Jenderal Sudirman No. 88, Sawerigading',
  'Kota Makassar',
  'Sulawesi Selatan',
  '90115',
  '(0411) 876-5432',
  'layanan@rsudsehatmandiri.go.id',
  'https://rsudsehatmandiri.go.id',
  'Asia/Makassar',
  'IDR',
  'Melayani dengan Empati, Keahlian, dan Integritas Klinis',
  'BELUM TERINTEGRASI',
  'BELUM TERINTEGRASI'
) ON CONFLICT DO NOTHING;

INSERT INTO clinics (name, code, location) VALUES
  ('Poli Penyakit Dalam', 'POLI-INT', 'Gedung Rawat Jalan Lt. 1 Sayap Barat'),
  ('Poli Kesehatan Anak', 'POLI-ANK', 'Gedung Rawat Jalan Lt. 1 Sayap Timur'),
  ('Poli Jantung & Pembuluh Darah', 'POLI-JTG', 'Gedung Kardiovaskular Lt. 2'),
  ('Poli Bedah Umum', 'POLI-BDH', 'Gedung Rawat Jalan Lt. 2 Sayap Barat'),
  ('Poli Gigi & Mulut', 'POLI-GGI', 'Gedung Rawat Jalan Lt. 2 Sayap Timur')
ON CONFLICT (code) DO NOTHING;

INSERT INTO rooms (name, ward, class, floor, total_beds, available_beds, gender_policy) VALUES
  ('Ruang Anggrek VIP 01', 'Gedung Paviliun Anggrek Lt. 3', 'VIP', 3, 1, 0, 'SEMUA'),
  ('Ruang Melati K1-A', 'Bangsal Melati Lt. 2', 'KELAS_1', 2, 2, 1, 'WANITA'),
  ('Ruang Mawar K2-B', 'Bangsal Mawar Lt. 1', 'KELAS_2', 1, 4, 2, 'PRIA'),
  ('Intensive Care Unit (ICU)', 'Gedung Bedah Sentral Lt. 2', 'ICU', 2, 4, 1, 'SEMUA')
ON CONFLICT DO NOTHING;

INSERT INTO medication_catalog (code, name, generic_name, category, unit, min_stock_alert, total_stock) VALUES
  ('OBT-001', 'Amlodipine 10 mg', 'Amlodipine Besylate', 'OBAT_KERAS', 'TABLET', 100, 450),
  ('OBT-002', 'Metformin 500 mg', 'Metformin HCl', 'OBAT_KERAS', 'TABLET', 150, 620),
  ('OBT-003', 'Paracetamol 500 mg', 'Paracetamol', 'OBAT_BEBAS', 'TABLET', 200, 1200),
  ('OBT-004', 'Cefixime 100 mg', 'Cefixime Trihydrate', 'OBAT_KERAS', 'KAPSUL', 80, 75),
  ('OBT-005', 'Omeprazole 20 mg', 'Omeprazole', 'OBAT_KERAS', 'KAPSUL', 100, 350),
  ('OBT-006', 'Cairan Ringer Lactate 500 ml', 'Sodium Lactate Formula', 'OBAT_KERAS', 'BOTOL', 50, 140)
ON CONFLICT (code) DO NOTHING;
