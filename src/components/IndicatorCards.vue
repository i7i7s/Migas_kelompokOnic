<template>
  <div class="indicators-grid fade-in">

    <!-- POT Card -->
    <div class="indicator-card" :class="potColor">
      <div class="ic-label">
        PAY OUT TIME (POT)
        <div class="tooltip-container">
          <span class="help-icon">?</span>
          <span class="tooltip-box">
            <strong>Kapan Balik Modal?</strong> Durasi waktu terkecil untuk mengembalikan modal investasi awal Anda dari akumulasi keuntungan bersih.
          </span>
        </div>
      </div>
      <div class="ic-value">{{ potStr }}</div>
      <div class="ic-sub" v-if="pot !== null">
        {{ pot.toFixed(2) }} tahun
      </div>
      <div class="ic-sub" v-else>Tidak balik modal selama proyek aktif.</div>
      
      <!-- Timeline bar -->
      <div v-if="pot !== null" class="pot-timeline">
        <div class="pot-bar">
          <div class="pot-fill" :style="{ width: potPct + '%' }"></div>
        </div>
        <div class="pot-labels">
          <span>Tahun 0</span>
          <span class="pot-marker" :style="{ left: potPct + '%' }">▲</span>
          <span>Tahun {{ jangkaWaktu }}</span>
        </div>
      </div>
    </div>

    <!-- NPV Card -->
    <div class="indicator-card" :class="npvColor">
      <div class="ic-label">
        NET PRESENT VALUE (NPV)
        <div class="tooltip-container">
          <span class="help-icon">?</span>
          <span class="tooltip-box">
            <strong>Nilai Uang Sekarang:</strong> Total keuntungan bersih proyek di masa depan yang ditarik nilainya ke hari ini setelah dipotong faktor inflasi/suku bunga (Discount Rate). NPV wajib &gt; 0 agar proyek dinyatakan layak.
          </span>
        </div>
      </div>
      <div class="ic-value monospace">{{ fmtMoney(npv) }}</div>
      <div class="ic-badge-row">
        <span class="badge" :class="npv >= 0 ? 'badge-positive' : 'badge-negative'">
          {{ npv >= 0 ? 'LAYAK JALAN' : 'TIDAK LAYAK' }}
        </span>
      </div>
      <!-- Discount rate slider -->
      <div class="npv-slider-wrap">
        <label class="ic-sublabel">Ubah Suku Bunga (Discount Rate):</label>
        <div class="slider-row-ic">
          <input
            id="slider-discount-rate"
            type="range" min="0" max="50" step="0.5"
            :value="discountRate"
            @input="$emit('rate-change', Number($event.target.value))"
            class="range-slider"
          />
          <span class="slider-val monospace">{{ discountRate }}%</span>
        </div>
      </div>
    </div>

    <!-- ROR Card -->
    <div class="indicator-card indicator-card--cyan">
      <div class="ic-label">
        RATE OF RETURN (ROR)
        <div class="tooltip-container">
          <span class="help-icon">?</span>
          <span class="tooltip-box">
            <strong>Bunga Keuntungan:</strong> Tingkat pengembalian tahunan proyek ini. Bandingkan dengan suku bunga bank. Jika ROR &gt; bunga bank (deposito), proyek ini jauh lebih untung!
          </span>
        </div>
      </div>
      <div class="ic-value ic-value--cyan monospace">{{ rorStr }}</div>
      <div class="ic-sub">Metode Bisection</div>
      <!-- Circular gauge -->
      <div class="ror-gauge">
        <svg viewBox="0 0 80 80" class="gauge-svg">
          <circle cx="40" cy="40" r="32" fill="none" stroke="var(--border)" stroke-width="5"/>
          <circle
            cx="40" cy="40" r="32" fill="none"
            stroke="var(--accent-secondary)"
            stroke-width="5"
            stroke-linecap="round"
            :stroke-dasharray="`${rorArc} 201`"
            stroke-dashoffset="50"
            style="transition: stroke-dasharray 0.6s ease;"
          />
          <text x="40" y="44" text-anchor="middle" fill="var(--accent-secondary)" font-size="11" font-family="IBM Plex Mono" font-weight="700">
            {{ rorShort }}
          </text>
        </svg>
      </div>
    </div>

    <!-- PIR Card -->
    <div class="indicator-card" :class="pirColor">
      <div class="ic-label">
        PROFIT TO INVEST. (PIR)
        <div class="tooltip-container">
          <span class="help-icon">?</span>
          <span class="tooltip-box">
            <strong>Rasio Lipat Modal:</strong> Setiap $1 modal investasi awal yang dikeluarkan, akan menghasilkan berapa kali lipat total keuntungan bersih (belum dipotong inflasi). Wajib &gt; 1.0 agar untung.
          </span>
        </div>
      </div>
      <div class="ic-value monospace">{{ pir !== null ? pir.toFixed(3) : '—' }}</div>
      <div class="ic-sub">Undiscounted PIR</div>
      <div class="ic-badge-row">
        <span v-if="pir !== null" class="badge" :class="pir >= 1 ? 'badge-positive' : 'badge-negative'">
          {{ pir >= 1 ? 'UNTUNG' : 'RUGI' }}
        </span>
      </div>
    </div>

    <!-- DPR Card -->
    <div class="indicator-card" :class="dprColor">
      <div class="ic-label">
        DISCOUNTED PIR (DPR)
        <div class="tooltip-container">
          <span class="help-icon">?</span>
          <span class="tooltip-box">
            <strong>Rasio Lipat Modal Riil:</strong> Mirip PIR, tapi hitungannya sudah dipotong inflasi (menggunakan NPV). Jika DPR &gt; 0, artinya proyek ini secara riil menguntungkan.
          </span>
        </div>
      </div>
      <div class="ic-value monospace">{{ dpr !== null ? dpr.toFixed(3) : '—' }}</div>
      <div class="ic-sub">DPR = NPV / Modal Awal</div>
      <div class="ic-badge-row">
        <span v-if="dpr !== null" class="badge" :class="dpr >= 0 ? 'badge-positive' : 'badge-negative'">
          {{ dpr >= 0 ? 'RIIL POSITIF' : 'RIIL NEGATIF' }}
        </span>
      </div>
    </div>

  </div>
