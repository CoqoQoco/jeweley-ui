// chart-block-helpers.js — pure logic ของ ChartBlock (barH / donut) — ห้าม import Vue/i18n
import { CHART_PALETTE, CHART_TOKENS } from '@/services/utils/chart-colors.js'

const countFormat = (v) => new Intl.NumberFormat('th-TH').format(v || 0)

// 'token:green' → CHART_TOKENS.green · 'palette:1' → CHART_PALETTE[1]
export function resolveChartColor(spec) {
  const [kind, name] = String(spec).split(':')
  if (kind === 'palette') return CHART_PALETTE[Number(name)]
  return CHART_TOKENS[name]
}

export function resolveChartHeight(node, rowCount) {
  return Math.max(node.minHeight || 240, rowCount * (node.rowHeight || 40) + (node.pad ?? 60))
}

export function buildBarHorizontal(node, rows, ctx, t) {
  const series = (node.series || []).map((s) => ({ name: t(s.label), data: rows.map((row) => s.value(row)) }))
  const options = {
    chart: { type: 'bar', stacked: !!node.stacked, toolbar: { show: false } },
    colors: (node.colors || []).map(resolveChartColor),
    plotOptions: { bar: { horizontal: true, borderRadius: 4, ...(node.bar || {}) } },
    dataLabels: { enabled: node.dataLabels !== false, style: { fontSize: '11px', fontWeight: 600 } },
    xaxis: { categories: rows.map((row) => node.category(row, ctx, t)), labels: { formatter: countFormat } },
    tooltip: { y: { formatter: countFormat } }
  }
  return { series, options, height: resolveChartHeight(node, rows.length) }
}

export function buildDonut(node, rows, ctx, t) {
  const options = {
    labels: rows.map((row) => node.category(row, ctx, t)),
    colors: (node.colors || []).map(resolveChartColor),
    legend: { position: 'bottom' },
    tooltip: { y: { formatter: countFormat } }
  }
  return { series: rows.map((row) => node.series[0].value(row) || 0), options, height: node.height || 280 }
}

export function buildChart(node, rows, ctx, t) {
  return node.chartType === 'donut' ? buildDonut(node, rows, ctx, t) : buildBarHorizontal(node, rows, ctx, t)
}
