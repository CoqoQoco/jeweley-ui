<template>
  <div class="invoice-form-section">
    <!-- Header -->
    <div class="form-section-header">
      <i class="bi bi-file-earmark-check"></i>
      <span>สร้าง Invoice</span>
    </div>

    <!-- DK Invoice Number -->
    <div class="info-card mobile-mt-2">
      <div class="card-header">
        <i class="bi bi-hash"></i>
        <span>Invoice No. (DK)</span>
      </div>
      <div class="card-body">
        <input
          v-model.trim="dkInvoiceNumber"
          type="text"
          class="form-control"
          placeholder="ระบุเลข Invoice (ไม่บังคับ)"
          autocomplete="off"
        />
      </div>
    </div>

    <!-- Item Selection -->
    <div class="info-card mobile-mt-2">
      <div class="card-header">
        <i class="bi bi-box-seam"></i>
        <span>เลือกสินค้า</span>
        <span class="header-badge">{{ selectedItems.length }}/{{ availableItems.length }}</span>
      </div>
      <div class="card-body">
        <!-- Select All -->
        <label class="select-all-row" @click.prevent="toggleSelectAll">
          <input
            type="checkbox"
            :checked="isAllSelected"
            :disabled="availableItems.length === 0"
          />
          <span>เลือกทั้งหมด ({{ availableItems.length }} รายการ)</span>
        </label>

        <!-- Item Cards with Checkbox -->
        <div
          v-for="item in availableItems"
          :key="item.stockNumber"
          class="selectable-item"
          :class="{ selected: selectedItems.includes(item.stockNumber) }"
          @click="toggleItem(item)"
        >
          <input
            type="checkbox"
            :checked="selectedItems.includes(item.stockNumber)"
            @click.stop
            @change="toggleItem(item)"
          />
          <div class="item-content">
            <div class="item-main">
              <span class="item-number">{{ item.stockNumber }}</span>
              <span v-if="item.description" class="item-desc">{{ item.description }}</span>
            </div>
            <div class="item-price-info">
              <span class="item-price-thb">{{ formatCurrency(getAppraisalPrice(item)) }} บาท</span>
              <span v-if="Number(item.discountPercent) > 0" class="item-discount">-{{ item.discountPercent }}%</span>
              <span class="item-qty">x{{ item.qty || 1 }}</span>
            </div>
            <div class="item-total-row">
              <span class="item-total-label">รวม</span>
              <span class="item-total-value">{{ formatCurrency(getItemTotalConverted(item)) }} {{ displayCurrency }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Financial Summary -->
    <div class="info-card mobile-mt-2">
      <div class="card-header">
        <i class="bi bi-calculator"></i>
        <span>สรุปราคา ({{ displayCurrency }})</span>
      </div>
      <div class="card-body">
        <!-- Subtotal (F.O.B Bangkok) -->
        <div class="summary-row">
          <span class="summary-label">F.O.B Bangkok (รวมสินค้า)</span>
          <span class="summary-value">{{ formatCurrency(totalSelectedAmount) }}</span>
        </div>

        <!-- Special Discount -->
        <div class="summary-input-row">
          <span class="summary-label">ส่วนลดพิเศษ</span>
          <input
            v-model.number="specialDiscount"
            type="number"
            class="form-control summary-input"
            min="0"
            step="0.01"
            placeholder="0.00"
          />
        </div>

        <!-- Special Addition -->
        <div class="summary-input-row">
          <span class="summary-label">ส่วนเพิ่มพิเศษ</span>
          <input
            v-model.number="specialAddition"
            type="number"
            class="form-control summary-input"
            min="0"
            step="0.01"
            placeholder="0.00"
          />
        </div>

        <div class="summary-divider"></div>

        <!-- Total After Discount & Addition -->
        <div class="summary-row bold">
          <span class="summary-label">ยอดรวมหลังปรับ</span>
          <span class="summary-value">{{ formatCurrency(totalAfterDiscountAndAddition) }}</span>
        </div>

        <!-- Freight & Insurance -->
        <div class="summary-input-row">
          <span class="summary-label">Freight & Insurance</span>
          <input
            v-model.number="freightAndInsurance"
            type="number"
            class="form-control summary-input"
            min="0"
            step="0.01"
            placeholder="0.00"
          />
        </div>

        <div class="summary-divider"></div>

        <!-- Total Before VAT -->
        <div class="summary-row bold">
          <span class="summary-label">ยอดรวมก่อน VAT</span>
          <span class="summary-value">{{ formatCurrency(totalBeforeVat) }}</span>
        </div>

        <!-- VAT -->
        <div class="summary-input-row">
          <span class="summary-label">VAT (%)</span>
          <input
            v-model.number="vatPercent"
            type="number"
            class="form-control summary-input"
            min="0"
            max="100"
            step="0.01"
            placeholder="0"
          />
        </div>

        <div class="summary-row">
          <span class="summary-label">จำนวนเงิน VAT</span>
          <span class="summary-value">{{ formatCurrency(vatAmount) }}</span>
        </div>

        <div class="summary-divider"></div>

        <!-- Grand Total -->
        <div class="summary-row grand-total">
          <span class="summary-label">ยอดรวม Invoice</span>
          <span class="summary-value">{{ formatCurrency(grandTotal) }} {{ displayCurrency }}</span>
        </div>
      </div>
    </div>

    <!-- Payment Info -->
    <div class="info-card mobile-mt-2">
      <div class="card-header">
        <i class="bi bi-credit-card"></i>
        <span>ข้อมูลการชำระเงิน</span>
      </div>
      <div class="card-body">
        <!-- Payment Method -->
        <div class="mobile-form-group">
          <label class="form-label">วิธีการชำระเงิน</label>
          <select v-model="paymentMethod" class="form-control">
            <option v-for="opt in paymentMethodOptions" :key="opt.value" :value="opt.value">
              {{ opt.name }}
            </option>
          </select>
        </div>

        <!-- Payment Days -->
        <div class="mobile-form-group">
          <label class="form-label">ระยะเวลาการชำระเงิน (วัน)</label>
          <input
            v-model.number="paymentDays"
            type="number"
            class="form-control"
            min="0"
            step="1"
            placeholder="0"
            :disabled="paymentMethod === 'cash'"
          />
          <small v-if="paymentMethod === 'cash'" class="form-hint">ชำระทันที</small>
        </div>

        <!-- Deposit -->
        <div class="mobile-form-group">
          <label class="form-label">ราคามัดจำ ({{ displayCurrency }})</label>
          <input
            v-model.number="depositAmount"
            type="number"
            class="form-control"
            min="0"
            step="0.01"
            placeholder="0.00"
          />
        </div>

        <div class="summary-divider"></div>

        <!-- Remaining -->
        <div class="summary-row bold">
          <span class="summary-label">ยอดคงเหลือที่ต้องชำระ</span>
          <span class="summary-value">{{ formatCurrency(grandTotal - (depositAmount || 0)) }} {{ displayCurrency }}</span>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="action-buttons mobile-mt-3">
      <button
        class="mobile-btn mobile-btn-success"
        @click="handleCreateInvoice"
        :disabled="selectedItems.length === 0"
      >
        <i class="bi bi-file-earmark-check"></i>
        สร้าง Invoice ({{ selectedItems.length }} รายการ)
      </button>
      <button class="mobile-btn mobile-btn-outline" @click="$emit('cancel')">
        <i class="bi bi-x-circle"></i>
        ยกเลิก
      </button>
    </div>
  </div>
</template>

<script>
import { usrSaleOrderApiStore } from '@/stores/modules/api/sale/sale-order-store.js'
import { useInvoiceApiStore } from '@/stores/modules/api/sale/invoice-store.js'
import { success, error, warning, confirmSubmit } from '@/services/alert/sweetAlerts.js'

export default {
  name: 'InvoiceCreationForm',

  props: {
    soData: {
      type: Object,
      required: true
    },
    stockItems: {
      type: Array,
      default: () => []
    }
  },

  emits: ['invoice-created', 'cancel'],

  setup() {
    const saleOrderStore = usrSaleOrderApiStore()
    const invoiceStore = useInvoiceApiStore()
    return { saleOrderStore, invoiceStore }
  },

  data() {
    return {
      selectedItems: [],
      specialDiscount: 0,
      specialAddition: 0,
      freightAndInsurance: 0,
      vatPercent: 0,
      depositAmount: 0,
      paymentMethod: 'cash',
      paymentDays: 0,
      dkInvoiceNumber: null,
      paymentMethodOptions: [
        { name: 'เงินสด (Cash)', value: 'cash', id: 1 },
        { name: 'โอนเงิน (Transfer)', value: 'transfer', id: 2 },
        { name: 'เช็ค (Cheque)', value: 'cheque', id: 3 },
        { name: 'บัตรเครดิต (Credit Card)', value: 'credit_card', id: 4 },
        { name: 'เครดิต (Credit Term)', value: 'credit_term', id: 5 }
      ]
    }
  },

  computed: {
    currencyRate() {
      return Number(this.soData?.currencyRate) || 1
    },

    displayCurrency() {
      return this.soData?.currencyUnit || 'THB'
    },

    availableItems() {
      return this.stockItems.filter(item => item.stockNumber && !item.isInvoice)
    },

    isAllSelected() {
      return this.availableItems.length > 0 && this.selectedItems.length === this.availableItems.length
    },

    // ยอดรวมสินค้าที่เลือก (แปลงสกุลเงินแล้ว)
    totalSelectedAmount() {
      const selected = this.stockItems.filter(item => this.selectedItems.includes(item.stockNumber))
      return selected.reduce((sum, item) => sum + this.getItemTotalConverted(item), 0)
    },

    // ยอดรวมหลังหักส่วนลดพิเศษและเพิ่มส่วนพิเศษ
    totalAfterDiscountAndAddition() {
      return this.totalSelectedAmount - Number(this.specialDiscount || 0) + Number(this.specialAddition || 0)
    },

    // ยอดรวมก่อน VAT (รวม Freight & Insurance)
    totalBeforeVat() {
      return this.totalAfterDiscountAndAddition + Number(this.freightAndInsurance || 0)
    },

    // คำนวณ VAT
    vatAmount() {
      return (this.totalBeforeVat * Number(this.vatPercent || 0)) / 100
    },

    // ยอดรวมสุดท้าย
    grandTotal() {
      return this.totalBeforeVat + this.vatAmount
    }
  },

  mounted() {
    // Auto-select all available items
    this.selectedItems = this.availableItems.map(item => item.stockNumber)
  },

  methods: {
    getAppraisalPrice(item) {
      return Number(item.appraisalPrice) || Number(item.price) || 0
    },

    // ราคารวมต่อรายการ (แปลงสกุลเงินแล้ว)
    getItemTotalConverted(item) {
      const appraisalPrice = this.getAppraisalPrice(item)
      const discountPercent = Number(item.discountPercent) || 0
      const qty = Number(item.qty) || 1
      const priceAfterDiscount = appraisalPrice * (1 - discountPercent / 100)
      return (priceAfterDiscount / this.currencyRate) * qty
    },

    toggleSelectAll() {
      if (this.isAllSelected) {
        this.selectedItems = []
      } else {
        this.selectedItems = this.availableItems.map(item => item.stockNumber)
      }
    },

    toggleItem(item) {
      const index = this.selectedItems.indexOf(item.stockNumber)
      if (index > -1) {
        this.selectedItems.splice(index, 1)
      } else {
        this.selectedItems.push(item.stockNumber)
      }
    },

    handleCreateInvoice() {
      if (this.selectedItems.length === 0) {
        warning('กรุณาเลือกสินค้าอย่างน้อย 1 รายการ')
        return
      }

      confirmSubmit(
        `ยืนยันสร้าง Invoice ${this.selectedItems.length} รายการ?`,
        'สร้าง Invoice',
        async () => {
          await this.createInvoice()
        }
      )
    },

    async createInvoice() {
      const selectedStockItems = this.stockItems.filter(item =>
        this.selectedItems.includes(item.stockNumber)
      )

      // Confirm unconfirmed items first
      const unconfirmedItems = selectedStockItems.filter(item => !item.isConfirm)
      if (unconfirmedItems.length > 0) {
        const confirmResult = await this.saleOrderStore.confirmStockItems({
          soNumber: this.soData.soNumber,
          stockItems: unconfirmedItems.map(item => ({
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

      const currencyUnit = this.soData.currencyUnit || 'THB'
      const currencyRate = this.currencyRate

      const invoiceItems = selectedStockItems.map(item => {
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

      const paymentOption = this.paymentMethodOptions.find(pm => pm.value === this.paymentMethod)

      const invoiceResult = await this.invoiceStore.fetchCreate({
        formValue: {
          soNumber: this.soData.soNumber,
          dkInvoiceNumber: this.dkInvoiceNumber || null,
          customerCode: this.soData.customerCode || null,
          customerName: this.soData.customerName || null,
          customerAddress: this.soData.customerAddress || '',
          customerTel: this.soData.customerTel || '',
          customerEmail: this.soData.customerEmail || '',
          customerRemark: '',
          currencyUnit: currencyUnit,
          currencyRate: currencyRate,
          deliveryDate: null,
          deposit: this.depositAmount || 0,
          specialDiscount: this.specialDiscount || 0,
          specialAddition: this.specialAddition || 0,
          freightAndInsurance: this.freightAndInsurance || 0,
          vat: this.vatPercent || 0,
          goldRate: 0,
          markup: 0,
          payment: paymentOption?.id || 1,
          paymentName: paymentOption?.name || 'เงินสด (Cash)',
          paymentDay: this.paymentDays || 0,
          priority: this.soData.priority || 'mobile',
          refQuotation: '',
          remark: this.soData.remark || '',
          items: invoiceItems
        }
      })

      if (invoiceResult) {
        const invoiceNumber = invoiceResult.invoiceNumber || invoiceResult
        success(`เลขที่ Invoice: ${invoiceNumber}`, 'ออก Invoice สำเร็จ')
        this.$emit('invoice-created', invoiceResult)
      }
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

.invoice-form-section {
  padding-bottom: 20px;
}

.form-section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--base-font-color);

  i {
    font-size: 1.2rem;
  }
}

// ==================== Info Card ====================
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

  .header-badge {
    margin-left: auto;
    padding: 2px 10px;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 600;
    background: var(--base-font-color);
    color: white;
  }
}

.card-body {
  padding: 16px;
}

// ==================== Item Selection ====================
.select-all-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 12px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  color: #333;

  input[type='checkbox'] {
    width: 18px;
    height: 18px;
    accent-color: var(--base-font-color);
    cursor: pointer;
  }
}

.selectable-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px;
  border: 1.5px solid #e8e8e8;
  border-radius: 10px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.15s ease;

  &:last-child {
    margin-bottom: 0;
  }

  &.selected {
    border-color: var(--base-font-color);
    background: rgba(146, 19, 19, 0.03);
  }

  input[type='checkbox'] {
    width: 18px;
    height: 18px;
    margin-top: 2px;
    accent-color: var(--base-font-color);
    cursor: pointer;
    flex-shrink: 0;
  }

  .item-content {
    flex: 1;
    min-width: 0;
  }

  .item-main {
    display: flex;
    flex-direction: column;
    margin-bottom: 6px;

    .item-number {
      font-weight: 600;
      color: var(--base-font-color);
      font-size: 0.9rem;
    }

    .item-desc {
      font-size: 0.8rem;
      color: #666;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .item-price-info {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
    font-size: 0.8rem;
    color: #888;

    .item-discount {
      color: #f44336;
      font-weight: 500;
    }
  }

  .item-total-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 4px;
    border-top: 1px solid #f0f0f0;

    .item-total-label {
      font-size: 0.8rem;
      color: #666;
    }

    .item-total-value {
      font-size: 0.9rem;
      font-weight: 700;
      color: var(--base-font-color);
    }
  }
}

// ==================== Summary ====================
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
    font-size: 0.9rem;
    font-weight: 600;
    color: #333;
  }

  &.bold {
    .summary-label {
      font-weight: 600;
      color: #333;
    }

    .summary-value {
      font-weight: 700;
    }
  }

  &.grand-total {
    padding: 10px 0 4px;

    .summary-label {
      font-size: 1rem;
      font-weight: 700;
      color: var(--base-font-color);
    }

    .summary-value {
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--base-font-color);
    }
  }
}

.summary-input-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;

  .summary-label {
    font-size: 0.85rem;
    color: #666;
    flex-shrink: 0;
  }

  .summary-input {
    width: 120px;
    text-align: right;
    font-size: 0.9rem;
    padding: 4px 8px;
    border-radius: 6px;
    background-color: #f0faf7;
  }
}

.summary-divider {
  height: 1px;
  background: #e8e8e8;
  margin: 8px 0;
}

// ==================== Payment Form ====================
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
    background: white;

    &:focus {
      border-color: var(--base-font-color);
      outline: none;
      box-shadow: 0 0 0 2px rgba(146, 19, 19, 0.1);
    }

    &:disabled {
      background: #f5f5f5;
      color: #999;
    }
  }

  select.form-control {
    appearance: auto;
  }

  .form-hint {
    display: block;
    font-size: 0.75rem;
    color: #999;
    margin-top: 4px;
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

  .mobile-btn-success {
    background: var(--base-green, #4caf50);
    color: white;
    border: none;
    padding: 12px 16px;
    border-radius: 8px;
    font-size: 0.95rem;
    font-weight: 600;
    cursor: pointer;

    &:active:not(:disabled) {
      opacity: 0.9;
    }
  }
}
</style>
