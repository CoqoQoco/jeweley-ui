<template>
  <div>
    <modal :showModal="isShowModal" @closeModal="closeModal" :width="'100%'">
      <template v-slot:content>
        <!-- Sale Order Information -->
        <div class="mb-3">
          <div class="title-text-lg-bg p-2 mb-3">
            <i class="bi bi-lightning-charge mr-2"></i>ยืนยันสินค้า + สร้าง Invoice จาก Sale Order
          </div>
          <div class="form-col-container p-2">
            <div>
              <span class="title-text">เลขที่ใบสั่งขาย</span>
              <input
                class="form-control bg-input"
                type="text"
                :value="saleOrderData.number"
                readonly
              />
            </div>
            <div>
              <span class="title-text">ชื่อลูกค้า</span>
              <input
                class="form-control bg-input"
                type="text"
                :value="saleOrderData.customerName || '-'"
                readonly
              />
            </div>
            <div>
              <span class="title-text">Currency</span>
              <input
                class="form-control bg-input"
                type="text"
                :value="saleOrderData.currencyUnit || 'THB'"
                readonly
              />
            </div>
            <div>
              <span class="title-text">Currency Rate</span>
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
            <div v-if="loading" class="text-center py-4">
              <div class="spinner-border text-main" role="status">
                <span class="sr-only">Loading...</span>
              </div>
              <p class="mt-2 text-muted">กำลังประมวลผล...</p>
            </div>

            <div v-else class="pl-2 pr-2">
              <!-- Instructions -->
              <div class="filter-container mb-3">
                <div class="d-flex align-items-start ml-3">
                  <i class="bi bi-lightbulb-fill text-warning mr-2"></i>
                  <div>
                    <strong class="title-text ml-1">คำแนะนำการใช้งาน:</strong>
                    <ul class="mb-0 mt-1">
                      <li>เลือกสินค้าที่ต้องการออก Invoice (รวมรายการที่ยังรอยืนยันและที่ยืนยันแล้ว)</li>
                      <li>สินค้าที่ยังไม่ยืนยันจะถูกยืนยันอัตโนมัติก่อนสร้าง Invoice</li>
                      <li>ตรวจสอบข้อมูลราคา ส่วนลด และการชำระเงินให้ถูกต้อง</li>
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
                    <Checkbox
                      :modelValue="isAllSelected"
                      @update:modelValue="toggleSelectAll"
                      :disabled="availableItems.length === 0"
                      :binary="true"
                      class="mr-2"
                    />
                    <span class="title-text"
                      >เลือกทั้งหมด ({{ availableItems.length }} รายการ)</span
                    >
                  </label>
                </div>
                <div>
                  <span class="badge badge-warning mr-2">
                    <i class="bi bi-clock mr-1"></i>รอยืนยัน: {{ pendingItemsCount }}
                  </span>
                  <span class="badge badge-success mr-2">
                    <i class="bi bi-check-circle mr-1"></i>ยืนยันแล้ว:
                    {{ confirmedItemsCount }}
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
                    <Column header="เลขที่ผลิต (ใหม่)" />
                    <Column header="เลขที่ผลิต (เก่า)" />
                    <Column header="รหัสสินค้า" />
                    <Column header="สถานะ" />
                    <Column header="รายละเอียด" />
                    <Column header="ราคาขาย (THB)" />
                    <Column header="ราคาประเมิน (THB)" />
                    <Column header="ส่วนลด (%)" />
                    <Column header="ราคาส่วนลด (THB)" />
                    <Column header="แปลงเรท" />
                    <Column :header="'ราคาแปลง (' + (saleOrderData.currencyUnit || 'THB') + ')'" />
                    <Column header="จำนวน" />
                    <Column :header="'รวมราคา (' + (saleOrderData.currencyUnit || 'THB') + ')'" />
                  </Row>
                </ColumnGroup>

                <!-- Selection Column -->
                <Column field="selected" style="width: 10px">
                  <template #body="slotProps">
                    <div class="text-center">
                      <Checkbox
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
                <Column field="stockNumber" header="เลขที่ผลิต" style="min-width: 150px">
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
                <Column field="stockNumberOrigin" header="เลขที่ผลิต" style="min-width: 150px">
                  <template #body="slotProps">
                    <span>{{
                      slotProps.data.stockNumberOrigin
                        ? slotProps.data.stockNumberOrigin || ''
                        : slotProps.data.stockNumber || ''
                    }}</span>
                  </template>
                </Column>

                <!-- Product Number Column -->
                <Column field="productNumber" header="รหัสสินค้า" style="min-width: 150px">
                  <template #body="slotProps">
                    <span class="confirmed-text">
                      {{ slotProps.data.productNumber || '-' }}
                    </span>
                  </template>
                </Column>

                <!-- Confirmation Status Column -->
                <Column field="isConfirm" header="สถานะ" style="min-width: 110px">
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
                        {{ slotProps.data.isConfirm ? 'ยืนยันแล้ว' : 'รอยืนยัน' }}
                      </span>
                    </div>
                  </template>
                </Column>

                <!-- Description Column -->
                <Column field="description" header="รายละเอียด" style="min-width: 200px">
                  <template #body="slotProps">
                    <span class="confirmed-text">
                      {{ slotProps.data.description || '-' }}
                    </span>
                  </template>
                </Column>

                <!-- Price Columns -->
                <Column field="priceOrigin" header="ราคาขาย (THB)" style="min-width: 150px">
                  <template #body="slotProps">
                    <div class="qty-container">
                      <span>{{
                        Number(slotProps.data.priceOrigin || slotProps.data.price || 0).toFixed(2)
                      }}</span>
                    </div>
                  </template>
                </Column>

                <Column field="appraisalPrice" header="ราคาประเมิน (THB)" style="min-width: 150px">
                  <template #body="slotProps">
                    <div class="qty-container">
                      <span class="confirmed-text text-right">
                        {{ (Number(slotProps.data.appraisalPrice) || 0).toFixed(2) }}
                      </span>
                    </div>
                  </template>
                </Column>

                <Column field="discountPercent" header="ส่วนลด (%)" style="min-width: 100px">
                  <template #body="slotProps">
                    <div class="qty-container">
                      <span class="confirmed-text text-right">
                        {{ (Number(slotProps.data.discountPercent) || 0).toFixed(2) }}%
                      </span>
                    </div>
                  </template>
                </Column>

                <Column field="discountPrice" header="ราคาส่วนลด (THB)" style="min-width: 150px">
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

                <Column field="currencyRate" header="แปลงเรท" style="min-width: 100px">
                  <template #body>
                    <div class="qty-container">
                      <span>{{ saleOrderData.currencyRate || 1 }}</span>
                    </div>
                  </template>
                </Column>

                <Column
                  field="priceAfterMultiply"
                  :header="'ราคาแปลง (' + (saleOrderData.currencyUnit || 'THB') + ')'"
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

                <Column field="qty" header="จำนวน" style="width: 100px">
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
                  :header="'รวมราคา (' + (saleOrderData.currencyUnit || 'THB') + ')'"
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
                          <span class="mr-2">Net Weight Of Merchandise</span>
                          <span class="mr-2">{{ getNetWeight() }}</span>
                          <span>gms.</span>
                        </div>
                      </template>
                    </Column>
                    <Column :colspan="1"></Column>
                    <Column>
                      <template #footer>
                        <div class="text-right type-container">
                          <span>รวม</span>
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
                          <span>ส่วนลดพิเศษ:</span>
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
                          <span>ส่วนเพิ่มพิเศษ:</span>
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
                          <span class="font-weight-bold">ยอดรวมหลังปรับ:</span>
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
                          <span>Freight & Insurance:</span>
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
                          <span class="font-weight-bold">ยอดรวมก่อน VAT:</span>
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
                          <span class="mr-2 mt-1">VAT (%) : </span>
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
                          <h6 class="mb-0 text-primary">ยอดรวม Invoice:</h6>
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
                  <div class="title-text-lg mb-3">ข้อมูลการชำระเงินและมัดจำ</div>

                  <div class="row">
                    <!-- ราคามัดจำ -->
                    <div class="col-md-3">
                      <div class="form-group">
                        <label class="title-text">ราคามัดจำ</label>
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
                          >สูงสุด: {{ formatPriceWithCurrency(grandTotal) }}</small
                        >
                      </div>
                    </div>

                    <!-- วิธีการชำระเงิน -->
                    <div class="col-md-3">
                      <div class="form-group">
                        <label class="title-text">วิธีการชำระเงิน</label>
                        <Dropdown
                          v-model="paymentMethod"
                          :options="paymentMethodOptions"
                          optionLabel="name"
                          optionValue="value"
                          placeholder="เลือกวิธีการชำระเงิน"
                          class="w-100"
                        />
                      </div>
                    </div>

                    <!-- ระยะเวลาการชำระเงิน (วัน) -->
                    <div class="col-md-3">
                      <div class="form-group">
                        <label class="title-text">ระยะเวลาการชำระเงิน (วัน)</label>
                        <input
                          v-model.number="paymentDays"
                          type="number"
                          class="form-control"
                          min="0"
                          step="1"
                          placeholder="0"
                          :disabled="paymentMethod === 'cash'"
                        />
                        <small class="text-muted" v-if="paymentMethod === 'cash'">ชำระทันที</small>
                        <small class="text-muted" v-else-if="paymentDays > 0"
                          >ครบกำหนด: {{ calculateDueDate() }}</small
                        >
                      </div>
                    </div>

                    <!-- ยอดคงเหลือที่ต้องชำระ -->
                    <div class="col-md-3">
                      <div class="form-group">
                        <label class="title-text">ยอดคงเหลือที่ต้องชำระ</label>
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
              <span class="title-text">Invoice no. (DK)</span>
              <input
                class="form-control bg-input"
                type="text"
                v-model.number="dkInvoiceNumber"
                :disabled="loading || selectedItemsCount === 0"
              />
            </div>

            <div class="ml-4 mt-4 pb-2">
              <button
                class="btn btn-green mr-2"
                type="button"
                @click="confirmAndCreateInvoice"
                :disabled="loading || selectedItemsCount === 0"
              >
                <i class="bi bi-lightning-charge mr-1"></i>
                ยืนยัน + สร้าง Invoice
                <span v-if="selectedItemsCount > 0">({{ selectedItemsCount }} รายการ)</span>
                <span
                  v-if="loading"
                  class="spinner-border spinner-border-sm ml-2"
                  role="status"
                ></span>
              </button>

              <button class="btn btn-secondary mr-2" type="button" @click="closeModal">
                <i class="bi bi-x-circle mr-1"></i>
                ยกเลิก
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
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import ColumnGroup from 'primevue/columngroup'
import Row from 'primevue/row'
import Dropdown from 'primevue/dropdown'
import Checkbox from 'primevue/checkbox'
import imagePreview from '@/components/prime-vue/ImagePreviewEmit.vue'
import { useInvoiceApiStore } from '@/stores/modules/api/sale/invoice-store.js'
import { usrSaleOrderApiStore } from '@/stores/modules/api/sale/sale-order-store.js'
import { warning, error, success } from '@/services/alert/sweetAlerts.js'

