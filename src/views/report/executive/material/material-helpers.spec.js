import { describe, it, expect } from 'vitest'

import {
  MATERIAL_ENDPOINT,
  parseKindQuery,
  kindToQuery,
  buildOverviewParams,
  formatGram,
  formatDays,
  sortItemsBySeverity,
  filterItems,
  itemFilterCounts,
  resolveStatusVariant,
  buildItemRows,
  buildGroupRows,
  buildGroupSlices,
  aggregateBySize,
  resolveItemFilter,
  resolveMaterialReportTarget,
  buildUsageHint,
  buildMonthLabels,
  createMinForm,
  validateMinForm,
  buildMinSaveBody,
  buildMinDeleteBody,
  describeAutoMin,
  POLICY_FIELDS,
  createPolicyForm,
  validatePolicyForm,
  buildPolicySaveBody,
  hasPolicyChanges,
  GOLD_STAGE_ENDPOINT,
  buildGoldStageParams,
  sumPendingWithWorker,
  buildWithWorkerLine,
  shouldShowNegativeNotice,
  areAllItemsNegative,
  remapMaterialFindings,
  buildGroupBarRows,
  STATUS_ORDER,
  ITEM_FILTERS
} from './material-helpers.js'

const t = (key, params) => (params ? `${key}:${JSON.stringify(params)}` : key)

const items = [
  { itemKey: 'a', label: 'A', status: 'ok', coverDays: 90, onHand: 10, sizeCode: 'S1', sizeName: 'ไซส์1', isDead: false },
  { itemKey: 'b', label: 'B', status: 'below', coverDays: 5, onHand: 20, sizeCode: 'S1', isDead: false },
  { itemKey: 'c', label: 'C', status: 'zero', coverDays: 0, onHand: 0, isDead: false },
  { itemKey: 'd', label: 'D', status: 'dead', coverDays: null, onHand: 30, sizeCode: 'S2', isDead: true, neverConsumed: true },
  { itemKey: 'e', label: 'E', status: 'below', coverDays: 2, onHand: 5, isDead: true, lastMovementDate: '2026-09-01T00:00:00', daysSinceMove: 50 },
  { itemKey: 'f', label: 'F', status: 'near', coverDays: null, onHand: 1, isDead: false }
]

describe('request / URL helpers', () => {
  it('Overview body has exactly {kind, months}', () => {
    expect(MATERIAL_ENDPOINT).toBe('MaterialInsight/Overview')
    expect(buildOverviewParams('GOLD')).toEqual({ kind: 'GOLD', months: 12 })
    expect(Object.keys(buildOverviewParams()).sort()).toEqual(['kind', 'months'])
  })

  it('kind query: default (gold) is omitted, unknown falls back to gold', () => {
    expect(parseKindQuery('gold')).toBe('GOLD')
    expect(parseKindQuery('GEM')).toBe('GOLD')
    expect(parseKindQuery(undefined)).toBe('GOLD')
    expect(kindToQuery('GOLD')).toEqual({})
  })
})

describe('formatting', () => {
  it('grams use thousands separators and at most 2 decimals; null is a dash', () => {
    expect(formatGram(1234.5678)).toBe('1,234.57')
    expect(formatGram(0)).toBe('0')
    expect(formatGram(null)).toBe('—')
    expect(formatDays(12.34)).toBe('12.3')
    expect(formatDays(null)).toBe('—')
  })
})

