<template>
  <div class="mt-2">
    <BaseDataTable
      :items="productionPriceReportStore.dataSearch.data"
      :totalRecords="productionPriceReportStore.dataSearch.total"
      :columns="columns"
      :perPage="take"
      dataKey="id"
      @page="handlePageChange"
      @sort="handleSortChange"
    >
      <template #productQtyTemplate="{ data }">
        <div>{{ data.productQty }} {{ data.productQtyUnit }}</div>
      </template>

      <template #footer>
        <div>
          {{ $t('view.production.productionPriceReport.totalRecords', { total: productionPriceReportStore.dataSearch.total }) }}
        </div>
      </template>
    </BaseDataTable>
  </div>
</template>

<script>
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import dataTablePaging from '@/composables/useDataTablePaging.js'

import { useProductionPriceReportApiStore } from '@/stores/modules/api/production/production-price-report-api.js'

export default {
  name: 'ProductionPriceReportDataTableView',

  mixins: [dataTablePaging],

  components: {
    BaseDataTable
  },

  setup() {
    const productionPriceReportStore = useProductionPriceReportApiStore()
    return { productionPriceReportStore }
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
          field: 'createDate',
          header: this.$t('view.production.productionPriceReport.colCreateDate'),
          sortable: true,
          minWidth: '130px',
          format: 'date'
        },
        {
          field: 'woText',
          header: this.$t('view.production.productionPriceReport.colWoText'),
          sortable: true,
          minWidth: '140px'
        },
        {
          field: 'productNumber',
          header: this.$t('view.production.productionPriceReport.colProductNumber'),
          sortable: true,
          minWidth: '140px'
        },
        {
          field: 'productName',
          header: this.$t('view.production.productionPriceReport.colProductName'),
          sortable: true,
          minWidth: '160px'
        },
        {
          field: 'mold',
          header: this.$t('view.production.productionPriceReport.colMold'),
          sortable: true,
          minWidth: '130px'
        },
        {
          field: 'productTypeName',
          header: this.$t('view.production.productionPriceReport.colProductType'),
          sortable: true,
          minWidth: '130px'
        },
        {
          field: 'customerName',
          header: this.$t('view.production.productionPriceReport.colCustomer'),
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'productQty',
          header: this.$t('view.production.productionPriceReport.colQty'),
          sortable: true,
          minWidth: '110px',
          bodyTemplate: 'productQtyTemplate'
        },
        {
          field: 'totalPrice',
          header: this.$t('view.production.productionPriceReport.colTotalPrice'),
          sortable: true,
          minWidth: '130px',
          align: 'right',
          format: 'decimal2'
        },
        {
          field: 'priceItemCount',
          header: this.$t('view.production.productionPriceReport.colPriceItemCount'),
          sortable: true,
          minWidth: '120px'
        },
        {
          field: 'priceUpdateDate',
          header: this.$t('view.production.productionPriceReport.colPriceUpdateDate'),
          sortable: true,
          minWidth: '150px',
          format: 'date'
        }
      ]
    }
  },

  watch: {
    async modelForm() {
      this.resetPaging()
    },
    async modelFormExport() {
      await this.productionPriceReportStore.fetchReportExport({
        sort: this.sort,
        formValue: this.modelFormExport
      })
    }
  },

  methods: {
    async fetchData() {
      await this.productionPriceReportStore.fetchReport({
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
