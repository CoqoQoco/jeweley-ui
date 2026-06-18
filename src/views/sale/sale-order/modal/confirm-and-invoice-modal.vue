<template>
  <div>
    <modal :showModal="isShowModal" @closeModal="closeModal" :width="'100%'">
      <template v-slot:content>
        <!-- Sale Order Information -->
        <div class="mb-3">
          <div class="title-text-lg-bg p-2 mb-3">
            <i class="bi bi-lightning-charge mr-2"></i>{{ $t('view.sale.saleOrder.confirmAndInvoiceTitle') }}
          </div>
          <div class="form-col-container p-2">
            <div>
              <span class="title-text">{{ $t('view.sale.saleOrder.soNumber') }}</span>
              <input
                class="form-control bg-input"
                type="text"
                :value="saleOrderData.number"
                readonly
              />
            </div>
            <div>
              <span class="title-text">{{ $t('view.sale.saleOrder.customerName') }}</span>
              <input
                class="form-control bg-input"
                type="text"
                :value="saleOrderData.customerName || '-'"
                readonly
              />
            </div>
            <div>
              <span class="title-text">{{ $t('view.sale.quotation.currency') }}</span>
              <input
                class="form-control bg-input"
                type="text"
                :value="saleOrderData.currencyUnit || 'THB'"
                readonly
              />
            </div>
            <div>
              <span class="title-text">{{ $t('view.sale.quotation.currencyRateLabel') }}</span>
              <input
                class="form-control bg-input"
                type="text"
                :value="saleOrderData.currencyRate || 1"
                readonly
              />
            </div>
          </div>
        </div>

        <!-- Stock Items Selection -->
        <div class="">
          <div>
            <div class="pl-2 pr-2">
              <!-- Instructions -->
              <div class="filter-container mb-3">
                <div class="d-flex align-items-start ml-3">
                  <i class="bi bi-lightbulb-fill text-warning mr-2"></i>
                  <div>
                    <strong class="title-text ml-1">{{ $t('view.sale.saleOrder.usageHint') }}:</strong>
                    <ul class="mb-0 mt-1">
                      <li>{{ $t('view.sale.saleOrder.confirmHint1') }}</li>
                      <li>{{ $t('view.sale.saleOrder.confirmHint2') }}</li>
                      <li>{{ $t('view.sale.saleOrder.confirmHint3') }}</li>
                    </ul>
                  </div>
                </div>
              </div>

              <!-- Selection Controls -->
              <div
                class="d-flex justify-content-between align-items-center mb-3 p-2"
                style="background-color: #f8f9fa; border-radius: 5px"
              >
                <div>
                  <label class="d-flex align-items-center mb-0">
                    <CheckboxGeneric
                      :modelValue="isAllSelected"
                      @update:modelValue="toggleSelectAll"
                      :disabled="availableItems.length === 0"
                      :binary="true"
                      class="mr-2"
                    />
                    <span class="title-text"
                      >{{ $t('view.sale.saleOrder.selectAllCount', { count: availableItems.length }) }}</span
                    >
                  </label>
                </div>
                <div>
                  <span class="badge badge-warning mr-2">
                    <i class="bi bi-clock mr-1"></i>{{ $t('view.sale.saleOrder.pendingCount', { count: pendingItemsCount }) }}
                  </span>
                  <span class="badge badge-success mr-2">
                    <i class="bi bi-check-circle mr-1"></i>{{ $t('view.sale.saleOrder.confirmedCount', { count: confirmedItemsCount }) }}
                  </span>
                </div>
              </div>

              <!-- Stock Items Table -->
              <DataTable
                :value="availableItems"
                dataKey="id"
                :scrollable="true"
                scrollHeight="10000000px"
                class="p-datatable-sm"
                stripedRows
                responsiveLayout="scroll"
                showGridlines
              >
                <ColumnGroup type="header">
                  <Row>
                    <Column header="" />
                    <Column header="" />
                    <Column :header="$t('view.sale.saleOrder.stockNumberNew')" />
                    <Column :header="$t('view.sale.saleOrder.stockNumberOld')" />
                    <Column :header="$t('view.sale.saleOrder.productCode')" />
                    <Column :header="$t('common.field.status')" />
                    <Column :header="$t('view.sale.saleOrder.description')" />
                    <Column :header="$t('view.sale.saleOrder.salePriceTHB')" />
                    <Column :header="$t('view.sale.saleOrder.appraisalPriceTHB')" />
                    <Column :header="$t('view.sale.saleOrder.discountPercent')" />
                    <Column :header="$t('view.sale.saleOrder.discountPriceTHB')" />
                    <Column :header="$t('view.sale.saleOrder.convertedRate')" />
                    <Column :header="$t('view.sale.saleOrder.convertedPrice') + ' (' + (saleOrderData.currencyUnit || 'THB') + ')'" />
                    <Column :header="$t('common.field.quantity')" />
                    <Column :header="$t('view.sale.saleOrder.totalPrice') + ' (' + (saleOrderData.currencyUnit || 'THB') + ')'" />
                  </Row>
                </ColumnGroup>

                <!-- Selection Column -->
                <Column field="selected" style="width: 10px">
                  <template #body="slotProps">
                    <div class="text-center">
                      <CheckboxGeneric
                        :modelValue="selectedItems.includes(slotProps.data.id)"
                        @update:modelValue="(value) => toggleItemSelection(slotProps.data, value)"
                        :binary="true"
                      />
                    </div>
                  </template>
                </Column>

                <!-- Image Column -->
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

                <!-- Stock Number Column -->
                <Column field="stockNumber" :header="$t('view.sale.saleOrder.stockNumberNew')" style="min-width: 150px">
                  <template #body="slotProps">
                    <div class="d-flex flex-column">
                      <span>{{ slotProps.data.stockNumber }}</span>
                      <small v-if="slotProps.data.message" class="text-main">{{
                        slotProps.data.message
                      }}</small>
                    </div>
                  </template>
                </Column>

                <!-- Stock Number Origin Column -->
                <Column field="stockNumberOrigin" :header="$t('view.sale.saleOrder.stockNumberOld')" style="min-width: 150px">
                  <template #body="slotProps">
                    <span>{{
                      slotProps.data.stockNumberOrigin
                        ? slotProps.data.stockNumberOrigin || ''
                        : slotProps.data.stockNumber || ''
                    }}</span>
                  </template>
                </Column>

                <!-- Product Number Column -->
                <Column field="productNumber" :header="$t('view.sale.saleOrder.productCode')" style="min-width: 150px">
                  <template #body="slotProps">
                    <span class="confirmed-text">
                      {{ slotProps.data.productNumber || '-' }}
                    </span>
                  </template>
                </Column>

                <!-- Confirmation Status Column -->
                <Column field="isConfirm" :header="$t('common.field.status')" style="min-width: 110px">
                  <template #body="slotProps">
                    <div class="text-center">
                      <span
                        :class="[
                          'badge',
                          slotProps.data.isConfirm ? 'box-status-success' : 'box-status-show'
                        ]"
                      >
                        <i
                          :class="
                            slotProps.data.isConfirm
                              ? 'bi bi-check-circle-fill mr-1'
                              : 'bi bi-clock-fill mr-1'
                          "
                        ></i>
                        {{ slotProps.data.isConfirm ? $t('view.sale.saleOrder.statusConfirmed') : $t('view.sale.saleOrder.statusPending') }}
                      </span>
                    </div>
                  </template>
                </Column>

                <!-- Description Column -->
                <Column field="description" :header="$t('view.sale.saleOrder.description')" style="min-width: 200px">
                  <template #body="slotProps">
                    <span class="confirmed-text">
                      {{ slotProps.data.description || '-' }}
                    </span>
                  </template>
                </Column>

                <!-- Price Columns -->
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
                      <span class="confirmed-text text-right">
                        {{ (Number(slotProps.data.appraisalPrice) || 0).toFixed(2) }}
                      </span>
                    </div>
                  </template>
                </Column>

                <Column field="discountPercent" :header="$t('view.sale.saleOrder.discountPercent')" style="min-width: 100px">
                  <template #body="slotProps">
                    <div class="qty-container">
                      <span class="confirmed-text text-right">
                        {{ (Number(slotProps.data.discountPercent) || 0).toFixed(2) }}%
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
                      <span>{{ saleOrderData.currencyRate || 1 }}</span>
                    </div>
                  </template>
                </Column>

                <Column
                  field="priceAfterMultiply"
                  :header="$t('view.sale.saleOrder.convertedPrice') + ' (' + (saleOrderData.currencyUnit || 'THB') + ')'"
                  style="min-width: 150px"
                >
                  <template #body="slotProps">
                    <div class="qty-container">
                      <span>{{
                        (
                          (Number(slotProps.data.appraisalPrice || 0) *
                            (1 - (slotProps.data.discountPercent || 0) / 100)) /
                          (saleOrderData.currencyRate || 1)
                        ).toFixed(2)
                      }}</span>
                    </div>
                  </template>
                </Column>

                <Column field="qty" :header="$t('common.field.quantity')" style="width: 100px">
                  <template #body="slotProps">
                    <div class="qty-container">
                      <span class="confirmed-text text-right">
                        {{ slotProps.data.qty || 0 }}
                      </span>
                    </div>
                  </template>
                </Column>

                <Column
                  field="total"
                  :header="$t('view.sale.saleOrder.totalPrice') + ' (' + (saleOrderData.currencyUnit || 'THB') + ')'"
                  style="min-width: 150px"
                >
                  <template #body="slotProps">
                    <div class="qty-container">
                      <span>{{
                        (
                          ((Number(slotProps.data.appraisalPrice || 0) *
                            (1 - (slotProps.data.discountPercent || 0) / 100)) /
                            (saleOrderData.currencyRate || 1)) *
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
                    <Column :colspan="5">
                      <template #footer>
                        <div class="text-left type-container">
                          <span class="mr-2">{{ $t('view.sale.quotation.netWeightMerchandise') }}</span>
                          <span class="mr-2">{{ getNetWeight() }}</span>
                          <span>{{ $t('view.sale.quotation.unitGrams') }}</span>
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

                    <Column :colspan="2">
                      <template #footer>
                        <div class="text-right type-container">
                          <span>{{ getSumAppraisalPrice() }}</span>
                        </div>
                      </template>
                    </Column>
                    <Column :colspan="2">
                      <template #footer>
                        <div class="text-right type-container">
                          <span>{{ getSumDiscountPrice() }}</span>
                        </div>
                      </template>
                    </Column>
                    <Column :colspan="2">
                      <template #footer>
                        <div class="text-right type-container">
                          <span>{{ getSumConvertedPrice() }}</span>
                        </div>
                      </template>
                    </Column>
                    <Column>
                      <template #footer>
                        <div class="text-right type-container">
                          <span>{{ getSumQty() }}</span>
                        </div>
                      </template>
                    </Column>
                    <Column>
                      <template #footer>
                        <div class="text-right type-container">
                          <span>{{ getSumTotalConvertedPrice() }}</span>
                        </div>
                      </template>
                    </Column>
                  </Row>

                  <!-- ส่วนลดพิเศษ -->
                  <Row>
                    <Column :colspan="14">
                      <template #footer>
                        <div class="text-right type-container">
                          <span>{{ $t('view.sale.invoiceDetail.specialDiscount') }}:</span>
                        </div>
                      </template>
                    </Column>
                    <Column>
                      <template #footer>
                        <div class="text-right qty-container">
                          <input
                            v-model.number="specialDiscount"
                            type="number"
                            class="form-control text-right bg-input input-bg"
                            min="0"
                            step="0.01"
                            style="background-color: #b5dad4; width: 100%"
                            @input="$forceUpdate()"
                          />
                        </div>
                      </template>
                    </Column>
                  </Row>

                  <!-- ส่วนเพิ่มพิเศษ -->
                  <Row>
                    <Column :colspan="14">
                      <template #footer>
                        <div class="text-right type-container">
                          <span>{{ $t('view.sale.invoiceDetail.specialSurcharge') }}:</span>
                        </div>
                      </template>
                    </Column>
                    <Column>
                      <template #footer>
                        <div class="text-right qty-container">
                          <input
                            v-model.number="specialAddition"
                            type="number"
                            class="form-control text-right bg-input input-bg"
                            min="0"
                            step="0.01"
                            style="background-color: #b5dad4; width: 100%"
                            @input="$forceUpdate()"
                          />
                        </div>
                      </template>
                    </Column>
                  </Row>

                  <!-- ยอดรวมหลังปรับ -->
                  <Row>
                    <Column :colspan="14">
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
                            formatCurrency(totalAfterDiscountAndAddition)
                          }}</span>
                        </div>
                      </template>
                    </Column>
                  </Row>

                  <!-- Freight & Insurance -->
                  <Row>
                    <Column :colspan="14">
                      <template #footer>
                        <div class="text-right type-container">
                          <span>{{ $t('view.sale.quotation.freightInsurance') }}:</span>
                        </div>
                      </template>
                    </Column>
                    <Column>
                      <template #footer>
                        <div class="text-right qty-container">
                          <input
                            v-model.number="freightAndInsurance"
                            type="number"
                            class="form-control text-right bg-input input-bg"
                            min="0"
                            step="0.01"
                            style="background-color: #b5dad4; width: 100%"
                            @input="$forceUpdate()"
                          />
                        </div>
                      </template>
                    </Column>
                  </Row>

                  <!-- ยอดรวมก่อน VAT -->
                  <Row>
                    <Column :colspan="14">
                      <template #footer>
                        <div class="text-right type-container">
                          <span class="font-weight-bold">{{ $t('view.sale.saleOrder.beforeVatTotal') }}:</span>
                        </div>
                      </template>
                    </Column>
                    <Column>
                      <template #footer>
                        <div class="text-right type-container">
                          <span class="font-weight-bold">{{ formatCurrency(totalBeforeVat) }}</span>
                        </div>
                      </template>
                    </Column>
                  </Row>

                  <!-- VAT -->
                  <Row>
                    <Column :colspan="14">
                      <template #footer>
                        <div class="text-right type-container d-flex align-items-center justify-content-end">
                          <span class="mr-2 mt-1">{{ $t('view.sale.quotation.vatPercentLabel') }}</span>
                          <input
                            v-model.number="vatPercent"
                            type="number"
                            class="form-control text-right bg-input input-bg"
                            min="0"
                            max="100"
                            step="0.01"
                            style="background-color: #b5dad4; width: 80px"
                            @input="$forceUpdate()"
                            placeholder="0"
                          />
                        </div>
                      </template>
                    </Column>

                    <Column>
                      <template #footer>
                        <div class="text-right type-container">
                          <span>{{ formatCurrency(vatAmount) }}</span>
                        </div>
                      </template>
                    </Column>
                  </Row>

                  <!-- ยอดรวมสุดท้าย -->
                  <Row>
                    <Column :colspan="14">
                      <template #footer>
                        <div class="text-right type-container">
                          <h6 class="mb-0 text-primary">{{ $t('view.sale.saleOrder.invoiceTotal') }}:</h6>
                        </div>
                      </template>
                    </Column>
                    <Column>
                      <template #footer>
                        <div class="text-right type-container">
                          <h6 class="mb-0 font-weight-bold text-primary">
                            {{ formatCurrency(grandTotal) }}
                          </h6>
                        </div>
                      </template>
                    </Column>
                  </Row>
                </ColumnGroup>
              </DataTable>

              <!-- Payment and Deposit Information -->
              <div class="mt-3">
                <div class="filter-container-search p-3">
                  <div class="title-text-lg mb-3">{{ $t('view.sale.saleOrder.paymentInfo') }}</div>

                  <div class="row">
                    <!-- ราคามัดจำ -->
                    <div class="col-md-3">
                      <div class="form-group">
                        <label class="title-text">{{ $t('view.sale.saleOrder.depositPrice') }}</label>
                        <input
                          v-model.number="depositAmount"
                          type="number"
                          class="form-control"
                          min="0"
                          step="0.01"
                          :max="grandTotal"
                          placeholder="0.00"
                        />
                        <small class="text-muted"
                          >{{ $t('view.sale.saleOrder.maxDeposit') }}: {{ formatPriceWithCurrency(grandTotal) }}</small
                        >
                      </div>
                    </div>

                    <!-- วิธีการชำระเงิน -->
                    <div class="col-md-3">
                      <div class="form-group">
                        <label class="title-text">{{ $t('view.sale.saleOrder.paymentMethod') }}</label>
                        <DropdownGeneric
                          v-model="paymentMethod"
                          :options="paymentMethodOptions"
                          optionLabel="name"
                          optionValue="value"
                          :placeholder="$t('view.sale.saleOrder.paymentMethod')"
                          class="w-100"
                        />
                      </div>
                    </div>

                    <!-- ระยะเวลาการชำระเงิน (วัน) -->
                    <div class="col-md-3">
                      <div class="form-group">
                        <label class="title-text">{{ $t('view.sale.saleOrder.paymentTerm') }}</label>
                        <input
                          v-model.number="paymentDays"
                          type="number"
                          class="form-control"
                          min="0"
                          step="1"
                          placeholder="0"
                          :disabled="paymentMethod === 'cash'"
                        />
                        <small class="text-muted" v-if="paymentMethod === 'cash'">{{ $t('view.sale.saleOrder.payCash') }}</small>
                        <small class="text-muted" v-else-if="paymentDays > 0"
                          >{{ $t('view.sale.saleOrder.dueDate') }}: {{ calculateDueDate() }}</small
                        >
                      </div>
                    </div>

                    <!-- ยอดคงเหลือที่ต้องชำระ -->
                    <div class="col-md-3">
                      <div class="form-group">
                        <label class="title-text">{{ $t('view.sale.saleOrder.remainingBalance') }}</label>
                        <div class="form-control bg-light font-weight-bold text-primary">
                          {{ formatPriceWithCurrency(grandTotal - (depositAmount || 0)) }}
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
        <div class="btn-submit-container mt-4 pb-2">
          <div class="d-flex justify-content-end">
            <div>
              <span class="title-text">{{ $t('view.sale.saleOrderList.dkInvoiceNumber') }}</span>
              <input
                class="form-control bg-input"
                type="text"
                v-model.number="dkInvoiceNumber"
                :disabled="selectedItemsCount === 0"
              />
            </div>

            <div class="ml-4 mt-4 pb-2">
              <button
                class="btn btn-main mr-2"
                type="button"
                @click="confirmAndCreateInvoice"
                :disabled="selectedItemsCount === 0"
              >
                <i class="bi bi-lightning-charge mr-1"></i>
                {{ $t('view.sale.saleOrder.confirmAndCreate') }}
                <span v-if="selectedItemsCount > 0">({{ selectedItemsCount }} {{ $t('view.sale.saleOrder.itemUnit') }})</span>
              </button>

              <button class="btn btn-outline-main mr-2" type="button" @click="closeModal">
                <i class="bi bi-x-circle mr-1"></i>
                {{ $t('common.btn.cancel') }}
              </button>
            </div>
          </div>
        </div>
      </template>
    </modal>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'
// eslint-disable-next-line no-restricted-imports
import DataTable from 'primevue/datatable'
// eslint-disable-next-line no-restricted-imports
import Column from 'primevue/column'
// eslint-disable-next-line no-restricted-imports
import ColumnGroup from 'primevue/columngroup'
// eslint-disable-next-line no-restricted-imports
import Row from 'primevue/row'
import DropdownGeneric from '@/components/prime-vue/DropdownGeneric.vue'
import CheckboxGeneric from '@/components/prime-vue/CheckboxGeneric.vue'
import imagePreview from '@/components/prime-vue/ImagePreviewEmit.vue'
import { useInvoiceApiStore } from '@/stores/modules/api/sale/invoice-store.js'
import { usrSaleOrderApiStore } from '@/stores/modules/api/sale/sale-order-store.js'
import { warning, error, success } from '@/services/alert/sweetAlerts.js'

const modal = defineAsyncComponent(() => import('@/components/modal/modal-view.vue'))

export default {
  name: 'ConfirmAndInvoiceModal',

  components: {
    modal,
    DataTable,
    Column,
    ColumnGroup,
    Row,
    DropdownGeneric,
    CheckboxGeneric,
    imagePreview
  },

  props: {
    isShowModal: {
      type: Boolean,
      default: false
    },
    saleOrderData: {
      type: Object,
      default: () => ({})
    },
    stockItems: {
      type: Array,
      default: () => []
    }
  },

  emits: ['close-modal', 'invoice-created'],

  data() {
    return {
      selectedItems: [],
      invoiceStore: useInvoiceApiStore(),
      saleOrderStore: usrSaleOrderApiStore(),
      specialDiscount: 0,
      specialAddition: 0,
      freightAndInsurance: 0,
      vatPercent: 0,
      depositAmount: 0,
      paymentMethod: 'cash',
      paymentDays: 0,
      dkInvoiceNumber: null
    }
  },

  computed: {
    paymentMethodOptions() {
      return [
        { name: this.$t('view.sale.invoiceDetail.paymentMethods.cash'), value: 'cash', id: 1 },
        { name: this.$t('view.sale.invoiceDetail.paymentMethods.transfer'), value: 'transfer', id: 2 },
        { name: this.$t('view.sale.invoiceDetail.paymentMethods.cheque'), value: 'cheque', id: 3 },
        { name: this.$t('view.sale.invoiceDetail.paymentMethods.creditCard'), value: 'credit_card', id: 4 },
        { name: this.$t('view.sale.invoiceDetail.paymentMethods.creditTerm'), value: 'credit_term', id: 5 }
      ]
    },

    availableItems() {
      return this.stockItems.filter(
        (item) => !item.invoice && item.isRemainProduct === true
      )
    },

    isAllSelected() {
      return (
        this.availableItems.length > 0 &&
        this.selectedItems.length === this.availableItems.length
      )
    },

    selectedItemsCount() {
      return this.selectedItems.length
    },

    pendingItemsCount() {
      return this.availableItems.filter((item) => !item.isConfirm).length
    },

    confirmedItemsCount() {
      return this.availableItems.filter((item) => item.isConfirm).length
    },

    totalSelectedAmount() {
      return Number(this.getSumTotalConvertedPrice() || 0)
    },

    totalAfterDiscountAndAddition() {
      const baseTotal = this.totalSelectedAmount
      const afterDiscount = baseTotal - Number(this.specialDiscount || 0)
      const afterAddition = afterDiscount + Number(this.specialAddition || 0)
      return afterAddition
    },

    totalBeforeVat() {
      return this.totalAfterDiscountAndAddition + Number(this.freightAndInsurance || 0)
    },

    vatAmount() {
      const vatPercent = Number(this.vatPercent || 0)
      return (this.totalBeforeVat * vatPercent) / 100
    },

    grandTotal() {
      return this.totalBeforeVat + this.vatAmount
    }
  },

  watch: {
    isShowModal: {
      handler(newVal) {
        if (newVal) {
          this.loadInitialData()
        }
      },
      immediate: true
    }
  },

  methods: {
    loadInitialData() {
      this.selectedItems = []
      this.specialDiscount = Number(this.saleOrderData.specialDiscount) || 0
      this.specialAddition = Number(this.saleOrderData.specialAddition) || 0
      this.freightAndInsurance = Number(this.saleOrderData.freight) || 0
      this.vatPercent = Number(this.saleOrderData.vatPercent) || 0
    },

    toggleSelectAll(value) {
      if (value) {
        this.selectedItems = this.availableItems.map((item) => item.id)
      } else {
        this.selectedItems = []
      }
    },

    toggleItemSelection(item, value) {
      if (value) {
        if (!this.selectedItems.includes(item.id)) {
          this.selectedItems.push(item.id)
        }
      } else {
        const index = this.selectedItems.indexOf(item.id)
        if (index > -1) {
          this.selectedItems.splice(index, 1)
        }
      }
    },

    formatCurrency(amount) {
      return new Intl.NumberFormat('th-TH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount || 0)
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
      const currencyRate = this.saleOrderData.currencyRate || 1
      return discountedPrice / currencyRate
    },

    getTotalConvertedPrice(item) {
      const convertedPrice = this.getConvertedPrice(item)
      const qty = item.qty || 0
      return convertedPrice * qty
    },

    formatPriceWithCurrency(price) {
      const currency = this.saleOrderData.currencyUnit || 'THB'
      return `${this.formatCurrency(price)} ${currency}`
    },

    formatDate(date) {
      if (!date) return '-'
      try {
        return new Date(date).toLocaleDateString('th-TH', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })
      } catch {
        return '-'
      }
    },

    calculateDueDate() {
      if (!this.paymentDays || this.paymentDays <= 0) return '-'
      const dueDate = new Date()
      dueDate.setDate(dueDate.getDate() + this.paymentDays)
      return this.formatDate(dueDate)
    },

    getNetWeight() {
      const selectedStockItems = this.stockItems.filter((item) =>
        this.selectedItems.includes(item.id)
      )
      return selectedStockItems
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

    getSumAppraisalPrice() {
      const selectedStockItems = this.stockItems.filter((item) =>
        this.selectedItems.includes(item.id)
      )
      if (!selectedStockItems || selectedStockItems.length === 0) return '0.00'

      const total = selectedStockItems.reduce((sum, item) => {
        const price = this.getAppraisalPrice(item)
        return sum + (Number(price) || 0)
      }, 0)

      return Number(total).toFixed(2)
    },

    getSumDiscountPrice() {
      const selectedStockItems = this.stockItems.filter((item) =>
        this.selectedItems.includes(item.id)
      )
      if (!selectedStockItems || selectedStockItems.length === 0) return '0.00'

      const total = selectedStockItems.reduce((sum, item) => {
        const price = this.getDiscountedPrice(item)
        return sum + (Number(price) || 0)
      }, 0)

      return Number(total).toFixed(2)
    },

    getSumConvertedPrice() {
      const selectedStockItems = this.stockItems.filter((item) =>
        this.selectedItems.includes(item.id)
      )
      if (!selectedStockItems || selectedStockItems.length === 0) return '0.00'

      const total = selectedStockItems.reduce((sum, item) => {
        const price = this.getConvertedPrice(item)
        return sum + (Number(price) || 0)
      }, 0)

      return Number(total).toFixed(2)
    },

    getSumQty() {
      const selectedStockItems = this.stockItems.filter((item) =>
        this.selectedItems.includes(item.id)
      )
      if (!selectedStockItems || selectedStockItems.length === 0) return 0

      return selectedStockItems.reduce((sum, item) => {
        return sum + (Number(item.qty) || 0)
      }, 0)
    },

    getSumTotalConvertedPrice() {
      const selectedStockItems = this.stockItems.filter((item) =>
        this.selectedItems.includes(item.id)
      )
      if (!selectedStockItems || selectedStockItems.length === 0) return '0.00'

      const total = selectedStockItems.reduce((sum, item) => {
        const price = this.getTotalConvertedPrice(item)
        return sum + (Number(price) || 0)
      }, 0)

      return Number(total).toFixed(2)
    },

    async confirmAndCreateInvoice() {
      if (this.selectedItemsCount === 0) {
        warning(this.$t('view.sale.saleOrder.validation.selectItems'))
        return
      }

      if (!this.saleOrderData || (!this.saleOrderData.soNumber && !this.saleOrderData.number)) {
        warning(this.$t('view.sale.saleOrder.validation.noSONumber'))
        return
      }

      if (!this.saleOrderData.customerName) {
        warning(this.$t('view.sale.saleOrder.validation.noCustomerName'))
        return
      }

      const selectedStockItems = this.stockItems.filter((item) =>
        this.selectedItems.includes(item.id)
      )
      const unconfirmedItems = selectedStockItems.filter((item) => !item.isConfirm)

      // Step 1: confirm pending items ก่อน (ถ้ามี)
      if (unconfirmedItems.length > 0) {
        const confirmPayload = {
          soNumber: this.saleOrderData.number || this.saleOrderData.soNumber,
          stockItems: unconfirmedItems.map((item) => ({
            id: item.id,
            stockNumber: item.stockNumber,
            productNumber: item.productNumber,
            qty: item.qty,
            appraisalPrice: item.appraisalPrice,
            discount: item.discountPercent,
            isConfirm: true,
            confirmedAt: new Date().toISOString()
          }))
        }

        const confirmRes = await this.saleOrderStore.confirmStockItems(confirmPayload)

        if (!confirmRes || !confirmRes.success) {
          error(this.$t('view.sale.saleOrder.error.confirmFailed'), this.$t('view.sale.saleOrder.error.confirmFailedTitle'))
          return
        }
      }

      // Step 2: create invoice
      const invoiceRequest = {
        soNumber: this.saleOrderData.number || this.saleOrderData.soNumber,
        dkInvoiceNumber: this.dkInvoiceNumber || null,

        customerCode: this.saleOrderData.customerCode ?? null,
        customerName: this.saleOrderData.customerName ?? null,
        customerAddress: this.saleOrderData.customerAddress,
        customerTel: this.saleOrderData.customerPhone || this.saleOrderData.customerTel,
        customerEmail: this.saleOrderData.customerEmail,
        customerRemark: this.saleOrderData.customerRemark,

        currencyUnit: this.saleOrderData.currencyUnit || 'THB',
        currencyRate: this.saleOrderData.currencyRate || 1.0,

        deliveryDate: this.saleOrderData.expectedDeliveryDate || this.saleOrderData.deliveryDate,
        deposit: this.depositAmount || 0,

        specialDiscount: this.specialDiscount || 0,
        specialAddition: this.specialAddition || 0,
        freightAndInsurance: this.freightAndInsurance || 0,
        vat: this.vatPercent || 0,

        goldRate: this.saleOrderData.goldPerOz || 0,
        markup: this.saleOrderData.markup || 0,

        payment: this.paymentMethodOptions.find((pm) => pm.value === this.paymentMethod)?.id,
        paymentName: this.paymentMethodOptions.find((pm) => pm.value === this.paymentMethod)?.name,
        paymentDay: this.paymentDays || 0,

        priority: this.saleOrderData.priority || 'normal',
        refQuotation: this.saleOrderData.quotationNumber || '',
        remark: this.saleOrderData.remark || '',
        items: selectedStockItems.map((item) => ({
          stockNumber: item.stockNumber,
          stockNumberOrigin: item.stockNumberOrigin || item.stockNumber,
          id: item.id,
          priceOrigin: item.appraisalPrice || item.price || 0,
          currencyUnit: this.saleOrderData.currencyUnit || 'THB',
          currencyRate: this.saleOrderData.currencyRate || 1.0,
          markup: this.saleOrderData.markup || 0,
          discount: item.discountPercent || 0,
          goldRate: this.saleOrderData.goldPerOz || 0,
          remark: item.remark || '',
          netPrice: String(this.getConvertedPrice(item)),
          priceDiscount: this.getDiscountedPrice(item),
          priceAfterCurrencyRate: this.getConvertedPrice(item),
          qty: item.qty || 1
        }))
      }

      const response = await this.invoiceStore.fetchCreate({
        formValue: invoiceRequest
      })

      if (response) {
        const invoiceNumber = response.invoiceNumber || this.$t('alert.success')
        const confirmedCount = unconfirmedItems.length
        const msg =
          confirmedCount > 0
            ? this.$t('view.sale.saleOrder.success.confirmAndCreate', { count: confirmedCount, invoiceNumber })
            : this.$t('view.sale.saleOrder.success.createInvoice', { invoiceNumber })
        success(msg, this.$t('view.sale.saleOrder.success.confirmTitle'))

        this.$emit('invoice-created', {
          invoiceNumber: response.invoiceNumber,
          selectedItems: this.selectedItems
        })

        this.closeModal()
      }
    },

    closeModal() {
      this.selectedItems = []
      this.specialDiscount = 0
      this.specialAddition = 0
      this.freightAndInsurance = 0
      this.vatPercent = 0
      this.depositAmount = 0
      this.paymentMethod = 'cash'
      this.paymentDays = 0
      this.dkInvoiceNumber = null

      this.$emit('close-modal')
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form';
@import '@/assets/scss/custom-style/standard-data-table';

:deep(.p-datatable) {
  .p-datatable-thead > tr > th {
    background-color: var(--base-font-color) !important;
    color: #ffffff !important;
    font-weight: 600;
    padding: 0.75rem 0.5rem;
    border: none;
  }

  .p-datatable-tbody > tr {
    &:hover {
      background-color: #f8f9fa;
    }

    > td {
      padding: 0.75rem 0.5rem;
      border-bottom: 1px solid #e9ecef;
      vertical-align: middle;
    }
  }
}

.badge {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  display: inline-flex;
  align-items: center;
}

.text-main {
  color: var(--base-font-color) !important;
}

.type-container {
  font-size: 13px;
  font-weight: bold;
  color: var(--base-font-color);
  padding: 5px;
}

.qty-container {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-right: 5px;
}

@media (max-width: 768px) {
  .row .col-md-6 {
    margin-bottom: 1rem;
  }

  .d-flex.justify-content-between {
    flex-direction: column;
    gap: 1rem;
  }

  .btn-submit-container {
    text-align: center;

    .btn {
      margin: 0.25rem;
      width: auto;
      min-width: 120px;
    }
  }
}
</style>
