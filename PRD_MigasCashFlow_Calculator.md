# PRD — Migas Cash Flow Calculator
**Product Requirements Document v1.0**
Tanggal: Mei 2026
Status: Draft

---

## 1. OVERVIEW & VISI PRODUK

### 1.1 Ringkasan
**Migas Cash Flow Calculator** adalah aplikasi web berbasis browser untuk menghitung dan memvisualisasikan keekonomian lapangan minyak dan gas bumi (migas). Aplikasi ini dirancang khusus untuk mahasiswa teknik perminyakan sebagai alat bantu belajar perhitungan Net Cash Flow (NCF) dan indikator ekonomi sesuai metodologi yang diajarkan di mata kuliah **Pengelolaan Lapangan Migas (Field Management)**.

### 1.2 Problem Statement
Perhitungan keekonomian lapangan migas melibatkan banyak variabel dan formula yang saling berkaitan (produksi, decline rate, depresiasi, pajak, NCF, NPV, ROR, dsb). Mahasiswa sering kali:
- Salah urutan perhitungan
- Bingung memilih metode depresiasi yang tepat
- Tidak bisa memvisualisasikan hasil agar lebih mudah dipahami
- Harus mengulang perhitungan dari awal saat mengubah satu variabel

### 1.3 Solusi
Aplikasi web interaktif yang:
1. Menerima input parameter lapangan migas
2. Menghitung NCF per tahun secara otomatis menggunakan formula yang benar dari dokumen referensi
3. Menghitung semua indikator ekonomi (POT, NPV, ROR, PIR, DPR)
4. Menampilkan hasil dalam tabel + grafik interaktif
5. Menyimpan skenario di localStorage untuk dibandingkan

### 1.4 Target Pengguna
- **Primer**: Mahasiswa teknik perminyakan yang sedang mengambil mata kuliah Field Management
- **Sekunder**: Dosen/asisten dosen yang ingin mendemonstrasikan perhitungan di kelas

---

## 2. TECH STACK

| Layer | Teknologi | Alasan |
|---|---|---|
| Framework | **Vue 3** (Composition API) | Reaktivitas form-to-table yang smooth, ringan |
| Build Tool | **Vite** | Fast dev server, bundling ringan |
| Grafik | **Chart.js** + vue-chartjs | Fleksibel, dokumentasi lengkap |
| Styling | **CSS Custom Properties** + Vanilla CSS | Tanpa overhead framework CSS |
| State | **Vue Reactive** + **localStorage** | Simpel, cukup untuk skala ini |
| Math | **Pure JavaScript** | Semua formula bisa diimplementasi manual |
| Font | Google Fonts (pilihan distinctive) | |
| Deploy | Static (bisa di GitHub Pages / Netlify) | |

---

## 3. ARSITEKTUR APLIKASI

### 3.1 Struktur File
```
migas-calculator/
├── index.html
├── vite.config.js
├── package.json
├── src/
│   ├── main.js
│   ├── App.vue
│   ├── components/
│   │   ├── InputPanel.vue          # Form input parameter
│   │   ├── ProductionTable.vue     # Preview tabel produksi
│   │   ├── ResultTable.vue         # Tabel NCF lengkap
│   │   ├── IndicatorCards.vue      # POT, NPV, ROR, PIR, DPR
│   │   ├── ChartNCF.vue            # Bar chart NCF per tahun
│   │   ├── ChartCumulative.vue     # Line chart cumulative NCF
│   │   ├── ChartRvsNPV.vue         # Line chart r vs NPV (ROR)
│   │   ├── DepreciationTable.vue   # Tabel detail depresiasi
│   │   ├── ScenarioList.vue        # Daftar skenario tersimpan
│   │   └── ComparePanel.vue        # Perbandingan 2 skenario
│   ├── composables/
│   │   ├── useCalculator.js        # Logika perhitungan utama
│   │   ├── useDepreciation.js      # 5 metode depresiasi
│   │   ├── useIndicators.js        # POT, NPV, ROR, PIR, DPR
│   │   └── useStorage.js           # localStorage CRUD
│   ├── data/
│   │   └── dummyScenarios.js       # 2 data preset dari dokumen
│   └── styles/
│       ├── main.css
│       └── variables.css
```

