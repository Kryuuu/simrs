export interface BPJSParticipant {
  nomor_kartu: string; // 13 digits
  nik: string; // 16 digits
  nama: string;
  jenis_kelamin: "L" | "P";
  tanggal_lahir: string; // YYYY-MM-DD
  tempat_lahir: string;
  golongan_darah: "A" | "B" | "AB" | "O" | "TIDAK TAHU";
  rhesus: "+" | "-";
  status_peserta: "AKTIF" | "TIDAK AKTIF";
  jenis_peserta: "PBI (APBN)" | "PPU (Pekerja Swasta)" | "PBPU (Mandiri)" | "PNS / TNI / POLRI";
  kelas_rawat: "KELAS 1" | "KELAS 2" | "KELAS 3";
  faskes_1: string;
  kode_faskes_1: string;
  nomor_rujukan: string;
  tanggal_rujukan: string;
  diagnosa_rujukan: string;
  alamat_jalan: string;
  kelurahan: string;
  kecamatan: string;
  kota: string;
  provinsi: string;
  nomor_telepon: string;
  nama_kontak_darurat: string;
  hubungan_darurat: string;
  telepon_darurat: string;
  alergi?: string[];
}

// Database Simulasi Kepesertaan BPJS Kesehatan vClaim Trust Mark Kemenkes
export const SAMPLE_BPJS_DATABASE: Record<string, BPJSParticipant> = {
  "0001892837461": {
    nomor_kartu: "0001892837461",
    nik: "7371091508890001",
    nama: "BUDI SANTOSO",
    jenis_kelamin: "L",
    tanggal_lahir: "1989-08-15",
    tempat_lahir: "Makassar",
    golongan_darah: "O",
    rhesus: "+",
    status_peserta: "AKTIF",
    jenis_peserta: "PPU (Pekerja Swasta)",
    kelas_rawat: "KELAS 1",
    faskes_1: "Klinik Pratama Sawerigading",
    kode_faskes_1: "0214B001",
    nomor_rujukan: "180101010226P000124",
    tanggal_rujukan: "2026-02-15",
    diagnosa_rujukan: "I10 - Essential (primary) hypertension",
    alamat_jalan: "Jl. Veteran Selatan No. 124 RT 03 / RW 02",
    kelurahan: "Maricaya",
    kecamatan: "Mamajang",
    kota: "Kota Makassar",
    provinsi: "Sulawesi Selatan",
    nomor_telepon: "081241982736",
    nama_kontak_darurat: "Rina Wijaya",
    hubungan_darurat: "Suami / Istri",
    telepon_darurat: "081355112233",
    alergi: ["Amoxicillin (Ruam Kulit)", "Seafood"],
  },
  "0002938475610": {
    nomor_kartu: "0002938475610",
    nik: "7371125203750002",
    nama: "SITI FATIMAH",
    jenis_kelamin: "P",
    tanggal_lahir: "1975-03-12",
    tempat_lahir: "Gowa",
    golongan_darah: "A",
    rhesus: "+",
    status_peserta: "AKTIF",
    jenis_peserta: "PBI (APBN)",
    kelas_rawat: "KELAS 3",
    faskes_1: "Puskesmas Labuang Baji",
    kode_faskes_1: "0214P008",
    nomor_rujukan: "180101010226P000189",
    tanggal_rujukan: "2026-02-18",
    diagnosa_rujukan: "E11.9 - Type 2 diabetes mellitus without complications",
    alamat_jalan: "Jl. Ratulangi Komp. Mawar Indah B/12",
    kelurahan: "Labuang Baji",
    kecamatan: "Mamajang",
    kota: "Kota Makassar",
    provinsi: "Sulawesi Selatan",
    nomor_telepon: "085299441188",
    nama_kontak_darurat: "H. Rustam",
    hubungan_darurat: "Suami / Istri",
    telepon_darurat: "0811440022",
    alergi: ["Sulfa"],
  },
  "0003847561928": {
    nomor_kartu: "0003847561928",
    nik: "7371032811980003",
    nama: "AHMAD FAUZI",
    jenis_kelamin: "L",
    tanggal_lahir: "1998-11-28",
    tempat_lahir: "Maros",
    golongan_darah: "B",
    rhesus: "+",
    status_peserta: "AKTIF",
    jenis_peserta: "PBPU (Mandiri)",
    kelas_rawat: "KELAS 2",
    faskes_1: "Puskesmas Panaikang",
    kode_faskes_1: "0214P012",
    nomor_rujukan: "180101010226P000240",
    tanggal_rujukan: "2026-02-20",
    diagnosa_rujukan: "K29.7 - Gastritis, unspecified",
    alamat_jalan: "Jl. Urip Sumoharjo No. 45 RT 01 / RW 04",
    kelurahan: "Panaikang",
    kecamatan: "Panakkukang",
    kota: "Kota Makassar",
    provinsi: "Sulawesi Selatan",
    nomor_telepon: "082188773322",
    nama_kontak_darurat: "Fatimah",
    hubungan_darurat: "Orang Tua (Ayah / Ibu)",
    telepon_darurat: "085342119988",
    alergi: [],
  },
  "0004928172635": {
    nomor_kartu: "0004928172635",
    nik: "7371104104920004",
    nama: "DEWI ANGGRAENI",
    jenis_kelamin: "P",
    tanggal_lahir: "1992-04-01",
    tempat_lahir: "Makassar",
    golongan_darah: "AB",
    rhesus: "+",
    status_peserta: "AKTIF",
    jenis_peserta: "PPU (Pekerja Swasta)",
    kelas_rawat: "KELAS 1",
    faskes_1: "Klinik Medika Pratama Tamalanrea",
    kode_faskes_1: "0214B009",
    nomor_rujukan: "180101010226P000311",
    tanggal_rujukan: "2026-02-21",
    diagnosa_rujukan: "J06.9 - Acute upper respiratory infection, unspecified",
    alamat_jalan: "Jl. Perintis Kemerdekaan KM. 11 No. 80",
    kelurahan: "Tamalanrea Indah",
    kecamatan: "Tamalanrea",
    kota: "Kota Makassar",
    provinsi: "Sulawesi Selatan",
    nomor_telepon: "081298765432",
    nama_kontak_darurat: "Ilham Ramadhan",
    hubungan_darurat: "Suami / Istri",
    telepon_darurat: "081399887766",
    alergi: [],
  },
};

