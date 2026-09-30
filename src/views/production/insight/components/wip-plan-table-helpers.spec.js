import { describe, it, expect } from 'vitest'

import {
  summarizeWorkers,
  resolveStatusLine,
  buildLastActionLine,
  resolvePlanLinkState,
  PLAN_DETAIL_ROUTE_NAME,
  EXECUTIVE_PLAN_DETAIL_ROUTE_NAME
} from './wip-plan-table-helpers.js'

describe('summarizeWorkers', () => {
  it('returns empty shape when workers is empty/missing', () => {
    expect(summarizeWorkers([])).toEqual({ shown: '', moreCount: 0, title: '' })
    expect(summarizeWorkers(null)).toEqual({ shown: '', moreCount: 0, title: '' })
    expect(summarizeWorkers(undefined)).toEqual({ shown: '', moreCount: 0, title: '' })
  })

  it('shows all names joined when within maxShown', () => {
    expect(summarizeWorkers(['สมชาย', 'สมหญิง'])).toEqual({ shown: 'สมชาย, สมหญิง', moreCount: 0, title: 'สมชาย, สมหญิง' })
  })

  it('truncates to the first maxShown names and reports the remaining count', () => {
    const workers = ['A', 'B', 'C', 'D', 'E']
    expect(summarizeWorkers(workers)).toEqual({ shown: 'A, B', moreCount: 3, title: 'A, B, C, D, E' })
  })

  it('respects a custom maxShown', () => {
    const workers = ['A', 'B', 'C', 'D']
    expect(summarizeWorkers(workers, 3)).toEqual({ shown: 'A, B, C', moreCount: 1, title: 'A, B, C, D' })
  })

  it('filters out falsy entries', () => {
    expect(summarizeWorkers(['A', null, '', 'B'])).toEqual({ shown: 'A, B', moreCount: 0, title: 'A, B' })
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
