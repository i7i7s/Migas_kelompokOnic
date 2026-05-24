/**
 * useIndicators.js
 * Indikator ekonomi: POT, NPV, ROR (Bisection), PIR, DPR
 * Sesuai formula di PRD Section 6.8
 */

/**
 * POT — Pay Out Time
 * Cari t_c dimana CumulativeNCF pertama kali >= 0
 * POT = (t_c - 1) + |CumNCF(t_c-1)| / NCF(t_c)
 */
export function computePOT(ncfRows) {
  // ncfRows: array dari computeNCF(), termasuk tahun 0
  for (let i = 1; i < ncfRows.length; i++) {
    const row = ncfRows[i]
    const prev = ncfRows[i - 1]
    if (row.cumulativeNcf >= 0) {
      // Interpolasi
      const pot = (i - 1) + Math.abs(prev.cumulativeNcf) / row.ncf
      return pot
    }
  }
  return null // Tidak mencapai BEP dalam project lifetime
}

/**
 * NPV — Net Present Value
 * NPV(r) = Σ [ NCF(t) / (1+r)^t ]  untuk t = 0..N
 */
export function computeNPV(ncfRows, r) {
  const rate = Number(r) / 100
  return ncfRows.reduce((sum, row) => {
    return sum + row.ncf / Math.pow(1 + rate, row.tahun)
  }, 0)
}

/**
 * ROR — Rate of Return (IRR)
 * Menggunakan Bisection method
 * Batas: r_low = 0, r_high = 2.0 (200%) untuk ROI sangat tinggi
 */
export function computeROR(ncfRows) {
  // Cek apakah NPV bisa negatif (syarat ada ROR)
  const npvAt0 = computeNPV(ncfRows, 0)
  const npvAt200 = computeNPV(ncfRows, 200)

  if (npvAt0 <= 0) return null   // Proyek tidak layak
  if (npvAt200 > 0) return '>200%' // ROR sangat tinggi

  let rLow = 0
  let rHigh = 200
  let rMid = 0
  const MAX_ITER = 200

  for (let i = 0; i < MAX_ITER; i++) {
    rMid = (rLow + rHigh) / 2
    const npvMid = computeNPV(ncfRows, rMid)

    if (Math.abs(npvMid) < 0.0001) break
    if (npvMid > 0) {
      rLow = rMid
    } else {
      rHigh = rMid
    }
    if (Math.abs(rHigh - rLow) < 0.0001) break
  }

  return rMid
}

/**
 * PIR — Profit to Investment Ratio
 * PIR = Σ NCF_undiscounted (t=1..N) / Total_Investasi
 */
export function computePIR(ncfRows, totalInvestasi) {
  if (!totalInvestasi || totalInvestasi <= 0) return null
  const totalNCF = ncfRows
    .filter(r => r.tahun > 0)
    .reduce((sum, r) => sum + r.ncf, 0)
  return totalNCF / totalInvestasi
}

/**
 * DPR — Discounted Profit to Investment Ratio
 * DPR = NPV / Total_Investasi
 */
export function computeDPR(npv, totalInvestasi) {
  if (!totalInvestasi || totalInvestasi <= 0) return null
  return npv / totalInvestasi
}

/**
 * Hitung semua indikator sekaligus
 */
export function computeAllIndicators(ncfRows, discountRate, totalInvestasi) {
  const pot = computePOT(ncfRows)
  const npv = computeNPV(ncfRows, discountRate)
  const ror = computeROR(ncfRows)
  const pir = computePIR(ncfRows, totalInvestasi)
  const dpr = computeDPR(npv, totalInvestasi)

  return { pot, npv, ror, pir, dpr }
}

/**
 * Generate data untuk grafik r vs NPV (ROR visual)
 * r dari 0% sampai 60%, step 2%
 */
export function generateRvsNPVData(ncfRows) {
  const points = []
  for (let r = 0; r <= 60; r += 1) {
    points.push({ r, npv: computeNPV(ncfRows, r) })
  }
  return points
}

/**
 * Format POT menjadi string "X Tahun Y Bulan"
 */
export function formatPOT(pot) {
  if (pot === null || pot === undefined) return 'Tidak Tercapai'
  const tahun = Math.floor(pot)
  const bulan = Math.round((pot - tahun) * 12)
  if (bulan === 0) return `${tahun} Tahun`
  return `${tahun} Tahun ${bulan} Bulan`
}

/**
 * Format angka uang dengan 2 desimal dan koma ribuan
 */
export function formatMoney(val) {
  if (val === null || val === undefined) return '—'
  const formatted = Math.abs(val).toLocaleString('id-ID', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
  return val < 0 ? `-Rp ${formatted}` : `Rp ${formatted}`
}

/**
 * Format persentase
 */
export function formatPct(val, decimals = 2) {
  if (val === null || val === undefined || isNaN(val)) return '—'
  return `${Number(val).toFixed(decimals)}%`
}
