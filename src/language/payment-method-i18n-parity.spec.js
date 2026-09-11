import { describe, it, expect } from 'vitest'
import * as saleTh from './view/sale/th.js'
import * as saleEn from './view/sale/en.js'
import * as mobileTh from './view/mobile/th.js'
import * as mobileEn from './view/mobile/en.js'
import reportTh from './view/report/th.js'
import reportEn from './view/report/en.js'

// req #7 (payment rework): key ภาษาไทยกับอังกฤษของกลุ่ม paymentMethod ต้องตรงกันทุกไฟล์ที่แตะในงานนี้
// เทียบเฉพาะ "set ของ key" (sort แล้วเทียบ) ไม่เทียบค่าข้อความ เพราะข้อความ TH/EN ต่างกันโดยตั้งใจ
function expectSameKeys(thObj, enObj, label) {
  const thKeys = Object.keys(thObj).sort()
  const enKeys = Object.keys(enObj).sort()
  expect(thKeys, `${label}: TH keys`).toEqual(enKeys)
}

function pickByPrefix(obj, prefix) {
  return Object.fromEntries(Object.entries(obj).filter(([key]) => key.startsWith(prefix)))
}

describe('payment method i18n key parity (TH vs EN)', () => {
  it('sale.saleOrderList.paymentMethod', () => {
    expectSameKeys(
      saleTh.saleOrderList.paymentMethod,
      saleEn.saleOrderList.paymentMethod,
      'saleOrderList.paymentMethod'
    )
  })

  it('sale.invoiceDetail.paymentMethods', () => {
    expectSameKeys(
      saleTh.invoiceDetail.paymentMethods,
      saleEn.invoiceDetail.paymentMethods,
      'invoiceDetail.paymentMethods'
    )
  })

  it('mobile.pos.paymentMethod*', () => {
    expectSameKeys(
      pickByPrefix(mobileTh.pos, 'paymentMethod'),
      pickByPrefix(mobileEn.pos, 'paymentMethod'),
      'mobile.pos.paymentMethod*'
    )
  })

  it('mobile.sale.invoicePaymentMethod*', () => {
    expectSameKeys(
      pickByPrefix(mobileTh.sale, 'invoicePaymentMethod'),
      pickByPrefix(mobileEn.sale, 'invoicePaymentMethod'),
      'mobile.sale.invoicePaymentMethod*'
    )
  })

  it('mobile.receipt.paymentMethod*', () => {
    expectSameKeys(
      pickByPrefix(mobileTh.receipt, 'paymentMethod'),
      pickByPrefix(mobileEn.receipt, 'paymentMethod'),
      'mobile.receipt.paymentMethod*'
    )
  })

  it('report.saleByChannel.paymentMethod* + paymentUnspecified', () => {
    const pickReport = (obj) => ({
      ...pickByPrefix(obj.saleByChannel, 'paymentMethod'),
      paymentUnspecified: obj.saleByChannel.paymentUnspecified
    })
    expectSameKeys(pickReport(reportTh), pickReport(reportEn), 'report.saleByChannel.paymentMethod*')
  })
})
