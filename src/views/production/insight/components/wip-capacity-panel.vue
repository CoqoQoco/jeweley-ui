<!--
  wip-capacity-panel — กล่อง "ผลต่อกำลังการผลิต" (ส่วนที่ 3 ของ reportRef: leadTime) — เทียบ 2 คอลัมน์
  "ตอนนี้" vs "ถ้าได้ตามมาตรฐาน" (เวลาผลิตรวม/กำลังผลิต ใบ/เดือน/คอขวด สรุปด้านบน ไม่เปลี่ยนจากเดิม) +
  ตารางย่อยต่อแผนก (งานค้าง/ใบที่ออก/ออกจริง ใบ/วัน/คิวเทียบเท่าตอนนี้/เวลาจริง/มาตรฐาน/ถ้าได้ตามมาตรฐาน ใบ/วัน/
  คิวเทียบเท่าถ้าได้มาตรฐาน) — กำลังผลิต = ใบที่ออกจากแผนกจริงต่อวัน, ถ้าได้ตามมาตรฐาน = exitsPerDay ×
  (เวลาจริง ÷ มาตรฐาน) เฉพาะแผนกที่ช้ากว่ามาตรฐาน (ไม่งั้นคงเดิม) — ไม่ใช้ Little's Law อีกต่อไป (ⓘ อธิบาย
  โมเดลใหม่ไว้ที่หัวข้อ) — คอขวด = **แผนกที่คิวยาวที่สุด** (activeWip ÷ exitsPerDay ไม่ใช่แผนกที่ปล่อยงานได้
  น้อยที่สุด เพราะงานไม่ได้ผ่านทุกแผนกเท่ากัน) ชิปคอขวดมาจาก isBottleneckCurrent/isBottleneckAtStandard ต่อแถว
  ผูกกับคอลัมน์คิวเทียบเท่า (ไม่ใช่คอลัมน์ออกจริง/ใบต่อวันอีกต่อไป)

  Props:
    capacity — Object (required) จาก StageLeadTime.capacity { current, atStandard, departments[] }
    loading  — Boolean (false)
-->
<template>
  <SectionCardGeneric
    :title="$t('view.productionInsight.wip.capacityTitle')"
    :titleTip="$t('view.productionInsight.help.capacityTitle')"
    icon="bi-speedometer"
    accent="main"
    headerStyle="legend"
  >
    <div class="wip-capacity-panel__summary">
      <div class="wip-capacity-panel__summary-row wip-capacity-panel__summary-row--head">
        <span></span>
        <span>{{ $t('view.productionInsight.wip.capacityColNow') }}</span>
        <span>{{ $t('view.productionInsight.wip.capacityColAtStandard') }}</span>
      </div>
      <div class="wip-capacity-panel__summary-row">
        <span>{{ $t('view.productionInsight.wip.capacityTotalLeadDays') }}</span>
        <span>{{ formatDays(capacity.current?.totalLeadDays) }}</span>
        <span>{{ formatDays(capacity.atStandard?.totalLeadDays) }}</span>
      </div>
      <div class="wip-capacity-panel__summary-row">
        <span>{{ $t('view.productionInsight.wip.capacityThroughput') }}</span>
        <span>{{ formatCount(capacity.current?.monthlyThroughput) }}</span>
        <span>{{ formatCount(capacity.atStandard?.monthlyThroughput) }}</span>
      </div>
      <div class="wip-capacity-panel__summary-row">
        <span>{{ $t('view.productionInsight.wip.capacityBottleneck') }}</span>
        <span>{{ deptLabel(capacity.current?.bottleneckDept) }}</span>
        <span>{{ deptLabel(capacity.atStandard?.bottleneckDept) }}</span>
      </div>
    </div>

    <p class="wip-capacity-panel__delta-summary">
      {{ $t('view.productionInsight.wip.capacityTotalLeadDays') }}: {{ totalLeadDaysDeltaText }} · {{ $t('view.productionInsight.wip.capacityThroughput') }}: {{ throughputDeltaText }}
    </p>

    <p class="wip-capacity-panel__note">
      <i class="bi bi-info-circle"></i>
      {{ $t('view.productionInsight.help.capacityModelExplanation') }}
    </p>

    <p class="wip-capacity-panel__dept-title">{{ $t('view.productionInsight.wip.capacityDeptTableTitle') }}</p>
    <div class="responsive-table-wrapper">
      <BaseDataTable :items="deptRows" :columns="deptColumns" :paginator="false" dataKey="key">
        <template #activeWipTemplate="{ data }">
          <div class="text-right">{{ formatCount(data.activeWip) }}</div>
        </template>
        <template #exitedCountTemplate="{ data }">
          <div class="text-right">{{ formatCount(data.exitedCount) }}</div>
        </template>
        <template #exitedPerDayTemplate="{ data }">
          <div class="text-right">{{ formatDecimal(data.exitedPerDay) }}</div>
        </template>
        <template #queueDaysCurrentTemplate="{ data }">
          <div class="text-right wip-capacity-panel__dept-cell">
            {{ formatDays(data.queueDaysCurrent) }}
            <span v-if="data.isBottleneckCurrent" class="wip-capacity-panel__bottleneck-chip">{{ $t('view.productionInsight.wip.capacityBottleneckChip') }}</span>
          </div>
        </template>
        <template #medianTotalTemplate="{ data }">
          <div class="text-right">{{ formatDays(data.medianTotal) }}</div>
        </template>
        <template #standardDaysTemplate="{ data }">
          <div class="text-right">{{ formatDays(data.standardDays) }}</div>
        </template>
        <template #atStandardPerDayTemplate="{ data }">
          <div class="text-right">{{ formatDecimal(data.atStandardPerDay) }}</div>
        </template>
        <template #queueDaysAtStandardTemplate="{ data }">
          <div class="text-right wip-capacity-panel__dept-cell">
            {{ formatDays(data.queueDaysAtStandard) }}
            <span v-if="data.isBottleneckAtStandard" class="wip-capacity-panel__bottleneck-chip">{{ $t('view.productionInsight.wip.capacityBottleneckChip') }}</span>
          </div>
        </template>
      </BaseDataTable>
    </div>
  </SectionCardGeneric>
