import { test, expect } from '@playwright/test'
import { installApiMocks } from './support/api-mocks.js'
import { seedAuth } from './support/auth.js'

// ป้าย 80×14 โหมดราคาเต็ม ($ / บาท): ราคาบนป้ายคือสิ่งที่ลูกค้าเห็นตรงเคาน์เตอร์
// ถ้าพัง ป้ายพิมพ์ราคาผิด (ปัดผิด/ใช้เรทเก่า/พิมพ์ทั้งที่ไม่มีเรท) -- assert เฉพาะบรรทัด 2 ของ ZPL เพราะหางป้ายมีวันที่

const PRINTER = 'ZEBRA-TEST'

const piece = (n, productPrice, extra = {}) => ({
  stockNumber: `DK20T00${n}`,
  stockNumberOrigin: `ORG${n}`,
  productCode: `PC${n}`,
  productNumber: `PN-${n}`,
  productNameEn: `Ring ${n}`,
  mold: `MOLD${n}`,
  size: '',
  qty: 1,
  pieceStatus: 'IN_STOCK',
  productPrice,
  materials: [],
  ...extra
})

const ROW_A = piece(1, 25400)
const ROW_B = piece(2, 8250)
const ROW_C = piece(3, 10000)

async function openPage(page, { rows = [ROW_A, ROW_B, ROW_C], storage = {} } = {}) {
  const printed = []
  const api = await installApiMocks(page, {
    'StockProduct/List': { data: rows, total: rows.length },
    'StockLocation/List': { data: [], total: 0 },
    'Master/MasterGem': [],
    // DK Print Bridge
    printers: [PRINTER],
    'printers/status': { offline: false, paused: false, error: false, jobs: 0 },
    'print/raw': (_req, { body }) => {
      printed.push(body)
      return { success: true }
    }
  })
  const settings = {
    'print-bridge-barcode-profile': 'gt800',
    'print-bridge-printer-barcode': PRINTER,
    'print-bridge-barcode-delay': '1',
    'print-bridge-barcode-label-price-mode': 'full',
    'print-bridge-barcode-label-currency': 'USD',
    'print-bridge-barcode-label-rate': '33',
    'print-bridge-barcode-gold-price': '3000',
    ...storage
  }
  await page.addInitScript((entries) => {
    Object.entries(entries).forEach(([k, v]) => localStorage.setItem(k, v))
  }, settings)
  await seedAuth(page, { permissions: ['dashboard', 'stock-product:view'] })
  await page.goto('/stock-product-print-barcode')
  return { api, printed }
}

async function searchAndPickLabel(page, { expectedRows = 3 } = {}) {
  await page.getByPlaceholder('EX: R08X50XXXL').fill('PN')
  await page.getByRole('button', { name: 'ค้นหา' }).click()
  await expect(page.locator('tbody tr')).toHaveCount(expectedRows)
  await page.locator('#print-barcode-type').click()
  await page.getByRole('option', { name: 'ป้าย 80×14 มม.', exact: true }).click()
}

const rowOf = (page, labelCode) => page.locator('tbody tr', { hasText: labelCode })
const priceInput = (page, labelCode) => rowOf(page, labelCode).locator('input[aria-label="ราคาบนป้าย"]')
const rateInput = (page) => page.locator('.field', { hasText: 'เรท (บาท/ดอลลาร์)' }).locator('input')
const printBtn = (page) => page.getByRole('button', { name: /พิมพ์$/ })

async function setRate(page, value) {
  await rateInput(page).fill(value)
}

async function switchCurrency(page, label) {
  await page.getByRole('tab', { name: label, exact: true }).click()
}

async function printAll(page, printed, expectedCount) {
  await expect(printBtn(page)).toBeEnabled()
  await printBtn(page).click()
  await page.locator('.swal2-confirm').click()
  await expect.poll(() => printed.length).toBe(expectedCount)
}

