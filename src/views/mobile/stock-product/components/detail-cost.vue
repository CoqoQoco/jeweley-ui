<template>
  <div class="detail-cost">
    <cost-breakdown :transactions="transactions" :tagPriceMultiplier="tagPriceMultiplier" />
  </div>
</template>

<script>
import { usrStockProductApiStore } from '@/stores/modules/api/stock/product-api.js'

import costBreakdown from './cost-breakdown.vue'

export default {
  name: 'DetailCost',

  components: { costBreakdown },

  setup() {
    const productStore = usrStockProductApiStore()
    return { productStore }
  },

  props: {
    stockNumber: {
      type: String,
      required: true
    },
    stockData: {
      type: Object,
      default: () => ({})
    }
  },

  data() {
    return {
      transactions: []
    }
  },

  computed: {
    tagPriceMultiplier() {
      return this.stockData?.tagPriceMultiplier || 1
    }
  },

  created() {
    this.loadCostDetail()
  },

  methods: {
    async loadCostDetail() {
      const response = await this.productStore.fetchGetStockCostDetail(this.stockNumber)
      this.transactions = Array.isArray(response) ? response : []
    }
  }
}
</script>
