<!--
  wip-lead-time-table — ตาราง "เวลาผลิตรายแผนก" (ส่วนแรกของ reportRef: leadTime) ของหมวด "งานค้างและคอขวด"
  — รับ departments[] จาก ProductionInsight/StageLeadTime (wip-lead-time-panel.vue เป็นคนยิง) แสดงค่ากลาง/
  P90/เทียบมาตรฐาน/สัดส่วนรอ-ทำ/แนวโน้มย่อ ต่อแผนก คลิกแถว = เลือกแผนกไปแสดงกราฟรายละเอียด (2), คลิกตัวเลข
  "ค้างนานผิดปกติ" = โฟกัสตาราง (4) เฉพาะแผนกนั้น

  Props:
    departments    — Array (required) ของ StageLeadTime departments[] item
    selectedKey    — String ('') — key แผนกที่เลือกอยู่ (highlight แถว)
    splitDataSince — String|null (null) — วันที่ระบบเริ่มบันทึกเวลารับงานแยกรอ/ทำ (StageLeadTime.splitDataSince)
                     ใช้ในข้อความ tip ของเซลล์รอ/ทำ/สัดส่วนที่ยังไม่มีข้อมูล (null = ยังไม่ระบุ ใช้ข้อความ fallback)
    savedStandards — Array ([]) — StageStandards ที่บันทึกไว้จริง [{deptKey,standardDays,...}] ใช้เทียบกับ
                     standardDays ของแถว (ที่เป็นค่า draft พรีวิวอยู่) ว่าต่างจากค่าที่บันทึกจริงหรือไม่ — API
                     คืน standardSource:'draft' ให้ทุกแผนกเมื่อกำลัง preview (ไม่ใช่แค่แผนกที่แก้จริง) ต้องเทียบ
                     ค่าเองถึงจะรู้ว่าควรโชว์ชิป "ร่าง" ที่แถวไหนบ้าง
    loading        — Boolean (false)

  Emits: select-dept(key), focus-abnormal(key)
