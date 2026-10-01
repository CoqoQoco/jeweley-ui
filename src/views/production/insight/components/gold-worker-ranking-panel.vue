<!--
  gold-worker-ranking-panel — ตาราง "อันดับช่าง" (reportRef: goldWorkers) ของหมวด "ทองและ Loss" — มาจาก
  Gold.workers โดยตรง (ไม่มี endpoint แยก ไม่ paginate — backend เรียงมาให้แล้ว)

  Props:
    rows    — Array (required) จาก Gold.workers
    metal   — String ('GOLD') — 'GOLD'|'SILVER' — ใช้แทนชื่อโลหะใน titleTip (goldMoneySemantics มี {metal} param)
    loading — Boolean (false)
-->
<template>
  <div id="insight-report-goldWorkers" class="gold-worker-ranking-panel">
    <SectionCardGeneric
      :title="$t('view.productionInsight.gold.workersTitle')"
      :titleTip="$t('view.productionInsight.help.goldMoneySemantics', { metal: metalLabel })"
      icon="bi-people"
      accent="main"
      headerStyle="legend"
    >
      <div v-if="!rows.length" class="gold-worker-ranking-panel__empty">
        {{ $t('view.productionInsight.gold.workersEmpty') }}
      </div>
      <div v-else class="responsive-table-wrapper">
        <BaseDataTable :items="tableRows" :columns="columns" :paginator="false" dataKey="rowKey" :loading="loading">
          <template #header-overRatio>
            <span class="gold-worker-ranking-panel__col-header">
              {{ $t('view.productionInsight.gold.workersColOverRatio') }}
              <InfoTipGeneric :text="$t('view.productionInsight.help.workersColOverRatio')" position="bottom" tone="inverse" />
            </span>
          </template>

          <template #slipCountTemplate="{ data }">
            <div class="text-right">{{ formatCount(data.slipCount) }}</div>
          </template>
          <template #receivedGramTemplate="{ data }">
            <div class="text-right">{{ formatGram(data.receivedGram) }}</div>
          </template>
          <template #lossPercentTemplate="{ data }">
            <div class="text-right">{{ formatPercent(data.lossPercent) }}</div>
          </template>
          <template #allowedPercentTemplate="{ data }">
            <div class="text-right">{{ formatPercent(data.allowedPercent) }}</div>
          </template>
          <template #targetPercentTemplate="{ data }">
            <div class="text-right">{{ formatPercent(data.targetPercent) }}</div>
          </template>
          <template #excessGramTemplate="{ data }">
            <div class="text-right">{{ formatGram(data.excessGram) }}</div>
          </template>
          <template #excessMoneyTemplate="{ data }">
            <div class="text-right">{{ formatCount(data.excessMoney) }}</div>
          </template>
          <template #netMoneyTemplate="{ data }">
            <div class="text-right" :class="`gold-worker-ranking-panel__net--${netVariant(data.netMoney)}`">{{ netMoneyLabel(data.netMoney) }}</div>
          </template>
          <template #overRatioTemplate="{ data }">
            <div class="text-right">{{ formatOverRatio(data) }}</div>
          </template>
        </BaseDataTable>
      </div>
    </SectionCardGeneric>
  </div>
</template>

<script>
import { resolveNetMoneyVariant, formatOverBucketsRatio } from './gold-helpers.js'

import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import InfoTipGeneric from '@/components/generic/InfoTipGeneric.vue'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'

