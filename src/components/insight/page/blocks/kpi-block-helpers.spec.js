import { describe, it, expect } from 'vitest'
import { formatKpiValue, buildKpiCards } from './kpi-block-helpers.js'

const t = (key) => key

describe('formatKpiValue', () => {
  it('formats by type and falls back to a dash', () => {
    expect(formatKpiValue(1234, 'count')).toBe('1,234')
    expect(formatKpiValue(12.34, 'percent')).toBe('12.3%')
    expect(formatKpiValue(2.5, 'days')).toBe('2.5')
    expect(formatKpiValue('abc', 'text')).toBe('abc')
    expect(formatKpiValue(null)).toBe('—')
  })
})

describe('buildKpiCards', () => {
  it('builds StatCard props from the config and ctx', () => {
    const node = {
      cards: [
        { label: 'k.label', value: (ctx) => ctx.n, format: 'count', sub: (ctx, tt) => tt('k.sub'), tone: (ctx) => (ctx.n > 1 ? 'warning' : 'green'), reportRef: 'trend' },
        { label: 'k.other', value: () => null }
      ]
    }
    const cards = buildKpiCards(node, { n: 5 }, t)
    expect(cards[0]).toMatchObject({ label: 'k.label', value: '5', sub: 'k.sub', tone: 'warning', reportRef: 'trend' })
    expect(cards[1]).toMatchObject({ value: '—', tone: 'main', sub: '', reportRef: '' })
  })
})
