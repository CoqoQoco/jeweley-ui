<template>
  <div class="gold-price-panel">
    <SectionCardGeneric :title="todayHeaderTitle" icon="bi-coin" accent="main" headerStyle="dashboard">
      <template #header-actions>
        <span class="gold-price-panel__source">
          <i class="bi bi-info-circle"></i>
          <span>
            {{ $t('view.goldPrice.source.today') }}
            (<a href="https://www.goldtraders.or.th" target="_blank" rel="noopener noreferrer">{{ $t('view.goldPrice.source.todayLink') }}</a>)
          </span>
        </span>
      </template>

      <div v-if="isTodayStale" class="gold-price-panel__stale">
        <i class="bi bi-exclamation-triangle-fill"></i>
        <span>{{ $t('view.goldPrice.stale.message') }}</span>
      </div>

      <div v-if="isTodayLoading" class="kpi-grid">
        <div v-for="n in 4" :key="n" class="gold-price-panel__skeleton-card"></div>
      </div>

      <div v-else-if="isTodayError" class="gold-price-panel__empty">
        <div class="gold-price-panel__empty-icon"><i class="bi bi-exclamation-circle"></i></div>
        <span class="gold-price-panel__empty-title">{{ $t('view.goldPrice.error.title') }}</span>
        <span class="gold-price-panel__empty-hint">{{ $t('view.goldPrice.error.hint') }}</span>
        <ButtonGeneric variant="outline" icon="bi-arrow-repeat" :label="$t('view.goldPrice.error.retry')" @click="retryToday" />
      </div>

      <template v-else-if="today">
        <div class="kpi-grid">
          <div class="kpi-card">
            <StatCardGeneric
              class="gold-price-panel__hero-card"
              icon="bi-cash-coin"
              :value="formatMoneyValue(today.barSell)"
              :label="$t('view.goldPrice.cards.barSell')"
              :subLabel="heroChangeDisplay"
              variant="main"
            />
          </div>
          <div class="kpi-card">
            <StatCardGeneric icon="bi-cash-coin" :value="formatMoneyValue(today.barBuy)" :label="$t('view.goldPrice.cards.barBuy')" variant="grey" />
          </div>
          <div class="kpi-card">
            <StatCardGeneric icon="bi-gem" :value="formatMoneyValue(today.ornamentSell)" :label="$t('view.goldPrice.cards.ornamentSell')" variant="grey" />
          </div>
          <div class="kpi-card">
            <StatCardGeneric icon="bi-gem" :value="formatMoneyValue(today.ornamentBuy)" :label="$t('view.goldPrice.cards.ornamentBuy')" variant="grey" />
          </div>
        </div>

        <div class="gold-price-panel__spot">
          <span>{{ $t('view.goldPrice.spot.goldSpot') }} <strong>{{ formatMoneyValue(today.goldSpot) }}</strong> {{ $t('view.goldPrice.spot.goldSpotUnit') }}</span>
          <span class="gold-price-panel__spot-divider">·</span>
          <span>{{ $t('view.goldPrice.spot.fx') }} <strong>{{ formatMoneyValue(today.bahtPerUsd) }}</strong></span>
        </div>

        <div class="gold-price-panel__toggle-row">
          <ButtonGeneric
            variant="plain"
            :icon="showRounds ? 'bi-chevron-up' : 'bi-chevron-down'"
            :label="showRounds ? $t('view.goldPrice.rounds.hideToggle') : $t('view.goldPrice.rounds.showToggle', { count: roundsSorted.length })"
            @click="showRounds = !showRounds"
          />
        </div>

        <BaseDataTable
          v-if="showRounds"
          :items="roundsSorted"
          :columns="roundsColumns"
          :totalRecords="roundsSorted.length"
          :perPage="roundsSorted.length || 10"
          :paginator="false"
          dataKey="priceSeq"
        >
          <template #barTemplate="{ data }">{{ formatMoneyValue(data.barBuy) }} / {{ formatMoneyValue(data.barSell) }}</template>
          <template #ornamentTemplate="{ data }">{{ formatMoneyValue(data.ornamentBuy) }} / {{ formatMoneyValue(data.ornamentSell) }}</template>
          <template #priceDiffTemplate="{ data }">{{ formatSignedMoney(data.priceDiff) }}</template>
        </BaseDataTable>
      </template>
    </SectionCardGeneric>

    <goldPriceChart :items="history.items" :status="historyStatus" :isStale="history.isStale" @retry="retryHistory" />

    <SectionCardGeneric :title="$t('view.goldPrice.daily.title')" icon="bi-table" accent="main" headerStyle="legend">
      <div class="gold-price-panel__toggle-row gold-price-panel__toggle-row--split">
        <ButtonGeneric
          variant="plain"
          :icon="showDaily ? 'bi-chevron-up' : 'bi-chevron-down'"
          :label="showDaily ? $t('view.goldPrice.daily.hideToggle') : $t('view.goldPrice.daily.showToggle', { count: dailyRows.length })"
          @click="showDaily = !showDaily"
        />
        <span class="gold-price-panel__source">
          <i class="bi bi-info-circle"></i>
          <span>{{ $t('view.goldPrice.source.history') }}</span>
        </span>
      </div>

      <template v-if="showDaily">
        <BaseDataTable
          :items="dailyRows"
          :columns="dailyColumns"
          :totalRecords="dailyRows.length"
          :perPage="dailyRows.length || 10"
          :paginator="false"
          dataKey="date"
        >
          <template #dateTemplate="{ data }">{{ formatShortThaiDate(data.date) }}</template>
          <template #changeTemplate="{ data }">{{ formatArrowMoney(data.change) }}</template>
        </BaseDataTable>
        <p v-if="dailyRows.length" class="gold-price-panel__foot-note">
          {{ $t('view.goldPrice.daily.footNote', { count: dailyRows.length }) }}
        </p>
      </template>
    </SectionCardGeneric>
  </div>
