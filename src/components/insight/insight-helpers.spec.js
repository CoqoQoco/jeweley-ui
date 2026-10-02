import { describe, it, expect } from 'vitest'

import {
  FINDING_SEVERITIES,
  STATUS_VALUES,
  resolveFindingSeverityIcon,
  resolveStatusIcon,
  worstStatus,
  resolveFindingParams,
  formatWorkerNameList,
  formatDeptQueueList,
  formatThaiMonthYear,
  formatBucketMonthLabels,
  buildFindingKey,
  formatInsightNumber,
  formatInsightPercent,
  resolveHelpKey
} from './insight-helpers.js'

describe('resolveFindingSeverityIcon', () => {
  it('maps every known severity to an icon class', () => {
    FINDING_SEVERITIES.forEach((severity) => {
      expect(resolveFindingSeverityIcon(severity)).toMatch(/^bi-/)
    })
  })

  it('falls back to the info icon for an unknown severity', () => {
    expect(resolveFindingSeverityIcon('bogus')).toBe(resolveFindingSeverityIcon('info'))
  })
})

describe('resolveStatusIcon', () => {
  it('maps every known status to an icon class', () => {
    STATUS_VALUES.forEach((status) => {
      expect(resolveStatusIcon(status)).toMatch(/^bi-/)
    })
  })

  it('falls back to the ok icon for an unknown status', () => {
    expect(resolveStatusIcon('bogus')).toBe(resolveStatusIcon('ok'))
  })
})

describe('worstStatus', () => {
  it('ranks critical > warning > ok', () => {
    expect(worstStatus('ok', 'warning')).toBe('warning')
    expect(worstStatus('warning', 'critical')).toBe('critical')
    expect(worstStatus('critical', 'ok')).toBe('critical')
  })

  it('is order-independent', () => {
    expect(worstStatus('warning', 'ok')).toBe(worstStatus('ok', 'warning'))
  })

  it('handles empty/missing values gracefully', () => {
    expect(worstStatus('', 'warning')).toBe('warning')
    expect(worstStatus('critical', '')).toBe('critical')
    expect(worstStatus('', '')).toBe('')
  })
})

