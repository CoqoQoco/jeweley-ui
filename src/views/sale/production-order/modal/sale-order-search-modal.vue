<template>
  <div>
    <modal :showModal="isShow" @closeModal="onClose" width="1200px" :fitHeight="true">
      <template #title>
        <span class="title-text-lg px-3 pt-3 d-block">เลือกใบสั่งขายสำหรับสร้างใบสั่งผลิต</span>
      </template>
      <template #content>
        <!-- Search Section -->
        <div class="modal-search-section mb-3">
          <div class="form-col-container">
            <div>
              <span class="title-text">เลขที่ใบสั่งขาย</span>
              <input
                type="text"
                v-model="searchForm.saleOrderNumber"
                class="form-control bg-input"
                placeholder="SO-2025-001"
                @keyup.enter="onSearch"
              />
            </div>
            <div>
              <span class="title-text">ชื่อลูกค้า</span>
              <input
                type="text"
                v-model="searchForm.customerName"
                class="form-control bg-input"
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
                class="w-100"
              />
            </div>
          </div>
          <div class="btn-submit-container mt-2">
            <button class="btn btn-sm btn-main mr-2" type="button" @click="onSearch">
              <i class="bi bi-search"></i>
            </button>
            <button class="btn btn-sm btn-dark" type="button" @click="clearSearch">
              <i class="bi bi-x-circle"></i>
            </button>
          </div>
        </div>

        <!-- Results Table -->
        <BaseDataTable
          :items="saleOrders"
          :totalRecords="totalRecords"
          dataKey="saleOrderId"
          :columns="columns"
          :perPage="take"
          :scrollHeight="'400px'"
          @page="handlePageChange"
          @sort="handleSortChange"
        >
          <template #numberTemplate="{ data }">
            <span class="fw-bold">{{ data.number }}</span>
          </template>

          <template #orderDateTemplate="{ data }">
            {{ formatDate(data.orderDate) }}
          </template>

          <template #customerNameTemplate="{ data }">
            <div>
              <div class="fw-semibold">{{ data.customerName }}</div>
              <small class="text-muted">{{ data.customerPhone }}</small>
            </div>
          </template>

          <template #productionItemsTemplate="{ data }">
            <div class="text-center">
              <span class="badge badge-info">{{ getProductionItemsCount(data.items) }} รายการ</span>
            </div>
          </template>

          <template #expectedDeliveryDateTemplate="{ data }">
            <div :class="getDeliveryDateClass(data.expectedDeliveryDate)">
              {{ formatDate(data.expectedDeliveryDate) }}
            </div>
          </template>

          <template #totalAmountTemplate="{ data }">
            <div class="text-right">{{ formatCurrency(data.totalAmount) }}</div>
          </template>

          <template #statusTemplate="{ data }">
            <span :class="getStatusClass(data.status)">{{ getStatusText(data.status) }}</span>
          </template>

          <template #actionTemplate="{ data }">
            <div class="btn-action-container">
              <button
                class="btn btn-sm btn-green"
                @click="selectSaleOrder(data)"
                :disabled="!hasProductionItems(data.items)"
                title="เลือกใบสั่งขาย"
              >
                <i class="bi bi-check-circle"></i>
              </button>
            </div>
          </template>
        </BaseDataTable>
      </template>
    </modal>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import DropdownGeneric from '@/components/prime-vue/DropdownGeneric.vue'
import { formatDecimal } from '@/services/utils/decimal.js'
import dataTablePaging from '@/composables/useDataTablePaging.js'

const modal = defineAsyncComponent(() => import('@/components/modal/modal-view.vue'))

