import { describe, it, expect, vi, beforeEach } from 'vitest'

import { PERMISSIONS } from './config.js'

const authState = { getUser: null, permissions: [] }

vi.mock('@/stores/modules/authen/authen-store.js', () => ({
  useAuthStore: () => authState
}))

import { hasProductionEditAccess, hasProductionCreateAccess } from './production-access.js'

describe('production-access', () => {
  beforeEach(() => {
    authState.permissions = []
  })

  it('read-only user (view only) has neither edit nor create', () => {
    authState.permissions = [PERMISSIONS.PRODUCTION_VIEW]
    expect(hasProductionEditAccess()).toBe(false)
    expect(hasProductionCreateAccess()).toBe(false)
  })

  it('edit permission grants both edit and create access', () => {
    authState.permissions = [PERMISSIONS.PRODUCTION_EDIT]
    expect(hasProductionEditAccess()).toBe(true)
    expect(hasProductionCreateAccess()).toBe(true)
  })

  it('create permission grants create only', () => {
    authState.permissions = [PERMISSIONS.PRODUCTION_CREATE]
    expect(hasProductionEditAccess()).toBe(false)
    expect(hasProductionCreateAccess()).toBe(true)
  })
})
