<!--
  PlanTableBlock — ตารางใบงานแบบ paged (useDataTablePaging) ใน BlockFrame ตาม config:
    endpoint ('ProductionInsight/StalePlans' ฯลฯ) · params(filter,state) → body ไม่รวม take/skip/sort · columns[] จาก column library
    dataKey (default 'planId') · toolbar{ toggle{ stateKey, options[{value,label}], aria } } · focus{ stateKey, chipText, clearTip }
  resetPagingKey = JSON ของ params ทั้งหมด (watch ตัวเดียว) → เปลี่ยนหลาย field พร้อมกันยิงรอบเดียว · ถ้าแท็บไม่ active
  จะติดธง needsRefetch แล้วยิงตอนกลับมา active (stale-refetch เดียวกับ InsightPage)
  metal ถูกเติมโดย store (metal-scope) อยู่แล้ว ไม่เติมซ้ำที่นี่
-->
<template>
  <BlockFrame v-bind="frame">
    <div v-if="node.toolbar && node.toolbar.toggle" class="plan-table-block__toolbar">
      <ToggleGroupGeneric
        :modelValue="ctx.state[node.toolbar.toggle.stateKey]"
        :options="toggleOptions"
        :ariaLabel="$t(node.toolbar.toggle.aria)"
        @update:modelValue="ctx.setState(node.toolbar.toggle.stateKey, $event)"
      />
    </div>

    <div v-if="focusChip" class="plan-table-block__focus-chip">
      <span>{{ focusChip.text }}</span>
      <ButtonGeneric variant="plain" icon="bi-x-lg" :title="$t(focusChip.clearTip)" @click="ctx.setState(node.focus.stateKey, '')" />
    </div>

    <div class="responsive-table-wrapper">
      <BaseDataTable
        :items="items"
        :totalRecords="total"
        :columns="tableColumns"
        :perPage="take"
        :dataKey="node.dataKey || 'planId'"
        @page="handlePageChange"
        @sort="handleSortChange"
      >
        <template v-for="col in headerCols" :key="`h-${col.field}`" #[headerSlot(col)]>
          <span class="plan-table-block__col-header">
            {{ $t(col.header) }}
            <InfoTipGeneric :text="$t(col.tip)" position="bottom" tone="inverse" />
          </span>
        </template>

        <template v-for="col in node.columns" :key="`c-${col.field}`" #[cellSlot(col)]="{ data }">
          <ColumnCell :col="col" :data="data" :ctx="ctx" />
        </template>
      </BaseDataTable>
    </div>
  </BlockFrame>
</template>

<script>
import { useProductionInsightApiStore } from '@/stores/modules/api/production/production-insight-api.js'
import dataTablePaging from '@/composables/useDataTablePaging.js'
import { buildResetPagingKey, buildPlanTableRequest, buildToggleOptions, resolveFocusChip } from './plan-table-block-helpers.js'
import { buildBlockColumns, buildHeaderSlotColumns, cellSlotName, headerSlotName } from './table-block-helpers.js'
import blockMixin from './block-mixin.js'

import BlockFrame from './BlockFrame.vue'
import ColumnCell from '../ColumnCell.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import InfoTipGeneric from '@/components/generic/InfoTipGeneric.vue'
import ToggleGroupGeneric from '@/components/generic/ToggleGroupGeneric.vue'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'

export default {
  name: 'PlanTableBlock',

  mixins: [dataTablePaging, blockMixin],

  components: { BlockFrame, ColumnCell, ButtonGeneric, InfoTipGeneric, ToggleGroupGeneric, BaseDataTable },

  setup() {
    const productionInsightStore = useProductionInsightApiStore()
    return { productionInsightStore }
  },

  data() {
    return {
      items: [],
      total: 0,
      needsRefetch: false
    }
  },

  computed: {
    tableColumns() {
      return buildBlockColumns(this.node.columns, (key) => this.$t(key))
    },

    headerCols() {
      return buildHeaderSlotColumns(this.node.columns)
    },

    toggleOptions() {
      return buildToggleOptions(this.node.toolbar?.toggle, (key, params) => this.$t(key, params), this.ctx)
    },

    focusChip() {
      return resolveFocusChip(this.node, this.ctx, (key, params) => this.$t(key, params))
    },

    focusValue() {
      return this.node.focus ? this.ctx.state?.[this.node.focus.stateKey] : null
    },

    resetPagingKey() {
      return buildResetPagingKey(this.node, this.ctx)
    }
  },

  watch: {
    resetPagingKey() {
      if (this.ctx.active) this.resetPaging()
      else this.needsRefetch = true
    },

    // เปลี่ยน/ล้างโฟกัส (เช่น คลิกเลข "ค้างนานผิดปกติ") → เลื่อนมาที่ตารางนี้
    focusValue() {
      if (this.node.focus) this.$nextTick(() => this.$el.scrollIntoView({ behavior: 'smooth', block: 'start' }))
    },

    'ctx.active'(value) {
      if (value && this.needsRefetch) {
        this.needsRefetch = false
        this.resetPaging()
      }
    }
  },

  methods: {
    cellSlot: cellSlotName,
    headerSlot: headerSlotName,

    async fetchData() {
      const res = await this.productionInsightStore.post(this.node.endpoint, buildPlanTableRequest(this.node, this.ctx, { take: this.take, skip: this.skip, sort: this.sort }))
      this.items = res?.data || []
      this.total = res?.total || 0
    }
  },

  mounted() {
    this.fetchData()
  }
}
</script>

<style lang="scss" scoped>
.plan-table-block__toolbar {
  margin-bottom: var(--sp-md);
}

.plan-table-block__focus-chip {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-xs);
  margin-bottom: var(--sp-sm);
  padding: 0 var(--sp-sm) 0 var(--sp-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-highlight-bg);
  font-size: var(--fs-sm);
}

.plan-table-block__col-header {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-xs);
}
</style>
