<template>
  <div>
    <modal :showModal="isShowModal" @closeModal="closeModal" width="1200px">
      <template v-slot:content>
        <div>
          <div class="title-text-lg-bg">
            <span><i class="bi bi-hammer mr-2"></i></span>
            <span>ปรับปรุงส่วนประกอบวัสดุ (Adjust Breakdown)</span>
            <span class="ml-2">| W.O. : {{ planData.wo }}-{{ planData.woNumber }}</span>
          </div>

          <!-- Breakdown Table -->
          <div class="mt-2">
            <div class="d-flex justify-content-between align-items-center  ml-3">
              <div>
                <span class="title-text">ส่วนประกอบวัสดุหลัก (Master Breakdown)</span>
                <small class="text-muted ml-2">แก้ไขข้อมูลวัสดุพื้นฐานที่ใช้ในการผลิต</small>
              </div>
              <div class="d-flex gap-2">
                <button
                  type="button"
                  class="btn btn-outline-success btn-sm"
                  @click="addBreakdownItem"
                >
                  <span class="bi bi-plus-lg mr-1"></span>
                  เพิ่มวัสดุ
                </button>
                <button
                  type="button"
                  class="btn btn-outline-secondary btn-sm"
                  @click="resetBreakdown"
                >
                  <span class="bi bi-arrow-clockwise mr-1"></span>
                  รีเซ็ต
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
                <Dropdown
                  v-model="materialData.type"
                  :options="masterMaterialType"
                  optionLabel="description"
                  optionValue="value"
                  class="w-full"
                  placeholder="เลือกประเภท"
                  @change="updateMaterialBarcode(materialData)"
                />
              </template>

              <!-- Type Name -->
              <template #typeNameTemplate="{ data: materialData }">
                <input
                  type="text"
                  v-model="materialData.typeName"
                  class="form-control form-control-sm"
                  :style="getBgColor(false, materialData.typeName)"
                  placeholder="ชื่อวัสดุ"
                />
              </template>

              <!-- Type Code -->
              <template #typeCodeTemplate="{ data: materialData }">
                <div v-if="materialData.type === 'Gold' || materialData.type === 'Silver'">
                  <Dropdown
                    v-model="materialData.typeCode"
                    :options="masterGold"
                    optionLabel="description"
                    optionValue="code"
                    class="w-full"
                    placeholder="เลือกทอง/เงิน"
                    :showClear="true"
                    @change="updateMaterialBarcode(materialData)"
                  />
                </div>
                <div v-else-if="materialData.type === 'Diamond'">
                  <Dropdown
                    v-model="materialData.typeCode"
                    :options="masterDiamondGrade"
                    optionLabel="description"
                    optionValue="nameEn"
                    class="w-full"
                    placeholder="เลือกเกรดเพชร"
                    :showClear="true"
                  />
                </div>
                <div v-else-if="materialData.type === 'Gem'">
                  <Dropdown
                    v-model="materialData.typeCode"
                    :options="masterGem"
                    optionLabel="description"
                    optionValue="code"
                    class="w-full"
                    placeholder="เลือกพลอย"
                    :showClear="true"
                  />
                </div>
                <div v-else>
                  <input
                    type="text"
                    v-model="materialData.typeCode"
                    class="form-control form-control-sm"
                    :style="getBgColor(false, materialData.typeCode)"
                    placeholder="รหัสวัสดุ"
                  />
                </div>
              </template>

              <!-- Quantity -->
              <template #qtyTemplate="{ data: materialData }">
                <div class="qty-input-container">
                  <input
                    type="number"
                    v-model="materialData.qty"
                    class="form-control form-control-sm"
                    :style="getBgColor(false, materialData.qty)"
                    placeholder="จำนวน"
                    min="0"
                    step="0.01"
                  />
                  <input
                    type="text"
                    v-model="materialData.qtyUnit"
                    class="form-control form-control-sm unit-input"
                    :style="getBgColor(false, materialData.qtyUnit)"
                    placeholder="หน่วย"
                  />
                </div>
              </template>

              <template #priceQtyTemplate="{ data: materialData }">
                <div class="price-input-container">
                  <input
                    type="number"
                    v-model="materialData.qtyPrice"
                    class="form-control form-control-sm"
                    :style="getBgColor(false, materialData.qtyPrice)"
                    placeholder="ราคา/หน่วย"
                    min="0"
                    step="0.01"
                  />
                </div>
              </template>

              <!-- Weight -->
              <template #qtyWeightTemplate="{ data: materialData }">
                <div class="weight-input-container">
                  <input
                    type="number"
                    v-model="materialData.qtyWeight"
                    class="form-control form-control-sm"
                    :style="getBgColor(false, materialData.qtyWeight)"
                    placeholder="น้ำหนัก"
                    min="0"
                    step="0.01"
                  />
                  <input
                    type="text"
                    v-model="materialData.qtyWeightUnit"
                    class="form-control form-control-sm unit-input"
                    :style="getBgColor(false, materialData.qtyWeightUnit)"
                    placeholder="หน่วย"
                  />
                </div>
              </template>

              <!-- Price -->
              <template #priceWeightTemplate="{ data: materialData }">
                <div class="price-input-container">
                  <input
                    type="number"
                    v-model="materialData.qtyWeightPrice"
                    class="form-control form-control-sm"
                    :style="getBgColor(false, materialData.qtyWeightPrice)"
                    placeholder="ราคา/น้ำหนัก"
                    min="0"
                    step="0.01"
                  />
                </div>
              </template>

              <!-- Region -->
              <template #regionTemplate="{ data: materialData }">
                <input
                  type="text"
                  v-model="materialData.region"
                  class="form-control form-control-sm"
                  :style="getBgColor(false, materialData.region)"
                  placeholder="แหล่งที่มา"
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
                  <small class="currency-unit">บาท</small>
                </div>
              </template>

              <!-- Barcode -->
              <template #typeBarcodeTemplate="{ data: materialData }">
                <input
                  type="text"
                  v-model="materialData.typeBarcode"
                  class="form-control form-control-sm"
                  placeholder="ข้อความ Barcode"
                  readonly
                />
              </template>

              <!-- Actions -->
              <template #actionTemplate="{ index }">
                <button
                  type="button"
                  class="btn btn-danger btn-sm"
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
                      นำไปใช้กับสินค้า (Apply to Stock)
                    </h6>
                  </div>
                  <div class="card-body">
                    <div class="mb-2">
                      <label class="form-label">เลือกสินค้าที่ต้องการนำไปใช้:</label>
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
                          ทุกรายการ ({{ filteredStockList.length }} รายการ)
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
                        <label class="form-check-label" for="applySelected"> เฉพาะที่เลือก </label>
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
                              {{ stockData.isReceipt ? 'รับแล้ว' : 'ยังไม่รับ' }}
                            </span>
                          </div>
                        </template>
                      </BaseDataTable>
                    </div>

                    <!-- Apply Buttons -->
                    <div class="mt-3">
                      <button
                        type="button"
                        class="btn btn-primary btn-sm me-2"
                        @click="applyBreakdownToStock"
                        :disabled="!canApply"
                      >
                        <span class="bi bi-check-lg mr-1"></span>
                        นำไปใช้กับสินค้า
                      </button>
                      <button
                        type="button"
                        class="btn btn-success btn-sm"
                        @click="saveDraft"
                        :disabled="!hasValidBreakdown"
                      >
                        <span class="bi bi-floppy mr-1"></span>
                        บันทึกฉบับร่าง
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
                      ข้อมูลสรุป (Summary)
                    </h6>
                  </div>
                  <div class="card-body">
                    <div class="summary-info">
                      <div class="summary-item">
                        <span class="label">จำนวนวัสดุ:</span>
                        <span class="value">{{ editableBreakdown.length }} รายการ</span>
                      </div>
                      <div class="summary-item">
                        <span class="label">จำนวนสินค้า (ยังไม่รับ):</span>
                        <span class="value">{{ filteredStockList.length }} รายการ</span>
                      </div>
                      <div class="summary-item">
                        <span class="label">รายการที่เลือก:</span>
                        <span class="value">{{ selectedCount }} รายการ</span>
                      </div>
                    </div>

                    <!-- Material Summary -->
                    <div class="material-summary mt-3">
                      <h6 class="text-muted">วัสดุที่จะนำไปใช้:</h6>
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
              <button type="button" class="btn btn-secondary btn-sm" @click="closeModal">
                <span class="bi bi-x-lg mr-1"></span>
                ปิด
              </button>
            </div>
          </div>
        </div>
      </template>
    </modal>
  </div>
