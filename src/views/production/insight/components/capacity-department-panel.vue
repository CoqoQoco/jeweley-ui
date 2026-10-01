<!--
  capacity-department-panel — orchestrator ของ reportRef: capDepartments ("กำลังการผลิตรายแผนก" + กราฟ
  รายละเอียดแผนกที่เลือก) ในหมวด "กำลังการผลิต" — รับ departments[] มาจาก Capacity response ที่
  capacity-section.vue ยิงแล้ว (ไม่ยิง endpoint เอง) เหมือน wip-lead-time-panel.vue

  Props:
    departments — Array (required) จาก Capacity.departments
    rangeLabel  — String ('') — ช่วงเวลาที่เลือก ต่อท้ายหัวข้อกราฟรายละเอียด
    loading     — Boolean (false)
-->
<template>
  <div class="capacity-department-panel">
    <div id="insight-report-capDepartments" class="capacity-department-panel__anchor">
      <SectionCardGeneric
        :title="$t('view.productionInsight.capacity.deptTitle')"
        :titleTip="$t('view.productionInsight.help.capacityQueueDays')"
        icon="bi-diagram-3"
        accent="main"
        headerStyle="legend"
      >
        <p class="capacity-department-panel__hint">{{ $t('view.productionInsight.capacity.deptSelectHint') }}</p>
        <CapacityDepartmentTable :departments="departments" :selectedKey="selectedDeptKey" :loading="loading" @select-dept="onSelectDept" />
      </SectionCardGeneric>
    </div>

    <SectionCardGeneric v-if="selectedRow" :title="detailTitle" icon="bi-graph-up" accent="main" headerStyle="legend">
      <CapacityDepartmentChart :selectedRow="selectedRow" :rangeLabel="rangeLabel" :loading="loading" />
    </SectionCardGeneric>
  </div>
</template>

<script>
import { resolveDefaultDeptKey } from './capacity-helpers.js'

import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import CapacityDepartmentTable from './capacity-department-table.vue'
import CapacityDepartmentChart from './capacity-department-chart.vue'

export default {
  name: 'CapacityDepartmentPanel',

  components: {
    SectionCardGeneric,
    CapacityDepartmentTable,
    CapacityDepartmentChart
  },

  props: {
    departments: {
      type: Array,
      required: true
    },
    rangeLabel: {
      type: String,
      default: ''
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
      return this.departments.find((d) => d.key === this.selectedDeptKey) || null
    },

    detailTitle() {
      if (!this.selectedRow) return ''
      return this.$t('view.productionInsight.capacity.deptDetailTitle', { name: this.$t(`view.executive.department.${this.selectedRow.key}`) })
    }
  },

  watch: {
    departments() {
      if (!this.selectedDeptKey || !this.departments.some((d) => d.key === this.selectedDeptKey)) {
        this.selectedDeptKey = resolveDefaultDeptKey(this.departments)
      }
    }
  },

  methods: {
    onSelectDept(key) {
      this.selectedDeptKey = key
    }
  },

  created() {
    this.selectedDeptKey = resolveDefaultDeptKey(this.departments)
  }
}
</script>

<style lang="scss" scoped>
.capacity-department-panel {
  min-width: 0;
}

// legend-style SectionCardGeneric ต้องการ margin-top var(--sp-2xl) เสมอ (เผื่อชิป title คร่อมขอบบน) —
// container sibling-spacing ห้ามเล็กกว่านี้ ดู insight-tab-layout.vue comment + Decision Log
.capacity-department-panel > * + * {
  margin-top: var(--sp-2xl);
}

.capacity-department-panel__anchor {
  scroll-margin-top: calc(var(--mainbar-height) + 64px);
}

.capacity-department-panel__hint {
  margin: 0 0 var(--sp-md);
  font-size: var(--fs-sm);
  color: var(--base-sub-color);
  font-style: italic;
}
</style>
