<template>
  <div class="mt-2">
    <BaseDataTable
      :items="billingNoteStore.dataList.data"
      :totalRecords="billingNoteStore.dataList.total"
      dataKey="running"
      :columns="columns"
      :perPage="take"
      :scrollHeight="'calc(100vh - 360px)'"
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

      <template #documentDateTemplate="{ data }">
        <div>{{ formatDate(data.documentDate) }}</div>
      </template>

      <template #subTotalTemplate="{ data }">
        <div class="text-right">{{ formatNumber(data.subTotal) }}</div>
      </template>

      <template #vatAmountTemplate="{ data }">
        <div class="text-right">{{ formatNumber(data.vatAmount) }}</div>
      </template>

      <template #grandTotalTemplate="{ data }">
        <div class="text-right">{{ formatNumber(data.grandTotal) }}</div>
      </template>

      <template #statusTemplate="{ data }">
        <div class="status-container">
          <span class="badge badge-status-default">{{ data.statusName }}</span>
        </div>
      </template>

      <template #createDateTemplate="{ data }">
        <div>{{ formatDateTime(data.createDate) }}</div>
      </template>
    </BaseDataTable>
  </div>
</template>

<script>
// External dependencies
import { useBillingNoteApiStore } from '@/stores/modules/api/sale/billing-note-store.js'
import { formatDate, formatDateTime } from '@/services/utils/dayjs.js'
import { formatNumber } from '@/services/utils/decimal.js'
import dataTablePaging from '@/composables/useDataTablePaging.js'

// Local components
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'

export default {
  name: 'BillingNoteListDataTableView',

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
    const billingNoteStore = useBillingNoteApiStore()
    return { billingNoteStore }
  },

  computed: {
    form() {
      return this.modelForm || {}
    },

    columns() {
      return [
        { field: 'action', header: '', width: '50px', sortable: false },
        { field: 'running', header: this.$t('view.sale.billingNote.running'), sortable: true, minWidth: '150px' },
        { field: 'documentDate', header: this.$t('view.sale.billingNote.documentDate'), sortable: true, minWidth: '120px', template: 'documentDateTemplate' },
        { field: 'customerCode', header: this.$t('view.sale.billingNote.customerCode'), sortable: true, minWidth: '120px' },
        { field: 'customerName', header: this.$t('view.sale.billingNote.customerName'), sortable: true, minWidth: '180px' },
        { field: 'billCount', header: this.$t('view.sale.billingNote.billCount'), sortable: true, minWidth: '100px', align: 'right' },
        { field: 'subTotal', header: this.$t('view.sale.billingNote.subTotal'), sortable: true, minWidth: '120px', template: 'subTotalTemplate' },
        { field: 'vatAmount', header: this.$t('view.sale.billingNote.vatAmount'), sortable: true, minWidth: '120px', template: 'vatAmountTemplate' },
        { field: 'grandTotal', header: this.$t('view.sale.billingNote.grandTotal'), sortable: true, minWidth: '130px', template: 'grandTotalTemplate' },
        { field: 'status', header: this.$t('view.sale.billingNote.status'), sortable: true, minWidth: '100px', template: 'statusTemplate' },
        { field: 'createDate', header: this.$t('view.sale.billingNote.createDate'), sortable: true, minWidth: '140px', template: 'createDateTemplate' },
        { field: 'createBy', header: this.$t('view.sale.billingNote.createBy'), sortable: true, minWidth: '120px' }
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
      this.$router.push({ name: 'sale-billing-note-detail', params: { running: data.running } })
    },

    async fetchData() {
      await this.billingNoteStore.fetchList({
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
    },

    formatNumber(val) {
      return formatNumber(val, 2)
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

.badge-status-default {
  background-color: var(--base-green);
  color: white;
}
</style>
