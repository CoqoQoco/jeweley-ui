<!--
  delivery-section — หมวด "ส่งงานตรงเวลา" ของ ProductionInsightView — ยิง ProductionInsight/Delivery ครั้ง
  เดียวได้ทั้ง problems/forecasts/actions/status + kpi/series/targetPercent/targetSource/lateCustomers —
  draftTargetPercent ส่งไปพร้อมกันเฉพาะตอนกำลังแก้ไขเป้าในแผง "ตั้งเป้าส่งตรงเวลา" (ยังไม่กดบันทึก) ให้
  KPI/กราฟ preview ค่าใหม่แบบ real-time (เหมือน draftStandards ของ wip-lead-time-panel.vue)

  ส่วนตาราง atRisk/latePlans/stuckCostCard เป็น panel แยก (ยิง endpoint ของตัวเอง, paginate อิสระ) — ตัวกรอง
  แผนก/เตือนล่วงหน้า (วัน) มาจาก props.filter (คุมจาก FilterPanelGeneric ของ ProductionInsightView)

  Props:
    filter — Object (required)
    active — Boolean (true) — false เมื่อ mounted ค้างไว้แต่ไม่ใช่หมวดที่เปิดอยู่ (v-show ซ่อน) — ตัวกรอง
             เปลี่ยนตอนไม่ active ไม่ยิง Delivery ทันที แค่ติดธง needsRefetch ไว้ยิงใหม่ตอนกลับมา active
-->
<template>
  <InsightTabLayout
    :title="$t('view.productionInsight.nav.delivery')"
    :status="status"
    :problems="problems"
    :forecasts="forecasts"
    :actions="actions"
    :loading="loading"
    :helpParams="helpParams"
  >
    <template #report>
      <DeliveryKpiGroup :kpi="kpi" :targetPercent="targetPercent" :asOf="asOf" :loading="loading" @goto-report="scrollToReport" />

      <DeliveryTrendPanel
        :series="series"
        :targetPercent="targetPercent"
        :targetSource="targetSource"
        :savedTarget="savedTarget"
        :currentOnTimePercent="kpi.onTimePercent"
        :rangeLabel="rangeLabel"
        :loading="loading"
        @draft-target-change="onTargetDraftChange"
        @target-saved="onTargetSaved"
      />

      <DeliveryLateCustomersPanel :rows="lateCustomers" :loading="loading" />

      <DeliveryAtRiskPanel :departmentKeys="filter.departmentKeys" :riskHorizonDays="filter.riskHorizonDays" />
      <DeliveryLatePlansPanel :start="filter.start" :end="filter.end" />
      <DeliveryStuckCostcardPanel />
    </template>
  </InsightTabLayout>
</template>

<script>
import { useProductionInsightApiStore } from '@/stores/modules/api/production/production-insight-api.js'
import { formatRangeLabel } from '@/services/utils/range-presets.js'

import InsightTabLayout from '@/components/insight/insight-tab-layout.vue'
import DeliveryKpiGroup from '../components/delivery-kpi-group.vue'
import DeliveryTrendPanel from '../components/delivery-trend-panel.vue'
import DeliveryLateCustomersPanel from '../components/delivery-late-customers-panel.vue'
import DeliveryAtRiskPanel from '../components/delivery-at-risk-panel.vue'
import DeliveryLatePlansPanel from '../components/delivery-late-plans-panel.vue'
import DeliveryStuckCostcardPanel from '../components/delivery-stuck-costcard-panel.vue'

const emptyKpi = () => ({
  completedCount: 0,
  onTimeCount: 0,
  onTimePercent: null,
  lateMedianDays: null,
  plannedLeadMedianDays: null,
  actualLeadMedianDays: null,
  suggestedLeadDays: null,
  openCount: 0,
  openOverdueCount: 0,
  openOverdueActiveCount: 0,
  atRiskCount: 0,
  stuckAfterCostCardCount: 0
})

const emptySavedTarget = () => ({ targetPercent: null, effectiveFrom: null, createBy: '', remark: '' })

export default {
  name: 'ProductionInsightDeliverySection',

  components: {
    InsightTabLayout,
    DeliveryKpiGroup,
    DeliveryTrendPanel,
    DeliveryLateCustomersPanel,
    DeliveryAtRiskPanel,
    DeliveryLatePlansPanel,
    DeliveryStuckCostcardPanel
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
      kpi: emptyKpi(),
      series: [],
      targetPercent: null,
      targetSource: 'saved',
      lateCustomers: [],
      asOf: null,
      savedTarget: emptySavedTarget(),
      draftTargetPercent: null,
      needsRefetch: false
    }
  },

  computed: {
    rangeLabel() {
      return formatRangeLabel(this.filter.start, this.filter.end)
    },

    // เสริม params ที่ finding เองไม่มี (riskHorizonDays มาจาก filter ปัจจุบัน) ให้ InsightTabLayout ใช้
    // resolve ข้อความคำอธิบาย (view.productionInsight.help.<CODE>)
    helpParams() {
      return {
        days: this.filter.riskHorizonDays
      }
    }
  },

  watch: {
    filter: {
      handler() {
        if (this.active) this.fetchDelivery()
        else this.needsRefetch = true
      },
      deep: true
    },

    // กลับมาเป็นหมวดที่เปิดอยู่หลังตัวกรองเปลี่ยนตอนถูกซ่อน (needsRefetch ติดไว้) — ยิงรอบเดียวตอนนี้แทน
    active(value) {
      if (value && this.needsRefetch) {
        this.needsRefetch = false
        this.fetchDelivery()
      }
    }
  },

  methods: {
    scrollToReport(reportRef) {
      const el = document.getElementById(`insight-report-${reportRef}`)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    },

    // ผู้ใช้แก้ค่าในแผงตั้งเป้า (ยังไม่บันทึก) — เก็บ draft ไว้ยิง Delivery ใหม่ให้ KPI/กราฟ preview แบบ
    // real-time (แผงตั้งเป้าเป็นคน debounce การยิง event นี้เองแล้ว)
    onTargetDraftChange(percent) {
      this.draftTargetPercent = percent
      this.fetchDelivery()
    },

    // บันทึกเป้าสำเร็จ — เคลียร์ draft แล้วโหลดทั้งคู่ใหม่ด้วยค่าที่บันทึกจริง
    async onTargetSaved() {
      this.draftTargetPercent = null
      await Promise.all([this.fetchDelivery(), this.fetchTarget()])
    },

    async fetchDelivery() {
      this.loading = true
      const res = await this.productionInsightStore.fetchDelivery({
        start: this.filter.start,
        end: this.filter.end,
        bucket: this.filter.bucket,
        riskHorizonDays: this.filter.riskHorizonDays,
        draftTargetPercent: this.draftTargetPercent
      })
      this.status = res?.status || ''
      this.problems = res?.problems || []
      this.forecasts = res?.forecasts || []
      this.actions = res?.actions || []
      this.kpi = res?.kpi ? { ...emptyKpi(), ...res.kpi } : emptyKpi()
      this.series = res?.series || []
      this.targetPercent = res?.targetPercent ?? null
      this.targetSource = res?.targetSource || 'saved'
      this.lateCustomers = res?.lateCustomers || []
      this.asOf = res?.asOf ?? null
      this.loading = false
    },

    async fetchTarget() {
      const res = await this.productionInsightStore.fetchDeliveryTarget()
      this.savedTarget = res ? { ...emptySavedTarget(), ...res } : emptySavedTarget()
    }
  },

  created() {
    this.fetchDelivery()
    this.fetchTarget()
  }
}
</script>
