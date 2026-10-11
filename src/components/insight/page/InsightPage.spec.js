// InsightPage.spec.js — loader: แต่ละ source ยิง 1 ครั้งต่อการเปลี่ยน params "ของตัวเอง" (เปลี่ยนหลาย field พร้อมกัน = 1 ครั้ง),
// field ที่ไม่มี source ไหนอ่านไม่ยิง, แท็บไม่ active = ติดธง stale แล้วยิงรอบเดียวตอนกลับมา active, metal ถูกเติมโดย store
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

const postMock = vi.fn()
const getMock = vi.fn()

vi.mock('@/axios/axios-helper.js', () => ({
  default: { jewelry: { post: (...args) => postMock(...args), get: (...args) => getMock(...args) } }
}))

import { useMetalScopeStore } from '@/stores/modules/ui/metal-scope-store.js'
import InsightPage from './InsightPage.vue'

const config = {
  titleKey: 'view.productionInsight.nav.wip',
  findings: { source: 'Main' },
  sources: {
    Main: { endpoint: 'ProductionInsight/Wip', params: (f) => ({ staleDays: f.staleDays }) },
    Trend: { endpoint: 'ProductionInsight/WipTrend', params: (f) => ({ start: f.start, end: f.end, bucket: f.bucket }) },
    Lead: { endpoint: 'ProductionInsight/StageLeadTime', params: (f, s) => ({ start: f.start, draft: s.draft && s.draft.length ? s.draft : undefined }) },
    Standards: { endpoint: 'ProductionInsight/StageStandards', method: 'get', params: () => null }
  },
  state: { draft: { initial: () => [] }, picked: { initial: null, resetOn: { source: 'Trend', value: (data) => data?.first ?? null } } },
  blocks: []
}

const baseFilter = () => ({ staleDays: 180, start: new Date('2026-07-01'), end: new Date('2026-10-01'), bucket: 'week', departmentKeys: [] })

function mountPage(props = {}) {
  return mount(InsightPage, {
    props: { config, filter: baseFilter(), active: true, ...props },
    global: {
      mocks: { $t: (key) => key },
      stubs: { InsightTabLayout: { template: '<div><slot name="report" /></div>' }, InsightBlockNode: true }
    }
  })
}

const clearMocks = () => {
  postMock.mockClear()
  getMock.mockClear()
}

const endpoints = () => postMock.mock.calls.map((c) => c[0]).concat(getMock.mock.calls.map((c) => c[0]))

describe('InsightPage loader', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    postMock.mockReset()
    getMock.mockReset()
    postMock.mockResolvedValue({ status: 'ok', problems: [], forecasts: [], actions: [], first: 'trim' })
    getMock.mockResolvedValue([])
  })

  it('fetches every source exactly once on mount (POST for post sources, GET for get sources)', async () => {
    mountPage()
    await flushPromises()
    expect(postMock).toHaveBeenCalledTimes(3)
    expect(getMock).toHaveBeenCalledTimes(1)
    expect(getMock.mock.calls[0][0]).toBe('ProductionInsight/StageStandards')
  })

  it('adds the page-wide metal through the store (config does not add it)', async () => {
    useMetalScopeStore().setMetal('SILVER')
    mountPage()
    await flushPromises()
    postMock.mock.calls.forEach((call) => expect(call[1].metal).toBe('SILVER'))
    expect(config.sources.Main.params(baseFilter(), {})).not.toHaveProperty('metal')
  })

  it('one range-preset click (start+end+bucket together) = one request for each source that reads them, none for the others', async () => {
    const wrapper = mountPage()
    await flushPromises()
    clearMocks()

    await wrapper.setProps({ filter: { ...baseFilter(), start: new Date('2026-01-01'), end: new Date('2026-02-01'), bucket: 'month' } })
    await flushPromises()

    expect(endpoints().sort()).toEqual(['ProductionInsight/StageLeadTime', 'ProductionInsight/WipTrend'])
  })

  it('does not refetch when only a field no source reads changes (e.g. departmentKeys)', async () => {
    const wrapper = mountPage()
    await flushPromises()
    clearMocks()

    await wrapper.setProps({ filter: { ...baseFilter(), departmentKeys: ['trim'] } })
    await flushPromises()
    expect(postMock).not.toHaveBeenCalled()
  })

  it('a changed own param refetches only that source', async () => {
    const wrapper = mountPage()
    await flushPromises()
    clearMocks()

    await wrapper.setProps({ filter: { ...baseFilter(), staleDays: 90 } })
    await flushPromises()
    expect(endpoints()).toEqual(['ProductionInsight/Wip'])
  })

  it('state used by a source params (draft) refetches only that source, once', async () => {
    const wrapper = mountPage()
    await flushPromises()
    clearMocks()

    wrapper.vm.setState('draft', [{ deptKey: 'trim', standardDays: 4 }])
    await flushPromises()
    expect(endpoints()).toEqual(['ProductionInsight/StageLeadTime'])
  })

  it('inactive page marks sources stale and fetches each once when it becomes active again', async () => {
    const wrapper = mountPage()
    await flushPromises()
    clearMocks()

    await wrapper.setProps({ active: false })
    await wrapper.setProps({ filter: { ...baseFilter(), staleDays: 90, bucket: 'month' } })
    await flushPromises()
    expect(postMock).not.toHaveBeenCalled()

    await wrapper.setProps({ active: true })
    await flushPromises()
    expect(endpoints().sort()).toEqual(['ProductionInsight/Wip', 'ProductionInsight/WipTrend'])
  })

  it('reload() refetches a source even when its params did not change', async () => {
    const wrapper = mountPage()
    await flushPromises()
    clearMocks()

    wrapper.vm.reload(['Standards'])
    await flushPromises()
    expect(getMock).toHaveBeenCalledTimes(1)
  })

  it('applies state resets after a source loads (default selection)', async () => {
    const wrapper = mountPage()
    await flushPromises()
    expect(wrapper.vm.state.picked).toBe('trim')
  })

  it('ignores a stale response when a newer request for the same source was issued', async () => {
    let resolveFirst
    postMock.mockImplementationOnce(() => new Promise((resolve) => (resolveFirst = resolve)))
    postMock.mockResolvedValue({ status: 'ok', problems: [], forecasts: [], actions: [], first: 'second' })
    const wrapper = mountPage()
    await flushPromises()
    await wrapper.setProps({ filter: { ...baseFilter(), staleDays: 90 } })
    await flushPromises()
    resolveFirst({ status: 'old', first: 'old' })
    await flushPromises()
    expect(wrapper.vm.responses.Main.status).toBe('ok')
  })
})
