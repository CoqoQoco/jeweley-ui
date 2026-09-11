<template>
  <SectionCardGeneric
    :title="$t('view.production.goldLossTang.summaryTitle')"
    icon="bi-calculator"
    accent="main"
    headerStyle="legend"
  >
    <div v-if="hasNegativeLoss" class="negative-loss-banner mb-3">
      <i class="bi bi-exclamation-triangle-fill"></i>
      <span>{{ negativeLossMessage }}</span>
    </div>

    <div class="form-row two-col mb-2">
      <FormFieldGeneric :label="$t('view.production.goldLossTang.lossPercent')" :required="true">
        <InputTextGeneric
          :modelValue="lossPercent"
          type="number"
          step="0.01"
          :min="0"
          :placeholder="$t('view.production.goldLossTang.lossPercent')"
          @update:modelValue="$emit('update:lossPercent', $event)"
        />
      </FormFieldGeneric>

      <FormFieldGeneric :label="$t('view.production.goldLossTang.pricePerGram')" :required="true">
        <InputTextGeneric
          :modelValue="pricePerGram"
          type="number"
          step="0.01"
          :min="0"
          :placeholder="$t('view.production.goldLossTang.pricePerGram')"
          @update:modelValue="$emit('update:pricePerGram', $event)"
        />
        <small v-if="priceHintText" class="price-hint d-block">{{ priceHintText }}</small>
        <small v-if="priceDiffWarningText" class="price-diff-warning d-block">
          <i class="bi bi-exclamation-triangle-fill"></i> {{ priceDiffWarningText }}
        </small>
      </FormFieldGeneric>
    </div>

    <div class="mb-3">
      <FormFieldGeneric :label="$t('common.field.remark')">
        <TextareaGeneric
          :modelValue="remark"
          :rows="2"
          :placeholder="$t('common.field.remark')"
          @update:modelValue="$emit('update:remark', $event)"
        />
      </FormFieldGeneric>
    </div>

    <div class="calc-summary" :class="'calc-' + moneyState">
      <div class="calc-row">
        <span class="calc-label">{{ $t('view.production.goldLossTang.issuedTotal') }}</span>
        <span class="calc-value">{{ fmt2(calc.issuedTotal) }} {{ $t('view.production.goldLossTang.weightUnit') }}</span>
      </div>
      <div class="calc-row">
        <span class="calc-label">{{ $t('view.production.goldLossTang.returnedTotal') }}</span>
        <span class="calc-value">{{ fmt2(calc.returnedTotal) }} {{ $t('view.production.goldLossTang.weightUnit') }}</span>
      </div>
      <div class="calc-row">
        <span class="calc-label">{{ $t('view.production.goldLossTang.rawLoss') }}</span>
        <span class="calc-value">{{ fmtSign2w(calc.net) }} {{ $t('view.production.goldLossTang.weightUnit') }}</span>
      </div>
      <div class="calc-row">
        <span class="calc-label">{{ $t('view.production.goldLossTang.limitLoss') }}</span>
        <span class="calc-value">{{ fmt2(calc.allowedLoss) }} {{ $t('view.production.goldLossTang.weightUnit') }}</span>
      </div>
      <div class="calc-row highlight">
        <span class="calc-label fw-bold">{{ $t('view.production.goldLossTang.diffLoss') }}</span>
        <span class="calc-value fw-bold">{{ fmtSign2w(calc.diffLoss) }} {{ $t('view.production.goldLossTang.weightUnit') }}</span>
      </div>
      <div class="calc-row money-row">
        <span class="calc-label fw-bold">{{ $t('view.production.goldLossTang.moneyLabel') }}</span>
        <span class="calc-value money-value fw-bold">
          {{ fmtSign2(calc.money) }}
          <small class="money-hint ml-1">
            ({{ calc.money >= 0 ? $t('view.production.goldLossTang.moneyGain') : $t('view.production.goldLossTang.moneyLoss') }})
          </small>
        </span>
      </div>
    </div>

    <div class="d-flex justify-content-end mt-3">
      <ButtonGeneric
        variant="main"
        icon="bi-printer"
        :label="$t('view.production.goldLossTang.saveAndPrint')"
        :disabled="!canSave"
        @click="$emit('save')"
      />
    </div>
  </SectionCardGeneric>
</template>

<script>
import { formatDate } from '@/services/utils/dayjs.js'

import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import FormFieldGeneric from '@/components/generic/FormFieldGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import TextareaGeneric from '@/components/generic/TextareaGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'