### 3.2 Layout Aplikasi (3 Tab)
```
┌────────────────────────────────────────────────────────┐
│  🛢️  MIGAS CASH FLOW CALCULATOR                       │
│  ─────────────────────────────────────────────────     │
│  [ 📋 Input ]  [ 📊 Hasil ]  [ 📁 Skenario ]          │
├────────────────────────────────────────────────────────┤
│                                                        │
│                  [KONTEN TAB AKTIF]                    │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

## 4. FITUR DETAIL

---

### 4.1 TAB 1 — INPUT PARAMETER

Sesuai gambar referensi, ada **8 parameter utama** yang harus diisi:

#### 4.1.1 Jangka Waktu Project
- Input: number field, range 1–25 tahun
- Default: 10 tahun
- Catatan: sesuai regulasi Indonesia max 25 tahun

#### 4.1.2 Nominal Investasi
Dibagi dua kolom:
- **Capital ($M)**: modal tetap (drilling, platform, fasilitas) — ini yang didepresiasi
- **Non-Capital ($M)**: modal tidak tetap (yang tidak didepresiasi)
- Total investasi ditampilkan otomatis: `Total = Capital + Non-Capital`
- Investasi dicatat di **Tahun 0** (negatif dalam NCF)

#### 4.1.3 Data Produksi
Sistem **hybrid input**:
- User mengisi produksi manual untuk beberapa tahun pertama (1 s/d N, default N=4)
- Slider/input untuk memilih "Mulai tahun decline ke-N"
- Setelah tahun N: produksi dihitung otomatis dengan formula:
  ```
  Q(t) = Q(t-1) × (1 - decline_rate)
  ```
- Preview tabel produksi seluruh tahun muncul real-time di bawah form

**Contoh tampilan input produksi:**
```
Tahun 1: [175] Mbbl    ← manual
Tahun 2: [201] Mbbl    ← manual
Tahun 3: [217] Mbbl    ← manual
Tahun 4: [198] Mbbl    ← manual (tahun terakhir manual)
─────────────────────────────────
Decline rate: [3] %/tahun
(Tahun 5 dan seterusnya dihitung otomatis)
```

#### 4.1.4 Decline Rate
- Input: persentase (%), contoh: 3%
- Berlaku mulai tahun setelah tahun manual terakhir
- Formula: `Q(t) = Q(t-1) × (1 - d/100)`

#### 4.1.5 Harga Minyak
- Input: `$/bbl`
- Default: $32/bbl (sesuai contoh kasus)
- Opsi: **harga tetap** atau **naik X%/tahun** (escalation)
  - Jika escalation aktif: `Harga(t) = Harga(t-1) × (1 + escalation_rate)`

#### 4.1.6 Opex (Operating Cost)
- Input: `$M/tahun`
- Default: flat per tahun
- Opsi: **naik X%/tahun mulai tahun ke-N**
  - Input: persentase kenaikan + mulai tahun ke berapa
  - Formula: `Opex(t) = Opex(t-1) × (1 + kenaikan/100)` untuk t ≥ tahun_mulai_naik

#### 4.1.7 Metode Depresiasi
Dropdown pilih 1 dari 5 metode:

**a) Straight Line (Garis Lurus)**
```
Di = K / N
```
- K = Capital, N = jangka waktu project
- Di sama setiap tahun
- Nilai akhir capital = 0

**b) Declining Balance**
```
R = 1/N
Di = K × R × (1-R)^(i-1)
```
- Di menurun setiap tahun
- Ada salvage value di akhir (tidak nol)

**c) Double Declining Balance**
```
Di = K × 2R × (1-2R)^(i-1)
```
- Lebih agresif dari declining balance

**d) Unit of Production**
```
R(i) = Produksi(i) / Reserve_Total
Di = K × R(i)
```
- Perlu input Reserve Total (Mbbl)
- Di proporsional dengan produksi

**e) Sum of the Year**
```
Di = K × 2(N-(i-1)) / N(N+1)
```
- Besar di awal, mengecil di akhir

> **Catatan penting**: Depresiasi hanya dari **Capital**, bukan total investasi.
> Depresiasi dimulai **Tahun 1** (saat mulai produksi).

**Fitur tambahan**: Setelah memilih metode, muncul **tabel preview depresiasi** per tahun agar user bisa membandingkan.

#### 4.1.8 Pajak
- Input: persentase (%), contoh: 51%
- Berlaku dari **Taxable Income**:
  ```
  Taxable Income = Income - Opex - Di
  Tax = Tax_Rate × Taxable Income
  ```
- Jika Taxable Income negatif → Tax = 0 (tidak ada refund pajak)

#### 4.1.9 Tombol Aksi
- **🔢 Hitung Sekarang** → kalkulasi & pindah ke Tab Hasil
- **💾 Simpan Skenario** → simpan ke localStorage dengan nama
- **🔄 Reset** → kosongkan semua input
- **📂 Load Preset** → pilih data dummy bawaan

---

### 4.2 LOGIKA PERHITUNGAN UTAMA (`useCalculator.js`)

Urutan kalkulasi per tahun (sesuai dokumen):

```javascript
// Tahun 0
NCF[0] = -(Capital + NonCapital)

