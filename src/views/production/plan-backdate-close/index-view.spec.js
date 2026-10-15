import { describe, it, expect, vi, beforeEach } from 'vitest'
import { shallowMount, flushPromises } from '@vue/test-utils'
import { createPinia } from 'pinia'
import PlanBackdateClose from './index-view.vue'

vi.mock('@/composables/useConfirmSubmit.js', () => ({
  confirmThenSubmit: vi.fn((msg, title, cb) => cb())
}))

const mockPreview = vi.fn()
const mockClose = vi.fn()

vi.mock('@/stores/modules/api/production/plan-backdate-close-api.js', () => ({
  usePlanBackdateCloseApiStore: vi.fn(() => ({
    preview: mockPreview,
    close: mockClose
  }))
}))

import { confirmThenSubmit } from '@/composables/useConfirmSubmit.js'

const previewItems = [
  { input: '6803016-4', found: true, id: 11, wo: '6803016', woNumber: 4, canClose: true, reasonCode: null },
  { input: '6803017-1', found: true, id: 12, wo: '6803017', woNumber: 1, canClose: false, reasonCode: 'MELTED' },
  { input: '9999999-1', found: false, id: null, canClose: false, reasonCode: 'NOT_FOUND' }
]

function createWrapper() {
  const wrapper = shallowMount(PlanBackdateClose, {
    global: {
      plugins: [createPinia()],
      mocks: { $t: (key, params) => (params ? `${key}:${JSON.stringify(params)}` : key) },
      stubs: {
        SectionCardGeneric: true,
        FormFieldGeneric: true,
        TextareaGeneric: true,
        ButtonGeneric: true,
        ToggleGroupGeneric: true,
        BaseDataTable: true
      }
    }
  })
  return wrapper.vm.$.proxy
}

describe('PlanBackdateClose', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockPreview.mockResolvedValue(previewItems)
    mockClose.mockResolvedValue({
      closed: [{ id: 11, wo: '6803016', woNumber: 4 }],
      errors: [],
      transferNumber: 'TR-001'
    })
  })

  it('parses pasted text and sends the parsed jobs to preview', async () => {
    const vm = createWrapper()
    vm.inputText = '6803016-4.pdf\n6803016-4\n6803017-1'
    expect(vm.parsed.jobs).toEqual(['6803016-4', '6803017-1'])

    await vm.onPreview()
    expect(mockPreview).toHaveBeenCalledWith(['6803016-4', '6803017-1'])
    expect(vm.summary.closable).toBe(1)
    expect(vm.summary.skipped).toBe(2)
  })

  it('cannot submit until there are closable rows and a remark', async () => {
    const vm = createWrapper()
    expect(vm.canSubmit).toBe(false)
    vm.inputText = '6803016-4'
    await vm.onPreview()
    expect(vm.canSubmit).toBe(false)
    vm.remark = '   '
    expect(vm.canSubmit).toBe(false)
    vm.remark = 'sold already'
    expect(vm.canSubmit).toBe(true)
  })

  it('closes only closable ids after confirm, then re-runs preview', async () => {
    const vm = createWrapper()
    vm.inputText = '6803016-4\n6803017-1'
    await vm.onPreview()
    vm.remark = ' sold already '

    vm.onClose()
    await flushPromises()

    expect(confirmThenSubmit).toHaveBeenCalledTimes(1)
    expect(mockClose).toHaveBeenCalledWith({ planIds: [11], remark: 'sold already' })
    expect(mockPreview).toHaveBeenCalledTimes(2)
    expect(vm.closeResult.transferNumber).toBe('TR-001')
    expect(vm.closeResult.closed).toHaveLength(1)
  })

  it('filters visible rows by mode and mutes skipped rows', async () => {
    const vm = createWrapper()
    vm.inputText = '6803016-4'
    await vm.onPreview()
    vm.filterMode = 'skipped'
    expect(vm.visibleItems).toHaveLength(2)
    expect(vm.rowClass(previewItems[0])).toBe('')
    expect(vm.rowClass(previewItems[1])).toBe('row-muted')
  })

  it('falls back to UNKNOWN label for unrecognised reason codes', () => {
    const vm = createWrapper()
    expect(vm.reasonLabel('MELTED')).toBe('view.production.backdateClose.reason.MELTED')
    expect(vm.reasonLabel('SOMETHING_NEW')).toBe('view.production.backdateClose.reason.UNKNOWN')
  })
})
