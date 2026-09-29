<!--
  overview-section — หมวด "ภาพรวม" ของ ProductionInsightView (Dashboard v2, Phase 1)
  KPI 6 ช่อง reuse dashboard-stats-cards.vue ตรงๆ (ไม่คำนวณซ้ำ) + 2x2 legend grid:
  (a) งานค้างแยกแผนก, (b) พยากรณ์ปิดงาน (reuse completed-forecast-panel.vue), (c) ปิดงานรายเดือน 13 เดือน,
  (d) ทองเดือนนี้ (mini KPI ใหม่ — gold-this-month-panel.vue)
-->
<template>
  <div class="overview-section">
    <SectionCardGeneric :title="$t('view.productionInsight.overview.kpiTitle')" icon="bi-graph-up" accent="main" headerStyle="dashboard">
      <DashboardStatsCards
        :totalPlans="totalPlans"
        :inProgressPlans="inProgressPlans"
        :completedPlans="completedPlans"
        :pendingPlans="pendingPlans"
        :summary="summary"
        :loading="loadingKpi"
      />
    </SectionCardGeneric>

    <div class="charts-row-b">
      <SectionCardGeneric :title="$t('view.executive.production.byDepartmentTitle')" icon="bi-diagram-3" accent="main" headerStyle="legend">
        <DepartmentWipChart :departments="productionWip.departments" :loading="loadingWip" />
      </SectionCardGeneric>

      <CompletedForecastPanel :rows="completedDailySeriesRows" :loading="loadingForecast" bare />
    </div>

    <div class="charts-row-b">
      <SectionCardGeneric :title="$t('view.executive.production.monthlyCompletedTitle')" icon="bi-calendar-month" accent="main" headerStyle="legend">
        <MonthlyCompletedChart :monthlyCompleted="productionWip.monthlyCompleted" :loading="loadingWip" />
      </SectionCardGeneric>

      <GoldThisMonthPanel @switch-section="$emit('switch-section', $event)" />
    </div>
  </div>
</template>

<script>
import { useProductionDailyApiStore } from '@/stores/modules/api/plan/daily-store-api.js'
import { useExecutiveReportApiStore } from '@/stores/modules/api/report/executive-report-api.js'

import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import DashboardStatsCards from '@/views/production/dashboard/components/dashboard-stats-cards.vue'
import CompletedForecastPanel from '@/views/production/dashboard/components/completed-forecast-panel.vue'
import DepartmentWipChart from '../components/department-wip-chart.vue'
import MonthlyCompletedChart from '../components/monthly-completed-chart.vue'
import GoldThisMonthPanel from '../components/gold-this-month-panel.vue'

