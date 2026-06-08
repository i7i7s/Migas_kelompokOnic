/**
 * Preset skenario dari dokumen referensi PRD
 * produksiAktual = data nyata yang sudah diketahui
 * declineRate    = % penurunan per tahun untuk prediksi
 * jangkaWaktu    = total durasi proyek (aktual + prediksi)
 */

export const dummyScenarios = [
  {
    key: 'gunung-bakaran',
    label: '⛰️ GUNUNG BAKARAN',
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
]

export const defaultInput = () => ({
  nama: '',
  jangkaWaktu: null,
  capital: null,
  nonCapital: null,
  produksiAktual: [],   // kosong — user isi sendiri
  declineRate: null,
  hargaMinyak: null,
  hargaEscalation: 0,
  opex: null,
  opexNaikPersen: 0,
  opexNaikMulaiTahun: null,
  metodeDep: 'straightLine',
  reserveTotal: null,
  pajakRate: null,
})
