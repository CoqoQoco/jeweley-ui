import { describe, it, expect, vi, beforeEach } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import InvoiceConfirmPrintModal from './invoice-confirm-print-modal.vue'

const fetchPrintLogList = vi.fn()

vi.mock('@/stores/modules/api/sale/invoice-store.js', () => ({
  useInvoiceApiStore: () => ({ fetchPrintLogList })
}))

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

const setItem = vi.fn()
vi.mock('@/services/storage.js', () => ({
  storage: { getItem: vi.fn().mockReturnValue(null), setItem: (...a) => setItem(...a) }
}))

const DrawerStub = {
  name: 'DrawerGeneric',
  template: '<div><slot name="title" /><slot name="side" /><slot name="content" /><slot name="action" /></div>',
  props: ['show', 'title', 'width', 'isShowActionPart', 'headerVariant', 'sideShow', 'sideWidth'],
  emits: ['close']
}

function create(props) {
  return shallowMount(InvoiceConfirmPrintModal, {
    global: {
      plugins: [createPinia()],
      mocks: { $t: (key) => key },
      stubs: { DrawerGeneric: DrawerStub }
    },
    props: { isShowModal: true, invoiceData: { soNumber: 'SO-1' }, ...props }
  })
}

describe('InvoiceConfirmPrintModal - draftMode', () => {
  beforeEach(() => {
    fetchPrintLogList.mockReset()
    setItem.mockReset()
  })

  it('locks paper to bill, hides invoice fields/history, shows draft note', async () => {
    const wrapper = create({ draftMode: true })
    await wrapper.vm.$nextTick()
    const vm = wrapper.vm.$.proxy
    expect(vm.paperSize).toBe('bill')
    expect(vm.printData.invoiceNumber).toBe('DRAFT')
    expect(wrapper.text()).not.toContain('Invoice Number')
    expect(wrapper.text()).not.toContain('view.sale.invoiceDetail.printHistory')
    expect(wrapper.text()).toContain('view.sale.invoiceDetail.draftBillNote')
    expect(wrapper.findAllComponents({ name: 'RadioGroupGeneric' }).some((c) => c.props('options').some((o) => o.value === 'a4'))).toBe(false)
    expect(fetchPrintLogList).not.toHaveBeenCalled()
  })

  it('does not persist bill column flags and emits DRAFT print data', async () => {
    const wrapper = create({ draftMode: true })
    await wrapper.vm.$nextTick()
    const vm = wrapper.vm.$.proxy
    vm.billElementFlags.showQty = false
    vm.onBillFlagChange()
    expect(setItem).not.toHaveBeenCalledWith('bill-print-column-flags', expect.anything())

    vm.onConfirmPrint()
    const emitted = wrapper.emitted('confirm-print')
    expect(emitted).toBeTruthy()
    expect(emitted[0][0].invoiceNumber).toBe('DRAFT')
    expect(emitted[0][0].paperSize).toBe('bill')
  })

  it('always prints the DRAFT number even if showInvoiceNo is off, without persisting it', async () => {
    const wrapper = create({ draftMode: true })
    await wrapper.vm.$nextTick()
    const vm = wrapper.vm.$.proxy
    vm.billElementFlags.showInvoiceNo = false
    expect(vm.buildPrintData().showInvoiceNo).toBe(true)
    vm.onBillFlagChange()
    expect(setItem).not.toHaveBeenCalledWith('bill-print-column-flags', expect.anything())
  })

  it('keeps normal behaviour when draftMode is false', async () => {
    const wrapper = create({ draftMode: false, invoiceData: { invoiceNumber: 'INV-1' } })
    await wrapper.vm.$nextTick()
    const vm = wrapper.vm.$.proxy
    expect(vm.paperSize).toBe('vat-bridge')
    expect(vm.printData.invoiceNumber).toBe('INV-1')
    vm.onBillFlagChange()
    expect(setItem).toHaveBeenCalledWith('bill-print-column-flags', expect.any(String))
    expect(fetchPrintLogList).toHaveBeenCalled()
  })
})
