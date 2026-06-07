# 🛢️ Migas Cash Flow Calculator

[![Vue 3](https://img.shields.io/badge/Vue-3.x-4fc08d?style=for-the-badge&logo=vue.js&logoColor=white)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646cff?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev/)
[![Chart.js](https://img.shields.io/badge/Chart.js-4.x-ff6384?style=for-the-badge&logo=chart.js&logoColor=white)](https://www.chartjs.org/)
[![Vanilla CSS](https://img.shields.io/badge/Styling-Vanilla%20CSS-1572b6?style=for-the-badge&logo=css3&logoColor=white)](#design-system)

**Migas Cash Flow Calculator** adalah aplikasi web berbasis browser untuk menghitung dan memvisualisasikan keekonomian lapangan minyak dan gas bumi (migas). Aplikasi ini dirancang khusus untuk mahasiswa teknik perminyakan sebagai alat bantu pembelajaran perhitungan *Net Cash Flow* (NCF) dan indikator keekonomian sesuai metodologi yang diajarkan pada mata kuliah **Pengelolaan Lapangan Migas (Field Management)**.

---

## 🌟 Fitur Utama

1. **Hybrid Production Input**
   * Menginput data produksi secara manual untuk tahun-tahun awal (1 s/d N).
   * Memprediksi sisa tahun produksi secara otomatis menggunakan kurva penurunan produksi (*decline curve*): 
     $$Q(t) = Q(t-1) \times (1 - d)$$

2. **5 Pilihan Metode Depresiasi**
   * **Straight Line (Garis Lurus)**: Depresiasi konstan setiap tahun.
   * **Declining Balance**: Depresiasi menurun secara proporsional.
   * **Double Declining Balance**: Metode depresiasi saldo menurun ganda yang lebih agresif.
   * **Unit of Production (Satuan Produksi)**: Depresiasi proporsional terhadap volume produksi tahunan dibandingkan cadangan total.
   * **Sum of the Years' Digits**: Depresiasi dengan bobot menurun dari tahun ke tahun.

3. **Perhitungan Indikator Keekonomian**
   * **POT (Pay Out Time)**: Waktu yang dibutuhkan untuk mengembalikan modal investasi awal (akumulasi NCF menjadi positif).
   * **NPV (Net Present Value)**: Nilai bersih saat ini dengan Discount Rate ($r$) yang dapat diatur via slider secara real-time.
   * **ROR (Rate of Return / IRR)**: Tingkat pengembalian internal saat nilai NPV bernilai nol, dihitung otomatis menggunakan *Bisection Method*.
   * **PIR (Profit to Investment Ratio)**: Rasio keuntungan total undiscounted terhadap total investasi.
   * **DPR (Discounted Profit to Investment Ratio)**: Rasio NPV terhadap total investasi.

4. **Visualisasi Grafik Interaktif**
   * **Bar Chart - NCF per Tahun**: Menampilkan NCF positif (hijau) dan investasi negatif (merah) per tahun.
   * **Line Chart - Cumulative NCF**: Memetakan akumulasi kas untuk mempermudah identifikasi titik impas (POT).
   * **Line Chart - $r$ vs NPV**: Kurva hubungan discount rate dengan NPV untuk memvisualisasikan titik potong ROR.

5. **Manajemen & Perbandingan Skenario**
   * Menyimpan skenario ke penyimpanan lokal browser (`localStorage`).
   * Memuat (*load*) preset bawaan: **Lapangan RISKI** (100% manual) & **Lapangan Gunung Bakaran** (Hybrid).
   * Membandingkan dua skenario secara *side-by-side* dengan highlight pemenang untuk masing-masing indikator.

---

## 🛠️ Tech Stack

Aplikasi ini dibangun tanpa overhead framework CSS eksternal demi performa dan kustomisasi maksimal:

* **Frontend Framework:** Vue 3 (Composition API)
* **Build Tool:** Vite
* **Grafik & Visualisasi:** Chart.js + vue-chartjs
* **Styling & UI:** Vanilla CSS + CSS Custom Properties
* **State Management:** Vue Reactive API + Web Storage API (localStorage)

---

## 🚀 Cara Menjalankan Project

### Prasyarat
Pastikan Anda sudah menginstal [Node.js](https://nodejs.org/) (versi 18 ke atas disarankan) di komputer Anda.

### Langkah-langkah
1. **Clone repositori ini:**
   ```bash
   git clone https://github.com/i7i7s/Migas_kelompokOnic.git
   cd migas
   ```

2. **Instal dependensi project:**
   ```bash
   npm install
   ```

3. **Jalankan local development server:**
   ```bash
   npm run dev
   ```
   Buka alamat URL yang tertera di terminal (biasanya `http://localhost:5173`) di browser Anda.

4. **Build untuk produksi (Staging/Production):**
   ```bash
   npm run build
   ```
   Hasil build static akan berada di folder `dist/` dan siap dideploy di platform seperti GitHub Pages, Netlify, atau Vercel.

---

## 📁 Struktur Folder Project

```text
migas/
├── index.html
├── vite.config.js
├── package.json
├── README.md
├── PRD_MigasCashFlow_Calculator.md
└── src/
    ├── main.js
    ├── App.vue
    ├── components/
    │   ├── InputPanel.vue          # Form input parameter
    │   ├── ProductionTable.vue     # Preview tabel produksi
    │   ├── ResultTable.vue         # Tabel NCF lengkap
    │   ├── IndicatorCards.vue      # POT, NPV, ROR, PIR, DPR
    │   ├── ChartNCF.vue            # Bar chart NCF per tahun
    │   ├── ChartCumulative.vue     # Line chart cumulative NCF
    │   ├── ChartRvsNPV.vue         # Line chart r vs NPV (ROR)
    │   ├── DepreciationTable.vue   # Tabel detail depresiasi
    │   ├── ScenarioList.vue        # Daftar skenario tersimpan
    │   ├── ComparePanel.vue        # Perbandingan 2 skenario
    │   └── AnalysisPanel.vue       # Analisis keekonomian tambahan
    ├── composables/
    │   ├── useCalculator.js        # Logika perhitungan utama
    │   ├── useDepreciation.js      # Implementasi 5 metode depresiasi
    │   ├── useIndicators.js        # Logika POT, NPV, ROR, PIR, DPR
    │   └── useStorage.js           # Integrasi localStorage
    └── data/
        └── dummyScenarios.js       # Skenario preset bawaan (RISKI & Gunung Bakaran)
```

---

## 📐 Formula Referensi Keekonomian

### 1. Produksi & Pendapatan (Income)
* **Produksi setelah tahun manual ke-N**:
  $$Q(t) = Q(t-1) \times \left(1 - \frac{\text{Decline Rate \%}}{100}\right)$$
* **Pendapatan tahunan**:
  $$\text{Income}(t) = Q(t) \times P(t)$$
  *(di mana $P(t)$ adalah harga minyak per bbl yang bisa flat atau mengalami eskalasi kenaikan tahunan).*

### 2. Depresiasi (Capital Only)
Depresiasi dihitung berdasarkan nilai **Capital** saja (Non-Capital langsung dibebankan pada Tahun 0 dan tidak masuk perhitungan depresiasi). Dimulai pada **Tahun 1**.
* **Straight Line**:
  $$D_i = \frac{K}{N}$$
* **Declining Balance**:
  $$D_i = K \times R \times (1-R)^{i-1} \quad \text{di mana } R = \frac{1}{N}$$
* **Double Declining Balance**:
  $$D_i = K \times 2R \times (1-2R)^{i-1} \quad \text{di mana } R = \frac{1}{N}$$
* **Unit of Production**:
  $$D_i = K \times \frac{Q(i)}{\text{Reserve Total}}$$
* **Sum of the Years' Digits**:
  $$D_i = K \times \frac{2(N - (i-1))}{N(N+1)}$$

### 3. Pajak (Tax) & Net Cash Flow (NCF)
* **Taxable Income**:
  $$\text{Taxable Income}(t) = \text{Income}(t) - \text{Opex}(t) - D_i(t)$$
* **Pajak Tahunan**:
  $$\text{Tax}(t) = \max(0, \text{Taxable Income}(t) \times \text{Tax Rate \%})$$
  *(Jika Taxable Income negatif, maka Pajak bernilai 0).*
* **Net Cash Flow (NCF)**:
  * **Tahun 0 (Investasi)**:
    $$\text{NCF}(0) = -(\text{Capital} + \text{Non-Capital})$$
  * **Tahun 1 s/d N (Operasional)**:
    $$\text{NCF}(t) = \text{Income}(t) - \text{Opex}(t) - \text{Tax}(t)$$

### 4. Indikator Keekonomian
* **Pay Out Time (POT)**:
  Mencari tahun $t$ ketika akumulasi NCF pertama kali $\ge 0$:
  $$\text{POT} = (t_c - 1) + \frac{|\text{Cumulative NCF}(t_c - 1)|}{\text{NCF}(t_c)}$$
* **Net Present Value (NPV)**:
  $$\text{NPV}(r) = \sum_{t=0}^{N} \frac{\text{NCF}(t)}{(1+r)^t}$$
* **Rate of Return (ROR / IRR)**:
  Mencari nilai $r$ sehingga $\text{NPV}(r) = 0$ menggunakan pendekatan iterasi numerik bisection.
* **Profit to Investment Ratio (PIR)**:
  $$\text{PIR} = \frac{\sum_{t=1}^{N} \text{NCF}_{\text{undiscounted}}(t)}{\text{Total Investasi}}$$
* **Discounted Profit to Investment Ratio (DPR)**:
  $$\text{DPR} = \frac{\text{NPV}(r)}{\text{Total Investasi}}$$

---

## 🎨 Design System: "Industrial Dark"

Aplikasi ini mengadopsi tema **"Industrial Dark"** yang terinspirasi dari control room perminyakan, monitor teknik, dan instrumen kilang minyak:

* **Warna Latar Utama:** `#0a0e17` (Deep Midnight Blue)
* **Warna Aksen Utama:** `#f59e0b` (Amber Orange - warna api suar & minyak bumi)
* **Warna Aksen Sekunder:** `#06b6d4` (Cyan Tech Monitor)
* **Warna Indikator Positif:** `#10b981` (Emerald Green)
* **Warna Indikator Negatif:** `#ef4444` (Vibrant Red)
* **Tipografi:** 
  * Header/Judul: `'Bebas Neue'` (Strong industrial display font)
  * Data & Angka: `'IBM Plex Mono'` (Sleek technical monospace font)
  * Elemen UI/Form: `'DM Sans'` (Clean sans-serif)

---

## 👥 Tim Pengembang

Aplikasi ini dikembangkan oleh **Kelompok ONIC** untuk tugas proyek mata kuliah **Pengelolaan Lapangan Migas**.
