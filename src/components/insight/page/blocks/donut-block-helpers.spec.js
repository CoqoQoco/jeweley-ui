import { describe, it, expect } from 'vitest'

import { CHART_PALETTE, CHART_TOKENS } from '@/services/utils/chart-colors.js'
import { formatChartValue, resolveColorSpec } from './chart-shared.js'
import { normalizeSlices, sumSlices, buildDonutChart, DONUT_DEFAULT_HEIGHT } from './donut-block-helpers.js'

const t = (key) => key

describe('chart-shared', () => {
  it('formats values with thousands separators', () => {
    expect(formatChartValue(1234567)).toBe('1,234,567')
    expect(formatChartValue(1234.567, 'decimal')).toBe('1,234.57')
    expect(formatChartValue(1500, 'money0')).toBe('฿1,500')
    expect(formatChartValue(12.34, 'percent')).toBe('12.3%')
    expect(formatChartValue(null)).toBe('0')
    expect(formatChartValue(2500000, 'moneyAbbr')).toBe('฿2.50M')
    expect(formatChartValue(1500, 'moneyAbbr')).toBe('฿1.5K')
    expect(formatChartValue(12, 'moneyAbbr')).toBe('฿12')
  })

  it('resolves colour specs from design tokens, palette index or the default palette order', () => {
    expect(resolveColorSpec('token:green')).toBe(CHART_TOKENS.green)
    expect(resolveColorSpec('palette:2')).toBe(CHART_PALETTE[2])
    expect(resolveColorSpec(undefined, 1)).toBe(CHART_PALETTE[1])
    expect(resolveColorSpec(undefined, CHART_PALETTE.length + 1)).toBe(CHART_PALETTE[1])
    expect(resolveColorSpec('token:nope', 0)).toBe(CHART_PALETTE[0])
  })
})

describe('donut-block helpers', () => {
  const slices = [
    { label: 'a', value: 30, color: 'token:green' },
    { label: 'b', value: 10, color: 'token:warning' }
  ]

  it('normalizes slices: negative / non-numeric values become 0 and colours resolve to hex', () => {
    const out = normalizeSlices([{ label: 'x', value: -5 }, { label: 'y', value: 'abc', color: 'token:red' }, { label: 'z', value: '7' }])
    expect(out.map((s) => s.value)).toEqual([0, 0, 7])
    expect(out[1].color).toBe(CHART_TOKENS.red)
    expect(sumSlices(out)).toBe(7)
    expect(normalizeSlices(null)).toEqual([])
  })

  it('builds series, labels, colours and a px height (never a percentage)', () => {
    const chart = buildDonutChart({}, slices, t)
    expect(chart.series).toEqual([30, 10])
    expect(chart.options.labels).toEqual(['a', 'b'])
    expect(chart.options.colors).toEqual([CHART_TOKENS.green, CHART_TOKENS.warning])
    expect(chart.height).toBe(DONUT_DEFAULT_HEIGHT)
    expect(typeof chart.height).toBe('number')
    expect(buildDonutChart({ height: 320 }, slices, t).height).toBe(320)
    expect(buildDonutChart({ height: '50%' }, slices, t).height).toBe(DONUT_DEFAULT_HEIGHT)
    expect(chart.options.legend.position).toBe('bottom')
  })

  it('legend shows value and percent, tooltip uses thousands separators', () => {
    const chart = buildDonutChart({}, [{ label: 'a', value: 3000 }, { label: 'b', value: 1000 }], t)
    expect(chart.options.legend.formatter('a', { seriesIndex: 0 })).toBe('a: 3,000 (75.0%)')
    expect(chart.options.tooltip.y.formatter(1234567)).toBe('1,234,567')
    expect(chart.options.dataLabels.formatter(33.333)).toBe('33.3%')
  })

  it('center total is optional: off by default, shows the formatted total with the translated label when configured', () => {
    expect(buildDonutChart({}, slices, t).options.plotOptions.pie.donut.labels.show).toBe(false)
    const labels = buildDonutChart({ center: { label: 'center.key' }, valueFormat: 'count' }, [{ label: 'a', value: 1500 }, { label: 'b', value: 500 }], t).options.plotOptions.pie.donut.labels
    expect(labels.show).toBe(true)
    expect(labels.total.label).toBe('center.key')
    expect(labels.total.formatter()).toBe('2,000')
  })

  it('all-zero or empty slices give an empty series (ChartGeneric shows its empty state)', () => {
    expect(buildDonutChart({}, [{ label: 'a', value: 0 }], t).series).toEqual([])
    expect(buildDonutChart({}, [], t).series).toEqual([])
    expect(buildDonutChart({}, [{ label: 'a', value: 0 }], t).options.legend.formatter('a', { seriesIndex: 0 })).toBe('a: 0 (0.0%)')
  })

  it('centre label / value can be functions and slice clicks are forwarded with the context', () => {
    const clicks = []
    const node = {
      valueFormat: 'moneyAbbr',
      center: { label: (ctx, tt, total) => `${ctx.name}:${total}`, value: (total) => `T${total}` },
      onSliceClick: (index, ctx) => clicks.push([index, ctx.name])
    }
    const chart = buildDonutChart(node, [{ label: 'a', value: 5 }, { label: 'b', value: 7 }], t, { name: 'ctx' })
    const total = chart.options.plotOptions.pie.donut.labels.total
    expect(total.label).toBe('ctx:12')
    expect(total.formatter()).toBe('T12')
    chart.options.chart.events.dataPointSelection(null, null, { dataPointIndex: 1 })
    expect(clicks).toEqual([[1, 'ctx']])
    // ไม่มี onSliceClick หรือไม่มี ctx = ไม่ผูก event
    expect(buildDonutChart({}, [{ label: 'a', value: 1 }], t, {}).options.chart).toBeUndefined()
    expect(buildDonutChart({ ...node, center: undefined }, [{ label: 'a', value: 1 }], t).options.chart).toBeUndefined()
  })
})
