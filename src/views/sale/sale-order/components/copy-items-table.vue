<template>
  <div class="card-container mt-3" v-if="copyItems.length > 0">
    <div class="card-header">
      <h6 class="mb-0">{{ $t('view.sale.saleOrder.copyItemsTitle') }}</h6>
      <div class="card-header-actions">
        <span class="badge badge-warning">{{ copyItems.length }} {{ $t('view.sale.saleOrder.itemUnit') }}</span>
      </div>
    </div>
    <div class="card-body p-0">
      <!-- eslint-disable-next-line no-restricted-imports -->
      <DataTable
        :value="copyItems"
        dataKey="productNumber"
        :scrollable="true"
        scrollHeight="10000000px"
        class="p-datatable-sm"
        stripedRows
        responsiveLayout="scroll"
        showGridlines
      >
        <ColumnGroup type="header">
          <Row>
            <Column header="" :colspan="2" />
            <Column header="" />
            <Column :header="$t('view.sale.saleOrder.stockNumberNew')" />
            <Column :header="$t('view.sale.saleOrder.productCode')" />
            <Column :header="$t('view.sale.saleOrder.description')" />
            <Column header="Gold (gms)" />
            <Column header="Diamond (cts)" />
            <Column header="Stone (cts)" />
            <Column :header="$t('view.sale.saleOrder.salePriceTHB')" />
            <Column :header="$t('view.sale.saleOrder.appraisalPriceTHB')" />
            <Column :header="$t('view.sale.saleOrder.discountPercent')" />
            <Column :header="$t('view.sale.saleOrder.discountPriceTHB')" />
            <Column :header="$t('view.sale.saleOrder.convertedRate')" />
            <Column :header="$t('view.sale.saleOrder.convertedPrice') + ' (' + (formSaleOrder.currencyUnit || 'THB') + ')'" />
            <Column :header="$t('common.field.quantity')" />
            <Column :header="$t('view.sale.saleOrder.totalPrice') + ' (' + (formSaleOrder.currencyUnit || 'THB') + ')'" />
          </Row>
        </ColumnGroup>

        <Column field="index" style="width: 10px">
          <template #body="slotProps">
            <span>{{ slotProps.index + 1 }}</span>
          </template>
        </Column>

        <Column field="action" style="width: 10px">
          <template #body="slotProps">
            <div class="d-flex justify-content-center align-items-center">
              <button
                class="btn btn-sm btn-red"
                type="button"
                :title="$t('common.btn.delete')"
                @click="$emit('delete-item', slotProps.index)"
              >
                <span class="bi bi-trash"></span>
              </button>
              <button
                class="btn btn-sm btn-main ml-2"
                type="button"
                :title="$t('common.btn.edit')"
                @click="$emit('edit-item', slotProps.data)"
              >
                <span class="bi bi-brush"></span>
              </button>
            </div>
          </template>
        </Column>

        <Column field="image" header="" style="width: 50px">
          <template #body="slotProps">
            <div class="image-container">
              <div v-if="slotProps.data.imagePath">
                <imagePreview
                  :imageName="slotProps.data.imagePath"
                  :path="slotProps.data.imagePath"
                  type="STOCK-PRODUCT"
                  :width="25"
                  :height="25"
                  :emitImage="true"
                  @image-loaded="$emit('image-loaded', { imageData: $event, stockNumber: slotProps.data.stockNumber })"
                />
              </div>
            </div>
          </template>
        </Column>

        <Column field="stockNumber" :header="$t('view.sale.saleOrder.productionNumber')" style="min-width: 150px">
          <template #body>
            <span class="text-muted font-italic">{{ $t('view.sale.saleOrder.needsProduction') }}</span>
          </template>
        </Column>

        <Column field="productNumber" :header="$t('view.sale.saleOrder.productCode')" style="min-width: 150px">
          <template #body="slotProps">
            <div>
              <input
                v-if="!slotProps.data.isConfirm && !slotProps.data.invoice"
                v-model="slotProps.data.productNumber"
                type="text"
                class="form-control bg-input input-bg"
                @blur="$emit('blur-description', { item: slotProps.data, stockNumber: slotProps.data.stockNumber, field: 'productNumber', event: $event })"
                style="background-color: #b5dad4; width: 100%"
              />
              <span v-else class="confirmed-text">
                {{ slotProps.data.productNumber || '-' }}
              </span>
            </div>
          </template>
        </Column>

        <Column field="description" :header="$t('view.sale.saleOrder.description')" style="min-width: 200px">
          <template #body="slotProps">
            <input
              v-if="!slotProps.data.isConfirm && !slotProps.data.invoice"
              v-model="slotProps.data.description"
              type="text"
              class="form-control bg-input input-bg"
              @blur="$emit('blur-description', { item: slotProps.data, stockNumber: slotProps.data.stockNumber, field: 'description', event: $event })"
              style="background-color: #b5dad4; width: 100%"
            />
            <span v-else class="confirmed-text">
              {{ slotProps.data.description || '-' }}
            </span>
          </template>
        </Column>

        <!-- Materials Columns like Quotation -->
        <Column field="gold" style="min-width: 120px; max-width: 300px">
          <template #body="slotProps">
            <div v-if="slotProps.data.materials">
              <div
                v-for="(item, idx) in slotProps.data.materials.filter((m) => m.type === 'Gold')"
                :key="idx"
                class="material-cell"
              >
                <div class="material-typecode-gold">
                  {{ item.typeCode }}
                </div>
                <div class="material-weight">
                  {{ item.weight ? item.weight.toFixed(2) : (0).toFixed(2) }}
                </div>
              </div>
            </div>
          </template>
        </Column>

        <Column field="diamond" style="min-width: 140px; max-width: 300px">
          <template #body="slotProps">
            <div v-if="slotProps.data.materials">
              <div
                v-for="(item, idx) in slotProps.data.materials.filter(
                  (m) => m.type === 'Diamond'
                )"
                :key="idx"
                class="material-cell"
              >
                <div class="material-typecode">
                  {{ `${item.qty ? `(${item.qty})` : ''} ${item.typeCode}` }}
                </div>
                <div class="material-weight">
                  {{ item.weight ? item.weight.toFixed(2) : (0).toFixed(2) }}
                </div>
              </div>
            </div>
          </template>
        </Column>

        <Column field="gem" style="min-width: 140px; max-width: 300px">
          <template #body="slotProps">
            <div v-if="slotProps.data.materials">
              <div
                v-for="(item, idx) in slotProps.data.materials.filter((m) => m.type === 'Gem')"
                :key="idx"
                class="material-cell"
              >
                <div class="material-typecode">
                  {{ `${item.qty ? `(${item.qty})` : ''} ${item.typeCode}` }}
                </div>
                <div class="material-weight">
                  {{ item.weight ? item.weight.toFixed(2) : (0).toFixed(2) }}
                </div>
              </div>
            </div>
          </template>
        </Column>

        <Column field="priceOrigin" :header="$t('view.sale.saleOrder.salePriceTHB')" style="min-width: 150px">
          <template #body="slotProps">
            <div class="qty-container">
              <span>{{
                Number(slotProps.data.priceOrigin || slotProps.data.price || 0).toFixed(2)
              }}</span>
            </div>
          </template>
        </Column>

        <Column field="appraisalPrice" :header="$t('view.sale.saleOrder.appraisalPriceTHB')" style="min-width: 150px">
          <template #body="slotProps">
            <div class="qty-container">
              <input
                v-if="!slotProps.data.isConfirm && !slotProps.data.invoice"
                v-model.number="slotProps.data.appraisalPrice"
                type="number"
                class="form-control text-right bg-input input-bg"
                min="0"
                step="any"
                @blur="$emit('blur-price', { item: slotProps.data, stockNumber: slotProps.data.stockNumber, field: 'appraisalPrice', event: $event })"
                style="background-color: #b5dad4; width: 100%"
              />
              <span v-else class="confirmed-text text-right">
                {{ (Number(slotProps.data.appraisalPrice) || 0).toFixed(2) }}
              </span>
            </div>
          </template>
        </Column>

        <Column field="discountPercent" :header="$t('view.sale.saleOrder.discountPercent')" style="min-width: 100px">
          <template #body="slotProps">
            <div class="qty-container">
              <input
                v-if="!slotProps.data.isConfirm && !slotProps.data.invoice"
                v-model.number="slotProps.data.discountPercent"
                type="number"
                class="form-control text-right bg-input input-bg"
                min="0"
                max="100"
                step="any"
                @blur="$emit('blur-price', { item: slotProps.data, stockNumber: slotProps.data.stockNumber, field: 'discountPercent', event: $event })"
                style="background-color: #b5dad4; width: 100%"
                placeholder="0"
              />
              <span v-else class="confirmed-text text-right">
                {{ (slotProps.data.discountPercent || 0).toFixed(2) }}%
              </span>
            </div>
          </template>
        </Column>

        <Column field="discountPrice" :header="$t('view.sale.saleOrder.discountPriceTHB')" style="min-width: 150px">
          <template #body="slotProps">
            <div class="qty-container">
              <span>{{
                (
                  Number(slotProps.data.appraisalPrice || 0) *
                  (1 - (slotProps.data.discountPercent || 0) / 100)
                ).toFixed(2)
              }}</span>
            </div>
          </template>
        </Column>

        <Column field="currencyRate" :header="$t('view.sale.saleOrder.convertedRate')" style="min-width: 100px">
          <template #body>
            <div class="qty-container">
              <span>{{ formSaleOrder.currencyRate }}</span>
            </div>
          </template>
        </Column>

        <Column
          field="priceAfterMultiply"
          :header="$t('view.sale.saleOrder.convertedPrice') + ' (' + (formSaleOrder.currencyUnit || '') + ')'"
          style="min-width: 150px"
        >
          <template #body="slotProps">
            <div class="qty-container">
              <span>{{
                (
                  (Number(slotProps.data.appraisalPrice || 0) *
                    (1 - (slotProps.data.discountPercent || 0) / 100)) /
                  (formSaleOrder.currencyRate || 1)
                ).toFixed(2)
              }}</span>
            </div>
          </template>
        </Column>

        <Column field="qty" :header="$t('common.field.quantity')" style="width: 80px">
          <template #body="slotProps">
            <div class="qty-container">
              <input
                v-model.number="slotProps.data.qty"
                type="number"
                class="form-control text-right bg-input input-bg"
                min="0"
                step="1"
                @blur="$emit('blur-qty', { item: slotProps.data, stockNumber: slotProps.data.stockNumber, field: 'qty', event: $event })"
                style="background-color: #b5dad4; width: 100%"
              />
            </div>
          </template>
        </Column>

        <Column
          field="total"
          :header="$t('view.sale.saleOrder.totalPrice') + ' (' + (formSaleOrder.currencyUnit || '') + ')'"
          style="min-width: 150px"
        >
          <template #body="slotProps">
            <div class="qty-container">
              <span>{{
                (
                  ((Number(slotProps.data.appraisalPrice || 0) *
                    (1 - (slotProps.data.discountPercent || 0) / 100)) /
                    (formSaleOrder.currencyRate || 1)) *
                  (Number(slotProps.data.qty) || 0)
                ).toFixed(2)
              }}</span>
            </div>
          </template>
        </Column>

        <ColumnGroup type="footer">
          <!-- total -->
          <Row>
            <Column :colspan="5">
              <template #footer>
                <div class="text-left type-container">
                  <span class="mr-2">Net Weight Of Merchandise</span>
                  <span class="mr-2">{{ getNetWeight(copyItems) }}</span>
                  <span>gms.</span>
                </div>
              </template>
            </Column>
            <Column>
              <template #footer>
                <div class="text-right type-container">
                  <span>{{ $t('view.sale.quotation.total') }}</span>
                </div>
              </template>
            </Column>
            <Column>
              <template #footer>
                <div class="text-right type-container">
                  <span>{{ getGoldWeight(copyItems) }}</span>
                </div>
              </template>
            </Column>
            <Column>
              <template #footer>
                <div class="text-right type-container">
                  <span>{{ getDiamondWeight(copyItems) }}</span>
                </div>
              </template>
            </Column>
            <Column>
              <template #footer>
                <div class="text-right type-container">
                  <span>{{ getGemWeight(copyItems) }}</span>
                </div>
              </template>
            </Column>
            <Column :colspan="2">
              <template #footer>
                <div class="text-right type-container">
                  <span>{{ getSumAppraisalPrice(copyItems) }}</span>
                </div>
              </template>
            </Column>
            <Column :colspan="2">
              <template #footer>
                <div class="text-right type-container">
                  <span>{{ getSumDiscountPrice(copyItems) }}</span>
                </div>
              </template>
            </Column>
            <Column :colspan="2">
              <template #footer>
                <div class="text-right type-container">
                  <span>{{ getSumConvertedPrice(copyItems) }}</span>
                </div>
              </template>
            </Column>
            <Column>
              <template #footer>
                <div class="text-right type-container">
                  <span>{{ getSumQty(copyItems) }}</span>
                </div>
              </template>
            </Column>
            <Column>
              <template #footer>
                <div class="text-right type-container">
                  <span>{{ getSumTotalConvertedPrice(copyItems) }}</span>
                </div>
              </template>
            </Column>
          </Row>
          <!-- total after discount -->
          <Row>
            <Column :colspan="16">
              <template #footer>
                <div class="text-right type-container">
                  <span>{{ $t('view.sale.saleOrder.copyItemsTotal') }}</span>
                </div>
              </template>
            </Column>
            <Column>
              <template #footer>
                <div class="text-right type-container">
                  <span>{{ formatPrice(copyItemsTotalAmount) }}</span>
                </div>
              </template>
            </Column>
          </Row>
        </ColumnGroup>
      </DataTable>
    </div>
  </div>
