<template>
  <SectionCardGeneric
    :title="$t('view.sale.billingNote.step4Title')"
    icon="bi-calculator"
    accent="main"
    headerStyle="legend"
  >
    <div class="form-row four-col mb-3">
      <FormFieldGeneric :label="$t('view.sale.billingNote.goldResizeQty')">
        <InputTextGeneric
          type="number"
          :modelValue="goldResizeQty"
          @update:modelValue="$emit('update:goldResizeQty', $event)"
        />
      </FormFieldGeneric>
      <FormFieldGeneric :label="$t('view.sale.billingNote.goldResizeAmount')">
        <InputTextGeneric
          type="number"
          step="0.01"
          :modelValue="goldResizeAmount"
          @update:modelValue="$emit('update:goldResizeAmount', $event)"
        />
      </FormFieldGeneric>
      <FormFieldGeneric :label="$t('view.sale.billingNote.silverResizeQty')">
        <InputTextGeneric
          type="number"
          :modelValue="silverResizeQty"
          @update:modelValue="$emit('update:silverResizeQty', $event)"
        />
      </FormFieldGeneric>
      <FormFieldGeneric :label="$t('view.sale.billingNote.silverResizeAmount')">
        <InputTextGeneric
          type="number"
          step="0.01"
          :modelValue="silverResizeAmount"
          @update:modelValue="$emit('update:silverResizeAmount', $event)"
        />
      </FormFieldGeneric>
    </div>

    <div class="form-row two-col mb-3">
      <FormFieldGeneric :label="$t('view.sale.billingNote.vatPercent')" :required="true">
        <InputTextGeneric
          type="number"
          step="0.01"
          :modelValue="vatPercent"
          @update:modelValue="$emit('update:vatPercent', $event)"
        />
      </FormFieldGeneric>
      <FormFieldGeneric :label="$t('common.field.remark')">
        <TextareaGeneric
          :modelValue="remark"
          :rows="2"
          @update:modelValue="$emit('update:remark', $event)"
        />
      </FormFieldGeneric>
    </div>

    <div class="calc-summary">
      <div class="calc-row">
        <span class="calc-label">{{ $t('view.sale.billingNote.subTotal') }}</span>
        <span class="calc-value">{{ formatNumber(subTotal) }}</span>
      </div>
      <div class="calc-row">
        <span class="calc-label">{{ $t('view.sale.billingNote.vatAmount') }}</span>
        <span class="calc-value">{{ formatNumber(vatAmount) }}</span>
      </div>
      <div class="calc-row highlight">
        <span class="calc-label fw-bold">{{ $t('view.sale.billingNote.grandTotal') }}</span>
        <span class="calc-value fw-bold">{{ formatNumber(grandTotal) }}</span>
      </div>
    </div>

    <div class="d-flex justify-content-end mt-3">
      <ButtonGeneric
        variant="main"
        icon="bi-save"
        :label="$t('common.btn.save')"
        :disabled="!canSave"
        @click="$emit('save')"
      />
    </div>
  </SectionCardGeneric>
</template>

<script>
import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import FormFieldGeneric from '@/components/generic/FormFieldGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import TextareaGeneric from '@/components/generic/TextareaGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import { formatNumber } from '@/services/utils/decimal.js'

export default {
  name: 'BillingNoteSummarySection',

  components: {
    SectionCardGeneric,
    FormFieldGeneric,
    InputTextGeneric,
    TextareaGeneric,
    ButtonGeneric
  },

  props: {
    goldResizeQty: { type: [String, Number], default: 0 },
    goldResizeAmount: { type: [String, Number], default: 0 },
    silverResizeQty: { type: [String, Number], default: 0 },
    silverResizeAmount: { type: [String, Number], default: 0 },
    vatPercent: { type: [String, Number], default: 7 },
    remark: { type: String, default: '' },
    subTotal: { type: Number, default: 0 },
    vatAmount: { type: Number, default: 0 },
    grandTotal: { type: Number, default: 0 },
    canSave: { type: Boolean, default: false }
  },

  emits: [
    'update:goldResizeQty',
    'update:goldResizeAmount',
    'update:silverResizeQty',
    'update:silverResizeAmount',
    'update:vatPercent',
    'update:remark',
    'save'
  ],

  methods: {
    formatNumber(val) {
      return formatNumber(val, 2)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/web';

.form-row {
  display: grid;
  gap: var(--sp-md);

  &.two-col {
    grid-template-columns: 1fr 1fr;

    @media (max-width: 1024px) {
      grid-template-columns: 1fr;
    }
  }

  &.four-col {
    grid-template-columns: repeat(4, 1fr);

    @media (max-width: 1024px) {
      grid-template-columns: 1fr 1fr;
    }

    @media (max-width: 600px) {
      grid-template-columns: 1fr;
    }
  }
}

.calc-summary {
  border: 1px solid var(--base-green);
  border-radius: var(--radius-md);
  padding: var(--sp-md) var(--sp-lg);
  background: var(--color-card-bg);
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
  color: var(--base-font-color);
}

.calc-value {
  font-weight: 700;
  font-size: var(--fs-base);
  text-align: right;
  color: var(--base-font-color);
}

.highlight {
  .calc-label,
  .calc-value {
    font-size: var(--fs-lg);
  }
}
</style>
