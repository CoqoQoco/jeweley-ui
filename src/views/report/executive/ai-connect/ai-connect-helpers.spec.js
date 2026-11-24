import { describe, it, expect } from 'vitest'

import {
  getExpiryStatus,
  splitScopeChips,
  buildMaskedLabel,
  buildDefaultLogRange,
  buildAccessLogParams,
  isLogFilterDefault,
  formatScopeName,
  resolveLogResult
} from './ai-connect-helpers.js'

const NOW = new Date('2026-11-24T10:00:00+07:00')
const daysFromNow = (days) => new Date(NOW.getTime() + days * 86400000).toISOString()

describe('getExpiryStatus', () => {
  it('no expiry → none', () => {
    expect(getExpiryStatus(null, NOW)).toEqual({ status: 'none', daysLeft: null })
  })

  it('past → expired', () => {
    expect(getExpiryStatus(daysFromNow(-1), NOW).status).toBe('expired')
  })

  it('7 days or less → soon, 8+ days → ok', () => {
    expect(getExpiryStatus(daysFromNow(7), NOW)).toEqual({ status: 'soon', daysLeft: 7 })
    expect(getExpiryStatus(daysFromNow(1), NOW).status).toBe('soon')
    expect(getExpiryStatus(daysFromNow(8), NOW)).toEqual({ status: 'ok', daysLeft: 8 })
  })
})

describe('splitScopeChips', () => {
  it('shows up to 3 chips and keeps the rest for "+n" + tooltip', () => {
    expect(splitScopeChips(['a', 'b', 'c', 'd', 'e'])).toEqual({ visible: ['a', 'b', 'c'], hidden: ['d', 'e'] })
    expect(splitScopeChips(['a'])).toEqual({ visible: ['a'], hidden: [] })
    expect(splitScopeChips(null)).toEqual({ visible: [], hidden: [] })
  })
})

describe('buildMaskedLabel', () => {
  const t = (key, params) => `${key}:${params?.count}`

  it('is empty when nothing was masked', () => {
    expect(buildMaskedLabel(0, t)).toBe('')
    expect(buildMaskedLabel(undefined, t)).toBe('')
  })

  it('reports the number of masked items', () => {
    expect(buildMaskedLabel(3, t)).toBe('view.aiConnector.log.maskedCount:3')
  })
})

describe('access log params', () => {
  it('default range is the last 7 days including today', () => {
    const { start, end } = buildDefaultLogRange(NOW)
    expect(Math.round((end - start) / 86400000)).toBe(7)
  })

  it('caps take at 100 and sends token ids only when chosen', () => {
    const range = buildDefaultLogRange(NOW)
    const params = buildAccessLogParams({ skip: 20, take: 500, range, tokenIds: [3] })
    expect(params.take).toBe(100)
    expect(params.skip).toBe(20)
    expect(params.tokenIds).toEqual([3])
    expect(params.clientIds).toEqual([])
    expect(params.from < params.to).toBe(true)
  })

  it('detects whether the filter is still at its default', () => {
    const range = buildDefaultLogRange(NOW)
    expect(isLogFilterDefault(range, [], NOW)).toBe(true)
    expect(isLogFilterDefault(range, [1], NOW)).toBe(false)
    expect(isLogFilterDefault({ start: new Date('2026-01-01'), end: range.end }, [], NOW)).toBe(false)
  })
})

describe('formatScopeName / resolveLogResult', () => {
  it('translates a known scope and falls back to the raw code', () => {
    const t = (key) => `T(${key})`
    expect(formatScopeName('module:executive', t)).toBe('T(view.aiConnector.scope.module_executive)')
    expect(formatScopeName('data:cost', (key) => key)).toBe('data:cost')
  })

  it('maps success flag to result', () => {
    expect(resolveLogResult({ success: true })).toBe('success')
    expect(resolveLogResult({ success: false })).toBe('error')
  })
})
