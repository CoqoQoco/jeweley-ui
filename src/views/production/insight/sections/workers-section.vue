<!--
  workers-section — หมวด "ช่างและค่าแรง" ของ ProductionInsightView — ยิง ProductionInsight/Workers ครั้งเดียว
  ได้ทั้ง problems/forecasts/actions/status + kpi/series/seriesTotal/workers/concentration — ตาราง "งานที่ยัง
  ไม่บันทึกค่าแรง" เป็น panel แยก (ยิง UnpaidPieceJobs เอง, paginate อิสระ) — departmentKeys/employmentTypes
  ของแผงตัวกรองหลักส่งไป server จริง (ต่างจาก capacity ที่ departmentKeys เป็น client-side ล้วน) จึง deep-watch
  ทั้ง filter เหมือนหมวด wip/delivery/gold

  Props:
    filter — Object (required) — รวม departmentKeys/employmentTypes + ช่วงเวลา
    active — Boolean (true) — false เมื่อ mounted ค้างไว้แต่ไม่ใช่หมวดที่เปิดอยู่ (v-show ซ่อน) — ตัวกรอง
             เปลี่ยนตอนไม่ active ไม่ยิง Workers ทันที แค่ติดธง needsRefetch ไว้ยิงใหม่ตอนกลับมา active
-->
<template>
  <InsightTabLayout
    :title="$t('view.productionInsight.nav.workers')"
    :status="status"
    :problems="problems"
    :forecasts="forecasts"
    :actions="actions"
    :loading="loading"
  >
    <template #report>
      <WorkersKpiGroup :kpi="kpi" :asOf="asOf" :loading="loading" @goto-report="scrollToReport" />

      <div id="insight-report-wrkTrend" class="workers-section__anchor">
        <SectionCardGeneric :title="$t('view.productionInsight.workers.trendTitle')" icon="bi-graph-up-arrow" accent="main" headerStyle="legend">
          <WorkersTrendChart :series="series" :seriesTotal="seriesTotal" :loading="loading" />
        </SectionCardGeneric>
      </div>

      <WorkersTablePanel :workers="workers" :start="filter.start" :end="filter.end" :loading="loading" />

      <WorkersUnpaidJobsPanel :start="filter.start" :end="filter.end" :departmentKeys="filter.departmentKeys" />
    </template>
  </InsightTabLayout>
</template>

<script>
import { useProductionInsightApiStore } from '@/stores/modules/api/production/production-insight-api.js'

import InsightTabLayout from '@/components/insight/insight-tab-layout.vue'
import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import WorkersKpiGroup from '../components/workers-kpi-group.vue'
import WorkersTrendChart from '../components/workers-trend-chart.vue'
import WorkersTablePanel from '../components/workers-table-panel.vue'
import WorkersUnpaidJobsPanel from '../components/workers-unpaid-jobs-panel.vue'

const emptyKpi = () => ({
  wagesPerMonth: null,
  wagesByDept: [],
  wagePerOutputPlan: null,
  activeWorkers: null,
  activeWorkersByDept: [],
  outsideWageShare: null,
  unpaidPieceJobs: null,
  excludesSalaried: false
})

export default {
  name: 'ProductionInsightWorkersSection',

  components: {
    InsightTabLayout,
    SectionCardGeneric,
    WorkersKpiGroup,
    WorkersTrendChart,
    WorkersTablePanel,
    WorkersUnpaidJobsPanel
  },

  setup() {
    const productionInsightStore = useProductionInsightApiStore()
    return { productionInsightStore }
  },

  props: {
    filter: {
      type: Object,
      required: true
    },
    active: {
      type: Boolean,
      default: true
    }
  },

  data() {
    return {
      loading: false,
      status: '',
      problems: [],
      forecasts: [],
      actions: [],
      kpi: emptyKpi(),
      series: [],
      seriesTotal: [],
      workers: [],
      concentration: [],
      asOf: null,
      needsRefetch: false
    }
  },

  watch: {
    filter: {
      handler() {
        if (this.active) this.fetchWorkers()
        else this.needsRefetch = true
      },
      deep: true
    },

    // กลับมาเป็นหมวดที่เปิดอยู่หลังตัวกรองเปลี่ยนตอนถูกซ่อน (needsRefetch ติดไว้) — ยิงรอบเดียวตอนนี้แทน
    active(value) {
      if (value && this.needsRefetch) {
        this.needsRefetch = false
        this.fetchWorkers()
      }
    }
  },

  methods: {
    scrollToReport(reportRef) {
      const el = document.getElementById(`insight-report-${reportRef}`)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    },

    async fetchWorkers() {
      this.loading = true
      const res = await this.productionInsightStore.fetchWorkers({
        start: this.filter.start,
        end: this.filter.end,
        departmentKeys: this.filter.departmentKeys,
        employmentTypes: this.filter.employmentTypes
      })
      this.status = res?.status || ''
      this.problems = res?.problems || []
      this.forecasts = res?.forecasts || []
      this.actions = res?.actions || []
      this.kpi = res?.kpi ? { ...emptyKpi(), ...res.kpi } : emptyKpi()
      this.series = res?.series || []
      this.seriesTotal = res?.seriesTotal || []
      this.workers = res?.workers || []
      this.concentration = res?.concentration || []
      this.asOf = res?.asOf ?? null
      this.loading = false
    }
  },

  created() {
    this.fetchWorkers()
  }
}
</script>

<style lang="scss" scoped>
.workers-section__anchor {
  scroll-margin-top: calc(var(--mainbar-height) + 64px);
}
</style>
