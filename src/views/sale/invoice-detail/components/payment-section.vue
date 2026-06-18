<template>
  <div class="card-container">
    <div class="card-header">
      <h6 class="mb-0">
        <i class="bi bi-clock-history mr-2"></i>{{ $t('view.sale.invoiceDetail.paymentHistory') }}
      </h6>
    </div>
    <div class="card-body">
      <!-- Empty State -->
      <div
        v-if="!invoiceData.payments || invoiceData.payments.length === 0"
        class="text-center text-muted py-4"
      >
        <i class="bi bi-inbox" style="font-size: 2rem"></i>
        <p class="mb-0 mt-2">{{ $t('view.sale.invoiceDetail.noPaymentHistory') }}</p>
      </div>

      <!-- Payment History Table -->
      <div v-else>
        <BaseDataTable
          :items="invoiceData.payments"
          :totalRecords="invoiceData.payments.length"
          :columns="paymentColumns"
          :paginator="false"
          :scrollHeight="'300px'"
          dataKey="running"
        >
          <!-- Index Column Template -->
          <template #indexTemplate="slotProps">
            <div class="text-center">{{ slotProps.index + 1 }}</div>
          </template>

          <!-- Image Column Template -->
          <template #imageTemplate="slotProps">
            <div class="image-container text-center">
              <imagePreview
                v-if="slotProps.data.imagePath"
                :imageName="slotProps.data.imagePath"
                path="Images/Payment"
                type="PATH"
                :width="40"
                :height="40"
                :emitImage="true"
              />
              <span v-else class="text-muted">-</span>
            </div>
          </template>

          <!-- Amount Column Template with Currency -->
          <template #amountTemplate="slotProps">
            <div class="text-right">
              {{ formatNumber(slotProps.data.amount) }} {{ slotProps.data.currencyUnit }}
            </div>
          </template>

          <!-- Action Column Template -->
          <template #actionTemplate="slotProps">
            <div class="text-center">
              <button
                class="btn btn-sm btn-red"
                @click="onDeletePayment(slotProps.data)"
                :title="$t('view.sale.invoiceDetail.deletePaymentBtn')"
              >
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </template>
        </BaseDataTable>

        <!-- Payment Summary Footer -->
        <div class="mt-3 pt-3 border-top">
          <div class="row mb-2">
            <div class="col-md-3">
              <div class="info-item">
                <label class="info-label">{{ $t('view.sale.invoiceDetail.paymentCount') }}</label>
                <p class="info-value">{{ invoiceData.payments.length }} {{ $t('view.sale.invoiceDetail.timeUnit') }}</p>
              </div>
            </div>
            <div class="col-md-3">
              <div class="info-item">
                <label class="info-label">{{ $t('view.sale.quotation.payableTotal') }}</label>
                <p class="info-value font-weight-bold">
                  {{ formatNumber(grandTotalRounded) }} {{ invoiceData.currencyUnit }}
                </p>
              </div>
            </div>
            <div class="col-md-3">
              <div class="info-item">
                <label class="info-label">{{ $t('view.sale.invoiceDetail.deposit') }}</label>
                <p class="info-value text-info">
                  {{ formatNumber(invoiceData.deposit || 0) }}
                  {{ invoiceData.currencyUnit }}
                </p>
              </div>
            </div>
            <div class="col-md-3">
              <div class="info-item">
                <label class="info-label">{{ $t('view.sale.invoiceDetail.paidAmount') }}</label>
                <p class="info-value text-success">
                  {{ formatNumber(paidAmount) }} {{ invoiceData.currencyUnit }}
                </p>
              </div>
            </div>
          </div>
          <div class="row mt-2">
            <div class="col-md-12">
              <div class="info-item highlight-total">
                <label class="info-label">{{ $t('view.sale.saleOrder.remainingBalance') }}</label>
                <p class="info-value font-weight-bold text-danger remaining-amount">
                  {{ formatNumber(grandTotalRounded - (invoiceData.deposit || 0) - paidAmount) }}
                  {{ invoiceData.currencyUnit }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import imagePreview from '@/components/prime-vue/ImagePreviewEmit.vue'

export default {
  name: 'PaymentSection',

  components: {
    BaseDataTable,
    imagePreview
  },

  props: {
    invoiceData: {
      type: Object,
      default: () => ({})
    },
    paidAmount: {
      type: Number,
      default: 0
    },
    grandTotalRounded: {
      type: Number,
      default: 0
    }
  },

  emits: ['delete-payment'],

  computed: {
    paymentColumns() {
      return [
        { field: 'index', header: '#', width: '50px', sortable: false, align: 'center' },
        { field: 'image', header: this.$t('view.sale.invoiceDetail.imageHeader'), width: '80px', sortable: false, align: 'center' },
        {
          field: 'paymentDate',
          header: this.$t('view.sale.invoiceDetail.paymentDate'),
          minWidth: '120px',
          sortable: true,
          format: 'date'
        },
        {
          field: 'amount',
          header: this.$t('view.sale.invoiceDetail.amount'),
          minWidth: '120px',
          sortable: true,
          align: 'right'
        },
        {
          field: 'currencyUnit',
          header: this.$t('view.sale.invoiceDetail.currencyLabel'),
          width: '100px',
          sortable: false,
          align: 'center'
        },
        { field: 'paymentMethod', header: this.$t('view.sale.invoiceDetail.paymentMethod'), minWidth: '150px', sortable: true },
        { field: 'bankName', header: this.$t('view.sale.invoiceDetail.bank'), minWidth: '120px', sortable: false },
        { field: 'bankBranch', header: this.$t('view.sale.invoiceDetail.branch'), minWidth: '120px', sortable: false },
        {
          field: 'referenceNumber',
          header: this.$t('view.sale.invoiceDetail.referenceNumber'),
          minWidth: '150px',
          sortable: false
        },
        { field: 'remark', header: this.$t('view.sale.invoice.remark'), minWidth: '200px', sortable: false },
        { field: 'createBy', header: this.$t('view.sale.invoiceDetail.recordBy'), minWidth: '120px', sortable: true },
        {
          field: 'createDate',
          header: this.$t('view.sale.invoiceDetail.recordDate'),
          minWidth: '150px',
          sortable: true,
          format: 'datetime'
        },
        { field: 'action', header: this.$t('common.field.action'), width: '100px', sortable: false, align: 'center' }
      ]
    }
  },

  methods: {
    formatNumber(value) {
      if (!value && value !== 0) return '0.00'
      return Number(value).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    },
    onDeletePayment(paymentData) {
      this.$emit('delete-payment', paymentData)
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

.highlight-total {
  .info-value {
    background-color: var(--color-highlight-bg);
    font-weight: bold;
  }
}

.remaining-amount {
  font-size: var(--fs-lg);
}
</style>
