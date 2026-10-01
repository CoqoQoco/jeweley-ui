import { describe, it, expect } from 'vitest'
import {
  mapCapacitySeriesField,
  CAPACITY_PRODUCED_FIELD,
  CAPACITY_CLOSED_FIELD,
  alignSeriesByBucket,
  resolveNetVariant,
  resolveBottleneckVariant,
  resolveCostCardVariant,
  buildBottleneckSummary,
  resolveDefaultDeptKey,
  isWhatIfExcludedDept,
  resolveWhatIfExcludedDeptKeys,
  buildWhatIfDefaultMap,
  calcWhatIfExits,
  calcWhatIfQueueDays,
  buildWhatIfRows,
  sumWhatIfField,
  resolveWhatIfBottleneck,
  WHATIF_EXCLUDED_DEPT_KEY
} from './capacity-helpers.js'

describe('mapCapacitySeriesField', () => {
  it('extracts one field from every point', () => {
    expect(mapCapacitySeriesField([{ inflow: 10 }, { inflow: 20 }], 'inflow')).toEqual([10, 20])
  })

  it('keeps null as a gap instead of coercing to 0', () => {
    expect(mapCapacitySeriesField([{ activeWipEnd: null }, { activeWipEnd: 5 }], 'activeWipEnd')).toEqual([null, 5])
  })

  it('returns [] for empty/missing input', () => {
    expect(mapCapacitySeriesField(null, 'inflow')).toEqual([])
    expect(mapCapacitySeriesField([], 'inflow')).toEqual([])
  })
})

// กันสลับฟิลด์ผิดอีกรอบ (เคยสลับมาแล้วครั้งหนึ่ง 2026-10-01 — "ผลิตเสร็จ" เคยผูกกับ completed, "ปิดสำเร็จ"
// เคยผูกกับ output ซึ่งกลับกันกับที่ API agent ยืนยัน) — capacity-kpi-group.vue/capacity-trend-chart.vue
// import ค่าคงที่นี้ตรงๆ แทนการ hardcode ชื่อ field เอง เพื่อให้ spec นี้ครอบคลุมโค้ดจริงด้วย
describe('CAPACITY_PRODUCED_FIELD / CAPACITY_CLOSED_FIELD', () => {
  it('"ผลิตเสร็จ" (KPI card 2 + กราฟแท่งที่ 2) maps to field `output` (first entered a cost card)', () => {
    expect(CAPACITY_PRODUCED_FIELD).toBe('output')
  })

  it('"ปิดสำเร็จ" (กราฟแท่งที่ 3 เท่านั้น) maps to field `completed`', () => {
    expect(CAPACITY_CLOSED_FIELD).toBe('completed')
  })
})

describe('alignSeriesByBucket', () => {
  const points = [{ bucketEnd: '2026-05-31' }, { bucketEnd: '2026-06-30' }, { bucketEnd: '2026-07-31' }]

  it('looks up the matching value from a separate series array by bucketEnd', () => {
    const exitsSeries = [
      { bucketEnd: '2026-05-31', exits: 40 },
      { bucketEnd: '2026-06-30', exits: 55 },
      { bucketEnd: '2026-07-31', exits: 38 }
    ]
    expect(alignSeriesByBucket(points, exitsSeries, 'exits')).toEqual([40, 55, 38])
  })

  it('returns null (a gap) for a bucket missing from the other series instead of coercing to 0', () => {
    const exitsSeries = [{ bucketEnd: '2026-06-30', exits: 55 }]
    expect(alignSeriesByBucket(points, exitsSeries, 'exits')).toEqual([null, 55, null])
  })

  it('returns an array of nulls for empty/missing series input', () => {
    expect(alignSeriesByBucket(points, [], 'exits')).toEqual([null, null, null])
    expect(alignSeriesByBucket(points, null, 'exits')).toEqual([null, null, null])
  })

  it('returns [] for empty/missing points input', () => {
    expect(alignSeriesByBucket([], [{ bucketEnd: '2026-06-30', exits: 55 }], 'exits')).toEqual([])
    expect(alignSeriesByBucket(null, [{ bucketEnd: '2026-06-30', exits: 55 }], 'exits')).toEqual([])
  })
})

