import { describe, it, expect, vi } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import InvoiceConfirmPrintModal from './invoice-confirm-print-modal.vue'

vi.mock('@/services/api/printer-config-service.js', () => ({
  fetchPrinterList: vi.fn().mockResolvedValue({ status: 'offline', printers: [] }),
  PRINT_BRIDGE_BASE_URL: 'http://localhost'
}))

vi.mock('@/services/helper/print/bill-layout-store.js', () => ({
  getBillLayout: vi.fn().mockResolvedValue(null)
}))

vi.mock('@/services/helper/print/vat-layout-store.js', () => ({
  getVatLayout: vi.fn().mockResolvedValue(null)
}))

vi.mock('@/axios/axios-helper.js', () => ({
  default: {
    jewelry: {
      get: vi.fn().mockRejectedValue(new Error('network blocked in spec')),
      post: vi.fn().mockRejectedValue(new Error('network blocked in spec'))
    }
  }
}))

const DrawerStub = {
  name: 'DrawerGeneric',
  template: '<div><slot name="title" /><slot name="side" /><slot name="content" /><slot name="action" /></div>',
  props: ['show', 'title', 'width', 'isShowActionPart', 'headerVariant', 'sideShow', 'sideWidth'],
  emits: ['close']
}

async function createWrapper(showProductNumber) {
  const wrapper = shallowMount(InvoiceConfirmPrintModal, {
    global: {
      plugins: [createPinia()],
      mocks: { $t: (key) => key },
      stubs: { DrawerGeneric: DrawerStub }
    },
    props: { isShowModal: false, invoiceData: {} }
  })
  wrapper.vm.$.proxy.paperSize = 'bill'
  wrapper.vm.$.proxy.billElementFlags.showProductNumber = showProductNumber
  await wrapper.vm.$nextTick()
  return wrapper
}

function findCodeModeRadio(wrapper) {
  return wrapper
    .findAllComponents({ name: 'RadioGroupGeneric' })
    .find((c) => c.props('options').some((o) => o.value === 'mold'))
}

describe('InvoiceConfirmPrintModal - product code mode radio', () => {
  it('renders radio disabled when showProductNumber is false', async () => {
    const wrapper = await createWrapper(false)
    const radio = findCodeModeRadio(wrapper)
    expect(radio).toBeTruthy()
    expect(radio.props('disabled')).toBe(true)
  })

  it('enables radio when showProductNumber is true', async () => {
    const wrapper = await createWrapper(true)
    const radio = findCodeModeRadio(wrapper)
    expect(radio).toBeTruthy()
    expect(radio.props('disabled')).toBe(false)
  })
})
