<!--
  materials-section — หมวด "วัตถุดิบที่กระทบการผลิต" ของ ProductionInsightView (พลอยอย่างเดียว ตามที่ user
  ยืนยัน) — ยิง ProductionInsight/Materials ครั้งเดียวได้ทั้ง problems/forecasts/actions/status +
  kpi/series — ตาราง waiting/demand/lowCover เป็น panel แยก (ยิง endpoint ของตัวเอง, ตัวกรองเป็น local state
  ของแต่ละ panel เอง ไม่มี start/end เพราะเป็น snapshot ปัจจุบัน) — filter มีแค่ช่วงเวลา (ไม่มี departmentKeys/
  อื่นๆ ใน draft contract) จึง deep-watch ทั้ง object ได้อย่างปลอดภัย (object เดียว ไม่มีหลาย field ให้พัง
  แบบ capacity เดิม)

  Props:
    filter — Object (required) — รวมแค่ rangePreset/start/end/bucket
    active — Boolean (true) — false เมื่อ mounted ค้างไว้แต่ไม่ใช่หมวดที่เปิดอยู่ (v-show ซ่อน) — ตัวกรอง
             เปลี่ยนตอนไม่ active ไม่ยิง Materials ทันที แค่ติดธง needsRefetch ไว้ยิงใหม่ตอนกลับมา active
-->
<template>
  <InsightTabLayout
    :title="$t('view.productionInsight.nav.materials')"
    :status="status"
    :problems="problems"
    :forecasts="forecasts"
    :actions="actions"
    :loading="loading"
  >
    <template #report>
      <MaterialsKpiGroup :kpi="kpi" :asOf="asOf" :loading="loading" @goto-report="scrollToReport" />

      <div id="insight-report-matTrend" class="materials-section__anchor">
        <SectionCardGeneric :title="$t('view.productionInsight.materials.trendTitle')" icon="bi-graph-up-arrow" accent="main" headerStyle="legend">
          <MaterialsTrendChart :series="series" :loading="loading" />
        </SectionCardGeneric>
      </div>

      <MaterialsWaitingPlansPanel />
      <MaterialsGemDemandPanel />
      <MaterialsGemLowCoverPanel />
    </template>
  </InsightTabLayout>
</template>

<script>
import { useProductionInsightApiStore } from '@/stores/modules/api/production/production-insight-api.js'

import InsightTabLayout from '@/components/insight/insight-tab-layout.vue'
import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import MaterialsKpiGroup from '../components/materials-kpi-group.vue'
import MaterialsTrendChart from '../components/materials-trend-chart.vue'
import MaterialsWaitingPlansPanel from '../components/materials-waiting-plans-panel.vue'
import MaterialsGemDemandPanel from '../components/materials-gem-demand-panel.vue'
import MaterialsGemLowCoverPanel from '../components/materials-gem-low-cover-panel.vue'

// readyPlans = ใบงานที่ยังไม่ผ่านขั้นคัดพลอยทั้งหมด (กว้าง ไม่ใช่ "พร้อมเบิกแล้ว") ต่างจาก readyWaitingPlans
// (พร้อมเบิก+ยังค้างอยู่ที่คัดพลอยไม่เบิกออก — ใช้กับ MAT_READY_NOT_ISSUED) — unmatchedLines =
// unmatchedByGem + unmatchedBySpec (ยืนยันจาก API agent 2026-10-02)
const emptyKpi = () => ({
  waitingPlans: null,
  waitingMedianDays: null,
  issueMedianDays: null,
  issueP90Days: null,
  readyPlans: null,
  readyWaitingPlans: null,
  shortPlans: null,
  shortLines: null,
  unmatchedLines: null,
  unmatchedByGem: null,
  unmatchedBySpec: null,
  matchedLines: null,
  totalLines: null,
  lowCoverCount: null
})

export default {
  name: 'ProductionInsightMaterialsSection',

  components: {
    InsightTabLayout,
    SectionCardGeneric,
    MaterialsKpiGroup,
    MaterialsTrendChart,
    MaterialsWaitingPlansPanel,
    MaterialsGemDemandPanel,
    MaterialsGemLowCoverPanel
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
      asOf: null,
      needsRefetch: false
    }
  },

  watch: {
    filter: {
      handler() {
        if (this.active) this.fetchMaterials()
        else this.needsRefetch = true
      },
      deep: true
    },

    // กลับมาเป็นหมวดที่เปิดอยู่หลังตัวกรองเปลี่ยนตอนถูกซ่อน (needsRefetch ติดไว้) — ยิงรอบเดียวตอนนี้แทน
    active(value) {
      if (value && this.needsRefetch) {
        this.needsRefetch = false
        this.fetchMaterials()
      }
    }
  },

  methods: {
    scrollToReport(reportRef) {
      const el = document.getElementById(`insight-report-${reportRef}`)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    },

    async fetchMaterials() {
      this.loading = true
      const res = await this.productionInsightStore.fetchMaterials({ start: this.filter.start, end: this.filter.end })
      this.status = res?.status || ''
      this.problems = res?.problems || []
      this.forecasts = res?.forecasts || []
      this.actions = res?.actions || []
      this.kpi = res?.kpi ? { ...emptyKpi(), ...res.kpi } : emptyKpi()
      this.series = res?.series || []
      this.asOf = res?.asOf ?? null
      this.loading = false
    }
  },

  created() {
    this.fetchMaterials()
  }
}
</script>

<style lang="scss" scoped>
.materials-section__anchor {
  scroll-margin-top: calc(var(--mainbar-height) + 64px);
}
</style>
