<template>
  <div class="mt-2">
    <BaseDataTable
      :items="moveStore.movementSearch.data"
      :totalRecords="moveStore.movementSearch.total"
      :columns="columns"
      :perPage="take"
      dataKey="stockNumber"
      @page="handlePageChange"
      @sort="handleSortChange"
    >
      <template #fromLocationTemplate="{ data }">
        <div>{{ data.fromLocation }} - {{ data.fromLocationName }}</div>
      </template>

      <template #toLocationTemplate="{ data }">
        <div>{{ data.toLocation }} - {{ data.toLocationName }}</div>
      </template>

      <template #footer>
        <div>{{ $t('view.stock.storageMoveReport.totalRecords', { total: moveStore.movementSearch.total }) }}</div>
      </template>
    </BaseDataTable>
  </div>
</template>

<script>
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import dataTablePaging from '@/composables/useDataTablePaging.js'

import { useStockMoveLocationApiStore } from '@/stores/modules/api/stock/stock-move-location-api.js'

export default {
  name: 'StorageMoveReportDataTableView',

  mixins: [dataTablePaging],

  components: {
    BaseDataTable
  },

  setup() {
    const moveStore = useStockMoveLocationApiStore()
    return { moveStore }
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
          field: 'movementDate',
          header: this.$t('view.stock.storageMoveReport.colDate'),
          sortable: true,
          minWidth: '150px',
          format: 'datetime'
        },
        {
          field: 'stockNumber',
          header: this.$t('view.stock.storageMoveReport.colStockNumber'),
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'productCode',
          header: this.$t('view.stock.storageMoveReport.colProductCode'),
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'fromLocation',
          header: this.$t('view.stock.storageMoveReport.colFromLocation'),
          sortable: true,
          minWidth: '180px'
        },
        {
          field: 'toLocation',
          header: this.$t('view.stock.storageMoveReport.colToLocation'),
          sortable: true,
          minWidth: '180px'
        },
        {
          field: 'createBy',
          header: this.$t('view.stock.storageMoveReport.colCreateBy'),
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'remark',
          header: this.$t('common.field.remark'),
          sortable: true,
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
      await this.moveStore.fetchMovementSearchExport({
        sort: this.sort,
        formValue: this.modelFormExport
      })
    }
  },

  methods: {
    async fetchData() {
      await this.moveStore.fetchMovementSearch({
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
