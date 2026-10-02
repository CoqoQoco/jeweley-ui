<!--
  workers-table-panel — orchestrator ของตาราง "ช่างรายคน" + รายละเอียดช่างที่เลือก (กราฟรายเดือน) — reportRef:
  wrkTable ของหมวด "ช่างและค่าแรง" — รับ workers[] มาจาก Workers response ที่ workers-section.vue ยิงแล้ว (ไม่
  ยิง endpoint เอง) ตาม pattern gold-stage-department-panel.vue — ไม่ auto-select แถวแรก (ต่างจาก gold-stage
  ที่มีแค่ 3-7 แผนก) เพราะช่างมีได้หลายสิบ-ร้อยคน ต้องให้ผู้ใช้คลิกเลือกเองเสมอ

  Props:
    workers — Array (required) จาก Workers.workers
    start   — Date (required) — ส่งต่อให้ WorkersDetailChart ยิง WorkerMonthly
    end     — Date (required)
    loading — Boolean (false)
-->
<template>
  <div class="workers-table-panel">
    <div id="insight-report-wrkTable" class="workers-table-panel__anchor">
      <SectionCardGeneric :title="$t('view.productionInsight.workers.tableTitle')" icon="bi-people" accent="main" headerStyle="legend">
        <WorkersTable :workers="workers" :selectedKey="selectedKey" :loading="loading" @select-worker="onSelectWorker" />
      </SectionCardGeneric>
    </div>

    <SectionCardGeneric v-if="selectedWorker" :title="detailTitle" icon="bi-graph-up" accent="main" headerStyle="legend">
      <WorkersDetailChart :code="selectedWorker.code" :deptKey="selectedWorker.deptKey" :start="start" :end="end" />
    </SectionCardGeneric>
  </div>
</template>

<script>
import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import WorkersTable from './workers-table.vue'
import WorkersDetailChart from './workers-detail-chart.vue'

export default {
  name: 'WorkersTablePanel',

  components: {
    SectionCardGeneric,
    WorkersTable,
    WorkersDetailChart
  },

  props: {
    workers: {
      type: Array,
      required: true
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
  },

  data() {
    return {
      selectedWorker: null
    }
  },

  computed: {
    selectedKey() {
      return this.selectedWorker ? { code: this.selectedWorker.code, deptKey: this.selectedWorker.deptKey } : null
    },

    detailTitle() {
      return this.selectedWorker ? this.$t('view.productionInsight.workers.detailTitle', { name: this.selectedWorker.name }) : ''
    }
  },

  watch: {
    // workers โหลดใหม่ (เปลี่ยนตัวกรอง/ช่วงเวลา) — ช่างที่เลือกอยู่อาจหายไปจากชุดข้อมูลใหม่ เคลียร์การเลือกทิ้ง
    workers() {
      if (!this.selectedWorker) return
      const stillExists = this.workers.some((w) => w.code === this.selectedWorker.code && w.deptKey === this.selectedWorker.deptKey)
      if (!stillExists) this.selectedWorker = null
    }
  },

  methods: {
    onSelectWorker(worker) {
      this.selectedWorker = worker
    }
  }
}
</script>

<style lang="scss" scoped>
.workers-table-panel {
  min-width: 0;
}

// legend-style SectionCardGeneric ต้องการ margin-top var(--sp-2xl) เสมอ (เผื่อชิป title คร่อมขอบบน) —
// container sibling-spacing ห้ามเล็กกว่านี้ ดู insight-tab-layout.vue comment + Decision Log
.workers-table-panel > * + * {
  margin-top: var(--sp-2xl);
}

.workers-table-panel__anchor {
  scroll-margin-top: calc(var(--mainbar-height) + 64px);
}
</style>
