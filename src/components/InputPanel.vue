<template>
  <div class="input-panel fade-in">

    <!-- TOP ACTION BAR -->
    <div class="action-bar">
      <div class="action-left">
        <span class="case-label">KASUS :</span>
        <button
          v-for="p in presets"
          :key="p.key"
          :id="`btn-preset-${p.key}`"
          class="btn btn-sm btn-case"
          :class="`btn-case-${p.type}`"
          @click="loadPreset(p)"
        >
          {{ p.label }}
        </button>
        <button id="btn-reset" class="btn btn-ghost btn-sm" @click="resetForm">
          [ RESET ]
        </button>
      </div>
      <div class="action-right">
        <button id="btn-simpan" class="btn btn-secondary" @click="openSaveDialog">
          SIMPAN SIMULASI
        </button>
        <button id="btn-hitung" class="btn btn-primary btn-lg" @click="handleCalculate">
          SIMULASIKAN &amp; LIHAT HASIL
        </button>
      </div>
    </div>

    <!-- MAIN FORM GRID -->
    <div class="form-grid">

      <!-- ====== LEFT COLUMN ====== -->
      <div class="form-col">

        <!-- 1. Jangka Waktu -->
        <div class="card">
          <div class="card-title">DURASI PROYEK (LIFETIME)</div>
          <div class="form-group">
            <label class="form-label">
              Jangka Waktu Proyek
              <div class="tooltip-container">
                <span class="help-icon">?</span>
                <span class="tooltip-box">Masa aktif operasi lapangan minyak. Di Indonesia, masa kontrak biasanya berkisar 10–25 tahun.</span>
              </div>
            </label>
            <div class="input-unit-wrap">
              <input
                id="input-jangka-waktu"
                v-model.number="form.jangkaWaktu"
                type="number" min="1" max="25"
                class="form-input" :class="{ error: errors.jangkaWaktu }"
                placeholder="10"
              />
              <span class="input-unit">tahun</span>
            </div>
            <span v-if="errors.jangkaWaktu" class="form-error">{{ errors.jangkaWaktu }}</span>
          </div>
        </div>

        <!-- 2. Nominal Investasi -->
        <div class="card">
          <div class="card-title">MODAL AWAL (INVESTASI)</div>
          <div class="investasi-grid">
            <div class="form-group">
              <label class="form-label">
                Capital (Belanja Modal)
                <div class="tooltip-container">
                  <span class="help-icon">?</span>
                  <span class="tooltip-box">Biaya untuk aset fisik tetap seperti tangki, pipa, alat pengeboran. Nilainya menyusut tiap tahun (dapat didepresiasi).</span>
                </div>
              </label>
              <div class="input-unit-wrap">
                <span class="input-prefix">Rp</span>
                <input
                  id="input-capital"
                  v-model.number="form.capital"
                  type="number" min="0"
                  class="form-input" :class="{ error: errors.capital }"
                  placeholder="195000000"
                />
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">
                Non-Capital
                <div class="tooltip-container">
                  <span class="help-icon">?</span>
                  <span class="tooltip-box">Biaya habis pakai yang tidak memiliki wujud fisik tetap, misalnya biaya survei geologi atau sewa alat. Tidak didepresiasi.</span>
                </div>
              </label>
              <div class="input-unit-wrap">
                <span class="input-prefix">Rp</span>
                <input
                  id="input-non-capital"
                  v-model.number="form.nonCapital"
                  type="number" min="0"
                  class="form-input"
                  placeholder="120000000"
                />
              </div>
            </div>
          </div>
          <div class="total-investasi">
            <span>Total Investasi Awal (Tahun 0):</span>
            <span class="total-value">{{ formatMoney(totalInvestasi) }}</span>
          </div>
        </div>

        <!-- 3. Harga Minyak -->
        <div class="card">
          <div class="card-title">HARGA JUAL MINYAK BUMI</div>
          <div class="form-group">
            <label class="form-label">
              Harga Dasar per Barel
              <div class="tooltip-container">
                <span class="help-icon">?</span>
                <span class="tooltip-box">Estimasi harga jual minyak bumi per barel. Hitungan akan mengalikan juta barel (Mbbl) dengan harga per barel (Rp/bbl).</span>
              </div>
            </label>
            <div class="input-unit-wrap">
              <span class="input-prefix">Rp</span>
              <input
                id="input-harga-minyak"
                v-model.number="form.hargaMinyak"
                type="number" min="0"
                class="form-input" :class="{ error: errors.hargaMinyak }"
                placeholder="480000"
              />
              <span class="input-unit">/bbl</span>
            </div>
          </div>
          <!-- Escalation Toggle -->
          <div class="toggle-row">
            <label class="toggle-wrapper" @click="toggleEscalation">
              <div class="toggle" :class="{ active: useEscalation }"></div>
              <span class="toggle-label">Gunakan Kenaikan Harga (Escalation) per tahun</span>
            </label>
            <div v-if="useEscalation" class="form-group mt-small">
              <div class="input-unit-wrap">
                <input
                  id="input-harga-escalation"
                  v-model.number="form.hargaEscalation"
                  type="number" min="0" max="50"
                  class="form-input"
                  placeholder="3"
                />
                <span class="input-unit">%/tahun</span>
              </div>
              <span class="form-hint">Harga minyak akan naik otomatis sekian persen setiap tahun mengikuti inflasi pasar global.</span>
            </div>
          </div>
        </div>

        <!-- 4. Opex -->
        <div class="card">
          <div class="card-title">BIAYA OPERASIONAL (OPEX)</div>
          <div class="form-group">
            <label class="form-label">
              Opex Dasar Tahunan
              <div class="tooltip-container">
                <span class="help-icon">?</span>
                <span class="tooltip-box">Operating Expenditure: Biaya rutin tahunan untuk menyedot, merawat sumur, dan menggaji tim di lapangan.</span>
              </div>
            </label>
            <div class="input-unit-wrap">
              <span class="input-prefix">Rp</span>
              <input
                id="input-opex"
                v-model.number="form.opex"
                type="number" min="0"
                class="form-input"
                placeholder="2700000"
              />
              <span class="input-unit">/tahun</span>
            </div>
          </div>
          <!-- Opex Naik Toggle -->
          <div class="toggle-row">
            <label class="toggle-wrapper" @click="toggleOpexNaik">
              <div class="toggle" :class="{ active: useOpexNaik }"></div>
              <span class="toggle-label">Gunakan Asumsi Kenaikan Opex</span>
            </label>
            <div v-if="useOpexNaik" class="opex-naik-grid">
              <div class="form-group">
                <label class="form-label">Tingkat Kenaikan</label>
                <div class="input-unit-wrap">
                  <input
                    id="input-opex-naik-persen"
                    v-model.number="form.opexNaikPersen"
                    type="number" min="0" max="50"
                    class="form-input"
                    placeholder="2.5"
                  />
                  <span class="input-unit">%/tahun</span>
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Mulai Tahun ke-</label>
                <input
                  id="input-opex-naik-mulai"
                  v-model.number="form.opexNaikMulaiTahun"
                  type="number" min="2" :max="form.jangkaWaktu"
                  class="form-input"
                  placeholder="4"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- 7. Pajak -->
        <div class="card">
          <div class="card-title">BAGIAN PAJAK PEMERINTAH</div>
          <div class="form-group">
            <label class="form-label">
              Tax Rate (Tarif Pajak)
              <div class="tooltip-container">
                <span class="help-icon">?</span>
                <span class="tooltip-box">Persentase keuntungan bersih yang disetor ke kas negara. Pajak dihitung dari keuntungan kotor setelah dipotong Opex dan Depresiasi.</span>
              </div>
            </label>
            <div class="input-unit-wrap">
              <input
                id="input-pajak"
                v-model.number="form.pajakRate"
                type="number" min="0" max="100"
                class="form-input" :class="{ error: errors.pajakRate }"
                placeholder="51"
              />
              <span class="input-unit">%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ====== RIGHT COLUMN ====== -->
      <div class="form-col">

        <!-- 5. Data Produksi -->
        <div class="card">
          <div class="card-title">LAJU PRODUKSI MINYAK</div>

          <!-- Mode Segmented Button -->
          <div class="mode-btn-group">
            <button
              id="btn-mode-manual"
              class="mode-btn"
              :class="{ active: !useDecline }"
              @click="setMode(false)"
            >✍️ MANUAL
            </button>
            <button
              id="btn-mode-otomatis"
              class="mode-btn"
              :class="{ active: useDecline }"
              @click="setMode(true)"
            >📉 DECLINE OTOMATIS
            </button>
          </div>

          <!-- Hybrid: pilih mulai decline -->
          <div v-if="useDecline" class="decline-header">
            <div class="form-group flex-1">
              <label class="form-label">
                Mulai Turun (Decline) Tahun ke-
                <div class="tooltip-container">
                  <span class="help-icon">?</span>
                  <span class="tooltip-box">Minyak di bumi terbatas. Tekanan sumur akan melemah alami. Pilih di tahun ke berapa produksi mulai menyusut otomatis.</span>
                </div>
              </label>
              <div class="slider-row">
                <input
                  type="range" min="1" :max="form.jangkaWaktu"
                  v-model.number="form.mulaiDecline"
                  class="range-slider"
                  id="slider-mulai-decline"
                />
                <span class="slider-value">{{ form.mulaiDecline }}</span>
              </div>
              <span class="form-hint">Tahun 1 s.d. {{ form.mulaiDecline - 1 }} diisi manual, selanjutnya berkurang otomatis.</span>
            </div>
            <div class="form-group" style="width:140px">
              <label class="form-label">Laju Turun</label>
              <div class="input-unit-wrap">
                <input
                  id="input-decline-rate"
                  v-model.number="form.declineRate"
                  type="number" min="0" max="99"
                  class="form-input" :class="{ error: errors.declineRate }"
                  placeholder="3"
                />
                <span class="input-unit">%/thn</span>
              </div>
            </div>
          </div>

          <!-- Manual production inputs -->
          <div class="produksi-manual">
            <div
              v-for="t in manualYears"
              :key="t"
              class="produksi-row"
            >
              <label class="produksi-label">Tahun {{ t }} (Manual)</label>
              <div class="input-unit-wrap">
                <input
                  :id="`input-prod-${t}`"
                  v-model.number="form.produksiManual[t-1]"
                  type="number" min="0"
                  class="form-input form-input-sm"
                  :placeholder="`Produksi tahun ${t}`"
                />
                <span class="input-unit">Mbbl</span>
              </div>
            </div>
            <div v-if="useDecline && autoYears.length > 0" class="auto-decline-hint">
              <span>! Tahun {{ form.mulaiDecline }}–{{ form.jangkaWaktu }}: Dihitung otomatis menyusut {{ form.declineRate }}% per tahun.</span>
            </div>
          </div>

          <!-- Preview produksi -->
          <ProductionTable :production="previewProduction" :jangkaWaktu="form.jangkaWaktu" />

          <span v-if="errors.produksi" class="form-error">{{ errors.produksi }}</span>
        </div>

        <!-- 6. Metode Depresiasi -->
        <div class="card">
          <div class="card-title">STRATEGI DEPRESIASI</div>
          <div class="form-group">
            <label class="form-label">
              Pilih Metode Penyusutan
              <div class="tooltip-container">
                <span class="help-icon">?</span>
                <span class="tooltip-box">Metode memotong nilai alat-alat berat untuk memotong pajak. Metode cepat (Double Declining) menguntungkan di awal agar cepat balik modal.</span>
              </div>
            </label>
            <select id="select-metode-dep" v-model="form.metodeDep" class="form-input">
              <option v-for="(label, val) in DEPRECIATION_LABELS" :key="val" :value="val">
                {{ label }}
              </option>
            </select>
          </div>

          <!-- Reserve Total untuk Unit of Production -->
          <div v-if="form.metodeDep === 'unitOfProduction'" class="form-group mt-small">
            <label class="form-label">Cadangan Minyak Total (Reserve)</label>
            <div class="input-unit-wrap">
              <input
                id="input-reserve-total"
                v-model.number="form.reserveTotal"
                type="number" min="0"
                class="form-input" :class="{ error: errors.reserveTotal }"
                placeholder="1000"
              />
              <span class="input-unit">Mbbl</span>
            </div>
            <span v-if="errors.reserveTotal" class="form-error">{{ errors.reserveTotal }}</span>
          </div>

          <!-- Preview depresiasi -->
          <DepreciationTable
            v-if="previewDepreciation.length > 0"
            :rows="previewDepreciation"
            :compact="true"
          />
        </div>
      </div>
    </div>

    <!-- Save Dialog -->
    <div v-if="showSaveDialog" class="modal-overlay" @click.self="showSaveDialog = false">
      <div class="modal-box">
        <h3 class="modal-title">SIMPAN SIMULASI BARU</h3>
        <div class="form-group">
          <label class="form-label">Nama Skenario Lapangan</label>
          <input
            id="input-nama-skenario"
            v-model="saveName"
            type="text"
            class="form-input"
            placeholder="cth: Lapangan RISKI - Strategi Cepat"
            @keyup.enter="confirmSave"
          />
        </div>
        <div class="modal-actions">
          <button class="btn btn-ghost" @click="showSaveDialog = false">Batal</button>
          <button class="btn btn-primary" @click="confirmSave" :disabled="!saveName.trim()">
            Simpan Sekarang
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import ProductionTable from './ProductionTable.vue'
import DepreciationTable from './DepreciationTable.vue'
import { computeProduction } from '../composables/useCalculator.js'
import { computeDepreciation, DEPRECIATION_LABELS } from '../composables/useDepreciation.js'
import { saveScenario } from '../composables/useStorage.js'
import { dummyScenarios, defaultInput } from '../data/dummyScenarios.js'

