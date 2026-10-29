<template>
  <SectionCardGeneric
    :title="$t('view.stock.stockRfidTracking.tableTitle', { receipt: receiptNumber })"
    icon="bi-table"
    accent="main"
    headerStyle="legend"
  >
    <div class="piece-filter">
      <ToggleGroupGeneric
        :modelValue="filter"
        :options="filterOptions"
        @update:modelValue="$emit('update:filter', $event)"
      />
    </div>

    <BaseDataTable
      :items="pagedItems"
      :totalRecords="items.length"
      :columns="columns"
      :perPage="take"
      :rowClass="rowClass"
      scrollHeight="calc(100vh - 520px)"
      dataKey="rowKey"
      @page="handlePageChange"
    >
      <template #unitStatusTemplate="{ data }">
        <span>{{ unitStatusText(data.unitStatus) }}</span>
      </template>
      <template #bindStateTemplate="{ data }">
        <span :class="['bind-tag', data.isBound ? 'bind-tag--bound' : 'bind-tag--unbound']">
          {{
            data.isBound
              ? $t('view.stock.stockRfidTracking.tagBound')
              : $t('view.stock.stockRfidTracking.tagUnbound')
          }}
        </span>
      </template>
    </BaseDataTable>
  </SectionCardGeneric>
</template>

<script>
import dataTablePaging from '@/composables/useDataTablePaging.js'

import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import ToggleGroupGeneric from '@/components/generic/ToggleGroupGeneric.vue'

export default {
  name: 'RfidPieceTable',

  components: {
    BaseDataTable,
    SectionCardGeneric,
    ToggleGroupGeneric
  },

  mixins: [dataTablePaging],

  props: {
    receiptNumber: { type: String, default: '' },
    items: { type: Array, default: () => [] },
    filter: { type: String, default: 'all' },
    changedKeys: { type: Object, default: () => ({}) }
  },

  emits: ['update:filter'],

  computed: {
    pagedItems() {
      return this.items.slice(this.skip, this.skip + this.take)
    },

    filterOptions() {
      return [
        { value: 'all', label: this.$t('view.stock.stockRfidTracking.filterAll') },
        { value: 'unbound', label: this.$t('view.stock.stockRfidTracking.filterUnbound') },
        { value: 'bound', label: this.$t('view.stock.stockRfidTracking.filterBound') }
      ]
    },

    columns() {
      const t = (key) => this.$t(`view.stock.stockRfidTracking.${key}`)
      return [
        { field: 'stockNumber', header: t('colStockNumber'), sortable: false, minWidth: '140px' },
        { field: 'unitLabel', header: t('colUnit'), sortable: false, minWidth: '90px' },
        { field: 'productName', header: t('colProductName'), sortable: false, minWidth: '200px' },
        { field: 'unitStatus', header: t('colUnitStatus'), sortable: false, minWidth: '100px' },
        { field: 'locationCode', header: t('colLocation'), sortable: false, minWidth: '110px' },
        { field: 'bindState', header: t('colBindState'), sortable: false, minWidth: '110px' },
        { field: 'epc', header: t('colEpc'), sortable: false, minWidth: '220px' },
        { field: 'boundBy', header: t('colBoundBy'), sortable: false, minWidth: '120px' },
        { field: 'boundDate', header: t('colBoundDate'), sortable: false, minWidth: '150px', format: 'datetime' }
      ]
    }
  },

  watch: {
    filter() {
      this.resetPaging()
    },

    receiptNumber() {
      this.resetPaging()
    }
  },

  methods: {
    // paging ทำฝั่ง client (ListByReceipt ส่งครบทั้งใบ) — mixin เรียก fetchData หลังเปลี่ยนหน้า จึงไม่ต้องทำอะไร
    fetchData() {},

    unitStatusText(status) {
      const key = { IN_STOCK: 'unitInStock', RESERVED: 'unitReserved', SOLD: 'unitSold' }[status]
      return key ? this.$t(`view.stock.stockRfidTracking.${key}`) : status || '-'
    },

    rowClass(data) {
      return this.changedKeys[data.rowKey] ? 'rfid-row-changed' : ''
    }
  }
}
</script>

<style lang="scss" scoped>
.piece-filter {
  margin-bottom: var(--sp-md);
}

.bind-tag {
  display: inline-block;
  padding: var(--sp-xs) var(--sp-sm);
  border-radius: var(--radius-sm);
  font-size: var(--fs-sm);
  font-weight: 600;

  &--bound {
    background: var(--status-resolved-bg);
    color: var(--status-resolved);
  }

  &--unbound {
    background: var(--status-open-bg);
    color: var(--status-open);
  }
}

:deep(tr.rfid-row-changed > td) {
  animation: rfid-row-flash 2.5s ease-out;
}

@keyframes rfid-row-flash {
  from {
    background: var(--row-active-bg);
  }

  to {
    background: transparent;
  }
}

@media (prefers-reduced-motion: reduce) {
  :deep(tr.rfid-row-changed > td) {
    animation: none;
    background: var(--row-active-bg);
  }
}
</style>
