import { describe, it, expect } from 'vitest'
import { buildSparkCards, isCardSelected } from './spark-cards-helpers.js'

describe('spark cards helpers', () => {
  it('builds cards from items(ctx, t) and tolerates a missing items fn', () => {
    expect(buildSparkCards({ items: (ctx) => [{ key: ctx.k }] }, { k: 'a' }, (x) => x)).toEqual([{ key: 'a' }])
    expect(buildSparkCards({}, {}, (x) => x)).toEqual([])
  })

  it('selected card follows the configured state key', () => {
    expect(isCardSelected({ selectedState: 's' }, { state: { s: 'a' } }, { key: 'a' })).toBe(true)
    expect(isCardSelected({ selectedState: 's' }, { state: { s: 'a' } }, { key: 'b' })).toBe(false)
  })
})