export default {
  name: 'GoldWorkerRankingPanel',

  components: {
    SectionCardGeneric,
    InfoTipGeneric,
    BaseDataTable
  },

  props: {
    rows: {
      type: Array,
      required: true
    },
    metal: {
      type: String,
      default: 'GOLD'
    },
    loading: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    metalLabel() {
      return this.$t(`view.productionInsight.gold.metalLabel.${this.metal}`)
    },

    tableRows() {
      return this.rows.map((row) => ({
        ...row,
        rowKey: `${row.workerType}-${row.workerCode}`,
        workerTypeLabel: this.$t(`view.productionInsight.gold.workerType.${row.workerType}`)
      }))
    },

    // BaseDataTable/PrimeVue เรนเดอร์ทั้ง `header` prop และ `#header-<field>` slot คู่กันเสมอ (ไม่ทับกัน — ดู
    // node_modules/primevue/datatable/HeaderCell.vue) คอลัมน์ไหนมี custom header slot (label+ⓘ) ต้องเคลียร์
    // `header` prop ทิ้งเป็น '' ไม่งั้นหัวขึ้นซ้ำ 2 จุด (เหมือน gold-loss-dashboard reconcile-tab)
    columns() {
      const fieldsWithCustomHeaderSlot = ['overRatio']
      const cols = [
        { field: 'workerTypeLabel', header: this.$t('view.productionInsight.gold.workersColWorkerType'), sortable: false, minWidth: '100px' },
        { field: 'workerCode', header: this.$t('view.productionInsight.gold.workersColWorkerCode'), sortable: false, minWidth: '90px' },
        { field: 'workerName', header: this.$t('view.productionInsight.gold.workersColWorkerName'), sortable: false, minWidth: '140px' },
        { field: 'slipCount', header: this.$t('view.productionInsight.gold.workersColSlipCount'), sortable: false, minWidth: '80px', align: 'right' },
        { field: 'receivedGram', header: this.$t('view.productionInsight.gold.workersColReceivedGram'), sortable: false, minWidth: '100px', align: 'right' },
        { field: 'lossPercent', header: this.$t('view.productionInsight.gold.workersColLossPercent'), sortable: false, minWidth: '90px', align: 'right' },
        { field: 'allowedPercent', header: this.$t('view.productionInsight.gold.workersColAllowedPercent'), sortable: false, minWidth: '90px', align: 'right' },
        { field: 'targetPercent', header: this.$t('view.productionInsight.gold.workersColTargetPercent'), sortable: false, minWidth: '80px', align: 'right' },
        { field: 'excessGram', header: this.$t('view.productionInsight.gold.workersColExcessGram'), sortable: false, minWidth: '90px', align: 'right' },
        { field: 'excessMoney', header: this.$t('view.productionInsight.gold.workersColExcessMoney'), sortable: false, minWidth: '110px', align: 'right' },
        { field: 'netMoney', header: this.$t('view.productionInsight.gold.workersColNetMoney'), sortable: false, minWidth: '140px', align: 'right' },
        { field: 'overRatio', header: this.$t('view.productionInsight.gold.workersColOverRatio'), sortable: false, minWidth: '90px', align: 'right' }
      ]
      return cols.map((col) => (fieldsWithCustomHeaderSlot.includes(col.field) ? { ...col, header: '' } : col))
    }
  },

  methods: {
    formatCount(value) {
      return value != null ? new Intl.NumberFormat('th-TH').format(value) : '—'
    },

    formatPercent(value) {
      return value != null ? `${new Intl.NumberFormat('th-TH', { maximumFractionDigits: 2 }).format(value)}%` : '—'
    },

    formatGram(value) {
      return value != null ? new Intl.NumberFormat('th-TH', { maximumFractionDigits: 2 }).format(value) : '—'
    },

    formatOverRatio(data) {
      return formatOverBucketsRatio(data.overBuckets, data.qualifyingBuckets)
    },

    netVariant(netMoney) {
      return resolveNetMoneyVariant(netMoney)
    },

    netMoneyLabel(netMoney) {
      if (netMoney == null || netMoney === 0) return '—'
      const amount = this.formatCount(Math.abs(netMoney))
      return netMoney > 0
        ? this.$t('view.productionInsight.gold.netMoneyPositive', { amount })
        : this.$t('view.productionInsight.gold.netMoneyNegative', { amount })
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/web';

.gold-worker-ranking-panel {
  scroll-margin-top: calc(var(--mainbar-height) + 64px);
  min-width: 0;
}

.gold-worker-ranking-panel__empty {
  padding: var(--sp-xl) 0;
  text-align: center;
  color: var(--base-sub-color);
}

.gold-worker-ranking-panel__col-header {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-xs);
}

.gold-worker-ranking-panel__net--green {
  color: var(--base-green);
  font-weight: 700;
}

.gold-worker-ranking-panel__net--warning {
  color: var(--base-warning);
  font-weight: 700;
}
</style>
