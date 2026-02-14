<template>
  <Dialog
    v-model:visible="isVisible"
    modal
    :style="{ width: '90vw' }"
    :breakpoints="{ '1280px': '90vw', '1024px': '95vw' }"
    @hide="onClose"
  >
    <template #header>
      <div class="vertical-center-container">
        <span class="title-text-lg bi bi-list-ul mr-2"></span>
        <span class="title-text-lg">รายการแผนตีราคา</span>
      </div>
    </template>

    <!-- DataTable -->
    <DataTableWithPaging
      :items="planList"
      :totalRecords="totalRecords"
      :perPage="perPage"
      :columns="columns"
      dataKey="running"
      :scrollHeight="'calc(100vh - 350px)'"
      @page="onPageChange"
      @sort="onSortChange"
      :selectionMode="true"
      selectionType="single"
      v-model:itemsSelection="selectedPlan"
    >
      <!-- Status Template -->
      <template #statusNameTemplate="{ data }">
        <span
          class="badge"
          :class="{
            'badge-warning': data.statusId === 1,
            'badge-success': data.statusId === 2,
            'badge-danger': data.statusId === 3
          }"
        >
          {{ data.statusName }}
        </span>
      </template>

      <!-- Date Template -->
      <template #createDateTemplate="{ data }">
        {{ formatDate(data.createDate) }}
      </template>

      <!-- Update Date Template -->
      <template #updateDateTemplate="{ data }">
        {{ data.updateDate ? formatDate(data.updateDate) : '-' }}
      </template>
    </DataTableWithPaging>

    <template #footer>
      <div class="submit-container">
        <button class="btn btn-secondary btn-sm mr-2" @click="onClose">
          <i class="bi bi-x-circle mr-1"></i>
          ปิด
        </button>
        <button
          class="btn btn-main btn-sm"
          @click="onSelectPlan"
          :disabled="selectedPlan.length === 0"
        >
          <i class="bi bi-check-circle mr-1"></i>
          เลือกแผนนี้
        </button>
      </div>
    </template>
  </Dialog>
</template>

<script>
import Dialog from 'primevue/dialog'
import DataTableWithPaging from '@/components/prime-vue/DataTableWithPaging.vue'
import { usrStockProductApiStore } from '@/stores/modules/api/stock/product-api.js'
import { formatDate } from '@/services/utils/dayjs.js'

export default {
  name: 'StockCostPlanModal',

  components: {
    Dialog,
    DataTableWithPaging
  },

  props: {
    visible: {
      type: Boolean,
      default: false
    },
    stockNumber: {
      type: String,
      default: null
    }
  },

  emits: ['update:visible', 'plan-selected'],

  setup() {
    const productStore = usrStockProductApiStore()
    return { productStore, formatDate }
  },

  data() {
    return {
      planList: [],
      totalRecords: 0,
      perPage: 10,
      skip: 0,
      sort: [],
      selectedPlan: [],

      columns: [
        {
          field: 'running',
          header: 'เลขที่แผน',
          sortable: true,
          width: '150px'
        },
        {
          field: 'stockNumber',
          header: 'เลขที่ผลิต',
          sortable: true,
          width: '150px'
        },
        {
          field: 'statusName',
          header: 'สถานะ',
          sortable: true,
          width: '120px'
        },
        {
          field: 'remark',
          header: 'หมายเหตุ',
          sortable: false,
          width: '200px'
        },
        {
          field: 'createBy',
          header: 'ผู้สร้าง',
          sortable: true,
          width: '120px'
        },
        {
          field: 'createDate',
          header: 'วันที่สร้าง',
          sortable: true,
          width: '150px'
        },
        {
          field: 'updateBy',
          header: 'ผู้แก้ไข',
          sortable: true,
          width: '120px'
        },
        {
          field: 'updateDate',
          header: 'วันที่แก้ไข',
          sortable: true,
          width: '150px'
        }
      ]
    }
  },

  computed: {
    isVisible: {
      get() {
        return this.visible
      },
      set(value) {
        this.$emit('update:visible', value)
      }
    }
  },

  watch: {
    visible(newVal) {
      if (newVal) {
        this.fetchPlans()
      }
    }
  },

  methods: {
    async fetchPlans() {
      try {
        const response = await this.productStore.fetchListStockCostPlan({
          take: this.perPage,
          skip: this.skip,
          sort: this.sort,
          formValue: {
            stockNumber: this.stockNumber || undefined,
            isActive: true,
            statusId: 10 // Pending status (JobStatus.Pending = 10)
          }
        })

        if (response && response.data) {
          this.planList = response.data
          this.totalRecords = response.total
        }
      } catch (error) {
        console.error('Error fetching stock cost plans:', error)
      }
    },

    onPageChange(event) {
      this.skip = event.first
      this.perPage = event.rows
      this.fetchPlans()
    },

    onSortChange(event) {
      this.skip = event.first
      this.perPage = event.rows
      this.sort = event.multiSortMeta || []
      this.fetchPlans()
    },

    onSelectPlan() {
      if (this.selectedPlan.length > 0) {
        this.$emit('plan-selected', this.selectedPlan[0])
        this.onClose()
      }
    },

    onClose() {
      this.selectedPlan = []
      this.$emit('update:visible', false)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';

.badge {
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  font-weight: 500;

  &.badge-warning {
    background-color: #ffc107;
    color: #000;
  }

  &.badge-success {
    background-color: #28a745;
    color: #fff;
  }

  &.badge-danger {
    background-color: #dc3545;
    color: #fff;
  }
}
</style>
