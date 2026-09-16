<template>
  <div class="gold-price-chart">
    <SectionCardGeneric :title="$t('view.goldPrice.chart.title')" icon="bi-graph-up" accent="main" headerStyle="legend">
      <div v-if="isStale" class="gold-price-panel__stale">
        <i class="bi bi-exclamation-triangle-fill"></i>
        <span>{{ $t('view.goldPrice.stale.message') }}</span>
      </div>

      <div v-if="isError" class="gold-price-chart__empty">
        <div class="gold-price-chart__empty-icon"><i class="bi bi-exclamation-circle"></i></div>
        <span class="gold-price-chart__empty-title">{{ $t('view.goldPrice.error.title') }}</span>
        <span class="gold-price-chart__empty-hint">{{ $t('view.goldPrice.error.hint') }}</span>
        <ButtonGeneric variant="outline" icon="bi-arrow-repeat" :label="$t('view.goldPrice.error.retry')" @click="$emit('retry')" />
      </div>

      <template v-else>
        <div class="gold-price-chart__header">
          <div class="gold-price-chart__header-left">
            <span class="gold-price-chart__subtitle">{{ $t('view.goldPrice.chart.subtitle') }}</span>
            <span class="gold-price-chart__source">
              <i class="bi bi-info-circle"></i>
              <span>{{ $t('view.goldPrice.source.history') }}</span>
            </span>
          </div>
          <ToggleGroupGeneric v-model="range" :options="rangeOptions" :ariaLabel="$t('view.goldPrice.chart.rangeAriaLabel')" />
        </div>

        <ChartGeneric type="area" :series="chartSeries" :options="chartOptions" :height="chartHeight" :loading="isLoading" />
      </template>
    </SectionCardGeneric>

    <div v-if="showRangeStats" class="kpi-grid">
      <div class="kpi-card">
        <StatCardGeneric icon="bi-arrow-up-circle" :value="formatMoneyValue(rangeStats.max)" :label="$t('view.goldPrice.chart.statMax')" variant="green" />
      </div>
      <div class="kpi-card">
        <StatCardGeneric icon="bi-arrow-down-circle" :value="formatMoneyValue(rangeStats.min)" :label="$t('view.goldPrice.chart.statMin')" variant="grey" />
      </div>
      <div class="kpi-card">
        <StatCardGeneric icon="bi-bar-chart-line" :value="formatMoneyValue(rangeStats.avg)" :label="$t('view.goldPrice.chart.statAvg')" />
      </div>
      <div class="kpi-card">
        <StatCardGeneric icon="bi-graph-up-arrow" :value="changeDisplay" :label="$t('view.goldPrice.chart.statChange')" variant="main" />
      </div>
    </div>
  </div>
</template>

<script>
import dayjs from 'dayjs'

import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import ToggleGroupGeneric from '@/components/generic/ToggleGroupGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import StatCardGeneric from '@/components/generic/StatCardGeneric.vue'
import ChartGeneric from '@/components/prime-vue/ChartGeneric.vue'

import { useDeviceStore } from '@/stores/modules/device/device-store.js'
import { formatMoney } from '@/services/utils/decimal.js'
import { CHART_TOKENS } from '@/services/utils/chart-colors.js'

const RANGE_MONTHS = { '1m': 1, '3m': 3, '6m': 6, '1y': 12, '2y': 24 }
const SHORT_LABEL_RANGES = ['1m', '3m']

