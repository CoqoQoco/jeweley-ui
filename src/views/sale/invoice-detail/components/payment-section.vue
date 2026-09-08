<template>
  <SectionCardGeneric
    headerStyle="legend"
    accent="main"
    icon="bi-credit-card"
    :title="$t('view.sale.invoiceDetail.paymentSectionTitle')"
  >
    <div class="payment-zone">
      <div class="payment-left">
        <div class="payment-status-strip">
          <div class="status-badge-row">
            <span v-if="paymentStatus" class="status-badge" :class="`status-badge--${paymentStatus}`">
              {{ statusLabel }}
            </span>
            <span v-else class="status-badge status-badge--unknown">-</span>
            <ButtonGeneric
              variant="green"
              icon="bi-cash-coin"
              :label="$t('view.sale.invoiceDetail.recordPayment')"
              @click="$emit('record-payment')"
            />
          </div>

          <div v-if="paymentStatus" class="progress-track">
            <div
              class="progress-fill"
              :class="`progress-fill--${paymentStatus}`"
              :style="{ width: progressPercent + '%' }"
            ></div>
          </div>

          <div class="payment-progress-line">
            {{ $t('view.sale.invoiceDetail.paymentProgressLine', { paid: formatAmount(deposit + paidAmount), total: paymentStatus ? formatAmount(grandTotalRounded) : '-' }) }}
          </div>

          <div class="payment-method-line">
            {{ invoiceData.paymentName || '-' }} · {{ invoiceData.paymentDay || 0 }} {{ $t('view.sale.invoiceDetail.dayUnit') }}
          </div>
        </div>

        <div class="payment-history">
          <div class="payment-history-title">
            {{ $t('view.sale.invoiceDetail.paymentHistory') }} ({{ payments.length }} {{ $t('view.sale.invoiceDetail.timeUnit') }})
          </div>

          <div v-if="payments.length === 0" class="text-center text-muted py-4">
            <i class="bi bi-inbox" style="font-size: 2rem"></i>
            <p class="mb-0 mt-2">{{ $t('view.sale.invoiceDetail.noPaymentHistory') }}</p>
          </div>

          <div v-else class="history-list">
            <div v-for="(payment, idx) in payments" :key="payment.running || idx" class="history-row">
              <imagePreview
                v-if="payment.imagePath"
                class="history-thumb"
                :imageName="payment.imagePath"
                path="Images/Payment"
                type="PATH"
                :width="40"
                :height="40"
                :emitImage="true"
              />
              <div class="history-info">
                <div class="history-line">
                  <span class="history-date">{{ formatDate(payment.paymentDate) }}</span>
                  <span class="history-amount">{{ formatAmount(payment.amount) }} {{ payment.currencyUnit }}</span>
                  <span class="history-method">{{ payment.paymentMethod }}</span>
                </div>
                <div class="history-line history-line--sub">
                  {{ payment.createBy }} · {{ formatDateTime(payment.createDate) }}
                </div>
                <div v-if="secondaryLine(payment)" class="history-line history-line--secondary">
                  {{ secondaryLine(payment) }}
                </div>
              </div>
              <ButtonGeneric
                variant="red"
                icon="bi-trash"
                :title="$t('view.sale.invoiceDetail.deletePaymentBtn')"
                @click="$emit('delete-payment', payment)"
              />
            </div>
          </div>
        </div>
      </div>

      <div class="payment-money-box">
        <div class="money-big">
          <span class="money-big-label">{{ $t('view.sale.quotation.payableTotal') }}</span>
          <span class="money-big-value">
            {{ paymentStatus ? formatAmount(grandTotalRounded) : '-' }} {{ currencyUnit }}
          </span>
        </div>
        <div class="money-divider"></div>
        <div class="money-row">
          <span>{{ $t('view.sale.invoiceDetail.deposit') }}</span>
          <span>{{ paymentStatus ? formatAmount(deposit) : '-' }}</span>
        </div>
        <div class="money-row">
          <span>{{ $t('view.sale.invoiceDetail.paidAmount') }}</span>
          <span>{{ paymentStatus ? formatAmount(paidAmount) : '-' }}</span>
        </div>
        <div class="money-row money-row--outstanding">
          <span>{{ $t('view.sale.saleOrder.remainingBalance') }}</span>
          <span :class="remainingClass">
            {{ paymentStatus ? formatAmount(outstandingAmount) : '-' }}
            <i v-if="paymentStatus === 'paid'" class="bi bi-check-circle-fill"></i>
          </span>
        </div>
      </div>
    </div>
  </SectionCardGeneric>
</template>

<script>
import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import imagePreview from '@/components/prime-vue/ImagePreviewEmit.vue'
import dayjs from 'dayjs'
import { formatDocCurrency } from '@/services/utils/decimal.js'
import { getPaymentStatus, getOutstandingAmount } from '@/services/utils/payment-status.js'

