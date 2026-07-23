<template>
  <div class="mt-2">
    <BaseDataTable
      :items="gemMovementReportStore.dataSearch.data"
      :totalRecords="gemMovementReportStore.dataSearch.total"
      :columns="columns"
      :perPage="take"
      dataKey="running"
      @page="handlePageChange"
      @sort="handleSortChange"
    >
      <template #typeTemplate="{ data }">
        <div>{{ typeLabel(data.type) }}</div>
      </template>

      <template #footer>
        <div>
          {{ $t('view.stock.gemMovementReport.totalRecords', { total: gemMovementReportStore.dataSearch.total }) }}
        </div>
      </template>
    </BaseDataTable>
  </div>
</template>

<script>
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import dataTablePaging from '@/composables/useDataTablePaging.js'

import { useGemMovementReportApiStore } from '@/stores/modules/api/stock/gem-movement-report-api.js'

export default {
  name: 'GemMovementReportDataTableView',

  mixins: [dataTablePaging],

  components: {
    BaseDataTable
  },

  setup() {
    const gemMovementReportStore = useGemMovementReportApiStore()
    return { gemMovementReportStore }
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
    typeOptions() {
      return [
        { value: 1, label: this.$t('view.stock.gemMovementReport.type1') },
        { value: 2, label: this.$t('view.stock.gemMovementReport.type2') },
        { value: 3, label: this.$t('view.stock.gemMovementReport.type3') },
        { value: 4, label: this.$t('view.stock.gemMovementReport.type4') },
        { value: 5, label: this.$t('view.stock.gemMovementReport.type5') },
        { value: 6, label: this.$t('view.stock.gemMovementReport.type6') },
        { value: 7, label: this.$t('view.stock.gemMovementReport.type7') }
      ]
    },

    columns() {
      return [
        {
          field: 'requestDate',
          header: this.$t('view.stock.gemMovementReport.colRequestDate'),
          sortable: true,
          minWidth: '130px',
          format: 'date'
        },
        {
          field: 'type',
          header: this.$t('view.stock.gemMovementReport.colType'),
          sortable: true,
          minWidth: '170px',
          bodyTemplate: 'typeTemplate'
        },
        {
          field: 'name',
          header: this.$t('view.stock.gemMovementReport.colName'),
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'groupName',
          header: this.$t('view.stock.gemMovementReport.colGroupName'),
          sortable: true,
          minWidth: '120px'
        },
        {
          field: 'shape',
          header: this.$t('view.stock.gemMovementReport.colShape'),
          sortable: true,
          minWidth: '100px'
        },
        {
          field: 'grade',
          header: this.$t('view.stock.gemMovementReport.colGrade'),
          sortable: true,
          minWidth: '90px'
        },
        {
          field: 'qty',
          header: this.$t('view.stock.gemMovementReport.colQty'),
          sortable: true,
          minWidth: '100px',
          align: 'right',
          format: 'number'
        },
        {
          field: 'qtyWeight',
          header: this.$t('view.stock.gemMovementReport.colQtyWeight'),
          sortable: true,
          minWidth: '120px',
          align: 'right',
          format: 'decimal2'
        },
        {
          field: 'previousRemianQtyWeight',
          header: this.$t('view.stock.gemMovementReport.colPreviousRemain'),
          sortable: true,
          minWidth: '130px',
          align: 'right',
          format: 'decimal2'
        },
        {
          field: 'pointRemianQtyWeight',
          header: this.$t('view.stock.gemMovementReport.colPointRemain'),
          sortable: true,
          minWidth: '130px',
          align: 'right',
          format: 'decimal2'
        },
        {
          field: 'supplierCost',
          header: this.$t('view.stock.gemMovementReport.colSupplierCost'),
          sortable: true,
          minWidth: '110px',
          align: 'right',
          format: 'decimal2'
        },
        {
          field: 'jobOrPo',
          header: this.$t('view.stock.gemMovementReport.colJobOrPo'),
          sortable: true,
          minWidth: '120px'
        },
        {
          field: 'woText',
          header: this.$t('view.stock.gemMovementReport.colWoText'),
          sortable: true,
          minWidth: '120px'
        },
        {
          field: 'subpplierName',
          header: this.$t('view.stock.gemMovementReport.colSupplierName'),
          sortable: true,
          minWidth: '140px'
        },
        {
          field: 'operatorBy',
          header: this.$t('view.stock.gemMovementReport.colOperatorBy'),
          sortable: true,
          minWidth: '130px'
        },
        {
          field: 'returnDate',
          header: this.$t('view.stock.gemMovementReport.colReturnDate'),
          sortable: true,
          minWidth: '130px',
          format: 'date'
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
      await this.gemMovementReportStore.fetchReportExport({
        sort: this.sort,
        formValue: this.modelForm
      })
    }
  },

  methods: {
    typeLabel(type) {
      const option = this.typeOptions.find((item) => item.value === type)
      return option ? option.label : type
    },

    async fetchData() {
      await this.gemMovementReportStore.fetchReport({
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
