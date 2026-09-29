<template>
  <div class="app-container">
    <DashboardHeaderGeneric :title="$t('view.executive.title')" :subtitle="asOfSubtitle" icon="bi-speedometer2" @refresh="onRefresh">
      <template #controls>
        <ButtonGeneric variant="green" icon="bi-file-earmark-excel" :label="$t('view.executive.excel.exportAllBtn')" @click="onExportExcel" />
      </template>
    </DashboardHeaderGeneric>

    <summaryView :summary="summary" @select-tab="onTabChange" />

    <TabViewGeneric :modelValue="activeTab" :tabs="tabsConfig" @update:modelValue="onTabChange">
      <template #production>
        <productionInsightView>
          <template #wip-extra>
            <productionWipView :filter="productionFilter" :refreshToken="refreshToken" @update:filter="productionFilter = $event" />
          </template>
          <template #gold-extra>
            <goldLossTrendView :refreshToken="refreshToken" v-model:rankingRange="goldLossRankingRange" />
          </template>
        </productionInsightView>
      </template>
      <template #sales>
        <salesView :receivablesSummary="summary.receivables" :salesOrdersSummary="summary.salesOrders" :refreshToken="refreshToken" />
      </template>
      <template #stock>
        <stockHealthView :refreshToken="refreshToken" />
      </template>
    </TabViewGeneric>
  </div>
</template>

<script>
import dayjs from 'dayjs'

import { useExecutiveReportApiStore } from '@/stores/modules/api/report/executive-report-api.js'
import { formatDateTime, formatISOString } from '@/services/utils/dayjs.js'
import { ExcelHelper } from '@/services/utils/excel-js.js'
import api from '@/axios/axios-helper.js'
import { normalizeTangRow, normalizeSetterRow, buildMonthRange, monthKeyOf, filterRowsByMonthKeys } from '@/services/utils/gold-loss/slip-monthly-helpers.js'
import {
  resolveActiveTab,
  buildSummaryExcelRows,
  buildStalePlansExcelRows,
  buildReceivablesExcelRows,
  buildSalesOrdersExcelRows,
  buildStockAgingExcelRows,
  buildGoldLossMonthlyExcelRows,
  buildGoldLossByWorkerExcelRows
} from './executive-helpers.js'

import DashboardHeaderGeneric from '@/components/generic/DashboardHeaderGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import TabViewGeneric from '@/components/generic/TabViewGeneric.vue'

import summaryView from './components/summary-view.vue'
import productionWipView from './components/production-wip-view.vue'
import salesView from './components/sales-view.vue'
import stockHealthView from './components/stock-health-view.vue'
import goldLossTrendView from './components/gold-loss-trend-view.vue'
import productionInsightView from '@/views/production/insight/index-view.vue'

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