// Tahun 1 s/d N
for (t = 1 to N):
  Produksi[t]       = // dari input atau decline formula
  Income[t]         = Produksi[t] × HargaMinyak[t]
  Opex[t]           = // dari input atau kenaikan formula
  Di[t]             = // sesuai metode yang dipilih
  
  TaxableIncome[t]  = Income[t] - Opex[t] - Di[t]
  Tax[t]            = max(0, TaxableIncome[t] × TaxRate)
  
  NCF[t]            = Income[t] - Opex[t] - Tax[t]
  
  CumulativeNCF[t]  = CumulativeNCF[t-1] + NCF[t]
```

> **Catatan**: Capital dan Non-Capital tidak masuk sebagai pengurang NCF tahunan
> (sudah dicatat di tahun 0). Yang masuk ke formula pajak hanya Di (depresiasi dari Capital).

---

### 4.3 TAB 2 — HASIL PERHITUNGAN

#### 4.3.1 Tabel NCF Lengkap
Format sesuai dokumen referensi:

| Tahun | Produksi (Mbbl) | Income ($M) | Capital ($M) | Non-Capital ($M) | Opex ($M) | Di ($M) | Taxable Income ($M) | Tax ($M) | NCF Undiscounted ($M) |
|---|---|---|---|---|---|---|---|---|---|
| 0 | — | — | 13.000 | 8.000 | — | — | — | — | -21.000 |
| 1 | 175 | 5.600 | — | — | 180 | xxx | xxx | xxx | xxx |
| ... | | | | | | | | | |
| 10 | xxx | xxx | — | — | xxx | xxx | xxx | xxx | xxx |
| **Total** | | | | | | | | | **Σ NCF** |

Fitur tabel:
- Row highlight alternating
- Angka negatif berwarna merah, positif hijau
- Tombol copy tabel ke clipboard

#### 4.3.2 Tabel Depresiasi Detail
Tabel tersendiri yang menampilkan detail depresiasi per tahun sesuai metode yang dipilih:

| Tahun | Nilai Awal Capital | Rate (R) | Depresiasi (Di) | Nilai Akhir Capital |
|---|---|---|---|---|

#### 4.3.3 Kartu Indikator Ekonomi

**a) Pay Out Time (POT)**
```
Cari tahun t dimana Cumulative NCF (termasuk investasi) pertama kali positif.

