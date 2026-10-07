<!--
  capacity-section — หมวด "กำลังการผลิต" ของ ProductionInsightView — ยิง ProductionInsight/Capacity ครั้งเดียว
  ได้ทั้ง problems/forecasts/actions/status + kpi/series/departments/costCardToDone — ตาราง "ใบงานที่ยังไม่
  เข้าบัตรต้นทุน" เป็น panel แยก (ยิง CostCardPendingPlans เอง, paginate อิสระ ไม่ขึ้นกับตัวกรองหมวดนี้) —
  แผงจำลอง "เพิ่ม/ลดคน" เป็น client-side ล้วน ไม่ยิง endpoint เพิ่ม

  filter.departmentKeys **ไม่ส่งไป Capacity endpoint** (API ไม่รับ — ยืนยันจาก API agent) — กรอง client-side
  เองผ่าน `filteredDepartments` ใช้แค่กับตารางรายแผนก/แผงจำลอง/กราฟรายละเอียด (CapacityDepartmentPanel/
  CapacityWhatIfPanel) ส่วน KPI/กราฟแนวโน้ม/ปัญหาที่พบเป็นภาพรวมทั้งบริษัทเสมอ ไม่กรอง (CapacityKpiGroup รับ
  `departments` เต็มไม่กรอง เพื่อให้ cross-reference คอขวดภาพรวมถูกต้อง) — เพราะ departmentKeys ไม่กระทบ
  response จาก server เลย การแก้ค่านี้จึง **ไม่ refetch** (ต่างจาก unit/start/end/bucket ที่รวมเป็น
  `serverFilterKey` เดียว watch ตัวเดียว แทนการ deep-watch ทั้ง filter แบบหมวดอื่น — ไม่ watch แยก field เดิมแล้ว
  เพราะ preset เปลี่ยนหลาย field พร้อมกันทำให้ fetch ซ้ำ 3 ครั้ง — บั๊กจริงที่เจอบน prod 2026-10-02)

  filter.unit ('plan'|'piece') คุมทั้งแท็บ (KPI/กราฟแนวโน้ม/ตารางรายแผนก) — เลือก field ใบ/ชิ้นฝั่ง client เท่านั้น
  (response มีทั้งสองชุดเสมอ) แต่ยังอยู่ใน serverFilterKey เหมือนเดิม — filter.productTypes/golds/goldSizes
  ส่งไป server จริง กรองทั้ง response (kpi/series/departments/costCardToDone/breakdown/rules) และ
  filter.breakdownBy คุมมิติของกล่อง "แยกตามสินค้า" — ทั้งหมดรวมใน serverFilterKey เดียว — คลิกแถวกลุ่มในกล่อง
  แยกตามสินค้า = emit update-filter ให้ index-view ตั้งตัวกรองของมิตินั้น (ชิปแสดง/ลบที่แถบตัวกรอง)

  Props:
    filter — Object (required) — รวม unit ('plan'|'piece', default 'plan') + departmentKeys (client-side only)
             + productTypes/golds/goldSizes/breakdownBy (server)

  Emits: update-filter(patch), filter-options-loaded(filterOptions) — filterOptions = { productTypes, golds, goldSizes }
          ([{ key, name }] คำนวณโดยไม่สนตัวกรองสินค้า) ใช้เติม MultiSelect ในแผงตัวกรอง
    active — Boolean (true) — false เมื่อ mounted ค้างไว้แต่ไม่ใช่หมวดที่เปิดอยู่ (v-show ซ่อน) — ตัวกรอง
             เปลี่ยนตอนไม่ active ไม่ยิง Capacity ทันที แค่ติดธง needsRefetch ไว้ยิงใหม่ตอนกลับมา active
