<template>
  <div class="mobile-invoice-detail-view">
    <!-- Loading State -->
    <div v-if="isLoading" class="mobile-container mobile-mt-2">
      <div class="mobile-loading">
        <div class="spinner"></div>
        <div class="loading-text">{{ $t('view.mobile.sale.loadingText') }}</div>
      </div>
    </div>

    <!-- Invoice Detail Content -->
    <div v-else-if="invoiceData" class="mobile-container mobile-mt-1">
      <!-- Invoice Info Card -->
      <div class="info-card">
        <div class="card-header">
          <i class="bi bi-file-earmark-text"></i>
          <span>{{ $t('view.mobile.sale.invoiceDetailTitle') }}</span>
          <span
            class="header-status-badge"
            :style="{ background: getStatusColor(invoiceData.statusName) }"
          >
            {{ invoiceData.statusName || '-' }}
          </span>
        </div>
        <div class="card-body">
          <div class="info-row">
            <span class="info-label">{{ $t('view.mobile.sale.invoiceDetailNumber') }}</span>
            <span class="info-value highlight">{{ invoiceData.invoiceNumber }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">{{ $t('view.mobile.sale.invoiceDetailSoNumber') }}</span>
            <span class="info-value">{{ invoiceData.soNumber || '-' }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">{{ $t('view.mobile.sale.invoiceDetailCreateDate') }}</span>
            <span class="info-value">{{ formatDate(invoiceData.createDate) }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">{{ $t('view.mobile.sale.invoiceDetailCreateBy') }}</span>
            <span class="info-value">{{ invoiceData.createBy || '-' }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">{{ $t('view.mobile.sale.invoiceDetailCurrency') }}</span>
            <span class="info-value">{{ invoiceData.currencyUnit || 'THB' }} (Rate: {{ formatNumber(invoiceData.currencyRate) }})</span>
          </div>
        </div>
      </div>

      <!-- Customer Info Card -->
      <div v-if="hasCustomerInfo" class="info-card mobile-mt-2">
        <div class="card-header">
          <i class="bi bi-person"></i>
          {{ $t('view.mobile.sale.invoiceCustomerTitle') }}
        </div>
        <div class="card-body">
          <div v-if="invoiceData.customerName" class="info-row">
            <span class="info-label">{{ $t('view.mobile.sale.invoiceCustomerName') }}</span>
            <span class="info-value">{{ invoiceData.customerName }}</span>
          </div>
          <div v-if="invoiceData.customerTel" class="info-row">
            <span class="info-label">{{ $t('view.mobile.sale.invoiceCustomerTel') }}</span>
            <span class="info-value">{{ invoiceData.customerTel }}</span>
          </div>
          <div v-if="invoiceData.customerAddress" class="info-row remark-row">
            <span class="info-label">{{ $t('view.mobile.sale.invoiceCustomerAddress') }}</span>
            <span class="info-value">{{ invoiceData.customerAddress }}</span>
          </div>
        </div>
      </div>

      <!-- Items List (read-only) -->
      <div class="items-section mobile-mt-2">
        <div class="section-header">
          <h3 class="section-title">
            <i class="bi bi-box-seam"></i>
            {{ $t('view.mobile.sale.invoiceItemsTitle', { count: invoiceItems.length }) }}
          </h3>
        </div>
        <div class="items-container">
          <SoItemCard
            v-for="(item, index) in invoiceItems"
            :key="item.stockNumber + '-' + index"
            :item="item"
          />
        </div>
      </div>

      <!-- Summary -->
      <div class="summary-card mobile-mt-2">
        <div class="summary-row">
          <span class="summary-label">{{ $t('view.mobile.sale.invoiceFobLabel') }}</span>
          <span class="summary-value">{{ formatCurrency(totalSelectedAmount) }} {{ displayCurrency }}</span>
        </div>
        <div v-if="invoiceData.specialDiscount" class="summary-row">
          <span class="summary-label">{{ $t('view.mobile.sale.invoiceSpecialDiscountLabel') }}</span>
          <span class="summary-value discount">-{{ formatCurrency(invoiceData.specialDiscount) }}</span>
        </div>
        <div v-if="invoiceData.specialAddition" class="summary-row">
          <span class="summary-label">{{ $t('view.mobile.sale.invoiceSpecialAdditionLabel') }}</span>
          <span class="summary-value addition">+{{ formatCurrency(invoiceData.specialAddition) }}</span>
        </div>
        <div v-if="invoiceData.freightAndInsurance" class="summary-row">
          <span class="summary-label">{{ $t('view.mobile.sale.invoiceFreightLabel') }}</span>
          <span class="summary-value">{{ formatCurrency(invoiceData.freightAndInsurance) }}</span>
        </div>
        <div class="summary-divider"></div>
        <div class="summary-row">
          <span class="summary-label">{{ $t('view.mobile.sale.invoiceBeforeVatLabel') }}</span>
          <span class="summary-value">{{ formatCurrency(totalBeforeVat) }}</span>
        </div>
        <div v-if="invoiceData.vatPercent" class="summary-row">
          <span class="summary-label">{{ $t('view.mobile.sale.invoiceVatLabel', { percent: invoiceData.vatPercent }) }}</span>
          <span class="summary-value">{{ formatCurrency(vatAmount) }}</span>
        </div>
        <div class="summary-divider"></div>
        <div class="summary-row total">
          <span class="summary-label">{{ $t('view.mobile.sale.invoiceGrandTotalLabel') }}</span>
          <span class="summary-value">{{ formatCurrency(effectiveGrandTotal) }} {{ displayCurrency }}</span>
        </div>
      </div>

      <!-- Payment Info -->
      <div class="info-card mobile-mt-2">
        <div class="card-header">
          <i class="bi bi-credit-card"></i>
          {{ $t('view.mobile.sale.invoicePaymentTitle') }}
          <span
            v-if="paymentStatusLabel"
            class="mobile-badge payment-status-badge"
            :class="paymentStatusBadgeClass"
          >
            {{ paymentStatusLabel }}
          </span>
        </div>
        <div class="card-body">
          <div v-if="invoiceData.payment !== 0" class="info-row">
            <span class="info-label">{{ $t('view.mobile.sale.invoicePaymentMethodLabel') }}</span>
            <span class="info-value">{{ invoiceData.paymentName }}</span>
          </div>
          <div v-if="invoiceData.paymentDay" class="info-row">
            <span class="info-label">{{ $t('view.mobile.sale.invoicePaymentDayLabel') }}</span>
            <span class="info-value">{{ invoiceData.paymentDay }} {{ $t('view.mobile.sale.invoicePaymentDayUnit') }}</span>
          </div>
          <div v-if="invoiceData.deposit" class="info-row">
            <span class="info-label">{{ $t('view.mobile.sale.invoiceDepositLabel') }}</span>
            <span class="info-value">{{ formatCurrency(invoiceData.deposit) }} {{ displayCurrency }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">{{ $t('view.mobile.sale.invoicePaidAmountLabel') }}</span>
            <span class="info-value">{{ formatCurrency(paymentTotalAmount) }} {{ displayCurrency }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">{{ $t('view.mobile.sale.invoiceOutstandingLabel') }}</span>
            <span class="info-value">{{ formatCurrency(outstandingAmountDisplay) }} {{ displayCurrency }}</span>
          </div>
          <div v-if="showRecordPaymentBtn" class="record-payment-action">
            <button class="mobile-btn mobile-btn-primary" @click="showPaymentSheet = true">
              <i class="bi bi-cash-coin"></i>
              {{ $t('view.mobile.sale.invoiceRecordPaymentBtn') }}
            </button>
          </div>
          <div v-if="hasPayments" class="payment-records">
            <div class="payment-records-title">{{ $t('view.mobile.sale.invoicePaymentRecordsTitle') }}</div>
            <div
              v-for="(payment, index) in invoiceData.payments"
              :key="payment.running || index"
              class="payment-record-row"
            >
              <span class="payment-record-date">{{ formatDate(payment.paymentDate) }}</span>
              <span class="payment-record-method">{{ payment.paymentMethod || '-' }}</span>
              <span class="payment-record-amount">{{ formatCurrency(payment.amount) }}</span>
              <button
                type="button"
                class="btn-remove-payment"
                :title="$t('view.mobile.sale.invoiceDeletePaymentBtn')"
                @click="confirmDeletePayment(payment)"
              >
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Remark -->
      <div v-if="invoiceData.remark" class="info-card mobile-mt-2">
        <div class="card-header">
          <i class="bi bi-chat-left-text"></i>
          {{ $t('view.mobile.sale.invoiceRemarkTitle') }}
        </div>
        <div class="card-body">
          <div class="remark-text">{{ invoiceData.remark }}</div>
        </div>
      </div>

      <!-- Print Customization Form (inline) -->
      <div v-if="showPrintForm" class="print-form-card mobile-mt-2">
        <div class="card-header">
          <i class="bi bi-printer"></i>
          {{ $t('view.mobile.sale.invoicePrintSettingsTitle') }}
        </div>
        <div class="card-body">
          <div class="print-note">
            {{ $t('view.mobile.sale.invoicePrintNote') }}
          </div>
          <div class="mobile-form-group">
            <label class="form-label">{{ $t('view.mobile.sale.invoicePrintNumber') }}</label>
            <InputTextGeneric v-model="printInvoiceNumber" />
          </div>
          <div class="mobile-form-group">
            <label class="form-label">{{ $t('view.mobile.sale.invoicePrintDate') }}</label>
            <InputTextGeneric v-model="printInvoiceDate" type="date" />
          </div>
          <div class="mobile-form-group">
            <label class="form-label">{{ $t('common.field.seller') }}</label>
            <InputTextGeneric v-model="printSellerName" />
          </div>
          <div class="mobile-form-group">
            <CheckboxGeneric
              v-model="printShowSeller"
              :label="$t('view.mobile.sale.invoiceShowSeller')"
            />
          </div>
          <div class="print-form-actions">
            <button
              class="mobile-btn mobile-btn-primary"
              @click="generatePDF"
              :disabled="exportingPDF"
            >
              <i class="bi" :class="exportingPDF ? 'bi-hourglass-split spin-icon' : 'bi-file-pdf'"></i>
              {{ exportingPDF ? $t('view.mobile.sale.invoiceGeneratingBtn') : $t('view.mobile.sale.invoicePrintBtn') }}
            </button>
            <button class="mobile-btn mobile-btn-outline" @click="showPrintForm = false">
              <i class="bi bi-x-circle"></i>
              {{ $t('common.btn.cancel') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="action-buttons mobile-mt-3">
        <div class="print-buttons-group">
          <button
            v-if="!showPrintForm"
            class="mobile-btn mobile-btn-primary"
            @click="openPrintForm"
          >
            <i class="bi bi-printer"></i>
            {{ $t('view.mobile.sale.invoicePrintInvoiceBtn') }}
          </button>
          <ReceiptPrintAction :invoice-number="invoiceNumber" />
        </div>
        <button
          class="mobile-btn mobile-btn-danger"
          @click="handleCancelInvoice"
          :disabled="cancelling"
        >
          <i class="bi" :class="cancelling ? 'bi-hourglass-split spin-icon' : 'bi-x-octagon'"></i>
          {{ cancelling ? $t('view.mobile.sale.invoiceCancellingBtn') : $t('view.mobile.sale.invoiceCancelBtn') }}
        </button>
        <button class="mobile-btn mobile-btn-outline" @click="$router.back()">
          <i class="bi bi-arrow-left"></i>
          {{ $t('view.mobile.sale.invoiceBackBtn') }}
        </button>
      </div>

      <!-- Payment Record Sheet -->
      <PaymentRecordSheet
        :visible="showPaymentSheet"
        :invoice-number="invoiceData.invoiceNumber"
        :outstanding-amount="outstandingAmountDisplay"
        :currency-unit="displayCurrency"
        @close="showPaymentSheet = false"
        @save-payment="handleSavePayment"
      />
    </div>

    <!-- Error State -->
    <div v-else class="mobile-container mobile-mt-2">
      <div class="mobile-empty-state">
        <i class="bi bi-exclamation-circle"></i>
        <div class="empty-title">{{ $t('view.mobile.sale.invoiceEmptyTitle') }}</div>
        <div class="empty-subtitle">{{ $t('view.mobile.sale.invoiceEmptySubtitle') }}</div>
        <button class="mobile-btn mobile-btn-primary mobile-mt-2" @click="loadInvoiceData">
          <i class="bi bi-arrow-clockwise"></i>
          {{ $t('view.mobile.sale.invoiceRetryBtn') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { useInvoiceApiStore } from '@/stores/modules/api/sale/invoice-store.js'
import { usrSaleOrderApiStore } from '@/stores/modules/api/sale/sale-order-store.js'
import { useAuthStore } from '@/stores/modules/authen/authen-store.js'
import { invoicePdfService } from '@/services/helper/pdf/invoice/invoice-pdf-integration.js'
import { loadInvoiceContext, toInvoicePdfData } from '@/services/helper/invoice/build-invoice-pdf-data.js'
import { success, error } from '@/services/alert/sweetAlerts.js'
import { confirmThenSubmit } from '@/composables/useConfirmSubmit.js'
import { getPaymentStatus } from '@/services/utils/payment-status.js'
import dayjs from 'dayjs'
import SoItemCard from './components/so-item-card.vue'
import PaymentRecordSheet from './components/payment-record-sheet.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import CheckboxGeneric from '@/components/prime-vue/CheckboxGeneric.vue'
import ReceiptPrintAction from '@/components/receipt/receipt-print-action.vue'

export default {
  name: 'MobileInvoiceDetailView',

  components: {
    SoItemCard,
    PaymentRecordSheet,
    InputTextGeneric,
    CheckboxGeneric,
    ReceiptPrintAction
  },

  setup() {
    const invoiceStore = useInvoiceApiStore()
    const saleOrderStore = usrSaleOrderApiStore()
    const authStore = useAuthStore()
    return { invoiceStore, saleOrderStore, authStore }
  },

  data() {
    return {
      invoiceData: null,
      invoiceItems: [],
      isLoading: true,
      // Print form
      showPrintForm: false,
      printInvoiceNumber: '',
      printInvoiceDate: '',
      printSellerName: '',
      printShowSeller: true,
      exportingPDF: false,
      // Cancel
      cancelling: false,
      // Payment
      showPaymentSheet: false
    }
  },

  computed: {
    invoiceNumber() {
      return this.$route.params.invoiceNumber || ''
    },

    hasCustomerInfo() {
      if (!this.invoiceData) return false
      return !!(this.invoiceData.customerName || this.invoiceData.customerTel || this.invoiceData.customerAddress)
    },

    displayCurrency() {
      return this.invoiceData?.currencyUnit || 'THB'
    },

    // Invoice/Get คืน payments[] มาด้วย — ยกเลิกใบแจ้งหนี้จะยกเลิกรายการรับชำระเหล่านี้ไปด้วย (transaction เดียวฝั่ง server)
    paymentCount() {
      return Array.isArray(this.invoiceData?.payments) ? this.invoiceData.payments.length : 0
    },

    hasPayments() {
      return this.paymentCount > 0
    },

    // payment.amount อยู่ในสกุลเดียวกับ invoice (backend เซ็ต CurrencyUnit = invoice.CurrencyUnit)
    paymentTotalAmount() {
      if (!Array.isArray(this.invoiceData?.payments)) return 0
      return this.invoiceData.payments.reduce((sum, p) => sum + (Number(p?.amount) || 0), 0)
    },

    currencyRate() {
      return Number(this.invoiceData?.currencyRate) || 1
    },

    // Σ(appraisalPrice * (1 - discount%) / currencyRate * qty)
    totalSelectedAmount() {
      return this.invoiceItems.reduce((sum, item) => {
        const price = Number(item.appraisalPrice || item.price) || 0
        const qty = Number(item.qty) || 1
        const discountPercent = Number(item.discountPercent) || 0
        const priceAfterDiscount = price * (1 - discountPercent / 100)
        return sum + (priceAfterDiscount / this.currencyRate) * qty
      }, 0)
    },

    totalAfterDiscountAndAddition() {
      const base = this.totalSelectedAmount
      return base - Number(this.invoiceData?.specialDiscount || 0) + Number(this.invoiceData?.specialAddition || 0)
    },

    totalBeforeVat() {
      return this.totalAfterDiscountAndAddition + Number(this.invoiceData?.freightAndInsurance || 0)
    },

    vatAmount() {
      const vatPercent = Number(this.invoiceData?.vatPercent || 0)
      return (this.totalBeforeVat * vatPercent) / 100
    },

    grandTotal() {
      return this.totalBeforeVat + this.vatAmount
    },

    // grandTotal (ด้านบน) คือยอดดิบก่อนปัด — backend เก็บ grandTotalRounded = CeilMoney(raw)
    // ซึ่งเป็นยอดที่ปัดขึ้นเป็นจำนวนเต็มและเป็นยอดที่เก็บเงินจริงจากลูกค้า (เหมือน web + badge หน้าลิสต์)
    // ต้องใช้ตัวนี้คิดสถานะ/ยอดคงเหลือ ไม่งั้นหน้า detail จะไม่ตรงกับหน้าลิสต์และ web
    // fallback เป็น grandTotal ดิบเมื่อ API ไม่ส่งมา (ใบเก่าจำนวนมากมี grand_total_rounded = null จริงใน DB)
    // เช็ค null/undefined ตรง ๆ ห้ามใช้ || เพราะ 0 เป็นค่าที่ถูกต้อง
    effectiveGrandTotal() {
      const rounded = this.invoiceData?.grandTotalRounded
      return rounded === null || rounded === undefined ? this.grandTotal : Number(rounded)
    },

    outstandingAmount() {
      return this.effectiveGrandTotal - Number(this.invoiceData?.deposit || 0) - this.paymentTotalAmount
    },

    // ยอดคงเหลือติดลบไม่มีความหมาย (จ่ายเกิน) — clamp ให้ 0 เฉพาะตอนแสดงผล
    outstandingAmountDisplay() {
      return Math.max(0, this.outstandingAmount)
    },

    paymentStatus() {
      return getPaymentStatus(this.effectiveGrandTotal, this.invoiceData?.deposit, this.paymentTotalAmount)
    },

    paymentStatusLabel() {
      const map = {
        paid: this.$t('view.mobile.sale.invoiceStatusPaidLabel'),
        partial: this.$t('view.mobile.sale.invoiceStatusPartialLabel'),
        unpaid: this.$t('view.mobile.sale.invoiceStatusUnpaidLabel')
      }
      return map[this.paymentStatus] || ''
    },

    paymentStatusBadgeClass() {
      const map = {
        paid: 'mobile-badge-success',
        partial: 'mobile-badge-warning',
        unpaid: 'mobile-badge-danger'
      }
      return map[this.paymentStatus] || 'mobile-badge-secondary'
    },

    // แสดงปุ่มบันทึกรับเงินเมื่อยังจ่ายไม่ครบเท่านั้น — ใช้ paymentStatus (คิดจากยอดเงินจริง)
    // ห้ามใช้ invoiceData.paymantName ตัดสิน เพราะเป็นวิธีชำระตอนออกบิล ไม่ใช่สถานะจ่ายแล้ว
    showRecordPaymentBtn() {
      return this.paymentStatus !== 'paid'
    }
  },

  mounted() {
    this.loadInvoiceData()
  },

  methods: {
    async loadInvoiceData() {
      this.isLoading = true
      try {
        this.invoiceData = null
        this.invoiceItems = []

        const context = await loadInvoiceContext(this.invoiceNumber, {
          invoiceStore: this.invoiceStore,
          saleOrderStore: this.saleOrderStore
        })

        if (!context) return

        this.invoiceData = context.invoiceData
        this.invoiceItems = context.invoiceItems
      } finally {
        this.isLoading = false
      }
    },

    // ==================== Print ====================
    getDefaultSellerName() {
      const u = this.authStore.getUser
      const full = [u?.firstName, u?.lastName].filter(Boolean).join(' ').trim()
      return full || u?.username || ''
    },

    openPrintForm() {
      this.printInvoiceNumber = this.invoiceData.invoiceNumber || ''
      this.printInvoiceDate = dayjs().format('YYYY-MM-DD')
      this.printSellerName = this.getDefaultSellerName()
      this.printShowSeller = true
      this.showPrintForm = true
    },

    async generatePDF() {
      this.exportingPDF = true
      try {
        const pdfData = toInvoicePdfData({ invoiceData: this.invoiceData, invoiceItems: this.invoiceItems })

        const options = {
          invoiceNo: this.printInvoiceNumber,
          invoiceDate: dayjs(this.printInvoiceDate),
          sellerName: this.printSellerName,
          showSeller: this.printShowSeller,
          download: true
        }

        await invoicePdfService.generateInvoicePDF(pdfData, options)
        success(this.$t('view.mobile.sale.invoiceSuccessPdfMsg'), this.$t('view.mobile.sale.invoiceSuccessPdf'))
        this.showPrintForm = false
      } catch (err) {
        error(err.message || this.$t('view.mobile.sale.invoiceGeneratingBtn'), this.$t('view.mobile.sale.invoiceDetailTitle'))
      } finally {
        this.exportingPDF = false
      }
    },

    // ==================== Cancel Invoice ====================
    handleCancelInvoice() {
      const confirmLines = [
        this.$t('view.mobile.sale.invoiceCancelConfirmMsg', {
          invoiceNumber: this.invoiceNumber,
          soNumber: this.invoiceData.soNumber
        }),
        this.$t('view.mobile.sale.invoiceCancelConfirmItemsMsg', { count: this.invoiceItems.length })
      ]

      if (this.hasPayments) {
        confirmLines.push(
          this.$t('view.mobile.sale.invoiceCancelConfirmPaymentWarningMsg', {
            count: this.paymentCount,
            amount: this.formatCurrency(this.paymentTotalAmount),
            currency: this.displayCurrency
          })
        )
      }

      confirmLines.push(this.$t('view.mobile.sale.invoiceCancelConfirmIrreversibleMsg'))

      const confirmMessage = confirmLines.join('<br/>')

      confirmThenSubmit(
        confirmMessage,
        this.$t('view.mobile.sale.invoiceCancelConfirmTitle'),
        async () => {
          this.cancelling = true

          // ยกเลิกใบแจ้งหนี้ + ใบสั่งขาย + รายการรับชำระเงิน ใน transaction เดียวฝั่ง server
          // error ทุกกรณี axios-helper แสดง popup ให้แล้ว และค้างอยู่หน้าเดิม (ไม่ navigate)
          try {
            const res = await this.invoiceStore.fetchCancelWithSaleOrder({
              invoiceNumber: this.invoiceNumber
            })
            if (!res) return

            // field ใหม่จาก backend — fallback เป็นจำนวนที่หน้าจอนับไว้ ถ้า response ไม่มีมา
            const cancelledPaymentCount = Number(res.cancelledPaymentCount ?? this.paymentCount) || 0
            const successMessage = cancelledPaymentCount > 0
              ? this.$t('view.mobile.sale.invoiceCancelSuccessWithPaymentMsg', { count: cancelledPaymentCount })
              : this.$t('view.mobile.sale.invoiceCancelSuccessMsg')

            // navigate ใน success callback เพื่อให้ user กดตกลงก่อนค่อยเปลี่ยนหน้า
            success(
              successMessage,
              this.$t('view.mobile.sale.invoiceCancelSuccessTitle'),
              () => {
                this.$router.push({
                  name: 'mobile-sale-detail',
                  params: { soNumber: res.soNumber }
                })
              }
            )
          } finally {
            this.cancelling = false
          }
        },
        { confirmText: this.$t('view.mobile.sale.invoiceCancelConfirmBtn') }
      )
    },

    // ==================== Payment ====================
    async handleSavePayment(paymentData) {
      const formData = new FormData()
      formData.append('InvoiceNumber', paymentData.invoiceNumber)
      formData.append('PaymentDate', paymentData.paymentDate.toISOString())
      formData.append('Amount', paymentData.amount)
      formData.append('Payment', paymentData.payment)
      formData.append('PaymentName', paymentData.paymentName)

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

      const response = await this.invoiceStore.createPayment(formData)

      if (response) {
        success(this.$t('view.mobile.sale.invoicePaymentSuccessMsg'))
        await this.loadInvoiceData()
      }

      this.showPaymentSheet = false
    },

    confirmDeletePayment(payment) {
      confirmThenSubmit(
        this.$t('view.mobile.sale.invoiceConfirmDeletePaymentMsg', {
          amount: this.formatCurrency(payment.amount),
          currency: this.displayCurrency,
          date: this.formatDate(payment.paymentDate)
        }),
        this.$t('view.mobile.sale.invoiceConfirmDeletePaymentTitle'),
        async () => {
          await this.deletePayment(payment)
        },
        { confirmText: this.$t('view.mobile.sale.invoiceConfirmDeletePaymentBtn'), cancelText: this.$t('common.btn.cancel') },
        'warning'
      )
    },

    async deletePayment(payment) {
      if (!payment || !payment.running) return

      const response = await this.invoiceStore.deletePayment({
        formValue: { paymentRunning: payment.running }
      })

      if (!response) return

      success(this.$t('view.mobile.sale.invoiceDeletePaymentSuccessMsg'))
      await this.loadInvoiceData()
    },

    // ==================== Helpers ====================
    getStatusColor(statusName) {
      const name = (statusName || '').toLowerCase()
      if (name.includes('draft') || name.includes('ร่าง')) return '#9e9e9e'
      if (name.includes('confirm') || name.includes('ยืนยัน')) return '#2196f3'
      if (name.includes('invoice') || name.includes('paid') || name.includes('ชำระ')) return '#4caf50'
      if (name.includes('cancel') || name.includes('ยกเลิก')) return '#f44336'
      return '#9e9e9e'
    },

    formatDate(dateString) {
      if (!dateString) return '-'
      return dayjs(dateString).format('DD/MM/YYYY HH:mm')
    },

    formatNumber(value) {
      if (!value && value !== 0) return '0.00'
      return Number(value).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    },

    formatCurrency(value) {
      if (value === null || value === undefined) return '0.00'
      return new Intl.NumberFormat('th-TH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(Number(value))
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/mobile';

.mobile-invoice-detail-view {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: calc(40px + env(safe-area-inset-bottom, 0px));
}

.info-card {
  background: var(--color-card-bg);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #f8f9fa;
  border-bottom: 1px solid var(--color-border);
  font-weight: 600;
  color: var(--base-font-color);
  font-size: 0.95rem;

  i {
    font-size: 1.1rem;
  }

  .header-status-badge {
    margin-left: auto;
    padding: 3px 10px;
    border-radius: var(--radius-lg);
    font-size: 0.75rem;
    color: white;
    font-weight: 500;
  }

  .payment-status-badge {
    margin-left: auto;
  }
}

.card-body {
  padding: var(--sp-lg);
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
  gap: 12px;

  &:last-child {
    margin-bottom: 0;
  }

  &.remark-row {
    flex-direction: column;
    gap: 4px;
  }
}

.info-label {
  font-size: 0.85rem;
  color: #666;
  font-weight: 500;
  flex-shrink: 0;
  min-width: 100px;
}

.info-value {
  font-size: 0.9rem;
  color: #333;
  text-align: right;
  word-break: break-word;

  &.highlight {
    color: var(--base-font-color);
    font-weight: 600;
    font-size: 1rem;
  }
}

.remark-text {
  font-size: 0.9rem;
  color: #333;
  line-height: 1.5;
}

// ==================== Record Payment Action ====================
.record-payment-action {
  margin-top: var(--sp-md);

  .mobile-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
  }
}

// ==================== Payment Records ====================
.payment-records {
  margin-top: var(--sp-md);
  padding-top: var(--sp-md);
  border-top: 1px dashed var(--color-border);
}

.payment-records-title {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--base-font-color);
  margin-bottom: var(--sp-sm);
}

.payment-record-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--sp-sm);
  font-size: 0.8rem;
  color: #666;
  padding: 4px 0;

  .payment-record-method {
    flex: 1;
    text-align: center;
    color: #333;
  }

  .payment-record-amount {
    font-weight: 600;
    color: var(--base-font-color);
    flex-shrink: 0;
  }

  .btn-remove-payment {
    background: none;
    border: none;
    color: #999;
    font-size: 1.1rem;
    padding: 4px;
    line-height: 1;
    flex-shrink: 0;
    cursor: pointer;

    &:active {
      color: var(--base-red);
    }
  }
}

// ==================== Items Section ====================
.items-section {
  .section-header {
    margin-bottom: 10px;
  }

  .section-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 1rem;
    font-weight: 600;
    color: #333;
    margin: 0;

    i {
      color: var(--base-font-color);
    }
  }

  .items-container {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
}

// ==================== Summary ====================
.summary-card {
  background: var(--color-card-bg);
  border-radius: var(--radius-md);
  padding: var(--sp-lg);
  border: 1px solid var(--color-border);

  .summary-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px 0;

    .summary-label {
      font-size: 0.85rem;
      color: #666;
    }

    .summary-value {
      font-size: 0.85rem;
      font-weight: 600;
      color: #333;

      &.discount {
        color: var(--base-red);
      }

      &.addition {
        color: #4caf50;
      }
    }

    &.total {
      .summary-label {
        font-size: 1rem;
        font-weight: 600;
        color: #333;
      }

      .summary-value {
        font-size: 1.15rem;
        font-weight: 700;
        color: var(--base-font-color);
      }
    }
  }

  .summary-divider {
    height: 1px;
    background: #f0f0f0;
    margin: 6px 0;
  }
}

// ==================== Print Form ====================
.print-form-card {
  background: var(--color-card-bg);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  border: 2px solid var(--base-font-color);

  .print-note {
    font-size: 0.8rem;
    color: #999;
    background: #fff8e1;
    padding: var(--sp-sm) var(--sp-md);
    border-radius: var(--radius-md);
    margin-bottom: var(--sp-lg);
    line-height: 1.4;
  }

  .mobile-form-group {
    margin-bottom: 14px;

    .form-label {
      display: block;
      font-size: 0.85rem;
      font-weight: 500;
      color: #555;
      margin-bottom: 6px;
    }

    .form-control {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      font-size: 0.9rem;
      color: #333;
      background: #fafafa;

      &:focus {
        outline: none;
        border-color: var(--base-font-color);
        background: white;
      }
    }
  }

  .print-form-actions {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-top: 16px;
  }
}

// ==================== Action Buttons ====================
.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;

  // กลุ่มปุ่มพิมพ์ (พิมพ์ Invoice + พิมพ์สลิป) แยกจากปุ่มยกเลิก/ย้อนกลับ ไม่ให้ปนกัน
  .print-buttons-group {
    display: flex;
    flex-direction: column;
    gap: var(--sp-sm);
  }

  .mobile-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;

    i {
      font-size: 1.1rem;
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }
}

.spin-icon {
  animation: spin 2s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.mobile-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  background: var(--color-card-bg);
  border-radius: var(--radius-lg);
  text-align: center;

  i {
    font-size: 4rem;
    color: var(--color-border);
    margin-bottom: var(--sp-lg);
  }

  .empty-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: #666;
    margin-bottom: 4px;
  }

  .empty-subtitle {
    font-size: 0.85rem;
    color: #999;
  }
}
</style>
