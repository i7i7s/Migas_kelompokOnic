<template>
  <div class="compare-panel fade-in">
    <div class="compare-header">
      <h2 class="compare-title">PERBANDINGAN SKENARIO</h2>
      <button class="btn btn-ghost btn-sm" @click="$emit('close')">[ TUTUP ]</button>
    </div>
    <p class="compare-subtitle">
      <span class="name-a">{{ a.nama }}</span>
      <span class="vs"> vs </span>
      <span class="name-b">{{ b.nama }}</span>
    </p>

    <!-- Comparison Table -->
    <div class="card">
      <table class="data-table compare-table">
        <thead>
          <tr>
            <th>Indikator</th>
            <th class="col-a">{{ a.nama }}</th>
            <th class="col-b">{{ b.nama }}</th>
            <th>Pemenang</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in compRows" :key="row.label">
            <td>{{ row.label }}</td>
            <td class="monospace" :class="row.winA ? 'val-positive' : ''">{{ row.valA }}</td>
            <td class="monospace" :class="row.winB ? 'val-positive' : ''">{{ row.valB }}</td>
            <td>
              <span class="badge" :class="row.winA ? 'badge-positive' : 'badge-cyan'">
                {{ row.winA ? '[A] ' + truncate(a.nama) : row.winB ? '[B] ' + truncate(b.nama) : '—' }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Comparison Chart -->
    <div class="card">
      <div class="chart-title">CUMULATIVE NCF — PERBANDINGAN</div>
      <div class="chart-wrap">
        <Line :data="chartData" :options="chartOptions" />
      </div>
      <div class="chart-legend">
        <span class="legend-item legend-amber">━ {{ a.nama }}</span>
        <span class="legend-item legend-cyan">━ {{ b.nama }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Tooltip, Legend
} from 'chart.js'
import { formatPOT } from '../composables/useIndicators.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend)

const props = defineProps({
  a: { type: Object, required: true },
  b: { type: Object, required: true },
})
defineEmits(['close'])

function fmtM(val) {
  if (val === null || val === undefined || isNaN(val)) return '—'
  const abs = Math.abs(val).toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return `${val < 0 ? '-' : ''}Rp ${abs}`
}

function fmtPct(val) {
  if (val === null || val === undefined) return '—'
  if (val === '>200%') return '>200%'
  return `${Number(val).toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`
}

function truncate(str) {
  return str.length > 15 ? str.slice(0, 12) + '…' : str
}

// Higher is better for these: NPV, ROR, PIR, DPR, totalNCF
// Lower is better: POT, investasi
const compRows = computed(() => {
  const ha = props.a.hasil
  const hb = props.b.hasil
  const invA = props.a.input.capital + props.a.input.nonCapital
  const invB = props.b.input.capital + props.b.input.nonCapital
  const npvA = ha.npv?.value ?? ha.npv
  const npvB = hb.npv?.value ?? hb.npv

  return [
    {
      label: 'Total Investasi (Rp)',
      valA: fmtM(invA),
      valB: fmtM(invB),
      winA: invA < invB, // lower is better
      winB: invB < invA,
    },
    {
      label: 'NCF Total (Rp)',
      valA: fmtM(ha.totalNCF),
      valB: fmtM(hb.totalNCF),
      winA: ha.totalNCF > hb.totalNCF,
      winB: hb.totalNCF > ha.totalNCF,
    },
    {
      label: 'NPV (Rp)',
      valA: fmtM(npvA),
      valB: fmtM(npvB),
      winA: npvA > npvB,
      winB: npvB > npvA,
    },
    {
      label: 'ROR (%)',
      valA: fmtPct(ha.ror),
      valB: fmtPct(hb.ror),
      winA: Number(ha.ror) > Number(hb.ror),
      winB: Number(hb.ror) > Number(ha.ror),
    },
    {
      label: 'POT (tahun)',
      valA: ha.pot !== null ? `${ha.pot.toFixed(2)} thn` : '—',
      valB: hb.pot !== null ? `${hb.pot.toFixed(2)} thn` : '—',
      winA: ha.pot !== null && (hb.pot === null || ha.pot < hb.pot), // lower is better
      winB: hb.pot !== null && (ha.pot === null || hb.pot < ha.pot),
    },
    {
      label: 'PIR',
      valA: ha.pir !== null ? ha.pir.toFixed(3) : '—',
      valB: hb.pir !== null ? hb.pir.toFixed(3) : '—',
      winA: (ha.pir ?? -Infinity) > (hb.pir ?? -Infinity),
      winB: (hb.pir ?? -Infinity) > (ha.pir ?? -Infinity),
    },
    {
      label: 'DPR',
      valA: ha.dpr !== null ? ha.dpr.toFixed(3) : '—',
      valB: hb.dpr !== null ? hb.dpr.toFixed(3) : '—',
      winA: (ha.dpr ?? -Infinity) > (hb.dpr ?? -Infinity),
      winB: (hb.dpr ?? -Infinity) > (ha.dpr ?? -Infinity),
    },
  ]
})

// Chart: Cumulative NCF both scenarios
const maxLen = computed(() => Math.max(
  props.a.hasil.tabelNCF?.length ?? 0,
  props.b.hasil.tabelNCF?.length ?? 0
))

const chartData = computed(() => ({
  labels: Array.from({ length: maxLen.value }, (_, i) => `Thn ${i}`),
  datasets: [
    {
      label: props.a.nama,
      data: (props.a.hasil.tabelNCF || []).map(r => r.cumulativeNcf),
      borderColor: '#f59e0b',
      backgroundColor: 'rgba(245, 158, 11, 0.08)',
      tension: 0.4, borderWidth: 2, pointRadius: 3,
    },
    {
      label: props.b.nama,
      data: (props.b.hasil.tabelNCF || []).map(r => r.cumulativeNcf),
      borderColor: '#06b6d4',
      backgroundColor: 'rgba(6, 182, 212, 0.08)',
      tension: 0.4, borderWidth: 2, pointRadius: 3,
    },
  ],
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#ffffff',
      borderColor: '#111111',
      borderWidth: 2,
      titleColor: '#111111',
      bodyColor: '#333333',
    },
  },
  scales: {
    x: { grid: { color: '#111111' }, ticks: { color: '#111111', font: { family: 'IBM Plex Mono', size: 11, weight: 'bold' } } },
    y: { grid: { color: '#111111' }, ticks: { color: '#111111', font: { family: 'IBM Plex Mono', size: 11, weight: 'bold' },
      callback: v => `Rp ${Number(v).toLocaleString('id-ID')}` } },
  },
}
</script>

<style scoped>
.compare-panel {
  max-width: 1400px;
  margin: 0 auto;
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.compare-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.compare-title {
  font-family: var(--font-display);
  font-size: 26px;
  letter-spacing: 0.08em;
  color: var(--accent-primary);
}

.compare-subtitle {
  font-family: var(--font-body);
  font-size: 14px;
  color: var(--text-secondary);
}

.name-a { color: var(--accent-primary); font-weight: 700; }
.name-b { color: var(--accent-secondary); font-weight: 700; }
.vs { margin: 0 var(--space-2); color: var(--text-muted); }

.compare-table .col-a { color: var(--accent-primary) !important; }
.compare-table .col-b { color: var(--accent-secondary) !important; }

.chart-title {
  font-family: var(--font-display);
  font-size: 15px;
  letter-spacing: 0.08em;
  color: var(--accent-secondary);
  margin-bottom: var(--space-4);
}

.chart-wrap { height: 300px; }

.chart-legend {
  display: flex;
  gap: var(--space-6);
  justify-content: center;
  margin-top: var(--space-3);
  font-family: var(--font-body);
  font-size: 12px;
}

.legend-amber { color: var(--accent-primary); }
.legend-cyan  { color: var(--accent-secondary); }
</style>
