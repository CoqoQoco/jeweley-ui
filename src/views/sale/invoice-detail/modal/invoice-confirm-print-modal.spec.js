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

describe('InvoiceConfirmPrintModal - bill footer VAT default', () => {
  async function mountWith(vatPercent, mode) {
    const wrapper = await createWrapper(true)
    const vm = wrapper.vm.$.proxy
    await wrapper.setProps({ invoiceData: { vatPercent } })
    vm.paperSize = 'vat-bridge'
    vm.billElementFlags.showVat = true
    vm.billElementFlags.unitPriceMode = mode
    await wrapper.vm.$nextTick()
    vm.paperSize = 'bill'
    await wrapper.vm.$nextTick()
    return vm
  }

  it('turns showVat off for tag mode when invoice VAT is 0', async () => {
    const vm = await mountWith(0, 'tag')
    expect(vm.billElementFlags.showVat).toBe(false)
  })

  it('keeps showVat on for subVat mode or non-zero invoice VAT', async () => {
    expect((await mountWith(0, 'subVat')).billElementFlags.showVat).toBe(true)
    expect((await mountWith(7, 'tag')).billElementFlags.showVat).toBe(true)
  })
})

describe('InvoiceConfirmPrintModal - bill VAT default persistence + mismatch', () => {
  beforeEach(() => localStorage.clear())

  async function open(invoiceData, props = {}) {
    const wrapper = await createWrapper(true)
    const vm = wrapper.vm.$.proxy
    vm.billVatOverridden = false
    vm.billVatTouched = false
    await wrapper.setProps({ invoiceData, ...props })
    vm.billElementFlags.showVat = true
    vm.billElementFlags.unitPriceMode = 'tag'
    return { wrapper, vm }
  }

  function saved() {
    return JSON.parse(localStorage.getItem('bill-print-column-flags-dk') || localStorage.getItem('bill-print-column-flags') || '{}')
  }

  it('applies the default when opening with paperSize already bill', async () => {
    const { wrapper, vm } = await open({ vatPercent: 0 })
    await wrapper.setProps({ isShowModal: true })
    expect(vm.billElementFlags.showVat).toBe(false)
  })

  it('never persists the overridden showVat=false', async () => {
    const { vm } = await open({ vatPercent: 0 })
    vm.applyBillVatDefault()
    expect(vm.billElementFlags.showVat).toBe(false)
    vm.onBillFlagChange()
    expect(vm.billElementFlags.showVat).toBe(false)
    expect(JSON.stringify(vm.billElementFlags)).toContain('"showVat":false')
    const persisted = saved()
    expect(persisted.showVat).toBe(true)
  })

  it('restores showVat when mode leaves tag, and persists the user toggle', async () => {
    const { vm } = await open({ vatPercent: 0 })
    vm.applyBillVatDefault()
    vm.onUseSubVat()
    expect(vm.billElementFlags.showVat).toBe(true)
    vm.onShowVatToggle(false)
    expect(saved().showVat).toBe(false)
    vm.onBillFlagChange()
    expect(vm.billElementFlags.showVat).toBe(false)
  })

  it('flags mismatch only when totals differ by more than 1', async () => {
    const invoiceItems = [{ qty: 1, appraisalPrice: 9300, discountPercent: 0 }]
    const { vm, wrapper } = await open({ vatPercent: 7 }, { invoiceItems, invoiceTotalExSpecial: 9951 })
    expect(vm.billTotalMismatch).toBe(false)
    await wrapper.setProps({ invoiceTotalExSpecial: 9300 })
    expect(vm.billTotalMismatch).toBe(true)
  })

  it('onUseSubVat / onHideFooterVat / onShowFooterVat update flags', async () => {
    const { vm } = await open({ vatPercent: 7 })
    vm.onUseSubVat()
    expect(vm.billElementFlags.unitPriceMode).toBe('subVat')
    vm.onHideFooterVat()
    expect(vm.billElementFlags.showVat).toBe(false)
    vm.onShowFooterVat()
    expect(vm.billElementFlags.showVat).toBe(true)
  })

  it('shows the show-VAT button only when showVat is off and invoice VAT > 0', async () => {
    const invoiceItems = [{ qty: 1, appraisalPrice: 9300, discountPercent: 0 }]
    const { vm, wrapper } = await open({ vatPercent: 7 }, { invoiceItems, invoiceTotalExSpecial: 9300 })
    vm.billElementFlags.showVat = false
    vm.billElementFlags.unitPriceMode = 'subVat'
    vm.billElementFlags.showVat = false
    await wrapper.vm.$nextTick()
    await wrapper.setProps({ invoiceTotalExSpecial: 9951 })
    const labels = wrapper.findAllComponents({ name: 'ButtonGeneric' }).map((b) => b.props('label'))
    expect(labels).toContain('view.sale.invoiceDetail.billShowFooterVat')
    expect(labels).not.toContain('view.sale.invoiceDetail.billHideFooterVat')
  })

  it('button conditions follow VAT, mode and showVat', async () => {
    const { vm } = await open({ vatPercent: 7 })
    vm.billElementFlags.showVat = true
    vm.billElementFlags.unitPriceMode = 'subVat'
    expect(vm.showUseSubVatBtn).toBe(false)
    expect(vm.showUseTagBtn).toBe(true)
    expect(vm.showHideVatBtn).toBe(true)
    vm.billElementFlags.unitPriceMode = 'tag'
    expect(vm.showUseSubVatBtn).toBe(true)
    expect(vm.showUseTagBtn).toBe(false)
    vm.onUseSubVat()
    vm.onUseTag()
    expect(vm.billElementFlags.unitPriceMode).toBe('tag')
  })

  it('offers tag price for VAT 0 + showVat off + addVat/subVat, and hides empty actions row', async () => {
    const { vm } = await open({ vatPercent: 0 })
    vm.billVatTouched = true
    vm.billElementFlags.showVat = false
    vm.billElementFlags.unitPriceMode = 'addVat'
    expect(vm.showUseTagBtn).toBe(true)
    expect(vm.hasMismatchActions).toBe(true)
    vm.billElementFlags.unitPriceMode = 'tag'
    expect(vm.hasMismatchActions).toBe(false)
  })
})

