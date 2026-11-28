<template>
  <div class="money-summary-card">
    <div class="money-summary-header">
      <span class="ms-title">{{ $t('view.sale.invoiceDetail.financialSummary') }}</span>
      <span class="ms-header-amount">
        {{ $t('view.sale.quotation.payableTotal') }} {{ formatAmount(grandTotalRounded) }} {{ currencyUnit }}
      </span>
      <ButtonGeneric
        variant="plain"
        :icon="isOpen ? 'bi-chevron-up' : 'bi-chevron-down'"
        :title="$t('view.sale.invoiceDetail.moneySummaryToggle')"
        @click="isOpen = !isOpen"
      />
    </div>

    <div v-if="isOpen" class="money-summary-body">
      <span class="ms-label">{{ subtotalLabel }}</span>
      <span class="ms-value">{{ formatAmount(subTotal) }}</span>

      <span class="ms-label">{{ $t('view.sale.invoiceDetail.specialDiscount') }}{{ exVatSuffix }}</span>
      <span class="ms-value">-{{ formatAmount(shownSpecialDiscount) }}</span>

      <span class="ms-label">{{ $t('view.sale.invoiceDetail.specialSurcharge') }}{{ exVatSuffix }}</span>
      <span class="ms-value">+{{ formatAmount(shownSpecialAddition) }}</span>

      <span class="ms-label">{{ $t('view.sale.invoiceDetail.freightInsuranceRow') }}{{ exVatSuffix }}</span>
      <span class="ms-value">{{ formatAmount(shownFreight) }}</span>

      <div class="ms-rule"></div>

      <span class="ms-label ms-label--strong">{{ $t('view.sale.saleOrder.beforeVatTotal') }}</span>
      <span class="ms-value ms-value--strong">{{ formatAmount(totalBeforeVat) }}</span>

      <span class="ms-label">{{ vatLabel }}</span>
      <span class="ms-value">{{ formatAmount(vatAmount) }}</span>

      <div class="ms-rule ms-rule--double"></div>

      <span class="ms-label ms-label--total">{{ $t('view.sale.quotation.payableTotal') }}</span>
      <span class="ms-value ms-value--total">{{ formatAmount(grandTotalRounded) }} {{ currencyUnit }}</span>

      <div class="ms-footnote">
        <div v-for="line in footnoteLines" :key="line">{{ line }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import { formatDocCurrency } from '@/services/utils/decimal.js'
import { VAT_INCLUDED_PERCENT } from '@/services/utils/money.js'

export default {
  name: 'MoneySummaryCard',

  components: {
    ButtonGeneric
  },

  props: {
    invoiceData: {
      type: Object,
      default: () => ({})
    },
    subTotal: {
      type: Number,
      default: 0
    },
    totalAfterDiscountAndAddition: {
      type: Number,
      default: 0
    },
    totalBeforeVat: {
      type: Number,
      default: 0
    },
    vatAmount: {
      type: Number,
      default: 0
    },
    grandTotalRaw: {
      type: Number,
      default: 0
    },
    grandTotalRounded: {
      type: Number,
      default: 0
    },
    vatIncluded: {
      type: Boolean,
      default: false
    },
    specialDiscountEx: {
      type: Number,
      default: 0
    },
    specialAdditionEx: {
      type: Number,
      default: 0
    },
    freightEx: {
      type: Number,
      default: 0
    }
  },

  data() {
    return {
      isOpen: false
    }
  },

  computed: {
    currencyUnit() {
      return this.invoiceData?.currencyUnit || 'THB'
    },

    effectiveVatPercent() {
      return this.vatIncluded ? VAT_INCLUDED_PERCENT : (this.invoiceData?.vatPercent || 0)
    },

    subtotalLabel() {
      return this.vatIncluded
        ? this.$t('view.sale.invoiceDetail.subtotalBeforeVat')
        : this.$t('view.sale.invoiceDetail.subtotal')
    },

    shownSpecialDiscount() {
      return this.vatIncluded ? this.specialDiscountEx : (this.invoiceData.specialDiscount || 0)
    },

    shownSpecialAddition() {
      return this.vatIncluded ? this.specialAdditionEx : (this.invoiceData.specialAddition || 0)
    },

    shownFreight() {
      return this.vatIncluded ? this.freightEx : (this.invoiceData.freightAndInsurance || 0)
    },

    vatLabel() {
      return this.$t('view.sale.invoiceDetail.vatPercentRow', { percent: this.effectiveVatPercent })
    },

    roundingDiff() {
      return this.grandTotalRounded - this.grandTotalRaw
    },

    exVatSuffix() {
      return this.vatIncluded ? ' ' + this.$t('view.sale.invoiceDetail.beforeVatSuffix') : ''
    },

    footnoteLines() {
      if (this.vatIncluded) {
        const prefix = 'view.sale.invoiceDetail.moneySummaryFootnoteVatIncluded'
        return [
          this.$t(prefix + '1', { percent: VAT_INCLUDED_PERCENT }),
          this.$t(prefix + '2'),
          this.$t(prefix + '3')
        ]
      }
      return [this.footnoteText]
    },

    footnoteText() {
      const roundingText = this.roundingDiff >= 0
        ? `+${this.formatAmount(this.roundingDiff)}`
        : this.formatAmount(this.roundingDiff)

      return this.$t('view.sale.invoiceDetail.moneySummaryFootnote', {
        currency: this.currencyUnit,
        rate: (this.invoiceData?.currencyRate || 1).toFixed(2),
        rounding: roundingText
      })
    }
  },

  methods: {
    formatAmount(value) {
      return formatDocCurrency(value, this.currencyUnit, 'en-US')
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/mixin.scss';

.money-summary-card {
  @include card-base;
  background: var(--color-card-bg) !important;
  padding: 0;
  overflow: hidden;
}

.money-summary-header {
  display: flex;
  align-items: center;
  gap: var(--sp-md);
  padding: var(--sp-lg);
}

.ms-title {
  font-weight: 700;
  color: var(--base-font-color);
  flex: 1;
}

.ms-header-amount {
  font-weight: 600;
  color: var(--base-font-color);
  font-variant-numeric: tabular-nums;
}

.money-summary-body {
  display: grid;
  grid-template-columns: 1fr auto;
  row-gap: var(--sp-sm);
  column-gap: var(--sp-md);
  padding: 0 var(--sp-lg) var(--sp-lg);
}

.ms-label {
  font-size: var(--fs-sm);
  color: var(--base-sub-color);

  &--strong,
  &--total {
    font-weight: 700;
    color: var(--base-font-color);
  }
}

.ms-value {
  text-align: right;
  font-variant-numeric: tabular-nums;
  color: var(--base-font-color);

  &--strong,
  &--total {
    font-weight: 700;
  }

  &--total {
    font-size: var(--fs-lg);
  }
}

.ms-rule {
  grid-column: 1 / -1;
  border-top: 1px solid var(--color-border);

  &--double {
    border-top: 2px solid var(--base-font-color);
  }
}

.ms-footnote {
  grid-column: 1 / -1;
  text-align: left;
  font-size: var(--fs-base);
  color: var(--base-sub-color);
}
</style>
