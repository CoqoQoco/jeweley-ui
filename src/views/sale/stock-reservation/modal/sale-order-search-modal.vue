<template>
  <modal
    :showModal="isShow"
    width="90%"
    :isShowActionPart="true"
    @closeModal="onClose"
  >
    <template #title>
      <span class="title-text-lg px-3 pt-3 d-block">
        <i class="bi bi-receipt mr-2"></i>{{ $t('view.sale.stockReservation.selectSaleOrderTitle') }}
      </span>
    </template>

    <template #content>
      <div class="px-3 pb-3">
        <!-- Search Section -->
        <div class="filter-container mb-3">
          <div class="form-col-container">
            <div>
              <span class="title-text">{{ $t('view.sale.saleOrder.soNumber') }}</span>
              <input
                type="text"
                v-model="searchForm.saleOrderNumber"
                class="form-control"
                placeholder="SO-2025-001"
                @keyup.enter="onSearch"
              />
            </div>
            <div>
              <span class="title-text">{{ $t('view.sale.saleOrder.customerName') }}</span>
              <input
                type="text"
                v-model="searchForm.customerName"
                class="form-control"
                :placeholder="$t('view.sale.saleOrder.customerName')"
                @keyup.enter="onSearch"
              />
            </div>
            <div>
              <span class="title-text">{{ $t('view.sale.stockReservation.status') }}</span>
              <DropdownGeneric
                v-model="searchForm.status"
                :options="statusOptions"
                optionLabel="name"
                optionValue="value"
                :placeholder="$t('view.sale.stockReservation.selectStatus')"
                :showClear="true"
              />
            </div>
          </div>
          <div class="btn-submit-container-between mt-2">
            <div></div>
            <div>
              <button class="btn btn-sm btn-green" @click="onSearch">
                <i class="bi bi-search mr-1"></i>{{ $t('common.btn.search') }}
              </button>
              <button class="btn btn-sm btn-dark ml-2" @click="clearSearch">
                <i class="bi bi-arrow-clockwise mr-1"></i>{{ $t('common.btn.clear') }}
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
            <Column field="number" :header="$t('view.sale.saleOrder.soNumber')" :sortable="true" style="min-width: 140px">
              <template #body="{ data }">
                <span class="font-weight-bold" style="color: var(--base-font-color)">{{ data.number }}</span>
              </template>
            </Column>

            <!-- eslint-disable-next-line no-restricted-imports -->
            <Column field="orderDate" :header="$t('view.sale.stockReservation.orderDate')" :sortable="true" style="min-width: 120px">
              <template #body="{ data }">
                {{ formatDate(data.orderDate) }}
              </template>
            </Column>

            <!-- eslint-disable-next-line no-restricted-imports -->
            <Column field="customerName" :header="$t('view.sale.saleOrder.customerName')" :sortable="true" style="min-width: 200px">
              <template #body="{ data }">
                <div>
                  <div class="font-weight-bold">{{ data.customerName }}</div>
                  <small class="text-muted">{{ data.customerPhone }}</small>
                </div>
              </template>
            </Column>

            <!-- eslint-disable-next-line no-restricted-imports -->
            <Column :header="$t('view.sale.stockReservation.stockItems')" style="min-width: 120px">
              <template #body="{ data }">
                <div class="text-center">
                  <span class="badge badge-info">
                    <i class="bi bi-box mr-1"></i>
                    {{ $t('view.sale.stockReservation.itemCount', { count: getStockItemsCount(data.items) }) }}
                  </span>
                </div>
              </template>
            </Column>

            <!-- eslint-disable-next-line no-restricted-imports -->
            <Column :header="$t('view.sale.stockReservation.stockStatus')" style="min-width: 140px">
              <template #body="{ data }">
                <div class="stock-status-summary">
                  <div class="status-item">
                    <span class="status-label">{{ $t('view.sale.stockReservation.readyToReserve') }}:</span>
                    <span class="font-weight-bold" style="color: var(--base-green)">{{ getAvailableItemsCount(data.items) }}</span>
                  </div>
                  <div class="status-item">
                    <span class="status-label">{{ $t('view.sale.stockReservation.reserved') }}:</span>
                    <span class="font-weight-bold" style="color: var(--base-warning)">{{ getReservedItemsCount(data.items) }}</span>
                  </div>
                  <div class="status-item">
                    <span class="status-label">{{ $t('view.sale.stockReservation.outOfStock') }}:</span>
                    <span class="font-weight-bold" style="color: var(--base-red)">{{ getOutOfStockItemsCount(data.items) }}</span>
                  </div>
                </div>
              </template>
            </Column>

            <!-- eslint-disable-next-line no-restricted-imports -->
            <Column field="expectedDeliveryDate" :header="$t('view.sale.stockReservation.deliveryDate')" :sortable="true" style="min-width: 120px">
              <template #body="{ data }">
                <div :class="getDeliveryDateClass(data.expectedDeliveryDate)">
                  {{ formatDate(data.expectedDeliveryDate) }}
                </div>
              </template>
            </Column>

            <!-- eslint-disable-next-line no-restricted-imports -->
            <Column field="status" :header="$t('view.sale.stockReservation.status')" :sortable="true" style="min-width: 120px">
              <template #body="{ data }">
                <span :class="getStatusClass(data.status)">
                  {{ getStatusText(data.status) }}
                </span>
              </template>
            </Column>

            <!-- eslint-disable-next-line no-restricted-imports -->
            <Column :header="$t('common.field.action')" style="width: 100px">
              <template #body="{ data }">
                <button
                  class="btn btn-sm btn-green"
                  @click="selectSaleOrder(data)"
                  :disabled="!hasStockItems(data.items)"
                  :title="hasStockItems(data.items) ? $t('view.sale.stockReservation.selectThisSO') : $t('view.sale.stockReservation.noStockAvailable')"
                >
                  <i class="bi bi-check-circle mr-1"></i>
                  {{ $t('common.btn.select') }}
                </button>
              </template>
            </Column>
          </DataTable>
        </div>

        <!-- No Results Message -->
        <div v-if="!loading && saleOrders.length === 0" class="text-center text-muted py-4">
          <i class="bi bi-inbox" style="font-size: 4rem; opacity: 0.3"></i>
          <div class="mt-2">{{ $t('view.sale.stockReservation.noData') }}</div>
          <div>{{ $t('view.sale.stockReservation.tryAdjustSearch') }}</div>
        </div>
      </div>
    </template>

    <template #action>
      <button class="btn btn-sm btn-outline-main" @click="onClose">
        <i class="bi bi-x mr-1"></i>{{ $t('common.btn.close') }}
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

    }
  },

  computed: {
    statusOptions() {
      return [
        { name: this.$t('view.sale.stockReservation.status.confirmed'), value: 'Confirmed' },
        { name: this.$t('view.sale.stockReservation.status.partiallyFulfilled'), value: 'PartiallyFulfilled' },
        { name: this.$t('view.sale.stockReservation.status.fulfilled'), value: 'Fulfilled' }
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
      const keyMap = {
        'Confirmed': 'confirmed',
        'PartiallyFulfilled': 'partiallyFulfilled',
        'Fulfilled': 'fulfilled'
      }
      const key = keyMap[status]
      return key
        ? this.$t(`view.sale.stockReservation.status.${key}`)
        : this.$t('view.sale.stockReservation.status.unknown')
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
