import { describe, it, expect } from 'vitest'

import {
  resolvePlanWorkersDisplay,
  resolveStatusLine,
  buildLastActionLine,
  resolvePlanLinkState,
  PLAN_DETAIL_ROUTE_NAME,
  EXECUTIVE_PLAN_DETAIL_ROUTE_NAME
} from './wip-plan-table-helpers.js'

describe('resolvePlanWorkersDisplay', () => {
  it('returns empty shape when both workers and workerItems are empty/missing', () => {
    expect(resolvePlanWorkersDisplay({})).toEqual({ shown: [], moreCount: 0, allNames: [] })
    expect(resolvePlanWorkersDisplay({ workers: [], workerItems: [] })).toEqual({ shown: [], moreCount: 0, allNames: [] })
    expect(resolvePlanWorkersDisplay(null)).toEqual({ shown: [], moreCount: 0, allNames: [] })
  })

  // fallback: API ยังไม่ส่ง workerItems มาครบทุก response — ครอบ workers (string[] ล้วน) เป็น shape เดียวกัน
  it('falls back to the legacy workers (names-only) array when workerItems is missing', () => {
    expect(resolvePlanWorkersDisplay({ workers: ['สมชาย', 'สมหญิง'] })).toEqual({
      shown: [
        { code: null, name: 'สมชาย', isQueue: false },
        { code: null, name: 'สมหญิง', isQueue: false }
      ],
      moreCount: 0,
      allNames: ['สมชาย', 'สมหญิง']
    })
  })

  it('falls back to workers when workerItems is an empty array', () => {
    expect(resolvePlanWorkersDisplay({ workers: ['สมชาย'], workerItems: [] })).toEqual({
      shown: [{ code: null, name: 'สมชาย', isQueue: false }],
      moreCount: 0,
      allNames: ['สมชาย']
    })
  })

  it('filters out falsy entries from the legacy workers array', () => {
    expect(resolvePlanWorkersDisplay({ workers: ['A', null, '', 'B'] }).allNames).toEqual(['A', 'B'])
  })

  it('uses workerItems when present, keeping code + isQueue', () => {
    const workerItems = [
      { code: 'CW01', name: 'สมชาย', isQueue: false },
      { code: 'CW02', name: 'สมหญิง', isQueue: false }
    ]
    expect(resolvePlanWorkersDisplay({ workerItems })).toEqual({ shown: workerItems, moreCount: 0, allNames: ['สมชาย', 'สมหญิง'] })
  })

  // ตามสั่ง: ช่างจริงมาก่อนเสมอ ตามด้วยรายการรอคิว ไม่ว่า API จะส่งมาเรียงแบบไหน
  it('orders real workers (isQueue=false) before queued items (isQueue=true), regardless of input order', () => {
    const workerItems = [
      { code: 'CG9K', name: 'รอจ่ายขัดชุบ 9K', isQueue: true },
      { code: 'CW01', name: 'สมชาย', isQueue: false }
    ]
    expect(resolvePlanWorkersDisplay({ workerItems }).shown).toEqual([
      { code: 'CW01', name: 'สมชาย', isQueue: false },
      { code: 'CG9K', name: 'รอจ่ายขัดชุบ 9K', isQueue: true }
    ])
  })

  it('truncates to the first maxShown items (default 3) and reports the remaining count', () => {
    const workerItems = [
      { code: 'CW01', name: 'A', isQueue: false },
      { code: 'CW02', name: 'B', isQueue: false },
      { code: 'CW03', name: 'C', isQueue: false },
      { code: 'CW04', name: 'D', isQueue: false },
      { code: 'CW05', name: 'E', isQueue: false }
    ]
    const result = resolvePlanWorkersDisplay({ workerItems })
    expect(result.shown.map((w) => w.name)).toEqual(['A', 'B', 'C'])
    expect(result.moreCount).toBe(2)
    expect(result.allNames).toEqual(['A', 'B', 'C', 'D', 'E'])
  })

  it('respects a custom maxShown', () => {
    const workerItems = [
      { code: 'CW01', name: 'A', isQueue: false },
      { code: 'CW02', name: 'B', isQueue: false },
      { code: 'CW03', name: 'C', isQueue: false }
    ]
    const result = resolvePlanWorkersDisplay({ workerItems }, 2)
    expect(result.shown.map((w) => w.name)).toEqual(['A', 'B'])
    expect(result.moreCount).toBe(1)
  })

  it('counts a queued item toward maxShown/moreCount the same as a real worker', () => {
    const workerItems = [
      { code: 'CW01', name: 'A', isQueue: false },
      { code: 'CW02', name: 'B', isQueue: false },
      { code: 'CW03', name: 'C', isQueue: false },
      { code: 'CG9K', name: 'รอจ่ายขัดชุบ 9K', isQueue: true }
    ]
    const result = resolvePlanWorkersDisplay({ workerItems })
    expect(result.shown.map((w) => w.name)).toEqual(['A', 'B', 'C'])
    expect(result.moreCount).toBe(1)
  })
})

