<template>
  <div>
    <BaseDataTable
      :items="receiptProductionStore.dataReceiptHistory.data"
      :totalRecords="receiptProductionStore.dataReceiptHistory.total"
      :columns="columns"
      :perPage="take"
      :scrollHeight="'calc(100vh - 310px)'"
      @page="handlePageChange"
      @sort="handleSortChange"
    >
      <template #woTextTemplate="{ data }">
        <div>
          {{ `${data.wo}-${data.woNumber}` }}
        </div>
      </template>
      <template #studEarringTemplate="{ data }">
        <div>
          {{ getStudEarring(data.studEarring) }}
        </div>
      </template>
    </BaseDataTable>
  </div>
</template>

<script>
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import dataTablePaging from '@/composables/useDataTablePaging.js'

import { useReceiptProductionApiStore } from '@/stores/modules/api/receipt/receipt-production-api.js'

export default {
  components: {
    BaseDataTable
  },

  mixins: [dataTablePaging],

  setup() {
    const receiptProductionStore = useReceiptProductionApiStore()
    return { receiptProductionStore }
  },

  props: {
    modelForm: {
      type: Object,
      default: () => ({}),
      required: true
    },
    modelFormExport: {
      type: Object,
      default: () => ({}),
      required: true
    }
  },

  computed: {
    form() {
      return this.modelForm || {}
    },
    columns() {
      return [
        {
          field: 'receiptDate',
          header: this.$t('view.receiptStock.product.reportGr.colReceiptDate'),
          sortable: true,
          minWidth: '150px',
          format: 'datetime'
        },
        {
          field: 'stockNumber',
          header: this.$t('view.receiptStock.product.reportGr.stockNumber'),
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'productNumber',
          header: this.$t('view.receiptStock.product.reportGr.productNumber'),
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'productNameEn',
          header: this.$t('view.receiptStock.product.reportGr.productNameEn'),
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'productNameTh',
          header: this.$t('view.receiptStock.product.reportGr.productNameTh'),
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'productTypeName',
          header: this.$t('view.receiptStock.product.reportGr.colProductTypeName'),
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'studEarring',
          header: this.$t('view.receiptStock.product.reportGr.colStudEarring'),
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'size',
          header: this.$t('view.receiptStock.product.reportGr.size'),
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'mold',
          header: this.$t('view.receiptStock.product.reportGr.mold'),
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'productionType',
          header: this.$t('view.receiptStock.product.reportGr.colProductionType'),
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'productionTypeSize',
          header: this.$t('view.receiptStock.product.reportGr.colProductionTypeSize'),
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'woText',
          header: this.$t('view.receiptStock.product.reportGr.wo'),
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'location',
          header: this.$t('view.receiptStock.product.reportGr.colLocation'),
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'productPrice',
          header: this.$t('view.receiptStock.product.reportGr.colProductPrice'),
          sortable: true,
          minWidth: '150px',
          format: 'decimal2'
        },
        {
          field: 'createBy',
          header: this.$t('view.receiptStock.product.reportGr.colCreateBy'),
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'remark',
          header: this.$t('view.receiptStock.product.reportGr.colRemark'),
          sortable: true,
          minWidth: '150px'
        }
      ]
    },
    masterStud() {
      return [
        { value: 'lg', description: this.$t('view.receiptStock.product.reportGr.studLarge') },
        { value: 'md', description: this.$t('view.receiptStock.product.reportGr.studMedium') },
        { value: 'sm', description: this.$t('view.receiptStock.product.reportGr.studSmall') }
      ]
    }
  },

  watch: {
    async modelForm() {
      this.take = 10
      this.skip = 0
      await this.fetchData()
    },
    async modelFormExport() {
      await this.fetchDataExport()
    }
  },

  methods: {
    async fetchData() {
      await this.receiptProductionStore.fetchConfirmHistory({
        skip: this.skip,
        take: this.take,
        sort: this.sort,
        formValue: this.form,
        skipLoading: false
      })
    },
    async fetchDataExport() {
      //console.log('fetchDataExport')
      await this.receiptProductionStore.fetchConfirmHistoryExport({
        sort: this.sort,
        formValue: this.form
      })
    },

    getStudEarring(value) {
      return this.masterStud.find((item) => item.value === value)?.description
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-data-table';
</style>