</template>

<script>
// eslint-disable-next-line no-restricted-imports
import DataTable from 'primevue/datatable'
// eslint-disable-next-line no-restricted-imports
import Column from 'primevue/column'
// eslint-disable-next-line no-restricted-imports
import ColumnGroup from 'primevue/columngroup'
// eslint-disable-next-line no-restricted-imports
import Row from 'primevue/row'
import imagePreview from '@/components/prime-vue/ImagePreviewEmit.vue'
import { formatDecimal } from '@/services/utils/decimal.js'

export default {
  name: 'CopyItemsTable',

  components: {
    DataTable,
    Column,
    ColumnGroup,
    Row,
    imagePreview
  },

  props: {
    copyItems: {
      type: Array,
      default: () => []
    },
    formSaleOrder: {
      type: Object,
      default: () => ({})
    }
  },

  emits: ['delete-item', 'edit-item', 'blur-price', 'blur-qty', 'blur-description', 'image-loaded'],

  computed: {
    copyItemsTotalAmount() {
      return this.getSumTotalConvertedPrice(this.copyItems) + (this.formSaleOrder.copyFreight || 0)
    }
  },

  methods: {
    getAppraisalPrice(item) {
      return item.appraisalPrice || item.price || 0
    },

    getDiscountedPrice(item) {
      const appraisalPrice = this.getAppraisalPrice(item)
      const discountPercent = item.discountPercent || 0
      return appraisalPrice * (1 - discountPercent / 100)
    },

    getConvertedPrice(item) {
      const discountedPrice = this.getDiscountedPrice(item)
      const currencyRate = this.formSaleOrder.currencyRate || 1
      return discountedPrice / currencyRate
    },

    getTotalConvertedPrice(item) {
      const convertedPrice = this.getConvertedPrice(item)
      const qty = item.qty || 0
      return convertedPrice * qty
    },

    getNetWeight(items) {
      return items
        .reduce((sum, item) => {
          if (!item.materials) return sum
          return (
            sum +
            item.materials.reduce((matSum, mat) => {
              return matSum + (mat.weight || 0)
            }, 0)
          )
        }, 0)
        .toFixed(2)
    },

    getGoldWeight(items) {
      return items
        .reduce((sum, item) => {
          if (!item.materials) return sum
          return (
            sum +
            item.materials
              .filter((m) => m.type === 'Gold')
              .reduce((matSum, mat) => matSum + (mat.weight || 0), 0)
          )
        }, 0)
        .toFixed(2)
    },

    getDiamondWeight(items) {
      return items
        .reduce((sum, item) => {
          if (!item.materials) return sum
          return (
            sum +
            item.materials
              .filter((m) => m.type === 'Diamond')
              .reduce((matSum, mat) => matSum + (mat.weight || 0), 0)
          )
        }, 0)
        .toFixed(2)
    },

    getGemWeight(items) {
      return items
        .reduce((sum, item) => {
          if (!item.materials) return sum
          return (
            sum +
            item.materials
              .filter((m) => m.type === 'Gem')
              .reduce((matSum, mat) => matSum + (mat.weight || 0), 0)
          )
        }, 0)
        .toFixed(2)
    },

    getSumAppraisalPrice(items) {
      if (!items || !Array.isArray(items) || items.length === 0) return '0.00'

      const total = items.reduce((sum, item) => {
        const price = this.getAppraisalPrice(item)
        return sum + (Number(price) || 0)
      }, 0)

      return Number(total).toFixed(2)
    },

    getSumDiscountPrice(items) {
      if (!items || !Array.isArray(items) || items.length === 0) return '0.00'

      const total = items.reduce((sum, item) => {
        const price = this.getDiscountedPrice(item)
        return sum + (Number(price) || 0)
      }, 0)

      return Number(total).toFixed(2)
    },

    getSumConvertedPrice(items) {
      if (!items || !Array.isArray(items) || items.length === 0) return '0.00'

      const total = items.reduce((sum, item) => {
        const price = this.getConvertedPrice(item)
        return sum + (Number(price) || 0)
      }, 0)

      return Number(total).toFixed(2)
    },

    getSumQty(items) {
      if (!items || !Array.isArray(items) || items.length === 0) return 0

      return items.reduce((sum, item) => {
        return sum + (Number(item.qty) || 0)
      }, 0)
    },

    getSumTotalConvertedPrice(items) {
      if (!items || !Array.isArray(items) || items.length === 0) return 0

      return items.reduce((sum, item) => {
        const price = this.getTotalConvertedPrice(item)
        return sum + (Number(price) || 0)
      }, 0)
    },

    formatCurrency(amount, currency = null) {
      const formattedAmount = formatDecimal(amount, 2)
      const displayCurrency = currency || this.formSaleOrder.currencyUnit || 'THB'
      return formattedAmount + ' ' + displayCurrency
    },

    formatPrice(price) {
      const numPrice = Number(price)
      return numPrice.toLocaleString('th-TH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';

/* Quotation table styles */
.input-bg {
  background-color: #b5dad4 !important;
}

/* Align cell content to top for all columns */
:deep(.p-column-body),
:deep(.p-cell-text) {
  vertical-align: top !important;
}

:deep(.p-column-body) {
  vertical-align: top !important;
  padding: 0.5rem 0.75rem;
}

.qty-container {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-right: 5px;
}

.type-container {
  font-size: 13px;
  font-weight: bold;
  color: var(--base-font-color);
  padding: 5px;
}

.card-container {
  border: 1px solid #dddddd;
  border-radius: 5px;
  box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
  background-color: #f7f7f7;
}

.card-header {
  background: var(--base-font-color);
  border-bottom: 1px solid #e9ecef;
  border-radius: 5px 5px 0px 0px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 300;
  color: white;
}

.card-header-actions {
  display: flex;
  align-items: center;
}

.card-body {
  padding: 1rem;
}

/* Fix material cell layout */
.material-cell {
  display: flex;
  gap: 1px;
  align-items: flex-start;
  min-width: 0;
}

.material-typecode {
  flex: 5;
  text-align: left;
  margin-right: 0.5rem;
  min-width: 120px;
  word-break: break-word;
  white-space: normal;
  overflow-wrap: anywhere;
  vertical-align: top;
}

.material-typecode-gold {
  flex: 5;
  text-align: center;
  margin-right: 0.5rem;
  min-width: 0;
  word-break: break-word;
  white-space: normal;
  overflow-wrap: anywhere;
  vertical-align: top;
}

.material-weight {
  flex: 1;
  vertical-align: top;
}

/* DataTable cell alignment fixes */
:deep(.p-datatable-thead > tr > th) {
  text-align: center;
  vertical-align: middle;
  padding: 0.75rem 0.5rem;
  font-weight: 600;
}

:deep(.p-datatable-tbody > tr > td) {
  vertical-align: top;
  padding: 0.5rem;
}

:deep(.p-datatable-tfoot > tr > td) {
  vertical-align: middle;
  padding: 0.5rem;
  font-weight: 500;
}

/* Input field adjustments */
.qty-container input,
.form-control.bg-input {
  font-size: 0.875rem;
  padding: 0.375rem 0.5rem;
}

.image-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Confirmed text styling */
.confirmed-text {
  display: block;
  padding: 8px 12px;
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  color: #495057;
  font-weight: 500;
  width: 100%;
  min-height: 38px;
  line-height: 1.5;
}

.confirmed-text.text-right {
  text-align: right;
}

.badge {
  padding: 0.25em 0.5em;
  font-size: 0.75em;
  border-radius: 0.25rem;
  font-weight: 600;

  &.badge-warning {
    background-color: #ffc107;
    color: #212529;
  }
}

.text-right {
  text-align: right;
}

.font-weight-bold {
  font-weight: 600;
}

.d-flex {
  display: flex;
}

.mr-2 {
  margin-right: 0.5rem;
}
</style>
