<template>
  <div class="analysis-panel-container">
    <button class="btn btn-primary btn-block toggle-btn" @click="isOpen = !isOpen">
      {{ isOpen ? 'TUTUP ANALISIS ▲' : 'MAU LIHAT ANALISIS? ▼' }}
    </button>

    <div v-if="isOpen" class="analysis-panel fade-in">

      <!-- ══ VONIS UTAMA ══ -->
      <div class="verdict-banner" :class="overallClass">
        <div class="verdict-body">
          <div class="verdict-title">{{ overallTitle }}</div>
          <div class="verdict-sub">{{ overallSub }}</div>
        </div>
        <div class="verdict-badge">{{ overallBadge }}</div>
      </div>

      <!-- ══ GRID PENJELASAN ══ -->
      <div class="analysis-grid">

        <!-- Blok: Ringkasan Keuangan -->
        <div class="analysis-block">
          <div class="ab-header">RINGKASAN KEUANGAN</div>
          <ul class="ab-list">
            <li>
              <span class="ab-key">Total Investasi Awal</span>
              <span class="ab-val">{{ fmt(totalInvestasi) }}</span>
            </li>
            <li>
              <span class="ab-key">Total Pendapatan (Income)</span>
              <span class="ab-val positive">{{ fmt(totalIncome) }}</span>
            </li>
            <li>
              <span class="ab-key">Total Opex (Pengeluaran Ops)</span>
              <span class="ab-val negative">{{ fmt(totalOpex) }}</span>
            </li>
            <li>
              <span class="ab-key">Total Pajak yang Dibayar</span>
              <span class="ab-val negative">{{ fmt(totalTax) }}</span>
            </li>
            <li class="ab-divider"></li>
            <li>
              <span class="ab-key">NCF Operasional Bersih</span>
              <span class="ab-val" :class="ncfOpsColor">{{ fmt(ncfOps) }}</span>
            </li>
            <li>
              <span class="ab-key">NCF Total (Termasuk Investasi)</span>
              <span class="ab-val" :class="totalNcfColor">{{ fmt(totalNcf) }}</span>
            </li>
          </ul>
        </div>

        <!-- Blok: Analisis Indikator -->
        <div class="analysis-block">
          <div class="ab-header">ANALISIS INDIKATOR EKONOMI</div>
          <div class="ab-insight-list">

            <!-- POT -->
            <div class="insight-item" :class="pot !== null ? 'insight-positive' : 'insight-negative'">
              <div class="insight-label">PAY OUT TIME</div>
              <div class="insight-text">{{ potInsight }}</div>
            </div>

            <!-- NPV -->
            <div class="insight-item" :class="npv >= 0 ? 'insight-positive' : 'insight-negative'">
              <div class="insight-label">NPV @ {{ discountRate }}%</div>
              <div class="insight-text">{{ npvInsight }}</div>
            </div>

            <!-- ROR -->
            <div class="insight-item" :class="rorInsightClass">
              <div class="insight-label">RATE OF RETURN</div>
              <div class="insight-text">{{ rorInsight }}</div>
            </div>

            <!-- PIR -->
            <div class="insight-item" :class="pir >= 1 ? 'insight-positive' : 'insight-negative'">
              <div class="insight-label">PIR (LIPAT MODAL)</div>
              <div class="insight-text">{{ pirInsight }}</div>
            </div>

          </div>
        </div>

        <!-- Blok: Faktor Penentu -->
        <div class="analysis-block analysis-block--full">
          <div class="ab-header">FAKTOR UTAMA YANG MENENTUKAN HASIL INI</div>
          <div class="factors-grid">
            <div v-for="f in factors" :key="f.label" class="factor-chip" :class="f.cls">
              <div class="fc-body">
                <div class="fc-label">{{ f.label }}</div>
                <div class="fc-val">{{ f.value }}</div>
                <div class="fc-desc">{{ f.desc }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Blok: Saran / Rekomendasi -->
        <div class="analysis-block analysis-block--full">
          <div class="ab-header">INTERPRETASI &amp; REKOMENDASI</div>
          <div class="reco-list">
            <div v-for="r in recommendations" :key="r.text" class="reco-item" :class="r.cls">
              <span class="reco-text">{{ r.text }}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  tabelNCF:     { type: Array,  default: () => [] },
  indicators:   { type: Object, default: () => ({}) },
  input:        { type: Object, default: () => ({}) },
  discountRate: { type: Number, default: 10 },
})

