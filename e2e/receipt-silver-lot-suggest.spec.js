import { test, expect } from '@playwright/test'
import { installApiMocks } from './support/api-mocks.js'
import { seedAuth } from './support/auth.js'

// รับสินค้างานนอก: แถวเงินที่รหัสสินค้ามีล็อตเดิมต้องเติมเข้าล็อตเดิมอัตโนมัติ (ยกเลิกได้)
// ถ้าพัง ล็อตเงินแตกเป็นเลขใหม่ซ้ำ สต็อกแยกเป็นหลายเลขทั้งที่เป็นแบบเดียวกัน

const lot = (stockNumber, extra = {}) => ({
  stockNumber,
  stockNumberOrigin: '',
  productNumber: 'SV-100',
  productNameTh: 'แหวนเงิน',
  productNameEn: 'Silver Ring',
  locationCode: 'MAIN',
  qty: 5,
  qtyReserved: 0,
  qtyAvailable: 5,
  status: 'IN_STOCK',
  receiptDate: '2026-11-01T00:00:00Z',
  productionType: 'SV',
  size: '',
  ...extra
})

const MASTERS = {
  'Master/MasterGold': [
    { code: 'SV', description: 'Silver' },
    { code: 'YG', description: 'Yellow Gold' }
  ],
  'Master/MasterGoldSize': [],
  'Master/MasterGem': [],
  'Master/MasterProductType': [],
  'Master/MasterDiamondGrade': []
}

async function openCreate(page, lots) {
  const api = await installApiMocks(page, {
    ...MASTERS,
    'ReceiptLot/SuggestByProduct': (_req, { body }) =>
      body.productNumbers.map((productNumber) => ({ productNumber, lots })),
    'ReceiptOutsource/Confirm': { stocks: [] }
  })
  await seedAuth(page, { permissions: ['dashboard', 'stock-product-gr:create'] })
  await page.goto('/goods-receipt-outsource/create')
  await page.getByPlaceholder('ชื่อผู้ขายหรือร้านงานนอก').fill('ร้านทดสอบ')
  await page.getByRole('button', { name: 'เพิ่มแถว' }).click()
  return api
}

async function fillProductNumber(page, value) {
  const input = page.getByPlaceholder('รหัสสินค้า')
  await input.fill(value)
  await input.press('Tab')
}

async function pickMetal(page, label, row = 0) {
  await page.locator('.outsource-form-table .p-dropdown').nth(row * 3 + 1).click()
  await page.getByRole('option', { name: label, exact: true }).click()
}

async function submit(page, api) {
  const before = api.callsTo('ReceiptOutsource/Confirm').length
  await page.getByRole('button', { name: 'บันทึกสินค้า' }).click()
  await page.getByRole('button', { name: 'ยืนยัน' }).click()
  await expect.poll(() => api.callsTo('ReceiptOutsource/Confirm').length).toBe(before + 1)
  return api.callsTo('ReceiptOutsource/Confirm').at(-1).body.stocks[0]
}

