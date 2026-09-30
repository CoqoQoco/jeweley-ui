<!--
  wip-trend-card — การ์ดเล็ก 1 ใบใน grid "พัฒนาการงานค้างแยกแผนก" (wip-trend-panel.vue) — ชื่อแผนก/รวม +
  "ต้นช่วง {start} → ปลายช่วง {end}" + delta chip (▲ เพิ่ม=แดง / ▼ ลด=เขียว / ± 0=เทา) + sparkline พร้อม
  จุด+ป้ายค่าที่ต้นช่วง/ปลายช่วง เส้นประระดับต้นช่วง tooltip ทุกจุด และคำอธิบายแกน x ใต้กราฟ ให้แผนภูมิ
  self-explanatory โดยไม่ต้องมีแกนจริง — กดได้ (StatCard-like hover + keyboard accessible) เพื่อเลือกแผนก
  ไปแสดงในกราฟรายละเอียด (การ์ดที่เลือกอยู่มีแท็ก "กำลังดูรายละเอียด ↓" เสริมจากกรอบสีแดงเข้ม)

  Props:
    card       — { key, label, startWip, endWip, delta, deltaPercent, series: [{ bucketEnd, wip }] } (required)
    selected   — Boolean (false)
    bucket     — 'week'|'month' (default 'week') — กำหนดรูปแบบวันที่ใน tooltip/แกน x (DD/MM หรือ YYYY-MM)
    rangeStart — Date (required) — ต้นช่วงจริงที่เลือก ใช้เติมจุดสังเคราะห์หน้าสุดของ sparkline ให้จุดแรก
                 ในกราฟ = ตัวเลข "ต้นช่วง" เป๊ะ (series[0] จาก backend คือสิ้นสุด bucket แรก ไม่ใช่ต้นช่วงจริง)
-->
<template>
  <div
    class="wip-trend-card"
    :class="{ 'wip-trend-card--selected': selected }"
    role="button"
    tabindex="0"
    @click="$emit('select')"
    @keydown.enter="$emit('select')"
    @keydown.space.prevent="$emit('select')"
  >
    <div class="wip-trend-card__title">{{ card.label }}</div>
    <div class="wip-trend-card__range">{{ rangeText }}</div>
    <div class="wip-trend-card__delta" :style="{ color: deltaColor }">
      <i :class="['bi', deltaIcon]"></i>
      {{ deltaText }}
    </div>
    <ChartGeneric type="area" :series="sparklineSeries" :options="sparklineOptions" :height="56" />
    <div class="wip-trend-card__axis-caption">{{ axisCaption }}</div>
    <span v-if="selected" class="wip-trend-card__selected-tag">
      <i class="bi bi-arrow-down-short"></i>
      {{ $t('view.productionInsight.wip.trendCardSelectedTag') }}
    </span>
  </div>
</template>

<script>
import { CHART_TOKENS } from '@/services/utils/chart-colors.js'
import {
  resolveDeltaVariant,
  resolveDeltaColorToken,
  resolveDeltaIcon,
  formatDeltaText,
  formatSparklineBucketDate,
  isSparklineEdgePoint,
  buildSparklineDiscreteMarkers,
  prependRangeStartPoint
} from './wip-trend-helpers.js'

import ChartGeneric from '@/components/prime-vue/ChartGeneric.vue'