POT = t_prev + |CumNCF(t_prev)| / NCF(t)

Contoh: POT = 2 + 2881.8/7293.8 = 2.6 tahun ≈ 2 tahun 7 bulan
```
Ditampilkan: angka tahun + bulan + visual progress bar di timeline

**b) Net Present Value (NPV)**
```
NPV = NCF(0) + NCF(1)/(1+r)^1 + NCF(2)/(1+r)^2 + ... + NCF(n)/(1+r)^n
```
- Input discount rate `r` bisa diubah user (slider 0–50%, default 10%)
- NPV langsung update real-time saat slider digeser
- Interpretasi otomatis: NPV > 0 = ✅ Layak, NPV < 0 = ❌ Tidak Layak

**c) Rate of Return (ROR / IRR)**
```
Cari nilai r saat NPV = 0
Menggunakan metode Bisection (iterasi otomatis):
  - Mulai dengan r_low = 0%, r_high = 100%
  - Iterasi hingga |NPV| < 0.001
  - Max 100 iterasi
```
Ditampilkan: persentase ROR + tabel iterasi (opsional toggle)

**d) Profit to Investment Ratio (PIR)**
```
PIR = Σ NCF_undiscounted / Total_Investasi
```

**e) Discounted Profit to Investment Ratio (DPR)**
```
DPR = NPV / Total_Investasi
```

#### 4.3.4 Grafik

**Grafik 1: Bar Chart — NCF per Tahun**
- X-axis: Tahun (0 s/d N)
- Y-axis: NCF ($M)
- Bar merah untuk nilai negatif (investasi & tahun rugi)
- Bar hijau untuk nilai positif
- Hover tooltip: detail nilai

**Grafik 2: Line Chart — Cumulative NCF (POT Visual)**
- X-axis: Tahun
- Y-axis: Cumulative NCF ($M)
- Garis melewati sumbu X = titik POT (diberi marker & label)
- Area bawah garis berwarna berbeda (zona negatif vs positif)

**Grafik 3: Line Chart — r vs NPV (ROR Visual)**
- X-axis: Discount Rate r (%)
- Y-axis: NPV ($M)
- Kurva dari r = 0% s/d r = 60%
- Titik perpotongan dengan garis NPV=0 = ROR (diberi marker)
- Interaktif: hover untuk lihat nilai NPV di setiap r

---

### 4.4 TAB 3 — SKENARIO TERSIMPAN

#### 4.4.1 List Skenario
- Setiap skenario tersimpan ditampilkan sebagai card dengan info:
  - Nama lapangan
  - Tanggal disimpan
  - Total investasi
  - NCF total
  - NPV (di r default)
  - POT
- Tombol: **Load** | **Hapus** | **Bandingkan**

#### 4.4.2 Mode Bandingkan (Comparison)
Pilih 2 skenario → tampil side-by-side:
- Tabel indikator ekonomi bersebelahan
- Grafik cumulative NCF kedua skenario dalam 1 chart (2 garis berbeda warna)
- Highlight pemenang di setiap indikator (warna hijau)

#### 4.4.3 Data Dummy Bawaan (Preset)
Dua data preset langsung tersedia dari dokumen:

**Preset 1 — Lapangan RISKI** (dari Soal 1 dokumen):
```javascript
{
  nama: "Lapangan RISKI",
  jangkaWaktu: 10,
  capital: 6500,      // $M
  nonCapital: 3000,   // $M
  produksiManual: [215, 425, 740, 825, 710, 525, 350, 150, 130, 110], // Mbbl, semua manual
  declineRate: 0,
  hargaMinyak: 20,    // $/bbl
  opex: 175,          // $M/tahun, flat
  metodeDep: "straightLine",
  pajakRate: 52       // %
}
// Expected output: Total NCF = $31.989,48M (validasi dari dokumen)
```

**Preset 2 — Lapangan Gunung Bakaran** (dari Contoh Kasus):
```javascript
{
  nama: "Lapangan Gunung Bakaran",
  jangkaWaktu: 10,
  capital: 13000,     // $M
  nonCapital: 8000,   // $M
  produksiManual: [175, 201, 217, 198], // Mbbl, 4 tahun pertama
  mulaiDecline: 5,    // mulai tahun ke-5
  declineRate: 3,     // %/tahun
  hargaMinyak: 32,    // $/bbl
  opex: 180,          // $M/tahun
  opexNaikPersen: 2.5, // % per tahun
  opexNaikMulaiTahun: 4,
  metodeDep: "straightLine",
  pajakRate: 51       // %
}
```

---

## 5. DESIGN SYSTEM

### 5.1 Tema Visual
**"Industrial Dark"** — terinspirasi dari dunia perminyakan, control room, dan instrumen teknik.

Palette:
```css
--bg-primary:     #0a0e17;   /* Hitam biru sangat gelap */
--bg-secondary:   #111827;   /* Panel dark */
--bg-card:        #1a2235;   /* Card background */
--accent-primary: #f59e0b;   /* Amber/oranye — warna api & minyak */
--accent-secondary: #06b6d4; /* Cyan — warna monitor teknik */
--text-primary:   #f1f5f9;   /* Putih susu */
--text-secondary: #94a3b8;   /* Abu-abu slate */
--positive:       #10b981;   /* Hijau emerald — NCF positif */
--negative:       #ef4444;   /* Merah — NCF negatif */
--border:         #1e3a5f;   /* Border subtle biru gelap */
--grid-line:      #1e293b;   /* Garis grid tabel */
```

Typography:
```css
--font-display: 'Bebas Neue', sans-serif;   /* Heading besar, industrial feel */
--font-body:    'IBM Plex Mono', monospace;  /* Monospace → nuansa data teknik */
--font-ui:      'DM Sans', sans-serif;       /* UI elemen, form label */
```

### 5.2 Komponen Visual Khas
- Tabel dengan glow subtle di row hover
- Angka keuangan dengan font monospace agar aligned rapi
- Kartu indikator dengan border glow warna sesuai status (hijau/merah)
- Loading state saat kalkulasi (animasi spinner berbentuk gear/oil drum)
- Grafik dengan grid gelap dan line neon

---

## 6. FORMULA REFERENSI LENGKAP

### 6.1 Produksi
```
Q(t) = Q(t-1) × (1 - d)       untuk t > tahun_manual_terakhir
d = decline_rate / 100
```

### 6.2 Income
```
Income(t) = Q(t) × P(t)
P(t) = harga minyak tahun t (bisa flat atau dengan escalation)
```

### 6.3 Opex dengan Kenaikan
```
Opex(t) = Opex_base × (1 + g)^(t - t_start)     untuk t >= t_start
g = persentase kenaikan / 100
```

### 6.4 Depresiasi — 5 Metode
```
// a. Straight Line
Di = K / N

