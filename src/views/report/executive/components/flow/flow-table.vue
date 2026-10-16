<!--
  FlowTable — ตารางตัวเลขของแผงรายละเอียด Flow (ห่อ DataTableWithPaging แบบไม่แบ่งหน้า)
  columns: [{ field, header, align?, className?, minWidth?, bar? }]  rows: [{ key, <field>: string, _cls?, go? }]
  _cls: 'total' | 'hl' | 'warn' | 'clk' (เว้นวรรคได้หลายค่า)   bar: คอลัมน์แท่งอายุ — ค่า row[field] = { pct, tone } | { stack: [4] }
  Emits: go (id สถานีเมื่อแถวมี go และ clickable)
-->
<template>
  <BaseDataTable
    class="flow-table"
    :items="rows"
    :totalRecords="rows.length"
    :columns="tableColumns"
    :paginator="false"
    :showColumnSettings="false"
    :emptyMessage="emptyText"
    scrollHeight="none"
    dataKey="key"
    :rowClass="rowClass"
    @row-click="onRowClick"
  >
    <template v-for="c in barColumns" :key="c.field" #[`${c.field}Template`]="{ data }">
      <div v-if="data[c.field]" class="flow-bar" role="img" :aria-label="barLabel(data[c.field])">
        <template v-if="data[c.field].stack">
          <i v-for="(v, i) in data[c.field].stack" :key="i" :class="`flow-bar__seg flow-bar__seg--${i + 1}`" :style="{ width: stackWidth(data[c.field].stack, v) }"></i>
        </template>
        <i v-else :class="`flow-bar__seg flow-bar__seg--${data[c.field].tone}`" :style="{ width: `${data[c.field].pct}%` }"></i>
      </div>
    </template>
  </BaseDataTable>
</template>

<script>
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'

export default {
  name: 'FlowTable',

  components: { BaseDataTable },

  props: {
    columns: { type: Array, required: true },
    rows: { type: Array, default: () => [] },
    clickable: { type: Boolean, default: false }
  },

  emits: ['go'],

  computed: {
    tableColumns() {
      return this.columns.map(({ field, header, align, className, minWidth }) => ({ field, header, align, className, minWidth, sortable: false }))
    },

    barColumns() {
      return this.columns.filter((c) => c.bar)
    },

    emptyText() {
      return this.$t('common.label.noData')
    }
  },

  methods: {
    rowClass(row) {
      return (row._cls || '')
        .split(' ')
        .filter(Boolean)
        .map((c) => `flow-row--${c}`)
        .join(' ')
    },

    onRowClick(event) {
      const go = event?.data?.go
      if (this.clickable && go) this.$emit('go', go)
    },

    stackWidth(stack, value) {
      const total = stack.reduce((s, v) => s + v, 0)
      return total ? `${(value / total) * 100}%` : '0%'
    },

    barLabel(bar) {
      return bar.stack ? bar.stack.join(' / ') : `${Math.round(bar.pct)}%`
    }
  }
}
</script>

<style lang="scss" scoped>
.flow-table {
  :deep(.p-datatable-wrapper) {
    max-height: none;
  }

  :deep(.p-datatable .p-datatable-tbody > tr.flow-row--total > td) {
    font-weight: 700;
    border-top: 1px solid var(--base-sub-color);
  }

  :deep(.p-datatable .p-datatable-tbody > tr.flow-row--hl > td) {
    background: var(--color-highlight-bg);
  }

  :deep(.p-datatable .p-datatable-tbody > tr.flow-row--warn > td:first-child),
  :deep(.p-datatable .p-datatable-tbody > tr > td.flow-cell-warn) {
    color: var(--base-font-color);
    font-weight: 600;
  }

  :deep(.p-datatable .p-datatable-tbody > tr.flow-row--clk) {
    cursor: pointer;
  }
}

.flow-bar {
  display: flex;
  height: var(--sp-sm);
  width: 100%;
  min-width: calc(var(--sp-2xl) * 4);
  background: var(--color-border);
  border-radius: var(--radius-sm);
  overflow: hidden;

  &__seg {
    display: block;
    height: 100%;

    &--1 {
      background: var(--base-green);
    }

    &--2 {
      background: var(--base-sub-color);
    }

    &--3 {
      background: var(--status-closed-bg);
    }

    &--4 {
      background: var(--base-warning);
    }
  }
}
</style>
