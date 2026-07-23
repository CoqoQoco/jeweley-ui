<template>
  <div class="mt-2">
    <BaseDataTable
      :items="reportProductionWagesStore.dataSearch.data"
      :totalRecords="reportProductionWagesStore.dataSearch.total"
      :columns="columns"
      :perPage="take"
      dataKey="id"
      @page="handlePageChange"
      @sort="handleSortChange"
    >
      <template #woTemplate="{ data }">
        {{ `${data.wo}-${data.woNumber}` }}
      </template>
      <template #workerCodeTemplate="{ data }">
        {{ `${data.workerCode}-${data.workerName}` }}
      </template>
      <template #goldTemplate="{ data }">
        {{ `${data.gold} ${data.description ? `[${data.description}]` : ''}` }}
      </template>

      <template #footer>
        <div class="summary-footer">
          <span><strong>{{ $t('view.production.reportProductionWages.totalAll') }}</strong></span>
          <span>{{ $t('view.production.reportProductionWages.qtySend') }}: <strong>{{ reportProductionWagesStore.summary.totalGoldQtySend || 0 }}</strong></span>
          <span>{{ $t('view.production.reportProductionWages.weightSend') }}: <strong>{{ reportProductionWagesStore.summary.totalGoldWeightSend || 0 }}</strong></span>
          <span>{{ $t('view.production.reportProductionWages.qtyCheck') }}: <strong>{{ reportProductionWagesStore.summary.totalGoldQtyCheck || 0 }}</strong></span>
          <span>{{ $t('view.production.reportProductionWages.weightCheck') }}: <strong>{{ reportProductionWagesStore.summary.totalGoldWeightCheck || 0 }}</strong></span>
          <span>{{ $t('view.production.reportProductionWages.price') }}: <strong>{{ formatDecimal2(reportProductionWagesStore.summary.totalWages) }}</strong></span>
        </div>
      </template>
    </BaseDataTable>
  </div>
</template>

<script>
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import dataTablePaging from '@/composables/useDataTablePaging.js'

import { useReportProductionWagesApiStore } from '@/stores/modules/api/production/report-production-wages-api.js'

export default {
  name: 'ReportProductionWagesDataTableView',

  mixins: [dataTablePaging],

  components: {
    BaseDataTable
  },

  setup() {
    const reportProductionWagesStore = useReportProductionWagesApiStore()
    return { reportProductionWagesStore }
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
        { field: 'wo', header: this.$t('view.production.reportProductionWages.colWo'), minWidth: '150px' },
        { field: 'jobDate', header: this.$t('view.production.reportProductionWages.colJobDate'), minWidth: '150px', format: 'date' },
        { field: 'productNumber', header: this.$t('view.production.reportProductionWages.colProductNumber'), minWidth: '150px' },
        { field: 'workerCode', header: this.$t('view.production.reportProductionWages.colWorker'), minWidth: '150px' },
        { field: 'statusName', header: this.$t('view.production.reportProductionWages.colDepartment'), minWidth: '150px' },
        { field: 'gold', header: this.$t('view.production.reportProductionWages.colGoldDetail'), minWidth: '150px' },
        { field: 'goldSize', header: this.$t('view.production.reportProductionWages.colGoldColor'), minWidth: '120px' },
        { field: 'goldQtySend', header: this.$t('view.production.reportProductionWages.colQtySend'), minWidth: '120px', align: 'right' },
        { field: 'goldWeightSend', header: this.$t('view.production.reportProductionWages.colWeightSend'), minWidth: '120px', align: 'right' },
        { field: 'goldQtyCheck', header: this.$t('view.production.reportProductionWages.colQtyCheck'), minWidth: '120px', align: 'right' },
        { field: 'goldWeightCheck', header: this.$t('view.production.reportProductionWages.colWeightCheck'), minWidth: '120px', align: 'right' },
        { field: 'wages', header: this.$t('view.production.reportProductionWages.colWagesUnit'), minWidth: '120px', format: 'decimal2', align: 'right' },
        { field: 'totalWages', header: this.$t('view.production.reportProductionWages.colTotalWages'), minWidth: '120px', format: 'decimal2', align: 'right' }
      ]
    }
  },

  watch: {
    async modelForm() {
      this.resetPaging()
    },
    async modelFormExport() {
      await this.reportProductionWagesStore.fetchReportExport({ formValue: this.modelFormExport })
    }
  },

  methods: {
    formatDecimal2(val) {
      return Number(val || 0).toFixed(2)
    },

    async fetchData() {
      await Promise.all([
        this.reportProductionWagesStore.fetchReport({
          take: this.take,
          skip: this.skip,
          sort: this.sort,
          formValue: this.modelForm
        }),
        this.reportProductionWagesStore.fetchSummary({ formValue: this.modelForm })
      ])
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-data-table';

.summary-footer {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-lg);
  padding: var(--sp-sm) var(--sp-md);
  font-size: var(--fs-base);
  background: var(--color-highlight-bg);
  border-top: 1px solid var(--color-border);
}
</style>