export default {
  name: 'WipTrendCard',

  components: {
    ChartGeneric
  },

  props: {
    // { key, label, startWip, endWip, delta, deltaPercent, series: [{ bucketEnd, wip }] }
    card: {
      type: Object,
      required: true
    },
    selected: {
      type: Boolean,
      default: false
    },
    bucket: {
      type: String,
      default: 'week'
    },
    rangeStart: {
      type: Date,
      required: true
    }
  },

  emits: ['select'],

  computed: {
    deltaVariant() {
      return resolveDeltaVariant(this.card.delta)
    },

    deltaColor() {
      return resolveDeltaColorToken(this.deltaVariant)
    },

    deltaIcon() {
      return resolveDeltaIcon(this.deltaVariant)
    },

    deltaText() {
      return formatDeltaText(this.card.delta, this.card.deltaPercent)
    },

    rangeText() {
      return this.$t('view.productionInsight.wip.trendCardRange', {
        start: this.formatNumber(this.card.startWip),
        end: this.formatNumber(this.card.endWip)
      })
    },

    // เติมจุดสังเคราะห์ต้นช่วง (bucketEnd=rangeStart, wip=startWip) หน้าสุดเสมอ — series ดิบจาก backend
    // ตัวแรกคือ "สิ้นสุด bucket แรก" ไม่ใช่ต้นช่วงจริง ทำให้จุดแรกที่โชว์ไม่ตรงกับเลข "ต้นช่วง" บนการ์ด
    series() {
      return prependRangeStartPoint(this.card.series, this.rangeStart, this.card.startWip)
    },

    sparklineSeries() {
      return [{ data: this.series.map((p) => p.wip || 0) }]
    },

    sparklineOptions() {
      const length = this.series.length
      const hasBaseline = Number.isFinite(this.card.startWip)
      return {
        chart: { sparkline: { enabled: true } },
        stroke: { width: 2, curve: 'smooth' },
        colors: [CHART_TOKENS.sub],
        fill: { opacity: 0.15 },
        legend: { show: false },
        markers: {
          size: 0,
          discrete: buildSparklineDiscreteMarkers(length, CHART_TOKENS.sub)
        },
        // grid.padding กันป้ายค่าโดนตัดที่ขอบ SVG (ขวา = เลขหลักพันกว้าง, บน = จุดที่ค่าสูงสุดอยู่ขอบบน) —
        // ค่าต่ำสุดตามที่วัดจริงบนจอ: top 14 / right 24 / left 16
        grid: {
          padding: { top: 14, right: 24, left: 16 }
        },
        dataLabels: {
          enabled: true,
          offsetY: -8,
          style: { fontSize: '9px', colors: [CHART_TOKENS.sub] },
          background: { enabled: false },
          formatter: (val, opts) => (isSparklineEdgePoint(opts.dataPointIndex, length) ? this.formatNumber(val) : '')
        },
        annotations: hasBaseline
          ? { yaxis: [{ y: this.card.startWip, borderColor: CHART_TOKENS.border, strokeDashArray: 4, borderWidth: 1 }] }
          : {},
        tooltip: {
          enabled: true,
          x: { show: false },
          y: { formatter: (val, opts) => this.tooltipTextForPoint(opts.dataPointIndex, val) }
        }
      }
    },

    axisCaption() {
      if (!this.series.length) return ''
      const first = formatSparklineBucketDate(this.series[0].bucketEnd, this.bucket)
      const last = formatSparklineBucketDate(this.series[this.series.length - 1].bucketEnd, this.bucket)
      const unitKey = this.bucket === 'month' ? 'bucketMonthly' : 'bucketWeekly'
      return `${first} … ${last} · ${this.$t(`view.productionInsight.wip.${unitKey}`)}`
    }
  },

  methods: {
    formatNumber(value) {
      return new Intl.NumberFormat('th-TH').format(value || 0)
    },

    tooltipTextForPoint(dataPointIndex, val) {
      const point = this.series[dataPointIndex]
      if (!point) return ''
      const dateText = formatSparklineBucketDate(point.bucketEnd, this.bucket)
      if (point.isSynthetic) {
        return this.$t('view.productionInsight.wip.trendPointStart', { date: dateText })
      }
      const key = this.bucket === 'month' ? 'trendPointMonth' : 'trendPointWeek'
      return this.$t(`view.productionInsight.wip.${key}`, { date: dateText, wip: this.formatNumber(val) })
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/mixin.scss';

.wip-trend-card {
  @include card-base;
  height: 100%;
  min-width: 0;
  display: flex;
  flex-direction: column;
  padding: var(--sp-md);
  cursor: pointer;
  transition: box-shadow 0.15s ease, transform 0.15s ease, border-color 0.15s ease;

  &:hover,
  &:focus-visible {
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
  }

  &:focus-visible {
    outline: 2px solid var(--base-font-color);
    outline-offset: 2px;
  }

  &--selected {
    border-color: var(--base-font-color);
    box-shadow: var(--shadow-md);
  }
}

.wip-trend-card__title {
  font-size: var(--fs-sm);
  font-weight: 700;
  color: var(--base-font-color);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.wip-trend-card__range {
  font-size: var(--fs-sm);
  color: var(--base-sub-color);
  margin-top: 2px;
}

.wip-trend-card__delta {
  display: flex;
  align-items: center;
  gap: var(--sp-xs);
  font-size: var(--fs-base);
  font-weight: 700;
  margin-top: var(--sp-xs);
}

.wip-trend-card__axis-caption {
  margin-top: var(--sp-xs);
  font-size: var(--fs-sm);
  color: var(--base-sub-color);
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.wip-trend-card__selected-tag {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-xs);
  align-self: flex-start;
  margin-top: var(--sp-xs);
  padding: 2px var(--sp-sm);
  border-radius: var(--radius-lg);
  background: var(--base-font-color);
  color: var(--on-inverse);
  font-size: var(--fs-sm);
  font-weight: 700;
}
</style>
