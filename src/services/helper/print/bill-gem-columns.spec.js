import { describe, it, expect } from 'vitest'
import { gemKey, listBillGemTypes, defaultColumnFor, splitBillWeights } from './bill-gem-columns.js'

const silver = { type: 'Silver', typeCode: 'SV', typeOrigin: 'Sil', weight: 1.71, weightUnit: 'g.' }
const cz = { type: 'Gem', typeCode: 'Cubic Zirconia', typeOrigin: 'CZ', weight: 0.44, weightUnit: 'ct.' }
const garnet = { type: 'Gem', typeCode: 'Garnet', typeOrigin: 'Garnet', weight: 2.93 }
const gemSilver = { type: 'Gem', typeCode: ' ', typeOrigin: 'Sil', weight: 1.2, weightUnit: 'g.' }
const diamond = { type: 'Diamond', typeCode: 'VS', weight: 0.3 }
const gold = { type: 'Gold', weight: 5 }

describe('splitBillWeights', () => {
  it('empty map keeps legacy behavior', () => {
    const r = splitBillWeights([silver, cz, garnet, diamond, gold], {})
    expect(r.goldWeight).toBeCloseTo(6.71)
    expect(r.stoneWeight).toBeCloseTo(3.37)
    expect(r.diamondWeight).toBeCloseTo(0.3)
  })

  it('CZ to diamond column', () => {
    const r = splitBillWeights([silver, cz, garnet], { [gemKey(cz)]: 'diamond' })
    expect(r.stoneWeight).toBeCloseTo(2.93)
    expect(r.diamondWeight).toBeCloseTo(0.44)
    expect(r.goldWeight).toBeCloseTo(1.71)
  })

  it('none drops weight', () => {
    const r = splitBillWeights([cz, garnet], { 'g:cubic zirconia': 'none' })
    expect(r.stoneWeight).toBeCloseTo(2.93)
    expect(r.diamondWeight).toBe(0)
  })

  it('silver Gem/Sil/g. row stays metal', () => {
    const r = splitBillWeights([gemSilver], {})
    expect(r.goldWeight).toBeCloseTo(1.2)
    expect(r.stoneWeight).toBe(0)
  })
})

describe('listBillGemTypes', () => {
  const items = [
    { qty: 2, materials: [silver, cz, garnet, gemSilver] },
    { qty: 1, materials: [cz, diamond] }
  ]

  it('excludes metal, sorts diamonds first, sums qty and weight', () => {
    const list = listBillGemTypes(items)
    expect(list.map((g) => g.label)).toEqual(['Diamond VS', 'Cubic Zirconia', 'Garnet'])
    const czEntry = list.find((g) => g.key === 'g:cubic zirconia')
    expect(czEntry.pieceCount).toBe(3)
    expect(czEntry.totalWeight).toBeCloseTo(1.32)
    expect(defaultColumnFor(list[0])).toBe('diamond')
    expect(defaultColumnFor(czEntry)).toBe('stone')
  })

  it('blank typeCode falls back to typeOrigin', () => {
    const list = listBillGemTypes([{ qty: 1, materials: [{ type: 'Gem', typeCode: ' ', typeOrigin: 'Ruby', weight: 1 }] }])
    expect(list[0].key).toBe('g:ruby')
    expect(list[0].label).toBe('Ruby')
  })

  it('same name as gem and diamond gets separate keys', () => {
    const list = listBillGemTypes([{ qty: 1, materials: [{ type: 'Gem', typeCode: 'VS', weight: 1 }, diamond] }])
    expect(list.map((g) => g.key).sort()).toEqual(['d:vs', 'g:vs'])
  })

  it('blank name is listed with empty name key', () => {
    const list = listBillGemTypes([{ qty: 1, materials: [{ type: 'Gem', typeCode: ' ', typeOrigin: '', weight: 1 }, { type: 'Diamond', weight: 2 }] }])
    expect(list.map((g) => [g.key, g.label])).toEqual([['d:', 'Diamond'], ['g:', '']])
    expect(splitBillWeights([{ type: 'Gem', weight: 1 }], { 'g:': 'none' }).stoneWeight).toBe(0)
  })
})
