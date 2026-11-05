import { describe, it, expect } from 'vitest'
import ExcelJS from 'exceljs'
import { buildMaterialRows, writeMaterialsSheet } from './material-rows.js'

describe('buildMaterialRows', () => {
  it('คืน [] เมื่อไม่มีรายการ / ไม่มี materials', () => {
    expect(buildMaterialRows(undefined)).toEqual([])
    expect(buildMaterialRows([])).toEqual([])
    expect(buildMaterialRows([{ description: 'x' }, { materials: [] }])).toEqual([])
  })

  it('1 สินค้า = 1 แถว และชนิดที่ไม่มีเป็น null', () => {
    const rows = buildMaterialRows([
      {
        description: 'Ring',
        materials: [
          { type: 'Gold', typeCode: '18K', weight: 3.2, qty: 1 },
          { type: 'Diamond', typeCode: 'G,VS1', weight: 0.15, qty: 2 }
        ]
      }
    ])
    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({
      no: 1, description: 'Ring',
      goldCode: '18K', gold: 3.2,
      diamondCode: 'G,VS1', diamondQty: 2, diamond: 0.15,
      gemCode: null, gemQty: null, gem: null
    })
  })

  it('รวมหลายชนิดต่อสินค้า และตัด code ซ้ำ', () => {
    const [row] = buildMaterialRows([
      {
        materials: [
          { type: 'Gem', typeCode: 'Emerald', weight: 0.36, qty: 1 },
          { type: 'Gem', typeCode: 'Ruby', weight: 0.1, qty: 1 },
          { type: 'Gem', typeCode: 'Ruby', weight: 0.1, qty: 1 },
          { type: 'Diamond', typeCode: 'G,VS1', weight: 0.1, qty: 1 },
          { type: 'Diamond', typeCode: 'G,SI', weight: 0.2, qty: 2 },
          { type: 'Diamond', typeCode: 'G,VS1', weight: 0.3, qty: 3 },
          { type: 'Gold', typeCode: '18K', weight: 1 },
          { type: 'Gold', typeCode: '14K', weight: 2 }
        ]
      }
    ])
    expect(row.gemCode).toBe('Emerald / Ruby')
    expect(row.gemQty).toBe(3)
    expect(row.gem).toBeCloseTo(0.56, 10)
    expect(row.diamondCode).toBe('G,VS1 / G,SI')
    expect(row.diamondQty).toBe(6)
    expect(row.diamond).toBeCloseTo(0.6, 10)
    expect(row.goldCode).toBe('18K / 14K')
    expect(row.gold).toBe(3)
  })

  it('เลขลำดับ no ตามตำแหน่งรายการ และข้ามรายการที่ไม่มี material', () => {
    const rows = buildMaterialRows([
      { materials: [{ type: 'Gold', weight: 1 }] },
      { description: 'no materials' },
      { materials: [{ type: 'Gold', weight: 2 }, { type: 'Gem', weight: 3 }] }
    ])
    expect(rows.map((r) => r.no)).toEqual([1, 3])
  })

  it('weight ไม่มี/ไม่ใช่ตัวเลข → 0, string → Number ดิบ ไม่ปัด, qty ไม่ใช่เลขข้าม', () => {
    const [row] = buildMaterialRows([
      {
        materials: [
          { type: 'Gold' },
          { type: 'Diamond', weight: '0.123456', qty: '4' },
          { type: 'Gem', weight: 'abc', qty: '' }
        ]
      }
    ])
    expect(row.gold).toBe(0)
    expect(row.diamond).toBe(0.123456)
    expect(row.diamondQty).toBe(4)
    expect(row.gem).toBe(0)
    expect(row.gemQty).toBe(0)
  })

  it('ข้าม material ที่ type ไม่รู้จัก', () => {
    expect(buildMaterialRows([{ materials: [{ type: 'Other', weight: 1 }, null] }])).toEqual([])
  })
})

describe('writeMaterialsSheet', () => {
  it('header 11 คอลัมน์ + numFmt + สูตร SUM ในแถว Total', () => {
    const wb = new ExcelJS.Workbook()
    const ws = writeMaterialsSheet(wb, [
      { description: 'A', materials: [{ type: 'Gold', weight: 1.5 }, { type: 'Gem', typeCode: 'Ruby', weight: 0.2, qty: 2 }] },
      { description: 'B', materials: [{ type: 'Diamond', typeCode: 'G', weight: 0.5, qty: 4 }] }
    ])
    const headers = []
    for (let c = 1; c <= 11; c++) headers.push(ws.getCell(1, c).value)
    expect(headers).toEqual([
      'No.', 'Style/Product', 'Description', 'Gold Code', 'Gold (gms)',
      'Diamond Code', 'Diamond Qty', 'Diamond (cts)', 'Gem Code', 'Gem Qty', 'Gem (cts)'
    ])
    expect(ws.getCell(2, 5).numFmt).toBe('#,##0.000')
    expect(ws.getCell(2, 8).numFmt).toBe('#,##0.000')
    expect(ws.getCell(2, 10).numFmt).toBe('#,##0')
    expect(ws.getCell(2, 7).value).toBeNull()

    expect(ws.getCell(4, 1).value).toBe('Total')
    expect(ws.getCell(4, 5).value).toMatchObject({ formula: 'SUM(E2:E3)', result: 1.5 })
    expect(ws.getCell(4, 7).value).toMatchObject({ formula: 'SUM(G2:G3)', result: 4 })
    expect(ws.getCell(4, 8).value).toMatchObject({ formula: 'SUM(H2:H3)', result: 0.5 })
    expect(ws.getCell(4, 10).value).toMatchObject({ formula: 'SUM(J2:J3)', result: 2 })
    expect(ws.getCell(4, 11).value).toMatchObject({ formula: 'SUM(K2:K3)', result: 0.2 })
    expect(ws.getCell(4, 5).numFmt).toBe('#,##0.000')
    expect(ws.getCell(4, 7).numFmt).toBe('#,##0')
    expect(ws.getCell(4, 4).value).toBeNull()
    expect(ws.autoFilter.to.column).toBe(11)
  })
})
