<template>
  <SectionCardGeneric :title="$t('view.executive.goldLoss.title')" icon="bi-exclamation-triangle" accent="warning" headerStyle="legend" class="section-card-block">
    <BaseDataTable :items="tableRows" :totalRecords="tableRows.length" :columns="columns" :paginator="false" dataKey="month">
      <template #issuedGramTemplate="{ data }">
        <div class="text-right">{{ formatGram(data.issuedGram) }}</div>
      </template>
      <template #rawLossGramTemplate="{ data }">
        <div class="text-right">{{ formatGram(data.rawLossGram) }}</div>
      </template>
      <template #overAllowedGramTemplate="{ data }">
        <div class="text-right">{{ formatGram(data.overAllowedGram) }}</div>
      </template>
      <template #overAllowedPercentTemplate="{ data }">
        <div class="text-right" :class="{ 'is-over-allowed': data.isOverAllowed }">
          {{ formatGram(data.overAllowedPercent) }}%
          <span v-if="data.isOverAllowed" class="over-allowed-badge">{{ $t('view.executive.goldLoss.overAllowedBadge') }}</span>
        </div>
      </template>
    </BaseDataTable>
  </SectionCardGeneric>
</template>

<script>
import { isGoldLossOverThreshold, formatMonthLabel } from '../executive-helpers.js'

import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'

export default {
  name: 'ExecutiveGoldLossView',

  components: {
    SectionCardGeneric,
    BaseDataTable
  },

  props: {
    rows: {
      type: Array,
      default: () => []
    }
  },

  computed: {
    tableRows() {
      return this.rows.map((row) => ({
        month: formatMonthLabel(row.month),
        slipCount: row.slipCount || 0,
        issuedGram: row.issuedGram || 0,
        rawLossGram: row.rawLossGram || 0,
        overAllowedGram: row.overAllowedGram || 0,
        overAllowedPercent: row.overAllowedPercent || 0,
        isOverAllowed: isGoldLossOverThreshold(row.overAllowedPercent)
      }))
    },

    columns() {
      return [
        { field: 'month', header: this.$t('view.executive.goldLoss.colMonth'), sortable: false, minWidth: '100px' },
        { field: 'slipCount', header: this.$t('view.executive.goldLoss.colSlipCount'), sortable: false, minWidth: '90px', align: 'right' },
        { field: 'issuedGram', header: this.$t('view.executive.goldLoss.colIssuedGram'), sortable: false, minWidth: '110px', align: 'right' },
        { field: 'rawLossGram', header: this.$t('view.executive.goldLoss.colRawLossGram'), sortable: false, minWidth: '100px', align: 'right' },
        { field: 'overAllowedGram', header: this.$t('view.executive.goldLoss.colOverAllowedGram'), sortable: false, minWidth: '110px', align: 'right' },
        { field: 'overAllowedPercent', header: this.$t('view.executive.goldLoss.colOverAllowedPercent'), sortable: false, minWidth: '140px', align: 'right' }
      ]
    }
  },

  methods: {
    formatGram(value) {
      return new Intl.NumberFormat('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value || 0)
    }
  }
}
</script>

<style lang="scss" scoped>
.section-card-block {
  height: 100%;
}

.is-over-allowed {
  color: var(--base-warning);
  font-weight: 700;
}

.over-allowed-badge {
  display: inline-block;
  margin-left: var(--sp-xs);
  padding: var(--sp-xs);
  border-radius: var(--radius-sm);
  background: var(--base-warning);
  color: var(--base-font-color);
  font-size: var(--fs-sm);
  font-weight: 700;
}
</style>