</template>

<script>
import { buildCapacityDeltaText } from './wip-lead-time-helpers.js'

import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'

export default {
  name: 'WipCapacityPanel',

  components: {
    SectionCardGeneric,
    BaseDataTable
  },

  props: {
    capacity: {
      type: Object,
      required: true
    },
    loading: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    totalLeadDaysDeltaText() {
      return buildCapacityDeltaText(this.capacity.current?.totalLeadDays, this.capacity.atStandard?.totalLeadDays, this.formatDays)
    },

    throughputDeltaText() {
      return buildCapacityDeltaText(this.capacity.current?.monthlyThroughput, this.capacity.atStandard?.monthlyThroughput, this.formatCount)
    },

    deptRows() {
      return (this.capacity.departments || []).map((d) => ({ ...d, label: this.deptLabel(d.key) }))
    },

    deptColumns() {
      return [
        { field: 'label', header: this.$t('view.productionInsight.wip.leadTimeColDept'), sortable: false, minWidth: '110px' },
        { field: 'activeWip', header: this.$t('view.productionInsight.wip.capacityColDeptActiveWip'), sortable: false, minWidth: '100px', align: 'right' },
        { field: 'exitedCount', header: this.$t('view.productionInsight.wip.capacityColDeptExited'), sortable: false, minWidth: '100px', align: 'right' },
        { field: 'exitedPerDay', header: this.$t('view.productionInsight.wip.capacityColDeptExitedPerDay'), sortable: false, minWidth: '140px', align: 'right' },
        { field: 'queueDaysCurrent', header: this.$t('view.productionInsight.wip.capacityColDeptQueueDaysCurrent'), sortable: false, minWidth: '160px', align: 'right' },
        { field: 'medianTotal', header: this.$t('view.productionInsight.wip.capacityColDeptMedianTotal'), sortable: false, minWidth: '130px', align: 'right' },
        { field: 'standardDays', header: this.$t('view.productionInsight.wip.capacityColDeptStandard'), sortable: false, minWidth: '110px', align: 'right' },
        { field: 'atStandardPerDay', header: this.$t('view.productionInsight.wip.capacityColDeptAtStandardPerDay'), sortable: false, minWidth: '170px', align: 'right' },
        { field: 'queueDaysAtStandard', header: this.$t('view.productionInsight.wip.capacityColDeptQueueDaysAtStandard'), sortable: false, minWidth: '180px', align: 'right' }
      ]
    }
  },

  methods: {
    deptLabel(key) {
      return key ? this.$t(`view.executive.department.${key}`) : '—'
    },

    formatDays(value) {
      return value != null ? `${new Intl.NumberFormat('th-TH', { maximumFractionDigits: 1 }).format(value)} ${this.$t('view.productionInsight.wip.leadTimeDaysUnit')}` : '—'
    },

    formatCount(value) {
      return value != null ? new Intl.NumberFormat('th-TH').format(value) : '—'
    },

    formatDecimal(value) {
      return value != null ? new Intl.NumberFormat('th-TH', { maximumFractionDigits: 2 }).format(value) : '—'
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/web';

.wip-capacity-panel__summary {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.wip-capacity-panel__summary-row {
  display: grid;
  grid-template-columns: 1.4fr 1fr 1fr;
  gap: var(--sp-md);
  padding: var(--sp-sm) var(--sp-md);

  &:not(:last-child) {
    border-bottom: 1px solid var(--color-border);
  }

  &--head {
    background: var(--color-highlight-bg);
    font-weight: 700;
    color: var(--base-font-color);
  }
}

.wip-capacity-panel__delta-summary {
  margin: var(--sp-sm) 0 0;
  font-size: var(--fs-sm);
  color: var(--base-sub-color);
}

.wip-capacity-panel__note {
  display: flex;
  align-items: center;
  gap: var(--sp-xs);
  margin: var(--sp-md) 0 0;
  font-size: var(--fs-sm);
  color: var(--base-sub-color);
  font-style: italic;
}

.wip-capacity-panel__dept-title {
  margin: var(--sp-lg) 0 var(--sp-sm);
  font-size: var(--fs-base);
  font-weight: 700;
  color: var(--base-font-color);
}

.wip-capacity-panel__dept-cell {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--sp-xs);
}

// ชิปคอขวด — พื้นเต็มสีแดง ไม่ใช้แถบซ้าย (ห้าม border-left accent ตาม Core Principle #14)
.wip-capacity-panel__bottleneck-chip {
  display: inline-flex;
  align-items: center;
  padding: 1px var(--sp-xs);
  border-radius: var(--radius-sm);
  background: var(--base-red);
  color: var(--on-inverse);
  font-size: 10px;
  font-weight: 700;
  white-space: nowrap;
}
</style>