-->
<template>
  <InsightTabLayout
    :title="$t('view.productionInsight.nav.capacity')"
    :status="status"
    :problems="problems"
    :forecasts="forecasts"
    :actions="actions"
    :loading="loading"
  >
    <template #report>
      <CapacityKpiGroup
        :kpi="kpi"
        :unit="filter.unit"
        :departments="departments"
        :costCardToDone="costCardToDone"
        :asOf="asOf"
        :loading="loading"
        @goto-report="scrollToReport"
      />

      <div id="insight-report-capTrend" class="capacity-section__anchor">
        <SectionCardGeneric :title="$t('view.productionInsight.capacity.trendTitle')" icon="bi-graph-up-arrow" accent="main" headerStyle="legend">
          <CapacityTrendChart :series="series" :unit="filter.unit" :loading="loading" />
        </SectionCardGeneric>
      </div>

      <CapacityDepartmentPanel :departments="filteredDepartments" :unit="filter.unit" :rangeLabel="rangeLabel" :loading="loading" />

      <CapacityBreakdownPanel
        :breakdown="breakdown"
        :by="filter.breakdownBy"
        :activeKeys="activeBreakdownKeys"
        :loading="loading"
        @change-by="onChangeBreakdownBy"
        @select-group="onSelectGroup"
      />

      <CapacityCostcardPanel :costCardToDone="costCardToDone" :loading="loading" />

      <CapacityWhatIfPanel :departments="filteredDepartments" :loading="loading" />
    </template>
  </InsightTabLayout>
</template>

<script>
import { useProductionInsightApiStore } from '@/stores/modules/api/production/production-insight-api.js'
import { formatRangeLabel } from '@/services/utils/range-presets.js'
import { CAPACITY_BREAKDOWN_FILTER_FIELD } from '../insight-filters.js'

import InsightTabLayout from '@/components/insight/insight-tab-layout.vue'
import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import CapacityKpiGroup from '../components/capacity-kpi-group.vue'
import CapacityTrendChart from '../components/capacity-trend-chart.vue'
import CapacityDepartmentPanel from '../components/capacity-department-panel.vue'
import CapacityBreakdownPanel from '../components/capacity-breakdown-panel.vue'
import CapacityCostcardPanel from '../components/capacity-costcard-panel.vue'
import CapacityWhatIfPanel from '../components/capacity-whatif-panel.vue'

const emptyKpi = () => ({
  inflowPerMonth: null,
  inflowPiecesPerMonth: null,
  outputPerMonth: null,
  completedPerMonth: null,
  netPerMonth: null,
  activeWip: null,
  backlogMonths: null,
  staleWip: null,
  bottleneckDepts: [],
  overloadMonths: null,
  monthsInRange: null,
  outputPiecesPerMonth: null,
  completedPiecesPerMonth: null,
  netPiecesPerMonth: null,
  activeWipPieces: null,
  backlogMonthsPieces: null
})

const emptyCostCardToDone = () => ({
  medianDays: null,
  p90Days: null,
  pendingNow: null,
  pendingOver30d: null,
  pendingActive: null,
  pendingStale: null,
  series: []
})