describe('items sorting and filtering', () => {
  it('severity first (zero, below, near, dead, ok), then cover days ascending (null last), then label', () => {
    expect(sortItemsBySeverity(items).map((i) => i.itemKey)).toEqual(['c', 'e', 'b', 'f', 'd', 'a'])
    expect(sortItemsBySeverity(null)).toEqual([])
  })

  it('filters by status; "dead" uses isDead (it can overlap below/near); all returns everything', () => {
    expect(filterItems(items, 'all')).toHaveLength(6)
    expect(filterItems(items, 'zero').map((i) => i.itemKey)).toEqual(['c'])
    expect(filterItems(items, 'below').map((i) => i.itemKey)).toEqual(['b', 'e'])
    expect(filterItems(items, 'dead').map((i) => i.itemKey)).toEqual(['d', 'e'])
    expect(filterItems(items, undefined)).toHaveLength(6)
  })

  it('toggle counts come from the KPI', () => {
    expect(itemFilterCounts({ itemCount: 9, zeroCount: 1, belowMinCount: 2, nearMinCount: 3, deadCount: 4, negativeCount: 5 })).toEqual({ all: 9, zero: 1, negative: 5, below: 2, near: 3, dead: 4 })
    expect(itemFilterCounts(undefined)).toEqual({ all: 0, zero: 0, negative: 0, below: 0, near: 0, dead: 0 })
  })

  it('status chips map to red / warning / grey / green', () => {
    expect(['zero', 'negative', 'below', 'near', 'dead', 'ok', 'x'].map(resolveStatusVariant)).toEqual(['fail', 'warning', 'warning', 'warning', 'grey', 'pass', 'pass'])
  })

  it('rows keep the item fields and add display text (never-issued vs days ago)', () => {
    const rows = buildItemRows(items, 'all', t)
    expect(rows[0]).toMatchObject({ itemKey: 'c', rowKey: 'c', statusText: 'view.productionInsight.materialInsight.status.zero' })
    const e = rows.find((r) => r.itemKey === 'e')
    expect(e.lastMoveText).toContain('"days":50')
    expect(rows.find((r) => r.itemKey === 'd').lastMoveText).toBe('view.productionInsight.materialInsight.neverMoved')
    expect(buildItemRows(items, 'dead', t).map((r) => r.itemKey)).toEqual(['e', 'd'])
  })
})

describe('groups and sizes', () => {
  it('group rows sort by on-hand; donut slices drop empty groups', () => {
    const groups = [{ code: 'YG', name: 'ทองเหลือง', itemCount: 2, onHand: 10 }, { code: 'WG', name: '', itemCount: 1, onHand: 30 }, { code: 'PG', name: 'พิงค์', itemCount: 1, onHand: 0 }]
    expect(buildGroupRows(groups).map((g) => g.code)).toEqual(['WG', 'YG', 'PG'])
    expect(buildGroupRows(groups)[0].label).toBe('WG')
    expect(buildGroupSlices(groups)).toEqual([{ label: 'WG', value: 30 }, { label: 'ทองเหลือง', value: 10 }])
  })

  it('aggregates items by size (missing size = "-")', () => {
    const rows = aggregateBySize(items)
    expect(rows.find((r) => r.key === 'S1')).toMatchObject({ itemCount: 2, onHand: 30, label: 'ไซส์1' })
    expect(rows.find((r) => r.key === '-')).toMatchObject({ itemCount: 3, onHand: 6 })
  })
})

describe('finding / KPI -> items toggle', () => {
  it('card param wins, then finding code, else all; "attention" picks zero when there are zero items', () => {
    expect(resolveItemFilter({ itemFilter: 'near', findingCode: 'MAT_ZERO_STOCK' })).toBe('near')
    expect(resolveItemFilter({ findingCode: 'MAT_ZERO_STOCK' })).toBe('zero')
    expect(resolveItemFilter({ findingCode: 'MAT_BELOW_MIN' })).toBe('below')
    expect(resolveItemFilter({ findingCode: 'MAT_NEAR_MIN' })).toBe('near')
    expect(resolveItemFilter({ findingCode: 'MAT_DEAD_STOCK' })).toBe('dead')
    expect(resolveItemFilter({ findingCode: 'FC_MAT_STOCKOUT' })).toBe('all')
    expect(resolveItemFilter({ itemFilter: 'attention' }, { zeroCount: 2 })).toBe('zero')
    expect(resolveItemFilter({ itemFilter: 'attention' }, { zeroCount: 0 })).toBe('below')
  })

  it('matItems / matOnProcess route to the items tab with the toggle and the visible table as anchor', () => {
    const ctx = (canManage) => ({ filter: { canManage }, data: { Overview: { kpi: { zeroCount: 0 } } } })
    expect(resolveMaterialReportTarget('matItems', { findingCode: 'MAT_DEAD_STOCK' }, ctx(false))).toEqual({ tab: 'items', reveal: { stateKey: 'itemsFilter', value: 'dead' }, anchor: 'matItems' })
    expect(resolveMaterialReportTarget('matItems', {}, ctx(true)).anchor).toBe('matItemsEdit')
    expect(resolveMaterialReportTarget('matOnProcess', { findingCode: 'MAT_ZERO_STOCK' }, ctx(false)).reveal.value).toBe('all')
    expect(resolveMaterialReportTarget('matTrend', {}, ctx(false))).toBeNull()
  })
})