test.describe('แนะนำล็อตเงินเดิมตอนรับสินค้างานนอก', () => {
  test('แถวเงิน + รหัสมีล็อตเดียว -> badge เติมล็อตเดิม + payload มี topUpStockNumber', async ({ page }) => {
    const api = await openCreate(page, [lot('DK20S001')])
    await fillProductNumber(page, 'sv-100')
    await pickMetal(page, 'Silver')

    await expect(page.locator('.topup-badge')).toContainText('DK20S001')
    await expect(page.locator('.topup-note')).toContainText('พบล็อตเดิม')
    await expect(page.locator('.topup-note')).toContainText('DK20S001')

    const stock = await submit(page, api)
    expect(stock.topUpStockNumber).toBe('DK20S001')
    expect(api.callsTo('ReceiptLot/SuggestByProduct').at(-1).body.productNumbers).toEqual(['SV-100'])
    api.assertNoLeak()
  })

  test('ผู้ใช้ยกเลิกล็อตที่แนะนำ -> payload topUpStockNumber เป็น null และไม่ถูกเติมซ้ำ', async ({ page }) => {
    const api = await openCreate(page, [lot('DK20S001')])
    await fillProductNumber(page, 'SV-100')
    await pickMetal(page, 'Silver')
    await expect(page.locator('.topup-badge')).toContainText('DK20S001')

    await page.locator('.p-row-toggler').first().click()
    await page.getByRole('button', { name: 'สร้างเลขใหม่' }).click()
    await expect(page.locator('.topup-badge')).toHaveCount(0)

    // เปลี่ยนรหัสไปมาให้ยิงแนะนำซ้ำ -- รหัสเดิมที่ยกเลิกแล้วห้ามถูกเติมกลับ
    const callsBefore = api.callsTo('ReceiptLot/SuggestByProduct').length
    await fillProductNumber(page, 'SV-100X')
    await fillProductNumber(page, 'SV-100')
    await expect
      .poll(() => api.callsTo('ReceiptLot/SuggestByProduct').length)
      .toBeGreaterThan(callsBefore)
    await expect(page.locator('.topup-badge')).toHaveCount(0)

    await page.getByPlaceholder('ชื่อสินค้า EN').fill('Silver Ring')
    await page.getByPlaceholder('ชื่อสินค้า TH').fill('แหวนเงิน')
    await page.locator('input[type=number][step=any]').fill('100')

    const stock = await submit(page, api)
    expect(stock.topUpStockNumber).toBeNull()
    api.assertNoLeak()
  })

  test('แถวทอง -> ไม่เติมล็อตอัตโนมัติ และไม่ถูกส่งไปขอคำแนะนำ', async ({ page }) => {
    const api = await openCreate(page, [lot('DK20S001', { productNumber: 'SV-200' })])
    await fillProductNumber(page, 'GD-1')
    await pickMetal(page, 'Yellow Gold')

    // แถวเงินแถวที่ 2 เป็นจุดรอ: พอ badge ขึ้นแปลว่ารอบแนะนำที่รวมทุกแถวจบแล้ว
    await page.getByRole('button', { name: 'เพิ่มแถว' }).click()
    const second = page.getByPlaceholder('รหัสสินค้า').nth(1)
    await second.fill('SV-200')
    await second.press('Tab')
    await pickMetal(page, 'Silver', 1)

    await expect(page.locator('.topup-badge')).toHaveCount(1)
    await expect(page.locator('.topup-note')).toHaveCount(1)
    const requested = api.callsTo('ReceiptLot/SuggestByProduct').flatMap((c) => c.body.productNumbers)
    expect(requested.length).toBeGreaterThan(0)
    expect(requested.every((n) => n === 'SV-200')).toBe(true)
    api.assertNoLeak()
  })

  test('พบ 2 ล็อตที่เติมได้ -> ไม่เลือกให้เอง แสดงรายการให้ผู้ใช้เลือก', async ({ page }) => {
    const api = await openCreate(page, [lot('DK20S001'), lot('DK20S002')])
    await fillProductNumber(page, 'SV-100')
    await pickMetal(page, 'Silver')

    await expect(page.locator('.topup-note')).toContainText('พบล็อตเดิม 2 ล็อต')
    await expect(page.locator('.topup-badge')).toHaveCount(0)

    await page.locator('.p-row-toggler').first().click()
    await expect(page.getByText('DK20S001', { exact: true })).toBeVisible()
    await expect(page.getByText('DK20S002', { exact: true })).toBeVisible()

    await page.getByRole('button', { name: 'เติมเข้าล็อตนี้' }).nth(1).click()
    await expect(page.locator('.topup-badge').first()).toContainText('DK20S002')
    api.assertNoLeak()
  })
})

// ---- หน้ารับสินค้างานผลิต (แผนเงิน) ----

const planStock = (extra = {}) => ({
  stockReceiptNumber: 'R1',
  stockNumber: '',
  isReceipt: false,
  productNumber: 'SV-100',
  productNameTH: 'แหวนเงิน',
  productNameEN: 'Silver Ring',
  moldDesign: 'M1',
  location: 'MAIN',
  size: '52',
  qty: 1,
  price: 100,
  materials: [],
  ...extra
})