const emit = defineEmits(['calculate', 'saved'])

// ── State ──────────────────────────────────────────
const form = ref({ ...defaultInput() })
const errors = ref({})
const showSaveDialog = ref(false)
const saveName = ref('')
const useEscalation = ref(false)
const useOpexNaik = ref(false)
const useDecline = ref(false)

const presets = dummyScenarios

// ── Computed ────────────────────────────────────────
const totalInvestasi = computed(() => (form.value.capital || 0) + (form.value.nonCapital || 0))

const manualYears = computed(() => {
  const mulai = form.value.mulaiDecline || (form.value.jangkaWaktu + 1)
  return Array.from({ length: Math.min(mulai - 1, form.value.jangkaWaktu) }, (_, i) => i + 1)
})

const autoYears = computed(() => {
  const mulai = form.value.mulaiDecline || null
  if (!mulai) return []
  return Array.from({ length: form.value.jangkaWaktu - mulai + 1 }, (_, i) => mulai + i)
})

const previewProduction = computed(() => computeProduction(form.value))

const previewDepreciation = computed(() => {
  if (form.value.capital <= 0) return []
  return computeDepreciation(form.value, previewProduction.value)
})

// Ensure produksiManual array size matches jangkaWaktu
watch(() => form.value.jangkaWaktu, (newN) => {
  const arr = form.value.produksiManual
  if (arr.length < newN) {
    form.value.produksiManual = [...arr, ...Array(newN - arr.length).fill(0)]
  } else {
    form.value.produksiManual = arr.slice(0, newN)
  }
})

