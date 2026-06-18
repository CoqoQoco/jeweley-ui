<template>
  <div class="card-container mt-3">
    <div class="card-header">
      <h6 class="mb-0">{{ $t('view.sale.saleOrder.soSummary') }}</h6>
    </div>
    <div class="card-body">
      <div class="row">
        <div class="col-md-3">
          <!-- Invoice Items Summary -->
          <div class="summary-section">
            <h6 class="text-success">
              <i class="bi bi-receipt-cutoff mr-1"></i>{{ $t('view.sale.saleOrder.invoicedItems') }}
            </h6>
            <div class="summary-item">
              <span>{{ $t('common.field.quantity') }}:</span>
              <span class="font-weight-bold text-success">{{ invoiceItemsCount }} {{ $t('view.sale.saleOrder.itemUnit') }}</span>
            </div>
            <div class="summary-item">
              <span>{{ $t('view.sale.saleOrder.totalAmount') }}:</span>
              <span class="font-weight-bold text-success">{{
                formatCurrency(invoiceItemsTotal)
              }}</span>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <!-- Confirmed Items Summary -->
          <div class="summary-section">
            <h6 class="text-primary"><i class="bi bi-check-circle mr-1"></i>{{ $t('view.sale.saleOrder.confirmedItemsTitle') }}</h6>
            <div class="summary-item">
              <span>{{ $t('common.field.quantity') }}:</span>
              <span class="font-weight-bold text-primary">{{ confirmedItemsCount }} {{ $t('view.sale.saleOrder.itemUnit') }}</span>
            </div>
            <div class="summary-item">
              <span>{{ $t('view.sale.saleOrder.totalAmount') }}:</span>
              <span class="font-weight-bold text-primary">{{
                formatCurrency(confirmedItemsTotal)
              }}</span>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <!-- Pending Confirmation Items Summary -->
          <div class="summary-section">
            <h6 class="text-warning"><i class="bi bi-clock-history mr-1"></i>{{ $t('view.sale.saleOrder.pendingItemsTitle') }}</h6>
            <div class="summary-item">
              <span>{{ $t('common.field.quantity') }}:</span>
              <span class="font-weight-bold text-warning">{{ pendingItemsCount }} {{ $t('view.sale.saleOrder.itemUnit') }}</span>
            </div>
            <div class="summary-item">
              <span>{{ $t('view.sale.saleOrder.totalAmount') }}:</span>
              <span class="font-weight-bold text-warning">{{
                formatCurrency(pendingItemsTotal)
              }}</span>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <!-- Production Items Summary -->
          <div class="summary-section">
            <h6 class="text-info"><i class="bi bi-tools mr-1"></i>{{ $t('view.sale.saleOrder.productionPendingTitle') }}</h6>
            <div class="summary-item">
              <span>{{ $t('common.field.quantity') }}:</span>
              <span class="font-weight-bold text-info">{{ productionItemsCount }} {{ $t('view.sale.saleOrder.itemUnit') }}</span>
            </div>
            <div class="summary-item">
              <span>{{ $t('view.sale.saleOrder.totalAmount') }}:</span>
              <span class="font-weight-bold text-info">{{
                formatCurrency(productionItemsTotal)
              }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Grand Total Row -->
      <div class="row mt-3">
        <div class="col-md-12">
          <div class="summary-section border-top pt-3">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h6 class="mb-1">{{ $t('view.sale.saleOrder.allTotal') }}</h6>
                <small class="text-muted">{{ selectedItemsCount }} {{ $t('view.sale.saleOrder.itemUnit') }}</small>
              </div>
              <div class="text-right">
                <div class="mb-1">
                  <span class="mr-2">{{ $t('view.sale.saleOrder.subtotalLabel') }}</span>
                  <span class="font-weight-bold">{{ formatCurrency(selectedItemsTotal) }}</span>
                </div>
                <div class="mb-1">
                  <span class="mr-2">{{ $t('view.sale.saleOrder.freightLabel') }}</span>
                  <span class="font-weight-bold">{{
                    formatCurrency(formSaleOrder.freight || 0)
                  }}</span>
                </div>
                <div class="border-top pt-2 mt-2">
                  <span class="h6 mr-2">{{ $t('view.sale.saleOrder.soTotalLabel') }}</span>
                  <span class="h5 font-weight-bold text-primary">{{
                    formatCurrency(totalOrderAmount)
                  }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Order Notes -->
      <div class="row mt-3">
        <div class="col-md-12">
          <div>
            <span class="title-text">{{ $t('view.sale.saleOrder.soRemarkLabel') }}</span>
            <textarea
              class="form-control"
              rows="3"
              :value="formSaleOrder.remark"
              :placeholder="$t('view.sale.saleOrder.soRemarkPlaceholder')"
              :readonly="isViewMode"
              @input="$emit('update:remark', $event.target.value)"
            ></textarea>
          </div>
        </div>
      </div>

      <!-- Validation Messages -->
      <div class="row mt-3" v-if="validationErrors.length > 0">
        <div class="col-md-12">
          <div class="alert alert-warning">
            <h6><i class="bi bi-exclamation-triangle mr-2"></i>{{ $t('common.label.incompleteData') }}:</h6>
            <ul class="mb-0">
              <li v-for="error in validationErrors" :key="error">{{ error }}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { formatDecimal } from '@/services/utils/decimal.js'

export default {
  name: 'OrderSummarySection',

  emits: ['update:remark'],

  props: {
    invoiceItemsCount: {
      type: Number,
      default: 0
    },
    invoiceItemsTotal: {
      type: Number,
      default: 0
    },
    confirmedItemsCount: {
      type: Number,
      default: 0
    },
    confirmedItemsTotal: {
      type: Number,
      default: 0
    },
    pendingItemsCount: {
      type: Number,
      default: 0
    },
    pendingItemsTotal: {
      type: Number,
      default: 0
    },
    productionItemsCount: {
      type: Number,
      default: 0
    },
    productionItemsTotal: {
      type: Number,
      default: 0
    },
    selectedItemsCount: {
      type: Number,
      default: 0
    },
    selectedItemsTotal: {
      type: Number,
      default: 0
    },
    totalOrderAmount: {
      type: Number,
      default: 0
    },
    formSaleOrder: {
      type: Object,
      default: () => ({})
    },
    isViewMode: {
      type: Boolean,
      default: false
    },
    validationErrors: {
      type: Array,
      default: () => []
    }
  },

  methods: {
    formatCurrency(amount, currency = null) {
      const formattedAmount = formatDecimal(amount, 2)
      const displayCurrency = currency || this.formSaleOrder.currencyUnit || 'THB'
      return formattedAmount + ' ' + displayCurrency
    },

    formatPrice(price) {
      const numPrice = Number(price)
      return numPrice.toLocaleString('th-TH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';

.card-container {
  border: 1px solid #dddddd;
  border-radius: 5px;
  box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
  background-color: #f7f7f7;
}

.card-header {
  background: var(--base-font-color);
  border-bottom: 1px solid #e9ecef;
  border-radius: 5px 5px 0px 0px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 300;
  color: white;
}

.card-body {
  padding: 1rem;
}

.summary-section {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1rem;
  height: 100%;

  h6 {
    font-weight: 600;
    margin-bottom: 0.75rem;
  }
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;

  &:last-child {
    margin-bottom: 0;
  }
}

.text-right {
  text-align: right;
}

.font-weight-bold {
  font-weight: 600;
}

.d-flex {
  display: flex;
}

.justify-content-between {
  justify-content: space-between;
}

.align-items-center {
  align-items: center;
}

.mr-1 {
  margin-right: 0.25rem;
}

.mr-2 {
  margin-right: 0.5rem;
}
</style>