export default {
  name: 'ProductionInsightCapacitySection',

  components: {
    InsightTabLayout,
    SectionCardGeneric,
    CapacityKpiGroup,
    CapacityTrendChart,
    CapacityDepartmentPanel,
    CapacityBreakdownPanel,
    CapacityCostcardPanel,
    CapacityWhatIfPanel
  },

  emits: ['update-filter', 'filter-options-loaded'],

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
      departments: [],
      costCardToDone: emptyCostCardToDone(),
      breakdown: null,
      asOf: null,
      needsRefetch: false
    }
  },

  computed: {
    rangeLabel() {
      return formatRangeLabel(this.filter.start, this.filter.end)
    },

    // ตัวกรองแผนกเป็น client-side ล้วน (API ไม่รับ departmentKeys) — ใช้เฉพาะกับตารางรายแผนก/แผงจำลอง/กราฟ
    // รายละเอียด ไม่กรอง KPI/กราฟแนวโน้ม/ปัญหาที่พบ (departments เป็นภาพรวมทั้งบริษัทเสมอ)
    filteredDepartments() {
      const keys = this.filter.departmentKeys
      if (!keys || !keys.length) return this.departments
      return this.departments.filter((d) => keys.includes(d.key))
    },

    // รวม unit+start+end+bucket (field ที่ Capacity endpoint รับจริง) เป็น key เดียว กัน fetchCapacity() ยิง
    // ซ้ำ 3 ครั้งตอนเปลี่ยนช่วงเวลา (preset เปลี่ยน start+end+bucket พร้อมกันในจังหวะเดียว แต่เดิม watch แยก
    // dotted-path คนละตัว ยิง fetch 3 รอบต่อการกด 1 ครั้ง — บั๊กจริงที่เจอบน prod 2026-10-02) — ไม่รวม
    // departmentKeys เพราะเป็น client-side ล้วน ไม่กระทบ response จาก server เลย (ใช้ filteredDepartments
    // กรองเฉยๆ ไม่ควร refetch) — pattern เดียวกับ resetPagingKey ทั่ว insight
    // + productTypes/golds/goldSizes/breakdownBy (ส่งไป server จริง) ในคีย์เดียวกัน — เปลี่ยนหลายฟิลด์พร้อมกัน
    // (เช่น กดแถวกลุ่มพร้อมสลับมิติ หรือ clear filter) ยิงรอบเดียว
    serverFilterKey() {
      return JSON.stringify([
        this.filter.unit,
        this.filter.start,
        this.filter.end,
        this.filter.bucket,
        this.filter.productTypes,
        this.filter.golds,
        this.filter.goldSizes,
        this.filter.breakdownBy
      ])
    },

    // กลุ่มที่ตั้งเป็นตัวกรองอยู่ในมิติปัจจุบัน (highlight แถวในกล่อง "แยกตามสินค้า")
    activeBreakdownKeys() {
      return this.filter[CAPACITY_BREAKDOWN_FILTER_FIELD[this.filter.breakdownBy]] || []
    }
  },

  watch: {
    serverFilterKey() {
      this.onServerFilterChange()
    },

    // กลับมาเป็นหมวดที่เปิดอยู่หลังตัวกรองเปลี่ยนตอนถูกซ่อน (needsRefetch ติดไว้) — ยิงรอบเดียวตอนนี้แทน
    active(value) {
      if (value && this.needsRefetch) {
        this.needsRefetch = false
        this.fetchCapacity()
      }
    }
  },

  methods: {
    onServerFilterChange() {
      if (this.active) this.fetchCapacity()
      else this.needsRefetch = true
    },

    onChangeBreakdownBy(by) {
      this.$emit('update-filter', { breakdownBy: by })
    },

    // คลิกกลุ่ม = ตั้งเป็นตัวกรองของมิตินั้นทั้งแท็บ (เลือกกลุ่มเดียว) — คลิกกลุ่มที่เลือกอยู่ซ้ำ = เอาออก
    onSelectGroup(key) {
      const field = CAPACITY_BREAKDOWN_FILTER_FIELD[this.filter.breakdownBy]
      const alreadyOnly = this.activeBreakdownKeys.length === 1 && this.activeBreakdownKeys[0] === key
      this.$emit('update-filter', { [field]: alreadyOnly ? [] : [key] })
    },

    scrollToReport(reportRef) {
      const el = document.getElementById(`insight-report-${reportRef}`)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    },

    async fetchCapacity() {
      this.loading = true
      const res = await this.productionInsightStore.fetchCapacity({
        start: this.filter.start,
        end: this.filter.end,
        bucket: this.filter.bucket,
        unit: this.filter.unit,
        productTypes: this.filter.productTypes,
        golds: this.filter.golds,
        goldSizes: this.filter.goldSizes,
        breakdownBy: this.filter.breakdownBy
      })
      this.status = res?.status || ''
      this.problems = res?.problems || []
      this.forecasts = res?.forecasts || []
      this.actions = res?.actions || []
      this.kpi = res?.kpi ? { ...emptyKpi(), ...res.kpi } : emptyKpi()
      this.series = res?.series || []
      this.departments = res?.departments || []
      this.costCardToDone = res?.costCardToDone ? { ...emptyCostCardToDone(), ...res.costCardToDone } : emptyCostCardToDone()
      this.breakdown = res?.breakdown || null
      if (res?.filterOptions) this.$emit('filter-options-loaded', res.filterOptions)
      this.asOf = res?.asOf ?? null
      this.loading = false
    }
  },

  created() {
    this.fetchCapacity()
  }
}
</script>

<style lang="scss" scoped>
.capacity-section__anchor {
  scroll-margin-top: calc(var(--mainbar-height) + 64px);
}
</style>
