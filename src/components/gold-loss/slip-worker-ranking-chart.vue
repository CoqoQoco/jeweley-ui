<!--
  slip-worker-ranking-chart — กราฟ "อันดับ Loss ต่อช่าง" สกัดจาก
  gold-loss-dashboard/components/overview-tab-view.vue เป็น shared component (props-driven, ไม่ fetch เอง)
  ใช้ร่วมกันทั้ง gold-loss-dashboard (ต้นทาง) และหน้าภาพรวมผู้บริหาร /executive

  Props:
    tangRows   — Array ของ row ที่ normalize แล้ว (shape กลาง) ฝั่งช่างแต่ง — ช่วงที่จะจัดอันดับ (caller กรองมาก่อนแล้วถ้าต้องการ)
    setterRows — Array shape เดียวกัน ฝั่งช่างฝัง
    dept       — 'tang' | 'setter' — แผนกที่กำลังแสดงอยู่ (v-model:dept)

  Slots:
    #controls — ตัวควบคุมเพิ่มเติม (เช่น range toggle เดือนนี้/3 เดือนฝั่ง executive) วางแถวเดียวกับ dept
                toggle ก่อนเกณฑ์ในใบชิดขวา — ไม่ใส่ก็ไม่มีอะไรเปลี่ยนจากเดิม (gold-loss-dashboard ไม่ใช้ slot นี้)

  Emits: update:dept
-->
<template>
  <SectionCardGeneric :title="$t('view.production.goldLossDashboard.overview.chartSlipByWorkerTitle')" icon="bi-people" accent="green" headerStyle="legend">
    <div class="slip-dept-toggle-row">
      <span class="title-text">{{ $t('view.production.goldLossDashboard.overview.slipDeptLabel') }}</span>
      <ToggleGroupGeneric
        :modelValue="dept"
        :options="deptOptions"
        :ariaLabel="$t('view.production.goldLossDashboard.overview.slipDeptLabel')"
        @update:modelValue="$emit('update:dept', $event)"
      />
      <slot name="controls"></slot>
      <span class="slip-dept-toggle-row__threshold">
        <span class="goal-legend-tick"></span>{{ $t('view.production.goldLossDashboard.overview.slipAllowedLegend', { percent: thresholdLabel }) }}
      </span>
    </div>
    <ChartGeneric type="bar" :series="series" :options="options" :height="chartHeight" :emptyText="$t('common.label.noData')" />
  </SectionCardGeneric>
</template>

<script>
import {
  buildDeptKpi,
  buildWorkerRankingRows,
  calcWorkerRankingChartHeight,
  calcWorkerRankingXaxisMax,
  formatDecimalTH,
  formatPercentTH
} from '@/services/utils/gold-loss/slip-monthly-helpers.js'
import { CHART_TOKENS } from '@/services/utils/chart-colors.js'

import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import ChartGeneric from '@/components/prime-vue/ChartGeneric.vue'
import ToggleGroupGeneric from '@/components/generic/ToggleGroupGeneric.vue'

// จำนวนช่างสูงสุดที่แสดงเป็นแท่ง (สีเดียวไม่ชนกัน แต่แท่งเยอะเกินไปจะอ่านยาก) ที่เหลือรวมเป็น "อื่นๆ"
const MAX_WORKER_BARS = 12
// ความสูงกราฟต่อ 1 แท่ง (px) — ใช้คำนวณความสูงรวมให้พอดีกับจำนวนช่าง
const WORKER_BAR_MIN_HEIGHT = 200
const WORKER_BAR_ROW_HEIGHT = 34

