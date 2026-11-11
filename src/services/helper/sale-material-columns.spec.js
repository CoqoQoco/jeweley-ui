import { describe, it, expect } from 'vitest'
import {
  isSilverMetal,
  isCz,
  isSilverItem,
  getDocMaterialMode,
  classifyMaterial,
  getColumnHeaders,
  getMaterialLabel,
  sumMaterialWeights,
  calcNetWeight
} from './sale-material-columns.js'

const silverMat = [
  { type: 'Silver', typeCode: 'SV', qty: 1, weight: 1.82, weightUnit: 'g.' },
  { type: 'Gem', typeCode: 'Cubic Zirconia', qty: 14, weight: 0.41, weightUnit: 'ct.' },
  { type: 'Gem', typeCode: 'Peridot', qty: 1, weight: 1.68, weightUnit: 'ct.' }
]
const legacyMat = [
  { type: 'Gem', typeCode: ' ', typeOrigin: 'Sil', qty: 0, weight: 1.82, weightUnit: 'g.' },
  { type: 'Gem', typeCode: 'Cubic Zirconia', qty: 14, weight: 0.41, weightUnit: 'ct.' },
  { type: 'Gem', typeCode: ' ', typeOrigin: 'Peridot', qty: 1, weight: 1.68, weightUnit: 'ct.' }
]
const goldMat = [
  { type: 'Gold', typeCode: 'YG', weight: 3 },
  { type: 'Diamond', typeCode: 'VS', weight: 0.5 },
  { type: 'Gem', typeCode: 'Cubic Zirconia', weight: 1 }
]

