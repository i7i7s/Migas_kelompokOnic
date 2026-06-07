<template>
  <div class="chart-card">
    <div class="chart-title">PRODUKSI MINYAK & SISA CADANGAN</div>
    <div class="chart-wrap">
      <Bar :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement,
  LineElement, PointElement,
  Title, Tooltip, Legend,
} from 'chart.js'

ChartJS.register(
  CategoryScale, LinearScale, BarElement,
  LineElement, PointElement,
  Title, Tooltip, Legend
)

const props = defineProps({
  rows: { type: Array, default: () => [] },
})

const chartData = computed(() => {
  const opRows = props.rows.filter(r => r.tahun > 0)

  // Akumulasi cadangan terproduksi
  let cumProd = 0
  const cumProdArr = opRows.map(r => {
    cumProd += r.produksi || 0
    return cumProd
  })

  const totalProd = cumProd

  // Sisa cadangan (asumsi cadangan = total produksi selama kontrak)
  const sisaCadangan = opRows.map((_, i) => {
    return Math.max(0, totalProd - cumProdArr[i])
  })

  return {
    labels: opRows.map(r => `Thn ${r.tahun}`),
    datasets: [
      {
        type: 'bar',
        label: 'Produksi (Mbbl)',
        data: opRows.map(r => r.produksi || 0),
        backgroundColor: opRows.map((r, i) => {
          const ratio = i / (opRows.length - 1 || 1)
          // Hijau ke amber ke merah mengikuti decline
          const g = Math.round(185 - ratio * 120)
          const r2 = Math.round(16 + ratio * 220)
          return `rgba(${r2}, ${g}, 50, 0.80)`
        }),
        borderWidth: 0,
        borderRadius: 3,
        yAxisID: 'yProd',
      },
      {
        type: 'line',
        label: 'Sisa Cadangan (Mbbl)',
        data: sisaCadangan,
        borderColor: 'rgba(56, 189, 248, 0.9)',
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderDash: [6, 3],
        pointBackgroundColor: 'rgba(56, 189, 248, 0.9)',
        pointRadius: 4,
        tension: 0.3,
        yAxisID: 'ySisa',
      },
    ],
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: 'index', intersect: false },
  plugins: {
    legend: {
      display: true,
      labels: {
        color: '#111111',
        font: { family: 'IBM Plex Mono', size: 11, weight: 'bold' },
        boxWidth: 14,
      },
    },
    tooltip: {
      backgroundColor: '#ffffff',
      borderColor: '#111111',
      borderWidth: 2,
      titleColor: '#111111',
      bodyColor: '#333333',
      callbacks: {
        label: ctx => ` ${ctx.dataset.label}: ${Number(ctx.raw).toLocaleString('id-ID', { maximumFractionDigits: 1 })} Mbbl`,
      },
    },
  },
  scales: {
    x: {
      grid: { color: 'rgba(0,0,0,0.08)' },
      ticks: { color: '#111111', font: { family: 'IBM Plex Mono', size: 11, weight: 'bold' } },
    },
    yProd: {
      position: 'left',
      grid: { color: 'rgba(0,0,0,0.08)' },
      ticks: {
        color: '#111111',
        font: { family: 'IBM Plex Mono', size: 10 },
        callback: v => `${Number(v).toLocaleString('id-ID')} Mbbl`,
      },
      title: {
        display: true,
        text: 'Produksi',
        color: '#555',
        font: { family: 'IBM Plex Mono', size: 10 },
      },
    },
    ySisa: {
      position: 'right',
      grid: { drawOnChartArea: false },
      ticks: {
        color: 'rgba(56, 189, 248, 0.9)',
        font: { family: 'IBM Plex Mono', size: 10 },
        callback: v => `${Number(v).toLocaleString('id-ID')} Mbbl`,
      },
      title: {
        display: true,
        text: 'Sisa Cadangan',
        color: 'rgba(56, 189, 248, 0.9)',
        font: { family: 'IBM Plex Mono', size: 10 },
      },
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
