<template>
  <div class="mt-2">
    <BaseDataTable
      :items="workerWagesByPersonStore.dataSearch.data"
      :totalRecords="workerWagesByPersonStore.dataSearch.total"
      :columns="columns"
      :perPage="take"
      dataKey="workerCode"
      @page="handlePageChange"
      @sort="handleSortChange"
    >
      <template #footer>
        <div>{{ $t('view.production.workerWagesByPerson.totalWorkers', { total: workerWagesByPersonStore.dataSearch.total }) }}</div>
      </template>
    </BaseDataTable>
  </div>
</template>

<script>
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import dataTablePaging from '@/composables/useDataTablePaging.js'

import { useWorkerWagesByPersonApiStore } from '@/stores/modules/api/production/worker-wages-by-person-api.js'

export default {
  name: 'WorkerWagesByPersonReportDataTableView',

  mixins: [dataTablePaging],

  components: {
    BaseDataTable
  },

  setup() {
    const workerWagesByPersonStore = useWorkerWagesByPersonApiStore()
    return { workerWagesByPersonStore }
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
          header: this.$t('view.production.workerWagesByPerson.colWorkerCode'),
          sortable: true,
          minWidth: '140px'
        },
        {
          field: 'workerName',
          header: this.$t('view.production.workerWagesByPerson.colWorkerName'),
          sortable: true,
          minWidth: '180px'
        },
        {
          field: 'jobCount',
          header: this.$t('view.production.workerWagesByPerson.colJobCount'),
          sortable: true,
          minWidth: '120px',
          align: 'right'
        },
        {
          field: 'totalQty',
          header: this.$t('view.production.workerWagesByPerson.colTotalQty'),
          sortable: true,
          minWidth: '130px',
          align: 'right',
          format: 'decimal2'
        },
        {
          field: 'totalWages',
          header: this.$t('view.production.workerWagesByPerson.colTotalWages'),
          sortable: true,
          minWidth: '130px',
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
      await this.workerWagesByPersonStore.fetchReportExport({
        sort: this.sort,
        formValue: this.modelFormExport
      })
    }
  },

  methods: {
    async fetchData() {
      await this.workerWagesByPersonStore.fetchReport({
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
