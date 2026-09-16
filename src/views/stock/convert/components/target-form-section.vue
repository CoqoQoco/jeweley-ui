<template>
  <div class="target-form">
    <div class="form-row two-col">
      <FormFieldGeneric :label="$t('view.stock.convert.productNumber')" :required="true">
        <InputTextGeneric v-model.trim="form.productNumber" />
      </FormFieldGeneric>
      <FormFieldGeneric :label="$t('view.stock.convert.mold')">
        <InputTextGeneric v-model.trim="form.mold" />
      </FormFieldGeneric>
    </div>

    <div class="form-row two-col">
      <FormFieldGeneric :label="$t('view.stock.convert.productNameEn')">
        <InputTextGeneric v-model.trim="form.productNameEn" />
      </FormFieldGeneric>
      <FormFieldGeneric :label="$t('view.stock.convert.productNameTh')">
        <InputTextGeneric v-model.trim="form.productNameTh" />
      </FormFieldGeneric>
    </div>

    <div class="form-row two-col">
      <FormFieldGeneric :label="$t('view.stock.convert.productType')">
        <DropdownGeneric
          v-model="form.productType"
          :options="masterProductType"
          optionLabel="description"
          optionValue="code"
          :showClear="true"
        />
      </FormFieldGeneric>
      <FormFieldGeneric :label="$t('view.stock.convert.size')">
        <InputTextGeneric v-model.trim="form.size" />
      </FormFieldGeneric>
    </div>

    <div class="form-row two-col">
      <FormFieldGeneric :label="$t('view.stock.convert.goldColor')">
        <DropdownGeneric
          v-model="form.productionType"
          :options="masterGold"
          optionLabel="nameTh"
          optionValue="nameEn"
          :showClear="true"
        />
      </FormFieldGeneric>
      <FormFieldGeneric :label="$t('view.stock.convert.goldSize')">
        <DropdownGeneric
          v-model="form.productionTypeSize"
          :options="masterGoldSize"
          optionLabel="nameTh"
          optionValue="nameEn"
          :showClear="true"
        />
      </FormFieldGeneric>
    </div>

    <SectionCardGeneric :title="$t('view.stock.convert.materialsTitle')" headerStyle="legend" icon="bi-gem" accent="main" class="mt-3">
      <materialsEditor v-model="form.materials" />
    </SectionCardGeneric>

    <div class="form-row two-col mt-3">
      <FormFieldGeneric :label="$t('view.stock.convert.convertCostLabel')" :required="true">
        <InputTextGeneric type="number" :min="0" :step="0.01" v-model.number="localConvertCost" />
      </FormFieldGeneric>
      <FormFieldGeneric :label="$t('view.stock.convert.targetLocationLabel')">
        <DropdownGeneric
          v-model="localLocationCode"
          :options="locationOptions"
          optionLabel="label"
          optionValue="value"
          :showClear="true"
        />
      </FormFieldGeneric>
    </div>

    <div class="form-row two-col">
      <FormFieldGeneric :label="$t('view.stock.convert.defaultPriceLabel')">
        <InputTextGeneric type="number" :min="0" :step="0.01" v-model.number="form.defaultPrice" />
      </FormFieldGeneric>
      <div class="new-cost-box">
        <span class="new-cost-label">{{ $t('view.stock.convert.newCostLabel') }}</span>
        <span class="new-cost-value">{{ formatDecimal(newCost, 2) }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { useMasterApiStore } from '@/stores/modules/api/master-store.js'
import { useStockLocationApiStore } from '@/stores/modules/api/stock/stock-location-api.js'
import { formatDecimal } from '@/services/utils/decimal.js'

import FormFieldGeneric from '@/components/generic/FormFieldGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import DropdownGeneric from '@/components/prime-vue/DropdownGeneric.vue'
import materialsEditor from './materials-editor.vue'

export default {
  name: 'StockConvertTargetFormSection',

  components: {
    FormFieldGeneric,
    InputTextGeneric,
    SectionCardGeneric,
    DropdownGeneric,
    materialsEditor
  },

  props: {
    modelValue: {
      type: Object,
      default: () => ({})
    },
    convertCost: {
      type: [Number, String],
      default: 0
    },
    locationCode: {
      type: String,
      default: null
    },
    sourceCostTotal: {
      type: Number,
      default: 0
    }
  },

  emits: ['update:modelValue', 'update:convertCost', 'update:locationCode'],

  setup() {
    const masterStore = useMasterApiStore()
    const locationStore = useStockLocationApiStore()
    return { masterStore, locationStore }
  },

  computed: {
    form: {
      get() {
        return this.modelValue
      },
      set(val) {
        this.$emit('update:modelValue', val)
      }
    },

    localConvertCost: {
      get() {
        return this.convertCost
      },
      set(val) {
        this.$emit('update:convertCost', val)
      }
    },

    localLocationCode: {
      get() {
        return this.locationCode
      },
      set(val) {
        this.$emit('update:locationCode', val)
      }
    },

    newCost() {
      return (Number(this.sourceCostTotal) || 0) + (Number(this.convertCost) || 0)
    },

    masterProductType() {
      return this.masterStore.productType
    },
    masterGold() {
      return this.masterStore.gold
    },
    masterGoldSize() {
      return this.masterStore.goldSize
    },
    locationOptions() {
      return this.locationStore.all
        .filter((item) => item.isActive)
        .map((item) => ({ value: item.code, label: `${item.code} — ${item.nameTh}` }))
    }
  },

  created() {
    if (!this.masterStore.productType.length) this.masterStore.fetchProductType()
    if (!this.masterStore.gold.length) this.masterStore.fetchGold()
    if (!this.masterStore.goldSize.length) this.masterStore.fetchGoldSize()
    this.locationStore.fetchAllForMap()
  },

  methods: {
    formatDecimal
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/mixin.scss';

.target-form {
  display: flex;
  flex-direction: column;
}

.form-row {
  @include form-row-grid(2);
  margin-bottom: var(--sp-lg);
}

.new-cost-box {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: var(--sp-xs);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--sp-md) var(--sp-lg);
  background: var(--color-highlight-bg);
}

.new-cost-label {
  font-size: var(--fs-sm);
  color: var(--base-sub-color);
}

.new-cost-value {
  font-weight: 700;
  color: var(--base-font-color);
  font-size: var(--fs-lg);
}
</style>
