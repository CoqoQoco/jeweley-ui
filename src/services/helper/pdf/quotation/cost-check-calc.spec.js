import { describe, it, expect } from 'vitest'
import {
  LOW_MARGIN_THRESHOLD_PERCENT,
  groupPriceTransactionsByGroup,
  calcItemCost,
  calcItemCostCheck,
  getWorstSeverity,
  computeCostCheckDocument
} from './cost-check-calc.js'

// ตัวอย่างจริงจากใบเสนอราคา QT-260923-001 รายการที่ 1 (verified บน prod data)
function realItem(overrides = {}) {
  return {
    qty: 1,
    appraisalPrice: '26959.9',
    discountPercent: 62,
    priceTransactions: [
      { nameGroup: 'Gold', nameDescription: 'ทอง 18K', totalPrice: '5000.00' },
      { nameGroup: 'Worker', nameDescription: 'ค่าแรง', totalPrice: '1500.00' },
      { nameGroup: 'Embed', nameDescription: 'ค่าฝัง', totalPrice: '1203.09' }
    ],
    ...overrides
  }
}

describe('calcItemCost', () => {
  it('รวม totalPrice ของทุกแถวใน priceTransactions', () => {
    const item = realItem()
    expect(calcItemCost(item)).toBeCloseTo(7703.09, 6)
  })

  it('ไม่มี priceTransactions → 0', () => {
    expect(calcItemCost({})).toBe(0)
  })

  it('priceTransactions ว่าง → 0', () => {
    expect(calcItemCost({ priceTransactions: [] })).toBe(0)
  })
})

describe('calcItemCostCheck — ตัวอย่างจริง QT-260923-001 item 1', () => {
  const options = { currencyRate: 32.5, currencyUnit: 'US$', markup: 3.5 }

  it('cost, netThb, profit, profitPct ตรงกับค่าที่ verify บน prod', () => {
    const check = calcItemCostCheck(realItem(), options)

    expect(check.cost).toBeCloseTo(7703.09, 6)
    expect(check.appraisal).toBeCloseTo(26959.9, 6)
    expect(check.netThb).toBeCloseTo(10244.762, 6)
    expect(check.profit).toBeCloseTo(2541.672, 6)
    expect(check.profitPct).toBeCloseTo(0.2480948, 6) // ~24.8%
  })

  it('netForeign ใช้สูตรเดียวกับ convertedUnitPrice ของหน้าจอ (หาร rate)', () => {
    const check = calcItemCostCheck(realItem(), options)
    expect(check.netForeign).toBeCloseTo(10244.762 / 32.5, 6)
  })

  it('expectedAppraisal = cost × markup — ใกล้เคียง appraisal จริง (drift ~0.9 บาท ถือว่าปกติ)', () => {
    const check = calcItemCostCheck(realItem(), options)
    expect(check.expectedAppraisal).toBeCloseTo(7703.09 * 3.5, 6)
    expect(Math.abs(check.appraisal - check.expectedAppraisal)).toBeLessThan(1)
  })

  it('ไม่มี warning ใดๆ (กำไรเป็นบวก, สูงกว่า threshold, appraisal ตรงกับที่คาดหวัง)', () => {
    const check = calcItemCostCheck(realItem(), options)
    expect(check.warnings).toEqual([])
    expect(check.severity).toBeNull()
  })

  it('qty > 1 → line* = ต่อหน่วย × qty', () => {
    const check = calcItemCostCheck(realItem({ qty: 2 }), options)
    expect(check.lineCost).toBeCloseTo(7703.09 * 2, 6)
    expect(check.lineNetThb).toBeCloseTo(10244.762 * 2, 6)
    expect(check.lineProfit).toBeCloseTo(2541.672 * 2, 6)
    // ต่อหน่วยไม่เปลี่ยนตาม qty
    expect(check.profitPct).toBeCloseTo(0.2480948, 6)
  })
})

describe('calcItemCostCheck — currency THB (rate เอฟเฟกต์เดียวกับ convertedUnitPrice)', () => {
  it('เมื่อ rate = 1 และ currencyUnit = THB, netForeign === netThb', () => {
    const check = calcItemCostCheck(realItem(), { currencyRate: 1, currencyUnit: 'THB', markup: 3.5 })
    expect(check.netForeign).toBeCloseTo(check.netThb, 6)
  })
})

