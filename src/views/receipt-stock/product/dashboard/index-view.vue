<template>
  <div class="app-container">
    <DashboardHeaderGeneric
      :title="$t('view.stock.product.dashboard.title')"
      icon="bi-box-seam"
      @refresh="onRefresh"
    />

    <searchView class="mb-2" :modelForm="filter" @search="onSearchFilter" @clear="onClearFilter" />

    <summaryView :filter="filter" />

    <stockGroupView :filter="filter" />

    <stockAgingView :filter="filter" />

    <productionBalanceView :filter="filter" />
  </div>
</template>

<script>
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

import DashboardHeaderGeneric from '@/components/generic/DashboardHeaderGeneric.vue'

import searchView from './components/search-view.vue'
import summaryView from './components/summary-view.vue'
import stockGroupView from './components/stock-group-view.vue'
import stockAgingView from './components/stock-aging-view.vue'
import productionBalanceView from './components/production-balance-view.vue'

dayjs.extend(utc)
dayjs.extend(timezone)

const THAI_TIMEZONE = 'Asia/Bangkok'

// ช่วงยอดขายที่ใช้เทียบ default — 12 เดือนย้อนหลังถึงวันนี้ ยึดเวลาไทยเสมอ (ไม่ใช่ timezone เครื่อง)
const buildDefaultDateRange = () => {
  const now = dayjs().tz(THAI_TIMEZONE)
  return {
    salesStart: now.subtract(12, 'month').startOf('day').toDate(),
    salesEnd: now.endOf('day').toDate()
  }
}

const buildDefaultFilter = () => ({
  ...buildDefaultDateRange(),
  locationCodes: [],
  productTypes: [],
  golds: [],
  goldSizes: []
})

export default {
  name: 'StockProductDashboardIndexView',

  components: {
    DashboardHeaderGeneric,
    searchView,
    summaryView,
    stockGroupView,
    stockAgingView,
    productionBalanceView
  },

  data() {
    return {
      filter: buildDefaultFilter(),
      isApplyingRouteQuery: false
    }
  },

  watch: {
    filter: {
      handler() {
        this.syncStateToQuery()
      },
      deep: true
    }
  },

  methods: {
    applyQueryToState(query) {
      this.isApplyingRouteQuery = true

      const defaultRange = buildDefaultDateRange()
      this.filter = {
        salesStart: query.salesStart ? new Date(query.salesStart) : defaultRange.salesStart,
        salesEnd: query.salesEnd ? new Date(query.salesEnd) : defaultRange.salesEnd,
        locationCodes: query.locations ? String(query.locations).split(',').filter(Boolean) : [],
        productTypes: query.productTypes ? String(query.productTypes).split(',').filter(Boolean) : [],
        golds: query.golds ? String(query.golds).split(',').filter(Boolean) : [],
        goldSizes: query.goldSizes ? String(query.goldSizes).split(',').filter(Boolean) : []
      }

      this.$nextTick(() => {
        this.isApplyingRouteQuery = false
      })
    },

    syncStateToQuery() {
      if (this.isApplyingRouteQuery) return

      const query = {}
      if (this.filter.salesStart) query.salesStart = dayjs(this.filter.salesStart).format('YYYY-MM-DD')
      if (this.filter.salesEnd) query.salesEnd = dayjs(this.filter.salesEnd).format('YYYY-MM-DD')
      if (this.filter.locationCodes && this.filter.locationCodes.length) query.locations = this.filter.locationCodes.join(',')
      if (this.filter.productTypes && this.filter.productTypes.length) query.productTypes = this.filter.productTypes.join(',')
      if (this.filter.golds && this.filter.golds.length) query.golds = this.filter.golds.join(',')
      if (this.filter.goldSizes && this.filter.goldSizes.length) query.goldSizes = this.filter.goldSizes.join(',')

      this.$router.replace({ query }).catch(() => {})
    },

    onSearchFilter(formData) {
      this.filter = { ...formData }
    },

    onClearFilter() {
      this.filter = buildDefaultFilter()
    },

    onRefresh() {
      // ยิงใหม่ด้วยค่า filter เดิม — ทุก child component watch `filter` แบบ deep อยู่แล้ว
      this.filter = { ...this.filter }
    }
  },

  created() {
    this.applyQueryToState(this.$route.query)
  }
}
</script>

<style lang="scss" scoped></style>