describe('resolveNetVariant', () => {
  it('is "grey" when net is null (no data yet)', () => {
    expect(resolveNetVariant(null)).toBe('grey')
  })

  it('is "warning" when backlog is growing (net > 0)', () => {
    expect(resolveNetVariant(40)).toBe('warning')
  })

  it('is "green" when net is zero or negative (flat/shrinking)', () => {
    expect(resolveNetVariant(0)).toBe('green')
    expect(resolveNetVariant(-15)).toBe('green')
  })
})

describe('resolveBottleneckVariant', () => {
  it('is "warning" when there is at least one bottleneck dept', () => {
    expect(resolveBottleneckVariant(['design'])).toBe('warning')
  })

  it('is "green" when there is no bottleneck dept', () => {
    expect(resolveBottleneckVariant([])).toBe('green')
    expect(resolveBottleneckVariant(null)).toBe('green')
  })
})

describe('resolveCostCardVariant', () => {
  it('is "grey" when pendingOver30d is null', () => {
    expect(resolveCostCardVariant(null)).toBe('grey')
  })

  it('is "warning" when there are slips pending over 30 days', () => {
    expect(resolveCostCardVariant(3)).toBe('warning')
  })

  it('is "green" when nothing is pending over 30 days', () => {
    expect(resolveCostCardVariant(0)).toBe('green')
  })
})

describe('buildBottleneckSummary', () => {
  const departments = [
    { key: 'design', queueDays: 18 },
    { key: 'setting', queueDays: 16 }
  ]

  it('maps each bottleneck key to its queueDays from departments', () => {
    expect(buildBottleneckSummary(['design', 'setting'], departments)).toEqual([
      { key: 'design', queueDays: 18 },
      { key: 'setting', queueDays: 16 }
    ])
  })

  it('keeps the key with queueDays null when it is not found in departments', () => {
    expect(buildBottleneckSummary(['trim'], departments)).toEqual([{ key: 'trim', queueDays: null }])
  })

  it('returns [] for empty/missing bottleneckDepts', () => {
    expect(buildBottleneckSummary([], departments)).toEqual([])
    expect(buildBottleneckSummary(null, departments)).toEqual([])
  })
})

describe('resolveDefaultDeptKey', () => {
  it('prefers the department flagged as the bottleneck', () => {
    const departments = [
      { key: 'design', queueDays: 5, isBottleneck: false },
      { key: 'setting', queueDays: 2, isBottleneck: true }
    ]
    expect(resolveDefaultDeptKey(departments)).toBe('setting')
  })

  it('falls back to the longest queueDays when no department is flagged', () => {
    const departments = [
      { key: 'design', queueDays: 5, isBottleneck: false },
      { key: 'setting', queueDays: 20, isBottleneck: false }
    ]
    expect(resolveDefaultDeptKey(departments)).toBe('setting')
  })

  it('falls back to the first department when nothing is comparable', () => {
    expect(resolveDefaultDeptKey([{ key: 'design', queueDays: null, isBottleneck: false }])).toBe('design')
  })

  it('returns null for empty/missing input', () => {
    expect(resolveDefaultDeptKey([])).toBeNull()
    expect(resolveDefaultDeptKey(null)).toBeNull()
  })
})

describe('isWhatIfExcludedDept', () => {
  it('excludes the cost card department regardless of workersMedian', () => {
    expect(isWhatIfExcludedDept({ key: WHATIF_EXCLUDED_DEPT_KEY, workersMedian: 5 })).toBe(true)
  })

  it('excludes any department with no workers (workersMedian 0/null) — e.g. design', () => {
    expect(isWhatIfExcludedDept({ key: 'design', workersMedian: 0 })).toBe(true)
    expect(isWhatIfExcludedDept({ key: 'design', workersMedian: null })).toBe(true)
  })

  it('does not exclude a normal department with workers', () => {
    expect(isWhatIfExcludedDept({ key: 'setting', workersMedian: 5 })).toBe(false)
  })
})