/**
 * Simulasi Bridging vClaim BPJS Kesehatan
 * Menerima nomor kartu BPJS (atau nomor polis) dan mengembalikan data peserta lengkap.
 * Jika nomor tidak ada di sample, dibuatkan profil deterministic valid agar nomor apapun bisa dites!
 */
export async function lookupBPJSParticipant(rawCardNumber: string): Promise<BPJSParticipant> {
  // Simulasi network delay vClaim API BPJS 400ms
  await new Promise((resolve) => setTimeout(resolve, 400));

  const cleanNum = rawCardNumber.replace(/\D/g, "");

  // 1. Cek di kamus data sample
  if (SAMPLE_BPJS_DATABASE[cleanNum]) {
    return SAMPLE_BPJS_DATABASE[cleanNum];
  }

  // 2. Jika bukan sample, buat profil BPJS valid otomatis berdasarkan nomor
  const padded = cleanNum.padStart(13, "0");
  const lastDigits = cleanNum.slice(-4) || "1234";
  const numVal = parseInt(lastDigits, 10) || 1234;
  const isFemale = numVal % 2 === 0;

  const sampleNames = isFemale
    ? ["NURUL HIDAYAH", "RATNA SARI", "MEGAWATI PUTRI", "ANDI TENRI OLLE", "KARTINI WULANDARI"]
    : ["MUHAMMAD ILHAM", "ANDI BASO", "FAHRUL RACHMAN", "SYAMSUDDIN", "DIMAS PRASETYO"];

  const name = sampleNames[numVal % sampleNames.length];
  const birthYear = 1970 + (numVal % 35);
  const birthMonth = String(1 + (numVal % 12)).padStart(2, "0");
  const birthDay = String(1 + (numVal % 28)).padStart(2, "0");
  const nik = `7371${String(numVal).padStart(6, "0")}${String(birthYear).slice(2)}${birthMonth}${birthDay}`;

  return {
    nomor_kartu: padded,
    nik: nik.slice(0, 16).padEnd(16, "0"),
    nama: name,
    jenis_kelamin: isFemale ? "P" : "L",
    tanggal_lahir: `${birthYear}-${birthMonth}-${birthDay}`,
    tempat_lahir: "Kota Makassar",
    golongan_darah: (["A", "B", "AB", "O"] as const)[numVal % 4],
    rhesus: "+",
    status_peserta: "AKTIF",
    jenis_peserta: numVal % 3 === 0 ? "PBI (APBN)" : numVal % 2 === 0 ? "PPU (Pekerja Swasta)" : "PBPU (Mandiri)",
    kelas_rawat: (["KELAS 1", "KELAS 2", "KELAS 3"] as const)[numVal % 3],
    faskes_1: "Puskesmas Tamalanrea Makassar",
    kode_faskes_1: "0214P010",
    nomor_rujukan: `180101010226P${String(numVal).padStart(6, "0")}`,
    tanggal_rujukan: new Date().toISOString().split("T")[0],
    diagnosa_rujukan: "Z00.0 - General medical examination",
    alamat_jalan: `Jl. Perintis Kemerdekaan KM. ${(numVal % 15) + 1} No. ${(numVal % 90) + 1}`,
    kelurahan: "Tamalanrea",
    kecamatan: "Tamalanrea",
    kota: "Kota Makassar",
    provinsi: "Sulawesi Selatan",
    nomor_telepon: `0812${String(numVal).padStart(8, "4")}`,
    nama_kontak_darurat: isFemale ? "Suami Pasien" : "Istri Pasien",
    hubungan_darurat: "Suami / Istri",
    telepon_darurat: `0813${String(numVal).padStart(8, "5")}`,
    alergi: [],
  };
}
