<template>
  <div class="ticket-dashboard">
    <!-- Row A: header + period filter + KPI cards -->
    <div class="dashboard-header">
      <div class="dashboard-heading">
        <div class="dashboard-icon"><i class="bi bi-clipboard-data"></i></div>
        <div class="dashboard-heading-text">
          <span class="dashboard-title">{{ $t('view.ticket.dashboard.title') }}</span>
          <span class="dashboard-subtitle">{{ $t('view.ticket.dashboard.subtitle') }}</span>
        </div>
      </div>
      <div class="dashboard-controls">
        <DropdownGeneric
          :modelValue="selectedPeriod"
          :options="periodOptions"
          optionLabel="label"
          optionValue="value"
          @update:modelValue="onPeriodChange"
        />
        <ButtonGeneric variant="outline" icon="bi-arrow-clockwise" :title="$t('view.ticket.dashboard.refresh')" class="ml-2" @click="loadDashboard" />
      </div>
    </div>

    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-icon">
          <i class="bi bi-card-list"></i>
        </div>
        <div class="kpi-content">
          <div class="kpi-value">{{ summary.total }}</div>
          <div class="kpi-label">{{ $t('view.ticket.dashboard.kpi.total') }}</div>
        </div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon kpi-icon--warning">
          <i class="bi bi-hourglass-split"></i>
        </div>
        <div class="kpi-content">
          <div class="kpi-value">{{ (summary.open || 0) + (summary.inProgress || 0) }}</div>
          <div class="kpi-label">{{ $t('view.ticket.dashboard.kpi.pending') }}</div>
        </div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon kpi-icon--green">
          <i class="bi bi-check-circle"></i>
        </div>
        <div class="kpi-content">
          <div class="kpi-value">{{ summary.resolved }}</div>
          <div class="kpi-label">{{ $t('view.ticket.dashboard.kpi.resolved') }}</div>
        </div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon">
          <i class="bi bi-graph-up"></i>
        </div>
        <div class="kpi-content">
          <div class="kpi-value">{{ summary.resolvedRate }}%</div>
          <div class="kpi-label">{{ $t('view.ticket.dashboard.kpi.resolvedRate') }}</div>
        </div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon kpi-icon--grey">
          <i class="bi bi-search"></i>
        </div>
        <div class="kpi-content">
          <div class="kpi-value">{{ summary.unanalyzed }}</div>
          <div class="kpi-label">{{ $t('view.ticket.dashboard.kpi.unanalyzed') }}</div>
        </div>
      </div>
    </div>

    <!-- Row B: donut + horizontal bar (2 คอลัมน์) -->
    <div class="charts-row-b">
      <SectionCardGeneric
        :title="$t('view.ticket.dashboard.chart.byStatus')"
        icon="bi-pie-chart"
        accent="main"
        headerStyle="legend"
        class="donut-card"
      >
        <div class="donut-chart-wrap">
          <apexchart
            v-if="donutReady"
            type="donut"
            height="380"
            :options="donutOptions"
            :series="donutSeries"
          />
        </div>
        <div class="type-chips">
          <span class="type-chip chip-bug">
            <i class="bi bi-bug"></i>
            {{ $t('view.ticket.dashboard.type.bug') }}: {{ summary.bug }}
          </span>
          <span class="type-chip chip-feature">
            <i class="bi bi-stars"></i>
            {{ $t('view.ticket.dashboard.type.feature') }}: {{ summary.feature }}
          </span>
        </div>
      </SectionCardGeneric>

      <SectionCardGeneric
        :title="$t('view.ticket.dashboard.chart.byTopic')"
        icon="bi-bar-chart"
        accent="main"
        headerStyle="legend"
      >
        <apexchart
          v-if="barReady"
          type="bar"
          :height="barChartHeight"
          :options="barOptions"
          :series="barSeries"
        />
      </SectionCardGeneric>
    </div>

    <!-- Row C: trend + aging -->
    <div class="charts-row-c">
      <!-- Left: line trend -->
      <SectionCardGeneric
        :title="$t('view.ticket.dashboard.chart.trend')"
        icon="bi-graph-up"
        accent="green"
        headerStyle="legend"
      >
        <apexchart
          v-if="trendReady"
          type="area"
          height="220"
          :options="trendOptions"
          :series="trendSeries"
        />
      </SectionCardGeneric>

      <!-- Right: aging buckets -->
      <SectionCardGeneric
        :title="$t('view.ticket.dashboard.chart.aging')"
        icon="bi-hourglass-split"
        accent="green"
        headerStyle="legend"
        class="aging-card"
      >
        <div class="aging-grid">
          <div class="aging-bucket">
            <div class="aging-value">{{ aging.today }}</div>
            <div class="aging-label">{{ $t('view.ticket.dashboard.aging.today') }}</div>
          </div>
          <div class="aging-bucket">
            <div class="aging-value">{{ aging.days1To3 }}</div>
            <div class="aging-label">{{ $t('view.ticket.dashboard.aging.days1to3') }}</div>
          </div>
          <div class="aging-bucket">
            <div class="aging-value">{{ aging.days4To7 }}</div>
            <div class="aging-label">{{ $t('view.ticket.dashboard.aging.days4to7') }}</div>
          </div>
          <div class="aging-bucket" :class="{ 'aging-bucket--alert': aging.over7 > 0 }">
            <div class="aging-value" :class="{ 'aging-value--alert': aging.over7 > 0 }">{{ aging.over7 }}</div>
            <div class="aging-label">{{ $t('view.ticket.dashboard.aging.over7') }}</div>
          </div>
        </div>
      </SectionCardGeneric>
    </div>
  </div>
