<template>
  <div class="customer-form-section">
    <div class="section-header">
      <h3 class="section-title">
        <i class="bi bi-person"></i>
        {{ $t('view.mobile.sale.customerSectionTitle') }}
      </h3>
      <div class="header-actions">
        <button class="btn-search-customer" @click="showSearchModal = true">
          <i class="bi bi-search"></i>
          {{ $t('view.mobile.sale.btnSearchCustomer') }}
        </button>
        <button class="btn-create-customer" @click="showCreateModal = true">
          <i class="bi bi-person-plus"></i>
          {{ $t('view.mobile.sale.btnCreateCustomer') }}
        </button>
      </div>
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
        <label>{{ $t('view.mobile.sale.fieldCustomerName') }} <span class="required">*</span></label>
        <InputTextGeneric
          :modelValue="customer.customerName"
          @update:modelValue="updateField('customerName', $event)"
          :placeholder="$t('view.mobile.sale.fieldCustomerName')"
          :readonly="true"
        />
      </div>

      <div class="mobile-form-group">
        <label>{{ $t('view.mobile.sale.fieldCustomerTel') }}</label>
        <InputTextGeneric
          type="tel"
          :modelValue="customer.customerTel"
          @update:modelValue="updateField('customerTel', $event)"
          :placeholder="$t('view.mobile.sale.fieldCustomerTel')"
          :readonly="true"
        />
      </div>

      <div class="mobile-form-group">
        <label>{{ $t('view.mobile.sale.fieldCustomerEmail') }}</label>
        <InputTextGeneric
          type="email"
          :modelValue="customer.customerEmail"
          @update:modelValue="updateField('customerEmail', $event)"
          :placeholder="$t('view.mobile.sale.fieldCustomerEmail')"
          :readonly="true"
        />
      </div>

      <div class="mobile-form-group">
        <label>{{ $t('view.mobile.sale.fieldCustomerAddress') }}</label>
        <TextareaGeneric
          :modelValue="customer.customerAddress"
          @update:modelValue="updateField('customerAddress', $event)"
          :placeholder="$t('view.mobile.sale.fieldCustomerAddress')"
          :rows="3"
          :disabled="true"
        />
      </div>

      <div class="mobile-form-group">
        <label>{{ $t('common.field.remark') }}</label>
        <TextareaGeneric
          :modelValue="customer.remark"
          @update:modelValue="updateField('remark', $event)"
          :placeholder="$t('common.field.remark')"
          :rows="2"
        />
      </div>
    </div>

    <!-- Customer Search Modal -->
    <CustomerSearchModal
      :visible="showSearchModal"
      @close="showSearchModal = false"
      @customer-selected="onCustomerSelected"
    />

    <!-- Customer Create Modal -->
    <CustomerCreateModal
      :visible="showCreateModal"
      @close="showCreateModal = false"
      @customer-created="onCustomerCreated"
    />
  </div>
</template>

<script>
import CustomerSearchModal from './customer-search-modal.vue'
import CustomerCreateModal from './customer-create-modal.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import TextareaGeneric from '@/components/generic/TextareaGeneric.vue'

export default {
  name: 'CustomerForm',

  components: {
    CustomerSearchModal,
    CustomerCreateModal,
    InputTextGeneric,
    TextareaGeneric
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
      showSearchModal: false,
      showCreateModal: false
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

    onCustomerCreated(customerData) {
      this.$emit('update:customer', {
        ...this.customer,
        customerCode: customerData.code || '',
        customerName: customerData.nameTh || customerData.nameEn || '',
        customerTel: customerData.telephone1 || '',
        customerEmail: customerData.email || '',
        customerAddress: customerData.address || ''
      })
      this.showCreateModal = false
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

.header-actions {
  display: flex;
  gap: 6px;
}

.btn-search-customer,
.btn-create-customer {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;

  &:active {
    opacity: 0.9;
  }

  i {
    font-size: 0.8rem;
  }
}

.btn-search-customer {
  background: var(--base-font-color);
}

.btn-create-customer {
  background: #43a047;
}

.form-card {
  background: var(--color-card-bg);
  border-radius: var(--radius-md);
  padding: var(--sp-lg);
  border: 1px solid var(--color-border);

  .selected-customer-badge {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    background: rgba(var(--base-font-color-rgb, 0, 0, 0), 0.06);
    border-radius: var(--radius-md);
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
        color: var(--base-red);
      }
    }

    input,
    textarea {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
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
