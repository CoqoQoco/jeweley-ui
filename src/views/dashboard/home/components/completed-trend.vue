<template>
  <SectionCardGeneric :title="$t('view.dashboard.home.completedTrend.title')" icon="bi-graph-up-arrow" accent="green" headerStyle="legend">
    <div v-if="!forecast.hasEnoughData" class="trend-empty">
      <i class="bi bi-info-circle"></i>
      <span>{{ $t('view.dashboard.home.completedTrend.notEnoughData') }}</span>
    </div>
    <template v-else>
      <div class="trend-stat">
        <StatCardGeneric icon="bi-calendar-check" :value="formattedForecast" :label="$t('view.dashboard.home.completedTrend.forecastLabel')" variant="green" />
      </div>
      <ChartGeneric type="line" :series="series" :options="options" :height="240" />
      <p class="trend-assumption">
        <i class="bi bi-info-circle"></i>
        {{ $t('view.dashboard.home.completedTrend.assumption', { days: forecast.daysElapsed }) }}
      </p>
    </template>
  </SectionCardGeneric>
</template>

<script>
import { calculateMonthlyRunRateForecast } from '@/services/utils/forecast.js'
import { CHART_TOKENS } from '@/services/utils/chart-colors.js'

import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import StatCardGeneric from '@/components/generic/StatCardGeneric.vue'
import ChartGeneric from '@/components/prime-vue/ChartGeneric.vue'

export default {
  name: 'CompletedTrend',

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
      return (this.rows || []).map((r) => ({ date: r.date, totalQuantityOut: r.count || 0, totalQuantityWeightOut: 0 }))
    },

    forecast() {
      return calculateMonthlyRunRateForecast(this.trends)
    },

    formattedForecast() {
      return Math.round(this.forecast.forecastQuantityOut || 0)
    },

    series() {
      if (!this.forecast.hasEnoughData) return []
      return [
        { name: this.$t('view.dashboard.home.completedTrend.actual'), data: this.forecast.actualSeriesData },
        { name: this.$t('view.dashboard.home.completedTrend.forecast'), data: this.forecast.forecastSeriesData }
      ]
    },

    options() {
      return {
        chart: { zoom: { enabled: false } },
        colors: [CHART_TOKENS.primary, CHART_TOKENS.warning],
        stroke: { curve: 'smooth', width: 2, dashArray: [0, 4] },
        xaxis: { categories: this.forecast.categories || [] }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.trend-empty {
  display: flex;
  align-items: center;
  gap: var(--sp-sm);
  color: var(--base-sub-color);
  padding: var(--sp-lg) 0;
}

.trend-stat {
  margin-bottom: var(--sp-md);
}

.trend-assumption {
  display: flex;
  align-items: center;
  gap: var(--sp-xs);
  color: var(--base-sub-color);
  font-size: var(--fs-sm);
  margin-top: var(--sp-sm);
  margin-bottom: 0;
}
</style>
