import { test, expect } from '@playwright/test'
import { installApiMocks } from './support/api-mocks.js'
import { seedAuth } from './support/auth.js'

const TICKETS = [
  {
    id: 11,
    ticketNo: 'TK202611060001',
    type: 1,
    topicName: 'งานขาย',
    title: 'ยอดรวมใบแจ้งหนี้ไม่ตรง',
    statusId: 1,
    statusNameTh: 'เปิด',
    createDate: '2026-11-06T03:00:00Z',
    hasNewMessage: true
  },
  {
    id: 12,
    ticketNo: 'TK202611060002',
    type: 2,
    topicName: 'รายงาน',
    title: 'ขอรายงานยอดขายรายเดือน',
    statusId: 3,
    statusNameTh: 'แก้ไขแล้ว',
    createDate: '2026-11-05T03:00:00Z',
    hasNewMessage: false
  }
]

// ช่องทางแจ้งปัญหา/ขอฟีเจอร์ของทุก role -- ถ้าหน้านี้เปิดไม่ได้ ผู้ใช้แจ้งปัญหาไม่ได้
test('หน้า Ticket ของฉัน เปิดได้และแสดงรายการจาก mock', async ({ page }) => {
  const api = await installApiMocks(page, {
    'Ticket/MyTicket': { data: TICKETS, total: TICKETS.length }
  })
  await seedAuth(page)
  await page.goto('/ticket-my')

  await expect(page).toHaveURL(/\/ticket-my$/)
  const rows = page.locator('tbody tr')
  await expect(rows).toHaveCount(2)
  await expect(rows.nth(0)).toContainText('TK202611060001')
  await expect(rows.nth(0)).toContainText('ยอดรวมใบแจ้งหนี้ไม่ตรง')
  await expect(rows.nth(1)).toContainText('TK202611060002')
  await expect(rows.nth(1)).toContainText('ขอรายงานยอดขายรายเดือน')

  expect(api.callsTo('Ticket/MyTicket').length).toBeGreaterThan(0)
  api.assertNoLeak()
})
