<!--
  gold-stage-table — ตาราง "Loss ตามใบงานรายแผนก (จ่าย − รับ)" (ส่วนแรกของ reportRef: goldStage) ของหมวด
  "ทองและ Loss" — คลิกแถว = เลือกแผนกไปแสดงรายละเอียด (กราฟรายเดือน + อันดับช่าง) — แผนก "แต่ง" (trim,
  includesScrap) มี sub-note ก้าน/เศษส่งหลอม, แผนก "คัดพลอย" (gemSort, notWeighed) ไม่ได้ชั่งน้ำหนักเลย โชว์
  ข้อความแทนตัวเลขทุกคอลัมน์ — เช็คจาก flag `includesScrap`/`notWeighed` ตรงๆ ไม่ได้ hardcode เทียบ deptKey
  (deptKey เป็น string key เดียวกับ wip/capacity แปลผ่าน view.executive.department.* ปกติ)

  คอลัมน์ "จ่าย (g)" โชว์ `returnedSendGram` (เฉพาะรายการที่รับคืนแล้ว) ไม่ใช่ `sendGram` ดิบ (ที่รวมใบที่ยังค้าง
  ไม่รับคืนด้วย) — กันผู้ใช้เอา จ่าย−รับ มาลบเองแล้วไม่ตรงกับคอลัมน์ "ส่วนต่าง" ที่ตารางโชว์ (ยืนยันจาก user
  ตรวจบน prod — sendGram ดิบทำให้ จ่าย-รับ ไม่ตรงกับ diffGram ที่แท้จริง) — มี ⓘ กำกับหัวคอลัมน์อธิบายเงื่อนไข
  นี้ ส่วนค้างไม่รับคืนยังอยู่คอลัมน์ "ค้างไม่รับคืน" แยกต่างหากเหมือนเดิม

  คอลัมน์ "ค้างไม่รับคืน" แยก 2 บรรทัดย่อยตามคู่ field pendingWithWorkerCount/Gram (ค้างที่ตัวช่างแล้วแต่ยังไม่
  รับคืน) กับ pendingQueueCount/Gram (ยังไม่ได้จ่ายให้ช่างเลย รอคิวอยู่) — ยืนยันจาก API agent 2026-10-01 —
  ว่างทั้งคู่โชว์ "—"

  Props:
    departments — Array (required) จาก GoldByStage.departments
    selectedKey — Number|null (null) — deptKey ที่เลือกอยู่ (highlight แถว)
    loading     — Boolean (false)

  Emits: select-dept(deptKey)
-->
<template>
  <div class="responsive-table-wrapper">
    <BaseDataTable :items="rows" :columns="columns" :paginator="false" dataKey="deptKey" :rowClass="rowClass" :loading="loading" @row-click="onRowClick">
      <template #header-sendGram>
        <span class="gold-stage-table__col-header">
          {{ $t('view.productionInsight.gold.stageColSend') }}
          <InfoTipGeneric :text="$t('view.productionInsight.help.goldStageSendGram')" position="bottom" tone="inverse" />
        </span>
      </template>
      <template #header-diffPercent>
        <span class="gold-stage-table__col-header">
          {{ $t('view.productionInsight.gold.stageColDiffPercent') }}
          <InfoTipGeneric :text="$t('view.productionInsight.help.goldStageDiffPercent')" position="bottom" tone="inverse" />
        </span>
      </template>

      <template #labelTemplate="{ data }">
        <span class="gold-stage-table__dept-cell">
          <strong>{{ data.label }}</strong>
          <InfoTipGeneric v-if="data.includesScrap" :text="$t('view.productionInsight.gold.stageTrimScrapNote')" />
        </span>
      </template>

      <template #sendGramTemplate="{ data }">
        <div v-if="!data.notWeighed" class="text-right">{{ formatGram(data.returnedSendGram) }}</div>
      </template>
      <template #receivedGramTemplate="{ data }">
        <div v-if="!data.notWeighed" class="text-right">{{ formatGram(data.receivedGram) }}</div>
      </template>
      <template #diffGramTemplate="{ data }">
        <div v-if="!data.notWeighed" class="text-right">{{ formatGram(data.diffGram) }}</div>
      </template>
      <template #diffPercentTemplate="{ data }">
        <div v-if="data.notWeighed" class="gold-stage-table__not-weighed">{{ $t('view.productionInsight.gold.stageNotWeighed') }}</div>
        <div v-else class="text-right" :class="{ 'gold-stage-table__diff--over': isOverTarget(data) }">{{ formatPercent(data.diffPercent) }}</div>
      </template>
      <template #targetPercentTemplate="{ data }">
        <div v-if="!data.notWeighed" class="text-right">{{ formatPercent(data.targetPercent) }}</div>
      </template>
      <template #slipLossPercentTemplate="{ data }">
        <div v-if="!data.notWeighed" class="text-right">{{ formatPercent(data.slipLossPercent) }}</div>
      </template>
      <template #pendingTemplate="{ data }">
        <div v-if="!data.notWeighed" class="text-right gold-stage-table__pending">
          <div v-if="pendingWorkerLine(data)">{{ pendingWorkerLine(data) }}</div>
          <div v-if="pendingQueueLine(data)">{{ pendingQueueLine(data) }}</div>
          <span v-if="!pendingWorkerLine(data) && !pendingQueueLine(data)">—</span>
        </div>
      </template>
    </BaseDataTable>
  </div>