describe('resolveFindingParams', () => {
  it('leaves params untouched when there is no deptKey', () => {
    expect(resolveFindingParams({ count: 5, percent: 12.5 })).toEqual({ count: 5, percent: 12.5 })
  })

  it('translates deptKey via the injected translateDept function', () => {
    const translateDept = (key) => `แผนก-${key}`
    expect(resolveFindingParams({ deptKey: 'setting', count: 3 }, translateDept)).toEqual({
      deptKey: 'แผนก-setting',
      count: 3
    })
  })

  // topDeptKey (GOLD_STAGE_PENDING_RETURN) reuses the same translateDept injector as deptKey — the caller's
  // translateDept is responsible for disambiguating wip string keys vs gold-stage numeric codes
  it('translates topDeptKey via the same translateDept function used for deptKey', () => {
    const translateDept = (key) => `แผนก-${key}`
    expect(resolveFindingParams({ topDeptKey: 80, count: 3 }, translateDept)).toEqual({
      topDeptKey: 'แผนก-80',
      count: 3
    })
  })

  it('leaves topDeptKey as-is when no translateDept function is given', () => {
    expect(resolveFindingParams({ topDeptKey: 80 })).toEqual({ topDeptKey: 80 })
  })

  it('returns an empty object when params is null/undefined', () => {
    expect(resolveFindingParams(null)).toEqual({})
    expect(resolveFindingParams(undefined)).toEqual({})
  })

  it('leaves deptKey as-is when no translateDept function is given', () => {
    expect(resolveFindingParams({ deptKey: 'setting' })).toEqual({ deptKey: 'setting' })
  })

  it('translates workerType via the injected translateWorkerType function', () => {
    const translateWorkerType = (type) => `ช่าง-${type}`
    expect(resolveFindingParams({ workerType: 80, count: 3 }, undefined, translateWorkerType)).toEqual({
      workerType: 'ช่าง-80',
      count: 3
    })
  })

  it('leaves workerType as-is when no translateWorkerType function is given', () => {
    expect(resolveFindingParams({ workerType: 80 })).toEqual({ workerType: 80 })
  })

  it('translates both deptKey and workerType together when both are present', () => {
    const translateDept = (key) => `แผนก-${key}`
    const translateWorkerType = (type) => `ช่าง-${type}`
    expect(resolveFindingParams({ deptKey: 'setting', workerType: 50 }, translateDept, translateWorkerType)).toEqual({
      deptKey: 'แผนก-setting',
      workerType: 'ช่าง-50'
    })
  })

  it('translates metal via the injected translateMetal function', () => {
    const translateMetal = (metal) => (metal === 'GOLD' ? 'ทอง' : 'เงิน')
    expect(resolveFindingParams({ metal: 'SILVER', count: 3 }, undefined, undefined, translateMetal)).toEqual({ metal: 'เงิน', count: 3 })
  })

  it('leaves metal as-is when no translateMetal function is given', () => {
    expect(resolveFindingParams({ metal: 'GOLD' })).toEqual({ metal: 'GOLD' })
  })

  it('translates deptKey, workerType, and metal together when all three are present', () => {
    const translateDept = (key) => `แผนก-${key}`
    const translateWorkerType = (type) => `ช่าง-${type}`
    const translateMetal = (metal) => `โลหะ-${metal}`
    expect(resolveFindingParams({ deptKey: 'setting', workerType: 50, metal: 'GOLD' }, translateDept, translateWorkerType, translateMetal)).toEqual({
      deptKey: 'แผนก-setting',
      workerType: 'ช่าง-50',
      metal: 'โลหะ-GOLD'
    })
  })

  it('formats a workers[] param into a single name-list string via formatWorkerNameList, using count for overflow', () => {
    const workers = [{ workerCode: 'W1', workerName: 'ขวัญชัย' }, { workerCode: 'W2', workerName: 'ณฐกร' }, { workerCode: 'W3', workerName: 'ศิริมงคล' }]
    expect(resolveFindingParams({ workers, count: 4 })).toEqual({ workers: 'ขวัญชัย, ณฐกร, ศิริมงคล และอีก 1 คน', count: 4 })
  })

  // workerNames (ACT_CROSS_TRAIN ของหมวด "ช่างและค่าแรง") เป็น array ของสตริงชื่อดิบ ไม่มี count แยก (array
  // ที่ส่งมาคือรายชื่อเต็มเสมอ) — ไม่ควรมี "และอีก N คน" ต่อท้ายถ้า array สั้นกว่า maxNames
  it('formats a workerNames[] param (plain strings, no separate count) into a single name-list string', () => {
    expect(resolveFindingParams({ workerNames: ['สมชาย', 'สมหญิง'] })).toEqual({ workerNames: 'สมชาย และ สมหญิง' })
  })

  it('passes a custom maxWorkerNames through to formatWorkerNameList (e.g. ACT_TALK_WORKER shows up to 5)', () => {
    const workers = [
      { workerName: 'หนึ่ง' },
      { workerName: 'สอง' },
      { workerName: 'สาม' },
      { workerName: 'สี่' },
      { workerName: 'ห้า' },
      { workerName: 'หก' }
    ]
    expect(resolveFindingParams({ workers, count: 6 }, undefined, undefined, undefined, 5)).toEqual({
      workers: 'หนึ่ง, สอง, สาม, สี่, ห้า และอีก 1 คน',
      count: 6
    })
  })

  it('formats params whose key ends in Money with thousand separators and no decimals', () => {
    expect(resolveFindingParams({ excessMoney: 9008.4 })).toEqual({ excessMoney: '9,008' })
  })

  // Wages (FC_WAGES_NEXT_MONTH.projectedWages/avgWages ของหมวด "ช่างและค่าแรง") จัดรูปแบบเหมือน Money เป๊ะ
  it('formats params whose key ends in Wages the same way as Money (thousand separators, no decimals)', () => {
    expect(resolveFindingParams({ projectedWages: 850000.4, avgWages: 820000 })).toEqual({ projectedWages: '850,000', avgWages: '820,000' })
  })

  it('formats params whose key ends in Gram with up to 2 decimals', () => {
    expect(resolveFindingParams({ excessGram: 3.456 })).toEqual({ excessGram: '3.46' })
  })

  it('formats params whose key ends in Percent with up to 2 decimals', () => {
    expect(resolveFindingParams({ lossPercent: 2.567 })).toEqual({ lossPercent: '2.57' })
  })

  it('does not reformat short lowercase param names that happen to end in the same letters (e.g. "percent"/"count")', () => {
    expect(resolveFindingParams({ percent: 12.3456, count: 5 })).toEqual({ percent: 12.3456, count: 5 })
  })

  it('formats a depts[] param into a single list string via formatDeptQueueList, translating deptKey', () => {
    const translateDept = (key) => `แผนก-${key}`
    const depts = [
      { deptKey: 'trim', queueDays: 37, waitingNow: 180 },
      { deptKey: 'costCard', queueDays: 35, waitingNow: 105 }
    ]
    expect(resolveFindingParams({ depts }, translateDept)).toEqual({
      depts: 'แผนก-trim ~37 วัน (รอ 180 ใบ), แผนก-costCard ~35 วัน (รอ 105 ใบ)'
    })
  })

  it('formats a peakMonth param ("YYYY-MM") into a Thai month/year string', () => {
    expect(resolveFindingParams({ peakMonth: '2026-06' })).toEqual({ peakMonth: 'มิ.ย. 2026' })
  })
})

