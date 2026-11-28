import { describe, it, expect } from 'vitest'

import {
  RETURN_MODE,
  findDuplicateGemCodes,
  isDuplicateRow,
  countRows,
  pickReturnsForHeader,
  validateGemReturn,
  previewRemaining,
  buildReturnBody,
  findInboundForPlan
} from './gem-return-helpers.js'

const base = {
  mode: RETURN_MODE.NOW,
  rowQty: 6,
  rowWeight: 0.16,
  qty: 6,
  weight: 0.16,
  link: null,
  reason: 'DUPLICATE',
  remark: ''
}

describe('findDuplicateGemCodes / isDuplicateRow', () => {
  const rows = [
    { code: 'SD0109', outboundRunning: 'PIO1' },
    { code: 'SD0109', outboundRunning: 'PIO2' },
    { code: 'SI1', outboundRunning: 'PIO3' },
    { code: 'SI1', outboundRunning: 'PIO3' },
    { code: 'X', outboundRunning: null },
    { code: 'X', outboundRunning: 'PIO9' }
  ]

  it('นับเฉพาะรหัสที่มีเลขเบิกต่างกันมากกว่า 1 ใบ', () => {
    const dup = findDuplicateGemCodes(rows)
    expect([...dup]).toEqual(['SD0109'])
  })

  it('เลขเบิกเดียวกันซ้ำหลายแถว ไม่ใช่เบิกซ้ำ', () => {
    expect(findDuplicateGemCodes(rows).has('SI1')).toBe(false)
  })

  it('แถวไม่มีเลขเบิกไม่ถูกนับ', () => {
    const dup = findDuplicateGemCodes(rows)
    expect(isDuplicateRow({ code: 'SD0109', outboundRunning: 'PIO1' }, dup)).toBe(true)
    expect(isDuplicateRow({ code: 'SD0109', outboundRunning: null }, dup)).toBe(false)
  })

  it('ข้อมูลว่าง', () => {
    expect(findDuplicateGemCodes(undefined).size).toBe(0)
  })
})

describe('countRows', () => {
  it('นับแถว ไม่ใช่รวมจำนวนเม็ด', () => {
    expect(countRows([{ qty: 6 }, { qty: 4 }, { qty: 6 }])).toBe(3)
    expect(countRows(undefined)).toBe(0)
  })
})

describe('pickReturnsForHeader', () => {
  it('มี headerId: กรองตาม headerId เท่านั้น', () => {
    const returns = [{ headerId: 9, itemNo: 'A' }, { headerId: 8, itemNo: 'A' }]
    expect(pickReturnsForHeader(returns, 9, [], [], true)).toEqual([{ headerId: 9, itemNo: 'A' }])
  })
  it('headerId เป็น null: ตาม itemNo ของ header ตัวเอง', () => {
    const returns = [{ headerId: null, itemNo: 'A' }, { itemNo: 'B' }, { itemNo: 'Z' }]
    expect(pickReturnsForHeader(returns, 9, [{ itemNo: 'A' }], [{ itemNo: 'B' }], false)).toEqual([{ headerId: null, itemNo: 'A' }])
  })
  it('headerId เป็น null + includeOrphans รวมแถวที่ไม่ตรง header ไหนเลย', () => {
    const returns = [{ itemNo: 'A' }, { itemNo: 'B' }, { itemNo: 'Z' }]
    expect(pickReturnsForHeader(returns, 9, [{ itemNo: 'A' }], [{ itemNo: 'B' }], true)).toEqual([{ itemNo: 'A' }, { itemNo: 'Z' }])
  })
})

