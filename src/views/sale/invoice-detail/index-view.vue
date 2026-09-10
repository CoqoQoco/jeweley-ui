<template>
  <div class="app-container">
    <!-- Header Section -->
    <PageHeaderGeneric :title="$t('view.sale.invoiceDetail.title')" @back="goBack">
      <template #actions>
        <span v-if="currentViewingVersion" class="badge badge-warning">
          <i class="bi bi-eye mr-1"></i>
          {{ $t('view.sale.invoiceDetail.viewingVersion') }}: {{ currentViewingVersion }}
        </span>
        <ButtonGeneric
          v-if="currentViewingVersion"
          variant="outline"
          icon="bi-arrow-left"
          :label="$t('view.sale.invoiceDetail.restoreOriginal')"
          @click="restoreOriginalView"
        />
        <ButtonGeneric
          variant="outline"
          icon="bi-plus-circle"
          :label="$t('view.sale.invoiceDetail.addVersion')"
          @click="openVersionModal"
        />
        <ButtonGeneric
          class="is-primary"
          icon="bi-printer"
          :label="$t('view.sale.invoiceDetail.printInvoice')"
          @click="reprintPDF"
        />
        <ActionMenuGeneric
          :label="$t('view.sale.invoiceDetail.menuOtherDocs')"
          icon="bi-file-earmark-text"
          :items="otherDocMenuItems"
        />
        <ActionMenuGeneric
          :label="$t('view.sale.invoiceDetail.menuExcel')"
          icon="bi-file-earmark-excel"
          :items="excelMenuItems"
        />
        <ActionMenuGeneric
          icon="bi-three-dots"
          :title="$t('view.sale.invoiceDetail.menuMore')"
          :items="moreMenuItems"
        />
      </template>
    </PageHeaderGeneric>

    <!-- Error State -->
    <div v-if="loadError" class="alert alert-danger">
      <i class="bi bi-exclamation-triangle mr-2"></i>
      {{ loadError }}
    </div>

    <!-- Invoice Detail Content -->
    <div v-else-if="invoiceData && invoiceData.invoiceNumber">
      <!-- Invoice and Customer Information -->
      <invoice-info-card :invoiceData="invoiceData" class="mb-3" />

      <!-- Invoice Items -->
      <invoice-items-table
        :invoiceItems="invoiceItems"
        :invoiceData="invoiceData"
        :formSaleOrder="formSaleOrder"
        class="mb-3"
      />


      <!-- Payment and Financial Summary with Version List -->
      <div class="form-content-payment-container">
        <!-- Invoice Version List (3/12) -->
        <div class="">
          <div class="card-container mb-3">
            <div class="card-header">
              <h6 class="mb-0"><i class="bi bi-clock-history mr-2"></i>{{ $t('view.sale.invoiceDetail.invoiceVersions') }}</h6>
            </div>
            <div class="card-body p-2">
              <div v-if="versionList.length === 0" class="text-center text-muted py-3">
                <i class="bi bi-inbox" style="font-size: 2rem"></i>
                <p class="mb-0 mt-2">{{ $t('view.sale.invoiceDetail.noVersion') }}</p>
              </div>
              <div v-else class="version-list">
                <div
                  v-for="version in versionList"
                  :key="version.versionNumber"
                  class="version-item"
                  @click="viewVersion(version)"
                >
                  <div class="d-flex justify-content-between align-items-start">
                    <div class="flex-grow-1">
                      <div class="version-number">
                        <i class="bi bi-file-earmark-pdf mr-1"></i>
                        {{ version.versionNumber }}
                      </div>
                      <div class="version-meta">
                        <small class="text-muted">
                          <i class="bi bi-calendar3 mr-1"></i>
                          {{ formatDate(version.createDate) }}
                        </small>
                      </div>
                      <div class="version-meta">
                        <small class="text-muted">
                          <i class="bi bi-person mr-1"></i>
                          {{ version.createBy }}
                        </small>
                      </div>
                    </div>
                    <div class="version-actions">
                      <button
                        class="btn btn-sm btn-outline-main"
                        @click.stop="printVersion(version)"
                        :title="$t('view.sale.invoiceDetail.printVersionTooltip')"
                      >
                        <i class="bi bi-printer"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- Payment and Financial Summary (9/12) -->
        <div class="">
          <payment-section
            :invoiceData="invoiceData"
            :paidAmount="paidAmount"
            :grandTotalRounded="grandTotalRounded"
            class="mb-3"
            @record-payment="showPaymentModal = true"
            @delete-payment="confirmDeletePayment"
          />

          <money-summary-card
            :invoiceData="invoiceData"
            :subTotal="totalSelectedAmount"
            :totalAfterDiscountAndAddition="totalAfterDiscountAndAddition"
            :totalBeforeVat="totalBeforeVat"
            :vatAmount="vatAmount"
            :grandTotalRaw="grandTotalRaw"
            :grandTotalRounded="grandTotalRounded"
            class="mb-3"
          />

          <!-- Remark -->
          <div v-if="invoiceData.remark" class="card-container mb-3">
            <div class="card-header">
              <h6 class="mb-0">{{ $t('view.sale.invoice.remark') }}</h6>
            </div>
            <div class="card-body">
              <p class="mb-0">{{ invoiceData.remark }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Invoice Version Modal -->
      <InvoiceVersionModal
        :isShowModal="showVersionModal"
        :invoiceData="invoiceData"
        :invoiceItems="invoiceItems"
        @close-modal="showVersionModal = false"
        @save="handleSaveVersion"
        @preview="handlePreviewVersion"
      />

      <!-- Invoice Confirm Print Modal -->
      <InvoiceConfirmPrintModal
        :isShowModal="showConfirmPrintModal"
        :invoiceData="invoiceData"
        :isPreviewOpen="isShowPreviewModal || isShowContinuousPreview"
        :sellerName="sellerName"
        @close-modal="showConfirmPrintModal = false"
        @confirm-print="handleConfirmPrint"
        @preview-print="handlePreviewPrint"
      />

      <!-- Invoice PDF Preview Modal -->
      <InvoicePdfPreviewModal
        :isShowModal="isShowPreviewModal"
        :previewUrl="previewUrl"
        @close-modal="closePreviewModal"
        @download="handlePreviewDownload"
      />

      <!-- Continuous Paper Print Preview Panel -->
      <ContinuousPrintPreviewPanel
        :isShowModal="isShowContinuousPreview"
        :model="continuousPreviewModel"
        :paperLabel="continuousPaperLabel"
        :offsetLabel="continuousOffsetLabel"
        @close-modal="closeContinuousPreview"
        @print-now="handleContinuousPrintNow"
      />

      <!-- Delivery Note Confirm Print Modal -->
      <DeliveryConfirmPrintModal
        :isShowModal="showDeliveryPrintModal"
        :invoiceData="invoiceData"
        @close-modal="showDeliveryPrintModal = false"
        @confirm-print="handleConfirmDeliveryPrint"
      />

      <!-- Guarantee Card Print Modal -->
      <GuaranteeCardPrintModal
        :isShowModal="showGuaranteeModal"
        :invoiceData="invoiceData"
        :invoiceItems="invoiceItems"
        :historyVersion="guaranteeHistoryVersion"
        @close-modal="showGuaranteeModal = false"
        @preview-print="handlePreviewGuarantee"
        @confirm-print="handleConfirmGuaranteePrint"
      />

      <!-- Certificate Print Modal -->
      <CertificatePrintModal
        :isShowModal="showCertificateModal"
        :invoiceData="invoiceData"
        :invoiceItems="invoiceItems"
        :historyVersion="certificateHistoryVersion"
        @close-modal="showCertificateModal = false"
        @preview-print="handlePreviewCertificate"
        @confirm-print="handleConfirmCertificatePrint"
      />

      <!-- Invoice Confirm Excel Modal -->
      <ExcelExportConfirmModal
        :isShowModal="showConfirmExcelModal"
        :documentNumber="invoiceData.invoiceNumber || ''"
        :documentDate="invoiceData.invoiceDate ? new Date(invoiceData.invoiceDate) : new Date()"
        numberLabel="Invoice Number"
        dateLabel="Invoice Date"
        @close-modal="showConfirmExcelModal = false"
        @confirm-export="handleConfirmExcelExport"
      />

      <!-- Payment Record Modal -->
      <PaymentRecordModal
        :isShowModal="showPaymentModal"
        :invoiceData="invoiceData"
        :paidAmount="paidAmount"
        @close-modal="showPaymentModal = false"
        @save-payment="handleSavePayment"
      />
    </div>
  </div>
</template>

<script>
import InvoiceVersionModal from './modal/invoice-version-modal.vue'
import InvoiceConfirmPrintModal from './modal/invoice-confirm-print-modal.vue'
import InvoicePdfPreviewModal from './modal/invoice-pdf-preview-modal.vue'
import ContinuousPrintPreviewPanel from './modal/continuous-print-preview-panel.vue'
import DeliveryConfirmPrintModal from './modal/delivery-confirm-print-modal.vue'
import GuaranteeCardPrintModal from './modal/guarantee-card-print-modal.vue'
import CertificatePrintModal from './modal/certificate-print-modal.vue'
import ExcelExportConfirmModal from '@/components/modal/excel-export-confirm-modal.vue'
import PaymentRecordModal from './modal/payment-record-modal.vue'
import InvoiceInfoCard from './components/invoice-info-card.vue'
import InvoiceItemsTable from './components/invoice-items-table.vue'
import PaymentSection from './components/payment-section.vue'
import MoneySummaryCard from './components/money-summary-card.vue'
import PageHeaderGeneric from '@/components/generic/PageHeaderGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import ActionMenuGeneric from '@/components/generic/ActionMenuGeneric.vue'
import { useInvoiceApiStore } from '@/stores/modules/api/sale/invoice-store.js'
import { usrSaleOrderApiStore } from '@/stores/modules/api/sale/sale-order-store.js'
import { useAuthStore } from '@/stores/modules/authen/authen-store.js'
import { useMasterApiStore } from '@/stores/modules/api/master-store.js'
import { error, success, warning } from '@/services/alert/sweetAlerts.js'
import { confirmThenSubmit } from '@/composables/useConfirmSubmit.js'
import { invoicePdfService } from '@/services/helper/pdf/invoice/invoice-pdf-integration.js'
import { invoiceSummaryPdfService } from '@/services/helper/pdf/invoice-summary/invoice-summary-integration.js'
import { invoiceExcelService } from '@/services/helper/excel/invoice/invoice-excel-integration.js'
import { deliveryPdfService } from '@/services/helper/pdf/delivery/delivery-pdf-integration.js'
import { guaranteeCardPdfService } from '@/services/helper/pdf/guarantee-card/guarantee-card-pdf-integration.js'
import { certificatePdfService } from '@/services/helper/pdf/certificate/certificate-pdf-integration.js'
import { SaleSummaryPdfBuilder } from '@/services/helper/pdf/sale-summary/sale-summary-pdf-builder.js'
import { SaleSummaryExcelBuilder } from '@/services/helper/excel/sale-summary/sale-summary-excel-builder.js'
import { buildProductTypeLabelMap } from '@/services/helper/sale-summary/sale-summary-data.js'
import dayjs from 'dayjs'
import { ceilToInteger, formatDocCurrency } from '@/services/utils/decimal.js'

export default {
  name: 'InvoiceDetailView',

  components: {
    InvoiceVersionModal,
    InvoiceConfirmPrintModal,
    InvoicePdfPreviewModal,
    ContinuousPrintPreviewPanel,
    DeliveryConfirmPrintModal,
    GuaranteeCardPrintModal,
    CertificatePrintModal,
    ExcelExportConfirmModal,
    PaymentRecordModal,
    InvoiceInfoCard,
    InvoiceItemsTable,
    PaymentSection,
    MoneySummaryCard,
    PageHeaderGeneric,
    ButtonGeneric,
    ActionMenuGeneric
  },

  data() {
    return {
      invoiceData: null,
      invoiceItems: [],
      loadError: null,
      invoiceStore: useInvoiceApiStore(),
      saleOrderStore: usrSaleOrderApiStore(),
      authStore: useAuthStore(),
      masterStore: useMasterApiStore(),
      sellerName: '',
      fromRoute: null, // Store the route we came from
      formSaleOrder: {},
      type: 'STOCK-PRODUCT',
      showVersionModal: false,
      showConfirmPrintModal: false,
      showDeliveryPrintModal: false,
      showGuaranteeModal: false,
      guaranteeHistoryVersion: 0,
      showCertificateModal: false,
      certificateHistoryVersion: 0,
      showConfirmExcelModal: false,
      showPaymentModal: false,
      isShowPreviewModal: false,
      previewUrl: '',
      previewSource: 'invoice',
      lastGuaranteeCards: null,
      lastCertificateData: null,
      isShowContinuousPreview: false,
      continuousPreviewModel: null,
      lastPreviewPrintData: null,
      paidAmount: 0,
      versionList: [],
      originalInvoiceData: null,
      originalInvoiceItems: [],
      currentViewingVersion: null,
    }
  },

  computed: {
    totalSelectedAmount() {
      return Number(this.getSumTotalConvertedPrice(this.invoiceItems) || 0)
    },

    // ยอดรวมหลังหักส่วนลดพิเศษและเพิ่มส่วนพิเศษ
    totalAfterDiscountAndAddition() {
      const baseTotal = this.totalSelectedAmount
      const afterDiscount = baseTotal - Number(this.invoiceData?.specialDiscount || 0)
      const afterAddition = afterDiscount + Number(this.invoiceData?.specialAddition || 0)
      return afterAddition
    },

    // ยอดรวมก่อน VAT (รวม Freight & Insurance แล้ว)
    totalBeforeVat() {
      return this.totalAfterDiscountAndAddition + Number(this.invoiceData?.freightAndInsurance || 0)
    },

    // คำนวณค่า VAT จากเปอร์เซ็นต์
    vatAmount() {
      const vatPercent = Number(this.invoiceData?.vatPercent || 0)
      return (this.totalBeforeVat * vatPercent) / 100
    },

    // ยอดรวมสุดท้ายรวม VAT
    grandTotal() {
      return this.totalBeforeVat + this.vatAmount
    },
    grandTotalRaw() {
      return Number(this.totalBeforeVat) + Number(this.vatAmount)
    },
    grandTotalRounded() {
      return ceilToInteger(this.grandTotalRaw)
    },

    remainingBalance() {
      return this.grandTotalRounded - (this.invoiceData?.deposit || 0) - this.paidAmount
    },

    canPrintGuarantee() {
      return (
        !!this.invoiceData &&
        this.invoiceItems.length > 0 &&
        this.remainingBalance <= 0 &&
        this.invoiceData.statusName !== 'Cancelled'
      )
    },

    canPrintCertificate() {
      return (
        !!this.invoiceData &&
        this.invoiceItems.length > 0 &&
        this.remainingBalance <= 0 &&
        this.invoiceData.statusName !== 'Cancelled'
      )
    },

    otherDocMenuItems() {
      return [
        {
          key: 'delivery',
          icon: 'bi-truck',
          label: this.$t('view.sale.invoiceDetail.printDelivery'),
          command: this.printDeliveryNote
        },
        {
          key: 'guarantee',
          icon: 'bi-patch-check',
          label: this.$t('view.sale.invoiceDetail.printGuarantee'),
          disabled: !this.canPrintGuarantee,
          hint: this.canPrintGuarantee ? '' : this.$t('view.sale.invoiceDetail.guaranteeNeedPaid'),
          command: this.printGuaranteeCard
        },
        {
          key: 'certificate',
          icon: 'bi-award',
          label: this.$t('view.sale.invoiceDetail.printCertificate'),
          disabled: !this.canPrintCertificate,
          hint: this.canPrintCertificate ? '' : this.$t('view.sale.invoiceDetail.certificateNeedPaid'),
          command: this.printCertificate
        },
        {
          key: 'summary-pdf',
          icon: 'bi-file-earmark-pdf',
          label: this.$t('view.sale.invoiceDetail.printSummaryPdf'),
          disabled: !this.invoiceItems.length,
          command: this.printSummary
        }
      ]
    },

    excelMenuItems() {
      return [
        {
          key: 'excel',
          icon: 'bi-file-earmark-excel',
          label: this.$t('view.sale.invoiceDetail.exportExcel'),
          command: this.exportInvoiceExcel
        },
        {
          key: 'excel-summary',
          icon: 'bi-file-earmark-excel',
          label: this.$t('view.sale.invoiceDetail.exportSummaryExcel'),
          disabled: !this.invoiceItems.length,
          command: this.exportSummaryExcel
        }
      ]
    },

    moreMenuItems() {
      return [
        {
          key: 'cancel-group',
          label: this.$t('view.sale.invoiceDetail.menuCancelGroup'),
          items: [
            { separator: true },
            {
              key: 'cancel-invoice',
              icon: 'bi-x-circle',
              danger: true,
              label: this.$t('view.sale.invoiceDetail.cancelInvoiceOnly'),
              hint: this.$t('view.sale.invoiceDetail.cancelInvoiceOnlyHint'),
              command: this.confirmReverseInvoice
            },
            {
              key: 'cancel-unconfirm',
              icon: 'bi-x-octagon',
              danger: true,
              label: this.$t('view.sale.invoiceDetail.cancelInvoiceUnconfirm'),
              hint: this.$t('view.sale.invoiceDetail.cancelInvoiceUnconfirmHint'),
              command: this.confirmCancelAndUnconfirm
            }
          ]
        }
      ]
    },

    continuousPaperLabel() {
      if (!this.lastPreviewPrintData) return ''
      return this.lastPreviewPrintData.paperSize === 'vat-bridge'
        ? this.$t('view.sale.invoiceDetail.paperTax')
        : this.$t('view.sale.invoiceDetail.paperBill')
    },

    continuousOffsetLabel() {
      if (!this.lastPreviewPrintData) return ''
      const offset = this.lastPreviewPrintData.paperSize === 'vat-bridge'
        ? this.lastPreviewPrintData.continuousOffset
        : this.lastPreviewPrintData.billOffset
      return this.$t('view.sale.invoiceDetail.previewOffsetLabel', { x: offset?.x || 0, y: offset?.y || 0 })
    }
  },

  async mounted() {
    // Store the route we came from for navigation after delete
    this.fromRoute = this.$route.query.from || null
    this.sellerName = this.getDefaultSellerName()

    // Get invoice number from route query
    const invoiceNumber = this.$route.query.invoiceNumber
    if (invoiceNumber) {
      await this.loadInvoiceData(invoiceNumber)
      // Load payment history after invoice data is loaded
      await this.loadPaymentHistory()
    } else {
      this.loadError = this.$t('view.sale.invoiceDetail.error.noInvoiceNumber')
    }
  },

  methods: {
    getDefaultSellerName() {
      const u = this.authStore.getUser
      const full = [u?.firstName, u?.lastName].filter(Boolean).join(' ').trim()
      return full || u?.username || ''
    },

    async loadInvoiceData(invoiceNumber) {
      // Load Invoice data - same structure as Sale Order
      const invoiceResponse = await this.invoiceStore.fetchGet({
        formValue: { invoiceNumber: invoiceNumber }
      })

      const saleOrderData = await this.getSaleOrderData(invoiceResponse.soNumber)
      if (saleOrderData) {
        this.invoiceData = {
          ...invoiceResponse,
          vatPercent: invoiceResponse.vat || 0
        }

        // default ช่อง Seller = ผู้ขายที่บันทึกไว้กับ invoice ถ้ามี ไม่งั้น fallback เป็น user ที่ login (ผู้ใช้ยังแก้เองในกล่องพิมพ์ได้ตามเดิม)
        if (this.invoiceData.salePerson) {
          this.sellerName = this.invoiceData.salePerson
        }


        this.formSaleOrder = {
          number: saleOrderData.number || '',
          date: saleOrderData.date || new Date(),
          expectedDeliveryDate: saleOrderData.expectedDeliveryDate || null,
          quotationNumber: saleOrderData.quotationNumber || '',
          depositRequired: saleOrderData.depositRequired || false,
          priority: saleOrderData.priority || 'normal',
          remark: saleOrderData.remark || '',
          customerRemark: saleOrderData.customer?.remark || '',

          customerCode: saleOrderData.customerCode || '',
          customerName: saleOrderData.customerName || '',
          customerAddress: saleOrderData.customerAddress || '',
          customerPhone: saleOrderData.customerPhone || '',
          customerEmail: saleOrderData.customerEmail || '',

          currencyUnit: saleOrderData.currencyUnit || 'US$',
          currencyRate: saleOrderData.currencyRate || 33.0,
          markup: saleOrderData.markup || 3.5,
          goldPerOz: saleOrderData.goldPerOz || 2000,
          freight: saleOrderData.freight || 0,
          copyFreight: saleOrderData.copyFreight || 0
        }

        //console.log('saleOrderData items', saleOrderData.items)

        //this.invoiceItems = saleOrderData.items.stockItems || []

        if (saleOrderData.items) {
          if (saleOrderData.items.stockItems || saleOrderData.items.copyItems) {
            this.invoiceItems = saleOrderData.items.stockItems || []
          } else if (Array.isArray(saleOrderData.items)) {
            this.invoiceItems = saleOrderData.items.filter((item) => item.stockNumber != null)
          } else if (Array.isArray(saleOrderData.items.allItems)) {
            this.invoiceItems = saleOrderData.items.allItems.filter(
              (item) => item.stockNumber != null
            )
          }

          this.invoiceItems = this.invoiceItems.filter((item) => {
            return invoiceResponse.confirmedItems.some(
              (invItem) => invItem.stockNumber === item.stockNumber
            )
          })

          this.invoiceItems.forEach((item) => {
            const confirmedItem = saleOrderData.stockConfirm.find(
              (ci) => ci.stockNumber === item.stockNumber
            )

            if (confirmedItem) {
              item.id = confirmedItem.id
              item.stockNumber = confirmedItem.stockNumber
              item.appraisalPrice = confirmedItem.priceOrigin
              item.qty = confirmedItem.qty
              item.discountPercent = confirmedItem.discount
              item.isConfirm = true
              item.isInvoice = true
              item.invoice = invoiceResponse.invoiceNumber
              item.invoiceItem = confirmedItem.invoiceItem
                 item.dkInvoiceNumber = confirmedItem.dkInvoiceNumber
            }

            // earringStemSize มีเฉพาะใน Invoice/Get response (ไม่มีใน stockConfirm)
            const invConfirmed = invoiceResponse.confirmedItems.find(
              (ci) => ci.stockNumber === item.stockNumber
            )
            if (invConfirmed && invConfirmed.earringStemSize != null) {
              item.earringStemSize = invConfirmed.earringStemSize
            }
          })
        }

      }

      // Store original data
      this.originalInvoiceData = { ...this.invoiceData }
      this.originalInvoiceItems = [...this.invoiceItems]

      // Load invoice versions
      await this.loadVersions()
    },

    async loadVersions() {
      if (!this.invoiceData || !this.invoiceData.invoiceNumber) return

      const response = await this.invoiceStore.fetchListVersions({
        formValue: {
          invoiceNumber: this.invoiceData.invoiceNumber,
          soNumber: this.invoiceData.soNumber
        }
      })

      if (response && response.data) {
        this.versionList = response.data
      }
    },

    async viewVersion(version) {
      const response = await this.invoiceStore.fetchGetVersion({
        formValue: {
          versionNumber: version.versionNumber
        }
      })

      if (response && response.data) {
        const versionData = JSON.parse(response.data)

        // Update invoice data with version data
        this.currentViewingVersion = version.versionNumber
        this.invoiceData = {
          ...this.originalInvoiceData,
          currencyUnit: versionData.currencyUnit,
          currencyRate: versionData.currencyRate,
          specialDiscount: versionData.specialDiscount,
          specialAddition: versionData.specialAddition,
          freightAndInsurance: versionData.freightAndInsurance
        }

        // Update invoice items with version items
        this.invoiceItems = versionData.items || []

        // Update form sale order currency
        this.formSaleOrder.currencyUnit = versionData.currencyUnit
        this.formSaleOrder.currencyRate = versionData.currencyRate
      }
    },

    restoreOriginalView() {
      this.currentViewingVersion = null
      this.invoiceData = { ...this.originalInvoiceData }
      this.invoiceItems = [...this.originalInvoiceItems]
      this.formSaleOrder.currencyUnit = this.originalInvoiceData.currencyUnit
      this.formSaleOrder.currencyRate = this.originalInvoiceData.currencyRate
    },

    async printVersion(version) {
      const response = await this.invoiceStore.fetchGetVersion({
        formValue: {
          versionNumber: version.versionNumber
        }
      })

      if (response && response.data) {
        const versionData = JSON.parse(response.data)
        this.generateVersionPDF(versionData, { open: true, download: false })
      }
    },

    async getSaleOrderData(soNumber) {
      const response = await this.saleOrderStore.fetchGet({
        formValue: { soNumber: soNumber }
      })

      let saleOrderData = {}

      if (response) {
        saleOrderData = {
          ...response,
          number: soNumber || '',
          date: response.createDate ? new Date(response.createDate) : new Date(),
          expectedDeliveryDate: response.deliveryDate ? new Date(response.deliveryDate) : null,
          quotationNumber: response.refQuotation || null,
          depositRequired: response.depositPercent ? true : false,
          priority: response.priority,
          discount: response.discount,
          freight: response.freight,
          remark: response.remark,
          items: response.data
            ? (() => {
                try {
                  const parsedData = JSON.parse(response.data)
                  return parsedData
                } catch (e) {
                  console.error('Error parsing data:', e)
                  return []
                }
              })()
            : [],
          confirmedItems: response.stockConfirm,
          currencyUnit: response.currencyUnit,
          currencyRate: response.currencyRate,
          markup: response.markup,
          goldPerOz: response.goldRate,
          customer: {
            name: response.customerName || '',
            address: response.customerAddress || '',
            phone: response.customerTel || '',
            email: response.customerEmail || '',
            remark: response.customerRemark || ''
          }
        }
      }

      return saleOrderData
    },

    formatDate(date) {
      if (!date) return '-'
      return dayjs(date).format('DD/MM/YYYY')
    },
    formatNumber(value) {
      if (!value && value !== 0) return '0.00'
      return formatDocCurrency(value, this.invoiceData?.currencyUnit, 'en-US')
    },
    getStatusBadgeClass(status) {
      const statusMap = {
        Draft: 'badge badge-secondary',
        Confirmed: 'badge badge-success',
        Cancelled: 'badge badge-danger',
        Pending: 'badge badge-warning'
      }
      return statusMap[status] || 'badge badge-info'
    },
    calculateTotal() {
      let total = 0
      this.invoiceItems.forEach((item) => {
        total += (item.price || 0) * (item.qty || 0)
      })

      // Apply discount
      total -= this.invoiceData.discount || 0

      return total
    },

    // Weight calculation methods - same as Sale Order
    getNetWeight(items) {
      if (!items || !Array.isArray(items) || items.length === 0) return '0.00'

      return items
        .reduce((sum, item) => {
          if (!item.materials) return sum
          return (
            sum +
            item.materials.reduce((matSum, mat) => {
              return matSum + (mat.weight || 0)
            }, 0)
          )
        }, 0)
        .toFixed(2)
    },

    getGoldWeight(items) {
      if (!items || !Array.isArray(items) || items.length === 0) return '0.00'

      return items
        .reduce((sum, item) => {
          if (!item.materials) return sum
          return (
            sum +
            item.materials
              .filter((m) => m.type === 'Gold')
              .reduce((matSum, mat) => matSum + (mat.weight || 0), 0)
          )
        }, 0)
        .toFixed(2)
    },

    getDiamondWeight(items) {
      if (!items || !Array.isArray(items) || items.length === 0) return '0.00'

      return items
        .reduce((sum, item) => {
          if (!item.materials) return sum
          return (
            sum +
            item.materials
              .filter((m) => m.type === 'Diamond')
              .reduce((matSum, mat) => matSum + (mat.weight || 0), 0)
          )
        }, 0)
        .toFixed(2)
    },

    getGemWeight(items) {
      if (!items || !Array.isArray(items) || items.length === 0) return '0.00'

      return items
        .reduce((sum, item) => {
          if (!item.materials) return sum
          return (
            sum +
            item.materials
              .filter((m) => m.type === 'Gem')
              .reduce((matSum, mat) => matSum + (mat.weight || 0), 0)
          )
        }, 0)
        .toFixed(2)
    },

    // Price calculation methods
    getAppraisalPrice(item) {
      return item.appraisalPrice || item.price || 0
    },

    getDiscountedPrice(item) {
      const appraisalPrice = this.getAppraisalPrice(item)
      const discountPercent = item.discountPercent || 0
      return appraisalPrice * (1 - discountPercent / 100)
    },

    getConvertedPrice(item) {
      const discountedPrice = this.getDiscountedPrice(item)
      const currencyRate = this.invoiceData.currencyRate || 1
      return discountedPrice / currencyRate
    },

    getTotalConvertedPrice(item) {
      const convertedPrice = this.getConvertedPrice(item)
      const qty = item.qty || 0
      return convertedPrice * qty
    },

    // Sum calculation methods
    getSumAppraisalPrice(items) {
      if (!items || !Array.isArray(items) || items.length === 0) return '0.00'

      const total = items.reduce((sum, item) => {
        const price = this.getAppraisalPrice(item)
        return sum + (Number(price) || 0)
      }, 0)

      return Number(total).toFixed(2)
    },

    getSumDiscountPrice(items) {
      if (!items || !Array.isArray(items) || items.length === 0) return '0.00'

      const total = items.reduce((sum, item) => {
        const price = this.getDiscountedPrice(item)
        return sum + (Number(price) || 0)
      }, 0)

      return Number(total).toFixed(2)
    },

    getSumConvertedPrice(items) {
      if (!items || !Array.isArray(items) || items.length === 0) return '0.00'

      const total = items.reduce((sum, item) => {
        const price = this.getConvertedPrice(item)
        return sum + (Number(price) || 0)
      }, 0)

      return Number(total).toFixed(2)
    },

    getSumQty(items) {
      if (!items || !Array.isArray(items) || items.length === 0) return 0

      return items.reduce((sum, item) => {
        return sum + (Number(item.qty) || 0)
      }, 0)
    },

    getSumTotalConvertedPrice(items) {
      if (!items || !Array.isArray(items) || items.length === 0) return '0.00'

      const total = items.reduce((sum, item) => {
        const price = this.getTotalConvertedPrice(item)
        return sum + (Number(price) || 0)
      }, 0)

      return Number(total).toFixed(2)
    },

    calculateGrandTotal() {
      const total = this.invoiceItems.reduce((sum, item) => {
        return sum + this.getTotalConvertedPrice(item)
      }, 0)

      return total
    },
    goBack() {
      this.$router.back()
    },
    async reprintPDF() {
      // Open confirm print modal instead of direct print
      this.showConfirmPrintModal = true
    },
    async printDeliveryNote() {
      // Open delivery print modal instead of direct print
      this.showDeliveryPrintModal = true
    },
    printGuaranteeCard() {
      if (!this.canPrintGuarantee) {
        warning(this.$t('view.sale.invoiceDetail.guaranteeNeedPaid'), this.$t('common.label.incompleteData'))
        return
      }
      this.showGuaranteeModal = true
    },
    async handlePreviewGuarantee({ cards, signerTitle }) {
      try {
        const res = await guaranteeCardPdfService.generateGuaranteeCardPDF(cards, {
          preview: true,
          signerTitle,
          invoiceNumber: this.invoiceData.invoiceNumber
        })
        this.lastGuaranteeCards = { cards, signerTitle }
        this.previewSource = 'guarantee'
        this.previewUrl = res.previewUrl
        this.isShowPreviewModal = true
      } catch (err) {
        error(err.message, this.$t('view.sale.invoiceDetail.error.cannotCreatePDF'))
      }
    },
    async handleConfirmGuaranteePrint({ cards, signerTitle }) {
      try {
        await guaranteeCardPdfService.generateGuaranteeCardPDF(cards, {
          download: true,
          signerTitle,
          invoiceNumber: this.invoiceData.invoiceNumber
        })

        try {
          await this.invoiceStore.createPrintLog({
            invoiceNumber: this.invoiceData.invoiceNumber,
            paperType: 'guarantee-card',
            data: JSON.stringify({
              signerTitle,
              count: cards.length,
              stockNumbers: cards.map((c) => c.stockNumber),
              cards: cards.map((c) => ({
                stockNumber: c.stockNumber,
                productNumber: c.productNumber,
                code: c.code,
                goodsSpecify: c.goodsSpecify,
                goldWeight: c.goldWeight,
                gemRows: c.gemRows,
                diamondWeight: c.diamondWeight,
                diamondQuality: c.diamondQuality
              }))
            })
          })
        } catch {
          warning(this.$t('view.sale.guaranteeCard.warn.logFailed'), this.$t('view.sale.guaranteeCard.title'))
        }
        this.guaranteeHistoryVersion++

        success(this.$t('view.sale.guaranteeCard.success.generated'), this.$t('view.sale.guaranteeCard.title'))
      } catch (err) {
        error(err.message, this.$t('view.sale.invoiceDetail.error.cannotCreatePDF'))
      }
    },
    printCertificate() {
      if (!this.canPrintCertificate) {
        warning(this.$t('view.sale.invoiceDetail.certificateNeedPaid'), this.$t('common.label.incompleteData'))
        return
      }
      this.showCertificateModal = true
    },
    async handlePreviewCertificate({ certificates, signerTitle }) {
      try {
        const res = await certificatePdfService.generateCertificatePDF(certificates, {
          preview: true,
          signerTitle,
          invoiceNumber: this.invoiceData.invoiceNumber
        })
        this.lastCertificateData = { certificates, signerTitle }
        this.previewSource = 'certificate'
        this.previewUrl = res.previewUrl
        this.isShowPreviewModal = true
      } catch (err) {
        error(err.message, this.$t('view.sale.invoiceDetail.error.cannotCreatePDF'))
      }
    },
    async handleConfirmCertificatePrint({ certificates, signerTitle }) {
      try {
        await certificatePdfService.generateCertificatePDF(certificates, {
          download: true,
          signerTitle,
          invoiceNumber: this.invoiceData.invoiceNumber
        })

        try {
          await this.invoiceStore.createPrintLog({
            invoiceNumber: this.invoiceData.invoiceNumber,
            paperType: 'certificate',
            data: JSON.stringify({
              signerTitle,
              count: certificates.length,
              stockNumbers: certificates.map((c) => c.stockNumber),
              certificates: certificates.map((c) => ({
                stockNumber: c.stockNumber,
                certificateNo: c.certificateNo
              }))
            })
          })
        } catch {
          warning(this.$t('view.sale.certificate.warn.logFailed'), this.$t('view.sale.certificate.title'))
        }
        this.certificateHistoryVersion++

        success(this.$t('view.sale.certificate.success.generated'), this.$t('view.sale.certificate.title'))
      } catch (err) {
        error(err.message, this.$t('view.sale.invoiceDetail.error.cannotCreatePDF'))
      }
    },
    async exportInvoiceExcel() {
      // Open confirm excel modal instead of direct export
      this.showConfirmExcelModal = true
    },

    // ใบสรุปตามประเภทสินค้า — ชื่อประเภทต้องเป็นภาษาอังกฤษจาก master (productTypeName เป็นภาษาไทย)
    async loadProductTypeLabels() {
      try {
        await this.masterStore.fetchProductType()
      } catch {
        // ดึง master ไม่สำเร็จ — ออกเอกสารต่อได้โดยใช้ค่า fallback เดิม
        return {}
      }
      return buildProductTypeLabelMap(this.masterStore.productType)
    },

    // ตัวหารสกุลเงินของหน้านี้คือ currencyRate
    buildSummaryOptions(productTypeLabels) {
      return {
        items: this.invoiceItems,
        customer: {
          name: this.invoiceData.customerName,
          address: this.invoiceData.customerAddress,
          tel: this.invoiceData.customerTel,
          email: this.invoiceData.customerEmail,
          phone: this.invoiceData.customerTel,
          taxId: this.invoiceData.customerTaxId
        },
        documentDate: this.invoiceData.invoiceDate || this.invoiceData.createDate,
        documentTitle: this.$t('view.sale.invoiceDetail.summaryTitle'),
        documentNumber: this.invoiceData.invoiceNumber,
        currencyUnit: this.invoiceData.currencyUnit,
        divisor: this.invoiceData.currencyRate || 1,
        productTypeLabels
      }
    },
    async printSummary() {
      const productTypeLabels = await this.loadProductTypeLabels()
      const builder = new SaleSummaryPdfBuilder(this.buildSummaryOptions(productTypeLabels))
      await builder.downloadPDF()
      success(this.$t('view.sale.invoiceDetail.success.summaryPdf'), 'Summary PDF')
    },
    async exportSummaryExcel() {
      const productTypeLabels = await this.loadProductTypeLabels()
      const builder = new SaleSummaryExcelBuilder(this.buildSummaryOptions(productTypeLabels))
      await builder.downloadExcel()
      success(this.$t('view.sale.invoiceDetail.success.summaryExcel'), 'Summary Excel')
    },
    async handleConfirmExcelExport({ documentNumber, documentDate }) {
      const excelData = {
        saleOrder: {
          soNumber: this.invoiceData.soNumber,
          date: this.invoiceData.createDate,
          expectedDeliveryDate: this.invoiceData.deliveryDate,
          paymentTerms: this.invoiceData.paymentName,
          depositPercent: this.invoiceData.depositPercent,
          remark: this.invoiceData.remark,
          salePerson: this.invoiceData.salePerson,
          saleSupport: this.invoiceData.saleSupport,
          specialDiscount: this.invoiceData.specialDiscount || 0,
          specialAddition: this.invoiceData.specialAddition || 0,
          freightAndInsurance: this.invoiceData.freightAndInsurance || 0,
          vatPercent: this.invoiceData.vatPercent || this.invoiceData.vat || 0
        },
        customer: {
          name: this.invoiceData.customerName,
          address: this.invoiceData.customerAddress,
          tel: this.invoiceData.customerTel,
          email: this.invoiceData.customerEmail,
          phone: this.invoiceData.customerTel
        },
        currency: {
          unit: this.invoiceData.currencyUnit || 'THB',
          rate: this.invoiceData.currencyRate || 1
        },
        items: this.invoiceItems
      }

      const options = {
        invoiceNo: documentNumber,
        invoiceDate: dayjs(documentDate),
        download: true
      }

      await invoiceExcelService.generateInvoiceExcel(excelData, options)
      success(this.$t('view.sale.invoiceDetail.success.exportExcel'), 'Invoice Excel')
    },
    async handleConfirmDeliveryPrint(printData) {
      if (!printData || !printData.deliveryNumber) {
        error(this.$t('view.sale.invoiceDetail.error.noDeliveryNote'), this.$t('view.sale.invoiceDetail.error.cannotCreatePDF'))
        return
      }

      {
        // Prepare data for Delivery Note PDF generation
        const deliveryData = {
          saleOrder: {
            soNumber: this.invoiceData.soNumber,
            date: this.invoiceData.createDate,
            expectedDeliveryDate: this.invoiceData.deliveryDate,
            paymentTerms: this.invoiceData.paymentName,
            depositPercent: this.invoiceData.depositPercent,
            remark: this.invoiceData.remark,
            salePerson: this.invoiceData.salePerson,
            saleSupport: this.invoiceData.saleSupport
          },
          customer: {
            name: this.invoiceData.customerName,
            address: this.invoiceData.customerAddress,
            tel: this.invoiceData.customerTel,
            email: this.invoiceData.customerEmail,
            phone: this.invoiceData.customerTel
          },
          currency: {
            unit: this.invoiceData.currencyUnit || 'THB',
            rate: this.invoiceData.currencyRate || 1
          },
          items: this.invoiceItems
        }

        // Format date properly
        let formattedDate
        if (printData.deliveryDate instanceof Date) {
          formattedDate = dayjs(printData.deliveryDate)
        } else {
          formattedDate = dayjs(printData.deliveryDate)
        }

        const options = {
          deliveryNo: printData.deliveryNumber,
          deliveryDate: formattedDate,
          download: true,
          open: false
        }

        await deliveryPdfService.generateDeliveryPDF(deliveryData, options)
        success(this.$t('view.sale.invoiceDetail.success.deliveryNotePDF'), 'Delivery Note')
      }
    },
    getImageUrl(imagePath) {
      if (!imagePath) return ''
      // Construct full image URL based on API base path
      // Adjust this path according to your API configuration
      const baseUrl = this.$store.state.apiBaseUrl || 'https://localhost:49153'
      return `${baseUrl}/Images/Stock/${imagePath}`
    },
    handleImageError(event) {
      // Hide broken image or show placeholder
      event.target.style.display = 'none'
    },
    confirmReverseInvoice() {
      confirmThenSubmit(
        this.$t('view.sale.invoiceDetail.confirm.cancelInvoice'),
        this.$t('view.sale.invoiceDetail.confirm.cancelInvoiceTitle'),
        async () => {
          await this.reverseInvoice()
        },
        { confirmText: this.$t('common.btn.confirm'), cancelText: this.$t('common.btn.cancel') },
        'warning'
      )
    },
    async reverseInvoice() {
      if (!this.invoiceData || !this.invoiceData.invoiceNumber) {
        error(this.$t('view.sale.invoiceDetail.error.noInvoiceData'), this.$t('view.sale.invoiceDetail.error.cannotCancel'))
        return
      }

      await this.invoiceStore.fetchDelete({
        formValue: { invoiceNumber: this.invoiceData.invoiceNumber }
      })

      success(this.$t('view.sale.invoiceDetail.success.cancelInvoice'), this.$t('view.sale.invoiceDetail.success.cancelInvoiceTitle'))

      if (this.fromRoute === 'sale-order' && this.invoiceData.soNumber) {
        this.$router.push({
          path: '/sale-order',
          query: { soNumber: this.invoiceData.soNumber, mode: 'view' }
        })
      } else {
        this.$router.back()
      }
    },
    confirmCancelAndUnconfirm() {
      const lines = [
        this.$t('view.sale.invoiceDetail.confirm.cancelInvoiceUnconfirm', {
          invoiceNumber: this.invoiceData.invoiceNumber,
          soNumber: this.invoiceData.soNumber,
          count: this.invoiceItems.length
        })
      ]

      if (this.paidAmount > 0) {
        lines.push(
          this.$t('view.sale.invoiceDetail.confirm.cancelPaymentWarning', {
            amount: this.formatNumber(this.paidAmount),
            currency: this.invoiceData.currencyUnit
          })
        )
      }

      lines.push(this.$t('view.sale.invoiceDetail.confirm.cancelIrreversible'))

      confirmThenSubmit(
        lines.join('<br/>'),
        this.$t('view.sale.invoiceDetail.confirm.cancelInvoiceUnconfirmTitle'),
        async () => {
          await this.cancelAndUnconfirmInvoice()
        },
        { confirmText: this.$t('common.btn.confirm'), cancelText: this.$t('common.btn.cancel') },
        'warning'
      )
    },
    async cancelAndUnconfirmInvoice() {
      if (!this.invoiceData || !this.invoiceData.invoiceNumber) {
        error(this.$t('view.sale.invoiceDetail.error.noInvoiceData'), this.$t('view.sale.invoiceDetail.error.cannotCancel'))
        return
      }

      const res = await this.invoiceStore.fetchCancelAndUnconfirm({
        invoiceNumber: this.invoiceData.invoiceNumber
      })
      if (!res) return

      const count = res.unconfirmedItemCount ?? this.invoiceItems.length
      success(
        this.$t('view.sale.invoiceDetail.success.cancelInvoiceUnconfirm', { count }),
        this.$t('view.sale.invoiceDetail.success.cancelInvoiceUnconfirmTitle')
      )

      this.$router.push({
        path: '/sale-order',
        query: { soNumber: res.soNumber || this.invoiceData.soNumber, mode: 'view' }
      })
    },
    openVersionModal() {
      this.showVersionModal = true
    },
    async handleSaveVersion() {
      await this.loadVersions()
      this.showVersionModal = false
    },
    handlePreviewVersion(versionData) {
      this.generateVersionPDF(versionData, { open: true, download: false })
    },
    async handleConfirmPrint(printData) {
      if (!printData || !printData.invoiceNumber) {
        error(this.$t('view.sale.invoiceDetail.error.noInvoiceData'), this.$t('view.sale.invoiceDetail.error.cannotCreatePDF'))
        return
      }

      this.sellerName = printData.sellerName || this.sellerName

      {
        const formattedDate = dayjs(printData.invoiceDate)

        // Prepare data for PDF generation with modified invoice number and date
        const pdfData = {
          saleOrder: {
            soNumber: this.invoiceData.soNumber,
            date: this.invoiceData.createDate,
            expectedDeliveryDate: this.invoiceData.deliveryDate,
            paymentTerms: this.invoiceData.paymentName,
            depositPercent: this.invoiceData.depositPercent,
            remark: this.invoiceData.remark,
            salePerson: this.invoiceData.salePerson,
            saleSupport: this.invoiceData.saleSupport,
            specialDiscount: this.invoiceData.specialDiscount || 0,
            specialAddition: this.invoiceData.specialAddition || 0,
            freightAndInsurance: this.invoiceData.freightAndInsurance || 0,
            createDate: this.invoiceData.createDate,
            paymentDay: this.invoiceData.paymentDay,
            deposit: this.invoiceData.deposit || 0,
            amountPaid: Array.isArray(this.invoiceData.payments)
              ? this.invoiceData.payments.reduce((s, p) => s + (Number(p.amount) || 0), 0)
              : 0,
            vatPercent: this.invoiceData.vatPercent !== undefined ? this.invoiceData.vatPercent : this.invoiceData.vat
          },
          customer: {
            name: this.invoiceData.customerName,
            address: this.invoiceData.customerAddress,
            tel: this.invoiceData.customerTel,
            email: this.invoiceData.customerEmail,
            phone: this.invoiceData.customerTel,
            taxId: this.invoiceData.customerTaxId
          },
          currency: {
            unit: this.invoiceData.currencyUnit || 'THB',
            rate: this.invoiceData.currencyRate || 1
          },
          items: this.invoiceItems
        }

        const options = {
          invoiceNo: printData.invoiceNumber,
          invoiceDate: formattedDate,
          download: true,
          open: false,
          showCifLabel: printData.showCifLabel !== undefined ? printData.showCifLabel : true,
          hideCompanyHeader: printData.hideCompanyHeader || false,
          hideRounding: printData.hideRounding || false,
          showDecimals: printData.showDecimals,
          itemsPerPage: Number(printData.itemsPerPage) || 10
        }

        if (printData.paperSize === 'vat-bridge' || printData.paperSize === 'bill') {
          const { printGeneric } = await import('@/services/api/print-bridge-service.js')
          const { buildContinuousPrintModel } = await import('@/services/helper/print/continuous-print-payload.js')
          const { model, logPayload } = await buildContinuousPrintModel(printData.paperSize, {
            invoiceData: this.invoiceData,
            invoiceItems: this.invoiceItems,
            printData,
            invoiceNo: options.invoiceNo,
            invoiceDate: options.invoiceDate
          })
          await printGeneric(model)
          const successKey = printData.paperSize === 'vat-bridge'
            ? 'view.sale.invoiceDetail.success.printVat'
            : 'view.sale.invoiceDetail.success.printBill'
          success(this.$t(successKey), 'Bridge GDI')
          this.invoiceStore.createPrintLog({
            invoiceNumber: printData.invoiceNumber,
            paperType: printData.paperSize === 'vat-bridge' ? 'vat' : 'bill',
            data: JSON.stringify(logPayload)
          })
          return
        } else {
          if (printData.invoiceTemplate === 'summary') {
            await invoiceSummaryPdfService.generateInvoiceSummaryPDF(pdfData, options)
          } else {
            await invoicePdfService.generateInvoicePDF(pdfData, {
              ...options,
              sellerName: this.sellerName,
              supportName: this.invoiceData?.saleSupport || '',
              showSeller: printData.showSeller !== undefined ? printData.showSeller : true
            })
          }
        }
        success(this.$t('view.sale.invoiceDetail.success.createPDF'), 'Invoice PDF')
        const a4PaperType = printData.invoiceTemplate === 'summary' ? 'a4-summary' : 'a4'
        this.invoiceStore.createPrintLog({
          invoiceNumber: printData.invoiceNumber,
          paperType: a4PaperType,
          data: JSON.stringify({ flags: null, billOffset: null, continuousOffset: null, printerName: printData.printerName, template: printData.invoiceTemplate })
        })
      }
    },
    async handlePreviewPrint(printData) {
      if (!printData || !printData.invoiceNumber) return

      this.sellerName = printData.sellerName || this.sellerName

      if (printData.paperSize !== 'a4') {
        if (this.isShowPreviewModal) {
          this.closePreviewModal()
        }

        const continuousDate = dayjs(printData.invoiceDate)
        const { buildContinuousPrintModel } = await import('@/services/helper/print/continuous-print-payload.js')
        const { model } = await buildContinuousPrintModel(printData.paperSize, {
          invoiceData: this.invoiceData,
          invoiceItems: this.invoiceItems,
          printData,
          invoiceNo: printData.invoiceNumber,
          invoiceDate: continuousDate
        })
        this.continuousPreviewModel = model
        this.lastPreviewPrintData = printData
        this.isShowContinuousPreview = true
        return
      }

      this.closeContinuousPreview()

      const formattedDate = dayjs(printData.invoiceDate)

      const pdfData = {
        saleOrder: {
          soNumber: this.invoiceData.soNumber,
          date: this.invoiceData.createDate,
          expectedDeliveryDate: this.invoiceData.deliveryDate,
          paymentTerms: this.invoiceData.paymentName,
          depositPercent: this.invoiceData.depositPercent,
          remark: this.invoiceData.remark,
          salePerson: this.invoiceData.salePerson,
          saleSupport: this.invoiceData.saleSupport,
          specialDiscount: this.invoiceData.specialDiscount || 0,
          specialAddition: this.invoiceData.specialAddition || 0,
          freightAndInsurance: this.invoiceData.freightAndInsurance || 0,
          createDate: this.invoiceData.createDate,
          paymentDay: this.invoiceData.paymentDay,
          deposit: this.invoiceData.deposit || 0,
          amountPaid: Array.isArray(this.invoiceData.payments)
            ? this.invoiceData.payments.reduce((s, p) => s + (Number(p.amount) || 0), 0)
            : 0,
          vatPercent: this.invoiceData.vatPercent !== undefined ? this.invoiceData.vatPercent : this.invoiceData.vat
        },
        customer: {
          name: this.invoiceData.customerName,
          address: this.invoiceData.customerAddress,
          tel: this.invoiceData.customerTel,
          email: this.invoiceData.customerEmail,
          phone: this.invoiceData.customerTel,
          taxId: this.invoiceData.customerTaxId
        },
        currency: {
          unit: this.invoiceData.currencyUnit || 'THB',
          rate: this.invoiceData.currencyRate || 1
        },
        items: this.invoiceItems
      }

      const options = {
        invoiceNo: printData.invoiceNumber,
        invoiceDate: formattedDate,
        download: false,
        open: false,
        preview: true,
        showCifLabel: printData.showCifLabel !== undefined ? printData.showCifLabel : true,
        hideCompanyHeader: printData.hideCompanyHeader || false,
        hideRounding: printData.hideRounding || false,
        showDecimals: printData.showDecimals,
        itemsPerPage: Number(printData.itemsPerPage) || 10
      }

      const res = printData.invoiceTemplate === 'summary'
        ? await invoiceSummaryPdfService.generateInvoiceSummaryPDF(pdfData, options)
        : await invoicePdfService.generateInvoicePDF(pdfData, {
            ...options,
            sellerName: this.sellerName,
            supportName: this.invoiceData?.saleSupport || '',
            showSeller: printData.showSeller !== undefined ? printData.showSeller : true
          })
      this.previewUrl = res.previewUrl
      this.lastPreviewPrintData = printData
      this.previewSource = 'invoice'
      this.isShowPreviewModal = true
    },

    closePreviewModal() {
      if (this.previewUrl) {
        URL.revokeObjectURL(this.previewUrl)
      }
      this.previewUrl = ''
      this.isShowPreviewModal = false
      this.previewSource = 'invoice'
    },

    handlePreviewDownload() {
      if (this.previewSource === 'guarantee') {
        this.handleConfirmGuaranteePrint(this.lastGuaranteeCards)
      } else if (this.previewSource === 'certificate') {
        this.handleConfirmCertificatePrint(this.lastCertificateData)
      } else {
        this.handleConfirmPrint(this.lastPreviewPrintData)
      }
      this.closePreviewModal()
    },

    closeContinuousPreview() {
      this.isShowContinuousPreview = false
      this.continuousPreviewModel = null
    },

    async handleContinuousPrintNow() {
      await this.handleConfirmPrint(this.lastPreviewPrintData)
      this.closeContinuousPreview()
    },

    async generateVersionPDF(versionData, options = { open: false, download: true }) {
      {
        const pdfData = {
          saleOrder: {
            soNumber: this.invoiceData.soNumber,
            date: this.invoiceData.createDate,
            expectedDeliveryDate: this.invoiceData.deliveryDate,
            paymentTerms: this.invoiceData.paymentName,
            depositPercent: this.invoiceData.depositPercent,
            remark: this.invoiceData.remark,
            // Use version data for financial calculations
            specialDiscount: versionData.specialDiscount || 0,
            specialAddition: versionData.specialAddition || 0,
            freightAndInsurance: versionData.freightAndInsurance || 0
          },
          customer: {
            name: this.invoiceData.customerName,
            address: this.invoiceData.customerAddress,
            tel: this.invoiceData.customerTel,
            email: this.invoiceData.customerEmail,
            phone: this.invoiceData.customerTel
          },
          currency: {
            unit: versionData.currencyUnit || 'THB',
            rate: versionData.currencyRate || 1
          },
          // Use version items instead of original items
          items: versionData.items
        }

        const pdfOptions = {
          invoiceNo: `${this.invoiceData.invoiceNumber}-V${versionData.versionNumber}`,
          invoiceDate: dayjs(this.invoiceData.createDate).format('DD/MM/YYYY'),
          sellerName: this.sellerName,
          showSeller: true,
          download: options.download,
          open: options.open
        }

        await invoicePdfService.generateInvoicePDF(pdfData, pdfOptions)

        if (options.download) {
          success(this.$t('view.sale.invoiceDetail.success.createPDF'), 'Invoice Version PDF')
        }
      }
    },
    async handleSavePayment(paymentData) {
      // Create FormData for file upload
      const formData = new FormData()
      formData.append('InvoiceNumber', paymentData.invoiceNumber)
      formData.append('PaymentDate', paymentData.paymentDate.toISOString())
      formData.append('Amount', paymentData.amount)
      formData.append('Payment', paymentData.payment) // Payment method ID (int)
      formData.append('PaymentName', paymentData.paymentName) // Payment method name (string)

      if (paymentData.bankCode) {
        formData.append('BankCode', paymentData.bankCode)
      }

      if (paymentData.bankBranch) {
        formData.append('BankBranch', paymentData.bankBranch)
      }

      if (paymentData.referenceNumber) {
        formData.append('ReferenceNumber', paymentData.referenceNumber)
      }

      if (paymentData.remark) {
        formData.append('Remark', paymentData.remark)
      }

      if (paymentData.receiptImage) {
        formData.append('ReceiptImage', paymentData.receiptImage)
      }

      // Call API to save payment record
      const response = await this.invoiceStore.createPayment(formData)

      if (response) {
        await this.loadInvoiceData(paymentData.invoiceNumber)
      }

      // Close modal after processing
      this.showPaymentModal = false
    },

    async loadPaymentHistory() {
      // Load payment records from API
      const response = await this.invoiceStore.fetchPaymentList({
        formValue: {
          invoiceNumber: this.invoiceData.invoiceNumber
        }
      })

      if (response && response.data) {
        // Calculate total paid amount
        this.paidAmount = response.data.reduce((sum, payment) => {
          return sum + payment.amount
        }, 0)
      }
    },

    confirmDeletePayment(paymentData) {
      confirmThenSubmit(
        this.$t('view.sale.invoiceDetail.confirm.deletePayment', { amount: this.formatNumber(paymentData.amount), currency: paymentData.currencyUnit }),
        this.$t('view.sale.invoiceDetail.confirm.deletePaymentTitle'),
        async () => {
          await this.deletePayment(paymentData)
        },
        { confirmText: this.$t('common.btn.confirm'), cancelText: this.$t('common.btn.cancel') },
        'warning'
      )
    },

    async deletePayment(paymentData) {
      if (!paymentData || !paymentData.running) {
        error(this.$t('view.sale.invoiceDetail.error.noPaymentData'), this.$t('view.sale.invoiceDetail.error.cannotDelete'))
        return
      }

      await this.invoiceStore.deletePayment({
        formValue: { paymentRunning: paymentData.running }
      })

      success(this.$t('view.sale.invoiceDetail.success.deletePayment'), this.$t('view.sale.invoiceDetail.success.deletePaymentTitle'))

      await this.loadInvoiceData(this.invoiceData.invoiceNumber)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';

.app-container {
  padding: 1rem;
}

.card-container {
  background: var(--color-card-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-sm);
}

.card-header {
  background: var(--base-font-color);
  border-bottom: 1px solid var(--color-border);
  border-radius: var(--radius-sm) var(--radius-sm) 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  font-weight: 300;
  color: white;
}

.card-body {
  padding: 1rem;
}

.form-control-plaintext {
  padding-top: 0.375rem;
  padding-bottom: 0.375rem;
  margin-bottom: 0;
  line-height: 1.5;
}

.badge {
  font-size: 0.875rem;
  padding: 0.375rem 0.75rem;
}

// Material cell styling for table
.material-cell {
  display: flex;
  gap: 1px;
  align-items: flex-start;
  min-width: 0;
}

.material-typecode {
  flex: 5;
  text-align: left;
  margin-right: 0.5rem;
  min-width: 120px;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.material-typecode-gold {
  flex: 5;
  text-align: left;
  margin-right: 0.5rem;
  min-width: 40px;
  word-wrap: break-word;
  overflow-wrap: break-word;
  color: #d4af37;
  font-weight: 600;
}

.material-weight {
  flex: 3;
  text-align: right;
  min-width: 60px;
  margin-left: auto;
  font-weight: 500;
}

// Table styling - same as Sale Order
:deep(.p-datatable-thead > tr > th) {
  text-align: center;
  vertical-align: middle;
  padding: 0.75rem 0.5rem;
  font-weight: 600;
}

:deep(.p-datatable-tbody > tr > td) {
  vertical-align: top;
  padding: 0.5rem;
}

:deep(.p-datatable-tfoot > tr > td) {
  vertical-align: middle;
  padding: 0.5rem;
  font-weight: 500;
}

.qty-container {
  text-align: right;
  min-width: 80px;
}

.text-right {
  text-align: right;
}

.type-container {
  font-size: 13px;
  font-weight: bold;
  color: var(--base-font-color);
  padding: 5px;
}

.qty-container {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-right: 5px;
}

// Invoice Version List styles
.version-list {
  max-height: calc(100vh - 300px);
  overflow-y: auto;
}

.version-item {
  padding: var(--sp-md);
  margin-bottom: var(--sp-sm);
  background: var(--color-highlight-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: var(--color-border);
    border-color: var(--base-font-color);
    box-shadow: var(--shadow-sm);
  }

  .version-number {
    font-weight: 600;
    color: var(--base-font-color);
    font-size: 0.9rem;
    margin-bottom: 0.25rem;
  }

  .version-meta {
    font-size: 0.75rem;
    line-height: 1.4;
  }

  .version-actions {
    margin-left: 0.5rem;

    .btn {
      padding: 0.25rem 0.5rem;
      font-size: 0.875rem;
    }
  }
}

.form-content-payment-container {
  display: grid;
  grid-template-columns: 1fr 4fr;
  gap: var(--sp-sm);

  > * {
    min-width: 0;
  }

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
}
</style>