describe('resolveWhatIfExcludedDeptKeys', () => {
  it('returns the keys of every excluded department, in order', () => {
    const departments = [
      { key: 'design', workersMedian: 0 },
      { key: 'setting', workersMedian: 5 },
      { key: WHATIF_EXCLUDED_DEPT_KEY, workersMedian: 2 }
    ]
    expect(resolveWhatIfExcludedDeptKeys(departments)).toEqual(['design', WHATIF_EXCLUDED_DEPT_KEY])
  })

  it('returns [] when nothing is excluded', () => {
    expect(resolveWhatIfExcludedDeptKeys([{ key: 'setting', workersMedian: 5 }])).toEqual([])
  })

  it('returns [] for empty/missing input', () => {
    expect(resolveWhatIfExcludedDeptKeys([])).toEqual([])
    expect(resolveWhatIfExcludedDeptKeys(null)).toEqual([])
  })
})

describe('buildWhatIfDefaultMap', () => {
  it('maps every department (except cost card) to its current workersMedian', () => {
    const departments = [
      { key: 'design', workersMedian: 3 },
      { key: 'setting', workersMedian: 5 },
      { key: WHATIF_EXCLUDED_DEPT_KEY, workersMedian: 2 }
    ]
    expect(buildWhatIfDefaultMap(departments)).toEqual({ design: 3, setting: 5 })
  })

  it('excludes a department with no workers (workersMedian 0/null)', () => {
    expect(buildWhatIfDefaultMap([{ key: 'design', workersMedian: 0 }, { key: 'setting', workersMedian: 5 }])).toEqual({ setting: 5 })
  })
})

describe('calcWhatIfExits', () => {
  it('multiplies the unrounded exitsPerMonth/workersMedian ratio by the simulated worker count', () => {
    // 20 exits / 5 workers = 4/worker -> × 5 simulated workers = 20 (no change)
    expect(calcWhatIfExits(20, 5, 5)).toBe(20)
    // × 6 simulated workers = 24
    expect(calcWhatIfExits(20, 5, 6)).toBe(24)
  })

  it('returns null when exitsPerMonth is unknown', () => {
    expect(calcWhatIfExits(null, 5, 5)).toBeNull()
  })

  it('returns null when workersMedian is 0/missing (division by zero)', () => {
    expect(calcWhatIfExits(20, 0, 5)).toBeNull()
    expect(calcWhatIfExits(20, null, 5)).toBeNull()
  })

  it('returns null when workers is not a finite number', () => {
    expect(calcWhatIfExits(20, 5, NaN)).toBeNull()
  })
})

describe('calcWhatIfQueueDays', () => {
  it('computes activeWip divided by the simulated daily exit rate', () => {
    // exits/month = 60 -> 2/day -> 90 backlog / 2 = 45 days
    expect(calcWhatIfQueueDays(90, 60)).toBe(45)
  })

  it('returns null when exits is 0 or negative (division by zero)', () => {
    expect(calcWhatIfQueueDays(90, 0)).toBeNull()
    expect(calcWhatIfQueueDays(90, -5)).toBeNull()
  })

  it('returns null when activeWip is null', () => {
    expect(calcWhatIfQueueDays(null, 60)).toBeNull()
  })
})

