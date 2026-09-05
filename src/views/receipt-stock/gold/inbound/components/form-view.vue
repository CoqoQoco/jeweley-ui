<template>
  <SectionCardGeneric headerStyle="legend" icon="bi-box-arrow-in-down" accent="main" :title="$t('view.receiptStock.gold.inbound.sectionTitle')">
    <div class="form-row two-col">
      <FormFieldGeneric :label="$t('view.receiptStock.gold.inbound.fieldMode')" :required="true">
        <DropdownGeneric
          inputId="gold-mode"
          :ariaLabel="$t('view.receiptStock.gold.inbound.fieldMode')"
          :modelValue="mode"
          :options="modeOptions"
          optionLabel="label"
          optionValue="value"
          @update:modelValue="$emit('update:mode', $event)"
        />
      </FormFieldGeneric>
      <FormFieldGeneric v-if="mode === 'adjust'" :label="$t('view.receiptStock.gold.inbound.fieldAdjustDirection')" :required="true">
        <RadioGroupGeneric
          :modelValue="modelValue.adjustType"
          :options="adjustTypeOptions"
          optionLabel="label"
          optionValue="value"
          :inline="true"
          @update:modelValue="update('adjustType', $event)"
        />
      </FormFieldGeneric>
    </div>

    <div class="form-row four-col">
      <FormFieldGeneric :label="$t('view.receiptStock.gold.inbound.fieldGoldType')" :required="true">
        <DropdownGeneric
          inputId="gold-type"
          :ariaLabel="$t('view.receiptStock.gold.inbound.fieldGoldType')"
          :modelValue="modelValue.goldCode"
          :options="masterGold"
          optionLabel="description"
          optionValue="code"
          :showClear="!!modelValue.goldCode"
          @update:modelValue="update('goldCode', $event)"
        />
      </FormFieldGeneric>
      <FormFieldGeneric :label="$t('view.receiptStock.gold.inbound.fieldGoldPercent')" :required="true">
        <DropdownGeneric
          inputId="gold-size"
          :ariaLabel="$t('view.receiptStock.gold.inbound.fieldGoldPercent')"
          :modelValue="modelValue.goldSizeCode"
          :options="masterGoldSize"
          optionLabel="description"
          optionValue="code"
          :showClear="!!modelValue.goldSizeCode"
          @update:modelValue="update('goldSizeCode', $event)"
        />
      </FormFieldGeneric>
      <FormFieldGeneric :label="$t('view.receiptStock.gold.inbound.fieldWeight')" :required="true" inputId="gold-weight">
        <InputTextGeneric
          id="gold-weight"
          type="number"
          step="any"
          :min="0"
          class="text-right"
          :modelValue="modelValue.weight"
          @update:modelValue="update('weight', toNum($event))"
        />
      </FormFieldGeneric>
      <FormFieldGeneric :label="$t('view.receiptStock.gold.inbound.fieldRequestDate')" inputId="gold-request-date">
        <CalendarGeneric
          inputId="gold-request-date"
          class="w-100"
          :modelValue="modelValue.requestDate"
          dateFormat="dd/mm/yy"
          :showIcon="true"
          :showButtonBar="true"
          @update:modelValue="update('requestDate', $event)"
        />
      </FormFieldGeneric>
    </div>

    <div class="form-row">
      <FormFieldGeneric
        :label="$t('view.receiptStock.gold.inbound.fieldRemark')"
        :required="mode === 'adjust'"
        inputId="gold-remark"
      >
        <TextareaGeneric id="gold-remark" :modelValue="modelValue.remark" @update:modelValue="update('remark', $event)" />
      </FormFieldGeneric>
    </div>

    <div class="mt-3">
      <ButtonGeneric variant="main" icon="bi-save" :label="$t('common.btn.save')" @click="$emit('submit')" />
    </div>
  </SectionCardGeneric>
</template>

<script>
import { toNullableNumber } from '@/services/utils/decimal.js'
import { useMasterApiStore } from '@/stores/modules/api/master-store.js'

import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import FormFieldGeneric from '@/components/generic/FormFieldGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import TextareaGeneric from '@/components/generic/TextareaGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import CalendarGeneric from '@/components/prime-vue/CalendarGeneric.vue'
import DropdownGeneric from '@/components/prime-vue/DropdownGeneric.vue'
import RadioGroupGeneric from '@/components/prime-vue/RadioGroupGeneric.vue'

export default {
  name: 'StockGoldInboundFormView',

  components: {
    SectionCardGeneric,
    FormFieldGeneric,
    InputTextGeneric,
    TextareaGeneric,
    ButtonGeneric,
    CalendarGeneric,
    DropdownGeneric,
    RadioGroupGeneric
  },

  setup() {
    const masterStore = useMasterApiStore()
    return { masterStore }
  },

  props: {
    mode: {
      type: String,
      default: 'inbound'
    },
    modelValue: {
      type: Object,
      required: true
    }
  },

  emits: ['update:mode', 'update:modelValue', 'submit'],

  computed: {
    masterGold() {
      return this.masterStore.gold
    },
    masterGoldSize() {
      return this.masterStore.goldSize
    },
    modeOptions() {
      return [
        { value: 'inbound', label: this.$t('view.receiptStock.gold.inbound.modeInbound') },
        { value: 'openingBalance', label: this.$t('view.receiptStock.gold.inbound.modeOpeningBalance') },
        { value: 'adjust', label: this.$t('view.receiptStock.gold.inbound.modeAdjust') }
      ]
    },
    adjustTypeOptions() {
      return [
        { value: 5, label: this.$t('view.receiptStock.gold.inbound.adjustIncrease') },
        { value: 6, label: this.$t('view.receiptStock.gold.inbound.adjustDecrease') }
      ]
    }
  },

  created() {
    this.masterStore.fetchGold()
    this.masterStore.fetchGoldSize()
  },

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

  &.two-col {
    @include form-row-grid(2);
  }

  &.four-col {
    @include form-row-grid(4);
  }
}
</style>
