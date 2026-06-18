<template>
  <div class="card-container">
    <div class="card-header">
      <h6 class="mb-0">{{ $t('view.sale.invoiceDetail.productList') }}</h6>
    </div>
    <div class="card-body p-0">
      <DataTable
        :value="invoiceItems"
        class="p-datatable-sm"
        :scrollable="true"
        stripedRows
        responsiveLayout="scroll"
        showGridlines
      >
        <ColumnGroup type="header">
          <Row>
            <Column header="#" />
            <Column :header="$t('view.sale.invoiceDetail.imageHeader')" />
            <Column :header="$t('view.sale.saleOrder.stockNumberNew')" />
            <Column :header="$t('view.sale.saleOrder.stockNumberOld')" />
            <Column :header="$t('view.sale.saleOrder.productCode')" />
            <Column :header="$t('view.sale.saleOrder.description')" />
            <Column header="Gold (gms)" />
            <Column header="Diamond (cts)" />
            <Column header="Stone (cts)" />
            <Column :header="$t('view.sale.saleOrder.salePriceTHB')" />
            <Column :header="$t('view.sale.saleOrder.appraisalPriceTHB')" />
            <Column :header="$t('view.sale.saleOrder.discountPercent')" />
            <Column :header="$t('view.sale.invoiceDetail.priceAfterDiscount')" />
            <Column :header="$t('view.sale.saleOrder.convertedRate')" />
            <Column :header="'ราคาแปลง (' + (invoiceData.currencyUnit || 'THB') + ')'" />
            <Column :header="$t('view.sale.quotation.quantity')" />
            <Column :header="'รวมราคา (' + (invoiceData.currencyUnit || 'THB') + ')'" />
          </Row>
        </ColumnGroup>

        <Column field="index" style="width: 10px">
          <template #body="slotProps">
            <span>{{ slotProps.index + 1 }}</span>
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
                />
              </div>
            </div>
          </template>
        </Column>

        <Column field="stockNumber" header="เลขที่ผลิต" style="min-width: 150px">
          <template #body="slotProps">
            <div class="d-flex flex-column">
              <span>{{ `${slotProps.data.stockNumber}` }}</span>
              <small v-if="slotProps.data.message" class="text-main">{{
                `${slotProps.data.message}`
              }}</small>
            </div>
          </template>
        </Column>

        <Column field="stockNumber" header="เลขที่ผลิต" style="min-width: 150px">
          <template #body="slotProps">
            <span>{{
              `${
                slotProps.data.stockNumberOrigin
                  ? slotProps.data.stockNumberOrigin || ''
                  : slotProps.data.stockNumber || ''
              }`
            }}</span>
          </template>
        </Column>

        <Column field="productNumber" header="รหัสสินค้า" style="min-width: 150px">
          <template #body="slotProps">
            <div v-if="!slotProps.data.stockNumber">
              <input
                v-if="!slotProps.data.isConfirm && !slotProps.data.invoice"
                v-model="slotProps.data.productNumber"
                type="text"
                class="form-control bg-input input-bg"
                style="background-color: #b5dad4; width: 100%"
              />
              <span v-else class="confirmed-text">
                {{ slotProps.data.productNumber || '-' }}
              </span>
            </div>
            <div v-else>
              <span>{{ slotProps.data.productNumber }}</span>
            </div>
          </template>
        </Column>

        <Column field="description" header="รายละเอียด" style="min-width: 200px">
          <template #body="slotProps">
            <input
              v-if="!slotProps.data.isConfirm && !slotProps.data.invoice"
              v-model="slotProps.data.description"
              type="text"
              class="form-control bg-input input-bg"
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
                style="background-color: #b5dad4; width: 100%"
                placeholder="0"
              />
              <span v-else class="confirmed-text text-right">
                {{ (Number(slotProps.data.discountPercent) || 0).toFixed(2) }}%
              </span>
            </div>
          </template>
        </Column>

        <Column field="discountPrice" :header="$t('view.sale.invoiceDetail.priceAfterDiscount')" style="min-width: 150px">
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
          :header="'ราคาแปลง (' + (formSaleOrder.currencyUnit || '') + ') '"
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

        <Column field="qty" :header="$t('view.sale.quotation.quantity')" style="width: 80px">
          <template #body="slotProps">
            <div class="qty-container">
              <input
                v-if="!slotProps.data.isConfirm && !slotProps.data.invoice"
                v-model.number="slotProps.data.qty"
                type="number"
                class="form-control text-right bg-input input-bg"
                min="0"
                step="1"
                style="background-color: #b5dad4; width: 100%"
              />
              <span v-else class="confirmed-text text-right">
                {{ slotProps.data.qty || 0 }}
              </span>
            </div>
          </template>
        </Column>

        <Column
          field="total"
          :header="'รวมราคา (' + (formSaleOrder.currencyUnit || '') + ') '"
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

        <!-- Footer -->
        <ColumnGroup type="footer">
          <!-- Total Row -->
          <Row>
            <Column :colspan="4">
              <template #footer>
                <div class="text-left type-container">
                  <span class="mr-2">Net Weight Of Merchandise</span>
                  <span class="mr-2">{{ getNetWeight(invoiceItems) }}</span>
                  <span>gms.</span>
                </div>
              </template>
            </Column>
            <Column :colspan="1"></Column>
            <Column>
              <template #footer>
                <div class="text-right type-container">
                  <span>{{ $t('view.sale.invoiceDetail.total') }}</span>
                </div>
              </template>
            </Column>

            <Column>
              <template #footer>
                <div class="text-right type-container">
                  <span>{{ getGoldWeight(invoiceItems) }}</span>
                </div>
              </template>
            </Column>

            <Column>
              <template #footer>
                <div class="text-right type-container">
                  <span>{{ getDiamondWeight(invoiceItems) }}</span>
                </div>
              </template>
            </Column>

            <Column>
              <template #footer>
                <div class="text-right type-container">
                  <span>{{ getGemWeight(invoiceItems) }}</span>
                </div>
              </template>
            </Column>

            <Column :colspan="2">
              <template #footer>
                <div class="text-right type-container">
                  <span>{{ getSumAppraisalPrice(invoiceItems) }}</span>
                </div>
              </template>
            </Column>
            <Column :colspan="2">
              <template #footer>
                <div class="text-right type-container">
                  <span>{{ getSumDiscountPrice(invoiceItems) }}</span>
                </div>
              </template>
            </Column>
            <Column :colspan="2">
              <template #footer>
                <div class="text-right type-container">
                  <span>{{ getSumConvertedPrice(invoiceItems) }}</span>
                </div>
              </template>
            </Column>
            <Column>
              <template #footer>
                <div class="text-right type-container">
                  <span>{{ getSumQty(invoiceItems) }}</span>
                </div>
              </template>
            </Column>
            <Column>
              <template #footer>
                <div class="text-right type-container">
                  <span>{{ getSumTotalConvertedPrice(invoiceItems) }}</span>
                </div>
              </template>
            </Column>
          </Row>

          <!-- ส่วนลดพิเศษ -->
          <Row>
            <Column :colspan="16">
              <template #footer>
                <div class="text-right type-container">
                  <span>{{ $t('view.sale.invoiceDetail.specialDiscount') }}:</span>
                </div>
              </template>
            </Column>
            <Column>
              <template #footer>
                <div class="text-right type-container">
                  <span>{{ formatNumber(invoiceData.specialDiscount || 0) }}</span>
                </div>
              </template>
            </Column>
          </Row>

          <!-- ส่วนเพิ่มพิเศษ -->
          <Row>
            <Column :colspan="16">
              <template #footer>
                <div class="text-right type-container">
                  <span>{{ $t('view.sale.invoiceDetail.specialSurcharge') }}:</span>
                </div>
              </template>
            </Column>
            <Column>
              <template #footer>
                <div class="text-right type-container">
                  <span>{{ formatNumber(invoiceData.specialAddition || 0) }}</span>
                </div>
              </template>
            </Column>
          </Row>

          <!-- ยอดรวมหลังปรับ -->
          <Row>
            <Column :colspan="16">
              <template #footer>
                <div class="text-right type-container">
                  <span class="font-weight-bold">{{ $t('view.sale.saleOrder.adjustedTotal') }}:</span>
                </div>
              </template>
            </Column>
            <Column>
              <template #footer>
                <div class="text-right type-container">
                  <span class="font-weight-bold">{{
                    formatNumber(totalAfterDiscountAndAddition)
                  }}</span>
                </div>
              </template>
            </Column>
          </Row>

          <!-- Freight & Insurance -->
          <Row>
            <Column :colspan="16">
              <template #footer>
                <div class="text-right type-container">
                  <span>Freight & Insurance:</span>
                </div>
              </template>
            </Column>
            <Column>
              <template #footer>
                <div class="text-right type-container">
                  <span>{{ formatNumber(invoiceData.freightAndInsurance || 0) }}</span>
                </div>
              </template>
            </Column>
          </Row>

          <!-- ยอดรวมก่อน VAT -->
          <Row>
            <Column :colspan="16">
              <template #footer>
                <div class="text-right type-container">
                  <span class="font-weight-bold">{{ $t('view.sale.saleOrder.beforeVatTotal') }}:</span>
                </div>
              </template>
            </Column>
            <Column>
              <template #footer>
                <div class="text-right type-container">
                  <span class="font-weight-bold">{{ formatNumber(totalBeforeVat) }}</span>
                </div>
              </template>
            </Column>
          </Row>

          <!-- VAT % และจำนวนเงิน VAT -->
          <Row>
            <Column :colspan="16">
              <template #footer>
                <div class="text-right type-container">
                  <span>VAT ({{ invoiceData.vatPercent || 0 }}%):</span>
                </div>
              </template>
            </Column>
            <Column>
              <template #footer>
                <div class="text-right type-container">
                  <span>{{ formatNumber(vatAmount) }}</span>
                </div>
              </template>
            </Column>
          </Row>

          <!-- ราคารวม (ก่อนปัด) -->
          <Row>
            <Column :colspan="16">
              <template #footer>
                <div class="text-right type-container">
                  <h6 class="mb-0">{{ $t('view.sale.quotation.preTotalBeforeRound') }}:</h6>
                </div>
              </template>
            </Column>
            <Column>
              <template #footer>
                <div class="text-right type-container">
                  <h6 class="mb-0">{{ formatNumber(grandTotalRounded) }}</h6>
                </div>
              </template>
            </Column>
          </Row>

          <!-- ปัดเศษ -->
          <Row v-if="roundingAdjustment > 0">
            <Column :colspan="16">
              <template #footer>
                <div class="text-right type-container">
                  <h6 class="mb-0">{{ $t('view.sale.quotation.rounding') }}:</h6>
                </div>
              </template>
            </Column>
            <Column>
              <template #footer>
                <div class="text-right type-container">
                  <h6 class="mb-0">+{{ formatNumber(roundingAdjustment) }}</h6>
                </div>
              </template>
            </Column>
          </Row>

          <!-- ยอดที่ต้องชำระ -->
          <Row>
            <Column :colspan="16">
              <template #footer>
                <div class="text-right type-container">
                  <h6 class="mb-0 text-primary">{{ $t('view.sale.quotation.payableTotal') }}:</h6>
                </div>
              </template>
            </Column>
            <Column>
              <template #footer>
                <div class="text-right type-container">
                  <h6 class="mb-0 font-weight-bold text-primary">
                    {{ formatNumber(grandTotalRounded) }}
                  </h6>
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
import dayjs from 'dayjs'