describe('usage hint', () => {
  it('states where the usage data starts and how many full months it covers', () => {
    const hint = buildUsageHint({ startMonth: '2026-08-01', fullMonths: 1 }, t)
    expect(hint).toContain('usageHint:')
    expect(hint).toContain('"start":"ส.ค. 2026"')
    expect(hint).toContain('"months":1')
    expect(buildUsageHint({ startMonth: null }, t)).toBe('view.productionInsight.materialInsight.usageHintNone')
    expect(buildMonthLabels([{ month: '2026-09-01' }])).toEqual(['ก.ย. 2026'])
  })
})

describe('min form', () => {
  const item = { itemKey: 'YG|S1', effectiveMin: 12, overrideMin: null, overrideLeadTimeDays: null, leadTimeDays: 7, autoMin: 10, avgDailyUsage: 1 }

  it('starts from the override, else the effective minimum', () => {
    expect(createMinForm(item)).toEqual({ minQty: 12, leadTimeDays: '', note: '' })
    expect(createMinForm({ ...item, overrideMin: 5, overrideLeadTimeDays: 3 })).toEqual({ minQty: 5, leadTimeDays: 3, note: '' })
  })

  it('validates minimum >= 0, lead time 0..365 integer (blank ok), note <= 500', () => {
    expect(validateMinForm({ minQty: 0, leadTimeDays: '', note: '' })).toEqual({})
    expect(validateMinForm({ minQty: -1, leadTimeDays: '', note: '' })).toHaveProperty('minQty')
    expect(validateMinForm({ minQty: '', leadTimeDays: '', note: '' })).toHaveProperty('minQty')
    expect(validateMinForm({ minQty: 'abc', leadTimeDays: '', note: '' })).toHaveProperty('minQty')
    expect(validateMinForm({ minQty: 1, leadTimeDays: 366, note: '' })).toHaveProperty('leadTimeDays')
    expect(validateMinForm({ minQty: 1, leadTimeDays: 1.5, note: '' })).toHaveProperty('leadTimeDays')
    expect(validateMinForm({ minQty: 1, leadTimeDays: 365, note: '' })).toEqual({})
    expect(validateMinForm({ minQty: 1, leadTimeDays: '', note: 'x'.repeat(501) })).toHaveProperty('note')
  })

  it('save / delete bodies have exactly the keys the API reads', () => {
    expect(buildMinSaveBody('GOLD', 'YG|S1', { minQty: '15.5', leadTimeDays: '', note: '  ' })).toEqual({ kind: 'GOLD', itemKey: 'YG|S1', minQty: 15.5, leadTimeDays: null, note: null })
    expect(buildMinSaveBody('GOLD', 'YG|S1', { minQty: 3, leadTimeDays: '14', note: ' สั่งเพิ่ม ' })).toEqual({ kind: 'GOLD', itemKey: 'YG|S1', minQty: 3, leadTimeDays: 14, note: 'สั่งเพิ่ม' })
    expect(Object.keys(buildMinSaveBody('GOLD', 'k', { minQty: 1, leadTimeDays: '', note: '' })).sort()).toEqual(['itemKey', 'kind', 'leadTimeDays', 'minQty', 'note'])
    expect(buildMinDeleteBody('GOLD', 'YG|S1')).toEqual({ kind: 'GOLD', itemKey: 'YG|S1' })
  })

  it('explains the automatic minimum with the item lead time (or the policy one) and safety days', () => {
    expect(describeAutoMin(item, { leadTimeDays: 5, safetyDays: 3 })).toEqual({ avgDailyUsage: 1, leadDays: 7, safetyDays: 3, autoMin: 10 })
    expect(describeAutoMin({ avgDailyUsage: 2, autoMin: 4 }, { leadTimeDays: 5, safetyDays: 3 }).leadDays).toBe(5)
  })
})

