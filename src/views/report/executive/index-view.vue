<template>
  <div class="app-container">
    <DashboardHeaderGeneric :title="$t('view.executive.title')" :subtitle="asOfSubtitle" icon="bi-speedometer2" @refresh="onRefresh">
      <template #controls>
        <ToggleGroupGeneric
          v-if="showHeaderMetalToggle"
          :modelValue="metal"
          :options="metalOptions"
          :ariaLabel="$t('view.executive.metalScope.toggleAriaLabel')"
          @update:modelValue="onMetalChange"
        />
        <ButtonGeneric variant="green" icon="bi-file-earmark-excel" :label="$t('view.executive.excel.exportAllBtn')" @click="onExportExcel" />
      </template>
    </DashboardHeaderGeneric>

    <summaryView :summary="summary" @select-tab="onSummarySelect" />

    <digestView :digest="digest" :loading="digestLoading" @select-tab="onDigestSelect" />

    <div ref="tabsWrap" class="executive-tabs" tabindex="-1">
    <TabViewGeneric :modelValue="activeTab" :tabs="tabsConfig" variant="segmented" @update:modelValue="onTabChange">
      <template #production>
        <productionInsightView :key="metal" ref="insight" :metal="metal" :target="productionTarget" @update:metal="onMetalChange" />
      </template>
      <template #sales>
        <salesInsightView :key="metal" :metal="metal" :refreshToken="refreshToken" :initialSub="salesInitialSub" :target="salesTarget" @update:sub="salesInitialSub = $event" />
      </template>
      <template #stock>
        <stockInsightView :key="metal" :metal="metal" :refreshToken="refreshToken" :initialSub="stockInitialSub" @update:sub="stockInitialSub = $event" />
      </template>
      <template #material>
        <materialInsightView :refreshToken="refreshToken" :initialSub="materialInitialSub" :initialKind="materialInitialKind" @update:sub="materialInitialSub = $event" @update:kind="materialInitialKind = $event" />
      </template>
      <template #flow>
        <flowView :active="activeTab === 'flow'" :refreshToken="refreshToken" />
      </template>
    </TabViewGeneric>
    </div>
  </div>
</template>

<script>
import dayjs from 'dayjs'

import { useExecutiveReportApiStore } from '@/stores/modules/api/report/executive-report-api.js'
import { useProductionInsightApiStore } from '@/stores/modules/api/production/production-insight-api.js'
import { useMasterApiStore } from '@/stores/modules/api/master-store.js'
import { formatDateTime, formatISOString } from '@/services/utils/dayjs.js'
import { ExcelHelper } from '@/services/utils/excel-js.js'
import { METAL_SCOPE_VALUES, parseMetalQuery, metalToQuery, resolveGoldTabMetal } from '@/services/utils/metal-scope.js'
import { useMetalScopeStore } from '@/stores/modules/ui/metal-scope-store.js'
import api from '@/axios/axios-helper.js'
import { normalizeTangRow, normalizeSetterRow, buildMonthRange, monthKeyOf, filterRowsByMonthKeys } from '@/services/utils/gold-loss/slip-monthly-helpers.js'
import {
  resolveActiveTab,
  resolveKpiSalesTarget,
  shouldShowHeaderMetalToggle,
  buildSummaryExcelRows,
  buildStalePlansExcelRows,
  buildReceivablesExcelRows,
  buildSalesOrdersExcelRows,
  buildStockAgingExcelRows,
  buildGoldLossMonthlyExcelRows,
  buildGoldLossByWorkerExcelRows
} from './executive-helpers.js'
import {
  INSIGHT_EXCEL_TOPICS,
  CAPACITY_EXCEL_WIDTH,
  GOLD_EXCEL_WIDTH,
  formatExcelRangeText,
  buildRangeLeadRows,
  buildTopicRangeTexts,
  buildPositionalColumns,
  buildInsightFindingsExcelRows,
  buildStageLeadTimeExcelRows,
  buildDeliveryPlansExcelRows,
  buildCapacityExcelRows,
  buildGoldExcelRows,
  buildWorkersExcelRows,
  buildMaterialsWaitingExcelRows
} from './executive-insight-excel-helpers.js'
import { buildSnapshotInsightSheets } from './executive-insight-excel-stock-sales-material.js'
import { resolveDigestNavigation, buildDigestExcelSheet } from './executive-digest-helpers.js'
import { stockConfig } from './stock/stock.config.js'
import { salesConfig } from './sales/sales.config.js'
import { materialGoldConfig } from './material/material.config.js'
import { STOCK_INSIGHT_ENDPOINT, buildOverviewParams as buildStockOverviewParams } from './stock/stock-helpers.js'
import { SALES_INSIGHT_ENDPOINT, buildOverviewParams as buildSalesOverviewParams } from './sales/sales-helpers.js'
import { MATERIAL_ENDPOINT, buildOverviewParams as buildMaterialOverviewParams } from './material/material-helpers.js'
import {
  buildDefaultWipFilter,
  buildDefaultDeliveryFilter,
  buildDefaultGoldFilter,
  buildDefaultCapacityFilter,
  buildDefaultWorkersFilter,
  buildDefaultMaterialsFilter
} from '@/views/production/insight/insight-filters.js'

