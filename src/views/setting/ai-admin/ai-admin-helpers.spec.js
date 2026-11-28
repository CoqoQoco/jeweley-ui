import { describe, it, expect } from 'vitest'

import {
  buildAccessLogParams,
  buildSuspensionParams,
  countActiveSuspensions,
  extractErrorText,
  findGrant,
  formatLogError,
  isConflict,
  isLogFilterEmpty,
  isSelfUser,
  scopeKey,
  splitScopeChips
} from './ai-admin-helpers.js'

describe('grants', () => {
  const user = { grants: [{ scope: 'data:cost', enabled: true, canGrant: true }] }

  it('finds a grant or falls back to a disabled one that cannot be granted', () => {
    expect(findGrant(user, 'data:cost').enabled).toBe(true)
    expect(findGrant(user, 'data:receivables')).toEqual({ scope: 'data:receivables', enabled: false, canGrant: false })
    expect(findGrant(null, 'data:cost').enabled).toBe(false)
  })

  it('builds i18n keys for scope names', () => {
    expect(scopeKey('data:customer-names')).toBe('view.aiConnector.scope.data_customer_names')
  })
})

describe('isSelfUser', () => {
  it('matches by id or case-insensitive username', () => {
    expect(isSelfUser({ userId: 3, username: 'dev' }, { id: 3 })).toBe(true)
    expect(isSelfUser({ userId: 4, username: 'Dev' }, { username: 'dev' })).toBe(true)
    expect(isSelfUser({ userId: 4, username: 'boss' }, { id: 3, username: 'dev' })).toBe(false)
    expect(isSelfUser({ userId: 4 }, null)).toBe(false)
  })
})

describe('errors', () => {
  it('reads plain-text and message bodies, else the fallback', () => {
    expect(extractErrorText({ response: { data: 'ระงับอยู่แล้ว' } }, 'x')).toBe('ระงับอยู่แล้ว')
    expect(extractErrorText({ response: { data: { message: 'm' } } }, 'x')).toBe('m')
    expect(extractErrorText({}, 'x')).toBe('x')
  })

  it('detects 409', () => {
    expect(isConflict({ response: { status: 409 } })).toBe(true)
    expect(isConflict({ response: { status: 400 } })).toBe(false)
  })
})

describe('lists', () => {
  it('counts active suspensions from the users list', () => {
    expect(countActiveSuspensions([{ suspended: true }, { suspended: false }, { suspended: true }])).toBe(2)
  })

  it('splits scope chips', () => {
    expect(splitScopeChips(['a', 'b', 'c', 'd'], 3)).toEqual({ visible: ['a', 'b', 'c'], hidden: ['d'] })
    expect(splitScopeChips(null)).toEqual({ visible: [], hidden: [] })
  })

  it('formats a failed call as Thai text only, without the error code', () => {
    expect(formatLogError({ errorMessageTh: 'ถูกระงับ', errorCode: 'suspended' })).toBe('ถูกระงับ')
    expect(formatLogError({ errorMessageTh: '' }, 'ไม่ทราบสาเหตุ')).toBe('ไม่ทราบสาเหตุ')
  })
})

describe('request params', () => {
  it('sends empty filters as nulls and caps take at 100', () => {
    expect(buildAccessLogParams({ take: 500 })).toEqual({
      skip: 0,
      take: 100,
      sort: [],
      userIds: [],
      tools: [],
      dateFrom: null,
      dateTo: null
    })
  })

  it('sends all selected users/tools and a day-bounded date range', () => {
    const params = buildAccessLogParams({ userIds: [7, 8], tools: ['get_glossary'], start: new Date(2026, 10, 1), end: new Date(2026, 10, 2) })
    expect(params.userIds).toEqual([7, 8])
    expect(params.tools).toEqual(['get_glossary'])
    expect(params.dateFrom).toContain('2026-11-01T00:00:00')
    expect(params.dateTo).toContain('2026-11-02T23:59:59')
  })

  it('knows when no filter is applied', () => {
    expect(isLogFilterEmpty({ userIds: [], tools: [], start: null, end: null })).toBe(true)
    expect(isLogFilterEmpty({ userIds: [1], tools: [] })).toBe(false)
  })

  it('builds suspension params', () => {
    expect(buildSuspensionParams({ skip: 20, take: 10 })).toEqual({ skip: 20, take: 10, sort: [] })
  })
})
