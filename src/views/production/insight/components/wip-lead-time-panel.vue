<!--
  wip-lead-time-panel — orchestrator ของ reportRef: leadTime ("เวลาผลิตรายแผนก" + กราฟรายละเอียด + "ผลต่อ
  กำลังการผลิต" + แผงมาตรฐาน) ในหมวด "งานค้างและคอขวด" — ยิง ProductionInsight/StageLeadTime ครั้งเดียวได้
  ทั้งตาราง/กราฟ/การ์ดกำลังการผลิต (departments[] มี series ในตัว) + ProductionInsight/StageStandards แยก
  (ค่ามาตรฐานที่บันทึกจริง ให้แผงมาตรฐานเทียบกับ draft) — draftStandards ส่งไปพร้อม StageLeadTime เฉพาะตอน
  กำลังแก้ไขค่าในแผงมาตรฐาน (ยังไม่กดบันทึก) ให้ตาราง/การ์ดคำนวณ preview ค่าใหม่แบบ real-time

  Props:
    start  — Date (required)
    end    — Date (required)
    bucket — String ('week')

  Emits: focus-abnormal(deptKey) — คลิกตัวเลข "ค้างนานผิดปกติ" ในตาราง ส่งต่อให้ wip-section.vue โฟกัสตาราง (4)
-->
<template>
  <div class="wip-lead-time-panel">
    <div id="insight-report-leadTime" class="wip-lead-time-panel__anchor">
      <SectionCardGeneric
        :title="$t('view.productionInsight.wip.leadTimeTitle')"
        :titleTip="$t('view.productionInsight.help.leadTimeTitle')"
        icon="bi-hourglass-split"
        accent="main"
        headerStyle="legend"
      >
        <div class="wip-lead-time-panel__toolbar">
          <p class="wip-lead-time-panel__hint">{{ $t('view.productionInsight.wip.leadTimeSelectHint') }}</p>
          <WipStandardsPanel :departments="departments" :standards="standards" @draft-change="onDraftChange" @saved="onSaved" />
        </div>
        <WipLeadTimeTable
          :departments="departments"
          :selectedKey="selectedDeptKey"
          :splitDataSince="splitDataSince"
          :savedStandards="standards"
          :loading="loading"
          @select-dept="onSelectDept"
          @focus-abnormal="onFocusAbnormal"
        />
      </SectionCardGeneric>
    </div>

    <SectionCardGeneric
      v-if="selectedRow"
      :title="detailTitle"
      :titleTip="$t('view.productionInsight.help.leadTimeDetailChart')"
      icon="bi-graph-up"
      accent="main"
      headerStyle="legend"
    >
      <WipLeadTimeChart :selectedRow="selectedRow" :rangeLabel="rangeLabel" :loading="loading" />
    </SectionCardGeneric>

    <WipCapacityPanel :capacity="capacity" :loading="loading" />
  </div>
</template>

<script>
import { useProductionInsightApiStore } from '@/stores/modules/api/production/production-insight-api.js'
import { formatRangeLabel } from '@/services/utils/range-presets.js'
import { resolveMostOverStandardDept } from './wip-lead-time-helpers.js'

import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import WipLeadTimeTable from './wip-lead-time-table.vue'
import WipLeadTimeChart from './wip-lead-time-chart.vue'
import WipCapacityPanel from './wip-capacity-panel.vue'
import WipStandardsPanel from './wip-standards-panel.vue'

const emptyCapacity = () => ({ current: {}, atStandard: {}, departments: [] })

export default {
  name: 'WipLeadTimePanel',

  components: {
    SectionCardGeneric,
    WipLeadTimeTable,
    WipLeadTimeChart,
    WipCapacityPanel,
    WipStandardsPanel
  },

  setup() {
    const productionInsightStore = useProductionInsightApiStore()
    return { productionInsightStore }
  },

  props: {
    start: {
      type: Date,
      required: true
    },
    end: {
      type: Date,
      required: true
    },
    bucket: {
      type: String,
      default: 'week'
    }
  },

  emits: ['focus-abnormal'],

  data() {
    return {
      loading: false,
      departments: [],
      capacity: emptyCapacity(),
      standards: [],
      selectedDeptKey: null,
      draftStandards: [],
      splitDataSince: null
    }
  },

  computed: {
    rangeLabel() {
      return formatRangeLabel(this.start, this.end)
    },

    selectedRow() {
      return this.departments.find((d) => d.key === this.selectedDeptKey) || null
    },

    detailTitle() {
      if (!this.selectedRow) return ''
      return this.$t('view.productionInsight.wip.leadTimeDetailTitle', { name: this.$t(`view.executive.department.${this.selectedRow.key}`) })
    }
  },

  watch: {
    start() {
      this.fetchLeadTime()
    },
    end() {
      this.fetchLeadTime()
    },
    bucket() {
      this.fetchLeadTime()
    }
  },

  methods: {
    onSelectDept(key) {
      this.selectedDeptKey = key
    },

    onFocusAbnormal(key) {
      this.$emit('focus-abnormal', key)
    },

    // ผู้ใช้แก้ค่าในแผงมาตรฐาน (ยังไม่บันทึก) — เก็บ draft ไว้ยิง StageLeadTime ใหม่ให้ตาราง/การ์ด preview
    // แบบ real-time (แผงมาตรฐานเป็นคน debounce การยิง event นี้เองแล้ว)
    onDraftChange(items) {
      this.draftStandards = items
      this.fetchLeadTime()
    },

    // บันทึกมาตรฐานสำเร็จ — เคลียร์ draft แล้วโหลดทั้งคู่ใหม่ด้วยค่าที่บันทึกจริง
    async onSaved() {
      this.draftStandards = []
      await Promise.all([this.fetchLeadTime(), this.fetchStandards()])
    },

    async fetchLeadTime() {
      this.loading = true
      const res = await this.productionInsightStore.fetchStageLeadTime({
        start: this.start,
        end: this.end,
        bucket: this.bucket,
        draftStandards: this.draftStandards
      })
      this.departments = res?.departments || []
      this.capacity = res?.capacity ? { ...emptyCapacity(), ...res.capacity } : emptyCapacity()
      this.splitDataSince = res?.splitDataSince ?? null
      if (!this.selectedDeptKey || !this.departments.some((d) => d.key === this.selectedDeptKey)) {
        this.selectedDeptKey = resolveMostOverStandardDept(this.departments)
      }
      this.loading = false
    },

    async fetchStandards() {
      this.standards = (await this.productionInsightStore.fetchStageStandards()) || []
    }
  },

  mounted() {
    this.fetchLeadTime()
    this.fetchStandards()
  }
}
</script>

<style lang="scss" scoped>
.wip-lead-time-panel {
  min-width: 0;
}

// legend-style SectionCardGeneric ต้องการ margin-top var(--sp-2xl) เสมอ (เผื่อชิป title คร่อมขอบบน) —
// container sibling-spacing ห้ามเล็กกว่านี้ ดู insight-tab-layout.vue comment + Decision Log
.wip-lead-time-panel > * + * {
  margin-top: var(--sp-2xl);
}

.wip-lead-time-panel__anchor {
  scroll-margin-top: calc(var(--mainbar-height) + 64px);
}

.wip-lead-time-panel__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-md);
  margin-bottom: var(--sp-md);
}

.wip-lead-time-panel__hint {
  margin: 0;
  font-size: var(--fs-sm);
  color: var(--base-sub-color);
  font-style: italic;
}
</style>
