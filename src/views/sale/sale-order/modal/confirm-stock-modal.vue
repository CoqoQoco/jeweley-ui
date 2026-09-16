<template>
  <div>
    <modal :showModal="isShowModal" @closeModal="closeModal" :width="'80%'">
      <template v-slot:content>
        <!-- Sale Order Information -->
        <div class="mb-3">
          <div class="title-text-lg-bg p-2 mb-3">
            <i class="bi bi-receipt mr-2"></i>
            <span>{{ $t('view.sale.saleOrder.saleOrderInfo') }} : </span>
            <span>{{ saleOrderData.number }}</span>
          </div>

          <!-- <div class="form-col-container p-2">
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
          </div> -->
        </div>

        <!-- Stock Items Selection for Confirmation -->
        <div class="">
          <!-- <div class="title-text-lg-bg p-2 mb-3 d-flex justify-content-between align-items-center">
            <span>
              <i class="bi bi-box-seam mr-2"></i>เลือกสินค้าที่จะยืนยันการขาย
            </span>
            <div class="d-flex align-items-center">
              <span class="badge badge-success mr-2">
                <i class="bi bi-check-circle mr-1"></i>ยืนยันแล้ว: {{ confirmedItemsCount }}
              </span>
              <span class="badge badge-warning">
                <i class="bi bi-clock mr-1"></i>รอยืนยัน: {{ selectableItems.length }}
              </span>
            </div>
          </div> -->
          <div>
            <div class="pl-2 pr-2">
              <!-- Instructions -->
              <div class="filter-container mb-3">
                <div class="d-flex align-items-start ml-3">
                  <i class="bi bi-lightbulb-fill text-warning mr-2"></i>
                  <div>
                    <strong class="title-text ml-1">{{ $t('view.sale.saleOrder.usageHint') }}:</strong>
                    <ul class="mb-0 mt-1">
                      <li>{{ $t('view.sale.saleOrder.hint1') }}</li>
                      <li>{{ $t('view.sale.saleOrder.hint2') }}</li>
                      <li>{{ $t('view.sale.saleOrder.hint3') }}</li>
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
                      :disabled="selectableItems.length === 0"
                      :binary="true"
                      class="mr-2"
                    />
                    <span class="title-text"
                      >{{ $t('view.sale.saleOrder.selectAll') }} ({{ selectableItems.length }} {{ $t('view.sale.saleOrder.itemUnit') }})</span
                    >
                  </label>
                </div>
                <div>
                  <!-- <button
                    class="btn btn-outline-main btn-sm mr-2"
                    @click="selectConfirmedOnly"
                    :disabled="confirmedItemsCount === 0"
                  >
                    <i class="bi bi-check-square mr-1"></i>แสดงที่ยืนยันแล้ว
                  </button>
                  <button
                    class="btn btn-outline-main btn-sm"
                    @click="selectPendingOnly"
                    :disabled="selectableItems.length === 0"
                  >
                    <i class="bi bi-clock mr-1"></i>แสดงรอยืนยัน
                  </button> -->
                  <ButtonGeneric
                    v-if="hasShortItems"
                    variant="outline"
                    icon="bi-arrow-repeat"
                    :label="$t('view.sale.saleOrder.btnAdjustToAvailable')"
                    @click="adjustToAvailable"
                  />
                </div>
              </div>

              <!-- แจ้งเตือนรายการที่จำนวนเกินพร้อมขาย -->
              <div v-if="hasShortItems" class="alert alert-danger mb-3">
                <div class="font-weight-bold mb-1">
                  <i class="bi bi-exclamation-triangle-fill mr-1"></i>{{ $t('view.sale.saleOrder.shortageWarningTitle') }}
                </div>
                <ul class="mb-0 pl-3">
                  <li v-for="item in shortSelectedItems" :key="item.lineKey">
                    {{ $t('view.sale.saleOrder.shortageWarningLine', { stockNumber: item.stockNumber, origin: item.stockNumberOrigin || item.stockNumber, shortage: rowShortage(item) }) }}
                  </li>
                </ul>
              </div>

              <!-- Stock Items Table -->
              <!-- scrollHeight="400px" -->
              <DataTable
                :value="filteredStockItems"
                dataKey="lineKey"
                :paginator="filteredStockItems.length > 10"
                :rows="10"
                :rowsPerPageOptions="[10, 25, 50]"
                class="p-datatable-sm"
                :scrollable="true"
                responsiveLayout="scroll"
                :rowClass="getRowClass"
              >
                <Column :exportable="false" style="width: 50px" :header="$t('view.sale.saleOrder.selectCol')">
                  <template #body="slotProps">
                    <div class="text-center">
                      <CheckboxGeneric
                        :modelValue="selectedItemsSet.has(slotProps.data.lineKey)"
                        @update:modelValue="(value) => toggleItemSelection(slotProps.data, value)"
                        :disabled="slotProps.data.isConfirm || !!isSelectableReason(slotProps.data)"
                        :binary="true"
                      />
                    </div>
                  </template>
                </Column>

                <Column field="stockNumber" :header="$t('view.sale.saleOrder.stockNumberOld')" style="width: 120px">
                  <template #body="slotProps">
                    <div class="d-flex flex-column">
                      <span v-if="!isPlaceholderItem(slotProps.data)" class="text-main">{{ slotProps.data.stockNumberOrigin || slotProps.data.stockNumber }}</span>
                      <small class="text-muted">{{ slotProps.data.stockNumber }}</small>
                    </div>
                  </template>
                </Column>
                <Column field="productNumber" :header="$t('view.sale.saleOrder.productCode')" style="width: 120px">
                  <template #body="slotProps">
                    <span class="text-main">{{ slotProps.data.productNumber }}</span>
                  </template>
                </Column>
                <Column field="description" :header="$t('view.sale.saleOrder.productDetail')" style="min-width: 200px">
                  <template #body="slotProps">
                    <div>
                      <div>{{ slotProps.data.description || $t('view.sale.saleOrder.noDetail') }}</div>
                      <small class="text-muted" v-if="slotProps.data.category">{{
                        slotProps.data.category
                      }}</small>
                    </div>
                  </template>
                </Column>
                <Column field="isConfirm" :header="$t('common.field.status')" style="width: 100px">
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
                      <div
                        v-if="slotProps.data.isConfirm && slotProps.data.confirmedDate"
                        class="text-muted"
                        style="font-size: 0.75rem"
                      >
                        {{ formatDate(slotProps.data.confirmedDate) }}
                      </div>
                      <small v-if="isSelectableReason(slotProps.data)" class="d-block text-danger">
                        {{ isSelectableReason(slotProps.data) }}
                      </small>
                    </div>
                  </template>
                </Column>

                <!-- Image Column -->
                <Column :header="$t('view.sale.saleOrder.image')" style="width: 80px">
                  <template #body="slotProps">
                    <div class="text-center">
                      <imagePreview
                        :imageName="slotProps.data.imagePath"
                        :path="slotProps.data.imagePath"
                        :type="type"
                        :width="50"
                        :height="50"
                        v-if="slotProps.data.imagePath"
                      />
                      <div
                        v-else
                        class="d-flex align-items-center justify-content-center"
                        style="
                          width: 50px;
                          height: 50px;
                          background-color: #f8f9fa;
                          border: 1px solid #dee2e6;
                          border-radius: 4px;
                        "
                      >
                        <i class="bi bi-image text-muted"></i>
                      </div>
                    </div>
                  </template>
                </Column>

                <Column field="appraisalPrice" :header="$t('view.sale.saleOrder.appraisalPriceTHB')" style="width: 140px">
                  <template #body="slotProps">
                    <div class="text-right">
                      {{ formatCurrency(getAppraisalPrice(slotProps.data)) }}
                    </div>
                  </template>
                </Column>

                <Column field="discountPercent" :header="$t('view.sale.saleOrder.discountPercent')" style="width: 100px">
                  <template #body="slotProps">
                    <div class="text-right">
                      {{ formatCurrency(slotProps.data.discountPercent || 0) }}%
                    </div>
                  </template>
                </Column>

                <Column field="discountPrice" :header="$t('view.sale.saleOrder.discountPriceTHB')" style="width: 140px">
                  <template #body="slotProps">
                    <div class="text-right">
                      {{ formatCurrency(getDiscountedPrice(slotProps.data)) }}
                    </div>
                  </template>
                </Column>

                <Column
                  :header="$t('view.sale.saleOrder.convertedPrice') + ' (' + (saleOrderData.currencyUnit || 'THB') + ')'"
                  style="width: 140px"
                >
                  <template #body="slotProps">
                    <div class="text-right">
                      {{ formatCurrency(getConvertedPrice(slotProps.data)) }}
                    </div>
                  </template>
                </Column>

                <Column field="qty" :header="$t('common.field.quantity')" style="width: 80px">
                  <template #body="slotProps">
                    <div class="text-center">{{ slotProps.data.qty }}</div>
                  </template>
                </Column>

                <Column field="available" :header="$t('view.sale.saleOrder.qtyAvailableCol')" style="width: 110px">
                  <template #body="slotProps">
                    <div v-if="slotProps.data.isPlaceholder" class="text-center">—</div>
                    <div v-else class="text-center" :class="{ 'text-danger font-weight-bold': isRowShort(slotProps.data) }">
                      {{ rowAvailable(slotProps.data) }}
                      <small v-if="isRowShort(slotProps.data)" class="d-block text-danger">
                        {{ $t('view.sale.saleOrder.qtyShortage', { k: rowShortage(slotProps.data) }) }}
                      </small>
                    </div>
                  </template>
                </Column>

                <Column
                  :header="$t('view.sale.saleOrder.totalPrice') + ' (' + (saleOrderData.currencyUnit || 'THB') + ')'"
                  style="width: 140px"
                >
                  <template #body="slotProps">
                    <div class="text-right text-success font-weight-bold">
                      {{ formatCurrency(getTotalConvertedPrice(slotProps.data)) }}
                    </div>
                  </template>
                </Column>
              </DataTable>

              <!-- Summary -->
              <div class="mt-3">
                <div class="filter-container-search p-3">
                  <div class="title-text-lg mb-3">{{ $t('view.sale.saleOrder.summaryTitle') }}</div>

                  <!-- Summary Sections using existing styles -->
                  <div class="row">
                    <div class="col-md-6">
                      <div class="summary-section">
                        <h6>{{ $t('view.sale.saleOrder.itemList') }}</h6>
                        <div class="summary-item">
                          <span>{{ $t('view.sale.saleOrder.selectedItems') }}:</span>
                          <span class="font-weight-bold text-primary"
                            >{{ selectedItemsCount }} {{ $t('view.sale.saleOrder.itemUnit') }}</span
                          >
                        </div>
                        <div class="summary-item">
                          <span>{{ $t('view.sale.saleOrder.statusConfirmed') }}:</span>
                          <span class="font-weight-bold text-success"
                            >{{ confirmedItemsCount }} {{ $t('view.sale.saleOrder.itemUnit') }}</span
                          >
                        </div>
                      </div>
                    </div>

                    <div class="col-md-6">
                      <div class="summary-section">
                        <h6>{{ $t('view.sale.saleOrder.amountSection') }}</h6>
                        <div class="summary-item">
                          <span>{{ $t('view.sale.saleOrder.selectedTotal') }}:</span>
                          <span class="font-weight-bold text-warning">{{
                            formatPriceWithCurrency(totalSelectedAmount)
                          }}</span>
                        </div>
                        <div class="summary-item border-top pt-2 mt-2">
                          <span class="h6">{{ $t('view.sale.saleOrder.grandTotal') }}:</span>
                          <span class="h6 font-weight-bold text-main">{{
                            formatPriceWithCurrency(grandTotalAmount)
                          }}</span>
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
        <div class="btn-submit-container mt-4 mb-2">
          <div class="d-flex justify-content-end">
            <button
              class="btn btn-green mr-2"
              type="button"
              @click="confirmSelectedItems"
              :disabled="selectedItemsCount === 0 || hasShortItems || isSubmitting || isSaving"
            >
              <i class="bi bi-check-square mr-1"></i>
              {{ $t('view.sale.saleOrder.confirmSale') }}
              <span v-if="selectedItemsCount > 0">({{ selectedItemsCount }} {{ $t('view.sale.saleOrder.itemUnit') }})</span>
            </button>

            <button class="btn btn-outline-main mr-2" type="button" @click="closeModal">
              <i class="bi bi-x-circle mr-1"></i>
              {{ $t('common.btn.cancel') }}
            </button>
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
import CheckboxGeneric from '@/components/prime-vue/CheckboxGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import imagePreview from '@/components/prime-vue/ImagePreview.vue'
import { usrSaleOrderApiStore } from '@/stores/modules/api/sale/sale-order-store.js'
import { usrStockProductApiStore } from '@/stores/modules/api/stock/product-api.js'
import { success, warning, confirmSubmit } from '@/services/alert/sweetAlerts.js'
import { convertedUnitPrice, lineAmount } from '@/services/utils/money.js'
import { getPieceQtyAvailable } from '@/services/utils/stock-piece-qty.js'
import { isPlaceholderItem } from '@/services/utils/copy-item.js'