</template>

<script>
import modal from '@/components/modal/ModalView.vue'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import Dropdown from 'primevue/dropdown'
import swAlert from '@/services/alert/sweetAlerts.js'

export default {
  name: 'AdjustBreakdownModal',

  components: {
    modal,
    BaseDataTable,
    Dropdown
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
      selectedStockItems: [],
      stockColumns: [
        {
          field: 'stockReceiptNumber',
          header: 'หมายเลขสต็อก',
          minWidth: '150px',
          sortable: false
        },
        {
          field: 'productNumber',
          header: 'รหัสสินค้า',
          width: '120px',
          sortable: false
        },
        {
          field: 'productNameTH',
          header: 'ชื่อสินค้า',
          minWidth: '200px',
          sortable: false
        },
        {
          field: 'isReceipt',
          header: 'สถานะ',
          width: '80px',
          sortable: false,
          align: 'center'
        }
      ],

      breakdownColumns: [
        {
          field: 'type',
          header: 'ประเภท',
          minWidth: '120px',
          sortable: false
        },
        {
          field: 'typeName',
          header: 'ชื่อวัสดุ',
          minWidth: '180px',
          sortable: false
        },
        {
          field: 'typeCode',
          header: 'รหัส/เกรด',
          minWidth: '130px',
          sortable: false
        },
        {
          field: 'qty',
          header: 'จำนวน',
          minWidth: '150px',
          sortable: false,
          align: 'center'
        },
        {
          field: 'priceQty',
          header: 'ราคา/หน่วย',
          minWidth: '120px',
          sortable: false,
          align: 'center'
        },
        {
          field: 'qtyWeight',
          header: 'น้ำหนัก',
          minWidth: '150px',
          sortable: false,
          align: 'center'
        },
        {
          field: 'priceWeight',
          header: 'ราคา/น้ำหนัก',
          minWidth: '120px',
          sortable: false,
          align: 'center'
        },
        {
          field: 'totalPrice',
          header: 'รวมราคา',
          minWidth: '150px',
          sortable: false,
          align: 'right',
          format: 'decimal2'
        },
        {
          field: 'region',
          header: 'แหล่งที่มา',
          minWidth: '100px',
          sortable: false
        },
        {
          field: 'typeBarcode',
          header: 'Barcode',
          minWidth: '150px',
          sortable: false
        },
        {
          field: 'action',
          header: 'จัดการ',
          minWidth: '80px',
          sortable: false,
          align: 'center'
        }
      ]
    }
  },

  computed: {
    isShowModal() {
      return this.isShow
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
      // Only show items where isReceipt = false
      return this.stockList.filter(stock => !stock.isReceipt)
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
      // Check if breakdownData has BreakDown property from API response
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
        this.addBreakdownItem() // Add one default item
      }

      // Reset selection
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
        return 'background-color: #e0e0e0' // Gray for receipted items
      } else if (data) {
        return 'background-color: #b5dad4' // Light green for items with data
      } else {
        return 'background-color: #dad4b5' // Light yellow for empty/required fields
      }
    },


    updateStockSelection(newSelection) {
      this.selectedStockItems = newSelection
      this.selectedStockNumbers = newSelection.map((item) => item.stockReceiptNumber)
    },

    applyBreakdownToStock() {
      let targetStocks = []

      if (this.applyType === 'all') {
        // Only apply to items where isReceipt = false
        targetStocks = this.filteredStockList.map((s) => s.stockReceiptNumber)
      } else {
        // Only selected items that are not receipted
        targetStocks = this.selectedStockItems
          .filter(item => !item.isReceipt)
          .map((s) => s.stockReceiptNumber)
      }

      if (targetStocks.length === 0) {
        swAlert.warning('ไม่มีสินค้าที่สามารถนำไปใช้', 'สินค้าที่เลือกต้องยังไม่รับเข้าคลังเท่านั้น', () => {})
        return
      }

      const breakdownToApply = this.validBreakdownMaterials.map((material) => ({
        ...material,
        // Convert breakdown to material format for stock
        weight: material.qtyWeight,
        weightUnit: material.qtyWeightUnit,
        size: '', // Not applicable for breakdown materials
        price: 0 // Individual stock price, different from breakdown price
      }))

      this.$emit('applyBreakdown', {
        breakdown: breakdownToApply,
        stockNumbers: targetStocks
      })

      swAlert.success(
        'นำไปใช้สำเร็จ',
        `นำวัสดุไปใช้กับสินค้า ${targetStocks.length} รายการเรียบร้อยแล้ว`,
        () => {
          console.log('Breakdown applied successfully')
        }
      )
    },

    saveDraft() {
      if (!this.hasValidBreakdown) {
        swAlert.warning('ข้อมูลไม่ครบถ้วน', 'กรุณากรอกข้อมูลวัสดุให้ครบถ้วน', () => {})
        return
      }

      this.$emit('saveDraft', {
        breakdown: this.validBreakdownMaterials
      })

      swAlert.success('บันทึกสำเร็จ', 'บันทึกข้อมูล Breakdown ฉบับร่างเรียบร้อยแล้ว', () => {
        console.log('Breakdown draft saved successfully')
      })
    },

    closeModal() {
      this.$emit('closeModal')
    }
  }
}
</script>

