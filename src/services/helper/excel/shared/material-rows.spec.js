import { describe, it, expect } from 'vitest'
import { buildMaterialRows } from './material-rows.js'

describe('buildMaterialRows', () => {
  it('คืน [] เมื่อไม่มีรายการ / ไม่มี materials', () => {
    expect(buildMaterialRows(undefined)).toEqual([])
    expect(buildMaterialRows([])).toEqual([])
    expect(buildMaterialRows([{ description: 'x' }, { materials: [] }])).toEqual([])
  })

  it('ใส่น้ำหนักในคอลัมน์ตาม type ที่เหลือเป็น null และ qty ของทองเป็น null', () => {
    const rows = buildMaterialRows([
      {
        description: 'Ring',
        materials: [
          { type: 'Gold', typeCode: '18K', weight: 3.2, qty: 1 },
          { type: 'Diamond', typeCode: 'RD', weight: 0.15, qty: 2 },
          { type: 'Gem', typeCode: 'RUBY', weight: 1.1, qty: 3 }
        ]
      }
    ])
    expect(rows).toHaveLength(3)
    expect(rows[0]).toMatchObject({ no: 1, description: 'Ring', type: 'Gold', code: '18K', qty: null, gold: 3.2, diamond: null, gem: null })
    expect(rows[1]).toMatchObject({ type: 'Diamond', qty: 2, gold: null, diamond: 0.15, gem: null })
    expect(rows[2]).toMatchObject({ type: 'Gem', qty: 3, gold: null, diamond: null, gem: 1.1 })
  })

  it('เลขลำดับ no ตามตำแหน่งรายการ และข้ามรายการที่ไม่มี material', () => {
    const rows = buildMaterialRows([
      { materials: [{ type: 'Gold', weight: 1 }] },
      { description: 'no materials' },
      { materials: [{ type: 'Gold', weight: 2 }, { type: 'Gem', weight: 3 }] }
    ])
    expect(rows.map((r) => r.no)).toEqual([1, 3, 3])
  })

  it('weight ไม่มี/ไม่ใช่ตัวเลข → 0 และ string → Number ดิบ ไม่ปัด', () => {
    const rows = buildMaterialRows([
      {
        materials: [
          { type: 'Gold' },
          { type: 'Diamond', weight: '0.123456', qty: '4' },
          { type: 'Gem', weight: 'abc', qty: '' }
        ]
      }
    ])
    expect(rows[0].gold).toBe(0)
    expect(rows[1].diamond).toBe(0.123456)
    expect(rows[1].qty).toBe(4)
    expect(rows[2].gem).toBe(0)
    expect(rows[2].qty).toBeNull()
  })

  it('ข้าม material ที่ type ไม่รู้จัก', () => {
    expect(buildMaterialRows([{ materials: [{ type: 'Other', weight: 1 }, null] }])).toEqual([])
  })
})
