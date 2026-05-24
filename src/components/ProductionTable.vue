<template>
  <div class="prod-table-wrap">
    <div class="prod-table-header">
      <span class="label-caps">Preview Produksi</span>
      <span class="prod-total">Total: {{ totalProd.toLocaleString('id-ID', {maximumFractionDigits:1}) }} Mbbl</span>
    </div>
    <div class="prod-table-scroll">
      <table class="data-table prod-mini-table">
        <thead>
          <tr>
            <th v-for="t in jangkaWaktu" :key="t">Thn {{ t }}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td v-for="(q, i) in production" :key="i" class="monospace">
              {{ q.toLocaleString('id-ID', { maximumFractionDigits: 1 }) }}
            </td>
          </tr>
        </tbody>
      </table>
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
  border: 1px solid var(--grid-line);
  border-radius: var(--radius-sm);
  padding: var(--space-3);
}

.prod-table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-2);
}

.prod-total {
  font-family: var(--font-body);
  font-size: 12px;
  color: var(--accent-cyan, var(--accent-secondary));
}

.prod-table-scroll {
  overflow-x: auto;
}

.prod-mini-table th, .prod-mini-table td {
  padding: 4px 8px;
  font-size: 12px;
  min-width: 56px;
}

.prod-mini-table th {
  background: transparent;
  font-size: 10px;
  position: static;
}

.prod-mini-table td {
  color: var(--accent-secondary);
  text-align: right;
}
</style>
