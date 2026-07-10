<template>
  <div class="mobile-stock-detail-view">
    <template v-if="item">
      <div class="mobile-container mobile-mt-2">
        <div class="detail-stock-caption">{{ stockNumber }}</div>
      </div>

      <div class="mobile-container mobile-mt-1">
        <div class="segmented-tabs">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            type="button"
            class="segment-btn"
            :class="{ active: activeTab === tab.key }"
            @click="activeTab = tab.key"
          >
            {{ tab.label }}
          </button>
        </div>
      </div>

      <div class="mobile-container mobile-mt-2">
        <detail-info v-if="visitedTabs.info" v-show="activeTab === 'info'" :item="item" />
        <detail-balance v-if="visitedTabs.balance" v-show="activeTab === 'balance'" :item="item" />
        <detail-cost v-if="visitedTabs.cost" v-show="activeTab === 'cost'" :stockNumber="stockNumber" :stockData="item" />
        <detail-cost-history
          v-if="visitedTabs.history"
          v-show="activeTab === 'history'"
          :stockNumber="stockNumber"
          :stockData="item"
        />
      </div>
    </template>

    <div v-else class="mobile-container mobile-mt-2">
      <div class="mobile-empty-state">
        <i class="bi bi-exclamation-circle"></i>
        <div class="empty-title">{{ $t('view.mobile.stockProduct.notFoundTitle') }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import { usrStockProductApiStore } from '@/stores/modules/api/stock/product-api.js'
import { useStockBalanceApiStore } from '@/stores/modules/api/stock/stock-balance-api.js'
import { useStockLocationApiStore } from '@/stores/modules/api/stock/stock-location-api.js'
import { useMasterApiStore } from '@/stores/modules/api/master-store.js'

import detailInfo from './components/detail-info.vue'
import detailBalance from './components/detail-balance.vue'
import detailCost from './components/detail-cost.vue'
import detailCostHistory from './components/detail-cost-history.vue'

export default {
  name: 'MobileStockProductDetail',

  components: {
    detailInfo,
    detailBalance,
    detailCost,
    detailCostHistory
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
      item: null,
      activeTab: 'info',
      visitedTabs: { info: true, balance: false, cost: false, history: false }
    }
  },

  computed: {
    stockNumber() {
      return this.$route.params.stockNumber
    },
    tabs() {
      return [
        { key: 'info', label: this.$t('view.mobile.stockProduct.tabInfo') },
        { key: 'balance', label: this.$t('view.mobile.stockProduct.tabBalance') },
        { key: 'cost', label: this.$t('view.mobile.stockProduct.tabCost') },
        { key: 'history', label: this.$t('view.mobile.stockProduct.tabHistory') }
      ]
    }
  },

  watch: {
    activeTab(val) {
      this.visitedTabs[val] = true
    }
  },

  created() {
    this.masterStore.fetchGold()
    this.loadItem()
  },

  methods: {
    async loadItem() {
      await this.productStore.fetchDataSearch({
        skip: 0,
        take: 1,
        sort: [],
        formValue: { stockNumber: this.stockNumber }
      })

      const data = this.productStore.dataSearch?.data || []
      if (data.length) {
        this.item = data[0]
        await this.mergeBalanceIntoItems([this.item])
      }
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
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/mobile';

.mobile-stock-detail-view {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: calc(40px + env(safe-area-inset-bottom, 0px));
}

.detail-stock-caption {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--base-font-color);
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.segmented-tabs {
  display: flex;
  background: var(--color-card-bg);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.segment-btn {
  flex: 1;
  padding: 10px 6px;
  border: none;
  background: var(--color-card-bg);
  color: #666;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &.active {
    background: var(--base-font-color);
    color: white;
  }

  &:active {
    opacity: 0.9;
  }
}

.mobile-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  background: var(--color-card-bg);
  border-radius: var(--radius-lg);
  text-align: center;

  i {
    font-size: 4rem;
    color: var(--color-border);
    margin-bottom: var(--sp-lg);
  }

  .empty-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: #666;
  }
}
</style>
