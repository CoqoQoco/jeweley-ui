// trend-block-helpers.js — pure logic ของ TrendBlock: config ของ series/targetLine → series + ApexCharts options
// ห้าม import Vue/i18n — t ส่งเข้ามาเป็น param
import { CHART_TOKENS } from '@/services/utils/chart-colors.js'

export function formatChartValue(value, format = 'count') {
  if (value === null || value === undefined) return format === 'days' ? '—' : new Intl.NumberFormat('th-TH').format(0)
  const digits = format === 'days' ? 1 : 0
  return new Intl.NumberFormat('th-TH', { maximumFractionDigits: digits }).format(value)
}

// series ที่ผ่านเงื่อนไข visible(points) — ใช้ตัดชุดที่ไม่มีข้อมูลเลยออกพร้อม legend
export function resolveVisibleSeries(series, points) {
  return (series || []).filter((s) => (typeof s.visible === 'function' ? s.visible(points) : true))
}

// ค่าของ series ต่อจุด — field ตรงๆ หรือ value(point) · nullAs: undefined = เก็บ null เป็นช่องว่างของกราฟ (ไม่ coerce เป็น 0)
export function readSeriesData(s, points) {
  return (points || []).map((p) => {
    const raw = typeof s.value === 'function' ? s.value(p) : p?.[s.field]
    const value = raw === undefined ? null : raw
    const filled = value === null && s.nullAs !== undefined ? s.nullAs : value
    return s.negate && filled !== null ? -filled : filled
  })
}

export function buildTrendSeries(series, points, t) {
  return resolveVisibleSeries(series, points).map((s) => ({ name: t(s.label), type: s.type || 'line', data: readSeriesData(s, points) }))
}

export function buildTrendOptions({ node, points, categories, ctx, t }) {
  const visible = resolveVisibleSeries(node.series, points)
  const format = node.yFormat || 'count'
  const hasSecondAxis = visible.some((s) => s.axis === 1)
  const formatter = (v) => formatChartValue(node.tooltipAbs && v != null ? Math.abs(v) : v, format)
  const axisFormatter = (v) => formatChartValue(v, format)
  const anyDashed = visible.some((s) => s.dashed)
  const anyOpacity = visible.some((s) => s.opacity !== undefined)
  const target = node.targetLine && node.targetLine.value(ctx)

  const options = {
    chart: { type: 'line', stacked: !!node.stacked, toolbar: { show: false } },
    colors: visible.map((s) => CHART_TOKENS[s.color || 'primary']),
    stroke: {
      width: visible.map((s) => (s.type === 'bar' ? 0 : s.dashed ? 2 : 3)),
      curve: 'smooth',
      ...(anyDashed ? { dashArray: visible.map((s) => (s.dashed ? 6 : 0)) } : {})
    },
    plotOptions: { bar: { columnWidth: '55%' } },
    xaxis: { categories },
    yaxis: hasSecondAxis
      ? [
          { seriesName: t(visible[0].label), labels: { formatter: axisFormatter } },
          { seriesName: t(visible.find((s) => s.axis === 1).label), opposite: true, labels: { formatter: axisFormatter } }
        ]
      : { labels: { formatter: axisFormatter } },
    tooltip: { y: { formatter } },
    annotations:
      Number.isFinite(target)
        ? {
            yaxis: [
              {
                y: target,
                borderColor: CHART_TOKENS.red,
                strokeDashArray: 4,
                borderWidth: 1,
                label: { text: t(node.targetLine.label), style: { color: CHART_TOKENS.red, background: 'transparent' } }
              }
            ]
          }
        : {}
  }
  if (anyOpacity) options.fill = { opacity: visible.map((s) => s.opacity ?? 1) }
  return options
}
