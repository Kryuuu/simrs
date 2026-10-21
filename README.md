# SIMRS MODERN — SISTEM INFORMASI MANAJEMEN RUMAH SAKIT
**Berorientasi Produksi, Terintegrasi, dan Berstandar Regulasi Kementerian Kesehatan Republik Indonesia**

Aplikasi SIMRS (Sistem Informasi Manajemen Rumah Sakit) generasi modern berbasis web responsif & Progressive Web App (PWA) satu codebase untuk desktop, tablet, dan mobile. Dibangun menggunakan **Next.js App Router (TypeScript Strict)**, **Tailwind CSS**, **shadcn/ui aesthetics**, **Lucide Icons**, **Recharts**, serta **Supabase PostgreSQL dengan Row Level Security (RLS)**.

---

## 🏥 Identitas & Profil Rumah Sakit Bawaan
- **Nama Rumah Sakit**: RSUD Pratama Sehat Mandiri
- **Kode Faskes**: `RS7371099`
- **Nomor Izin Operasional**: `445/098/SIP-RS/DINKES/2024`
- **Zona Waktu Pelayanan**: `Asia/Makassar` (WITA - dapat dikonfigurasi)
- **Mata Uang**: Rupiah (IDR)
- **Semboyan**: *"Melayani dengan Empati, Keahlian, dan Integritas Klinis"*

---

## 📦 19 Modul Operasional Lengkap End-to-End

| No | Modul | Rute URL | Deskripsi Fungsional |
|---|---|---|---|
| 1 | **Dashboard & Statistik** | `/dashboard` | KPI real-time: kunjungan rawat jalan, sensus IGD, BOR tempat tidur, antrean loket, order cito, dan rekapitulasi keuangan terlindungi RBAC. |
| 2 | **Pasien & Master Data** | `/patients` | Rekam data pasien, generator No. RM unik bebas race condition (`XX-XX-XX`), penyamaran NIK sensitif (UU PDP), dan deteksi otomatis duplikasi data. |
| 3 | **Pendaftaran & Antrean** | `/registrations` | Registrasi kunjungan rawat jalan/IGD, penerbitan tiket antrean atomik (`POLI-INT-001`), display loket, dan pencetakan slip antrean. |
| 4 | **Rawat Jalan (Poliklinik)** | `/outpatient` | Workstation dokter DPJP, antrean poli aktif, rekam medis SOAP komprehensif, ICD-10 diagnosis picker, e-prescription, dan order lab cito. |
| 5 | **Rawat Inap & Bed** | `/inpatient` | Peta ketersediaan tempat tidur visual per bangsal (VVIP, VIP, K1, K2, K3, ICU), admisi pasien dengan proteksi anti-double booking, mutasi kamar, dan resume discharge. |
| 6 | **IGD & Triase Klinis** | `/emergency` | Penerimaan kegawatdaruratan berstandar Australian Triage Scale (P1 Resusitasi s/d P5 Non Urgensi), respon time tracking, dan pemantauan dokter jaga. |
| 7 | **Jadwal Dokter & Poli** | `/schedules` | Manajemen jadwal praktik, spesialisasi, kapasitas kuota harian pasien, validasi benturan jadwal dokter, dan zona waktu WITA. |
| 8 | **Rekam Medis (EMR)** | `/medical-records` | Lini masa riwayat medis longitudinal, riwayat resep masa lalu, hasil penunjang terintegrasi, dan cetak resume medis resmi (Permenkes No. 24/2022). |
| 9 | **Farmasi & Resep** | `/pharmacy` | Antrean resep elektronik, telaah resep 7 benar oleh Apoteker (SIPA), dispensing otomatis stok batch FEFO, dan cetak etiket aturan pakai obat. |
| 10 | **Inventaris Obat & Alkes** | `/inventory` | Katalog formularium, pelacakan lot batch kedaluwarsa, peringatan stok minimum, mutasi stok masuk, dan perhitungan valuasi aset farmasi. |
| 11 | **Laboratorium** | `/laboratory` | Order tes darah lengkap/kimia darah/urin, entri nilai hasil dengan nilai rujukan L/P, validasi analis medis, dan cetak lembar hasil lab resmi. |
| 12 | **Radiologi & Pencitraan** | `/radiology` | Order modalitas X-Ray, USG, CT-Scan, pengisian ekspertise dokter spesialis radiologi (Sp.Rad), dan cetak lembar laporan diagnostik. |
| 13 | **Kasir, Billing & Kas** | `/billing` | Konsolidasi rincian biaya tindakan, obat, kamar rawat inap, pembayaran multi-metode (Tunai/QRIS/Transfer/BPJS), split payment, dan kuitansi resmi. |
| 14 | **Penjamin & E-Klaim** | `/insurance` | Manajemen penjamin (BPJS Kesehatan, Umum, Asuransi Swasta), dan adapter bridging berstatus transparan `BELUM TERINTEGRASI` sesuai regulasi resmi. |
| 15 | **Kepegawaian (SDM)** | `/staff` | Direktori tenaga medis dokter spesialis, perawat, apoteker, analis, staf admisi, nomor STR/SIP, dan unit departemen kerja. |
| 16 | **Laporan Operasional** | `/reports` | Laporan sensus kunjungan, 10 besar penyakit ICD-10, indikator BOR rawat inap, rekapitulasi kasir, ekspor CSV riil ke Excel, dan cetak laporan PDF. |
| 17 | **Pusat Notifikasi** | `/notifications` | Notifikasi in-app real-time untuk order lab cito, resep menunggu telaah, peringatan stok menipis, dan tautan langsung ke modul terkait. |
| 18 | **Pengaturan & Role** | `/settings` | Konfigurasi profil instansi rumah sakit, semboyan, alamat, zona waktu, panduan koneksi Supabase, dan viewer matriks RBAC 11 peran. |
| 19 | **Audit Log Forensik** | `/audit` | Rekam jejak transaksi audit append-only yang tidak dapat dimanipulasi oleh pengguna biasa, memuat aktor, peran, aksi, waktu, dan detail perubahan. |

