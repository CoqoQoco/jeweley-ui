<template>
  <div class="form-col-container">
    <div class="filter-container mt-2">
      <div class="d-flex justify-content-between">
        <div class="group-title pl-2">
          <div>
            <span class="title-text-lg bi bi-hammer"></span>
            <span class="title-text-lg ml-2">{{ $t('view.receiptStock.product.grProduction.materialComponents') }}</span>
          </div>
          <small class="pl-4"
            >{{ $t('view.receiptStock.product.grProduction.materialDescriptionBreakdown') }}</small
          >
        </div>
        <!-- Control buttons -->
        <div class="d-flex justify-content-start mt-2 gap-2">
          <div
            type="button"
            class="p-2 text-dark cursor-pointer"
            @click="$emit('addMaterial', data.materials)"
            :title="$t('view.receiptStock.product.grProduction.addMaterial')"
          >
            <span class="bi bi-plus-lg"></span>
          </div>
        </div>
      </div>

      <BaseDataTable
        :items="data.materials"
        :columns="materialColumns"
        :paginator="false"
        :scrollHeight="scrollHeight"
        class="custom-form-table-material"
      >
        <template #typeTemplate="{ data: materialData }">
          <div class="d-flex justify-content-center">
            <DropdownGeneric
              :modelValue="materialData.type"
              :options="masterMaterialType"
              optionLabel="description"
              optionValue="value"
              class="w-full"
              :class="materialData.type === true ? `p-invalid` : ``"
              @update:modelValue="materialData.type = $event; emitUpdateTypeBarcode(materialData)"
            />
          </div>
        </template>

        <!-- Type Name -->
        <template #typeNameTemplate="{ data: materialData }">
          <div class="d-flex justify-content-center">
            <AutoCompleteGeneric
              v-if="materialData.type === 'Gem'"
              :modelValue="materialData.typeName"
              :suggestions="gemSuggestions"
              optionLabel="name"
              :forceSelection="false"
              :placeholder="$t('view.receiptStock.product.grProduction.colMaterialName')"
              customClass="gem-autocomplete"
              @complete="onSearchGem"
              @update:modelValue="(val) => onSelectGem(val, materialData)"
            />
            <InputTextGeneric
              v-else
              v-model="materialData.typeName"
              :bgInput="getBgColor(false, materialData.typeName)"
              :placeholder="$t('view.receiptStock.product.grProduction.colMaterialName')"
              @blur="emitUpdateTypeBarcode(materialData)"
            />
          </div>
        </template>

        <template #typeCodeTemplate="{ data: materialData }">
          <div class="">
            <div v-if="materialData.type === 'Gold' || materialData.type === 'Silver'">
              <DropdownGeneric
                :modelValue="materialData.typeCode"
                :options="masterGold"
                optionLabel="description"
                optionValue="code"
                class="w-full"
                :placeholder="$t('view.receiptStock.product.grProduction.matTypeCode')"
                :showClear="materialData.typeCode ? true : false"
                @update:modelValue="materialData.typeCode = $event; emitUpdateTypeBarcode(materialData)"
              />
            </div>
            <div v-else-if="materialData.type === 'Diamond'">
              <DropdownGeneric
                :modelValue="materialData.typeCode"
                :options="masterDiamondGrade"
                optionLabel="description"
                optionValue="nameEn"
                class="w-full"
                :placeholder="$t('view.receiptStock.product.grProduction.matTypeCode')"
                :showClear="materialData.typeCode ? true : false"
                @update:modelValue="materialData.typeCode = $event; emitUpdateTypeBarcode(materialData)"
              />
            </div>
            <div v-else-if="materialData.type === 'Gem'">
              <DropdownGeneric
                :modelValue="materialData.typeCode"
                :options="masterGem"
                optionLabel="description"
                optionValue="nameEn"
                class="w-full"
                :placeholder="$t('view.receiptStock.product.grProduction.matTypeCode')"
                :showClear="materialData.typeCode ? true : false"
                @update:modelValue="materialData.typeCode = $event; emitUpdateTypeBarcode(materialData)"
              />
            </div>
            <div v-else class="vertical-center-container text-center">
              <span> --- {{ $t('view.receiptStock.product.grProduction.matType') }} ---</span>
            </div>
          </div>
        </template>

        <template #sizeTemplate="{ data: materialData }">
          <div class="d-flex justify-content-center">
            <InputTextGeneric
              v-model="materialData.size"
              :bgInput="getBgColor(false, materialData.size)"
              @blur="emitUpdateTypeBarcode(materialData)"
            />
          </div>
        </template>

        <template #regionTemplate="{ data: materialData }">
          <div>
            <InputTextGeneric
              v-model="materialData.region"
              :bgInput="getBgColor(false, materialData.region)"
              @blur="emitUpdateTypeBarcode(materialData)"
            />
            <div v-if="materialData.regionOrigin" class="region-from-plan-hint">
              {{ $t('view.receiptStock.product.grProduction.regionFromPlan', { region: materialData.regionOrigin }) }}
            </div>
          </div>
        </template>

        <template #qtyTemplate="{ data: materialData }">
          <div class="material-qty-container">
            <div class="qty-input-group">
              <InputTextGeneric
                v-model="materialData.qty"
                type="number"
                :placeholder="$t('view.receiptStock.product.grProduction.matQty')"
                min="0"
                step="0.01"
                :bgInput="getBgColor(false, materialData.qty)"
                @blur="emitUpdateTypeBarcode(materialData)"
              />
              <InputTextGeneric
                v-model="materialData.qtyUnit"
                class="unit-input"
                :bgInput="getBgColor(false, materialData.qtyUnit)"
                @blur="emitUpdateTypeBarcode(materialData)"
              />
            </div>
          </div>
        </template>

        <!-- Price Qty -->
        <template #priceQtyTemplate="{ data: materialData }">
          <div class="d-flex justify-content-center">
            <InputTextGeneric
              v-model="materialData.qtyPrice"
              type="number"
              :placeholder="$t('view.receiptStock.product.grProduction.matPrice')"
              min="0"
              step="0.01"
              :bgInput="getBgColor(false, materialData.qtyPrice)"
              @blur="emitUpdateTypeBarcode(materialData)"
            />
          </div>
        </template>

        <template #qtyWeightTemplate="{ data: materialData }">
          <div class="material-weight-container">
            <div class="weight-input-group">
              <InputTextGeneric
                v-model="materialData.qtyWeight"
                type="number"
                :placeholder="$t('view.receiptStock.product.grProduction.matWeight')"
                min="0"
                step="0.01"
                :bgInput="getBgColor(false, materialData.qtyWeight)"
                @blur="emitUpdateTypeBarcode(materialData)"
              />
              <InputTextGeneric
                v-model="materialData.qtyWeightUnit"
                class="unit-input"
                :bgInput="getBgColor(false, materialData.qtyWeightUnit)"
                @blur="emitUpdateTypeBarcode(materialData)"
              />
            </div>
          </div>
        </template>

        <!-- Price Weight -->
        <template #priceWeightTemplate="{ data: materialData }">
          <div class="d-flex justify-content-center">
            <InputTextGeneric
              v-model="materialData.qtyWeightPrice"
              type="number"
              :placeholder="$t('view.receiptStock.product.grProduction.matPrice')"
              min="0"
              step="0.01"
              :bgInput="getBgColor(false, materialData.qtyWeightPrice)"
              @blur="emitUpdateTypeBarcode(materialData)"
            />
          </div>
        </template>

        <!-- Total Price -->
        <template #totalPriceTemplate="{ data: materialData }">
          <div class="total-price-display">
            <span class="total-amount">
              {{
                calculateTotalPrice(materialData).toLocaleString('th-TH', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })
              }}
            </span>
            <small class="currency-unit">{{ $t('view.receiptStock.product.grProduction.currencyTHB') }}</small>
          </div>
        </template>

        <template #typeBarcodeTemplate="{ data: materialData }">
          <div class="d-flex justify-content-center">
            <InputTextGeneric
              v-model="materialData.typeBarcode"
              :placeholder="$t('view.receiptStock.product.grProduction.colBarcode')"
              :disabled="true"
            />
          </div>
        </template>

        <template #actionTemplate="{ index, data: materialData }">
          <div>
            <button
              type="button"
              class="btn btn-red btn-sm"
              @click="$emit('removeMaterial', materialData, data, index)"
            >
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </template>
      </BaseDataTable>
    </div>
  </div>
