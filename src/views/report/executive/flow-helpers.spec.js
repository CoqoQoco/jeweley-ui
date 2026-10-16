import { describe, it, expect } from 'vitest'

import {
  zoneOf,
  parseFlowState,
  serializeFlowState,
  trustByZone,
  countTrust,
  trustItemsForSelection,
  resolveDeptKey,
  countWorkersOverTarget,
  buildWorkerLensModel,
  normalizeCompareLabel,
  buildCompare,
  reconcileStockLenses,
  findLowestCompletedMonth,
  buildStationModels,
  stationLabel,
  zoneLabelText,
  buildGateLabels,
  buildBossTiles,
  mergeDimension,
  dimLabel,
  shortLocationLabel
} from './flow-helpers.js'
import { STATIONS } from './flow-layout.js'
import { t, board, production, stock, material, zones } from './flow-test-data.js'

describe('flow state (URL)', () => {
  it('parses zone, lens and stock lens', () => {
    expect(parseFlowState('z-prod.worker')).toEqual({ selected: 'z-prod', lens: 'worker', stockLens: 'sloc' })
    expect(parseFlowState('#z-stock.trust.gold')).toEqual({ selected: 'z-stock', lens: 'trust', stockLens: 'gold' })
    expect(parseFlowState('p-trim.time')).toEqual({ selected: 'p-trim', lens: 'time', stockLens: 'sloc' })
  })

  it('drops unknown values instead of throwing', () => {
    expect(parseFlowState('bogus.nope.zzz')).toEqual({ selected: 'all', lens: 'default', stockLens: 'sloc' })
    expect(parseFlowState(undefined)).toEqual({ selected: 'all', lens: 'default', stockLens: 'sloc' })
    expect(parseFlowState(['z-sales.time', 'x'])).toEqual({ selected: 'z-sales', lens: 'time', stockLens: 'sloc' })
  })

  it('maps a stock pad link to the whole stock zone', () => {
    expect(parseFlowState('sk2').selected).toBe('z-stock')
  })

  it('serializes and round trips; defaults serialize to empty', () => {
    expect(serializeFlowState({ selected: 'all', lens: 'default', stockLens: 'sloc' })).toBe('')
    expect(serializeFlowState({ selected: 'z-prod', lens: 'worker', stockLens: 'sloc' })).toBe('z-prod.worker')
    expect(serializeFlowState({ selected: 'z-stock', lens: 'default', stockLens: 'age' })).toBe('z-stock.age')
    const state = { selected: 'z-stock', lens: 'trust', stockLens: 'size' }
    expect(parseFlowState(serializeFlowState(state))).toEqual(state)
    expect(serializeFlowState({ selected: 'all', lens: 'trust', stockLens: 'sloc' })).toBe('all.trust')
  })

  it('resolves the zone of a station id', () => {
    expect(zoneOf('all')).toBeNull()
    expect(zoneOf('z-mat')).toBe('z-mat')
    expect(zoneOf('p-trim')).toBe('z-prod')
    expect(zoneOf('sk3')).toBe('z-stock')
    expect(zoneOf('nope')).toBeNull()
  })
})

describe('trust', () => {
  it('groups by api zone and counts by level', () => {
    const grouped = trustByZone(board.trust)
    expect(grouped.material).toHaveLength(1)
    expect(grouped.mold).toEqual([])
    expect(countTrust(board.trust)).toEqual({ fail: 1, warn: 2, info: 1 })
    expect(countTrust(board.trust, 'z-sales')).toEqual({ fail: 0, warn: 1, info: 0 })
  })

  it('filters by selection (zone, station or all)', () => {
    expect(trustItemsForSelection(board.trust, 'all')).toHaveLength(4)
    expect(trustItemsForSelection(board.trust, 'z-prod')).toHaveLength(1)
    expect(trustItemsForSelection(board.trust, 'mat-gold')).toHaveLength(1)
  })
})

