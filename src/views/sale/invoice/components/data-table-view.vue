<template>
  <div class="mt-2">
    <BaseDataTable
      :items="invoiceStore.dataList.data"
      :totalRecords="invoiceStore.dataList.total"
      dataKey="invoiceNumber"
      :columns="columns"
      :perPage="take"
      :scrollHeight="'calc(100vh - 340px)'"
      class="base-data-table"
      @page="handlePageChange"
      @sort="handleSortChange"
    >
      <template #actionTemplate="{ data }">
        <div class="btn-action-container">
          <button class="btn btn-sm btn-green" title="ดูรายละเอียด" @click="onView(data)">
            <i class="bi bi-eye"></i>
          </button>
        </div>
      </template>

      <template #statusTemplate="{ data }">
        <div class="status-container">
          <span :class="getStatusBadgeClass(data.status)">{{ data.statusName }}</span>
        </div>
      </template>

      <template #createDateTemplate="{ data }">
        <div>
          {{ formatDateTime(data.createDate) }}
        </div>
      </template>

      <template #deliveryDateTemplate="{ data }">
        <div>
          {{ formatDate(data.deliveryDate) }}
        </div>
      </template>
    </BaseDataTable>
  </div>
</template>

<script>
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import { useInvoiceApiStore } from '@/stores/modules/api/sale/invoice-store.js'
import { formatDate, formatDateTime } from '@/services/utils/dayjs.js'

export default {
  name: 'InvoiceListDataTableView',

  components: {
    BaseDataTable
  },

  props: {
    modelForm: {
      type: Object,
      default: () => ({}),
      required: true
    }
  },

  setup() {
    const invoiceStore = useInvoiceApiStore()
    return { invoiceStore }
  },

  data() {
    return {
      take: 10,
      skip: 0,
      sort: [],

      columns: [
        {
          field: 'action',
          header: '',
          width: '50px',
          sortable: false
        },
        {
          field: 'invoiceNumber',
          header: 'เลขที่ Invoice',
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'customerCode',
          header: 'รหัสลูกค้า',
          sortable: true,
          minWidth: '120px'
        },
        {
          field: 'customerName',
          header: 'ชื่อลูกค้า',
          sortable: true,
          minWidth: '180px'
        },
        {
          field: 'status',
          header: 'สถานะ',
          sortable: true,
          minWidth: '100px',
          template: 'statusTemplate'
        },
        {
          field: 'createDate',
          header: 'วันที่สร้าง',
          sortable: true,
          minWidth: '140px',
          template: 'createDateTemplate'
        },
        {
          field: 'createBy',
          header: 'ผู้สร้าง',
          sortable: true,
          minWidth: '120px'
        },
        {
          field: 'deliveryDate',
          header: 'วันที่จัดส่ง',
          sortable: true,
          minWidth: '140px',
          template: 'deliveryDateTemplate'
        },
        {
          field: 'remark',
          header: 'หมายเหตุ',
          sortable: true,
          minWidth: '150px'
        }
      ]
    }
  },

  computed: {
    form() {
      return this.modelForm || {}
    }
  },

  watch: {
    async modelForm() {
      this.take = 10
      this.skip = 0
      await this.fetchData()
    }
  },

  methods: {
    handlePageChange(e) {
      this.skip = e.first
      this.take = e.rows
      this.fetchData()
    },

    handleSortChange(e) {
      this.skip = e.first
      this.take = e.rows
      this.sort = e.multiSortMeta.map((item) => ({
        field: item.field,
        dir: item.order === 1 ? 'asc' : 'desc'
      }))
      this.fetchData()
    },

    onView(data) {
      this.$router.push({
        path: '/invoice-detail',
        query: { invoiceNumber: data.invoiceNumber }
      })
    },

    getStatusBadgeClass(status) {
      const statusClasses = {
        1: 'badge badge-warning',
        2: 'badge badge-info',
        3: 'badge badge-success',
        4: 'badge badge-danger'
      }
      return statusClasses[status] || 'badge badge-secondary'
    },

    async fetchData() {
      await this.invoiceStore.fetchList({
        take: this.take,
        skip: this.skip,
        sort: this.sort,
        formValue: this.form
      })
    },

    formatDateTime(date) {
      return date ? formatDateTime(date) : ''
    },

    formatDate(date) {
      return date ? formatDate(date) : ''
    }
  },

  async mounted() {
    await this.fetchData()
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-data-table';
@import '@/assets/scss/custom-style/standard-form';

.btn-action-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.status-container {
  text-align: center;
}

.badge {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  border-radius: 0.25rem;
}

.badge-success {
  background-color: #28a745;
  color: white;
}

.badge-warning {
  background-color: #ffc107;
  color: #212529;
}

.badge-info {
  background-color: #17a2b8;
  color: white;
}

.badge-danger {
  background-color: #dc3545;
  color: white;
}

.badge-secondary {
  background-color: #6c757d;
  color: white;
}
</style>
