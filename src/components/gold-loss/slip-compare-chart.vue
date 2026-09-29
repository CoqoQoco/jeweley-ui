<!--
  slip-compare-chart — กราฟ "เทียบ Loss รายเดือน: ช่างแต่ง vs ช่างฝัง" สกัดจาก
  gold-loss-dashboard/components/overview-tab-view.vue เป็น shared component (props-driven, ไม่ fetch เอง)
  ใช้ร่วมกันทั้ง gold-loss-dashboard (ต้นทาง) และหน้าภาพรวมผู้บริหาร /executive

  Props:
    tangRows   — Array ของ row ที่ normalize แล้ว (shape กลาง {workerCode, year, month, issued, loss, allowed, allowedBase, ...})
    setterRows — Array shape เดียวกัน ฝั่งช่างฝัง
    monthKeys  — Array<string> ของ 'YYYY-MM' เรียงตามลำดับที่จะแสดงบนแกน x (caller เป็นคนกำหนดช่วง)
-->
<template>
  <SectionCardGeneric :title="$t('view.production.goldLossDashboard.overview.chartSlipCompareTitle')" icon="bi-bar-chart-line" accent="green" headerStyle="legend">
    <ChartGeneric type="line" :series="series" :options="options" :height="360" :emptyText="$t('common.label.noData')" />
  </SectionCardGeneric>
</template>

<script>
import { aggregateMonthlyTotals, computeLossPercent, computeThresholdPercent, roundDecimal, formatDecimalTH } from '@/services/utils/gold-loss/slip-monthly-helpers.js'
import { formatYearMonth } from '@/services/utils/dayjs.js'
import { CHART_TOKENS } from '@/services/utils/chart-colors.js'

import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import ChartGeneric from '@/components/prime-vue/ChartGeneric.vue'