describe('worker over target', () => {
  it('resolves dept keys from key, Thai or English names', () => {
    expect(resolveDeptKey('setting')).toBe('setting')
    expect(resolveDeptKey('ขัดชุบ')).toBe('plating')
    expect(resolveDeptKey('Raw polish')).toBe('rawPolish')
    expect(resolveDeptKey('nope')).toBeNull()
    expect(resolveDeptKey(null)).toBeNull()
  })

  it('counts only non-total rows with delta >= 1 pp per department', () => {
    const { byDept, total } = countWorkersOverTarget(production.lossVsTarget)
    expect(byDept).toEqual({ setting: 1, plating: 1, rawPolish: 1 })
    expect(total).toBe(3)
    expect(countWorkersOverTarget(production.lossVsTarget, 1.5).total).toBe(2)
    expect(countWorkersOverTarget(null)).toEqual({ byDept: {}, total: 0 })
  })

  it('builds the lens model for one department with excess from total rows', () => {
    const model = buildWorkerLensModel(production.lossVsTarget, 'setting')
    expect(model.sets).toHaveLength(1)
    expect(model.over).toBe(1)
    expect(model.excessG).toBeCloseTo(0.5)
    const all = buildWorkerLensModel(production.lossVsTarget)
    expect(all.sets).toHaveLength(3)
    expect(all.over).toBe(3)
    expect(all.excessG).toBeCloseTo(7.1)
  })
})

describe('compare labels and folding', () => {
  it('normalizes different vocabularies to the shared columns', () => {
    expect(normalizeCompareLabel('gold', 'Yellow')).toBe('YG')
    expect(normalizeCompareLabel('gold', 'YG')).toBe('YG')
    expect(normalizeCompareLabel('gold', '')).toBe('Unknown')
    expect(normalizeCompareLabel('gold', '(ไม่ระบุ)')).toBe('Unknown')
    expect(normalizeCompareLabel('gold', 'NG')).toBe('Other')
    expect(normalizeCompareLabel('size', '18k')).toBe('18K')
    expect(normalizeCompareLabel('size', 'SV')).toBe('Silver')
    expect(normalizeCompareLabel('size', '22K')).toBe('Other')
    expect(normalizeCompareLabel('ptype', 'es')).toBe('ES')
    expect(normalizeCompareLabel('ptype', 'ZZ')).toBe('Other')
    expect(normalizeCompareLabel('ptype', 'N/A')).toBe('Other')
  })

  it('folds labels outside the shared set into Other (gold adds the Other column only when present)', () => {
    const c = buildCompare('gold', { production, board, material }, t)
    expect(c.keys).toEqual(['YG', 'WG', 'PG', 'SV', 'Unknown', 'Other'])
    const prod = c.rows.find((r) => r.zone === 'z-prod')
    // 7 departments x (YG 40 + Yellow 10), blank 30 -> Unknown, NG 20 -> Other
    expect(prod.cells).toEqual([350, null, null, null, 210, 140])
    const stockRow = c.rows.find((r) => r.zone === 'z-stock')
    expect(stockRow.cells).toEqual([60, 30, null, null, null, 10])
  })

  it('shows n/a for mold, unavailable for receive and grams for material', () => {
    const c = buildCompare('gold', { production, board, material }, t)
    expect(c.rows.find((r) => r.zone === 'z-mold').kind).toBe('na')
    expect(c.rows.find((r) => r.zone === 'z-recv').kind).toBe('unavailable')
    const mat = c.rows.find((r) => r.zone === 'z-mat')
    expect(mat.unit).toContain('g')
    expect(mat.cells[0]).toBeCloseTo(-1766.19)
    expect(mat.cells[3]).toBeCloseTo(-5175.04)
    expect(mat.cells[5]).toBeCloseTo(-1)
    expect(c.rows.find((r) => r.zone === 'z-sales').cells[0]).toBe(5)
  })

  it('uses the same cells whatever vocabulary the source uses (normalisation independent)', () => {
    const renamed = JSON.parse(JSON.stringify(board))
    renamed.mix.stock.gold = [
      { label: 'Yellow', pcs: 60, percent: 60 },
      { label: 'White', pcs: 30, percent: 30 },
      { label: 'NG', pcs: 10, percent: 10 }
    ]
    const a = buildCompare('gold', { production, board, material }, t).rows.find((r) => r.zone === 'z-stock').cells
    const b = buildCompare('gold', { production, board: renamed, material }, t).rows.find((r) => r.zone === 'z-stock').cells
    expect(b).toEqual(a)
  })

  it('product type uses a fixed column set ending with Other and has no material data', () => {
    const c = buildCompare('ptype', { production, board, material }, t)
    expect(c.keys).toEqual(['R', 'P', 'E', 'ES', 'B', 'N', 'Other'])
    expect(c.rows.find((r) => r.zone === 'z-mat').kind).toBe('na')
    const stockRow = c.rows.find((r) => r.zone === 'z-stock')
    expect(stockRow.cells).toEqual([50, 30, null, 10, null, null, 10])
    expect(c.rows.find((r) => r.zone === 'z-prod').cells[6]).toBe(350)
  })

  it('falls back to board.mix.wip when the production zone is not loaded', () => {
    const c = buildCompare('gold', { production: null, board, material: null }, t)
    expect(c.rows.find((r) => r.zone === 'z-prod').cells.slice(0, 5)).toEqual([10, null, null, 40, 50])
    expect(c.rows.find((r) => r.zone === 'z-mat').kind).toBe('na')
  })

  it('size comparison reads the material size name', () => {
    const c = buildCompare('size', { production, board, material }, t)
    const mat = c.rows.find((r) => r.zone === 'z-mat')
    expect(c.keys.slice(0, 6)).toEqual(['18K', '9K', '14K', '10K', 'Silver', 'Unknown'])
    expect(mat.cells[0]).toBeCloseTo(-1363.16)
    expect(mat.cells[4]).toBeCloseTo(-5175.04)
  })

  it('labels dimension values with names and treats blanks as unknown', () => {
    expect(dimLabel('gold', 'YG', t)).toContain('YG')
    expect(dimLabel('ptype', 'R', t)).toContain('ptype.R')
    expect(dimLabel('size', '', t)).toBe('view.executive.flow.label.unknown')
    expect(dimLabel('ptype', null, t)).toBe('view.executive.flow.label.other')
  })
})

