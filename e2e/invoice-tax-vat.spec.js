import { test, expect } from '@playwright/test'
import { VAT_LAYOUT_DEFAULTS } from '../src/services/helper/print/vat-layout-defaults.js'
import { buildInvoiceFixture } from './fixtures/invoice.js'
import { openBillPrintDrawer, printAndCaptureBridge } from './fixtures/invoice-print.js'

// ใบกำกับภาษีกระดาษต่อเนื่อง: VAT/ยอดรวมที่พิมพ์ต้องถูกต้อง (TK202611200014)
// ใบ THB ที่ vat=0 ต้อง default 7% / ใบ US$ ต้อง 0% — observable = payload ที่ส่ง print bridge (POST /print)

const PAPER_OLD = 'กระดาษต่อเนื่อง — ใบกำกับภาษี'
const PAPER_V2 = 'กระดาษต่อเนื่อง — ใบกำกับภาษี (แบบใหม่)'
const LINES = [{ stockNumber: 'E2E-T1', price: 14874.76 }]

const footerTexts = (model) => model.pages.at(-1).map((p) => p.text)

test.describe('ใบกำกับภาษีกระดาษต่อเนื่อง VAT', () => {
  test('THB vat=0: default 7% -> subtotal 14,874.76 / VAT 1,041.23 / รวม 15,915.99', async ({ page }) => {
    const fx = buildInvoiceFixture({ vat: 0, lines: LINES })
    const { api } = await openBillPrintDrawer(page, fx, { paper: PAPER_OLD })
    const model = await printAndCaptureBridge(page, api)
    const texts = footerTexts(model)
    expect(texts).toContain('14,874.76')
    expect(texts).toContain('1,041.23')
    expect(texts).toContain('15,915.99')
    api.assertNoLeak()
  })

  test('ใบ US$: VAT 0 -> รวม = subtotal ไม่บวก 7%', async ({ page }) => {
    const fx = buildInvoiceFixture({ vat: 0, currencyUnit: 'USD', currencyRate: 1, lines: LINES })
    const { api } = await openBillPrintDrawer(page, fx, { paper: PAPER_OLD })
    const model = await printAndCaptureBridge(page, api)
    const texts = footerTexts(model)
    expect(texts).toContain('14,874.76')
    expect(texts).toContain('0.00')
    expect(texts).not.toContain('1,041.23')
    expect(texts).not.toContain('15,915.99')
    api.assertNoLeak()
  })

  test('แบบใหม่ (v2): ส่งเข้า bridge generic print (ไม่ใช่ PDF) ยอดเท่ากัน', async ({ page }) => {
    const fx = buildInvoiceFixture({ vat: 0, lines: LINES })
    const { api } = await openBillPrintDrawer(page, fx, { paper: PAPER_V2 })
    const model = await printAndCaptureBridge(page, api)
    expect(Array.isArray(model.pages)).toBe(true)
    const texts = footerTexts(model)
    expect(texts).toContain('1,041.23')
    expect(texts).toContain('15,915.99')
    const v2 = VAT_LAYOUT_DEFAULTS['vat-v2']
    const lastPage = model.pages.at(-1)
    const grand = lastPage.find((p) => p.text === '15,915.99')
    expect(grand.x).toBeCloseTo(v2.total.x, 2)
    expect(grand.x).not.toBeCloseTo(VAT_LAYOUT_DEFAULTS.vat.total.x, 2)
    const qty = lastPage.find((p) => Math.abs(p.x - v2.totalQty.x) < 0.01 && Math.abs(p.y - v2.totalQty.y) < 0.01)
    expect(qty).toBeTruthy()
    expect(api.callsTo('PrintLayout/vat-v2').length).toBeGreaterThan(0)
    api.assertNoLeak()
  })
})
