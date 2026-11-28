import { test, expect } from '@playwright/test'
import { installApiMocks } from './support/api-mocks.js'
import { seedAuth } from './support/auth.js'
import { buildInvoiceFixture, INVOICE_PAGE_MOCKS } from './fixtures/invoice.js'

// flow เงินของใบแจ้งหนี้ (computeInvoiceTotals -> การ์ด "สรุปยอดเงิน")
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

  test('vatIncluded INV261118022 (21 แถว ราคารวม VAT): ก่อน VAT 347,214.94 / VAT 24,305.05 / รวม 371,519.99', async ({ page }) => {
    const prices = [63400, 35040, 47840, 47920, 7920, 16480, 9360, 16000, 15880, 10480, 8720, 10280, 15840, 9520, 8200, 7480, 7360, 7560, 10720, 8720, 6800]
    const fx = buildInvoiceFixture({
      vatIncluded: true,
      lines: prices.map((price, i) => ({ stockNumber: `E2E-I${i + 1}`, price }))
    })
    const { api, card } = await openInvoice(page, fx)

    await expect(card.locator('.money-summary-header')).toContainText('371,519.99 THB')
    await expandCard(card)
    await expect(card.locator('.ms-label').first()).toHaveText('ราคารวม (ก่อน VAT)')
    await expect(value(card, 0)).toHaveText('347,214.94')
    await expect(value(card, 4)).toHaveText('347,214.94')
    await expect(card.locator('.ms-label').nth(5)).toHaveText('VAT 7%')
    await expect(value(card, 5)).toHaveText('24,305.05')
    await expect(value(card, 6)).toHaveText('371,519.99 THB')

    api.assertNoLeak()
  })

  test('vatIncluded แถว 1424/3008/1616: 5,652.33 / 395.66 / 6,047.99 (ใบเก่า INV261112012 เคยได้ 5,652.34)', async ({ page }) => {
    const fx = buildInvoiceFixture({
      vatIncluded: true,
      lines: [
        { stockNumber: 'E2E-J1', price: 1424 },
        { stockNumber: 'E2E-J2', price: 3008 },
        { stockNumber: 'E2E-J3', price: 1616 }
      ]
    })
    const { api, card } = await openInvoice(page, fx)

    await expect(card.locator('.money-summary-header')).toContainText('6,047.99 THB')
    await expandCard(card)
    await expect(value(card, 0)).toHaveText('5,652.33')
    await expect(value(card, 5)).toHaveText('395.66')

    api.assertNoLeak()
  })

  test('vatIncluded ส่วนลดพิเศษรวม VAT: 50,010.24 ลด 10.24 -> ส่วนลดก่อน VAT 9.57 / VAT 3,271.03 / รวม 50,000.00', async ({ page }) => {
    const fx = buildInvoiceFixture({
      vatIncluded: true,
      specialDiscount: 10.24,
      lines: [{ stockNumber: 'E2E-K1', price: 50010.24 }]
    })
    const { api, card } = await openInvoice(page, fx)

    await expect(card.locator('.money-summary-header')).toContainText('50,000.00 THB')
    await expandCard(card)
    await expect(value(card, 0)).toHaveText('46,738.54')
    await expect(value(card, 1)).toHaveText('-9.57')
    await expect(value(card, 4)).toHaveText('46,728.97')
    await expect(value(card, 5)).toHaveText('3,271.03')

    api.assertNoLeak()
  })
})