export default {
  name: 'ExecutiveOverviewIndexView',

  components: {
    DashboardHeaderGeneric,
    ButtonGeneric,
    TabViewGeneric,
    summaryView,
    productionWipView,
    salesView,
    stockHealthView,
    goldLossTrendView,
    productionInsightView
  },

  setup() {
    const executiveReportStore = useExecutiveReportApiStore()
    return { executiveReportStore }
  },

  data() {
    return {
      summary: emptySummary(),
      productionFilter: { departmentKeys: [], minDays: 180 },
      goldLossRankingRange: '3m',
      refreshToken: 0,
      activeTab: 'production',
      isApplyingRouteQuery: false
    }
  },

  computed: {
    asOfSubtitle() {
      return this.summary.asOf ? this.$t('view.executive.asOf', { date: formatDateTime(this.summary.asOf) }) : ''
    },

    tabsConfig() {
      return [
        { value: 'production', label: this.$t('view.executive.tabs.production') },
        { value: 'sales', label: this.$t('view.executive.tabs.sales') },
        { value: 'stock', label: this.$t('view.executive.tabs.stock') }
      ]
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

  watch: {
    // single source of truth — ทั้ง TabViewGeneric (คลิกแท็บตรงๆ) และ summaryView (คลิก KPI) เปลี่ยน
    // activeTab แล้วมาจบที่นี่เหมือนกัน คอย sync query string ?tab= เสมอ (refresh ไม่ผ่าน watcher นี้ — tab เดิม)
    activeTab() {
      this.syncStateToQuery()
    }
  },

  methods: {
    async fetchSummary() {
      const res = await this.executiveReportStore.fetchSummary()
      this.summary = res ? { ...emptySummary(), ...res } : emptySummary()
    },

    // อ่าน ?tab= ตอนเข้าหน้า/back-forward — ตั้ง guard กัน syncStateToQuery ยิง replace ซ้ำระหว่างที่กำลัง apply จาก query เอง
    applyQueryToState(query) {
      this.isApplyingRouteQuery = true
      this.activeTab = resolveActiveTab(query.tab)
      this.$nextTick(() => {
        this.isApplyingRouteQuery = false
      })
    },

    syncStateToQuery() {
      if (this.isApplyingRouteQuery) return
      this.$router.replace({ query: { ...this.$route.query, tab: this.activeTab } }).catch(() => {})
    },

    onTabChange(tab) {
      this.activeTab = resolveActiveTab(tab)
    },

    onRefresh() {
      this.fetchSummary()
      this.refreshToken += 1
    },

    // ยิง endpoint ต่อช่างแบบ groupByMonth:true ครอบคลุม 6 เดือนล่าสุด (ช่วงเดียวกับที่จอ gold-loss-trend-view
    // ใช้แสดง) แยกอิสระจากตอนแสดงผลบนจอ — ตาม pattern export ของไฟล์นี้ที่ยิงข้อมูลเต็มชุดใหม่เองทุกสheet
    async fetchGoldLossWorkerReportsForExport() {
      const requestDateStart = formatISOString(dayjs().subtract(5, 'month').startOf('month'))
      const requestDateEnd = formatISOString(dayjs())
      const [tangRes, setterRes] = await Promise.all([
        api.jewelry.post('Worker/ReportGoldLossTangByWorker', { take: 0, skip: 0, sort: [], search: { requestDateStart, requestDateEnd, groupByMonth: true } }, { skipLoading: true }),
        api.jewelry.post('Worker/ReportGoldLossSlipByWorker', { take: 0, skip: 0, sort: [], search: { requestDateStart, requestDateEnd, groupByMonth: true } }, { skipLoading: true })
      ])
      return {
        tangRows: (tangRes?.data || []).map((r) => normalizeTangRow(r)),
        setterRows: (setterRes?.data || []).map((r) => normalizeSetterRow(r))
      }
    },

    async onExportExcel() {
      const [stalePlansRes, receivablesRes, salesOrdersRes, stockHealthRes, goldLossWorkerRows] = await Promise.all([
        this.executiveReportStore.fetchStalePlans({
          take: EXPORT_TAKE,
          skip: 0,
          sort: [],
          minDays: this.productionFilter.minDays,
          departmentKeys: this.productionFilter.departmentKeys
        }),
        this.executiveReportStore.fetchReceivables({ take: EXPORT_TAKE, skip: 0, sort: [], filter: 'all' }),
        this.executiveReportStore.fetchSalesOrdersWithoutInvoice({ take: EXPORT_TAKE, skip: 0, sort: [] }),
        this.executiveReportStore.fetchStockHealth(),
        this.fetchGoldLossWorkerReportsForExport()
      ])

      const goldLossCompareMonthKeys = buildMonthRange(dayjs().subtract(5, 'month'), dayjs()).map((m) => monthKeyOf(m.year, m.month))
      const goldLossRankingMonthKeys =
        this.goldLossRankingRange === 'thisMonth' ? goldLossCompareMonthKeys.slice(-1) : goldLossCompareMonthKeys.slice(-3)
      const goldLossDeptLabels = {
        tang: this.$t('view.production.goldLossDashboard.overview.slipDeptTang'),
        setter: this.$t('view.production.goldLossDashboard.overview.slipDeptSetter')
      }

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
        stockAgedOver1yCount: this.$t('view.executive.excel.summary.stockAgedOver1yCount'),
        goldLossPercent: this.$t('view.executive.excel.summary.goldLossPercent'),
        goldLossAllowedPercent: this.$t('view.executive.excel.summary.goldLossAllowedPercent'),
        goldLossOverSlipCount: this.$t('view.executive.excel.summary.goldLossOverSlipCount'),
        goldLossOverAllowedGram: this.$t('view.executive.excel.summary.goldLossOverAllowedGram')
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
            data: buildStockAgingExcelRows(stockHealthRes?.ageBuckets, stockHealthRes?.receiptTypes, bucketLabels, sectionLabels),
            columns: [
              { header: this.$t('view.executive.excel.colSection'), key: 'section' },
              { header: this.$t('view.executive.excel.colKey'), key: 'key' },
              { header: this.$t('view.executive.stock.colCount'), key: 'count' },
              { header: this.$t('view.executive.stock.colNoCostCount'), key: 'noCostCount' },
              { header: this.$t('view.executive.stock.colCostThb'), key: 'costThb' }
            ]
          },
          {
            sheetName: this.$t('view.executive.goldLossTrend.excel.sheetMonthly'),
            data: buildGoldLossMonthlyExcelRows(goldLossCompareMonthKeys, goldLossWorkerRows.tangRows, goldLossWorkerRows.setterRows, goldLossDeptLabels),
            columns: [
              { header: this.$t('view.executive.goldLossTrend.excel.colMonth'), key: 'month' },
              { header: this.$t('view.executive.goldLossTrend.excel.colDept'), key: 'dept' },
              { header: this.$t('view.executive.goldLossTrend.excel.colIssuedGram'), key: 'issuedGram' },
              { header: this.$t('view.executive.goldLossTrend.excel.colLossGram'), key: 'lossGram' },
              { header: this.$t('view.executive.goldLossTrend.excel.colAllowedGram'), key: 'allowedGram' },
              { header: this.$t('view.executive.goldLossTrend.excel.colLossPercent'), key: 'lossPercent' }
            ]
          },
          {
            sheetName: this.$t('view.executive.goldLossTrend.excel.sheetByWorker'),
            data: buildGoldLossByWorkerExcelRows(
              filterRowsByMonthKeys(goldLossWorkerRows.tangRows, goldLossRankingMonthKeys),
              filterRowsByMonthKeys(goldLossWorkerRows.setterRows, goldLossRankingMonthKeys),
              goldLossDeptLabels
            ),
            columns: [
              { header: this.$t('view.executive.goldLossTrend.excel.colRank'), key: 'rank' },
              { header: this.$t('view.executive.goldLossTrend.excel.colDept'), key: 'dept' },
              { header: this.$t('view.executive.goldLossTrend.excel.colWorkerCode'), key: 'workerCode' },
              { header: this.$t('view.executive.goldLossTrend.excel.colWorkerName'), key: 'workerName' },
              { header: this.$t('view.executive.goldLossTrend.excel.colIssuedGram'), key: 'issuedGram' },
              { header: this.$t('view.executive.goldLossTrend.excel.colLossGram'), key: 'lossGram' },
              { header: this.$t('view.executive.goldLossTrend.excel.colAllowedGram'), key: 'allowedGram' },
              { header: this.$t('view.executive.goldLossTrend.excel.colLossPercent'), key: 'lossPercent' }
            ]
          }
        ],
        { filename: `${this.$t('view.executive.excel.filenamePrefix')}-${dayjs().format('YYYY-MM-DD')}.xlsx` }
      )
    }
  },

  created() {
    this.applyQueryToState(this.$route.query)
  },

  mounted() {
    this.fetchSummary()
  }
}
</script>