// b. Declining Balance
R = 1/N
Di = K × R × (1-R)^(i-1)

// c. Double Declining Balance
R = 1/N
Di = K × 2R × (1-2R)^(i-1)

// d. Unit of Production
Di = (Q(i) / Reserve_Total) × K

// e. Sum of the Year
Di = K × 2(N - (i-1)) / (N × (N+1))
```

### 6.5 Perhitungan Pajak
```
TaxableIncome(t) = Income(t) - Opex(t) - Di(t)
Tax(t) = max(0, TaxableIncome(t) × tax_rate)
```

### 6.6 Net Cash Flow
```
NCF(0) = -(Capital + NonCapital)       // Tahun 0 investasi
NCF(t) = Income(t) - Opex(t) - Tax(t) // Tahun 1 s/d N
```

### 6.7 Cumulative NCF
```
CumNCF(t) = Σ NCF(0..t)
```

### 6.8 Indikator Ekonomi
```
// POT — Pay Out Time
Cari t_c : CumNCF(t_c) >= 0 pertama kali
POT = (t_c - 1) + |CumNCF(t_c - 1)| / NCF(t_c)

// NPV — Net Present Value
NPV(r) = Σ [NCF(t) / (1+r)^t]  untuk t = 0..N

// ROR — Rate of Return (Bisection Method)
Cari r : NPV(r) = 0
  r_low = 0, r_high = 1
  while |r_high - r_low| > 0.0001:
    r_mid = (r_low + r_high) / 2
    if NPV(r_mid) > 0: r_low = r_mid
    else: r_high = r_mid
  ROR = r_mid × 100 %

