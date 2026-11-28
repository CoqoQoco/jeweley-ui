import { readFileSync } from 'node:fs'
import { describe, it, expect, vi } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import DataTableView from './data-table-view.vue'

vi.mock('@/axios/axios-helper.js', () => ({
  default: { jewelry: { get: vi.fn(), post: vi.fn() } }
}))

function create(modelForm = {}) {
  return shallowMount(DataTableView, {
    global: { plugins: [createPinia()], mocks: { $t: (k) => k, $router: {} } },
    props: { modelForm }
  })
}

describe('invoice data-table printed number column', () => {
  it('has printed column right after invoice number and before SO', () => {
    const fields = create().vm.$.proxy.columns.map((c) => c.field)
    expect(fields.slice(1, 4)).toEqual(['invoiceNumber', 'printedInvoiceNumbers', 'soNumber'])
  })

  it('dedupes and drops the system number, shows latest', () => {
    const vm = create().vm.$.proxy
    const row = { invoiceNumber: 'SYS', printedInvoiceNumbers: ['E2', 'SYS', 'E2', 'E1'] }
    expect(vm.getPrintedNumbers(row)).toEqual(['E2', 'E1'])
    expect(vm.getShownPrinted(row)).toBe('E2')
    expect(vm.isPrintedMatch(row)).toBe(false)
  })

  it('shows the matching number highlighted when it matches the submitted search', () => {
    const vm = create({ invoiceNumber: 'e1' }).vm.$.proxy
    const row = { invoiceNumber: 'SYS', printedInvoiceNumbers: ['E2', 'E1'] }
    expect(vm.getShownPrinted(row)).toBe('E1')
    expect(vm.isPrintedMatch(row)).toBe(true)
  })

  it('returns empty for rows without printed numbers (dash)', () => {
    const vm = create().vm.$.proxy
    expect(vm.getPrintedNumbers({ invoiceNumber: 'SYS' })).toEqual([])
    expect(vm.getPrintedNumbers({ invoiceNumber: 'SYS', printedInvoiceNumbers: ['SYS'] })).toEqual([])
  })
})

describe('invoice data-table slot names', () => {
  it('every #xxxTemplate slot matches `${column.field}Template` (DataTableWithPaging lookup)', () => {
    const source = readFileSync('src/views/sale/invoice/components/data-table-view.vue', 'utf8')
    const slots = [...source.matchAll(/<template #(\w+Template)=?/g)].map((m) => m[1])
    const fieldSlots = create().vm.$.proxy.columns.map((c) => `${c.field}Template`)
    expect(slots.length).toBeGreaterThan(0)
    slots.forEach((slot) => expect(fieldSlots).toContain(slot))
    expect(slots).toContain('printedInvoiceNumbersTemplate')
  })
})
