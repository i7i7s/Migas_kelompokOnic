<template>
  <div class="scenario-panel fade-in">
    <div class="scenario-header">
      <div class="scenario-title-row">
        <h2 class="section-heading">DAFTAR SKENARIO TERSIMPAN</h2>
        <span class="badge badge-amber">{{ scenarios.length }} SKENARIO</span>
      </div>
      <button id="btn-new-scenario" class="btn btn-primary" @click="$emit('go-input')">
        [ BUAT SKENARIO BARU ]
      </button>
    </div>

    <!-- Empty state -->
    <div v-if="scenarios.length === 0" class="empty-state">
      <div class="empty-icon" style="font-family:var(--font-mono);font-weight:900;">NO DATA</div>
      <p class="empty-title">BELUM ADA SKENARIO TERSIMPAN</p>
      <p class="empty-sub">Isi form input, hitung, lalu klik "Simpan Skenario"</p>
      <button class="btn btn-secondary mt-4" @click="$emit('go-input')">[ KE FORM INPUT ]</button>
    </div>

    <!-- Scenario Grid -->
    <div v-else class="scenario-grid">
      <div
        v-for="(s, idx) in scenarios"
        :key="s.id"
        class="scenario-card"
        :class="[idx % 2 === 0 ? 'card-accent-amber' : 'card-accent-cyan', { selected: compareIds.includes(s.id) }]"
      >
        <div class="sc-header">
          <div class="sc-name">{{ s.nama }}</div>
          <span class="badge" :class="s.hasil.npv >= 0 ? 'badge-positive' : 'badge-negative'">
            {{ s.hasil.npv >= 0 ? 'LAYAK' : 'TIDAK LAYAK' }}
          </span>
        </div>

        <div class="sc-date">{{ fmtDate(s.tanggalSimpan) }}</div>

        <div class="sc-stats">
          <div class="stat-row">
            <span class="stat-label">Total Investasi</span>
            <span class="stat-val">{{ fmtM(s.input.capital + s.input.nonCapital) }}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">NCF Total</span>
            <span class="stat-val" :class="s.hasil.totalNCF >= 0 ? 'val-positive' : 'val-negative'">
              {{ fmtM(s.hasil.totalNCF) }}
            </span>
          </div>
          <div class="stat-row">
            <span class="stat-label">NPV (r={{ s.hasil.npv?.rate ?? 10 }}%)</span>
            <span class="stat-val" :class="s.hasil.npv?.value >= 0 ? 'val-positive' : 'val-negative'">
              {{ fmtM(s.hasil.npv?.value ?? s.hasil.npv) }}
            </span>
          </div>
          <div class="stat-row">
            <span class="stat-label">ROR</span>
            <span class="stat-val val-cyan">
              {{ s.hasil.ror !== null ? `${Number(s.hasil.ror).toFixed(2)}%` : '—' }}
            </span>
          </div>
          <div class="stat-row">
            <span class="stat-label">POT</span>
            <span class="stat-val">{{ formatPOT(s.hasil.pot) }}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">PIR</span>
            <span class="stat-val val-amber">
              {{ s.hasil.pir !== null ? s.hasil.pir.toFixed(3) : '—' }}
            </span>
          </div>
        </div>

        <div class="sc-actions">
          <button :id="`btn-load-${s.id}`" class="btn btn-secondary btn-sm" @click="$emit('load', s)">
            [ LOAD ]
          </button>
          <button :id="`btn-delete-${s.id}`" class="btn btn-danger btn-sm" @click="$emit('delete', s.id)">
            [ HAPUS ]
          </button>
          <button
            :id="`btn-compare-${s.id}`"
            class="btn btn-sm"
            :class="compareIds.includes(s.id) ? 'btn-primary' : 'btn-ghost'"
            @click="$emit('toggle-compare', s.id)"
            :disabled="!compareIds.includes(s.id) && compareIds.length >= 2"
          >
            {{ compareIds.includes(s.id) ? '[ DIPILIH ]' : '[ BANDINGKAN ]' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Compare trigger -->
    <div v-if="compareIds.length === 2" class="compare-trigger">
      <span style="font-weight:800;">2 SKENARIO DIPILIH UNTUK DIBANDINGKAN</span>
      <button id="btn-do-compare" class="btn btn-primary" @click="$emit('compare', compareIds)">
        [ BANDINGKAN SEKARANG ]
      </button>
    </div>
  </div>
</template>

<script setup>
import { formatPOT } from '../composables/useIndicators.js'

defineProps({
  scenarios: { type: Array, default: () => [] },
  compareIds: { type: Array, default: () => [] },
})
defineEmits(['go-input', 'load', 'delete', 'toggle-compare', 'compare'])

function fmtDate(iso) {
  try {
    return new Date(iso).toLocaleString('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  } catch { return iso }
}

function fmtM(val) {
  if (val === null || val === undefined || isNaN(val)) return '—'
  const abs = Math.abs(val).toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return `${val < 0 ? '-' : ''}Rp ${abs}`
}
</script>

<style scoped>
.scenario-panel {
  max-width: 1400px;
  margin: 0 auto;
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.scenario-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.scenario-title-row {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.section-heading {
  font-family: var(--font-display);
  font-size: 28px;
  letter-spacing: 0.08em;
  color: var(--text-primary);
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-12) var(--space-8);
  background: var(--bg-card);
  border: var(--border-thick);
  box-shadow: var(--shadow-brutal);
  gap: var(--space-3);
  text-align: center;
}

.empty-icon { font-size: 48px; opacity: 0.5; }
.empty-title { font-family: var(--font-display); font-size: 20px; color: var(--text-secondary); letter-spacing: 0.06em; }
.empty-sub { font-family: var(--font-body); font-size: 13px; color: var(--text-muted); }

/* Scenario Grid */
.scenario-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: var(--space-5);
}

.scenario-card {
  background: var(--bg-card);
  border: var(--border-thick);
  padding: var(--space-5);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  transition: all var(--transition-fast);
  box-shadow: var(--shadow-brutal);
}

.scenario-card.selected {
  background: var(--accent-primary);
}

.sc-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--space-2);
}

.sc-name {
  font-family: var(--font-display);
  font-size: 18px;
  letter-spacing: 0.04em;
  color: var(--text-primary);
}

.sc-date {
  font-family: var(--font-body);
  font-size: 11px;
  color: var(--text-muted);
}

.sc-stats {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  background: var(--bg-primary);
  border: var(--border-thin);
  padding: var(--space-3);
}

.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2px 0;
  border-bottom: 1px solid var(--grid-line);
}

.stat-row:last-child { border-bottom: none; }

.stat-label {
  font-family: var(--font-body);
  font-size: 11px;
  color: var(--text-muted);
}

.stat-val {
  font-family: var(--font-body);
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary);
}

.sc-actions {
  display: flex;
  gap: var(--space-2);
  margin-top: auto;
}

/* Compare trigger bar */
.compare-trigger {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-4) var(--space-6);
  background: var(--accent-secondary);
  border: var(--border-thick);
  font-family: var(--font-body);
  font-size: 13px;
  color: var(--text-light);
  box-shadow: var(--shadow-brutal);
}
</style>