// PIR — Profit to Investment Ratio
PIR = Σ NCF_undiscounted (t=1..N) / (Capital + NonCapital)

// DPR — Discounted Profit to Investment Ratio
DPR = NPV / (Capital + NonCapital)
```

---

## 7. VALIDASI & ERROR HANDLING

| Kondisi | Handling |
|---|---|
| Produksi = 0 di semua tahun | Error: "Data produksi tidak boleh kosong" |
| Capital = 0 | Warning: "Depresiasi tidak bisa dihitung" |
| Taxable Income negatif | Tax = 0 (otomatis, bukan error) |
| NPV selalu positif/negatif (ROR tidak ada) | Tampilkan "ROR tidak terdefinisi (NCF selalu positif/negatif)" |
| Semua field kosong saat klik Hitung | Highlight field yang kosong (merah) |
| Reserve Total = 0 untuk Unit of Production | Error: "Reserve Total harus diisi untuk metode ini" |
| Decline rate >= 100% | Error: "Decline rate maksimal 99%" |

---

## 8. DATA FLOW

```
User Input
    │
    ▼
InputPanel.vue
    │
    ├── validates input
    │
    ▼
useCalculator.js
    │
    ├── computeProduction()     → array produksi per tahun
    ├── computeIncome()         → array income per tahun
    ├── computeOpex()           → array opex per tahun
    ├── computeDepreciation()   → array Di per tahun (via useDepreciation.js)
    ├── computeTax()            → array tax per tahun
    ├── computeNCF()            → array NCF per tahun
    └── computeCumulativeNCF()  → array cumulative NCF
          │
          ▼
    useIndicators.js
          │
          ├── computePOT()
          ├── computeNPV(r)
          ├── computeROR()      → bisection method
          ├── computePIR()
          └── computeDPR()
                │
                ▼
    ResultTable.vue + IndicatorCards.vue + Charts
                │
                ▼
    useStorage.js → localStorage (jika user simpan)
```

---

## 9. LOCALSTORAGE SCHEMA

```javascript
// Key: "migas_scenarios"
// Value: JSON array
[
  {
    id: "uuid-1234",
    nama: "Lapangan RISKI",
    tanggalSimpan: "2026-05-25T10:30:00Z",
    input: {
      jangkaWaktu: 10,
      capital: 6500,
      nonCapital: 3000,
      produksiManual: [215, 425, 740, 825, 710, 525, 350, 150, 130, 110],
      mulaiDecline: null,
      declineRate: 0,
      hargaMinyak: 20,
      hargaEscalation: 0,
      opex: 175,
      opexNaikPersen: 0,
      opexNaikMulaiTahun: null,
      metodeDep: "straightLine",
      reserveTotal: null,
      pajakRate: 52
    },
    hasil: {
      tabelNCF: [...],       // array per tahun
      totalNCF: 31989.48,
      pot: 2.6,
      npv: { rate: 0.10, value: 13129.68 },
      ror: 46.926,
      pir: 3.367,
      dpr: 1.382
    }
  }
]
```

---

## 10. USER JOURNEY

```
1. User buka website
   → Landing: tampil 2 preset data dummy sebagai showcase

2. User klik "Coba Lapangan RISKI"
   → Tab Input terisi otomatis dengan data preset
   → User bisa lihat form dan memahami struktur input

