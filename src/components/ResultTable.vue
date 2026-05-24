<template>
  <div class="result-table-wrap fade-in">
    <div class="table-header-bar">
      <h2 class="section-title">TABEL ARUS KAS DETIL (NCF)</h2>
      <button id="btn-copy-table" class="btn btn-ghost btn-sm" @click="copyTable" :class="{ copied }">
        {{ copied ? '[ DATA TERSALIN ]' : '[ SALIN KE EXCEL ]' }}
      </button>
    </div>
    <div class="table-scroll">
      <table class="data-table" id="ncf-table">
        <thead>
          <tr>
            <th>Tahun</th>
            <th>Produksi Minyak</th>
            <th>Total Pendapatan</th>
            <th>Modal Capital</th>
            <th>Modal Non-Capital</th>
            <th>Biaya Opex</th>
            <th>Depresiasi (Penyusutan)</th>
            <th>Keuntungan Kena Pajak</th>
            <th>Setoran Pajak</th>
            <th>Arus Kas Bersih (NCF)</th>
            <th>Akumulasi Keuntungan</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in rows"
            :key="row.tahun"
            :class="{
              'row-zero': row.tahun === 0,
              'row-positive': row.tahun > 0 && row.ncf > 0,
              'row-negative': row.tahun > 0 && row.ncf < 0,
            }"
          >
            <td class="tahun-cell">Thn {{ row.tahun }}</td>
            <td class="monospace">{{ row.produksi !== null ? fmt(row.produksi, 1) + ' Mbbl' : '—' }}</td>
            <td class="monospace" :class="colorClass(row.income)">{{ row.income !== null ? fmtM(row.income) : '—' }}</td>
            <td class="monospace val-amber">{{ row.capital !== null ? fmtM(row.capital) : '—' }}</td>
            <td class="monospace val-amber">{{ row.nonCapital !== null ? fmtM(row.nonCapital) : '—' }}</td>
            <td class="monospace" :class="colorClass(row.opex, true)">{{ row.opex !== null ? fmtM(row.opex) : '—' }}</td>
            <td class="monospace val-cyan">{{ row.Di !== null ? fmtM(row.Di) : '—' }}</td>
            <td class="monospace" :class="colorClass(row.taxableIncome)">{{ row.taxableIncome !== null ? fmtM(row.taxableIncome) : '—' }}</td>
            <td class="monospace" :class="colorClass(row.tax, true)">{{ row.tax !== null ? fmtM(row.tax) : '—' }}</td>
            <td class="monospace" :class="row.ncf >= 0 ? 'val-positive' : 'val-negative'">{{ fmtM(row.ncf) }}</td>
            <td class="monospace" :class="row.cumulativeNcf >= 0 ? 'val-positive' : 'val-negative'">{{ fmtM(row.cumulativeNcf) }}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr class="row-total">
            <td>TOTAL SIMULASI</td>
            <td class="monospace">{{ fmt(totalProd, 1) }} Mbbl</td>
            <td class="monospace">{{ fmtM(totalIncome) }}</td>
            <td class="monospace">{{ fmtM(totalCapital) }}</td>
            <td class="monospace">{{ fmtM(totalNonCapital) }}</td>
            <td class="monospace">{{ fmtM(totalOpex) }}</td>
            <td class="monospace">{{ fmtM(totalDi) }}</td>
            <td class="monospace">{{ fmtM(totalTaxable) }}</td>
            <td class="monospace">{{ fmtM(totalTax) }}</td>
            <td class="monospace">{{ fmtM(totalNcf) }}</td>
            <td class="monospace">—</td>
          </tr>
        </tfoot>
      </table>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
const props = defineProps({
  rows: { type: Array, default: () => [] },
})

const copied = ref(false)

const sumNonNull = (key) => props.rows.reduce((a, r) => a + (r[key] !== null ? r[key] : 0), 0)

const totalProd     = computed(() => sumNonNull('produksi'))
const totalIncome   = computed(() => sumNonNull('income'))
const totalCapital  = computed(() => sumNonNull('capital'))
const totalNonCapital = computed(() => sumNonNull('nonCapital'))
const totalOpex     = computed(() => sumNonNull('opex'))
const totalDi       = computed(() => sumNonNull('Di'))
const totalTaxable  = computed(() => sumNonNull('taxableIncome'))
const totalTax      = computed(() => sumNonNull('tax'))
const totalNcf      = computed(() => props.rows.reduce((a, r) => a + (r.ncf || 0), 0))

function fmt(val, dec = 2) {
  if (val === undefined || val === null || isNaN(val)) return '—'
  return Number(val).toLocaleString('id-ID', { minimumFractionDigits: dec, maximumFractionDigits: dec })
}

function fmtM(val, dec = 2) {
  if (val === undefined || val === null || isNaN(val)) return '—'
  return `Rp ${fmt(val, dec)}`
}

function colorClass(val, isExpense = false) {
  if (val === null || val === undefined) return ''
  if (isExpense) return val > 0 ? 'val-negative' : ''
  return val >= 0 ? 'val-positive' : 'val-negative'
}

async function copyTable() {
  const table = document.getElementById('ncf-table')
  if (!table) return
  const rows = [...table.querySelectorAll('tr')]
  const text = rows.map(r =>
    [...r.querySelectorAll('th, td')].map(c => c.textContent.trim()).join('\t')
  ).join('\n')
  try {
    await navigator.clipboard.writeText(text)
    copied.value = true
    setTimeout(() => (copied.value = false), 2000)
  } catch {}
}
</script>

<style scoped>
.result-table-wrap {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.table-header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-4) var(--space-6);
  border-bottom: 1px solid var(--border);
}

.section-title {
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
}

.table-scroll {
  overflow-x: auto;
  max-height: 480px;
  overflow-y: auto;
}

.tahun-cell {
  text-align: left !important;
  font-weight: 700;
  color: var(--text-secondary) !important;
}

.row-zero td { background: rgba(244, 63, 94, 0.05) !important; }
.row-negative td { background: rgba(244, 63, 94, 0.02) !important; }

.copied {
  color: var(--positive) !important;
  border-color: var(--positive) !important;
  background: var(--positive-bg);
}
</style>
