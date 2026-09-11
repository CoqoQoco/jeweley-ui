import { describe, it, expect } from 'vitest'
import { buildReceiptText } from './receipt-text-builder.js'

const WIDTH = 47
const DIVIDER = '-'.repeat(WIDTH)

function baseItem(overrides = {}) {
  return {
    stockNumber: 'DK-18K-20A-19960',
    stockNumberOrigin: 'DK-18K-20A-19960',
    description: 'Sapphire ring 18k white gold',
    appraisalPrice: 12500,
    discountPercent: 10,
    qty: 1,
    materialSummary: [
      { type: 'Gold', name: 'WHITE GOLD', qty: '', weight: '2.97 g.' },
      { type: 'Diamond', name: 'DIAMOND (G,VS)', qty: '30 pcs', weight: '0.32 ct.' },
      { type: 'Gem', name: 'SAPPHIRE', qty: '1 pcs', weight: '1.97 ct.' }
    ],
    ...overrides
  }
}

function baseData(overrides = {}) {
  return {
    invoiceNumber: 'INV0000123',
    date: '2026-09-09T10:00:00Z',
    customer: { name: 'Test Customer' },
    seller: 'tester',
    items: [baseItem()],
    payments: [],
    currencyUnit: 'THB',
    ...overrides
  }
}

// ตัดรายการที่อยู่ระหว่าง divider สองเส้นที่ระบุ (ใช้แยกดูเฉพาะ "บล็อกรายการสินค้า")
function sectionBetween(lines, startDividerIndex, endDividerIndex) {
  return lines.slice(startDividerIndex + 1, endDividerIndex)
}

describe('buildReceiptText — signature block', () => {
  it('จ่ายครบพอดี (grandTotal เท่ากับยอดจ่ายรวม) → ต้องมีบล็อก SIGNATURES', () => {
    const data = baseData({
      grandTotal: 11250,
      payments: [{ payment: 1, amount: 11250 }]
    })
    const text = buildReceiptText(data)

    expect(text).toContain('SIGNATURES')
    expect(text).toContain('Seller')
    expect(text).toContain('Customer')
    expect(text).toContain('_'.repeat(45))
  })

  it('จ่ายบางส่วน (paidAmount < grandTotal) → ต้องไม่มีบล็อก SIGNATURES', () => {
    const data = baseData({
      grandTotal: 11250,
      payments: [{ payment: 1, amount: 5000 }]
    })
    const text = buildReceiptText(data)

    expect(text).not.toContain('SIGNATURES')
    expect(text).not.toContain('_'.repeat(45))
  })

  it('ยังไม่จ่ายเลย (payments ว่าง) → ต้องไม่มีบล็อก SIGNATURES', () => {
    const data = baseData({
      grandTotal: 11250,
      payments: []
    })
    const text = buildReceiptText(data)

    expect(text).not.toContain('SIGNATURES')
  })

  it('จ่ายเกินยอด (มีเงินทอน) → remainingAmount <= 0 นับเป็นจ่ายครบ ต้องมีบล็อก SIGNATURES', () => {
    const data = baseData({
      grandTotal: 11250,
      payments: [{ payment: 1, amount: 20000 }]
    })
    const text = buildReceiptText(data)

    expect(text).toContain('SIGNATURES')
  })
})