import DashboardHeaderGeneric from '@/components/generic/DashboardHeaderGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import TabViewGeneric from '@/components/generic/TabViewGeneric.vue'
import ToggleGroupGeneric from '@/components/generic/ToggleGroupGeneric.vue'

import summaryView from './components/summary-view.vue'
import digestView from './components/digest-view.vue'
import salesInsightView from './components/sales-insight-view.vue'
import stockInsightView from './components/stock-insight-view.vue'
import materialInsightView from './components/material-insight-view.vue'
import flowView from './components/flow-view.vue'
import productionInsightView from '@/views/production/insight/index-view.vue'

// จำนวนเฟรมที่รอให้เนื้อหาแท็บ mount ก่อนยอมเลื่อนมาที่กรอบแท็บ
const SCROLL_RETRY_FRAMES = 12
const EXPORT_TAKE = 5000
// Kendo take=0 = ทุกแถว (ใช้กับตาราง insight ที่ export ครบทุกหน้า)
const EXPORT_ALL_ROWS = 0

const INSIGHT_FILTER_BUILDERS = {
  wip: buildDefaultWipFilter,
  delivery: buildDefaultDeliveryFilter,
  capacity: buildDefaultCapacityFilter,
  gold: buildDefaultGoldFilter,
  workers: buildDefaultWorkersFilter,
  materials: buildDefaultMaterialsFilter
}

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
    ToggleGroupGeneric,
    summaryView,
    digestView,
    salesInsightView,
    stockInsightView,
    materialInsightView,
    flowView,
    productionInsightView
  },

  setup() {
    const executiveReportStore = useExecutiveReportApiStore()
    const productionInsightStore = useProductionInsightApiStore()
    const masterStore = useMasterApiStore()
    const metalScopeStore = useMetalScopeStore()
    return { executiveReportStore, productionInsightStore, masterStore, metalScopeStore }
  },

  data() {
    return {
      summary: emptySummary(),
      // Executive Digest (null = ยังไม่โหลด/โหลดไม่ได้ — ส่วนอื่นของหน้าไม่ขึ้นกับค่านี้)
      digest: null,
      digestLoading: false,
      // แท็บผลิต: หมวดย่อยปลายทางจาก Digest { view } (object ใหม่ทุกครั้งที่กด)
      productionTarget: null,
      productionFilter: { departmentKeys: [], minDays: 180 },
      goldLossRankingRange: '3m',
      // โลหะทั้งหน้า GOLD|SILVER|ALL — ค่าจริงอ่านจาก ?metal= ใน created() ก่อน child mount (store ฝั่ง API อ่านจาก metalScopeStore)
      metal: parseMetalQuery(this.$route.query.metal),
      refreshToken: 0,
      activeTab: 'production',
      isApplyingRouteQuery: false,
      // ?sub= ที่เป็นของแท็บคลังสินค้า (อ่านตอนเข้าหน้าด้วย tab=stock เท่านั้น)
      stockInitialSub: '',
      // แท็บ "ขายและเงิน": sub ตั้งต้นจาก ?sub= (เข้าหน้าด้วย tab=sales) · salesTarget = ปลายทางจากการ์ดสรุป (object ใหม่ทุกครั้งที่กด)
      salesInitialSub: '',
      // แท็บ "คลังวัตถุดิบ": sub/kind ตั้งต้นจาก ?sub= ?kind= (เข้าหน้าด้วย tab=material เท่านั้น)
      materialInitialSub: '',
      materialInitialKind: '',
      salesTarget: null,
      scrollToken: 0
    }
  },

  computed: {
    asOfSubtitle() {
      if (!this.summary.asOf) return ''
      return `${this.$t('view.executive.asOf', { date: formatDateTime(this.summary.asOf) })} · ${this.metalLabel(this.metal)}`
    },

    // ปุ่มสลับโลหะมีที่เดียวเสมอ: แท็บผลิตแสดงในแถบเครื่องมือของ insight (แถวเดียวกับช่วงเวลา/ตัวกรอง) แท็บอื่นแสดงที่ header
    showHeaderMetalToggle() {
      return shouldShowHeaderMetalToggle(this.activeTab)
    },

    metalOptions() {
      return METAL_SCOPE_VALUES.map((value) => ({ value, label: this.metalLabel(value) }))
    },

    tabsConfig() {
      return [
        { value: 'production', label: this.$t('view.executive.tabs.production') },
        { value: 'sales', label: this.$t('view.executive.tabs.sales') },
        { value: 'stock', label: this.$t('view.executive.tabs.stock') },
        { value: 'material', label: this.$t('view.executive.tabs.material') },
        { value: 'flow', label: this.$t('view.executive.tabs.flow') }
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
      this.syncStateToQuery(true)
    },

    // store ต้องถูกตั้งก่อน child ถูก remount (key=metal) — watcher แบบ pre-flush จึงรันก่อน render เสมอ child ที่ mount
    // ใหม่ยิง request ของตัวเองด้วย metal ใหม่ครั้งเดียวต่อ endpoint ที่มองเห็น (หมวดอื่นของ insight ที่ยังไม่เคยเปิด
    // ไม่ถูก mount) — Summary ยิงที่นี่
    metal(value) {
      this.metalScopeStore.setMetal(value)
      this.productionTarget = null
      this.syncStateToQuery()
      this.fetchSummary()
      this.fetchDigest()
    }
  },

  methods: {
    async fetchSummary() {
      const res = await this.executiveReportStore.fetchSummary()
      this.summary = res ? { ...emptySummary(), ...res } : emptySummary()
    },

    // Digest เป็นส่วนเสริม — fetchDigest คืน null เมื่อล้ม (ไม่ขึ้น modal) การ์ดแสดงสถานะ "ไม่ทราบ" โดยส่วนอื่นยังใช้งานได้
    async fetchDigest() {
      this.digestLoading = true
      this.digest = await this.executiveReportStore.fetchDigest()
      this.digestLoading = false
    },

    // อ่าน ?tab= ตอนเข้าหน้า/back-forward — ตั้ง guard กัน syncStateToQuery ยิง replace ซ้ำระหว่างที่กำลัง apply จาก query เอง
    applyQueryToState(query) {
      this.isApplyingRouteQuery = true
      this.activeTab = resolveActiveTab(query.tab)
      this.stockInitialSub = this.activeTab === 'stock' ? String(query.sub || '') : ''
      this.salesInitialSub = this.activeTab === 'sales' ? String(query.sub || '') : ''
      this.materialInitialSub = this.activeTab === 'material' ? String(query.sub || '') : ''
      this.materialInitialKind = this.activeTab === 'material' ? String(query.kind || '') : ''
      this.$nextTick(() => {
        this.isApplyingRouteQuery = false
      })
    },

    // resetSub: เปลี่ยนแท็บ → ลบ ?sub= (เป็นของแท็บผลิต/ขาย/คลังสินค้า/คลังวัตถุดิบที่เพิ่งออกมา กันค้างข้ามแท็บ) · kind= เป็นของแท็บคลังวัตถุดิบ
    syncStateToQuery(resetSub = false) {
      if (this.isApplyingRouteQuery) return
      const query = { ...this.$route.query, tab: this.activeTab }
      if (resetSub) {
        delete query.sub
        delete query.kind
      }
      const metalQuery = metalToQuery(this.metal)
      if (metalQuery) query.metal = metalQuery
      else delete query.metal
      // ?flow= เป็นของแท็บ Flow เท่านั้น (state ของฉาก 3 มิติ) — ออกจากแท็บแล้วไม่ต้องค้างใน URL
      if (this.activeTab !== 'flow') delete query.flow
      this.$router.replace({ query }).catch(() => {})
    },

    metalLabel(value) {
      return this.$t(`view.executive.metalScope.options.${value}`)
    },

    onMetalChange(value) {
      this.metal = parseMetalQuery(value)
    },

    // kpiKey (เฉพาะกดการ์ดสรุป) → แท็บ "ขายและเงิน" เปิดตรงแท็บย่อย/ตัวสลับของบิลนั้น
    onTabChange(tab, kpiKey) {
      this.activeTab = resolveActiveTab(tab)
      this.productionTarget = null
      this.salesTarget = this.activeTab === 'sales' && kpiKey ? resolveKpiSalesTarget(kpiKey) : null
    },

    // การ์ดโดเมน / [ดู ›] ของ Digest → แท็บ + (ผลิต: หมวดย่อย · ขาย: แท็บย่อย/ตัวสลับของบิล) — ใช้กลไก target เดียวกับการ์ดสรุป
    onDigestSelect(domain, target) {
      const nav = resolveDigestNavigation(domain, target)
      this.activeTab = resolveActiveTab(nav.tab)
      this.productionTarget = nav.productionTarget
      this.salesTarget = nav.salesTarget
      this.scrollToTabs(target?.reportRef)
    },

    // การ์ดสรุป → เปลี่ยนแท็บแล้วเลื่อนลงมาที่เนื้อหา (คลิกแถบแท็บตรงๆ ไม่เลื่อน — ผู้ใช้อยู่ตรงนั้นแล้ว)
    onSummarySelect(tab, kpiKey) {
      this.onTabChange(tab, kpiKey)
      this.scrollToTabs()
    },

    // รอแท็บ mount (lazy) แล้วเลื่อนมาที่เนื้อหา · มี reportRef → ลองหา insight-report-<ref> ไม่เกิน N เฟรม ไม่เจอ = เลื่อนมาที่กรอบแท็บ (ไม่ throw)
    // scroll-margin-top ของ insight-report-* ถูกตั้งไว้ใน BlockFrame/InsightBlockNode แล้ว ส่วนกรอบแท็บตั้งใน SCSS ของไฟล์นี้
    scrollToTabs(reportRef) {
      const scrollTo = (el) => {
        if (!el || typeof el.scrollIntoView !== 'function') return
        const reduce = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
        el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
      }
      const finish = (el) => {
        const wrap = this.$refs.tabsWrap
        scrollTo(el || wrap)
        if (wrap && typeof wrap.focus === 'function') wrap.focus({ preventScroll: true })
      }
      this.scrollToken += 1
      const token = this.scrollToken
      this.$nextTick(() => {
        if (!reportRef) return finish(null)
        let frames = 0
        const tryFind = () => {
          if (token !== this.scrollToken) return
          const el = document.getElementById(`insight-report-${reportRef}`)
          if (el || frames >= SCROLL_RETRY_FRAMES) return finish(el)
          frames += 1
          requestAnimationFrame(tryFind)
        }
        requestAnimationFrame(tryFind)
      })
    },

    onRefresh() {
      this.fetchSummary()
      this.fetchDigest()
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

    // ตัวกรองที่ผู้ใช้เลือกอยู่บนจอ (production-insight index-view ถือ filters ต่อหมวด) — ถ้ายังไม่ได้ mount
    // (ไม่เคยเปิดแท็บผลิต) ใช้ default ของแต่ละหมวด (3 เดือน)
    resolveInsightExportFilters() {
      const onScreen = this.$refs.insight?.filters || {}
      return Object.fromEntries(INSIGHT_EXCEL_TOPICS.map((key) => [key, onScreen[key] || INSIGHT_FILTER_BUILDERS[key]()]))
    },

    // ยิงข้อมูลเพิ่มของ 7 sheet insight พร้อมกันทีเดียว (เฉพาะตอนกดปุ่ม) ด้วยช่วงเวลาเดียวกับที่เห็นบนจอ
    async fetchInsightExportData(filters) {
      const store = this.productionInsightStore
      const range = (f) => ({ start: f.start, end: f.end })
      // หมวดทองดูทีละโลหะ — ทั้งหน้าเป็น รวม = ทอง (เหมือนบนจอ)
      const goldMetal = resolveGoldTabMetal(this.metal)
      const [wip, leadTime, delivery, atRisk, late, capacity, gold, goldStage, workers, materials, waiting] = await Promise.all([
        store.fetchWip({
          ...range(filters.wip),
          staleDays: filters.wip.staleDays,
          riskWindowDays: filters.wip.riskWindowDays,
          growthThresholdPercent: filters.wip.growthThresholdPercent
        }),
        store.fetchStageLeadTime({ ...range(filters.wip), bucket: filters.wip.bucket }),
        store.fetchDelivery({ ...range(filters.delivery), bucket: filters.delivery.bucket, riskHorizonDays: filters.delivery.riskHorizonDays }),
        store.fetchDeliveryAtRiskPlans({
          take: EXPORT_ALL_ROWS,
          riskHorizonDays: filters.delivery.riskHorizonDays,
          departmentKeys: filters.delivery.departmentKeys
        }),
        store.fetchDeliveryLatePlans({ ...range(filters.delivery), take: EXPORT_ALL_ROWS }),
        store.fetchCapacity({
          ...range(filters.capacity),
          bucket: 'month',
          unit: filters.capacity.unit,
          productTypes: filters.capacity.productTypes,
          golds: filters.capacity.golds,
          goldSizes: filters.capacity.goldSizes,
          breakdownBy: filters.capacity.breakdownBy
        }),
        store.fetchGold({
          ...range(filters.gold),
          bucket: filters.gold.bucket,
          workerTypes: filters.gold.workerTypes,
          workerCodes: filters.gold.workerCodes,
          metal: goldMetal
        }),
        store.fetchGoldByStage({ ...range(filters.gold), metal: goldMetal }),
        store.fetchWorkers({
          ...range(filters.workers),
          departmentKeys: filters.workers.departmentKeys,
          employmentTypes: filters.workers.employmentTypes
        }),
        store.fetchMaterials(range(filters.materials)),
        store.fetchMaterialWaitingPlans({ take: EXPORT_ALL_ROWS }),
        this.masterStore.fetchGem(),
        this.masterStore.fetchGemShape()
      ])
      return { wip, leadTime, delivery, atRisk, late, capacity, gold, goldStage, workers, materials, waiting }
    },

    // ข้อมูล insight ของแท็บคลังสินค้า / ขายและเงิน / คลังวัตถุดิบ (snapshot ไม่มีช่วงเวลา) — ยิงพร้อมกันตอนกดปุ่ม เหมือนที่แท็บเรียก (body ตรงกับ view ของแต่ละแท็บ)
    async fetchSnapshotInsightData() {
      const store = this.productionInsightStore
      const [stock, sales, material] = await Promise.all([
        store.post(STOCK_INSIGHT_ENDPOINT, buildStockOverviewParams()),
        store.post(SALES_INSIGHT_ENDPOINT, buildSalesOverviewParams()),
        // คลังวัตถุดิบไม่ผูก metal scope → postRaw (ไม่เติม metal)
        store.postRaw(MATERIAL_ENDPOINT, buildMaterialOverviewParams('GOLD'))
      ])
      return { stock, sales, material }
    },

    buildSnapshotExportSheets(data) {
      return buildSnapshotInsightSheets(data, {
        t: (key, params) => this.$t(key, params),
        metal: this.metal,
        metalLabel: this.metalLabel(this.metal),
        stockConfig,
        salesConfig,
        materialConfig: materialGoldConfig,
        materialKindLabel: this.$t('view.productionInsight.materialInsight.kind.GOLD')
      })
    },

    buildInsightExportSheets(data, filters) {
      const t = (key, params) => this.$t(key, params)
      const L = (key) => this.$t(`view.executive.excel.insight.${key}`)
      // หัวช่วงเวลาของทุก sheet ระบุโลหะที่เลือกด้วย (sheet ทองและ Loss ใช้โลหะที่หมวดทองแสดงจริง)
      const metalOf = (key) => this.metalLabel(key === 'gold' ? resolveGoldTabMetal(this.metal) : this.metal)
      const rangeText = (key) => formatExcelRangeText(t, filters[key].start, filters[key].end, metalOf(key))
      const col = (header, key) => ({ header, key })

      const sourceByTopic = {
        wip: data.wip,
        delivery: data.delivery,
        capacity: data.capacity,
        gold: data.gold,
        workers: data.workers,
        materials: data.materials
      }
      const findingsTopics = INSIGHT_EXCEL_TOPICS.map((key) => ({
        key,
        problems: sourceByTopic[key]?.problems,
        forecasts: sourceByTopic[key]?.forecasts,
        actions: sourceByTopic[key]?.actions
      }))
      const findingsRangeTexts = buildTopicRangeTexts(
        INSIGHT_EXCEL_TOPICS.map((key) => ({ key, start: filters[key].start, end: filters[key].end, metalLabel: metalOf(key) })),
        t
      )

      return [
        {
          sheetName: L('sheetFindings'),
          data: [...buildRangeLeadRows(findingsRangeTexts, 'topic'), ...buildInsightFindingsExcelRows(findingsTopics, t)],
          columns: [
            col(L('colTopic'), 'topic'),
            col(L('colKind'), 'kind'),
            col(L('colSeverity'), 'severity'),
            col(L('colText'), 'text'),
            col(L('colOwner'), 'owner')
          ]
        },
        {
          sheetName: L('sheetLeadTime'),
          data: [
            ...buildRangeLeadRows(rangeText('wip'), 'dept'),
            ...buildStageLeadTimeExcelRows(data.leadTime?.departments, data.leadTime?.capacity?.departments, t)
          ],
          columns: [
            col(L('colDept'), 'dept'),
            col(L('leadColStandard'), 'standard'),
            col(L('leadColMedian'), 'medianTotal'),
            col(L('leadColP90'), 'p90'),
            col(L('leadColWait'), 'wait'),
            col(L('leadColWork'), 'work'),
            col(L('leadColOverStandard'), 'overStandardPercent'),
            col(L('leadColExited'), 'exited'),
            col(L('leadColCurrentWaiting'), 'currentWaiting'),
            col(L('leadColAbnormal'), 'abnormal'),
            col(L('leadColActiveWip'), 'activeWip'),
            col(L('leadColQueueCurrent'), 'queueDaysCurrent'),
            col(L('leadColQueueStandard'), 'queueDaysAtStandard'),
            col(L('colBottleneck'), 'bottleneck')
          ]
        },
        {
          sheetName: L('sheetDeliveryPlans'),
          data: [...buildRangeLeadRows(rangeText('delivery'), 'type'), ...buildDeliveryPlansExcelRows(data.atRisk?.data, data.late?.data, t)],
          columns: [
            col(L('deliveryColType'), 'type'),
            col(L('deliveryColWo'), 'wo'),
            col(L('deliveryColProduct'), 'product'),
            col(L('deliveryColDueDate'), 'dueDate'),
            col(L('deliveryColFinishDate'), 'finishDate'),
            col(L('deliveryColLateDays'), 'lateDays'),
            col(L('colDept'), 'dept'),
            col(L('deliveryColWorkers'), 'workers')
          ]
        },
        {
          sheetName: L('sheetCapacity'),
          data: buildCapacityExcelRows(data.capacity?.kpi, data.capacity?.costCardToDone, data.capacity?.departments, t, data.capacity?.breakdown),
          columns: buildPositionalColumns(rangeText('capacity'), CAPACITY_EXCEL_WIDTH)
        },
        {
          sheetName: L('sheetGold'),
          data: buildGoldExcelRows(data.gold?.workers, data.goldStage?.departments, t),
          columns: buildPositionalColumns(rangeText('gold'), GOLD_EXCEL_WIDTH)
        },
        {
          sheetName: L('sheetWorkers'),
          data: [...buildRangeLeadRows(rangeText('workers'), 'name'), ...buildWorkersExcelRows(data.workers?.workers, t)],
          columns: [
            col(L('colWorkerName'), 'name'),
            col(L('colWorkerCode'), 'code'),
            col(L('colDept'), 'dept'),
            col(L('workersColEmploymentType'), 'employmentType'),
            col(L('workersColJobs'), 'jobs'),
            col(L('workersColPlans'), 'plans'),
            col(L('workersColWages'), 'wages'),
            col(L('workersColWagePerJob'), 'wagePerJob'),
            col(L('workersColShare'), 'shareOfDeptJobs'),
            col(L('workersColGold'), 'gold')
          ]
        },
        {
          sheetName: L('sheetMaterials'),
          data: [
            ...buildRangeLeadRows([rangeText('materials'), L('snapshotNote')], 'wo'),
            ...buildMaterialsWaitingExcelRows(data.waiting?.data, this.masterStore.gem, this.masterStore.gemShape, t)
          ],
          columns: [
            col(L('materialsColWo'), 'wo'),
            col(L('materialsColProduct'), 'product'),
            col(L('materialsColWaitingDays'), 'waitingDays'),
            col(L('materialsColGems'), 'gems'),
            col(L('materialsColGemStatus'), 'gemStatus'),
            col(L('materialsColDueDate'), 'dueDate')
          ]
        }
      ]
    },

    async onExportExcel() {
      const insightFilters = this.resolveInsightExportFilters()
      const [stalePlansRes, receivablesRes, salesOrdersRes, stockHealthRes, goldLossWorkerRows, insightData, snapshotData, digestData] = await Promise.all([
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
        this.fetchGoldLossWorkerReportsForExport(),
        this.fetchInsightExportData(insightFilters),
        this.fetchSnapshotInsightData(),
        this.digest ? this.digest : this.executiveReportStore.fetchDigest()
      ])

      const goldLossCompareMonthKeys = buildMonthRange(dayjs().subtract(5, 'month'), dayjs()).map((m) => monthKeyOf(m.year, m.month))
      const goldLossRankingMonthKeys =
        this.goldLossRankingRange === 'thisMonth' ? goldLossCompareMonthKeys.slice(-1) : goldLossCompareMonthKeys.slice(-3)
      const goldLossDeptLabels = {
        tang: this.$t('view.production.goldLossShared.slipDeptTang'),
        setter: this.$t('view.production.goldLossShared.slipDeptSetter')
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
            data: [{ label: this.$t('view.executive.excel.metalRow'), value: this.metalLabel(this.metal) }, ...buildSummaryExcelRows(this.summary, summaryLabels)],
            columns: [
              { header: this.$t('view.executive.excel.colLabel'), key: 'label' },
              { header: this.$t('view.executive.excel.colValue'), key: 'value' }
            ]
          },
          {
            sheetName: this.$t('view.executive.excel.sheetStalePlans'),
            data: buildStalePlansExcelRows(stalePlansRes?.data, this.departmentLabelMap, this.$t('view.productionInsight.wip.lastActionCreated')),
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
              { header: this.$t('view.executive.production.colLastUpdateBy'), key: 'lastUpdateBy' },
              { header: this.$t('view.executive.production.colLastAction'), key: 'lastAction' },
              { header: this.$t('view.executive.production.colLastActionDate'), key: 'lastActionDate' },
              { header: this.$t('view.executive.production.colWorkers'), key: 'workers' },
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
              { header: this.$t('view.executive.goldLossTrend.excel.colScrapReturnGram'), key: 'scrapReturnGram' },
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
              { header: this.$t('view.executive.goldLossTrend.excel.colScrapReturnGram'), key: 'scrapReturnGram' },
              { header: this.$t('view.executive.goldLossTrend.excel.colLossPercent'), key: 'lossPercent' }
            ]
          },
          ...(digestData ? [buildDigestExcelSheet(digestData, (key, params) => this.$t(key, params))] : []),
          ...this.buildInsightExportSheets(insightData, insightFilters),
          ...this.buildSnapshotExportSheets(snapshotData)
        ],
        { filename: `${this.$t('view.executive.excel.filenamePrefix')}-${dayjs().format('YYYY-MM-DD')}.xlsx` }
      )
    }
  },

  beforeUnmount() {
    this.scrollToken += 1
  },

  created() {
    this.metalScopeStore.setMetal(this.metal)
    this.applyQueryToState(this.$route.query)
  },

  mounted() {
    this.fetchSummary()
    this.fetchDigest()
  }
}
</script>

<style lang="scss" scoped>
.executive-tabs {
  scroll-margin-top: calc(var(--mainbar-height) + var(--sp-md));

  &:focus {
    outline: none;
  }
}
</style>