const isOpen = ref(false)

// ── Aggregasi dari tabelNCF ──────────────────────────────────
const totalInvestasi = computed(() =>
  (props.input.capital || 0) + (props.input.nonCapital || 0)
)
const totalIncome = computed(() =>
  props.tabelNCF.filter(r => r.tahun > 0).reduce((s, r) => s + (r.income || 0), 0)
)
const totalOpex = computed(() =>
  props.tabelNCF.filter(r => r.tahun > 0).reduce((s, r) => s + (r.opex || 0), 0)
)
const totalTax = computed(() =>
  props.tabelNCF.filter(r => r.tahun > 0).reduce((s, r) => s + (r.tax || 0), 0)
)
const ncfOps = computed(() =>
  props.tabelNCF.filter(r => r.tahun > 0).reduce((s, r) => s + r.ncf, 0)
)
const totalNcf = computed(() =>
  props.tabelNCF.reduce((s, r) => s + r.ncf, 0)
)

// shorthand
const pot = computed(() => props.indicators.pot ?? null)
const npv = computed(() => props.indicators.npv ?? 0)
const ror = computed(() => props.indicators.ror ?? null)
const pir = computed(() => props.indicators.pir ?? null)

// ── Helpers ─────────────────────────────────────────────────
function fmt(val) {
  if (val == null) return '—'
  const abs = Math.abs(val).toLocaleString('id-ID', { maximumFractionDigits: 2 })
  return `${val < 0 ? '-' : ''}Rp ${abs}`
}
function rorNum() {
  if (!ror.value || ror.value === '>200%') return null
  return Number(ror.value)
}

// ── Warna ───────────────────────────────────────────────────
const ncfOpsColor   = computed(() => ncfOps.value >= 0  ? 'positive' : 'negative')
const totalNcfColor = computed(() => totalNcf.value >= 0 ? 'positive' : 'negative')
const rorInsightClass = computed(() => {
  const r = rorNum()
  if (r === null) return 'insight-negative'
  return r > props.discountRate ? 'insight-positive' : 'insight-negative'
})

// ── VONIS UTAMA ──────────────────────────────────────────────
const overallClass = computed(() => {
  if (totalNcf.value > 0 && pot.value !== null) return 'verdict-green'
  if (totalNcf.value > 0 && pot.value === null)  return 'verdict-amber'
  return 'verdict-red'
})
const overallBadge = computed(() => overallClass.value === 'verdict-green' ? 'LAYAK' : overallClass.value === 'verdict-amber' ? 'MARGINAL' : 'TIDAK LAYAK')
const overallTitle = computed(() => {
  if (overallClass.value === 'verdict-green')
    return `Proyek ini MENGUNTUNGKAN — modal kembali dalam ${pot.value?.toFixed(1)} tahun.`
  if (overallClass.value === 'verdict-amber')
    return 'Proyek ini secara total positif, namun modal belum balik selama masa kontrak.'
  return 'Proyek ini MERUGI — total pendapatan tidak mampu menutup investasi awal.'
})
const overallSub = computed(() => {
  const inv  = totalInvestasi.value.toLocaleString('id-ID')
  const inc  = totalIncome.value.toLocaleString('id-ID', { maximumFractionDigits: 0 })
  const ncf  = totalNcf.value.toLocaleString('id-ID', { maximumFractionDigits: 0 })
  if (totalNcf.value > 0)
    return `Dari investasi awal Rp ${inv}, proyek menghasilkan total pendapatan Rp ${inc} → NCF bersih Rp ${ncf}.`
  return `Investasi awal Rp ${inv}, namun total pendapatan hanya Rp ${inc} → proyek rugi Rp ${Math.abs(totalNcf.value).toLocaleString('id-ID', {maximumFractionDigits:0})}.`
})

// ── Insight per indikator ────────────────────────────────────
const potInsight = computed(() => {
  if (pot.value === null)
    return 'Modal tidak kembali dalam rentang masa proyek ini. Cumulative NCF tidak pernah menjadi positif.'
  const thn = Math.floor(pot.value)
  const bln = Math.round((pot.value - thn) * 12)
  return `Modal awal kembali pada tahun ke-${thn}${bln > 0 ? ` bulan ke-${bln}` : ''}. ` +
    `Semakin cepat POT, semakin rendah risiko proyek.`
})

