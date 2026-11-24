import { describe, it, expect, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import PrimeVue from 'primevue/config'

import th from '@/language/th.js'
import en from '@/language/en.js'
import { useAiConnectorStore } from '@/stores/modules/api/ai-connector/ai-connector-store.js'

import connectionsTab from './components/connections-tab.vue'
import createPatModal from './modal/create-pat-modal.vue'

// mount ด้วย i18n จริงของแอป (legacy:false เหมือน src/plugins/i18n/config.js) — จับบั๊กแบบ $te ไม่ถูก inject
const makeI18n = () =>
  createI18n({ legacy: false, locale: 'th', fallbackLocale: 'th', globalInjection: true, messages: { th, en } })

const modalStub = { template: '<div><slot name="title" /><slot name="content" /><slot name="action" /></div>' }

const mountWith = (component, props) => {
  const pinia = createPinia()
  setActivePinia(pinia)
  const wrapper = mount(component, {
    props,
    global: { plugins: [pinia, makeI18n(), PrimeVue], stubs: { modal: modalStub } }
  })
  return { wrapper, store: useAiConnectorStore() }
}

describe('connections-tab (real i18n)', () => {
  const items = [
    {
      id: 1,
      kind: 'OAUTH',
      name: 'Claude',
      scopes: ['module:executive', 'data:cost', 'data:receivables', 'data:worker-names', 'data:customer-names'],
      lastUsedAt: null,
      expiresAt: null
    }
  ]

  it('renders translated scope chips, +n overflow and the never-used text without throwing', async () => {
    const { wrapper } = mountWith(connectionsTab, { items })
    await flushPromises()
    const chips = wrapper.findAll('.chip').map((chip) => chip.text())
    expect(chips).toContain('รายงานภาพรวมบริหาร')
    expect(chips).toContain('ต้นทุนและกำไร')
    expect(chips).toContain('+2')
    expect(wrapper.text()).toContain('ยังไม่เคยใช้')
    expect(wrapper.text()).toContain('Claude')
  })

  it('falls back to the raw code for an unknown scope', async () => {
    const { wrapper } = mountWith(connectionsTab, { items: [{ ...items[0], scopes: ['module:unknown'] }] })
    await flushPromises()
    expect(wrapper.findAll('.chip')[0].text()).toBe('module:unknown')
  })
})

describe('create-pat-modal (real i18n)', () => {
  it('shows the one-time token, scope summary and expiry after creating', async () => {
    const { wrapper, store } = mountWith(createPatModal, {
      isShow: true,
      patScopes: [{ code: 'module:executive', nameTh: 'รายงานภาพรวมบริหาร', descriptionTh: 'สรุปภาพรวม' }]
    })
    store.createPat = vi.fn().mockResolvedValue({
      id: 9,
      name: 'โน้ตบุ๊ก',
      token: 'dkm_secret_token',
      expiresAt: '2027-01-01T00:00:00Z',
      scopes: ['module:executive']
    })
    await wrapper.find('#pat-name').setValue('โน้ตบุ๊ก')
    const submit = wrapper.findAll('button').find((b) => b.text().includes('สร้างรหัส'))
    await submit.trigger('click')
    await flushPromises()

    expect(store.createPat).toHaveBeenCalledWith({ name: 'โน้ตบุ๊ก', expiresInDays: 30, scopes: ['module:executive'] })
    expect(wrapper.text()).toContain('dkm_secret_token')
    expect(wrapper.text()).toContain('รหัสนี้แสดงครั้งเดียว')
    expect(wrapper.text()).toContain('ข้อมูลที่ AI นี้เห็น')
    expect(wrapper.find('.summary .chip').text()).toBe('รายงานภาพรวมบริหาร')
    expect(wrapper.emitted('created')).toHaveLength(1)
  })

  it('does not call the API and shows an error when the name is empty', async () => {
    const { wrapper, store } = mountWith(createPatModal, { isShow: true, patScopes: [] })
    store.createPat = vi.fn()
    const submit = wrapper.findAll('button').find((b) => b.text().includes('สร้างรหัส'))
    await submit.trigger('click')
    expect(store.createPat).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain('กรุณาตั้งชื่อเรียก')
  })

  it('pressing Enter in the name field submits', async () => {
    const { wrapper, store } = mountWith(createPatModal, { isShow: true, patScopes: [] })
    store.createPat = vi.fn().mockResolvedValue({ id: 1, token: 'dkm_x', expiresAt: '2027-01-01T00:00:00Z', scopes: [] })
    await wrapper.find('#pat-name').setValue('เครื่องผม')
    await wrapper.find('#pat-name').trigger('keyup', { key: 'Enter' })
    await flushPromises()
    expect(store.createPat).toHaveBeenCalledTimes(1)
  })
})
