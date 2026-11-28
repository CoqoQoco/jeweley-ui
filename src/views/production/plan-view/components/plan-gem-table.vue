<template>
  <div>
    <div v-if="returnedRows.length" class="gem-returned-toggle">
      <CheckboxGeneric v-model="showReturned" :label="$t('view.production.planView.gemTable.showReturned')" />
    </div>
    <BaseDataTable
      :items="displayRows"
      :columns="columns"
      dataKey="itemNo"
      :rowClass="rowClass"
      :paginator="false"
      scrollHeight="calc(100vh - 160px)"
    >
      <template #gemActionTemplate="{ data }">
        <span
          v-if="canReturn && data.outboundRunning && !data.isReturned"
          :title="returnDisabled ? $t('view.production.planView.gemTable.returnLockedTip') : ''"
        >
          <ButtonGeneric
            :variant="isDuplicateRow(data, duplicateCodes) ? 'main' : 'outline'"
            icon="bi-box-arrow-in-down"
            :label="$t('view.production.planView.gemTable.btnReturn')"
            :disabled="returnDisabled"
            @click="$emit('return-row', data)"
          />
        </span>
      </template>
      <template #nameTemplate="{ data }">
        <div class="gem-name-cell">
          <span>{{ data.name }}</span>
          <span v-if="data.isReturned" class="gem-chip gem-chip--returned" :title="data.returnedTip">
            {{ $t('view.production.planView.gemTable.chipReturned') }}
          </span>
          <span v-else-if="isDuplicateRow(data, duplicateCodes)" class="gem-chip gem-chip--warning">
            {{ $t('view.production.planView.gemTable.chipDuplicate') }}
          </span>
        </div>
      </template>
      <template #outboundDateTemplate="{ data }">
        <div class="text-left">{{ data.outboundDate ? formatDateTime(data.outboundDate) : '' }}</div>
      </template>
      <template #qtyTemplate="{ data }">
        <span :class="{ 'gem-struck': data.isReturned }">{{ fmt3(data.qty) }}</span>
      </template>
      <template #weightTemplate="{ data }">
        <span :class="{ 'gem-struck': data.isReturned }">{{ fmt3(data.weight) }}</span>
      </template>
      <template #priceTemplate="{ data }">{{ data.isReturned ? '' : fmt3(data.price) }}</template>
      <template #footer>
        <div class="title-text">
          <span>{{ $t('view.production.planView.gemTable.footerCount', { count: countRows(rows) }) }}</span>
          <span v-if="showReturned && returnedRows.length">
            · {{ $t('view.production.planView.gemTable.footerReturned', { count: returnedRows.length }) }}
          </span>
        </div>
      </template>
    </BaseDataTable>
  </div>
</template>

<script>
import { formatDateTime } from '@/services/utils/dayjs.js'

import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import CheckboxGeneric from '@/components/prime-vue/CheckboxGeneric.vue'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'

import { findDuplicateGemCodes, isDuplicateRow, countRows } from '../gem-return-helpers.js'

export default {
  name: 'PlanGemTable',

  components: { ButtonGeneric, CheckboxGeneric, BaseDataTable },

  props: {
    rows: {
      type: Array,
      default: () => []
    },
    returnedRows: {
      type: Array,
      default: () => []
    },
    canReturn: {
      type: Boolean,
      default: false
    },
    returnDisabled: {
      type: Boolean,
      default: false
    },
    showPrice: {
      type: Boolean,
      default: false
    }
  },

  emits: ['return-row'],

  data() {
    return { showReturned: false }
  },

  computed: {
    duplicateCodes() {
      return findDuplicateGemCodes(this.rows)
    },

    displayRows() {
      if (!this.showReturned) return this.rows
      const returned = this.returnedRows.map((r, i) => ({
        itemNo: `returned-${r.itemNo}-${r.createDate ?? i}`,
        isReturned: true,
        code: r.gemCode,
        name: r.gemName,
        outboundRunning: r.outboundRunning,
        qty: r.returnQty,
        weight: r.returnWeight,
        returnedTip: [r.inboundRunning, r.createBy].filter(Boolean).join(' · ')
      }))
      return [...this.rows, ...returned]
    },

    columns() {
      const t = (k) => this.$t(`view.production.planView.gemTable.${k}`)
      const base = [
        { field: 'name', header: t('colGem'), minWidth: '200px', sortable: false },
        { field: 'outboundRunning', header: t('colOutboundRunning'), minWidth: '200px', sortable: false },
        { field: 'outboundName', header: t('colOutboundBy'), minWidth: '200px', sortable: false },
        { field: 'outboundDate', header: t('colOutboundDate'), minWidth: '200px', sortable: false },
        { field: 'qty', header: t('colQty'), width: '100px', sortable: false },
        { field: 'weight', header: t('colWeight'), width: '100px', sortable: false },
        { field: 'unit', header: t('colUnit'), width: '100px', sortable: false },
        { field: 'length', header: t('colLength'), width: '100px', sortable: false },
        { field: 'lengthUnit', header: t('colLengthUnit'), width: '100px', sortable: false },
        ...(this.showPrice ? [{ field: 'price', header: t('colPrice'), width: '100px', sortable: false }] : [])
      ]
      if (!this.canReturn) return base
      return [{ field: 'gemAction', header: t('colAction'), width: '170px', sortable: false }, ...base]
    }
  },

  methods: {
    isDuplicateRow,
    countRows,
    formatDateTime,
    fmt3(val) {
      return val ? Number(val).toFixed(3) : '0.000'
    },
    rowClass(data) {
      return data.isReturned ? 'gem-row-returned' : ''
    }
  }
}
</script>

<style lang="scss" scoped>
.gem-returned-toggle {
  padding: var(--sp-sm) var(--sp-sm) 0;
}

.gem-name-cell {
  display: flex;
  align-items: center;
  gap: var(--sp-sm);
  flex-wrap: wrap;
}

.gem-chip {
  display: inline-block;
  padding: 0 var(--sp-sm);
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  font-size: var(--fs-sm);
  line-height: var(--lh-md);
  white-space: nowrap;

  &--warning {
    border-color: var(--base-warning);
    background: var(--status-open-bg);
    color: var(--base-sub-color);
  }

  &--returned {
    background: var(--status-closed-bg);
    color: var(--base-sub-color);
  }
}

:deep(tr.gem-row-returned > td) {
  background: var(--status-closed-bg);
}

.gem-struck {
  text-decoration: line-through;
}
</style>