-->
<template>
  <div class="responsive-table-wrapper">
    <BaseDataTable :items="rows" :columns="columns" :paginator="false" dataKey="key" :rowClass="rowClass" @row-click="onRowClick">
      <template #header-standard>
        <span class="wip-lead-time-table__col-header">
          {{ $t('view.productionInsight.wip.leadTimeColStandard') }}
          <InfoTipGeneric :text="$t('view.productionInsight.help.leadTimeColStandard')" position="bottom" tone="inverse" />
        </span>
      </template>
      <template #header-medianTotal>
        <span class="wip-lead-time-table__col-header">
          {{ $t('view.productionInsight.wip.leadTimeColMedianTotal') }}
          <InfoTipGeneric :text="$t('view.productionInsight.help.leadTimeColMedianTotal')" position="bottom" tone="inverse" />
        </span>
      </template>
      <template #header-wait>
        <span class="wip-lead-time-table__col-header">
          {{ $t('view.productionInsight.wip.leadTimeColWait') }}
          <InfoTipGeneric :text="$t('view.productionInsight.help.leadTimeColWait')" position="bottom" tone="inverse" />
        </span>
      </template>
      <template #header-work>
        <span class="wip-lead-time-table__col-header">
          {{ $t('view.productionInsight.wip.leadTimeColWork') }}
          <InfoTipGeneric :text="$t('view.productionInsight.help.leadTimeColWork')" position="bottom" tone="inverse" />
        </span>
      </template>
      <template #header-share>
        <span class="wip-lead-time-table__col-header">
          {{ $t('view.productionInsight.wip.leadTimeColShareHeader') }}
          <InfoTipGeneric :text="$t('view.productionInsight.help.leadTimeColShare')" position="bottom" tone="inverse" />
        </span>
      </template>
      <template #header-p90>
        <span class="wip-lead-time-table__col-header">
          {{ $t('view.productionInsight.wip.leadTimeColP90') }}
          <InfoTipGeneric :text="$t('view.productionInsight.help.leadTimeColP90')" position="bottom" tone="inverse" />
        </span>
      </template>
      <template #header-vsStandard>
        <span class="wip-lead-time-table__col-header">
          {{ $t('view.productionInsight.wip.leadTimeColVsStandard') }}
          <InfoTipGeneric :text="$t('view.productionInsight.help.leadTimeColVsStandard')" position="bottom" tone="inverse" />
        </span>
      </template>
      <template #header-exited>
        <span class="wip-lead-time-table__col-header">
          {{ $t('view.productionInsight.wip.leadTimeColExited') }}
          <InfoTipGeneric :text="$t('view.productionInsight.help.leadTimeColExited')" position="bottom" tone="inverse" />
        </span>
      </template>
      <template #header-abnormal>
        <span class="wip-lead-time-table__col-header">
          {{ $t('view.productionInsight.wip.leadTimeColAbnormal') }}
          <InfoTipGeneric :text="$t('view.productionInsight.help.leadTimeColAbnormal')" position="bottom" tone="inverse" />
        </span>
      </template>
      <template #header-currentWaiting>
        <span class="wip-lead-time-table__col-header">
          {{ $t('view.productionInsight.wip.leadTimeColCurrentWaiting') }}
          <InfoTipGeneric :text="$t('view.productionInsight.help.leadTimeColCurrentWaiting')" position="bottom" tone="inverse" />
        </span>
      </template>
      <template #header-trend>
        <span class="wip-lead-time-table__col-header">
          {{ $t('view.productionInsight.wip.leadTimeColTrend') }}
          <InfoTipGeneric :text="$t('view.productionInsight.help.leadTimeColTrend')" position="bottom" tone="inverse" />
        </span>
      </template>

      <template #labelTemplate="{ data }">
        <strong>{{ data.label }}</strong>
      </template>

      <template #standardTemplate="{ data }">
        <div class="wip-lead-time-table__standard">
          <span>{{ data.standardDays ?? '—' }}</span>
          <span v-if="isDraftChanged(data)" class="wip-lead-time-table__draft-chip">
            {{ $t('view.productionInsight.wip.leadTimeStandardDraftChip') }}
          </span>
        </div>
      </template>

      <template #medianTotalTemplate="{ data }">
        <div class="text-right">{{ formatDays(data.median?.total) }}</div>
      </template>

      <template #waitTemplate="{ data }">
        <div class="text-right">
          <span v-if="data.median?.wait == null" class="wip-lead-time-table__no-data">
            —
            <InfoTipGeneric :text="noSplitDataTip" />
          </span>
          <template v-else>
            {{ formatDays(data.median.wait) }}
            <span v-if="isSmallSample(data.splitSampleCount)" class="wip-lead-time-table__sample-hint">({{ data.splitSampleCount }} {{ $t('view.productionInsight.wip.planUnit') }})</span>
          </template>
        </div>
      </template>

      <template #workTemplate="{ data }">
        <div class="text-right">
          <span v-if="data.median?.work == null" class="wip-lead-time-table__no-data">
            —
            <InfoTipGeneric :text="noSplitDataTip" />
          </span>
          <template v-else>
            {{ formatDays(data.median.work) }}
            <span v-if="isSmallSample(data.splitSampleCount)" class="wip-lead-time-table__sample-hint">({{ data.splitSampleCount }} {{ $t('view.productionInsight.wip.planUnit') }})</span>
          </template>
        </div>
      </template>

      <template #shareTemplate="{ data }">
        <span v-if="!shareOf(data).hasData" class="wip-lead-time-table__no-data">
          —
          <InfoTipGeneric :text="noSplitDataTip" />
        </span>
        <div v-else class="wip-lead-time-table__share-bar" :title="shareTitle(data)">
          <span class="wip-lead-time-table__share-wait" :style="{ width: shareOf(data).waitPercent + '%' }"></span>
          <span class="wip-lead-time-table__share-work" :style="{ width: shareOf(data).workPercent + '%' }"></span>
        </div>
      </template>

      <template #p90Template="{ data }">
        <div class="text-right">{{ formatDays(data.p90?.total) }}</div>
      </template>

      <template #vsStandardTemplate="{ data }">
        <span class="wip-lead-time-table__chip" :style="{ color: chipColor(data), borderColor: chipColor(data) }">
          {{ chipText(data) }}
        </span>
      </template>

      <template #exitedTemplate="{ data }">
        <div class="text-right">{{ data.exitedCount ?? 0 }}</div>
      </template>

      <template #currentWaitingTemplate="{ data }">
        <div class="text-right">{{ data.currentWaitingCount ?? '—' }}</div>
      </template>

      <template #abnormalTemplate="{ data }">
        <div class="text-right">
          <ButtonGeneric
            v-if="data.abnormalCount > 0"
            variant="plain"
            :label="String(data.abnormalCount)"
            :title="$t('view.productionInsight.help.leadTimeColAbnormal')"
            @click.stop="$emit('focus-abnormal', data.key)"
          />
          <span v-else>0</span>
        </div>
      </template>

      <template #trendTemplate="{ data }">
        <ChartGeneric type="line" :series="sparklineSeriesOf(data)" :options="sparklineOptions" :height="32" />
      </template>
    </BaseDataTable>
  </div>
