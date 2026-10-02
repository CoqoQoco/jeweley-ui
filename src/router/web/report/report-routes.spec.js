import { describe, it, expect } from 'vitest'

import routes from './report-routes.js'
import { PERMISSIONS } from '@/services/permission/config.js'

describe('report-routes — executive overview', () => {
  const executiveParent = routes.find((r) => r.name === 'report-executive')

  it('has its own parent menu entry gated by executive:view only (not report:view)', () => {
    expect(executiveParent).toBeTruthy()
    expect(executiveParent.meta.majorShow).toBe(true)
    expect(executiveParent.meta.menuSection).toBe('report')
    expect(executiveParent.meta.permissions).toEqual([PERMISSIONS.EXECUTIVE_VIEW])
    expect(executiveParent.meta.permissions).not.toContain(PERMISSIONS.REPORT_VIEW)
  })

  it('has a child route for the /executive page, gated the same way', () => {
    const child = executiveParent.children.find((r) => r.name === 'executive')
    expect(child).toBeTruthy()
    expect(child.path).toBe('/executive')
    expect(child.meta.minorShow).toBe(true)
    expect(child.meta.permissions).toEqual([PERMISSIONS.EXECUTIVE_VIEW])
  })

  // /executive ฝัง ProductionInsightView ที่ sync ตัวกรอง/ช่วงเวลาลง query ตลอด — ต้องติด flag นี้กัน
  // router-view (LayoutDashboard.vue, ดู resolveRouteViewKey) remount ทั้งหน้าซ้ำซ้อนตอน query เปลี่ยนเอง
  // (บั๊กจริงที่เจอบน prod: ทุก endpoint รวม ExecutiveReport/Summary ยิงซ้ำ 2 รอบทุกครั้งที่สลับช่วง/ตัวกรอง)
  it('has queryStableKey:true so changing its own query (range/filter) does not remount the whole page', () => {
    const child = executiveParent.children.find((r) => r.name === 'executive')
    expect(child.meta.queryStableKey).toBe(true)
  })

  it('has a read-only plan-detail child route, not shown in the menu, gated by executive:view only', () => {
    expect(executiveParent.children).toHaveLength(2)

    const child = executiveParent.children.find((r) => r.name === 'executive-plan-detail')
    expect(child).toBeTruthy()
    expect(child.path).toBe('/executive/plan-detail/:id')
    expect(child.meta.minorShow).toBe(false)
    expect(child.meta.permissions).toEqual([PERMISSIONS.EXECUTIVE_VIEW])
  })

  it('redirects the parent path straight to /executive', () => {
    expect(executiveParent.redirect).toBe('/executive')
  })
})