export default {
  name: 'GoldPriceChart',

  components: {
    SectionCardGeneric,
    ToggleGroupGeneric,
    ButtonGeneric,
    StatCardGeneric,
    ChartGeneric
  },

  setup() {
    const deviceStore = useDeviceStore()
    return { deviceStore }
  },

  props: {
    items: {
      type: Array,
      default: () => []
    },
    status: {
      type: String,
      default: 'idle'
    },
    isStale: {
      type: Boolean,
      default: false
    }
  },

  emits: ['retry'],

  data() {
    return {
      range: '2y'
    }
  },

  computed: {
    isLoading() {
      return this.status === 'loading' && !this.items.length
    },

    isError() {
      return this.status === 'error'
    },

    showRangeStats() {
      return !this.isError && !this.isLoading
    },

    rangeOptions() {
      return [
        { value: '1m', label: this.$t('view.goldPrice.chart.range1m') },
        { value: '3m', label: this.$t('view.goldPrice.chart.range3m') },
        { value: '6m', label: this.$t('view.goldPrice.chart.range6m') },
        { value: '1y', label: this.$t('view.goldPrice.chart.range1y') },
        { value: '2y', label: this.$t('view.goldPrice.chart.range2y') }
      ]
    },

    chartHeight() {
      return this.deviceStore.isMobileWidth ? 240 : 320
    },

    monthsShort() {
      return this.$tm('view.goldPrice.months')
    },

    filteredItems() {
      if (!this.items.length) return []
      if (this.range === '2y') return this.items

      const months = RANGE_MONTHS[this.range] || 24
      const lastDate = dayjs(this.items[this.items.length - 1].date)
      const cutoff = lastDate.subtract(months, 'month')

      return this.items.filter((item) => !dayjs(item.date).isBefore(cutoff))
    },

    chartSeries() {
      return [
        {
          name: this.$t('view.goldPrice.chart.seriesName'),
          data: this.filteredItems.map((item) => ({ x: dayjs(item.date).valueOf(), y: Number(item.close) || 0 }))
        }
      ]
    },

    yAxisRange() {
      const closes = this.filteredItems.map((item) => Number(item.close) || 0)
      if (!closes.length) return { min: undefined, max: undefined }

      const min = Math.min(...closes)
      const max = Math.min(...closes) === Math.max(...closes) ? min + 1 : Math.max(...closes)
      const padding = (max - min) * 0.1 || 100

      return { min: Math.floor(min - padding), max: Math.ceil(max + padding) }
    },

    chartOptions() {
      return {
        chart: { type: 'area', toolbar: { show: false } },
        colors: [CHART_TOKENS.primary],
        stroke: { curve: 'smooth', width: 2 },
        markers: { size: 0 },
        fill: {
          type: 'gradient',
          gradient: { shadeIntensity: 1, opacityFrom: 0.35, opacityTo: 0.05, stops: [0, 90, 100] }
        },
        dataLabels: { enabled: false },
        legend: { show: false },
        tooltip: {
          shared: true,
          x: { formatter: (value) => this.formatFullDate(value) },
          y: { formatter: (value) => this.formatMoneyValue(value) }
        },
        xaxis: {
          type: 'datetime',
          labels: {
            formatter: (value, timestamp) => this.formatAxisLabel(timestamp ?? value),
            style: { fontSize: '11px' }
          }
        },
        yaxis: {
          min: this.yAxisRange.min,
          max: this.yAxisRange.max,
          labels: {
            formatter: (value) => formatMoney(value, { showDecimals: false })
          }
        }
      }
    },

    rangeStats() {
      const closes = this.filteredItems.map((item) => Number(item.close) || 0)
      if (!closes.length) return { max: 0, min: 0, avg: 0, changeAmount: 0, changePercent: 0 }

      const max = Math.max(...closes)
      const min = Math.min(...closes)
      const avg = closes.reduce((sum, value) => sum + value, 0) / closes.length
      const first = closes[0]
      const last = closes[closes.length - 1]
      const changeAmount = last - first
      const changePercent = first ? (changeAmount / first) * 100 : 0

      return { max, min, avg, changeAmount, changePercent }
    },

    changeDisplay() {
      const { changeAmount, changePercent } = this.rangeStats
      const arrow = changeAmount >= 0 ? '▲' : '▼'
      const sign = changeAmount >= 0 ? '+' : ''
      return `${arrow} ${sign}${formatMoney(changeAmount)} (${sign}${changePercent.toFixed(1)}%)`
    }
  },

  methods: {
    formatMoneyValue(value) {
      return formatMoney(value)
    },

    formatAxisLabel(timestamp) {
      const d = dayjs(Number(timestamp))
      if (SHORT_LABEL_RANGES.includes(this.range)) {
        return `${d.date()} ${this.monthsShort[d.month()]}`
      }
      return `${this.monthsShort[d.month()]} ${String(d.year()).slice(-2)}`
    },

    formatFullDate(timestamp) {
      const d = dayjs(Number(timestamp))
      return `${d.date()} ${this.monthsShort[d.month()]} ${d.year()}`
    }
  }
}
</script>

<style lang="scss" scoped>
.gold-price-chart {
  display: flex;
  flex-direction: column;
  gap: var(--sp-lg);
}

.gold-price-panel__stale {
  display: flex;
  align-items: center;
  gap: var(--sp-sm);
  background: var(--status-open-bg);
  color: var(--status-open);
  border-radius: var(--radius-md);
  padding: var(--sp-sm) var(--sp-md);
  font-size: var(--fs-sm);
  margin-bottom: var(--sp-lg);
}

.gold-price-chart__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--sp-sm);
  margin-bottom: var(--sp-lg);
}

.gold-price-chart__header-left {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: var(--sp-xs) var(--sp-sm);
  min-width: 0;
}

.gold-price-chart__subtitle {
  font-weight: 600;
  color: var(--base-sub-color);
  font-size: var(--fs-sm);
}

.gold-price-chart__source {
  display: inline-flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: var(--sp-xs);
  font-size: var(--fs-sm);
  font-weight: 400;
  line-height: var(--lh-md);
  color: var(--base-sub-color);

  i {
    font-size: var(--fs-sm);
    flex-shrink: 0;
  }
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  align-items: stretch;
  gap: var(--sp-md);

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.kpi-card {
  height: 100%;

  :deep(.stat-card) {
    height: 100%;
  }
}

.gold-price-chart__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--sp-md);
  padding: var(--sp-2xl) var(--sp-lg);
  text-align: center;
}

.gold-price-chart__empty-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: calc(var(--sp-2xl) * 3);
  height: calc(var(--sp-2xl) * 3);
  border-radius: 50%;
  background: var(--color-highlight-bg);

  i {
    font-size: calc(var(--fs-xl) * 1.6);
    color: var(--base-font-color);
  }
}

.gold-price-chart__empty-title {
  font-weight: 700;
  font-size: var(--fs-lg);
  color: var(--base-font-color);
}

.gold-price-chart__empty-hint {
  font-size: var(--fs-base);
  color: var(--base-sub-color);
}
</style>
