<template>
  <SectionCardGeneric headerStyle="legend" icon="bi-journal-text" accent="main" :title="$t('view.production.planGold.sectionGoldInfo')">
    <div class="form-row four-col">
      <FormFieldGeneric :label="$t('view.production.planGold.fieldBookNo')" :required="true" inputId="gold-book-no">
        <InputTextGeneric id="gold-book-no" :modelValue="modelValue.bookNo" :disabled="mode === 'edit'" required @update:modelValue="update('bookNo', $event)" />
      </FormFieldGeneric>
      <FormFieldGeneric :label="$t('view.production.planGold.fieldNo')" :required="true" inputId="gold-no">
        <InputTextGeneric id="gold-no" :modelValue="modelValue.no" :disabled="mode === 'edit'" required @update:modelValue="update('no', $event)" />
      </FormFieldGeneric>
      <FormFieldGeneric :label="$t('view.production.planGold.fieldAssignDate')" :required="true" :error="errors.assignDate" inputId="gold-assign-date">
        <CalendarGeneric inputId="gold-assign-date" class="w-100" :modelValue="modelValue.assignDate" dateFormat="dd/mm/yy" showIcon showButtonBar @update:modelValue="update('assignDate', $event)" />
      </FormFieldGeneric>
      <FormFieldGeneric :label="$t('view.production.planGold.fieldCost')" :required="true" inputId="gold-cost">
        <InputTextGeneric id="gold-cost" type="number" step="any" :min="0" class="text-right" required :modelValue="modelValue.cost" @update:modelValue="update('cost', toNum($event))" />
      </FormFieldGeneric>
    </div>

    <div class="form-row four-col">
      <FormFieldGeneric :label="$t('view.production.planGold.fieldGoldType')" :required="true" :error="errors.gold">
        <DropdownGeneric inputId="gold-type" :ariaLabel="$t('view.production.planGold.fieldGoldType')" :modelValue="modelValue.gold" :options="masterGold" optionLabel="description" :showClear="!!modelValue.gold?.code" @update:modelValue="update('gold', $event)" />
      </FormFieldGeneric>
      <FormFieldGeneric :label="$t('view.production.planGold.fieldGoldPercent')" :required="true" :error="errors.goldSize">
        <DropdownGeneric inputId="gold-size" :ariaLabel="$t('view.production.planGold.fieldGoldPercent')" :modelValue="modelValue.goldSize" :options="masterGoldSize" optionLabel="description" :showClear="!!modelValue.goldSize?.code" @update:modelValue="update('goldSize', $event)" />
      </FormFieldGeneric>
      <FormFieldGeneric :label="$t('view.production.planGold.fieldGoldReceipt')" :required="true" inputId="gold-receipt">
        <InputTextGeneric id="gold-receipt" required :modelValue="modelValue.goldReceipt" @update:modelValue="update('goldReceipt', $event)" />
      </FormFieldGeneric>
      <div></div>
    </div>

    <div class="form-row four-col">
      <FormFieldGeneric :label="$t('view.production.planGold.fieldAssignBy')" inputId="gold-assign-by">
        <InputTextGeneric id="gold-assign-by" :modelValue="modelValue.assignBy" @update:modelValue="update('assignBy', $event)" />
      </FormFieldGeneric>
      <FormFieldGeneric :label="$t('view.production.planGold.fieldReceiveBy')" inputId="gold-receive-by">
        <InputTextGeneric id="gold-receive-by" :modelValue="modelValue.receiveBy" @update:modelValue="update('receiveBy', $event)" />
      </FormFieldGeneric>
      <div></div>
      <div></div>
    </div>

    <div class="form-row">
      <FormFieldGeneric :label="$t('view.production.planGold.fieldRemark')" inputId="gold-remark">
        <TextareaGeneric id="gold-remark" :modelValue="modelValue.remark" @update:modelValue="update('remark', $event)" />
      </FormFieldGeneric>
    </div>
  </SectionCardGeneric>
</template>

<script>
// External dependencies
import { toNullableNumber } from '@/services/utils/decimal.js'

// Local components
import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import FormFieldGeneric from '@/components/generic/FormFieldGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import TextareaGeneric from '@/components/generic/TextareaGeneric.vue'
import CalendarGeneric from '@/components/prime-vue/CalendarGeneric.vue'
import DropdownGeneric from '@/components/prime-vue/DropdownGeneric.vue'

export default {
  name: 'GoldInfoSection',

  components: {
    SectionCardGeneric,
    FormFieldGeneric,
    InputTextGeneric,
    TextareaGeneric,
    CalendarGeneric,
    DropdownGeneric
  },

  props: {
    modelValue: {
      type: Object,
      required: true
    },
    errors: {
      type: Object,
      default: () => ({})
    },
    masterGold: {
      type: Array,
      default: () => []
    },
    masterGoldSize: {
      type: Array,
      default: () => []
    },
    mode: {
      type: String,
      default: 'create',
      validator: (v) => ['create', 'edit'].includes(v)
    }
  },

  emits: ['update:modelValue'],

  methods: {
    toNum(val) {
      return toNullableNumber(val)
    },
    update(field, value) {
      this.$emit('update:modelValue', { ...this.modelValue, [field]: value })
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/mixin.scss';

.form-row {
  margin-bottom: var(--sp-lg);

  &.four-col {
    @include form-row-grid(4);
  }
}
</style>
