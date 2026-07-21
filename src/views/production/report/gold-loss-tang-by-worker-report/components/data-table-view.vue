<template>
  <div class="mt-2">
    <BaseDataTable
      :items="goldLossTangByWorkerStore.dataSearch.data"
      :totalRecords="goldLossTangByWorkerStore.dataSearch.total"
      :columns="columns"
      :perPage="take"
      dataKey="workerCode"
      @page="handlePageChange"
      @sort="handleSortChange"
    >
      <template #footer>
        <div>{{ $t('view.production.goldLossTangByWorker.totalWorkers', { total: goldLossTangByWorkerStore.dataSearch.total }) }}</div>
      </template>
    </BaseDataTable>
  </div>
</template>

<script>
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import dataTablePaging from '@/composables/useDataTablePaging.js'

import { useGoldLossTangByWorkerApiStore } from '@/stores/modules/api/production/gold-loss-tang-by-worker-api.js'

export default {
  name: 'GoldLossTangByWorkerReportDataTableView',

  mixins: [dataTablePaging],

  components: {
    BaseDataTable
  },

  setup() {
    const goldLossTangByWorkerStore = useGoldLossTangByWorkerApiStore()
    return { goldLossTangByWorkerStore }
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
      return [
        {
          field: 'workerCode',
          header: this.$t('view.production.goldLossTangByWorker.colWorkerCode'),
          sortable: true,
          minWidth: '140px'
        },
        {
          field: 'workerName',
          header: this.$t('view.production.goldLossTangByWorker.colWorkerName'),
          sortable: true,
          minWidth: '180px'
        },
        {
          field: 'slipCount',
          header: this.$t('view.production.goldLossTangByWorker.colSlipCount'),
          sortable: true,
          minWidth: '110px',
          align: 'right'
        },
        {
          field: 'totalIssued',
          header: this.$t('view.production.goldLossTangByWorker.colTotalIssued'),
          sortable: true,
          minWidth: '130px',
          align: 'right',
          format: 'decimal2'
        },
        {
          field: 'totalReturned',
          header: this.$t('view.production.goldLossTangByWorker.colTotalReturned'),
          sortable: true,
          minWidth: '130px',
          align: 'right',
          format: 'decimal2'
        },
        {
          field: 'totalRawLoss',
          header: this.$t('view.production.goldLossTangByWorker.colTotalRawLoss'),
          sortable: true,
          minWidth: '130px',
          align: 'right',
          format: 'decimal2'
        },
        {
          field: 'totalAllowedLoss',
          header: this.$t('view.production.goldLossTangByWorker.colTotalAllowedLoss'),
          sortable: true,
          minWidth: '130px',
          align: 'right',
          format: 'decimal2'
        },
        {
          field: 'totalDiffLoss',
          header: this.$t('view.production.goldLossTangByWorker.colTotalDiffLoss'),
          sortable: true,
          minWidth: '130px',
          align: 'right',
          format: 'decimal2'
        },
        {
          field: 'totalMoneyDiff',
          header: this.$t('view.production.goldLossTangByWorker.colTotalMoneyDiff'),
          sortable: true,
          minWidth: '140px',
          align: 'right',
          format: 'decimal2'
        }
      ]
    }
  },

  watch: {
    async modelForm() {
      this.resetPaging()
    },
    async modelFormExport() {
      await this.goldLossTangByWorkerStore.fetchReportExport({
        sort: this.sort,
        formValue: this.modelFormExport
      })
    }
  },

  methods: {
    async fetchData() {
      await this.goldLossTangByWorkerStore.fetchReport({
        take: this.take,
        skip: this.skip,
        sort: this.sort,
        formValue: this.modelForm
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-data-table';
</style>