export default {
  name: 'PaymentSection',

  components: {
    SectionCardGeneric,
    ButtonGeneric,
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

  emits: ['delete-payment', 'record-payment'],

  computed: {
    currencyUnit() {
      return this.invoiceData?.currencyUnit || 'THB'
    },

    deposit() {
      return Number(this.invoiceData?.deposit) || 0
    },

    payments() {
      return Array.isArray(this.invoiceData?.payments) ? this.invoiceData.payments : []
    },

    paymentStatus() {
      return getPaymentStatus(this.grandTotalRounded, this.deposit, this.paidAmount)
    },

    outstandingAmount() {
      return getOutstandingAmount(this.grandTotalRounded, this.deposit, this.paidAmount)
    },

    statusLabel() {
      const map = {
        paid: this.$t('view.sale.invoiceDetail.paymentStatusPaid'),
        partial: this.$t('view.sale.invoiceDetail.paymentStatusPartial'),
        unpaid: this.$t('view.sale.invoiceDetail.paymentStatusUnpaid')
      }
      return map[this.paymentStatus] || ''
    },

    progressPercent() {
      if (!this.grandTotalRounded || this.grandTotalRounded <= 0) return 0
      const ratio = ((this.deposit + this.paidAmount) / this.grandTotalRounded) * 100
      return Math.min(100, Math.max(0, ratio))
    },

    remainingClass() {
      return this.outstandingAmount <= 0 ? 'is-clear' : 'is-due'
    }
  },

  methods: {
    formatAmount(value) {
      return formatDocCurrency(value, this.currencyUnit, 'en-US')
    },

    formatDate(date) {
      return date ? dayjs(date).format('DD/MM/YYYY') : '-'
    },

    formatDateTime(date) {
      return date ? dayjs(date).format('DD/MM/YYYY HH:mm') : '-'
    },

    secondaryLine(payment) {
      return [payment.bankName, payment.bankBranch, payment.referenceNumber, payment.remark]
        .filter(Boolean)
        .join(' · ')
    }
  }
}
</script>

<style lang="scss" scoped>
.payment-zone {
  display: flex;
  align-items: flex-start;
  gap: var(--sp-lg);
  flex-wrap: wrap;
}

.payment-left {
  flex: 1;
  min-width: 0;
}

.payment-status-strip {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--sp-sm);
}

.status-badge-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-sm);
}

.status-badge {
  display: inline-flex;
  align-items: center;
  padding: var(--sp-xs) var(--sp-md);
  border-radius: var(--radius-sm);
  font-size: var(--fs-sm);
  font-weight: 700;

  &--paid {
    color: var(--status-resolved);
    background: var(--status-resolved-bg);
  }

  &--partial {
    color: var(--status-open);
    background: var(--status-open-bg);
  }

  &--unpaid {
    color: var(--status-cancelled);
    background: var(--status-cancelled-bg);
  }

  &--unknown {
    color: var(--base-sub-color);
    background: var(--color-highlight-bg);
  }
}

.progress-track {
  height: 8px;
  border-radius: var(--radius-sm);
  background: var(--color-border);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: var(--radius-sm);
  transition: width 0.2s ease;

  &--paid {
    background: var(--status-resolved);
  }

  &--partial {
    background: var(--status-open);
  }

  &--unpaid {
    background: var(--status-cancelled);
  }
}

.payment-progress-line,
.payment-method-line {
  font-size: var(--fs-sm);
  color: var(--base-sub-color);
}

.payment-money-box {
  flex: 0 0 320px;
  min-width: 0;
  background: var(--color-green-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--sp-lg);
}

@media (max-width: 1024px) {
  .payment-money-box {
    flex: 1 1 100%;
  }
}

.money-big {
  display: flex;
  flex-direction: column;
  gap: var(--sp-xs);
  margin-bottom: var(--sp-md);
}

.money-big-label {
  font-size: var(--fs-sm);
  color: var(--base-sub-color);
}

.money-big-value {
  font-size: var(--fs-xl);
  font-weight: 700;
  color: var(--base-font-color);
  font-variant-numeric: tabular-nums;
}

.money-divider {
  border-top: 1px solid var(--color-border);
  margin-bottom: var(--sp-md);
}

.money-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--sp-xs);
  font-variant-numeric: tabular-nums;

  span:first-child {
    font-size: var(--fs-sm);
    color: var(--base-sub-color);
  }

  span:last-child {
    font-size: var(--fs-base);
    font-weight: 600;
    color: var(--base-font-color);
  }

  &--outstanding {
    margin-bottom: 0;

    span:last-child {
      display: inline-flex;
      align-items: center;
      gap: var(--sp-xs);
    }
  }
}

.is-clear {
  color: var(--status-resolved) !important;
}

.is-due {
  color: var(--base-red) !important;
}

.payment-history {
  margin-top: var(--sp-lg);
}

.payment-history-title {
  font-weight: 600;
  color: var(--base-font-color);
  margin-bottom: var(--sp-sm);
}

.history-list {
  display: flex;
  flex-direction: column;
}

.history-row {
  display: flex;
  align-items: flex-start;
  gap: var(--sp-md);
  padding: var(--sp-md);
  border-bottom: 1px solid var(--color-border);
  transition: background 0.15s ease;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: var(--color-highlight-bg);
  }
}

.history-thumb {
  flex-shrink: 0;
}

.history-info {
  flex: 1;
  min-width: 0;
}

.history-line {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-md);
  font-size: var(--fs-base);
}

.history-amount {
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.history-line--sub,
.history-line--secondary {
  font-size: var(--fs-sm);
  color: var(--base-sub-color);
}
</style>