describe('policy form', () => {
  const policy = { windowMonths: 3, leadTimeDays: 7, safetyDays: 3, floorQty: 0, nearPercent: 150, deadStockDays: 90, minHistoryMonths: 3, forecastMonths: 6, source: 'default' }

  it('uses the 7 gold fields only', () => {
    expect(POLICY_FIELDS.map((f) => f.key)).toEqual(['windowMonths', 'leadTimeDays', 'safetyDays', 'floorQty', 'nearPercent', 'deadStockDays', 'minHistoryMonths'])
    expect(Object.keys(createPolicyForm(policy))).toHaveLength(7)
  })

  it('validates each field against the backend clamps', () => {
    const base = createPolicyForm(policy)
    expect(validatePolicyForm(base)).toEqual({})
    expect(validatePolicyForm({ ...base, windowMonths: 0 })).toHaveProperty('windowMonths')
    expect(validatePolicyForm({ ...base, windowMonths: 25 })).toHaveProperty('windowMonths')
    expect(validatePolicyForm({ ...base, leadTimeDays: 366 })).toHaveProperty('leadTimeDays')
    expect(validatePolicyForm({ ...base, safetyDays: -1 })).toHaveProperty('safetyDays')
    expect(validatePolicyForm({ ...base, floorQty: -0.5 })).toHaveProperty('floorQty')
    expect(validatePolicyForm({ ...base, nearPercent: 99 })).toHaveProperty('nearPercent')
    expect(validatePolicyForm({ ...base, nearPercent: 1001 })).toHaveProperty('nearPercent')
    expect(validatePolicyForm({ ...base, deadStockDays: 0 })).toHaveProperty('deadStockDays')
    expect(validatePolicyForm({ ...base, deadStockDays: 3651 })).toHaveProperty('deadStockDays')
    expect(validatePolicyForm({ ...base, minHistoryMonths: 13 })).toHaveProperty('minHistoryMonths')
    expect(validatePolicyForm({ ...base, windowMonths: 1.5 })).toHaveProperty('windowMonths')
    expect(validatePolicyForm({ ...base, floorQty: 2.5, nearPercent: 125.5 })).toEqual({})
    expect(validatePolicyForm({ ...base, safetyDays: '' })).toHaveProperty('safetyDays')
  })

  it('save body = kind + only the changed fields', () => {
    const form = { ...createPolicyForm(policy), leadTimeDays: '10', floorQty: '2.5' }
    const body = buildPolicySaveBody('GOLD', form, policy)
    expect(body).toEqual({ kind: 'GOLD', leadTimeDays: 10, floorQty: 2.5 })
    expect(hasPolicyChanges(body)).toBe(true)
    const none = buildPolicySaveBody('GOLD', createPolicyForm(policy), policy)
    expect(none).toEqual({ kind: 'GOLD' })
    expect(hasPolicyChanges(none)).toBe(false)
  })
})

describe('gold held by workers (GoldByStage)', () => {
  it('request: last 3 months in ISO (Thai day boundaries) for gold, with exactly start / end / metal', () => {
    expect(GOLD_STAGE_ENDPOINT).toBe('ProductionInsight/GoldByStage')
    const body = buildGoldStageParams(new Date('2026-10-22T05:00:00Z'))
    expect(Object.keys(body).sort()).toEqual(['end', 'metal', 'start'])
    expect(body.metal).toBe('GOLD')
    expect(body.start).toBe('2026-07-22T00:00:00+07:00')
    expect(body.end).toMatch(/^2026-10-22T23:59:59/)
  })

  it('sums pending-with-worker grams and job counts over departments; queue slots are not counted; no data = null', () => {
    const stage = { departments: [{ key: 'setting', pendingWithWorkerCount: 3, pendingWithWorkerGram: 10.5, pendingQueueCount: 9, pendingQueueGram: 99 }, { key: 'trim', pendingWithWorkerCount: 2, pendingWithWorkerGram: 4.25 }, { key: 'plating' }] }
    expect(sumPendingWithWorker(stage)).toEqual({ gram: 14.75, count: 5 })
    expect(sumPendingWithWorker({ departments: [] })).toEqual({ gram: 0, count: 0 })
    expect(sumPendingWithWorker(undefined)).toBeNull()
    expect(sumPendingWithWorker({})).toBeNull()
  })

  it('the items-tab line appears only when something is held by workers', () => {
    expect(buildWithWorkerLine({ departments: [{ pendingWithWorkerCount: 2, pendingWithWorkerGram: 1234.5 }] }, t)).toContain('"weight":"1,234.5"')
    expect(buildWithWorkerLine({ departments: [{ pendingWithWorkerCount: 0, pendingWithWorkerGram: 0 }] }, t)).toBe('')
    expect(buildWithWorkerLine(undefined, t)).toBe('')
  })
})

