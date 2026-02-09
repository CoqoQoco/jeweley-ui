<template>
  <div class="invoice-view">
    <!-- Invoice Information Section -->
    <div class="card-container">
      <div class="card-header">
        <h6 class="mb-0">ข้อมูลใบแจ้งหนี้</h6>
      </div>
      <div class="card-body">
        <div class="form-col-container">
          <!-- Invoice Number -->
          <div>
            <span class="title-text">เลขที่ใบแจ้งหนี้</span>
            <input
              :class="['form-control bg-input']"
              type="text"
              v-model.trim="formInvoice.number"
              placeholder="INV-2025-001"
            />
          </div>

          <!-- Invoice Date -->
          <div>
            <span class="title-text">วันที่ใบแจ้งหนี้</span>
            <Calendar
              class="w-100"
              v-model="formInvoice.invoiceDate"
              showIcon
              :manualInput="false"
              placeholder="เลือกวันที่"
              dateFormat="dd/mm/yy"
            />
          </div>

          <!-- Due Date -->
          <div>
            <span class="title-text">วันที่ครบกำหนด</span>
            <Calendar
              class="w-100"
              v-model="formInvoice.dueDate"
              showIcon
              :manualInput="false"
              placeholder="เลือกวันที่ครบกำหนด"
              dateFormat="dd/mm/yy"
            />
          </div>

          <!-- Payment Terms -->
          <div>
            <span class="title-text">เงื่อนไขการชำระ</span>
            <Dropdown
              v-model="formInvoice.paymentTerms"
              :options="paymentTermsOptions"
              optionLabel="name"
              optionValue="value"
              placeholder="เลือกเงื่อนไขการชำระ"
              class="w-100"
              @change="onPaymentTermsChange"
            />
          </div>
        </div>

        <div class="form-col-container mt-2">
          <!-- Tax Rate -->
          <div>
            <span class="title-text">อัตราภาษี (%)</span>
            <input
              :class="['form-control bg-input']"
              type="number"
              min="0"
              max="100"
              step="0.01"
              v-model.number="formInvoice.taxRate"
              placeholder="7.00"
              @input="calculateTotal"
            />
          </div>

          <!-- Discount Rate -->
          <div>
            <span class="title-text">ส่วนลด (%)</span>
            <input
              :class="['form-control bg-input']"
              type="number"
              min="0"
              max="100"
              step="0.01"
              v-model.number="formInvoice.discountRate"
              placeholder="0.00"
              @input="calculateTotal"
            />
          </div>

          <!-- Shipping Cost -->
          <div>
            <span class="title-text">ค่าจัดส่ง</span>
            <input
              :class="['form-control bg-input']"
              type="number"
              min="0"
              step="0.01"
              v-model.number="formInvoice.shippingCost"
              placeholder="0.00"
              @input="calculateTotal"
            />
          </div>

          <!-- Status -->
          <div>
            <span class="title-text">สถานะ</span>
            <Dropdown
              v-model="formInvoice.status"
              :options="statusOptions"
              optionLabel="name"
              optionValue="value"
              placeholder="เลือกสถานะ"
              class="w-100"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Delivery Note Information -->
    <div class="card-container mt-3" v-if="deliveryNoteData && deliveryNoteData.number">
      <div class="card-header">
        <h6 class="mb-0">ข้อมูลจากใบส่งของ</h6>
      </div>
      <div class="card-body">
        <div class="delivery-note-info">
          <div class="info-row">
            <strong>เลขที่ใบส่งของ:</strong> {{ deliveryNoteData.number }}
          </div>
          <div class="info-row">
            <strong>เลขที่ใบสั่งขาย:</strong> {{ deliveryNoteData.saleOrderNumber }}
          </div>
          <div class="info-row">
            <strong>ลูกค้า:</strong> {{ deliveryNoteData.customerName }}
          </div>
          <div class="info-row">
            <strong>มูลค่าสินค้า:</strong> {{ formatCurrency(deliveryNoteData.totalValue || 0) }}
          </div>
          <div class="info-row" v-if="deliveryNoteData.depositRequired && deliveryNoteData.depositAmount > 0">
            <strong>เงินมัดจำ:</strong> {{ formatCurrency(deliveryNoteData.depositAmount) }}
          </div>
        </div>
      </div>
    </div>

    <!-- Invoice Summary -->
    <div class="card-container mt-3">
      <div class="card-header">
        <h6 class="mb-0">สรุปใบแจ้งหนี้</h6>
      </div>
      <div class="card-body">
        <div class="invoice-summary">
          <div class="summary-row">
            <span>มูลค่าสินค้า:</span>
            <span class="amount">{{ formatCurrency(subtotal) }}</span>
          </div>
          <div class="summary-row" v-if="discountAmount > 0">
            <span>ส่วนลด ({{ formInvoice.discountRate || 0 }}%):</span>
            <span class="amount text-success">-{{ formatCurrency(discountAmount) }}</span>
          </div>
          <div class="summary-row" v-if="formInvoice.shippingCost > 0">
            <span>ค่าจัดส่ง:</span>
            <span class="amount">{{ formatCurrency(formInvoice.shippingCost || 0) }}</span>
          </div>
          <div class="summary-row">
            <span>ยอดก่อนภาษี:</span>
            <span class="amount">{{ formatCurrency(totalBeforeTax) }}</span>
          </div>
          <div class="summary-row">
            <span>ภาษี ({{ formInvoice.taxRate || 0 }}%):</span>
            <span class="amount">{{ formatCurrency(taxAmount) }}</span>
          </div>
          <div class="summary-row total-row">
            <span class="h5 font-weight-bold">ยอดรวมสุทธิ:</span>
            <span class="h5 font-weight-bold text-primary">{{ formatCurrency(grandTotal) }}</span>
          </div>
        </div>

        <!-- Remarks -->
        <div class="mt-3">
          <span class="title-text">หมายเหตุ</span>
          <textarea
            class="form-control"
            rows="3"
            v-model="formInvoice.remark"
            placeholder="หมายเหตุเพิ่มเติม..."
          ></textarea>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="btn-submit-container mt-3">
      <button
        class="btn btn-outline-secondary mr-2"
        type="button"
        @click="saveDraft"
        :disabled="loading"
      >
        <i class="bi bi-file-earmark mr-1"></i>
        บันทึกร่าง
      </button>
      
      <button
        class="btn btn-success mr-2"
        type="button"
        @click="confirmInvoice"
        :disabled="loading || !deliveryNoteData.number"
      >
        <i class="bi bi-check-circle mr-1"></i>
        ยืนยันใบแจ้งหนี้
      </button>

      <button
        class="btn btn-primary mr-2"
        type="button"
        @click="printInvoice"
        :disabled="formInvoice.status !== 'Confirmed'"
      >
        <i class="bi bi-printer mr-1"></i>
        พิมพ์ใบแจ้งหนี้
      </button>

      <button
        class="btn btn-info mr-2"
        type="button"
        @click="emailInvoice"
        :disabled="formInvoice.status !== 'Confirmed'"
      >
        <i class="bi bi-send mr-1"></i>
        ส่งอีเมล
      </button>

      <button
        class="btn btn-outline-danger mr-2"
        type="button"
        @click="cancelInvoice"
      >
        <i class="bi bi-x-circle mr-1"></i>
        ยกเลิก
      </button>
    </div>
  </div>
