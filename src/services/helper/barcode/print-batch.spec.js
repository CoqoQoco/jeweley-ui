import { describe, it, expect } from 'vitest'
import {
  MAX_PASTE_CODES,
  parseCodeList,
  runWithConcurrency,
  buildRowKey,
  normalizeCopies,
  mergeRowsByKey,
  summarizeSelection,
  sumCostLines,
  resolveLabelPrice,
  isCostLabelType,
  expandIndexesByCopies,
  collectFailedFormIndexes,
  escapeHtml,
  formatCodeListForDialog,
  normalizeCode,
  pickExactMatches,
  pickAutoSelection,
  buildUnitMarks,
  expandFormByUnitMarks
} from './print-batch.js'

describe('parseCodeList', () => {
  it('แยกด้วยบรรทัดใหม่ / คอมมา / เว้นวรรค, trim, ตัดค่าว่าง', () => {
    const { codes } = parseCodeList(' A1, B2\nC3  \r\n\n D4 ,,')
    expect(codes).toEqual(['A1', 'B2', 'C3', 'D4'])
  })

  it('dedupe คงลำดับแรกสุด', () => {
    expect(parseCodeList('A\nB\nA\nC\nB').codes).toEqual(['A', 'B', 'C'])
  })

  it('dedupe ไม่สนขีด/ตัวพิมพ์ (DK-20G-123 กับ DK20G123 คือชิ้นเดียวกัน)', () => {
    expect(parseCodeList('DK-20G-123\nDK20G123\ndk20g123\nDK20G124').codes).toEqual(['DK-20G-123', 'DK20G124'])
  })

  it('ตัดที่ cap และบอก truncated + total จริง', () => {
    const text = Array.from({ length: MAX_PASTE_CODES + 5 }, (_, i) => `C${i}`).join('\n')
    const res = parseCodeList(text)
    expect(res.codes).toHaveLength(MAX_PASTE_CODES)
    expect(res.truncated).toBe(true)
    expect(res.total).toBe(MAX_PASTE_CODES + 5)
  })

  it('ข้อความว่าง/null → ไม่มีรหัส', () => {
    expect(parseCodeList('').codes).toEqual([])
    expect(parseCodeList(null).codes).toEqual([])
    expect(parseCodeList('   ').truncated).toBe(false)
  })
})

describe('runWithConcurrency', () => {
  it('ไม่เกิน limit พร้อมกัน และคืนผลตามลำดับ items', async () => {
    let running = 0
    let peak = 0
    const results = await runWithConcurrency([1, 2, 3, 4, 5, 6, 7], 3, async (n) => {
      running++
      peak = Math.max(peak, running)
      await new Promise((resolve) => setTimeout(resolve, 5 * (8 - n)))
      running--
      return n * 10
    })

    expect(peak).toBe(3)
    expect(results.map((r) => r.value)).toEqual([10, 20, 30, 40, 50, 60, 70])
    expect(results.every((r) => r.status === 'fulfilled')).toBe(true)
  })

  it('worker โยน error → rejected เฉพาะตัวนั้น ไม่ทำให้ตัวอื่นหยุด', async () => {
    const results = await runWithConcurrency(['a', 'b', 'c'], 2, async (x) => {
      if (x === 'b') throw new Error('boom')
      return x
    })
    expect(results[0]).toEqual({ status: 'fulfilled', value: 'a' })
    expect(results[1].status).toBe('rejected')
    expect(results[1].reason.message).toBe('boom')
    expect(results[2]).toEqual({ status: 'fulfilled', value: 'c' })
  })

  it('รายการว่าง → อาร์เรย์ว่าง, limit ผิดปกติ → ทำทีละตัว', async () => {
    expect(await runWithConcurrency([], 5, async () => 1)).toEqual([])
    const res = await runWithConcurrency([1, 2], 0, async (n) => n)
    expect(res.map((r) => r.value)).toEqual([1, 2])
  })
})