// ── Methods ─────────────────────────────────────────
function formatMoney(val) {
  if (!val && val !== 0) return 'Rp 0'
  return `Rp ${Number(val).toLocaleString('id-ID')}`
}

function toggleEscalation() {
  useEscalation.value = !useEscalation.value
  if (!useEscalation.value) form.value.hargaEscalation = 0
}

function toggleOpexNaik() {
  useOpexNaik.value = !useOpexNaik.value
  if (!useOpexNaik.value) {
    form.value.opexNaikPersen = 0
    form.value.opexNaikMulaiTahun = null
  }
}

function toggleDecline() {
  useDecline.value = !useDecline.value
  if (!useDecline.value) {
    form.value.mulaiDecline = null
    form.value.declineRate = 0
  } else {
    form.value.mulaiDecline = Math.min(5, form.value.jangkaWaktu)
    form.value.declineRate = 3
  }
}

function setMode(otomatis) {
  useDecline.value = otomatis
  if (!otomatis) {
    form.value.mulaiDecline = null
    form.value.declineRate = 0
  } else {
    form.value.mulaiDecline = form.value.mulaiDecline || Math.min(5, form.value.jangkaWaktu)
    form.value.declineRate = form.value.declineRate || 3
  }
}

function loadPreset(preset) {
  form.value = {
    ...defaultInput(),
    ...preset,
    produksiManual: [...preset.produksiManual, ...Array(Math.max(0, preset.jangkaWaktu - preset.produksiManual.length)).fill(0)],
  }
  useEscalation.value = (preset.hargaEscalation || 0) > 0
  useOpexNaik.value = (preset.opexNaikPersen || 0) > 0
  useDecline.value = (preset.mulaiDecline || 0) > 0
  errors.value = {}
  showPresetMenu.value = false
}

