/**
 * useCalculator.js
 * Logika perhitungan utama NCF per tahun
 * Sesuai urutan kalkulasi di PRD Section 4.2
 */

import { computeDepreciation } from './useDepreciation.js'

/**
 * Hitung array produksi per tahun
 * Tahun 1..mulaiDecline-1 → manual
 * Tahun mulaiDecline..N   → Q(t) = Q(t-1) × (1 - d/100)
 */
export function computeProduction(input) {
  const { jangkaWaktu: N, produksiManual, mulaiDecline, declineRate } = input
  const production = []

  for (let t = 1; t <= N; t++) {
    const idx = t - 1
    // Jika mulaiDecline null (semua manual) atau t < mulaiDecline → pakai nilai manual
    if (!mulaiDecline || t < mulaiDecline) {
      production.push(Number(produksiManual[idx]) || 0)
    } else {
      // Decline dari tahun sebelumnya
      const prev = production[idx - 1] || 0
      const d = (Number(declineRate) || 0) / 100
      production.push(prev * (1 - d))
    }
  }
  return production
}

/**
 * Hitung array harga minyak per tahun
 * Bisa flat atau dengan escalation %/tahun
 */
export function computeHarga(input) {
  const { jangkaWaktu: N, hargaMinyak, hargaEscalation } = input
  const harga = []
  let P = Number(hargaMinyak) || 0
  const esc = (Number(hargaEscalation) || 0) / 100

  for (let t = 1; t <= N; t++) {
    if (t === 1) {
      harga.push(P)
    } else {
      P = P * (1 + esc)
      harga.push(P)
    }
  }
  return harga
}

/**
 * Hitung array Opex per tahun
 * Bisa flat atau naik X%/tahun mulai tahun ke-N
 */
export function computeOpex(input) {
  const { jangkaWaktu: N, opex, opexNaikPersen, opexNaikMulaiTahun } = input
  const opexArr = []
  const base = Number(opex) || 0
  const g = (Number(opexNaikPersen) || 0) / 100
  const tStart = Number(opexNaikMulaiTahun) || null

  let currentOpex = base
  for (let t = 1; t <= N; t++) {
    if (tStart && t >= tStart && t > 1 && g > 0) {
      if (t === tStart) {
        currentOpex = base
      } else {
        currentOpex = currentOpex * (1 + g)
      }
    }
    opexArr.push(currentOpex)
  }
  return opexArr
}

/**
 * Fungsi utama: hitung full NCF table
 * Return array objek per tahun (termasuk tahun 0)
 *
 * Format per row:
 * {
 *   tahun, produksi, harga, income,
 *   capital, nonCapital, opex, Di,
 *   taxableIncome, tax, ncf, cumulativeNcf
 * }
 */
export function computeNCF(input) {
  const { jangkaWaktu: N, capital, nonCapital, pajakRate } = input
  const K = Number(capital) || 0
  const NK = Number(nonCapital) || 0
  const taxRate = (Number(pajakRate) || 0) / 100

  const production = computeProduction(input)
  const harga = computeHarga(input)
  const opexArr = computeOpex(input)
  const depreciationRows = computeDepreciation(input, production)

  const rows = []

  // === Tahun 0 — Investasi ===
  const ncf0 = -(K + NK)
  rows.push({
    tahun: 0,
    produksi: null,
    harga: null,
    income: null,
    capital: K,
    nonCapital: NK,
    opex: null,
    Di: null,
    taxableIncome: null,
    tax: null,
    ncf: ncf0,
    cumulativeNcf: ncf0,
  })

  // === Tahun 1..N ===
  let cumulative = ncf0
  for (let t = 1; t <= N; t++) {
    const idx = t - 1
    const Q = production[idx]
    const P = harga[idx]
    const income = Q * P
    const opex = opexArr[idx]
    const Di = depreciationRows[idx]?.Di ?? 0

    const taxableIncome = income - opex - Di
    const tax = Math.max(0, taxableIncome * taxRate) // Tax tidak bisa negatif

    const ncf = income - opex - tax
    cumulative += ncf

    rows.push({
      tahun: t,
      produksi: Q,
      harga: P,
      income,
      capital: null,
      nonCapital: null,
      opex,
      Di,
      taxableIncome,
      tax,
      ncf,
      cumulativeNcf: cumulative,
    })
  }

  return rows
}

/**
 * Validasi input sebelum kalkulasi
 * Return object { valid: boolean, errors: {} }
 */
export function validateInput(input) {
  const errors = {}

  if (!input.jangkaWaktu || input.jangkaWaktu < 1 || input.jangkaWaktu > 25) {
    errors.jangkaWaktu = 'Jangka waktu harus antara 1–25 tahun'
  }
  if (input.capital < 0) {
    errors.capital = 'Capital tidak boleh negatif'
  }
  if (input.nonCapital < 0) {
    errors.nonCapital = 'Non-Capital tidak boleh negatif'
  }
  if (!input.hargaMinyak || input.hargaMinyak <= 0) {
    errors.hargaMinyak = 'Harga minyak harus lebih dari 0'
  }
  if (input.declineRate >= 100) {
    errors.declineRate = 'Decline rate maksimal 99%'
  }
  if (input.pajakRate < 0 || input.pajakRate > 100) {
    errors.pajakRate = 'Pajak harus antara 0–100%'
  }
  if (input.metodeDep === 'unitOfProduction' && (!input.reserveTotal || input.reserveTotal <= 0)) {
    errors.reserveTotal = 'Reserve Total harus diisi untuk metode Unit of Production'
  }

  // Cek apakah ada produksi
  const prod = computeProduction(input)
  const totalProd = prod.reduce((a, b) => a + b, 0)
  if (totalProd <= 0) {
    errors.produksi = 'Data produksi tidak boleh semua nol'
  }

  return { valid: Object.keys(errors).length === 0, errors }
}
