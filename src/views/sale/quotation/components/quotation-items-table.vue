<template>
  <div class="base-datatable mt-2">
    <DataTable
      :value="customer.quotationItems"
      rowGroupMode="subheader"
      groupRowsBy="nameGroup"
      stripedRows
      showGridlines
      :rowClass="getRowClass"
    >
      <ColumnGroup type="header">
        <Row>
          <Column header="" :colspan="2" />
          <Column header="" />
          <Column :header="$t('view.sale.quotation.stockNumber')" />
          <Column :header="$t('view.sale.quotation.productCode')" />
          <Column :header="$t('view.sale.quotation.descriptionCol')" />
          <Column :header="$t('view.sale.quotation.goldWeight')" />
          <Column :header="$t('view.sale.quotation.diamondWeight')" />
          <Column :header="$t('view.sale.quotation.stoneWeight')" />
          <Column :header="$t('view.sale.quotation.salePriceTHB')" />
          <Column :header="$t('view.sale.quotation.appraisalPriceTHB')" />
          <Column :header="$t('view.sale.quotation.discount')" />
          <Column :header="$t('view.sale.quotation.discountPriceTHB')" />
          <Column :header="$t('view.sale.quotation.convertedRate')" />
          <Column :header="$t('view.sale.quotation.convertedPrice') + ' (' + (customer.currencyUnit || '') + ') '" />
          <Column :header="$t('view.sale.quotation.quantity')" />
          <Column :header="$t('view.sale.quotation.totalPrice') + ' (' + (customer.currencyUnit || '') + ') '" />
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
              @click="$emit('del-item', slotProps.index)"
            >
              <span class="bi bi-trash"></span>
            </button>
            <button
              class="btn btn-sm btn-main ml-2"
              type="button"
              :title="$t('common.btn.edit')"
              @click="$emit('edit-stock', { data: slotProps.data, index: slotProps.index })"
            >
              <span class="bi bi-brush"></span>
            </button>
            <button
              class="btn btn-sm btn-outline-dark ml-2"
              type="button"
              :title="$t('common.btn.copy')"
              @click="$emit('copy-item', slotProps.data)"
            >
              <span class="bi bi-files"></span>
            </button>
          </div>
        </template>
      </Column>

      <column field="image" header="" style="width: 50px">
        <template #body="slotProps">
          <div class="image-container">
            <div
              v-if="slotProps.data._copyId"
              class="copy-img-wrap"
              :title="$t('view.sale.quotation.addImageTitle')"
              @click="$emit('upload-copy-image', slotProps.data)"
            >
              <img
                v-if="slotProps.data.imageBase64"
                :src="slotProps.data.imageBase64"
                class="copy-img-thumb"
              />
              <div v-else class="copy-img-placeholder">
                <i class="bi bi-camera"></i>
              </div>
            </div>
            <div v-else-if="slotProps.data.imageBase64 || slotProps.data.imagePath">
              <img
                v-if="slotProps.data.imageBase64"
                :src="slotProps.data.imageBase64"
                class="stock-img-thumb"
              />
              <imagePreview
                v-else
                :imageName="slotProps.data.imagePath"
                :path="slotProps.data.imagePath"
                type="STOCK-PRODUCT"
                :width="25"
                :height="25"
                :emitImage="false"
              />
            </div>
          </div>
        </template>
      </column>

      <column field="stockNumber" :header="$t('view.sale.quotation.stockNumber')" style="min-width: 150px">
        <template #body="slotProps">
          <span>{{
            `${
              slotProps.data.stockNumberOrigin
                ? slotProps.data.stockNumberOrigin || ''
                : slotProps.data.stockNumber || ''
            }`
          }}</span>
        </template>
      </column>

      <column field="stockNumber" :header="$t('view.sale.quotation.productCode')" style="min-width: 150px">
        <template #body="slotProps">
          <div v-if="!slotProps.data.stockNumber">
            <input
              v-model="slotProps.data.productNumber"
              type="text"
              class="form-control bg-input input-bg"
              @blur="$emit('blur-description', { data: slotProps.data, index: slotProps.index, fieldName: 'productNumber' })"
              style="background-color: #b5dad4; width: 100%"
            />
          </div>
          <div v-else>
            <span>{{ slotProps.data.productNumber }}</span>
          </div>
        </template>
      </column>

      <column field="description" :header="$t('view.sale.quotation.descriptionCol')" style="min-width: 200px">
        <template #body="slotProps">
          <input
            v-model="slotProps.data.description"
            type="text"
            class="form-control bg-input input-bg"
            @blur="$emit('blur-description', { data: slotProps.data, index: slotProps.index, fieldName: 'description' })"
            style="background-color: #b5dad4; width: 100%"
          />
        </template>
      </column>

      <column field="gold" style="min-width: 120px; max-width: 300px">
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
      </column>

      <column field="diamond" style="min-width: 140px; max-width: 300px">
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
      </column>

      <column field="gem" style="min-width: 140px; max-width: 300px">
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
      </column>

      <column field="priceOrigin" :header="$t('view.sale.quotation.salePriceTHB')" style="min-width: 150px">
        <template #body="slotProps">
          <div class="qty-container">
            <span>{{
              Number(slotProps.data.priceOrigin || slotProps.data.price || 0).toFixed(2)
            }}</span>
          </div>
        </template>
      </column>

      <column field="appraisalPrice" :header="$t('view.sale.quotation.appraisalPriceTHB')" style="min-width: 150px">
        <template #body="slotProps">
          <div class="qty-container">
            <input
              v-model.number="slotProps.data.appraisalPrice"
              type="number"
              class="form-control text-right bg-input input-bg"
              min="0"
              step="any"
              @blur="$emit('blur-price', { data: slotProps.data, index: slotProps.index, fieldName: 'appraisalPrice' })"
              style="background-color: #b5dad4; width: 100%"
            />
          </div>
        </template>
      </column>

      <column field="discountPercent" :header="$t('view.sale.quotation.discount') + ' (%)'" style="min-width: 100px">
        <template #body="slotProps">
          <div class="qty-container">
            <input
              v-model.number="slotProps.data.discountPercent"
              type="number"
              class="form-control text-right bg-input input-bg"
              min="0"
              max="100"
              step="any"
              style="background-color: #b5dad4; width: 100%"
              placeholder="0"
            />
          </div>
        </template>
      </column>

      <column field="discountPrice" :header="$t('view.sale.quotation.discountPriceTHB')" style="min-width: 150px">
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
      </column>

      <column field="currencyMultiplier" :header="$t('view.sale.quotation.convertedRate')" style="min-width: 100px">
        <template #body>
          <div class="qty-container">
            <span>{{ customer.currencyMultiplier }}</span>
          </div>
        </template>
      </column>

      <column
        field="priceAfterMultiply"
        :header="$t('view.sale.quotation.convertedPrice') + ' (' + (customer.currencyUnit || '') + ') '"
        style="min-width: 150px"
      >
        <template #body="slotProps">
          <div class="qty-container">
            <span>{{
              formatDocMoney(
                (Number(slotProps.data.appraisalPrice || 0) *
                  (1 - (slotProps.data.discountPercent || 0) / 100)) /
                (customer.currencyMultiplier || 1)
              )
            }}</span>
          </div>
        </template>
      </column>

      <column field="qty" :header="$t('view.sale.quotation.quantity')" style="width: 80px">
        <template #body="slotProps">
          <div class="qty-container">
            <input
              v-model.number="slotProps.data.qty"
              type="number"
              class="form-control text-right bg-input input-bg"
              min="0"
              step="1"
              @blur="$emit('blur-qty', { data: slotProps.data, index: slotProps.index, fieldName: 'qty' })"
              style="background-color: #b5dad4; width: 100%"
            />
          </div>
        </template>
      </column>

      <column
        field="total"
        :header="$t('view.sale.quotation.totalPrice') + ' (' + (customer.currencyUnit || '') + ') '"
        style="min-width: 150px"
      >
        <template #body="slotProps">
          <div class="qty-container">
            <span>{{
              formatDocMoney(
                ((Number(slotProps.data.appraisalPrice || 0) *
                  (1 - (slotProps.data.discountPercent || 0) / 100)) /
                  (customer.currencyMultiplier || 1)) *
                (Number(slotProps.data.qty) || 0)
              )
            }}</span>
          </div>
        </template>
      </column>

      <ColumnGroup type="footer">
        <!-- total -->
        <Row>
          <column :colspan="5">
            <template #footer>
              <div class="text-left type-container">
                <span class="mr-2">{{ $t('view.sale.quotation.netWeightMerchandise') }}</span>
                <span class="mr-2">{{ sumNetWeight }}</span>
                <span>{{ $t('view.sale.quotation.unitGrams') }}</span>
              </div>
            </template>
          </column>
          <column>
            <template #footer>
              <div class="text-right type-container">
                <span>{{ $t('view.sale.quotation.total') }}</span>
              </div>
            </template>
          </column>
          <column>
            <template #footer>
              <div class="text-right type-container">
                <span>{{ sumGoldWeight }}</span>
              </div>
            </template>
          </column>
          <column>
            <template #footer>
              <div class="text-right type-container">
                <span>{{ sumDiamondWeight }}</span>
              </div>
            </template>
          </column>
          <column>
            <template #footer>
              <div class="text-right type-container">
                <span>{{ sumGemWeight }}</span>
              </div>
            </template>
          </column>
          <column :colspan="2">
            <template #footer>
              <div class="text-right type-container">
                <span>{{ sumAppraisalPrice }}</span>
              </div>
            </template>
          </column>
          <column :colspan="2">
            <template #footer>
              <div class="text-right type-container">
                <span>{{ sumDiscountPrice }}</span>
              </div>
            </template>
          </column>
          <column :colspan="2">
            <template #footer>
              <div class="text-right type-container">
                <span>{{ sumConvertedPrice }}</span>
              </div>
            </template>
          </column>
          <column>
            <template #footer>
              <div class="text-right type-container">
                <span>{{ sumQty }}</span>
              </div>
            </template>
          </column>
          <column>
            <template #footer>
              <div class="text-right type-container">
                <span>{{ sumTotalConvertedPrice }}</span>
              </div>
            </template>
          </column>
        </Row>
        <!-- ส่วนลดพิเศษ -->
        <Row>
          <column :colspan="16">
            <template #footer>
              <div class="text-right type-container">
                <span>{{ $t('view.sale.quotation.specialDiscount') }}:</span>
              </div>
            </template>
          </column>
          <column>
            <template #footer>
              <div class="text-right qty-container">
                <input
                  :value="customer.specialDiscount"
                  type="number"
                  class="form-control text-right bg-input input-bg"
                  min="0"
                  step="0.01"
                  style="background-color: #b5dad4; width: 100%"
                  @input="$emit('update:special-discount', $event.target.valueAsNumber || 0)"
                />
              </div>
            </template>
          </column>
        </Row>
        <!-- ส่วนเพิ่มพิเศษ -->
        <Row>
          <column :colspan="16">
            <template #footer>
              <div class="text-right type-container">
                <span>{{ $t('view.sale.quotation.specialSurcharge') }}:</span>
              </div>
            </template>
          </column>
          <column>
            <template #footer>
              <div class="text-right qty-container">
                <input
                  :value="customer.specialAddition"
                  type="number"
                  class="form-control text-right bg-input input-bg"
                  min="0"
                  step="0.01"
                  style="background-color: #b5dad4; width: 100%"
                  @input="$emit('update:special-addition', $event.target.valueAsNumber || 0)"
                />
              </div>
            </template>
          </column>
        </Row>
        <!-- ยอดรวมหลังปรับ -->
        <Row>
          <column :colspan="16">
            <template #footer>
              <div class="text-right type-container">
                <span class="font-weight-bold">{{ $t('view.sale.quotation.adjustedTotal') }}:</span>
              </div>
            </template>
          </column>
          <column>
            <template #footer>
              <div class="text-right type-container">
                <span class="font-weight-bold">{{ formatPrice(totalAfterDiscountAndAddition) }}</span>
              </div>
            </template>
          </column>
        </Row>
        <!-- freight -->
        <Row>
          <column :colspan="16">
            <template #footer>
              <div class="text-right type-container">
                <span>{{ $t('view.sale.quotation.freightInsurance') }}</span>
              </div>
            </template>
          </column>
          <column>
            <template #footer>
              <div class="qty-container">
                <input
                  style="background-color: #b5dad4"
                  :value="customer.freight"
                  type="number"
                  class="form-control text-right bg-input input-bg"
                  step="any"
                  min="0"
                  required
                  @input="$emit('update:freight', $event.target.valueAsNumber || 0)"
                  @blur="$emit('blur-freight', $event.target.valueAsNumber || 0)"
                />
              </div>
            </template>
          </column>
        </Row>
        <!-- ยอดรวมก่อน VAT -->
        <Row>
          <column :colspan="16">
            <template #footer>
              <div class="text-right type-container">
                <span class="font-weight-bold">{{ $t('view.sale.quotation.beforeVatTotal') }}:</span>
              </div>
            </template>
          </column>
          <column>
            <template #footer>
              <div class="text-right type-container">
                <span class="font-weight-bold">{{ formatPrice(totalBeforeVat) }}</span>
              </div>
            </template>
          </column>
        </Row>
        <!-- VAT -->
        <Row>
          <column :colspan="16">
            <template #footer>
              <div class="text-right type-container d-flex align-items-center justify-content-end">
                <span class="mr-2 mt-1">{{ $t('view.sale.quotation.vatPercentLabel') }}</span>
                <input
                  :value="customer.vatPercent"
                  type="number"
                  class="form-control text-right bg-input input-bg"
                  min="0"
                  max="100"
                  step="0.01"
                  style="background-color: #b5dad4; width: 80px"
                  placeholder="0"
                  @input="$emit('update:vat-percent', $event.target.valueAsNumber || 0)"
                />
              </div>
            </template>
          </column>
          <column>
            <template #footer>
              <div class="text-right type-container">
                <span>{{ formatPrice(vatAmount) }}</span>
              </div>
            </template>
          </column>
        </Row>
        <!-- ราคารวม (ก่อนปัด) -->
        <Row>
          <column :colspan="16">
            <template #footer>
              <div class="text-right type-container">
                <span>{{ $t('view.sale.quotation.preTotalBeforeRound') }}</span>
              </div>
            </template>
          </column>
          <column>
            <template #footer>
              <div class="text-right type-container">
                <span>{{ formatPrice(grandTotalRaw) }}</span>
              </div>
            </template>
          </column>
        </Row>
        <!-- ปัดเศษ -->
        <Row v-if="roundingAdjustment > 0">
          <column :colspan="16">
            <template #footer>
              <div class="text-right type-container">
                <span>{{ $t('view.sale.quotation.rounding') }}</span>
              </div>
            </template>
          </column>
          <column>
            <template #footer>
              <div class="text-right type-container">
                <span>+{{ formatPrice(roundingAdjustment) }}</span>
              </div>
            </template>
          </column>
        </Row>
        <!-- ยอดที่ต้องชำระ -->
        <Row>
          <column :colspan="16">
            <template #footer>
              <div class="text-right type-container">
                <span class="font-weight-bold">{{ $t('view.sale.quotation.payableTotal') }}</span>
              </div>
            </template>
          </column>
          <column>
            <template #footer>
              <div class="text-right type-container">
                <span class="font-weight-bold">{{ formatPrice(grandTotalRounded) }}</span>
              </div>
            </template>
          </column>
        </Row>
      </ColumnGroup>
    </DataTable>
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

