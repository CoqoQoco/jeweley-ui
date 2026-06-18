<template>
  <div class="mt-2">
    <!-- @view="viewplan" -->
    <div class="filter-container-highlight">
      <span class="title-text-lg-bg">{{
        $t('view.receiptStock.product.productionReceiptList.planCount', { count: receiptProductionStore.dataListPlan.total ?? 0 })
      }}</span>
    </div>
    <BaseDataTable
      :items="receiptProductionStore.dataListPlan.data"
      :totalRecords="receiptProductionStore.dataListPlan.total"
      :columns="columns"
      :perPage="take"
      :scrollHeight="'calc(100vh - 340px)'"
      @page="handlePageChange"
      @sort="handleSortChange"
    >
      <template #actionTemplate="{ data }">
        <div class="vertical-center-container">
          <button class="btn btn-sm btn-main" @click="receipt(data)" :title="$t('view.receiptStock.product.productionReceiptList.btnReceive')">
            <span><i class="bi bi-receipt"></i></span>
          </button>
          <div class="ml-2 status-box" :class="getStatusSeverity(data.isRunning)">
            {{ getStatusName(data.isRunning) }}
          </div>
        </div>
      </template>

      <!-- WO Column -->
      <template #woTextTemplate="{ data }">
        {{ `${data.wo}-${data.woNumber}` }}
      </template>

      <template #productQtyTemplate="{ data }">
        <div class="d-flex justify-content-end p-1">
          <span>{{ data.qtyRunning }}</span>
          <span>/</span>
          <span>{{ data.productQty }}</span>
        </div>
      </template>

      <!-- Custom Expansion Template -->
      <template #expansion="slotProps">
        <div class="p-1">
          <dataExpand :modelForm="slotProps"></dataExpand>
        </div>
      </template>
    </BaseDataTable>
  </div>
</template>

<script>
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import dataTablePaging from '@/composables/useDataTablePaging.js'

import { useReceiptProductionApiStore } from '@/stores/modules/api/receipt/receipt-production-api.js'
import { formatDate, formatDateTime } from '@/services/utils/dayjs.js'

import dataExpand from './data-expand-view.vue'

export default {
  name: 'ProductionPlanList',

  components: {
    BaseDataTable,
    dataExpand
  },

  mixins: [dataTablePaging],

  props: {
    modelForm: {
      type: Object,
      default: () => ({}), // ให้ default เป็น empty object แทน
      required: true
    },
    modelFormExport: {
      type: Object,
      default: () => ({})
    }
  },

  data() {
    return {
      expandedRows: []
    }
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
          minWidth: '50px',
          sortable: false
        },
        {
          field: 'woText',
          header: this.$t('view.receiptStock.product.productionReceiptList.wo'),
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'productQty',
          header: this.$t('view.receiptStock.product.productionReceiptList.productQty'),
          sortable: true,
          minWidth: '100px'
        },
        {
          field: 'receiptNumber',
          header: this.$t('view.receiptStock.product.productionReceiptList.receiptNumber'),
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'receiptDate',
          header: this.$t('view.receiptStock.product.productionReceiptList.receiptDateCol'),
          sortable: true,
          minWidth: '150px',
          format: 'datetime'
        },
        {
          field: 'mold',
          header: this.$t('view.receiptStock.product.productionReceiptList.mold'),
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'productNumber',
          header: this.$t('view.receiptStock.product.productionReceiptList.productNumber'),
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'productTypeName',
          header: this.$t('view.receiptStock.product.productionReceiptList.productTypeName'),
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'gold',
          header: this.$t('view.receiptStock.product.productionReceiptList.gold'),
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'goldSize',
          header: this.$t('view.receiptStock.product.productionReceiptList.goldSizeCol'),
          sortable: true,
          minWidth: '150px'
        }
      ]
    }
  },

  setup() {
    const receiptProductionStore = useReceiptProductionApiStore()
    return { receiptProductionStore }
  },

  watch: {
    async modelForm() {
      //console.log(this.modelForm)
      this.take = 10
      this.skip = 0
      await this.fetchData()
    },
    async modelFormExport() {
      //console.log(this.modelForm)
      await this.fetchDataExport()
    }
  },

  methods: {
    async fetchData() {
      await this.receiptProductionStore.fetchDataListPlan({
        take: this.take,
        skip: this.skip,
        sort: this.sort,
        formValue: this.form
      })
    },
    // async fetchDataExport() {
    //   console.log('fetchDataExport')
    //   await this.stockProductStore.fetchDataSearchExport({
    //     sort: this.sort,
    //     form: this.form
    //   })
    // },

    receipt(data) {
      this.$router.push({ name: 'goods-receipt-production', params: { id: data.receiptNumber } })
    },

    // handle page
    formatDateTime(date) {
      return date ? formatDateTime(date) : ''
    },
    formatDate(date) {
      return formatDate(date)
    },
    getStatusSeverity(isRunning) {
      switch (isRunning) {
        case true:
          return 'box-status-show'
        case false:
          return 'box-status-process'
      }
    },
    getStatusName(isRunning) {
      switch (isRunning) {
        case true:
          return this.$t('view.receiptStock.product.productionReceiptList.receiving')
        case false:
          return this.$t('view.receiptStock.product.productionReceiptList.waitingReceipt')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-data-table';
@import '@/assets/scss/custom-style/standard-form';

.status-box {
  min-width: 120px;
}

.notification {
  display: inline-flex;
  align-items: center;
  //background-color: #ffe6e6; /* ส้มอ่อน */
  //padding: 4px 8px;
  //border-radius: 4px;
}

.overdue-tag {
  background-color: #ff4d4d; /* สีแดง */
  color: white;
  padding: 2px 4px;
  border-radius: 2px;
  margin-left: 4px;
  font-size: 12px;
}
</style>
