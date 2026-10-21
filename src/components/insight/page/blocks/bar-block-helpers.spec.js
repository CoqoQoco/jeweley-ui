import { describe, it, expect } from 'vitest'

import { CHART_TOKENS } from '@/services/utils/chart-colors.js'
import { buildBarChart, resolveBarHeight, BAR_DEFAULT_HEIGHT } from './bar-block-helpers.js'

const t = (key) => key
const rows = [
  { name: 'x', a: 1200, b: 3 },
  { name: 'y', a: 5, b: null }
]
const node = {
  category: (row) => row.name,
  series: [
    { label: 's.a', value: (r) => r.a, color: 'token:green' },
    { label: 's.b', value: (r) => r.b, color: 'token:warning' }
  ]
}

describe('bar-block helpers', () => {
  it('builds named series, categories, colours (null -> 0)', () => {
    const chart = buildBarChart(node, rows, {}, t)
    expect(chart.series).toEqual([
      { name: 's.a', data: [1200, 5] },
      { name: 's.b', data: [3, 0] }
    ])
    expect(chart.options.xaxis.categories).toEqual(['x', 'y'])
    expect(chart.options.colors).toEqual([CHART_TOKENS.green, CHART_TOKENS.warning])
    expect(chart.options.legend.show).toBe(true)
  })

  it('stacked / horizontal switches and the single-series legend is hidden', () => {
    const stacked = buildBarChart({ ...node, stacked: true }, rows, {}, t)
    expect(stacked.options.chart.stacked).toBe(true)
    expect(stacked.options.plotOptions.bar.horizontal).toBe(false)
    const horizontal = buildBarChart({ ...node, horizontal: true, series: [node.series[0]], bar: { barHeight: '60%' } }, rows, {}, t)
    expect(horizontal.options.plotOptions.bar).toMatchObject({ horizontal: true, barHeight: '60%' })
    expect(horizontal.options.legend.show).toBe(false)
  })

  it('tooltip and axis labels use thousands separators; data labels are opt-in', () => {
    const chart = buildBarChart(node, rows, {}, t)
    expect(chart.options.tooltip.y.formatter(1234567)).toBe('1,234,567')
    expect(chart.options.yaxis.labels.formatter(1200)).toBe('1,200')
    expect(chart.options.dataLabels.enabled).toBe(false)
    expect(buildBarChart({ ...node, dataLabels: true }, rows, {}, t).options.dataLabels.enabled).toBe(true)
    expect(buildBarChart({ ...node, horizontal: true }, rows, {}, t).options.xaxis.labels.formatter(1200)).toBe('1,200')
    expect(buildBarChart({ ...node, valueFormat: 'percent' }, rows, {}, t).options.tooltip.y.formatter(12.34)).toBe('12.3%')
  })

  it('height is a px number: fixed when given, default for vertical, growing with rows for horizontal', () => {
    expect(resolveBarHeight({ height: 240 }, 3)).toBe(240)
    expect(resolveBarHeight({}, 3)).toBe(BAR_DEFAULT_HEIGHT)
    expect(resolveBarHeight({ horizontal: true, rowHeight: 40, pad: 60, minHeight: 200 }, 1)).toBe(200)
    expect(resolveBarHeight({ horizontal: true, rowHeight: 40, pad: 60, minHeight: 200 }, 10)).toBe(460)
    expect(typeof buildBarChart(node, rows, {}, t).height).toBe('number')
  })

  it('no rows -> empty data (ChartGeneric shows its empty state)', () => {
    const chart = buildBarChart(node, [], {}, t)
    expect(chart.series.map((s) => s.data)).toEqual([[], []])
  })
})
