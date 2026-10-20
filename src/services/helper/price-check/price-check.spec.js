import { describe, it, expect, vi } from 'vitest'
import {
  buildPriceCheckRequest,
  pickOutliers,
  findPriceOutliers,
  formatReason,
  formatReasons,
  collectSuggestions,
  toPriceNumber,
  summarizeMaterials
} from './price-check.js'

const t = (key, params) => `${key}|${JSON.stringify(params)}`

describe('buildPriceCheckRequest', () => {
  it('ส่งเฉพาะราคา > 0 และตัด field ว่างออก', () => {
    const req = buildPriceCheckRequest([
      { key: 'a', price: '611,000', stockNumber: 'DK1', wo: '', goldWeight: 0 },
      { key: 'b', price: 0 },
      { key: 'c', price: '' },
      { key: 'd', price: null }
    ])
    expect(req.items).toEqual([{ key: 'a', price: 611000, stockNumber: 'DK1', goldWeight: 0 }])
  })

  it('entries ว่าง → items ว่าง', () => {
    expect(buildPriceCheckRequest(undefined).items).toEqual([])
  })
})

describe('toPriceNumber', () => {
  it('ตัด comma และคืน NaN เมื่อว่าง', () => {
    expect(toPriceNumber('1,234.5')).toBe(1234.5)
    expect(toPriceNumber('')).toBeNaN()
  })
})

describe('pickOutliers', () => {
  it('คืนเฉพาะ isOutlier พร้อม label/price ที่กรอก', () => {
    const entries = [
      { key: 'a', price: 611000, label: 'DK1' },
      { key: 'b', price: 100, label: 'DK2' }
    ]
    const res = {
      items: [
        { key: 'a', isOutlier: true, reasons: [{ code: 'SAME_WO', reference: 61000 }], suggestedPrice: 61100 },
        { key: 'b', isOutlier: false, reasons: [], suggestedPrice: null }
      ]
    }
    expect(pickOutliers(entries, res)).toEqual([
      { key: 'a', label: 'DK1', price: 611000, reasons: [{ code: 'SAME_WO', reference: 61000 }], suggestedPrice: 61100 }
    ])
  })

  it('suggestedPrice null → null', () => {
    const out = pickOutliers([{ key: 'a', price: 5 }], {
      items: [{ key: 'a', isOutlier: true, reasons: [], suggestedPrice: null }]
    })
    expect(out[0].suggestedPrice).toBeNull()
  })
})

describe('findPriceOutliers', () => {
  it('ไม่มีราคาให้ตรวจ → ไม่เรียก API', async () => {
    const checkFn = vi.fn()
    expect(await findPriceOutliers(checkFn, [{ key: 'a', price: 0 }])).toEqual([])
    expect(checkFn).not.toHaveBeenCalled()
  })

  it('API ล้มเหลว (คืน null) → ไม่มี outlier ไม่ขวางการบันทึก', async () => {
    const checkFn = vi.fn().mockResolvedValue(null)
    expect(await findPriceOutliers(checkFn, [{ key: 'a', price: 10 }])).toEqual([])
  })

  it('ส่ง items ที่ build แล้วและคืน outlier', async () => {
    const checkFn = vi.fn().mockResolvedValue({
      items: [{ key: 'a', isOutlier: true, reasons: [], suggestedPrice: 61100 }]
    })
    const out = await findPriceOutliers(checkFn, [{ key: 'a', price: 611000, stockNumber: 'DK1' }])
    expect(checkFn).toHaveBeenCalledWith([{ key: 'a', price: 611000, stockNumber: 'DK1' }])
    expect(out).toHaveLength(1)
    expect(out[0].suggestedPrice).toBe(61100)
  })
})

describe('formatReason', () => {
  it('COST_RATIO ใช้ทศนิยม 1 ตำแหน่ง', () => {
    expect(formatReason(t, { code: 'COST_RATIO', value: 12.345, reference: 3 })).toBe(
      'common.priceCheck.reason.COST_RATIO|{"value":"12.3","reference":"3.0"}'
    )
  })

  it('reason อื่นใช้ reference พร้อมตัวคั่นหลักพัน', () => {
    expect(formatReason(t, { code: 'PREVIOUS_PRICE', reference: 61100 })).toBe(
      'common.priceCheck.reason.PREVIOUS_PRICE|{"reference":"61,100"}'
    )
  })

  it('code ที่ไม่รู้จักถูกข้าม', () => {
    expect(formatReasons(t, [{ code: 'UNKNOWN' }, { code: 'SAME_DESIGN', reference: 5000 }])).toHaveLength(1)
  })
})

describe('collectSuggestions', () => {
  it('เก็บเฉพาะแถวที่มี suggestedPrice', () => {
    expect(
      collectSuggestions([
        { key: 'a', suggestedPrice: 61100 },
        { key: 'b', suggestedPrice: null }
      ])
    ).toEqual([{ key: 'a', price: 61100 }])
  })
})

describe('summarizeMaterials', () => {
  it('รวมน้ำหนักทอง/เงิน และราคาพลอย+เพชร', () => {
    const r = summarizeMaterials([
      { type: 'Gold', qtyWeight: 2.5 },
      { type: 'Silver', qtyWeight: 1 },
      { type: 'Diamond', qty: 10, qtyPrice: 100, qtyWeight: 0.5, qtyWeightPrice: 1000 },
      { type: 'Gem', qty: 2, qtyPrice: 50 }
    ])
    expect(r).toEqual({ goldWeight: 3.5, gemPrice: 1000 + 500 + 100 })
  })

  it('ไม่มีวัตถุดิบ → 0', () => {
    expect(summarizeMaterials(undefined)).toEqual({ goldWeight: 0, gemPrice: 0 })
  })
})
