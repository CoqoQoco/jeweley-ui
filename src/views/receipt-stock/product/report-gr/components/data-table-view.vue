<template>
  <div>
    <BaseDataTable
      :items="receiptProductionStore.dataReceiptHistory.data"
      :totalRecords="receiptProductionStore.dataReceiptHistory.total"
      :columns="columns"
      dataKey="receiptNumber"
      :expandable="true"
      class="base-data-table"
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

      <template #expansion="{ data }">
        <grReportExpand :row="data" mode="production" />
      </template>

      <template #footerGroup>
        <!-- eslint-disable-next-line no-restricted-imports -->
        <ColumnGroup type="footer">
          <Row>
            <Column
              v-for="cell in grandTotalCells"
              :key="cell.key"
              :colspan="cell.colspan"
              :footer="cell.text"
              :footerStyle="{ textAlign: cell.align, fontWeight: 'bold' }"
            />
          </Row>
        </ColumnGroup>
      </template>
    </BaseDataTable>
  </div>
</template>

<script>
// eslint-disable-next-line no-restricted-imports
import ColumnGroup from 'primevue/columngroup'
// eslint-disable-next-line no-restricted-imports
import Row from 'primevue/row'
// eslint-disable-next-line no-restricted-imports
import Column from 'primevue/column'

import grReportExpand from '../../components/gr-report-expand.vue'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import dataTablePaging from '@/composables/useDataTablePaging.js'

import { useReceiptProductionApiStore } from '@/stores/modules/api/receipt/receipt-production-api.js'
import {
  buildReportColumns,
  buildGrandTotalCells,
  buildReportLabels
} from '@/services/helper/goods-receipt-report/goods-receipt-report.js'
import { GoodsReceiptReportPdfBuilder } from '@/services/helper/pdf/goods-receipt-report/goods-receipt-report-pdf-builder.js'

export default {
  components: {
    BaseDataTable,
    grReportExpand,
    ColumnGroup,
    Row,
    Column
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
    },
    modelFormPdf: {
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
      return buildReportColumns(this.$t, 'production')
    },
    aggregates() {
      return this.receiptProductionStore.dataReceiptHistory.aggregates || {}
    },
    grandTotalCells() {
      return buildGrandTotalCells(this.columns, this.aggregates, this.$t('view.receiptStock.product.reportGr.grandTotal'), { leadingCols: 1 })
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
    },
    async modelFormPdf() {
      await this.fetchDataPdf()
    }
  },

  methods: {
    async fetchData() {
      await this.receiptProductionStore.fetchConfirmHistory({
        skip: this.skip,
        take: this.take,
        sort: this.sort,
        formValue: { ...this.form, includeMaterials: true },
        skipLoading: false
      })
    },
    async fetchDataExport() {
      //console.log('fetchDataExport')
      await this.receiptProductionStore.fetchConfirmHistoryExport({
        sort: this.sort,
        formValue: this.form,
        labels: buildReportLabels(this.$t)
      })
    },
    async fetchDataPdf() {
      const res = await this.receiptProductionStore.fetchConfirmHistoryAll({
        sort: this.sort,
        formValue: this.form
      })
      if (!res?.data?.length) return

      const builder = new GoodsReceiptReportPdfBuilder({
        items: res.data,
        aggregates: res.aggregates,
        labels: buildReportLabels(this.$t),
        mode: 'production',
        receiptDateStart: this.form.receiptDateStart,
        receiptDateEnd: this.form.receiptDateEnd
      })
      await builder.downloadPDF()
    },

    getStudEarring(value) {
      return this.masterStud.find((item) => item.value === value)?.description
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-data-table';

.base-data-table {
  // แถวขยาย: td ต้อง overflow visible — ไม่งั้น position: sticky ของ .expand-container ติดผิด ancestor
  :deep(.p-datatable-row-expansion > td) {
    overflow: visible;
  }
}
</style>
