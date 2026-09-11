import { describe, it, expect } from 'vitest'
import {
  PAYMENT_METHODS,
  PAYMENT_METHOD_BY_CODE,
  getPaymentApiName,
  getPaymentLabelKey
} from './payment-methods.js'

const ASCII_ONLY = /^[\x20-\x7E]+$/

describe('payment-methods constants', () => {
  it('ครอบรหัส 0-5 ครบทุกตัว', () => {
    expect(Object.keys(PAYMENT_METHOD_BY_CODE).map(Number).sort()).toEqual([0, 1, 2, 3, 4, 5])
  })

  it('ทุกรหัสมี apiName ไม่ว่าง', () => {
    Object.values(PAYMENT_METHOD_BY_CODE).forEach((method) => {
      expect(method.apiName).toBeTruthy()
      expect(String(method.apiName).trim().length).toBeGreaterThan(0)
    })
  })

  it('ทุกรหัสมี receiptLabel เป็น ASCII ล้วน', () => {
    Object.values(PAYMENT_METHOD_BY_CODE).forEach((method) => {
      expect(method.receiptLabel).toMatch(ASCII_ONLY)
    })
  })

  it('selectable ได้ 5 ตัว ไม่มีรหัส 0', () => {
    const selectableCodes = Object.values(PAYMENT_METHOD_BY_CODE)
      .filter((m) => m.selectable)
      .map((m) => m.code)
      .sort()

    expect(selectableCodes).toEqual([1, 2, 3, 4, 5])
    expect(selectableCodes).not.toContain(0)
  })

  it('รหัส 0 selectable/recordableAsReceipt/settlesImmediately ต้องเป็น false ทั้งหมด', () => {
    const unpaid = PAYMENT_METHOD_BY_CODE[0]
    expect(unpaid.selectable).toBe(false)
    expect(unpaid.recordableAsReceipt).toBe(false)
    expect(unpaid.settlesImmediately).toBe(false)
  })

  it('apiName ของรหัส 5 ต้องไม่เท่ากับ label ที่ถูกเปลี่ยนคำใหม่ (กันบั๊กภาษารั่วลง DB กลับมา)', () => {
    const credit = PAYMENT_METHOD_BY_CODE[5]
    expect(credit.apiName).toBe('เครดิต (Credit Term)')
    expect(credit.apiName).not.toBe('ยังไม่ได้รับเงิน (ขายเชื่อ/เครดิต)')
    expect(credit.apiName).not.toBe('ยังไม่ได้รับเงิน (เครดิต)')
  })

  it('getPaymentApiName คืนค่าตรงกับ PAYMENT_METHOD_BY_CODE ทุกรหัส และ null เมื่อไม่รู้จักรหัส', () => {
    PAYMENT_METHODS.forEach((m) => {
      expect(getPaymentApiName(m.code)).toBe(m.apiName)
    })
    expect(getPaymentApiName(0)).toBe('ค้างชำระ')
    expect(getPaymentApiName(999)).toBe(null)
  })

  it('getPaymentLabelKey คืนค่าตรงกับ PAYMENT_METHOD_BY_CODE ทุกรหัส', () => {
    PAYMENT_METHODS.forEach((m) => {
      expect(getPaymentLabelKey(m.code)).toBe(m.labelKey)
    })
    expect(getPaymentLabelKey(999)).toBe(null)
  })

  it('PAYMENT_METHODS (list ตัวเลือกที่กดได้) มี 5 ตัวเท่านั้น ไม่มีรหัส 0', () => {
    expect(PAYMENT_METHODS.length).toBe(5)
    expect(PAYMENT_METHODS.some((m) => m.code === 0)).toBe(false)
  })
})
