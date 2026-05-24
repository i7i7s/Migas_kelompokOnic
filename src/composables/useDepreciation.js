/**
 * useDepreciation.js
 * 5 metode depresiasi sesuai dokumen referensi PRD
 * Semua depresiasi dihitung dari Capital (K), bukan total investasi
 */

/**
 * a) Straight Line (Garis Lurus)
 * Di = K / N  →  sama setiap tahun, nilai akhir = 0
 */
export function straightLine(K, N) {
  const Di = K / N
  const rows = []
  let nilaiAwal = K
  for (let i = 1; i <= N; i++) {
    const nilaiAkhir = nilaiAwal - Di
    rows.push({ tahun: i, nilaiAwal, rate: 1 / N, Di, nilaiAkhir: Math.max(0, nilaiAkhir) })
    nilaiAwal = Math.max(0, nilaiAkhir)
  }
  return rows
}

/**
 * b) Declining Balance
 * R = 1/N
 * Di = K × R × (1-R)^(i-1)
 */
export function decliningBalance(K, N) {
  const R = 1 / N
  const rows = []
  let nilaiAwal = K
  for (let i = 1; i <= N; i++) {
    const Di = K * R * Math.pow(1 - R, i - 1)
    const nilaiAkhir = nilaiAwal - Di
    rows.push({ tahun: i, nilaiAwal, rate: R, Di, nilaiAkhir: Math.max(0, nilaiAkhir) })
    nilaiAwal = Math.max(0, nilaiAkhir)
  }
  return rows
}

/**
 * c) Double Declining Balance
 * Di = K × 2R × (1-2R)^(i-1)
 */
export function doubleDecliningBalance(K, N) {
  const R = 1 / N
  const rows = []
  let nilaiAwal = K
  for (let i = 1; i <= N; i++) {
    const Di = K * 2 * R * Math.pow(1 - 2 * R, i - 1)
    const diActual = Math.min(Di, nilaiAwal) // tidak boleh lebih dari nilai awal
    const nilaiAkhir = nilaiAwal - diActual
    rows.push({ tahun: i, nilaiAwal, rate: 2 * R, Di: diActual, nilaiAkhir: Math.max(0, nilaiAkhir) })
    nilaiAwal = Math.max(0, nilaiAkhir)
  }
  return rows
}

/**
 * d) Unit of Production
 * R(i) = Produksi(i) / Reserve_Total
 * Di = K × R(i)
 */
export function unitOfProduction(K, produksiArray, reserveTotal) {
  const rows = []
  let nilaiAwal = K
  for (let i = 0; i < produksiArray.length; i++) {
    const Ri = produksiArray[i] / reserveTotal
    const Di = K * Ri
    const diActual = Math.min(Di, nilaiAwal)
    const nilaiAkhir = nilaiAwal - diActual
    rows.push({ tahun: i + 1, nilaiAwal, rate: Ri, Di: diActual, nilaiAkhir: Math.max(0, nilaiAkhir) })
    nilaiAwal = Math.max(0, nilaiAkhir)
  }
  return rows
}

/**
 * e) Sum of the Year (Sum of Years Digits)
 * Di = K × 2(N-(i-1)) / N(N+1)
 */
export function sumOfTheYear(K, N) {
  const rows = []
  let nilaiAwal = K
  for (let i = 1; i <= N; i++) {
    const Di = K * (2 * (N - (i - 1))) / (N * (N + 1))
    const nilaiAkhir = nilaiAwal - Di
    rows.push({ tahun: i, nilaiAwal, rate: (2 * (N - (i - 1))) / (N * (N + 1)), Di, nilaiAkhir: Math.max(0, nilaiAkhir) })
    nilaiAwal = Math.max(0, nilaiAkhir)
  }
  return rows
}

/**
 * Fungsi utama dispatcher berdasarkan method yang dipilih
 */
export function computeDepreciation(input, produksiArray) {
  const { capital: K, jangkaWaktu: N, metodeDep, reserveTotal } = input

  if (K <= 0) return Array.from({ length: N }, (_, i) => ({
    tahun: i + 1, nilaiAwal: 0, rate: 0, Di: 0, nilaiAkhir: 0
  }))

  switch (metodeDep) {
    case 'straightLine':
      return straightLine(K, N)
    case 'decliningBalance':
      return decliningBalance(K, N)
    case 'doubleDecliningBalance':
      return doubleDecliningBalance(K, N)
    case 'unitOfProduction':
      if (!reserveTotal || reserveTotal <= 0) return []
      return unitOfProduction(K, produksiArray, reserveTotal)
    case 'sumOfTheYear':
      return sumOfTheYear(K, N)
    default:
      return straightLine(K, N)
  }
}

export const DEPRECIATION_LABELS = {
  straightLine:         'Sama Rata Tiap Tahun (Straight Line)',
  decliningBalance:     'Menurun Cepat (Declining Balance)',
  doubleDecliningBalance: 'Gasspol Hemat Pajak di Awal (Double Declining)',
  unitOfProduction:     'Mengikuti Hasil Sedotan Minyak (Unit of Production)',
  sumOfTheYear:         'Menurun Halus (Sum of the Year)',
}

