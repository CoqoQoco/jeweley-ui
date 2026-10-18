import { describe, it, expect } from 'vitest'

import {
  resolveWorkerTypeFromDept,
  buildWorkerModalPayload,
  canOpenStageWorker,
  buildWorkerModalFilter,
  buildWorkerFilterPatch,
  buildWorkersTablePayload,
  resolveProfileTabs,
  resolveFirstProfileTab,
  computeLossRank,
  computeWageStats,
  findWorkerRow,
  buildWorkersRequestBody,
  buildWorkerMonthlyRequestBody,
  buildUnpaidJobsRequestBody,
  filterUnpaidJobsForWorker,
  UNPAID_JOBS_DISPLAY_LIMIT
} from './worker-profile-helpers.js'
import { buildDefaultGoldFilter } from '../insight-filters.js'
import { goldConfig } from './gold.config.js'

describe('resolveWorkerTypeFromDept', () => {
  it('setting -> 80, trim -> 50, departments without a slip worker type -> null', () => {
    expect(resolveWorkerTypeFromDept('setting')).toBe(80)
    expect(resolveWorkerTypeFromDept('trim')).toBe(50)
    ;['rawPolish', 'plating', 'gemSort', '', undefined].forEach((dept) => expect(resolveWorkerTypeFromDept(dept), String(dept)).toBeNull())
  })
})

describe('buildWorkerModalPayload', () => {
  it('ranking row carries its own type (string or number), code and name', () => {
    expect(buildWorkerModalPayload({ workerType: 80, workerCode: 'W1', workerName: 'สมชาย' })).toEqual({ workerType: 80, workerCode: 'W1', workerName: 'สมชาย', deptKey: 'setting' })
    expect(buildWorkerModalPayload({ workerType: '50', workerCode: 'T1' })).toEqual({ workerType: 50, workerCode: 'T1', workerName: '', deptKey: 'trim' })
  })

  it('stage-detail row has no type: derived from the selected department', () => {
    expect(buildWorkerModalPayload({ workerCode: 'W9' }, 'setting')).toEqual({ workerType: 80, workerCode: 'W9', workerName: '', deptKey: 'setting' })
    expect(buildWorkerModalPayload({ workerCode: 'W9' }, 'trim').workerType).toBe(50)
  })

  it('returns null when there is no code or no derivable type', () => {
    expect(buildWorkerModalPayload({ workerType: 80 })).toBeNull()
    expect(buildWorkerModalPayload({ workerCode: 'W9' }, 'plating')).toBeNull()
    expect(buildWorkerModalPayload({ workerCode: 'W9' })).toBeNull()
    expect(buildWorkerModalPayload(null)).toBeNull()
    expect(canOpenStageWorker({ workerCode: 'W9' }, 'setting')).toBe(true)
    expect(canOpenStageWorker({ workerCode: 'W9' }, 'rawPolish')).toBe(false)
  })
})

describe('buildWorkerModalFilter / buildWorkerFilterPatch', () => {
  const page = { ...buildDefaultGoldFilter(), metal: 'SILVER', olderThanDays: 30, workerTypes: ['50'], workerCodes: ['X'], lens: 'dept' }

  it('keeps range/metal/olderThanDays, locks the type through the lens and targets the single worker', () => {
    const setting = buildWorkerModalFilter(page, { workerType: 80, workerCode: 'W1' })
    expect(setting).toMatchObject({ metal: 'SILVER', olderThanDays: 30, lens: 'setting', workerTypes: [], workerCodes: ['W1'] })
    expect(setting.start).toBe(page.start)
    expect(buildWorkerModalFilter(page, { workerType: 50, workerCode: 'T1' }).lens).toBe('tang')
  })

  it('every request body the modal sends is limited to that worker type and code', () => {
    const filter = buildWorkerModalFilter(page, { workerType: 80, workerCode: 'W1' })
    // state ของ modal ไม่มี dueScope (lens อยู่ใน filter) — ต่างจากหน้าหลักที่ dueScope เริ่ม 'all'
    const state = { draftTargets: [] }
    expect(goldConfig.sources.Gold.params(filter, state)).toMatchObject({ workerTypes: [80], workerCodes: ['W1'], metal: 'SILVER' })
    const node = (id) => goldConfig.blocks.find((b) => b.id === id)
    ;['goldOverSlips', 'goldUncovered'].forEach((id) => expect(node(id).params(filter, state), id).toMatchObject({ workerTypes: [80], workerCodes: ['W1'], metal: 'SILVER' }))
    expect(node('goldUncovered').params(filter, state).olderThanDays).toBe(30)
  })

  it('apply-as-page-filter patch uses the drawer shape (string worker types)', () => {
    expect(buildWorkerFilterPatch({ workerType: 80, workerCode: 'W1' })).toEqual({ workerTypes: ['80'], workerCodes: ['W1'] })
  })
})

