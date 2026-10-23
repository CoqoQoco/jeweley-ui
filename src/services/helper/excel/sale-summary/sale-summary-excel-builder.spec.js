import { describe, it, expect } from 'vitest'
import { SaleSummaryExcelBuilder } from './sale-summary-excel-builder.js'

const items = [
  {
    description: '18K RING Diamond',
    qty: 2,
    appraisalPrice: 1000.555,
    discountPercent: 0,
    materials: [
      { type: 'Gold', weight: 3.456 },
      { type: 'Diamond', weight: 0.1234 },
      { type: 'Gem', weight: 0.555 }
    ]
  },
  {
    description: '18K EARRING Diamond',
    qty: 1,
    appraisalPrice: 500,
    discountPercent: 10,
    materials: [{ type: 'Gold', weight: 1.004 }]
  },
  {
    description: '18K RING Ruby',
    qty: 1,
    appraisalPrice: 300.125,
    discountPercent: 0,
    materials: [{ type: 'Gold', weight: 2.001 }]
  }
]

const build = async (opts = {}) => {
  const builder = new SaleSummaryExcelBuilder({ items, ...opts })
  const workbook = await builder.generateExcel()
  return workbook.getWorksheet('SUMMARY')
}

const findRow = (ws, label) => {
  let found = null
  ws.eachRow((row) => {
    if (row.getCell(1).value === label) found = row
  })
  return found
}

describe('SaleSummaryExcelBuilder numeric cells', () => {
  it('group rows write numbers with correct numFmt', async () => {
    const ws = await build()
    const ring = findRow(ws, 'RING')
    expect(ring).not.toBeNull()
    const expectedFmt = [null, '#,##0', '#,##0.000', '#,##0.00', '#,##0.00', '#,##0.000', '#,##0.00']
    for (let c = 2; c <= 7; c++) {
      const cell = ring.getCell(c)
      expect(typeof cell.value).toBe('number')
      expect(cell.numFmt).toBe(expectedFmt[c - 1])
    }
    expect(ring.getCell(2).value).toBe(3)
    expect(ring.getCell(3).value).toBe(0.123)
    expect(ring.getCell(4).value).toBe(0.56)
    expect(ring.getCell(5).value).toBe(5.46)
    expect(ring.getCell(7).value).toBe(2301.23)
  })

  it('divisor applies and amount stays rounded to 2 dp', async () => {
    const ws = await build({ divisor: 33 })
    const earring = findRow(ws, 'EARRING')
    expect(earring.getCell(7).value).toBe(13.64)
  })

  it('grand total uses SUM formulas with precomputed result', async () => {
    const ws = await build()
    const total = findRow(ws, 'GRAND TOTAL')
    const first = findRow(ws, 'EARRING').number
    const last = findRow(ws, 'RING').number
    const cols = ['B', 'C', 'D', 'E', 'F', 'G']
    cols.forEach((col, i) => {
      const cell = total.getCell(i + 2)
      expect(cell.value.formula).toBe(`SUM(${col}${first}:${col}${last})`)
      expect(typeof cell.value.result).toBe('number')
    })
    expect(total.getCell(2).value.result).toBe(4)
    expect(total.getCell(3).numFmt).toBe('#,##0.000')
    expect(total.getCell(7).numFmt).toBe('#,##0.00')
    expect(total.getCell(7).value.result).toBe(2751.23)
  })

  it('no items: total row has plain numbers (no formula over empty range)', async () => {
    const ws = await build({ items: [] })
    const total = findRow(ws, 'GRAND TOTAL')
    expect(total.getCell(2).value).toBe(0)
    expect(total.getCell(7).value).toBe(0)
  })
})
