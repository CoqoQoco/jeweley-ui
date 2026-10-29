import { describe, it, expect } from 'vitest'
import { formatUnit, freeUnits, taggedUnits, resolveChosenUnitId } from './rfid-bind-helpers.js'

const units = [
  { unitId: 1, unitNo: 1, status: 'IN_STOCK', epc: 'AA' },
  { unitId: 2, unitNo: 2, status: 'IN_STOCK', epc: null },
  { unitId: 3, unitNo: 3, status: 'SOLD', epc: null },
  { unitId: 4, unitNo: 4, status: 'RESERVED', epc: null }
]

describe('rfid-bind-helpers', () => {
  it('formatUnit', () => {
    expect(formatUnit(3, 6)).toBe('3/6')
    expect(formatUnit(3, 0)).toBe('3')
    expect(formatUnit(null, 6)).toBe('')
  })

  it('freeUnits ตัดชิ้นที่มีแท็กและชิ้นที่ขายแล้ว', () => {
    expect(freeUnits(units).map((u) => u.unitId)).toEqual([2, 4])
    expect(freeUnits(null)).toEqual([])
  })

  it('taggedUnits', () => {
    expect(taggedUnits(units).map((u) => u.unitId)).toEqual([1])
  })

  it('resolveChosenUnitId: ใช้ได้เฉพาะชิ้นว่าง ไม่งั้น null (auto)', () => {
    expect(resolveChosenUnitId(units, 2)).toBe(2)
    expect(resolveChosenUnitId(units, 1)).toBeNull()
    expect(resolveChosenUnitId(units, 3)).toBeNull()
    expect(resolveChosenUnitId(units, null)).toBeNull()
  })
})
