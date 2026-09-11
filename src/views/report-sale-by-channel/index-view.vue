<template>
  <div class="app-container">
    <searchView v-model:modelForm="form" @search="onSearchFilter" @clear="onClearFilter" @export="onExport" />
    <summaryView />
    <div class="report-sale-by-channel-grid">
      <byDayTableView />
      <bySellerTableView />
    </div>
    <div class="report-sale-by-channel-grid">
      <topProductsTableView />
      <paymentMixTableView />
    </div>
  </div>
</template>

<script>
import dayjs from 'dayjs'

import { useSaleReportByChannelApiStore } from '@/stores/modules/api/sale/sale-report-by-channel-store.js'
import { ExcelHelper } from '@/services/utils/excel-js.js'
import { formatDate } from '@/services/utils/dayjs.js'
import { formatDocCurrency } from '@/services/utils/decimal.js'
import { warning } from '@/services/alert/sweetAlerts.js'
import { PAYMENT_METHODS } from '@/constants/payment-methods.js'

import searchView from './components/search-view.vue'
import summaryView from './components/summary-view.vue'
import byDayTableView from './components/by-day-table-view.vue'
import bySellerTableView from './components/by-seller-table-view.vue'
import topProductsTableView from './components/top-products-table-view.vue'
import paymentMixTableView from './components/payment-mix-table-view.vue'

const buildDefaultForm = () => ({
  start: dayjs().startOf('month').toDate(),
  end: new Date(),
  saleChannelCode: null
})

export default {
  name: 'ReportSaleByChannelIndexView',

  components: {
    searchView,
    summaryView,
    byDayTableView,
    bySellerTableView,
    topProductsTableView,
    paymentMixTableView
  },

  setup() {
    const saleReportByChannelStore = useSaleReportByChannelApiStore()
    return { saleReportByChannelStore }
  },

  data() {
    return {
      form: buildDefaultForm(),
      search: buildDefaultForm()
    }
  },

  watch: {
    search: {
      handler(val) {
        this.saleReportByChannelStore.fetchReport(val)
      },
      deep: true,
      immediate: true
    }
  },

  methods: {
    onSearchFilter(data) {
      this.search = { ...data }
    },

    onClearFilter() {
      const defaults = buildDefaultForm()
      this.form = defaults
      this.search = { ...defaults }
    },

    paymentLabel(code) {
      const found = PAYMENT_METHODS.find((item) => item.code === code)
      return found
        ? this.$t(`view.report.saleByChannel.${found.labelKey}`)
        : this.$t('view.report.saleByChannel.paymentUnspecified')
    },

    onExport() {
      const report = this.saleReportByChannelStore.report
      if (!report.summary.invoiceCount) {
        warning(this.$t('common.label.noData'))
        return
      }

      const t = (key) => this.$t(`view.report.saleByChannel.${key}`)

      const summarySheet = report.summary.amounts.length
        ? report.summary.amounts.map((item) => ({
            [t('statInvoiceCount')]: report.summary.invoiceCount,
            [t('statPieceCount')]: report.summary.pieceCount,
            [t('colCurrency')]: item.currencyUnit,
            [t('statAmount')]: formatDocCurrency(item.amount, item.currencyUnit)
          }))
        : [
            {
              [t('statInvoiceCount')]: report.summary.invoiceCount,
              [t('statPieceCount')]: report.summary.pieceCount,
              [t('colCurrency')]: '-',
              [t('statAmount')]: '-'
            }
          ]

      const byDaySheet = report.byDay.map((row) => ({
        [t('colDate')]: formatDate(row.date),
        [t('colInvoiceCount')]: row.invoiceCount,
        [t('colAmount')]: row.amounts.map((a) => `${formatDocCurrency(a.amount, a.currencyUnit)} ${a.currencyUnit}`).join(' / ')
      }))

      const bySellerSheet = report.bySeller.map((row) => ({
        [t('colSeller')]: row.sellerUsername,
        [t('colInvoiceCount')]: row.invoiceCount,
        [t('colAmount')]: row.amounts.map((a) => `${formatDocCurrency(a.amount, a.currencyUnit)} ${a.currencyUnit}`).join(' / ')
      }))

      const topProductsSheet = report.topProducts.map((row, index) => ({
        [t('colRank')]: index + 1,
        [t('colProductCode')]: row.productCode,
        [t('colPieceCount')]: row.pieceCount
      }))

      const paymentMixSheet = report.paymentMix.map((row) => ({
        [t('colPayment')]: this.paymentLabel(row.payment),
        [t('colInvoiceCount')]: row.invoiceCount
      }))

      ExcelHelper.exportToExcelMultiSheet(
        [
          { data: summarySheet, sheetName: t('sheetSummary') },
          { data: byDaySheet, sheetName: t('sheetByDay') },
          { data: bySellerSheet, sheetName: t('sheetBySeller') },
          { data: topProductsSheet, sheetName: t('sheetTopProducts') },
          { data: paymentMixSheet, sheetName: t('sheetPaymentMix') }
        ],
        {
          filename: `${t('exportFilePrefix')}[${formatDate(this.search.start)} - ${formatDate(this.search.end)}].xlsx`
        }
      )
    }
  }
}
</script>

<style lang="scss" scoped>
.report-sale-by-channel-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--sp-lg);
  align-items: start;
  margin-bottom: var(--sp-lg);
}

@media (max-width: 1024px) {
  .report-sale-by-channel-grid {
    grid-template-columns: 1fr;
  }
}
</style>
