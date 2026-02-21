<template>
  <div class="mobile-invoice-detail-view">
    <!-- Invoice Detail Content -->
    <div v-if="invoiceData" class="mobile-container mobile-mt-1">
      <!-- Invoice Info Card -->
      <div class="info-card">
        <div class="card-header">
          <i class="bi bi-file-earmark-text"></i>
          <span>ข้อมูล Invoice</span>
          <span
            class="header-status-badge"
            :style="{ background: getStatusColor(invoiceData.statusName) }"
          >
            {{ invoiceData.statusName || '-' }}
          </span>
        </div>
        <div class="card-body">
          <div class="info-row">
            <span class="info-label">เลขที่ Invoice:</span>
            <span class="info-value highlight">{{ invoiceData.invoiceNumber }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">เลขที่ SO:</span>
            <span class="info-value">{{ invoiceData.soNumber || '-' }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">วันที่สร้าง:</span>
            <span class="info-value">{{ formatDate(invoiceData.createDate) }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">ผู้สร้าง:</span>
            <span class="info-value">{{ invoiceData.createBy || '-' }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">สกุลเงิน:</span>
            <span class="info-value">{{ invoiceData.currencyUnit || 'THB' }} (Rate: {{ formatNumber(invoiceData.currencyRate) }})</span>
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
          <div v-if="invoiceData.customerName" class="info-row">
            <span class="info-label">ชื่อลูกค้า:</span>
            <span class="info-value">{{ invoiceData.customerName }}</span>
          </div>
          <div v-if="invoiceData.customerTel" class="info-row">
            <span class="info-label">เบอร์โทร:</span>
            <span class="info-value">{{ invoiceData.customerTel }}</span>
          </div>
          <div v-if="invoiceData.customerAddress" class="info-row remark-row">
            <span class="info-label">ที่อยู่:</span>
            <span class="info-value">{{ invoiceData.customerAddress }}</span>
          </div>
        </div>
      </div>

      <!-- Items List (read-only) -->
      <div class="items-section mobile-mt-2">
        <div class="section-header">
          <h3 class="section-title">
            <i class="bi bi-box-seam"></i>
            รายการสินค้า ({{ invoiceItems.length }})
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
          <span class="summary-label">F.O.B Bangkok (Subtotal)</span>
          <span class="summary-value">{{ formatCurrency(totalSelectedAmount) }} {{ displayCurrency }}</span>
        </div>
        <div v-if="invoiceData.specialDiscount" class="summary-row">
          <span class="summary-label">Special Discount</span>
          <span class="summary-value discount">-{{ formatCurrency(invoiceData.specialDiscount) }}</span>
        </div>
        <div v-if="invoiceData.specialAddition" class="summary-row">
          <span class="summary-label">Special Addition</span>
          <span class="summary-value addition">+{{ formatCurrency(invoiceData.specialAddition) }}</span>
        </div>
        <div v-if="invoiceData.freightAndInsurance" class="summary-row">
          <span class="summary-label">Freight & Insurance</span>
          <span class="summary-value">{{ formatCurrency(invoiceData.freightAndInsurance) }}</span>
        </div>
        <div class="summary-divider"></div>
        <div class="summary-row">
          <span class="summary-label">ยอดรวมก่อน VAT</span>
          <span class="summary-value">{{ formatCurrency(totalBeforeVat) }}</span>
        </div>
        <div v-if="invoiceData.vatPercent" class="summary-row">
          <span class="summary-label">VAT ({{ invoiceData.vatPercent }}%)</span>
          <span class="summary-value">{{ formatCurrency(vatAmount) }}</span>
        </div>
        <div class="summary-divider"></div>
        <div class="summary-row total">
          <span class="summary-label">C.I.F (Grand Total)</span>
          <span class="summary-value">{{ formatCurrency(grandTotal) }} {{ displayCurrency }}</span>
        </div>
      </div>

      <!-- Payment Info -->
      <div v-if="invoiceData.paymentName" class="info-card mobile-mt-2">
        <div class="card-header">
          <i class="bi bi-credit-card"></i>
          <span>ข้อมูลการชำระเงิน</span>
        </div>
        <div class="card-body">
          <div class="info-row">
            <span class="info-label">วิธีชำระ:</span>
            <span class="info-value">{{ invoiceData.paymentName }}</span>
          </div>
          <div v-if="invoiceData.paymentDay" class="info-row">
            <span class="info-label">ระยะเวลา:</span>
            <span class="info-value">{{ invoiceData.paymentDay }} วัน</span>
          </div>
          <div v-if="invoiceData.deposit" class="info-row">
            <span class="info-label">มัดจำ:</span>
            <span class="info-value">{{ formatCurrency(invoiceData.deposit) }} {{ displayCurrency }}</span>
          </div>
        </div>
      </div>

      <!-- Remark -->
      <div v-if="invoiceData.remark" class="info-card mobile-mt-2">
        <div class="card-header">
          <i class="bi bi-chat-left-text"></i>
          <span>หมายเหตุ</span>
        </div>
        <div class="card-body">
          <div class="remark-text">{{ invoiceData.remark }}</div>
        </div>
      </div>

      <!-- Print Customization Form (inline) -->
      <div v-if="showPrintForm" class="print-form-card mobile-mt-2">
        <div class="card-header">
          <i class="bi bi-printer"></i>
          <span>ตั้งค่าการพิมพ์</span>
        </div>
        <div class="card-body">
          <div class="print-note">
            การเปลี่ยนแปลงมีผลเฉพาะเอกสารที่พิมพ์ ข้อมูลต้นฉบับไม่เปลี่ยน
          </div>
          <div class="mobile-form-group">
            <label class="form-label">Invoice Number</label>
            <input
              v-model="printInvoiceNumber"
              type="text"
              class="form-control"
            />
          </div>
          <div class="mobile-form-group">
            <label class="form-label">Invoice Date</label>
            <input
              v-model="printInvoiceDate"
              type="date"
              class="form-control"
            />
          </div>
          <div class="print-form-actions">
            <button
              class="mobile-btn mobile-btn-primary"
              @click="generatePDF"
              :disabled="exportingPDF"
            >
              <i class="bi" :class="exportingPDF ? 'bi-hourglass-split spin-icon' : 'bi-file-pdf'"></i>
              {{ exportingPDF ? 'กำลังสร้าง PDF...' : 'พิมพ์เอกสาร' }}
            </button>
            <button class="mobile-btn mobile-btn-outline" @click="showPrintForm = false">
              <i class="bi bi-x-circle"></i>
              ยกเลิก
            </button>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="action-buttons mobile-mt-3">
        <button
          v-if="!showPrintForm"
          class="mobile-btn mobile-btn-primary"
          @click="openPrintForm"
        >
          <i class="bi bi-printer"></i>
          พิมพ์ Invoice
        </button>
        <button class="mobile-btn mobile-btn-outline" @click="$router.back()">
          <i class="bi bi-arrow-left"></i>
          ย้อนกลับ
        </button>
      </div>
    </div>

    <!-- Error State -->
    <div v-else class="mobile-container mobile-mt-2">
      <div class="mobile-empty-state">
        <i class="bi bi-exclamation-circle"></i>
        <div class="empty-title">ไม่พบข้อมูล</div>
        <div class="empty-subtitle">ไม่สามารถโหลดข้อมูล Invoice ได้</div>
        <button class="mobile-btn mobile-btn-primary mobile-mt-2" @click="loadInvoiceData">
          <i class="bi bi-arrow-clockwise"></i>
          ลองอีกครั้ง
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { useInvoiceApiStore } from '@/stores/modules/api/sale/invoice-store.js'
import { usrSaleOrderApiStore } from '@/stores/modules/api/sale/sale-order-store.js'
import { invoicePdfService } from '@/services/helper/pdf/invoice/invoice-pdf-integration.js'
import { success, error } from '@/services/alert/sweetAlerts.js'
import SoItemCard from './components/so-item-card.vue'
import dayjs from 'dayjs'

export default {
  name: 'MobileInvoiceDetailView',

  components: {
    SoItemCard
  },

  setup() {
    const invoiceStore = useInvoiceApiStore()
    const saleOrderStore = usrSaleOrderApiStore()
    return { invoiceStore, saleOrderStore }
  },

  data() {
    return {
      invoiceData: null,
      invoiceItems: [],
      soData: null,
      // Print form
      showPrintForm: false,
      printInvoiceNumber: '',
      printInvoiceDate: '',
      exportingPDF: false
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
    }
  },

  mounted() {
    this.loadInvoiceData()
  },

  methods: {
    async loadInvoiceData() {
      this.invoiceData = null
      this.invoiceItems = []

      // 1. Get Invoice data
      const invoiceResponse = await this.invoiceStore.fetchGet({
        formValue: { invoiceNumber: this.invoiceNumber }
      })

      if (!invoiceResponse) return

      // 2. Get Sale Order data (for items + stockConfirm)
      const soResponse = await this.saleOrderStore.fetchGet({
        formValue: { soNumber: invoiceResponse.soNumber }
      })

      if (!soResponse) return

      this.soData = soResponse

      // Set invoice data
      this.invoiceData = {
        ...invoiceResponse,
        vatPercent: invoiceResponse.vat || 0,
        // Currency from SO
        currencyUnit: soResponse.currencyUnit || invoiceResponse.currencyUnit || 'THB',
        currencyRate: soResponse.currencyRate || invoiceResponse.currencyRate || 1
      }

      // 3. Parse SO data → items
      let parsedData = null
      if (soResponse.data && typeof soResponse.data === 'string') {
        try {
          parsedData = JSON.parse(soResponse.data)
        } catch (e) {
          console.error('Error parsing SO data:', e)
        }
      } else if (soResponse.data && typeof soResponse.data === 'object') {
        parsedData = soResponse.data
      }

      if (!parsedData) return

      let stockItems = []
      if (parsedData.stockItems || parsedData.copyItems) {
        stockItems = parsedData.stockItems || []
      } else if (Array.isArray(parsedData.allItems)) {
        stockItems = parsedData.allItems.filter((item) => item.stockNumber != null)
      } else if (Array.isArray(parsedData)) {
        stockItems = parsedData.filter((item) => item.stockNumber != null)
      }

      // 4. Filter: only items that are in confirmedItems
      const confirmedItems = invoiceResponse.confirmedItems || []
      this.invoiceItems = stockItems.filter((item) => {
        return confirmedItems.some((ci) => ci.stockNumber === item.stockNumber)
      })

      // 5. Map stockConfirm → set id, appraisalPrice, qty, discountPercent, isConfirm, isInvoice
      const stockConfirm = soResponse.stockConfirm || []
      this.invoiceItems.forEach((item) => {
        const confirmed = stockConfirm.find((c) => c.stockNumber === item.stockNumber)
        if (confirmed) {
          item.id = confirmed.id
          item.appraisalPrice = confirmed.priceOrigin
          item.qty = confirmed.qty
          item.discountPercent = confirmed.discount
          item.isConfirm = true
          item.isInvoice = true
        }
      })
    },

    // ==================== Print ====================
    openPrintForm() {
      this.printInvoiceNumber = this.invoiceData.invoiceNumber || ''
      this.printInvoiceDate = dayjs().format('YYYY-MM-DD')
      this.showPrintForm = true
    },

    async generatePDF() {
      this.exportingPDF = true
      try {
        const pdfData = {
          saleOrder: {
            soNumber: this.invoiceData.soNumber,
            date: this.invoiceData.createDate,
            specialDiscount: this.invoiceData.specialDiscount || 0,
            specialAddition: this.invoiceData.specialAddition || 0,
            freightAndInsurance: this.invoiceData.freightAndInsurance || 0,
            vatPercent: this.invoiceData.vatPercent || 0
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
          invoiceNo: this.printInvoiceNumber,
          invoiceDate: dayjs(this.printInvoiceDate),
          download: true
        }

        await invoicePdfService.generateInvoicePDF(pdfData, options)
        success('สร้าง PDF สำเร็จ', 'Invoice PDF')
        this.showPrintForm = false
      } catch (err) {
        console.error('Error generating PDF:', err)
        error(err.message || 'ไม่สามารถสร้าง PDF ได้', 'เกิดข้อผิดพลาด')
      } finally {
        this.exportingPDF = false
      }
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
  padding-bottom: 40px;
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
      font-size: 0.85rem;
      color: #666;
    }

    .summary-value {
      font-size: 0.85rem;
      font-weight: 600;
      color: #333;

      &.discount {
        color: #f44336;
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
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 2px solid var(--base-font-color);

  .print-note {
    font-size: 0.8rem;
    color: #999;
    background: #fff8e1;
    padding: 8px 12px;
    border-radius: 8px;
    margin-bottom: 16px;
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
      border: 1px solid #ddd;
      border-radius: 8px;
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