export default {
  name: 'InvoiceItemsTable',

  components: {
    DataTable,
    Column,
    ColumnGroup,
    Row,
    imagePreview
  },

  props: {
    invoiceItems: {
      type: Array,
      default: () => []
    },
    invoiceData: {
      type: Object,
      default: () => ({})
    },
    formSaleOrder: {
      type: Object,
      default: () => ({})
    },
    totalAfterDiscountAndAddition: {
      type: Number,
      default: 0
    },
    totalBeforeVat: {
      type: Number,
      default: 0
    },
    vatAmount: {
      type: Number,
      default: 0
    },
    grandTotalRounded: {
      type: Number,
      default: 0
    },
    roundingAdjustment: {
      type: Number,
      default: 0
    }
  },

  methods: {
    formatDate(date) {
      if (!date) return '-'
      return dayjs(date).format('DD/MM/YYYY')
    },
    formatNumber(value) {
      if (!value && value !== 0) return '0.00'
      return Number(value).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    },
    formatPriceWithCurrency(value) {
      return `${this.formatNumber(value)} ${this.invoiceData.currencyUnit || 'THB'}`
    },
    getStatusBadgeClass(status) {
      const statusMap = {
        Draft: 'badge badge-secondary',
        Confirmed: 'badge badge-success',
        Cancelled: 'badge badge-danger',
        Pending: 'badge badge-warning'
      }
      return statusMap[status] || 'badge badge-info'
    },
    getNetWeight(items) {
      if (!items || !Array.isArray(items) || items.length === 0) return '0.00'
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
      if (!items || !Array.isArray(items) || items.length === 0) return '0.00'
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
      if (!items || !Array.isArray(items) || items.length === 0) return '0.00'
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
      if (!items || !Array.isArray(items) || items.length === 0) return '0.00'
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
      const currencyRate = this.invoiceData.currencyRate || 1
      return discountedPrice / currencyRate
    },
    getTotalConvertedPrice(item) {
      const convertedPrice = this.getConvertedPrice(item)
      const qty = item.qty || 0
      return convertedPrice * qty
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
      if (!items || !Array.isArray(items) || items.length === 0) return '0.00'
      const total = items.reduce((sum, item) => {
        const price = this.getTotalConvertedPrice(item)
        return sum + (Number(price) || 0)
      }, 0)
      return Number(total).toFixed(2)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';

.card-container {
  background: var(--color-card-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-sm);
}

.card-header {
  background: var(--base-font-color);
  border-bottom: 1px solid var(--color-border);
  border-radius: var(--radius-sm) var(--radius-sm) 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  font-weight: 300;
  color: white;
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
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.material-typecode-gold {
  flex: 5;
  text-align: left;
  margin-right: 0.5rem;
  min-width: 40px;
  word-wrap: break-word;
  overflow-wrap: break-word;
  color: #d4af37;
  font-weight: 600;
}

.material-weight {
  flex: 3;
  text-align: right;
  min-width: 60px;
  margin-left: auto;
  font-weight: 500;
}

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

.qty-container {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-right: 5px;
  text-align: right;
  min-width: 80px;
}

.text-right {
  text-align: right;
}

.type-container {
  font-size: 13px;
  font-weight: bold;
  color: var(--base-font-color);
  padding: 5px;
}
</style>
