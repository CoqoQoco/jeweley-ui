import { describe, it, expect } from 'vitest'

import {
  FINDING_SEVERITIES,
  STATUS_VALUES,
  resolveFindingSeverityIcon,
  resolveStatusIcon,
  worstStatus,
  resolveFindingParams,
  buildFindingKey,
  formatInsightNumber,
  formatInsightPercent
} from './insight-helpers.js'

describe('resolveFindingSeverityIcon', () => {
  it('maps every known severity to an icon class', () => {
    FINDING_SEVERITIES.forEach((severity) => {
      expect(resolveFindingSeverityIcon(severity)).toMatch(/^bi-/)
    })
  })

  it('falls back to the info icon for an unknown severity', () => {
    expect(resolveFindingSeverityIcon('bogus')).toBe(resolveFindingSeverityIcon('info'))
  })
})

describe('resolveStatusIcon', () => {
  it('maps every known status to an icon class', () => {
    STATUS_VALUES.forEach((status) => {
      expect(resolveStatusIcon(status)).toMatch(/^bi-/)
    })
  })

  it('falls back to the ok icon for an unknown status', () => {
    expect(resolveStatusIcon('bogus')).toBe(resolveStatusIcon('ok'))
  })
})

describe('worstStatus', () => {
  it('ranks critical > warning > ok', () => {
    expect(worstStatus('ok', 'warning')).toBe('warning')
    expect(worstStatus('warning', 'critical')).toBe('critical')
    expect(worstStatus('critical', 'ok')).toBe('critical')
  })

  it('is order-independent', () => {
    expect(worstStatus('warning', 'ok')).toBe(worstStatus('ok', 'warning'))
  })

  it('handles empty/missing values gracefully', () => {
    expect(worstStatus('', 'warning')).toBe('warning')
    expect(worstStatus('critical', '')).toBe('critical')
    expect(worstStatus('', '')).toBe('')
  })
})

describe('resolveFindingParams', () => {
  it('leaves params untouched when there is no deptKey', () => {
    expect(resolveFindingParams({ count: 5, percent: 12.5 })).toEqual({ count: 5, percent: 12.5 })
  })

  it('translates deptKey via the injected translateDept function', () => {
    const translateDept = (key) => `แผนก-${key}`
    expect(resolveFindingParams({ deptKey: 'setting', count: 3 }, translateDept)).toEqual({
      deptKey: 'แผนก-setting',
      count: 3
    })
  })

  it('returns an empty object when params is null/undefined', () => {
    expect(resolveFindingParams(null)).toEqual({})
    expect(resolveFindingParams(undefined)).toEqual({})
  })

  it('leaves deptKey as-is when no translateDept function is given', () => {
    expect(resolveFindingParams({ deptKey: 'setting' })).toEqual({ deptKey: 'setting' })
  })
})

describe('buildFindingKey', () => {
  it('combines code and params into a stable string', () => {
    expect(buildFindingKey('WIP_STALE', { count: 5 })).toBe('WIP_STALE:{"count":5}')
  })

  it('produces different keys for the same code with different params', () => {
    const keyA = buildFindingKey('WIP_DEPT_STALE_TOP', { deptKey: 'setting' })
    const keyB = buildFindingKey('WIP_DEPT_STALE_TOP', { deptKey: 'trim' })
    expect(keyA).not.toBe(keyB)
  })

  it('handles missing params', () => {
    expect(buildFindingKey('WIP_MELTED_OPEN')).toBe('WIP_MELTED_OPEN:{}')
  })
})

describe('formatInsightNumber', () => {
  it('formats using Thai thousands separators', () => {
    expect(formatInsightNumber(1234)).toBe('1,234')
  })

  it('defaults to 0 for falsy values', () => {
    expect(formatInsightNumber(null)).toBe('0')
    expect(formatInsightNumber(undefined)).toBe('0')
    expect(formatInsightNumber(0)).toBe('0')
  })
})

describe('formatInsightPercent', () => {
  it('appends a % sign', () => {
    expect(formatInsightPercent(12)).toBe('12%')
  })

  it('keeps up to 1 decimal place', () => {
    expect(formatInsightPercent(12.34)).toBe('12.3%')
  })

  it('defaults to 0% for falsy values', () => {
    expect(formatInsightPercent(null)).toBe('0%')
  })
})
