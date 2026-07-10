<template>
  <div class="mobile-stock-product-view">
    <div class="mobile-container mobile-mt-1">
      <search-bar
        v-model="filterForm.stockNumber"
        :activeFilterCount="activeFilterCount"
        @search="resetAndFetch"
        @open-filter="isFilterOpen = true"
      />
    </div>

    <div class="mobile-container mobile-mt-2">
      <div v-if="items.length > 0" class="card-list">
        <stock-card
          v-for="item in items"
          :key="item.stockNumber"
          :item="item"
          @click="goDetail(item)"
        />

        <button v-if="hasMore" type="button" class="mobile-btn mobile-btn-outline mobile-mt-2" @click="loadMore">
          <i class="bi bi-arrow-down-circle"></i>
          {{ $t('view.mobile.stockProduct.loadMore') }}
        </button>
      </div>

      <div v-else class="mobile-empty-state">
        <i class="bi bi-box-seam"></i>
        <div class="empty-title">{{ $t('view.mobile.stockProduct.empty') }}</div>
      </div>
    </div>

    <filter-sheet
      :isShow="isFilterOpen"
      :modelForm="filterForm"
      @close="isFilterOpen = false"
      @apply="onApplyFilter"
      @clear="onClearFilter"
    />
  </div>
</template>

<script>
import { usrStockProductApiStore } from '@/stores/modules/api/stock/product-api.js'
import { useStockBalanceApiStore } from '@/stores/modules/api/stock/stock-balance-api.js'
import { useStockLocationApiStore } from '@/stores/modules/api/stock/stock-location-api.js'
import { useMasterApiStore } from '@/stores/modules/api/master-store.js'

import searchBar from './components/search-bar.vue'
import filterSheet, { defaultFilterForm } from './components/filter-sheet.vue'
import stockCard from './components/stock-card.vue'

export default {
  name: 'MobileStockProductIndex',

  components: {
    searchBar,
    filterSheet,
    stockCard
  },

  setup() {
    const productStore = usrStockProductApiStore()
    const balanceStore = useStockBalanceApiStore()
    const locationStore = useStockLocationApiStore()
    const masterStore = useMasterApiStore()
    return { productStore, balanceStore, locationStore, masterStore }
  },

  data() {
    return {
      filterForm: { ...defaultFilterForm },
      items: [],
      total: 0,
      skip: 0,
      take: 20,
      hasMore: false,
      isFilterOpen: false
    }
  },

  computed: {
    activeFilterCount() {
      return Object.entries(this.filterForm)
        .filter(([key]) => key !== 'stockNumber')
        .filter(([, val]) => (Array.isArray(val) ? val.length > 0 : val !== null && val !== ''))
        .length
    }
  },

  async created() {
    await this.masterStore.fetchGold()
    await this.masterStore.fetchGoldSize()
    await this.masterStore.fetchProductType()
    await this.locationStore.fetchAllForMap()
    this.fetchData()
  },

  methods: {
    async fetchData(append = false) {
      await this.productStore.fetchDataSearch({
        skip: this.skip,
        take: this.take,
        sort: [],
        formValue: this.filterForm
      })

      const res = this.productStore.dataSearch || {}
      const data = res.data || []
      await this.mergeBalanceIntoItems(data)

      if (append) {
        this.items.push(...data)
      } else {
        this.items = data
      }
      this.total = res.total || 0
      this.hasMore = this.items.length < this.total
    },

    async mergeBalanceIntoItems(items) {
      const stockNumbers = items.map((i) => i.stockNumber).filter(Boolean)
      if (!stockNumbers.length) return

      let nameMap = {}
      try {
        const allLocs = await this.locationStore.fetchAllForMap()
        for (const loc of allLocs) {
          nameMap[loc.code] = `${loc.code} — ${loc.nameTh}`
        }
      } catch {
        // fallback: use code as name
      }

      const map = await this.balanceStore.fetchByStockNumbers(stockNumbers)
      for (const item of items) {
        const b = map[item.stockNumber]
        item.qtyOnHand = b?.qtyOnHand ?? null
        item.qtyReserved = b?.qtyReserved ?? null
        item.qtyAvailable = b?.qtyAvailable ?? null
        if (b?.rows) {
          item.slocBalances = b.rows.map((row) => ({
            ...row,
            location: nameMap[row.locationCode] || row.locationCode
          }))
        } else {
          item.slocBalances = []
        }
      }
    },

    resetAndFetch() {
      this.skip = 0
      this.fetchData()
    },

    loadMore() {
      this.skip += this.take
      this.fetchData(true)
    },

    onApplyFilter(newForm) {
      this.filterForm = { ...newForm }
      this.resetAndFetch()
    },

    onClearFilter() {
      const quickSearch = this.filterForm.stockNumber
      this.filterForm = { ...defaultFilterForm, stockNumber: quickSearch }
      this.resetAndFetch()
    },

    goDetail(item) {
      this.$router.push({ name: 'mobile-stock-product-detail', params: { stockNumber: item.stockNumber } })
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/mobile';

.mobile-stock-product-view {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: calc(80px + env(safe-area-inset-bottom, 0px));
}

.card-list {
  display: flex;
  flex-direction: column;
  gap: var(--sp-md);
}
</style>
