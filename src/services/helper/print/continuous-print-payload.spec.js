import { describe, it, expect } from 'vitest'
import { buildContinuousPrintModel, resolvePrintCustomer } from './continuous-print-payload.js'

const snapshot = { customerName: 'Snap Co', customerAddress: 'Snap addr', customerTaxId: '1111111111111' }
const master = { customerMasterName: 'Master Co', customerMasterAddress: 'Master addr', customerMasterTaxId: '2222222222222' }

describe('resolvePrintCustomer', () => {
  it('uses master when present', () => {
    expect(resolvePrintCustomer({ ...snapshot, ...master })).toMatchObject({ name: 'Master Co', address: 'Master addr', taxId: '2222222222222' })
  })

  it('falls back per field when master is empty', () => {
    expect(resolvePrintCustomer({ ...snapshot, customerMasterName: 'Master Co', customerMasterAddress: '', customerMasterTaxId: null }))
      .toMatchObject({ name: 'Master Co', address: 'Snap addr', taxId: '1111111111111' })
  })

  it('walk-in (all master null) uses snapshot', () => {
    expect(resolvePrintCustomer({ ...snapshot, customerMasterName: null, customerMasterAddress: null, customerMasterTaxId: null }))
      .toMatchObject({ name: 'Snap Co', address: 'Snap addr', taxId: '1111111111111' })
  })

  it('WALKIN customer code ignores master and uses snapshot', () => {
    const r = resolvePrintCustomer({ ...snapshot, ...master, customerCode: 'walkin' })
    expect(r).toMatchObject({ name: 'Snap Co', address: 'Snap addr', taxId: '1111111111111' })
    expect(r.source).toEqual({ name: 'snapshot', address: 'snapshot', taxId: 'snapshot' })
  })

  it('reports source per field', () => {
    const r = resolvePrintCustomer({ ...snapshot, customerMasterName: 'Master Co' })
    expect(r.source).toEqual({ name: 'master', address: 'snapshot', taxId: 'snapshot' })
  })

  it('returns empty strings when nothing available', () => {
    expect(resolvePrintCustomer({})).toMatchObject({ name: '', address: '', taxId: '' })
  })
})

const items = [{ productNameEN: 'X', qty: 1, appraisalPrice: 100, discountPercent: 0 }]
const texts = (model) => model.pages[0].map((p) => p.text)

async function build(paperSize, invoiceData) {
  const { model } = await buildContinuousPrintModel(paperSize, {
    invoiceData: { currencyRate: 1, vatPercent: 7, ...invoiceData },
    invoiceItems: items,
    printData: { showCustomerName: true, showCustomerTaxId: true, showCustomerAddress: true },
    invoiceNo: 'INV1',
    invoiceDate: '2026-11-28'
  })
  return model
}

describe('buildContinuousPrintModel - customer from master', () => {
  for (const paper of ['bill', 'vat-bridge', 'vat-bridge-v2']) {
    it(`${paper}: master name/address/tax id printed, snapshot not`, async () => {
      const t = texts(await build(paper, { ...snapshot, ...master }))
      expect(t).toContain('Master Co')
      expect(t).toContain('Master addr')
      expect(t).toContain('2222222222222')
      expect(t).not.toContain('Snap Co')
      expect(t).not.toContain('1111111111111')
    })

    it(`${paper}: walk-in prints snapshot`, async () => {
      const t = texts(await build(paper, { ...snapshot, customerMasterName: null, customerMasterAddress: null, customerMasterTaxId: null }))
      expect(t).toContain('Snap Co')
      expect(t).toContain('Snap addr')
      expect(t).toContain('1111111111111')
    })
  }
})

describe('buildContinuousPrintModel - log payload customer', () => {
  for (const paper of ['bill', 'vat-bridge']) {
    it(`${paper}: logPayload.customer holds printed values and sources`, async () => {
      const { logPayload } = await buildContinuousPrintModel(paper, {
        invoiceData: { currencyRate: 1, ...snapshot, ...master },
        invoiceItems: items,
        printData: {},
        invoiceNo: 'INV1',
        invoiceDate: '2026-11-28'
      })
      expect(logPayload.customer).toEqual({
        name: 'Master Co', address: 'Master addr', taxId: '2222222222222',
        source: { name: 'master', address: 'master', taxId: 'master' }
      })
    })
  }
})
