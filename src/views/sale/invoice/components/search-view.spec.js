import { describe, it, expect, vi } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import SearchView from './search-view.vue'

vi.mock('@/axios/axios-helper.js', () => ({
  default: { jewelry: { get: vi.fn().mockResolvedValue({ data: [] }), post: vi.fn().mockResolvedValue({ data: [] }) } }
}))

function create(modelForm = {}) {
  return shallowMount(SearchView, {
    global: { plugins: [createPinia()], mocks: { $t: (k) => k } },
    props: { modelForm }
  })
}

describe('invoice search-view', () => {
  it('emits soNumber in search payload', () => {
    const wrapper = create({ invoiceNumber: 'A', soNumber: 'SO260910006' })
    wrapper.vm.onSearch()
    expect(wrapper.emitted('search')[0][0]).toMatchObject({ invoiceNumber: 'A', soNumber: 'SO260910006' })
  })

  it('counts only active panel filters, not the inline fields', () => {
    const wrapper = create({ invoiceNumber: 'A', soNumber: 'S', customerName: 'C', stockNumber: 'DK1', overdueOnly: true, saleChannelCode: null })
    expect(wrapper.vm.$.proxy.activeChips.map((c) => c.key)).toEqual(['stockNumber', 'overdueOnly'])
  })

  it('apply copies draft into form and searches; payload keeps inline values', () => {
    const wrapper = create({ invoiceNumber: 'A', paymentStatus: null })
    const vm = wrapper.vm.$.proxy
    vm.openFilterPanel()
    vm.draft.paymentStatus = 'paid'
    vm.draft.createDateStart = '2026-11-01'
    vm.onFilterApply()
    const payload = wrapper.emitted('search')[0][0]
    expect(payload).toMatchObject({ invoiceNumber: 'A', paymentStatus: 'paid', createDateStart: '2026-11-01' })
    expect(vm.isFilterPanelOpen).toBe(false)
    expect(vm.activeChips.map((c) => c.key)).toEqual(['paymentStatus', 'createDate'])
  })

  it('closing the panel discards the draft', () => {
    const wrapper = create({ stockNumber: 'OLD' })
    const vm = wrapper.vm.$.proxy
    vm.openFilterPanel()
    vm.draft.stockNumber = 'NEW'
    vm.closeFilterPanel()
    expect(wrapper.emitted('search')).toBeFalsy()
    expect(vm.form.stockNumber).toBe('OLD')
  })

  it('removing a chip clears that filter and re-searches', () => {
    const wrapper = create({ invoiceNumber: 'A', stockNumber: 'DK1', createDateStart: '2026-11-01', createDateEnd: '2026-11-05' })
    const vm = wrapper.vm.$.proxy
    vm.onRemoveChip('stockNumber')
    expect(wrapper.emitted('search')[0][0]).toMatchObject({ invoiceNumber: 'A', stockNumber: null })
    vm.onRemoveChip('createDate')
    const last = wrapper.emitted('search')[1][0]
    expect(last.createDateStart).toBeNull()
    expect(last.createDateEnd).toBeNull()
  })

  it('panel clear resets panel fields only, then searches', () => {
    const wrapper = create({ invoiceNumber: 'A', stockNumber: 'DK1', overdueOnly: true })
    const vm = wrapper.vm.$.proxy
    vm.onFilterClear()
    expect(wrapper.emitted('search')[0][0]).toMatchObject({ invoiceNumber: 'A', stockNumber: null, overdueOnly: false })
    expect(vm.activeChips).toEqual([])
  })

  it('autocomplete select coerces mold to string in the draft', () => {
    const wrapper = create({})
    const vm = wrapper.vm.$.proxy
    vm.openFilterPanel()
    vm.onMoldInput({ moldDesign: 123 })
    vm.onMoldSelect({ value: { moldDesign: 123 } })
    expect(vm.draft.moldNumber).toBe('123')
  })
})