---

## 👥 Matriks 11 Role & Hak Akses (RBAC)

Aplikasi menerapkan prinsip *least privilege* dengan validasi peran:
1. **Super Admin**: Konfigurasi sistem penuh, audit logs, dan manajemen seluruh entitas.
2. **Admin Rumah Sakit**: Master data fasilitas, jadwal dokter, kepegawaian, dan laporan operasional.
3. **Dokter (DPJP)**: Penanganan pasien berwenang, EMR SOAP, diagnosis ICD-10, order resep, lab, dan radiologi.
4. **Perawat / Bidan**: Asesmen keperawatan, tanda vital lengkap, triase IGD (ATS), dan monitoring bed rawat inap.
5. **Petugas Pendaftaran**: Admisi pasien, verifikasi NIK, penerbitan tiket antrean, dan pendaftaran kunjungan poli.
6. **Apoteker**: Telaah klinis 7 benar, verifikasi resep dokter, dispensing FEFO, dan kontrol stok obat.
7. **Petugas Laboratorium**: Pengambilan spesimen, entri hasil tes patologi klinik, dan validasi analis medis.
8. **Petugas Radiologi**: Pelaksanaan pemeriksaan X-Ray/USG/CT-Scan dan penyusunan ekspertise Sp.Rad.
9. **Kasir & Keuangan**: Penerimaan pembayaran tunai/QRIS, pelunasan invoice, dan pencetakan kuitansi resmi.
10. **Petugas Rawat Inap**: Manajemen kamar, mutasi antar tempat tidur, sensus BOR, dan discharge summary.
11. **Manajemen / Direksi**: Pemantauan KPI eksekutif, grafik tren, dan laporan agregat (tanpa akses langsung membuka rekam medis perorangan pasien demi privasi).

*Catatan: Pada Mode Demo, Anda dapat berganti peran secara instan menggunakan tombol **Role Switcher** di bilah kanan atas (Header) untuk menguji batasan akses setiap peran secara langsung.*

---

## 🚀 Panduan Setup & Menjalankan Lokal

### 1. Prasyarat Sistem
- Node.js versi `v20.x` atau lebih baru (`v25.x` didukung penuh).
- npm versi `10.x` atau lebih baru.

### 2. Instalasi Dependensi
```bash
npm install --legacy-peer-deps
```

### 3. Konfigurasi Environment Variables
Salin file template `.env.example` menjadi `.env.local`:
```bash
cp .env.example .env.local
```
Isi konfigurasi pada file `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_DEFAULT_TIMEZONE=Asia/Makassar
NEXT_PUBLIC_HOSPITAL_NAME="RSUD Pratama Sehat Mandiri"
```

*Catatan: Jika kredensial Supabase belum diisi, aplikasi otomatis berjalan dalam **Mode Demo Interaktif** dengan banner status yang jelas, penyimpanan `localStorage` terisolasi, dan 100% fungsionalitas interaktif aktif tanpa mock failure.*

### 4. Menjalankan Server Development
```bash
npm run dev
```
Buka browser di `http://localhost:3000`.

---

## 🗄️ Setup Database Supabase PostgreSQL & Migrasi