</template>

<script>
import dayjs from 'dayjs'

import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import StatCardGeneric from '@/components/generic/StatCardGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import goldPriceChart from './gold-price-chart.vue'

import { useGoldPriceStore } from '@/stores/modules/api/dashboard/gold-price-store.js'
import { formatMoney } from '@/services/utils/decimal.js'

export default {
  name: 'GoldPricePanel',

  components: {
    SectionCardGeneric,
    StatCardGeneric,
    ButtonGeneric,
    BaseDataTable,
    goldPriceChart
  },

  setup() {
    const goldPriceStore = useGoldPriceStore()
    return { goldPriceStore }
  },

  data() {
    return {
      showRounds: false,
      showDaily: false
    }
  },

  computed: {
    today() {
      return this.goldPriceStore.today
    },

    todayStatus() {
      return this.goldPriceStore.todayStatus
    },

    history() {
      return this.goldPriceStore.history
    },

    historyStatus() {
      return this.goldPriceStore.historyStatus
    },

    isTodayLoading() {
      return this.todayStatus === 'loading' && !this.today
    },

    isTodayError() {
      return this.todayStatus === 'error'
    },

    isTodayStale() {
      return !!this.today?.isStale
    },

    isTodayDate() {
      if (!this.today?.date) return false
      return this.today.date === dayjs().format('YYYY-MM-DD')
    },

    monthsShort() {
      return this.$tm('view.goldPrice.months')
    },

    todayHeaderTitle() {
      if (!this.today) return this.$t('view.goldPrice.panel.todayTitle')

      const baseTitle = this.isTodayDate
        ? this.$t('view.goldPrice.panel.todayTitle')
        : this.$t('view.goldPrice.panel.latestTitle')
      const dateLabel = this.formatFullThaiDate(this.today.date)
      const roundLabel = this.$t('view.goldPrice.panel.roundLabel', { seq: this.today.priceSeq })
      const timeLabel = this.$t('view.goldPrice.panel.timeSuffix', { time: this.today.time })

      return `${baseTitle} · ${dateLabel} · ${roundLabel} · ${timeLabel}`
    },

    heroChangeDisplay() {
      if (!this.today || !Number.isFinite(this.today.changeFromPrevClose)) return ''

      const change = this.today.changeFromPrevClose
      const prevClose = this.today.barSell - change
      const percent = prevClose ? (change / prevClose) * 100 : 0
      const arrow = change >= 0 ? '▲' : '▼'
      const sign = change > 0 ? '+' : ''

      return `${arrow} ${sign}${formatMoney(change)} (${sign}${percent.toFixed(2)}%)`
    },

    roundsSorted() {
      const rounds = this.today?.rounds || []
      return [...rounds].sort((a, b) => (b.priceSeq || 0) - (a.priceSeq || 0))
    },

    roundsColumns() {
      return [
        { field: 'priceSeq', header: this.$t('view.goldPrice.rounds.colSeq'), sortable: false, align: 'center', width: '70px' },
        { field: 'time', header: this.$t('view.goldPrice.rounds.colTime'), sortable: false, align: 'center', width: '90px' },
        { field: 'bar', header: this.$t('view.goldPrice.rounds.colBar'), sortable: false, align: 'right' },
        { field: 'ornament', header: this.$t('view.goldPrice.rounds.colOrnament'), sortable: false, align: 'right' },
        { field: 'priceDiff', header: this.$t('view.goldPrice.rounds.colDiff'), sortable: false, align: 'right', width: '100px' }
      ]
    },

    dailyRows() {
      const items = this.history?.items || []
      return items.slice(-60).slice().reverse()
    },

    dailyColumns() {
      return [
        { field: 'date', header: this.$t('view.goldPrice.daily.colDate'), sortable: false, width: '110px' },
        { field: 'open', header: this.$t('view.goldPrice.daily.colOpen'), sortable: false, align: 'right', format: 'decimal2' },
        { field: 'high', header: this.$t('view.goldPrice.daily.colHigh'), sortable: false, align: 'right', format: 'decimal2' },
        { field: 'low', header: this.$t('view.goldPrice.daily.colLow'), sortable: false, align: 'right', format: 'decimal2' },
        { field: 'close', header: this.$t('view.goldPrice.daily.colClose'), sortable: false, align: 'right', format: 'decimal2' },
        { field: 'change', header: this.$t('view.goldPrice.daily.colChange'), sortable: false, align: 'right', width: '120px' }
      ]
    }
  },

  mounted() {
    this.goldPriceStore.loadGoldPriceTab()
  },

  methods: {
    retryToday() {
      this.goldPriceStore.loadToday()
    },

    retryHistory() {
      this.goldPriceStore.loadHistory()
    },

    formatMoneyValue(value) {
      return formatMoney(value)
    },

    formatSignedMoney(value) {
      const num = Number(value) || 0
      const sign = num > 0 ? '+' : ''
      return `${sign}${formatMoney(num)}`
    },

    formatArrowMoney(value) {
      const num = Number(value) || 0
      const arrow = num >= 0 ? '▲' : '▼'
      const sign = num > 0 ? '+' : ''
      return `${arrow} ${sign}${formatMoney(num)}`
    },

    formatFullThaiDate(isoDate) {
      if (!isoDate) return '-'
      const d = dayjs(isoDate)
      return `${d.date()} ${this.monthsShort[d.month()]} ${d.year()}`
    },

    formatShortThaiDate(isoDate) {
      if (!isoDate) return '-'
      const d = dayjs(isoDate)
      return `${d.date()} ${this.monthsShort[d.month()]} ${String(d.year()).slice(-2)}`
    }
  }
}
</script>