const modal = defineAsyncComponent(() => import('@/components/modal/ModalView.vue'))

export default {
  name: 'ConfirmAndInvoiceModal',

  components: {
    modal,
    DataTable,
    Column,
    ColumnGroup,
    Row,
    Dropdown,
    Checkbox,
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
      loading: false,
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
      dkInvoiceNumber: null,
      paymentMethodOptions: [
        { name: 'เงินสด (Cash)', value: 'cash', id: 1 },
        { name: 'โอนเงิน (Transfer)', value: 'transfer', id: 2 },
        { name: 'เช็ค (Cheque)', value: 'cheque', id: 3 },
        { name: 'บัตรเครดิต (Credit Card)', value: 'credit_card', id: 4 },
        { name: 'เครดิต (Credit Term)', value: 'credit_term', id: 5 }
      ]
    }
  },

  computed: {
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
        warning('กรุณาเลือกสินค้าอย่างน้อย 1 รายการ')
        return
      }

      if (!this.saleOrderData || (!this.saleOrderData.soNumber && !this.saleOrderData.number)) {
        warning('ไม่พบข้อมูลเลขที่ใบสั่งขาย กรุณาตรวจสอบข้อมูล')
        return
      }

      if (!this.saleOrderData.customerName) {
        warning('ไม่พบชื่อลูกค้า กรุณาตรวจสอบข้อมูลใบสั่งขาย')
        return
      }

      this.loading = true

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
          error('ไม่สามารถยืนยันสินค้าได้ กรุณาลองใหม่', 'เกิดข้อผิดพลาด')
          this.loading = false
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
        const invoiceNumber = response.invoiceNumber || 'สร้างสำเร็จ'
        const confirmedCount = unconfirmedItems.length
        const msg =
          confirmedCount > 0
            ? `ยืนยันสินค้า ${confirmedCount} รายการ และสร้าง Invoice สำเร็จ\nเลขที่: ${invoiceNumber}`
            : `เลขที่ Invoice: ${invoiceNumber}`
        success(msg, 'ดำเนินการสำเร็จ')

        this.$emit('invoice-created', {
          invoiceNumber: response.invoiceNumber,
          selectedItems: this.selectedItems
        })

        this.closeModal()
      }

      this.loading = false
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