</template>

<script>
import { CHART_TOKENS } from '@/services/utils/chart-colors.js'
import { formatDate } from '@/services/utils/dayjs.js'
import {
  resolveStandardChipVariant,
  resolveStandardChipColorToken,
  calcWaitWorkShare,
  isSmallSplitSample,
  shouldShowDraftChip,
  mapSeriesField
} from './wip-lead-time-helpers.js'

import InfoTipGeneric from '@/components/generic/InfoTipGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import ChartGeneric from '@/components/prime-vue/ChartGeneric.vue'

export default {
  name: 'WipLeadTimeTable',

  components: {
    InfoTipGeneric,
    ButtonGeneric,
    BaseDataTable,
    ChartGeneric
  },

  props: {
    departments: {
      type: Array,
      required: true
    },
    selectedKey: {
      type: String,
      default: ''
    },
    splitDataSince: {
      type: String,
      default: null
    },
    savedStandards: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    }
  },

  emits: ['select-dept', 'focus-abnormal'],

  computed: {
    rows() {
      return this.departments.map((d) => ({ ...d, label: this.$t(`view.executive.department.${d.key}`) }))
    },

    // BaseDataTable/PrimeVue เรนเดอร์ทั้ง `header` prop และ `#header-<field>` slot คู่กันเสมอ (ไม่ทับกัน — ดู
    // node_modules/primevue/datatable/HeaderCell.vue) คอลัมน์ไหนมี custom header slot (label+ⓘ) ต้องเคลียร์
    // `header` prop ทิ้งเป็น '' ไม่งั้นหัวขึ้นซ้ำ 2 จุด (เหมือน gold-loss-dashboard reconcile-tab)
    columns() {
      const fieldsWithCustomHeaderSlot = ['standard', 'medianTotal', 'wait', 'work', 'share', 'p90', 'vsStandard', 'exited', 'abnormal', 'currentWaiting', 'trend']
      const cols = [
        { field: 'label', header: this.$t('view.productionInsight.wip.leadTimeColDept'), sortable: false, minWidth: '110px' },
        { field: 'standard', header: this.$t('view.productionInsight.wip.leadTimeColStandard'), sortable: false, minWidth: '90px' },
        { field: 'medianTotal', header: this.$t('view.productionInsight.wip.leadTimeColMedianTotal'), sortable: false, minWidth: '90px', align: 'right' },
        { field: 'wait', header: this.$t('view.productionInsight.wip.leadTimeColWait'), sortable: false, minWidth: '90px', align: 'right' },
        { field: 'work', header: this.$t('view.productionInsight.wip.leadTimeColWork'), sortable: false, minWidth: '90px', align: 'right' },
        { field: 'share', header: this.$t('view.productionInsight.wip.leadTimeColShareHeader'), sortable: false, minWidth: '90px' },
        { field: 'p90', header: this.$t('view.productionInsight.wip.leadTimeColP90'), sortable: false, minWidth: '80px', align: 'right' },
        { field: 'vsStandard', header: this.$t('view.productionInsight.wip.leadTimeColVsStandard'), sortable: false, minWidth: '100px' },
        { field: 'exited', header: this.$t('view.productionInsight.wip.leadTimeColExited'), sortable: false, minWidth: '80px', align: 'right' },
        { field: 'abnormal', header: this.$t('view.productionInsight.wip.leadTimeColAbnormal'), sortable: false, minWidth: '110px', align: 'right' },
        { field: 'currentWaiting', header: this.$t('view.productionInsight.wip.leadTimeColCurrentWaiting'), sortable: false, minWidth: '100px', align: 'right' },
        { field: 'trend', header: this.$t('view.productionInsight.wip.leadTimeColTrend'), sortable: false, minWidth: '100px' }
      ]
      return cols.map((col) => (fieldsWithCustomHeaderSlot.includes(col.field) ? { ...col, header: '' } : col))
    },

    // ข้อความ tip เมื่อรอ/ทำ/สัดส่วนของแถวเป็น null (ยังไม่มีข้อมูลแยก) — ใช้ splitDataSince ถ้ามี
    noSplitDataTip() {
      return this.splitDataSince
        ? this.$t('view.productionInsight.wip.leadTimeNoSplitDataTip', { date: formatDate(this.splitDataSince) })
        : this.$t('view.productionInsight.wip.leadTimeNoSplitDataTipUnknown')
    },

    sparklineOptions() {
      return {
        chart: { sparkline: { enabled: true } },
        stroke: { width: 2, curve: 'smooth' },
        colors: [CHART_TOKENS.sub],
        tooltip: { enabled: false }
      }
    }
  },

  methods: {
    formatDays(value) {
      return value != null ? new Intl.NumberFormat('th-TH', { maximumFractionDigits: 1 }).format(value) : '—'
    },

    chipVariant(data) {
      return resolveStandardChipVariant(data.overStandardPercent)
    },

    chipColor(data) {
      return resolveStandardChipColorToken(this.chipVariant(data))
    },

    chipText(data) {
      const variant = this.chipVariant(data)
      if (variant === 'pass') return this.$t('view.productionInsight.wip.leadTimeChipPass')
      return this.$t('view.productionInsight.wip.leadTimeChipOver', { percent: Math.round(data.overStandardPercent || 0) })
    },

    shareOf(data) {
      return calcWaitWorkShare(data.median?.wait, data.median?.work)
    },

    shareTitle(data) {
      const share = this.shareOf(data)
      return `${this.$t('view.productionInsight.wip.leadTimeColWait')} ${share.waitPercent}% / ${this.$t('view.productionInsight.wip.leadTimeColWork')} ${share.workPercent}%`
    },

    isSmallSample(count) {
      return isSmallSplitSample(count)
    },

    isDraftChanged(data) {
      return shouldShowDraftChip(data.key, data.standardDays, data.standardSource, this.savedStandards)
    },

    sparklineSeriesOf(data) {
      return [{ data: mapSeriesField(data.series, 'medianTotal') }]
    },

    rowClass(data) {
      return { 'wip-lead-time-table__row--selected': data.key === this.selectedKey }
    },

    onRowClick(event) {
      if (event?.data?.key) this.$emit('select-dept', event.data.key)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/web';

.wip-lead-time-table__col-header {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-xs);
}

.wip-lead-time-table__standard {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-xs);
}

