import { describe, it, expect, vi, beforeEach } from 'vitest'

const generateInvoicePDF = vi.fn().mockResolvedValue()
const generateGuaranteeCardPDF = vi.fn().mockResolvedValue()

vi.mock('@/services/helper/pdf/invoice/invoice-pdf-integration.js', () => ({
  invoicePdfService: { generateInvoicePDF: (...a) => generateInvoicePDF(...a) }
}))
vi.mock('@/services/helper/pdf/guarantee-card/guarantee-card-pdf-integration.js', () => ({
  guaranteeCardPdfService: { generateGuaranteeCardPDF: (...a) => generateGuaranteeCardPDF(...a) }
}))
vi.mock('@/services/alert/sweetAlerts.js', () => ({
  error: vi.fn(), success: vi.fn(), warning: vi.fn(), confirm: vi.fn()
}))

import InvoiceDetailView from './index-view.vue'

function makeCtx() {
  const createPrintLog = vi.fn().mockResolvedValue({})
  return {
    createPrintLog,
    ctx: {
      $t: (k) => k,
      invoiceStore: { createPrintLog },
      invoiceData: { invoiceNumber: 'SYS-1', soNumber: 'SO1' },
      invoiceItems: [],
      isMaterial: false,
      guaranteeHistoryVersion: 0,
      sellerName: '',
      showClientRejection: vi.fn()
    }
  }
}

describe('invoice-detail print log sends invoiceRunning = system number', () => {
  beforeEach(() => {
    generateInvoicePDF.mockClear()
    generateGuaranteeCardPDF.mockClear()
  })

  it('a4 print with edited number', async () => {
    const { ctx, createPrintLog } = makeCtx()
    await InvoiceDetailView.methods.handleConfirmPrint.call(ctx, {
      invoiceNumber: 'EDITED-9',
      invoiceDate: new Date(),
      paperSize: 'a4',
      invoiceTemplate: 'standard'
    })
    expect(createPrintLog).toHaveBeenCalledTimes(1)
    expect(createPrintLog.mock.calls[0][0]).toMatchObject({ invoiceNumber: 'EDITED-9', invoiceRunning: 'SYS-1' })
  })

  it('guarantee card print', async () => {
    const { ctx, createPrintLog } = makeCtx()
    await InvoiceDetailView.methods.handleConfirmGuaranteePrint.call(ctx, { cards: [{ stockNumber: 'S1' }], signerTitle: 't' })
    expect(createPrintLog.mock.calls[0][0]).toMatchObject({ invoiceNumber: 'SYS-1', invoiceRunning: 'SYS-1', paperType: 'guarantee-card' })
  })
})