describe('sale-material-columns', () => {
  it('เอกสารเงินล้วน: mode silver, header Silver/CZ, CZ อยู่คอลัมน์ที่สอง', () => {
    const items = [{ stockNumber: 'S1', productionType: 'Silver', materials: silverMat }]
    const mode = getDocMaterialMode(items)
    expect(mode).toBe('silver')
    expect(getColumnHeaders(mode)).toEqual({ metal: 'Silver (gms)', second: 'CZ (cts)' })
    const sums = sumMaterialWeights(silverMat, mode)
    expect(sums.metal).toBeCloseTo(1.82)
    expect(sums.second).toBeCloseTo(0.41)
    expect(sums.gem).toBeCloseTo(1.68)
    expect(calcNetWeight(sums)).toBeCloseTo((0.41 + 1.68) / 5 + 1.82)
  })

  it('เงินเก่า (legacy Gem + typeOrigin Sil) จัดเป็นโลหะ', () => {
    expect(legacyMat.map(isSilverMetal)).toEqual([true, false, false])
    expect(isSilverItem({ materials: legacyMat })).toBe(true)
    const mode = getDocMaterialMode([{ stockNumber: 'S1', materials: legacyMat }])
    expect(mode).toBe('silver')
    expect(legacyMat.map((m) => classifyMaterial(m, mode))).toEqual(['metal', 'second', 'gem'])
    ;['Sil CO', 'Sil (SE)', 'Sil ', 'Sil # 58'].forEach((o) =>
      expect(isSilverMetal({ type: 'Gem', typeOrigin: o, weightUnit: 'g.' })).toBe(true)
    )
    expect(isSilverMetal({ type: 'Gem', typeOrigin: 'Sil', weightUnit: 'ct.' })).toBe(false)
  })

  it('เอกสารผสม: mode gold แต่น้ำหนักเงินยังนับเป็นโลหะ', () => {
    const items = [
      { stockNumber: 'G1', productionType: 'Yellow Gold', materials: goldMat },
      { stockNumber: 'S1', productionType: 'Silver', materials: silverMat }
    ]
    const mode = getDocMaterialMode(items)
    expect(mode).toBe('gold')
    expect(classifyMaterial(silverMat[0], mode)).toBe('metal')
    expect(classifyMaterial(silverMat[1], mode)).toBe('gem')
  })

  it('เอกสารทองล้วน: header เดิม และ CZ อยู่คอลัมน์ Gem', () => {
    const mode = getDocMaterialMode([{ stockNumber: 'G1', productionType: 'Yellow Gold', materials: goldMat }])
    expect(mode).toBe('gold')
    expect(getColumnHeaders(mode)).toEqual({ metal: 'Gold (gms)', second: 'Diamond (cts)' })
    expect(goldMat.map((m) => classifyMaterial(m, mode))).toEqual(['metal', 'second', 'gem'])
    expect(getDocMaterialMode([])).toBe('gold')
  })

  it('isCz', () => {
    expect(isCz({ type: 'Gem', typeCode: ' cubic zirconia ' })).toBe(true)
    expect(isCz({ type: 'GEM', typeCode: ' ', typeOrigin: 'CZ' })).toBe(true)
    expect(isCz({ type: 'Gem', typeCode: 'Peridot' })).toBe(false)
    expect(classifyMaterial({ type: 'Diamond' }, 'silver')).toBe('second')
  })

  it('label fallback', () => {
    expect(getMaterialLabel({ type: 'Gem', typeCode: ' ', typeOrigin: ' Peridot ' })).toBe('Peridot')
    expect(getMaterialLabel({ type: 'Gem', typeCode: 'Ruby', typeOrigin: 'X' })).toBe('Ruby')
    expect(getMaterialLabel({ type: 'Silver', typeCode: '' })).toBe('SV')
    expect(getMaterialLabel({ type: 'Gem', typeCode: ' ' })).toBe('')
  })

  it('เอกสารทอง: type GEM ตัวใหญ่/null/ไม่รู้จัก ไม่เข้าคอลัมน์ใดและไม่นับยอด', () => {
    const mats = [
      ...goldMat,
      { type: 'GEM', typeCode: 'Mix Stone', weight: 9 },
      { type: null, weight: 7 },
      { type: 'Other', weight: 5 }
    ]
    expect(classifyMaterial(mats[3], 'gold')).toBe('other')
    expect(classifyMaterial(mats[4], 'gold')).toBe('other')
    expect(classifyMaterial(mats[5], 'gold')).toBe('other')
    const sums = sumMaterialWeights(mats, 'gold')
    expect(sums).toEqual({ metal: 3, second: 0.5, gem: 1 })
  })

  it('mode: ข้าม placeholder และแถวที่ไม่มี material/productionType', () => {
    const silver = { stockNumber: 'S1', productionType: 'Silver', materials: silverMat }
    expect(getDocMaterialMode([silver, { stockNumber: '', materials: [] }])).toBe('silver')
    expect(getDocMaterialMode([silver, { stockNumber: 'X', materials: [] }])).toBe('silver')
    expect(getDocMaterialMode([{ stockNumber: '', materials: [] }])).toBe('gold')
    expect(getDocMaterialMode([silver, { stockNumber: 'G1', productionType: 'Yellow Gold', materials: goldMat }])).toBe('gold')
  })

  it('label: Gold/Diamond ไม่ fallback ไป typeOrigin', () => {
    expect(getMaterialLabel({ type: 'Gold', typeCode: '', typeOrigin: 'YG' })).toBe('')
    expect(getMaterialLabel({ type: 'Diamond', typeCode: ' ', typeOrigin: 'X' })).toBe('')
  })

  it('silver mode: type GEM ตัวใหญ่ถือเป็น gem, gold mode ยัง strict', () => {
    const m = { type: 'GEM', typeCode: 'Peridot', weight: 1 }
    expect(classifyMaterial(m, 'silver')).toBe('gem')
    expect(classifyMaterial(m, 'gold')).toBe('other')
  })

  it('isSilverItem: มี productionType ให้ตัดสินจากมันอย่างเดียว', () => {
    expect(isSilverItem({ productionType: 'Yellow Gold', materials: silverMat })).toBe(false)
    expect(isSilverItem({ productionType: 'Silver', materials: goldMat })).toBe(true)
    expect(isSilverItem({ productionType: ' ', materials: silverMat })).toBe(true)
  })
})
