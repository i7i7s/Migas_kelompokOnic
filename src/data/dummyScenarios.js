/**
 * Preset skenario dari dokumen referensi PRD
 * produksiAktual = data nyata yang sudah diketahui
 * declineRate    = % penurunan per tahun untuk prediksi
 * jangkaWaktu    = total durasi proyek (aktual + prediksi)
 */

export const dummyScenarios = [
  {
    key: 'riski',
    label: '🟢 LAPANGAN RISKI',
    type: 'untung',
    nama: 'Lapangan RISKI',
    jangkaWaktu: 10,
    capital: 97500000,
    nonCapital: 45000000,
    // Data aktual 5 tahun pertama
    produksiAktual: [215, 425, 740, 825, 710],
    declineRate: 20,   // prediksi tahun 6-10
    hargaMinyak: 300000,
    hargaEscalation: 0,
    opex: 2625000,
    opexNaikPersen: 0,
    opexNaikMulaiTahun: null,
    metodeDep: 'straightLine',
    reserveTotal: null,
    pajakRate: 52,
  },
  {
    key: 'gunung-bakaran',
    label: '📊 GUNUNG BAKARAN',
    type: 'hybrid',
    nama: 'Lapangan Gunung Bakaran',
    jangkaWaktu: 20,
    capital: 195000000,
    nonCapital: 120000000,
    // Data aktual 7 tahun pertama (tahun 8-20 prediksi decline)
    produksiAktual: [175, 201, 217, 198, 185, 172, 160],
    declineRate: 3,
    hargaMinyak: 480000,
    hargaEscalation: 0,
    opex: 2700000,
    opexNaikPersen: 2.5,
    opexNaikMulaiTahun: 4,
    metodeDep: 'straightLine',
    reserveTotal: null,
    pajakRate: 51,
  },
  {
    key: 'rugi',
    label: '🔴 SKENARIO RUGI',
    type: 'rugi',
    nama: 'Skenario Rugi — Investasi Tidak Balik Modal',
    jangkaWaktu: 10,
    capital: 300000000,
    nonCapital: 180000000,
    // Data aktual 3 tahun
    produksiAktual: [40, 60, 80],
    declineRate: 20,   // prediksi tahun 4-10
    hargaMinyak: 150000,
    hargaEscalation: 0,
    opex: 5250000,
    opexNaikPersen: 0,
    opexNaikMulaiTahun: null,
    metodeDep: 'straightLine',
    reserveTotal: null,
    pajakRate: 52,
  },
]

export const defaultInput = () => ({
  nama: '',
  jangkaWaktu: 10,
  capital: 195000000,
  nonCapital: 120000000,
  produksiAktual: [175, 201, 217, 198],   // 4 tahun data aktual
  declineRate: 3,
  hargaMinyak: 480000,
  hargaEscalation: 0,
  opex: 2700000,
  opexNaikPersen: 0,
  opexNaikMulaiTahun: null,
  metodeDep: 'straightLine',
  reserveTotal: null,
  pajakRate: 51,
})
