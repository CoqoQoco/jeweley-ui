import { describe, it, expect } from 'vitest'
import { resolvePieceGoldStamp, resolveBatchReference, formatStampDisplay, isPriceOutOfRange } from './gold-stamp.js'

const now = new Date(2026, 10, 17, 10, 0, 0)

describe('resolvePieceGoldStamp', () => {
  it('ราคาต่อกรัม (ร้านคีย์) ใช้ตรง ๆ + วันที่จาก updateDate เวลาไทย', () => {
    const r = resolvePieceGoldStamp([{ type: 'Gold', weight: 1.34, price: 4000, updateDate: '2026-11-10T18:00:00Z' }], '', now)
    expect(r.source).toBe('material')
    expect(r.pricePerGram).toBe(4000)
    expect(r.stamp).toBe('004020261111')
  })

  it('ราคาเป็นยอดรวมแถว (ย้ายระบบ) หารน้ำหนัก', () => {
    const r = resolvePieceGoldStamp([{ type: 'gold', weight: 2.06, price: 8240, updateDate: null }], '', now)
    expect(r.pricePerGram).toBeCloseTo(4000)
    expect(r.stamp).toBe('004020261117')
  })

  it('ไม่มี updateDate ใช้วันที่ now', () => {
    const r = resolvePieceGoldStamp([{ type: 'GOLD', weight: 1, price: 3850 }], '', now)
    expect(r.date).toBe(now)
    expect(r.stamp).toBe('003820261117')
  })

  it('ไม่มีราคาทอง → ใช้ราคาสำรอง', () => {
    const r = resolvePieceGoldStamp([{ type: 'Gem', weight: 1, price: 500 }, { type: 'Gold', weight: 1, price: 0 }], '3900', now)
    expect(r.source).toBe('fallback')
    expect(r.stamp).toBe('003920261117')
  })

  it('ราคารวมแต่ไม่มีน้ำหนัก → ใช้สำรอง', () => {
    expect(resolvePieceGoldStamp([{ type: 'Gold', weight: 0, price: 8000 + 5000 }], 4000, now).source).toBe('fallback')
  })

  it('ไม่มีทั้งสองอย่าง → none', () => {
    expect(resolvePieceGoldStamp([], '', now)).toMatchObject({ stamp: '', source: 'none' })
    expect(resolvePieceGoldStamp(undefined, 0, now).source).toBe('none')
  })

  it('หลายแถวทอง เลือกแถวที่ updateDate ล่าสุด', () => {
    const r = resolvePieceGoldStamp(
      [
        { type: 'Gold', weight: 1, price: 3800, updateDate: '2026-10-01T00:00:00Z' },
        { type: 'Gold', weight: 1, price: 4100, updateDate: '2026-11-05T00:00:00Z' },
        { type: 'Gold', weight: 1, price: 3500, updateDate: null }
      ],
      '',
      now
    )
    expect(r.pricePerGram).toBe(4100)
    expect(r.stamp).toBe('004120261105')
  })
})

describe('resolvePieceGoldStamp — ตีความราคา', () => {
  const run = (price, weight, extra = {}, ref = '') =>
    resolvePieceGoldStamp([{ type: 'Gold', price, weight, ...extra }], ref, now)

  it.each([
    [4000, 0.8],
    [4000, 2.0],
    [5280, 1.32],
    [6960, 1.74],
    [8240, 2.06],
    [4000, 0.26],
    [6000, 1.5],
    [4000, 1.34],
    [4000, 1],
    [4800, 1.2],
    [9000, 2.25]
  ])('%s @ %s g → 4000/g', (price, weight) => {
    const r = run(price, weight)
    expect(r.source).toBe('material')
    expect(r.pricePerGram).toBeCloseTo(4000)
  })

  it('17 @ 1.74 → ใช้ไม่ได้ → สำรอง', () => {
    expect(run(17, 1.74, {}, '3900').source).toBe('fallback')
    expect(run(17, 0.5).source).toBe('none')
  })

  it('ราคาอ้างอิงจากราคาสำรอง: 4500', () => {
    expect(run(4500, 1.5, {}, 4500).pricePerGram).toBe(4500)
    expect(run(6750, 1.5, {}, 4500).pricePerGram).toBe(4500)
  })

  it('หน่วยไม่ใช่กรัม (ct.) → ผู้สมัครต่อกรัมเท่านั้น', () => {
    expect(run(8240, 2.06, { weightUnit: 'ct.' }).source).toBe('none')
    expect(run(4000, 0.8, { weightUnit: 'ct.' }).pricePerGram).toBe(4000)
    expect(run(8240, 2.06, { weightUnit: 'g.' }).pricePerGram).toBeCloseTo(4000)
    expect(run(8240, 2.06, { weightUnit: 'g' }).pricePerGram).toBeCloseTo(4000)
  })

  it('ขอบช่วง 1500 / 6000 ใช้ได้ ส่วน 1499 / 6001 ใช้ไม่ได้', () => {
    expect(run(1500, 1).source).toBe('material')
    expect(run(6000, 1).source).toBe('material')
    expect(run(1499, 1).source).toBe('none')
    expect(run(6001, 1).source).toBe('none')
  })
})

