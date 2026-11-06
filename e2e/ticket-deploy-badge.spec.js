import { test, expect } from '@playwright/test'
import { installApiMocks } from './support/api-mocks.js'
import { seedAuth, DEFAULT_PERMISSIONS } from './support/auth.js'

const base = {
  type: 1,
  topicName: 'งานขาย',
  statusId: 3,
  statusNameTh: 'แก้เสร็จ',
  createBy: 'tester',
  createDate: '2026-11-06T03:00:00Z',
  updateDate: '2026-11-06T04:00:00Z',
  hasNewMessage: false
}

const TICKETS = [
  { ...base, id: 21, ticketNo: 'TK202611060021', title: 'ยังไม่ deploy', deployStatus: 'none' },
  { ...base, id: 22, ticketNo: 'TK202611060022', title: 'รอ deploy', deployStatus: 'pending', commitUi: 'abc1234' },
  {
    ...base,
    id: 23,
    ticketNo: 'TK202611060023',
    title: 'deploy แล้ว',
    deployStatus: 'deployed',
    deployDate: '2026-11-06T05:00:00Z',
    commitUi: 'abc1234',
    commitApi: 'def5678'
  }
]

test('หน้า manage แสดง chip Deploy ครบ 3 สถานะ', async ({ page }) => {
  const api = await installApiMocks(page, {
    'Ticket/SearchTicket': { data: TICKETS, total: TICKETS.length },
    'Ticket/Dashboard': {}
  })
  await seedAuth(page, { permissions: [...DEFAULT_PERMISSIONS, 'ticket:manage'] })
  await page.goto('/ticket-manage')

  const rows = page.locator('tbody tr')
  await expect(rows).toHaveCount(3)
  await expect(rows.nth(0).locator('.deploy-badge.deploy-none')).toBeVisible()
  await expect(rows.nth(1).locator('.deploy-badge.deploy-pending')).toBeVisible()
  await expect(rows.nth(2).locator('.deploy-badge.deploy-deployed')).toBeVisible()
  await expect(page.locator('.deploy-badge')).toHaveCount(3)

  expect(api.callsTo('Ticket/SearchTicket').length).toBeGreaterThan(0)
  api.assertNoLeak()
})