const modal = defineAsyncComponent(() => import('@/components/modal/modal-view.vue'))

export default {
  name: 'ConfirmStockModal',

  components: {
    modal,
    DataTable,
    Column,
    CheckboxGeneric,
    ButtonGeneric,
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
    },
    // true ระหว่าง parent กำลัง Upsert SO (เช่นหลังกด "ปรับจำนวนเท่าที่มี") — ต้องกันกดยืนยันซ้อนจนกว่าจะ save เสร็จ
    isSaving: {
      type: Boolean,
      default: false
    }
  },

  emits: ['close-modal', 'items-confirmed', 'save-draft', 'adjust-qty'],

  data() {
    return {
      selectedItems: [],
      type: 'STOCK-PRODUCT',
      productStore: usrStockProductApiStore(),
      availabilityMap: {},
      isSubmitting: false
    }
  },

  computed: {
    // Only show unconfirmed items in the selection — ตัดรายการรอผลิต/รอแปลงที่ยังเลือกไม่ได้ออกด้วย (ยังไม่มีเลขที่ผลิต/เลขซ้ำ)
    selectableItems() {
      return this.stockItems.filter(
        (item) => !item.isConfirm && item.isRemainProduct === true && !this.isSelectableReason(item)
      )
    },

    filteredStockItems() {
      return this.stockItems.filter(
        (item) => item.isConfirm === false && item.isRemainProduct === true
      )
    },

    isAllSelected() {
      return (
        this.selectableItems.length > 0 && this.selectedItems.length === this.selectableItems.length
      )
    },

    selectedItemsCount() {
      return this.selectedItems.length
    },

    selectedItemsSet() {
      return new Set(this.selectedItems)
    },

    confirmedItemsCount() {
      return this.stockItems.filter((item) => item.isConfirm).length
    },

    // U3: silver lot อาจเลือกหลายบรรทัดเลขเดียวกัน — เทียบผลรวม qty ที่ "เลือก" ต่อ stockNumber กับ available
    selectedQtyByStockNumber() {
      const map = {}
      this.stockItems.forEach((item) => {
        if (!this.selectedItemsSet.has(item.lineKey)) return
        map[item.stockNumber] = (map[item.stockNumber] || 0) + (Number(item.qty) || 0)
      })
      return map
    },

    shortSelectedItems() {
      return this.stockItems.filter(
        (item) => this.selectedItemsSet.has(item.lineKey) && this.isRowShort(item)
      )
    },

    hasShortItems() {
      return this.shortSelectedItems.length > 0
    },

    totalSelectedAmount() {
      const selectedStockItems = this.stockItems.filter((item) =>
        this.selectedItems.includes(item.lineKey)
      )

      return selectedStockItems.reduce((total, item) => {
        return total + this.getTotalConvertedPrice(item)
      }, 0)
    },

    grandTotalAmount() {
      return this.stockItems.reduce((total, item) => {
        return total + this.getTotalConvertedPrice(item)
      }, 0)
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
    isPlaceholderItem,

    async loadInitialData() {
      this.selectedItems = []
      await this.loadAvailability()
    },

    // U3: เช็ค availability สดจาก API ทุกครั้งที่เปิด modal (และก่อนกดยืนยันอีกครั้ง กันของถูกขายไปแล้วระหว่างเปิดจออยู่)
    async loadAvailability() {
      const stockNumbers = [
        ...new Set(this.filteredStockItems.map((item) => item.stockNumber).filter(Boolean))
      ]

      if (stockNumbers.length === 0) {
        this.availabilityMap = {}
        return
      }

      const list = await this.productStore.fetchStockAvailability(stockNumbers)
      const map = {}
      list.forEach((row) => {
        map[row.stockNumber] = row.qtyAvailable
      })
      this.availabilityMap = map
    },

    rowAvailable(item) {
      if (Object.prototype.hasOwnProperty.call(this.availabilityMap, item.stockNumber)) {
        return Number(this.availabilityMap[item.stockNumber]) || 0
      }
      return getPieceQtyAvailable(item)
    },

    rowShortage(item) {
      // T3: บรรทัดรอผลิต/รอแปลงไม่มีของจริงในคลัง — ไม่มี concept "ขาด" ให้เช็ค
      if (item.isPlaceholder) return 0
      const sumQty = this.selectedQtyByStockNumber[item.stockNumber] || 0
      const shortage = sumQty - this.rowAvailable(item)
      return shortage > 0 ? shortage : 0
    },

    isRowShort(item) {
      return this.rowShortage(item) > 0
    },

    // T3: เหตุผลที่บรรทัดรอผลิต/รอแปลงยังเลือกยืนยันไม่ได้ — ต้องมีเลขที่ผลิตก่อน และห้ามซ้ำกับบรรทัดอื่นในใบเดียวกัน
    isDuplicateProductionNumber(item) {
      if (!item.stockNumber) return false
      return this.filteredStockItems.some(
        (i) => i.lineKey !== item.lineKey && i.stockNumber === item.stockNumber
      )
    },

    isSelectableReason(item) {
      if (!item.isPlaceholder) return null
      if (!item.stockNumber) return this.$t('view.sale.saleOrder.warn.productionNumberRequired')
      if (this.isDuplicateProductionNumber(item)) {
        return this.$t('view.sale.saleOrder.warn.productionNumberDuplicate', { code: item.stockNumber })
      }
      return null
    },

    getRowClass(data) {
      return { 'row-short': this.selectedItemsSet.has(data.lineKey) && this.isRowShort(data) }
    },

    // ปุ่ม "ปรับจำนวนเท่าที่มี" — ปรับ qty ของบรรทัดที่ขาดให้เหลือเท่า available แล้วยกเลิกเลือกบรรทัดที่ available = 0
    adjustToAvailable() {
      const shortItems = this.shortSelectedItems
      if (shortItems.length === 0) return

      const example = shortItems[0]
      const exampleNewQty = Math.max(0, Math.floor(this.rowAvailable(example)))

      confirmSubmit(
        this.$t('view.sale.saleOrder.confirm.adjustToAvailableMessage', {
          count: shortItems.length,
          stockNumber: example.stockNumberOrigin || example.stockNumber,
          oldQty: example.qty,
          newQty: exampleNewQty
        }),
        this.$t('view.sale.saleOrder.confirm.adjustToAvailableTitle'),
        (result) => {
          if (!result.isConfirmed) return
          this.applyAdjustToAvailable()
        },
        { confirmText: this.$t('common.btn.confirm'), cancelText: this.$t('common.btn.cancel') },
        'warning'
      )
    },

    // P2-1.3: ส่วนที่ขาดต้องเพิ่มเป็นรายการรอผลิต/รอแปลงเสมอ (shortage) — parent (onAdjustQty) เป็นคนสร้างบรรทัดจริง
    applyAdjustToAvailable() {
      const updates = []

      this.shortSelectedItems.forEach((item) => {
        const available = this.rowAvailable(item)
        const originalQty = Number(item.qty) || 0

        if (available >= 1) {
          const flooredAvailable = Math.floor(available)
          updates.push({
            lineKey: item.lineKey,
            qty: flooredAvailable,
            shortage: originalQty - flooredAvailable
          })
        } else {
          updates.push({ lineKey: item.lineKey, qty: 0, shortage: originalQty, remove: true })
          const idx = this.selectedItems.indexOf(item.lineKey)
          if (idx > -1) this.selectedItems.splice(idx, 1)
        }
      })

      if (updates.length > 0) {
        this.$emit('adjust-qty', updates)
      }
    },

    toggleSelectAll(value) {
      if (value) {
        // Select all items that are not already confirmed
        this.selectedItems = this.selectableItems.map((item) => item.lineKey)
      } else {
        this.selectedItems = []
      }
    },

    toggleItemSelection(item, value) {
      // Don't allow selection of already confirmed items
      if (item.isConfirm) {
        return
      }
      // T3: บรรทัดรอผลิต/รอแปลงที่ยังไม่มีเลขที่ผลิต/เลขซ้ำ ยังเลือกไม่ได้
      if (this.isSelectableReason(item)) {
        return
      }

      if (value) {
        if (!this.selectedItems.includes(item.lineKey)) {
          this.selectedItems.push(item.lineKey)
        }
      } else {
        const index = this.selectedItems.indexOf(item.lineKey)
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

    // คำนวณราคาประเมิน
    getAppraisalPrice(item) {
      return item.appraisalPrice || item.price || 0
    },

    // คำนวณราคาหลังหักส่วนลด
    getDiscountedPrice(item) {
      const appraisalPrice = this.getAppraisalPrice(item)
      const discountPercent = item.discountPercent || 0
      return appraisalPrice * (1 - discountPercent / 100)
    },

    // คำนวณราคาแปลงสกุลเงิน
    getConvertedPrice(item) {
      const shapedItem = { appraisalPrice: this.getAppraisalPrice(item), discountPercent: item.discountPercent }
      return convertedUnitPrice(shapedItem, this.saleOrderData.currencyRate, this.saleOrderData.currencyUnit)
    },

    // คำนวณราคารวมของแต่ละรายการ
    getTotalConvertedPrice(item) {
      const shapedItem = {
        appraisalPrice: this.getAppraisalPrice(item),
        discountPercent: item.discountPercent,
        qty: item.qty
      }
      return lineAmount(shapedItem, this.saleOrderData.currencyRate, this.saleOrderData.currencyUnit)
    },

    // คำนวณราคาตาม currency rate (เก่า - เก็บไว้เพื่อ backward compatibility)
    calculatePriceWithCurrencyRate(price) {
      const rate = this.saleOrderData.currencyRate || 1
      return (price || 0) / rate // แก้ไขจาก * rate เป็น / rate
    },

    // Format ราคาพร้อม currency
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

    selectConfirmedOnly() {
      // Since confirmed items can't be selected, this is just for filtering view
    },

    selectPendingOnly() {
      // This would show only pending items
    },

    async confirmSelectedItems() {
      // U4: กันกดยืนยันซ้ำระหว่างรอ API — รวมถึงระหว่าง parent กำลัง Upsert SO อยู่ (เช่นหลังกด "ปรับจำนวนเท่าที่มี")
      // กัน race: Upsert ของ adjust-qty ที่ยังค้างอยู่มาทับ Upsert ของ confirm ทีหลัง
      if (this.isSubmitting || this.isSaving) return

      if (this.selectedItemsCount === 0) {
        warning(this.$t('view.sale.saleOrder.validation.selectAtLeastOne'))
        return
      }

      this.isSubmitting = true

      try {
        // U3: เช็ค availability อีกครั้งก่อนยืนยันจริง เผื่อของถูกขายไปหลังเปิดจอ
        await this.loadAvailability()
        if (this.hasShortItems) {
          warning(this.$t('view.sale.saleOrder.warn.stillShortBeforeSubmit'))
          return
        }

        // Get selected items data
        const selectedStockItems = this.stockItems.filter((item) =>
          this.selectedItems.includes(item.lineKey)
        )

        // Prepare data for API
        const confirmData = {
          soNumber: this.saleOrderData.number,
          stockItems: selectedStockItems.map((item) => ({
            id: item.id,
            lineKey: item.lineKey,
            stockNumber: item.stockNumber,
            productNumber: item.productNumber,
            qty: item.qty,
            appraisalPrice: item.appraisalPrice,
            discount: item.discountPercent,
            isConfirm: true,
            isPlaceholder: !!item.isPlaceholder,
            confirmedAt: new Date().toISOString()
          }))
        }

        // Call API to confirm items
        const saleOrderStore = usrSaleOrderApiStore()
        const response = await saleOrderStore.confirmStockItems(confirmData)

        if (response && response.success) {
          // Emit event to parent to refresh data FIRST
          this.$emit('items-confirmed', {
            confirmedItems: selectedStockItems,
            totalConfirmed: this.selectedItemsCount
          })

          // Show success message
          success(this.$t('view.sale.saleOrder.success.confirmSale'), this.$t('view.sale.saleOrder.success.confirmSaleMessage', { count: this.selectedItemsCount }))

          this.closeModal()
        }
      } finally {
        this.isSubmitting = false
      }
    },

    closeModal() {
      this.selectedItems = []
      this.availabilityMap = {}
      this.$emit('close-modal')
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form';
@import '@/assets/scss/custom-style/standard-data-table';

// ใช้ DataTable style ที่มีอยู่แล้วในระบบ
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

// ใช้ badge style ที่มีอยู่แล้วในระบบ
.badge {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  display: inline-flex;
  align-items: center;
}

// ใช้ spinner ที่มีอยู่แล้วในระบบ
.text-main {
  color: var(--base-font-color) !important;
}

// แถวที่เลือกแล้วจำนวนเกินพร้อมขาย
:deep(tr.row-short > td) {
  background-color: var(--status-cancelled-bg) !important;
}

// Summary styles เหมือนกับหน้า sale-order-view
.summary-section {
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 0.25rem;
  padding: 1rem;
  margin-bottom: 1rem;

  h6 {
    color: var(--base-font-color);
    margin-bottom: 0.75rem;
    font-weight: 600;
  }
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.25rem 0;

  span:first-child {
    color: #6c757d;
  }

  span:last-child {
    text-align: right;
  }
}

// Responsive สำหรับมือถือ
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