describe('resolvePieceGoldStamp — วันที่', () => {
  const stampOf = (updateDate) => resolvePieceGoldStamp([{ type: 'Gold', price: 4000, weight: 1, updateDate }], '', now).stamp

  it('ISO ไม่มี Z ถือเป็น UTC', () => {
    expect(stampOf('2026-11-10T18:00:00')).toBe('004020261111')
  })

  it('offset +07:00', () => {
    expect(stampOf('2026-11-10T23:30:00+07:00')).toBe('004020261110')
  })

  it('ขอบเที่ยงคืนไทย', () => {
    expect(stampOf('2026-11-16T16:59:59Z')).toBe('004020261116')
    expect(stampOf('2026-11-16T17:00:00Z')).toBe('004020261117')
  })
})

describe('formatStampDisplay', () => {
  it('แสดงตรงกับที่พิมพ์จริง ไม่เว้นวรรค', () => {
    expect(formatStampDisplay('004020261117')).toBe('004020261117')
    expect(formatStampDisplay('')).toBe('')
  })
})

describe('isPriceOutOfRange', () => {
  it('ว่าง/0 ไม่ถือว่านอกช่วง · นอก 1500-6000 = true', () => {
    expect(isPriceOutOfRange('')).toBe(false)
    expect(isPriceOutOfRange(0)).toBe(false)
    expect(isPriceOutOfRange(4000)).toBe(false)
    expect(isPriceOutOfRange(1500)).toBe(false)
    expect(isPriceOutOfRange(6000)).toBe(false)
    expect(isPriceOutOfRange(400)).toBe(true)
    expect(isPriceOutOfRange('40000')).toBe(true)
  })
})

describe('batch reference + ambiguous', () => {
  const m = (price, weight) => ({ type: 'Gold', weight, price, weightUnit: 'g' })

  it('ไม่กรอกราคาสำรอง ราคาจริง 4400 ใน batch → เลือกค่าต่อกรัมถูก', () => {
    // ชิ้นกำกวม: price 5000 น้ำหนัก 1.136 → ต่อกรัม 4400.7 หรือยอดรวม 5000
    const list = [[m(4400, 99)], [m(4380, 99)], [m(4420, 99)], [m(5000, 1.136)]]
    const ref = resolveBatchReference(list, '')
    expect(ref).toBe(4400)
    const r = resolvePieceGoldStamp(list[3], '', now, ref)
    expect(r.pricePerGram).toBeCloseTo(4401.41, 1)
    expect(r.ambiguous).toBe(true)
  })

  it('กรอกราคาสำรองแล้วใช้ค่านั้น · ไม่มีชิ้นค่าเดียวใช้ 4000', () => {
    expect(resolveBatchReference([[m(4400, 99)]], 3900)).toBe(3900)
    expect(resolveBatchReference([[m(5000, 1.136)]], '')).toBe(4000)
  })

  it('ค่าเดียวที่ชัดเจน ambiguous=false', () => {
    expect(resolvePieceGoldStamp([m(4000, 99)], '', now).ambiguous).toBe(false)
  })
})

describe('priceWeight (ราคา/น้ำหนักจริงจากรับงานผลิต)', () => {
  const dk = (extra = {}) => ({ type: 'Gold', weight: 0.97, weightUnit: 'g.', price: 2000, ...extra })

  it('priceWeight ชนะการเดา — DK20I281: ไม่มี priceWeight อ้างอิง 4000 ได้ 2061.86, มีแล้วได้ 2000', () => {
    const guessed = resolvePieceGoldStamp([dk()], '', now, 4000)
    expect(guessed.pricePerGram).toBeCloseTo(2061.86, 2)
    const exact = resolvePieceGoldStamp([dk({ priceWeight: 2000 })], '', now, 4000)
    expect(exact.pricePerGram).toBe(2000)
    expect(exact.ambiguous).toBe(false)
    expect(exact.source).toBe('material')
  })

  it('priceWeight ว่าง/0 → ใช้วิธีเดิม', () => {
    expect(resolvePieceGoldStamp([dk({ priceWeight: null })], '', now, 4000).pricePerGram).toBeCloseTo(2061.86, 2)
    expect(resolvePieceGoldStamp([dk({ priceWeight: 0 })], '', now, 4000).pricePerGram).toBeCloseTo(2061.86, 2)
  })

  it('priceWeight นอกช่วง 1500–6000 ยังใช้ค่านั้น และแจ้ง outOfRange', () => {
    const r = resolvePieceGoldStamp([dk({ priceWeight: 1200 })], '', now)
    expect(r.pricePerGram).toBe(1200)
    expect(r.outOfRange).toBe(true)
    expect(resolvePieceGoldStamp([dk({ priceWeight: 2000 })], '', now).outOfRange).toBe(false)
  })

  it('แถวที่ updateDate ใหม่สุดชนะ แม้ priceWeight', () => {
    const r = resolvePieceGoldStamp(
      [dk({ priceWeight: 2000, updateDate: '2026-11-10T00:00:00Z' }), dk({ priceWeight: 3000, updateDate: '2026-11-12T00:00:00Z' })],
      '',
      now
    )
    expect(r.pricePerGram).toBe(3000)
  })

  it('resolveBatchReference นับ priceWeight เป็นค่าเดียว', () => {
    expect(resolveBatchReference([[dk({ priceWeight: 2000 })], [dk({ priceWeight: 2200 })], [dk({ priceWeight: 2400 })]], '')).toBe(2200)
  })
})
