<template>
  <div class="card-container">
    <div class="card-header">
      <h6 class="mb-0">
        <i class="bi bi-file-earmark-text mr-2"></i>{{ $t('view.sale.invoiceDetail.invoiceAndCustomer') }}
      </h6>
    </div>
    <div class="card-body">
      <!-- Invoice Information Section -->
      <div class="info-section mb-2">
        <h6 class="section-title mb-2">
          <i class="bi bi-receipt mr-2"></i>{{ $t('view.sale.invoiceDetail.invoiceInfo') }}
        </h6>
        <div class="row">
          <div class="col-md-3">
            <div class="info-item">
              <label class="info-label">{{ $t('view.sale.invoice.invoiceNumber') }}</label>
              <p class="info-value font-weight-bold text-primary">
                {{ invoiceData.invoiceNumber || '-' }}
              </p>
            </div>
          </div>
          <div class="col-md-3">
            <div class="info-item">
              <label class="info-label">{{ $t('view.sale.invoiceDetail.soNumber') }}</label>
              <p class="info-value">{{ invoiceData.soNumber || '-' }}</p>
            </div>
          </div>
          <div class="col-md-3">
            <div class="info-item">
              <label class="info-label">{{ $t('view.sale.invoice.createDate') }}</label>
              <p class="info-value">{{ formatDate(invoiceData.createDate) }}</p>
            </div>
          </div>
          <div class="col-md-3">
            <div class="info-item">
              <label class="info-label">{{ $t('view.sale.invoiceDetail.deliveryDateLabel') }}</label>
              <p class="info-value">{{ formatDate(invoiceData.deliveryDate) }}</p>
            </div>
          </div>
        </div>
        <div class="row mt-1">
          <div class="col-md-3">
            <div class="info-item">
              <label class="info-label">{{ $t('view.sale.invoice.status') }}</label>
              <p class="info-value">
                <span :class="getStatusBadgeClass(invoiceData.statusName)">
                  {{ invoiceData.statusName || '-' }}
                </span>
              </p>
            </div>
          </div>
          <div class="col-md-3">
            <div class="info-item">
              <label class="info-label">{{ $t('view.sale.invoice.createBy') }}</label>
              <p class="info-value">{{ invoiceData.createBy || '-' }}</p>
            </div>
          </div>
          <div class="col-md-3">
            <div class="info-item">
              <label class="info-label">{{ $t('view.sale.invoiceDetail.currencyLabel') }}</label>
              <p class="info-value">
                {{ invoiceData.currencyUnit || 'THB' }} ({{
                  formatNumber(invoiceData.currencyRate)
                }})
              </p>
            </div>
          </div>
          <div class="col-md-3"></div>
        </div>
      </div>

      <!-- Customer Information Section -->
      <div class="info-section">
        <h6 class="section-title mb-2">
          <i class="bi bi-person mr-2"></i>{{ $t('view.sale.invoiceDetail.customerInfo') }}
        </h6>
        <div class="row">
          <div class="col-md-4">
            <div class="info-item">
              <label class="info-label">{{ $t('view.sale.invoice.customerName') }}</label>
              <p class="info-value font-weight-bold">
                {{ invoiceData.customerName || '-' }}
              </p>
            </div>
          </div>
          <div class="col-md-4">
            <div class="info-item">
              <label class="info-label">{{ $t('view.sale.invoiceDetail.customerTel') }}</label>
              <p class="info-value">
                <i class="bi bi-telephone mr-1"></i>{{ invoiceData.customerTel || '-' }}
              </p>
            </div>
          </div>
          <div class="col-md-4">
            <div class="info-item">
              <label class="info-label">{{ $t('view.sale.invoiceDetail.customerEmail') }}</label>
              <p class="info-value">
                <i class="bi bi-envelope mr-1"></i>{{ invoiceData.customerEmail || '-' }}
              </p>
            </div>
          </div>
        </div>
        <div class="row mt-1">
          <div class="col-md-12">
            <div class="info-item">
              <label class="info-label">{{ $t('view.sale.invoiceDetail.customerAddress') }}</label>
              <p class="info-value">{{ invoiceData.customerAddress || '-' }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import dayjs from 'dayjs'

export default {
  name: 'InvoiceInfoCard',

  props: {
    invoiceData: {
      type: Object,
      default: () => ({})
    }
  },

  methods: {
    formatDate(date) {
      if (!date) return '-'
      return dayjs(date).format('DD/MM/YYYY')
    },
    formatNumber(value) {
      if (!value && value !== 0) return '0.00'
      return Number(value).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    },
    getStatusBadgeClass(status) {
      const statusMap = {
        Draft: 'badge badge-secondary',
        Confirmed: 'badge badge-success',
        Cancelled: 'badge badge-danger',
        Pending: 'badge badge-warning'
      }
      return statusMap[status] || 'badge badge-info'
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';

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

.info-section {
  position: relative;
  padding: 0.5rem 0;

  &:not(:last-child) {
    border-bottom: 1px solid var(--color-border);
  }

  .section-title {
    color: var(--base-font-color);
    font-weight: 600;
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    margin-bottom: 0.5rem;

    i {
      color: var(--base-font-color);
      font-size: 0.85rem;
    }
  }
}

.info-item {
  margin-bottom: 0.25rem;

  .info-label {
    font-size: 0.7rem;
    color: #6c757d;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.3px;
    margin-bottom: 0.15rem;
    display: block;
  }

  .info-value {
    font-size: var(--fs-sm);
    color: var(--base-font-color);
    margin-bottom: 0;
    padding: 0.35rem 0.5rem;
    background-color: var(--color-highlight-bg);
    border-radius: var(--radius-sm);
    min-height: 30px;
    display: flex;
    align-items: center;

    i {
      color: var(--base-font-color);
      font-size: 0.8rem;
    }
  }
}
</style>
