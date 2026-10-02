import { describe, it, expect } from 'vitest'

import { resolveRouteViewKey } from './layout-dashboard-helpers.js'

describe('resolveRouteViewKey', () => {
  it('uses fullPath (default, unchanged behavior) when the route has no meta.queryStableKey flag', () => {
    const route = { path: '/executive', fullPath: '/executive?range=1m', meta: {} }
    expect(resolveRouteViewKey(route)).toBe('/executive?range=1m')
  })

  it('uses fullPath when meta is missing entirely (graceful default)', () => {
    const route = { path: '/executive', fullPath: '/executive?range=1m' }
    expect(resolveRouteViewKey(route)).toBe('/executive?range=1m')
  })

  it('uses fullPath when meta.queryStableKey is explicitly false', () => {
    const route = { path: '/executive', fullPath: '/executive?range=1m', meta: { queryStableKey: false } }
    expect(resolveRouteViewKey(route)).toBe('/executive?range=1m')
  })

  // บั๊กจริงที่เจอบน prod: /executive sync ตัวกรอง/ช่วงเวลาลง query ตลอด (ProductionInsightView.syncStateToQuery)
  // — ถ้า key ยังอิง fullPath router-view จะ remount ทั้งหน้าทุกครั้งที่ query เปลี่ยน ทำให้ endpoint ยิงซ้ำ
  it('uses path only (ignores query) when meta.queryStableKey is true, keeping the key stable across query-only changes', () => {
    const before = { path: '/executive', fullPath: '/executive?range=3m', meta: { queryStableKey: true } }
    const after = { path: '/executive', fullPath: '/executive?range=1m', meta: { queryStableKey: true } }
    expect(resolveRouteViewKey(before)).toBe('/executive')
    expect(resolveRouteViewKey(after)).toBe('/executive')
    expect(resolveRouteViewKey(before)).toBe(resolveRouteViewKey(after))
  })

  it('still changes the key when the path itself changes, even with queryStableKey true (real navigation still remounts)', () => {
    const planA = { path: '/executive/plan-detail/1', fullPath: '/executive/plan-detail/1', meta: { queryStableKey: true } }
    const planB = { path: '/executive/plan-detail/2', fullPath: '/executive/plan-detail/2', meta: { queryStableKey: true } }
    expect(resolveRouteViewKey(planA)).not.toBe(resolveRouteViewKey(planB))
  })

  it('returns an empty string for a missing/null route instead of throwing', () => {
    expect(resolveRouteViewKey(null)).toBe('')
    expect(resolveRouteViewKey(undefined)).toBe('')
  })
})