describe('rowKey / copies / selection', () => {
  it('buildRowKey ใช้ stockNumber|productCode', () => {
    expect(buildRowKey({ stockNumber: 'DK1', productCode: 'P1' })).toBe('DK1|P1')
    expect(buildRowKey({ stockNumber: 'DK1' })).toBe('DK1|')
  })

  it('normalizeCopies: ค่าผิด → 1, ปัดลง, ไม่เกิน max', () => {
    expect(normalizeCopies(undefined)).toBe(1)
    expect(normalizeCopies('abc')).toBe(1)
    expect(normalizeCopies(0)).toBe(1)
    expect(normalizeCopies(-3)).toBe(1)
    expect(normalizeCopies(2.9)).toBe(2)
    expect(normalizeCopies(500, 99)).toBe(99)
  })

  it('mergeRowsByKey ไม่เพิ่ม rowKey ซ้ำ', () => {
    const merged = mergeRowsByKey([{ rowKey: 'a' }], [{ rowKey: 'a' }, { rowKey: 'b' }, { rowKey: 'b' }])
    expect(merged.map((r) => r.rowKey)).toEqual(['a', 'b'])
  })

  it('summarizeSelection รวมจำนวนใบ', () => {
    expect(summarizeSelection([{ printCount: 2 }, { printCount: 1 }, { printCount: 'x' }])).toEqual({
      count: 3,
      labels: 4
    })
    expect(summarizeSelection(null)).toEqual({ count: 0, labels: 0 })
  })
})

describe('sumCostLines / resolveLabelPrice', () => {
  const lines = [
    { nameGroup: 'Gold', totalPrice: 1000 },
    { nameGroup: 'Worker', totalPrice: 200 },
    { nameGroup: 'Gem', totalPrice: 50 },
    { nameGroup: 'Etc', totalPrice: null }
  ]

  it('price = ไม่รวม Gold, originPrice = รวมทั้งหมด', () => {
    expect(sumCostLines(lines)).toEqual({ hasCost: true, price: 250, originPrice: 1250 })
  })

  it('ไม่มีรายการต้นทุน → hasCost false', () => {
    expect(sumCostLines([])).toEqual({ hasCost: false, price: null, originPrice: null })
    expect(sumCostLines(undefined).hasCost).toBe(false)
  })

  it('เลือกราคาตามแท็บ + คูณตัวคูณเฉพาะแท็บ tag', () => {
    const cost = { price: 250, originPrice: 1250 }
    expect(resolveLabelPrice('cost-with-gold', cost, 2)).toBe(1250)
    expect(resolveLabelPrice('cost-no-gold', cost, 2)).toBe(250)
    expect(resolveLabelPrice('tag-with-gold', cost, 2)).toBe(2500)
    expect(resolveLabelPrice('tag-no-gold', cost, 2)).toBe(500)
  })

  it('ตัวคูณว่าง/0 → 1, ราคา 0/ว่าง → null, แท็บอื่น → null', () => {
    expect(resolveLabelPrice('tag-with-gold', { price: 1, originPrice: 100 }, 0)).toBe(100)
    expect(resolveLabelPrice('tag-no-gold', { price: 0, originPrice: 100 }, 3)).toBeNull()
    expect(resolveLabelPrice('cost-with-gold', {}, 1)).toBeNull()
    expect(resolveLabelPrice('original', { price: 1, originPrice: 2 }, 1)).toBeNull()
    expect(resolveLabelPrice('original-qr', { price: 1, originPrice: 2 }, 1)).toBeNull()
  })

  it('isCostLabelType', () => {
    expect(isCostLabelType('tag-no-gold')).toBe(true)
    expect(isCostLabelType('original')).toBe(false)
    expect(isCostLabelType('original-qr')).toBe(false)
  })
})

describe('expandIndexesByCopies / collectFailedFormIndexes', () => {
  it('print ว่าง/ไม่กำหนด → 1 ใบต่อ form (พฤติกรรมเดิม)', () => {
    expect(expandIndexesByCopies([{}, { barcodeType: 'x' }, { print: undefined }])).toEqual([0, 1, 2])
  })

  it('ขยายตาม print และคงลำดับ', () => {
    expect(expandIndexesByCopies([{ print: 2 }, {}, { print: 3 }])).toEqual([0, 0, 1, 2, 2, 2])
  })

  it('print ผิดปกติ (0, ติดลบ, ไม่ใช่เลข) → 1 ใบ', () => {
    expect(expandIndexesByCopies([{ print: 0 }, { print: -1 }, { print: 'a' }])).toEqual([0, 1, 2])
  })

  it('อาร์เรย์ว่าง/null → ว่าง', () => {
    expect(expandIndexesByCopies([])).toEqual([])
    expect(expandIndexesByCopies(null)).toEqual([])
  })

  it('failedIndexes map กลับเป็น form ต้นทาง ไม่ซ้ำ เรียงลำดับ', () => {
    const source = expandIndexesByCopies([{ print: 2 }, {}, { print: 3 }])
    expect(collectFailedFormIndexes(source, [1, 0, 5])).toEqual([0, 2])
    expect(collectFailedFormIndexes(source, [])).toEqual([])
  })
})

