<template>
  <div class="chart-card">
    <div class="chart-title">NCF PER TAHUN</div>
    <div class="chart-wrap">
      <Bar :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const props = defineProps({
  rows: { type: Array, default: () => [] },
})

const chartData = computed(() => ({
  labels: props.rows.map(r => `Thn ${r.tahun}`),
  datasets: [{
    label: 'NCF (Rp)',
    data: props.rows.map(r => r.ncf),
    backgroundColor: props.rows.map(r => r.ncf >= 0
      ? 'rgba(16, 185, 129, 0.75)'
      : 'rgba(239, 68, 68, 0.75)'
    ),
    borderColor: props.rows.map(r => r.ncf >= 0 ? '#10b981' : '#ef4444'),
    borderWidth: 1,
    borderRadius: 2,
  }],
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
      callbacks: {
        label: ctx => ` Rp ${Number(ctx.raw).toLocaleString('id-ID', { minimumFractionDigits: 2 })}`,
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
      border: { dash: [4, 4] },
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
</style>
