<!--
  wip-section — หมวด "งานค้างและคอขวด" (default tab) ของ ProductionInsightView (Revision 2: per-topic tabs)
  ยิง ProductionInsight/Wip ครั้งเดียวได้ทั้ง problems/forecasts/actions/status + ข้อมูลกราฟ departments/flow
  ส่วนตาราง stalePlans/dueRisk เป็น panel แยก (ยิง endpoint ของตัวเอง, paginate อิสระ) — ตัวกรองแผนก/
  ไม่ขยับเกิน (วัน)/เตือนล่วงหน้า (วัน) มาจาก props.filter (คุมจาก FilterPanelGeneric ของ ProductionInsightView)

  Props:
    filter — Object (required)
    active — Boolean (true) — false เมื่อ mounted ค้างไว้แต่ไม่ใช่หมวดที่เปิดอยู่ (v-show ซ่อน) — ตัวกรอง
             เปลี่ยนตอนไม่ active ไม่ยิง endpoint ทันที แค่ติดธง needsRefetch ไว้ยิงใหม่ตอนกลับมา active
             (index-view.vue mount แบบ v-if เมื่อเคย visit หมวดนี้แล้วเท่านั้น ไม่ mount ค้างทุกหมวดตั้งแต่แรก)
-->
<template>
  <InsightTabLayout
    :title="$t('view.productionInsight.nav.wip')"
    :status="status"
    :problems="problems"
    :forecasts="forecasts"
    :actions="actions"
    :loading="loading"
    :helpParams="helpParams"
  >
    <template #report>
      <WipTrendPanel :start="filter.start" :end="filter.end" :bucket="filter.bucket" />

      <div class="wip-section__charts-row">
        <div id="insight-report-departments" class="wip-section__anchor">
          <SectionCardGeneric
            :title="$t('view.executive.production.byDepartmentTitle')"
            :titleTip="$t('view.productionInsight.help.departmentWipChart')"
            icon="bi-diagram-3"
            accent="main"
            headerStyle="legend"
          >
            <p class="wip-section__note">{{ $t('view.productionInsight.wip.asOfTodayNote') }}</p>
            <DepartmentWipChart :departments="report.departments" :loading="loading" />
          </SectionCardGeneric>
        </div>

        <div id="insight-report-flow" class="wip-section__anchor">
          <SectionCardGeneric
            :title="flowTitle"
            :titleTip="$t('view.productionInsight.help.flowChart')"
            icon="bi-arrow-left-right"
            accent="main"
            headerStyle="legend"
          >
            <DepartmentFlowChart :flow="report.flow" :loading="loading" />
          </SectionCardGeneric>
        </div>
      </div>

      <WipLeadTimePanel :start="filter.start" :end="filter.end" :bucket="filter.bucket" @focus-abnormal="onFocusAbnormalDwell" />

      <WipStalePlansPanel :departmentKeys="filter.departmentKeys" :minDays="filter.staleDays" />
      <WipDueRiskPanel :departmentKeys="filter.departmentKeys" :riskWindowDays="filter.riskWindowDays" />
      <WipAbnormalDwellPanel :departmentKeys="filter.departmentKeys" :focusDeptKey="abnormalDwellFocusDeptKey" @clear-focus="abnormalDwellFocusDeptKey = ''" />
    </template>
  </InsightTabLayout>
</template>

<script>
import { useProductionInsightApiStore } from '@/stores/modules/api/production/production-insight-api.js'
import { formatRangeLabel } from '@/services/utils/range-presets.js'

import InsightTabLayout from '@/components/insight/insight-tab-layout.vue'
import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import DepartmentWipChart from '../components/department-wip-chart.vue'
import DepartmentFlowChart from '../components/department-flow-chart.vue'
import WipTrendPanel from '../components/wip-trend-panel.vue'
import WipLeadTimePanel from '../components/wip-lead-time-panel.vue'
import WipStalePlansPanel from '../components/wip-stale-plans-panel.vue'
import WipDueRiskPanel from '../components/wip-due-risk-panel.vue'
import WipAbnormalDwellPanel from '../components/wip-abnormal-dwell-panel.vue'

