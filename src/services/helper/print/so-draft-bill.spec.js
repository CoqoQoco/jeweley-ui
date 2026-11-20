import { describe, it, expect } from 'vitest'
import { DRAFT_INVOICE_NUMBER, buildSoDraftInvoiceData, computeInvoiceTotalExSpecial } from './so-draft-bill.js'

describe('so-draft-bill', () => {
  it('maps SO data and modal special amounts into invoiceData', () => {
    const data = buildSoDraftInvoiceData({
      saleOrderData: { number: 'SO-1', customerName: 'A', customerAddress: 'addr', customerTaxId: '123', currencyRate: '35.5', currencyUnit: 'USD' },
      specialDiscount: '10',
      specialAddition: 5,
      freightAndInsurance: null,
      vatPercent: '7'
    })
    expect(data).toEqual({
      soNumber: 'SO-1',
      customerName: 'A',
      customerAddress: 'addr',
      customerTaxId: '123',
      currencyUnit: 'USD',
      currencyRate: 35.5,
      specialDiscount: 10,
      specialAddition: 5,
      freightAndInsurance: 0,
      vatPercent: 7
    })
  })

  it('falls back to soNumber and safe defaults', () => {
    const data = buildSoDraftInvoiceData({ saleOrderData: { soNumber: 'SO-2' } })
    expect(data.soNumber).toBe('SO-2')
    expect(data.customerTaxId).toBe('')
    expect(data.currencyRate).toBe(1)
    expect(data.vatPercent).toBe(0)
    expect(buildSoDraftInvoiceData({}).soNumber).toBe('')
  })

  it('computes total ex special with the invoice-detail formula', () => {
    expect(computeInvoiceTotalExSpecial(1000, 7)).toBe(1070)
    expect(computeInvoiceTotalExSpecial('1000', undefined)).toBe(1000)
    expect(computeInvoiceTotalExSpecial(null, 7)).toBe(0)
  })

  it('exposes DRAFT constant', () => {
    expect(DRAFT_INVOICE_NUMBER).toBe('DRAFT')
  })
})
