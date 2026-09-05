<template>
  <SectionCardGeneric :title="$t('view.receiptStock.gold.transaction.listTableTitle')" icon="bi-arrow-left-right" accent="main" headerStyle="legend">
    <BaseDataTable
      :items="items"
      :totalRecords="totalRecords"
      :columns="columns"
      :perPage="take"
      dataKey="running"
      :rowClass="getRowClass"
      @page="handlePageChange"
      @sort="handleSortChange"
    >
      <template #typeNameTemplate="{ data }">
        <span>
          <i class="mr-1" :class="getTypeIcon(data.type)"></i>
          {{ data.typeName }}
        </span>
      </template>

      <template #statusTemplate="{ data }">
        <span v-if="data.status === 'reversed'" class="badge-reversed">
          {{ $t('view.receiptStock.gold.transaction.statusReversed') }}
        </span>
      </template>
    </BaseDataTable>
  </SectionCardGeneric>
</template>

<script>
import { useStockGoldApiStore } from '@/stores/modules/api/stock/gold-store.js'
import dataTablePaging from '@/composables/useDataTablePaging.js'

import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'

const INBOUND_TYPES = [1, 2, 3, 5, 7]

export default {
  name: 'StockGoldTransectionDataTableView',

  components: {
    BaseDataTable,
    SectionCardGeneric
  },

  mixins: [dataTablePaging],

  props: {
    search: {
      type: Object,
      default: () => ({})
    }
  },

  watch: {
    search: {
      handler() {
        this.resetPaging()
      },
      deep: true
    }
  },

  data() {
    return {
      items: [],
      totalRecords: 0
    }
  },

  computed: {
    columns() {
      return [
        { field: 'requestDate', header: this.$t('view.receiptStock.gold.transaction.colRequestDate'), minWidth: '160px', format: 'datetime' },
        { field: 'running', header: this.$t('view.receiptStock.gold.transaction.colRunning'), minWidth: '140px' },
        { field: 'goldNameTh', header: this.$t('view.receiptStock.gold.transaction.colGoldType'), minWidth: '150px' },
        { field: 'goldSizeNameTh', header: this.$t('view.receiptStock.gold.transaction.colGoldPercent'), minWidth: '130px' },
        { field: 'typeName', header: this.$t('view.receiptStock.gold.transaction.colType'), minWidth: '200px' },
        { field: 'weight', header: this.$t('view.receiptStock.gold.transaction.colWeight'), minWidth: '130px', align: 'right', format: 'decimal3' },
        { field: 'previousRemainWeight', header: this.$t('view.receiptStock.gold.transaction.colPrevWeight'), minWidth: '140px', align: 'right', format: 'decimal3' },
        { field: 'pointRemainWeight', header: this.$t('view.receiptStock.gold.transaction.colRemainWeight'), minWidth: '140px', align: 'right', format: 'decimal3' },
        { field: 'refDocNo', header: this.$t('view.receiptStock.gold.transaction.colRefDocNo'), minWidth: '150px' },
        { field: 'productionPlanWoNumber', header: this.$t('view.receiptStock.gold.transaction.colWo'), minWidth: '150px' },
        { field: 'refRunning', header: this.$t('view.receiptStock.gold.transaction.colRefRunning'), minWidth: '140px' },
        { field: 'status', header: this.$t('common.field.status'), minWidth: '110px', sortable: false },
        { field: 'remark', header: this.$t('common.field.remark'), minWidth: '160px' },
        { field: 'createBy', header: this.$t('common.field.createBy'), minWidth: '120px' }
      ]
    }
  },

  created() {
    this.fetchData()
  },

  methods: {
    async fetchData() {
      const store = useStockGoldApiStore()
      const res = await store.listTransection({
        take: this.take,
        skip: this.skip,
        sort: this.sort,
        search: this.search
      })
      this.items = res?.data || []
      this.totalRecords = res?.total || 0
    },

    getTypeIcon(type) {
      return INBOUND_TYPES.includes(type)
        ? 'bi bi-arrow-down-square-fill text-success'
        : 'bi bi-arrow-up-square-fill text-danger'
    },

    getRowClass(data) {
      return data.status === 'reversed' ? 'row-reversed' : ''
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-data-table';

.badge-reversed {
  display: inline-block;
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  background: var(--base-red);
  color: #ffffff;
  font-size: var(--fs-sm);
  font-weight: 600;
}

:deep(.row-reversed) {
  opacity: 0.55;
  font-style: italic;
}
</style>
