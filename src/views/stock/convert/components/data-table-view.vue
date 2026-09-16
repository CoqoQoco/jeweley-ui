<template>
  <div class="mt-2">
    <BaseDataTable
      :items="items"
      :totalRecords="total"
      dataKey="running"
      :columns="columns"
      :perPage="take"
      :rowClass="getRowClass"
      :emptyMessage="$t('view.stock.convert.noData')"
      @page="$emit('page', $event)"
      @sort="$emit('sort', $event)"
      @row-click="onRowClick"
    >
      <template #createDateTemplate="{ data }">
        <div>{{ formatDate(data.createDate) }}</div>
      </template>

      <template #statusTemplate="{ data }">
        <div class="status-container">
          <span :class="getStatusBadgeClass(data.status)">{{ data.statusName }}</span>
        </div>
      </template>

      <template #sourceStockNumbersTemplate="{ data }">
        <div>{{ sourceText(data) }}</div>
      </template>

      <template #resultStockNumberTemplate="{ data }">
        <div>{{ data.resultStockNumber || '-' }}</div>
      </template>

      <template #convertCostTemplate="{ data }">
        <div class="text-right">{{ formatDecimal(data.convertCost, 2) }}</div>
      </template>

      <template #soNumberTemplate="{ data }">
        <div>{{ data.soNumber || '-' }}</div>
      </template>
    </BaseDataTable>
  </div>
</template>

<script>
import { formatDate } from '@/services/utils/dayjs.js'
import { formatDecimal } from '@/services/utils/decimal.js'
import activeRowHighlight from '@/composables/useActiveRowHighlight.js'

import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'

export default {
  name: 'StockConvertDataTableView',

  components: {
    BaseDataTable
  },

  mixins: [activeRowHighlight],

  props: {
    items: {
      type: Array,
      default: () => []
    },
    total: {
      type: Number,
      default: 0
    },
    take: {
      type: Number,
      default: 10
    }
  },

  emits: ['page', 'sort', 'view'],

  data() {
    return {
      activeRowIdField: 'running',
      activeRowStorage: 'active-row-stock-convert-dk'
    }
  },

  computed: {
    columns() {
      return [
        { field: 'running', header: this.$t('view.stock.convert.colDocumentNumber'), minWidth: '140px', sortable: true },
        { field: 'createDate', header: this.$t('view.stock.convert.colDate'), minWidth: '110px', sortable: true },
        { field: 'status', header: this.$t('view.stock.convert.colStatus'), minWidth: '110px', sortable: true },
        { field: 'sourceStockNumbers', header: this.$t('view.stock.convert.colSource'), minWidth: '220px', sortable: false },
        { field: 'resultStockNumber', header: this.$t('view.stock.convert.colResult'), minWidth: '130px', sortable: true },
        { field: 'convertCost', header: this.$t('view.stock.convert.colConvertCost'), minWidth: '110px', sortable: true },
        { field: 'soNumber', header: this.$t('view.stock.convert.colSoNumber'), minWidth: '140px', sortable: true },
        { field: 'createBy', header: this.$t('view.stock.convert.colCreateBy'), minWidth: '120px', sortable: true }
      ]
    }
  },

  methods: {
    formatDate(val) {
      return val ? formatDate(val) : ''
    },

    formatDecimal,

    // sourceStockNumbers เป็น string ที่ backend format มาให้แล้ว (List/Response.SourceStockNumbers) — ไม่ใช่ array
    sourceText(data) {
      if (!data.sourceStockNumbers) return '-'
      const prefix = data.sourceCount ? `(${data.sourceCount}) ` : ''
      return `${prefix}${data.sourceStockNumbers}`
    },

    getStatusBadgeClass(status) {
      const statusClasses = {
        0: 'badge badge-warning',
        1: 'badge badge-success',
        9: 'badge badge-danger'
      }
      return statusClasses[status] || 'badge badge-secondary'
    },

    onRowClick(event) {
      this.setActiveRow(event.data, event.index)
      this.$emit('view', event.data)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-data-table';

.status-container {
  text-align: center;
}

.text-right {
  text-align: right;
}

.badge {
  padding: var(--sp-xs) var(--sp-sm);
  font-size: var(--fs-sm);
  border-radius: var(--radius-sm);
  color: white;
}

.badge-success {
  background-color: var(--base-green);
}

.badge-warning {
  background-color: var(--base-warning);
  color: #212529;
}

.badge-danger {
  background-color: var(--base-red);
}

.badge-secondary {
  background-color: #6c757d;
}
</style>
