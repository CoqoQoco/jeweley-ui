import { describe, it, expect } from 'vitest'

import {
  buildConsentRequest,
  isConsentRequestComplete,
  buildInitialChecked,
  buildApprovedScopes,
  buildDataCategoryRows,
  resolveErrorState,
  extractRedirectUrl,
  isFramed,
  getRedirectHosts,
  isSafeRedirect,
  resolveFinishResult,
  resolveDoneMessageKey
} from './oauth-authorize-helpers.js'

const scopes = [
  { code: 'module:executive', kind: 'MODULE', required: true, defaultChecked: true, available: true },
  { code: 'data:cost', kind: 'DATA', required: false, defaultChecked: false, available: true },
  { code: 'data:receivables', kind: 'DATA', required: false, defaultChecked: true, available: false }
]

describe('buildConsentRequest', () => {
  it('maps snake_case OAuth query to the camelCase consent request', () => {
    const request = buildConsentRequest({
      response_type: 'code',
      client_id: 'https://claude.ai/meta.json',
      redirect_uri: 'https://claude.ai/cb',
      scope: 'module:executive',
      state: 'abc',
      code_challenge: 'xyz',
      code_challenge_method: 'S256',
      resource: 'https://api/mcp'
    })
    expect(request).toEqual({
      responseType: 'code',
      clientId: 'https://claude.ai/meta.json',
      redirectUri: 'https://claude.ai/cb',
      scope: 'module:executive',
      state: 'abc',
      codeChallenge: 'xyz',
      codeChallengeMethod: 'S256',
      resource: 'https://api/mcp'
    })
  })

  it('takes the first value of repeated params and defaults missing ones to empty string', () => {
    const request = buildConsentRequest({ client_id: ['a', 'b'] })
    expect(request.clientId).toBe('a')
    expect(request.state).toBe('')
    expect(buildConsentRequest()).toMatchObject({ clientId: '', redirectUri: '' })
  })

  it('flags a request without client or redirect as incomplete', () => {
    expect(isConsentRequestComplete(buildConsentRequest({ client_id: 'a' }))).toBe(false)
    expect(isConsentRequestComplete(buildConsentRequest({ client_id: 'a', redirect_uri: 'b' }))).toBe(true)
  })
})

describe('scope selection', () => {
  it('pre-checks required/default scopes but never an unavailable one; data:* stays unchecked', () => {
    expect(buildInitialChecked(scopes)).toEqual({
      'module:executive': true,
      'data:cost': false,
      'data:receivables': false
    })
  })

  it('approves required + ticked available MODULE scopes only and never sends data:*', () => {
    expect(buildApprovedScopes(scopes, { 'data:cost': true, 'data:receivables': true })).toEqual(['module:executive'])
    expect(buildApprovedScopes(scopes, {})).toEqual(['module:executive'])
  })

  it('lists all 4 data categories with on/off from grantedCategories', () => {
    const rows = buildDataCategoryRows([{ code: 'data:cost', nameTh: 'ต้นทุน' }])
    expect(rows.map((r) => r.code)).toEqual(['data:customer-names', 'data:worker-names', 'data:cost', 'data:receivables'])
    expect(rows.filter((r) => r.enabled).map((r) => r.code)).toEqual(['data:cost'])
    expect(buildDataCategoryRows().every((r) => !r.enabled)).toBe(true)
  })
})

describe('error + redirect helpers', () => {
  it('maps http status to an error state', () => {
    expect(resolveErrorState({ response: { status: 400 } })).toBe('invalid')
    expect(resolveErrorState({ response: { status: 503 } })).toBe('unavailable')
    expect(resolveErrorState({ response: { status: 401 } })).toBe('session')
    expect(resolveErrorState({})).toBe('unknown')
  })

  it('extracts redirectUrl only when it is a non-empty string', () => {
    expect(extractRedirectUrl({ redirectUrl: 'https://x/cb?code=1' })).toBe('https://x/cb?code=1')
    expect(extractRedirectUrl({})).toBe('')
    expect(extractRedirectUrl(null)).toBe('')
  })
})

describe('isFramed', () => {
  it('is true when top differs from self or top is inaccessible', () => {
    const top = {}
    expect(isFramed({ top, self: {} })).toBe(true)
    const same = {}
    expect(isFramed({ top: same, self: same })).toBe(false)
    const blocked = {}
    Object.defineProperty(blocked, 'top', {
      get() {
        throw new Error('cross-origin')
      }
    })
    expect(isFramed(blocked)).toBe(true)
  })
})

describe('getRedirectHosts', () => {
  it('lists every distinct full host (with port) and keeps unparsable values raw', () => {
    expect(getRedirectHosts(['https://claude.ai/cb', 'https://claude.ai/other', 'http://localhost:6274/x', 'weird'])).toEqual([
      'claude.ai',
      'localhost:6274',
      'weird'
    ])
    expect(getRedirectHosts(undefined)).toEqual([])
  })
})

describe('getRedirectHosts — custom scheme', () => {
  it('returns the raw URI when the host is empty (custom scheme)', () => {
    expect(getRedirectHosts(['com.attacker.app:/cb'])).toEqual(['com.attacker.app:/cb'])
  })
})

describe('isSafeRedirect', () => {
  it('accepts only a redirect url that starts with the validated redirect uri', () => {
    expect(isSafeRedirect('https://claude.ai/cb?code=1&state=s', 'https://claude.ai/cb')).toBe(true)
    expect(isSafeRedirect('https://evil.com/cb?code=1', 'https://claude.ai/cb')).toBe(false)
    expect(isSafeRedirect('', 'https://claude.ai/cb')).toBe(false)
    expect(isSafeRedirect('https://claude.ai/cb?code=1', '')).toBe(false)
  })
})

describe('resolveFinishResult', () => {
  const uri = 'https://claude.ai/cb'

  it('Deny of an unverified client returns null redirectUrl → ok with no redirect (show denied state in page)', () => {
    expect(resolveFinishResult({ redirectUrl: null }, uri)).toEqual({ ok: true, redirectUrl: '' })
    expect(resolveFinishResult({}, uri)).toEqual({ ok: true, redirectUrl: '' })
  })

  it('passes through a safe redirect and rejects a mismatching one', () => {
    expect(resolveFinishResult({ redirectUrl: `${uri}?error=access_denied` }, uri)).toEqual({
      ok: true,
      redirectUrl: `${uri}?error=access_denied`
    })
    expect(resolveFinishResult({ redirectUrl: 'https://evil.com/x' }, uri)).toEqual({ ok: false, redirectUrl: '' })
  })
})

describe('resolveDoneMessageKey', () => {
  it('mentions the back button only when a redirect url (button) exists', () => {
    expect(resolveDoneMessageKey('approved', 'https://x/cb')).toBe('approvedBody')
    expect(resolveDoneMessageKey('approved', '')).toBe('approvedDoneBody')
    expect(resolveDoneMessageKey('denied', 'https://x/cb')).toBe('deniedBody')
    expect(resolveDoneMessageKey('denied', '')).toBe('deniedDoneBody')
  })
})