// ข้อความบรรทัด 2 ของป้าย = ^FD ที่ตามหลัง ^FO{x},38 (GT800_S_LINE2_Y = 38, dpiScale 1 ที่ 203 dpi) · ไม่เจอ = null
const line2Of = (zpl) => zpl.match(/\^FO\d+,38\^A0N,\d+,\d+\^FD(.*?)\^FS/)?.[1] ?? null
const line2ByCode = (printed, code) => {
  const hit = printed.map((p) => p.text).find((zpl) => zpl.includes(`^FD${code}^FS`) || zpl.includes(`- ${code}^FS`))
  return hit ? line2Of(hit) : undefined
}

test.describe('ป้าย 80×14 ราคาเต็ม - หน้าพิมพ์หลายชิ้น', () => {
  test('USD เรท 33: ปัดครั้งเดียว half-up 2 ตำแหน่ง (769.70 / 250 / 303.03)', async ({ page }) => {
    const { api, printed } = await openPage(page)
    await searchAndPickLabel(page)
    await printAll(page, printed, 3)

    expect(printed.every((p) => p.printerName === PRINTER)).toBe(true)
    expect(line2ByCode(printed, 'ORG1')).toBe('$769.70')
    expect(line2ByCode(printed, 'ORG2')).toBe('$250')
    // 10000/33 = 303.0303 -> ปัดขึ้นแบบ ceiling จะได้ 303.04 ซึ่งผิด
    expect(line2ByCode(printed, 'ORG3')).toBe('$303.03')
    api.assertNoLeak()
  })

  test('THB: พิมพ์ราคาเดิม ไม่มี $ ไม่มีจุลภาค และไม่ใช้เรท', async ({ page }) => {
    const { api, printed } = await openPage(page, { storage: { 'print-bridge-barcode-label-currency': 'THB' } })
    await searchAndPickLabel(page)
    await expect(rateInput(page)).toHaveCount(0)
    await printAll(page, printed, 3)

    expect(line2ByCode(printed, 'ORG1')).toBe('25400')
    expect(line2ByCode(printed, 'ORG2')).toBe('8250')
    expect(printed.every((p) => !p.text.includes('$'))).toBe(true)
    expect(printed.every((p) => !/\^FD[^^]*\d,\d{3}/.test(p.text))).toBe(true)
    api.assertNoLeak()
  })

  test('แก้ราคาแถวเดียว: แถวนั้นพิมพ์ค่าที่แก้ ส่วนแถวอื่นคำนวณ + เปลี่ยนเรทแล้วแถวที่แก้คงเดิม', async ({ page }) => {
    const { api, printed } = await openPage(page)
    await searchAndPickLabel(page)

    const edited = priceInput(page, 'ORG1')
    await edited.fill('800')
    await edited.blur()
    await expect(rowOf(page, 'ORG1').getByText('แก้เอง')).toBeVisible()
    await expect(rowOf(page, 'ORG2').getByText('แก้เอง')).toHaveCount(0)

    // เปลี่ยนเรท 33 -> 30: แถวที่แก้คงเดิม แถวอื่นคิดใหม่ (8250/30 = 275)
    await setRate(page, '30')
    await expect(priceInput(page, 'ORG1')).toHaveValue('800')
    await expect(priceInput(page, 'ORG2')).toHaveValue('275')

    await printAll(page, printed, 3)
    expect(line2ByCode(printed, 'ORG1')).toBe('$800')
    expect(line2ByCode(printed, 'ORG2')).toBe('$275')
    expect(line2ByCode(printed, 'ORG3')).toBe('$333.33')
    api.assertNoLeak()
  })

  test('สลับสกุล USD -> THB: ราคาที่แก้เองถูกล้าง กลับเป็นราคาที่คำนวณ', async ({ page }) => {
    const { api, printed } = await openPage(page)
    await searchAndPickLabel(page)

    const edited = priceInput(page, 'ORG1')
    await edited.fill('800')
    await edited.blur()
    await expect(rowOf(page, 'ORG1').getByText('แก้เอง')).toBeVisible()

    await switchCurrency(page, '฿ บาท')
    await expect(rowOf(page, 'ORG1').getByText('แก้เอง')).toHaveCount(0)
    await expect(priceInput(page, 'ORG1')).toHaveValue('25400')

    await printAll(page, printed, 3)
    expect(line2ByCode(printed, 'ORG1')).toBe('25400')
    api.assertNoLeak()
  })

  test('ไม่มีเรท: ปุ่มพิมพ์ถูกปิด + ข้อความเตือน + ไม่ยิง print/raw', async ({ page }) => {
    const { api, printed } = await openPage(page)
    await searchAndPickLabel(page)
    // เรท 33 อยู่ -> ปุ่มเปิด (พิสูจน์ว่าเครื่องพิมพ์พร้อม ปุ่มปิดเพราะไม่มีเรทจริง ไม่ใช่เพราะเครื่อง)
    await expect(printBtn(page)).toBeEnabled()

    await setRate(page, '')
    await expect(printBtn(page)).toBeDisabled()
    await expect(page.getByText('ยังไม่ได้ใส่เรท')).toBeVisible()
    expect(api.callsTo('print/raw')).toHaveLength(0)
    expect(printed).toHaveLength(0)
    api.assertNoLeak()
  })

  test('แถวราคา 0 / null: ปุ่มพิมพ์ถูกปิด + บอกจำนวนชิ้นที่ไม่มีราคา', async ({ page }) => {
    const { api, printed } = await openPage(page, {
      rows: [ROW_A, piece(2, 0), piece(3, null)]
    })
    await searchAndPickLabel(page)

    // เอาแถวราคา 0/null ออกจากที่เลือก -> เหลือแถวที่มีราคา ปุ่มต้องเปิด (พิสูจน์ว่าเครื่องพร้อม)
    await rowOf(page, 'ORG2').locator('.p-checkbox').click()
    await rowOf(page, 'ORG3').locator('.p-checkbox').click()
    await expect(printBtn(page)).toBeEnabled()
    await expect(page.getByText(/ชิ้นที่ยังไม่มีราคาบนป้าย/)).toHaveCount(0)

    // เลือกแถวราคา 0/null กลับ -> ปุ่มปิด + บอกจำนวน
    await rowOf(page, 'ORG2').locator('.p-checkbox').click()
    await rowOf(page, 'ORG3').locator('.p-checkbox').click()
    await expect(page.getByText('มี 2 ชิ้นที่ยังไม่มีราคาบนป้าย')).toBeVisible()
    await expect(printBtn(page)).toBeDisabled()
    expect(printed).toHaveLength(0)
    api.assertNoLeak()
  })

  test('ไม่แสดงราคา: ไม่บล็อกปุ่มแม้มีแถวราคา 0 และป้ายไม่มีราคา', async ({ page }) => {
    const { api, printed } = await openPage(page, { rows: [ROW_A, piece(2, 0)] })
    await searchAndPickLabel(page, { expectedRows: 2 })
    await expect(printBtn(page)).toBeDisabled()
    await expect(page.getByText('มี 1 ชิ้นที่ยังไม่มีราคาบนป้าย')).toBeVisible()

    await page.getByRole('checkbox', { name: 'ไม่แสดงราคา' }).check({ force: true })
    await expect(page.getByText(/ชิ้นที่ยังไม่มีราคาบนป้าย/)).toHaveCount(0)
    await printAll(page, printed, 2)

    printed.forEach((p) => {
      expect(p.text).not.toContain('$')
      expect(p.text).not.toContain('769')
      expect(p.text).not.toContain('25400')
      expect(line2Of(p.text)).toBeNull()
    })
    api.assertNoLeak()
  })

  test('โหมดรหัสราคา: บรรทัด 2 เป็นรหัสราคาเดิม ไม่มี $', async ({ page }) => {
    const { api, printed } = await openPage(page, { storage: { 'print-bridge-barcode-label-price-mode': 'code' } })
    await searchAndPickLabel(page)
    await expect(priceInput(page, 'ORG1')).toHaveCount(0)
    await printAll(page, printed, 3)

    expect(printed.every((p) => !p.text.includes('$'))).toBe(true)
    // formatPriceCode(25400) = '0' + '2540'
    expect(line2ByCode(printed, 'ORG1')).toBe('02540')
    api.assertNoLeak()
  })
})