export default {
  name: 'SaleOrderSearchModal',

  components: {
    modal,
    BaseDataTable,
    DropdownGeneric
  },

  mixins: [dataTablePaging],

  emits: ['update:isShow', 'select', 'close'],

  props: {
    isShow: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      searchForm: {
        saleOrderNumber: '',
        customerName: '',
        status: null
      },

      saleOrders: [],
      totalRecords: 0,

      statusOptions: [
        { name: 'ยืนยันแล้ว', value: 'Confirmed' },
        { name: 'ส่งมอบบางส่วน', value: 'PartiallyFulfilled' },
        { name: 'ส่งมอบครบถ้วน', value: 'Fulfilled' }
      ]
    }
  },

  computed: {
    columns() {
      return [
        { field: 'action', header: '', width: '60px', sortable: false },
        { field: 'number', header: 'เลขที่ใบสั่งขาย', sortable: true, minWidth: '140px', template: 'numberTemplate' },
        { field: 'orderDate', header: 'วันที่ใบสั่งขาย', sortable: true, minWidth: '120px', template: 'orderDateTemplate' },
        { field: 'customerName', header: 'ลูกค้า', sortable: true, minWidth: '200px', template: 'customerNameTemplate' },
        { field: 'productionItems', header: 'รายการผลิต', sortable: false, minWidth: '120px', template: 'productionItemsTemplate' },
        { field: 'expectedDeliveryDate', header: 'กำหนดส่งมอบ', sortable: true, minWidth: '120px', template: 'expectedDeliveryDateTemplate' },
        { field: 'totalAmount', header: 'ยอดรวม', sortable: true, minWidth: '120px', template: 'totalAmountTemplate' },
        { field: 'status', header: 'สถานะ', sortable: true, minWidth: '120px', template: 'statusTemplate' }
      ]
    }
  },

  watch: {
    isShow(newVal) {
      if (newVal) {
        this.fetchData()
      }
    }
  },

  methods: {
    async fetchData() {
      // TODO: Replace with actual API call
      // const response = await this.saleOrderStore.fetchSaleOrdersWithProductionItems({
      //   take: this.take, skip: this.skip, sort: this.sort, formValue: this.searchForm
      // })
      // this.saleOrders = response.data || []
      // this.totalRecords = response.total || 0
    },

    async onSearch() {
      this.resetPaging()
    },

    clearSearch() {
      this.searchForm = {
        saleOrderNumber: '',
        customerName: '',
        status: null
      }
      this.resetPaging()
    },

    selectSaleOrder(saleOrder) {
      this.$emit('select', saleOrder)
      this.onClose()
    },

    onClose() {
      this.$emit('update:isShow', false)
      this.$emit('close')
    },

    hasProductionItems(items) {
      return items && items.some((item) => item.itemType === 'Production')
    },

    getProductionItemsCount(items) {
      if (!items) return 0
      return items.filter((item) => item.itemType === 'Production').length
    },

    getStatusClass(status) {
      const classes = {
        Confirmed: 'badge badge-success',
        PartiallyFulfilled: 'badge badge-warning',
        Fulfilled: 'badge badge-info'
      }
      return classes[status] || 'badge badge-secondary'
    },

    getStatusText(status) {
      const texts = {
        Confirmed: 'ยืนยันแล้ว',
        PartiallyFulfilled: 'ส่งมอบบางส่วน',
        Fulfilled: 'ส่งมอบครบถ้วน'
      }
      return texts[status] || status
    },

    getDeliveryDateClass(date) {
      if (!date) return ''
      const today = new Date()
      const deliveryDate = new Date(date)
      const diffDays = Math.ceil((deliveryDate - today) / (1000 * 60 * 60 * 24))
      if (diffDays < 0) return 'text-danger fw-bold'
      if (diffDays <= 7) return 'fw-bold'
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
@import '@/assets/scss/custom-style/standard-data-table';

.modal-search-section {
  background: #f8f9fa;
  padding: var(--sp-lg);
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
}

.btn-action-container {
  display: flex;
  justify-content: center;
}

.badge {
  padding: var(--sp-xs) var(--sp-sm);
  font-size: var(--fs-sm);
  border-radius: var(--radius-sm);
  color: white;

  &.badge-success {
    background-color: var(--base-green);
  }

  &.badge-warning {
    background-color: var(--base-warning);
    color: #212529;
  }

  &.badge-info {
    background-color: var(--base-green);
  }

  &.badge-secondary {
    background-color: #6c757d;
  }
}
</style>
