<template>
  <div class="mt-2">
    <BaseDataTable
      :items="goldCostReportStore.dataSearch.data"
      :totalRecords="goldCostReportStore.dataSearch.total"
      :columns="columns"
      :perPage="take"
      dataKey="runningNumber"
      @page="handlePageChange"
      @sort="handleSortChange"
    >
      <template #bookNoTemplate="{ data }">
        <div>{{ data.bookNo }}-{{ data.no }}</div>
      </template>

      <template #goldCodeTemplate="{ data }">
        <div>{{ data.goldCode }} - {{ data.goldName }}</div>
      </template>

      <template #footer>
        <div>{{ $t('view.production.goldCostReport.totalRecords', { total: goldCostReportStore.dataSearch.total }) }}</div>
      </template>
    </BaseDataTable>
  </div>
</template>

<script>
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import dataTablePaging from '@/composables/useDataTablePaging.js'

import { useGoldCostReportApiStore } from '@/stores/modules/api/production/gold-cost-report-api.js'

export default {
  name: 'GoldCostReportDataTableView',

  mixins: [dataTablePaging],

  components: {
    BaseDataTable
  },

  setup() {
    const goldCostReportStore = useGoldCostReportApiStore()
    return { goldCostReportStore }
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
          field: 'assignDate',
          header: this.$t('view.production.goldCostReport.colAssignDate'),
          sortable: true,
          minWidth: '130px',
          format: 'date'
        },
        {
          field: 'bookNo',
          header: this.$t('view.production.goldCostReport.colBookNo'),
          sortable: true,
          minWidth: '130px',
          bodyTemplate: 'bookNoTemplate'
        },
        {
          field: 'runningNumber',
          header: this.$t('view.production.goldCostReport.colRunningNumber'),
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'goldCode',
          header: this.$t('view.production.goldCostReport.colGold'),
          sortable: true,
          minWidth: '160px',
          bodyTemplate: 'goldCodeTemplate'
        },
        {
          field: 'goldSizeName',
          header: this.$t('view.production.goldCostReport.colGoldSizeName'),
          sortable: true,
          minWidth: '110px'
        },
        {
          field: 'goldReceipt',
          header: this.$t('view.production.goldCostReport.colGoldReceipt'),
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'meltWeight',
          header: this.$t('view.production.goldCostReport.colMeltWeight'),
          sortable: true,
          minWidth: '120px',
          align: 'right',
          format: 'decimal2'
        },
        {
          field: 'castWeight',
          header: this.$t('view.production.goldCostReport.colCastWeight'),
          sortable: true,
          minWidth: '120px',
          align: 'right',
          format: 'decimal2'
        },
        {
          field: 'meltWeightLoss',
          header: this.$t('view.production.goldCostReport.colMeltWeightLoss'),
          sortable: true,
          minWidth: '120px',
          align: 'right',
          format: 'decimal2'
        },
        {
          field: 'castWeightLoss',
          header: this.$t('view.production.goldCostReport.colCastWeightLoss'),
          sortable: true,
          minWidth: '120px',
          align: 'right',
          format: 'decimal2'
        },
        {
          field: 'assignBy',
          header: this.$t('view.production.goldCostReport.colAssignBy'),
          sortable: true,
          minWidth: '140px'
        },
        {
          field: 'receiveBy',
          header: this.$t('view.production.goldCostReport.colReceiveBy'),
          sortable: true,
          minWidth: '140px'
        },
        {
          field: 'remark',
          header: this.$t('common.field.remark'),
          sortable: false,
          minWidth: '150px'
        }
      ]
    }
  },

  watch: {
    async modelForm() {
      this.resetPaging()
    },
    async modelFormExport() {
      await this.goldCostReportStore.fetchReportExport({
        sort: this.sort,
        formValue: this.modelFormExport
      })
    }
  },

  methods: {
    async fetchData() {
      await this.goldCostReportStore.fetchReport({
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
