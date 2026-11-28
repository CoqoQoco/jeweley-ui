import { describe, it, expect, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import PrimeVue from 'primevue/config'

import th from '@/language/th.js'
import en from '@/language/en.js'
import { useAiAdminStore } from '@/stores/modules/api/ai-admin/ai-admin-store.js'
import { useAuthStore } from '@/stores/modules/authen/authen-store.js'

import * as sweetAlerts from '@/services/alert/sweetAlerts.js'

import usersTab from './components/users-tab.vue'
import suspendModal from './modal/suspend-modal.vue'

vi.mock('@/services/alert/sweetAlerts.js', async (orig) => ({ ...(await orig()), confirmSubmit: vi.fn() }))

const makeI18n = () =>
  createI18n({ legacy: false, locale: 'th', fallbackLocale: 'th', globalInjection: true, messages: { th, en } })

const modalStub = { template: '<div><slot name="title" /><slot name="content" /><slot name="action" /></div>' }

const grants = (overrides = {}) =>
  ['data:customer-names', 'data:worker-names', 'data:cost', 'data:receivables'].map((scope) => ({
    scope,
    enabled: false,
    canGrant: true,
    ...(overrides[scope] || {})
  }))

const users = [
  { userId: 1, username: 'dev', displayName: 'Dev User', roles: ['Dev'], activeConnections: 2, suspended: false, grants: grants() },
  {
    userId: 2,
    username: 'boss',
    displayName: 'Boss User',
    roles: ['Boss'],
    activeConnections: 0,
    suspended: true,
    suspendedSource: 'auto',
    suspendedReason: 'เรียกถี่เกินไป',
    grants: grants({ 'data:cost': { canGrant: false } })
  }
]

const mountWith = (component, props) => {
  const pinia = createPinia()
  setActivePinia(pinia)
  useAuthStore().user = { username: 'dev' }
  const wrapper = mount(component, {
    props,
    global: { plugins: [pinia, makeI18n(), PrimeVue], stubs: { modal: modalStub } }
  })
  return { wrapper, store: useAiAdminStore() }
}

describe('users-tab (real i18n)', () => {
  it('shows status as icon + word, the visible reason for blocked toggles and own-row suspend', () => {
    const { wrapper } = mountWith(usersTab, { users })
    const text = wrapper.text()
    expect(text).toContain('ใช้งาน')
    expect(text).toContain('ถูกระงับ')
    expect(text).toContain('อัตโนมัติ')
    expect(text).toContain('role ไม่มีสิทธิ์')
    expect(text).toContain('ระงับบัญชีตัวเองไม่ได้')
    expect(text).toContain('ปลด')
    expect(wrapper.findAll('.checkbox-label').length).toBe(8)
  })

  it('sends the grant request and asks the parent to reload', async () => {
    const { wrapper, store } = mountWith(usersTab, { users })
    store.setGrant = vi.fn().mockResolvedValue({})
    await wrapper.vm.applyGrant(users[0], 'data:receivables', true)
    await flushPromises()
    expect(store.setGrant).toHaveBeenCalledWith({ userId: 1, scope: 'data:receivables', enabled: true })
    expect(wrapper.emitted('changed')).toHaveLength(1)
  })
})

describe('users-tab enable confirmation', () => {
  it('asks for confirmation naming the user and category before enabling, but not before disabling', async () => {
    const { wrapper, store } = mountWith(usersTab, { users })
    store.setGrant = vi.fn().mockResolvedValue({})
    wrapper.vm.onToggle(users[0], { scope: 'data:customer-names' }, true)
    expect(sweetAlerts.confirmSubmit).toHaveBeenCalledTimes(1)
    const message = sweetAlerts.confirmSubmit.mock.calls[0][0]
    expect(message).toContain('Dev User')
    expect(message).toContain('ชื่อลูกค้า')
    expect(store.setGrant).not.toHaveBeenCalled()
    wrapper.vm.onToggle(users[0], { scope: 'data:customer-names' }, false)
    await flushPromises()
    expect(store.setGrant).toHaveBeenCalledWith({ userId: 1, scope: 'data:customer-names', enabled: false })
  })
})

describe('suspend-modal (real i18n)', () => {
  it('does not submit twice while the request is in flight', async () => {
    const { wrapper, store } = mountWith(suspendModal, { isShow: true, user: users[0] })
    let resolve
    store.suspend = vi.fn().mockReturnValue(new Promise((r) => (resolve = r)))
    wrapper.vm.reason = 'สงสัยรหัสหลุด'
    wrapper.vm.onSubmit()
    wrapper.vm.onSubmit()
    expect(store.suspend).toHaveBeenCalledTimes(1)
    resolve({})
    await flushPromises()
  })

  it('requires a reason before calling the API', async () => {
    const { wrapper, store } = mountWith(suspendModal, { isShow: true, user: users[0] })
    store.suspend = vi.fn().mockResolvedValue({})
    await wrapper.vm.onSubmit()
    expect(store.suspend).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain('กรุณาระบุเหตุผลที่ระงับ')
  })
})
