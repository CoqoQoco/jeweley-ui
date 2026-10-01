<!--
  gold-section — หมวด "ทองและ Loss" ของ ProductionInsightView — ยิง ProductionInsight/Gold ครั้งเดียวได้ทั้ง
  problems/forecasts/actions/status + kpi/series/targets/workers/asOf — draftTargets ส่งไปพร้อมกันเฉพาะตอน
  กำลังแก้ไขเป้าในแผง "ตั้งเป้า Loss" (ยังไม่กดบันทึก) ให้ KPI/กราฟ preview ค่าใหม่แบบ real-time (เหมือน
  draftStandards ของ wip-lead-time-panel.vue / draftTargetPercent ของ delivery-section.vue)

  ส่วนตาราง overSlips/uncovered เป็น panel แยก (ยิง endpoint ของตัวเอง, paginate อิสระ) — ตัวกรองประเภทช่าง/
  ช่าง/ไม่ครบเกิน (วัน) มาจาก props.filter (คุมจาก FilterPanelGeneric ของ ProductionInsightView) — workerCodes
  ตัวเลือกใน filter panel มาจาก Gold.workers (ไม่ใช่ list คงที่) — emit `workers-loaded` ขึ้นไปให้
  index-view.vue เก็บเป็น options ทุกครั้งที่ยิง Gold สำเร็จ

  Props:
    filter — Object (required) — รวม metal ('GOLD'|'SILVER', default 'GOLD') คุมทั้งหมวด (KPI/กราฟ/ตารางทุก
             จุด follow ค่านี้) แก้ได้ทั้งจาก FilterPanelGeneric และ ToggleGroupGeneric ข้าง GoldKpiGroup
             (state เดียวกัน ส่งขึ้นผ่าน metal-change ให้ index-view.vue เป็นคนแก้ filter จริง — gold-section
             เองไม่ได้ถือ filter)
    active — Boolean (true) — false เมื่อ mounted ค้างไว้แต่ไม่ใช่หมวดที่เปิดอยู่ (v-show ซ่อน) — ตัวกรอง
             เปลี่ยนตอนไม่ active ไม่ยิง Gold ทันที แค่ติดธง needsRefetch ไว้ยิงใหม่ตอนกลับมา active

  Emits: workers-loaded(workers), metal-change(value)
-->
<template>
  <InsightTabLayout
    :title="$t('view.productionInsight.nav.gold')"
    :status="status"
    :problems="problems"
    :forecasts="forecasts"
    :actions="actions"
    :loading="loading"
    :helpParams="helpParams"
  >
    <template #report>
      <GoldKpiGroup :kpi="kpi" :asOf="asOf" :metal="filter.metal" :loading="loading" @goto-report="scrollToReport" @update:metal="onMetalChange" />

      <GoldTrendPanel
        :series="series"
        :targets="targets"
        :savedTargets="savedTargets"
        :kpi="kpi"
        :metal="filter.metal"
        :rangeLabel="rangeLabel"
        :loading="loading"
        @draft-target-change="onTargetDraftChange"
        @target-saved="onTargetSaved"
      />

      <GoldWorkerRankingPanel :rows="workers" :metal="filter.metal" :loading="loading" />

      <GoldOverSlipsPanel
        :workerTypes="filter.workerTypes"
        :workerCodes="filter.workerCodes"
        :metal="filter.metal"
        :start="filter.start"
        :end="filter.end"
      />
      <GoldUncoveredJobsPanel
        :workerTypes="filter.workerTypes"
        :workerCodes="filter.workerCodes"
        :olderThanDays="filter.olderThanDays"
        :metal="filter.metal"
        :start="filter.start"
        :end="filter.end"
      />
    </template>
  </InsightTabLayout>
</template>

<script>
import { useProductionInsightApiStore } from '@/stores/modules/api/production/production-insight-api.js'
import { formatRangeLabel } from '@/services/utils/range-presets.js'

import InsightTabLayout from '@/components/insight/insight-tab-layout.vue'
import GoldKpiGroup from '../components/gold-kpi-group.vue'
import GoldTrendPanel from '../components/gold-trend-panel.vue'
import GoldWorkerRankingPanel from '../components/gold-worker-ranking-panel.vue'
import GoldOverSlipsPanel from '../components/gold-over-slips-panel.vue'
import GoldUncoveredJobsPanel from '../components/gold-uncovered-jobs-panel.vue'

