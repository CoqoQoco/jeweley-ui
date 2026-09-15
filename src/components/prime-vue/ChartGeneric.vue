<!--
  ChartGeneric — wrap global <apexchart> element พร้อม default options + loading/empty state
  ต้นแบบ: ticket-dashboard.vue (donut/bar/area) — merge default options + props.options (props ชนะ)

  ตัวอย่างการใช้งาน:
  <ChartGeneric
    type="donut"
    :series="donutSeries"
    :options="donutOptions"
    :height="380"
    :loading="isLoadingDashboard"
  />

  Props:
    type      — 'donut' | 'bar' | 'area' | 'line' | 'pie' (default 'donut')
    series    — Array (required) — apexcharts series (data point เป็นตัวเลขธรรมดาหรือ object {x,y,...} ก็ได้)
    options   — Object (default {}) — merge ทับ default options (props.options ชนะ)
    height    — Number|String (default 320)
    loading   — Boolean (default false) — แสดง spinner แทน chart
    emptyText — String (optional) — ข้อความ empty state (default = $t('common.label.noData'))

  Slots:
    #empty — override empty state (default: icon + emptyText)

  Default options merge เข้ากับ props.options:
    chart: { toolbar: { show: false } }
    colors: CHART_PALETTE (จาก chart-colors.js)
    dataLabels: { enabled: false }
    legend: { position: 'bottom', fontSize: '13px' }

  หมายเหตุ: `<apexchart>` ผูก `:key="chartKey"` (= `${type}-${heightPx}`) ตั้งใจ — vue3-apexcharts
  watch prop `height` แล้วเรียก `refresh()` (destroy + async re-init) พร้อมๆ กับที่ watcher ของ
  `options`/`series` เรียก `chart.value.updateOptions/updateSeries` บน instance ที่กำลังถูก destroy
  อยู่ ทำให้ throw `TypeError: Cannot read properties of null` และกราฟหายไปเฉยๆ — เปลี่ยน key เมื่อ
  height/type เปลี่ยนจึง remount component ใหม่ทั้งตัวแทนการแข่ง race ของ watcher เดิม
-->
<template>
  <div class="chart-generic-wrap">
    <div v-if="loading" class="chart-state chart-state--loading" :style="{ height: heightPx }">
      <i class="bi bi-arrow-repeat spin"></i>
    </div>
    <div v-else-if="isEmpty" class="chart-state chart-state--empty" :style="{ height: heightPx }">
      <slot name="empty">
        <i class="bi bi-inbox"></i>
        <span>{{ resolvedEmptyText }}</span>
      </slot>
    </div>
    <apexchart v-else :key="chartKey" :type="type" :height="height" :options="mergedOptions" :series="series" />
  </div>
</template>

<script>
import merge from 'lodash/merge'

import { CHART_PALETTE } from '@/services/utils/chart-colors.js'

export default {
  name: 'ChartGeneric',

  props: {
    type: {
      type: String,
      default: 'donut',
      validator: (v) => ['donut', 'bar', 'area', 'line', 'pie'].includes(v)
    },
    series: {
      type: Array,
      required: true
    },
    options: {
      type: Object,
      default: () => ({})
    },
    height: {
      type: [Number, String],
      default: 320
    },
    loading: {
      type: Boolean,
      default: false
    },
    emptyText: {
      type: String,
      default: ''
    }
  },

  computed: {
    heightPx() {
      return typeof this.height === 'number' ? `${this.height}px` : this.height
    },

    // เปลี่ยน key ทุกครั้งที่ type/height เปลี่ยน → บังคับ remount <apexchart> แทนให้ vue3-apexcharts
    // เรียก refresh() เอง (ดูหมายเหตุใน header comment ด้านบน)
    chartKey() {
      return `${this.type}-${this.heightPx}`
    },

    defaultOptions() {
      return {
        chart: { toolbar: { show: false } },
        colors: CHART_PALETTE,
        dataLabels: { enabled: false },
        legend: { position: 'bottom', fontSize: '13px' }
      }
    },

    mergedOptions() {
      return merge({}, this.defaultOptions, this.options)
    },

    isEmpty() {
      if (!this.series || this.series.length === 0) return true
      const total = this.series.reduce((sum, s) => {
        if (typeof s === 'number') return sum + s
        if (s && Array.isArray(s.data)) {
          // data point อาจเป็น object เช่น { x, y, goals } (ไม่ใช่ตัวเลขล้วน) — อ่าน .y ก่อนแปลงเป็นตัวเลข
          // มิฉะนั้น Number(objectทั้งก้อน) จะได้ NaN แล้วถูกตีความว่า series ว่างเปล่าทั้งที่มีข้อมูลจริง
          return sum + s.data.reduce((a, b) => {
            const val = b !== null && typeof b === 'object' ? b.y : b
            return a + (Number(val) || 0)
          }, 0)
        }
        return sum
      }, 0)
      return total === 0
    },

    resolvedEmptyText() {
      return this.emptyText || this.$t('common.label.noData')
    }
  }
}
</script>

<style lang="scss" scoped>
@keyframes chart-spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

.chart-generic-wrap {
  width: 100%;
}

.chart-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--sp-sm);
  color: var(--base-sub-color);
  font-size: var(--fs-base);

  i {
    font-size: 28px;
  }
}

.chart-state--loading i {
  color: var(--base-font-color);
  animation: chart-spin 0.8s linear infinite;
}
</style>