import { isForeignCurrency, formatDocCurrency } from '@/services/utils/decimal.js'

import imagePreview from '@/components/prime-vue/ImagePreviewEmit.vue'

export default {
  name: 'QuotationItemsTable',

  components: {
    DataTable,
    Column,
    ColumnGroup,
    Row,
    imagePreview
  },

  props: {
    customer: {
      type: Object,
      default: () => ({})
    },
    sumNetWeight: { type: Number, default: 0 },
    sumGoldWeight: { type: Number, default: 0 },
    sumDiamondWeight: { type: Number, default: 0 },
    sumGemWeight: { type: Number, default: 0 },
    sumAppraisalPrice: { type: Number, default: 0 },
    sumDiscountPrice: { type: Number, default: 0 },
    sumConvertedPrice: { type: Number, default: 0 },
    sumQty: { type: Number, default: 0 },
    sumTotalConvertedPrice: { type: Number, default: 0 },
    totalAfterDiscountAndAddition: { type: Number, default: 0 },
    totalBeforeVat: { type: Number, default: 0 },
    vatAmount: { type: Number, default: 0 },
    grandTotalRaw: { type: Number, default: 0 },
    roundingAdjustment: { type: Number, default: 0 },
    grandTotalRounded: { type: Number, default: 0 }
  },

  emits: [
    'del-item',
    'edit-stock',
    'copy-item',
    'upload-copy-image',
    'blur-description',
    'blur-price',
    'blur-qty',
    'blur-freight',
    'update:freight',
    'update:vat-percent',
    'update:special-discount',
    'update:special-addition'
  ],

  data() {
    return {
      type: 'STOCK-PRODUCT'
    }
  },

  methods: {
    formatPrice(price) {
      return formatDocCurrency(price, this.customer.currencyUnit, 'th-TH')
    },

    formatDocMoney(value) {
      return isForeignCurrency(this.customer.currencyUnit)
        ? String(Math.floor(Number(value) || 0))
        : (Number(value) || 0).toFixed(2)
    },

    getRowClass(data, index) {
      return ''
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
@import '@/assets/scss/overide-prime-vue/data-table-dub.scss';

.input-bg {
  background-color: #b5dad4 !important;
}

.image-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.copy-img-wrap {
  width: 34px;
  height: 34px;
  border: 1.5px dashed #bbb;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  transition: border-color 0.2s, background 0.2s;

  &:hover {
    border-color: var(--base-font-color);
    background: #f0f0f0;
  }

  .copy-img-thumb {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .copy-img-placeholder {
    color: #bbb;
    font-size: 13px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &:hover .copy-img-placeholder {
    color: var(--base-font-color);
  }
}

.stock-img-thumb {
  width: 25px;
  height: 25px;
  object-fit: contain;
  border-radius: 4px;
}

.qty-container {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-right: 5px;
}

.type-container {
  font-size: var(--fs-sm);
  font-weight: bold;
  color: var(--base-font-color);
  padding: var(--sp-xs);
}

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

/* align cell content to top for all columns */
:deep(.p-column-body),
:deep(.p-cell-text),
.qty-container,
.type-container,
.form-control {
  align-items: flex-start !important;
  vertical-align: top !important;
}

:deep(.p-column-body) {
  vertical-align: top !important;
}

:deep(.p-column-body) > * {
  align-items: flex-start !important;
  justify-content: flex-start !important;
  display: flex;
}

/* Highlight row being edited */
:deep(.editing-row) {
  background-color: #fff3cd !important;
  border-left: 4px solid #ffc107 !important;
}

:deep(.editing-row:hover) {
  background-color: #fff3cd !important;
}

:deep(.editing-row .p-column-body) {
  background-color: transparent !important;
}
</style>
