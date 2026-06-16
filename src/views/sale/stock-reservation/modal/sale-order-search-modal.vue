<template>
  <modal
    :showModal="isShow"
    width="90%"
    :isShowActionPart="true"
    @closeModal="onClose"
  >
    <template #title>
      <span class="title-text-lg px-3 pt-3 d-block">
        <i class="bi bi-receipt mr-2"></i>เลือกใบสั่งขายสำหรับจองสต็อก
      </span>
    </template>

    <template #content>
      <div class="px-3 pb-3">
        <!-- Search Section -->
        <div class="filter-container mb-3">
          <div class="form-col-container">
            <div>
              <span class="title-text">เลขที่ใบสั่งขาย</span>
              <input
                type="text"
                v-model="searchForm.saleOrderNumber"
                class="form-control"
                placeholder="SO-2025-001"
                @keyup.enter="onSearch"
              />
            </div>
            <div>
              <span class="title-text">ชื่อลูกค้า</span>
              <input
                type="text"
                v-model="searchForm.customerName"
                class="form-control"
                placeholder="ชื่อลูกค้า"
                @keyup.enter="onSearch"
              />
            </div>
            <div>
              <span class="title-text">สถานะ</span>
              <DropdownGeneric
                v-model="searchForm.status"
                :options="statusOptions"
                optionLabel="name"
                optionValue="value"
                placeholder="เลือกสถานะ"
                :showClear="true"
              />
            </div>
          </div>
          <div class="btn-submit-container-between mt-2">
            <div></div>
            <div>
              <button class="btn btn-sm btn-green" @click="onSearch">
                <i class="bi bi-search mr-1"></i>ค้นหา
              </button>
              <button class="btn btn-sm btn-dark ml-2" @click="clearSearch">
                <i class="bi bi-arrow-clockwise mr-1"></i>ล้างข้อมูล
              </button>
            </div>
          </div>
        </div>

        <!-- Results Table -->
        <div class="responsive-table-wrapper">
          <!-- eslint-disable-next-line no-restricted-imports -->
          <DataTable
            :value="saleOrders"
            dataKey="saleOrderId"
            :paginator="true"
            :rows="10"
            :loading="loading"
            responsiveLayout="scroll"
          >
            <!-- eslint-disable-next-line no-restricted-imports -->
            <Column field="number" header="เลขที่ใบสั่งขาย" :sortable="true" style="min-width: 140px">
              <template #body="{ data }">
                <span class="font-weight-bold" style="color: var(--base-font-color)">{{ data.number }}</span>
              </template>
            </Column>

            <!-- eslint-disable-next-line no-restricted-imports -->
            <Column field="orderDate" header="วันที่ใบสั่งขาย" :sortable="true" style="min-width: 120px">
              <template #body="{ data }">
                {{ formatDate(data.orderDate) }}
              </template>
            </Column>

            <!-- eslint-disable-next-line no-restricted-imports -->
            <Column field="customerName" header="ลูกค้า" :sortable="true" style="min-width: 200px">
              <template #body="{ data }">
                <div>
                  <div class="font-weight-bold">{{ data.customerName }}</div>
                  <small class="text-muted">{{ data.customerPhone }}</small>
                </div>
              </template>
            </Column>

            <!-- eslint-disable-next-line no-restricted-imports -->
            <Column header="รายการสต็อก" style="min-width: 120px">
              <template #body="{ data }">
                <div class="text-center">
                  <span class="badge badge-info">
                    <i class="bi bi-box mr-1"></i>
                    {{ getStockItemsCount(data.items) }} รายการ
                  </span>
                </div>
              </template>
            </Column>

            <!-- eslint-disable-next-line no-restricted-imports -->
            <Column header="สถานะสต็อก" style="min-width: 140px">
              <template #body="{ data }">
                <div class="stock-status-summary">
                  <div class="status-item">
                    <span class="status-label">พร้อมจอง:</span>
                    <span class="font-weight-bold" style="color: var(--base-green)">{{ getAvailableItemsCount(data.items) }}</span>
                  </div>
                  <div class="status-item">
                    <span class="status-label">จองแล้ว:</span>
                    <span class="font-weight-bold" style="color: var(--base-warning)">{{ getReservedItemsCount(data.items) }}</span>
                  </div>
                  <div class="status-item">
                    <span class="status-label">หมดสต็อก:</span>
                    <span class="font-weight-bold" style="color: var(--base-red)">{{ getOutOfStockItemsCount(data.items) }}</span>
                  </div>
                </div>
              </template>
            </Column>

            <!-- eslint-disable-next-line no-restricted-imports -->
            <Column field="expectedDeliveryDate" header="กำหนดส่งมอบ" :sortable="true" style="min-width: 120px">
              <template #body="{ data }">
                <div :class="getDeliveryDateClass(data.expectedDeliveryDate)">
                  {{ formatDate(data.expectedDeliveryDate) }}
                </div>
              </template>
            </Column>

            <!-- eslint-disable-next-line no-restricted-imports -->
            <Column field="status" header="สถานะ" :sortable="true" style="min-width: 120px">
              <template #body="{ data }">
                <span :class="getStatusClass(data.status)">
                  {{ getStatusText(data.status) }}
                </span>
              </template>
            </Column>

            <!-- eslint-disable-next-line no-restricted-imports -->
            <Column header="การดำเนินการ" style="width: 100px">
              <template #body="{ data }">
                <button
                  class="btn btn-sm btn-green"
                  @click="selectSaleOrder(data)"
                  :disabled="!hasStockItems(data.items)"
                  :title="hasStockItems(data.items) ? 'เลือกใบสั่งขายนี้' : 'ไม่มีรายการสต็อกที่สามารถจองได้'"
                >
                  <i class="bi bi-check-circle mr-1"></i>
                  เลือก
                </button>
              </template>
            </Column>
          </DataTable>
        </div>

        <!-- No Results Message -->
        <div v-if="!loading && saleOrders.length === 0" class="text-center text-muted py-4">
          <i class="bi bi-inbox" style="font-size: 4rem; opacity: 0.3"></i>
          <div class="mt-2">ไม่พบข้อมูลใบสั่งขาย</div>
          <div>ลองปรับเปลี่ยนเงื่อนไขการค้นหา</div>
        </div>
      </div>
    </template>

    <template #action>
      <button class="btn btn-sm btn-outline-main" @click="onClose">
        <i class="bi bi-x mr-1"></i>ปิด
      </button>
    </template>
  </modal>
