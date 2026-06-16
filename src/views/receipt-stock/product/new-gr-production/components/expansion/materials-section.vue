<template>
  <div class="form-col-container">
    <div class="filter-container mt-2">
      <div class="d-flex justify-content-between">
        <div class="group-title pl-2">
          <div>
            <span class="title-text-lg bi bi-hammer"></span>
            <span class="title-text-lg ml-2">{{ $t('receipt-stock.product.grProduction.materialComponents') }}</span>
          </div>
          <small class="pl-4"
            >{{ $t('receipt-stock.product.grProduction.materialDescriptionBreakdown') }}</small
          >
        </div>
        <!-- Control buttons -->
        <div class="d-flex justify-content-start mt-2 gap-2">
          <div
            type="button"
            class="p-2 text-dark cursor-pointer"
            @click="$emit('addMaterial', data.materials)"
            :title="$t('receipt-stock.product.grProduction.addMaterial')"
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
            <InputTextGeneric
              v-model="materialData.typeName"
              :bgInput="getBgColor(false, materialData.typeName)"
              :placeholder="$t('receipt-stock.product.grProduction.colMaterialName')"
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
                :placeholder="$t('receipt-stock.product.grProduction.matTypeCode')"
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
                :placeholder="$t('receipt-stock.product.grProduction.matTypeCode')"
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
                :placeholder="$t('receipt-stock.product.grProduction.matTypeCode')"
                :showClear="materialData.typeCode ? true : false"
                @update:modelValue="materialData.typeCode = $event; emitUpdateTypeBarcode(materialData)"
              />
            </div>
            <div v-else class="vertical-center-container text-center">
              <span> --- {{ $t('receipt-stock.product.grProduction.matType') }} ---</span>
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
          <div class="d-flex justify-content-center">
            <InputTextGeneric
              v-model="materialData.region"
              :bgInput="getBgColor(false, materialData.region)"
              @blur="emitUpdateTypeBarcode(materialData)"
            />
          </div>
        </template>

        <template #qtyTemplate="{ data: materialData }">
          <div class="material-qty-container">
            <div class="qty-input-group">
              <InputTextGeneric
                v-model="materialData.qty"
                type="number"
                :placeholder="$t('receipt-stock.product.grProduction.matQty')"
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
              :placeholder="$t('receipt-stock.product.grProduction.matPrice')"
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
                :placeholder="$t('receipt-stock.product.grProduction.matWeight')"
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
              :placeholder="$t('receipt-stock.product.grProduction.matPrice')"
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
            <small class="currency-unit">{{ $t('receipt-stock.product.grProduction.currencyTHB') }}</small>
          </div>
        </template>

        <template #typeBarcodeTemplate="{ data: materialData }">
          <div class="d-flex justify-content-center">
            <InputTextGeneric
              v-model="materialData.typeBarcode"
              :placeholder="$t('receipt-stock.product.grProduction.colBarcode')"
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
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import DropdownGeneric from '@/components/prime-vue/DropdownGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'

export default {
  name: 'MaterialsSection',

  components: {
    BaseDataTable,
    DropdownGeneric,
    InputTextGeneric
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

  computed: {
    hasBreakdownData() {
      return this.breakdownData && this.breakdownData.length > 0
    }
  },

  methods: {
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
</style>