describe('buildWhatIfRows', () => {
  const departments = [
    { key: 'design', workersMedian: 4, exitsPerMonth: 20, activeWip: 90, queueDays: 22.5, isBottleneck: true },
    { key: WHATIF_EXCLUDED_DEPT_KEY, workersMedian: 2, exitsPerMonth: 15, activeWip: 10, queueDays: 5, isBottleneck: false }
  ]

  it('excludes the cost card department', () => {
    const rows = buildWhatIfRows(departments, {})
    expect(rows.map((r) => r.key)).toEqual(['design'])
  })

  it('excludes a department with no workers (workersMedian 0) even if not cost card', () => {
    const rows = buildWhatIfRows([...departments, { key: 'rawPolish', workersMedian: 0, exitsPerMonth: 0 }], {})
    expect(rows.map((r) => r.key)).toEqual(['design'])
  })

  it('uses the workersMap draft value when provided, falling back to workersMedian', () => {
    const rows = buildWhatIfRows(departments, { design: 6 })
    expect(rows[0].workers).toBe(6)
    // 20 exits / 4 workersMedian = 5/worker -> × 6 simulated = 30
    expect(rows[0].exitsNew).toBe(30)
    expect(rows[0].queueDaysNew).toBe(90 / (30 / 30))
  })

  it('falls back to workersMedian when the workersMap has no entry for that dept', () => {
    const rows = buildWhatIfRows(departments, {})
    expect(rows[0].workers).toBe(4)
  })

  it('carries over the current queueDays/isBottleneck for comparison', () => {
    const rows = buildWhatIfRows(departments, {})
    expect(rows[0].queueDaysNow).toBe(22.5)
    expect(rows[0].isBottleneckNow).toBe(true)
  })

  // บัคจริงที่เจอบน prod: ไม่เปลี่ยนอะไรเลย (workers = workersMedian) ต้องได้เลขเดิมเป๊ะ ไม่ใช่แค่ "ใกล้เคียง"
  // จากการคำนวณซ้ำที่มี rounding error สะสม — แก้โดย short-circuit คืนค่า API ตรงๆ เมื่อไม่มีการเปลี่ยนแปลง
  it('returns the exact same exitsPerMonth/queueDays as the API when workers equals workersMedian (no-change scenario)', () => {
    const rows = buildWhatIfRows(departments, { design: 4 })
    expect(rows[0].exitsNew).toBe(rows[0].exitsPerMonth)
    expect(rows[0].queueDaysNew).toBe(rows[0].queueDaysNow)
  })

  it('only changes the queue for the department whose worker count actually changed (+1 on one dept)', () => {
    const multi = [
      { key: 'design', workersMedian: 4, exitsPerMonth: 20, activeWip: 90, queueDays: 22.5, isBottleneck: true },
      { key: 'setting', workersMedian: 3, exitsPerMonth: 15, activeWip: 60, queueDays: 40, isBottleneck: false }
    ]
    const rows = buildWhatIfRows(multi, { design: 5, setting: 3 })
    const designRow = rows.find((r) => r.key === 'design')
    const settingRow = rows.find((r) => r.key === 'setting')
    expect(designRow.queueDaysNew).not.toBe(designRow.queueDaysNow)
    expect(settingRow.queueDaysNew).toBe(settingRow.queueDaysNow)
  })
})

describe('sumWhatIfField', () => {
  it('sums only the non-null values', () => {
    expect(sumWhatIfField([{ queueDaysNow: 10 }, { queueDaysNow: null }, { queueDaysNow: 5 }], 'queueDaysNow')).toBe(15)
  })

  it('returns null when every row is null (nothing computable)', () => {
    expect(sumWhatIfField([{ queueDaysNow: null }], 'queueDaysNow')).toBeNull()
  })

  it('returns null for empty/missing input', () => {
    expect(sumWhatIfField([], 'queueDaysNow')).toBeNull()
    expect(sumWhatIfField(null, 'queueDaysNow')).toBeNull()
  })
})

describe('resolveWhatIfBottleneck', () => {
  it('returns the key of the row with the highest value for the given field', () => {
    const rows = [
      { key: 'design', queueDaysNow: 10 },
      { key: 'setting', queueDaysNow: 25 }
    ]
    expect(resolveWhatIfBottleneck(rows, 'queueDaysNow')).toBe('setting')
  })

  it('ignores rows where the field is null', () => {
    const rows = [
      { key: 'design', queueDaysNow: null },
      { key: 'setting', queueDaysNow: 25 }
    ]
    expect(resolveWhatIfBottleneck(rows, 'queueDaysNow')).toBe('setting')
  })

  it('returns null when every row is null', () => {
    expect(resolveWhatIfBottleneck([{ key: 'design', queueDaysNow: null }], 'queueDaysNow')).toBeNull()
  })

  it('returns null for empty input', () => {
    expect(resolveWhatIfBottleneck([], 'queueDaysNow')).toBeNull()
  })
})