</template>

<script>
import { defineAsyncComponent } from 'vue'
// eslint-disable-next-line no-restricted-imports
import DataTable from 'primevue/datatable'
// eslint-disable-next-line no-restricted-imports
import Column from 'primevue/column'
import DropdownGeneric from '@/components/prime-vue/DropdownGeneric.vue'
import { formatDecimal } from '@/services/utils/decimal.js'

const modal = defineAsyncComponent(() => import('@/components/modal/modal-view.vue'))

export default {
  name: 'SaleOrderSearchModal',

  components: {
    modal,
    DataTable,
    Column,
    DropdownGeneric
  },

  emits: ['update:isShow', 'select', 'close'],

  props: {
    isShow: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      loading: false,

      searchForm: {
        saleOrderNumber: '',
        customerName: '',
        status: null
      },

      saleOrders: [],

      statusOptions: [
        { name: 'ยืนยันแล้ว', value: 'Confirmed' },
        { name: 'ส่งมอบบางส่วน', value: 'PartiallyFulfilled' },
        { name: 'ส่งมอบครบถ้วน', value: 'Fulfilled' }
      ]
    }
  },

  watch: {
    isShow: {
      handler(newVal) {
        if (newVal) {
          this.loadSaleOrders()
        }
      },
      immediate: true
    }
  },

  methods: {
    async loadSaleOrders() {
      this.loading = true

      this.saleOrders = [
        {
          saleOrderId: 1,
          number: 'SO-2025-001',
          orderDate: '2025-01-15',
          expectedDeliveryDate: '2025-02-15',
          customerName: 'บริษัท ABC จำกัด',
          customerPhone: '02-123-4567',
          totalAmount: 85000,
          status: 'Confirmed',
          items: [
            {
              itemId: 1,
              productId: 1,
              productName: 'Diamond Ring Set',
              itemType: 'Stock',
              quantity: 2,
              stockAvailable: 5,
              reserved: 0
            },
            {
              itemId: 2,
              productId: 2,
              productName: 'Custom Gold Necklace',
              itemType: 'Production',
              quantity: 1
            },
            {
              itemId: 3,
              productId: 3,
              productName: 'Gold Bracelet',
              itemType: 'Stock',
              quantity: 1,
              stockAvailable: 0,
              reserved: 2
            }
          ]
        },
        {
          saleOrderId: 2,
          number: 'SO-2025-002',
          orderDate: '2025-01-16',
          expectedDeliveryDate: '2025-03-01',
          customerName: 'คุณสมชาย ใจดี',
          customerPhone: '08-987-6543',
          totalAmount: 150000,
          status: 'Confirmed',
          items: [
            {
              itemId: 4,
              productId: 4,
              productName: 'Pearl Earrings',
              itemType: 'Stock',
              quantity: 1,
              stockAvailable: 3,
              reserved: 1
            },
            {
              itemId: 5,
              productId: 5,
              productName: 'Silver Chain',
              itemType: 'Stock',
              quantity: 2,
              stockAvailable: 8,
              reserved: 0
            }
          ]
        }
      ]

      this.loading = false
    },

    async onSearch() {
      await this.loadSaleOrders()
    },

    clearSearch() {
      this.searchForm = {
        saleOrderNumber: '',
        customerName: '',
        status: null
      }
      this.loadSaleOrders()
    },

    selectSaleOrder(saleOrder) {
      this.$emit('select', saleOrder)
    },

    onClose() {
      this.$emit('close')
      this.$emit('update:isShow', false)
    },

    hasStockItems(items) {
      return items && items.some(item => item.itemType === 'Stock')
    },

    getStockItemsCount(items) {
      if (!items) return 0
      return items.filter(item => item.itemType === 'Stock').length
    },

    getAvailableItemsCount(items) {
      if (!items) return 0
      return items.filter(item =>
        item.itemType === 'Stock' &&
        (item.stockAvailable || 0) - (item.reserved || 0) > 0
      ).length
    },

    getReservedItemsCount(items) {
      if (!items) return 0
      return items.filter(item =>
        item.itemType === 'Stock' && (item.reserved || 0) > 0
      ).length
    },

    getOutOfStockItemsCount(items) {
      if (!items) return 0
      return items.filter(item =>
        item.itemType === 'Stock' &&
        (item.stockAvailable || 0) - (item.reserved || 0) <= 0
      ).length
    },

    getStatusClass(status) {
      const classes = {
        'Confirmed': 'badge badge-success',
        'PartiallyFulfilled': 'badge badge-warning',
        'Fulfilled': 'badge badge-info'
      }
      return classes[status] || 'badge badge-secondary'
    },

    getStatusText(status) {
      const texts = {
        'Confirmed': 'ยืนยันแล้ว',
        'PartiallyFulfilled': 'ส่งมอบบางส่วน',
        'Fulfilled': 'ส่งมอบครบถ้วน'
      }
      return texts[status] || status
    },

    getDeliveryDateClass(date) {
      if (!date) return ''

      const today = new Date()
      const deliveryDate = new Date(date)
      const diffDays = Math.ceil((deliveryDate - today) / (1000 * 60 * 60 * 24))

      if (diffDays < 0) return 'font-weight-bold text-danger'
      if (diffDays <= 7) return 'font-weight-bold text-warning'
      return ''
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
@import '@/assets/scss/custom-style/standard-search-bar';
@import '@/assets/scss/responsive-style/web';

.stock-status-summary {
  .status-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.25rem;
    font-size: 0.85rem;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .status-label {
    margin-right: 0.5rem;
  }
}

.badge {
  padding: 0.25em 0.5em;
  font-size: 0.75em;
  border-radius: 0.25rem;
  font-weight: 600;

  &.badge-success {
    background-color: var(--base-green);
    color: white;
  }

  &.badge-warning {
    background-color: var(--base-warning);
    color: #212529;
  }

  &.badge-info {
    background-color: #17a2b8;
    color: white;
  }

  &.badge-secondary {
    background-color: #6c757d;
    color: white;
  }
}
</style>
