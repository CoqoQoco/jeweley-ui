<template>
  <SectionCardGeneric
    :title="$t('view.sale.billingNote.step4Title')"
    icon="bi-calculator"
    accent="main"
    headerStyle="legend"
  >
    <div class="form-row three-col mb-3">
      <FormFieldGeneric :label="$t('view.sale.billingNote.goldResizeQty')">
        <InputTextGeneric
          type="number"
          :modelValue="goldResizeQty"
          @update:modelValue="$emit('update:goldResizeQty', $event)"
        />
      </FormFieldGeneric>
      <FormFieldGeneric :label="$t('view.sale.billingNote.goldResizePerUnit')">
        <InputTextGeneric
          type="number"
          step="0.01"
          :modelValue="goldResizePerUnit"
          @update:modelValue="$emit('update:goldResizePerUnit', $event)"
        />
      </FormFieldGeneric>
      <FormFieldGeneric :label="$t('common.field.total')">
        <InputTextGeneric :modelValue="formatNumber(goldResizeAmount)" :readonly="true" bgInput="bg-input" />
      </FormFieldGeneric>
    </div>

    <div class="form-row three-col mb-3">
      <FormFieldGeneric :label="$t('view.sale.billingNote.silverResizeQty')">
        <InputTextGeneric
          type="number"
          :modelValue="silverResizeQty"
          @update:modelValue="$emit('update:silverResizeQty', $event)"
        />
      </FormFieldGeneric>
      <FormFieldGeneric :label="$t('view.sale.billingNote.silverResizePerUnit')">
        <InputTextGeneric
          type="number"
          step="0.01"
          :modelValue="silverResizePerUnit"
          @update:modelValue="$emit('update:silverResizePerUnit', $event)"
        />
      </FormFieldGeneric>
      <FormFieldGeneric :label="$t('common.field.total')">
        <InputTextGeneric :modelValue="formatNumber(silverResizeAmount)" :readonly="true" bgInput="bg-input" />
      </FormFieldGeneric>
    </div>

    <div class="total-resize-row mb-3">
      <span class="total-resize-label">{{ $t('view.sale.billingNote.totalResize') }}</span>
      <span class="total-resize-value">{{ formatNumber(totalResize) }}</span>
    </div>

    <CheckboxGeneric
      :modelValue="hasSupport"
      :label="$t('view.sale.billingNote.hasSupport')"
      class="mb-3"
      @update:modelValue="$emit('update:hasSupport', $event)"
    />

    <div :class="['form-row mb-3', hasSupport ? 'three-col' : 'two-col']">
      <FormFieldGeneric :label="$t('view.sale.billingNote.vatPercent')" :required="true">
        <InputTextGeneric
          type="number"
          step="0.01"
          :modelValue="vatPercent"
          @update:modelValue="$emit('update:vatPercent', $event)"
        />
      </FormFieldGeneric>
      <FormFieldGeneric v-if="hasSupport" :label="$t('view.sale.billingNote.supportPercent')">
        <InputTextGeneric
          type="number"
          step="0.01"
          :modelValue="supportPercent"
          @update:modelValue="$emit('update:supportPercent', $event)"
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
      <div v-if="hasSupport" class="calc-row">
        <span class="calc-label">{{ $t('view.sale.billingNote.supportAmount') }} {{ Number(supportPercent) || 0 }}%</span>
        <span class="calc-value">{{ formatNumber(supportAmount) }}</span>
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
import CheckboxGeneric from '@/components/prime-vue/CheckboxGeneric.vue'
import { formatNumber } from '@/services/utils/decimal.js'

export default {
  name: 'BillingNoteSummarySection',

  components: {
    SectionCardGeneric,
    FormFieldGeneric,
    InputTextGeneric,
    TextareaGeneric,
    ButtonGeneric,
    CheckboxGeneric
  },

  props: {
    goldResizeQty: { type: [String, Number], default: 0 },
    goldResizePerUnit: { type: [String, Number], default: 0 },
    goldResizeAmount: { type: Number, default: 0 },
    silverResizeQty: { type: [String, Number], default: 0 },
    silverResizePerUnit: { type: [String, Number], default: 0 },
    silverResizeAmount: { type: Number, default: 0 },
    totalResize: { type: Number, default: 0 },
    vatPercent: { type: [String, Number], default: 7 },
    supportPercent: { type: [String, Number], default: 0 },
    hasSupport: { type: Boolean, default: false },
    remark: { type: String, default: '' },
    subTotal: { type: Number, default: 0 },
    supportAmount: { type: Number, default: 0 },
    vatAmount: { type: Number, default: 0 },
    grandTotal: { type: Number, default: 0 },
    canSave: { type: Boolean, default: false }
  },

  emits: [
    'update:goldResizeQty',
    'update:goldResizePerUnit',
    'update:silverResizeQty',
    'update:silverResizePerUnit',
    'update:vatPercent',
    'update:supportPercent',
    'update:hasSupport',
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
    grid-template-columns: repeat(2, 1fr);

    @media (max-width: 1024px) {
      grid-template-columns: 1fr;
    }
  }

  &.three-col {
    grid-template-columns: repeat(3, 1fr);

    @media (max-width: 1024px) {
      grid-template-columns: 1fr;
    }
  }
}

.total-resize-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid var(--base-font-color);
  border-radius: var(--radius-md);
  padding: var(--sp-sm) var(--sp-lg);
  background: var(--color-highlight-bg);
}

.total-resize-label {
  font-weight: 700;
  font-size: var(--fs-lg);
  color: var(--base-font-color);
}

.total-resize-value {
  font-weight: 700;
  font-size: var(--fs-lg);
  color: var(--base-font-color);
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