3. User klik "Hitung Sekarang"
   → Animasi loading (< 1 detik, perhitungan cepat)
   → Tab Hasil terbuka otomatis

4. User eksplorasi Tab Hasil
   → Lihat tabel NCF
   → Lihat kartu indikator (POT, NPV, ROR, PIR, DPR)
   → Geser slider discount rate → NPV & DPR update real-time
   → Lihat 3 grafik

5. User kembali ke Tab Input
   → Ubah beberapa parameter (misal harga minyak naik jadi $40)
   → Hitung ulang → lihat perubahan di hasil

6. User simpan skenario
   → Beri nama "Lapangan RISKI - Harga Optimis"
   → Tersimpan di Tab Skenario

7. User buat skenario baru dari nol
   → Input semua parameter manual
   → Simpan dengan nama berbeda

8. User bandingkan 2 skenario
   → Tab Skenario → pilih 2 → klik Bandingkan
   → Muncul panel perbandingan side-by-side
```

---

## 11. MILESTONES DEVELOPMENT

| Fase | Scope | Estimasi |
|---|---|---|
| **Fase 1** | Setup Vue + Vite, Input form lengkap, Logika kalkulasi NCF (useCalculator + useDepreciation), Tabel hasil | Sprint 1 |
| **Fase 2** | Indikator ekonomi (useIndicators), 3 grafik Chart.js, Kartu indikator dengan interpretasi | Sprint 2 |
| **Fase 3** | localStorage (simpan/load/hapus), Data preset dummy, Tab Skenario | Sprint 3 |
| **Fase 4** | Mode perbandingan, Polish UI, Error handling, Responsive mobile | Sprint 4 |

---

## 12. SCOPE & OUT OF SCOPE

### ✅ In Scope (Versi 1)
- Semua 8 parameter input dari dokumen referensi
- 5 metode depresiasi lengkap sesuai formula dokumen
- Tabel NCF format sesuai contoh kasus
- 5 indikator ekonomi (POT, NPV, ROR, PIR, DPR)
- 3 grafik interaktif
- localStorage untuk simpan/load skenario
- 2 data preset dari dokumen
- Mode perbandingan 2 skenario

### ❌ Out of Scope (Bisa Ditambah di v2)
- Pola PSC (Production Sharing Contract) — terlalu kompleks untuk v1
- FTP, Cost Recovery, DMO
- Export ke PDF/Excel
- Analisis sensitivitas (tornado chart)
- Analisis risiko & Monte Carlo simulation
- Multi-user / cloud storage
- Login/akun user

---

## 13. CATATAN PENTING UNTUK DEVELOPER

1. **Validasi Formula**: Gunakan data Lapangan RISKI sebagai unit test. Total NCF harus = $31.989,48M dan NPV (r=10%) = $13.129,68M sesuai dokumen.

2. **Depresiasi hanya dari Capital**: Non-Capital tidak didepresiasi. Ini sering jadi kesalahan implementasi.

3. **Tax tidak bisa negatif**: Jika TaxableIncome < 0, maka Tax = 0. Tidak ada loss carry forward di versi ini (disederhanakan).

4. **NCF Tahun 0**: Selalu = -(Capital + NonCapital), tidak ada Income/Opex/Tax.

5. **ROR Bisection**: Set batas pencarian r antara 0 dan 200% (bukan 100%) untuk mengantisipasi project dengan ROI sangat tinggi.

6. **Presisi angka**: Gunakan `.toFixed(2)` untuk display, tapi simpan full precision untuk kalkulasi berantai (hindari floating point error).

7. **Reactivity Vue**: Gunakan `computed()` untuk semua derivasi data agar tabel & grafik auto-update saat input berubah.

---

*PRD ini dibuat berdasarkan dokumen referensi: "Pengelolaan Lapangan Migas (Field Management)" dan "Contoh Kasus FM" yang diberikan.*