describe('InvoiceConfirmPrintModal - tax invoice VAT %', () => {
  beforeEach(() => localStorage.clear())

  async function openTax(invoiceData, paperSize = 'vat-bridge') {
    const wrapper = await createWrapper(true)
    const vm = wrapper.vm.$.proxy
    await wrapper.setProps({ invoiceData: { ...invoiceData } })
    vm.paperSize = paperSize
    await wrapper.setProps({ isShowModal: true })
    await wrapper.vm.$nextTick()
    return vm
  }

  it('defaults to 7 for THB invoice with vat 0 and puts it in print data', async () => {
    const vm = await openTax({ vatPercent: 0, currencyUnit: 'THB' })
    expect(vm.taxVatPercent).toBe(7)
    expect(vm.buildPrintData().taxVatPercent).toBe(7)
  })

  it('defaults to 0 for foreign currency, keeps saved vat otherwise', async () => {
    expect((await openTax({ vatPercent: 0, currencyUnit: 'US$' })).taxVatPercent).toBe(0)
    expect((await openTax({ vatPercent: 10, currencyUnit: 'US$' }, 'vat-bridge-v2')).taxVatPercent).toBe(10)
  })

  it('locks MATERIAL to the invoice vat', async () => {
    const vm = await openTax({ invoiceType: 'MATERIAL', vatPercent: 7, currencyUnit: 'THB' })
    vm.taxVatPercent = 3
    expect(vm.isTaxVatLocked).toBe(true)
    expect(vm.buildPrintData().taxVatPercent).toBe(7)
  })

  it('keeps tax % separate from the bill summaryVatPercent and does not persist it', async () => {
    const vm = await openTax({ vatPercent: 0, currencyUnit: 'THB' })
    vm.taxVatPercent = 5
    const data = vm.buildPrintData()
    expect(data.taxVatPercent).toBe(5)
    expect(data.summaryVatPercent).toBe(7)
    vm.onBillFlagChange()
    expect(localStorage.getItem('bill-print-column-flags-dk') || localStorage.getItem('bill-print-column-flags') || '').not.toContain('taxVatPercent')
  })

  it('v2 saves its offset under a separate key', async () => {
    const vm = await openTax({ vatPercent: 0, currencyUnit: 'THB' }, 'vat-bridge-v2')
    vm.continuousOffset = { x: 1, y: 2 }
    vm.buildPrintData()
    expect(JSON.parse(localStorage.getItem('invoice-continuous-offset-v2-dk') || localStorage.getItem('invoice-continuous-offset-v2'))).toEqual({ x: 1, y: 2 })
    expect(localStorage.getItem('invoice-continuous-offset-dk') || localStorage.getItem('invoice-continuous-offset')).toBeNull()
  })

  it('blocks preview/print and shows error when VAT % is empty or out of range', async () => {
    const vm = await openTax({ vatPercent: 0, currencyUnit: 'THB' })
    const spy = vi.spyOn(vm.$, 'emit')
    for (const bad of ['', -1, 101]) {
      vm.taxVatPercent = bad
      expect(vm.taxVatError).not.toBe('')
      expect(vm.validatePrintData()).toBe(false)
      vm.onPreviewPDF()
    }
    expect(spy).not.toHaveBeenCalledWith('preview-print', expect.anything())
  })

  it('accepts VAT % 7 and 0 without error', async () => {
    const vm = await openTax({ vatPercent: 0, currencyUnit: 'THB' })
    vm.printData.invoiceNumber = 'INV-1'
    vm.printData.invoiceDate = new Date()
    vm.taxVatPercent = 7
    expect(vm.taxVatError).toBe('')
    expect(vm.validatePrintData()).toBe(true)
    vm.taxVatPercent = 0
    expect(vm.taxVatError).toBe('')
  })

  it('does not flag MATERIAL-locked VAT %', async () => {
    const vm = await openTax({ invoiceType: 'MATERIAL', vatPercent: 7, currencyUnit: 'THB' })
    vm.taxVatPercent = ''
    expect(vm.taxVatError).toBe('')
  })
})