describe('stock lens reconcile', () => {
  it('passes when every lens sums to the in-stock total', () => {
    const r = reconcileStockLenses(stock)
    expect(r.total).toBe(100)
    expect(r.ok).toBe(true)
    expect(r.lenses).toHaveLength(5)
  })

  it('reports lenses that drop pieces', () => {
    const broken = JSON.parse(JSON.stringify(stock))
    broken.lenses.gold[0].pcs = 60
    const r = reconcileStockLenses(broken)
    expect(r.ok).toBe(false)
    expect(r.lenses.find((l) => l.key === 'gold')).toMatchObject({ sum: 90, diff: -10, ok: false })
  })

  it('handles a missing stock zone', () => {
    expect(reconcileStockLenses(null)).toEqual({ total: 0, lenses: [], ok: true })
  })
})

describe('months', () => {
  it('finds the lowest completed month excluding the running month', () => {
    expect(findLowestCompletedMonth(board.flow.months).month).toBe('2026-08')
    expect(findLowestCompletedMonth([])).toBeNull()
  })
})

describe('station models and labels', () => {
  const models = buildStationModels({ board, zones }, { stockLens: 'sloc', stockSel: '' }, t)
  const byId = Object.fromEntries(models.map((m) => [m.id, m]))

  it('creates one model for every station in layout order', () => {
    expect(models.map((m) => m.id)).toEqual(STATIONS.map((s) => s.id))
  })

  it('maps mold stages by status and flags stale work', () => {
    expect(byId['m-design'].head).toBe('100 view.executive.flow.unit.job')
    expect(byId['m-design'].trust.level).toBe('warn')
    expect(byId['m-cut'].trust.level).toBe('na')
    expect(byId['m-silver'].trust.level).toBe('ok')
    expect(byId['m-store'].trust.level).toBe('info')
    expect(byId['m-melt'].trust.level).toBe('ok')
    expect(byId['m-design'].decor).toEqual({ type: 'mold', open: 100, stale: 80 })
  })

  it('maps production departments with age stack and queue cubes', () => {
    expect(byId['p-trim'].decor).toEqual({ type: 'prod', segs: [10, 20, 30, 40], cubes: 2 })
    expect(byId['p-trim'].trust.text).toContain('scrapLoss')
    expect(byId['p-trim'].trust.text).toContain('testWorker')
    expect(byId['p-trim'].workerText).toBe('view.executive.flow.worker.noDeptTarget')
    expect(byId['p-gem'].workerText).toBe('view.executive.flow.worker.notWeighed')
    expect(byId['p-design'].workerText).toBeNull()
    expect(byId['p-set'].workerText).toContain('"n":"1"')
    expect(byId['p-raw'].workerText).toContain('"n":"1"')
    expect(byId['p-plate'].workerText).toContain('"n":"1"')
  })

  it('shows the stock pads of the current lens only', () => {
    expect(byId.sk0.visible).toBe(true)
    expect(byId.sk0.name).toBe('MAIN')
    expect(byId.sk2.visible).toBe(false)
    expect(byId.sk2.decor).toEqual({ type: 'none' })
    const gold = buildStationModels({ board, zones }, { stockLens: 'gold', stockSel: 'White' }, t)
    expect(gold.find((m) => m.id === 'sk1').decor).toMatchObject({ type: 'stockPad', value: 30, selected: true })
    expect(gold.find((m) => m.id === 'sk0').decor).toMatchObject({ value: 70, max: 70, selected: false })
  })

  it('marks negative material gold as fail and holds the payment pad', () => {
    expect(byId['mat-gold'].trust.level).toBe('fail')
    expect(byId['sale-inv'].trust.level).toBe('fail')
    expect(byId['sale-pay'].hold).toBe(true)
    expect(byId['sale-pay'].trust.level).toBe('info')
    expect(byId['sale-so'].trust.level).toBe('warn')
    expect(byId['sale-quote'].decor).toEqual({ type: 'sales', value: 99, role: 'b2' })
  })

  it('degrades to dashes when a zone is not loaded', () => {
    const empty = buildStationModels({ board: null, zones: {} }, {}, t)
    const e = Object.fromEntries(empty.map((m) => [m.id, m]))
    expect(e['m-design'].head).toBe('-')
    expect(e['p-trim'].head).toBe('-')
    expect(e.recv.head).toBe('-')
    expect(e.sk0.visible).toBe(false)
    expect(e['p-trim'].trust.level).toBe('na')
  })

  it('builds lens label text', () => {
    expect(stationLabel(byId['p-set'], 'default', t)).toMatchObject({ value: byId['p-set'].head, badge: true, dim: false })
    expect(stationLabel(byId.recv, 'time', t).value).toContain('time.recvThisMonth')
    expect(stationLabel(byId['m-design'], 'time', t)).toMatchObject({ value: '-', dim: true })
    expect(stationLabel(byId['m-design'], 'worker', t)).toMatchObject({ value: '-', dim: true })
    expect(stationLabel(byId['p-set'], 'worker', t).dim).toBe(false)
    expect(stationLabel(byId['mat-gold'], 'trust', t)).toMatchObject({ value: 'FAIL · view.executive.flow.trust.negative', badge: false, trustLevel: 'fail' })
    expect(stationLabel(byId['sale-quote'], 'trust', t).value).toBe('view.executive.flow.label.ok')
    expect(stationLabel(byId['m-cut'], 'trust', t).value).toBe('-')
  })

  it('builds zone banners per lens', () => {
    expect(zoneLabelText('z-prod', 'default', board, t)).toBe('Z2 · PRODUCTION')
    expect(zoneLabelText('z-prod', 'trust', board, t)).toBe('Z2 · PRODUCTION · 1 warn')
    expect(zoneLabelText('z-mat', 'trust', board, t)).toBe('Z5 · MATERIAL · 1 fail')
    expect(zoneLabelText('z-mold', 'trust', board, t)).toBe('Z1 · MOLD · view.executive.flow.label.ok')
    expect(zoneLabelText('z-prod', 'time', board, t)).toContain('"n":"+130"')
    expect(zoneLabelText('z-sales', 'time', board, t)).toContain('2026-06-23')
    expect(zoneLabelText('z-stock', 'time', board, t)).toContain('noData')
    expect(zoneLabelText('z-prod', 'worker', board, t)).toContain('"n":"3"')
    expect(zoneLabelText('z-stock', 'worker', board, t)).toContain('zoneLens.na')
  })

  it('builds gate labels from zone data', () => {
    const gates = buildGateLabels({ zones }, t)
    expect(gates.map((g) => g.id)).toEqual(['A', 'B', 'C'])
    expect(gates[0].value).toContain('"n":"800"')
    expect(gates[1].value).toContain('"n":"4,429"')
    expect(gates[2].value).toContain('"n":"100"')
    expect(buildGateLabels({ zones: {} }, t).map((g) => g.value)).toEqual(['-', '-', '-'])
  })
})