describe('formatWorkerNameList', () => {
  it('joins up to maxNames (default 3) names and appends "และอีก N คน" using count for the true total', () => {
    const workers = [{ workerName: 'ขวัญชัย' }, { workerName: 'ณฐกร' }, { workerName: 'ศิริมงคล' }]
    expect(formatWorkerNameList(workers, 4)).toBe('ขวัญชัย, ณฐกร, ศิริมงคล และอีก 1 คน')
  })

  it('uses "และ" before the last name when there is no overflow', () => {
    expect(formatWorkerNameList([{ workerName: 'เอ' }, { workerName: 'บี' }], 2)).toBe('เอ และ บี')
  })

  it('returns the single name as-is when there is exactly one worker', () => {
    expect(formatWorkerNameList([{ workerName: 'เอ' }], 1)).toBe('เอ')
  })

  it('returns an empty string for empty/missing input', () => {
    expect(formatWorkerNameList([], 0)).toBe('')
    expect(formatWorkerNameList(null, 0)).toBe('')
  })

  it('respects a custom maxNames', () => {
    const workers = [{ workerName: 'เอ' }, { workerName: 'บี' }, { workerName: 'ซี' }]
    expect(formatWorkerNameList(workers, 3, 2)).toBe('เอ, บี และอีก 1 คน')
  })

  // workers-helpers.js (หมวด "ช่างและค่าแรง") ใช้ field ชื่อ `name` ไม่ใช่ `workerName` — ยืนยันจาก API agent
  // 2026-10-01 — ต้องรองรับทั้ง 2 ชื่อ field พร้อมกัน (ไม่ทุบของเดิม)
  it('falls back to the "name" field (workers-topic shape) when "workerName" is absent', () => {
    expect(formatWorkerNameList([{ name: 'หนิง' }], 1)).toBe('หนิง')
  })

  // รองรับ array ของสตริงชื่อดิบตรงๆ (workerNames[] ของ ACT_CROSS_TRAIN) ไม่ใช่แค่ array ของ object
  it('accepts a plain array of name strings (e.g. workerNames[])', () => {
    expect(formatWorkerNameList(['เอ', 'บี'], 2)).toBe('เอ และ บี')
  })

  // WRK_RATE_OUTLIER/ACT_REVIEW_RATE: worker ที่มี wagePerJob+medianPerJob ครบคู่ ต้องต่อท้ายเป็น
  // "{ชื่อ} {ค่าแรง} ฿/งาน (ค่ากลาง {ค่ากลาง})" ตามตัวอย่างที่ API agent ให้ไว้ตรงๆ
  it('appends "{wagePerJob} ฿/งาน (ค่ากลาง {medianPerJob})" when both extra fields are present', () => {
    expect(formatWorkerNameList([{ name: 'หนิง', wagePerJob: 1290, medianPerJob: 145 }], 1)).toBe('หนิง 1,290 ฿/งาน (ค่ากลาง 145)')
  })

  it('does not append the wage breakdown when only one of wagePerJob/medianPerJob is present', () => {
    expect(formatWorkerNameList([{ name: 'หนิง', wagePerJob: 1290, medianPerJob: null }], 1)).toBe('หนิง')
  })
})

