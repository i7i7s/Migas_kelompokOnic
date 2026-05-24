<template>
  <div class="chart-card">
    <div class="chart-title">DISCOUNT RATE (r) vs NPV</div>
    <div class="chart-wrap">
      <Line :data="chartData" :options="chartOptions" :plugins="[rorPlugin]" />
    </div>
    <div v-if="ror !== null" class="ror-badge">
      ROR (IRR) ≈ <strong>{{ rorStr }}</strong>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Title, Tooltip, Legend
} from 'chart.js'
import { generateRvsNPVData } from '../composables/useIndicators.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

const props = defineProps({
  rows: { type: Array, default: () => [] },
  ror:  { type: [Number, String], default: null },
})

const rorStr = computed(() => {
  if (!props.ror || props.ror === '>200%') return '—'
  return `${Number(props.ror).toFixed(2)}%`
})

const rvsNpvData = computed(() => generateRvsNPVData(props.rows))

const chartData = computed(() => ({
  labels: rvsNpvData.value.map(p => `${p.r}%`),
  datasets: [{
    label: 'NPV (Rp)',
    data: rvsNpvData.value.map(p => p.npv),
    borderColor: '#06b6d4',
    backgroundColor: 'rgba(6, 182, 212, 0.08)',
    tension: 0.4,
    borderWidth: 2,
    fill: false,
    pointRadius: 0,
    pointHoverRadius: 5,
    pointHoverBackgroundColor: '#f59e0b',
  }],
}))

const rorPlugin = {
  id: 'rorLine',
  afterDraw(chart) {
    if (!props.ror || props.ror === '>200%') return
    const { ctx, scales: { x, y } } = chart
    const rorVal = Number(props.ror)
    const xPos = x.getPixelForValue(rorVal)
    const yZero = y.getPixelForValue(0)

    ctx.save()
    // Zero NPV horizontal dashed line
    ctx.beginPath()
    ctx.setLineDash([6, 4])
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)'
    ctx.lineWidth = 1
    ctx.moveTo(chart.chartArea.left, yZero)
    ctx.lineTo(chart.chartArea.right, yZero)
    ctx.stroke()

    // ROR vertical line
    ctx.beginPath()
    ctx.setLineDash([4, 4])
    ctx.strokeStyle = '#f59e0b'
    ctx.lineWidth = 2
    ctx.moveTo(xPos, chart.chartArea.top)
    ctx.lineTo(xPos, chart.chartArea.bottom)
    ctx.stroke()

    // ROR dot at intersection
    ctx.beginPath()
    ctx.setLineDash([])
    ctx.arc(xPos, yZero, 6, 0, Math.PI * 2)
    ctx.fillStyle = '#f59e0b'
    ctx.fill()
    ctx.strokeStyle = '#0a0e17'
    ctx.lineWidth = 2
    ctx.stroke()

    // ROR label
    ctx.fillStyle = '#f59e0b'
    ctx.font = 'bold 11px IBM Plex Mono'
    ctx.fillText(`ROR≈${rorVal.toFixed(1)}%`, xPos + 6, yZero - 8)
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
        label: ctx => ` NPV: Rp ${Number(ctx.raw).toLocaleString('id-ID', { minimumFractionDigits: 2 })}`,
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

.ror-badge {
  margin-top: var(--space-3);
  font-family: var(--font-body);
  font-size: 12px;
  color: var(--text-secondary);
  text-align: center;
}

.ror-badge strong {
  color: var(--accent-primary);
}
</style>
