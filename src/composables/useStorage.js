/**
 * useStorage.js
 * localStorage CRUD untuk menyimpan skenario
 * Key: "migas_scenarios"
 */

const STORAGE_KEY = 'migas_scenarios'

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}

/**
 * Ambil semua skenario dari localStorage
 */
export function loadScenarios() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

/**
 * Simpan skenario baru atau update yang sudah ada
 */
export function saveScenario(nama, input, hasil) {
  const scenarios = loadScenarios()
  const existing = scenarios.findIndex(s => s.nama === nama)

  const entry = {
    id: existing >= 0 ? scenarios[existing].id : generateId(),
    nama,
    tanggalSimpan: new Date().toISOString(),
    input: { ...input },
    hasil: {
      tabelNCF: hasil.tabelNCF,
      totalNCF: hasil.totalNCF,
      pot: hasil.pot,
      npv: hasil.npv,
      ror: hasil.ror,
      pir: hasil.pir,
      dpr: hasil.dpr,
    },
  }

  if (existing >= 0) {
    scenarios[existing] = entry
  } else {
    scenarios.push(entry)
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(scenarios))
  return entry
}

/**
 * Hapus skenario berdasarkan id
 */
export function deleteScenario(id) {
  const scenarios = loadScenarios().filter(s => s.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(scenarios))
}

/**
 * Ambil 1 skenario berdasarkan id
 */
export function getScenario(id) {
  return loadScenarios().find(s => s.id === id) || null
}

/**
 * Hapus semua skenario
 */
export function clearAllScenarios() {
  localStorage.removeItem(STORAGE_KEY)
}