<style lang="scss" scoped>
.title-text-lg-bg {
  background: linear-gradient(135deg, var(--base-font-color) 0%, var(--base-font-sub-color) 100%);
  color: white;
  padding: 1rem;
  border-radius: 8px 8px 0 0;
  font-size: 1.1rem;
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.custom-breakdown-table {
  border: 1px solid #dee2e6;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

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
    text-align: center;
    font-size: 0.8rem;
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
    font-size: 0.9rem;
  }

  .currency-unit {
    color: #6c757d;
    font-size: 0.75rem;
    font-weight: normal;
  }
}

.apply-section {
  border-top: 2px solid var(--base-font-color);
  padding-top: 1rem;

  .card {
    border: 1px solid #dee2e6;
    border-radius: 6px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

    .card-header {
      background: linear-gradient(
        135deg,
        var(--base-font-color) 0%,
        var(--base-font-sub-color) 100%
      );
      color: white;
      border-bottom: 1px solid var(--base-font-sub-color);
      padding: 0.75rem 1rem;

      h6 {
        color: white;
        margin: 0;
      }
    }

    .card-body {
      padding: 1rem;
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
  border: 1px solid #dee2e6;
  border-radius: 4px;

  :deep(.p-datatable) {
    .p-datatable-thead > tr > th {
      background-color: var(--base-font-color);
      color: white;
      font-size: 0.85rem;
      padding: 0.5rem;
    }

    .p-datatable-tbody > tr > td {
      font-size: 0.85rem;
      padding: 0.5rem;
    }
  }
}

.badge {
  padding: 0.25em 0.6em;
  font-size: 0.75em;
  font-weight: 600;
  border-radius: 0.25rem;
  
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
    margin-bottom: 0.5rem;

    .label {
      color: #6c757d;
      font-size: 0.9rem;
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
    border: 1px solid #dee2e6;
    border-left: 3px solid var(--base-font-color);
    border-radius: 4px;
    padding: 0.5rem;
    margin-bottom: 0.25rem;
    font-size: 0.8rem;
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
  padding-top: 1rem;
}

.gap-2 {
  gap: 0.5rem;
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
