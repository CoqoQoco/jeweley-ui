<template>
  <div class="customer-form-section">
    <div class="section-header">
      <h3 class="section-title">
        <i class="bi bi-person"></i>
        ข้อมูลลูกค้า
      </h3>
      <button class="btn-search-customer" @click="showSearchModal = true">
        <i class="bi bi-search"></i>
        ค้นหาลูกค้า
      </button>
    </div>

    <div class="form-card">
      <!-- Selected Customer Display -->
      <div v-if="customer.customerCode" class="selected-customer-badge">
        <span class="badge-code">{{ customer.customerCode }}</span>
        <button class="btn-clear-customer" @click="clearCustomer">
          <i class="bi bi-x"></i>
        </button>
      </div>

      <div class="mobile-form-group">
        <label>ชื่อลูกค้า <span class="required">*</span></label>
        <input
          type="text"
          :value="customer.customerName"
          @input="updateField('customerName', $event.target.value)"
          placeholder="กรุณาเลือกลูกค้า"
          readonly
        />
      </div>

      <div class="mobile-form-group">
        <label>เบอร์โทรศัพท์</label>
        <input
          type="tel"
          :value="customer.customerTel"
          @input="updateField('customerTel', $event.target.value)"
          placeholder="เบอร์โทรศัพท์"
          readonly
        />
      </div>

      <div class="mobile-form-group">
        <label>อีเมล</label>
        <input
          type="email"
          :value="customer.customerEmail"
          @input="updateField('customerEmail', $event.target.value)"
          placeholder="อีเมล"
          readonly
        />
      </div>

      <div class="mobile-form-group">
        <label>ที่อยู่</label>
        <textarea
          :value="customer.customerAddress"
          @input="updateField('customerAddress', $event.target.value)"
          placeholder="ที่อยู่"
          rows="3"
          readonly
        ></textarea>
      </div>

      <div class="mobile-form-group">
        <label>หมายเหตุ</label>
        <textarea
          :value="customer.remark"
          @input="updateField('remark', $event.target.value)"
          placeholder="หมายเหตุ (ถ้ามี)"
          rows="2"
        ></textarea>
      </div>
    </div>

    <!-- Customer Search Modal -->
    <CustomerSearchModal
      :visible="showSearchModal"
      @close="showSearchModal = false"
      @customer-selected="onCustomerSelected"
    />
  </div>
</template>

<script>
import CustomerSearchModal from './customer-search-modal.vue'

export default {
  name: 'CustomerForm',

  components: {
    CustomerSearchModal
  },

  props: {
    customer: {
      type: Object,
      default: () => ({
        customerCode: '',
        customerName: '',
        customerTel: '',
        customerEmail: '',
        customerAddress: '',
        remark: ''
      })
    }
  },

  emits: ['update:customer'],

  data() {
    return {
      showSearchModal: false
    }
  },

  methods: {
    updateField(field, value) {
      this.$emit('update:customer', {
        ...this.customer,
        [field]: value
      })
    },

    onCustomerSelected(customerData) {
      this.$emit('update:customer', {
        ...this.customer,
        customerCode: customerData.code || '',
        customerName: customerData.nameTh || customerData.nameEn || '',
        customerTel: customerData.telephone1 || '',
        customerEmail: customerData.email || '',
        customerAddress: customerData.address || ''
      })
      this.showSearchModal = false
    },

    clearCustomer() {
      this.$emit('update:customer', {
        ...this.customer,
        customerCode: '',
        customerName: '',
        customerTel: '',
        customerEmail: '',
        customerAddress: ''
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/mobile';

.customer-form-section {
  margin-top: 16px;

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
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
}

.btn-search-customer {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: var(--base-font-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;

  &:active {
    opacity: 0.9;
  }

  i {
    font-size: 0.8rem;
  }
}

.form-card {
  background: white;
  border-radius: 10px;
  padding: 16px;
  border: 1px solid #e8e8e8;

  .selected-customer-badge {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    background: rgba(var(--base-font-color-rgb, 0, 0, 0), 0.06);
    border-radius: 8px;
    margin-bottom: 14px;

    .badge-code {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--base-font-color);
    }

    .btn-clear-customer {
      background: none;
      border: none;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #999;
      font-size: 1rem;
      cursor: pointer;

      &:active {
        background: rgba(0, 0, 0, 0.1);
      }
    }
  }

  .mobile-form-group {
    margin-bottom: 14px;

    &:last-child {
      margin-bottom: 0;
    }

    label {
      display: block;
      font-size: 0.85rem;
      font-weight: 500;
      color: #555;
      margin-bottom: 6px;

      .required {
        color: #e74c3c;
      }
    }

    input,
    textarea {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      font-size: 0.9rem;
      outline: none;
      transition: border-color 0.2s ease;
      background: #fafafa;
      color: #333;

      &:focus {
        border-color: var(--base-font-color);
      }

      &::placeholder {
        color: #bbb;
      }

      &[readonly] {
        background: #f5f5f5;
        color: #666;
      }
    }

    textarea {
      resize: vertical;
    }
  }
}
</style>