<style lang="scss" scoped>
.gold-price-panel {
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

.gold-price-panel__hero-card {
  :deep(.stat-value) {
    font-size: calc(var(--fs-xl) * 1.35);
  }

  @media (max-width: 768px) {
    :deep(.stat-value) {
      font-size: calc(var(--fs-xl) * 1.2);
    }
  }
}

.gold-price-panel__skeleton-card {
  height: calc(var(--sp-2xl) * 3.5);
  border-radius: var(--radius-md);
  background: var(--color-border);
  animation: gold-price-skeleton-pulse 1.2s ease-in-out infinite;
}

@keyframes gold-price-skeleton-pulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}

.gold-price-panel__spot {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: var(--sp-sm);
  margin-top: var(--sp-lg);
  padding: var(--sp-md);
  background: var(--color-highlight-bg);
  border-radius: var(--radius-md);
  font-size: var(--fs-base);
  color: var(--base-sub-color);

  strong {
    color: var(--base-font-color);
  }
}

.gold-price-panel__spot-divider {
  color: var(--base-sub-color);
}

.gold-price-panel__toggle-row {
  display: flex;
  justify-content: center;
  margin-top: var(--sp-lg);
}

.gold-price-panel__toggle-row--split {
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--sp-sm);

  .gold-price-panel__source {
    margin-left: auto;
  }
}

.gold-price-panel__source {
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

  a {
    color: var(--base-sub-color);
    text-decoration: underline;

    &:hover {
      color: var(--base-font-color);
    }
  }
}

// dashboard header ของ SectionCardGeneric ไม่ wrap และล็อก actions ไว้ที่ flex-shrink: 0
// จอแคบบรรทัดที่มาจึงล้นออกนอกกล่อง — override ฝั่งผู้ใช้งานให้ตกบรรทัดได้ (ไม่แก้ไฟล์ generic)
:deep(.section-dashboard-header) {
  flex-wrap: wrap;
}

:deep(.section-dashboard-header__actions) {
  flex-shrink: 1;
  min-width: 0;
  margin-left: auto;
}

.gold-price-panel__foot-note {
  text-align: center;
  font-size: var(--fs-sm);
  color: var(--base-sub-color);
  margin: var(--sp-sm) 0 0;
}

.gold-price-panel__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--sp-md);
  padding: var(--sp-2xl) var(--sp-lg);
  text-align: center;
}

.gold-price-panel__empty-icon {
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

.gold-price-panel__empty-title {
  font-weight: 700;
  font-size: var(--fs-lg);
  color: var(--base-font-color);
}

.gold-price-panel__empty-hint {
  font-size: var(--fs-base);
  color: var(--base-sub-color);
}
</style>
