import { test, expect } from '@playwright/test'
import { installApiMocks } from '../support/api-mocks.js'
import { seedAuth } from '../support/auth.js'

// คืนพลอยจากใบงาน + เตือนเบิกซ้ำ: พังแล้วสต็อกพลอยบวกซ้ำ/ไม่บวก หรือต้นทุนใบงานเพี้ยน
// mock ทั้งหมด (ห้ามยิง localhost:2001 จริง) — API ReturnFromPlan ตอบตามสัญญา { inboundRunning, isFullReturn }

const GEM_ROWS = [
  { id: 77, productionPlanId: 11800, itemNo: '1', code: 'SD0109', name: 'Sapphire SQ', qty: 6, weight: 0.16, unit: 'ct.', price: 2400, outboundRunning: 'PIO261124005', outboundName: 'ทัก', outboundDate: '2026-11-24T09:50:00' },
  { id: 77, productionPlanId: 11800, itemNo: '2', code: 'SD0109', name: 'Sapphire SQ', qty: 6, weight: 0.16, unit: 'ct.', price: 2400, outboundRunning: 'PIO261127022', outboundName: 'ทัก', outboundDate: '2026-11-27T16:08:00' },
  { id: 3, productionPlanId: 11800, itemNo: '3', code: 'SI1IR09', name: 'Diamond RD', qty: 4, weight: 0.019, unit: 'ct.', price: 11600, outboundRunning: 'PIO261127032', outboundName: 'ทัก', outboundDate: '2026-11-27T16:55:00' }
]

const LINK_LINE = {
  transectionId: 501,
  running: 'INB261127005',
  requestDate: '2026-11-27T10:00:00',
  code: 'SD0109',
  qty: 6,
  qtyWeight: 0.16,
  remainQty: 6,
  remainWeight: 0.16,
  jobOrPo: '6911008-13',
  remark1: 'ตัดซ้ำ',
  remark2: null,
  matchesPlan: true
}

function planWith(rows) {
  return {
    id: 11800,
    wo: '6911008',
    woNumber: '13',
    status: 70,
    statusName: 'คัดพลอย',
    updateDate: '2026-11-27T00:00:00',
    hasSavedPrice: false,
    hasSavedBom: false,
    gemReturns: [],
    tbtProductionPlanStatusHeader: [
      {
        id: 9,
        status: 70,
        createBy: 'e2e',
        createDate: '2026-11-27T00:00:00',
        tbtProductionPlanStatusDetail: [],
        tbtProductionPlanStatusGem: rows
      }
    ]
  }
}

function planMocks(state, lines = [LINK_LINE]) {
  return {
    'ProductionPlan/ProductionPlanGet': () => planWith(state.rows),
    'ProductionPlan/ProductionPlanMateriaGet': [],
    'ProductionPlan/GetProductionPlanStatus': [{ code: 70, description: 'คัดพลอย' }],
    'ProductionPlanCost/ListGoldCostItem': { data: [], total: 0 },
    'Production/Bom/Get': {},
    'Production/Bom/Transaction': {},
    'Master/MasterProductType': [],
    'Master/MasterCustomerType': [],
    'Master/MasterGold': [],
    'Master/MasterGoldSize': [],
    'Master/MasterGem': [],
    'Master/MasterGemShape': [],
    'Worker/Search': { data: [], total: 0 },
    'StockGem/Search': [],
    'ReceiptAndIssueStockGem/ListLinkableInbound': lines
  }
}

const PERMS = ['dashboard', 'production:view', 'production:edit', 'stock-gem:return-from-plan']

async function openPlanGemTab(page) {
  await page.goto('/plan-order-tracking-update/11800')
  await page.getByRole('menuitem', { name: 'คัดพลอย' }).first().click()
  await expect(page.getByText('PIO261127022')).toBeVisible()
}

function returnButton(page, running) {
  return page.locator('tr', { hasText: running }).getByRole('button', { name: 'คืนเข้าคลัง' })
}

const confirmBtn = (page) => page.getByRole('button', { name: 'ยืนยันคืนเข้าคลัง' })
const OTHER_PLAN_LINE = { ...LINK_LINE, matchesPlan: false, jobOrPo: '6911999-1' }

