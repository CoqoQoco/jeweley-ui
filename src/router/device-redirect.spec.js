import { describe, it, expect } from 'vitest'

import { shouldLookupMobileTwin, shouldSkipDeviceRedirect, resolveMobileRedirect, buildLoginLocation } from './device-redirect.js'
import oauthRoutes from './web/oauth/oauth-routes.js'

const authorizeQuery = { client_id: 'c', redirect_uri: 'r', code_challenge: 'x' }
const authorizeTo = {
  path: '/oauth/authorize',
  name: 'oauth-authorize',
  query: authorizeQuery,
  fullPath: '/oauth/authorize?client_id=c',
  matched: [{ meta: oauthRoutes[0].meta }]
}
const ordinaryTo = { path: '/stock', name: 'stock', query: { a: '1' }, matched: [{ meta: {} }] }

describe('oauth-authorize route meta', () => {
  it('is skipped by the mobile redirect and returns to itself after login', () => {
    expect(oauthRoutes[0].path).toBe('/oauth/authorize')
    expect(oauthRoutes[0].meta.skipDeviceRedirect).toBe(true)
    expect(oauthRoutes[0].meta.returnAfterLogin).toBe(true)
  })
})

describe('resolveMobileRedirect', () => {
  it('never redirects /oauth/authorize on a mobile device even when a /mobile twin exists (query must not be lost)', () => {
    expect(shouldSkipDeviceRedirect(authorizeTo)).toBe(true)
    expect(resolveMobileRedirect({ shouldUseMobile: true, to: authorizeTo, mobileRouteExists: true })).toBeNull()
  })

  it('still redirects ordinary web routes to /mobile/* keeping the query', () => {
    expect(resolveMobileRedirect({ shouldUseMobile: true, to: ordinaryTo, mobileRouteExists: true })).toEqual({
      path: '/mobile/stock',
      query: { a: '1' }
    })
  })

  it('does not redirect on desktop, login route, mobile paths or when no mobile twin exists', () => {
    expect(resolveMobileRedirect({ shouldUseMobile: false, to: ordinaryTo, mobileRouteExists: true })).toBeNull()
    expect(
      resolveMobileRedirect({ shouldUseMobile: true, to: { ...ordinaryTo, name: 'routes-login' }, mobileRouteExists: true })
    ).toBeNull()
    expect(
      resolveMobileRedirect({ shouldUseMobile: true, to: { ...ordinaryTo, path: '/mobile/stock' }, mobileRouteExists: true })
    ).toBeNull()
    expect(resolveMobileRedirect({ shouldUseMobile: true, to: ordinaryTo, mobileRouteExists: false })).toBeNull()
  })
})

describe('buildLoginLocation', () => {
  it('returns to the same page with its query for routes flagged returnAfterLogin', () => {
    expect(buildLoginLocation(authorizeTo)).toEqual({
      path: '/login',
      query: { redirect: '/oauth/authorize?client_id=c' }
    })
  })

  it('keeps the plain /login for every other route', () => {
    expect(buildLoginLocation(ordinaryTo)).toBe('/login')
    expect(buildLoginLocation(undefined)).toBe('/login')
  })
})

describe('shouldLookupMobileTwin', () => {
  it('skips the /mobile lookup for skipDeviceRedirect and noMobileTwin routes only', () => {
    expect(shouldLookupMobileTwin(authorizeTo)).toBe(false)
    expect(shouldLookupMobileTwin({ matched: [{ meta: { noMobileTwin: true } }] })).toBe(false)
    expect(shouldLookupMobileTwin(ordinaryTo)).toBe(true)
  })
})
