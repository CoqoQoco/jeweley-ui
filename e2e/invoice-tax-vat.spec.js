import { test, expect } from '@playwright/test'
import { VAT_LAYOUT_DEFAULTS } from '../src/services/helper/print/vat-layout-defaults.js'
import { buildInvoiceFixture } from './fixtures/invoice.js'
import { openBillPrintDrawer, printAndCaptureBridge } from './fixtures/invoice-print.js'

// ใบกำกับภาษีกระดาษต่อเนื่อง: VAT/ยอดรวมที่พิมพ์ต้องถูกต้อง (TK202611200014)
// ใบ THB ที่ vat=0 ต้อง default 7% + ราคารวม VAT แล้ว (include, TK202611250002) / เลือก exclude ได้ / ใบ US$ ต้อง 0% — observable = payload ที่ส่ง print bridge (POST /print)

const PAPER_OLD = 'กระดาษต่อเนื่อง — ใบกำกับภาษี'
const PAPER_V2 = 'กระดาษต่อเนื่อง — ใบกำกับภาษี (แบบใหม่)'
const LINES = [{ stockNumber: 'E2E-T1', price: 14874.76 }]

const EXCLUDE_LABEL = 'ราคายังไม่รวม VAT (บวก VAT ท้ายบิล)'

const footerTexts = (model) => model.pages.at(-1).map((p) => p.text)

test.describe('ใบกำกับภาษีกระดาษต่อเนื่อง VAT', () => {
  test('THB vat=0: default 7% + include -> ถอด VAT: subtotal 13,901.64 / VAT 973.11 / รวม 14,874.75', async ({ page }) => {
    const fx = buildInvoiceFixture({ vat: 0, lines: LINES })
    const { api } = await openBillPrintDrawer(page, fx, { paper: PAPER_OLD })
    const model = await printAndCaptureBridge(page, api)
    const texts = footerTexts(model)
    expect(texts).toContain('13,901.64')
    expect(texts).toContain('973.11')
    expect(texts).toContain('14,874.75')
    expect(texts).not.toContain('15,915.99')
    api.assertNoLeak()
  })

  test('THB vat=0: เลือก exclude -> บวก VAT ท้ายบิลแบบเดิม 14,874.76 / 1,041.23 / 15,915.99', async ({ page }) => {
    const fx = buildInvoiceFixture({ vat: 0, lines: LINES })
    const { api, drawer } = await openBillPrintDrawer(page, fx, { paper: PAPER_OLD })
    await drawer.getByText(EXCLUDE_LABEL, { exact: true }).click()
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
    expect(texts).toContain('973.11')
    expect(texts).toContain('14,874.75')
    const v2 = VAT_LAYOUT_DEFAULTS['vat-v2']
    const lastPage = model.pages.at(-1)
    const grand = lastPage.find((p) => p.text === '14,874.75')
    expect(grand.x).toBeCloseTo(v2.total.x, 2)
    expect(grand.x).not.toBeCloseTo(VAT_LAYOUT_DEFAULTS.vat.total.x, 2)
    const qty = lastPage.find((p) => Math.abs(p.x - v2.totalQty.x) < 0.01 && Math.abs(p.y - v2.totalQty.y) < 0.01)
    expect(qty).toBeTruthy()
    expect(api.callsTo('PrintLayout/vat-v2').length).toBeGreaterThan(0)
    api.assertNoLeak()
  })

  for (const [label, paper] of [['แบบเดิม', PAPER_OLD], ['แบบใหม่ (v2)', PAPER_V2]]) {
    test(`พิมพ์ชื่อ/ที่อยู่/เลขผู้เสียภาษีจาก master ลูกค้า (TK202611280003) ${label}`, async ({ page }) => {
      const fx = buildInvoiceFixture({ vat: 0, lines: LINES })
      Object.assign(fx.invoice, {
        customerName: 'ชื่อเก่าใน invoice',
        customerAddress: 'ที่อยู่เก่า',
        customerTaxId: '1111111111111',
        customerMasterName: 'บริษัท มาสเตอร์ จำกัด',
        customerMasterAddress: '99 ถนนทดสอบ\nแขวงทดสอบ เขตทดสอบ',
        customerMasterTaxId: '0105500000001'
      })
      const { api } = await openBillPrintDrawer(page, fx, { paper })
      const model = await printAndCaptureBridge(page, api)
      const texts = model.pages[0].map((p) => p.text)
      expect(texts).toContain('บริษัท มาสเตอร์ จำกัด')
      if (paper === PAPER_V2) {
        expect(texts).toContain('99 ถนนทดสอบ แขวงทดสอบ เขตทดสอบ')
      } else {
        expect(texts).toContain('99 ถนนทดสอบ')
        expect(texts).toContain('แขวงทดสอบ เขตทดสอบ')
      }
      expect(texts).toContain('0105500000001')
      expect(texts).not.toContain('ชื่อเก่าใน invoice')
      expect(texts).not.toContain('1111111111111')
      api.assertNoLeak()
    })
  }
})
