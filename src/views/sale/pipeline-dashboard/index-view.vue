<template>
  <div class="app-container">
    <searchView v-model:modelForm="form" @search="onSearchFilter" @clear="onClearFilter" />
    <summaryView />
    <div class="pipeline-chart-grid">
      <div class="pipeline-chart-grid-left">
        <funnelChartView />
      </div>
      <div class="pipeline-chart-grid-right">
        <monthlyChartView />
        <topCustomersView />
      </div>
    </div>
    <p class="pipeline-caveat">
      <i class="bi bi-info-circle"></i>
      {{ $t('view.sale.pipelineDashboard.caveat') }}
    </p>
  </div>
</template>

<script>
import { useSaleReportApiStore } from '@/stores/modules/api/sale/sale-report-api.js'

import searchView from './components/search-view.vue'
import summaryView from './components/summary-view.vue'
import funnelChartView from './components/funnel-chart-view.vue'
import monthlyChartView from './components/monthly-chart-view.vue'
import topCustomersView from './components/top-customers-view.vue'

const interfaceForm = {
  start: null,
  end: null
}

export default {
  name: 'SalePipelineDashboardIndexView',

  components: {
    searchView,
    summaryView,
    funnelChartView,
    monthlyChartView,
    topCustomersView
  },

  setup() {
    const saleReportStore = useSaleReportApiStore()
    return { saleReportStore }
  },

  data() {
    return {
      form: { ...interfaceForm },
      search: { ...interfaceForm }
    }
  },

  watch: {
    search: {
      handler(val) {
        this.saleReportStore.fetchPipelineSummary(val)
      },
      deep: true,
      immediate: true
    }
  },

  methods: {
    onSearchFilter(data) {
      this.search = { ...data }
    },

    onClearFilter() {
      this.form = { ...interfaceForm }
      this.search = { ...interfaceForm }
    }
  }
}
</script>

<style lang="scss" scoped>
.pipeline-chart-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--sp-lg);
  align-items: start;
  margin-bottom: var(--sp-lg);
}

.pipeline-chart-grid-right {
  display: flex;
  flex-direction: column;
  gap: var(--sp-lg);
}

.pipeline-caveat {
  display: flex;
  align-items: center;
  gap: var(--sp-xs);
  margin: 0;
  color: var(--base-sub-color);
  font-size: var(--fs-sm);
  font-style: italic;
}

@media (max-width: 1024px) {
  .pipeline-chart-grid {
    grid-template-columns: 1fr;
  }
}
</style>
