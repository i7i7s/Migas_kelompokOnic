<template>
  <div class="prod-table-wrap">
    <div class="prod-table-header">
      <span class="label-caps">Preview Produksi</span>
      <span class="prod-total">Total: {{ totalProd.toLocaleString('id-ID', {maximumFractionDigits:1}) }} Mbbl</span>
    </div>

    <!-- Grid: 5 kolom per baris, wrap otomatis -->
    <div class="prod-grid">
      <div
        v-for="(q, i) in production"
        :key="i"
        class="prod-cell"
        :class="{ 'prod-cell--first': i === 0 }"
      >
        <div class="prod-cell-label">THN {{ i + 1 }}</div>
        <div class="prod-cell-value">{{ q.toLocaleString('id-ID', { maximumFractionDigits: 1 }) }}</div>
        <div class="prod-cell-unit">Mbbl</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({
  production: { type: Array, default: () => [] },
  jangkaWaktu: { type: Number, default: 10 },
})
const totalProd = computed(() => props.production.reduce((a, b) => a + b, 0))
</script>

<style scoped>
.prod-table-wrap {
  margin-top: var(--space-3);
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: var(--space-3);
  /* Pastikan tidak melebihi lebar parent */
  width: 100%;
  box-sizing: border-box;
  min-width: 0;
}

.prod-table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-3);
}

.label-caps {
  font-family: var(--font-ui);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--text-muted);
}

.prod-total {
  font-family: var(--font-body);
  font-size: 12px;
  color: var(--accent-secondary);
  font-weight: 700;
}

/* Grid: 5 item per baris, wrap ke baris berikutnya */
.prod-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 4px;
}

.prod-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 6px 4px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  min-width: 0;
}

.prod-cell--first .prod-cell-value {
  color: var(--accent-primary);
}

.prod-cell-label {
  font-family: var(--font-ui);
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: var(--text-muted);
  margin-bottom: 2px;
}

.prod-cell-value {
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 700;
  color: var(--accent-secondary);
  white-space: nowrap;
}

.prod-cell-unit {
  font-family: var(--font-ui);
  font-size: 9px;
  color: var(--text-muted);
  margin-top: 1px;
}
</style>