const npvInsight = computed(() => {
  const r = props.discountRate
  if (npv.value >= 0)
    return `NPV positif Rp ${Math.abs(npv.value).toLocaleString('id-ID', {maximumFractionDigits:0})} artinya proyek ini menghasilkan nilai lebih tinggi dari investasi alternatif di suku bunga ${r}% per tahun.`
  return `NPV negatif Rp ${Math.abs(npv.value).toLocaleString('id-ID', {maximumFractionDigits:0})} artinya pada suku bunga ${r}%, proyek ini kurang menguntungkan dibanding menaruh uang di instrumen lain. Coba turunkan discount rate.`
})

const rorInsight = computed(() => {
  const r = rorNum()
  if (r === null) return 'ROR tidak terdefinisi — NCF selalu negatif, tidak ada titik impas.'
  if (ror.value === '>200%') return 'ROR sangat tinggi (>200%) — proyek sangat menguntungkan dengan modal kecil relatif terhadap pendapatan.'
  const label = r > props.discountRate
    ? `lebih tinggi dari suku bunga acuan ${props.discountRate}% → proyek ini LEBIH MENGUNTUNGKAN.`
    : `lebih rendah dari suku bunga acuan ${props.discountRate}% → investasi ini KURANG KOMPETITIF.`
  return `ROR ${r.toFixed(2)}% ${label}`
})

const pirInsight = computed(() => {
  if (pir.value === null) return '—'
  if (pir.value >= 1)
    return `Setiap Rp 1 yang diinvestasikan menghasilkan Rp ${pir.value.toFixed(2)} keuntungan bersih — modal berlipat ${pir.value.toFixed(1)}×.`
  return `PIR ${pir.value.toFixed(3)} < 1 artinya modal investasi belum balik secara undiscounted. Total pendapatan operasional tidak menutup besaran investasi awal.`
})

// ── FAKTOR PENENTU ───────────────────────────────────────────
const factors = computed(() => {
  const input = props.input
  const items = []

  // Harga minyak
  const totalProd = props.tabelNCF.filter(r => r.tahun > 0).reduce((s,r) => s + (r.produksi||0), 0)
  const avgHarga  = totalIncome.value / (totalProd || 1)
  items.push({
    label: 'Harga Minyak',
    value: `Rp ${(input.hargaMinyak || 0).toLocaleString('id-ID')}/bbl`,
    desc: `Rata-rata harga realisasi: Rp ${avgHarga.toLocaleString('id-ID', {maximumFractionDigits:1})}/bbl. ` +
      (input.hargaEscalation > 0 ? `Naik ${input.hargaEscalation}%/tahun.` : 'Flat sepanjang proyek.'),
    cls: totalIncome.value > totalInvestasi.value ? 'fc-positive' : 'fc-neutral',
  })

  // Produksi
  items.push({
    label: 'Total Produksi',
    value: `${totalProd.toLocaleString('id-ID', {maximumFractionDigits:1})} Mbbl`,
    desc: input.mulaiDecline
      ? `${input.mulaiDecline - 1} tahun manual, lalu decline ${input.declineRate}%/tahun.`
      : 'Semua tahun diisi manual.',
    cls: 'fc-neutral',
  })

  // Opex
  const opexRatio = totalOpex.value / (totalIncome.value || 1) * 100
  items.push({
    label: 'Beban Opex',
    value: `Rp ${(input.opex || 0).toLocaleString('id-ID')}/tahun`,
    desc: `${opexRatio.toFixed(1)}% dari total pendapatan. ` +
      (input.opexNaikPersen > 0 ? `Naik ${input.opexNaikPersen}% mulai tahun ke-${input.opexNaikMulaiTahun}.` : 'Flat.'),
    cls: opexRatio > 50 ? 'fc-negative' : 'fc-positive',
  })

  // Pajak
  const taxRatio = totalTax.value / (totalIncome.value || 1) * 100
  items.push({
    label: 'Beban Pajak',
    value: `${input.pajakRate || 0}% dari taxable income`,
    desc: `Total pajak dibayar Rp ${totalTax.value.toLocaleString('id-ID', {maximumFractionDigits:0})} (${taxRatio.toFixed(1)}% dari pendapatan bruto).`,
    cls: taxRatio > 30 ? 'fc-negative' : 'fc-neutral',
  })

  // Depresiasi
  const depLabel = { straightLine:'Straight Line', decliningBalance:'Declining Balance', doubleDecliningBalance:'Double Declining', unitOfProduction:'Unit of Production', sumOfTheYear:'Sum of the Year' }
  items.push({
    label: 'Metode Depresiasi',
    value: depLabel[input.metodeDep] || input.metodeDep,
    desc: `Modal Capital Rp ${(input.capital||0).toLocaleString('id-ID')} disusutkan dengan metode ini untuk menekan beban pajak.`,
    cls: 'fc-neutral',
  })

  // Investasi
  items.push({
    label: 'Skala Investasi',
    value: `Rp ${totalInvestasi.value.toLocaleString('id-ID')}`,
    desc: `Capital Rp ${(input.capital||0).toLocaleString('id-ID')} + Non-Capital Rp ${(input.nonCapital||0).toLocaleString('id-ID')}. Semakin besar investasi, semakin lama waktu balik modal.`,
    cls: totalNcf.value > 0 ? 'fc-positive' : 'fc-negative',
  })

  return items
})