</template>

<script setup>
import { computed } from 'vue'
import { formatPOT, formatMoney } from '../composables/useIndicators.js'

const props = defineProps({
  pot:          { type: Number, default: null },
  npv:          { type: Number, default: 0 },
  ror:          { type: [Number, String], default: null },
  pir:          { type: Number, default: null },
  dpr:          { type: Number, default: null },
  discountRate: { type: Number, default: 10 },
  jangkaWaktu:  { type: Number, default: 10 },
})
defineEmits(['rate-change'])

const potStr  = computed(() => formatPOT(props.pot))
const potPct  = computed(() => props.pot !== null ? Math.min(100, (props.pot / props.jangkaWaktu) * 100) : 0)
const potColor = computed(() => props.pot !== null ? 'indicator-card--green' : 'indicator-card--red')
const npvColor = computed(() => props.npv >= 0 ? 'indicator-card--green' : 'indicator-card--red')
const pirColor = computed(() => (props.pir !== null && props.pir >= 1) ? 'indicator-card--amber' : 'indicator-card--red')
const dprColor = computed(() => (props.dpr !== null && props.dpr >= 0) ? 'indicator-card--amber' : 'indicator-card--red')

const rorStr  = computed(() => {
  if (props.ror === null) return '—'
  if (props.ror === '>200%') return '>200%'
  return `${Number(props.ror).toFixed(2)}%`
})
const rorShort = computed(() => {
  if (props.ror === null || props.ror === '>200%') return '—'
  return `${Number(props.ror).toFixed(1)}%`
})
const rorArc = computed(() => {
  if (!props.ror || props.ror === '>200%') return 0
  return Math.min(201, (Number(props.ror) / 100) * 201)
})

function fmtMoney(val) {
  if (val === null || val === undefined) return '—'
  const abs = Math.abs(val).toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return `${val < 0 ? '-' : ''}Rp ${abs}`
}
</script>

<style scoped>
.indicators-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: var(--space-4);
}

.indicator-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: var(--space-5);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  transition: all var(--transition-fast);
  position: relative;
  overflow: visible; /* Penting agar tooltip tidak terpotong card */
}

/* Colored top border based on status */
.indicator-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 4px;
  border-radius: var(--radius-md) var(--radius-md) 0 0;
}

.indicator-card--green { border-color: rgba(16, 185, 129, 0.2); }
.indicator-card--green::before { background: var(--positive); }
.indicator-card--green .ic-value { color: var(--positive); }

.indicator-card--red { border-color: rgba(244, 63, 94, 0.2); }
.indicator-card--red::before { background: var(--negative); }
.indicator-card--red .ic-value { color: var(--negative); }

.indicator-card--amber { border-color: rgba(245, 158, 11, 0.2); }
.indicator-card--amber::before { background: var(--accent-primary); }
.indicator-card--amber .ic-value { color: var(--accent-primary); }

.indicator-card--cyan { border-color: rgba(56, 189, 248, 0.2); }
.indicator-card--cyan::before { background: var(--accent-secondary); }

.ic-label {
  font-family: var(--font-ui);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.ic-value {
  font-family: var(--font-display);
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
  margin-top: 4px;
}

.ic-value--cyan {
  color: var(--accent-secondary);
}

.ic-sub {
  font-family: var(--font-ui);
  font-size: 12px;
  color: var(--text-muted);
}

.ic-sublabel {
  font-family: var(--font-ui);
  font-size: 11px;
  color: var(--text-secondary);
}

.ic-badge-row {
  margin-top: auto;
  padding-top: var(--space-2);
}

/* POT Timeline */
.pot-timeline {
  margin-top: var(--space-2);
}

.pot-bar {
  height: 6px;
  background: var(--bg-primary);
  border-radius: 3px;
  overflow: hidden;
  position: relative;
}

.pot-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--positive), #34d399);
  border-radius: 3px;
  transition: width 0.6s ease;
}

.pot-labels {
  display: flex;
  justify-content: space-between;
  position: relative;
  margin-top: 4px;
  font-size: 10px;
  color: var(--text-muted);
  font-family: var(--font-ui);
}

.pot-marker {
  position: absolute;
  transform: translateX(-50%);
  color: var(--positive);
  font-size: 8px;
  top: -2px;
}

/* NPV Slider */
.npv-slider-wrap {
  margin-top: var(--space-3);
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.slider-row-ic {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.slider-val {
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 700;
  color: var(--accent-secondary);
  min-width: 36px;
  text-align: right;
}

/* ROR Gauge */
.ror-gauge {
  margin-top: auto;
  display: flex;
  justify-content: center;
}

.gauge-svg {
  width: 58px;
  height: 58px;
}

@media (max-width: 1100px) {
  .indicators-grid { grid-template-columns: repeat(3, 1fr); }
}

@media (max-width: 768px) {
  .indicators-grid { grid-template-columns: 1fr 1fr; }
}
</style>
