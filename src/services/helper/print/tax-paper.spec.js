import { describe, it, expect } from 'vitest'
import { isTaxContinuousPaper, getTaxPaperConfig, defaultTaxVatPercent, isTaxVatPercentLocked, defaultTaxVatMode, isTaxVatModeLocked } from './tax-paper.js'
import { buildContinuousPrintModel } from './continuous-print-payload.js'
import { vi } from 'vitest'

vi.mock('@/services/helper/print/vat-layout-store.js', () => ({
  getVatLayout: vi.fn().mockResolvedValue(null)
}))
vi.mock('@/services/helper/print/bill-layout-store.js', () => ({
  getBillLayout: vi.fn().mockResolvedValue(null)
}))

describe('tax paper config', () => {
  it('recognises both versions only', () => {
    expect(isTaxContinuousPaper('vat-bridge')).toBe(true)
    expect(isTaxContinuousPaper('vat-bridge-v2')).toBe(true)
    expect(isTaxContinuousPaper('bill')).toBe(false)
    expect(isTaxContinuousPaper('a4')).toBe(false)
  })

  it('maps versions to separate layout keys / storage / log type', () => {
    const v1 = getTaxPaperConfig('vat-bridge')
    const v2 = getTaxPaperConfig('vat-bridge-v2')
    expect(v1.layoutKey).toBe('vat')
    expect(v2.layoutKey).toBe('vat-v2')
    expect(v1.logPaperType).toBe('vat')
    expect(v2.logPaperType).toBe('vat-v2')
    expect(v1.offsetStorageKey).toBe('invoice-continuous-offset')
    expect(v1.printerStorageKey).toBe('print-bridge-printer-vat')
    expect(v2.offsetStorageKey).not.toBe(v1.offsetStorageKey)
    expect(v2.printerStorageKey).not.toBe(v1.printerStorageKey)
    expect(getTaxPaperConfig('bill')).toBeNull()
  })
})

describe('defaultTaxVatPercent', () => {
  it('THB with vat 0 => 7', () => {
    expect(defaultTaxVatPercent({ vatPercent: 0, currencyUnit: 'THB' })).toBe(7)
  })
  it('foreign currency with vat 0 => 0', () => {
    expect(defaultTaxVatPercent({ vatPercent: 0, currencyUnit: 'US$' })).toBe(0)
  })
  it('keeps saved vat', () => {
    expect(defaultTaxVatPercent({ vatPercent: 10, currencyUnit: 'US$' })).toBe(10)
  })
  it('MATERIAL is locked to the invoice vat (even 0)', () => {
    expect(isTaxVatPercentLocked({ invoiceType: 'MATERIAL' })).toBe(true)
    expect(isTaxVatPercentLocked({ invoiceType: 'PRODUCT' })).toBe(false)
    expect(defaultTaxVatPercent({ invoiceType: 'MATERIAL', vatPercent: 0, currencyUnit: 'THB' })).toBe(0)
    expect(defaultTaxVatPercent({ invoiceType: 'MATERIAL', vatPercent: 7, currencyUnit: 'THB' })).toBe(7)
  })
})

describe('buildContinuousPrintModel - tax VAT %', () => {
  const invoiceData = { customerName: 'A', currencyRate: 1, vatPercent: 0, currencyUnit: 'THB' }
  const invoiceItems = [{ productNameEN: 'X', qty: 1, appraisalPrice: 14874.76, discountPercent: 0 }]
  const run = (paperSize, printData) => buildContinuousPrintModel(paperSize, {
    invoiceData, invoiceItems, printData, invoiceNo: 'INV1', invoiceDate: '2026-11-20'
  })

  it('uses taxVatPercent and logs it (v1 and v2)', async () => {
    for (const paper of ['vat-bridge', 'vat-bridge-v2']) {
      const { model, logPayload } = await run(paper, { taxVatPercent: 7, taxVatMode: 'exclude' })
      const texts = model.pages[0].map((p) => p.text)
      expect(texts).toContain('1,041.23')
      expect(texts).toContain('15,915.99')
      expect(logPayload.taxVatPercent).toBe(7)
    }
  })

  it('defaults to include for THB vat 0 invoice and logs taxVatMode', async () => {
    const { model, logPayload } = await run('vat-bridge', { taxVatPercent: 7 })
    expect(model.pages[0].map((p) => p.text)).toContain('13,901.64')
    expect(logPayload.taxVatMode).toBe('include')
  })

  it('taxVatPercent 0 prints 0.00 VAT', async () => {
    const { model } = await run('vat-bridge', { taxVatPercent: 0 })
    expect(model.pages[0].map((p) => p.text)).toContain('0.00')
  })

  it('does not clobber bill summaryVatPercent and vice versa', async () => {
    const printData = { taxVatPercent: 7, summaryVatPercent: 3, showVat: true, unitPriceMode: 'tag' }
    const bill = await run('bill', printData)
    expect(bill.logPayload.summaryVatPercent).toBe(3)
    expect(bill.logPayload.taxVatPercent).toBeUndefined()
    const vat = await run('vat-bridge', printData)
    expect(vat.logPayload.taxVatPercent).toBe(7)
    expect(printData.summaryVatPercent).toBe(3)
    expect(printData.taxVatPercent).toBe(7)
  })
})

describe('defaultTaxVatMode (TK202611250002)', () => {
  it('vatIncluded flag => include (even if saved vat is not 0)', () => {
    expect(defaultTaxVatMode({ vatIncluded: true, vatPercent: 0, currencyUnit: 'THB' })).toBe('include')
    expect(defaultTaxVatMode({ vatIncluded: true, vatPercent: 7 })).toBe('include')
  })
  it('old THB product invoice (no flag) saved with vat 0 => include', () => {
    expect(defaultTaxVatMode({ vatPercent: 0, currencyUnit: 'THB' })).toBe('include')
    expect(defaultTaxVatMode({ vatPercent: 0 })).toBe('include')
  })
  it('saved vat 7 => exclude', () => {
    expect(defaultTaxVatMode({ vatPercent: 7, currencyUnit: 'THB' })).toBe('exclude')
  })
  it('US$ => exclude', () => {
    expect(defaultTaxVatMode({ vatPercent: 0, currencyUnit: 'US$' })).toBe('exclude')
  })
  it('MATERIAL => exclude and locked', () => {
    const inv = { invoiceType: 'MATERIAL', vatPercent: 0, currencyUnit: 'THB' }
    expect(defaultTaxVatMode(inv)).toBe('exclude')
    expect(isTaxVatModeLocked(inv)).toBe(true)
    expect(isTaxVatModeLocked({ invoiceType: 'PRODUCT' })).toBe(false)
  })
})