// ---- หน้าต่างพิมพ์ทีละชิ้น (หน้ารายละเอียดสินค้า) ----

const DETAIL_ITEM = {
  stockNumber: 'DK20T0099',
  stockNumberOrigin: 'ORG99',
  productCode: 'PC99',
  productNumber: 'PN-99',
  productNameEn: 'Ring 99',
  productNameTh: 'แหวน 99',
  mold: 'MOLD99',
  size: '',
  qty: 1,
  status: 'IN_STOCK',
  pieceStatus: 'IN_STOCK',
  productPrice: 25400,
  materials: []
}

async function openDetail(page) {
  const printed = []
  const api = await installApiMocks(page, {
    'StockProduct/Get': DETAIL_ITEM,
    'StockLocation/List': { data: [], total: 0 },
    'StockBalance/ByStockNumbers': [],
    'StockProduct/GetStockCostDetail': [],
    'StockProduct/QuickPriceList': [],
    'StockProduct/GetProductCostDetailVersion': [],
    'Master/MasterGem': [],
    'Master/MasterGold': [],
    'Master/MasterProductType': [],
    printers: [PRINTER],
    'printers/status': { offline: false, paused: false, error: false, jobs: 0 },
    'print/raw': (_req, { body }) => {
      printed.push(body)
      return { success: true }
    }
  })
  await page.addInitScript((entries) => {
    Object.entries(entries).forEach(([k, v]) => localStorage.setItem(k, v))
  }, {
    'print-bridge-barcode-profile': 'gt800',
    'print-bridge-printer-barcode': PRINTER,
    'print-bridge-barcode-delay': '1',
    'print-bridge-barcode-label-price-mode': 'full',
    'print-bridge-barcode-label-currency': 'USD',
    'print-bridge-barcode-label-rate': '33',
    'print-bridge-barcode-gold-price': '3000'
  })
  await seedAuth(page, { permissions: ['dashboard', 'stock-product:view'] })
  await page.goto(`/stock-product-detail/${DETAIL_ITEM.stockNumber}`)
  await page.getByRole('button', { name: /พิมพ์ป้ายสินค้า/ }).click()
  await page.getByRole('button', { name: /ป้าย 80×14 มม\./ }).click()
  return { api, printed }
}

