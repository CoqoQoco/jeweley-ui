import { expect } from '@playwright/test'
import { installApiMocks } from '../support/api-mocks.js'
import { seedAuth } from '../support/auth.js'
import { INVOICE_PAGE_MOCKS } from './invoice.js'

/**
 * เปิดหน้า /invoice-detail -> drawer "ยืนยันพิมพ์" -> เลือกกระดาษต่อเนื่อง (bill)
 * ดัก POST ไป print bridge (/print) เป็น payload ที่ส่งไปเครื่องพิมพ์จริง: { pages: [[{text,x,y,...}]], totals }
 * ทุกอย่างอยู่บน mock (ไม่แตะ API จริง :2001 / bridge จริง :9443)
 */
export async function openBillPrintDrawer(page, fx, { paper = 'กระดาษต่อเนื่อง — ใบแจ้งหนี้' } = {}) {
  const api = await installApiMocks(page, {
    ...INVOICE_PAGE_MOCKS,
    'Invoice/Get': fx.invoice,
    'SaleOrder/Get': fx.saleOrder,
    'Invoice/PrintLog/List': { data: [], total: 0 },
    'Invoice/PrintLog/Create': {},
    print: { success: true }
  })
  await seedAuth(page)
  await page.goto('/invoice-detail?invoiceNumber=' + fx.invoice.invoiceNumber)
  await page.getByRole('button', { name: 'พิมพ์ใบแจ้งหนี้' }).first().click()
  const drawer = page.locator('.invoice-confirm-print-container')
  await drawer.waitFor()
  await drawer.getByText(paper, { exact: true }).click()
  return { api, drawer }
}

/** กด "พิมพ์เอกสาร" แล้วคืน payload ที่ส่งเข้า bridge */
export async function printAndCaptureBridge(page, api) {
  const before = api.callsTo('print').length
  await page.getByRole('button', { name: 'พิมพ์เอกสาร' }).click()
  await expectPrinted(api, before)
  return api.callsTo('print').at(-1).body
}

async function expectPrinted(api, before) {
  await expect.poll(() => api.callsTo('print').length).toBeGreaterThan(before)
}

/** primitives ของหน้าแรก จัดเป็นแถว (key = y) */
export function rowsByY(model) {
  const rows = new Map()
  for (const p of model.pages[0]) {
    const k = p.y.toFixed(4)
    if (!rows.has(k)) rows.set(k, [])
    rows.get(k).push(p.text)
  }
  return rows
}
