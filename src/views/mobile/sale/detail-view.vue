<template>
  <div class="mobile-sale-detail-view">
    <!-- Header -->
    <!-- <div class="sale-header">
      <div class="mobile-container">
        <button class="mobile-btn-icon" @click="$router.push('/mobile/sale')">
          <i class="bi bi-arrow-left"></i>
        </button>
        <div class="header-content">
          <h2 class="mobile-title">รายละเอียดใบสั่งขาย</h2>
          <p class="header-subtitle">{{ soNumber }}</p>
        </div>
        <button
          class="mobile-btn-icon"
          @click="handlePrintPDF"
          :disabled="exportingPDF || !soData"
        >
          <i class="bi" :class="exportingPDF ? 'bi-hourglass-split' : 'bi-printer'"></i>
        </button>
      </div>
    </div> -->

    <!-- Loading -->
    <div v-if="isLoading" class="mobile-container mobile-mt-2">
      <div class="mobile-loading">
        <div class="spinner"></div>
        <div class="loading-text">กำลังโหลดข้อมูล...</div>
      </div>
    </div>

    <!-- SO Detail Content -->
    <div v-else-if="soData" class="mobile-container mobile-mt-1">
      <!-- SO Info Card -->
      <div class="info-card">
        <div class="card-header">
          <i class="bi bi-receipt"></i>
          <span>ข้อมูลใบสั่งขาย</span>
          <span
            class="header-status-badge"
            :style="{ background: getStatusColor(soData.status) }"
          >
            {{ getStatusLabel(soData.status) }}
          </span>
        </div>
        <div class="card-body">
          <div class="info-row">
            <span class="info-label">เลขที่ SO:</span>
            <span class="info-value highlight">{{ soData.soNumber }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">วันที่สร้าง:</span>
            <span class="info-value">{{ formatDate(soData.createDate) }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">ผู้สร้าง:</span>
            <span class="info-value">{{ soData.createBy || '-' }}</span>
          </div>
          <div v-if="soData.currencyUnit" class="info-row">
            <span class="info-label">สกุลเงิน:</span>
            <span class="info-value">{{ soData.currencyUnit }} (Rate: {{ soData.currencyRate || 1 }})</span>
          </div>
        </div>
      </div>

      <!-- Customer Info Card -->
      <div v-if="hasCustomerInfo" class="info-card mobile-mt-2">
        <div class="card-header">
          <i class="bi bi-person"></i>
          <span>ข้อมูลลูกค้า</span>
        </div>
        <div class="card-body">
          <div v-if="soData.customerName" class="info-row">
            <span class="info-label">ชื่อลูกค้า:</span>
            <span class="info-value">{{ soData.customerName }}</span>
          </div>
          <div v-if="soData.customerTel" class="info-row">
            <span class="info-label">เบอร์โทร:</span>
            <span class="info-value">{{ soData.customerTel }}</span>
          </div>
          <div v-if="soData.customerAddress" class="info-row remark-row">
            <span class="info-label">ที่อยู่:</span>
            <span class="info-value">{{ soData.customerAddress }}</span>
          </div>
        </div>
      </div>

      <!-- Items List -->
      <div class="items-section mobile-mt-2">
        <div class="section-header">
          <h3 class="section-title">
            <i class="bi bi-box-seam"></i>
            รายการสินค้า ({{ soItems.length }})
          </h3>
        </div>

        <div class="items-container">
          <SoItemCard
            v-for="(item, index) in soItems"
            :key="item.stockNumber + '-' + index"
            :item="item"
            :currencyUnit="soData.currencyUnit || 'THB'"
          />
        </div>
      </div>

      <!-- Summary -->
      <div class="summary-card mobile-mt-2">
        <div class="summary-row">
          <span class="summary-label">จำนวนรายการ</span>
          <span class="summary-value">{{ soItems.length }} รายการ</span>
        </div>
        <div class="summary-divider"></div>
        <div class="summary-row total">
          <span class="summary-label">ยอดรวมทั้งหมด</span>
          <span class="summary-value">{{ formatCurrency(displayTotalAmount) }} {{ displayCurrency }}</span>
        </div>
        <div v-if="hasCurrencyConversion" class="summary-row reference">
          <span class="summary-label">เทียบเท่า</span>
          <span class="summary-value">{{ formatCurrency(totalAmount) }} บาท</span>
        </div>
      </div>

      <!-- Remark -->
      <div v-if="soData.remark" class="info-card mobile-mt-2">
        <div class="card-header">
          <i class="bi bi-chat-left-text"></i>
          <span>หมายเหตุ</span>
        </div>
        <div class="card-body">
          <div class="remark-text">{{ soData.remark }}</div>
        </div>
      </div>

      <!-- Invoice Info (if invoiced) -->
      <div v-if="soData.invoiceNumber" class="info-card mobile-mt-2">
        <div class="card-header invoice-header">
          <i class="bi bi-file-earmark-check"></i>
          <span>ข้อมูล Invoice</span>
        </div>
        <div class="card-body">
          <div class="info-row">
            <span class="info-label">เลขที่ Invoice:</span>
            <span class="info-value highlight">{{ soData.invoiceNumber }}</span>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="action-buttons mobile-mt-3">
        <!-- Print PDF -->
        <button
          class="mobile-btn mobile-btn-outline"
          @click="handlePrintPDF"
          :disabled="exportingPDF"
        >
          <i class="bi" :class="exportingPDF ? 'bi-hourglass-split spin-icon' : 'bi-file-pdf'"></i>
          {{ exportingPDF ? 'กำลังสร้าง PDF...' : 'พิมพ์ใบสั่งขาย' }}
        </button>

        <!-- Create Invoice (only if not already invoiced) -->
        <button
          v-if="soData.status !== 'Invoiced'"
          class="mobile-btn mobile-btn-success"
          @click="handleCreateInvoice"
        >
          <i class="bi bi-file-earmark-check"></i>
          ออก Invoice
        </button>
      </div>
    </div>

    <!-- Error State -->
    <div v-else class="mobile-container mobile-mt-2">
      <div class="mobile-empty-state">
        <i class="bi bi-exclamation-circle"></i>
        <div class="empty-title">ไม่พบข้อมูล</div>
        <div class="empty-subtitle">ไม่สามารถโหลดข้อมูลใบสั่งขายได้</div>
        <button class="mobile-btn mobile-btn-primary mobile-mt-2" @click="loadSaleOrder">
          <i class="bi bi-arrow-clockwise"></i>
          ลองอีกครั้ง
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { usrSaleOrderApiStore } from '@/stores/modules/api/sale/sale-order-store.js'
import { useInvoiceApiStore } from '@/stores/modules/api/sale/invoice-store.js'
import { SaleOrderPdfBuilder } from '@/services/helper/pdf/sale-order/sale-order-pdf-builder.js'
import { success, error, warning, confirmSubmit } from '@/services/alert/sweetAlerts.js'
import SoItemCard from './components/so-item-card.vue'
import dayjs from 'dayjs'
import 'dayjs/locale/th'

dayjs.locale('th')

export default {
  name: 'MobileSaleDetailView',

  components: {
    SoItemCard
  },

  setup() {
    const saleOrderStore = usrSaleOrderApiStore()
    const invoiceStore = useInvoiceApiStore()
    return { saleOrderStore, invoiceStore }
  },

  data() {
    return {
      soData: null,
      stockItems: [],
      copyItems: [],
      isLoading: false,
      exportingPDF: false
    }
  },

  computed: {
    soNumber() {
      return this.$route.params.soNumber || '-'
    },

    soItems() {
      return [...this.stockItems, ...this.copyItems]
    },

    hasCustomerInfo() {
      if (!this.soData) return false
      return !!(this.soData.customerName || this.soData.customerTel || this.soData.customerAddress)
    },

    totalAmount() {
      return this.soItems.reduce((sum, item) => {
        const price = Number(item.appraisalPrice || item.price) || 0
        const qty = Number(item.qty) || 1
        const discountPercent = Number(item.discountPercent) || 0
        return sum + (price * qty * (1 - discountPercent / 100))
      }, 0)
    },

    displayCurrency() {
      return this.soData?.currencyUnit || 'THB'
    },

    hasCurrencyConversion() {
      const rate = Number(this.soData?.currencyRate)
      return !!(this.soData?.currencyUnit && rate && rate !== 1)
    },

    displayTotalAmount() {
      if (!this.hasCurrencyConversion) return this.totalAmount
      const rate = Number(this.soData?.currencyRate) || 1
      return this.totalAmount / rate
    }
  },

  mounted() {
    this.loadSaleOrder()
  },

  methods: {
    async loadSaleOrder() {
      this.isLoading = true
      this.soData = null
      this.stockItems = []
      this.copyItems = []

      const response = await this.saleOrderStore.fetchGet({
        formValue: { soNumber: this.soNumber }
      })

      if (response) {
        this.soData = response
        this.parseItems(response)
      }
      this.isLoading = false
    },

    parseItems(response) {
      // Items อยู่ในฟิลด์ data เป็น JSON string
      let parsedData = null
      if (response.data && typeof response.data === 'string') {
        try {
          parsedData = JSON.parse(response.data)
        } catch (e) {
          console.error('Error parsing SO data:', e)
        }
      } else if (response.data && typeof response.data === 'object') {
        parsedData = response.data
      }

      if (!parsedData) return

      // แยก stockItems กับ copyItems
      if (parsedData.stockItems || parsedData.copyItems) {
        this.stockItems = parsedData.stockItems || []
        this.copyItems = parsedData.copyItems || []
      } else if (parsedData.allItems) {
        this.stockItems = parsedData.allItems.filter((item) => item.stockNumber != null)
        this.copyItems = parsedData.allItems.filter((item) => item.stockNumber == null)
      } else if (Array.isArray(parsedData)) {
        this.stockItems = parsedData.filter((item) => item.stockNumber != null)
        this.copyItems = parsedData.filter((item) => item.stockNumber == null)
      }

      // Merge stockConfirm data เข้า items
      const stockConfirm = response.stockConfirm || []
      if (stockConfirm.length > 0) {
        this.stockItems.forEach((item) => {
          const confirmed = stockConfirm.find((c) => c.stockNumber === item.stockNumber)
          if (confirmed) {
            item.isConfirm = confirmed.isConfirm
            item.isInvoice = confirmed.isInvoice
            item.invoice = confirmed.invoice
            item.isRemainProduct = confirmed.isRemainProduct
            item.message = confirmed.message
          }
        })
      }
    },

    async handlePrintPDF() {
      if (!this.soData) {
        warning('ไม่พบข้อมูลใบสั่งขาย')
        return
      }

      this.exportingPDF = true
      try {
        // ส่ง soData + parsed items ให้ PDF builder
        const pdfData = {
          ...this.soData,
          items: this.soItems,
          totalAmount: this.totalAmount
        }
        const pdfBuilder = new SaleOrderPdfBuilder(pdfData, {
          currencyUnit: this.soData.currencyUnit || 'THB',
          currencyRate: Number(this.soData.currencyRate) || 1
        })
        const pdf = await pdfBuilder.generatePDF()
        const filename = `SO_${this.soData.soNumber}_${dayjs().format('YYYYMMDDHHmmss')}.pdf`
        pdf.download(filename)
        success('สร้าง PDF สำเร็จ')
      } catch (err) {
        console.error('Error generating PDF:', err)
        error(err.message || 'เกิดข้อผิดพลาดในการสร้าง PDF')
      } finally {
        this.exportingPDF = false
      }
    },

    handleCreateInvoice() {
      confirmSubmit(
        'ยืนยันสินค้าและออก Invoice?',
        'ออก Invoice',
        async () => {
          await this.createInvoice()
        }
      )
    },

    async createInvoice() {
      // Step 1: Confirm stock items ที่ยังไม่ได้ confirm (ตาม web version)
      const unconfirmedItems = this.stockItems.filter(
        (item) => item.stockNumber && !item.isConfirm
      )

      if (unconfirmedItems.length > 0) {
        const confirmResult = await this.saleOrderStore.confirmStockItems({
          soNumber: this.soNumber,
          stockItems: unconfirmedItems.map((item) => ({
            id: item.id || null,
            stockNumber: item.stockNumber,
            productNumber: item.productNumber || '',
            qty: Number(item.qty) || 1,
            appraisalPrice: Number(item.appraisalPrice) || Number(item.price) || 0,
            discount: Number(item.discountPercent) || 0,
            isConfirm: true,
            confirmedAt: new Date().toISOString()
          }))
        })

        if (!confirmResult) {
          error('ไม่สามารถยืนยันสินค้าได้')
          return
        }
      }

      // Step 2: Create Invoice (payload ตาม web version)
      const currencyUnit = this.soData.currencyUnit || 'THB'
      const currencyRate = Number(this.soData.currencyRate) || 1

      const invoiceItems = this.stockItems
        .filter((item) => item.stockNumber)
        .map((item) => {
          const appraisalPrice = Number(item.appraisalPrice) || Number(item.price) || 0
          const discountPercent = Number(item.discountPercent) || 0
          const priceAfterDiscount = appraisalPrice * (1 - discountPercent / 100)
          const convertedPrice = priceAfterDiscount / currencyRate

          return {
            stockNumber: item.stockNumber,
            stockNumberOrigin: item.stockNumberOrigin || item.stockNumber,
            id: item.id || null,
            priceOrigin: appraisalPrice,
            currencyUnit: currencyUnit,
            currencyRate: currencyRate,
            markup: 0,
            discount: discountPercent,
            goldRate: 0,
            remark: '',
            netPrice: String(convertedPrice),
            priceDiscount: priceAfterDiscount,
            priceAfterCurrencyRate: convertedPrice,
            qty: Number(item.qty) || 1
          }
        })

      const invoiceResult = await this.invoiceStore.fetchCreate({
        formValue: {
          soNumber: this.soNumber,
          dkInvoiceNumber: null,
          customerCode: this.soData.customerCode || null,
          customerName: this.soData.customerName || null,
          customerAddress: this.soData.customerAddress || '',
          customerTel: this.soData.customerTel || '',
          customerEmail: this.soData.customerEmail || '',
          customerRemark: '',
          currencyUnit: currencyUnit,
          currencyRate: currencyRate,
          deliveryDate: null,
          deposit: 0,
          specialDiscount: 0,
          specialAddition: 0,
          freightAndInsurance: 0,
          vat: 0,
          goldRate: 0,
          markup: 0,
          payment: 1,
          paymentName: 'เงินสด (Cash)',
          paymentDay: 0,
          priority: this.soData.priority || 'mobile',
          refQuotation: '',
          remark: this.soData.remark || '',
          items: invoiceItems
        }
      })

      if (invoiceResult) {
        const invoiceNumber = invoiceResult.invoiceNumber || invoiceResult
        success(`เลขที่ Invoice: ${invoiceNumber}`, 'ออก Invoice สำเร็จ', () => {
          this.loadSaleOrder()
        })
      }
    },

    getStatusColor(status) {
      switch (status) {
        case 'Draft':
          return '#9e9e9e'
        case 'Confirmed':
          return '#2196f3'
        case 'Invoiced':
          return '#4caf50'
        default:
          return '#9e9e9e'
      }
    },

    getStatusLabel(status) {
      switch (status) {
        case 'Draft':
          return 'ร่าง'
        case 'Confirmed':
          return 'ยืนยันแล้ว'
        case 'Invoiced':
          return 'ออก Invoice แล้ว'
        default:
          return status || 'ร่าง'
      }
    },

    formatDate(dateString) {
      if (!dateString) return '-'
      return dayjs(dateString).format('DD/MM/YYYY HH:mm')
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

.mobile-sale-detail-view {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 40px;
}

.sale-header {
  background: linear-gradient(135deg, var(--base-font-color) 0%, var(--base-font-sub-color) 100%);
  padding: 16px 0;
  color: white;
  margin-bottom: 8px;

  .mobile-container {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .mobile-btn-icon {
    background: rgba(255, 255, 255, 0.15);
    border: none;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 1.2rem;
    cursor: pointer;
    transition: all 0.2s ease;

    &:active:not(:disabled) {
      background: rgba(255, 255, 255, 0.25);
      transform: scale(0.95);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    i.bi-hourglass-split {
      animation: spin 2s linear infinite;
    }
  }

  .header-content {
    flex: 1;

    .header-subtitle {
      margin: 2px 0 0 0;
      opacity: 0.9;
      font-size: 0.8rem;
      font-weight: 500;
    }
  }
}

.info-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
  font-weight: 600;
  color: var(--base-font-color);
  font-size: 0.95rem;

  i {
    font-size: 1.1rem;
  }

  .header-status-badge {
    margin-left: auto;
    padding: 3px 10px;
    border-radius: 12px;
    font-size: 0.75rem;
    color: white;
    font-weight: 500;
  }

  &.invoice-header {
    background: #e8f5e9;
    color: #2e7d32;
    border-bottom-color: #c8e6c9;
  }
}

.card-body {
  padding: 16px;
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

.summary-card {
  background: white;
  border-radius: 10px;
  padding: 16px;
  border: 1px solid #e8e8e8;

  .summary-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px 0;

    .summary-label {
      font-size: 0.9rem;
      color: #666;
    }

    .summary-value {
      font-size: 0.9rem;
      font-weight: 600;
      color: #333;
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

    &.reference {
      .summary-label,
      .summary-value {
        font-size: 0.8rem;
        font-weight: 400;
        color: #999;
      }
    }
  }

  .summary-divider {
    height: 1px;
    background: #f0f0f0;
    margin: 6px 0;
  }
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;

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

  .mobile-btn-success {
    background: var(--base-green, #4caf50);
    color: white;
    border: none;
    padding: 12px 16px;
    border-radius: 8px;
    font-size: 0.95rem;
    font-weight: 600;
    cursor: pointer;

    &:active {
      opacity: 0.9;
    }
  }
}

.spin-icon {
  animation: spin 2s linear infinite;
}

.mobile-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  background: white;
  border-radius: 12px;

  .spinner {
    width: 40px;
    height: 40px;
    border: 3px solid #f3f3f3;
    border-top: 3px solid var(--base-font-color);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  .loading-text {
    margin-top: 16px;
    color: #666;
    font-size: 0.9rem;
  }
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
  background: white;
  border-radius: 12px;
  text-align: center;

  i {
    font-size: 4rem;
    color: #ddd;
    margin-bottom: 16px;
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
