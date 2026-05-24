/**
 * Dua preset skenario dari dokumen referensi PRD
 * Lapangan RISKI — validasi: Total NCF = $31,989.48M, NPV(r=10%) = $13,129.68M
 */

export const dummyScenarios = [
  {
    nama: 'Lapangan RISKI',
    jangkaWaktu: 10,
    capital: 6500,
    nonCapital: 3000,
    produksiManual: [215, 425, 740, 825, 710, 525, 350, 150, 130, 110],
    mulaiDecline: null,
    declineRate: 0,
    hargaMinyak: 20,
    hargaEscalation: 0,
    opex: 175,
    opexNaikPersen: 0,
    opexNaikMulaiTahun: null,
    metodeDep: 'straightLine',
    reserveTotal: null,
    pajakRate: 52,
  },
  {
    nama: 'Lapangan Gunung Bakaran',
    jangkaWaktu: 10,
    capital: 13000,
    nonCapital: 8000,
    produksiManual: [175, 201, 217, 198],
    mulaiDecline: 5,
    declineRate: 3,
    hargaMinyak: 32,
    hargaEscalation: 0,
    opex: 180,
    opexNaikPersen: 2.5,
    opexNaikMulaiTahun: 4,
    metodeDep: 'straightLine',
    reserveTotal: null,
    pajakRate: 51,
  },
]

export const defaultInput = () => ({
  nama: '',
  jangkaWaktu: 10,
  capital: 13000,
  nonCapital: 8000,
  produksiManual: [175, 201, 217, 198, 0, 0, 0, 0, 0, 0],
  mulaiDecline: 5,
  declineRate: 3,
  hargaMinyak: 32,
  hargaEscalation: 0,
  opex: 180,
  opexNaikPersen: 0,
  opexNaikMulaiTahun: null,
  metodeDep: 'straightLine',
  reserveTotal: null,
  pajakRate: 51,
})