describe('boss tiles', () => {
  const tiles = buildBossTiles(board, t)

  it('returns six tiles with targets that match the prototype wiring', () => {
    expect(tiles.map((x) => x.key)).toEqual(['flow', 'loss', 'notReturned', 'sales', 'mix', 'trust'])
    expect(tiles.map((x) => x.target)).toEqual(['z-prod|time|', 'z-prod|worker|', 'z-prod|default|', 'z-sales|time|', 'z-stock|default|ptype', 'all|trust|'])
    expect(tiles.map((x) => x.confidence)).toEqual(['med', 'med', 'low', 'med', 'low', 'high'])
  })

  it('takes every figure from the board', () => {
    expect(tiles[0].value).toContain('+130')
    expect(tiles[0].lines[1]).toContain('2026-08')
    expect(tiles[1].value).toBe('10.00%')
    expect(tiles[2].value).toBe('500.0 g')
    expect(tiles[3].value).toBe('2.56M')
    expect(tiles[5].value).toBe('1 fail')
    expect(tiles[5].lines[0]).toBe('2 warn · 1 info')
    expect(tiles[5].lines[1]).toBe('Negative gold')
  })

  it('picks the product type with the largest stock-over-sold gap', () => {
    expect(tiles[4].value).toContain('P')
    expect(tiles[4].lines[0]).toContain('"stock":"30.0%"')
    expect(tiles[4].lines[1]).toContain('"wip":"40.0%"')
  })

  it('returns nothing without a board', () => {
    expect(buildBossTiles(null, t)).toEqual([])
  })
})

