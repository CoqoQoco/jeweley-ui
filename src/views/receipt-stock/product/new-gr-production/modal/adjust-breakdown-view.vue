<template>
  <div>
    <modal :showModal="isShowModal" @closeModal="closeModal" width="1200px">
      <template v-slot:content>
        <div>
          <div class="title-text-lg-bg">
            <span><i class="bi bi-hammer mr-2"></i></span>
            <span>{{ $t('view.receiptStock.product.grProduction.adjustBreakdownTitle') }}</span>
            <span class="ml-2">| W.O. : {{ planData.wo }}-{{ planData.woNumber }}</span>
          </div>

          <!-- Breakdown Table -->
          <div class="mt-2">
            <div class="d-flex justify-content-between align-items-center ml-3">
              <div>
                <span class="title-text">{{ $t('view.receiptStock.product.grProduction.masterBreakdownLabel') }}</span>
                <small class="text-muted ml-2">{{ $t('view.receiptStock.product.grProduction.masterBreakdownDesc') }}</small>
              </div>
              <div class="d-flex gap-2">
                <button
                  type="button"
                  class="btn btn-main btn-sm"
                  @click="addBreakdownItem"
                >
                  <span class="bi bi-plus-lg mr-1"></span>
                  {{ $t('view.receiptStock.product.grProduction.addMaterial') }}
                </button>
                <button
                  type="button"
                  class="btn btn-outline-main btn-sm ml-2"
                  @click="resetBreakdown"
                >
                  <span class="bi bi-arrow-clockwise mr-1"></span>
                  {{ $t('view.receiptStock.product.grProduction.resetBreakdown') }}
                </button>
              </div>
            </div>

            <BaseDataTable
              :items="editableBreakdown"
              :columns="breakdownColumns"
              :paginator="false"
              :scrollHeight="'350px'"
              class="custom-breakdown-table"
            >
              <!-- Material Type -->
              <template #typeTemplate="{ data: materialData }">
                <DropdownGeneric
                  :modelValue="materialData.type"
                  :options="masterMaterialType"
                  optionLabel="description"
                  optionValue="value"
                  class="w-full"
                  :placeholder="$t('view.receiptStock.product.grProduction.colMaterialType')"
                  @update:modelValue="materialData.type = $event; updateMaterialBarcode(materialData)"
                />
              </template>

              <!-- Type Name -->
              <template #typeNameTemplate="{ data: materialData }">
                <InputTextGeneric
                  v-model="materialData.typeName"
                  :bgInput="getBgColor(false, materialData.typeName)"
                  :placeholder="$t('view.receiptStock.product.grProduction.colMaterialName')"
                />
              </template>

              <!-- Type Code -->
              <template #typeCodeTemplate="{ data: materialData }">
                <div v-if="materialData.type === 'Gold' || materialData.type === 'Silver'">
                  <DropdownGeneric
                    :modelValue="materialData.typeCode"
                    :options="masterGold"
                    optionLabel="description"
                    optionValue="code"
                    class="w-full"
                    :placeholder="$t('view.receiptStock.product.grProduction.colMaterialCode')"
                    :showClear="true"
                    @update:modelValue="materialData.typeCode = $event; updateMaterialBarcode(materialData)"
                  />
                </div>
                <div v-else-if="materialData.type === 'Diamond'">
                  <DropdownGeneric
                    :modelValue="materialData.typeCode"
                    :options="masterDiamondGrade"
                    optionLabel="description"
                    optionValue="nameEn"
                    class="w-full"
                    :placeholder="$t('view.receiptStock.product.grProduction.colMaterialCode')"
                    :showClear="true"
                  />
                </div>
                <div v-else-if="materialData.type === 'Gem'">
                  <DropdownGeneric
                    :modelValue="materialData.typeCode"
                    :options="masterGem"
                    optionLabel="description"
                    optionValue="code"
                    class="w-full"
                    :placeholder="$t('view.receiptStock.product.grProduction.colMaterialCode')"
                    :showClear="true"
                  />
                </div>
                <div v-else>
                  <InputTextGeneric
                    v-model="materialData.typeCode"
                    :bgInput="getBgColor(false, materialData.typeCode)"
                    :placeholder="$t('view.receiptStock.product.grProduction.colMaterialCode')"
                  />
                </div>
              </template>

              <!-- Quantity -->
              <template #qtyTemplate="{ data: materialData }">
                <div class="qty-input-container">
                  <InputTextGeneric
                    v-model="materialData.qty"
                    type="number"
                    :bgInput="getBgColor(false, materialData.qty)"
                    :placeholder="$t('view.receiptStock.product.grProduction.colQty')"
                    min="0"
                    step="0.01"
                  />
                  <InputTextGeneric
                    v-model="materialData.qtyUnit"
                    :bgInput="getBgColor(false, materialData.qtyUnit)"
                    class="unit-input"
                  />
                </div>
              </template>

              <template #priceQtyTemplate="{ data: materialData }">
                <div class="price-input-container">
                  <InputTextGeneric
                    v-model="materialData.qtyPrice"
                    type="number"
                    :bgInput="getBgColor(false, materialData.qtyPrice)"
                    :placeholder="$t('view.receiptStock.product.grProduction.colPriceQty')"
                    min="0"
                    step="0.01"
                  />
                </div>
              </template>

              <!-- Weight -->
              <template #qtyWeightTemplate="{ data: materialData }">
                <div class="weight-input-container">
                  <InputTextGeneric
                    v-model="materialData.qtyWeight"
                    type="number"
                    :bgInput="getBgColor(false, materialData.qtyWeight)"
                    :placeholder="$t('view.receiptStock.product.grProduction.colQtyWeight')"
                    min="0"
                    step="0.01"
                  />
                  <InputTextGeneric
                    v-model="materialData.qtyWeightUnit"
                    :bgInput="getBgColor(false, materialData.qtyWeightUnit)"
                    class="unit-input"
                  />
                </div>
              </template>

              <!-- Price -->
              <template #priceWeightTemplate="{ data: materialData }">
                <div class="price-input-container">
                  <InputTextGeneric
                    v-model="materialData.qtyWeightPrice"
                    type="number"
                    :bgInput="getBgColor(false, materialData.qtyWeightPrice)"
                    :placeholder="$t('view.receiptStock.product.grProduction.colPriceWeight')"
                    min="0"
                    step="0.01"
                  />
                </div>
              </template>

              <!-- Region -->
              <template #regionTemplate="{ data: materialData }">
                <InputTextGeneric
                  v-model="materialData.region"
                  :bgInput="getBgColor(false, materialData.region)"
                  :placeholder="$t('view.receiptStock.product.grProduction.colRegion')"
                />
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

              <!-- Barcode -->
              <template #typeBarcodeTemplate="{ data: materialData }">
                <InputTextGeneric
                  v-model="materialData.typeBarcode"
                  :placeholder="$t('view.receiptStock.product.grProduction.colBarcode')"
                  :readonly="true"
                />
              </template>

              <!-- Actions -->
              <template #actionTemplate="{ index }">
                <button
                  type="button"
                  class="btn btn-red btn-sm"
                  @click="removeBreakdownItem(index)"
                  :disabled="editableBreakdown.length <= 1"
                >
                  <i class="bi bi-trash"></i>
                </button>
              </template>
            </BaseDataTable>
          </div>

          <!-- Apply Section -->
          <div class="apply-section mt-3">
            <div class="row">
              <div class="col-md-6">
                <div class="card">
                  <div class="card-header">
                    <h6 class="mb-0">
                      <span class="bi bi-arrow-down-circle mr-1"></span>
                      {{ $t('view.receiptStock.product.grProduction.applyToStockLabel') }}
                    </h6>
                  </div>
                  <div class="card-body">
                    <div class="mb-2">
                      <label class="form-label">{{ $t('view.receiptStock.product.grProduction.selectStockLabel') }}</label>
                    </div>
                    <div class="stock-selection">
                      <div class="form-check mb-2">
                        <input
                          class="form-check-input"
                          type="radio"
                          name="applyType"
                          id="applyAll"
                          value="all"
                          v-model="applyType"
                        />
                        <label class="form-check-label" for="applyAll">
                          {{ $t('view.receiptStock.product.grProduction.selectAllLabel') }} ({{ filteredStockList.length }} {{ $t('common.table.entries') }})
                        </label>
                      </div>
                      <div class="form-check mb-2">
                        <input
                          class="form-check-input"
                          type="radio"
                          name="applyType"
                          id="applySelected"
                          value="selected"
                          v-model="applyType"
                        />
                        <label class="form-check-label" for="applySelected">{{ $t('view.receiptStock.product.grProduction.selectedOnlyLabel') }}</label>
                      </div>
                    </div>

                    <!-- Stock Selection List -->
                    <div v-if="applyType === 'selected'" class="stock-list mt-2">
                      <BaseDataTable
                        :items="filteredStockList"
                        :columns="stockColumns"
                        :paginator="false"
                        :scrollHeight="'200px'"
                        :selectionMode="true"
                        :selectionType="'multiple'"
                        :itemsSelection="selectedStockItems"
                        @update:itemsSelection="updateStockSelection"
                        dataKey="stockReceiptNumber"
                        class="stock-selection-table"
                      >
                        <!-- Status Template -->
                        <template #isReceiptTemplate="{ data: stockData }">
                          <div class="d-flex justify-content-center">
                            <span
                              class="badge"
                              :class="stockData.isReceipt ? 'badge-secondary' : 'badge-success'"
                            >
                              {{ stockData.isReceipt ? $t('view.receiptStock.product.grProduction.stockReceiptStatus_received') : $t('view.receiptStock.product.grProduction.stockReceiptStatus_pending') }}
                            </span>
                          </div>
                        </template>
                      </BaseDataTable>
                    </div>

                    <!-- Apply Buttons -->
                    <div class="mt-3">
                      <button
                        type="button"
                        class="btn btn-main btn-sm"
                        @click="applyBreakdownToStock"
                        :disabled="!canApply"
                      >
                        <span class="bi bi-check-lg mr-1"></span>
                        {{ $t('view.receiptStock.product.grProduction.applyToStock') }}
                      </button>
                      <button
                        type="button"
                        class="btn btn-outline-main btn-sm ml-2"
                        @click="saveDraft"
                        :disabled="!hasValidBreakdown"
                      >
                        <span class="bi bi-floppy mr-1"></span>
                        {{ $t('view.receiptStock.product.grProduction.saveDraftBreakdown') }}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div class="col-md-6">
                <div class="card">
                  <div class="card-header">
                    <h6 class="mb-0">
                      <span class="bi bi-info-circle mr-1"></span>
                      {{ $t('view.receiptStock.product.grProduction.summaryLabel') }}
                    </h6>
                  </div>
                  <div class="card-body">
                    <div class="summary-info">
                      <div class="summary-item">
                        <span class="label">{{ $t('view.receiptStock.product.grProduction.materialCountLabel') }}</span>
                        <span class="value">{{ editableBreakdown.length }} {{ $t('common.table.entries') }}</span>
                      </div>
                      <div class="summary-item">
                        <span class="label">{{ $t('view.receiptStock.product.grProduction.stockCountLabel') }}</span>
                        <span class="value">{{ filteredStockList.length }} {{ $t('common.table.entries') }}</span>
                      </div>
                      <div class="summary-item">
                        <span class="label">{{ $t('view.receiptStock.product.grProduction.selectedCountLabel') }}</span>
                        <span class="value">{{ selectedCount }} {{ $t('common.table.entries') }}</span>
                      </div>
                    </div>

                    <!-- Material Summary -->
                    <div class="material-summary mt-3">
                      <h6 class="text-muted">{{ $t('view.receiptStock.product.grProduction.materialsToApplyLabel') }}</h6>
                      <div class="material-list">
                        <div
                          v-for="(material, index) in validBreakdownMaterials"
                          :key="index"
                          class="material-summary-item"
                        >
                          <div class="material-type">{{ material.type }}</div>
                          <div class="material-details">
                            <span v-if="material.typeName">{{ material.typeName }}</span>
                            <span v-if="material.typeCode"> ({{ material.typeCode }})</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="action-buttons mt-3">
            <div class="d-flex justify-content-end gap-2">
              <button type="button" class="btn btn-outline-main btn-sm" @click="closeModal">
                <span class="bi bi-x-lg mr-1"></span>
                {{ $t('common.btn.close') }}
              </button>
            </div>
          </div>
        </div>
      </template>
    </modal>
  </div>
