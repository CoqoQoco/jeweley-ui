import { describe, it, expect } from 'vitest'
import { METAL_SCOPE_VALUES, DEFAULT_METAL_SCOPE, parseMetalQuery, metalToQuery, resolveGoldTabMetal, withMetalScope } from './metal-scope.js'

describe('metal-scope', () => {
  it('parses the lower-case URL value and falls back to ALL', () => {
    expect(parseMetalQuery('gold')).toBe('GOLD')
    expect(parseMetalQuery('silver')).toBe('SILVER')
    expect(parseMetalQuery('all')).toBe('ALL')
    expect(parseMetalQuery('bogus')).toBe(DEFAULT_METAL_SCOPE)
    expect(parseMetalQuery(undefined)).toBe(DEFAULT_METAL_SCOPE)
    expect(METAL_SCOPE_VALUES).toEqual(['GOLD', 'SILVER', 'ALL'])
  })

  it('emits a lower-case query value only when not the default', () => {
    expect(metalToQuery('GOLD')).toBe('gold')
    expect(metalToQuery('SILVER')).toBe('silver')
    expect(metalToQuery('ALL')).toBeUndefined()
  })

  it('round-trips through the URL', () => {
    METAL_SCOPE_VALUES.forEach((value) => expect(parseMetalQuery(metalToQuery(value))).toBe(value))
  })

  it('gold tab shows gold unless silver is selected', () => {
    expect(resolveGoldTabMetal('ALL')).toBe('GOLD')
    expect(resolveGoldTabMetal('GOLD')).toBe('GOLD')
    expect(resolveGoldTabMetal('SILVER')).toBe('SILVER')
  })

  it('withMetalScope adds metal but keeps one the caller already set', () => {
    expect(withMetalScope({ a: 1 }, 'SILVER')).toEqual({ a: 1, metal: 'SILVER' })
    expect(withMetalScope({ metal: 'GOLD' }, 'SILVER').metal).toBe('GOLD')
    expect(withMetalScope(undefined, undefined)).toEqual({ metal: 'ALL' })
  })
})