describe('mergeDimension', () => {
  it('sums plans/pieces across departments and weighs only weighed departments', () => {
    const rows = mergeDimension(production.departments, 'gold')
    const yg = rows.find((r) => r.label === 'YG')
    expect(yg.pcs).toBe(280)
    const sv = rows.find((r) => r.label === 'SV')
    // 5 departments carry gold loss, gem sort is not weighed -> 4 weighed (40 g issued / 35 g returned each)
    expect(sv.sendG).toBe(200)
    expect(sv.sendWeighedG).toBe(160)
    expect(sv.checkWeighedG).toBe(140)
    expect(sv.pendingG).toBe(25)
    expect(rows[0].pcs).toBeGreaterThanOrEqual(rows[rows.length - 1].pcs)
  })

  it('returns an empty list for no data', () => {
    expect(mergeDimension(null, 'gold')).toEqual([])
  })
})

describe('shortLocationLabel', () => {
  const locations = [
    { code: 'MAIN', name: 'คลังหลัก' },
    { code: 'STNEW', name: 'STOCK 18K-NEW' },
    { code: 'STNEW-SILVER', name: 'STOCK SILVER-NEW' }
  ]

  it('uses the location code looked up by name', () => {
    expect(shortLocationLabel('คลังหลัก', locations)).toBe('MAIN')
    expect(shortLocationLabel('STOCK 18K-NEW', locations)).toBe('STNEW')
    expect(shortLocationLabel('STOCK SILVER-NEW', locations)).toBe('STNEW-SILVER')
  })

  it('keeps Other N and labels that are already codes', () => {
    expect(shortLocationLabel('Other 27', locations)).toBe('Other 27')
    expect(shortLocationLabel('MAIN', locations)).toBe('MAIN')
  })

  it('truncates with an ellipsis when no code is found', () => {
    expect(shortLocationLabel('คลังที่ไม่รู้จักยาวมากๆ', locations)).toBe('คลังที่ไม…')
    expect(shortLocationLabel('short', [])).toBe('short')
    expect(shortLocationLabel(null, null)).toBe('')
  })
})
