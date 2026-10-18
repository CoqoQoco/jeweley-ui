import { describe, it, expect } from 'vitest'

import {
  resolveWorkerTypeFromDept,
  buildWorkerModalPayload,
  canOpenStageWorker,
  buildWorkerModalFilter,
  buildWorkerFilterPatch
} from './gold-worker-modal-helpers.js'
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
    expect(buildWorkerModalPayload({ workerType: 80, workerCode: 'W1', workerName: 'สมชาย' })).toEqual({ workerType: 80, workerCode: 'W1', workerName: 'สมชาย' })
    expect(buildWorkerModalPayload({ workerType: '50', workerCode: 'T1' })).toEqual({ workerType: 50, workerCode: 'T1', workerName: '' })
  })

  it('stage-detail row has no type: derived from the selected department', () => {
    expect(buildWorkerModalPayload({ workerCode: 'W9' }, 'setting')).toEqual({ workerType: 80, workerCode: 'W9', workerName: '' })
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
