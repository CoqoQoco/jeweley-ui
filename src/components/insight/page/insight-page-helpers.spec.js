import { describe, it, expect } from 'vitest'

import {
  isoOrNull,
  resolveText,
  computeSourceKeys,
  diffSourceKeys,
  buildStateResets,
  buildInitialState,
  isNodeVisible,
  buildAnchorId,
  flattenBlocks,
  collectBlockIds,
  findDuplicates,
  nodeKey,
  resolveFrameProps
} from './insight-page-helpers.js'

const t = (key, params) => (params ? `${key}:${JSON.stringify(params)}` : key)

describe('resolveText', () => {
  it('translates a string key, calls a function with (ctx, t), and returns empty for nothing', () => {
    expect(resolveText('a.b', {}, t)).toBe('a.b')
    expect(resolveText((ctx, tt) => tt('x', { n: ctx.n }), { n: 2 }, t)).toBe('x:{"n":2}')
    expect(resolveText(undefined, {}, t)).toBe('')
  })
})

describe('source keys (one request per endpoint per params change)', () => {
  const sources = {
    A: { params: (f) => ({ s: f.start, e: f.end }) },
    B: { params: (f, s) => ({ days: f.staleDays, draft: s.draft }) },
    C: { params: () => null }
  }

  it('keys only reflect the fields each source reads', () => {
    const before = computeSourceKeys(sources, { start: 1, end: 2, staleDays: 5, other: 'x' }, { draft: [] })
    const after = computeSourceKeys(sources, { start: 1, end: 2, staleDays: 5, other: 'y' }, { draft: [] })
    expect(diffSourceKeys(before, after)).toEqual([])
  })

  it('diff returns every source on the first run and only the changed ones afterwards', () => {
    const k1 = computeSourceKeys(sources, { start: 1, end: 2, staleDays: 5 }, { draft: [] })
    expect(diffSourceKeys({}, k1)).toEqual(['A', 'B', 'C'])
    const k2 = computeSourceKeys(sources, { start: 1, end: 3, staleDays: 5 }, { draft: [] })
    expect(diffSourceKeys(k1, k2)).toEqual(['A'])
    const k3 = computeSourceKeys(sources, { start: 1, end: 3, staleDays: 5 }, { draft: [{ a: 1 }] })
    expect(diffSourceKeys(k2, k3)).toEqual(['B'])
  })

  it('a multi-field change of one source yields one entry (one fetch)', () => {
    const k1 = computeSourceKeys(sources, { start: 1, end: 2, staleDays: 5 }, { draft: [] })
    const k2 = computeSourceKeys(sources, { start: 9, end: 8, staleDays: 5 }, { draft: [] })
    expect(diffSourceKeys(k1, k2)).toEqual(['A'])
  })
})

describe('state helpers', () => {
  const stateConfig = {
    picked: { initial: null, resetOn: { source: 'X', value: (data, current) => current ?? data.first } },
    list: { initial: () => [] },
    flag: { initial: '' }
  }

  it('buildInitialState supports values and factories', () => {
    expect(buildInitialState(stateConfig)).toEqual({ picked: null, list: [], flag: '' })
    expect(buildInitialState(stateConfig).list).not.toBe(buildInitialState(stateConfig).list)
  })

  it('buildStateResets only resets keys bound to the loaded source', () => {
    expect(buildStateResets(stateConfig, 'X', { first: 'a' }, { picked: null })).toEqual({ picked: 'a' })
    expect(buildStateResets(stateConfig, 'X', { first: 'a' }, { picked: 'b' })).toEqual({ picked: 'b' })
    expect(buildStateResets(stateConfig, 'Y', {}, {})).toEqual({})
  })
})

describe('node helpers', () => {
  const blocks = [
    { id: 'a', type: 'table', detail: { type: 'detail' } },
    { row: true, blocks: [{ id: 'b', type: 'chart' }, { id: 'c', type: 'chart' }] },
    { group: true, id: 'g', blocks: [{ type: 'sparkCards' }, { id: 'd', type: 'table' }] }
  ]

  it('flattens nested row/group/detail nodes and collects ids', () => {
    expect(collectBlockIds(blocks)).toEqual(['a', 'b', 'c', 'g', 'd'])
    expect(flattenBlocks(blocks).length).toBe(8)
  })

  it('findDuplicates', () => {
    expect(findDuplicates(['a', 'b', 'a', 'c', 'b'])).toEqual(['a', 'b'])
    expect(findDuplicates(['a'])).toEqual([])
  })

  it('isNodeVisible defaults to true and honours visible(ctx)', () => {
    expect(isNodeVisible({}, {})).toBe(true)
    expect(isNodeVisible({ visible: (ctx) => ctx.show }, { show: false })).toBe(false)
  })

  it('buildAnchorId prefixes insight-report- and ignores empty ids', () => {
    expect(buildAnchorId('trend')).toBe('insight-report-trend')
    expect(buildAnchorId('')).toBeUndefined()
  })

  it('nodeKey prefers id and falls back to type/row + index', () => {
    expect(nodeKey({ id: 'x' }, 3)).toBe('x')
    expect(nodeKey({ type: 'table' }, 1)).toBe('table-1')
    expect(nodeKey({ row: true }, 0)).toBe('row-0')
  })
})

describe('resolveFrameProps', () => {
  it('maps title/tip/notes through t and applies defaults', () => {
    const frame = resolveFrameProps({ id: 'x', title: 'k.title', titleTip: 'k.tip', notes: ['k.n1', () => '', 'k.n2'] }, {}, t)
    expect(frame).toEqual({ id: 'x', title: 'k.title', titleTip: 'k.tip', icon: '', accent: 'main', headerStyle: 'legend', notes: ['k.n1', 'k.n2'] })
  })
})

describe('isoOrNull', () => {
  it('returns null for empty values and an ISO string otherwise', () => {
    expect(isoOrNull(null)).toBeNull()
    expect(typeof isoOrNull(new Date('2026-10-01T00:00:00'))).toBe('string')
  })
})
