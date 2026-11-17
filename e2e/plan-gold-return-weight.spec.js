import { test, expect } from '@playwright/test'
import { installApiMocks } from './support/api-mocks.js'
import { seedAuth } from './support/auth.js'

// ใบเบิกผสมทอง: คืนตัวเรือนน้ำหนักต่ำกว่า 1 กรัม (เช่น 0.15) ต้องบันทึกได้
// ถ้าพัง (min="1" บนช่องน้ำหนัก) browser บล็อก submit ผู้ใช้สร้างใบเบิกทองไม่ได้

const WO = { id: 501, wo: 'WO99', woNumber: '001', woText: 'WO99-001', statusName: 'หล่อ', mold: 'M-E2E' }

test('บันทึกใบเบิกผสมทองที่คืนตัวเรือนน้ำหนัก 0.15 ได้ (ไม่ถูก native validation บล็อก)', async ({ page }) => {
  const api = await installApiMocks(page, {
    'Master/MasterGold': [{ code: 'YG', description: 'ทองเหลือง E2E' }],
    'Master/MasterGoldSize': [{ code: '90', description: '90%' }],
    'ProductionPlan/ProductionPlanSearchByProductionPlanId': { data: [WO], total: 1 },
    'ProductionPlanCost/CreateGoldCost': { success: true }
  })
  await seedAuth(page, { permissions: ['dashboard', 'production:create'] })
  await page.goto('/plan-gold-order')

  await page.locator('#gold-book-no').fill('1')
  await page.locator('#gold-no').fill('1')
  await page.locator('#gold-cost').fill('100')
  await page.locator('#gold-receipt').fill('E2E')

  await page.locator('#gold-type').click()
  await page.getByRole('option', { name: 'ทองเหลือง E2E' }).click()
  await page.locator('#gold-size').click()
  await page.getByRole('option', { name: '90%' }).click()

  await page.getByRole('button', { name: 'เพิ่ม' }).click()
  const row = page.locator('.p-datatable-tbody tr').first()
  await row.locator('.p-autocomplete-input').fill('WO')
  await page.getByText('WO99-001').first().click()
  await row.locator('input[type="number"]').nth(0).fill('1')
  await row.locator('input[type="number"]').nth(1).fill('0.15')

  await page.locator('form button[type="submit"]').click()
  await page.locator('.swal2-confirm').click()

  await expect.poll(() => api.callsTo('ProductionPlanCost/CreateGoldCost').length).toBe(1)
  const body = api.callsTo('ProductionPlanCost/CreateGoldCost')[0].body
  expect(body.items).toHaveLength(1)
  expect(body.items[0].returnQTY).toBe(1)
  expect(body.items[0].returnWeight).toBe(0.15)

  api.assertNoLeak()
})