</template>

<script>
import { resolveStageDiffVariant, formatStagePendingWithWorker, formatStagePendingQueue } from './gold-stage-helpers.js'

import InfoTipGeneric from '@/components/generic/InfoTipGeneric.vue'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'

export default {
  name: 'GoldStageTable',

  components: {
    InfoTipGeneric,
    BaseDataTable
  },

  props: {
    departments: {
      type: Array,
      required: true
    },
    selectedKey: {
      type: Number,
      default: null
    },
    loading: {
      type: Boolean,
      default: false
    }
  },

  emits: ['select-dept'],

  computed: {
    rows() {
      return this.departments.map((d) => ({ ...d, label: this.$t(`view.executive.department.${d.deptKey}`) }))
    },

    // คอลัมน์ sendGram/diffPercent มี custom header slot (label+ⓘ) ต้องเคลียร์ header prop ทิ้งเป็น '' ไม่งั้น
    // หัวขึ้นซ้ำ 2 จุด (เหมือน wip-lead-time-table.vue/capacity-department-table.vue)
    columns() {
      return [
        { field: 'label', header: this.$t('view.productionInsight.gold.stageColDept'), sortable: false, minWidth: '110px' },
        { field: 'sendGram', header: '', sortable: false, minWidth: '90px', align: 'right' },
        { field: 'receivedGram', header: this.$t('view.productionInsight.gold.stageColReceived'), sortable: false, minWidth: '90px', align: 'right' },
        { field: 'diffGram', header: this.$t('view.productionInsight.gold.stageColDiffGram'), sortable: false, minWidth: '90px', align: 'right' },
        { field: 'diffPercent', header: '', sortable: false, minWidth: '110px' },
        { field: 'targetPercent', header: this.$t('view.productionInsight.gold.stageColTarget'), sortable: false, minWidth: '80px', align: 'right' },
        { field: 'slipLossPercent', header: this.$t('view.productionInsight.gold.stageColSlipPercent'), sortable: false, minWidth: '100px', align: 'right' },
        { field: 'pending', header: this.$t('view.productionInsight.gold.stageColPending'), sortable: false, minWidth: '120px', align: 'right' }
      ]
    }
  },

  methods: {
    isOverTarget(data) {
      return resolveStageDiffVariant(data.diffPercent, data.targetPercent) === 'warning'
    },

    pendingWorkerLine(data) {
      if (!formatStagePendingWithWorker(data, this.formatCount, this.formatGram)) return ''
      return this.$t('view.productionInsight.gold.stagePendingWithWorker', { count: this.formatCount(data.pendingWithWorkerCount), gram: this.formatGram(data.pendingWithWorkerGram) })
    },

    pendingQueueLine(data) {
      if (!formatStagePendingQueue(data, this.formatCount, this.formatGram)) return ''
      return this.$t('view.productionInsight.gold.stagePendingQueue', { count: this.formatCount(data.pendingQueueCount), gram: this.formatGram(data.pendingQueueGram) })
    },

    formatCount(value) {
      return value != null ? new Intl.NumberFormat('th-TH').format(value) : '—'
    },

    formatGram(value) {
      return value != null ? new Intl.NumberFormat('th-TH', { maximumFractionDigits: 2 }).format(value) : '—'
    },

    formatPercent(value) {
      return value != null ? `${new Intl.NumberFormat('th-TH', { maximumFractionDigits: 2 }).format(value)}%` : '—'
    },

    rowClass(data) {
      return { 'gold-stage-table__row--selected': data.deptKey === this.selectedKey }
    },

    onRowClick(event) {
      if (event?.data?.deptKey != null) this.$emit('select-dept', event.data.deptKey)
    }
  }
}
</script>

<style lang="scss" scoped>
.gold-stage-table__col-header {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-xs);
}

.gold-stage-table__dept-cell {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-xs);
}

.gold-stage-table__pending {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: var(--fs-sm);
}

.gold-stage-table__not-weighed {
  color: var(--base-sub-color);
  font-style: italic;
}

.gold-stage-table__diff--over {
  color: var(--base-red);
  font-weight: 700;
}

:deep(.gold-stage-table__row--selected) {
  background-color: var(--color-highlight-bg) !important;
}

:deep(.p-datatable-tbody > tr) {
  cursor: pointer;
}
</style>
