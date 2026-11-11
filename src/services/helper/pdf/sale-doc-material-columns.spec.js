import { describe, it, expect, vi } from 'vitest'
import { SaleOrderPdfBuilder } from './sale-order/sale-order-pdf-builder.js'
import { InvoicePdfBuilder as QuotationPdfBuilder } from './quotation/quotation-pdf-builder.js'
import { InvoicePdfBuilder } from './invoice/invoice-pdf-builder.js'

vi.mock('@/config/company-info.js', () => ({
  COMPANY_INFO: { name: 'Test Co', address: '', phone: '', fax: '', email: '' },
  loadCompanyInfo: vi.fn().mockResolvedValue({ info: {} })
}))

const silverItems = [
  {
    stockNumber: 'S1',
    productionType: 'Silver',
    appraisalPrice: 100,
    discountPercent: 0,
    qty: 1,
    materials: [
      { type: 'Silver', typeCode: 'SV', qty: 1, weight: 1.82, weightUnit: 'g.' },
      { type: 'Gem', typeCode: 'Cubic Zirconia', qty: 14, weight: 0.41, weightUnit: 'ct.' },
      { type: 'Gem', typeCode: 'Peridot', qty: 1, weight: 1.68, weightUnit: 'ct.' }
    ]
  }
]
const goldItems = [
  {
    stockNumber: 'G1',
    productionType: 'Yellow Gold',
    appraisalPrice: 100,
    discountPercent: 0,
    qty: 1,
    materials: [
      { type: 'Gold', typeCode: 'YG', weight: 3 },
      { type: 'Diamond', typeCode: 'VS', qty: 2, weight: 0.5 }
    ]
  }
]

const make = {
  saleOrder: (items) => new SaleOrderPdfBuilder({ items }, { currencyUnit: 'USD', currencyRate: 1 }),
  quotation: (items) =>
    new QuotationPdfBuilder(items, {}, '2026-11-06', 0, 0, 'Q1', 'USD', 1, 10),
  invoice: (items) => new InvoicePdfBuilder(items, {}, '2026-11-06', {}, 'USD', 1, 'INV1', 10)
}

describe.each(Object.keys(make))('%s material columns', (name) => {
  it('เอกสารเงินล้วน: header Silver/CZ และยอดรวมถูกคอลัมน์', () => {
    const body = make[name](silverItems).buildRegularTableBody(silverItems, 0)
    expect(body[0][4].text).toBe('Silver (gms)')
    expect(body[0][5].text).toBe('CZ (cts)')
    expect(body[0][6].text).toBe('Gem (cts)')
    const total = body[body.length - 1]
    expect(total[4].text).toBe('1.82')
    expect(total[5].text).toBe('0.410')
    expect(total[6].text).toBe('1.68')
  })

  it('เอกสารทอง: header เดิม ไม่เปลี่ยน', () => {
    const body = make[name](goldItems).buildRegularTableBody(goldItems, 0)
    expect(body[0][4].text).toBe('Gold (gms)')
    expect(body[0][5].text).toBe('Diamond (cts)')
    const total = body[body.length - 1]
    expect(total[4].text).toBe('3.00')
    expect(total[5].text).toBe('0.500')
  })
})

describe('invoice NET WEIGHT', () => {
  const findNet = (node) => JSON.stringify(node).match(/NET WEIGHT OF MERCHANDISES ([\d.]+)/)?.[1]
  it('เงินล้วนนับน้ำหนักเงินในยอด NET', () => {
    const net = findNet(make.invoice(silverItems).getSummarySection())
    expect(net).toBe(((0.41 + 1.68) / 5 + 1.82).toFixed(2))
  })
  it('ทองล้วนสูตรเดิม', () => {
    const net = findNet(make.invoice(goldItems).getSummarySection())
    expect(net).toBe((0.5 / 5 + 3).toFixed(2))
  })
})