export default {
  name: 'SlipWorkerRankingChart',

  components: {
    SectionCardGeneric,
    ChartGeneric,
    ToggleGroupGeneric
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
    dept: {
      type: String,
      required: true,
      validator: (v) => ['tang', 'setter'].includes(v)
    }
  },

  emits: ['update:dept'],

  computed: {
    deptOptions() {
      return [
        { value: 'tang', label: this.$t('view.production.goldLossDashboard.overview.slipDeptTang') },
        { value: 'setter', label: this.$t('view.production.goldLossDashboard.overview.slipDeptSetter') }
      ]
    },

    selectedDeptRows() {
      return this.dept === 'tang' ? this.tangRows : this.setterRows
    },

    selectedDeptColor() {
      return this.dept === 'tang' ? CHART_TOKENS.primary : CHART_TOKENS.green
    },

    thresholdLabel() {
      const percent = buildDeptKpi(this.selectedDeptRows).thresholdPercent
      return percent != null ? formatPercentTH(percent) : '—'
    },

    rankingRows() {
      const otherLabel = this.$t('view.production.goldLossDashboard.overview.otherWorkersLabel')
      return buildWorkerRankingRows(this.selectedDeptRows, { maxBars: MAX_WORKER_BARS, otherLabel })
    },

    // ให้ ChartGeneric แสดง empty state ได้ถูกต้องเมื่อไม่มีช่างเลย — data point เป็น {x,y,goals} object
    // (goals ใส่เฉพาะตอน allowed > 0 กันเส้นยอมให้โผล่ตอนไม่มีเกณฑ์)
    series() {
      const goalName = this.$t('view.production.goldLossDashboard.overview.chartGoalAllowedLoss')
      return [
        {
          name: this.$t('view.production.goldLossDashboard.overview.colLoss'),
          data: this.rankingRows.map((r) => {
            const point = { x: r.label, y: r.loss }
            if (r.allowed > 0) {
              point.goals = [
                {
                  name: goalName,
                  value: r.allowed,
                  strokeWidth: 3,
                  strokeHeight: 14,
                  strokeColor: CHART_TOKENS.sub
                }
              ]
            }
            return point
          })
        }
      ]
    },

    chartHeight() {
      return calcWorkerRankingChartHeight(this.rankingRows, { minHeight: WORKER_BAR_MIN_HEIGHT, rowHeight: WORKER_BAR_ROW_HEIGHT })
    },

    xaxisMax() {
      return calcWorkerRankingXaxisMax(this.rankingRows)
    },

    options() {
      return {
        chart: { type: 'bar', stacked: false, toolbar: { show: false } },
        colors: [this.selectedDeptColor],
        plotOptions: {
          bar: { horizontal: true, borderRadius: 4, barHeight: '65%', dataLabels: { position: 'top' } }
        },
        // label วางที่ปลายแท่ง (position: 'top' ด้านบน) แล้วดันออกด้วย offsetX บวกให้พ้นแท่ง — สีเข้มกลาง
        // (CHART_TOKENS.sub) แทนสีเดียวกับแท่งเพื่อให้อ่านออกตอนอยู่นอกแท่ง
        dataLabels: {
          enabled: true,
          formatter: (v) => `${formatDecimalTH(v)} ${this.$t('view.production.goldLossByStage.unitGram')}`,
          style: { fontSize: '12px', fontWeight: 600, colors: [CHART_TOKENS.sub] },
          offsetX: 40
        },
        // gotcha ApexCharts: horizontal bar สลับ "แกนไหนรับ formatter" กับที่ชื่อ prop บอกไว้ —
        // xaxis ยังคือแกนตัวเลข (loss) ที่ต้อง format/กำหนด max ที่นี่ ส่วนชื่อช่างมาจาก data point {x,y,goals}
        // แทน xaxis.categories (ตัดออกแล้วเพราะใช้ data point object แทน)
        xaxis: {
          max: this.xaxisMax,
          title: { text: this.$t('view.production.goldLossByStage.unitGram') },
          labels: { formatter: (v) => formatDecimalTH(v) }
        },
        yaxis: {
          labels: { style: { fontSize: '12px' } }
        },
        grid: { xaxis: { lines: { show: true } } },
        tooltip: {
          y: {
            formatter: (value, opts) => {
              const dataPointIndex = opts && typeof opts.dataPointIndex === 'number' ? opts.dataPointIndex : -1
              const row = this.rankingRows[dataPointIndex]
              if (!row) return `${formatDecimalTH(value)} ${this.$t('view.production.goldLossByStage.unitGram')}`
              return this.$t('view.production.goldLossDashboard.overview.chartRankingTooltip', {
                loss: `${formatDecimalTH(row.loss)} ${this.$t('view.production.goldLossByStage.unitGram')}`,
                allowed: `${formatDecimalTH(row.allowed)} ${this.$t('view.production.goldLossByStage.unitGram')}`,
                percent: row.thresholdPercent != null ? formatPercentTH(row.thresholdPercent) : '—'
              })
            }
          }
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.slip-dept-toggle-row {
  display: flex;
  align-items: center;
  gap: var(--sp-sm);
  margin-bottom: var(--sp-md);

  .title-text {
    white-space: nowrap;
    font-weight: 600;
    color: var(--base-font-color);
  }
}

.slip-dept-toggle-row__threshold {
  margin-left: auto;
  font-size: var(--fs-sm);
  color: var(--base-sub-color);
  white-space: nowrap;
}

.goal-legend-tick {
  display: inline-block;
  width: 3px;
  height: 14px;
  background: var(--base-sub-color);
  vertical-align: middle;
  margin-right: var(--sp-xs);
}
</style>
