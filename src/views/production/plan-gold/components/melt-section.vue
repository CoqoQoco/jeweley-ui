<!-- modelValue = whole plan-gold form object; melt fields read modelValue.gold/goldSize (owned by gold-info-section) for the zill lookup, and write back only their own fields via update() -->
<template>
  <SectionCardGeneric headerStyle="legend" icon="bi-journal-text" accent="main" :title="$t('view.production.planGold.sectionMeltInfo')" class="mt-4">
    <div class="form-row four-col">
      <FormFieldGeneric :label="$t('view.production.planGold.fieldMeltDate')" inputId="melt-date">
        <CalendarGeneric inputId="melt-date" class="w-100" :modelValue="modelValue.meltDate" dateFormat="dd/mm/yy" showIcon showButtonBar @update:modelValue="update('meltDate', $event)" />
      </FormFieldGeneric>
      <FormFieldGeneric :label="$t('view.production.planGold.fieldMeltWeight')" inputId="melt-weight">
        <InputTextGeneric id="melt-weight" type="number" step="any" :min="0" class="text-right" :modelValue="modelValue.meltWeight" @update:modelValue="update('meltWeight', toNum($event))" />
      </FormFieldGeneric>
      <FormFieldGeneric :label="$t('view.production.planGold.fieldReturnMeltWeight')" inputId="melt-return-weight">
        <InputTextGeneric id="melt-return-weight" type="number" step="any" :min="0" class="text-right" :modelValue="modelValue.returnMeltWeight" @update:modelValue="update('returnMeltWeight', toNum($event))" />
      </FormFieldGeneric>
      <div></div>
    </div>

    <div class="form-row four-col">
      <FormFieldGeneric :label="$t('view.production.planGold.fieldWeightLoss')" inputId="melt-weight-loss">
        <InputTextGeneric id="melt-weight-loss" type="number" step="any" :min="0" class="text-right" :disabled="modelValue.meltWeightOver > 0" :modelValue="modelValue.meltWeightLoss" @update:modelValue="update('meltWeightLoss', toNum($event))" />
      </FormFieldGeneric>
      <FormFieldGeneric :label="$t('view.production.planGold.fieldWeightOver')" inputId="melt-weight-over">
        <InputTextGeneric id="melt-weight-over" type="number" step="any" :min="0" class="text-right" :disabled="modelValue.meltWeightLoss > 0" :modelValue="modelValue.meltWeightOver" @update:modelValue="update('meltWeightOver', toNum($event))" />
      </FormFieldGeneric>
      <FormFieldGeneric :label="$t('view.production.planGold.fieldZill')" inputId="melt-zill">
        <AutoCompleteGeneric
          inputId="melt-zill"
          :modelValue="modelValue.zill"
          :suggestions="zillItemSearch"
          :placeholder="$t('view.production.planGold.placeholderZill')"
          :forceSelection="true"
          :minLength="3"
          :disabled="!modelValue.gold || !modelValue.goldSize"
          @complete="onSearchZill"
          @update:modelValue="update('zill', $event)"
        />
      </FormFieldGeneric>
      <FormFieldGeneric :label="$t('view.production.planGold.fieldZillQty')" inputId="melt-zill-qty">
        <InputTextGeneric id="melt-zill-qty" type="number" step="any" :min="0" class="text-right" :disabled="!modelValue.gold || !modelValue.goldSize || !modelValue.zill" :modelValue="modelValue.zillQty" @update:modelValue="update('zillQty', toNum($event))" />
      </FormFieldGeneric>
    </div>

    <SectionCardGeneric headerStyle="legend" accent="green" :title="$t('view.production.planGold.fieldReturnScrap')" class="mt-4">
      <div class="form-row two-col">
        <FormFieldGeneric :label="$t('view.production.planGold.fieldReturnScrap')" inputId="melt-scrap-weight">
          <InputTextGeneric id="melt-scrap-weight" type="number" step="any" :min="0" class="text-right" :modelValue="modelValue.returnMeltScrapWeight" @update:modelValue="update('returnMeltScrapWeight', toNum($event))" />
        </FormFieldGeneric>
        <FormFieldGeneric :label="$t('view.production.planGold.fieldReturnScrapDate')" inputId="melt-scrap-date">
          <CalendarGeneric inputId="melt-scrap-date" class="w-100" :modelValue="modelValue.returnMeltScrapWeightDate" dateFormat="dd/mm/yy" showIcon showButtonBar @update:modelValue="update('returnMeltScrapWeightDate', $event)" />
        </FormFieldGeneric>
      </div>
    </SectionCardGeneric>

    <BalancePanel :title="$t('view.production.planGold.balanceMeltTitle')" :balance="meltBalance" @apply="applyMeltBalance" />
  </SectionCardGeneric>
</template>

<script>
// External dependencies
import api from '@/axios/axios-helper.js'
import { calcMeltBalance } from '@/services/utils/gold-cost-balance.js'
import { toNullableNumber } from '@/services/utils/decimal.js'

// Local components
import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import FormFieldGeneric from '@/components/generic/FormFieldGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import CalendarGeneric from '@/components/prime-vue/CalendarGeneric.vue'
import AutoCompleteGeneric from '@/components/prime-vue/AutoCompleteGeneric.vue'
import BalancePanel from './balance-panel.vue'

export default {
  name: 'MeltSection',

  components: {
    SectionCardGeneric,
    FormFieldGeneric,
    InputTextGeneric,
    CalendarGeneric,
    AutoCompleteGeneric,
    BalancePanel
  },

  props: {
    modelValue: {
      type: Object,
      required: true
    }
  },

  emits: ['update:modelValue'],

  data() {
    return {
      zillItemSearch: []
    }
  },

  computed: {
    meltBalance() {
      return calcMeltBalance(
        this.modelValue.meltWeight,
        this.modelValue.returnMeltWeight,
        this.modelValue.returnMeltScrapWeight
      )
    }
  },

  methods: {
    toNum(val) {
      return toNullableNumber(val)
    },
    update(field, value) {
      this.$emit('update:modelValue', { ...this.modelValue, [field]: value })
    },
    applyMeltBalance() {
      if (this.meltBalance.diff > 0) {
        this.$emit('update:modelValue', {
          ...this.modelValue,
          meltWeightLoss: this.meltBalance.amount,
          meltWeightOver: null
        })
      } else if (this.meltBalance.diff < 0) {
        this.$emit('update:modelValue', {
          ...this.modelValue,
          meltWeightOver: this.meltBalance.amount,
          meltWeightLoss: null
        })
      }
    },
    async onSearchZill(e) {
      const param = {
        take: 0,
        skip: 0,
        sort: [],
        search: {
          type: 'ZILL',
          text: e.query ?? null,
          goldCode: this.modelValue.gold.code,
          goldSizeCode: this.modelValue.goldSize.code
        }
      }
      const res = await api.jewelry.post('Master/ListMaster', param)
      if (res) {
        this.zillItemSearch = res.data.map((x) => `${x.code}`)
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