</template>

<script>
import { useTicketStore } from '@/stores/modules/api/ticket-store.js'
import dayjs from 'dayjs'

import DropdownGeneric from '@/components/prime-vue/DropdownGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'

// สี status ใช้ design token (mirror var จาก variable.scss) — apexcharts อ่าน CSS var ไม่ได้
const STATUS_COLORS = {
  1: '#fabc3f', // เปิด           → var(--status-open)
  2: '#921313', // กำลังดำเนินการ → var(--status-progress)
  3: '#038387', // แก้เสร็จ       → var(--status-resolved)
  4: '#393939', // ปิด            → var(--status-closed)
  5: '#ff4d4d'  // ยกเลิก         → var(--status-cancelled)
}

// apexcharts (canvas/SVG) อ่าน CSS var ไม่ได้ — ใช้ hex ที่ mirror design token
const TOKEN_PRIMARY = '#921313' // var(--base-font-color)
const TOKEN_GREEN = '#038387' // var(--base-green)

export default {
  name: 'TicketDashboard',

  components: {
    DropdownGeneric,
    ButtonGeneric,
    SectionCardGeneric
  },

  setup() {
    const ticketStore = useTicketStore()
    return { ticketStore }
  },

  data() {
    return {
      selectedPeriod: '30',
      summary: {
        total: 0,
        open: 0,
        inProgress: 0,
        resolved: 0,
        closed: 0,
        cancelled: 0,
        bug: 0,
        feature: 0,
        unanalyzed: 0,
        resolvedRate: 0
      },
      byStatus: [],
      byTopic: [],
      trend: [],
      aging: {
        today: 0,
        days1To3: 0,
        days4To7: 0,
        over7: 0
      }
    }
  },

  computed: {
    periodOptions() {
      return [
        { value: '7', label: this.$t('view.ticket.dashboard.period.days7') },
        { value: '30', label: this.$t('view.ticket.dashboard.period.days30') },
        { value: '90', label: this.$t('view.ticket.dashboard.period.days90') },
        { value: 'all', label: this.$t('view.ticket.dashboard.period.all') }
      ]
    },

    donutReady() {
      return this.byStatus.length > 0
    },

    barReady() {
      return this.byTopic.length > 0
    },

    trendReady() {
      return this.trend.length > 0
    },

    donutSeries() {
      return this.byStatus.map((s) => s.count)
    },

    donutOptions() {
      const unit = this.$t('view.ticket.dashboard.unit.items')
      return {
        chart: { type: 'donut', toolbar: { show: false } },
        labels: this.byStatus.map((s) => (this.$i18n.locale === 'en' ? s.nameEn : s.nameTh)),
        colors: this.byStatus.map((s) => STATUS_COLORS[s.statusId] || '#e0e0e0'),
        legend: {
          position: 'right',
          fontSize: '13px',
          itemMargin: { vertical: 6 },
          markers: { width: 12, height: 12, radius: 12 },
          formatter: (seriesName, opts) => {
            const value = opts.w.globals.series[opts.seriesIndex]
            const total = opts.w.globals.series.reduce((a, b) => a + b, 0)
            const pct = total ? Math.round((value / total) * 100) : 0
            return `${pct}% ${seriesName} (${value})`
          }
        },
        plotOptions: {
          pie: {
            customScale: 1.1,
            donut: {
              size: '70%',
              labels: {
                show: true,
                name: { fontSize: '13px' },
                value: { fontSize: '26px', fontWeight: 700, color: TOKEN_PRIMARY },
                total: {
                  show: true,
                  label: this.$t('common.label.all'),
                  fontSize: '13px',
                  formatter: (w) => `${w.globals.series.reduce((a, b) => a + b, 0)}`
                }
              }
            }
          }
        },
        dataLabels: { enabled: false },
        tooltip: {
          y: { formatter: (val) => `${val} ${unit}` }
        },
        responsive: [
          {
            breakpoint: 640,
            options: { legend: { position: 'bottom' } }
          }
        ]
      }
    },

    barChartHeight() {
      const minHeight = 160
      const perRow = 36
      return Math.max(minHeight, this.byTopic.length * perRow + 60)
    },

    barSeries() {
      return [
        {
          name: this.$t('view.ticket.dashboard.kpi.total'),
          data: this.byTopic.map((t) => t.count)
        }
      ]
    },

    barOptions() {
      return {
        chart: { type: 'bar', toolbar: { show: false } },
        plotOptions: {
          bar: { horizontal: true, borderRadius: 4, barHeight: '60%' }
        },
        colors: [TOKEN_PRIMARY],
        xaxis: {
          categories: this.byTopic.map((t) => t.topicName),
          labels: { style: { fontSize: '11px' } }
        },
        yaxis: {
          labels: { style: { fontSize: '11px' } }
        },
        dataLabels: {
          enabled: true,
          style: { fontSize: '11px', colors: ['#fff'] }
        },
        grid: { xaxis: { lines: { show: true } } },
        tooltip: {
          y: { formatter: (val) => `${val} ${this.$t('view.ticket.dashboard.unit.items')}` }
        }
      }
    },

    trendCategories() {
      return this.trend.map((t) => dayjs(t.date).format('DD/MM'))
    },

    trendSeries() {
      return [
        {
          name: this.$t('view.ticket.dashboard.legend.created'),
          data: this.trend.map((t) => t.created)
        },
        {
          name: this.$t('view.ticket.dashboard.legend.resolved'),
          data: this.trend.map((t) => t.resolved)
        }
      ]
    },

    trendOptions() {
      return {
        chart: { type: 'area', toolbar: { show: false }, zoom: { enabled: false } },
        colors: [TOKEN_PRIMARY, TOKEN_GREEN],
        fill: {
          type: 'gradient',
          gradient: { opacityFrom: 0.4, opacityTo: 0.05 }
        },
        stroke: { curve: 'smooth', width: 2 },
        xaxis: {
          categories: this.trendCategories,
          labels: { style: { fontSize: '11px' } }
        },
        yaxis: {
          min: 0,
          labels: { style: { fontSize: '11px' } }
        },
        legend: { position: 'top', fontSize: '12px' },
        dataLabels: { enabled: false },
        grid: { strokeDashArray: 3 },
        tooltip: {
          y: { formatter: (val) => `${val} ${this.$t('view.ticket.dashboard.unit.items')}` }
        }
      }
    }
  },

  mounted() {
    this.loadDashboard()
  },

  methods: {
    onPeriodChange(val) {
      this.selectedPeriod = val
      this.loadDashboard()
    },

    buildParams() {
      if (this.selectedPeriod === 'all') {
        return {}
      }
      const days = parseInt(this.selectedPeriod)
      const endDate = dayjs().endOf('day').toISOString()
      const startDate = dayjs().subtract(days - 1, 'day').startOf('day').toISOString()
      return { startDate, endDate }
    },

    async loadDashboard() {
      const res = await this.ticketStore.fetchDashboard(this.buildParams())
      if (!res) return

      this.summary = res.summary || this.summary
      this.byStatus = res.byStatus || []
      this.byTopic = res.byTopic || []
      this.trend = res.trend || []
      this.aging = res.aging || this.aging
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/mixin.scss';
@import '@/assets/scss/responsive-style/web';

.ticket-dashboard {
  margin-bottom: var(--sp-lg);
}

/* Header */
.dashboard-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--sp-lg);
  flex-wrap: wrap;
  gap: var(--sp-sm);
  border-bottom: 2px solid var(--base-font-color);
  padding-bottom: var(--sp-md);
}

.dashboard-heading {
  display: flex;
  align-items: center;
  gap: var(--sp-md);
}

.dashboard-icon {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md);
  background: var(--base-font-color);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  i {
    font-size: 22px;
    color: #fff;
  }
}