describe('buildReceiptText — รายการวัตถุดิบแทน Discount', () => {
  it('ไม่มีคำว่า Discount เหลือในบล็อกรายการสินค้า แม้ item มี discountPercent > 0', () => {
    const data = baseData({
      grandTotal: 11250,
      payments: [{ payment: 1, amount: 11250 }]
    })
    const lines = buildReceiptText(data).split('\n')

    const dividerIndexes = lines
      .map((line, idx) => (line === DIVIDER ? idx : -1))
      .filter((idx) => idx !== -1)

    // divider ที่ 0 = หลัง header, divider ที่ 1 = ก่อน summary → บล็อกรายการสินค้าอยู่ระหว่างสองเส้นนี้
    const itemsSection = sectionBetween(lines, dividerIndexes[0], dividerIndexes[1])

    expect(itemsSection.some((line) => line.includes('Discount'))).toBe(false)
  })

  it('พิมพ์บรรทัดวัตถุดิบครบ 3 รายการ (ทอง/เพชร/พลอย) ตรงตามสเปกคอลัมน์ชิดซ้าย', () => {
    const text = buildReceiptText(baseData())
    const lines = text.split('\n')

    expect(lines).toContain('    WHITE GOLD              2.97 g.')
    expect(lines).toContain('    DIAMOND (G,VS)  30 pcs  0.32 ct.')
    expect(lines).toContain('    SAPPHIRE         1 pcs  1.97 ct.')
  })

  it('item ไม่มี materialSummary (undefined) → ไม่พิมพ์บรรทัดวัตถุดิบ ไม่ error', () => {
    const data = baseData({
      items: [baseItem({ materialSummary: undefined })]
    })
    expect(() => buildReceiptText(data)).not.toThrow()

    const text = buildReceiptText(data)
    expect(text).not.toContain('WHITE GOLD')
  })

  it('materialSummary เป็น array ว่าง → ไม่พิมพ์บรรทัดวัตถุดิบเลย', () => {
    const data = baseData({
      items: [baseItem({ materialSummary: [] })]
    })
    const text = buildReceiptText(data)
    expect(text).not.toContain('WHITE GOLD')
  })
})

describe('buildReceiptText — ความกว้างบรรทัด', () => {
  it('ทุกบรรทัด (ยกเว้น [[QR:...]]) ต้องยาวไม่เกิน 47 ตัวอักษร — เคสจ่ายครบ', () => {
    const data = baseData({
      grandTotal: 11250,
      specialDiscount: 100,
      specialAddition: 50,
      freightAndInsurance: 20,
      vatPercent: 7,
      payments: [
        { payment: 1, amount: 10000, bankCode: 'KBANK' },
        { payment: 2, amount: 1250 }
      ]
    })
    const lines = buildReceiptText(data).split('\n')

    lines.forEach((line) => {
      if (/^\[\[QR:.*\]\]$/.test(line)) return
      expect(line.length).toBeLessThanOrEqual(47)
    })
  })

  it('ทุกบรรทัด (ยกเว้น [[QR:...]]) ต้องยาวไม่เกิน 47 ตัวอักษร — เคสจ่ายไม่ครบ', () => {
    const data = baseData({
      grandTotal: 11250,
      payments: [{ payment: 1, amount: 3000 }]
    })
    const lines = buildReceiptText(data).split('\n')

    lines.forEach((line) => {
      if (/^\[\[QR:.*\]\]$/.test(line)) return
      expect(line.length).toBeLessThanOrEqual(47)
    })
  })

  it('ชื่อวัสดุยาวผิดปกติ ก็ยังไม่ทำให้ตัวเลข qty/weight ถูกตัดหาง (ชื่อถูก clamp ที่ MATERIAL_NAME_MAX_W แทน)', () => {
    const data = baseData({
      items: [
        baseItem({
          materialSummary: [
            { type: 'Gem', name: 'A'.repeat(60), qty: '999 pcs', weight: '999.99 ct.' }
          ]
        })
      ]
    })
    const lines = buildReceiptText(data).split('\n')
    const materialLine = lines.find((l) => l.includes('999 pcs'))

    expect(materialLine).toBeDefined()
    expect(materialLine.length).toBeLessThan(WIDTH)
    expect(materialLine).toMatch(/999 pcs {2}999\.99 ct\.$/)
  })
})

