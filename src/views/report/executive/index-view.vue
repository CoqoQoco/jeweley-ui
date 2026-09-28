<template>
  <div class="app-container">
    <DashboardHeaderGeneric :title="$t('view.executive.title')" :subtitle="asOfSubtitle" icon="bi-speedometer2" @refresh="onRefresh">
      <template #controls>
        <ButtonGeneric variant="green" icon="bi-file-earmark-excel" :label="$t('common.btn.export')" @click="onExportExcel" />
      </template>
    </DashboardHeaderGeneric>

    <summaryView :summary="summary" />

    <productionWipView
      :productionWip="productionWip"
      :filter="productionFilter"
      :refreshToken="refreshToken"
      @update:filter="productionFilter = $event"
    />

    <receivablesView :receivablesSummary="summary.receivables" :refreshToken="refreshToken" />

    <div class="bottom-grid responsive-grid-2col">
      <stockHealthView :stockHealth="stockHealth" />
      <goldLossView :rows="summary.goldLoss" />
    </div>
  </div>
</template>

<script>
import dayjs from 'dayjs'

import { useExecutiveReportApiStore } from '@/stores/modules/api/report/executive-report-api.js'
import { formatDateTime } from '@/services/utils/dayjs.js'
import { ExcelHelper } from '@/services/utils/excel-js.js'
import {
  buildSummaryExcelRows,
  buildStalePlansExcelRows,
  buildReceivablesExcelRows,
  buildSalesOrdersExcelRows,
  buildStockAgingExcelRows,
  buildGoldLossExcelRows
} from './executive-helpers.js'

import DashboardHeaderGeneric from '@/components/generic/DashboardHeaderGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'

import summaryView from './components/summary-view.vue'
import productionWipView from './components/production-wip-view.vue'
import receivablesView from './components/receivables-view.vue'
import stockHealthView from './components/stock-health-view.vue'
import goldLossView from './components/gold-loss-view.vue'

const EXPORT_TAKE = 5000

const emptySummary = () => ({
  asOf: null,
  production: { openCount: 0, moved30dCount: 0, stale180dCount: 0, meltedOpenCount: 0 },
  receivables: {
    invoiceCount: 0,
    invoiceTotalThb: 0,
    paidOrPartialThb: 0,
    unpaidCount: 0,
    unpaidThb: 0,
    overdueCount: 0,
    overdueThb: 0,
    unpaidNotOverdueThb: 0,
    noDueDateCount: 0
  },
  salesOrders: { openCount: 0, noInvoiceCount: 0, noInvoiceThb: 0, overdueNoInvoiceCount: 0, noDeliveryDateCount: 0 },
  stock: { inStockCount: 0, noCostCount: 0, costThb: 0, agedOver1yCount: 0 },
  goldLoss: []
})

const emptyProductionWip = () => ({ departments: [], monthlyCompleted: [] })

const emptyStockHealth = () => ({ ageBuckets: [], receiptTypes: [] })