describe('resolveStatusLine', () => {
  it('returns the status name when it differs from the department label', () => {
    expect(resolveStatusLine('ออกแบบ', 'รอตรวจแบบ')).toBe('รอตรวจแบบ')
  })

  it('returns empty string when the status name matches the department label exactly', () => {
    expect(resolveStatusLine('ออกแบบ', 'ออกแบบ')).toBe('')
  })

  it('returns empty string when there is no status name', () => {
    expect(resolveStatusLine('ออกแบบ', null)).toBe('')
    expect(resolveStatusLine('ออกแบบ', '')).toBe('')
    expect(resolveStatusLine('ออกแบบ', undefined)).toBe('')
  })
})

describe('buildLastActionLine', () => {
  it('joins updater and action with a middle dot', () => {
    expect(buildLastActionLine('สมชาย', 'ส่งขัด', 'สร้างใบงาน')).toBe('สมชาย · ส่งขัด')
  })

  it('falls back to the created-fallback label when lastAction is null', () => {
    expect(buildLastActionLine('สมชาย', null, 'สร้างใบงาน')).toBe('สมชาย · สร้างใบงาน')
  })

  it('falls back to an em dash when lastUpdateBy is missing', () => {
    expect(buildLastActionLine(null, 'ส่งขัด', 'สร้างใบงาน')).toBe('— · ส่งขัด')
  })

  it('handles both missing', () => {
    expect(buildLastActionLine(null, null, 'สร้างใบงาน')).toBe('— · สร้างใบงาน')
  })
})

describe('resolvePlanLinkState', () => {
  it('routes to the full (editable) plan detail when the user has production:edit', () => {
    expect(resolvePlanLinkState(123, true, false)).toEqual({
      canOpen: true,
      routeLocation: { name: PLAN_DETAIL_ROUTE_NAME, params: { id: 123 } }
    })
    // production:edit wins even when the user also happens to have executive:view
    expect(resolvePlanLinkState(123, true, true)).toEqual({
      canOpen: true,
      routeLocation: { name: PLAN_DETAIL_ROUTE_NAME, params: { id: 123 } }
    })
  })

  it('routes to the read-only executive plan detail when the user only has executive:view', () => {
    expect(resolvePlanLinkState(123, false, true)).toEqual({
      canOpen: true,
      routeLocation: { name: EXECUTIVE_PLAN_DETAIL_ROUTE_NAME, params: { id: 123 } }
    })
  })

  it('blocks opening when the user has neither permission', () => {
    expect(resolvePlanLinkState(123, false, false)).toEqual({ canOpen: false, routeLocation: null })
  })

  it('blocks opening when planId is missing, regardless of permissions', () => {
    expect(resolvePlanLinkState(null, true, true)).toEqual({ canOpen: false, routeLocation: null })
    expect(resolvePlanLinkState(undefined, true, true)).toEqual({ canOpen: false, routeLocation: null })
    expect(resolvePlanLinkState(0, true, true)).toEqual({ canOpen: false, routeLocation: null })
  })
})
