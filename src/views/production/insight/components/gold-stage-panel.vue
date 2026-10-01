<!--
  gold-stage-panel — orchestrator รวมส่วน "Loss ตามใบงานรายแผนก (จ่าย − รับ)" ทั้งหมดของหมวด "ทองและ Loss" —
  วางไว้ขวาง "slip KPI group" (GoldKpiGroup) กับ "แนวโน้มทองและ Loss" (GoldTrendPanel) — รับ departments[]/
  series[] จาก GoldByStage response ที่ gold-section.vue ยิงแล้ว (ไม่ยิง endpoint เอง) — ส่วนตาราง outlier/
  pending เป็น panel แยก (ยิง endpoint ของตัวเอง, paginate อิสระ) ใช้ metal/start/end ร่วมกับหมวด gold

  Props:
    departments   — Array (required) จาก GoldByStage.departments
    series        — Array (required) จาก GoldByStage.series
    metal         — String ('GOLD')
    olderThanDays — Number (14)
    start         — Date (required)
    end           — Date (required)
    loading       — Boolean (false)
-->
<template>
  <div class="gold-stage-panel">
    <GoldStageDepartmentPanel :departments="departments" :series="series" :loading="loading" />
    <GoldStageTrendChart :departments="departments" :series="series" :loading="loading" />
    <GoldStageOutlierJobsPanel :metal="metal" :start="start" :end="end" />
    <GoldStagePendingReturnPanel :metal="metal" :olderThanDays="olderThanDays" :start="start" :end="end" />
  </div>
</template>

<script>
import GoldStageDepartmentPanel from './gold-stage-department-panel.vue'
import GoldStageTrendChart from './gold-stage-trend-chart.vue'
import GoldStageOutlierJobsPanel from './gold-stage-outlier-jobs-panel.vue'
import GoldStagePendingReturnPanel from './gold-stage-pending-return-panel.vue'

export default {
  name: 'GoldStagePanel',

  components: {
    GoldStageDepartmentPanel,
    GoldStageTrendChart,
    GoldStageOutlierJobsPanel,
    GoldStagePendingReturnPanel
  },

  props: {
    departments: {
      type: Array,
      required: true
    },
    series: {
      type: Array,
      required: true
    },
    metal: {
      type: String,
      default: 'GOLD'
    },
    olderThanDays: {
      type: Number,
      default: 14
    },
    start: {
      type: Date,
      required: true
    },
    end: {
      type: Date,
      required: true
    },
    loading: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style lang="scss" scoped>
.gold-stage-panel {
  min-width: 0;
}

// legend-style SectionCardGeneric ต้องการ margin-top var(--sp-2xl) เสมอ (เผื่อชิป title คร่อมขอบบน) —
// container sibling-spacing ห้ามเล็กกว่านี้ ดู insight-tab-layout.vue comment + Decision Log
.gold-stage-panel > * + * {
  margin-top: var(--sp-2xl);
}
</style>
