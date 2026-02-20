<template>
  <Dialog
    v-model:visible="localVisible"
    :modal="true"
    :style="{ width: '90vw', maxWidth: '1200px' }"
    :closable="true"
    @update:visible="handleVisibleChange"
  >
    <template #header>
      <div class="vertical-center-container">
        <span class="title-text-lg bi bi-calculator mr-2"></span>
        <span class="title-text-lg">ดูต้นทุนสินค้า</span>
      </div>
    </template>

    <!-- Loading State -->
    <div v-if="loading" class="text-center p-5">
      <ProgressSpinner />
      <p>กำลังโหลดข้อมูล...</p>
    </div>

    <!-- Content -->
    <div v-else-if="stockData && stockData.stockNumber">
      <!-- Stock Information Section -->
      <div class="filter-container mt-2">
        <div class="vertical-center-container mb-2">
          <span class="title-text-lg bi bi-clipboard2-check-fill mr-2"></span>
          <span class="title-text-lg">ข้อมูลสินค้า</span>
        </div>

        <div class="form-col-sm-container">
          <div>
            <span class="title-text">เลขที่ผลิต</span>
            <input
              class="form-control form-control-sm"
              type="text"
              :value="stockData.stockNumber"
              readonly
              disabled
            />
          </div>
          <div>
            <span class="title-text">รหัสสินค้า</span>
            <input
              class="form-control form-control-sm"
              type="text"
              :value="stockData.productNumber"
              readonly
              disabled
            />
          </div>
          <div>
            <span class="title-text">ชื่อสินค้า (TH)</span>
            <input
              class="form-control form-control-sm"
              type="text"
              :value="stockData.productNameTh"
              readonly
              disabled
            />
          </div>
          <div>
            <span class="title-text">ชื่อสินค้า (EN)</span>
            <input
              class="form-control form-control-sm"
              type="text"
              :value="stockData.productNameEn"
              readonly
              disabled
            />
          </div>
          <div>
            <span class="title-text">ประเภทสินค้า</span>
            <input
              class="form-control form-control-sm"
              type="text"
              :value="stockData.productTypeName"
              readonly
              disabled
            />
          </div>
          <div>
            <span class="title-text">W.O.</span>
            <input
              class="form-control form-control-sm"
              type="text"
              :value="stockData.wo && stockData.woNumber ? `${stockData.wo}-${stockData.woNumber}` : '-'"
              readonly
              disabled
            />
          </div>
        </div>
        <div v-if="stockData.remark" class="form-col-sm-container mt-2">
          <div>
            <span class="title-text">หมายเหตุ</span>
            <textarea
              class="form-control form-control-sm"
              :value="stockData.remark"
              rows="2"
              readonly
              disabled
            ></textarea>
          </div>
        </div>
      </div>

      <!-- Cost Items Table -->
      <div class="filter-container mt-3">
        <div class="vertical-center-container mb-2">
          <span class="title-text-lg bi bi-list-check mr-2"></span>
          <span class="title-text-lg">รายการต้นทุน</span>
        </div>

        <div class="responsive-table-wrapper">
          <DataTable
            :value="groupedTransactions"
            rowGroupMode="subheader"
            groupRowsBy="nameGroup"
            :sortOrder="1"
            :sortField="'groupOrder'"
            stripedRows
            showGridlines
          >
            <ColumnGroup type="header">
              <Row>
                <Column header="รายการ" />
                <Column header="จำนวน" />
                <Column header="ราคา/หน่วย" />
                <Column header="น้ำหนัก" />
                <Column header="ราคา/น้ำหนัก" />
                <Column header="รวม" />
              </Row>
            </ColumnGroup>

            <Column field="nameDescription">
              <template #body="slotProps">
                <input
                  type="text"
                  class="form-control"
                  :value="slotProps.data.nameDescription"
                  readonly
                  disabled
                />
              </template>
            </Column>

            <Column field="qty" style="width: 130px">
              <template #body="slotProps">
                <input
                  type="text"
                  class="form-control text-right"
                  :value="formatNumber(slotProps.data.qty)"
                  readonly
                  disabled
                />
              </template>
            </Column>

            <Column field="qtyPrice" style="width: 110px">
              <template #body="slotProps">
                <input
                  type="text"
                  class="form-control text-right"
                  :value="formatCurrency(slotProps.data.qtyPrice)"
                  readonly
                  disabled
                />
              </template>
            </Column>

            <Column field="qtyWeight" style="width: 110px">
              <template #body="slotProps">
                <input
                  type="text"
                  class="form-control text-right"
                  :value="formatNumber(slotProps.data.qtyWeight)"
                  readonly
                  disabled
                />
              </template>
            </Column>

            <Column field="qtyWeightPrice" style="width: 110px">
              <template #body="slotProps">
                <input
                  type="text"
                  class="form-control text-right"
                  :value="formatCurrency(slotProps.data.qtyWeightPrice)"
                  readonly
                  disabled
                />
              </template>
            </Column>

            <Column field="totalPrice" style="width: 150px">
              <template #body="slotProps">
                <input
                  type="text"
                  class="form-control text-right"
                  :value="formatCurrency(slotProps.data.totalPrice)"
                  readonly
                  disabled
                />
              </template>
            </Column>

            <template #groupheader="slotProps">
              <div class="flex align-items-center gap-2 type-container">
                <span><i class="bi bi-clipboard2-check mr-2"></i></span>
                <span>{{ getGroupLabel(slotProps.data.nameGroup) }}</span>
              </div>
            </template>

            <ColumnGroup type="footer">
              <Row>
                <Column :colspan="5">
                  <template #footer>
                    <div class="text-right type-container">
                      <span>รวมราคาทุกรายการ</span>
                    </div>
                  </template>
                </Column>
                <Column :colspan="1">
                  <template #footer>
                    <div class="text-right type-container">
                      <span>{{ formatCurrency(totalPrice) }}</span>
                    </div>
                  </template>
                </Column>
              </Row>
              <Row v-if="tagPriceMultiplier > 0">
                <Column :colspan="5">
                  <template #footer>
                    <div class="text-right type-container tag-price-row">
                      <span>ราคาป้าย (ตัวคูณ × {{ tagPriceMultiplier }})</span>
                    </div>
                  </template>
                </Column>
                <Column :colspan="1">
                  <template #footer>
                    <div class="text-right type-container tag-price-row">
                      <span>{{ formatCurrency(tagPrice) }}</span>
                    </div>
                  </template>
                </Column>
              </Row>
            </ColumnGroup>
          </DataTable>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!loading" class="text-center p-5">
      <p>ไม่พบข้อมูลต้นทุนสินค้า</p>
    </div>

    <template #footer>
      <div class="responsive-btn-group">
        <button class="btn btn-sm btn-secondary" type="button" @click="handleClose">
          <span class="bi bi-x mr-2"></span>
          <span>ปิด</span>
        </button>
      </div>
    </template>
  </Dialog>