test.describe('ป้าย 80×14 ราคาเต็ม - หน้าต่างพิมพ์ทีละชิ้น', () => {
  test('USD เรท 33 จากราคาขาย 25400 -> $769.70', async ({ page }) => {
    const { api, printed } = await openDetail(page)
    await expect(page.locator('.label-price-printed-text')).toContainText('$769.70')

    const modalPrint = page.locator('.print-count-input').locator('xpath=ancestor::div[contains(@class,"vertical-center-container")]').getByRole('button')
    await expect(modalPrint).toBeEnabled()
    await modalPrint.click()
    // หน้าต่างนี้ไม่มี dialog ยืนยันก่อนพิมพ์ -- .swal2-confirm คือปิด alert "ส่งพิมพ์สำเร็จ" หลังพิมพ์แล้ว
    await expect.poll(() => printed.length).toBe(1)
    await page.locator('.swal2-confirm').click()
    expect(line2Of(printed[0].text)).toBe('$769.70')
    api.assertNoLeak()
  })

  test('แก้ราคาในช่องของหน้าต่าง -> พิมพ์ค่าที่แก้', async ({ page }) => {
    const { api, printed } = await openDetail(page)
    const box = page.locator('.label-price-box')
    const input = box.locator('.label-price-input input')
    await input.fill('800')
    await input.blur()
    await expect(box.getByText('แก้เอง')).toBeVisible()
    await expect(page.locator('.label-price-printed-text')).toContainText('$800')

    const modalPrint = page.locator('.print-count-input').locator('xpath=ancestor::div[contains(@class,"vertical-center-container")]').getByRole('button')
    await modalPrint.click()
    // หน้าต่างนี้ไม่มี dialog ยืนยันก่อนพิมพ์ -- .swal2-confirm คือปิด alert "ส่งพิมพ์สำเร็จ" หลังพิมพ์แล้ว
    await expect.poll(() => printed.length).toBe(1)
    await page.locator('.swal2-confirm').click()
    expect(line2Of(printed[0].text)).toBe('$800')
    api.assertNoLeak()
  })
})