test('คืนพลอยอยู่ในมือ (RETURN_NOW) คืนครบ: ส่ง body ถูก แล้วแถวหายหลัง refetch', async ({ page }) => {
  const state = { rows: [...GEM_ROWS] }
  const api = await installApiMocks(page, {
    ...planMocks(state),
    'ReceiptAndIssueStockGem/ReturnFromPlan': () => {
      state.rows = state.rows.filter((r) => r.outboundRunning !== 'PIO261127022')
      return { inboundRunning: 'INB261128001', isFullReturn: true }
    }
  })
  await seedAuth(page, { permissions: PERMS })
  await openPlanGemTab(page)

  // ผู้ใช้ที่มี production:edit ยังเห็นปุ่มพิมพ์แบบ (สลิปมีค่าแรง/ยอดเงิน) ในแท็บฝังพลอย (status 80)
  await page.getByRole('menuitem', { name: 'ฝังพลอย' }).first().click()
  await expect(page.locator('button[title="พิมพ์แบบ"]')).toBeVisible()
  await page.getByRole('menuitem', { name: 'คัดพลอย' }).first().click()

  // ผู้ใช้ที่มี production:edit ยังเห็นคอลัมน์ราคาและแท็บบัตรต้นทุน
  await expect(page.getByRole('columnheader', { name: 'ราคา', exact: true })).toBeVisible()
  await expect(page.getByRole('menuitem', { name: 'บัตรต้นทุน' })).toBeVisible()

  // แถวซ้ำมีป้ายเบิกซ้ำ + ท้ายตารางนับแถว
  await expect(page.locator('tr', { hasText: 'PIO261127022' }).getByText('เบิกซ้ำ', { exact: true })).toBeVisible()
  await expect(page.locator('tr', { hasText: 'PIO261124005' }).getByText('เบิกซ้ำ', { exact: true })).toBeVisible()
  await expect(page.getByText('จำนวน 3 รายการ')).toBeVisible()

  await returnButton(page, 'PIO261127022').click()
  // พบใบรับคืนที่อ้างใบงานนี้ → เลือก "คืนเข้าคลังไปแล้ว" + ใบรับคืนให้เอง
  await expect(page.getByText(/ให้อัตโนมัติ เพราะพบใบรับคืน INB261127005/)).toBeVisible()

  // ผู้ใช้สลับเป็นอยู่ในมือ: คงคำเตือน + ถามย้ำก่อนบวกสต็อก
  await page.getByText('อยู่ในมือ ยังไม่ได้คืนคลัง').click()
  await expect(page.getByText(/พบใบรับคืน INB261127005/)).toBeVisible()
  await page.locator('#gem-return-reason').click()
  await page.getByRole('option', { name: 'เบิกซ้ำ' }).click()
  await confirmBtn(page).click()
  await expect(page.getByText('จะบวกสต็อก SD0109 +6 เม็ด / 0.160')).toBeVisible()
  expect(api.callsTo('ReceiptAndIssueStockGem/ReturnFromPlan')).toHaveLength(0)
  await page.locator('.swal2-confirm').click()
  await expect(page.getByText('คืนเข้าคลังแล้ว', { exact: true })).toBeVisible()
  await page.locator('.swal2-confirm').click()

  await expect.poll(() => api.callsTo('ReceiptAndIssueStockGem/ReturnFromPlan').length).toBe(1)
  const body = api.callsTo('ReceiptAndIssueStockGem/ReturnFromPlan')[0].body
  expect(body).toMatchObject({
    productionPlanId: 11800,
    itemNo: '2',
    mode: 'RETURN_NOW',
    returnQty: 6,
    returnWeight: 0.16,
    expectedQty: 6,
    expectedWeight: 0.16,
    reason: 'DUPLICATE'
  })
  expect(body.inboundTransectionId).toBeUndefined()

  await expect(page.locator('tr', { hasText: 'PIO261127022' })).toHaveCount(0)
  await expect(page.getByText('จำนวน 2 รายการ')).toBeVisible()
  // แถว PIO261124005 (id เดียวกันกับแถวที่คืน) ยังอยู่ ปุ่มอยู่ ป้ายเบิกซ้ำหายเพราะไม่ซ้ำแล้ว
  const keepRow = page.locator('tr', { hasText: 'PIO261124005' })
  await expect(keepRow.getByRole('button', { name: 'คืนเข้าคลัง' })).toBeVisible()
  await expect(keepRow.getByText('เบิกซ้ำ', { exact: true })).toHaveCount(0)

  api.assertNoLeak()
})

