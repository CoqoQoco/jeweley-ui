<template>
  <div class="mt-2">
    <BaseDataTable
      :items="goldLossSlipByWorkerStore.dataSearch.data"
      :totalRecords="goldLossSlipByWorkerStore.dataSearch.total"
      :columns="columns"
      :perPage="take"
      dataKey="workerCode"
      @page="handlePageChange"
      @sort="handleSortChange"
    >
      <template #monthTemplate="{ data }">
        {{ formatMonth(data) }}
      </template>

      <template #footer>
        <div>{{ $t('view.production.goldLossSlipByWorker.totalWorkers', { total: goldLossSlipByWorkerStore.dataSearch.total }) }}</div>
      </template>
    </BaseDataTable>
  </div>
</template>

<script>
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import dataTablePaging from '@/composables/useDataTablePaging.js'
import { formatYearMonth } from '@/services/utils/dayjs.js'

import { useGoldLossSlipByWorkerApiStore } from '@/stores/modules/api/production/gold-loss-slip-by-worker-api.js'

export default {
  name: 'GoldLossSlipByWorkerReportDataTableView',

  mixins: [dataTablePaging],

  components: {
    BaseDataTable
  },

  setup() {
    const goldLossSlipByWorkerStore = useGoldLossSlipByWorkerApiStore()
    return { goldLossSlipByWorkerStore }
  },

  props: {
    modelForm: {
      type: Object,
      default: () => ({})
    },
    modelFormExport: {
      type: Object,
      default: () => ({})
    }
  },

  computed: {
    columns() {
      const cols = [
        {
          field: 'workerCode',
          header: this.$t('view.production.goldLossSlipByWorker.colWorkerCode'),
          sortable: true,
          minWidth: '140px'
        },
        {
          field: 'workerName',
          header: this.$t('view.production.goldLossSlipByWorker.colWorkerName'),
          sortable: true,
          minWidth: '180px'
        }
      ]

      if (this.modelForm.groupByMonth) {
        cols.push({
          field: 'month',
          header: this.$t('view.production.goldLossSlipByWorker.colMonth'),
          sortable: false,
          minWidth: '110px'
        })
      }

      cols.push(
        {
          field: 'slipCount',
          header: this.$t('view.production.goldLossSlipByWorker.colSlipCount'),
          sortable: true,
          minWidth: '110px',
          align: 'right'
        },
        {
          field: 'totalWeightSend',
          header: this.$t('view.production.goldLossSlipByWorker.colTotalWeightSend'),
          sortable: true,
          minWidth: '130px',
          align: 'right',
          format: 'decimal2'
        },
        {
          field: 'totalWeightCheck',
          header: this.$t('view.production.goldLossSlipByWorker.colTotalWeightCheck'),
          sortable: true,
          minWidth: '130px',
          align: 'right',
          format: 'decimal2'
        },
        {
          field: 'totalWeightLossAllowed',
          header: this.$t('view.production.goldLossSlipByWorker.colTotalWeightLossAllowed'),
          sortable: true,
          minWidth: '130px',
          align: 'right',
          format: 'decimal2'
        },
        {
          field: 'totalWeightLossActual',
          header: this.$t('view.production.goldLossSlipByWorker.colTotalWeightLossActual'),
          sortable: true,
          minWidth: '130px',
          align: 'right',
          format: 'decimal2'
        },
        {
          field: 'totalMoneyDiff',
          header: this.$t('view.production.goldLossSlipByWorker.colTotalMoneyDiff'),
          sortable: true,
          minWidth: '140px',
          align: 'right',
          format: 'decimal2'
        },
        {
          field: 'totalGoldReturnAmount',
          header: this.$t('view.production.goldLossSlipByWorker.colTotalGoldReturnAmount'),
          sortable: true,
          minWidth: '150px',
          align: 'right',
          format: 'decimal2'
        }
      )

      return cols
    }
  },

  watch: {
    async modelForm() {
      this.resetPaging()
    },
    async modelFormExport() {
      await this.goldLossSlipByWorkerStore.fetchReportExport({
        sort: this.sort,
        formValue: this.modelFormExport
      })
    }
  },

  methods: {
    formatMonth(data) {
      return formatYearMonth(data.year, data.month)
    },

    async fetchData() {
      await this.goldLossSlipByWorkerStore.fetchReport({
        take: this.take,
        skip: this.skip,
        sort: this.sort,
        formValue: this.modelForm
      })
    }
  },

  created() {
    this.fetchData()
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-data-table';
</style>
