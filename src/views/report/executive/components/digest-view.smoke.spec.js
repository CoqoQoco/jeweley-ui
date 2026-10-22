// digest-view.smoke.spec.js — การ์ด 4 โดเมน + รายการเรื่องที่ต้องดูก่อน + click emit select-tab + โดเมน unknown แสดง muted
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'

import DigestView from './digest-view.vue'

const digest = {
  domains: [
    { key: 'production', status: 'critical', problemCount: 3, forecastCount: 1, available: true },
    { key: 'sales', status: 'warning', problemCount: 2, forecastCount: 0, available: true },
    { key: 'material', status: 'unknown', problemCount: 0, forecastCount: 0, available: false },
    { key: 'stock', status: 'ok', problemCount: 0, forecastCount: 4, available: true }
  ],
  top: [
    { domain: 'production', severity: 'critical', tab: 'gold', code: 'GOLD_LOSS_ABOVE_TARGET', params: { metal: 'GOLD', percent: 3 }, reportRef: 'goldKpi' },
    { domain: 'sales', severity: 'warning', tab: 'sales', code: 'SAL_NO_DUE_DATE', params: { count: 5 }, reportRef: 'salDue' }
  ]
}

function mountView(props) {
  return mount(DigestView, {
    props,
    global: { mocks: { $t: (key, params) => (params ? `${key}|${JSON.stringify(params)}` : key) } }
  })
}

describe('digest-view (smoke)', () => {
  it('renders 4 domain cards in tab order and the top list', () => {
    const wrapper = mountView({ digest })
    const cards = wrapper.findAll('.digest-domain')
    expect(cards.map((c) => c.attributes('data-domain'))).toEqual(['production', 'sales', 'stock', 'material'])
    expect(cards[0].classes()).toContain('digest-domain--critical')
    expect(cards[0].text()).toContain('view.executive.digest.status.critical')
    expect(wrapper.findAll('.insight-finding-list__item')).toHaveLength(2)
    expect(wrapper.find('.insight-finding-list__tag').text()).toBe('view.executive.digest.domain.production')
  })

  it('mutes an unavailable domain without hiding the others', () => {
    const wrapper = mountView({ digest })
    const material = wrapper.find('[data-domain="material"]')
    expect(material.classes()).toContain('digest-domain--muted')
    expect(material.text()).toContain('view.executive.digest.unavailable')
    expect(wrapper.find('[data-domain="stock"]').classes()).not.toContain('digest-domain--muted')
  })

  it('clicking a domain card emits select-tab(domain, null)', async () => {
    const wrapper = mountView({ digest })
    await wrapper.find('[data-domain="stock"]').trigger('click')
    expect(wrapper.emitted('select-tab')[0]).toEqual(['stock', null])
  })

  it('clicking [view] on a finding emits the domain + topic target', async () => {
    const wrapper = mountView({ digest })
    await wrapper.findAll('.insight-finding-list__link')[0].trigger('click')
    expect(wrapper.emitted('select-tab')[0]).toEqual(['production', { tab: 'gold', reportRef: 'goldKpi', code: 'GOLD_LOSS_ABOVE_TARGET', params: { metal: 'GOLD', percent: 3 } }])
  })

  it('shows empty state for no findings and all-unknown cards when digest is null', () => {
    const wrapper = mountView({ digest: null })
    expect(wrapper.findAll('.digest-domain--muted')).toHaveLength(4)
    expect(wrapper.find('.insight-finding-list__empty').exists()).toBe(true)
  })

  it('shows skeleton while loading', () => {
    const wrapper = mountView({ digest: null, loading: true })
    expect(wrapper.findAll('.digest-domain__skeleton')).toHaveLength(4)
  })
})