test('LINK_EXISTING: ไม่เลือกใบรับคืนแล้วกดยืนยัน ขึ้น error ใต้ช่อง; เลือกแล้วส่ง inboundTransectionId', async ({ page }) => {
  const state = { rows: [...GEM_ROWS] }
  const api = await installApiMocks(page, {
    ...planMocks(state, [OTHER_PLAN_LINE]),
    'ReceiptAndIssueStockGem/ReturnFromPlan': { inboundRunning: 'INB261127005', isFullReturn: true }
  })
  await seedAuth(page, { permissions: PERMS })
  await openPlanGemTab(page)

  await returnButton(page, 'PIO261127022').click()
  // ไม่มีใบรับคืนที่อ้างใบงานนี้ → ไม่เลือกโหมดให้
  await expect(confirmBtn(page)).toBeEnabled()
  await confirmBtn(page).click()
  await expect(page.getByText('กรุณาเลือกว่าพลอยอยู่ที่ไหน')).toBeVisible()
  await expect(page.getByText('กรุณาเลือกเหตุผล')).toBeVisible()

  await page.getByText('คืนเข้าคลังไปแล้ว เลือกใบรับคืน').click()
  await page.locator('#gem-return-reason').click()
  await page.getByRole('option', { name: 'เบิกซ้ำ' }).click()
  await confirmBtn(page).click()
  await expect(page.getByText('กรุณาเลือกใบรับคืน')).toBeVisible()
  expect(api.callsTo('ReceiptAndIssueStockGem/ReturnFromPlan')).toHaveLength(0)

  await page.locator('#gem-return-link').click()
  await expect(page.getByRole('option', { name: /\[ใบงานอื่น\] INB261127005/ })).toBeVisible()
  await page.getByRole('option', { name: /INB261127005/ }).click()
  await confirmBtn(page).click()
  await page.locator('.swal2-confirm').click()

  await expect.poll(() => api.callsTo('ReceiptAndIssueStockGem/ReturnFromPlan').length).toBe(1)
  expect(api.callsTo('ReceiptAndIssueStockGem/ReturnFromPlan')[0].body).toMatchObject({
    mode: 'LINK_EXISTING',
    inboundTransectionId: 501,
    itemNo: '2'
  })
  expect(api.callsTo('ReceiptAndIssueStockGem/ListLinkableInbound')[0].body).toMatchObject({ gemCode: 'SD0109', productionPlanId: 11800 })

  api.assertNoLeak()
})

test('มีใบรับคืนที่อ้างใบงานนี้: เลือก LINK_EXISTING + ใบรับคืนให้เอง กดยืนยันได้เลย', async ({ page }) => {
  const state = { rows: [...GEM_ROWS] }
  const api = await installApiMocks(page, {
    ...planMocks(state),
    'ReceiptAndIssueStockGem/ReturnFromPlan': { inboundRunning: 'INB261127005', isFullReturn: true }
  })
  await seedAuth(page, { permissions: PERMS })
  await openPlanGemTab(page)

  await returnButton(page, 'PIO261127022').click()
  await expect(page.getByText(/ให้อัตโนมัติ เพราะพบใบรับคืน INB261127005/)).toBeVisible()
  await page.locator('#gem-return-reason').click()
  await page.getByRole('option', { name: 'เบิกซ้ำ' }).click()
  await confirmBtn(page).click()
  await page.locator('.swal2-confirm').click()

  await expect.poll(() => api.callsTo('ReceiptAndIssueStockGem/ReturnFromPlan').length).toBe(1)
  expect(api.callsTo('ReceiptAndIssueStockGem/ReturnFromPlan')[0].body).toMatchObject({
    mode: 'LINK_EXISTING',
    inboundTransectionId: 501
  })

  api.assertNoLeak()
})