.wip-lead-time-table__no-data {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-xs);
  color: var(--base-sub-color);
}

.wip-lead-time-table__sample-hint {
  color: var(--base-sub-color);
  font-size: var(--fs-sm);
}

.wip-lead-time-table__draft-chip {
  display: inline-flex;
  align-items: center;
  padding: 1px var(--sp-xs);
  border-radius: var(--radius-sm);
  background: var(--base-warning);
  color: var(--base-font-color);
  font-size: 10px;
  font-weight: 700;
}

.wip-lead-time-table__share-bar {
  display: flex;
  width: 100%;
  height: 6px;
  border-radius: var(--radius-sm);
  overflow: hidden;
  background: var(--color-border);
}

.wip-lead-time-table__share-wait {
  background: var(--base-sub-color);
}

.wip-lead-time-table__share-work {
  background: var(--base-green);
}

.wip-lead-time-table__chip {
  display: inline-flex;
  align-items: center;
  padding: var(--sp-xs) var(--sp-sm);
  border: 1px solid;
  border-radius: var(--radius-lg);
  font-size: var(--fs-sm);
  font-weight: 700;
}

:deep(.wip-lead-time-table__row--selected) {
  background-color: var(--color-highlight-bg) !important;
}

:deep(.p-datatable-tbody > tr) {
  cursor: pointer;
}
</style>