export default {
  name: 'ExecutiveOverviewIndexView',

  components: {
    DashboardHeaderGeneric,
    ButtonGeneric,
    summaryView,
    productionWipView,
    receivablesView,
    stockHealthView,
    goldLossView
  },

  setup() {
    const executiveReportStore = useExecutiveReportApiStore()
    return { executiveReportStore }
  },

  data() {
    return {
      summary: emptySummary(),
      productionWip: emptyProductionWip(),
      stockHealth: emptyStockHealth(),
      productionFilter: { departmentKeys: [], minDays: 180 },
      refreshToken: 0
    }
  },

  computed: {
    asOfSubtitle() {
      return this.summary.asOf ? this.$t('view.executive.asOf', { date: formatDateTime(this.summary.asOf) }) : ''
    },

    departmentLabelMap() {
      return {
        design: this.$t('view.executive.department.design'),
        trim: this.$t('view.executive.department.trim'),
        rawPolish: this.$t('view.executive.department.rawPolish'),
        gemSort: this.$t('view.executive.department.gemSort'),
        setting: this.$t('view.executive.department.setting'),
        plating: this.$t('view.executive.department.plating'),
        costCard: this.$t('view.executive.department.costCard')
      }
    }
  },

  methods: {
    async fetchSummary() {
      const res = await this.executiveReportStore.fetchSummary()
      this.summary = res ? { ...emptySummary(), ...res } : emptySummary()
    },

    async fetchProductionWip() {
      const res = await this.executiveReportStore.fetchProductionWip()
      this.productionWip = res
        ? { departments: res.departments || [], monthlyCompleted: res.monthlyCompleted || [] }
        : emptyProductionWip()
    },

    async fetchStockHealth() {
      const res = await this.executiveReportStore.fetchStockHealth()
      this.stockHealth = res ? { ageBuckets: res.ageBuckets || [], receiptTypes: res.receiptTypes || [] } : emptyStockHealth()
    },

    onRefresh() {
      this.fetchSummary()
      this.fetchProductionWip()
      this.fetchStockHealth()
      this.refreshToken += 1
    },

    async onExportExcel() {
      const [stalePlansRes, receivablesRes, salesOrdersRes] = await Promise.all([
        this.executiveReportStore.fetchStalePlans({
          take: EXPORT_TAKE,
          skip: 0,
          sort: [],
          minDays: this.productionFilter.minDays,
          departmentKeys: this.productionFilter.departmentKeys
        }),
        this.executiveReportStore.fetchReceivables({ take: EXPORT_TAKE, skip: 0, sort: [], filter: 'all' }),
        this.executiveReportStore.fetchSalesOrdersWithoutInvoice({ take: EXPORT_TAKE, skip: 0, sort: [] })
      ])

      const paymentStateLabels = {
        paid: this.$t('view.executive.money.paymentState.paid'),
        partial: this.$t('view.executive.money.paymentState.partial'),
        unpaid: this.$t('view.executive.money.paymentState.unpaid')
      }
      const bucketLabels = {
        lt1y: this.$t('view.executive.stock.ageBucket.lt1y'),
        y1to2: this.$t('view.executive.stock.ageBucket.y1to2'),
        y2to5: this.$t('view.executive.stock.ageBucket.y2to5'),
        gt5y: this.$t('view.executive.stock.ageBucket.gt5y')
      }
      const sectionLabels = {
        ageBucket: this.$t('view.executive.excel.sectionAgeBucket'),
        receiptType: this.$t('view.executive.excel.sectionReceiptType')
      }
      const summaryLabels = {
        asOf: this.$t('view.executive.excel.summary.asOf'),
        productionOpenCount: this.$t('view.executive.excel.summary.productionOpenCount'),
        productionMoved30d: this.$t('view.executive.excel.summary.productionMoved30d'),
        productionStale180d: this.$t('view.executive.excel.summary.productionStale180d'),
        productionMeltedOpen: this.$t('view.executive.excel.summary.productionMeltedOpen'),
        invoiceCount: this.$t('view.executive.excel.summary.invoiceCount'),
        invoiceTotalThb: this.$t('view.executive.excel.summary.invoiceTotalThb'),
        paidOrPartialThb: this.$t('view.executive.excel.summary.paidOrPartialThb'),
        unpaidCount: this.$t('view.executive.excel.summary.unpaidCount'),
        unpaidThb: this.$t('view.executive.excel.summary.unpaidThb'),
        overdueCount: this.$t('view.executive.excel.summary.overdueCount'),
        overdueThb: this.$t('view.executive.excel.summary.overdueThb'),
        unpaidNotOverdueThb: this.$t('view.executive.excel.summary.unpaidNotOverdueThb'),
        noDueDateCount: this.$t('view.executive.excel.summary.noDueDateCount'),
        soOpenCount: this.$t('view.executive.excel.summary.soOpenCount'),
        soNoInvoiceCount: this.$t('view.executive.excel.summary.soNoInvoiceCount'),
        soNoInvoiceThb: this.$t('view.executive.excel.summary.soNoInvoiceThb'),
        soOverdueNoInvoiceCount: this.$t('view.executive.excel.summary.soOverdueNoInvoiceCount'),
        soNoDeliveryDateCount: this.$t('view.executive.excel.summary.soNoDeliveryDateCount'),
        stockInStockCount: this.$t('view.executive.excel.summary.stockInStockCount'),
        stockNoCostCount: this.$t('view.executive.excel.summary.stockNoCostCount'),
        stockCostThb: this.$t('view.executive.excel.summary.stockCostThb'),
        stockAgedOver1yCount: this.$t('view.executive.excel.summary.stockAgedOver1yCount')
      }

      await ExcelHelper.exportToExcelMultiSheet(
        [
          {
            sheetName: this.$t('view.executive.excel.sheetSummary'),
            data: buildSummaryExcelRows(this.summary, summaryLabels),
            columns: [
              { header: this.$t('view.executive.excel.colLabel'), key: 'label' },
              { header: this.$t('view.executive.excel.colValue'), key: 'value' }
            ]
          },
          {
            sheetName: this.$t('view.executive.excel.sheetStalePlans'),
            data: buildStalePlansExcelRows(stalePlansRes?.data, this.departmentLabelMap),
            columns: [
              { header: this.$t('view.executive.production.colWo'), key: 'wo' },
              { header: this.$t('view.executive.production.colMold'), key: 'mold' },
              { header: this.$t('common.field.code'), key: 'productNumber' },
              { header: this.$t('view.executive.production.colProduct'), key: 'productName' },
              { header: this.$t('common.field.quantity'), key: 'productQty' },
              { header: this.$t('view.executive.production.colDepartment'), key: 'department' },
              { header: this.$t('common.field.status'), key: 'status' },
              { header: this.$t('view.executive.production.colOpenDate'), key: 'createDate' },
              { header: this.$t('view.executive.production.colLastMove'), key: 'lastMoveDate' },
              { header: this.$t('view.executive.production.colDays'), key: 'daysSinceMove' }
            ]
          },
          {
            sheetName: this.$t('view.executive.excel.sheetReceivables'),
            data: buildReceivablesExcelRows(receivablesRes?.data, paymentStateLabels),
            columns: [
              { header: this.$t('view.executive.money.colInvoiceNumber'), key: 'dkInvoiceNumber' },
              { header: this.$t('view.executive.money.colSoRunning'), key: 'soRunning' },
              { header: this.$t('view.executive.money.colCustomerCode'), key: 'customerCode' },
              { header: this.$t('view.executive.money.colCustomerName'), key: 'customerName' },
              { header: this.$t('view.executive.money.colCreateDate'), key: 'createDate' },
              { header: this.$t('view.executive.money.colDueDate'), key: 'dueDate' },
              { header: this.$t('view.executive.money.colGrandTotal'), key: 'grandTotal' },
              { header: this.$t('view.executive.money.colGrandTotalThb'), key: 'grandTotalThb' },
              { header: this.$t('view.executive.money.colPaidAmount'), key: 'paidAmount' },
              { header: this.$t('view.executive.money.colOutstanding'), key: 'outstanding' },
              { header: this.$t('view.executive.money.colCurrency'), key: 'currencyUnit' },
              { header: this.$t('view.executive.money.colPaymentState'), key: 'paymentState' },
              { header: this.$t('view.executive.money.colOverdue'), key: 'isOverdue' },
              { header: this.$t('view.executive.money.colDaysOverdue'), key: 'daysOverdue' },
              { header: this.$t('view.executive.money.colSalePerson'), key: 'salePerson' },
              { header: this.$t('view.executive.money.colSaleChannel'), key: 'saleChannelCode' }
            ]
          },
          {
            sheetName: this.$t('view.executive.excel.sheetSalesOrders'),
            data: buildSalesOrdersExcelRows(salesOrdersRes?.data),
            columns: [
              { header: this.$t('view.executive.money.colSoNumber'), key: 'soNumber' },
              { header: this.$t('view.executive.money.colCustomerCode'), key: 'customerCode' },
              { header: this.$t('view.executive.money.colCustomerName'), key: 'customerName' },
              { header: this.$t('view.executive.money.colSoDate'), key: 'soDate' },
              { header: this.$t('view.executive.money.colDeliveryDate'), key: 'deliveryDate' },
              { header: this.$t('view.executive.money.colCurrency'), key: 'currencyUnit' },
              { header: this.$t('view.executive.money.colGrandTotal'), key: 'grandTotal' },
              { header: this.$t('view.executive.money.colGrandTotalThb'), key: 'grandTotalThb' },
              { header: this.$t('view.executive.money.colOverdue'), key: 'isOverdue' },
              { header: this.$t('view.executive.money.colSalePerson'), key: 'salePerson' },
              { header: this.$t('view.executive.money.colSaleChannel'), key: 'saleChannelCode' }
            ]
          },
          {
            sheetName: this.$t('view.executive.excel.sheetStockAging'),
            data: buildStockAgingExcelRows(this.stockHealth.ageBuckets, this.stockHealth.receiptTypes, bucketLabels, sectionLabels),
            columns: [
              { header: this.$t('view.executive.excel.colSection'), key: 'section' },
              { header: this.$t('view.executive.excel.colKey'), key: 'key' },
              { header: this.$t('view.executive.stock.colCount'), key: 'count' },
              { header: this.$t('view.executive.stock.colNoCostCount'), key: 'noCostCount' },
              { header: this.$t('view.executive.stock.colCostThb'), key: 'costThb' }
            ]
          },
          {
            sheetName: this.$t('view.executive.excel.sheetGoldLoss'),
            data: buildGoldLossExcelRows(this.summary.goldLoss),
            columns: [
              { header: this.$t('view.executive.goldLoss.colMonth'), key: 'month' },
              { header: this.$t('view.executive.goldLoss.colSlipCount'), key: 'slipCount' },
              { header: this.$t('view.executive.goldLoss.colIssuedGram'), key: 'issuedGram' },
              { header: this.$t('view.executive.goldLoss.colRawLossGram'), key: 'rawLossGram' },
              { header: this.$t('view.executive.goldLoss.colOverAllowedGram'), key: 'overAllowedGram' },
              { header: this.$t('view.executive.goldLoss.colOverAllowedPercent'), key: 'overAllowedPercent' }
            ]
          }
        ],
        { filename: `${this.$t('view.executive.excel.filenamePrefix')}-${dayjs().format('YYYY-MM-DD')}.xlsx` }
      )
    }
  },

  mounted() {
    this.fetchSummary()
    this.fetchProductionWip()
    this.fetchStockHealth()
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/web';

.bottom-grid {
  margin-top: var(--sp-lg);
}
</style>