test('คืนเกินจำนวนในใบงาน: กดยืนยันแล้วขึ้น error ใต้ช่อง ไม่ยิง API', async ({ page }) => {
  const state = { rows: [...GEM_ROWS] }
  const api = await installApiMocks(page, planMocks(state, [OTHER_PLAN_LINE]))
  await seedAuth(page, { permissions: PERMS })
  await openPlanGemTab(page)

  await returnButton(page, 'PIO261127022').click()
  await page.getByText('อยู่ในมือ ยังไม่ได้คืนคลัง').click()
  await page.locator('#gem-return-reason').click()
  await page.getByRole('option', { name: 'เบิกเกิน' }).click()

  await page.locator('#gem-return-qty').fill('7')
  await confirmBtn(page).click()
  await expect(page.getByText('เกินจำนวนในใบงาน (สูงสุด 6.000)')).toBeVisible()
  await expect(page.locator('#gem-return-qty')).toBeFocused()

  await page.locator('#gem-return-qty').fill('2')
  await confirmBtn(page).click()
  await expect(page.getByText('จำนวนกับน้ำหนักต้องคืนครบทั้งคู่ หรือคืนบางส่วนทั้งคู่')).toBeVisible()

  expect(api.callsTo('ReceiptAndIssueStockGem/ReturnFromPlan')).toHaveLength(0)
  api.assertNoLeak()
})

test('ผู้ใช้ที่มีแค่ stock-gem:return-from-plan (ไม่มี production:edit): เปิดหน้าใบงานได้ เห็นปุ่มคืนเข้าคลัง ไม่เห็นปุ่มแก้ไข', async ({ page }) => {
  const perms = ['dashboard', 'stock-gem:return-from-plan']
  const state = { rows: [...GEM_ROWS] }
  const api = await installApiMocks(page, {
    ...planMocks(state),
    'ProductionPlan/ProductionPlanGet': () => {
      const plan = planWith(state.rows)
      const extra = (id, status, gold) => ({
        id,
        status,
        createBy: 'e2e',
        createDate: '2026-11-27T00:00:00',
        tbtProductionPlanStatusDetail: [{ id, itemNo: '1', gold }],
        tbtProductionPlanStatusGem: []
      })
      plan.tbtProductionPlanStatusHeader.push(extra(10, 100, 'GOLD-DONE'), extra(11, 500, 'GOLD-MELT'))
      return plan
    },
    'ProductionPlan/ProductionPlanMateriaGet': [
      { id: 1, goldQty: 1, goldNavigation: { code: 'YG', nameTh: 'ทอง E2E' }, goldSizeNavigation: { nameTh: '90%' } }
    ],
    'Permission/MyPermissions': perms
  })
  await seedAuth(page, {
    user: { id: 5, username: 'gem.keeper', firstName: 'Gem', lastName: 'Keeper', role: [{ id: 5, name: 'GemKeeper', level: 1 }] },
    permissions: perms
  })
  await page.goto('/plan-order-tracking-update/11800')

  // แท็บรายละเอียด: ไม่มีปุ่มแก้ไขหัวใบงาน / หลอม / CVD
  await expect(page.getByRole('menuitem', { name: 'คัดพลอย' }).first()).toBeVisible()
  await expect(page.locator('button .bi-brush')).toHaveCount(0)
  await expect(page.locator('button .bi-trash')).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'CVD', exact: true })).toHaveCount(0)

  // ไม่เห็นแท็บบัตรต้นทุน
  await expect(page.getByRole('menuitem', { name: 'บัตรต้นทุน' })).toHaveCount(0)

  // แท็บทอง/เงิน: ไม่มีปุ่มเพิ่ม/ลบวัสดุ
  await page.getByRole('menuitem', { name: 'ทอง/เงิน' }).first().click()
  await expect(page.getByText('ทอง E2E')).toBeVisible()
  await expect(page.locator('.btn-add')).toHaveCount(0)
  await expect(page.locator('button[title="ลบ"]')).toHaveCount(0)

  await page.getByRole('menuitem', { name: 'คัดพลอย' }).first().click()
  await expect(returnButton(page, 'PIO261127022')).toBeVisible()
  // ไม่เห็นคอลัมน์ราคา
  await expect(page.getByRole('columnheader', { name: 'ราคา', exact: true })).toHaveCount(0)
  await expect(page.locator('button[title="เเก้ไข"]')).toHaveCount(0)
  await expect(page.locator('button[title="โอนงาน"]')).toHaveCount(0)
  // ปุ่มพิมพ์แบบ (สลิปมีค่าแรง/ยอด gold loss) ซ่อนทุกแท็บของสถานะ
  await expect(page.locator('button[title="พิมพ์แบบ"]')).toHaveCount(0)
  await page.getByRole('menuitem', { name: 'ฝังพลอย' }).first().click()
  await expect(page.locator('button[title="พิมพ์แบบ"]')).toHaveCount(0)

  // แท็บหลังบัตรต้นทุน (สำเร็จ id 8 / หลอม id 9) ต้องไม่เลื่อนตำแหน่ง: เนื้อหาเป็นของสถานะนั้น
  await page.getByRole('menuitem', { name: 'สำเร็จ', exact: true }).click()
  await expect(page.getByText('GOLD-DONE')).toBeVisible()
  await expect(page.getByText('GOLD-MELT')).toHaveCount(0)
  await page.getByRole('menuitem', { name: 'หลอม', exact: true }).click()
  await expect(page.getByText('GOLD-MELT')).toBeVisible()
  await expect(page.getByText('GOLD-DONE')).toHaveCount(0)

  api.assertNoLeak()
})