describe('dialog helpers', () => {
  it('escapeHtml กัน < > &', () => {
    expect(escapeHtml('<b>&x</b>')).toBe('&lt;b&gt;&amp;x&lt;/b&gt;')
    expect(escapeHtml(null)).toBe('')
  })

  it('formatCodeListForDialog ตัดที่ maxShown แล้วต่อท้าย +N', () => {
    expect(formatCodeListForDialog(['A', 'B'], 3)).toBe('A, B')
    expect(formatCodeListForDialog(['A', 'B', 'C', 'D'], 2)).toBe('A, B +2')
    expect(formatCodeListForDialog(undefined)).toBe('')
  })
})

describe('normalizeCode / pickExactMatches', () => {
  it('normalizeCode ตัดขีด ช่องว่างหัวท้าย และเป็นตัวใหญ่', () => {
    expect(normalizeCode(' dk-20h015 ')).toBe('DK20H015')
    expect(normalizeCode(null)).toBe('')
  })

  it('เลือกเฉพาะแถวที่รหัสตรงเป๊ะ ไม่เอาแถวที่รหัสเป็นส่วนหนึ่ง (Contains)', () => {
    const rows = [
      { stockNumberOrigin: 'A02115', id: 1 },
      { stockNumberOrigin: 'A0211', id: 2 },
      { stockNumberOrigin: 'a0211', id: 3 }
    ]
    expect(pickExactMatches(rows, 'A0211', 'stockNumberOrigin').map((r) => r.id)).toEqual([2, 3])
  })

  it('ไม่สนขีดของ stockNumber และรหัสว่าง → ไม่เจอ', () => {
    const rows = [{ stockNumber: 'DK-20H-015' }]
    expect(pickExactMatches(rows, 'dk20h015', 'stockNumber')).toHaveLength(1)
    expect(pickExactMatches(rows, '', 'stockNumber')).toEqual([])
    expect(pickExactMatches(undefined, 'x', 'stockNumber')).toEqual([])
  })
})

describe('pickAutoSelection', () => {
  it('รวมจำนวนใบ <= limit → เลือกทุกแถว', () => {
    const rows = [{ printCount: 100 }, { printCount: 100 }]
    expect(pickAutoSelection(rows, 200)).toHaveLength(2)
  })

  it('รวมจำนวนใบ > limit → ไม่เลือกเลย (นับใบ ไม่ใช่นับแถว)', () => {
    const rows = [{ printCount: 150 }, { printCount: 51 }]
    expect(pickAutoSelection(rows, 200)).toEqual([])
  })

  it('แถวมาก แต่ใบรวมไม่เกิน → เลือกทั้งหมด', () => {
    const rows = Array.from({ length: 200 }, () => ({ printCount: 1 }))
    expect(pickAutoSelection(rows)).toHaveLength(200)
  })

  it('ว่าง/null → ว่าง', () => {
    expect(pickAutoSelection([])).toEqual([])
    expect(pickAutoSelection(null)).toEqual([])
  })
})

describe('buildUnitMarks / expandFormByUnitMarks', () => {
  const units = [
    { unitNo: 3, status: 'IN_STOCK' },
    { unitNo: 1, status: 'SOLD' },
    { unitNo: 2, status: 'RESERVED' },
    { unitNo: 4, status: 'IN_STOCK' }
  ]

  it('ข้ามชิ้นที่ขายแล้ว เรียงตามเลขชิ้น และใช้ lotQty เป็นตัวหาร', () => {
    expect(buildUnitMarks(units, 6, 3)).toEqual(['2/6', '3/6', '4/6'])
  })

  it('ชิ้นไม่พอ → ใบที่เหลือเป็นค่าว่าง', () => {
    expect(buildUnitMarks(units, 6, 5)).toEqual(['2/6', '3/6', '4/6', '', ''])
    expect(buildUnitMarks([], 0, 2)).toEqual(['', ''])
    expect(buildUnitMarks(null, 0, 1)).toEqual([''])
  })

  it('lotQty ไม่มี → ใช้จำนวนชิ้นที่มี', () => {
    expect(buildUnitMarks(units, 0, 1)).toEqual(['2/3'])
  })

  it('expandFormByUnitMarks: 1 ใบต่อชิ้นที่มีเลข + รวมใบไม่มีเลขเป็น form เดียว', () => {
    const { forms, unmarked } = expandFormByUnitMarks({ a: 1, print: 4 }, ['1/4', '2/4', '', ''])
    expect(forms).toEqual([
      { a: 1, print: 1, unitMark: '1/4' },
      { a: 1, print: 1, unitMark: '2/4' },
      { a: 1, print: 2 }
    ])
    expect(unmarked).toBe(2)
    expect(forms.reduce((n, f) => n + f.print, 0)).toBe(4)
  })
})
