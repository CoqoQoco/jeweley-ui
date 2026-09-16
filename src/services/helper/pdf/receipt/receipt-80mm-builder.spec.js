import { describe, it, expect } from 'vitest'
import { Receipt80mmBuilder } from './receipt-80mm-builder.js'
import { i18n } from '@/plugins/i18n/config.js'

function t(key, params) {
  return i18n.global.t(`view.mobile.receipt.${key}`, params)
}

function baseItem(overrides = {}) {
  return {
    stockNumber: 'DK-18K-20A-19960',
    description: 'Sapphire ring 18k white gold',
    appraisalPrice: 11250,
    discountPercent: 0,
    qty: 1,
    ...overrides
  }
}

function baseData(overrides = {}) {
  return {
    invoiceNumber: 'INV0000123',
    date: '2026-09-16T10:00:00Z',
    customer: { name: 'Test Customer' },
    items: [baseItem()],
    payments: [],
    currencyUnit: 'THB',
    ...overrides
  }
}

// หา kvRow จาก label ที่คอลัมน์แรก (columns[0].text)
function findRowByLabel(rows, label) {
  return rows.find((row) => row?.columns?.[0]?.text === label)
}

describe('Receipt80mmBuilder — มัดจำ (Deposit)', () => {
  it('มีมัดจำเท่ากับยอดเต็ม (ไม่มี payments) → remainingAmount = 0 และ hasSignatureBlock() = true', () => {
    const builder = new Receipt80mmBuilder(baseData({ grandTotal: 11250, deposit: 11250 }))

    expect(builder.remainingAmount).toBe(0)
    expect(builder.hasSignatureBlock()).toBe(true)
  })

  it('มีมัดจำบางส่วน (น้อยกว่ายอดเต็ม, ไม่มี payments อื่น) → remainingAmount = grand - deposit', () => {
    const builder = new Receipt80mmBuilder(baseData({ grandTotal: 11250, deposit: 5000 }))

    expect(builder.remainingAmount).toBe(6250)
    expect(builder.hasSignatureBlock()).toBe(false)
  })

  it('มีมัดจำ + payments อื่นรวมกันครบยอด → remainingAmount = grand - deposit - payments <= 0', () => {
    const builder = new Receipt80mmBuilder(
      baseData({ grandTotal: 11250, deposit: 5000, payments: [{ payment: 1, amount: 6250 }] })
    )

    expect(builder.remainingAmount).toBe(0)
    expect(builder.hasSignatureBlock()).toBe(true)
  })

  it('ไม่มีมัดจำ (ไม่ส่ง deposit) → deposit = 0 และ remainingAmount นับเฉพาะ payments เหมือนเดิม', () => {
    const builder = new Receipt80mmBuilder(
      baseData({ grandTotal: 11250, payments: [{ payment: 1, amount: 11250 }] })
    )

    expect(builder.deposit).toBe(0)
    expect(builder.remainingAmount).toBe(0)
  })

  it('getPaymentContent() แสดงแถวมัดจำเมื่อมี deposit > 0', () => {
    const builder = new Receipt80mmBuilder(baseData({ grandTotal: 11250, deposit: 5000 }))
    const rows = builder.getPaymentContent()

    const depositRow = findRowByLabel(rows, t('depositApplied'))
    expect(depositRow).toBeDefined()
    expect(depositRow.columns[1].text).toBe('5,000.00')
  })

  it('getPaymentContent() ไม่แสดงแถวมัดจำเมื่อ deposit = 0', () => {
    const builder = new Receipt80mmBuilder(baseData({ grandTotal: 11250 }))
    const rows = builder.getPaymentContent()

    const depositRow = findRowByLabel(rows, t('depositApplied'))
    expect(depositRow).toBeUndefined()
  })
})