</template>

<script>
import { usrStockGemApiStore } from '@/stores/modules/api/stock/gem-api.js'

import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import DropdownGeneric from '@/components/prime-vue/DropdownGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import AutoCompleteGeneric from '@/components/prime-vue/AutoCompleteGeneric.vue'

export default {
  name: 'MaterialsSection',

  components: {
    BaseDataTable,
    DropdownGeneric,
    InputTextGeneric,
    AutoCompleteGeneric
  },

  setup() {
    const gemApiStore = usrStockGemApiStore()
    return { gemApiStore }
  },

  props: {
    data: {
      type: Object,
      required: true
    },
    masterMaterialType: {
      type: Array,
      required: true
    },
    masterGold: {
      type: Array,
      required: true
    },
    masterDiamondGrade: {
      type: Array,
      required: true
    },
    masterGem: {
      type: Array,
      required: true
    },
    materialColumns: {
      type: Array,
      required: true
    },
    scrollHeight: {
      type: String,
      required: true
    },
    getBgColor: {
      type: Function,
      required: true
    },
    breakdownData: {
      type: Array,
      default: () => []
    }
  },

  emits: [
    'addMaterial',
    'removeMaterial',
    'updateTypeBarcode',
    'loadFromBreakdown',
    'editAllMaterials'
  ],

  data() {
    return {
      gemSuggestions: []
    }
  },

  computed: {
    hasBreakdownData() {
      return this.breakdownData && this.breakdownData.length > 0
    }
  },

  methods: {
    async onSearchGem(event) {
      const query = event.query || ''
      const res = await this.gemApiStore.fetchDataSearch({
        take: 20,
        skip: 0,
        sort: [],
        form: { code: query }
      })
      if (res && res.data) {
        this.gemSuggestions = res.data.map((item) => ({
          name: item.groupName || item.code,
          code: item.code,
          region: item.original || item.region || '',
          grade: item.grade,
          size: item.size,
          shape: item.shape
        }))
      } else {
        this.gemSuggestions = []
      }
    },

    onSelectGem(value, materialData) {
      if (value && typeof value === 'object') {
        materialData.typeName = value.name || value.code
        materialData.region = value.region || materialData.region
      } else if (typeof value === 'string') {
        materialData.typeName = value
      }
      this.emitUpdateTypeBarcode(materialData)
    },
    calculateTotalPrice(material) {
      if (!material) return 0

      const qtyTotal = (material.qty || 0) * (material.qtyPrice || 0)
      const weightTotal = (material.qtyWeight || 0) * (material.qtyWeightPrice || 0)

      return qtyTotal + weightTotal
    },

    emitUpdateTypeBarcode(materialData) {
      this.$emit('updateTypeBarcode', materialData, this.data.stockReceiptNumber)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';

.filter-container {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--sp-lg);
  background-color: #f8f9fa;
}

.group-title {
  display: flex;
  flex-direction: column;
}

.vertical-center-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.gap-2 {
  gap: var(--sp-sm);
}

.cursor-pointer {
  cursor: pointer;

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
    border-radius: var(--radius-sm);
  }
}

// Enhanced material input containers
.material-qty-container,
.material-weight-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--sp-xs);
}

.qty-input-group,
.weight-input-group {
  display: flex;
  gap: 2px;
  width: 100%;

  :deep(.form-control) {
    flex: 1;
    min-width: 60px;
  }

  .unit-input {
    flex: 0 0 50px;

    :deep(.form-control) {
      text-align: center;
      font-size: var(--fs-sm);
    }
  }
}

.total-price-display {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.25rem;
  font-weight: 600;

  .total-amount {
    color: var(--base-font-color);
    font-size: var(--fs-base);
  }

  .currency-unit {
    color: #6c757d;
    font-size: var(--fs-sm);
    font-weight: normal;
  }
}

@media (max-width: 768px) {
  .qty-input-group,
  .weight-input-group {
    flex-direction: column;

    .unit-input {
      flex: 1 1 auto;
    }
  }
}

.region-from-plan-hint {
  font-size: var(--fs-sm);
  color: #6c757d;
  margin-top: var(--sp-xs);
  font-style: italic;
}

:deep(.gem-autocomplete) {
  width: 100%;

  .p-autocomplete {
    width: 100%;
  }

  .p-autocomplete-input {
    width: 100%;
    padding: 6px 10px;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    font-size: var(--fs-base);
  }
}
</style>