describe('buildWorkersTablePayload', () => {
  it('maps a Workers row; only setting/trim get a worker type (Loss tab)', () => {
    expect(buildWorkersTablePayload({ code: 'W1', name: 'A', deptKey: 'setting', employmentType: 'IN_HOUSE' })).toEqual({
      workerType: 80,
      workerCode: 'W1',
      workerName: 'A',
      deptKey: 'setting',
      employmentType: 'IN_HOUSE'
    })
    expect(buildWorkersTablePayload({ code: 'P1', name: 'B', deptKey: 'plating' })).toMatchObject({ workerType: null, deptKey: 'plating', employmentType: null })
    expect(buildWorkersTablePayload({ code: 'P1' })).toBeNull()
    expect(buildWorkersTablePayload(null)).toBeNull()
  })
})

describe('resolveProfileTabs', () => {
  it('gold workers get loss first, then wages and jobs; other departments skip loss', () => {
    expect(resolveProfileTabs({ workerType: 80, deptKey: 'setting' })).toEqual(['loss', 'wages', 'jobs'])
    expect(resolveFirstProfileTab({ workerType: 80, deptKey: 'setting' })).toBe('loss')
    expect(resolveProfileTabs({ workerType: null, deptKey: 'plating' })).toEqual(['wages', 'jobs'])
    expect(resolveFirstProfileTab({ workerType: null, deptKey: 'plating' })).toBe('wages')
    expect(resolveProfileTabs(null)).toEqual([])
    expect(resolveFirstProfileTab(null)).toBeNull()
  })
})

describe('computeLossRank', () => {
  const peers = [
    { workerType: 80, workerCode: 'A', lossPercent: 1 },
    { workerType: 80, workerCode: 'B', lossPercent: 4 },
    { workerType: 80, workerCode: 'C', lossPercent: 2 },
    { workerType: 50, workerCode: 'T', lossPercent: 9 },
    { workerType: 80, workerCode: 'N', lossPercent: null }
  ]

  it('rank 1 = highest loss within the same type, with median and delta', () => {
    expect(computeLossRank(peers, 80, 'B')).toMatchObject({ rank: 1, total: 3, lossPercent: 4, medianPercent: 2, deltaPercent: 2 })
    expect(computeLossRank(peers, 80, 'A')).toMatchObject({ rank: 3, total: 3, deltaPercent: -1 })
  })

  it('returns null when it cannot compare', () => {
    expect(computeLossRank(peers, 50, 'T')).toBeNull()
    expect(computeLossRank(peers, 80, 'N')).toBeNull()
    expect(computeLossRank(peers, 80, 'ZZ')).toBeNull()
    expect(computeLossRank(null, 80, 'A')).toBeNull()
  })
})

describe('wages helpers', () => {
  const rows = [
    { code: 'W1', deptKey: 'setting', wages: 300, jobs: 10, plans: 6, wagePerJob: 30, shareOfDeptJobs: 25, isRateOutlier: true },
    { code: 'W2', deptKey: 'setting', wages: 700, jobs: 30 },
    { code: 'W1', deptKey: 'trim', wages: 50, jobs: 1 }
  ]

  it('findWorkerRow matches code and department', () => {
    expect(findWorkerRow(rows, { workerCode: 'W1', deptKey: 'trim' }).wages).toBe(50)
    expect(findWorkerRow(rows, { workerCode: 'W9', deptKey: 'trim' })).toBeNull()
  })

  it('computeWageStats derives monthly average and department wage share', () => {
    const stats = computeWageStats(rows[0], rows.slice(0, 2), [{}, {}, {}])
    expect(stats).toMatchObject({ wages: 300, jobs: 10, plans: 6, wagePerJob: 30, avgWagesPerMonth: 100, deptWageSharePercent: 30, shareOfDeptJobs: 25, isRateOutlier: true })
    expect(computeWageStats(null, rows, [])).toBeNull()
    expect(computeWageStats(rows[0], rows.slice(0, 2), []).avgWagesPerMonth).toBeNull()
  })

  it('request bodies carry the department, code and range', () => {
    const iso = (value) => (value ? `iso:${value}` : null)
    const worker = { workerCode: 'W1', deptKey: 'setting' }
    expect(buildWorkersRequestBody({ start: 's', end: 'e' }, worker, iso)).toEqual({ start: 'iso:s', end: 'iso:e', departmentKeys: ['setting'] })
    expect(buildWorkerMonthlyRequestBody({ start: 's', end: 'e' }, worker, iso)).toEqual({ code: 'W1', deptKey: 'setting', start: 'iso:s', end: 'iso:e' })
    expect(buildUnpaidJobsRequestBody({ start: 's', end: null }, worker, iso)).toEqual({ start: 'iso:s', end: null, departmentKeys: ['setting'], take: 0, skip: 0, sort: [] })
  })

  it('filterUnpaidJobsForWorker filters by code client-side and caps the rows', () => {
    const items = [
      ...Array.from({ length: UNPAID_JOBS_DISPLAY_LIMIT + 5 }, (_, i) => ({ workerCode: 'W1', planId: i })),
      { workerCode: 'W2', planId: 999 }
    ]
    const result = filterUnpaidJobsForWorker(items, { workerCode: 'W1' })
    expect(result.total).toBe(UNPAID_JOBS_DISPLAY_LIMIT + 5)
    expect(result.rows).toHaveLength(UNPAID_JOBS_DISPLAY_LIMIT)
    expect(result.rows[0].rowKey).toBe('0-0')
    expect(filterUnpaidJobsForWorker(null, { workerCode: 'W1' })).toEqual({ total: 0, rows: [] })
  })
})
