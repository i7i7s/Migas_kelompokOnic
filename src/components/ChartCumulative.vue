<template>
  <div class="chart-card">
    <div class="chart-title">CUMULATIVE NCF</div>
    <div class="chart-wrap">
      <Line :data="chartData" :options="chartOptions" :plugins="[potPlugin]" />
    </div>
    <div v-if="pot !== null" class="pot-badge">
      POT ≈ <strong>{{ potStr }}</strong>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  Title, Tooltip, Filler, Legend
} from 'chart.js'
import { formatPOT } from '../composables/useIndicators.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler, Legend)

const props = defineProps({
  rows: { type: Array, default: () => [] },
  pot:  { type: Number, default: null },
})

const potStr = computed(() => formatPOT(props.pot))

const chartData = computed(() => ({
  labels: props.rows.map(r => `Thn ${r.tahun}`),
  datasets: [{
    label: 'Cumulative NCF (Rp)',
    data: props.rows.map(r => r.cumulativeNcf),
    borderColor: '#f59e0b',
    backgroundColor: (ctx) => {
      const chart = ctx.chart
      const { ctx: c, chartArea } = chart
      if (!chartArea) return 'transparent'
      const gradient = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom)
      gradient.addColorStop(0, 'rgba(16, 185, 129, 0.2)')
      gradient.addColorStop(0.5, 'rgba(245, 158, 11, 0.05)')
      gradient.addColorStop(1, 'rgba(239, 68, 68, 0.2)')
      return gradient
    },
    fill: true,
    tension: 0.4,
    borderWidth: 2,
    pointBackgroundColor: props.rows.map(r => r.cumulativeNcf >= 0 ? '#10b981' : '#ef4444'),
    pointRadius: 4,
    pointHoverRadius: 6,
  }],
}))

// Plugin to draw vertical POT line
const potPlugin = {
  id: 'potLine',
  afterDraw(chart) {
    if (props.pot === null) return
    const { ctx, scales: { x, y } } = chart
    const xPos = x.getPixelForValue(props.pot)
    const yZero = y.getPixelForValue(0)

    ctx.save()
    // Zero line highlight
    ctx.beginPath()
    ctx.setLineDash([6, 4])
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.5)'
    ctx.lineWidth = 2
    ctx.moveTo(chart.chartArea.left, yZero)
    ctx.lineTo(chart.chartArea.right, yZero)
    ctx.stroke()

    // POT vertical line
    ctx.beginPath()
    ctx.setLineDash([4, 4])
    ctx.strokeStyle = '#f59e0b'
    ctx.lineWidth = 2
    ctx.moveTo(xPos, chart.chartArea.top)
    ctx.lineTo(xPos, chart.chartArea.bottom)
    ctx.stroke()

    // POT label
    ctx.fillStyle = '#f59e0b'
    ctx.font = 'bold 11px IBM Plex Mono'
    ctx.fillText('POT', xPos + 4, chart.chartArea.top + 16)
    ctx.restore()
  },
}

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
      callbacks: {
        label: ctx => ` Cum NCF: Rp ${Number(ctx.raw).toLocaleString('id-ID', { minimumFractionDigits: 2 })}`,
      },
    },
  },
  scales: {
    x: {
      grid: { color: '#111111' },
      ticks: { color: '#111111', font: { family: 'IBM Plex Mono', size: 11, weight: 'bold' } },
    },
    y: {
      grid: { color: '#111111' },
      ticks: { color: '#111111', font: { family: 'IBM Plex Mono', size: 11, weight: 'bold' },
        callback: v => `Rp ${Number(v).toLocaleString('id-ID')}` },
    },
  },
}
</script>

<style scoped>
.chart-card {
  background: var(--bg-card);
  border: var(--border-thick);
  border-radius: 0;
  padding: var(--space-5);
  box-shadow: var(--shadow-brutal);
}

.chart-title {
  font-family: var(--font-display);
  font-size: 15px;
  letter-spacing: 0.08em;
  color: var(--accent-secondary);
  margin-bottom: var(--space-4);
}

.chart-wrap {
  height: 260px;
}

.pot-badge {
  margin-top: var(--space-3);
  font-family: var(--font-body);
  font-size: 12px;
  color: var(--text-secondary);
  text-align: center;
}

.pot-badge strong {
  color: var(--accent-primary);
}
</style>
