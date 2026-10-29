<template>
  <div>
    <BaseDataTable
      :items="receiptOutsourceStore.dataReceiptHistory.data"
      :totalRecords="receiptOutsourceStore.dataReceiptHistory.total"
      :columns="columns"
      :perPage="take"
      :scrollHeight="'calc(100vh - 310px)'"
      @page="handlePageChange"
      @sort="handleSortChange"
    >
      <template #stockNumberTemplate="{ data }">
        <span>{{ data.stockNumber }}</span>
        <span v-if="data.isTopUp" class="topup-tag">
          {{ $t('view.receiptStock.product.receiptLot.topUpTag') }}
        </span>
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

import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import dataTablePaging from '@/composables/useDataTablePaging.js'

import { useReceiptOutsourceApiStore } from '@/stores/modules/api/receipt/receipt-outsource-api.js'
import {
  buildReportColumns,
  buildGrandTotalCells,
  buildReportLabels
} from '@/services/helper/goods-receipt-report/goods-receipt-report.js'
import { GoodsReceiptReportPdfBuilder } from '@/services/helper/pdf/goods-receipt-report/goods-receipt-report-pdf-builder.js'

export default {
  name: 'ReportGrOutsourceDataTableView',

  components: {
    BaseDataTable,
    ColumnGroup,
    Row,
    Column
  },

  mixins: [dataTablePaging],

  setup() {
    const receiptOutsourceStore = useReceiptOutsourceApiStore()
    return { receiptOutsourceStore }
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
      return buildReportColumns(this.$t, 'outsource')
    },
    aggregates() {
      return this.receiptOutsourceStore.dataReceiptHistory.aggregates || {}
    },
    grandTotalCells() {
      return buildGrandTotalCells(
        this.columns,
        this.aggregates,
        this.$t('view.receiptStock.product.reportGr.grandTotal')
      )
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
      await this.receiptOutsourceStore.fetchHistory({
        skip: this.skip,
        take: this.take,
        sort: this.sort,
        formValue: this.form,
        skipLoading: false
      })
    },
    async fetchDataExport() {
      await this.receiptOutsourceStore.fetchReportExport({
        sort: this.sort,
        formValue: this.form,
        labels: buildReportLabels(this.$t)
      })
    },
    async fetchDataPdf() {
      const res = await this.receiptOutsourceStore.fetchHistoryAll({
        sort: this.sort,
        formValue: this.form
      })
      if (!res?.data?.length) return

      const builder = new GoodsReceiptReportPdfBuilder({
        items: res.data,
        aggregates: res.aggregates,
        labels: buildReportLabels(this.$t),
        mode: 'outsource',
        receiptDateStart: this.form.receiptDateStart,
        receiptDateEnd: this.form.receiptDateEnd
      })
      await builder.downloadPDF()
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-data-table';

.topup-tag {
  display: inline-block;
  margin-left: var(--sp-xs);
  padding: 2px var(--sp-sm);
  border-radius: var(--radius-sm);
  background-color: var(--base-warning);
  color: var(--base-font-color);
  font-size: var(--fs-sm);
  font-weight: 700;
}
</style>