function resetForm() {
  form.value = { ...defaultInput() }
  useEscalation.value = false
  useOpexNaik.value = false
  useDecline.value = false
  errors.value = {}
}

function handleCalculate() {
  // Basic validation
  const errs = {}
  if (!form.value.jangkaWaktu || form.value.jangkaWaktu < 1 || form.value.jangkaWaktu > 25)
    errs.jangkaWaktu = 'Jangka waktu harus antara 1–25 tahun'
  if (!form.value.hargaMinyak || form.value.hargaMinyak <= 0)
    errs.hargaMinyak = 'Harga minyak harus lebih dari 0'
  if (form.value.declineRate >= 100)
    errs.declineRate = 'Decline rate maksimal 99%'
  if (form.value.pajakRate < 0 || form.value.pajakRate > 100)
    errs.pajakRate = 'Pajak harus antara 0–100%'
  if (form.value.metodeDep === 'unitOfProduction' && (!form.value.reserveTotal || form.value.reserveTotal <= 0))
    errs.reserveTotal = 'Reserve Total harus diisi untuk metode ini'
  const totalProd = previewProduction.value.reduce((a, b) => a + b, 0)
  if (totalProd <= 0) errs.produksi = 'Data produksi tidak boleh semua nol'

  errors.value = errs
  if (Object.keys(errs).length > 0) return

  emit('calculate', { ...form.value })
}

