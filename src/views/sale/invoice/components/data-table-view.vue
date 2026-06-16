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
          <button class="btn btn-sm btn-green" :title="$t('common.field.action')" @click="onView(data)">
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
// External dependencies
import { useInvoiceApiStore } from '@/stores/modules/api/sale/invoice-store.js'
import { formatDate, formatDateTime } from '@/services/utils/dayjs.js'
import dataTablePaging from '@/composables/useDataTablePaging.js'

// Local components
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'

export default {
  name: 'InvoiceListDataTableView',

  components: {
    BaseDataTable
  },

  mixins: [dataTablePaging],

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

  computed: {
    form() {
      return this.modelForm || {}
    },

    columns() {
      return [
        {
          field: 'action',
          header: '',
          width: '50px',
          sortable: false
        },
        {
          field: 'invoiceNumber',
          header: this.$t('view.sale.invoice.invoiceNumber'),
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'customerCode',
          header: this.$t('view.sale.invoice.customerCode'),
          sortable: true,
          minWidth: '120px'
        },
        {
          field: 'customerName',
          header: this.$t('view.sale.invoice.customerName'),
          sortable: true,
          minWidth: '180px'
        },
        {
          field: 'status',
          header: this.$t('view.sale.invoice.status'),
          sortable: true,
          minWidth: '100px',
          template: 'statusTemplate'
        },
        {
          field: 'createDate',
          header: this.$t('view.sale.invoice.createDate'),
          sortable: true,
          minWidth: '140px',
          template: 'createDateTemplate'
        },
        {
          field: 'createBy',
          header: this.$t('view.sale.invoice.createBy'),
          sortable: true,
          minWidth: '120px'
        },
        {
          field: 'deliveryDate',
          header: this.$t('view.sale.invoice.deliveryDate'),
          sortable: true,
          minWidth: '140px',
          template: 'deliveryDateTemplate'
        },
        {
          field: 'remark',
          header: this.$t('view.sale.invoice.remark'),
          sortable: true,
          minWidth: '150px'
        }
      ]
    }
  },

  watch: {
    async modelForm() {
      this.resetPaging()
    }
  },

  methods: {
    onView(data) {
      this.$router.push({
        path: '/invoice-detail',
        query: { invoiceNumber: data.invoiceNumber }
      })
    },

    getStatusBadgeClass(status) {
      const statusClasses = {
        1: 'badge badge-status-pending',
        2: 'badge badge-status-info',
        3: 'badge badge-status-success',
        4: 'badge badge-status-danger'
      }
      return statusClasses[status] || 'badge badge-status-default'
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
  padding: var(--sp-xs) var(--sp-sm);
  font-size: var(--fs-sm);
  border-radius: var(--radius-sm);
}

.badge-status-success {
  background-color: var(--base-green);
  color: white;
}

.badge-status-pending {
  background-color: var(--base-warning);
  color: #212529;
}

.badge-status-info {
  background-color: #17a2b8;
  color: white;
}

.badge-status-danger {
  background-color: var(--base-red);
  color: white;
}

.badge-status-default {
  background-color: #6c757d;
  color: white;
}
</style>
