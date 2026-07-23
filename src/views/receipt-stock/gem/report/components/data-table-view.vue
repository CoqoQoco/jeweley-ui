<template>
  <div class="mt-2">
    <BaseDataTable
      :items="gemOnhandReportStore.dataSearch.data"
      :totalRecords="gemOnhandReportStore.dataSearch.total"
      :columns="columns"
      :perPage="take"
      dataKey="id"
      @page="handlePageChange"
      @sort="handleSortChange"
    >
      <template #footer>
        <div>
          {{ $t('view.stock.gemOnhandReport.totalRecords', { total: gemOnhandReportStore.dataSearch.total }) }}
        </div>
      </template>
    </BaseDataTable>
  </div>
</template>

<script>
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import dataTablePaging from '@/composables/useDataTablePaging.js'

import { useGemOnhandReportApiStore } from '@/stores/modules/api/stock/gem-onhand-report-api.js'

export default {
  name: 'GemOnhandReportDataTableView',

  mixins: [dataTablePaging],

  components: {
    BaseDataTable
  },

  setup() {
    const gemOnhandReportStore = useGemOnhandReportApiStore()
    return { gemOnhandReportStore }
  },

  props: {
    modelForm: {
      type: Object,
      default: () => ({})
    },
    modelFormExport: {
      type: Object,
      default: () => null
    }
  },

  computed: {
    columns() {
      return [
        {
          field: 'code',
          header: this.$t('common.field.code'),
          sortable: true,
          minWidth: '120px'
        },
        {
          field: 'name',
          header: this.$t('view.stock.gemOnhandReport.colName'),
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'groupName',
          header: this.$t('view.stock.gemOnhandReport.groupName'),
          sortable: true,
          minWidth: '130px'
        },
        {
          field: 'shape',
          header: this.$t('view.stock.gemOnhandReport.shape'),
          sortable: true,
          minWidth: '110px'
        },
        {
          field: 'grade',
          header: this.$t('view.stock.gemOnhandReport.grade'),
          sortable: true,
          minWidth: '100px'
        },
        {
          field: 'size',
          header: this.$t('view.stock.gemOnhandReport.size'),
          sortable: true,
          minWidth: '90px'
        },
        {
          field: 'quantity',
          header: this.$t('view.stock.gemOnhandReport.colQuantity'),
          sortable: true,
          minWidth: '120px',
          align: 'right',
          format: 'number'
        },
        {
          field: 'quantityWeight',
          header: this.$t('view.stock.gemOnhandReport.colQuantityWeight'),
          sortable: true,
          minWidth: '140px',
          align: 'right',
          format: 'decimal2'
        },
        {
          field: 'quantityOnProcess',
          header: this.$t('view.stock.gemOnhandReport.colQuantityOnProcess'),
          sortable: true,
          minWidth: '120px',
          align: 'right',
          format: 'number'
        },
        {
          field: 'price',
          header: this.$t('view.stock.gemOnhandReport.colPrice'),
          sortable: true,
          minWidth: '110px',
          align: 'right',
          format: 'decimal2'
        },
        {
          field: 'region',
          header: this.$t('view.stock.gemOnhandReport.colRegion'),
          sortable: true,
          minWidth: '120px'
        },
        {
          field: 'remark1',
          header: this.$t('common.field.remark'),
          sortable: false,
          minWidth: '150px'
        }
      ]
    }
  },

  watch: {
    modelForm() {
      this.resetPaging()
    },
    async modelFormExport(val) {
      if (!val) return
      await this.gemOnhandReportStore.fetchReportExport({
        sort: this.sort,
        formValue: this.modelForm
      })
    }
  },

  methods: {
    async fetchData() {
      await this.gemOnhandReportStore.fetchReport({
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
