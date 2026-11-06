import { test, expect } from '@playwright/test'
import { installApiMocks } from './support/api-mocks.js'
import { seedAuth } from './support/auth.js'
import { buildInvoiceFixture, INVOICE_PAGE_MOCKS } from './fixtures/invoice.js'

// flow เงินของใบแจ้งหนี้ (computeDocumentTotals -> การ์ด "สรุปยอดเงิน")
// กติกา: ไม่ปัดระหว่างทางเลย ปัดครั้งเดียวที่ยอดสุดท้าย 2 ตำแหน่งแบบ half-up
// ถ้าพัง ยอดที่ลูกค้าต้องจ่ายบนใบเพี้ยน

async function openInvoice(page, fx) {
  const api = await installApiMocks(page, {
    ...INVOICE_PAGE_MOCKS,
    'Invoice/Get': fx.invoice,
    'SaleOrder/Get': fx.saleOrder
  })
  await seedAuth(page)
  await page.goto('/invoice-detail?invoiceNumber=' + fx.invoice.invoiceNumber)
  const card = page.locator('.money-summary-card')
  await expect(card.locator('.money-summary-header')).toContainText('ยอดที่ต้องชำระ')
  return { api, card }
}

async function expandCard(card) {
  await card.locator('.money-summary-header button').click()
  await expect(card.locator('.money-summary-body')).toBeVisible()
}

// แถวใน .money-summary-body เรียงตาม label/value: subtotal, discount, surcharge, freight, beforeVat, vat, total
const value = (card, i) => card.locator('.ms-value').nth(i)

test.describe('ยอดรวมใบแจ้งหนี้ ไม่ปัดระหว่างทาง', () => {
  test('3 บรรทัด 10.004 + ส่วนลดพิเศษ 0.002 + ขนส่ง 0.01 + VAT 7% = 32.12 (ถ้าปัดทีละบรรทัดจะได้ 32.11)', async ({ page }) => {
    const fx = buildInvoiceFixture({
      vat: 7,
      specialDiscount: 0.002,
      freightAndInsurance: 0.01,
      lines: [
        { stockNumber: 'E2E-A1', price: 10.004 },
        { stockNumber: 'E2E-A2', price: 10.004 },
        { stockNumber: 'E2E-A3', price: 10.004 }
      ]
    })
    const { api, card } = await openInvoice(page, fx)

    await expect(card.locator('.money-summary-header')).toContainText('32.12 THB')

    await expandCard(card)
    await expect(value(card, 0)).toHaveText('30.01') // subtotal 30.012 แสดง 2 ตำแหน่ง
    await expect(value(card, 1)).toHaveText('-0.00') // ส่วนลดพิเศษ 0.002
    await expect(value(card, 3)).toHaveText('0.01') // ขนส่ง
    await expect(value(card, 4)).toHaveText('30.02') // ก่อน VAT 30.02
    await expect(value(card, 5)).toHaveText('2.10') // VAT 2.1014
    await expect(value(card, 6)).toHaveText('32.12 THB')

    api.assertNoLeak()
  })

  test('ปัดครึ่งขึ้นที่ 1.005 -> 1.01 (Math.round แบบดิบจะได้ 1.00)', async ({ page }) => {
    const fx = buildInvoiceFixture({ lines: [{ stockNumber: 'E2E-B1', price: 1.005 }] })
    const { api, card } = await openInvoice(page, fx)

    await expect(card.locator('.money-summary-header')).toContainText('1.01 THB')
    api.assertNoLeak()
  })

  test('หารอัตราแลกเปลี่ยนไม่ปัดต่อชิ้น: 100 / 3 x 3 ชิ้น = 100.00 (ถ้าปัดต่อชิ้นจะได้ 99.99)', async ({ page }) => {
    const fx = buildInvoiceFixture({
      currencyUnit: 'USD',
      currencyRate: 3,
      lines: [{ stockNumber: 'E2E-C1', price: 100, qty: 3 }]
    })
    const { api, card } = await openInvoice(page, fx)

    await expect(card.locator('.money-summary-header')).toContainText('100.00 USD')
    api.assertNoLeak()
  })
})
