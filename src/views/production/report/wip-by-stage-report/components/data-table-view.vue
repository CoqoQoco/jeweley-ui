<template>
  <div class="mt-2">
    <BaseDataTable
      :items="wipReportStore.dataSearch.data"
      :totalRecords="wipReportStore.dataSearch.total"
      :columns="columns"
      :perPage="take"
      dataKey="woText"
      @page="handlePageChange"
      @sort="handleSortChange"
    >
      <template #wagesStatusTemplate="{ data }">
        <span :class="['wages-badge', data.wagesStatus === 100 ? 'wages-badge-paid' : 'wages-badge-pending']">
          {{ data.wagesStatus === 100 ? $t('view.production.wipByStageReport.wagesStatusPaid') : $t('view.production.wipByStageReport.wagesStatusPending') }}
        </span>
      </template>

      <template #footer>
        <div>{{ $t('view.production.wipByStageReport.totalRecords', { total: wipReportStore.dataSearch.total }) }}</div>
      </template>
    </BaseDataTable>
  </div>
</template>

<script>
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import dataTablePaging from '@/composables/useDataTablePaging.js'

import { useWipReportApiStore } from '@/stores/modules/api/production/wip-report-api.js'

export default {
  name: 'WipByStageReportDataTableView',

  mixins: [dataTablePaging],

  components: {
    BaseDataTable
  },

  setup() {
    const wipReportStore = useWipReportApiStore()
    return { wipReportStore }
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
          field: 'receiveWorkDate',
          header: this.$t('view.production.wipByStageReport.colReceiveWorkDate'),
          sortable: true,
          minWidth: '130px',
          format: 'date'
        },
        {
          field: 'woText',
          header: this.$t('view.production.wipByStageReport.colWoText'),
          sortable: true,
          minWidth: '140px'
        },
        {
          field: 'productNumber',
          header: this.$t('view.production.wipByStageReport.colProductNumber'),
          sortable: true,
          minWidth: '140px'
        },
        {
          field: 'productName',
          header: this.$t('view.production.wipByStageReport.colProductName'),
          sortable: true,
          minWidth: '160px'
        },
        {
          field: 'mold',
          header: this.$t('view.production.wipByStageReport.colMold'),
          sortable: true,
          minWidth: '130px'
        },
        {
          field: 'typeStatusName',
          header: this.$t('view.production.wipByStageReport.colDept'),
          sortable: true,
          minWidth: '130px'
        },
        {
          field: 'workerName',
          header: this.$t('view.production.wipByStageReport.colWorker'),
          sortable: true,
          minWidth: '140px'
        },
        {
          field: 'gold',
          header: this.$t('view.production.wipByStageReport.colGold'),
          sortable: true,
          minWidth: '110px'
        },
        {
          field: 'goldWeightSend',
          header: this.$t('view.production.wipByStageReport.colGoldWeightSend'),
          sortable: true,
          minWidth: '120px',
          align: 'right',
          format: 'decimal2'
        },
        {
          field: 'goldWeightCheck',
          header: this.$t('view.production.wipByStageReport.colGoldWeightCheck'),
          sortable: true,
          minWidth: '120px',
          align: 'right',
          format: 'decimal2'
        },
        {
          field: 'totalWages',
          header: this.$t('view.production.wipByStageReport.colTotalWages'),
          sortable: true,
          minWidth: '120px',
          align: 'right',
          format: 'decimal2'
        },
        {
          field: 'wagesStatus',
          header: this.$t('view.production.wipByStageReport.colWagesStatus'),
          sortable: true,
          minWidth: '130px',
          align: 'center'
        }
      ]
    }
  },

  watch: {
    async modelForm() {
      this.resetPaging()
    },
    async modelFormExport() {
      await this.wipReportStore.fetchReportExport({
        sort: this.sort,
        formValue: this.modelFormExport
      })
    }
  },

  methods: {
    async fetchData() {
      await this.wipReportStore.fetchReport({
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

.wages-badge {
  display: inline-block;
  padding: var(--sp-xs) var(--sp-sm);
  border-radius: var(--radius-sm);
  font-size: var(--fs-sm);
  font-weight: 600;
  color: #ffffff;
}

.wages-badge-paid {
  background-color: var(--base-green);
}

.wages-badge-pending {
  background-color: var(--base-warning);
  color: var(--base-font-color);
}
</style>