export default {
  name: 'ProductionInsightOverviewSection',

  components: {
    SectionCardGeneric,
    DashboardStatsCards,
    CompletedForecastPanel,
    DepartmentWipChart,
    MonthlyCompletedChart,
    GoldThisMonthPanel
  },

  setup() {
    const dailyApiStore = useProductionDailyApiStore()
    const executiveReportStore = useExecutiveReportApiStore()
    return { dailyApiStore, executiveReportStore }
  },

  props: {
    filter: {
      type: Object,
      required: true
    }
  },

  emits: ['switch-section'],

  data() {
    return {
      loadingKpi: false,
      loadingWip: false,
      loadingForecast: false,
      productionWip: { departments: [], monthlyCompleted: [] }
    }
  },

  computed: {
    // ครบชุดฟิลด์ตาม initDailyPlanRequest ของ daily-store-api.js — ฟิลด์ที่หน้านี้ไม่มี (text/mold/
    // productNumber/customerCode/status/isOverPlan) ส่ง null/ค่าเริ่มต้นเสมอ
    dailyPlanFilterParams() {
      return {
        start: this.filter.start,
        end: this.filter.end,
        gold: this.filter.gold,
        goldSize: this.filter.goldSize,
        productType: this.filter.productType,
        customerType: this.filter.customerType,
        status: [],
        isOverPlan: 0
      }
    },

    // เหมือน sharedFilterOnly ของ views/production/dashboard/index-view.vue — CompletedDailySeries
    // ไม่รับ start/end/status/isOverPlan (backend ยึดเดือนปัจจุบันเสมอ)
    sharedFilterOnly() {
      return {
        gold: this.filter.gold,
        goldSize: this.filter.goldSize,
        productType: this.filter.productType,
        customerType: this.filter.customerType
      }
    },

    totalPlans() {
      return this.dailyApiStore.getTotalPlans
    },
    inProgressPlans() {
      return this.dailyApiStore.getInProgressPlans
    },
    completedPlans() {
      return this.dailyApiStore.getCompletedPlans
    },
    pendingPlans() {
      return this.dailyApiStore.getPendingPlans
    },
    summary() {
      return this.dailyApiStore.getSummary
    },
    completedDailySeriesRows() {
      return this.dailyApiStore.getCompletedDailySeriesRows
    }
  },

  watch: {
    filter: {
      handler() {
        this.fetchAll()
      },
      deep: true,
      immediate: true
    }
  },

  methods: {
    fetchAll() {
      this.fetchKpi()
      this.fetchWip()
      this.fetchForecast()
    },

    async fetchKpi() {
      this.loadingKpi = true
      await this.dailyApiStore.fetchDailyPlan(true, this.dailyPlanFilterParams)
      this.loadingKpi = false
    },

    async fetchWip() {
      this.loadingWip = true
      const res = await this.executiveReportStore.fetchProductionWip()
      this.productionWip = res
        ? { departments: res.departments || [], monthlyCompleted: res.monthlyCompleted || [] }
        : { departments: [], monthlyCompleted: [] }
      this.loadingWip = false
    },

    async fetchForecast() {
      this.loadingForecast = true
      await this.dailyApiStore.fetchCompletedDailySeries(this.sharedFilterOnly)
      this.loadingForecast = false
    }
  }
}
</script>

<style lang="scss" scoped>
.overview-section > * + * {
  margin-top: var(--sp-lg);
}

.charts-row-b {
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: stretch;
  gap: var(--sp-md);
  // เผื่อพื้นที่ให้ legend chip คร่อมขอบบนที่ระดับ container แทน margin-top ของ .section-card--legend
  // เอง (ดู override ด้านล่าง) — กล่องขวา (CompletedForecastPanel bare) ห่อ .section-card ไว้อีกชั้น
  // ทำให้ margin ของมันไม่ไปโผล่ที่ grid item เดียวกับกล่องซ้าย (SectionCardGeneric ตรงๆ) เริ่มคนละ y กัน
  // ถ้าปล่อยให้ต่างฝ่ายต่างมี margin-top เอง — ยก clearance มาไว้ที่ container ให้ทุกกล่องเริ่ม y เดียวกันเป๊ะ
  padding-top: var(--sp-2xl);

  > * {
    min-width: 0;
  }

  // บังคับกล่อง legend ทุกใบใน grid นี้สูงเท่ากัน (ขอบล่างตรงกัน) แทนปล่อยให้สูงตามเนื้อหาตัวเอง —
  // แล้วให้พื้นที่กราฟ (ChartGeneric) ขยายเต็มพื้นที่ที่เหลือ (flex column + center) แทนเหลือช่องว่างท้ายกล่อง
  :deep(.section-card) {
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  :deep(.section-card--legend) {
    margin-top: 0 !important;
  }

  :deep(.chart-generic-wrap) {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    padding-top: 0;

    :deep(.section-card) {
      height: auto;
    }

    // ยุบเป็น 1 คอลัมน์ = กล่องเรียงต่อกันแนวตั้งเหมือน section ทั่วไปแล้ว ไม่ต้อง align กับกล่องข้างๆ อีก
    // ต่อกล่องต้องมี margin-top ของตัวเอง (คืนค่าเดิม) ไม่งั้นกล่องที่ 2 ในคอลัมน์ไม่มีที่เผื่อให้ legend chip
    :deep(.section-card--legend) {
      margin-top: var(--sp-2xl) !important;
    }
  }
}
</style>
