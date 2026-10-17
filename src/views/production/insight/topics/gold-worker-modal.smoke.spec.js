// gold-worker-modal.smoke.spec.js — mount modal เจาะข้อมูลช่างจริง (block config ยืมจาก goldConfig) ด้วยข้อมูลจำลอง
// ตรวจ: ไม่ยิง request ตอนปิด · ตอนเปิดยิง Gold/over-slips/uncovered ด้วยประเภท+รหัสช่างคนนี้เท่านั้น · ไม่ยิง GoldByStage/targets ·
// KPI แถวเดียว · ไม่มี DOM id ซ้ำกับหน้าหลัก · ปุ่ม "ตั้งเป็นตัวกรองทั้งหน้า" และปิด emit ถูก
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import PrimeVue from 'primevue/config'

const postMock = vi.fn()
const getMock = vi.fn()

vi.mock('@/axios/axios-helper.js', () => ({
  default: { jewelry: { post: (...args) => postMock(...args), get: (...args) => getMock(...args) } }
}))
vi.mock('@/services/permission/standard-edit-access.js', () => ({ hasStandardEditAccess: () => true }))
vi.mock('@/services/alert/sweetAlerts.js', () => ({ success: vi.fn(), warning: vi.fn() }))

import GoldWorkerModal from '../components/gold-worker-modal.vue'
import { buildDefaultGoldFilter } from '../insight-filters.js'
import { isNodeCollapsible, resolveCollapsedByDefault, isNodeVisible } from '@/components/insight/page/insight-page-helpers.js'

function respond(path) {
  if (path.endsWith('/Gold')) {
    return {
      asOf: '2026-10-01T08:00:00',
      kpi: [
        { workerType: 80, lossPercent: 3.4, allowedPercent: 2, targetPercent: 3, excessGram: 5, excessMoney: 1000, coverageJobs: 8, coverageTotalJobs: 10, coveragePercent: 80 },
        { workerType: 50, lossPercent: 1, allowedPercent: 1, targetPercent: 2, excessGram: 0, excessMoney: 0, coverageJobs: 1, coverageTotalJobs: 1, coveragePercent: 100 }
      ],
      series: [{ workerType: 80, bucketEnd: '2026-09-07T00:00:00', rawLossGram: 5, allowedGram: 4, lossPercent: 3, allowedPercent: 2 }],
      targets: [{ workerType: 80, metal: 'GOLD', targetPercent: 3, source: 'saved' }],
      workers: [{ workerType: 80, workerCode: 'W1', workerName: 'สมชาย' }]
    }
  }
  return { data: [{ planId: 1, slipId: 1, wo: 'WO', woNumber: '1', deptKey: 'setting', workerCode: 'W1', workerName: 'สมชาย', documentNo: 'S-OVER', workerType: 80 }], total: 1 }
}

const worker = { workerType: 80, workerCode: 'W1', workerName: '' }

function mountModal(props = {}) {
  return mount(GoldWorkerModal, {
    props: { isShow: true, worker, pageFilter: { ...buildDefaultGoldFilter(), metal: 'GOLD', olderThanDays: 21, workerTypes: ['50'], workerCodes: ['X'] }, ...props },
    global: {
      plugins: [PrimeVue],
      mocks: {
        $t: (key, params) => (params ? `${key}:${JSON.stringify(params)}` : key),
        $router: { resolve: () => ({ meta: { permissions: [] }, href: '/x' }) }
      },
      stubs: {
        ChartGeneric: true,
        InfoTipGeneric: true,
        DrawerGeneric: true,
        modal: { template: '<div class="modal-stub"><slot name="title" /><slot name="content" /><slot name="action" /></div>' }
      }
    }
  })
}

const postsTo = (name) => postMock.mock.calls.filter((c) => c[0].endsWith(`/${name}`))

