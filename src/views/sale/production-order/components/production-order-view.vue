<template>
  <div class="mt-2">
    <!-- Production Order Information Section -->
    <div class="card-container">
      <div class="card-header">
        <h6 class="mb-0">{{ $t('view.sale.productionOrder.poInfo') }}</h6>
      </div>
      <div class="card-body">
        <div class="form-col-container">
          <!-- Production Order Number -->
          <div>
            <span class="title-text">{{ $t('view.sale.productionOrder.poNumber') }}</span>
            <InputTextGeneric
              v-model.trim="formProductionOrder.number"
              placeholder="PO-2025-001"
            />
          </div>

          <!-- Order Date -->
          <div>
            <span class="title-text">{{ $t('view.sale.productionOrder.poDate') }}</span>
            <CalendarGeneric
              class="w-100"
              v-model="formProductionOrder.orderDate"
              :showIcon="true"
              :manualInput="false"
              :placeholder="$t('view.sale.productionOrder.selectDate')"
              dateFormat="dd/mm/yy"
            />
          </div>

          <!-- Required Date -->
          <div>
            <span class="title-text">{{ $t('view.sale.productionOrder.requiredDate') }}</span>
            <CalendarGeneric
              class="w-100"
              v-model="formProductionOrder.requiredDate"
              :showIcon="true"
              :manualInput="false"
              :placeholder="$t('view.sale.productionOrder.selectDate')"
              dateFormat="dd/mm/yy"
            />
          </div>

          <!-- Priority -->
          <div>
            <span class="title-text">{{ $t('view.sale.productionOrder.priority') }}</span>
            <DropdownGeneric
              v-model="formProductionOrder.priority"
              :options="priorityOptions"
              optionLabel="name"
              optionValue="value"
              :placeholder="$t('view.sale.productionOrder.selectPriority')"
              class="w-100"
            />
          </div>
        </div>

        <div class="form-col-container mt-2">
          <!-- Sale Order Reference -->
          <div>
            <span class="title-text">{{ $t('view.sale.productionOrder.soRef') }}</span>
            <InputTextGeneric
              v-model.trim="formProductionOrder.saleOrderNumber"
              placeholder="SO-2025-001"
              :readonly="true"
            />
          </div>

          <!-- Status -->
          <div>
            <span class="title-text">{{ $t('view.sale.productionOrder.status') }}</span>
            <DropdownGeneric
              v-model="formProductionOrder.status"
              :options="statusOptions"
              optionLabel="name"
              optionValue="value"
              :placeholder="$t('view.sale.productionOrder.selectStatus')"
              class="w-100"
            />
          </div>

          <!-- Production Type -->
          <div>
            <span class="title-text">{{ $t('view.sale.productionOrder.productionType') }}</span>
            <DropdownGeneric
              v-model="formProductionOrder.productionType"
              :options="productionTypeOptions"
              optionLabel="name"
              optionValue="value"
              :placeholder="$t('view.sale.productionOrder.selectProductionType')"
              class="w-100"
            />
          </div>

          <!-- Workshop -->
          <div>
            <span class="title-text">{{ $t('view.sale.productionOrder.productionUnit') }}</span>
            <DropdownGeneric
              v-model="formProductionOrder.workshop"
              :options="workshopOptions"
              optionLabel="name"
              optionValue="value"
              :placeholder="$t('view.sale.productionOrder.selectProductionUnit')"
              class="w-100"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Sale Order Information Section -->
    <div class="card-container mt-3" v-if="saleOrderInfo.number">
      <div class="card-header">
        <h6 class="mb-0">{{ $t('view.sale.productionOrder.soRefInfo') }}</h6>
      </div>
      <div class="card-body">
        <div class="form-col-container">
          <div>
            <span class="title-text">{{ $t('view.sale.productionOrder.soNumber') }}</span>
            <div class="info-display">{{ saleOrderInfo.number }}</div>
          </div>
          <div>
            <span class="title-text">{{ $t('view.sale.productionOrder.customerField') }}</span>
            <div class="info-display">{{ saleOrderInfo.customerName }}</div>
          </div>
          <div>
            <span class="title-text">{{ $t('view.sale.productionOrder.soDate') }}</span>
            <div class="info-display">{{ formatDate(saleOrderInfo.orderDate) }}</div>
          </div>
          <div>
            <span class="title-text">{{ $t('view.sale.productionOrder.expectedDelivery') }}</span>
            <div class="info-display">{{ formatDate(saleOrderInfo.expectedDeliveryDate) }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Production Items Grid -->
    <div class="card-container mt-3">
      <div class="card-header">
        <h6 class="mb-0">{{ $t('view.sale.productionOrder.itemsSection') }}</h6>
        <div class="card-header-actions">
          <label class="d-flex align-items-center">
            <input
              type="checkbox"
              :checked="allItemsSelected"
              @change="toggleAllItems"
              class="mr-2"
            />
            <span>{{ $t('view.sale.productionOrder.selectAllItems') }}</span>
          </label>
        </div>
      </div>
      <div class="card-body p-0">
        <BaseDataTable
          :items="productionItems"
          :totalRecords="productionItems.length"
          dataKey="itemId"
          :columns="tableColumns"
          :paginator="false"
          scrollHeight="400px"
        >
          <template #selectionTemplate="{ data }">
            <input
              type="checkbox"
              v-model="data.isSelected"
              @change="updateItemSelection(data)"
              class="form-check-input"
            />
          </template>

          <template #imageTemplate="{ data }">
            <div class="product-image">
              <img
                :src="data.imageUrl || '/src/assets/images/no-image.png'"
                :alt="data.productName"
                class="product-thumbnail"
              />
            </div>
          </template>

          <template #productNumberTemplate="{ data }">
            <span class="font-weight-bold">{{ data.productNumber }}</span>
          </template>

          <template #productNameTemplate="{ data }">
            <div class="product-description">{{ data.productName }}</div>
          </template>

          <template #materialsTemplate="{ data }">
            <div class="materials-info">
              <div v-if="data.materials?.gold" class="material-item">
                <i class="bi bi-circle-fill text-warning mr-1"></i>
                {{ $t('view.sale.productionOrder.gold') }}: {{ data.materials.gold.weight }}g
              </div>
              <div v-if="data.materials?.diamond" class="material-item">
                <i class="bi bi-gem mr-1"></i>
                {{ $t('view.sale.productionOrder.diamond') }}: {{ data.materials.diamond.weight }}ct
              </div>
              <div v-if="data.materials?.gems" class="material-item">
                <i class="bi bi-hexagon mr-1"></i>
                {{ $t('view.sale.productionOrder.gems') }}: {{ data.materials.gems.weight }}ct
              </div>
            </div>
          </template>

          <template #quantityTemplate="{ data }">
            <input
              type="number"
              min="1"
              step="1"
              v-model.number="data.quantity"
              @input="updateItemQuantity(data)"
              :disabled="!data.isSelected"
              class="form-control form-control-sm text-center"
            />
          </template>

          <template #estimatedProductionDaysTemplate="{ data }">
            <div class="text-center">
              <span class="badge badge-info">
                <i class="bi bi-clock mr-1"></i>
                {{ data.estimatedProductionDays || 0 }} {{ $t('view.sale.productionOrder.productionDaysUnit') }}
              </span>
            </div>
          </template>

          <template #unitPriceTemplate="{ data }">
            <div class="text-right">{{ formatCurrency(data.unitPrice) }}</div>
          </template>

          <template #totalValueTemplate="{ data }">
            <div class="text-right font-weight-bold">
              <span v-if="data.isSelected">{{ formatCurrency(data.quantity * data.unitPrice) }}</span>
              <span v-else class="text-muted">-</span>
            </div>
          </template>
        </BaseDataTable>
      </div>
    </div>

    <!-- Production Summary -->
    <div class="card-container mt-3">
      <div class="card-header">
        <h6 class="mb-0">{{ $t('view.sale.productionOrder.summarySection') }}</h6>
      </div>
      <div class="card-body">
        <div class="row">
          <div class="col-md-4">
            <!-- Items Summary -->
            <div class="summary-section">
              <h6>{{ $t('view.sale.productionOrder.summarySelectedItems') }}</h6>
              <div class="summary-item">
                <span>{{ $t('view.sale.productionOrder.summaryItemCount') }}:</span>
                <span class="font-weight-bold">{{ selectedItemsCount }} {{ $t('view.sale.productionOrder.itemCount', { count: '' }).replace(' ', '') }}</span>
              </div>
              <div class="summary-item">
                <span>{{ $t('view.sale.productionOrder.summaryTotalQty') }}:</span>
                <span class="font-weight-bold">{{ totalQuantity }}</span>
              </div>
              <div class="summary-item">
                <span>{{ $t('view.sale.productionOrder.summaryAvgProductionDays') }}:</span>
                <span class="font-weight-bold">{{ averageProductionDays }} {{ $t('view.sale.productionOrder.productionDaysUnit') }}</span>
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <!-- Materials Summary -->
            <div class="summary-section">
              <h6>{{ $t('view.sale.productionOrder.summaryMaterials') }}</h6>
              <div class="summary-item">
                <span>{{ $t('view.sale.productionOrder.summaryGoldTotal') }}:</span>
                <span class="font-weight-bold text-warning">{{ totalMaterials.gold }} g</span>
              </div>
              <div class="summary-item">
                <span>{{ $t('view.sale.productionOrder.summaryDiamondTotal') }}:</span>
                <span class="font-weight-bold">{{ totalMaterials.diamond }} ct</span>
              </div>
              <div class="summary-item">
                <span>{{ $t('view.sale.productionOrder.summaryGemsTotal') }}:</span>
                <span class="font-weight-bold text-info">{{ totalMaterials.gems }} ct</span>
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <!-- Value Summary -->
            <div class="summary-section">
              <h6>{{ $t('view.sale.productionOrder.summaryValue') }}</h6>
              <div class="summary-item">
                <span>{{ $t('view.sale.productionOrder.summaryMaterialValue') }}:</span>
                <span class="font-weight-bold">{{ formatCurrency(materialsValue) }}</span>
              </div>
              <div class="summary-item">
                <span>{{ $t('view.sale.productionOrder.summaryLaborCost') }}:</span>
                <span class="font-weight-bold">{{ formatCurrency(estimatedLaborCost) }}</span>
              </div>
              <div class="summary-item border-top pt-2 mt-2">
                <span class="h6">{{ $t('view.sale.productionOrder.summaryTotalValue') }}:</span>
                <span class="h6 font-weight-bold" style="color: var(--base-font-color)">{{ formatCurrency(totalProductionValue) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Production Notes -->
        <div class="row mt-3">
          <div class="col-md-12">
            <div>
              <span class="title-text">{{ $t('view.sale.productionOrder.remarkLabel') }}</span>
              <TextareaGeneric
                v-model="formProductionOrder.remark"
                :rows="3"
                :placeholder="$t('view.sale.productionOrder.remarkPlaceholder')"
              />
            </div>
          </div>
        </div>

        <!-- Validation Messages -->
        <div class="row mt-3" v-if="validationErrors.length > 0">
          <div class="col-md-12">
            <div class="alert alert-warning">
              <h6><i class="bi bi-exclamation-triangle mr-2"></i>{{ $t('view.sale.productionOrder.warningLabel') }}</h6>
              <ul class="mb-0">
                <li v-for="err in validationErrors" :key="err">{{ err }}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="btn-submit-container mt-3">
      <button
        class="btn btn-outline-main mr-2"
        type="button"
        @click="saveDraft"
        :disabled="selectedItemsCount === 0"
      >
        <i class="bi bi-file-earmark mr-1"></i>
        {{ $t('view.sale.productionOrder.saveDraft') }}
      </button>

      <button
        class="btn btn-main mr-2"
        type="button"
        @click="confirmProduction"
        :disabled="selectedItemsCount === 0 || hasValidationErrors"
      >
        <i class="bi bi-check-circle mr-1"></i>
        {{ $t('view.sale.productionOrder.confirmOrder') }}
      </button>

      <button
        class="btn btn-green mr-2"
        type="button"
        @click="generatePDF"
        :disabled="selectedItemsCount === 0"
      >
        <i class="bi bi-file-pdf mr-1"></i>
        {{ $t('view.sale.productionOrder.createPdf') }}
      </button>

      <button
        class="btn btn-dark mr-2"
        type="button"
        @click="clearForm"
      >
        <i class="bi bi-arrow-clockwise mr-1"></i>
        {{ $t('common.btn.clear') }}
      </button>

      <button
        class="btn btn-red mr-2"
        type="button"
        @click="cancelOrder"
      >
        <i class="bi bi-x-circle mr-1"></i>
        {{ $t('common.btn.cancel') }}
      </button>
    </div>
  </div>
</template>

<script>
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import CalendarGeneric from '@/components/prime-vue/CalendarGeneric.vue'
import DropdownGeneric from '@/components/prime-vue/DropdownGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import TextareaGeneric from '@/components/generic/TextareaGeneric.vue'
import { formatDecimal } from '@/services/utils/decimal.js'
import { success, error, confirmSubmit } from '@/services/alert/sweetAlerts.js'

export default {
  name: 'ProductionOrderView',

  components: {
    BaseDataTable,
    CalendarGeneric,
    DropdownGeneric,
    InputTextGeneric,
    TextareaGeneric
  },

  emits: ['update:modelForm', 'update:modelSaleOrder', 'save', 'confirm', 'cancel'],

  props: {
    modelForm: {
      type: Object,
      default: () => ({})
    },
    modelSaleOrder: {
      type: Object,
      default: () => ({})
    }
  },

  data() {
    return {
      productionItems: [],

      formProductionOrder: {
        productionOrderId: null,
        saleOrderId: null,
        saleOrderNumber: '',
        number: '',
        orderDate: new Date(),
        requiredDate: null,
        priority: 'normal',
        status: 'Draft',
        productionType: 'custom',
        workshop: '',
        remark: ''
      },

      saleOrderInfo: {}
    }
  },

  computed: {
    priorityOptions() {
      return [
        { name: this.$t('view.sale.productionOrder.priorityNormal'), value: 'normal' },
        { name: this.$t('view.sale.productionOrder.priorityHigh'), value: 'high' },
        { name: this.$t('view.sale.productionOrder.priorityUrgent'), value: 'urgent' },
        { name: this.$t('view.sale.productionOrder.priorityCritical'), value: 'critical' }
      ]
    },

    statusOptions() {
      return [
        { name: this.$t('view.sale.productionOrder.statusDraft'), value: 'Draft' },
        { name: this.$t('view.sale.productionOrder.statusPendingApproval'), value: 'PendingApproval' },
        { name: this.$t('view.sale.productionOrder.statusConfirmed'), value: 'Confirmed' },
        { name: this.$t('view.sale.productionOrder.statusInProduction'), value: 'InProduction' },
        { name: this.$t('view.sale.productionOrder.statusCompleted'), value: 'Completed' },
        { name: this.$t('view.sale.productionOrder.statusCancelled'), value: 'Cancelled' }
      ]
    },

    productionTypeOptions() {
      return [
        { name: this.$t('view.sale.productionOrder.typeCustom'), value: 'custom' },
        { name: this.$t('view.sale.productionOrder.typeStandard'), value: 'standard' },
        { name: this.$t('view.sale.productionOrder.typeRepair'), value: 'repair' },
        { name: this.$t('view.sale.productionOrder.typeModification'), value: 'modification' }
      ]
    },

    workshopOptions() {
      return [
        { name: this.$t('view.sale.productionOrder.unitCasting'), value: 'casting' },
        { name: this.$t('view.sale.productionOrder.unitSetting'), value: 'setting' },
        { name: this.$t('view.sale.productionOrder.unitPolishing'), value: 'polishing' },
        { name: this.$t('view.sale.productionOrder.unitEngraving'), value: 'engraving' },
        { name: this.$t('view.sale.productionOrder.unitAssembly'), value: 'assembly' }
      ]
    },

    tableColumns() {
      return [
        { field: 'selection', header: this.$t('view.sale.productionOrder.colSelect'), width: '80px', sortable: false, template: 'selectionTemplate' },
        { field: 'image', header: this.$t('view.sale.productionOrder.colImage'), width: '80px', sortable: false, template: 'imageTemplate' },
        { field: 'productNumber', header: this.$t('view.sale.productionOrder.colProductNumber'), minWidth: '120px', sortable: false, template: 'productNumberTemplate' },
        { field: 'productName', header: this.$t('view.sale.productionOrder.colProductName'), minWidth: '200px', sortable: false, template: 'productNameTemplate' },
        { field: 'materials', header: this.$t('view.sale.productionOrder.colMaterials'), minWidth: '180px', sortable: false, template: 'materialsTemplate' },
        { field: 'quantity', header: this.$t('view.sale.productionOrder.colQuantity'), minWidth: '100px', sortable: false, template: 'quantityTemplate' },
        { field: 'estimatedProductionDays', header: this.$t('view.sale.productionOrder.colProductionDays'), minWidth: '120px', sortable: false, template: 'estimatedProductionDaysTemplate' },
        { field: 'unitPrice', header: this.$t('view.sale.productionOrder.colUnitPrice'), minWidth: '120px', sortable: false, template: 'unitPriceTemplate' },
        { field: 'totalValue', header: this.$t('view.sale.productionOrder.colTotalValue'), minWidth: '120px', sortable: false, template: 'totalValueTemplate' }
      ]
    },

    allItemsSelected() {
      return this.productionItems.length > 0 && this.productionItems.every((item) => item.isSelected)
    },

    selectedItems() {
      return this.productionItems.filter((item) => item.isSelected)
    },

    selectedItemsCount() {
      return this.selectedItems.length
    },

    totalQuantity() {
      return this.selectedItems.reduce((sum, item) => sum + (item.quantity || 0), 0)
    },

    averageProductionDays() {
      if (this.selectedItemsCount === 0) return 0
      const totalDays = this.selectedItems.reduce((sum, item) => sum + (item.estimatedProductionDays || 0), 0)
      return Math.round(totalDays / this.selectedItemsCount)
    },

    totalMaterials() {
      return this.selectedItems.reduce(
        (totals, item) => {
          if (item.materials) {
            totals.gold += (item.materials.gold?.weight * item.quantity) || 0
            totals.diamond += (item.materials.diamond?.weight * item.quantity) || 0
            totals.gems += (item.materials.gems?.weight * item.quantity) || 0
          }
          return totals
        },
        { gold: 0, diamond: 0, gems: 0 }
      )
    },

    materialsValue() {
      const goldPrice = 2800
      const diamondPrice = 150000
      const gemPrice = 10000
      return (
        this.totalMaterials.gold * goldPrice +
        this.totalMaterials.diamond * diamondPrice +
        this.totalMaterials.gems * gemPrice
      )
    },

    estimatedLaborCost() {
      return this.selectedItems.reduce((sum, item) => {
        const baseLaborCost = 5000
        const complexityMultiplier = item.estimatedProductionDays / 7
        return sum + baseLaborCost * complexityMultiplier * item.quantity
      }, 0)
    },

    totalProductionValue() {
      return this.materialsValue + this.estimatedLaborCost
    },

    validationErrors() {
      const errors = []

      if (this.selectedItemsCount === 0) {
        errors.push(this.$t('view.sale.productionOrder.validation.selectItems'))
      }

      if (!this.formProductionOrder.requiredDate) {
        errors.push(this.$t('view.sale.productionOrder.validation.requiredDate'))
      }

      if (!this.formProductionOrder.workshop) {
        errors.push(this.$t('view.sale.productionOrder.validation.productionUnit'))
      }

      return errors
    },

    hasValidationErrors() {
      return this.validationErrors.length > 0
    }
  },

  watch: {
    modelForm: {
      handler(newVal) {
        if (newVal && Object.keys(newVal).length > 0) {
          this.formProductionOrder = { ...this.formProductionOrder, ...newVal }
        }
      },
      deep: true
    },

    modelSaleOrder: {
      handler(newVal) {
        if (newVal && newVal.number) {
          this.loadSaleOrderData(newVal)
        }
      },
      deep: true
    }
  },

  mounted() {
    this.loadFromQueryParams()
  },

  methods: {
    loadFromQueryParams() {
      const query = this.$route.query

      if (query.saleOrderNumber && query.items) {
        let items = []
        try {
          items = JSON.parse(query.items)
        } catch {
          error(
            this.$t('view.sale.productionOrder.error.loadFail'),
            this.$t('view.sale.productionOrder.error.loadFailTitle')
          )
          return
        }

        const saleOrderData = {
          saleOrderId: query.saleOrderId,
          number: query.saleOrderNumber,
          customerName: query.customerName,
          items
        }

        this.loadSaleOrderData(saleOrderData)
        success(
          this.$t('view.sale.productionOrder.success.loadSO', { soNumber: query.saleOrderNumber }),
          this.$t('view.sale.productionOrder.success.loadSOTitle')
        )
      }
    },

    loadSaleOrderData(saleOrderData) {
      this.saleOrderInfo = saleOrderData
      this.formProductionOrder.saleOrderId = saleOrderData.saleOrderId
      this.formProductionOrder.saleOrderNumber = saleOrderData.number

      this.productionItems = (saleOrderData.items || [])
        .filter((item) => item.itemType === 'Production')
        .map((item) => ({
          ...item,
          isSelected: false,
          materials: {
            gold: { weight: 15.5 },
            diamond: { weight: 0.5 },
            gems: { weight: 1.2 }
          },
          imageUrl: null
        }))
    },

    toggleAllItems() {
      const newState = !this.allItemsSelected
      this.productionItems.forEach((item) => {
        item.isSelected = newState
      })
    },

    updateItemSelection() {},

    updateItemQuantity() {},

    saveDraft() {
      const productionOrderData = {
        ...this.formProductionOrder,
        status: 'Draft',
        items: this.selectedItems
      }
      this.$emit('save', productionOrderData)
      success(
        this.$t('view.sale.productionOrder.success.saveDraft'),
        this.$t('view.sale.productionOrder.success.saveDraftTitle')
      )
    },

    confirmProduction() {
      if (this.hasValidationErrors) {
        error(
          this.$t('view.sale.productionOrder.error.cannotConfirm'),
          this.$t('view.sale.productionOrder.error.cannotConfirmTitle')
        )
        return
      }

      const productionOrderData = {
        ...this.formProductionOrder,
        status: 'Confirmed',
        items: this.selectedItems
      }
      this.$emit('confirm', productionOrderData)
      success(
        this.$t('view.sale.productionOrder.success.confirm'),
        this.$t('view.sale.productionOrder.success.confirmTitle')
      )
    },

    generatePDF() {
      success(
        this.$t('view.sale.productionOrder.success.createPdf'),
        this.$t('view.sale.productionOrder.success.createPdfTitle')
      )
    },

    cancelOrder() {
      confirmSubmit(
        this.$t('view.sale.productionOrder.confirm.cancel'),
        this.$t('view.sale.productionOrder.confirm.cancelTitle'),
        () => {
          this.clearForm()
          this.$emit('cancel')
        }
      )
    },

    clearForm() {
      this.productionItems = []
      this.saleOrderInfo = {}
      this.formProductionOrder = {
        productionOrderId: null,
        saleOrderId: null,
        saleOrderNumber: '',
        number: '',
        orderDate: new Date(),
        requiredDate: null,
        priority: 'normal',
        status: 'Draft',
        productionType: 'custom',
        workshop: '',
        remark: ''
      }
    },

    formatDate(date) {
      if (!date) return '-'
      return new Date(date).toLocaleDateString('th-TH')
    },

    formatCurrency(amount) {
      return formatDecimal(amount, 2) + ' THB'
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
@import '@/assets/scss/custom-style/standard-data-table.scss';

.card-container {
  background: var(--color-card-bg);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  margin-bottom: var(--sp-lg);
}

.card-header {
  background: #f8f9fa;
  border-bottom: 1px solid var(--color-border);
  padding: var(--sp-sm) var(--sp-lg);
  border-radius: var(--radius-md) var(--radius-md) 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header-actions {
  display: flex;
  align-items: center;
}

.card-body {
  padding: var(--sp-lg);
}

.info-display {
  background: #f8f9fa;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: var(--sp-sm) var(--sp-md);
  min-height: 38px;
  display: flex;
  align-items: center;
}

.product-image {
  display: flex;
  justify-content: center;
  align-items: center;
}

.product-thumbnail {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
}

.product-description {
  font-size: var(--fs-base);
  line-height: var(--lh-sm);
}

.materials-info {
  .material-item {
    font-size: var(--fs-sm);
    margin-bottom: var(--sp-xs);

    &:last-child {
      margin-bottom: 0;
    }
  }
}

.badge {
  padding: var(--sp-xs) var(--sp-sm);
  font-size: var(--fs-sm);
  border-radius: var(--radius-sm);
  font-weight: 600;

  &.badge-info {
    background-color: var(--base-green);
    color: white;
  }
}

.summary-section {
  background: #f8f9fa;
  padding: var(--sp-lg);
  border-radius: var(--radius-sm);
  height: 100%;

  h6 {
    color: #495057;
    margin-bottom: var(--sp-sm);
    border-bottom: 1px solid var(--color-border);
    padding-bottom: var(--sp-sm);
  }
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--sp-sm);

  &:last-child {
    margin-bottom: 0;
  }

  &.border-top {
    border-top: 1px solid var(--color-border);
    padding-top: var(--sp-sm);
    margin-top: var(--sp-sm);
  }
}

.form-check-input {
  margin: 0;
}

.alert {
  padding: var(--sp-lg);
  margin-bottom: var(--sp-lg);
  border: 1px solid transparent;
  border-radius: var(--radius-sm);

  &.alert-warning {
    color: #856404;
    background-color: #fff3cd;
    border-color: #ffeaa7;
  }
}

.text-right {
  text-align: right;
}

.text-center {
  text-align: center;
}

.text-muted {
  color: #6c757d !important;
}

.text-warning {
  color: var(--base-warning) !important;
}

.text-info {
  color: var(--base-green) !important;
}

.font-weight-bold {
  font-weight: 600;
}

.d-flex {
  display: flex;
}

.align-items-center {
  align-items: center;
}
</style>