Jika Anda menghubungkan aplikasi ke instance live Supabase:

1. Buat proyek baru di [Supabase Dashboard](https://supabase.com).
2. Buka menu **SQL Editor** pada proyek Supabase Anda.
3. Jalankan seluruh skrip DDL migrasi dari file:
   `supabase/migrations/20261021000001_initial_schema.sql`
   - Berisi 40+ tabel relasional lengkap (`patients`, `clinical_notes`, `beds`, `prescriptions`, `medication_batches`, `invoices`, dll.).
   - Dilengkapi check constraint, foreign key, index, dan Row Level Security (RLS) policies eksplisit.
4. Jalankan skrip seed data awal rumah sakit dari file:
   `supabase/seed.sql`
5. Salin URL dan Anon Key ke `.env.local`, lalu restart aplikasi.

---

## 🔒 Keamanan, Privasi & Kepatuhan Regulasi

1. **UU Perlindungan Data Pribadi (UU No. 27 Tahun 2022)**:
   - Nomor Induk Kependudukan (NIK 16 digit) disamarkan secara otomatis di tabel pasien (`7371********0001`).
   - Tombol buka masker hanya dapat diakses oleh petugas admisi dan tenaga medis yang berwenang.
2. **Permenkes No. 24 Tahun 2022 tentang Rekam Medis**:
   - Pemisahan status catatan klinis: `Draft` (dapat diedit dokter pemeriksa) vs `Final` (terkunci dengan tanda tangan elektronik DPJP) vs `Addendum` (koreksi tercatat dengan alasan resmi).
   - Larangan *hard delete* untuk data rekam medis dan transaksi keuangan.
3. **Standar Farmasi FEFO (First Expired, First Out)**:
   - Pengeluaran obat otomatis memprioritaskan batch dengan masa kedaluwarsa terdekat.
   - Peringatan dini stok obat minimum dan obat mendekati kedaluwarsa (< 6 bulan).
4. **Proteksi Kamar & Bed Rawat Inap**:
   - Validasi database mencegah satu tempat tidur aktif dipesan oleh dua pasien sekaligus (*anti-double booking*).

---

## 📱 Progressive Web App (PWA) & Dukungan Mobile

- **Web App Manifest**: Dikonfigurasi di `src/app/manifest.ts` dengan tema `#0d9488` (Teal) dan `#0f172a` (Slate).
- **Service Worker Aman**: Disediakan di `public/sw.js`. Meng-cache shell aplikasi, font, dan aset statis; **secara ketat tidak menyimpan data rekam medis atau informasi klinis pasien di cache offline umum** demi keamanan data.
- **Install Prompt**: Banner ramah pengguna untuk instalasi mandiri di Android (WebAPK), Desktop Chrome/Edge, serta panduan *Add to Home Screen* pada iOS Safari.
- **Responsive Layout**: Menyesuaikan tampilan secara ergonomis di desktop, tablet, dan smartphone Android/iPhone.

---

## 🧪 Pengujian & Verifikasi Kualitas

Aplikasi telah divalidasi dengan pengujian multi-lapis:

1. **Automated Unit & Domain Logic Tests**:
   ```bash
   node tests/run-tests.mjs
   ```
   *Menguji matriks izin RBAC (akses dokter vs kasir vs manajemen), penyamaran NIK UU PDP, algoritma dispensing FEFO farmasi, dan proteksi anti-double booking bed rawat inap.*

2. **TypeScript Strict Typecheck**:
   ```bash
   npx tsc --noEmit
   ```
   *Memvalidasi kepatuhan tipe TypeScript tanpa error.*

3. **Production Static Optimization Build**:
   ```bash
   npm run build
   ```
   *Memvalidasi kompilasi 24 rute halaman Next.js App Router dengan Turbopack.*

---

## 🚢 Panduan Deployment & Backup

- **Platform Deployment**: Vercel, Coolify, Docker Container, atau VPS Ubuntu/Nginx.
- **Prosedur Backup Database**:
  ```bash
  # Backup berkala PostgreSQL Supabase via pg_dump
  pg_dump -h db.your-project.supabase.co -U postgres -d postgres -F c -b -v -f "simrs_backup_$(date +%Y%m%d).dump"
  ```
- **Prosedur Pemulihan (Restore)**:
  ```bash
  pg_restore -h db.your-project.supabase.co -U postgres -d postgres -v "simrs_backup_YYYYMMDD.dump"
  ```
- **Pemantauan & Audit**: Tinjau modul `/audit` secara berkala untuk memantau upaya akses yang mencurigakan dan histori aktivitas transaksi rumah sakit.