// ── REKOMENDASI ──────────────────────────────────────────────
const recommendations = computed(() => {
  const list = []
  const r = rorNum()

  if (totalNcf.value > 0) {
    list.push({ cls: 'reco-positive', text: 'Proyek ini secara undiscounted menguntungkan. NCF total positif artinya uang yang masuk lebih besar dari total pengeluaran dan investasi.' })
  } else {
    list.push({ cls: 'reco-negative', text: 'Proyek ini tidak layak secara finansial dasar. Total pendapatan tidak menutupi investasi + opex + pajak.' })
  }

  if (npv.value < 0 && totalNcf.value > 0) {
    list.push({ cls: 'reco-warning', text: `NPV negatif di discount rate ${props.discountRate}% namun NCF total positif. Coba turunkan discount rate di slider atas untuk menemukan titik kelayakan.` })
  }

  if (r !== null && r < props.discountRate) {
    list.push({ cls: 'reco-warning', text: `ROR (${Number(r).toFixed(1)}%) lebih kecil dari discount rate (${props.discountRate}%). Proyek kurang menarik dibanding investasi di deposito atau obligasi pemerintah.` })
  }

  if (pot.value === null && totalNcf.value > 0) {
    list.push({ cls: 'reco-warning', text: 'Modal tidak kembali dalam masa kontrak meski NCF total positif. Pertimbangkan memperpanjang jangka waktu proyek atau meningkatkan produksi awal.' })
  }

  const opexRatio = totalOpex.value / (totalIncome.value || 1) * 100
  if (opexRatio > 50) {
    list.push({ cls: 'reco-warning', text: `Opex sangat tinggi (${opexRatio.toFixed(0)}% dari income). Efisiensi operasional bisa meningkatkan NCF secara signifikan.` })
  }

  if ((props.input.pajakRate || 0) > 50) {
    list.push({ cls: 'reco-neutral', text: `Tax rate ${props.input.pajakRate}% cukup besar. Pilihan metode depresiasi yang agresif (Double Declining) dapat menekan pajak di tahun-tahun awal dan mempercepat POT.` })
  }

  if (totalNcf.value > 0 && pot.value !== null && pot.value < props.input.jangkaWaktu * 0.4) {
    list.push({ cls: 'reco-positive', text: `POT hanya ${pot.value?.toFixed(1)} tahun dari total ${props.input.jangkaWaktu} tahun proyek — sangat cepat! Sisa waktu operasi merupakan pure profit.` })
  }

  return list
})
</script>

<style scoped>
.analysis-panel-container {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  margin-top: var(--space-4);
}
.toggle-btn {
  font-family: var(--font-display);
  letter-spacing: 0.1em;
  padding: 16px;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-btn);
  margin-bottom: var(--space-4);
}

