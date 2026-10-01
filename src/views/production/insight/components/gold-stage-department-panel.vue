<!--
  gold-stage-department-panel — orchestrator ของตาราง "Loss ตามใบงานรายแผนก" + รายละเอียดแผนกที่เลือก (กราฟ
  รายเดือน + อันดับช่าง) — ส่วนแรก+สองของ reportRef: goldStage ในหมวด "ทองและ Loss" — รับ departments[]/series[]
  มาจาก GoldByStage response ที่ gold-section.vue ยิงแล้ว (ไม่ยิง endpoint เอง) ตาม pattern
  capacity-department-panel.vue/wip-lead-time-panel.vue

  Props:
    departments — Array (required) จาก GoldByStage.departments
    series      — Array (required) จาก GoldByStage.series (รวมทุกแผนกปนกัน)
    loading     — Boolean (false)
-->
<template>
  <div class="gold-stage-department-panel">
    <div id="insight-report-goldStage" class="gold-stage-department-panel__anchor">
      <SectionCardGeneric
        :title="$t('view.productionInsight.gold.stageTitle')"
        :titleTip="$t('view.productionInsight.help.goldStageDefinition')"
        icon="bi-arrow-left-right"
        accent="main"
        headerStyle="legend"
      >
        <GoldStageTable :departments="departments" :selectedKey="selectedDeptKey" :loading="loading" @select-dept="onSelectDept" />
      </SectionCardGeneric>
    </div>

    <SectionCardGeneric v-if="selectedRow" :title="detailTitle" icon="bi-graph-up" accent="main" headerStyle="legend">
      <GoldStageDetailChart :series="filteredSeries" :targetPercent="selectedRow.targetPercent" :loading="loading" />
      <p class="gold-stage-department-panel__worker-title">{{ $t('view.productionInsight.gold.stageWorkerTitle') }}</p>
      <GoldStageWorkerTable :workers="selectedRow.workers || []" :loading="loading" />
    </SectionCardGeneric>
  </div>
</template>

<script>
import { filterStageSeriesByDept, resolveDefaultStageDeptKey } from './gold-stage-helpers.js'

import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import GoldStageTable from './gold-stage-table.vue'
import GoldStageDetailChart from './gold-stage-detail-chart.vue'
import GoldStageWorkerTable from './gold-stage-worker-table.vue'

export default {
  name: 'GoldStageDepartmentPanel',

  components: {
    SectionCardGeneric,
    GoldStageTable,
    GoldStageDetailChart,
    GoldStageWorkerTable
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
    loading: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      selectedDeptKey: null
    }
  },

  computed: {
    selectedRow() {
      return this.departments.find((d) => d.deptKey === this.selectedDeptKey) || null
    },

    filteredSeries() {
      return filterStageSeriesByDept(this.series, this.selectedDeptKey)
    },

    detailTitle() {
      if (!this.selectedRow) return ''
      return this.$t('view.productionInsight.gold.stageDetailTitle', { name: this.$t(`view.executive.department.${this.selectedRow.deptKey}`) })
    }
  },

  watch: {
    departments() {
      if (this.selectedDeptKey == null || !this.departments.some((d) => d.deptKey === this.selectedDeptKey)) {
        this.selectedDeptKey = resolveDefaultStageDeptKey(this.departments)
      }
    }
  },

  methods: {
    onSelectDept(deptKey) {
      this.selectedDeptKey = deptKey
    }
  },

  created() {
    this.selectedDeptKey = resolveDefaultStageDeptKey(this.departments)
  }
}
</script>

<style lang="scss" scoped>
.gold-stage-department-panel {
  min-width: 0;
}

// legend-style SectionCardGeneric ต้องการ margin-top var(--sp-2xl) เสมอ (เผื่อชิป title คร่อมขอบบน) —
// container sibling-spacing ห้ามเล็กกว่านี้ ดู insight-tab-layout.vue comment + Decision Log
.gold-stage-department-panel > * + * {
  margin-top: var(--sp-2xl);
}

.gold-stage-department-panel__anchor {
  scroll-margin-top: calc(var(--mainbar-height) + 64px);
}

.gold-stage-department-panel__worker-title {
  margin: var(--sp-lg) 0 var(--sp-sm);
  font-size: var(--fs-base);
  font-weight: 700;
  color: var(--base-font-color);
}
</style>