describe('warnings — LOSS', () => {
  it('สุทธิ < ต้นทุน → LOSS (แดง), ไม่มี LOW_MARGIN ซ้ำ', () => {
    const item = {
      qty: 1,
      appraisalPrice: '100',
      discountPercent: 90, // net = 10
      priceTransactions: [{ nameGroup: 'Gold', totalPrice: '100' }]
    }
    const check = calcItemCostCheck(item, { currencyRate: 1, currencyUnit: 'THB', markup: 1 })

    expect(check.profit).toBeLessThan(0)
    const codes = check.warnings.map((w) => w.code)
    expect(codes).toContain('LOSS')
    expect(codes).not.toContain('LOW_MARGIN')
    expect(check.severity).toBe('red')
  })
})

describe('warnings — LOW_MARGIN', () => {
  it('กำไรเป็นบวกแต่ต่ำกว่า threshold → LOW_MARGIN (ส้ม)', () => {
    const item = {
      qty: 1,
      appraisalPrice: '200',
      discountPercent: 45, // net = 110, cost = 100, profit = 10, pct = 9.09%
      priceTransactions: [{ nameGroup: 'Gold', totalPrice: '100' }]
    }
    const check = calcItemCostCheck(item, { currencyRate: 1, currencyUnit: 'THB', markup: 2 })

    expect(check.profit).toBeGreaterThan(0)
    expect(check.profitPct).toBeLessThan(LOW_MARGIN_THRESHOLD_PERCENT / 100)
    const codes = check.warnings.map((w) => w.code)
    expect(codes).toContain('LOW_MARGIN')
    expect(codes).not.toContain('LOSS')
    expect(check.severity).toBe('orange')
  })

  it('ปรับ threshold ผ่าน option ได้', () => {
    const item = {
      qty: 1,
      appraisalPrice: '200',
      discountPercent: 0, // net = 200, cost = 100, profit = 100, pct = 50%
      priceTransactions: [{ nameGroup: 'Gold', totalPrice: '100' }]
    }
    const strict = calcItemCostCheck(item, {
      currencyRate: 1,
      currencyUnit: 'THB',
      markup: 2,
      lowMarginThreshold: 60
    })
    expect(strict.warnings.map((w) => w.code)).toContain('LOW_MARGIN')

    const lenient = calcItemCostCheck(item, {
      currencyRate: 1,
      currencyUnit: 'THB',
      markup: 2,
      lowMarginThreshold: 10
    })
    expect(lenient.warnings.map((w) => w.code)).not.toContain('LOW_MARGIN')
  })
})

describe('warnings — APPRAISAL_MISMATCH', () => {
  it('appraisal ต่างจาก cost×markup เกิน 1 บาท → APPRAISAL_MISMATCH (ส้ม)', () => {
    const item = {
      qty: 1,
      appraisalPrice: '250', // expected = 100 × 3 = 300, diff = 50
      discountPercent: 0,
      priceTransactions: [{ nameGroup: 'Gold', totalPrice: '100' }]
    }
    const check = calcItemCostCheck(item, { currencyRate: 1, currencyUnit: 'THB', markup: 3 })

    const codes = check.warnings.map((w) => w.code)
    expect(codes).toContain('APPRAISAL_MISMATCH')
    expect(check.severity).toBe('orange')
  })

  it('diff ไม่เกิน 1 บาท → ไม่เตือน (drift ปกติ)', () => {
    const item = {
      qty: 1,
      appraisalPrice: '300.9',
      discountPercent: 0,
      priceTransactions: [{ nameGroup: 'Gold', totalPrice: '100' }]
    }
    const check = calcItemCostCheck(item, { currencyRate: 1, currencyUnit: 'THB', markup: 3 })
    expect(check.warnings.map((w) => w.code)).not.toContain('APPRAISAL_MISMATCH')
  })

  // ตัวอย่างจริง QT-260923-001 item 7 — diff 1.23 บาท (rounding drift ของรายการยอดใหญ่) ต้องไม่เตือน
  // เกณฑ์ต้องแปรผันตามขนาด: max(1 บาท, 0.1% ของราคาที่คาดหวัง) ไม่ใช่ค่าคงที่ 1 บาทตายตัว
  it('รายการยอดใหญ่ diff 1.23 บาท (ต่ำกว่า 0.1% ของราคาคาดหวัง) → ไม่เตือน', () => {
    const item = {
      qty: 1,
      appraisalPrice: '109740.33',
      discountPercent: 0,
      priceTransactions: [{ nameGroup: 'Gold', totalPrice: '31354.73' }]
    }
    const check = calcItemCostCheck(item, { currencyRate: 1, currencyUnit: 'THB', markup: 3.5 })

    expect(check.expectedAppraisal).toBeCloseTo(31354.73 * 3.5, 6) // ~109741.555
    expect(Math.abs(check.appraisal - check.expectedAppraisal)).toBeCloseTo(1.225, 3)
    expect(check.warnings.map((w) => w.code)).not.toContain('APPRAISAL_MISMATCH')
  })

  it('แก้ไขราคาตั้งขายเองจนต่างจากที่คาดหวังเกิน 0.1% ของยอดใหญ่ → ยังต้องเตือน', () => {
    const item = {
      qty: 1,
      appraisalPrice: '100000', // expected ~109741.56 — ต่างกันหลักหมื่น เกินเกณฑ์แน่นอน
      discountPercent: 0,
      priceTransactions: [{ nameGroup: 'Gold', totalPrice: '31354.73' }]
    }
    const check = calcItemCostCheck(item, { currencyRate: 1, currencyUnit: 'THB', markup: 3.5 })

    expect(check.warnings.map((w) => w.code)).toContain('APPRAISAL_MISMATCH')
    const warning = check.warnings.find((w) => w.code === 'APPRAISAL_MISMATCH')
    expect(warning.message).toContain('100,000.00')
  })
})