</template>

<script>
import { warning, success } from '@/services/alert/sweetAlerts.js'

import modal from '@/components/modal/modal-view.vue'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import DropdownGeneric from '@/components/prime-vue/DropdownGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'

export default {
  name: 'AdjustBreakdownModal',

  components: {
    modal,
    BaseDataTable,
    DropdownGeneric,
    InputTextGeneric
  },

  props: {
    isShow: {
      type: Boolean,
      default: false
    },
    planData: {
      type: Object,
      default: () => ({})
    },
    breakdownData: {
      type: Array,
      default: () => []
    },
    stockList: {
      type: Array,
      default: () => []
    },
    masterMaterialType: {
      type: Array,
      default: () => []
    },
    masterGold: {
      type: Array,
      default: () => []
    },
    masterDiamondGrade: {
      type: Array,
      default: () => []
    },
    masterGem: {
      type: Array,
      default: () => []
    }
  },

  emits: ['closeModal', 'applyBreakdown', 'saveDraft'],

  data() {
    return {
      editableBreakdown: [],
      originalBreakdown: [],
      applyType: 'all',
      selectedStockNumbers: [],
      selectedStockItems: []
    }
  },

  computed: {
    isShowModal() {
      return this.isShow
    },

    stockColumns() {
      return [
        {
          field: 'stockReceiptNumber',
          header: this.$t('view.receiptStock.product.grProduction.colStockReceiptNum'),
          minWidth: '150px',
          sortable: false
        },
        {
          field: 'productNumber',
          header: this.$t('view.receiptStock.product.grProduction.colProductCode'),
          width: '120px',
          sortable: false
        },
        {
          field: 'productNameTH',
          header: this.$t('view.receiptStock.product.grProduction.colProductName'),
          minWidth: '200px',
          sortable: false
        },
        {
          field: 'isReceipt',
          header: this.$t('view.receiptStock.product.grProduction.colStatus'),
          width: '80px',
          sortable: false,
          align: 'center'
        }
      ]
    },

    breakdownColumns() {
      return [
        {
          field: 'type',
          header: this.$t('view.receiptStock.product.grProduction.colMaterialType'),
          minWidth: '120px',
          sortable: false
        },
        {
          field: 'typeName',
          header: this.$t('view.receiptStock.product.grProduction.colMaterialName'),
          minWidth: '180px',
          sortable: false
        },
        {
          field: 'typeCode',
          header: this.$t('view.receiptStock.product.grProduction.colMaterialCode'),
          minWidth: '130px',
          sortable: false
        },
        {
          field: 'qty',
          header: this.$t('view.receiptStock.product.grProduction.colQty'),
          minWidth: '150px',
          sortable: false,
          align: 'center'
        },
        {
          field: 'priceQty',
          header: this.$t('view.receiptStock.product.grProduction.colPriceQty'),
          minWidth: '120px',
          sortable: false,
          align: 'center'
        },
        {
          field: 'qtyWeight',
          header: this.$t('view.receiptStock.product.grProduction.colQtyWeight'),
          minWidth: '150px',
          sortable: false,
          align: 'center'
        },
        {
          field: 'priceWeight',
          header: this.$t('view.receiptStock.product.grProduction.colPriceWeight'),
          minWidth: '120px',
          sortable: false,
          align: 'center'
        },
        {
          field: 'totalPrice',
          header: this.$t('view.receiptStock.product.grProduction.colTotalPrice'),
          minWidth: '150px',
          sortable: false,
          align: 'right',
          format: 'decimal2'
        },
        {
          field: 'region',
          header: this.$t('view.receiptStock.product.grProduction.colRegion'),
          minWidth: '100px',
          sortable: false
        },
        {
          field: 'typeBarcode',
          header: this.$t('view.receiptStock.product.grProduction.colBarcode'),
          minWidth: '150px',
          sortable: false
        },
        {
          field: 'action',
          header: this.$t('view.receiptStock.product.grProduction.colManage'),
          minWidth: '80px',
          sortable: false,
          align: 'center'
        }
      ]
    },

    canApply() {
      if (this.applyType === 'all') {
        return this.filteredStockList.length > 0 && this.hasValidBreakdown
      } else {
        return this.selectedStockItems.length > 0 && this.hasValidBreakdown
      }
    },

    hasValidBreakdown() {
      return this.editableBreakdown.some((m) => m.type && (m.qty > 0 || m.qtyWeight > 0))
    },

    selectedCount() {
      if (this.applyType === 'all') {
        return this.filteredStockList.length
      } else {
        return this.selectedStockItems.length
      }
    },

    validBreakdownMaterials() {
      return this.editableBreakdown.filter((m) => m.type && (m.qty > 0 || m.qtyWeight > 0))
    },

    filteredStockList() {
      return this.stockList.filter((stock) => !stock.isReceipt)
    }
  },

  watch: {
    isShow: {
      handler(newVal) {
        if (newVal) {
          this.initializeBreakdown()
        }
      },
      immediate: true
    }
  },

  methods: {
    initializeBreakdown() {
      let sourceData = this.breakdownData
      if (
        this.breakdownData &&
        this.breakdownData.BreakDown &&
        Array.isArray(this.breakdownData.BreakDown)
      ) {
        sourceData = this.breakdownData.BreakDown
      }

      if (sourceData && sourceData.length > 0) {
        this.editableBreakdown = JSON.parse(JSON.stringify(sourceData))
        this.originalBreakdown = JSON.parse(JSON.stringify(sourceData))
      } else {
        this.editableBreakdown = []
        this.originalBreakdown = []
        this.addBreakdownItem()
      }

      this.applyType = 'all'
      this.selectedStockNumbers = []
      this.selectedStockItems = []
    },

    addBreakdownItem() {
      this.editableBreakdown.push({
        type: '',
        typeName: '',
        typeNameDescription: '',
        typeCode: '',
        typeCodeName: '',
        typeBarcode: '',
        qty: 1,
        qtyUnit: 'pc',
        qtyPrice: 0,
        qtyWeight: 0,
        qtyWeightUnit: 'g',
        qtyWeightPrice: 0,
        region: '',
        isOrigin: false
      })
    },

    removeBreakdownItem(index) {
      if (this.editableBreakdown.length > 1) {
        this.editableBreakdown.splice(index, 1)
      }
    },

    resetBreakdown() {
      this.editableBreakdown = JSON.parse(JSON.stringify(this.originalBreakdown))
      if (this.editableBreakdown.length === 0) {
        this.addBreakdownItem()
      }
    },

    calculateTotalPrice(material) {
      if (!material) return 0

      const qtyTotal = (material.qty || 0) * (material.qtyPrice || 0)
      const weightTotal = (material.qtyWeight || 0) * (material.qtyWeightPrice || 0)

      return qtyTotal + weightTotal
    },

    getBgColor(isReceipt, data) {
      if (isReceipt) {
        return 'background-color: #e0e0e0'
      } else if (data) {
        return 'background-color: #b5dad4'
      } else {
        return 'background-color: #dad4b5'
      }
    },

    updateMaterialBarcode(materialData) {
      // Trigger barcode update logic via parent if needed
      void materialData
    },

    updateStockSelection(newSelection) {
      this.selectedStockItems = newSelection
      this.selectedStockNumbers = newSelection.map((item) => item.stockReceiptNumber)
    },

    applyBreakdownToStock() {
      let targetStocks = []

      if (this.applyType === 'all') {
        targetStocks = this.filteredStockList.map((s) => s.stockReceiptNumber)
      } else {
        targetStocks = this.selectedStockItems
          .filter((item) => !item.isReceipt)
          .map((s) => s.stockReceiptNumber)
      }

      if (targetStocks.length === 0) {
        warning(
          this.$t('view.receiptStock.product.grProduction.noStockToApplyDesc'),
          this.$t('view.receiptStock.product.grProduction.noStockToApply')
        )
        return
      }

      const breakdownToApply = this.validBreakdownMaterials.map((material) => ({
        ...material,
        weight: material.qtyWeight,
        weightUnit: material.qtyWeightUnit,
        size: '',
        price: 0
      }))

      this.$emit('applyBreakdown', {
        breakdown: breakdownToApply,
        stockNumbers: targetStocks
      })

      success(
        this.$t('view.receiptStock.product.grProduction.applySuccessDesc', { count: targetStocks.length }),
        this.$t('view.receiptStock.product.grProduction.applyToStock')
      )
    },

    saveDraft() {
      if (!this.hasValidBreakdown) {
        warning(
          this.$t('view.receiptStock.product.grProduction.invalidBreakdown'),
          this.$t('view.receiptStock.product.grProduction.summaryLabel')
        )
        return
      }

      this.$emit('saveDraft', {
        breakdown: this.validBreakdownMaterials
      })

      success(this.$t('view.receiptStock.product.grProduction.saveDraftSuccess'))
    },

    closeModal() {
      this.$emit('closeModal')
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';

.title-text-lg-bg {
  background: linear-gradient(135deg, var(--base-font-color) 0%, var(--base-font-sub-color) 100%);
  color: white;
  padding: var(--sp-lg);
  border-radius: var(--radius-md) var(--radius-md) 0 0;
  font-size: var(--fs-lg);
  font-weight: 600;
  box-shadow: var(--shadow-sm);
}

.custom-breakdown-table {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-sm);

  :deep(.p-datatable-thead) th {
    background-color: var(--base-font-color);
    color: white;
    font-weight: 600;
    border-bottom: 2px solid var(--base-font-sub-color);
  }
}

.qty-input-container,
.weight-input-container,
.price-input-container {
  display: flex;
  gap: 2px;

  .unit-input {
    flex: 0 0 45px;

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

.apply-section {
  border-top: 2px solid var(--base-font-color);
  padding-top: var(--sp-lg);

  .card {
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    box-shadow: var(--shadow-sm);
    background: var(--color-card-bg) !important;

    .card-header {
      background: linear-gradient(
        135deg,
        var(--base-font-color) 0%,
        var(--base-font-sub-color) 100%
      );
      color: white;
      border-bottom: 1px solid var(--base-font-sub-color);
      padding: var(--sp-md) var(--sp-lg);

      h6 {
        color: white;
        margin: 0;
        background: transparent !important;
      }
    }

    .card-body {
      padding: var(--sp-lg);
    }
  }
}

.stock-selection {
  .form-check {
    padding-left: 1.5rem;

    .form-check-input {
      margin-left: -1.5rem;
    }
  }
}

.stock-selection-table {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);

  :deep(.p-datatable) {
    .p-datatable-thead > tr > th {
      background-color: var(--base-font-color);
      color: white;
      font-size: var(--fs-sm);
      padding: var(--sp-sm);
    }

    .p-datatable-tbody > tr > td {
      font-size: var(--fs-sm);
      padding: var(--sp-sm);
    }
  }
}

.badge {
  padding: 0.25em 0.6em;
  font-size: var(--fs-sm);
  font-weight: 600;
  border-radius: var(--radius-sm);

  &.badge-success {
    color: white;
    background-color: var(--base-green);
  }

  &.badge-secondary {
    color: white;
    background-color: #6c757d;
  }
}

.summary-info {
  .summary-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: var(--sp-sm);

    .label {
      color: #6c757d;
      font-size: var(--fs-base);
    }

    .value {
      font-weight: 500;
      color: #495057;
    }
  }
}

.material-summary {
  .material-list {
    max-height: 150px;
    overflow-y: auto;
  }

  .material-summary-item {
    background-color: #f8f9fa;
    border: 1px solid var(--color-border);
    border-left: 3px solid var(--base-font-color);
    border-radius: var(--radius-sm);
    padding: var(--sp-sm);
    margin-bottom: 0.25rem;
    font-size: var(--fs-sm);
    transition: all 0.2s ease;

    &:hover {
      background-color: #e9ecef;
      border-left-color: var(--base-font-sub-color);
    }

    .material-type {
      font-weight: 600;
      color: var(--base-font-color);
    }

    .material-details {
      color: #6c757d;
      margin-top: 0.125rem;
    }
  }
}

.action-buttons {
  border-top: 2px solid var(--base-font-color);
  padding-top: var(--sp-lg);
}

.gap-2 {
  gap: var(--sp-sm);
}

@media (max-width: 768px) {
  .apply-section {
    .row {
      flex-direction: column;
    }
  }

  .qty-input-container,
  .weight-input-container,
  .price-input-container {
    flex-direction: column;
    gap: 1px;

    .unit-input {
      flex: 1 1 auto;
    }
  }
}
</style>
