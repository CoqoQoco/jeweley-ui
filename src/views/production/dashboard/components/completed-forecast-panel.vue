<template>
  <div class="mb-4 completed-forecast-panel">
    <SectionCardGeneric
      :title="$t('view.production.dashboard.forecast.title')"
      icon="bi-graph-up-arrow"
      accent="main"
      headerStyle="legend"
    >
      <div v-if="!forecast.hasEnoughData" class="forecast-empty">
        <i class="bi bi-info-circle"></i>
        <span>{{ $t('view.production.dashboard.forecast.notEnoughData') }}</span>
      </div>

      <template v-else>
        <div class="forecast-stat-grid">
          <StatCardGeneric
            icon="bi-calendar-check"
            :value="formatNumber(forecast.forecastQuantityOut)"
            :label="quantityLabel"
            variant="warning"
          />
        </div>

        <ChartGeneric
          type="line"
          :series="quantitySeries"
          :options="chartOptions"
          :height="320"
          :emptyText="$t('view.production.dashboard.forecast.chartEmpty')"
        />

        <p class="forecast-assumption">
          <i class="bi bi-info-circle"></i>
          {{ $t('view.production.dashboard.forecast.assumption', { days: forecast.daysElapsed }) }}
        </p>
      </template>
    </SectionCardGeneric>
  </div>
</template>

<script>
import dayjs from 'dayjs'

import { calculateMonthlyRunRateForecast } from '@/services/utils/forecast.js'
import { CHART_TOKENS } from '@/services/utils/chart-colors.js'

import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import StatCardGeneric from '@/components/generic/StatCardGeneric.vue'
import ChartGeneric from '@/components/prime-vue/ChartGeneric.vue'

export default {
  name: 'CompletedForecastPanel',

  components: {
    SectionCardGeneric,
    StatCardGeneric,
    ChartGeneric
  },

  props: {
    rows: {
      type: Array,
      default: () => []
    }
  },

  computed: {
    trends() {
      return (this.rows || []).map((r) => ({
        date: r.date,
        totalQuantityOut: r.count || 0,
        totalQuantityWeightOut: 0
      }))
    },

    forecast() {
      return calculateMonthlyRunRateForecast(this.trends)
    },

    quantityLabel() {
      return this.$t('view.production.dashboard.forecast.quantityLabel', {
        month: dayjs().format('MM/YYYY')
      })
    },

    quantitySeries() {
      if (!this.forecast.hasEnoughData) return []
      return [
        {
          name: this.$t('view.production.dashboard.forecast.actualSeries'),
          data: this.forecast.actualSeriesData
        },
        {
          name: this.$t('view.production.dashboard.forecast.forecastSeries'),
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
    formatNumber(value) {
      if (!value && value !== 0) return '0'
      return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(value)
    }
  }
}
</script>

<style lang="scss" scoped>
.completed-forecast-panel {
  .forecast-stat-grid {
    margin-bottom: var(--sp-lg);
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