</template>

<script>
import Dialog from 'primevue/dialog'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import ColumnGroup from 'primevue/columngroup'
import Row from 'primevue/row'
import ProgressSpinner from 'primevue/progressspinner'
import { usrStockProductApiStore } from '@/stores/modules/api/stock/product-api.js'
import { formatDecimal } from '@/services/utils/decimal.js'

export default {
  name: 'CostDetailModal',
  components: {
    Dialog,
    DataTable,
    Column,
    ColumnGroup,
    Row,
    ProgressSpinner
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    stockNumber: {
      type: String,
      default: ''
    },
    stockData: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ['update:visible'],
  data() {
    return {
      localVisible: false,
      priceTransactions: [],
      loading: false,
      groupOrder: {
        Gold: 1,
        Gem: 2,
        Worker: 3,
        Embed: 4,
        ETC: 5
      }
    }
  },
  computed: {
    groupedTransactions() {
      if (!this.priceTransactions || !Array.isArray(this.priceTransactions)) {
        return []
      }

      // Add group order for sorting
      return this.priceTransactions.map((item) => ({
        ...item,
        groupOrder: this.groupOrder[item.nameGroup] || 999
      }))
    },
    totalPrice() {
      if (!this.priceTransactions || !Array.isArray(this.priceTransactions)) {
        return 0
      }
      return this.priceTransactions.reduce((sum, item) => sum + (item.totalPrice || 0), 0)
    },
    tagPriceMultiplier() {
      return this.stockData?.tagPriceMultiplier || 1
    },
    tagPrice() {
      return this.totalPrice * this.tagPriceMultiplier
    }
  },
  watch: {
    visible: {
      handler(val) {
        this.localVisible = val
        if (val && this.stockNumber) {
          this.loadCostDetail()
        }
      },
      immediate: true
    }
  },
  methods: {
    async loadCostDetail() {
      if (!this.stockNumber) return

      this.loading = true
      try {
        const store = usrStockProductApiStore()
        const response = await store.fetchGetStockCostDetail(this.stockNumber)

        if (response && Array.isArray(response)) {
          this.priceTransactions = response
        } else {
          this.priceTransactions = []
        }
      } catch (error) {
        console.error('Error loading cost detail:', error)
        this.priceTransactions = []
      } finally {
        this.loading = false
      }
    },

    getGroupLabel(group) {
      const labels = {
        Gold: 'รายการทอง',
        Gem: 'รายการวัถุดิบ',
        Worker: 'รายการงานช่าง',
        Embed: 'รายการงานฝัง',
        ETC: 'รายการเพิ่มเติม'
      }
      return labels[group] || group
    },

    formatCurrency(value) {
      if (value === null || value === undefined || value === '') return '-'
      return formatDecimal(Number(value), 2)
    },

    formatNumber(value) {
      if (value === null || value === undefined || value === '') return '-'
      return formatDecimal(Number(value), 2)
    },

    handleVisibleChange(val) {
      this.$emit('update:visible', val)
    },

    handleClose() {
      this.localVisible = false
      this.$emit('update:visible', false)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
@import '@/assets/scss/responsive-style/web';

.type-container {
  font-size: 15px;
  font-weight: bold;
  color: var(--base-font-color);
  padding: 5px;

  @media (max-width: 1024px) {
    font-size: 14px;
  }
}

input,
textarea {
  margin-top: 5px !important;
}

textarea {
  resize: vertical;
}

// Responsive DataTable styles for Tablet
:deep(.p-datatable) {
  font-size: 14px;

  @media (max-width: 1024px) {
    font-size: 13px;

    .p-datatable-thead > tr > th {
      padding: 0.5rem 0.4rem;
    }

    .p-datatable-tbody > tr > td {
      padding: 0.5rem 0.4rem;
    }

    input.form-control {
      font-size: 13px;
    }
  }
}

.tag-price-row {
  color: #e65100;
}

// Responsive Column widths for Tablet
:deep(.p-datatable) {
  @media (max-width: 1024px) {
    th[style*='width: 130px'],
    td[style*='width: 130px'] {
      width: 110px !important;
    }

    th[style*='width: 110px'],
    td[style*='width: 110px'] {
      width: 95px !important;
    }

    th[style*='width: 150px'],
    td[style*='width: 150px'] {
      width: 130px !important;
    }
  }
}
</style>
