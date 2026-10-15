<!--
  TableBlock — ตารางข้อมูลคงที่ (ไม่ paged) ใน BlockFrame ตาม config:
    rows(ctx)         → แถว · columns[] จาก column library (columns.js) · dataKey (default 'key')
    selectable{stateKey} → คลิกแถว = ctx.setState(stateKey, row[dataKey]) (แถวที่เลือกมีพื้นหลัง highlight)
    highlight(row,col,ctx) → เน้นเซลล์ · rowClass(row,ctx) · source → ชื่อ source ที่ใช้โชว์ loading
    toolbar{ hint, chip, actions:[{ type:'targetDrawer', preset }], multiselect{ stateKey, options(ctx,t), filter(rows,value), placeholder }, toggle{ stateKey, options[{value,label}], filter(rows,value), aria } } (ตัวกรอง client-side ไม่ยิง request) → บรรทัดแนะนำ + ปุ่มเปิด drawer ตั้งค่าเป้า/มาตรฐาน
    node.detail (กล่องรายละเอียดของแถวที่เลือก) ถูกเรนเดอร์โดย InsightBlockNode ต่อท้าย block นี้เป็น DetailBlock
-->
<template>
  <BlockFrame v-bind="frame">
    <BlockToolbar v-if="node.toolbar" :toolbar="node.toolbar" :ctx="ctx" />

    <div v-if="isEmpty" class="table-block__empty">{{ $t(node.emptyText) }}</div>

    <template v-for="(section, sIndex) in sections" :key="sIndex">
      <p v-if="section.kind === 'text'" :class="['table-block__text', `table-block__text--${section.tone || 'plain'}`]">
        <i v-if="section.icon" :class="['bi', section.icon]"></i>
        {{ sectionText(section) }}
      </p>

      <div v-else-if="!isEmpty" class="responsive-table-wrapper">
        <BaseDataTable
          :items="sectionRows(section)"
          :columns="sectionColumns(section)"
          :paginator="false"
          :dataKey="section.dataKey || 'key'"
          :rowClass="rowClass"
          :loading="loading"
          @row-click="onRowClick"
        >
          <template v-for="col in headerColsOf(section)" :key="`h-${col.field}`" #[headerSlot(col)]>
            <span class="table-block__col-header">
              {{ headerText(col) }}
              <InfoTipGeneric :text="tipText(col)" position="bottom" tone="inverse" />
            </span>
          </template>

          <template v-for="col in section.columns" :key="`c-${col.field}`" #[cellSlot(col)]="{ data }">
            <div :class="highlightClass(data, col)">
              <ColumnCell :col="col" :data="data" :ctx="ctx" />
            </div>
          </template>
        </BaseDataTable>
      </div>
    </template>
  </BlockFrame>
</template>

<script>
import { buildBlockColumns, buildHeaderSlotColumns, isRowSelected, resolveCellHighlight, resolveRowSelection, resolveTableSections, applyToolbarFilters, runRowClickAction, cellSlotName, headerSlotName } from './table-block-helpers.js'
import { resolveHeader, resolveTipText } from '../columns.js'
import blockMixin from './block-mixin.js'

import BlockFrame from './BlockFrame.vue'
import BlockToolbar from './BlockToolbar.vue'
import ColumnCell from '../ColumnCell.vue'
import InfoTipGeneric from '@/components/generic/InfoTipGeneric.vue'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'

export default {
  name: 'TableBlock',

  mixins: [blockMixin],

  components: { BlockFrame, BlockToolbar, ColumnCell, InfoTipGeneric, BaseDataTable },

  computed: {
    sections() {
      return resolveTableSections(this.node)
    },

    loading() {
      return !!this.ctx.loading?.[this.node.source]
    },

    // emptyText (i18n key) แทนที่ตารางทั้งหมดด้วยข้อความกลางๆ เมื่อไม่มีแถวเลย (ตารางเดียว)
    isEmpty() {
      return !!this.node.emptyText && !this.sections.some((section) => section.kind === 'table' && this.sectionRows(section).length)
    }
  },

  methods: {
    cellSlot: cellSlotName,
    headerSlot: headerSlotName,

    // แถวของตารางหลังผ่านตัวกรอง client-side ของ toolbar (multiselect/toggle)
    sectionRows(section) {
      return applyToolbarFilters(this.node.toolbar, section.rows(this.ctx) || [], this.ctx)
    },

    sectionColumns(section) {
      return buildBlockColumns(section.columns, (key) => this.$t(key), this.ctx)
    },

    headerColsOf(section) {
      return buildHeaderSlotColumns(section.columns)
    },

    headerText(col) {
      return resolveHeader(col, (key) => this.$t(key), this.ctx)
    },

    tipText(col) {
      return resolveTipText(col, this.ctx, (key, params) => this.$t(key, params))
    },

    sectionText(section) {
      return section.text(this.ctx, (key, params) => this.$t(key, params))
    },

    rowClass(row) {
      const extra = this.node.rowClass ? this.node.rowClass(row, this.ctx) : {}
      return { ...extra, 'insight-table__row--selected': isRowSelected(this.node, this.ctx, row) }
    },

    highlightClass(row, col) {
      return resolveCellHighlight(this.node, row, col, this.ctx)
    },

    onRowClick(event) {
      if (runRowClickAction(this.node, event, this.ctx)) return
      const selection = resolveRowSelection(this.node, event)
      if (selection) this.ctx.setState(selection.stateKey, selection.value)
    }
  }
}
</script>

<style lang="scss" scoped>
.table-block__empty {
  padding: var(--sp-xl) 0;
  text-align: center;
  color: var(--base-sub-color);
}

.table-block__text {
  margin: var(--sp-sm) 0;
  font-size: var(--fs-sm);
  color: var(--base-sub-color);

  &--note {
    display: flex;
    align-items: center;
    gap: var(--sp-xs);
  }

  &--foot {
    margin: var(--sp-sm) 0 0;
    font-style: italic;
  }

  &--hint {
    margin: 0 0 var(--sp-sm);
    font-style: italic;
  }

  &--subtitle {
    margin-top: var(--sp-md);
    font-size: var(--fs-base);
    font-weight: 700;
    color: var(--base-font-color);
  }
}

.table-block__col-header {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-xs);
}

:deep(.insight-table__row--selected) {
  background-color: var(--color-highlight-bg) !important;
}

:deep(.insight-table__cell--emphasis) {
  color: var(--base-red);
  font-weight: 700;
}
</style>
