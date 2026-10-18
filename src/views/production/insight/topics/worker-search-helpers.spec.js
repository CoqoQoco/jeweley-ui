import { describe, it, expect } from 'vitest'
import { createI18n } from 'vue-i18n'

import productionInsightTh from '@/language/view/production-insight/th.js'
import productionInsightEn from '@/language/view/production-insight/en.js'
import executiveTh from '@/language/view/executive/th.js'
import {
  WORKER_SEARCH_LIMIT,
  isQueueWorker,
  buildWorkerSearchOptions,
  searchWorkerOptions,
  buildWorkerSearchPayload,
  buildWorkerSearchRangeKey,
  buildWorkerSearchRequestBody
} from './worker-search-helpers.js'

const i18n = createI18n({ legacy: false, locale: 'th', messages: { th: { view: { productionInsight: productionInsightTh, executive: executiveTh } } } })
const t = i18n.global.t

const rows = [
  { code: 'B004', name: 'สมศักดิ์', deptKey: 'setting', employmentType: 'IN_HOUSE' },
  { code: 'B004', name: 'สมศักดิ์', deptKey: 'setting', employmentType: 'IN_HOUSE' },
  { code: 'B004', name: 'สมศักดิ์', deptKey: 'plating', employmentType: 'OUTSIDE' },
  { code: 'CG9K', name: 'รอจ่ายขัดชุบ 9K', deptKey: 'plating' },
  { code: 'T1', name: ' รอคิวแต่ง', deptKey: 'trim' },
  { code: '', name: 'ไม่มีรหัส', deptKey: 'trim' },
  { code: 'X1', name: 'ไม่มีแผนก' },
  { code: 'A10', name: 'อรทัย', deptKey: 'trim' },
  { code: 'S01', name: 'สมชาย', deptKey: 'gemSort' }
]

describe('isQueueWorker', () => {
  it('name starting with รอ (after trim) is a parking slot; real names and empty are not', () => {
    expect(isQueueWorker({ name: 'รอจ่ายขัดชุบ 9K' })).toBe(true)
    expect(isQueueWorker({ name: '  รอคิว' })).toBe(true)
    expect(isQueueWorker({ name: 'สมชาย' })).toBe(false)
    expect(isQueueWorker({ name: 'ธีรอ' })).toBe(false)
    expect(isQueueWorker({})).toBe(false)
    expect(isQueueWorker(null)).toBe(false)
  })
})

describe('buildWorkerSearchOptions', () => {
  const options = buildWorkerSearchOptions(rows, t)

  it('dedupes by (code, dept), keeps one person per department, drops queue slots and rows without code/dept', () => {
    expect(options.map((o) => o.key)).toEqual(['B004|setting', 'B004|plating', 'A10|trim', 'S01|gemSort'])
    expect(buildWorkerSearchOptions(null, t)).toEqual([])
  })

  it('label is name · code · department (th) so a person in two departments can be told apart', () => {
    expect(options[0].label).toBe(`สมศักดิ์ · B004 · ${t('view.executive.department.setting')}`)
    expect(options[1].label).toBe(`สมศักดิ์ · B004 · ${t('view.executive.department.plating')}`)
    expect(options[0].label).not.toBe(options[1].label)
  })

  it('label falls back to the code when a worker has no name', () => {
    expect(buildWorkerSearchOptions([{ code: 'Z9', deptKey: 'trim' }], t)[0].label).toContain('Z9 · Z9')
  })
})

