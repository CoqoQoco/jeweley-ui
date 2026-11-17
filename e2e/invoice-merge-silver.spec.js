import { test, expect } from '@playwright/test'
import { buildInvoiceFixture } from './fixtures/invoice.js'
import { openBillPrintDrawer, printAndCaptureBridge, rowsByY } from './fixtures/invoice-print.js'

// รวมบรรทัดสินค้าเงินแบบเดียวกันตอนพิมพ์ใบแจ้งหนี้ (TK202611170003 / f4711fc9 + 35fdca7b)
// observable = payload ที่ส่ง print bridge (POST /print) ของบิลกระดาษต่อเนื่อง: เป็นทางเดียวกับ A4 ที่ผ่าน
// groupInvoiceLinesForPrint ตัวเดียวกัน แต่ deterministic กว่า (ไม่ต้องแกะ PDF) -- primitives รายบรรทัด + totals
// ถ้าพัง บิลลูกค้าออกหลายบรรทัดแทนบรรทัดเดียว หรือยอด/จำนวนรวมเพี้ยน
// หมายเหตุ: น้ำหนักรวมท้ายใบ (totalMaterials) แสดงเฉพาะ A4 PDF ไม่อยู่ใน payload บิล -- ครอบด้วย vitest
// (invoice-line-merge.spec.js / invoice-pdf-builder.spec.js)

const SILVER = [{ type: 'Silver', weight: 1, weightUnit: 'g' }]

// 3 บรรทัดแบบเดียวกัน (productNumber ต่างกันแค่ -N, mold ท้าย -SIL บางล็อต, ราคา 100 เท่ากัน)
// + 1 บรรทัดราคาต่าง (200) + 1 บรรทัดคนละแบบ (SLV200) -> สองบรรทัดหลังต้องไม่ถูกรวม
const SPECS = [
  { stockNumber: 'E2E-S1', price: 100, qty: 2, productNumber: 'SLV100-1', mold: 'M100-SIL' },
  { stockNumber: 'E2E-S2', price: 100, qty: 1, productNumber: 'SLV100-2', mold: 'M100' },
  { stockNumber: 'E2E-S3', price: 100, qty: 1, productNumber: 'SLV100-3', mold: 'M100-SIL' },
  { stockNumber: 'E2E-S4', price: 200, qty: 1, productNumber: 'SLV100-4', mold: 'M100' },
  { stockNumber: 'E2E-S5', price: 100, qty: 1, productNumber: 'SLV200-1', mold: 'M200' }
]

function silverFixture() {
  const fx = buildInvoiceFixture({ vat: 0, lines: SPECS })
  const data = JSON.parse(fx.saleOrder.data)
  data.stockItems = data.stockItems.map((it, i) => ({
    ...it,
    productNumber: SPECS[i].productNumber,
    mold: SPECS[i].mold,
    productNameEN: `Silver ring ${i + 1}`,
    productionType: 'Silver',
    materials: SILVER
  }))
  fx.saleOrder.data = JSON.stringify(data)
  return fx
}

const MERGE_LABEL = 'รวมบรรทัดสินค้าเงินแบบเดียวกัน'

// แถวสินค้า = แถวที่มีเลขสต็อก E2E-S*
function itemRows(model) {
  return [...rowsByY(model).values()].filter((texts) => texts.some((t) => /^E2E-S\d+/.test(t)))
}

test.describe('รวมบรรทัดสินค้าเงินตอนพิมพ์ใบแจ้งหนี้', () => {
  test('ติ๊กรวม: 5 บรรทัด -> 3 บรรทัด (SLV100 x4 ชิ้น = 400) และยอดรวม/จำนวนรวมเท่ากับไม่รวม', async ({ page }) => {
    const { api, drawer } = await openBillPrintDrawer(page, silverFixture())
    await expect(drawer.getByText(MERGE_LABEL)).toBeVisible()

    const model = await printAndCaptureBridge(page, api)
    const rows = itemRows(model)
    expect(rows).toHaveLength(3)

    const merged = rows[0]
    expect(merged).toContain('SLV100-1')
    expect(merged).toContain('4') // qty 2+1+1
    expect(merged).toContain('400.00') // 100 x 4
    expect(rows[1]).toContain('SLV100-4')
    expect(rows[1]).toContain('200.00')
    expect(rows[2]).toContain('SLV200-1')

    expect(model.totals).toEqual({ subtotal: 700, vat: 0, grandTotal: 700 })
    expect(model.pages[0].map((p) => p.text)).toContain('6') // จำนวนรวมท้ายบิล 4+1+1
    api.assertNoLeak()
  })

  test('เอาติ๊กออก: พิมพ์แยก 5 บรรทัดเหมือนเดิม และยอดรวม/จำนวนรวมเท่ากับตอนรวม', async ({ page }) => {
    const { api, drawer } = await openBillPrintDrawer(page, silverFixture())
    await drawer.getByText(MERGE_LABEL).click()

    const model = await printAndCaptureBridge(page, api)
    const rows = itemRows(model)
    expect(rows).toHaveLength(5)
    expect(rows.map((r) => r.find((t) => /^SLV/.test(t)))).toEqual([
      'SLV100-1', 'SLV100-2', 'SLV100-3', 'SLV100-4', 'SLV200-1'
    ])
    expect(rows[0]).toContain('200.00') // 100 x 2

    expect(model.totals).toEqual({ subtotal: 700, vat: 0, grandTotal: 700 })
    expect(model.pages[0].map((p) => p.text)).toContain('6')
    api.assertNoLeak()
  })
})
