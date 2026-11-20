import { test, expect } from '@playwright/test'
import { installApiMocks } from './support/api-mocks.js'
import { seedAuth } from './support/auth.js'

// อัปเดตงานแต่ง (status 50): ช่องในตารางทอง/พลอยกรอกได้ตลอด ไม่ต้องกด ✓ ต่อแถว
// ถ้าพัง (กลับไปเป็น row editor) ค่าที่กรอกหายเงียบตอนกดบันทึก และจำนวน/น้ำหนักพลอยจากใบเบิกต้องไม่ถูกแก้

const PLAN = {
  id: 701,
  wo: 'WO77',
  woNumber: '001',
  status: 50,
  statusName: 'แต่ง',
  updateDate: '2026-11-01T00:00:00',
  tbtProductionPlanStatusHeader: [
    {
      id: 9,
      status: 50,
      createBy: 'e2e',
      createDate: '2026-11-01T00:00:00',
      workerCode: 'W1',
      remark1: '',
      remark2: '',
      tbtProductionPlanStatusDetail: [
        { itemNo: 1, gold: 'YG', worker: 'W1', goldQtySend: 1, goldWeightSend: 3, goldQtyCheck: 1, goldWeightCheck: 1.5 }
      ],
      tbtProductionPlanStatusGem: [
        { id: 55, code: 'G55', name: 'Ruby E2E', itemNo: 1, qty: 2, weight: 1.25, price: 10, outboundRunning: 'OB-E2E-1' }
      ]
    }
  ]
}

test('แก้น้ำหนักรับทอง + กรอกความยาวพลอย 18 นิ้ว แล้วบันทึกโดยไม่กด ✓ ค่าถึง payload และพลอยใบเบิกไม่ถูกแก้', async ({ page }) => {
  const api = await installApiMocks(page, {
    'ProductionPlan/ProductionPlanGet': PLAN,
    'ProductionPlan/ProductionPlanMateriaGet': [],
    'ProductionPlan/GetProductionPlanStatus': [{ code: 50, description: 'แต่ง' }],
    'ProductionPlanCost/ListGoldCostItem': { data: [], total: 0 },
    'Production/Bom/Get': {},
    'Production/Bom/Transaction': {},
    'Master/MasterProductType': [],
    'Master/MasterCustomerType': [],
    'Master/MasterGold': [{ code: 'YG', description: 'ทองเหลือง E2E' }],
    'Master/MasterGoldSize': [],
    'Master/MasterGem': [],
    'Master/MasterGemShape': [],
    'Worker/Search': { data: [{ code: 'W1', nameTh: 'ช่าง E2E' }], total: 1 },
    'StockGem/Search': [{ id: 55, code: 'G55', name: 'Ruby E2E' }],
    'ProductionPlan/ProductionPlanUpdateStatusDetail': { success: true }
  })
  await seedAuth(page, { permissions: ['dashboard', 'production:view', 'production:edit'] })
  await page.goto('/plan-order-tracking-update/701')

  await page.getByRole('menuitem', { name: 'แต่ง' }).first().click()
  await page.locator('button[title="เเก้ไข"]').click()

  const weightCheck = page.locator('input[aria-label="น้ำหนักรับ"]')
  await expect(weightCheck).toHaveValue('1.5')
  await weightCheck.fill('2.75')

  const length = page.locator('input[aria-label="ความยาว"]')
  await expect(length).toBeVisible()
  await length.fill('18')
  await page.locator('input[aria-label="หน่วยความยาว"]').fill('นิ้ว')

  await expect(page.locator('input[aria-label="จำนวน"]').last()).toBeDisabled()
  await expect(page.locator('input[aria-label="น้ำหนัก"]').last()).toBeDisabled()

  await page.locator('form button[type="submit"]').filter({ hasText: 'ยืนยัน' }).click()
  await page.locator('.swal2-confirm').click()

  await expect.poll(() => api.callsTo('ProductionPlan/ProductionPlanUpdateStatusDetail').length).toBe(1)
  const body = api.callsTo('ProductionPlan/ProductionPlanUpdateStatusDetail')[0].body
  expect(body.golds).toHaveLength(1)
  expect(body.golds[0].goldWeightCheck).toBe(2.75)
  expect(body.gems).toHaveLength(1)
  expect(body.gems[0]).toMatchObject({ id: 55, length: 18, lengthUnit: 'นิ้ว', qty: 2, weight: 1.25, outboundRunning: 'OB-E2E-1' })

  api.assertNoLeak()
})
