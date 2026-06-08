import { computeNCF } from './src/composables/useCalculator.js'
import { computeAllIndicators, formatPOT } from './src/composables/useIndicators.js'
import { dummyScenarios } from './src/data/dummyScenarios.js'

const gb = dummyScenarios.find(s => s.key === 'gunung-bakaran')
const totalInv = gb.capital + gb.nonCapital;

const ncfRows = computeNCF(gb)
const indicators = computeAllIndicators(ncfRows, 10, totalInv)
console.log('--- STRAIGHT LINE ---')
console.log('POT:', formatPOT(indicators.pot))
console.log('NPV:', indicators.npv)
console.log('ROR:', indicators.ror)
console.log('PIR:', indicators.pir)
console.log('DPR:', indicators.dpr)

gb.metodeDep = 'doubleDecliningBalance'
const ncfRows2 = computeNCF(gb)
const indicators2 = computeAllIndicators(ncfRows2, 10, totalInv)
console.log('--- DOUBLE DECLINING BALANCE ---')
console.log('POT:', formatPOT(indicators2.pot))
console.log('NPV:', indicators2.npv)
console.log('ROR:', indicators2.ror)
console.log('PIR:', indicators2.pir)
console.log('DPR:', indicators2.dpr)