async function openPlan(page, { lots, stocks = [planStock()] }) {
  const api = await installApiMocks(page, {
    ...MASTERS,
    'StockLocation/List': { data: [{ code: 'MAIN', nameTh: 'หลัก', isActive: true }] },
    'ReceiptProduction/GetPlan': {
      gold: 'SV',
      wo: 'WO1',
      woNumber: 1,
      receiptNumber: 'RC1',
      productName: 'Silver Ring',
      mold: 'M1',
      breakDown: [],
      gems: [],
      stocks
    },
    'ReceiptLot/SuggestByProduct': (_req, { body }) =>
      body.productNumbers.map((productNumber) => ({ productNumber, lots })),
    'StockProduct/PriceCheck': [],
    'ReceiptProduction/Darft': { success: true },
    'ReceiptProduction/Confirm': { stocks: [] }
  })
  await seedAuth(page, { permissions: ['dashboard', 'stock-product-gr:create', 'stock-product-gr:view'] })
  await page.goto('/goods-receipt-production/PLAN1')
  await expect(page.getByPlaceholder('รหัสสินค้า').or(page.locator('input[type=text]').first())).toBeVisible()
  return api
}

async function selectFirstRow(page) {
  await page.locator('tbody .p-checkbox').first().click()
}

async function confirmProduction(page, api) {
  await page.getByRole('button', { name: 'บันทึกเข้าคลัง' }).click()
  await page.getByRole('button', { name: 'ยืนยัน' }).click()
  await expect.poll(() => api.callsTo('ReceiptProduction/Confirm').length).toBe(1)
  return api.callsTo('ReceiptProduction/Confirm').at(-1).body.Stocks[0]
}

