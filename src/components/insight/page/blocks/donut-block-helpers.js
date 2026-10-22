// donut-block-helpers.js — pure logic ของ DonutBlock (โดนัทกลาง): slices[{ label, value, color }] → series/options ของ ChartGeneric
// ApexCharts donut ต้องกำหนด height เป็นตัวเลข px เสมอ (ห้าม %) · สีมาจาก CHART_TOKENS (mirror design token) · legend ล่างบอกค่าและ %
import { formatChartValue, resolveColorSpec } from './chart-shared.js'

export const DONUT_DEFAULT_HEIGHT = 280

// ค่าที่ไม่ใช่ตัวเลข/ติดลบ = 0 · ค่าทุกตัวเป็น 0 = series ว่าง (ChartGeneric โชว์ empty state)
export function normalizeSlices(slices) {
  return (slices || []).map((slice, index) => ({
    label: slice.label,
    value: Math.max(Number(slice.value) || 0, 0),
    color: resolveColorSpec(slice.color, index)
  }))
}

export function sumSlices(slices) {
  return slices.reduce((sum, slice) => sum + slice.value, 0)
}

// center.label = i18n key หรือ function(ctx, t, total) · center.value = function(total) → ข้อความกลางวง (ไม่ระบุ = ยอดรวมตาม valueFormat)
function centerLabel(center, t, ctx, total) {
  return typeof center.label === 'function' ? center.label(ctx, t, total) : t(center.label)
}

function centerValue(center, total, format) {
  return typeof center.value === 'function' ? center.value(total) : formatChartValue(total, format)
}

export function buildDonutChart(node, slices, t, ctx) {
  const normalized = normalizeSlices(slices)
  const total = sumSlices(normalized)
  const format = node.valueFormat || 'count'
  const values = normalized.map((slice) => slice.value)

  const donutLabels = node.center
    ? {
        show: true,
        name: { show: true, fontSize: '13px' },
        value: { show: true, fontSize: '20px', fontWeight: 700, formatter: (val) => formatChartValue(val, format) },
        total: { show: true, showAlways: true, label: centerLabel(node.center, t, ctx, total), formatter: () => centerValue(node.center, total, format) }
      }
    : { show: false }

  // node.onSliceClick(index, ctx) — คลิกชิ้นโดนัท (optional)
  const events = node.onSliceClick && ctx ? { dataPointSelection: (event, chartContext, config) => node.onSliceClick(config.dataPointIndex, ctx) } : undefined
  const options = {
    ...(events ? { chart: { events } } : {}),
    labels: normalized.map((slice) => t(slice.label)),
    colors: normalized.map((slice) => slice.color),
    dataLabels: { enabled: true, formatter: (val) => `${Number(val).toFixed(1)}%` },
    legend: {
      position: 'bottom',
      formatter: (name, opts) => {
        const value = values[opts.seriesIndex] || 0
        const percent = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0'
        return `${name}: ${formatChartValue(value, format)} (${percent}%)`
      }
    },
    plotOptions: { pie: { donut: { labels: donutLabels } } },
    tooltip: { y: { formatter: (val) => formatChartValue(val, format) } }
  }
  const height = Number(node.height) > 0 ? Number(node.height) : DONUT_DEFAULT_HEIGHT
  return { series: total > 0 ? values : [], options, height, total }
}
