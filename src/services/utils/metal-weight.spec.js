import { describe, it, expect } from 'vitest'
import { getMetalMaterials, sumMetalWeight } from './metal-weight.js'

describe('metal-weight', () => {
  it('Gold อย่างเดียว', () => {
    const m = [{ type: 'Gold', typeCode: 'YG', weight: 3.5 }, { type: 'Diamond', weight: 1 }]
    expect(getMetalMaterials(m)).toHaveLength(1)
    expect(sumMetalWeight(m)).toBe(3.5)
  })
  it('Silver อย่างเดียว', () => {
    const m = [{ type: 'Silver', typeCode: 'SV', weight: 12.25 }, { type: 'Gem', weight: 2 }]
    expect(getMetalMaterials(m)[0].typeCode).toBe('SV')
    expect(sumMetalWeight(m)).toBe(12.25)
  })
  it('ผสม Gold + Silver คงลำดับเดิม', () => {
    const m = [{ type: 'Silver', weight: 1 }, { type: 'Gold', weight: 2 }]
    expect(getMetalMaterials(m).map((x) => x.type)).toEqual(['Silver', 'Gold'])
    expect(sumMetalWeight(m)).toBe(3)
  })
  it('materials ว่าง/undefined/null', () => {
    expect(getMetalMaterials(undefined)).toEqual([])
    expect(getMetalMaterials(null)).toEqual([])
    expect(sumMetalWeight([])).toBe(0)
    expect(sumMetalWeight(undefined)).toBe(0)
  })
  it('weight ไม่เป็นตัวเลข', () => {
    const m = [{ type: 'Gold', weight: 'abc' }, { type: 'Silver', weight: null }, { type: 'Silver', weight: '2.5' }]
    expect(sumMetalWeight(m)).toBe(2.5)
  })
})
