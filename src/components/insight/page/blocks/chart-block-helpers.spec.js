import { describe, it, expect } from 'vitest'
import { CHART_PALETTE, CHART_TOKENS } from '@/services/utils/chart-colors.js'
import { resolveChartColor, resolveChartHeight, buildBarHorizontal, buildDonut, buildChart } from './chart-block-helpers.js'

const t = (key) => key

describe('chart-block helpers', () => {
  it('resolves token and palette colours', () => {
    expect(resolveChartColor('token:green')).toBe(CHART_TOKENS.green)
    expect(resolveChartColor('palette:1')).toBe(CHART_PALETTE[1])
  })

  it('height grows with rows but never below the minimum', () => {
    expect(resolveChartHeight({ minHeight: 240, rowHeight: 44, pad: 60 }, 1)).toBe(240)
    expect(resolveChartHeight({ minHeight: 240, rowHeight: 44, pad: 60 }, 10)).toBe(500)
  })

  it('barH: series per config, categories from the row, stacked and extra bar options', () => {
    const node = {
      chartType: 'barH',
      category: (row) => row.name,
      series: [{ label: 's.a', value: (r) => r.a }, { label: 's.b', value: (r) => r.b }],
      stacked: true,
      colors: ['token:green', 'palette:0'],
      bar: { barHeight: '65%' }
    }
    const built = buildBarHorizontal(node, [{ name: 'x', a: 1, b: 2 }], {}, t)
    expect(built.series).toEqual([{ name: 's.a', data: [1] }, { name: 's.b', data: [2] }])
    expect(built.options.chart.stacked).toBe(true)
    expect(built.options.plotOptions.bar).toMatchObject({ horizontal: true, barHeight: '65%' })
    expect(built.options.xaxis.categories).toEqual(['x'])
    expect(built.options.colors).toEqual([CHART_TOKENS.green, CHART_PALETTE[0]])
  })

  it('donut: values from the first series, labels from category', () => {
    const node = { chartType: 'donut', category: (r) => r.name, series: [{ value: (r) => r.v }] }
    const built = buildDonut(node, [{ name: 'a', v: 2 }, { name: 'b' }], {}, t)
    expect(built.series).toEqual([2, 0])
    expect(built.options.labels).toEqual(['a', 'b'])
    expect(buildChart(node, [], {}, t).height).toBe(280)
  })
})
