import { describe, it, expect } from 'vitest'
import { CHART_TOKENS } from '@/services/utils/chart-colors.js'
import { formatChartValue, resolveVisibleSeries, readSeriesData, buildTrendSeries, buildTrendOptions } from './trend-block-helpers.js'

const t = (key) => key

describe('series data', () => {
  it('keeps null as a gap unless nullAs is given, supports value fn and negate', () => {
    const points = [{ a: 1 }, { a: null }, {}]
    expect(readSeriesData({ field: 'a' }, points)).toEqual([1, null, null])
    expect(readSeriesData({ field: 'a', nullAs: 0 }, points)).toEqual([1, 0, 0])
    expect(readSeriesData({ value: (p) => (p.a ?? 0) * 2 }, points)).toEqual([2, 0, 0])
    expect(readSeriesData({ field: 'a', negate: true, nullAs: 0 }, points).map((v) => Math.abs(v))).toEqual([1, 0, 0])
    expect(readSeriesData({ field: 'a', negate: true, nullAs: 0 }, points)[0]).toBe(-1)
  })

  it('visible(points) hides a series (and its legend entry)', () => {
    const series = [{ field: 'a', label: 'l.a' }, { field: 'b', label: 'l.b', visible: (points) => points.length > 5 }]
    expect(resolveVisibleSeries(series, [1, 2])).toHaveLength(1)
    expect(buildTrendSeries(series, [{ a: 1 }], t)).toEqual([{ name: 'l.a', type: 'line', data: [1] }])
  })
})

describe('formatChartValue', () => {
  it('formats counts and days; null days is a dash', () => {
    expect(formatChartValue(1234)).toBe('1,234')
    expect(formatChartValue(1.26, 'days')).toBe('1.3')
    expect(formatChartValue(null, 'days')).toBe('—')
    expect(formatChartValue(null)).toBe('0')
  })
})

describe('buildTrendOptions', () => {
  const series = [
    { field: 'a', type: 'line', label: 'l.a', color: 'primary' },
    { field: 'b', type: 'line', label: 'l.b', color: 'sub', dashed: true },
    { field: 'c', type: 'bar', label: 'l.c', color: 'green', opacity: 0.85 }
  ]

  it('derives colours, stroke widths, dash array, fill opacity and categories from the series config', () => {
    const options = buildTrendOptions({ node: { series, stacked: true, yFormat: 'days' }, points: [], categories: ['x'], ctx: {}, t })
    expect(options.colors).toEqual([CHART_TOKENS.primary, CHART_TOKENS.sub, CHART_TOKENS.green])
    expect(options.stroke.width).toEqual([3, 2, 0])
    expect(options.stroke.dashArray).toEqual([0, 6, 0])
    expect(options.fill.opacity).toEqual([1, 1, 0.85])
    expect(options.chart.stacked).toBe(true)
    expect(options.xaxis.categories).toEqual(['x'])
    expect(options.tooltip.y.formatter(1.26)).toBe('1.3')
  })

  it('adds a target line annotation only when the value is a finite number', () => {
    const node = { series, targetLine: { value: (ctx) => ctx.target, label: 'l.target' } }
    expect(buildTrendOptions({ node, points: [], categories: [], ctx: { target: 5 }, t }).annotations.yaxis[0]).toMatchObject({ y: 5 })
    expect(buildTrendOptions({ node, points: [], categories: [], ctx: { target: null }, t }).annotations).toEqual({})
  })

  it('uses a second opposite axis when a series has axis 1 and abs tooltip when asked', () => {
    const node = { series: [{ field: 'a', label: 'l.a' }, { field: 'b', label: 'l.b', axis: 1 }], tooltipAbs: true }
    const options = buildTrendOptions({ node, points: [], categories: [], ctx: {}, t })
    expect(Array.isArray(options.yaxis)).toBe(true)
    expect(options.yaxis[1].opposite).toBe(true)
    expect(options.tooltip.y.formatter(-5)).toBe('5')
  })

  it('drops series hidden by visible() from the colours too (indexes stay aligned)', () => {
    const node = { series: [{ field: 'a', label: 'l.a', color: 'primary' }, { field: 'b', label: 'l.b', color: 'green', visible: () => false }] }
    expect(buildTrendOptions({ node, points: [], categories: [], ctx: {}, t }).colors).toEqual([CHART_TOKENS.primary])
  })
})

describe('buildTrendOptions: per-series format, axis titles, column width', () => {
  const node = {
    columnWidth: '45%',
    axisTitles: ['t.plans', 't.days'],
    series: [
      { field: 'a', type: 'bar', label: 'l.a', axis: 0, format: 'count' },
      { field: 'b', type: 'line', label: 'l.b', axis: 1, format: 'days' },
      { field: 'c', type: 'line', label: 'l.c', axis: 1, format: 'days', dashed: true }
    ]
  }

  it('keeps a count axis and a days axis with titles, and a formatter per series in the tooltip', () => {
    const options = buildTrendOptions({ node, points: [], categories: [], ctx: {}, t })
    expect(options.plotOptions.bar.columnWidth).toBe('45%')
    expect(options.yaxis).toHaveLength(2)
    expect(options.yaxis[0].title.text).toBe('t.plans')
    expect(options.yaxis[1]).toMatchObject({ opposite: true, title: { text: 't.days' } })
    expect(options.yaxis[0].labels.formatter(1234)).toBe('1,234')
    expect(options.yaxis[1].labels.formatter(1.26)).toBe('1.3')
    expect(options.tooltip.y).toHaveLength(3)
    expect(options.tooltip.y[0].formatter(1234)).toBe('1,234')
    expect(options.tooltip.y[1].formatter(null)).toBe('—')
    expect(options.stroke.width).toEqual([0, 3, 2])
    expect(options.stroke.dashArray).toEqual([0, 0, 6])
  })
})

describe('percent format / yMax / chartType', () => {
  it('formatChartValue percent has 1 decimal and a dash for null', () => {
    expect(formatChartValue(85.26, 'percent')).toBe('85.3%')
    expect(formatChartValue(null, 'percent')).toBe('—')
  })

  it('applies yMax to a single axis and the main chart type', () => {
    const node = { chartType: 'bar', yMax: 100, yFormat: 'percent', series: [{ field: 'a', type: 'bar', label: 'l.a' }] }
    const options = buildTrendOptions({ node, points: [], categories: [], ctx: {}, t })
    expect(options.chart.type).toBe('bar')
    expect(options.yaxis.max).toBe(100)
    expect(options.yaxis.labels.formatter(50)).toBe('50%')
    expect(options.tooltip.y.formatter(80)).toBe('80%')
    expect(buildTrendOptions({ node: { ...node, yMax: undefined }, points: [], categories: [], ctx: {}, t }).yaxis).not.toHaveProperty('max')
  })
})