function openSaveDialog() {
  saveName.value = form.value.nama || ''
  showSaveDialog.value = true
}

function confirmSave() {
  if (!saveName.value.trim()) return
  form.value.nama = saveName.value.trim()
  showSaveDialog.value = false
  emit('saved', saveName.value.trim())
}
</script>

<style scoped>
.input-panel {
  max-width: 1400px;
  margin: 0 auto;
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

/* Action Bar */
.action-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: var(--space-3) var(--space-5);
  position: relative;
}

.action-left, .action-right {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

/* Case label */
.case-label {
  font-family: var(--font-ui);
  font-size: 10px;
  letter-spacing: 0.08em;
  color: var(--text-muted);
  white-space: nowrap;
}

/* Case preset buttons */
.btn-case {
  font-family: var(--font-ui);
  font-size: 12px;
  font-weight: 600;
  border: 1.5px solid;
  border-radius: var(--radius-sm);
  padding: 5px 12px;
  cursor: pointer;
  transition: all var(--transition-fast);
  white-space: nowrap;
}
.btn-case-untung {
  color: var(--positive);
  border-color: var(--positive);
  background: rgba(16, 185, 129, 0.07);
}
.btn-case-untung:hover {
  background: rgba(16, 185, 129, 0.2);
}
.btn-case-hybrid {
  color: var(--accent-secondary);
  border-color: var(--accent-secondary);
  background: rgba(6, 182, 212, 0.07);
}
.btn-case-hybrid:hover {
  background: rgba(6, 182, 212, 0.2);
}
.btn-case-rugi {
  color: var(--negative);
  border-color: var(--negative);
  background: rgba(239, 68, 68, 0.07);
}
.btn-case-rugi:hover {
  background: rgba(239, 68, 68, 0.2);
}

/* Form Grid */
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-5);
}

