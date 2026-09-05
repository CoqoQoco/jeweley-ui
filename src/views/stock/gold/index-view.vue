<template>
  <div class="app-container">
    <search-view
      v-model:goldCode="filter.goldCode"
      v-model:goldSizeCode="filter.goldSizeCode"
      @search="onSearch"
      @clear="onClear"
      @export="onExport"
    />
    <summary-view
      class="mt-2"
      :totalTypes="totalTypes"
      :totalWeight="totalWeight"
      :totalWeightOnProcess="totalWeightOnProcess"
      :groupedItems="groupedByType"
    />
    <data-table-view class="mt-2" :search="search" />
  </div>
</template>

<script>
import { useStockGoldApiStore } from '@/stores/modules/api/stock/gold-store.js'
import { formatDate } from '@/services/utils/dayjs.js'
import { ExcelHelper } from '@/services/utils/excel-js.js'
import { warning } from '@/services/alert/sweetAlerts.js'

import searchView from './components/search-view.vue'
import summaryView from './components/summary-view.vue'
import dataTableView from './components/data-table-view.vue'

export default {
  name: 'StockGoldListView',

  components: {
    searchView,
    summaryView,
    dataTableView
  },

  data() {
    return {
      filter: {
        goldCode: [],
        goldSizeCode: []
      },
      search: {},
      summaryItems: []
    }
  },

  computed: {
    totalTypes() {
      return new Set(this.summaryItems.map((item) => item.goldCode)).size
    },
    totalWeight() {
      return this.summaryItems.reduce((sum, item) => sum + (Number(item.weight) || 0), 0)
    },
    totalWeightOnProcess() {
      return this.summaryItems.reduce((sum, item) => sum + (Number(item.weightOnProcess) || 0), 0)
    },
    groupedByType() {
      const map = new Map()
      this.summaryItems.forEach((item) => {
        const key = item.goldCode
        if (!map.has(key)) {
          map.set(key, {
            goldCode: item.goldCode,
            goldNameTh: item.goldNameTh,
            weight: 0,
            weightOnProcess: 0
          })
        }
        const group = map.get(key)
        group.weight += Number(item.weight) || 0
        group.weightOnProcess += Number(item.weightOnProcess) || 0
      })
      return Array.from(map.values())
    }
  },

  created() {
    this.fetchSummary()
  },

  methods: {
    buildSearch() {
      return {
        goldCode: this.filter.goldCode.length ? this.filter.goldCode : null,
        goldSizeCode: this.filter.goldSizeCode.length ? this.filter.goldSizeCode : null
      }
    },

    async fetchSummary() {
      const store = useStockGoldApiStore()
      const res = await store.listBalance({ take: 0, skip: 0, sort: [], search: this.buildSearch() })
      this.summaryItems = res?.data || []
    },

    onSearch() {
      this.search = this.buildSearch()
      this.fetchSummary()
    },

    onClear() {
      this.filter = { goldCode: [], goldSizeCode: [] }
      this.search = {}
      this.fetchSummary()
    },

    async onExport() {
      if (this.summaryItems.length === 0) {
        warning(this.$t('view.stock.gold.noDataExport'))
        return
      }

      const rows = this.summaryItems.map((item) => ({
        goldCode: item.goldCode,
        goldNameTh: item.goldNameTh,
        goldSizeNameTh: item.goldSizeNameTh,
        goldPercent: item.goldPercent,
        weight: item.weight,
        weightOnProcess: item.weightOnProcess,
        updateDate: item.updateDate ? formatDate(item.updateDate) : ''
      }))

      const summaryRows = this.groupedByType

      await ExcelHelper.exportToExcelMultiSheet(
        [
          {
            data: rows,
            sheetName: this.$t('view.stock.gold.searchTitle'),
            columns: [
              { header: this.$t('view.stock.gold.colGoldCode'), key: 'goldCode' },
              { header: this.$t('view.stock.gold.colGoldName'), key: 'goldNameTh' },
              { header: this.$t('view.stock.gold.colGoldSizeName'), key: 'goldSizeNameTh' },
              { header: this.$t('view.stock.gold.colGoldPercent'), key: 'goldPercent' },
              { header: this.$t('view.stock.gold.colWeight'), key: 'weight' },
              { header: this.$t('view.stock.gold.colWeightOnProcess'), key: 'weightOnProcess' },
              { header: this.$t('view.stock.gold.colUpdateDate'), key: 'updateDate' }
            ]
          },
          {
            data: summaryRows,
            sheetName: this.$t('view.stock.gold.summaryTitle'),
            columns: [
              { header: this.$t('view.stock.gold.colGoldCode'), key: 'goldCode' },
              { header: this.$t('view.stock.gold.colGoldName'), key: 'goldNameTh' },
              { header: this.$t('view.stock.gold.colWeight'), key: 'weight' },
              { header: this.$t('view.stock.gold.colWeightOnProcess'), key: 'weightOnProcess' }
            ]
          }
        ],
        { filename: `${this.$t('view.stock.gold.searchTitle')}.xlsx` }
      )
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/web';

.app-container {
  padding: var(--sp-lg);
}
</style>
