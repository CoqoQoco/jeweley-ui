import { describe, it, expect } from 'vitest'
import { goldTypeNameEn, resolveGoldTypeWord, applyGoldTypeName } from './gold-type-name.js'

describe('goldTypeNameEn', () => {
  it.each([
    ['WG', 'White Gold'],
    ['YG', 'Yellow Gold'],
    ['PG', 'Pink Gold'],
    ['NG', 'Y/P Gold'],
    ['MG', 'W/P Gold'],
    ['SV', 'Silver'],
    ['wg', 'White Gold'],
    [' YG ', 'Yellow Gold']
  ])('%s -> %s', (code, name) => {
    expect(goldTypeNameEn(code)).toBe(name)
  })

  it.each([null, undefined, '', 'XX'])('%s -> empty', (code) => {
    expect(goldTypeNameEn(code)).toBe('')
  })
})

describe('resolveGoldTypeWord', () => {
  it('uses the name from typeCode', () => {
    expect(resolveGoldTypeWord('Gold', 'WG')).toBe('White Gold')
  })

  it('falls back to type when typeCode is empty or unknown', () => {
    expect(resolveGoldTypeWord('Gold', '')).toBe('Gold')
    expect(resolveGoldTypeWord('Silver', null)).toBe('Silver')
    expect(resolveGoldTypeWord('Gold', 'XX')).toBe('Gold')
  })
})

describe('applyGoldTypeName', () => {
  it('replaces the trailing type word', () => {
    expect(applyGoldTypeName('1.72 g. Gold', 'WG')).toBe('1.72 g. White Gold')
    expect(applyGoldTypeName('1.72 g. Gold', 'NG')).toBe('1.72 g. Y/P Gold')
    expect(applyGoldTypeName('0.83 g. Silver', 'SV')).toBe('0.83 g. Silver')
  })

  it('keeps the text when typeCode is empty/unknown or there is no trailing word', () => {
    expect(applyGoldTypeName('1.72 g. Gold', '')).toBe('1.72 g. Gold')
    expect(applyGoldTypeName('1.72 g. Gold', null)).toBe('1.72 g. Gold')
    expect(applyGoldTypeName('1.72 g. Gold', 'XX')).toBe('1.72 g. Gold')
    expect(applyGoldTypeName('0.83 g.', 'WG')).toBe('0.83 g.')
    expect(applyGoldTypeName('', 'WG')).toBe('')
  })
})