.form-col {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

/* Input with unit */
.input-unit-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.input-prefix {
  position: absolute;
  left: 14px;
  font-family: var(--font-mono);
  font-size: 14px;
  color: var(--text-secondary);
  pointer-events: none;
  z-index: 1;
}

.input-unit-wrap .form-input {
  padding-right: 54px;
}

.input-unit-wrap .input-prefix + .form-input {
  padding-left: 36px;
}

.input-unit {
  position: absolute;
  right: 14px;
  font-family: var(--font-ui);
  font-size: 12px;
  color: var(--text-muted);
  pointer-events: none;
}

.form-input-sm {
  padding: 8px 12px;
  font-size: 13px;
}

/* Investasi */
.investasi-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-4);
}

.total-investasi {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: var(--space-3);
  padding-top: var(--space-3);
  border-top: 1px solid var(--border);
  font-family: var(--font-ui);
  font-size: 13px;
  color: var(--text-secondary);
}

.total-value {
  font-size: 16px;
  font-weight: 700;
  color: var(--accent-primary);
  text-shadow: 0 0 12px var(--accent-primary-glow);
}

/* Toggle */
.toggle-row {
  margin-top: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.toggle-label {
  font-family: var(--font-ui);
  font-size: 13px;
  color: var(--text-secondary);
}

.mt-small { margin-top: var(--space-3); }

.opex-naik-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-3);
}

/* Produksi */
.decline-header {
  display: flex;
  gap: var(--space-4);
  margin-bottom: var(--space-4);
  align-items: flex-end;
}

.flex-1 { flex: 1; }

.slider-row {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.slider-value {
  font-family: var(--font-mono);
  font-size: 22px;
  font-weight: 700;
  color: var(--accent-secondary);
  min-width: 32px;
  text-align: center;
}

.produksi-manual {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin-bottom: var(--space-4);
  max-height: 240px;
  overflow-y: auto;
  padding-right: var(--space-2);
}

.produksi-row {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.produksi-label {
  font-family: var(--font-ui);
  font-size: 12px;
  color: var(--text-secondary);
  min-width: 120px;
  flex-shrink: 0;
}

.auto-decline-hint {
  font-family: var(--font-ui);
  font-size: 11px;
  color: var(--accent-secondary);
  background: rgba(56, 189, 248, 0.08);
  border: 1px solid rgba(56, 189, 248, 0.15);
  border-radius: var(--radius-sm);
  padding: var(--space-2) var(--space-3);
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
}

.modal-box {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: var(--space-8);
  width: 400px;
  box-shadow: var(--shadow-card);
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.modal-title {
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 700;
  color: var(--accent-primary);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
}

/* Mode segmented buttons */
.mode-btn-group {
  display: flex;
  gap: 0;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-sm);
  overflow: hidden;
  width: fit-content;
  margin-bottom: var(--space-4);
}

.mode-btn {
  padding: 7px 18px;
  font-family: var(--font-ui);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.04em;
  background: transparent;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.mode-btn:not(:last-child) {
  border-right: 1.5px solid var(--border);
}

.mode-btn.active {
  background: var(--accent-primary);
  color: #000;
  font-weight: 700;
}

.mode-btn:not(.active):hover {
  background: rgba(245, 158, 11, 0.1);
  color: var(--accent-primary);
}
</style>