describe('warnings — NO_COST', () => {
  it('ไม่มี priceTransactions → NO_COST เท่านั้น ไม่เช็ค LOSS/LOW_MARGIN/APPRAISAL_MISMATCH ซ้ำ', () => {
    const item = {
      qty: 1,
      appraisalPrice: '1000',
      discountPercent: 0,
      priceTransactions: []
    }
    const check = calcItemCostCheck(item, { currencyRate: 1, currencyUnit: 'THB', markup: 3 })

    expect(check.cost).toBe(0)
    expect(check.warnings.map((w) => w.code)).toEqual(['NO_COST'])
    expect(check.severity).toBe('orange')
  })

  it('ต้นทุนรวมเป็น 0 (มีแถวแต่ totalPrice ทั้งหมดเป็น 0) → NO_COST', () => {
    const item = {
      qty: 1,
      appraisalPrice: '1000',
      discountPercent: 0,
      priceTransactions: [{ nameGroup: 'Gold', totalPrice: '0' }]
    }
    const check = calcItemCostCheck(item, { currencyRate: 1, currencyUnit: 'THB', markup: 3 })
    expect(check.warnings.map((w) => w.code)).toEqual(['NO_COST'])
  })
})

describe('warnings — PARTIAL_COST_VERSION', () => {
  it('source = costVersion และขาดกลุ่ม Worker/Embed → PARTIAL_COST_VERSION', () => {
    const item = {
      qty: 1,
      appraisalPrice: '1000',
      discountPercent: 0,
      source: 'costVersion',
      priceTransactions: [
        { nameGroup: 'Gold', totalPrice: '100' },
        { nameGroup: 'Gem', totalPrice: '50' }
      ]
    }
    const check = calcItemCostCheck(item, { currencyRate: 1, currencyUnit: 'THB', markup: 3 })
    const warning = check.warnings.find((w) => w.code === 'PARTIAL_COST_VERSION')

    expect(warning).toBeDefined()
    expect(warning.severity).toBe('orange')
    expect(warning.message).toContain('Worker')
    expect(warning.message).toContain('Embed')
  })

  it('source = costVersion และมีครบทุกกลุ่ม → ไม่เตือน', () => {
    const item = {
      qty: 1,
      appraisalPrice: '1000',
      discountPercent: 0,
      source: 'costVersion',
      priceTransactions: [
        { nameGroup: 'Gold', totalPrice: '100' },
        { nameGroup: 'Worker', totalPrice: '50' },
        { nameGroup: 'Embed', totalPrice: '30' },
        { nameGroup: 'Gem', totalPrice: '20' }
      ]
    }
    const check = calcItemCostCheck(item, { currencyRate: 1, currencyUnit: 'THB', markup: 3 })
    expect(check.warnings.map((w) => w.code)).not.toContain('PARTIAL_COST_VERSION')
  })

  it('ไม่ใช่ cost version (กรอกเอง) แม้ขาดกลุ่ม → ไม่เตือน', () => {
    const item = {
      qty: 1,
      appraisalPrice: '1000',
      discountPercent: 0,
      priceTransactions: [{ nameGroup: 'Gold', totalPrice: '100' }]
    }
    const check = calcItemCostCheck(item, { currencyRate: 1, currencyUnit: 'THB', markup: 3 })
    expect(check.warnings.map((w) => w.code)).not.toContain('PARTIAL_COST_VERSION')
  })

  it('source = costVersion แต่ต้นทุนเป็น 0 → เตือนแค่ NO_COST ไม่ซ้ำ PARTIAL_COST_VERSION', () => {
    const item = {
      qty: 1,
      appraisalPrice: '1000',
      discountPercent: 0,
      source: 'costVersion',
      priceTransactions: []
    }
    const check = calcItemCostCheck(item, { currencyRate: 1, currencyUnit: 'THB', markup: 3 })
    expect(check.warnings.map((w) => w.code)).toEqual(['NO_COST'])
  })
})

