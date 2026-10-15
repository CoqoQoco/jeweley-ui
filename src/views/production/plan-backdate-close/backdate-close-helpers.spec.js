import { describe, it, expect } from 'vitest'
import {
  parseJobNumbers,
  summarizePreview,
  filterPreview,
  getClosableIds,
  buildClosePayload,
  formatJobNumber
} from './backdate-close-helpers.js'

describe('parseJobNumbers', () => {
  it('returns empty for blank input', () => {
    expect(parseJobNumbers('')).toEqual({ jobs: [], duplicateCount: 0 })
    expect(parseJobNumbers(null)).toEqual({ jobs: [], duplicateCount: 0 })
    expect(parseJobNumbers('  \n \n')).toEqual({ jobs: [], duplicateCount: 0 })
  })

  it('splits by lines and skips blank lines', () => {
    expect(parseJobNumbers('6803016-4\n\n6803017-1\r\n').jobs).toEqual(['6803016-4', '6803017-1'])
  })

  it('splits by comma, semicolon, tab and spaces', () => {
    expect(parseJobNumbers('6803016-4, 6803017-1;6803018-2\t6803019-3 6803020-1').jobs).toEqual([
      '6803016-4',
      '6803017-1',
      '6803018-2',
      '6803019-3',
      '6803020-1'
    ])
  })

  it('strips .pdf and " - Copy" from file names', () => {
    expect(
      parseJobNumbers('6803016-4.pdf\n6803017-1 - Copy.pdf\n6803018-2 - Copy (2).PDF\n6803019-3 (1).pdf').jobs
    ).toEqual(['6803016-4', '6803017-1', '6803018-2', '6803019-3'])
  })

  it('normalizes spaces around the dash', () => {
    expect(parseJobNumbers('6803016 - 4').jobs).toEqual(['6803016-4'])
  })

  it('dedupes and counts duplicates', () => {
    const res = parseJobNumbers('6803016-4\n6803016-4.pdf\n6803016-4 - Copy.pdf\n6803017-1')
    expect(res.jobs).toEqual(['6803016-4', '6803017-1'])
    expect(res.duplicateCount).toBe(2)
  })

  it('keeps unparseable tokens so the server can flag INVALID_FORMAT', () => {
    expect(parseJobNumbers('abc').jobs).toEqual(['abc'])
  })
})

const items = [
  { input: 'a', id: 1, wo: '6803016', woNumber: 4, canClose: true, reasonCode: null },
  { input: 'b', id: 2, wo: '6803017', woNumber: 1, canClose: false, reasonCode: 'MELTED' },
  { input: 'c', id: null, found: false, canClose: false, reasonCode: 'NOT_FOUND' },
  { input: 'd', id: 4, canClose: false, reasonCode: 'MELTED' },
  { input: 'e', id: 5, canClose: true, reasonCode: null }
]

describe('summarizePreview', () => {
  it('counts closable, skipped and by reason', () => {
    expect(summarizePreview(items)).toEqual({
      total: 5,
      closable: 2,
      skipped: 3,
      byReason: { MELTED: 2, NOT_FOUND: 1 }
    })
  })

  it('handles empty', () => {
    expect(summarizePreview()).toEqual({ total: 0, closable: 0, skipped: 0, byReason: {} })
  })
})

describe('filterPreview / payload', () => {
  it('filters by mode', () => {
    expect(filterPreview(items, 'all')).toHaveLength(5)
    expect(filterPreview(items, 'closable').map((i) => i.input)).toEqual(['a', 'e'])
    expect(filterPreview(items, 'skipped').map((i) => i.input)).toEqual(['b', 'c', 'd'])
  })

  it('collects only closable ids', () => {
    expect(getClosableIds(items)).toEqual([1, 5])
  })

  it('builds payload with trimmed remark and no closeDate', () => {
    expect(buildClosePayload(items, '  sold long ago ')).toEqual({
      planIds: [1, 5],
      remark: 'sold long ago'
    })
  })

  it('formats job number', () => {
    expect(formatJobNumber(items[0])).toBe('6803016-4')
    expect(formatJobNumber({ wo: '6803016' })).toBe('6803016')
  })
})