describe('searchWorkerOptions', () => {
  const options = buildWorkerSearchOptions(
    [
      { code: 'B1', name: 'สมศักดิ์', deptKey: 'setting' },
      { code: 'S01', name: 'สมชาย', deptKey: 'gemSort' },
      { code: 'X5', name: 'ประสม', deptKey: 'trim' },
      { code: 'SOM', name: 'อรทัย', deptKey: 'trim' },
      { code: 'ab12', name: 'Ann', deptKey: 'plating' }
    ],
    t
  )

  it('matches name OR code, case-insensitive substring; empty query returns nothing', () => {
    expect(searchWorkerOptions(options, 'สม').map((o) => o.code)).toEqual(['S01', 'B1', 'X5'])
    expect(searchWorkerOptions(options, 'AB1').map((o) => o.code)).toEqual(['ab12'])
    expect(searchWorkerOptions(options, 'ann').map((o) => o.code)).toEqual(['ab12'])
    expect(searchWorkerOptions(options, '   ')).toEqual([])
    expect(searchWorkerOptions(options, 'ไม่มีใคร')).toEqual([])
  })

  it('ranks exact code, then code prefix, then name prefix, then the rest alphabetically', () => {
    // "som": รหัส SOM ตรงเป๊ะก่อน
    expect(searchWorkerOptions(options, 'som').map((o) => o.code)).toEqual(['SOM'])
    const mixed = buildWorkerSearchOptions(
      [
        { code: 'Q1', name: 'ใจสม', deptKey: 'trim' },
        { code: 'S2', name: 'สมบัติ', deptKey: 'trim' },
        { code: 'S', name: 'x', deptKey: 'trim' },
        { code: 'SS1', name: 'y', deptKey: 'trim' }
      ],
      t
    )
    // รหัสตรงเป๊ะ → รหัสขึ้นต้น (ตามชื่อ) ; ชื่อขึ้นต้นมาก่อนชื่อที่แค่มีคำนี้อยู่ข้างใน
    expect(searchWorkerOptions(mixed, 's').map((o) => o.code)).toEqual(['S', 'S2', 'SS1'])
    expect(searchWorkerOptions(mixed, 'สม').map((o) => o.code)).toEqual(['S2', 'Q1'])
  })

  it('caps the result at the limit', () => {
    const many = buildWorkerSearchOptions(
      Array.from({ length: WORKER_SEARCH_LIMIT + 10 }, (_, i) => ({ code: `C${i}`, name: `ช่าง${i}`, deptKey: 'trim' })),
      t
    )
    expect(searchWorkerOptions(many, 'ช่าง')).toHaveLength(WORKER_SEARCH_LIMIT)
    expect(searchWorkerOptions(many, 'ช่าง', 5)).toHaveLength(5)
  })
})

describe('buildWorkerSearchPayload', () => {
  const options = buildWorkerSearchOptions(rows, t)

  it('gives the same payload shape as clicking a name in the workers table (type derived from the department)', () => {
    expect(buildWorkerSearchPayload(options[0])).toEqual({ workerType: 80, workerCode: 'B004', workerName: 'สมศักดิ์', deptKey: 'setting', employmentType: 'IN_HOUSE' })
    expect(buildWorkerSearchPayload(options[1])).toEqual({ workerType: null, workerCode: 'B004', workerName: 'สมศักดิ์', deptKey: 'plating', employmentType: 'OUTSIDE' })
    expect(buildWorkerSearchPayload({ code: 'T9', name: 'ต', deptKey: 'trim' }).workerType).toBe(50)
    expect(buildWorkerSearchPayload(null)).toBeNull()
  })
})

describe('range key / request body', () => {
  const iso = (value) => (value ? `iso:${value}` : null)

  it('depends only on start/end and sends no department or employment filter', () => {
    const a = { start: 's', end: 'e', departmentKeys: ['trim'], employmentTypes: ['OUTSIDE'] }
    expect(buildWorkerSearchRequestBody(a, iso)).toEqual({ start: 'iso:s', end: 'iso:e' })
    expect(buildWorkerSearchRangeKey(a, iso)).toBe(buildWorkerSearchRangeKey({ start: 's', end: 'e' }, iso))
    expect(buildWorkerSearchRangeKey({ start: 's2', end: 'e' }, iso)).not.toBe(buildWorkerSearchRangeKey(a, iso))
  })
})

describe('i18n', () => {
  it('workerSearch keys exist in th and en', () => {
    ;['placeholder', 'aria', 'empty', 'optionLabel'].forEach((key) => {
      expect(productionInsightTh.workerSearch[key], `th ${key}`).toBeTruthy()
      expect(productionInsightEn.workerSearch[key], `en ${key}`).toBeTruthy()
    })
  })
})
