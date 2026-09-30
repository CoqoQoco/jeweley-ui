import { describe, it, expect } from 'vitest'

import {
  resolvePlanStatusVariant,
  resolveCurrentStatusHeader,
  buildHistoryWorkerText,
  formatWeightSendCheckPair,
  buildPlanHistoryRows,
  resolvePriceGroupKey,
  sumPriceItemsTotal,
  findStatusMasterById
} from './plan-detail-helpers.js'

describe('resolvePlanStatusVariant', () => {
  it('maps 95/100 to success', () => {
    expect(resolvePlanStatusVariant(95)).toBe('success')
    expect(resolvePlanStatusVariant(100)).toBe('success')
  })

  it('maps 500 to cancelled', () => {
    expect(resolvePlanStatusVariant(500)).toBe('cancelled')
  })

  it('maps every other status to process', () => {
    ;[10, 50, 60, 70, 80, 85, 90, 94, 9999].forEach((status) => {
      expect(resolvePlanStatusVariant(status)).toBe('process')
    })
  })
})

describe('resolveCurrentStatusHeader', () => {
  const headers = [
    { status: 50, createDate: '2026-01-01', updateDate: '2026-01-02' },
    { status: 80, createDate: '2026-02-01', updateDate: '2026-02-05' },
    { status: 90, createDate: '2026-03-01', updateDate: '2026-03-02' }
  ]

  it('returns the header matching the current status exactly', () => {
    expect(resolveCurrentStatusHeader(headers, 80)).toBe(headers[1])
  })

  it('falls back to the header with the latest updateDate when no exact match', () => {
    expect(resolveCurrentStatusHeader(headers, 999)).toBe(headers[2])
  })

  it('returns null for empty/missing headers', () => {
    expect(resolveCurrentStatusHeader([], 80)).toBeNull()
    expect(resolveCurrentStatusHeader(null, 80)).toBeNull()
  })
})

describe('buildHistoryWorkerText', () => {
  it('formats a single primary worker', () => {
    expect(buildHistoryWorkerText({ worker: 'W01', workerName: 'สมชาย' })).toBe('W01 - สมชาย')
  })

  it('combines primary + sub worker with a slash', () => {
    expect(
      buildHistoryWorkerText({ worker: 'W01', workerName: 'สมชาย', workerSub: 'W02', workerSubName: 'สมหญิง' })
    ).toBe('W01 - สมชาย / W02 - สมหญิง')
  })

  it('returns empty string when no worker is assigned', () => {
    expect(buildHistoryWorkerText({})).toBe('')
    expect(buildHistoryWorkerText(null)).toBe('')
  })
})

describe('formatWeightSendCheckPair', () => {
  it('formats both send and check with an arrow', () => {
    expect(formatWeightSendCheckPair(12.3456, 12.1)).toBe('12.346 → 12.100')
  })

  it('formats send-only (check not received yet)', () => {
    expect(formatWeightSendCheckPair(12.3456, null)).toBe('12.346 →')
  })

  it('formats check-only', () => {
    expect(formatWeightSendCheckPair(null, 12.1)).toBe('→ 12.100')
  })

  it('returns an em dash when both are missing', () => {
    expect(formatWeightSendCheckPair(null, null)).toBe('—')
  })
})

describe('buildPlanHistoryRows', () => {
  const headers = [
    {
      status: 50,
      createDate: '2026-01-01T00:00:00Z',
      updateBy: 'สมชาย',
      tbtProductionPlanStatusDetail: [
        { id: 1, requestDate: '2026-01-05T00:00:00Z', worker: 'W01', workerName: 'A', goldWeightSend: 10, goldWeightCheck: 9.5, totalWages: 100, description: 'note1' }
      ]
    },
    {
      status: 80,
      createDate: '2026-02-01T00:00:00Z',
      updateBy: 'สมหญิง',
      tbtProductionPlanStatusDetail: [
        { id: 2, requestDate: '2026-02-10T00:00:00Z', worker: 'W02', workerName: 'B', goldWeightSend: 5, goldWeightCheck: 4.8, totalWages: 50, description: 'note2' }
      ]
    },
    {
      // สถานะไม่มี detail เลย — ต้องไม่โผล่เป็นแถวประวัติ
      status: 60,
      createDate: '2026-01-20T00:00:00Z',
      tbtProductionPlanStatusDetail: []
    }
  ]

  it('flattens header+detail into one row per detail, sorted newest first', () => {
    const rows = buildPlanHistoryRows(headers, 80)
    expect(rows).toHaveLength(2)
    expect(rows[0].status).toBe(80)
    expect(rows[1].status).toBe(50)
  })

  it('marks rows belonging to the current status as isCurrent', () => {
    const rows = buildPlanHistoryRows(headers, 80)
    expect(rows.find((r) => r.status === 80).isCurrent).toBe(true)
    expect(rows.find((r) => r.status === 50).isCurrent).toBe(false)
  })

  it('skips headers with no detail rows', () => {
    const rows = buildPlanHistoryRows(headers, 80)
    expect(rows.some((r) => r.status === 60)).toBe(false)
  })

  it('returns [] for empty/missing headers', () => {
    expect(buildPlanHistoryRows([], 80)).toEqual([])
    expect(buildPlanHistoryRows(null, 80)).toEqual([])
  })
})

describe('resolvePriceGroupKey', () => {
  it('returns the known group key as-is', () => {
    ;['Gold', 'Gem', 'Worker', 'Embed', 'ETC'].forEach((key) => {
      expect(resolvePriceGroupKey(key)).toBe(key)
    })
  })

  it('returns "unknown" for an unrecognised group', () => {
    expect(resolvePriceGroupKey('Bogus')).toBe('unknown')
    expect(resolvePriceGroupKey(null)).toBe('unknown')
  })
})

describe('sumPriceItemsTotal', () => {
  it('sums totalPrice across all rows', () => {
    expect(sumPriceItemsTotal([{ totalPrice: 100 }, { totalPrice: 50.5 }])).toBe(150.5)
  })

  it('treats missing/non-numeric totalPrice as 0', () => {
    expect(sumPriceItemsTotal([{ totalPrice: 100 }, { totalPrice: null }, {}])).toBe(100)
  })

  it('returns 0 for empty/missing input', () => {
    expect(sumPriceItemsTotal([])).toBe(0)
    expect(sumPriceItemsTotal(null)).toBe(0)
  })
})

describe('findStatusMasterById', () => {
  const statusMaster = [
    { id: 50, nameTh: 'แต่ง' },
    { id: 80, nameTh: 'ฝัง' }
  ]

  it('finds the matching master item by id', () => {
    expect(findStatusMasterById(statusMaster, 80)).toEqual({ id: 80, nameTh: 'ฝัง' })
  })

  it('returns null when not found or input missing', () => {
    expect(findStatusMasterById(statusMaster, 999)).toBeNull()
    expect(findStatusMasterById([], 80)).toBeNull()
    expect(findStatusMasterById(null, 80)).toBeNull()
  })
})
