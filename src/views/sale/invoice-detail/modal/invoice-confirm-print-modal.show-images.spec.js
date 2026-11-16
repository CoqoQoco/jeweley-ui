import { describe, it, expect, vi, beforeEach } from 'vitest'
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

const KEY = 'invoice-print-show-images'

function createWrapper() {
  return shallowMount(InvoiceConfirmPrintModal, {
    global: {
      plugins: [createPinia()],
      mocks: { $t: (key) => key },
      stubs: { DrawerGeneric: DrawerStub }
    },
    props: { isShowModal: false, invoiceData: {} }
  })
}

describe('InvoiceConfirmPrintModal - showImages', () => {
  beforeEach(() => localStorage.removeItem(KEY))

  it('storage key ไม่มี -> showImages เปิด', () => {
    const vm = createWrapper().vm.$.proxy
    vm.initializePrintData()
    expect(vm.printData.showImages).toBe(true)
  })

  it("storage = 'false' -> showImages ปิด", () => {
    localStorage.setItem(KEY, 'false')
    const vm = createWrapper().vm.$.proxy
    vm.initializePrintData()
    expect(vm.printData.showImages).toBe(false)
  })

  it('buildPrintData บังคับ showImages=true เมื่อกระดาษไม่ใช่ a4', () => {
    const vm = createWrapper().vm.$.proxy
    vm.initializePrintData()
    vm.printData.showImages = false
    vm.paperSize = 'a4'
    expect(vm.buildPrintData().showImages).toBe(false)
    vm.paperSize = 'bill'
    expect(vm.buildPrintData().showImages).toBe(true)
    vm.paperSize = 'vat-bridge'
    expect(vm.buildPrintData().showImages).toBe(true)
  })

  it('สลับ showImages เปลี่ยน previewWatchSnapshot', () => {
    const vm = createWrapper().vm.$.proxy
    vm.initializePrintData()
    const before = JSON.stringify(vm.previewWatchSnapshot)
    vm.printData.showImages = !vm.printData.showImages
    expect(JSON.stringify(vm.previewWatchSnapshot)).not.toBe(before)
  })
})