.dashboard-heading-text {
  display: flex;
  flex-direction: column;
}

.dashboard-title {
  font-size: var(--fs-xl);
  font-weight: 700;
  color: var(--base-font-color);
  line-height: var(--lh-sm);
}

.dashboard-subtitle {
  font-size: var(--fs-sm);
  color: var(--base-sub-color);
}

.dashboard-controls {
  display: flex;
  align-items: center;
}

/* KPI cards */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: var(--sp-md);
  margin-bottom: var(--sp-lg);

  @media (max-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (max-width: 600px) {
    grid-template-columns: repeat(2, 1fr);
  }
}

.kpi-card {
  @include card-base;
  padding: var(--sp-md) var(--sp-lg);
  display: flex;
  align-items: center;
  gap: var(--sp-md);
}

.kpi-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--base-font-color);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  i {
    font-size: 20px;
    color: #fff;
  }

  &--warning {
    background: var(--base-warning);
  }

  &--green {
    background: var(--base-green);
  }

  &--grey {
    background: var(--base-sub-color);
  }
}

.kpi-content {
  flex: 1;
  min-width: 0;
}

.kpi-value {
  font-size: var(--fs-xl);
  font-weight: 700;
  color: var(--base-font-color);
  line-height: var(--lh-sm);
}

.kpi-label {
  font-size: var(--fs-sm);
  color: var(--base-sub-color);
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Chart rows */
.charts-row-b,
.charts-row-c {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--sp-md);
  margin-bottom: var(--sp-md);

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
}