describe('getWorstSeverity', () => {
  it('ไม่มี warning → null', () => {
    expect(getWorstSeverity([])).toBeNull()
    expect(getWorstSeverity(undefined)).toBeNull()
  })

  it('มี red อย่างน้อย 1 → red แม้จะมี orange ปนอยู่', () => {
    expect(getWorstSeverity([{ severity: 'orange' }, { severity: 'red' }])).toBe('red')
  })

  it('มีแต่ orange → orange', () => {
    expect(getWorstSeverity([{ severity: 'orange' }])).toBe('orange')
  })
})

describe('groupPriceTransactionsByGroup', () => {
  it('จัดกลุ่มตาม nameGroup (case-insensitive) และรายการที่ไม่รู้จักไปกลุ่ม ETC', () => {
    const groups = groupPriceTransactionsByGroup([
      { nameGroup: 'gold', nameDescription: 'a' },
      { nameGroup: 'Worker', nameDescription: 'b' },
      { nameGroup: 'EMBED', nameDescription: 'c' },
      { nameGroup: 'Gem', nameDescription: 'd' },
      { nameGroup: 'Setting', nameDescription: 'e' },
      { nameGroup: '', nameDescription: 'f' }
    ])

    expect(groups.Gold.length).toBe(1)
    expect(groups.Worker.length).toBe(1)
    expect(groups.Embed.length).toBe(1)
    expect(groups.Gem.length).toBe(1)
    expect(groups.ETC.length).toBe(2)
  })

  it('ไม่มี priceTransactions → คืนกลุ่มว่างทั้งหมด', () => {
    const groups = groupPriceTransactionsByGroup(undefined)
    expect(groups.Gold).toEqual([])
    expect(groups.ETC).toEqual([])
  })
})

describe('computeCostCheckDocument', () => {
  it('เอกสาร 1 รายการ (ตัวอย่างจริง) — netSaleThb/profitThb/profitPct สอดคล้องกับ per-item', () => {
    const doc = computeCostCheckDocument({
      items: [realItem()],
      currencyRate: 32.5,
      currencyUnit: 'US$',
      markup: 3.5
    })

    expect(doc.totalCost).toBeCloseTo(7703.09, 6)
    expect(doc.netSaleThb).toBeCloseTo(10244.762, 4)
    expect(doc.profitThb).toBeCloseTo(2541.672, 4)
    expect(doc.profitPct).toBeCloseTo(0.2480948, 4)
    expect(doc.warningCount).toBe(0)
  })

  it('รวม specialDiscount/specialAddition (สกุลขาย) เข้ากำไรเอกสารผ่านการคูณ rate', () => {
    const item = {
      qty: 1,
      appraisalPrice: '1000', // net = 1000 THB, netForeign = 1000/10 = 100
      discountPercent: 0,
      priceTransactions: [{ nameGroup: 'Gold', totalPrice: '500' }]
    }
    // subTotal (สกุลขาย) = 100, specialDiscount 10 (สกุลขาย) → netSaleThb = (100-10)*10 = 900
    const doc = computeCostCheckDocument({
      items: [item],
      currencyRate: 10,
      currencyUnit: 'US$',
      specialDiscount: 10,
      markup: 2
    })

    expect(doc.netSaleThb).toBeCloseTo(900, 6)
    expect(doc.profitThb).toBeCloseTo(900 - 500, 6)
  })

  it('นับ warningCount รวมทุกรายการ', () => {
    // appraisalPrice ตั้งให้ตรงกับ cost×markup (100×3.5) พอดี กันไม่ให้ปน APPRAISAL_MISMATCH เข้ามาด้วย
    const lossItem = {
      qty: 1,
      appraisalPrice: '350',
      discountPercent: 90,
      priceTransactions: [{ nameGroup: 'Gold', totalPrice: '100' }]
    }
    const noCostItem = { qty: 1, appraisalPrice: '100', discountPercent: 0, priceTransactions: [] }

    const doc = computeCostCheckDocument({
      items: [lossItem, noCostItem, realItem()],
      currencyRate: 32.5,
      currencyUnit: 'US$',
      markup: 3.5
    })

    expect(doc.warningCount).toBe(2) // LOSS 1 + NO_COST 1, realItem ไม่มี warning
  })

  it('ไม่มี items → ไม่ throw และยอดเป็น 0', () => {
    const doc = computeCostCheckDocument({ items: [], currencyRate: 1, currencyUnit: 'THB', markup: 3 })
    expect(doc.totalCost).toBe(0)
    expect(doc.profitThb).toBe(0)
    expect(doc.warningCount).toBe(0)
  })
})
