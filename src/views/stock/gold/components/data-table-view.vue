<template>
  <SectionCardGeneric :title="$t('view.stock.gold.listTableTitle')" icon="bi-card-list" accent="main" headerStyle="legend">
    <BaseDataTable
      :items="items"
      :totalRecords="totalRecords"
      :columns="columns"
      :perPage="take"
      dataKey="id"
      @page="handlePageChange"
      @sort="handleSortChange"
    />
  </SectionCardGeneric>
</template>

<script>
import { useStockGoldApiStore } from '@/stores/modules/api/stock/gold-store.js'
import dataTablePaging from '@/composables/useDataTablePaging.js'

import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'

export default {
  name: 'StockGoldDataTableView',

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

  emits: [],

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
        { field: 'goldCode', header: this.$t('view.stock.gold.colGoldCode'), minWidth: '110px' },
        { field: 'goldNameTh', header: this.$t('view.stock.gold.colGoldName'), minWidth: '160px' },
        { field: 'goldSizeNameTh', header: this.$t('view.stock.gold.colGoldSizeName'), minWidth: '140px' },
        {
          field: 'goldPercent',
          header: this.$t('view.stock.gold.colGoldPercent'),
          minWidth: '110px',
          align: 'right',
          format: 'decimal2'
        },
        {
          field: 'weight',
          header: this.$t('view.stock.gold.colWeight'),
          minWidth: '140px',
          align: 'right',
          format: 'decimal3'
        },
        {
          field: 'weightOnProcess',
          header: this.$t('view.stock.gold.colWeightOnProcess'),
          minWidth: '150px',
          align: 'right',
          format: 'decimal3'
        },
        { field: 'updateDate', header: this.$t('view.stock.gold.colUpdateDate'), minWidth: '150px', format: 'datetime' },
        { field: 'updateBy', header: this.$t('common.field.updateBy'), minWidth: '120px' }
      ]
    }
  },

  created() {
    this.fetchData()
  },

  methods: {
    async fetchData() {
      const store = useStockGoldApiStore()
      const res = await store.listBalance({
        take: this.take,
        skip: this.skip,
        sort: this.sort,
        search: this.search
      })
      this.items = res?.data || []
      this.totalRecords = res?.total || 0
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-data-table';
</style>