describe('buildReceiptText — ป้ายวิธีชำระเงินจากรหัส (กันตกไปที่ Payment/สตริงว่าง)', () => {
  it('payment: 5 (เครดิต) → ต้องได้ "Credit Term" ไม่ใช่ "Payment" หรือค่าว่าง', () => {
    const data = baseData({
      grandTotal: 11250,
      payments: [{ payment: 5, amount: 0 }]
    })
    const text = buildReceiptText(data)

    expect(text).toContain('Credit Term')
    expect(text).not.toMatch(/^Payment\s/m)
  })

  it('payment: 0 (ค้างชำระ) → ต้องได้ "Unpaid" ไม่ใช่ "Payment" หรือค่าว่าง', () => {
    const data = baseData({
      grandTotal: 11250,
      payments: [{ payment: 0, amount: 0 }]
    })
    const text = buildReceiptText(data)

    expect(text).toContain('Unpaid')
    expect(text).not.toMatch(/^Payment\s/m)
  })
})

describe('buildReceiptText — บรรทัดวัตถุดิบชิดซ้าย (ไม่ชนคอลัมน์เงิน)', () => {
  it('บรรทัดวัตถุดิบขึ้นต้นด้วย 4 ช่องแล้วตามด้วยชื่อวัสดุทันที', () => {
    const text = buildReceiptText(baseData())
    const lines = text.split('\n')

    const goldLine = lines.find((l) => l.includes('WHITE GOLD'))
    const diamondLine = lines.find((l) => l.includes('DIAMOND'))
    const gemLine = lines.find((l) => l.includes('SAPPHIRE'))

    expect(goldLine.startsWith('    WHITE GOLD')).toBe(true)
    expect(diamondLine.startsWith('    DIAMOND')).toBe(true)
    expect(gemLine.startsWith('    SAPPHIRE')).toBe(true)
  })

  it('บรรทัดวัตถุดิบต้องไม่ยาวถึงคอลัมน์ 47 (ขอบขวาต้องว่าง) และไม่มีช่องว่างท้ายบรรทัด', () => {
    const text = buildReceiptText(baseData())
    const lines = text.split('\n')

    const goldLine = lines.find((l) => l.includes('WHITE GOLD'))
    const diamondLine = lines.find((l) => l.includes('DIAMOND'))
    const gemLine = lines.find((l) => l.includes('SAPPHIRE'))
    ;[goldLine, diamondLine, gemLine].forEach((line) => {
      expect(line.length).toBeLessThan(WIDTH)
      expect(line).toBe(line.trimEnd())
    })
  })

  it('วัสดุที่ไม่มีจำนวนเม็ด (ทอง qty ว่าง) น้ำหนักต้องเริ่มคอลัมน์เดียวกับวัสดุที่มีจำนวนเม็ด', () => {
    const text = buildReceiptText(baseData())
    const lines = text.split('\n')

    const goldLine = lines.find((l) => l.includes('WHITE GOLD'))
    const diamondLine = lines.find((l) => l.includes('DIAMOND'))

    expect(goldLine.indexOf('2.97')).toBe(diamondLine.indexOf('0.32'))
  })

  it('ชื่อวัสดุยาว (เช่น DIAMOND (G,VS1)) ทำให้ทุกแถวในใบเดียวกันใช้คอลัมน์ชื่อกว้างเท่ากัน (จำนวน/น้ำหนักยังตรงคอลัมน์)', () => {
    const data = baseData({
      items: [
        baseItem({
          materialSummary: [
            { type: 'Gold', name: 'SIL', qty: '', weight: '4.11 g.' },
            { type: 'Gem', name: 'CZ', qty: '34 pcs', weight: '1.33 ct.' },
            { type: 'Diamond', name: 'DIAMOND (G,VS1)', qty: '24 pcs', weight: '0.41 ct.' }
          ]
        })
      ]
    })
    const lines = buildReceiptText(data).split('\n')

    const silLine = lines.find((l) => l.trimStart().startsWith('SIL'))
    const czLine = lines.find((l) => l.trimStart().startsWith('CZ'))
    const diamondLine = lines.find((l) => l.trimStart().startsWith('DIAMOND'))

    expect(silLine.indexOf('4.11')).toBe(czLine.indexOf('1.33'))
    expect(czLine.indexOf('1.33')).toBe(diamondLine.indexOf('0.41'))
    ;[silLine, czLine, diamondLine].forEach((line) => {
      expect(line.length).toBeLessThan(WIDTH)
    })
  })
})
