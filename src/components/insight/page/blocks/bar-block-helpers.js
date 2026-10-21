// bar-block-helpers.js — pure logic ของ BarBlock (แท่งกลาง: แนวตั้ง/แนวนอน, ซ้อน/เทียบ): rows + series[{ label, value(row), color }] → series/options
// ความสูงเป็นตัวเลข px — แนวนอนโตตามจำนวนแถว (rowHeight) · สีจาก CHART_TOKENS · tooltip/แกน คั่นหลักพัน
import { formatChartValue, resolveColorSpec } from './chart-shared.js'

export const BAR_DEFAULT_HEIGHT = 300

export function resolveBarHeight(node, rowCount) {
  if (Number(node.height) > 0) return Number(node.height)
  if (!node.horizontal) return BAR_DEFAULT_HEIGHT
  return Math.max(node.minHeight || 200, rowCount * (node.rowHeight || 36) + (node.pad ?? 70))
}

export function buildBarChart(node, rows, ctx, t) {
  const format = node.valueFormat || 'count'
  const seriesDefs = node.series || []
  const series = seriesDefs.map((def) => ({ name: t(def.label), data: rows.map((row) => Number(def.value(row, ctx)) || 0) }))
  const colors = seriesDefs.map((def, index) => resolveColorSpec(def.color, index))
  const categories = rows.map((row) => node.category(row, ctx, t))
  const formatter = (val) => formatChartValue(val, format)

  const options = {
    chart: { type: 'bar', stacked: !!node.stacked, toolbar: { show: false } },
    colors,
    plotOptions: { bar: { horizontal: !!node.horizontal, borderRadius: 4, ...(node.bar || {}) } },
    dataLabels: { enabled: node.dataLabels === true, formatter, style: { fontSize: '11px', fontWeight: 600 } },
    xaxis: { categories, ...(node.horizontal ? { labels: { formatter } } : {}) },
    yaxis: node.horizontal ? {} : { labels: { formatter } },
    legend: { position: 'bottom', show: seriesDefs.length > 1 },
    tooltip: { y: { formatter } }
  }
  return { series, options, height: resolveBarHeight(node, rows.length) }
}