/* Bug/Feature chips */
.type-chips {
  display: flex;
  gap: var(--sp-sm);
  margin-top: var(--sp-sm);
  flex-wrap: wrap;
}

.type-chip {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-xs);
  padding: 3px var(--sp-sm);
  border-radius: var(--radius-sm);
  font-size: var(--fs-sm);
  font-weight: 600;

  &.chip-bug {
    background: var(--color-highlight-bg);
    color: var(--base-font-color);
  }

  &.chip-feature {
    background: var(--color-card-bg);
    color: var(--base-green);
    border: 1px solid var(--color-border);
  }
}

.donut-card {
  display: flex;
  flex-direction: column;
}

.donut-chart-wrap {
  width: 100%;
  max-width: 820px;
  margin: 0 auto;
}

/* Aging */
.aging-card {
  display: flex;
  flex-direction: column;
}

.aging-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--sp-sm);
  flex: 1;
  align-items: center;

  @media (max-width: 600px) {
    grid-template-columns: repeat(2, 1fr);
  }
}

.aging-bucket {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--sp-md);
  border-radius: var(--radius-md);
  background: var(--color-card-bg);
  border: 1px solid var(--color-border);
  text-align: center;

  &--alert {
    background: var(--color-highlight-bg);
    border-color: var(--base-red);
  }
}

.aging-value {
  font-size: var(--fs-xl);
  font-weight: 700;
  color: var(--base-font-color);
  line-height: 1;

  &--alert {
    color: var(--base-red);
  }
}

.aging-label {
  font-size: var(--fs-sm);
  color: var(--base-sub-color);
  margin-top: var(--sp-xs);
}
</style>