.analysis-panel {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

/* ══ VONIS BANNER ══ */
.verdict-banner {
  display: flex;
  align-items: center;
  gap: var(--space-5);
  padding: var(--space-5) var(--space-6);
  border-radius: var(--radius-md);
  border: 1.5px solid;
}
.verdict-green { background: rgba(16,185,129,0.08); border-color: var(--positive); }
.verdict-amber { background: rgba(245,158,11,0.08);  border-color: var(--accent-primary); }
.verdict-red   { background: rgba(239,68,68,0.08);   border-color: var(--negative); }

.verdict-body { flex: 1; }
.verdict-title {
  font-family: var(--font-display);
  font-size: 20px;
  letter-spacing: 0.04em;
  color: var(--text-primary);
  margin-bottom: 6px;
}
.verdict-sub {
  font-family: var(--font-ui);
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.5;
}
.verdict-badge {
  font-family: var(--font-display);
  font-size: 28px;
  letter-spacing: 0.1em;
  padding: var(--space-2) var(--space-5);
  border-radius: var(--radius-sm);
  flex-shrink: 0;
}
.verdict-green .verdict-badge { color: var(--positive); background: rgba(16,185,129,0.15); }
.verdict-amber .verdict-badge { color: var(--accent-primary); background: rgba(245,158,11,0.15); }
.verdict-red   .verdict-badge { color: var(--negative); background: rgba(239,68,68,0.15); }

/* ══ GRID ══ */
.analysis-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-5);
}
.analysis-block--full { grid-column: 1 / -1; }

/* ══ BLOCK ══ */
.analysis-block {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: var(--space-5);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}
.ab-header {
  font-family: var(--font-ui);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--text-secondary);
  border-bottom: 1px solid var(--border);
  padding-bottom: var(--space-3);
}

/* ══ LIST KEUANGAN ══ */
.ab-list {
  list-style: none;
  margin: 0; padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.ab-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-family: var(--font-ui);
  font-size: 13px;
}
.ab-key { color: var(--text-secondary); }
.ab-val {
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 700;
  color: var(--text-primary);
}
.ab-val.positive { color: var(--positive); }
.ab-val.negative { color: var(--negative); }
.ab-divider {
  height: 1px;
  background: var(--border);
  padding: 0 !important;
  margin: 4px 0;
}

/* ══ INSIGHT ══ */
.ab-insight-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}
.insight-item {
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-sm);
  border-left: 3px solid;
}
.insight-positive { background: rgba(16,185,129,0.07); border-color: var(--positive); }
.insight-negative { background: rgba(239,68,68,0.07);  border-color: var(--negative); }
.insight-label {
  font-family: var(--font-ui);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.06em;
  margin-bottom: 4px;
  color: var(--text-secondary);
}
.insight-positive .insight-label { color: var(--positive); }
.insight-negative .insight-label { color: var(--negative); }
.insight-text {
  font-family: var(--font-ui);
  font-size: 12px;
  color: var(--text-primary);
  line-height: 1.5;
}

/* ══ FAKTOR ══ */
.factors-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-4);
}
.factor-chip {
  display: flex;
  gap: var(--space-3);
  padding: var(--space-4);
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  transition: border-color var(--transition-fast);
}
.fc-positive { border-color: rgba(16,185,129,0.3); }
.fc-negative { border-color: rgba(239,68,68,0.3); }
.fc-neutral  { border-color: var(--border); }
.fc-body { display: flex; flex-direction: column; gap: 4px; }
.fc-label {
  font-family: var(--font-ui);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: var(--text-muted);
}
.fc-val {
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 700;
  color: var(--text-primary);
}
.fc-desc {
  font-family: var(--font-ui);
  font-size: 11px;
  color: var(--text-secondary);
  line-height: 1.4;
}

/* ══ REKOMENDASI ══ */
.reco-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}
.reco-item {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-sm);
  font-family: var(--font-ui);
  font-size: 13px;
  line-height: 1.55;
  border-left: 3px solid transparent;
}
.reco-positive { background: rgba(16,185,129,0.15); color: #064e3b; border-left-color: var(--positive); }
.reco-negative { background: rgba(239,68,68,0.15);  color: #7f1d1d; border-left-color: var(--negative); }
.reco-warning  { background: rgba(245,158,11,0.15);  color: #78350f; border-left-color: var(--accent-primary); }
.reco-neutral  { background: rgba(148,163,184,0.15); color: #334155; border-left-color: var(--text-muted); }
.reco-text { flex: 1; font-weight: 500; }

@media (max-width: 900px) {
  .analysis-grid { grid-template-columns: 1fr; }
  .factors-grid  { grid-template-columns: 1fr 1fr; }
}
</style>
