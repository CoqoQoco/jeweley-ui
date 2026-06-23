<template>
  <div class="card-container">
    <div class="card-header">
      <h6 class="mb-0">{{ $t('view.sale.invoiceDetail.productList') }}</h6>
      <div class="stock-col-settings-wrapper">
        <button class="stock-col-settings-btn" @click.stop="isSettingsOpen = !isSettingsOpen" title="ตั้งค่าคอลัมน์">
          <i class="bi bi-gear-fill"></i>
        </button>
        <div v-if="isSettingsOpen" class="stock-col-settings-panel">
          <div class="stock-col-settings-header">
            <i class="bi bi-gear-fill"></i> ตั้งค่าคอลัมน์
          </div>
          <div class="stock-col-settings-list">
            <div v-for="col in columnFreezeList" :key="col.field" class="stock-col-settings-item">
              <span class="stock-col-settings-name">{{ col.label }}</span>
              <div class="stock-col-freeze-btns">
                <button
                  :class="['freeze-btn', { active: isFrozenLeft(col.field) }]"
                  @click="toggleFreezeCol(col.field, 'left')"
                  title="ปักหมุดซ้าย"
                ><i class="bi bi-pin-angle-fill"></i> ซ้าย</button>
                <button
                  :class="['freeze-btn', { active: isFrozenRight(col.field) }]"
                  @click="toggleFreezeCol(col.field, 'right')"
                  title="ปักหมุดขวา"
                ><i class="bi bi-pin-angle-fill"></i> ขวา</button>
              </div>
            </div>
          </div>
        </div>
      </div>
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
            <Column header="#" :frozen="!!frozenCols['index']" :alignFrozen="frozenCols['index'] || undefined" />
            <Column :header="$t('view.sale.invoiceDetail.imageHeader')" :frozen="!!frozenCols['image']" :alignFrozen="frozenCols['image'] || undefined" />
            <Column :header="$t('view.sale.saleOrder.stockNumberNew')" :frozen="!!frozenCols['stockNumber']" :alignFrozen="frozenCols['stockNumber'] || undefined" />
            <Column :header="$t('view.sale.saleOrder.stockNumberOld')" :frozen="!!frozenCols['stockNumberOld']" :alignFrozen="frozenCols['stockNumberOld'] || undefined" />
            <Column :header="$t('view.sale.saleOrder.productCode')" :frozen="!!frozenCols['productNumber']" :alignFrozen="frozenCols['productNumber'] || undefined" />
            <Column :header="$t('view.sale.saleOrder.description')" :frozen="!!frozenCols['description']" :alignFrozen="frozenCols['description'] || undefined" />
            <Column header="Gold (gms)" :frozen="!!frozenCols['gold']" :alignFrozen="frozenCols['gold'] || undefined" />
            <Column header="Diamond (cts)" :frozen="!!frozenCols['diamond']" :alignFrozen="frozenCols['diamond'] || undefined" />
            <Column header="Stone (cts)" :frozen="!!frozenCols['gem']" :alignFrozen="frozenCols['gem'] || undefined" />
            <Column :header="$t('view.sale.saleOrder.salePriceTHB')" :frozen="!!frozenCols['priceOrigin']" :alignFrozen="frozenCols['priceOrigin'] || undefined" />
            <Column :header="$t('view.sale.saleOrder.appraisalPriceTHB')" :frozen="!!frozenCols['appraisalPrice']" :alignFrozen="frozenCols['appraisalPrice'] || undefined" />
            <Column :header="$t('view.sale.saleOrder.discountPercent')" :frozen="!!frozenCols['discountPercent']" :alignFrozen="frozenCols['discountPercent'] || undefined" />
            <Column :header="$t('view.sale.invoiceDetail.priceAfterDiscount')" :frozen="!!frozenCols['discountPrice']" :alignFrozen="frozenCols['discountPrice'] || undefined" />
            <Column :header="$t('view.sale.saleOrder.convertedRate')" :frozen="!!frozenCols['currencyRate']" :alignFrozen="frozenCols['currencyRate'] || undefined" />
            <Column :header="'ราคาแปลง (' + (invoiceData.currencyUnit || 'THB') + ')'" :frozen="!!frozenCols['priceAfterMultiply']" :alignFrozen="frozenCols['priceAfterMultiply'] || undefined" />
            <Column :header="$t('view.sale.quotation.quantity')" :frozen="!!frozenCols['qty']" :alignFrozen="frozenCols['qty'] || undefined" />
            <Column :header="'รวมราคา (' + (invoiceData.currencyUnit || 'THB') + ')'" :frozen="!!frozenCols['total']" :alignFrozen="frozenCols['total'] || undefined" />
          </Row>
        </ColumnGroup>

        <Column field="index" style="width: 10px"
          :frozen="!!frozenCols['index']"
          :alignFrozen="frozenCols['index'] || undefined"
        >
          <template #body="slotProps">
            <span>{{ slotProps.index + 1 }}</span>
          </template>
        </Column>

        <Column field="image" header="" style="width: 50px"
          :frozen="!!frozenCols['image']"
          :alignFrozen="frozenCols['image'] || undefined"
        >
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

        <Column field="stockNumber" header="เลขที่ผลิต" style="min-width: 150px"
          :frozen="!!frozenCols['stockNumber']"
          :alignFrozen="frozenCols['stockNumber'] || undefined"
        >
          <template #body="slotProps">
            <div class="d-flex flex-column">
              <span>{{ `${slotProps.data.stockNumber}` }}</span>
              <small v-if="slotProps.data.message" class="text-main">{{
                `${slotProps.data.message}`
              }}</small>
            </div>
          </template>
        </Column>

        <Column field="stockNumber" header="เลขที่ผลิต" style="min-width: 150px"
          :frozen="!!frozenCols['stockNumberOld']"
          :alignFrozen="frozenCols['stockNumberOld'] || undefined"
        >
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

        <Column field="productNumber" header="รหัสสินค้า" style="min-width: 150px"
          :frozen="!!frozenCols['productNumber']"
          :alignFrozen="frozenCols['productNumber'] || undefined"
        >
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

        <Column field="description" header="รายละเอียด" style="min-width: 200px"
          :frozen="!!frozenCols['description']"
          :alignFrozen="frozenCols['description'] || undefined"
        >
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
        <Column field="gold" style="min-width: 120px; max-width: 300px"
          :frozen="!!frozenCols['gold']"
          :alignFrozen="frozenCols['gold'] || undefined"
        >
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

        <Column field="diamond" style="min-width: 140px; max-width: 300px"
          :frozen="!!frozenCols['diamond']"
          :alignFrozen="frozenCols['diamond'] || undefined"
        >
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

        <Column field="gem" style="min-width: 140px; max-width: 300px"
          :frozen="!!frozenCols['gem']"
          :alignFrozen="frozenCols['gem'] || undefined"
        >
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

        <Column field="priceOrigin" :header="$t('view.sale.saleOrder.salePriceTHB')" style="min-width: 150px"
          :frozen="!!frozenCols['priceOrigin']"
          :alignFrozen="frozenCols['priceOrigin'] || undefined"
        >
          <template #body="slotProps">
            <div class="qty-container">
              <span>{{
                Number(slotProps.data.priceOrigin || slotProps.data.price || 0).toFixed(2)
              }}</span>
            </div>
          </template>
        </Column>

        <Column field="appraisalPrice" :header="$t('view.sale.saleOrder.appraisalPriceTHB')" style="min-width: 150px"
          :frozen="!!frozenCols['appraisalPrice']"
          :alignFrozen="frozenCols['appraisalPrice'] || undefined"
        >
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

        <Column field="discountPercent" :header="$t('view.sale.saleOrder.discountPercent')" style="min-width: 100px"
          :frozen="!!frozenCols['discountPercent']"
          :alignFrozen="frozenCols['discountPercent'] || undefined"
        >
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

        <Column field="discountPrice" :header="$t('view.sale.invoiceDetail.priceAfterDiscount')" style="min-width: 150px"
          :frozen="!!frozenCols['discountPrice']"
          :alignFrozen="frozenCols['discountPrice'] || undefined"
        >
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

        <Column field="currencyRate" :header="$t('view.sale.saleOrder.convertedRate')" style="min-width: 100px"
          :frozen="!!frozenCols['currencyRate']"
          :alignFrozen="frozenCols['currencyRate'] || undefined"
        >
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
          :frozen="!!frozenCols['priceAfterMultiply']"
          :alignFrozen="frozenCols['priceAfterMultiply'] || undefined"
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

        <Column field="qty" :header="$t('view.sale.quotation.quantity')" style="width: 80px"
          :frozen="!!frozenCols['qty']"
          :alignFrozen="frozenCols['qty'] || undefined"
        >
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
          :frozen="!!frozenCols['total']"
          :alignFrozen="frozenCols['total'] || undefined"
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
            <Column
              :frozen="isTotalFrozenRight"
              :alignFrozen="isTotalFrozenRight ? 'right' : undefined"
            >
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
            <Column
              :frozen="isTotalFrozenRight"
              :alignFrozen="isTotalFrozenRight ? 'right' : undefined"
            >
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
            <Column
              :frozen="isTotalFrozenRight"
              :alignFrozen="isTotalFrozenRight ? 'right' : undefined"
            >
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
            <Column
              :frozen="isTotalFrozenRight"
              :alignFrozen="isTotalFrozenRight ? 'right' : undefined"
            >
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
            <Column
              :frozen="isTotalFrozenRight"
              :alignFrozen="isTotalFrozenRight ? 'right' : undefined"
            >
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
            <Column
              :frozen="isTotalFrozenRight"
              :alignFrozen="isTotalFrozenRight ? 'right' : undefined"
            >
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
            <Column
              :frozen="isTotalFrozenRight"
              :alignFrozen="isTotalFrozenRight ? 'right' : undefined"
            >
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
            <Column
              :frozen="isTotalFrozenRight"
              :alignFrozen="isTotalFrozenRight ? 'right' : undefined"
            >
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
            <Column
              :frozen="isTotalFrozenRight"
              :alignFrozen="isTotalFrozenRight ? 'right' : undefined"
            >
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
            <Column
              :frozen="isTotalFrozenRight"
              :alignFrozen="isTotalFrozenRight ? 'right' : undefined"
            >
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

  data() {
    return {
      isSettingsOpen: false,
      frozenCols: {}
    }
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

  computed: {
    isTotalFrozenRight() {
      return this.frozenCols['total'] === 'right'
    },

    columnFreezeList() {
      return [
        { field: 'index', label: '#' },
        { field: 'image', label: 'รูป' },
        { field: 'stockNumber', label: this.$t('view.sale.saleOrder.stockNumberNew') },
        { field: 'stockNumberOld', label: this.$t('view.sale.saleOrder.stockNumberOld') },
        { field: 'productNumber', label: this.$t('view.sale.saleOrder.productCode') },
        { field: 'description', label: this.$t('view.sale.saleOrder.description') },
        { field: 'gold', label: 'Gold (gms)' },
        { field: 'diamond', label: 'Diamond (cts)' },
        { field: 'gem', label: 'Stone (cts)' },
        { field: 'priceOrigin', label: this.$t('view.sale.saleOrder.salePriceTHB') },
        { field: 'appraisalPrice', label: this.$t('view.sale.saleOrder.appraisalPriceTHB') },
        { field: 'discountPercent', label: this.$t('view.sale.saleOrder.discountPercent') },
        { field: 'discountPrice', label: this.$t('view.sale.invoiceDetail.priceAfterDiscount') },
        { field: 'currencyRate', label: this.$t('view.sale.saleOrder.convertedRate') },
        { field: 'priceAfterMultiply', label: 'ราคาแปลง' },
        { field: 'qty', label: this.$t('view.sale.quotation.quantity') },
        { field: 'total', label: 'รวมราคา' }
      ]
    }
  },

  mounted() {
    document.addEventListener('click', this.handleOutsideClick)
  },

  beforeUnmount() {
    document.removeEventListener('click', this.handleOutsideClick)
  },

  methods: {
    isFrozenLeft(field) {
      return this.frozenCols[field] === 'left'
    },

    isFrozenRight(field) {
      return this.frozenCols[field] === 'right'
    },

    toggleFreezeCol(field, side) {
      const current = this.frozenCols[field]
      if (current === side) {
        const updated = { ...this.frozenCols }
        delete updated[field]
        this.frozenCols = updated
      } else {
        this.frozenCols = { ...this.frozenCols, [field]: side }
      }
    },

    handleOutsideClick(e) {
      const wrapper = this.$el.querySelector('.stock-col-settings-wrapper')
      if (wrapper && !wrapper.contains(e.target)) {
        this.isSettingsOpen = false
      }
    },

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

/* Column settings gear */
.stock-col-settings-wrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
  margin-left: 8px;
}

.stock-col-settings-btn {
  width: 2rem;
  height: 2rem;
  border: 1px solid rgba(255,255,255,0.5);
  border-radius: 4px;
  background: transparent;
  color: #ffffff;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  transition: all 0.2s;

  &:hover {
    background: rgba(255,255,255,0.2);
  }
}

.stock-col-settings-panel {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  min-width: 280px;
  background: #fff;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  z-index: 100;
}

.stock-col-settings-header {
  padding: 8px 12px;
  background: var(--base-font-color);
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  border-radius: 6px 6px 0 0;
  display: flex;
  align-items: center;
  gap: 6px;
}

.stock-col-settings-list {
  max-height: 350px;
  overflow-y: auto;
}

.stock-col-settings-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 12px;
  border-bottom: 1px solid #f0f0f0;
  font-size: 13px;
  color: #333;

  &:last-child { border-bottom: none; }
}

.stock-col-settings-name {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-right: 8px;
}

.stock-col-freeze-btns {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.freeze-btn {
  padding: 2px 6px;
  font-size: 11px;
  border: 1px solid #dee2e6;
  border-radius: 3px;
  background: #f8f9fa;
  color: #666;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 2px;
  transition: all 0.15s;
  white-space: nowrap;

  &:hover {
    border-color: var(--base-font-color);
    color: var(--base-font-color);
  }

  &.active {
    background: var(--base-font-color);
    border-color: var(--base-font-color);
    color: #fff;
  }
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
