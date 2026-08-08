<template>
  <div class="mb-4 aging-panel">
    <SectionCardGeneric
      :title="$t('view.stock.gem.dashboard.aging.title')"
      icon="bi-hourglass-split"
      accent="main"
      headerStyle="legend"
    >
      <div class="aging-stat-grid">
        <StatCardGeneric
          class="aging-stat-count"
          icon="bi-exclamation-triangle"
          :value="formatNumber(aging.deadStockCodes)"
          :label="$t('view.stock.gem.dashboard.aging.deadCodesOverYear')"
          variant="warning"
        />
        <StatCardGeneric
          icon="bi-hash"
          :value="formatNumber(aging.deadStockCodes)"
          :label="$t('view.stock.gem.dashboard.aging.deadCodes')"
        />
      </div>

      <ChartGeneric
        type="bar"
        :series="chartSeries"
        :options="chartOptions"
        :height="320"
        :loading="loading"
        :emptyText="$t('view.stock.gem.dashboard.aging.chartEmpty')"
      />
    </SectionCardGeneric>
  </div>
</template>

<script>
import { CHART_TOKENS } from '@/services/utils/chart-colors.js'

import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import StatCardGeneric from '@/components/generic/StatCardGeneric.vue'
import ChartGeneric from '@/components/prime-vue/ChartGeneric.vue'

const BUCKET_COLOR_MAP = {
  d0_30: CHART_TOKENS.green,
  d31_90: CHART_TOKENS.primary,
  d91_180: CHART_TOKENS.sub,
  d181_365: CHART_TOKENS.red,
  over365: CHART_TOKENS.warning,
  never: CHART_TOKENS.border
}

export default {
  name: 'AgingPanel',

  components: {
    SectionCardGeneric,
    StatCardGeneric,
    ChartGeneric
  },

  props: {
    aging: {
      type: Object,
      default: () => ({})
    },
    loading: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    sortedBuckets() {
      const buckets = this.aging?.buckets || []
      return [...buckets].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
    },

    chartSeries() {
      return [
        {
          name: this.$t('view.stock.gem.dashboard.aging.countLabel'),
          data: this.sortedBuckets.map((bucket) => bucket.gemCodes || 0)
        }
      ]
    },

    chartOptions() {
      const buckets = this.sortedBuckets
      return {
        chart: { type: 'bar', toolbar: { show: false } },
        plotOptions: {
          bar: {
            horizontal: true,
            distributed: true,
            borderRadius: 4,
            barHeight: '60%'
          }
        },
        colors: buckets.map((bucket) => this.bucketColor(bucket.bucketKey)),
        legend: { show: false },
        xaxis: {
          categories: buckets.map((bucket) => this.bucketLabel(bucket.bucketKey)),
          labels: {
            style: { fontSize: '11px' },
            formatter: (val) => this.formatNumber(val)
          }
        },
        dataLabels: {
          enabled: true,
          formatter: (val) => this.formatNumber(val),
          style: { fontSize: '11px' }
        },
        tooltip: {
          y: {
            formatter: (val) => this.formatNumber(val)
          }
        }
      }
    }
  },

  methods: {
    bucketLabel(bucketKey) {
      return this.$t(`view.stock.gem.dashboard.aging.bucket.${bucketKey}`)
    },

    bucketColor(bucketKey) {
      return BUCKET_COLOR_MAP[bucketKey] || CHART_TOKENS.sub
    },

    formatNumber(value) {
      if (!value && value !== 0) return '0'
      return new Intl.NumberFormat('en-US').format(value)
    }
  }
}
</script>

<style lang="scss" scoped>
.aging-panel {
  .aging-stat-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--sp-lg);
    margin-bottom: var(--sp-lg);

    @media (max-width: 1024px) {
      grid-template-columns: 1fr;
    }
  }

  .aging-stat-count :deep(.stat-value) {
    text-align: right;
  }
}
</style>
