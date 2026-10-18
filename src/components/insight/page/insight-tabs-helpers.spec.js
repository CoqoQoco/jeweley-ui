import { describe, it, expect } from 'vitest'

import {
  FIXED_SUB_TABS,
  DEFAULT_SUB_TAB,
  hasTabs,
  dataTabKeys,
  resolveSubTab,
  isDataSubTab,
  subTabToQuery,
  clearedSubTabQueryKeys,
  buildSubTabOptions,
  resolveNodeTab,
  blocksForTab,
  flattenBlocksWithTab,
  findTabForReportRef,
  validateTabConfig,
  isSourceTabGated
} from './insight-tabs-helpers.js'
import { computeSourceKeys, diffSourceKeys, DISABLED_SOURCE_KEY } from './insight-page-helpers.js'

const config = {
  tabs: [
    { key: 'a', label: 'k.a' },
    { key: 'b', label: 'k.b' }
  ],
  sources: { Always: { params: () => 1 }, OnlyB: { tab: 'b', params: () => 2 } },
  blocks: [
    { id: 'one', tab: 'a' },
    { row: true, tab: 'b', blocks: [{ id: 'two' }, { id: 'three', blocks: [{ id: 'four' }] }] },
    { id: 'five', tab: 'b', reveal: { stateKey: 's', value: 'v' } },
    { id: 'six', tab: 'a', detail: { blocks: [{ id: 'seven' }] } }
  ]
}

describe('opt-in detection and sub-tab resolution', () => {
  it('only configs with a non-empty tabs array are tabbed', () => {
    expect(hasTabs(config)).toBe(true)
    expect(hasTabs({})).toBe(false)
    expect(hasTabs({ tabs: [] })).toBe(false)
    expect(hasTabs(undefined)).toBe(false)
    expect(dataTabKeys(config)).toEqual(['a', 'b'])
    expect(dataTabKeys({})).toEqual([])
  })

  it('fixed tabs and data tab keys are valid; anything else (or a non-tabbed topic) falls back to problems', () => {
    FIXED_SUB_TABS.forEach((tab) => expect(resolveSubTab(tab, config)).toBe(tab))
    expect(resolveSubTab('b', config)).toBe('b')
    ;['bogus', '', undefined, null].forEach((value) => expect(resolveSubTab(value, config), String(value)).toBe(DEFAULT_SUB_TAB))
    expect(resolveSubTab('b', {})).toBe(DEFAULT_SUB_TAB)
    expect(isDataSubTab('b', config)).toBe(true)
    expect(isDataSubTab('forecast', config)).toBe(false)
  })

  it('URL: default is omitted (and its key cleared), other values are written as sub=', () => {
    expect(subTabToQuery('problems')).toEqual({})
    expect(subTabToQuery('')).toEqual({})
    expect(subTabToQuery(undefined)).toEqual({})
    expect(subTabToQuery('forecast')).toEqual({ sub: 'forecast' })
    expect(subTabToQuery('b')).toEqual({ sub: 'b' })
    expect(clearedSubTabQueryKeys('problems')).toEqual(['sub'])
    expect(clearedSubTabQueryKeys('actions')).toEqual([])
  })
})

describe('buildSubTabOptions', () => {
  it('3 fixed tabs with counts first, then the data tabs without counts', () => {
    const options = buildSubTabOptions({ counts: { problems: 2, forecast: 0, actions: 5 }, dataTabs: [{ value: 'a', label: 'A' }], t: (key) => key })
    expect(options.map((o) => [o.value, o.group, o.count])).toEqual([
      ['problems', 'fixed', 2],
      ['forecast', 'fixed', 0],
      ['actions', 'fixed', 5],
      ['a', 'data', null]
    ])
    expect(options[0].label).toBe('view.productionInsight.tabs.problems')
  })
})

describe('block → tab mapping', () => {
  it('top-level block tab, defaulting to the first data tab', () => {
    expect(resolveNodeTab({ tab: 'b' }, config)).toBe('b')
    expect(resolveNodeTab({}, config)).toBe('a')
    expect(blocksForTab(config, 'a').map((n) => n.id)).toEqual(['one', 'six'])
    expect(blocksForTab(config, 'b')).toHaveLength(2)
  })

  it('nested blocks (row/group/detail) inherit the top-level tab', () => {
    const byId = Object.fromEntries(flattenBlocksWithTab(config).filter(({ node }) => node.id).map(({ node, tab }) => [node.id, tab]))
    expect(byId).toMatchObject({ one: 'a', two: 'b', three: 'b', four: 'b', five: 'b', six: 'a', seven: 'a' })
  })

  it('reportRef → { tab, reveal }; unknown ref or non-tabbed config → null', () => {
    expect(findTabForReportRef(config, 'four')).toEqual({ tab: 'b', reveal: null })
    expect(findTabForReportRef(config, 'five')).toEqual({ tab: 'b', reveal: { stateKey: 's', value: 'v' } })
    expect(findTabForReportRef(config, 'seven')).toEqual({ tab: 'a', reveal: null })
    expect(findTabForReportRef(config, 'nope')).toBeNull()
    expect(findTabForReportRef({}, 'one')).toBeNull()
  })
})

describe('validateTabConfig', () => {
  it('a clean config has no problems; a non-tabbed config is never validated', () => {
    expect(validateTabConfig(config)).toEqual([])
    expect(validateTabConfig({})).toEqual([])
  })

  it('reports blocks without a tab, unknown tabs, colliding/duplicate keys and unknown source tabs', () => {
    expect(validateTabConfig({ ...config, blocks: [...config.blocks, { id: 'loose' }] }).join('|')).toContain('block loose has no tab')
    const bad = {
      tabs: [{ key: 'forecast' }, { key: 'x' }, { key: 'x' }],
      sources: { S: { tab: 'zzz' } },
      blocks: [{ id: 'q', tab: 'nope' }]
    }
    const text = validateTabConfig(bad).join('|')
    expect(text).toContain('collides with a fixed tab')
    expect(text).toContain('duplicate tab keys')
    expect(text).toContain('unknown tab "nope"')
    expect(text).toContain('source S has unknown tab "zzz"')
  })
})

describe('source gating by visited tabs', () => {
  it('a tab-bound source is gated until its tab is visited; unbound sources and non-tab mode are never gated', () => {
    expect(isSourceTabGated({ tab: 'b' }, [])).toBe(true)
    expect(isSourceTabGated({ tab: 'b' }, ['a'])).toBe(true)
    expect(isSourceTabGated({ tab: 'b' }, ['b'])).toBe(false)
    expect(isSourceTabGated({ tab: ['a', 'b'] }, ['b'])).toBe(false)
    expect(isSourceTabGated({}, [])).toBe(false)
    expect(isSourceTabGated({ tab: 'b' }, null)).toBe(false)
  })

  it('computeSourceKeys disables gated sources and flips them exactly once when the tab is visited', () => {
    const closed = computeSourceKeys(config.sources, {}, {}, [])
    expect(closed).toEqual({ Always: '1', OnlyB: DISABLED_SOURCE_KEY })
    const opened = computeSourceKeys(config.sources, {}, {}, ['b'])
    expect(diffSourceKeys(closed, opened)).toEqual(['OnlyB'])
    expect(computeSourceKeys(config.sources, {}, {}, null).OnlyB).toBe('2')
  })
})
