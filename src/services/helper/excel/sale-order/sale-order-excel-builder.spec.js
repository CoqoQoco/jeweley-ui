import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SaleOrderExcelBuilder } from './sale-order-excel-builder.js'

vi.mock('exceljs', () => {
  const Workbook = vi.fn(() => ({
    creator: '',
    created: null,
    addWorksheet: vi.fn(() => ({
      getRow: vi.fn(() => ({ height: 0 })),
      getCell: vi.fn(() => ({
        value: null,
        font: null,
        fill: null,
        alignment: null,
        border: null
      })),
      mergeCells: vi.fn(),
      addImage: vi.fn(),
      getColumn: vi.fn(() => ({ width: 0 }))
    })),
    addImage: vi.fn(() => 1),
    xlsx: { writeBuffer: vi.fn().mockResolvedValue(Buffer.from('')) }
  }))
  return { default: { Workbook } }
})

describe('SaleOrderExcelBuilder', () => {
  describe('calculateSubtotal', () => {
    it('1 item: price=1000, qty=2, discount=0, rate=1 → subtotal=2000', () => {
      const builder = new SaleOrderExcelBuilder({
        items: [{ appraisalPrice: 1000, qty: 2, discountPercent: 0 }]
      })
      expect(builder.subtotal).toBe(2000)
    })

    it('discount 10%: price=1000, qty=1, discount=10, rate=1 → subtotal=900', () => {
      const builder = new SaleOrderExcelBuilder({
        items: [{ appraisalPrice: 1000, qty: 1, discountPercent: 10 }]
      })
      expect(builder.subtotal).toBe(900)
    })

    it('currencyRate=33: price=3300, qty=1, discount=0, rate=33 → subtotal=100', () => {
      const builder = new SaleOrderExcelBuilder(
        { items: [{ appraisalPrice: 3300, qty: 1, discountPercent: 0 }] },
        { currencyRate: 33 }
      )
      expect(builder.subtotal).toBeCloseTo(100, 5)
    })

    it('หลาย items รวมกัน', () => {
      const builder = new SaleOrderExcelBuilder({
        items: [
          { appraisalPrice: 500, qty: 2, discountPercent: 0 },
          { appraisalPrice: 1000, qty: 1, discountPercent: 20 }
        ]
      })
      // (500 * 1 * 2) + (1000 * 0.8 * 1) = 1000 + 800 = 1800
      expect(builder.subtotal).toBe(1800)
    })

    it('items ว่าง → subtotal=0', () => {
      const builder = new SaleOrderExcelBuilder({ items: [] })
      expect(builder.subtotal).toBe(0)
    })

    it('ไม่ส่ง items → subtotal=0', () => {
      const builder = new SaleOrderExcelBuilder({})
      expect(builder.subtotal).toBe(0)
    })
  })

  describe('totals chain', () => {
    it('totalAfterDiscountAndAddition = subtotal - specialDiscount + specialAddition', () => {
      const builder = new SaleOrderExcelBuilder({
        items: [{ appraisalPrice: 1000, qty: 3, discountPercent: 0 }],
        specialDiscount: 200,
        specialAddition: 50
      })
      // subtotal = 3000, totalAfterDiscount = 3000 - 200 + 50 = 2850
      expect(builder.subtotal).toBe(3000)
      expect(builder.totalAfterDiscountAndAddition).toBe(2850)
    })

    it('totalBeforeVat = totalAfterDiscountAndAddition + freightAndInsurance', () => {
      const builder = new SaleOrderExcelBuilder({
        items: [{ appraisalPrice: 1000, qty: 1, discountPercent: 0 }],
        freight: 150
      })
      // subtotal=1000, totalAfterDiscountAndAddition=1000, totalBeforeVat=1150
      expect(builder.totalBeforeVat).toBe(1150)
    })

    it('vatAmount = totalBeforeVat * vatPercent / 100', () => {
      const builder = new SaleOrderExcelBuilder({
        items: [{ appraisalPrice: 1000, qty: 1, discountPercent: 0 }],
        vatPercent: 7
      })
      // totalBeforeVat=1000, vatAmount=70
      expect(builder.vatAmount).toBeCloseTo(70, 5)
    })

    it('totalAmount = totalBeforeVat + vatAmount', () => {
      const builder = new SaleOrderExcelBuilder({
        items: [{ appraisalPrice: 1000, qty: 1, discountPercent: 0 }],
        vatPercent: 7
      })
      expect(builder.totalAmount).toBeCloseTo(1070, 5)
    })
  })

  describe('freight mapping', () => {
    it('ส่ง freight=50 → freightAndInsurance=50', () => {
      const builder = new SaleOrderExcelBuilder({ freight: 50 })
      expect(builder.freightAndInsurance).toBe(50)
    })

    it('ส่งเฉพาะ freightAndInsurance=70 (ไม่มี freight) → 70', () => {
      const builder = new SaleOrderExcelBuilder({ freightAndInsurance: 70 })
      expect(builder.freightAndInsurance).toBe(70)
    })

    it('freight มีค่า ให้ freight ก่อน freightAndInsurance', () => {
      const builder = new SaleOrderExcelBuilder({ freight: 30, freightAndInsurance: 70 })
      expect(builder.freightAndInsurance).toBe(30)
    })
  })

  describe('formatCurrency', () => {
    it('formatCurrency(1234.5) → "1,234.50"', () => {
      const builder = new SaleOrderExcelBuilder({})
      expect(builder.formatCurrency(1234.5)).toBe('1,234.50')
    })

    it('formatCurrency(0) → "0.00"', () => {
      const builder = new SaleOrderExcelBuilder({})
      expect(builder.formatCurrency(0)).toBe('0.00')
    })

    it('formatCurrency(undefined) → "0.00"', () => {
      const builder = new SaleOrderExcelBuilder({})
      expect(builder.formatCurrency(undefined)).toBe('0.00')
    })

    it('formatCurrency(1000000) → "1,000,000.00"', () => {
      const builder = new SaleOrderExcelBuilder({})
      expect(builder.formatCurrency(1000000)).toBe('1,000,000.00')
    })
  })

  describe('numberToWords / convertNumberToWords', () => {
    let builder

    beforeEach(() => {
      builder = new SaleOrderExcelBuilder({}, { currencyUnit: 'THB' })
    })

    it('numberToWords(0) → "ZERO"', () => {
      expect(builder.numberToWords(0)).toBe('ZERO')
    })

    it('numberToWords(1000) → "ONE THOUSAND"', () => {
      expect(builder.numberToWords(1000)).toBe('ONE THOUSAND')
    })

    it('numberToWords(1500) → contains "THOUSAND" and "FIVE HUNDRED"', () => {
      const result = builder.numberToWords(1500)
      expect(result).toContain('THOUSAND')
      expect(result).toContain('FIVE HUNDRED')
    })

    it('convertNumberToWords(0) → starts with "(THB)" and ends with "ONLY"', () => {
      const result = builder.convertNumberToWords(0)
      expect(result.startsWith('(THB)')).toBe(true)
      expect(result.endsWith('ONLY')).toBe(true)
    })

    it('convertNumberToWords(1000) → "(THB) ONE THOUSAND ONLY"', () => {
      expect(builder.convertNumberToWords(1000)).toBe('(THB) ONE THOUSAND ONLY')
    })

    it('convertNumberToWords เรียก Math.floor ก่อน — 1070.5 → 1070', () => {
      const result = builder.convertNumberToWords(1070.5)
      expect(result).toContain('THOUSAND')
      expect(result).toContain('SEVENTY')
    })
  })
})