test.describe('แนะนำล็อตเงินเดิมตอนรับสินค้างานผลิต', () => {
  test('โหลดแผนเงิน + ล็อตเดียวขนาดตรงกัน -> เติมอัตโนมัติ และ payload มี topUpStockNumber', async ({ page }) => {
    const api = await openPlan(page, { lots: [lot('DK20S001', { size: '#52' })] })
    await expect(page.locator('.topup-badge')).toContainText('DK20S001')
    await expect(page.locator('.topup-note')).toContainText('พบล็อตเดิม')

    await selectFirstRow(page)
    const stock = await confirmProduction(page, api)
    expect(stock.topUpStockNumber).toBe('DK20S001')
    api.assertNoLeak()
  })

  test('ขนาดไม่ตรง -> ไม่เติมอัตโนมัติ (แค่แจ้งให้เลือกเอง)', async ({ page }) => {
    const api = await openPlan(page, { lots: [lot('DK20S001', { size: '54' })] })
    await expect(page.locator('.topup-note')).toContainText('พบล็อตเดิม 1 ล็อต')
    await expect(page.locator('.topup-badge')).toHaveCount(0)
    expect(api.callsTo('ReceiptLot/SuggestByProduct')).toHaveLength(1)
    api.assertNoLeak()
  })

  test('ยกเลิกล็อตของ A แล้วเปลี่ยนเป็น B แล้วบันทึกร่าง -> draft จำว่ายกเลิก A และ B ถูกเติมอัตโนมัติ', async ({ page }) => {
    const api = await openPlan(page, { lots: [lot('DK20S001', { size: '52' })] })
    await expect(page.locator('.topup-badge')).toContainText('DK20S001')

    await page.locator('.p-row-toggler').first().click()
    await page.getByRole('button', { name: 'สร้างเลขใหม่' }).click()
    await expect(page.locator('.topup-badge')).toHaveCount(0)

    const productInput = page.locator('tbody tr').first().locator('input[type=text]').first()
    await productInput.fill('SV-200')
    await expect(page.locator('.topup-badge').first()).toContainText('DK20S001')

    await page.getByRole('button', { name: 'บันทึกร่าง' }).click()
    await expect.poll(() => api.callsTo('ReceiptProduction/Darft').length).toBe(1)
    const row = api.callsTo('ReceiptProduction/Darft')[0].body.stocks[0]
    expect(row.suggestDismissedFor).toBe('SV-100')
    expect(row.productNumber).toBe('SV-200')
    expect(row.topUpStockNumber).toBe('DK20S001')
    expect(row.suggestAuto).toBe(true)
    expect(row).not.toHaveProperty('suggestDismissed')
    expect(row).not.toHaveProperty('suggestLots')
    api.assertNoLeak()
  })

  test('บันทึกร่างหลังยกเลิก -> draft มี suggestDismissedFor และไม่มี topUpStockNumber', async ({ page }) => {
    const api = await openPlan(page, { lots: [lot('DK20S001', { size: '52' })] })
    await expect(page.locator('.topup-badge')).toContainText('DK20S001')
    await page.locator('.p-row-toggler').first().click()
    await page.getByRole('button', { name: 'สร้างเลขใหม่' }).click()
    await page.getByRole('button', { name: 'บันทึกร่าง' }).click()
    await expect.poll(() => api.callsTo('ReceiptProduction/Darft').length).toBe(1)
    const row = api.callsTo('ReceiptProduction/Darft')[0].body.stocks[0]
    expect(row.suggestDismissedFor).toBe('SV-100')
    expect(row.topUpStockNumber).toBeFalsy()
    api.assertNoLeak()
  })

  test('โหลดร่างที่ยกเลิกรหัสนี้ไว้ -> ไม่เติมกลับ แต่ร่างที่ยกเลิกรหัสอื่น -> เติมได้', async ({ page }) => {
    const api = await openPlan(page, {
      lots: [lot('DK20S001', { size: '52' })],
      stocks: [planStock({ suggestDismissedFor: 'sv-100' })]
    })
    await expect.poll(() => api.callsTo('ReceiptLot/SuggestByProduct').length).toBe(1)
    await expect(page.locator('.topup-badge')).toHaveCount(0)
    await expect(page.locator('.topup-note')).toHaveCount(0)
    api.assertNoLeak()
  })

  test('โหลดร่างที่ยกเลิกรหัส A ไว้ แต่แถวเป็นรหัส B -> B ถูกเติม และ suggestAuto จากร่างทำให้ revert ได้', async ({ page }) => {
    const api = await openPlan(page, {
      lots: [lot('DK20S001', { size: '52' })],
      stocks: [planStock({ suggestDismissedFor: 'OLD-1' })]
    })
    await expect(page.locator('.topup-badge')).toContainText('DK20S001')
    api.assertNoLeak()
  })

  test('โหลดร่างที่เติมอัตโนมัติไว้แล้ว -> ยังโชว์ note และเปลี่ยนรหัสแล้วถอนล็อต', async ({ page }) => {
    const api = await openPlan(page, {
      lots: [],
      stocks: [planStock({ topUpStockNumber: 'DK20S001', suggestAuto: true })]
    })
    await expect(page.locator('.topup-note')).toContainText('DK20S001')
    const productInput = page.locator('tbody tr').first().locator('input[type=text]').first()
    await productInput.fill('SV-999')
    await expect(page.locator('.topup-badge')).toHaveCount(0)
    api.assertNoLeak()
  })

  test('แป้นต่างหูไม่ตรง -> ไม่เติมอัตโนมัติ', async ({ page }) => {
    const api = await openPlan(page, {
      lots: [lot('DK20S001', { size: '52', studEarring: 'lg' })],
      stocks: [planStock({ studEarring: 'sm' })]
    })
    await expect(page.locator('.topup-note')).toContainText('พบล็อตเดิม 1 ล็อต')
    await expect(page.locator('.topup-badge')).toHaveCount(0)
    api.assertNoLeak()
  })

  test('ล็อตเงินของรหัสนี้มีหลายขนาด -> ไม่เติมอัตโนมัติ แสดงรายการให้เลือก', async ({ page }) => {
    const api = await openPlan(page, {
      lots: [lot('DK20S001', { size: '52' }), lot('DK20S002', { size: '54' })]
    })
    await expect(page.locator('.topup-note')).toContainText('พบล็อตเดิม 2 ล็อต')
    await expect(page.locator('.topup-badge')).toHaveCount(0)
    api.assertNoLeak()
  })

  test('เลือกล็อตที่ขนาดไม่ตรงด้วยมือ -> เตือนแต่ยังเลือกได้', async ({ page }) => {
    const api = await openPlan(page, { lots: [lot('DK20S001', { size: '54' })] })
    await page.locator('.p-row-toggler').first().click()
    await expect(page.getByText('ขนาด/แป้น/ก้านต่างหูไม่ตรงกับแถวนี้')).toBeVisible()
    await page.getByRole('button', { name: 'เติมเข้าล็อตนี้' }).click()
    await expect(page.locator('.topup-badge').first()).toContainText('DK20S001')
    api.assertNoLeak()
  })
})