describe('formatDeptQueueList', () => {
  it('joins every dept into "{name} ~{queueDays} วัน (รอ {waitingNow} ใบ)" (API already sends top N, no further truncation)', () => {
    const translateDept = (key) => `แผนก-${key}`
    const depts = [
      { deptKey: 'trim', queueDays: 37, waitingNow: 180 },
      { deptKey: 'costCard', queueDays: 35, waitingNow: 105 }
    ]
    expect(formatDeptQueueList(depts, translateDept)).toBe('แผนก-trim ~37 วัน (รอ 180 ใบ), แผนก-costCard ~35 วัน (รอ 105 ใบ)')
  })

  it('falls back to the raw deptKey when no translateDept function is given', () => {
    expect(formatDeptQueueList([{ deptKey: 'trim', queueDays: 37, waitingNow: 180 }])).toBe('trim ~37 วัน (รอ 180 ใบ)')
  })

  it('shows "—" for a missing queueDays/waitingNow instead of a misleading 0', () => {
    expect(formatDeptQueueList([{ deptKey: 'trim', queueDays: null, waitingNow: null }])).toBe('trim ~— วัน (รอ — ใบ)')
  })

  it('returns an empty string for empty/missing input', () => {
    expect(formatDeptQueueList([])).toBe('')
    expect(formatDeptQueueList(null)).toBe('')
  })
})

describe('formatThaiMonthYear', () => {
  it('converts a "YYYY-MM" string into a Thai month abbreviation + Gregorian year', () => {
    expect(formatThaiMonthYear('2026-06')).toBe('มิ.ย. 2026')
    expect(formatThaiMonthYear('2026-01')).toBe('ม.ค. 2026')
    expect(formatThaiMonthYear('2026-12')).toBe('ธ.ค. 2026')
  })

  it('returns the original value unchanged when it does not match the "YYYY-MM" shape', () => {
    expect(formatThaiMonthYear('2026-06-01')).toBe('2026-06-01')
    expect(formatThaiMonthYear(null)).toBeNull()
    expect(formatThaiMonthYear(undefined)).toBeUndefined()
  })
})

describe('formatBucketMonthLabels', () => {
  it('labels a run of full-month buckets by their own month (first point falls back to end-minus-1-day)', () => {
    // เม.ย., พ.ค., มิ.ย., ก.ค. — bucketEnd แต่ละจุดเป็น exclusive boundary (วันที่ 1 ของเดือนถัดไป)
    const buckets = ['2026-05-01', '2026-06-01', '2026-07-01', '2026-08-01']
    expect(formatBucketMonthLabels(buckets)).toEqual(['เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.'])
  })

  // บั๊กจริงที่เจอบน prod: ช่วง 6 เดือนที่ตัดวันนี้ (1 ต.ค.) bucket สุดท้ายเป็นช่วงไม่เต็มเดือน ได้ bucketEnd
  // ตรงกับ exclusive end ของเดือนก่อนหน้าพอดี (ทั้งคู่ "2026-10-01") ทำให้วิธีเดิม (ลบ 1 วันจาก bucketEnd ของ
  // ตัวเอง) ได้ป้ายซ้ำกันเป็น "ก.ย. | ก.ย." — ต้องใช้ bucketEnd ของจุดก่อนหน้าเป็นจุดเริ่มของจุดถัดไปแทน
  it('gives the trailing partial bucket its own distinct month label, fixing the "ก.ย. | ก.ย." duplicate on prod', () => {
    const buckets = ['2026-07-01', '2026-08-01', '2026-09-01', '2026-10-01', '2026-10-01']
    expect(formatBucketMonthLabels(buckets)).toEqual(['มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.'])
  })

  it('returns [] for empty/missing input', () => {
    expect(formatBucketMonthLabels([])).toEqual([])
    expect(formatBucketMonthLabels(null)).toEqual([])
    expect(formatBucketMonthLabels(undefined)).toEqual([])
  })

  it('returns an empty string per invalid/missing entry instead of throwing (each label anchors off the previous raw entry, not a cleaned one)', () => {
    expect(formatBucketMonthLabels([null, '2026-06-01', 'not-a-date'])).toEqual(['', '', 'มิ.ย.'])
  })
})

