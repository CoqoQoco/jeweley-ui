import { test, expect } from '@playwright/test'
import { buildInvoiceFixture } from './fixtures/invoice.js'
import { openBillPrintDrawer, printAndCaptureBridge } from './fixtures/invoice-print.js'

// บิลกระดาษต่อเนื่อง (paper 'bill'): VAT ท้ายบิลต้องตรงยอดใบแจ้งหนี้ (TK202611170002 / fix 7ae148db)
// observable = payload ที่ส่ง print bridge (POST /print -> totals) ซึ่งเป็นตัวเลขเดียวกับที่พิมพ์ท้ายบิลจริง
// ถ้าพัง ยอดท้ายบิลเกินจริง 7% เมื่อใบไม่มี VAT (เงินเพี้ยนบนเอกสารที่ส่งลูกค้า)

const LINES = [
  { stockNumber: 'E2E-V1', price: 1000 },
  { stockNumber: 'E2E-V2', price: 500 }
]

test.describe('บิลกระดาษต่อเนื่อง VAT ท้ายบิล', () => {
  test('ใบมี VAT 7%: ท้ายบิล subtotal 1500 / VAT 105 / รวม 1605 ตรงยอดใบแจ้งหนี้ ไม่มีคำเตือน', async ({ page }) => {
    const fx = buildInvoiceFixture({ vat: 7, lines: LINES })
    const { api, drawer } = await openBillPrintDrawer(page, fx)

    await expect(drawer.locator('.bill-element-group').filter({ hasText: 'VAT สรุป' })).toBeVisible()
    await expect(drawer.getByText('ไม่ตรงกับยอดใบแจ้งหนี้')).toHaveCount(0)
    const model = await printAndCaptureBridge(page, api)
    expect(model.totals).toEqual({ subtotal: 1500, vat: 105, grandTotal: 1605 })

    const footer = model.pages.at(-1).map((p) => p.text)
    expect(footer).toContain('1,605.00')
    expect(footer).toContain('105.00')
    api.assertNoLeak()
  })

  test('ใบ VAT 0 + ราคาป้าย: ปิด VAT ท้ายบิลให้ -> VAT 0 รวม 1500 (ไม่ใช่ 1605) และไม่มีคำเตือน', async ({ page }) => {
    const fx = buildInvoiceFixture({ vat: 0, lines: LINES })
    const { api, drawer } = await openBillPrintDrawer(page, fx)

    await expect(drawer.locator('.bill-element-group').filter({ hasText: 'VAT สรุป' })).toBeVisible()
    await expect(drawer.getByText('ไม่ตรงกับยอดใบแจ้งหนี้')).toHaveCount(0)
    const model = await printAndCaptureBridge(page, api)
    expect(model.totals).toEqual({ subtotal: 1500, vat: 0, grandTotal: 1500 })
    expect(model.pages.at(-1).map((p) => p.text)).toContain('1,500.00')
    expect(model.pages.at(-1).map((p) => p.text)).not.toContain('1,605.00')
    api.assertNoLeak()
  })

  test('ใบ VAT 0 แต่ผู้ใช้เปิด VAT ท้ายบิลเอง: ขึ้นคำเตือน 1,605.00 vs 1,500.00 และกดปิด VAT ท้ายบิลแล้วหาย พิมพ์ได้ 1,500', async ({ page }) => {
    const fx = buildInvoiceFixture({ vat: 0, lines: LINES })
    const { api, drawer } = await openBillPrintDrawer(page, fx)

    const footerVat = drawer.locator('.bill-element-group').filter({ hasText: 'VAT สรุป' })
    await footerVat.getByText('VAT', { exact: true }).click()

    const warning = drawer.locator('.bill-mismatch-warning')
    await expect(warning).toContainText('ยอดรวมบนบิล 1,605.00 ไม่ตรงกับยอดใบแจ้งหนี้ 1,500.00')

    await warning.getByRole('button', { name: 'ปิด VAT ท้ายบิล' }).click()
    await expect(warning).toHaveCount(0)
    const fixed = await printAndCaptureBridge(page, api)
    expect(fixed.totals).toEqual({ subtotal: 1500, vat: 0, grandTotal: 1500 })
    api.assertNoLeak()
  })
})
