<template>
  <div class="mobile-quotation-detail-view">
    <!-- Header with Back Button -->
    <div class="quotation-header">
      <div class="mobile-container">
        <button class="mobile-btn-icon" @click="goBack">
          <i class="bi bi-arrow-left"></i>
        </button>
        <div class="header-content">
          <h2 class="mobile-title">ใบเสนอราคา</h2>
          <p class="header-subtitle">{{ $route.params.number }}</p>
        </div>
        <button
          class="mobile-btn-icon"
          @click="handleExportPDF"
          :disabled="exportingPDF || !quotation"
        >
          <i class="bi" :class="exportingPDF ? 'bi-hourglass-split' : 'bi-file-pdf'"></i>
        </button>
      </div>
    </div>

    <!-- Quotation Details -->
    <div v-if="quotation" class="mobile-container mobile-mt-2">
      <!-- Quotation Info Card -->
      <div class="info-card">
        <div class="card-header">
          <i class="bi bi-file-earmark-text"></i>
          <span>ข้อมูลใบเสนอราคา</span>
        </div>
        <div class="card-body">
          <div class="info-row">
            <span class="info-label">เลขที่:</span>
            <span class="info-value highlight">{{ quotation.number }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">วันที่:</span>
            <span class="info-value">{{ formatDate(quotation.date) }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">สกุลเงิน:</span>
            <span class="info-value">{{ quotation.currency || 'THB' }}</span>
          </div>
          <div v-if="quotation.currencyRate" class="info-row">
            <span class="info-label">อัตราแลกเปลี่ยน:</span>
            <span class="info-value">{{ quotation.currencyRate }}</span>
          </div>
          <div v-if="quotation.remark" class="info-row remark-row">
            <span class="info-label">หมายเหตุ:</span>
            <span class="info-value">{{ quotation.remark }}</span>
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
          <div v-if="quotation.customerName" class="info-row">
            <span class="info-label">ชื่อลูกค้า:</span>
            <span class="info-value">{{ quotation.customerName }}</span>
          </div>
          <div v-if="quotation.customerPhone" class="info-row">
            <span class="info-label">เบอร์โทร:</span>
            <span class="info-value">{{ quotation.customerPhone }}</span>
          </div>
          <div v-if="quotation.customerEmail" class="info-row">
            <span class="info-label">อีเมล:</span>
            <span class="info-value">{{ quotation.customerEmail }}</span>
          </div>
          <div v-if="quotation.customerAddress" class="info-row remark-row">
            <span class="info-label">ที่อยู่:</span>
            <span class="info-value">{{ quotation.customerAddress }}</span>
          </div>
        </div>
      </div>

      <!-- Items Card -->
      <div v-if="items.length > 0" class="info-card mobile-mt-2">
        <div class="card-header">
          <i class="bi bi-box-seam"></i>
          <span>รายการสินค้า ({{ items.length }})</span>
        </div>
        <div class="items-list">
          <div v-for="(item, index) in items" :key="index" class="item-card">
            <div class="item-header">
              <span class="item-index">#{{ index + 1 }}</span>
              <span class="item-name">{{ item.productNumber || item.stockNumber || '-' }}</span>
            </div>
            <div v-if="item.description" class="item-description">{{ item.description }}</div>
            <div class="item-details">
              <div class="detail-row">
                <span class="detail-label">ราคา:</span>
                <span class="detail-value">{{ formatCurrency(item.appraisalPrice || item.productPrice || item.price || 0) }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">จำนวน:</span>
                <span class="detail-value">{{ item.qty || 1 }}</span>
              </div>
              <div v-if="item.discountPercent" class="detail-row">
                <span class="detail-label">ส่วนลด:</span>
                <span class="detail-value">{{ item.discountPercent }}%</span>
              </div>
              <div class="detail-row total">
                <span class="detail-label">รวม:</span>
                <span class="detail-value">{{ formatCurrency(calculateItemTotal(item)) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Price Summary Card -->
      <div class="summary-card mobile-mt-2">
        <div class="summary-header">
          <i class="bi bi-calculator"></i>
          <span>สรุปราคา</span>
        </div>
        <div class="summary-body">
          <div class="summary-row">
            <span>ยอดรวม ({{ displayCurrency }})</span>
            <span class="summary-value">{{ formatCurrency(displayTotal) }}</span>
          </div>
          <div v-if="hasCurrencyConversion" class="summary-row reference">
            <span>เทียบเท่า (THB)</span>
            <span class="summary-value">{{ formatCurrency(totalAmountTHB) }}</span>
          </div>
          <div v-if="quotation.specialDiscount" class="summary-row discount">
            <span>ส่วนลดพิเศษ</span>
            <span class="summary-value">-{{ formatCurrency(quotation.specialDiscount) }}</span>
          </div>
          <div v-if="quotation.specialAddition" class="summary-row addition">
            <span>ส่วนเพิ่มพิเศษ</span>
            <span class="summary-value">+{{ formatCurrency(quotation.specialAddition) }}</span>
          </div>
          <div v-if="quotation.freight" class="summary-row">
            <span>Freight</span>
            <span class="summary-value">{{ formatCurrency(quotation.freight) }}</span>
          </div>
          <div v-if="quotation.vat" class="summary-row">
            <span>VAT ({{ quotation.vat }}%)</span>
            <span class="summary-value">{{ formatCurrency(vatAmount) }}</span>
          </div>
          <div class="summary-row grand-total">
            <span>ยอดรวมทั้งหมด</span>
            <span class="summary-value">{{ formatCurrency(grandTotal) }} {{ displayCurrency }}</span>
          </div>
        </div>
      </div>

      <!-- Export PDF Button -->
      <div class="mobile-mt-3">
        <button
          class="mobile-btn mobile-btn-success mobile-btn-block"
          @click="handleExportPDF"
          :disabled="exportingPDF || !quotation"
        >
          <i
            class="bi"
            :class="exportingPDF ? 'bi-hourglass-split spin-icon' : 'bi-file-pdf'"
          ></i>
          <span>{{ exportingPDF ? 'กำลัง Export PDF...' : 'Export PDF' }}</span>
        </button>
      </div>
    </div>

    <!-- Error State -->
    <div v-else class="mobile-container mobile-mt-2">
      <div class="mobile-empty-state">
        <i class="bi bi-exclamation-circle"></i>
        <div class="empty-title">ไม่พบข้อมูล</div>
        <div class="empty-subtitle">ไม่สามารถโหลดข้อมูลใบเสนอราคาได้</div>
        <button class="mobile-btn mobile-btn-primary mobile-mt-2" @click="loadQuotation">
          <i class="bi bi-arrow-clockwise"></i>
          ลองอีกครั้ง
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { usrQuotationApiStore } from '@/stores/modules/api/sale/quotation-store.js'
import { generateInvoicePdf } from '@/services/helper/pdf/quotation/quotation-pdf-integration.js'
import { error } from '@/services/alert/sweetAlerts.js'
import dayjs from 'dayjs'

export default {
  name: 'MobileQuotationDetailView',

  setup() {
    const quotationStore = usrQuotationApiStore()
    return { quotationStore }
  },

  data() {
    return {
      quotation: null,
      items: [],
      exportingPDF: false
    }
  },

  computed: {
    hasCustomerInfo() {
      if (!this.quotation) return false
      return !!(
        this.quotation.customerName ||
        this.quotation.customerPhone ||
        this.quotation.customerEmail ||
        this.quotation.customerAddress
      )
    },

    currencyRate() {
      return this.quotation?.currencyRate || 1
    },

    displayCurrency() {
      return this.quotation?.currency || 'THB'
    },

    hasCurrencyConversion() {
      return this.currencyRate !== 1 && this.displayCurrency !== 'THB'
    },

    totalAmountTHB() {
      return this.items.reduce((sum, item) => sum + this.calculateItemTotal(item), 0)
    },

    displayTotal() {
      if (!this.hasCurrencyConversion) return this.totalAmountTHB
      return this.totalAmountTHB / this.currencyRate
    },

    totalAfterDiscountAndAddition() {
      return this.displayTotal - (this.quotation?.specialDiscount || 0) + (this.quotation?.specialAddition || 0)
    },

    totalWithFreight() {
      return this.totalAfterDiscountAndAddition + Number(this.quotation?.freight || 0)
    },

    vatAmount() {
      if (!this.quotation?.vat) return 0
      return this.totalWithFreight * (this.quotation.vat / 100)
    },

    grandTotal() {
      return this.totalWithFreight + this.vatAmount
    }
  },

  mounted() {
    this.loadQuotation()
  },

  methods: {
    async loadQuotation() {
      const number = this.$route.params.number

      const res = await this.quotationStore.fetchGet({
        formValue: { number }
      })

      if (res) {
        this.quotation = res
        this.items = res.data ? JSON.parse(res.data) : []
      }
    },

    calculateItemTotal(item) {
      const price = Number(item.appraisalPrice || item.productPrice || item.price || 0)
      const qty = Number(item.qty || 1)
      const discount = Number(item.discountPercent || 0)
      return price * qty * (1 - discount / 100)
    },

    async handleExportPDF() {
      if (!this.quotation) return

      this.exportingPDF = true
      try {
        const customer = {
          name: this.quotation.customerName || '',
          address: this.quotation.customerAddress || '',
          tel: this.quotation.customerPhone || '',
          email: this.quotation.customerEmail || '',
          note: this.quotation.remark || '',
          freight: this.quotation.freight || 0,
          discount: this.quotation.discount || 0,
          invoiceNumber: this.quotation.number || '',
          currencyUnit: this.quotation.currency || 'THB',
          currencyMultiplier: this.quotation.currencyRate || 1,
          specialDiscount: this.quotation.specialDiscount || 0,
          specialAddition: this.quotation.specialAddition || 0,
          vatPercent: this.quotation.vat || 0
        }

        await generateInvoicePdf({
          items: this.items,
          customer,
          invoiceDate: this.quotation.date ? new Date(this.quotation.date) : new Date(),
          filename: `Quotation_${this.quotation.number}_${dayjs().format('YYYYMMDDHHmmss')}.pdf`,
          openInNewTab: false
        })
      } catch (err) {
        console.error('Error exporting PDF:', err)
        error(err.message || 'เกิดข้อผิดพลาดในการ Export PDF', 'ข้อผิดพลาด')
      } finally {
        this.exportingPDF = false
      }
    },

    goBack() {
      this.$router.back()
    },

    formatDate(dateString) {
      if (!dateString) return '-'
      return dayjs(dateString).format('DD/MM/YYYY')
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

.mobile-quotation-detail-view {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: calc(80px + env(safe-area-inset-bottom, 0px));
}

.quotation-header {
  background: linear-gradient(
    135deg,
    var(--base-font-color) 0%,
    var(--base-font-sub-color) 100%
  );
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
  min-width: 110px;
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

// Items list
.items-list {
  .item-card {
    padding: 12px 16px;
    border-bottom: 1px solid #f0f0f0;

    &:last-child {
      border-bottom: none;
    }

    .item-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 4px;

      .item-index {
        font-size: 0.75rem;
        color: white;
        background: var(--base-font-color);
        padding: 2px 8px;
        border-radius: 10px;
        font-weight: 600;
      }

      .item-name {
        font-size: 0.9rem;
        font-weight: 600;
        color: #333;
      }
    }

    .item-description {
      font-size: 0.8rem;
      color: #666;
      margin-bottom: 8px;
      padding-left: 4px;
    }

    .item-details {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 4px 16px;

      .detail-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 0.8rem;

        .detail-label {
          color: #666;
        }

        .detail-value {
          font-weight: 500;
          color: #333;
        }

        &.total {
          grid-column: 1 / -1;
          padding-top: 6px;
          margin-top: 4px;
          border-top: 1px solid #f0f0f0;

          .detail-label {
            font-weight: 600;
            color: #333;
          }

          .detail-value {
            font-weight: 700;
            color: var(--base-font-color);
            font-size: 0.9rem;
          }
        }
      }
    }
  }
}

// Summary card
.summary-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

  .summary-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    background: linear-gradient(135deg, var(--base-green) 0%, #026266 100%);
    color: white;
    font-weight: 600;
    font-size: 0.95rem;

    i {
      font-size: 1.1rem;
    }
  }

  .summary-body {
    padding: 16px;

    .summary-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 6px 0;
      font-size: 0.85rem;
      color: #333;

      .summary-value {
        font-weight: 600;
      }

      &.reference {
        color: #999;
        font-size: 0.8rem;
        border-bottom: 1px solid #f0f0f0;
        padding-bottom: 8px;
        margin-bottom: 4px;
      }

      &.discount {
        color: #f44336;
      }

      &.addition {
        color: #4caf50;
      }

      &.grand-total {
        border-top: 2px solid var(--base-font-color);
        margin-top: 8px;
        padding-top: 10px;
        font-size: 1rem;
        font-weight: 700;
        color: var(--base-font-color);

        .summary-value {
          font-size: 1.1rem;
        }
      }
    }
  }
}

// Button styling
.mobile-btn-block {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  i {
    font-size: 1.1rem;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.spin-icon {
  animation: spin 2s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
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