const emptyReport = () => ({
  departments: [],
  flow: [],
  openCount: 0,
  overdueCount: 0,
  dueSoonAtRiskCount: 0,
  becomingStaleCount: 0,
  meltedOpenCount: 0
})

export default {
  name: 'ProductionInsightWipSection',

  components: {
    InsightTabLayout,
    SectionCardGeneric,
    DepartmentWipChart,
    DepartmentFlowChart,
    WipTrendPanel,
    WipLeadTimePanel,
    WipStalePlansPanel,
    WipDueRiskPanel,
    WipAbnormalDwellPanel
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
    // false เมื่อหมวดนี้ไม่ใช่หมวดที่เปิดอยู่ตอนนี้ (ถูก v-show ซ่อนอยู่แต่ยัง mounted ค้างไว้ตาม
    // visitedSections) — กันยิง endpoint ซ้ำตอนไม่มีใครเห็น (ดู watch.filter/watch.active ด้านล่าง)
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
      report: emptyReport(),
      abnormalDwellFocusDeptKey: '',
      needsRefetch: false
    }
  },

  computed: {
    flowTitle() {
      return this.$t('view.productionInsight.wip.flowTitleRanged', { range: formatRangeLabel(this.filter.start, this.filter.end) })
    },

    // เสริม params ที่ finding เองไม่มี (staleDays/riskWindowDays/growthThresholdPercent มาจาก filter ปัจจุบัน)
    // ให้ InsightTabLayout ใช้ resolve ข้อความคำอธิบาย (view.productionInsight.help.<CODE>)
    helpParams() {
      return {
        staleDays: this.filter.staleDays,
        riskWindowDays: this.filter.riskWindowDays,
        thresholdPercent: this.filter.growthThresholdPercent
      }
    }
  },

  watch: {
    filter: {
      handler() {
        if (this.active) this.fetchWip()
        else this.needsRefetch = true
      },
      deep: true,
      immediate: true
    },

    // กลับมาเป็นหมวดที่เปิดอยู่หลังตัวกรองเปลี่ยนตอนถูกซ่อน (needsRefetch ติดไว้) — ยิงรอบเดียวตอนนี้แทน
    active(value) {
      if (value && this.needsRefetch) {
        this.needsRefetch = false
        this.fetchWip()
      }
    }
  },

  methods: {
    onFocusAbnormalDwell(deptKey) {
      this.abnormalDwellFocusDeptKey = deptKey
    },

    async fetchWip() {
      this.loading = true
      const res = await this.productionInsightStore.fetchWip({
        staleDays: this.filter.staleDays,
        riskWindowDays: this.filter.riskWindowDays,
        start: this.filter.start,
        end: this.filter.end,
        growthThresholdPercent: this.filter.growthThresholdPercent
      })
      this.status = res?.status || ''
      this.problems = res?.problems || []
      this.forecasts = res?.forecasts || []
      this.actions = res?.actions || []
      this.report = res?.report ? { ...emptyReport(), ...res.report } : emptyReport()
      this.loading = false
    }
  }
}
</script>

<style lang="scss" scoped>
// เหมือน .insight-tab-layout__row--split — เผื่อ clearance ของ legend chip ที่ระดับ container แทน
// margin-top ของ .section-card--legend เอง ให้ทั้ง 2 กล่องในแถวเริ่ม y เดียวกันเป๊ะ
.wip-section__charts-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: stretch;
  gap: var(--sp-md);
  padding-top: var(--sp-2xl);

  > * {
    min-width: 0;
  }

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

    :deep(.section-card--legend) {
      margin-top: var(--sp-2xl) !important;
    }
  }
}

.wip-section__anchor {
  scroll-margin-top: calc(var(--mainbar-height) + 64px);
}

.wip-section__note {
  margin: 0 0 var(--sp-sm);
  font-size: var(--fs-sm);
  color: var(--base-sub-color);
  font-style: italic;
}
</style>