</template>

<script>
import Calendar from 'primevue/calendar'
import Dropdown from 'primevue/dropdown'
import { formatDecimal } from '@/services/utils/decimal.js'
import { success, error, confirmSubmit } from '@/services/alert/sweetAlerts.js'

export default {
  name: 'InvoiceView',

  components: {
    Calendar,
    Dropdown
  },

  emits: ['update:modelForm', 'update:modelDeliveryNote', 'save', 'confirm', 'print', 'email', 'cancel'],

  props: {
    modelForm: {
      type: Object,
      default: () => ({})
    },
    modelDeliveryNote: {
      type: Object,
      default: () => ({})
    }
  },

  data() {
    return {
      loading: false,
      
      formInvoice: {
        invoiceId: null,
        deliveryNoteId: null,
        number: '',
        invoiceDate: new Date(),
        dueDate: null,
        paymentTerms: 'cash',
        taxRate: 7,
        discountRate: 0,
        shippingCost: 0,
        status: 'Draft',
        remark: ''
      },

      deliveryNoteData: {},

      statusOptions: [
        { name: 'ร่าง', value: 'Draft' },
        { name: 'ยืนยันแล้ว', value: 'Confirmed' },
        { name: 'ส่งแล้ว', value: 'Sent' },
        { name: 'ชำระแล้ว', value: 'Paid' },
        { name: 'เลยกำหนด', value: 'Overdue' }
      ],

      paymentTermsOptions: [
        { name: 'เงินสด', value: 'cash' },
        { name: 'เครดิต 30 วัน', value: 'credit30' },
        { name: 'เครดิต 60 วัน', value: 'credit60' },
        { name: 'เครดิต 90 วัน', value: 'credit90' }
      ]
    }
  },

  computed: {
    subtotal() {
      return this.deliveryNoteData.totalValue || 0
    },

    discountAmount() {
      return this.subtotal * (this.formInvoice.discountRate || 0) / 100
    },

    totalBeforeTax() {
      return this.subtotal - this.discountAmount + (this.formInvoice.shippingCost || 0)
    },

    taxAmount() {
      return this.totalBeforeTax * (this.formInvoice.taxRate || 0) / 100
    },

    grandTotal() {
      return this.totalBeforeTax + this.taxAmount
    }
  },

  watch: {
    modelForm: {
      handler(newVal) {
        if (newVal && Object.keys(newVal).length > 0) {
          this.formInvoice = { ...this.formInvoice, ...newVal }
        }
      },
      deep: true,
      immediate: true
    },

    modelDeliveryNote: {
      handler(newVal) {
        if (newVal && Object.keys(newVal).length > 0) {
          this.deliveryNoteData = newVal
          this.calculateTotal()
        }
      },
      deep: true,
      immediate: true
    },

    formInvoice: {
      handler(newVal) {
        this.$emit('update:modelForm', newVal)
      },
      deep: true
    }
  },

  methods: {
    onPaymentTermsChange() {
      this.calculateDueDate()
    },

    calculateDueDate() {
      if (!this.formInvoice.invoiceDate) return

      const invoiceDate = new Date(this.formInvoice.invoiceDate)
      let daysToAdd = 0

      switch (this.formInvoice.paymentTerms) {
        case 'cash':
          daysToAdd = 0
          break
        case 'credit30':
          daysToAdd = 30
          break
        case 'credit60':
          daysToAdd = 60
          break
        case 'credit90':
          daysToAdd = 90
          break
      }

      const dueDate = new Date(invoiceDate)
      dueDate.setDate(dueDate.getDate() + daysToAdd)
      this.formInvoice.dueDate = dueDate
    },

    calculateTotal() {
      // Force reactivity update
      this.$forceUpdate()
    },

    async saveDraft() {
      try {
        this.loading = true

        const invoiceData = {
          ...this.formInvoice,
          status: 'Draft',
          subtotal: this.subtotal,
          discountAmount: this.discountAmount,
          taxAmount: this.taxAmount,
          grandTotal: this.grandTotal
        }

        console.log('Save invoice draft:', invoiceData)
        
        success('บันทึกร่างใบแจ้งหนี้เรียบร้อยแล้ว', 'บันทึกสำเร็จ')
        this.$emit('save', invoiceData)
      } catch (error) {
        console.error('Error saving draft:', error)
        error('เกิดข้อผิดพลาดในการบันทึก', 'บันทึกไม่สำเร็จ')
      } finally {
        this.loading = false
      }
    },

    async confirmInvoice() {
      if (!this.deliveryNoteData.number) {
        error('กรุณาเลือกใบส่งของก่อนยืนยันใบแจ้งหนี้', 'ไม่สามารถยืนยันได้')
        return
      }

      try {
        this.loading = true

        const invoiceData = {
          ...this.formInvoice,
          status: 'Confirmed',
          subtotal: this.subtotal,
          discountAmount: this.discountAmount,
          taxAmount: this.taxAmount,
          grandTotal: this.grandTotal
        }

        console.log('Confirm invoice:', invoiceData)
        
        success('ยืนยันใบแจ้งหนี้เรียบร้อยแล้ว', 'ยืนยันสำเร็จ')
        this.$emit('confirm', invoiceData)
      } catch (error) {
        console.error('Error confirming invoice:', error)
        error('เกิดข้อผิดพลาดในการยืนยัน', 'ยืนยันไม่สำเร็จ')
      } finally {
        this.loading = false
      }
    },

    printInvoice() {
      try {
        console.log('Print invoice:', this.formInvoice)
        success('กำลังสร้างไฟล์ PDF...', 'พิมพ์ใบแจ้งหนี้')
        this.$emit('print', this.formInvoice)
      } catch (error) {
        error('เกิดข้อผิดพลาดในการพิมพ์', 'พิมพ์ไม่สำเร็จ')
      }
    },

    emailInvoice() {
      try {
        console.log('Email invoice:', this.formInvoice)
        success('ส่งอีเมลใบแจ้งหนี้เรียบร้อยแล้ว', 'ส่งอีเมลสำเร็จ')
        this.$emit('email', this.formInvoice)
      } catch (error) {
        error('เกิดข้อผิดพลาดในการส่งอีเมล', 'ส่งอีเมลไม่สำเร็จ')
      }
    },

    cancelInvoice() {
      confirmSubmit(
        'คุณต้องการยกเลิกการสร้างใบแจ้งหนี้นี้หรือไม่?',
        'ยืนยันการยกเลิก',
        (result) => {
          if (result.isConfirmed) {
            this.$emit('cancel')
            success('ยกเลิกการสร้างใบแจ้งหนี้แล้ว', 'ยกเลิกแล้ว')
          }
        },
        {
          confirmText: 'ยกเลิก',
          cancelText: 'กลับ'
        },
        'question'
      )
    },

    formatCurrency(amount) {
      return formatDecimal(amount, 2) + ' THB'
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';

.invoice-view {
  margin-top: 1rem;
}

.card-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 1rem;
}

.card-header {
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  padding: 0.75rem 1rem;
  border-radius: 8px 8px 0 0;

  h6 {
    color: #495057;
    font-weight: 600;
  }
}

.card-body {
  padding: 1rem;
}

.delivery-note-info {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 6px;
  border-left: 4px solid #17a2b8;
}

.info-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.invoice-summary {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 6px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  &.total-row {
    border-top: 2px solid #007bff;
    padding-top: 0.75rem;
    margin-top: 0.75rem;
  }
}

.amount {
  font-weight: 600;
  min-width: 120px;
  text-align: right;
}

.text-success {
  color: #28a745 !important;
}

.text-primary {
  color: #007bff !important;
}

// Responsive design
@media (max-width: 768px) {
  .summary-row {
    font-size: 0.9rem;
  }
  
  .amount {
    min-width: 100px;
  }
}
</style>