import dayjs from 'dayjs'
import { success } from '@/services/alert/sweetAlerts.js'
import InvoiceConfirmPrintModal from '@/views/sale/invoice-detail/modal/invoice-confirm-print-modal.vue'
import ContinuousPrintPreviewPanel from '@/views/sale/invoice-detail/modal/continuous-print-preview-panel.vue'
import { DRAFT_INVOICE_NUMBER, buildSoDraftInvoiceData, computeInvoiceTotalExSpecial } from '@/services/helper/print/so-draft-bill.js'

// host ต้องมี: saleOrderData, specialDiscount, specialAddition, freightAndInsurance, vatPercent,
// selectedStockItemsForTotals, documentTotals (computeInvoiceTotals)
export default {
  components: { InvoiceConfirmPrintModal, ContinuousPrintPreviewPanel },

  data() {
    return {
      isShowDraftPrint: false,
      isShowDraftPreview: false,
      draftPreviewModel: null,
      draftLastPrintData: null
    }
  },

  computed: {
    draftBillInvoiceData() {
      return buildSoDraftInvoiceData({
        saleOrderData: this.saleOrderData,
        specialDiscount: this.specialDiscount,
        specialAddition: this.specialAddition,
        freightAndInsurance: this.freightAndInsurance,
        vatPercent: this.vatPercent
      })
    },

    draftBillTotalExSpecial() {
      if (this.draftBillInvoiceData.vatIncluded) return this.documentTotals?.grandTotalRounded ?? 0
      return computeInvoiceTotalExSpecial(this.documentTotals?.subTotal, this.vatPercent)
    },

    draftOffsetLabel() {
      const offset = this.draftLastPrintData?.billOffset
      return this.$t('view.sale.invoiceDetail.previewOffsetLabel', { x: offset?.x || 0, y: offset?.y || 0 })
    }
  },

  watch: {
    isShowModal(newVal) {
      if (!newVal) this.closeDraftPrint()
    }
  },

  methods: {
    openDraftPrint() {
      this.isShowDraftPrint = true
    },

    closeDraftPrint() {
      this.isShowDraftPrint = false
      this.closeDraftPreview()
    },

    async buildDraftModel(printData) {
      const { buildContinuousPrintModel } = await import('@/services/helper/print/continuous-print-payload.js')
      const { model } = await buildContinuousPrintModel('bill', {
        invoiceData: this.draftBillInvoiceData,
        invoiceItems: this.selectedStockItemsForTotals,
        printData,
        invoiceNo: DRAFT_INVOICE_NUMBER,
        invoiceDate: dayjs(printData.invoiceDate)
      })
      return model
    },

    async handleDraftConfirmPrint(printData) {
      const model = await this.buildDraftModel(printData)
      const { printGeneric } = await import('@/services/api/print-bridge-service.js')
      await printGeneric(model)
      success(this.$t('view.sale.invoiceDetail.success.printBill'), 'Bridge GDI')
    },

    async handleDraftPreview(printData) {
      this.draftPreviewModel = await this.buildDraftModel(printData)
      this.draftLastPrintData = printData
      this.isShowDraftPreview = true
    },

    async handleDraftPrintNow() {
      await this.handleDraftConfirmPrint(this.draftLastPrintData)
      this.closeDraftPreview()
    },

    closeDraftPreview() {
      this.isShowDraftPreview = false
      this.draftPreviewModel = null
    }
  }
}