test('หน้าคืน-เบิกพลอย: เตือนเบิกซ้ำใต้ช่องแผนผลิต และต้องติ๊กตั้งใจเบิกก่อนบันทึก', async ({ page }) => {
  const dupRow = {
    code: 'SD0109',
    wo: '6911008',
    woNumber: '13',
    outboundRunning: 'PIO261124005',
    outboundDate: '2026-11-24T09:50:00',
    qty: 6,
    weight: 0.16
  }
  const api = await installApiMocks(page, {
    'ReceiptAndIssueStockGem/Picklist': {
      data: [
        {
          running: 'PO261120001',
          requestDate: '2026-11-20T00:00:00',
          returnDate: '2026-11-30T00:00:00',
          operatorBy: 'ทัก',
          remark: '',
          items: [{ code: 'SD0109', name: 'Sapphire SQ', qty: 12, qtyWeight: 0.32, type: 5 }]
        }
      ]
    },
    'ReceiptAndIssueStockGem/ListTransection': { data: [], total: 0 },
    'ProductionPlan/ProductionPlanSearchByProductionPlanId': {
      data: [{ id: 11800, wo: '6911008', woNumber: '13', mold: 'CR0994' }],
      total: 1
    },
    'ReceiptAndIssueStockGem/CheckDuplicateOutbound': [dupRow]
  })
  await seedAuth(page, { permissions: ['dashboard', 'stock-gem:view', 'stock-gem:edit'] })
  await page.goto('/stock-gem-pick-return-and-outbound-create/PO261120001')

  await page.locator('button[title="เบิก"]').click()
  await page.locator('.p-autocomplete-input').fill('6911008')
  await page.getByText('6911008-13, เเม่พิมพ์: CR0994').click()

  await expect(page.getByText('ใบงานนี้เบิก SD0109 ไปแล้ว')).toBeVisible()
  await expect(page.getByText(/PIO261124005 · .* · 6\.000 เม็ด \/ 0\.160/)).toBeVisible()

  const numberInputs = page.locator('input[type="number"]')
  await numberInputs.nth(0).fill('6')
  await numberInputs.nth(1).fill('0.16')

  await page.getByRole('button', { name: 'ตรวจสอบรายการ' }).click()

  await expect(page.getByText('ยืนยันการเบิกซ้ำ')).toBeVisible()
  const proceed = page.getByRole('button', { name: 'ยืนยันเบิก' })
  await expect(proceed).toBeDisabled()
  await page.getByText('ตั้งใจเบิกเพิ่ม (เช่น พลอยแตก ต้องเปลี่ยน)').click()
  await expect(proceed).toBeEnabled()
  await proceed.click()

  await expect(page.getByText('ยืนยันคืนเข้าคลังและเบิกออกคลัง')).toBeVisible()
  expect(api.callsTo('ReceiptAndIssueStockGem/PickReturnGem')).toHaveLength(0)
  expect(api.callsTo('ReceiptAndIssueStockGem/CheckDuplicateOutbound').length).toBeGreaterThanOrEqual(2)

  api.assertNoLeak()
})