describe('GoldWorkerModal (smoke)', { timeout: 20000 }, () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    postMock.mockReset()
    getMock.mockReset()
    postMock.mockImplementation(async (path) => respond(path))
    getMock.mockImplementation(async (path) => respond(path))
  })

  it('does nothing while closed', async () => {
    const wrapper = mountModal({ isShow: false })
    await flushPromises()
    expect(postMock).not.toHaveBeenCalled()
    expect(wrapper.find('.gold-worker-modal__blocks').exists()).toBe(false)
  })

  it('open: Gold + over-slips + uncovered limited to this worker, nothing else; name comes from the Gold response', async () => {
    const wrapper = mountModal()
    await flushPromises()
    await flushPromises()

    expect(postsTo('Gold')).toHaveLength(1)
    expect(postsTo('Gold')[0][1]).toMatchObject({ workerTypes: [80], workerCodes: ['W1'], metal: 'GOLD' })
    expect(postsTo('GoldOverSlips')).toHaveLength(1)
    expect(postsTo('GoldOverSlips')[0][1]).toMatchObject({ workerTypes: [80], workerCodes: ['W1'], metal: 'GOLD' })
    expect(postsTo('GoldUncoveredJobs')).toHaveLength(1)
    expect(postsTo('GoldUncoveredJobs')[0][1]).toMatchObject({ workerTypes: [80], workerCodes: ['W1'], olderThanDays: 21 })
    expect([...postMock.mock.calls, ...getMock.mock.calls].map((c) => c[0].split('/').pop()).sort()).toEqual(['Gold', 'GoldOverSlips', 'GoldUncoveredJobs'])

    const text = wrapper.text()
    expect(text).toContain('W1 สมชาย')
    expect(text).toContain('view.productionInsight.gold.workerType.80')
    expect(text).toContain('S-OVER')
  })

  it('every request body carries the worker; opening another worker (closed first, or switched while open) refetches all three with the new code', async () => {
    const pageFilter = { ...buildDefaultGoldFilter(), lens: 'setting', metal: 'GOLD', workerTypes: ['80'], workerCodes: [] }
    const wrapper = mountModal({ worker: { workerType: 80, workerCode: 'B004', workerName: 'ศิริมงคล' }, pageFilter })
    await flushPromises()
    await flushPromises()
    const bodiesOf = (name) => postsTo(name).map((c) => c[1])
    ;['Gold', 'GoldOverSlips', 'GoldUncoveredJobs'].forEach((name) => {
      expect(bodiesOf(name), name).toHaveLength(1)
      expect(bodiesOf(name)[0], name).toMatchObject({ workerTypes: [80], workerCodes: ['B004'] })
    })

    postMock.mockClear()
    await wrapper.setProps({ isShow: false })
    await flushPromises()
    await wrapper.setProps({ isShow: true, worker: { workerType: 50, workerCode: 'T7', workerName: '' } })
    await flushPromises()
    await flushPromises()
    ;['Gold', 'GoldOverSlips', 'GoldUncoveredJobs'].forEach((name) => {
      expect(bodiesOf(name), name).toHaveLength(1)
      expect(bodiesOf(name)[0], name).toMatchObject({ workerTypes: [50], workerCodes: ['T7'] })
    })

    postMock.mockClear()
    await wrapper.setProps({ worker: { workerType: 80, workerCode: 'B005', workerName: '' } })
    await flushPromises()
    await flushPromises()
    ;['Gold', 'GoldOverSlips', 'GoldUncoveredJobs'].forEach((name) => {
      expect(bodiesOf(name).at(-1), name).toMatchObject({ workerTypes: [80], workerCodes: ['B005'] })
    })
  })

  it('the blocks the modal renders are never collapsible, so both tables mount and fetch even in the overview lens', async () => {
    const wrapper = mountModal({ pageFilter: { ...buildDefaultGoldFilter(), lens: 'all', metal: 'GOLD' } })
    await flushPromises()
    await flushPromises()
    const body = wrapper.findComponent({ name: 'GoldWorkerModalBody' }).vm
    const nodes = body.blockNodes
    expect(nodes.map((n) => n.id)).toEqual(['worker-goldKpi', 'worker-goldTrend', 'worker-goldOverSlips', 'worker-goldUncovered'])
    nodes.forEach((n) => {
      expect(isNodeCollapsible(n), n.id).toBe(false)
      expect(resolveCollapsedByDefault(n, body.modalCtx), n.id).toBe(false)
      expect(isNodeVisible(n, body.modalCtx), n.id).toBe(true)
    })
    expect(wrapper.text()).not.toContain('view.productionInsight.blockCollapse')
    expect(postsTo('GoldOverSlips')).toHaveLength(1)
    expect(postsTo('GoldUncoveredJobs')).toHaveLength(1)
  })

  it('does not hand a reactive component to Vue and does not refetch in a loop', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const wrapper = mountModal()
    await flushPromises()
    await flushPromises()
    await wrapper.setProps({ pageFilter: { ...buildDefaultGoldFilter(), metal: 'GOLD' } })
    await flushPromises()
    expect(warn.mock.calls.filter((c) => String(c[0]).includes('reactive object'))).toHaveLength(0)
    expect(postsTo('Gold').length).toBeLessThanOrEqual(1)
    expect(postsTo('GoldOverSlips').length).toBeLessThanOrEqual(2)
    warn.mockRestore()
  })

  it('shows a single KPI row (this worker type), no clickable report links and no DOM ids that clash with the page', async () => {
    const wrapper = mountModal()
    await flushPromises()
    await flushPromises()
    expect(wrapper.findAll('.kpi-block__row-title').map((el) => el.text())).toEqual(['view.productionInsight.gold.workerType.80'])
    expect(wrapper.findAll('[id^="insight-report-"]').filter((el) => ['insight-report-goldKpi', 'insight-report-goldTrend', 'insight-report-goldOverSlips', 'insight-report-goldUncovered'].includes(el.attributes('id')))).toHaveLength(0)
    expect(wrapper.find('#insight-report-worker-goldOverSlips').exists()).toBe(true)
    expect(wrapper.find('#insight-report-worker-goldTrend [role="tablist"]').exists()).toBe(false)
  })

  it('apply-as-page-filter emits the drawer-shaped patch; close emits closeModal', async () => {
    const wrapper = mountModal()
    await flushPromises()
    const buttons = wrapper.findAll('.modal-stub button')
    const apply = buttons.find((b) => b.text().includes('view.productionInsight.gold.workerModal.applyFilter'))
    await apply.trigger('click')
    expect(wrapper.emitted('apply-filter')[0][0]).toEqual({ workerTypes: ['80'], workerCodes: ['W1'] })
    const close = buttons.find((b) => b.text().includes('common.btn.close'))
    await close.trigger('click')
    expect(wrapper.emitted('closeModal')).toHaveLength(1)
  })
})
