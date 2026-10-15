// trend-block-helpers.js — pure logic ของ TrendBlock: config ของ series/targetLine → series + ApexCharts options
// ห้าม import Vue/i18n — t ส่งเข้ามาเป็น param
import { CHART_TOKENS } from '@/services/utils/chart-colors.js'

export function formatChartValue(value, format = 'count') {
  if (format === 'money') {
    if (value === null || value === undefined) return '—'
    return `฿${new Intl.NumberFormat('th-TH', { maximumFractionDigits: 0 }).format(value)}`
  }
  if (format === 'percent') {
    if (value === null || value === undefined) return '—'
    return `${new Intl.NumberFormat('th-TH', { maximumFractionDigits: 1 }).format(value)}%`
  }
  if (value === null || value === undefined) return format === 'days' ? '—' : new Intl.NumberFormat('th-TH').format(0)
  const digits = format === 'days' ? 1 : 0
  return new Intl.NumberFormat('th-TH', { maximumFractionDigits: digits }).format(value)
}

// series ที่ผ่านเงื่อนไข visible(points) — ใช้ตัดชุดที่ไม่มีข้อมูลเลยออกพร้อม legend
// node.series = array หรือ function(ctx, points, t) → array (series ที่สร้างจากข้อมูล เช่น แท่งต่อแผนกที่ไม่ hardcode)
export function resolveSeriesDefs(node, points, ctx, t) {
  return typeof node.series === 'function' ? node.series(ctx, points, t) || [] : node.series || []
}

// ชื่อ series: s.name (ข้อความสำเร็จรูป) ชนะ s.label (i18n key)
export function seriesName(s, t) {
  return s.name ?? t(s.label)
}

export function resolveVisibleSeries(series, points) {
  return (series || []).filter((s) => (typeof s.visible === 'function' ? s.visible(points) : true))
}

// ค่าของ series ต่อจุด — field ตรงๆ หรือ value(point) · nullAs: undefined = เก็บ null เป็นช่องว่างของกราฟ (ไม่ coerce เป็น 0)
export function readSeriesData(s, points) {
  if (Array.isArray(s.data)) return s.data
  if (typeof s.data === 'function') return s.data(points)
  return (points || []).map((p) => {
    const raw = typeof s.value === 'function' ? s.value(p) : p?.[s.field]
    const value = raw === undefined ? null : raw
    const filled = value === null && s.nullAs !== undefined ? s.nullAs : value
    return s.negate && filled !== null ? -filled : filled
  })
}

export function buildTrendSeries(series, points, t) {
  return resolveVisibleSeries(series, points).map((s) => ({ name: seriesName(s, t), type: s.type || 'line', data: readSeriesData(s, points) }))
}

export function buildTrendOptions({ node, points, categories, ctx, t }) {
  const visible = resolveVisibleSeries(node.series, points)
  const format = node.yFormat || 'count'
  const hasSecondAxis = visible.some((s) => s.axis === 1)
  // series.format (count|days) ต่อชุด — ไม่ระบุ = node.yFormat · แกนอ่านจากชุดแรกของแกนนั้น
  const seriesFormat = (s) => s.format || format
  const tooltipFormatter = (fmt) => (v) => formatChartValue(node.tooltipAbs && v != null ? Math.abs(v) : v, fmt)
  const formatter = tooltipFormatter(format)
  const axisFormatter = (v) => formatChartValue(v, format)
  const axisTitle = (index) => (node.axisTitles && node.axisTitles[index] ? { title: { text: t(node.axisTitles[index]) } } : {})
  const axisFormatterOf = (s) => (v) => formatChartValue(v, seriesFormat(s))
  const firstOnAxis0 = visible.find((s) => (s.axis || 0) === 0) || visible[0]
  const firstOnAxis1 = visible.find((s) => s.axis === 1)
  const perSeriesTooltip = visible.some((s) => s.format)
  const anyDashed = visible.some((s) => s.dashed)
  const anyOpacity = visible.some((s) => s.opacity !== undefined)
  const target = node.targetLine && node.targetLine.value(ctx)

  const options = {
    chart: { type: node.chartType || 'line', stacked: !!node.stacked, toolbar: { show: false } },
    colors: visible.map((s) => s.colorValue || CHART_TOKENS[s.color || 'primary']),
    stroke: {
      width: visible.map((s) => (s.type === 'bar' ? 0 : s.dashed ? 2 : 3)),
      curve: 'smooth',
      ...(anyDashed ? { dashArray: visible.map((s) => (s.dashed ? 6 : 0)) } : {})
    },
    plotOptions: { bar: { columnWidth: node.columnWidth || '55%' } },
    xaxis: { categories },
    yaxis: hasSecondAxis
      ? // 1 รายการต่อ series (Apex จับคู่ตามลำดับ) — ชุดแรกของแต่ละแกนมี title/labels, ชุดที่เหลือแชร์แกนด้วย seriesName + ซ่อน
        visible.map((s) => {
          const axis = s.axis === 1 ? 1 : 0
          const first = axis === 1 ? firstOnAxis1 : firstOnAxis0
          const base = { seriesName: seriesName(first, t), ...(axis === 1 ? { opposite: true } : {}) }
          return first === s
            ? { ...base, ...axisTitle(axis), labels: { formatter: axisFormatterOf(first) } }
            : { ...base, show: false, labels: { formatter: axisFormatterOf(first) } }
        })
      : { ...(node.yMax != null ? { max: node.yMax } : {}), labels: { formatter: axisFormatter } },
    tooltip: { y: perSeriesTooltip ? visible.map((s) => ({ formatter: tooltipFormatter(seriesFormat(s)) })) : { formatter } },
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