export default {
  name: 'GoldLossTangSummaryPanel',

  components: {
    SectionCardGeneric,
    FormFieldGeneric,
    InputTextGeneric,
    TextareaGeneric,
    ButtonGeneric
  },

  props: {
    lossPercent: {
      type: [String, Number],
      default: ''
    },
    pricePerGram: {
      type: [String, Number],
      default: ''
    },
    remark: {
      type: String,
      default: ''
    },
    calc: {
      type: Object,
      default: () => ({
        issuedTotal: 0,
        returnedTotal: 0,
        rawLoss: 0,
        net: 0,
        allowedLoss: 0,
        diffLoss: 0,
        money: 0
      })
    },
    canSave: {
      type: Boolean,
      default: false
    },
    lastPriceInfo: {
      type: Object,
      default: null
    }
  },

  emits: ['update:lossPercent', 'update:pricePerGram', 'update:remark', 'save'],

  computed: {
    moneyState() {
      const v = Number(this.calc.money)
      if (!v || v === 0) return 'zero'
      if (v < 0) return 'negative'
      return 'positive'
    },

    hasNegativeLoss() {
      return Number(this.calc.rawLoss) < 0
    },

    negativeLossMessage() {
      return this.$t('view.production.goldLossTang.negativeLossWarning', {
        issued: this.fmt2(this.calc.issuedTotal),
        returned: this.fmt2(this.calc.returnedTotal)
      })
    },

    priceHintText() {
      if (!this.lastPriceInfo) return ''
      return this.$t('view.production.goldLossTang.priceHint', {
        price: this.fmt2(this.lastPriceInfo.pricePerGram),
        doc: this.lastPriceInfo.fromDocumentNo || '-',
        date: this.lastPriceInfo.fromDate ? formatDate(this.lastPriceInfo.fromDate) : '-'
      })
    },

    priceDiffWarningText() {
      if (!this.lastPriceInfo || !this.pricePerGram) return ''
      const lastPrice = Number(this.lastPriceInfo.pricePerGram)
      const entered = Number(this.pricePerGram)
      if (!lastPrice || isNaN(entered)) return ''
      const diffPercent = Math.abs(entered - lastPrice) / lastPrice * 100
      if (diffPercent <= 20) return ''
      return this.$t('view.production.goldLossTang.priceDiffWarning', { diff: diffPercent.toFixed(0) })
    }
  },

  methods: {
    fmt2(val) {
      if (val == null) return '0.00'
      return Number(val).toFixed(2)
    },

    fmt2Money(val) {
      if (val == null) return '0.00'
      return Number(val).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    },

    fmtSign2w(val) {
      if (val == null) return '0.00'
      const v = Number(val)
      const abs = Math.abs(v).toFixed(2)
      if (v > 0) return `+${abs}`
      if (v < 0) return `-${abs}`
      return abs
    },

    fmtSign2(val) {
      if (val == null) return '0.00'
      const v = Number(val)
      const abs = Math.abs(v).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
      if (v > 0) return `+${abs}`
      if (v < 0) return `-${abs}`
      return abs
    },

    signClass(val) {
      if (val > 0) return 'loss-positive'
      if (val < 0) return 'loss-negative'
      return ''
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/web';
@import '@/assets/scss/custom-style/standard-form.scss';

.form-row {
  display: grid;
  gap: var(--sp-md);

  &.two-col {
    grid-template-columns: 1fr 1fr;

    @media (max-width: 1024px) {
      grid-template-columns: 1fr;
    }
  }
}

.calc-summary {
  border: 1px solid var(--base-green);
  border-radius: var(--radius-md);
  padding: var(--sp-md) var(--sp-lg);

  &.calc-zero {
    background: var(--color-card-bg);
    border-color: var(--base-green);

    .calc-label,
    .calc-value,
    .money-hint {
      color: var(--base-font-color);
    }
  }

  &.calc-negative {
    background: var(--base-font-color);
    border-color: var(--base-font-color);

    .calc-label,
    .calc-value,
    .money-hint {
      color: var(--color-card-bg);
    }
  }

  &.calc-positive {
    background: var(--base-green);
    border-color: var(--base-green);

    .calc-label,
    .calc-value,
    .money-hint {
      color: var(--color-card-bg);
    }
  }
}

.calc-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--sp-xs) 0;
}

.calc-label {
  font-weight: 700;
  font-size: var(--fs-base);
}

.calc-value {
  font-weight: 700;
  font-size: var(--fs-base);
  text-align: right;
}

.highlight {
  .calc-label,
  .calc-value {
    font-size: var(--fs-lg);
  }
}

.money-row {
  border-top: 1px solid currentColor;
  padding-top: var(--sp-sm);
  margin-top: var(--sp-xs);

  .calc-label,
  .calc-value {
    font-size: var(--fs-lg);
  }
}

.money-value {
  font-size: var(--fs-xl);
}

.money-hint {
  font-size: var(--fs-sm);
  font-weight: 400;
}

.negative-loss-banner {
  display: flex;
  align-items: flex-start;
  gap: var(--sp-sm);
  background: var(--color-highlight-bg);
  border: 1px solid var(--base-warning);
  border-radius: var(--radius-md);
  padding: var(--sp-md) var(--sp-lg);
  color: var(--base-font-color);
  font-size: var(--fs-base);

  i {
    color: var(--base-warning);
    margin-top: 2px;
  }
}

.price-hint {
  color: var(--base-font-color);
  opacity: 0.65;
  font-size: var(--fs-sm);
  margin-top: var(--sp-xs);
}

.price-diff-warning {
  color: var(--base-warning);
  font-size: var(--fs-sm);
  margin-top: var(--sp-xs);
  font-weight: 600;
}
</style>
