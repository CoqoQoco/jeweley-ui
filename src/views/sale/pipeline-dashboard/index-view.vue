<template>
  <div class="app-container">
    <DashboardHeaderGeneric
      :title="$t('view.sale.pipelineDashboard.title')"
      :subtitle="$t('view.sale.pipelineDashboard.subtitle')"
      icon="bi-cash-coin"
      @refresh="onRefresh"
    />

    <searchView class="mb-2" :modelForm="filter" @search="onSearchFilter" @clear="onClearFilter" />

    <summaryView :filter="filter" />

    <productGroupView :filter="filter" />
  </div>
</template>

<script>
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

import DashboardHeaderGeneric from '@/components/generic/DashboardHeaderGeneric.vue'

import searchView from './components/search-view.vue'
import summaryView from './components/summary-view.vue'
import productGroupView from './components/product-group-view.vue'

dayjs.extend(utc)
dayjs.extend(timezone)

const THAI_TIMEZONE = 'Asia/Bangkok'

// ช่วงวันที่ default — ต้นเดือนปัจจุบันถึงวันนี้ ยึดเวลาไทยเสมอ (ไม่ใช่ timezone เครื่อง)
const buildDefaultDateRange = () => {
  const now = dayjs().tz(THAI_TIMEZONE)
  return {
    start: now.startOf('month').toDate(),
    end: now.endOf('day').toDate()
  }
}

const buildDefaultFilter = () => ({
  ...buildDefaultDateRange(),
  saleChannelCodes: [],
  customerCode: null,
  customerName: null
})

export default {
  name: 'SalePipelineDashboardIndexView',

  components: {
    DashboardHeaderGeneric,
    searchView,
    summaryView,
    productGroupView
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
        start: query.start ? new Date(query.start) : defaultRange.start,
        end: query.end ? new Date(query.end) : defaultRange.end,
        saleChannelCodes: query.channel ? String(query.channel).split(',').filter(Boolean) : [],
        customerCode: query.customer || null,
        customerName: query.customerName || null
      }

      this.$nextTick(() => {
        this.isApplyingRouteQuery = false
      })
    },

    syncStateToQuery() {
      if (this.isApplyingRouteQuery) return

      const query = {}
      if (this.filter.start) query.start = dayjs(this.filter.start).format('YYYY-MM-DD')
      if (this.filter.end) query.end = dayjs(this.filter.end).format('YYYY-MM-DD')
      if (this.filter.saleChannelCodes && this.filter.saleChannelCodes.length) query.channel = this.filter.saleChannelCodes.join(',')
      if (this.filter.customerCode) query.customer = this.filter.customerCode
      if (this.filter.customerName) query.customerName = this.filter.customerName

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