export default {
  name: 'ProductionInsightGoldSection',

  components: {
    InsightTabLayout,
    GoldKpiGroup,
    GoldTrendPanel,
    GoldWorkerRankingPanel,
    GoldOverSlipsPanel,
    GoldUncoveredJobsPanel
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

  emits: ['workers-loaded', 'metal-change'],

  data() {
    return {
      loading: false,
      status: '',
      problems: [],
      forecasts: [],
      actions: [],
      kpi: [],
      series: [],
      targets: [],
      workers: [],
      asOf: null,
      savedTargets: [],
      draftTargets: [],
      needsRefetch: false
    }
  },

  computed: {
    rangeLabel() {
      return formatRangeLabel(this.filter.start, this.filter.end)
    },

    // เสริม params ที่ finding เองไม่มี (olderThanDays มาจาก filter ปัจจุบัน) ให้ InsightTabLayout ใช้
    // resolve ข้อความคำอธิบาย (view.productionInsight.help.<CODE>)
    helpParams() {
      return {
        days: this.filter.olderThanDays
      }
    }
  },

  watch: {
    filter: {
      handler() {
        if (this.active) this.fetchGold()
        else this.needsRefetch = true
      },
      deep: true
    },

    // กลับมาเป็นหมวดที่เปิดอยู่หลังตัวกรองเปลี่ยนตอนถูกซ่อน (needsRefetch ติดไว้) — ยิงรอบเดียวตอนนี้แทน
    active(value) {
      if (value && this.needsRefetch) {
        this.needsRefetch = false
        this.fetchGold()
      }
    }
  },

  methods: {
    scrollToReport(reportRef) {
      const el = document.getElementById(`insight-report-${reportRef}`)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    },

    // สลับทอง/เงินจาก ToggleGroupGeneric ข้าง GoldKpiGroup — ไม่ได้ถือ filter เอง ส่งขึ้นให้ index-view.vue
    // แก้ filters.gold.metal จริง (เหมือน onRangePresetChange เดิม ใช้ทันทีไม่ผ่าน draft/apply ของแผงตัวกรอง)
    onMetalChange(value) {
      this.$emit('metal-change', value)
    },

    // ผู้ใช้แก้ค่าในแผงตั้งเป้า (ยังไม่บันทึก) — เก็บ draft ไว้ยิง Gold ใหม่ให้ KPI/กราฟ preview แบบ
    // real-time (แผงตั้งเป้าเป็นคน debounce การยิง event นี้เองแล้ว)
    onTargetDraftChange(items) {
      this.draftTargets = items
      this.fetchGold()
    },

    // บันทึกเป้าสำเร็จ — เคลียร์ draft แล้วโหลดทั้งคู่ใหม่ด้วยค่าที่บันทึกจริง
    async onTargetSaved() {
      this.draftTargets = []
      await Promise.all([this.fetchGold(), this.fetchSavedTargets()])
    },

    async fetchGold() {
      this.loading = true
      const res = await this.productionInsightStore.fetchGold({
        start: this.filter.start,
        end: this.filter.end,
        bucket: this.filter.bucket,
        workerTypes: this.filter.workerTypes,
        workerCodes: this.filter.workerCodes,
        metal: this.filter.metal,
        draftTargets: this.draftTargets
      })
      this.status = res?.status || ''
      this.problems = res?.problems || []
      this.forecasts = res?.forecasts || []
      this.actions = res?.actions || []
      this.kpi = res?.kpi || []
      this.series = res?.series || []
      this.targets = res?.targets || []
      this.workers = res?.workers || []
      this.asOf = res?.asOf ?? null
      this.loading = false
      this.$emit('workers-loaded', this.workers)
    },

    async fetchSavedTargets() {
      this.savedTargets = (await this.productionInsightStore.fetchGoldLossTargets()) || []
    }
  },

  created() {
    this.fetchGold()
    this.fetchSavedTargets()
  }
}
</script>
