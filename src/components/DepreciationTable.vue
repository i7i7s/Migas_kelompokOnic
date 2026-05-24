<template>
  <div class="dep-table-wrap" :class="{ compact }">
    <div class="dep-table-header">
      <span class="label-caps">{{ compact ? 'Preview Depresiasi' : 'Detail Depresiasi per Tahun' }}</span>
    </div>
    <div class="table-scroll">
      <table class="data-table">
        <thead>
          <tr>
            <th>Tahun</th>
            <th>Nilai Awal (Rp)</th>
            <th>Rate (R)</th>
            <th>Depresiasi Di (Rp)</th>
            <th v-if="!compact">Nilai Akhir (Rp)</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in rows" :key="row.tahun">
            <td>{{ row.tahun }}</td>
            <td class="monospace">{{ fmt(row.nilaiAwal) }}</td>
            <td class="monospace">{{ (row.rate * 100).toFixed(2) }}%</td>
            <td class="monospace val-amber">{{ fmt(row.Di) }}</td>
            <td v-if="!compact" class="monospace">{{ fmt(row.nilaiAkhir) }}</td>
          </tr>
        </tbody>
        <tfoot v-if="!compact">
          <tr class="row-total">
            <td>Total</td>
            <td>—</td>
            <td>—</td>
            <td class="monospace">{{ fmt(totalDi) }}</td>
            <td>—</td>
          </tr>
        </tfoot>
      </table>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({
  rows: { type: Array, default: () => [] },
  compact: { type: Boolean, default: false },
})
const totalDi = computed(() => props.rows.reduce((s, r) => s + r.Di, 0))
function fmt(val) {
  if (val === null || val === undefined) return '—'
  return `Rp ${Number(val).toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}
</script>

<style scoped>
.dep-table-wrap {
  margin-top: var(--space-3);
  background: var(--bg-secondary);
  border: 1px solid var(--grid-line);
  border-radius: var(--radius-sm);
}

.dep-table-header {
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--grid-line);
}

.table-scroll {
  overflow-x: auto;
  max-height: 280px;
  overflow-y: auto;
}

.compact .table-scroll {
  max-height: 180px;
}
</style>
