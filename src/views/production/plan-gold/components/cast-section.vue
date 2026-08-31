<!-- modelValue = whole plan-gold form object; cast fields also own modelValue.items (body return rows) used by the cast balance calc -->
<template>
  <SectionCardGeneric headerStyle="legend" icon="bi-journal-text" accent="main" :title="$t('view.production.planGold.sectionCastInfo')" class="mt-4">
    <div class="form-row four-col">
      <FormFieldGeneric :label="$t('view.production.planGold.fieldCastDate')" inputId="cast-date">
        <CalendarGeneric inputId="cast-date" class="w-100" :modelValue="modelValue.castDate" dateFormat="dd/mm/yy" showIcon showButtonBar @update:modelValue="update('castDate', $event)" />
      </FormFieldGeneric>
      <FormFieldGeneric :label="$t('view.production.planGold.fieldCastWeight')" inputId="cast-weight">
        <InputTextGeneric id="cast-weight" type="number" step="any" :min="0" class="text-right" :modelValue="modelValue.castWeight" @update:modelValue="update('castWeight', toNum($event))" />
      </FormFieldGeneric>
      <div></div>
      <div></div>
    </div>

    <div class="form-row four-col">
      <FormFieldGeneric :label="$t('view.production.planGold.fieldReturnCastWeight')" inputId="cast-return-weight">
        <InputTextGeneric id="cast-return-weight" type="number" step="any" :min="0" class="text-right" :modelValue="modelValue.returnCastWeight" @update:modelValue="update('returnCastWeight', toNum($event))" />
      </FormFieldGeneric>
      <FormFieldGeneric :label="$t('view.production.planGold.fieldReturnMold')" inputId="cast-return-mold">
        <InputTextGeneric id="cast-return-mold" type="number" step="any" :min="0" class="text-right" :modelValue="modelValue.returnCastMoldWeight" @update:modelValue="update('returnCastMoldWeight', toNum($event))" />
      </FormFieldGeneric>
      <FormFieldGeneric :label="$t('view.production.planGold.fieldReturnBodyBroken')" inputId="cast-return-body-broken">
        <InputTextGeneric id="cast-return-body-broken" type="number" step="any" :min="0" class="text-right" :modelValue="modelValue.returnCastBodyBrokenWeight" @update:modelValue="update('returnCastBodyBrokenWeight', toNum($event))" />
      </FormFieldGeneric>
      <FormFieldGeneric :label="$t('view.production.planGold.fieldReturnBodyTotal')" inputId="cast-return-body-total">
        <InputTextGeneric id="cast-return-body-total" type="number" class="text-right" disabled :modelValue="fmt2(sumBodyReturn)" />
      </FormFieldGeneric>
    </div>

    <div class="form-row four-col">
      <FormFieldGeneric :label="$t('view.production.planGold.fieldReturnPowder')" inputId="cast-return-powder">
        <InputTextGeneric id="cast-return-powder" type="number" step="any" :min="0" class="text-right" :modelValue="modelValue.returnCastPowderWeight" @update:modelValue="update('returnCastPowderWeight', toNum($event))" />
      </FormFieldGeneric>
      <FormFieldGeneric :label="$t('view.production.planGold.fieldWeightLoss')" inputId="cast-weight-loss">
        <InputTextGeneric id="cast-weight-loss" type="number" step="any" :min="0" class="text-right" :disabled="modelValue.castWeightOver > 0" :modelValue="modelValue.castWeightLoss" @update:modelValue="update('castWeightLoss', toNum($event))" />
      </FormFieldGeneric>
      <FormFieldGeneric :label="$t('view.production.planGold.fieldWeightOver')" inputId="cast-weight-over">
        <InputTextGeneric id="cast-weight-over" type="number" step="any" :min="0" class="text-right" :disabled="modelValue.castWeightLoss > 0" :modelValue="modelValue.castWeightOver" @update:modelValue="update('castWeightOver', toNum($event))" />
      </FormFieldGeneric>
      <div></div>
    </div>

    <SectionCardGeneric headerStyle="legend" accent="green" :title="$t('view.production.planGold.fieldReturnScrap')" class="mt-4">
      <div class="form-row two-col">
        <FormFieldGeneric :label="$t('view.production.planGold.fieldReturnScrap')" inputId="cast-scrap-weight">
          <InputTextGeneric id="cast-scrap-weight" type="number" step="any" :min="0" class="text-right" :modelValue="modelValue.returnCastScrapWeight" @update:modelValue="update('returnCastScrapWeight', toNum($event))" />
        </FormFieldGeneric>
        <FormFieldGeneric :label="$t('view.production.planGold.fieldReturnScrapDate')" inputId="cast-scrap-date">
          <CalendarGeneric inputId="cast-scrap-date" class="w-100" :modelValue="modelValue.returnCastScrapWeightDate" dateFormat="dd/mm/yy" showIcon showButtonBar @update:modelValue="update('returnCastScrapWeightDate', $event)" />
        </FormFieldGeneric>
      </div>
    </SectionCardGeneric>

    <BodyReturnTable :items="modelValue.items" @update:items="update('items', $event)" />

    <BalancePanel :title="$t('view.production.planGold.balanceCastTitle')" :balance="castBalance" @apply="applyCastBalance" />
  </SectionCardGeneric>
</template>

<script>
// External dependencies
import { fmt2 } from '@/services/utils/gold-loss-tang-calc.js'
import { calcCastBalance } from '@/services/utils/gold-cost-balance.js'
import { toNullableNumber } from '@/services/utils/decimal.js'

// Local components
import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import FormFieldGeneric from '@/components/generic/FormFieldGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import CalendarGeneric from '@/components/prime-vue/CalendarGeneric.vue'
import BodyReturnTable from './body-return-table.vue'
import BalancePanel from './balance-panel.vue'

export default {
  name: 'CastSection',

  components: {
    SectionCardGeneric,
    FormFieldGeneric,
    InputTextGeneric,
    CalendarGeneric,
    BodyReturnTable,
    BalancePanel
  },

  props: {
    modelValue: {
      type: Object,
      required: true
    }
  },

  emits: ['update:modelValue'],

  computed: {
    sumBodyReturn() {
      const items = this.modelValue.items || []
      return items.reduce((sum, x) => sum + (parseFloat(x.returnWeight) || 0), 0)
    },
    castBalance() {
      return calcCastBalance(
        this.modelValue.castWeight,
        this.modelValue.returnCastWeight,
        this.modelValue.returnCastMoldWeight,
        this.modelValue.returnCastBodyBrokenWeight,
        this.sumBodyReturn,
        this.modelValue.returnCastPowderWeight,
        this.modelValue.returnCastScrapWeight
      )
    }
  },

  methods: {
    fmt2(val) {
      return fmt2(val)
    },
    toNum(val) {
      return toNullableNumber(val)
    },
    update(field, value) {
      this.$emit('update:modelValue', { ...this.modelValue, [field]: value })
    },
    applyCastBalance() {
      if (this.castBalance.diff > 0) {
        this.$emit('update:modelValue', {
          ...this.modelValue,
          castWeightLoss: this.castBalance.amount,
          castWeightOver: null
        })
      } else if (this.castBalance.diff < 0) {
        this.$emit('update:modelValue', {
          ...this.modelValue,
          castWeightOver: this.castBalance.amount,
          castWeightLoss: null
        })
      }
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

  &.two-col {
    @include form-row-grid(2);
  }
}
</style>