describe('validateGemReturn', () => {
  it('คืนครบทั้งคู่ ผ่าน', () => {
    expect(validateGemReturn(base).valid).toBe(true)
  })

  it('ไม่เลือก mode ไม่ผ่าน', () => {
    expect(validateGemReturn({ ...base, mode: null }).errors.mode).toBe('required')
  })

  it('LINK ต้องเลือกใบรับคืน', () => {
    const r = validateGemReturn({ ...base, mode: RETURN_MODE.LINK })
    expect(r.errors.link).toBe('required')
    expect(r.valid).toBe(false)
  })

  it('LINK จำกัดไม่เกินที่เหลือในใบรับคืน', () => {
    const link = { transectionId: 1, remainQty: 4, remainWeight: 0.1 }
    const r = validateGemReturn({ ...base, mode: RETURN_MODE.LINK, link })
    expect(r.errors.qty).toBe('overLink')
    expect(r.errors.weight).toBe('overLink')
  })

  it('เกินจำนวนในใบงาน', () => {
    expect(validateGemReturn({ ...base, qty: 7 }).errors.qty).toBe('overRow')
    expect(validateGemReturn({ ...base, weight: 0.2 }).errors.weight).toBe('overRow')
  })

  it('ติดลบหรือไม่ใช่ตัวเลขไม่ผ่าน', () => {
    expect(validateGemReturn({ ...base, qty: -1 }).errors.qty).toBe('invalid')
    expect(validateGemReturn({ ...base, qty: '' }).errors.qty).toBe('invalid')
    expect(validateGemReturn({ ...base, weight: 'abc' }).errors.weight).toBe('invalid')
  })

  it('ศูนย์ทั้งคู่ไม่ผ่าน', () => {
    expect(validateGemReturn({ ...base, qty: 0, weight: 0 }).errors.qty).toBe('bothZero')
  })

  it('คืนบางส่วนทั้งคู่ผ่าน', () => {
    expect(validateGemReturn({ ...base, qty: 2, weight: 0.05 }).valid).toBe(true)
  })

  it('ครบฝั่งเดียว อีกฝั่งบางส่วน ไม่ผ่าน (pair)', () => {
    expect(validateGemReturn({ ...base, qty: 6, weight: 0.05 }).errors.pair).toBe('pair')
    expect(validateGemReturn({ ...base, qty: 2, weight: 0.16 }).errors.pair).toBe('pair')
  })

  it('น้ำหนักเดิมเป็น 0 ไม่นำมิตินั้นมาคิดกฎ pair', () => {
    expect(validateGemReturn({ ...base, rowWeight: 0, qty: 2, weight: 0 }).valid).toBe(true)
    expect(validateGemReturn({ ...base, rowQty: null, qty: 0, weight: 0.05 }).valid).toBe(true)
  })

  it('ทศนิยมลอยตัวเทียบเท่าค่าเต็ม', () => {
    expect(validateGemReturn({ ...base, qty: '6.000', weight: '0.160' }).valid).toBe(true)
  })

  it('ต้องมีเหตุผล และ OTHER ต้องมีหมายเหตุ', () => {
    expect(validateGemReturn({ ...base, reason: null }).errors.reason).toBe('required')
    expect(validateGemReturn({ ...base, reason: 'OTHER', remark: '  ' }).errors.remark).toBe('required')
    expect(validateGemReturn({ ...base, reason: 'OTHER', remark: 'พลอยหาย' }).valid).toBe(true)
  })
})

describe('previewRemaining', () => {
  it('คืนครบ = ออกทั้งแถว', () => {
    expect(previewRemaining({ rowQty: 6, rowWeight: 0.16, qty: 6, weight: 0.16 }).isFull).toBe(true)
  })
  it('คืนบางส่วน = เหลือ', () => {
    const r = previewRemaining({ rowQty: 6, rowWeight: 0.16, qty: 2, weight: 0.05 })
    expect(r).toEqual({ remainQty: 4, remainWeight: 0.11, isFull: false })
  })
})

describe('buildReturnBody', () => {
  const row = { productionPlanId: 11800, itemNo: '3', qty: 6, weight: 0.16 }
  it('RETURN_NOW ไม่ส่ง inboundTransectionId', () => {
    const body = buildReturnBody({ row, mode: RETURN_MODE.NOW, qty: '6', weight: '0.16', reason: 'OVER', remark: ' ', requestDate: 'D' })
    expect(body).toEqual({
      productionPlanId: 11800,
      itemNo: '3',
      mode: 'RETURN_NOW',
      returnQty: 6,
      returnWeight: 0.16,
      expectedQty: 6,
      expectedWeight: 0.16,
      reason: 'OVER',
      remark: null,
      requestDate: 'D'
    })
  })
  it('LINK_EXISTING ส่ง inboundTransectionId', () => {
    const body = buildReturnBody({
      row,
      mode: RETURN_MODE.LINK,
      qty: 6,
      weight: 0.16,
      link: { transectionId: 77 },
      reason: 'OTHER',
      remark: 'x',
      requestDate: 'D'
    })
    expect(body.inboundTransectionId).toBe(77)
    expect(body.remark).toBe('x')
  })
})

describe('findInboundForPlan', () => {
  const lines = [
    { running: 'A', jobOrPo: '6911008-13' },
    { running: 'B', jobOrPo: 'ตัดซ้ำ 6911008 / 13' },
    { running: 'C', jobOrPo: '6911008-130' },
    { running: 'D', jobOrPo: null }
  ]
  it('จับคู่ - และ / ไม่สนช่องว่าง', () => {
    expect(findInboundForPlan(lines, '6911008', '13').map((l) => l.running)).toEqual(['A', 'B'])
  })
  it('ไม่มี wo = ว่าง', () => {
    expect(findInboundForPlan(lines, '', '13')).toEqual([])
  })
})