describe('buildFindingKey', () => {
  it('combines code and params into a stable string', () => {
    expect(buildFindingKey('WIP_STALE', { count: 5 })).toBe('WIP_STALE:{"count":5}')
  })

  it('produces different keys for the same code with different params', () => {
    const keyA = buildFindingKey('WIP_DEPT_STALE_TOP', { deptKey: 'setting' })
    const keyB = buildFindingKey('WIP_DEPT_STALE_TOP', { deptKey: 'trim' })
    expect(keyA).not.toBe(keyB)
  })

  it('handles missing params', () => {
    expect(buildFindingKey('WIP_MELTED_OPEN')).toBe('WIP_MELTED_OPEN:{}')
  })
})

describe('formatInsightNumber', () => {
  it('formats using Thai thousands separators', () => {
    expect(formatInsightNumber(1234)).toBe('1,234')
  })

  it('defaults to 0 for falsy values', () => {
    expect(formatInsightNumber(null)).toBe('0')
    expect(formatInsightNumber(undefined)).toBe('0')
    expect(formatInsightNumber(0)).toBe('0')
  })
})

describe('formatInsightPercent', () => {
  it('appends a % sign', () => {
    expect(formatInsightPercent(12)).toBe('12%')
  })

  it('keeps up to 1 decimal place', () => {
    expect(formatInsightPercent(12.34)).toBe('12.3%')
  })

  it('defaults to 0% for falsy values', () => {
    expect(formatInsightPercent(null)).toBe('0%')
  })
})

describe('resolveHelpKey', () => {
  it('returns the help i18n key for every known WIP code', () => {
    ;[
      'WIP_STALE',
      'WIP_OVERDUE',
      'WIP_DEPT_STALE_TOP',
      'WIP_MELTED_OPEN',
      'WIP_DEPT_GROWING',
      'FC_BECOMING_STALE',
      'FC_DUE_SOON_AT_RISK',
      'FC_BOTTLENECK',
      'STAGE_OVER_STANDARD',
      'STAGE_ABNORMAL_DWELL',
      'STAGE_WAIT_DOMINANT',
      'FC_STAGE_LEADTIME_RISING',
      'DLV_ONTIME_BELOW_TARGET',
      'DLV_LEAD_UNDERESTIMATED',
      'DLV_OPEN_OVERDUE',
      'DLV_STUCK_AFTER_COSTCARD',
      'FC_DLV_AT_RISK',
      'FC_DLV_ONTIME_DECLINING',
      'GOLD_EXCESS_OVER_ALLOWANCE',
      'GOLD_LOSS_ABOVE_TARGET',
      'GOLD_ALLOWANCE_ABOVE_TARGET',
      'GOLD_MOST_WORKERS_OVER',
      'GOLD_REPEAT_OFFENDER',
      'GOLD_SLIP_COVERAGE_LOW',
      'FC_GOLD_EXCESS_PROJECTED',
      'FC_GOLD_LOSS_RISING',
      'CAP_BACKLOG_MONTHS',
      'CAP_QUEUE_BOTTLENECK',
      'CAP_INFLOW_OVER_OUTPUT',
      'CAP_COSTCARD_SLOW',
      'FC_BACKLOG_PROJECTED',
      'FC_PEAK_RISK',
      'GOLD_STAGE_ABOVE_TARGET',
      'GOLD_STAGE_PENDING_RETURN',
      'GOLD_STAGE_OUTLIER_JOBS',
      'FC_GOLD_STAGE_RISING',
      'WRK_CONCENTRATION',
      'WRK_RATE_OUTLIER',
      'WRK_WAGE_PER_PLAN_RISING',
      'WRK_UNPAID_JOBS',
      'WRK_GOLD_REPEAT',
      'FC_WAGES_NEXT_MONTH',
      'FC_KEY_PERSON_RISK'
    ].forEach((code) => {
      expect(resolveHelpKey(code)).toBe(`view.productionInsight.help.${code}`)
    })
  })

  it('returns an empty string for a code without a defined help entry (e.g. placeholder/action codes)', () => {
    expect(resolveHelpKey('DELIVERY_PLACEHOLDER_OVERDUE')).toBe('')
    expect(resolveHelpKey('ACT_CLOSE_STALE')).toBe('')
    expect(resolveHelpKey('bogus')).toBe('')
  })
})
