<template>
  <div class="mb-4 forecast-panel">
    <SectionCardGeneric
      :title="$t('view.stock.gem.dashboard.forecast.title')"
      icon="bi-graph-up-arrow"
      accent="main"
      headerStyle="legend"
    >
      <div v-if="!forecast.hasEnoughData" class="forecast-empty">
        <i class="bi bi-info-circle"></i>
        <span>{{ $t('view.stock.gem.dashboard.forecast.notEnoughData') }}</span>
      </div>

      <template v-else>
        <div class="forecast-stat-grid">
          <StatCardGeneric
            icon="bi-box-seam"
            :value="formatNumber(forecast.forecastQuantityOut)"
            :label="$t('view.stock.gem.dashboard.forecast.quantityLabel')"
            variant="warning"
          />
          <StatCardGeneric
            icon="bi-speedometer2"
            :value="formatNumber(forecast.forecastWeightOut, 3)"
            :label="$t('view.stock.gem.dashboard.forecast.weightLabel')"
            variant="warning"
          />
        </div>

        <ChartGeneric
          type="line"
          :series="quantitySeries"
          :options="chartOptions"
          :height="320"
          :emptyText="$t('view.stock.gem.dashboard.forecast.chartEmpty')"
        />

        <p class="forecast-assumption">
          <i class="bi bi-info-circle"></i>
          {{ $t('view.stock.gem.dashboard.forecast.assumption', { days: forecast.daysElapsed }) }}
        </p>
      </template>
    </SectionCardGeneric>
  </div>
</template>

<script>
import { calculateMonthlyRunRateForecast } from '@/services/utils/forecast.js'
import { CHART_TOKENS } from '@/services/utils/chart-colors.js'

import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import StatCardGeneric from '@/components/generic/StatCardGeneric.vue'
import ChartGeneric from '@/components/prime-vue/ChartGeneric.vue'

export default {
  name: 'ForecastPanel',

  components: {
    SectionCardGeneric,
    StatCardGeneric,
    ChartGeneric
  },

  props: {
    trends: {
      type: Array,
      default: () => []
    }
  },

  computed: {
    forecast() {
      return calculateMonthlyRunRateForecast(this.trends)
    },

    quantitySeries() {
      if (!this.forecast.hasEnoughData) return []
      return [
        {
          name: this.$t('view.stock.gem.dashboard.forecast.actualSeries'),
          data: this.forecast.actualSeriesData
        },
        {
          name: this.$t('view.stock.gem.dashboard.forecast.forecastSeries'),
          data: this.forecast.forecastSeriesData
        }
      ]
    },

    chartOptions() {
      return {
        chart: { type: 'line', toolbar: { show: false } },
        stroke: { width: [3, 3], dashArray: [0, 6], curve: 'straight' },
        colors: [CHART_TOKENS.primary, CHART_TOKENS.warning],
        markers: { size: 0 },
        xaxis: {
          categories: this.forecast.hasEnoughData ? this.forecast.categories : [],
          labels: { style: { fontSize: '10px' }, rotate: -45 }
        },
        dataLabels: { enabled: false },
        tooltip: { shared: true, intersect: false },
        legend: { show: true, position: 'top' }
      }
    }
  },

  methods: {
    formatNumber(value, decimals = 0) {
      if (!value && value !== 0) return '0' + (decimals > 0 ? '.'.padEnd(decimals + 1, '0') : '')
      return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      }).format(value)
    }
  }
}
</script>

<style lang="scss" scoped>
.forecast-panel {
  .forecast-stat-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--sp-lg);
    margin-bottom: var(--sp-lg);

    @media (max-width: 1024px) {
      grid-template-columns: 1fr;
    }
  }

  .forecast-empty {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--sp-sm);
    padding: var(--sp-2xl) 0;
    color: var(--base-sub-color);
    font-size: var(--fs-base);

    i {
      font-size: var(--fs-xl);
    }
  }

  .forecast-assumption {
    display: flex;
    align-items: center;
    gap: var(--sp-xs);
    margin: var(--sp-md) 0 0;
    color: var(--base-sub-color);
    font-size: var(--fs-sm);
    font-style: italic;
  }
}
</style>