describe('negative balances (ledger without opening balance / receipts)', () => {
  const negItems = [
    { itemKey: 'n1', label: 'N1', status: 'negative', onHand: -10, coverDays: null, isDead: false },
    { itemKey: 'z', label: 'Z', status: 'zero', onHand: 0, coverDays: 0, isDead: false },
    { itemKey: 'o', label: 'O', status: 'ok', onHand: 5, coverDays: 30, isDead: false },
    { itemKey: 'b', label: 'B', status: 'below', onHand: 1, coverDays: 2, isDead: false }
  ]

  it('negative sorts right after zero (before below / near / dead / ok) and has its own toggle after zero', () => {
    expect(STATUS_ORDER).toEqual(['zero', 'negative', 'below', 'near', 'dead', 'ok'])
    expect(ITEM_FILTERS).toEqual(['all', 'zero', 'negative', 'below', 'near', 'dead'])
    expect(sortItemsBySeverity(negItems).map((i) => i.itemKey)).toEqual(['z', 'n1', 'b', 'o'])
    expect(filterItems(negItems, 'negative').map((i) => i.itemKey)).toEqual(['n1'])
  })

  it('rows of negative items carry a hint for the on-hand cell; healthy rows do not', () => {
    const rows = buildItemRows(negItems, 'all', t)
    expect(rows.find((r) => r.itemKey === 'n1').onHandHint).toBe('view.productionInsight.materialInsight.negativeHint')
    expect(rows.find((r) => r.itemKey === 'o').onHandHint).toBe('')
    expect(rows.find((r) => r.itemKey === 'n1').statusText).toBe('view.productionInsight.materialInsight.status.negative')
  })

  it('the notice shows only when items are negative and no receipt was ever recorded; "all negative" means every item', () => {
    expect(shouldShowNegativeNotice({ negativeCount: 5, inboundRecorded: false })).toBe(true)
    expect(shouldShowNegativeNotice({ negativeCount: 5, inboundRecorded: true })).toBe(false)
    expect(shouldShowNegativeNotice({ negativeCount: 0, inboundRecorded: false })).toBe(false)
    expect(shouldShowNegativeNotice(undefined)).toBe(false)
    expect(areAllItemsNegative({ itemCount: 5, negativeCount: 5 })).toBe(true)
    expect(areAllItemsNegative({ itemCount: 5, negativeCount: 4 })).toBe(false)
    expect(areAllItemsNegative({ itemCount: 0, negativeCount: 0 })).toBe(false)
  })

  it('MAT_NEGATIVE_BALANCE gets a second wording when the ledger already has receipts; other findings are untouched', () => {
    const out = remapMaterialFindings([
      { code: 'MAT_NEGATIVE_BALANCE', params: { ledgerHasInbound: false } },
      { code: 'MAT_NEGATIVE_BALANCE', params: { ledgerHasInbound: true } },
      { code: 'MAT_ZERO_STOCK', params: {} }
    ])
    expect(out.map((i) => i.code)).toEqual(['MAT_NEGATIVE_BALANCE', 'MAT_NEGATIVE_BALANCE_INBOUND', 'MAT_ZERO_STOCK'])
    expect(remapMaterialFindings(null)).toEqual([])
  })

  it('the finding routes to the negative toggle; the group bar skips groups with a negative balance', () => {
    expect(resolveItemFilter({ findingCode: 'MAT_NEGATIVE_BALANCE' })).toBe('negative')
    expect(resolveItemFilter({ itemFilter: 'negative' })).toBe('negative')
    const groups = [{ code: 'YG', name: 'ทอง', itemCount: 3, onHand: -20, negativeCount: 3 }, { code: 'WG', name: 'ขาว', itemCount: 1, onHand: 7, negativeCount: 0 }]
    expect(buildGroupBarRows(groups).map((g) => g.code)).toEqual(['WG'])
    expect(buildGroupRows(groups).map((g) => [g.code, g.negativeCount])).toEqual([['WG', 0], ['YG', 3]])
    expect(buildGroupSlices(groups)).toEqual([{ label: 'ขาว', value: 7 }])
    expect(buildGroupBarRows([{ code: 'YG', onHand: -1 }])).toEqual([])
  })
})
