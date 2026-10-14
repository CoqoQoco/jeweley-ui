import { describe, it, expect } from 'vitest'
import { formatKpiValue, buildKpiCards, withKpiUnit, buildKpiAsOf, buildKpiFootNote } from './kpi-block-helpers.js'

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

describe('kpi extras (unit / asOf / footNote / percent0)', () => {
  it('percent0 has no decimals', () => {
    expect(formatKpiValue(12.6, 'percent0')).toBe('13%')
  })

  it('unit is appended to values only, never to the dash', () => {
    expect(withKpiUnit('5', { unit: 'k.days' }, t)).toBe('5 k.days')
    expect(withKpiUnit('—', { unit: 'k.days' }, t)).toBe('—')
    expect(withKpiUnit('5', {}, t)).toBe('5')
    const cards = buildKpiCards({ cards: [{ label: 'l', value: () => 2.5, format: 'days', unit: 'k.days' }] }, {}, t)
    expect(cards[0].value).toBe('2.5 k.days')
  })

  it('asOf renders the translated label with a formatted date, nothing without a value', () => {
    const tt = (key, params) => (params ? `${key}:${params.date}` : key)
    expect(buildKpiAsOf({ asOf: () => null }, {}, tt)).toBe('')
    expect(buildKpiAsOf({}, {}, tt)).toBe('')
    expect(buildKpiAsOf({ asOf: () => '2026-10-01T08:30:00' }, {}, tt)).toMatch(/^view\.executive\.asOf:/)
    expect(buildKpiAsOf({ asOf: () => '2026-10-01T08:30:00', asOfLabel: 'k.asOf' }, {}, tt)).toMatch(/^k\.asOf:/)
  })

  it('footNote accepts a key or a function', () => {
    expect(buildKpiFootNote({ footNote: 'k.note' }, {}, t)).toBe('k.note')
    expect(buildKpiFootNote({ footNote: (ctx) => `n${ctx.n}` }, { n: 1 }, t)).toBe('n1')
    expect(buildKpiFootNote({}, {}, t)).toBe('')
  })
})