export default {
  name: 'SlipCompareChart',

  components: {
    SectionCardGeneric,
    ChartGeneric
  },

  props: {
    tangRows: {
      type: Array,
      default: () => []
    },
    setterRows: {
      type: Array,
      default: () => []
    },
    monthKeys: {
      type: Array,
      default: () => []
    }
  },

  computed: {
    tangMonthlyTotals() {
      return aggregateMonthlyTotals(this.tangRows)
    },

    setterMonthlyTotals() {
      return aggregateMonthlyTotals(this.setterRows)
    },

    // เดือนที่ไม่มีใบของแผนกนั้น (ไม่มีแถว หรือ issued = 0) ให้ %loss/เกณฑ์เป็น null ไม่ใช่ 0 กันเส้นดิ่งลง 0% หลอกตา
    series() {
      const tangLabel = this.$t('view.production.goldLossDashboard.overview.slipDeptTang')
      const setterLabel = this.$t('view.production.goldLossDashboard.overview.slipDeptSetter')

      const tangLossData = this.monthKeys.map((k) => roundDecimal((this.tangMonthlyTotals.get(k) || {}).loss || 0))
      const setterLossData = this.monthKeys.map((k) => roundDecimal((this.setterMonthlyTotals.get(k) || {}).loss || 0))

      const tangPctData = this.monthKeys.map((k) => {
        const row = this.tangMonthlyTotals.get(k)
        return row && row.issued > 0 ? computeLossPercent(row.loss, row.issued) : null
      })
      const setterPctData = this.monthKeys.map((k) => {
        const row = this.setterMonthlyTotals.get(k)
        return row && row.issued > 0 ? computeLossPercent(row.loss, row.issued) : null
      })
      const tangThresholdData = this.monthKeys.map((k) => {
        const row = this.tangMonthlyTotals.get(k)
        return row && row.issued > 0 ? computeThresholdPercent(row.allowed, row.allowedBase) : null
      })
      const setterThresholdData = this.monthKeys.map((k) => {
        const row = this.setterMonthlyTotals.get(k)
        return row && row.issued > 0 ? computeThresholdPercent(row.allowed, row.allowedBase) : null
      })

      return [
        { name: tangLabel, type: 'column', data: tangLossData },
        { name: setterLabel, type: 'column', data: setterLossData },
        {
          name: this.$t('view.production.goldLossDashboard.overview.chartSlipComparePctSeries', { dept: tangLabel }),
          type: 'line',
          data: tangPctData
        },
        {
          name: this.$t('view.production.goldLossDashboard.overview.chartSlipComparePctSeries', { dept: setterLabel }),
          type: 'line',
          data: setterPctData
        },
        {
          name: this.$t('view.production.goldLossDashboard.overview.chartSlipCompareThresholdSeries', { dept: tangLabel }),
          type: 'line',
          data: tangThresholdData
        },
        {
          name: this.$t('view.production.goldLossDashboard.overview.chartSlipCompareThresholdSeries', { dept: setterLabel }),
          type: 'line',
          data: setterThresholdData
        }
      ]
    },

    options() {
      const tangLabel = this.$t('view.production.goldLossDashboard.overview.slipDeptTang')
      const setterLabel = this.$t('view.production.goldLossDashboard.overview.slipDeptSetter')
      const pctTangName = this.$t('view.production.goldLossDashboard.overview.chartSlipComparePctSeries', { dept: tangLabel })
      const pctSetterName = this.$t('view.production.goldLossDashboard.overview.chartSlipComparePctSeries', { dept: setterLabel })
      const thresholdTangName = this.$t('view.production.goldLossDashboard.overview.chartSlipCompareThresholdSeries', { dept: tangLabel })
      const thresholdSetterName = this.$t('view.production.goldLossDashboard.overview.chartSlipCompareThresholdSeries', { dept: setterLabel })

      const series = this.series
      const weightValues = [...series[0].data, ...series[1].data]
      const pctValues = [...series[2].data, ...series[3].data, ...series[4].data, ...series[5].data].filter((v) => v !== null && v !== undefined)
      const weightMaxRaw = weightValues.length ? Math.max(...weightValues) : 0
      const pctMaxRaw = pctValues.length ? Math.max(...pctValues) : 0
      // ให้ทั้ง 2 แท่ง/4 เส้นใช้สเกลเดียวกัน (แม้แกนที่ซ่อนจะไม่แสดง) ไม่งั้นความสูงเทียบกันไม่ได้จริง
      const weightMax = weightMaxRaw > 0 ? Math.ceil(weightMaxRaw * 1.2) : undefined
      const pctMax = pctMaxRaw > 0 ? Math.ceil(pctMaxRaw * 1.2) : undefined

      const pctFormatter = (v) => (v === null || v === undefined ? '—' : `${Number(v).toFixed(2)}%`)

      return {
        chart: { stacked: false },
        colors: [CHART_TOKENS.primary, CHART_TOKENS.green, CHART_TOKENS.primary, CHART_TOKENS.green, CHART_TOKENS.primary, CHART_TOKENS.green],
        plotOptions: { bar: { columnWidth: '45%' } },
        fill: { opacity: [0.85, 0.85, 1, 1, 1, 1] },
        stroke: { width: [0, 0, 3, 3, 2, 2], dashArray: [0, 0, 0, 0, 6, 6], curve: 'smooth' },
        markers: { size: [0, 0, 4, 4, 4, 4], strokeWidth: 0 },
        xaxis: { categories: this.monthKeys.map((k) => this.formatMonthKeyLabel(k)) },
        yaxis: [
          {
            seriesName: tangLabel,
            min: 0,
            max: weightMax,
            title: { text: this.$t('view.production.goldLossByStage.unitGram') },
            labels: { formatter: (v) => formatDecimalTH(v) }
          },
          {
            seriesName: setterLabel,
            min: 0,
            max: weightMax,
            show: false
          },
          {
            seriesName: pctTangName,
            opposite: true,
            min: 0,
            max: pctMax,
            labels: { formatter: pctFormatter }
          },
          {
            seriesName: pctSetterName,
            opposite: true,
            min: 0,
            max: pctMax,
            show: false
          },
          {
            seriesName: thresholdTangName,
            opposite: true,
            min: 0,
            max: pctMax,
            show: false
          },
          {
            seriesName: thresholdSetterName,
            opposite: true,
            min: 0,
            max: pctMax,
            show: false
          }
        ],
        tooltip: {
          shared: true,
          y: {
            formatter: (value, opts) => {
              if (value === null || value === undefined) return '—'
              const seriesIndex = opts && typeof opts.seriesIndex === 'number' ? opts.seriesIndex : 0
              return seriesIndex <= 1 ? `${formatDecimalTH(value)} ${this.$t('view.production.goldLossByStage.unitGram')}` : `${Number(value).toFixed(2)}%`
            }
          }
        }
      }
    }
  },

  methods: {
    formatMonthKeyLabel(key) {
      const [y, m] = key.split('-').map(Number)
      return formatYearMonth(y, m)
    }
  }
}
</script>
