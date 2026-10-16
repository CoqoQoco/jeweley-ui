import { describe, it, expect } from 'vitest'

import { buildPanelModel, buildBaseBlocks, buildTimeBlocks, buildWorkerBlocks, buildTrustBlocks, buildStockModel, buildProdStationModel, buildDimTable } from './flow-panel-models.js'
import { STATION_IDS, ZONE_IDS, LENS_KEYS, COMPARE_KEYS, STOCK_LENS_KEYS } from './flow-layout.js'
import { t, board, zones, production } from './flow-test-data.js'

const ctx = (extra = {}) => ({ board, zones, selected: 'all', lens: 'default', compare: '', stockLens: 'sloc', stockSel: '', ...extra })
const flat = (blocks) => blocks.flatMap((b) => (b.type === 'lens' ? [b, ...flat(b.blocks)] : [b]))
const tables = (blocks) => flat(blocks).filter((b) => b.type === 'table')

describe('panel model composition', () => {
  it('puts compare first, then the lens, then the base block', () => {
    const blocks = buildPanelModel(ctx({ selected: 'z-prod', lens: 'time', compare: 'gold' }), t)
    expect(blocks.map((b) => b.key || b.type)).toEqual(['compare', 'time', 'heading', 'metrics', 'prod-depts', 'note', 'metal-split', 'note', 'cast', 'note', 'dim-gold', 'dim-size', 'dim-ptype', 'flags'])
  })

  it('starts with the overview when nothing is selected', () => {
    const blocks = buildPanelModel(ctx(), t)
    expect(blocks[0].type).toBe('heading')
    expect(blocks[1].items).toHaveLength(7)
    expect(blocks[1].items[0].value).toBe('1,000')
  })

  it('never throws for any selection / lens / compare, with or without data', () => {
    const empties = { board: null, zones: {} }
    ;[ctx(), { ...ctx(), ...empties }].forEach((base) => {
      ;['all', ...ZONE_IDS, ...STATION_IDS].forEach((selected) => {
        LENS_KEYS.forEach((lens) => {
          ;['', ...COMPARE_KEYS].forEach((compare) => {
            STOCK_LENS_KEYS.forEach((stockLens) => {
              expect(() => buildPanelModel({ ...base, selected, lens, compare, stockLens }, t)).not.toThrow()
            })
          })
        })
      })
    })
  })

  it('every table row has a unique key and only string cells (no raw numbers leak into the table)', () => {
    ;['all', ...ZONE_IDS, ...STATION_IDS].forEach((selected) => {
      const blocks = buildPanelModel(ctx({ selected, lens: 'worker', compare: 'size' }), t)
      tables(blocks).forEach((tb) => {
        const keys = tb.rows.map((r) => r.key)
        expect(new Set(keys).size).toBe(keys.length)
        const fields = tb.columns.map((c) => c.field)
        expect(new Set(fields).size).toBe(fields.length)
      })
    })
  })

  it('shows missing-data notes instead of crashing when a zone is absent', () => {
    const blocks = buildBaseBlocks({ ...ctx({ selected: 'z-stock' }), zones: {} }, t)
    expect(blocks.map((b) => b.type)).toEqual(['heading', 'note'])
  })
})

describe('lens blocks', () => {
  it('time lens follows the zone', () => {
    const prod = buildTimeBlocks('z-prod', ctx(), t)
    expect(prod[0].rows).toHaveLength(5)
    expect(prod[0].rows[4]).toMatchObject({ month: 'view.executive.flow.lens.total12', created: '350', completed: '220', diff: '+130', _cls: 'total' })
    expect(prod[0].rows[1]._cls).toBe('hl')
    expect(buildTimeBlocks('all', ctx(), t)[0].key).toBe('flow-months')
    expect(buildTimeBlocks('z-sales', ctx(), t)[0].rows).toHaveLength(2)
    expect(buildTimeBlocks('z-recv', ctx(), t)[0].rows[0].pcs).toBe('793')
    expect(buildTimeBlocks('z-stock', ctx(), t)[0]).toMatchObject({ type: 'note' })
  })

  it('worker lens only applies to production and explains the departments without loss', () => {
    expect(buildWorkerBlocks('z-stock', ctx(), t)[0].text).toContain('workerOnlyProd')
    expect(buildWorkerBlocks('p-trim', ctx(), t)[0].text).toContain('workerTrim')
    expect(buildWorkerBlocks('p-gem', ctx(), t)[0].text).toContain('workerGem')
    expect(buildWorkerBlocks('p-design', ctx(), t)[0].text).toContain('workerNoIssue')
    const set = buildWorkerBlocks('p-set', ctx(), t)
    expect(set[0].rows).toHaveLength(3)
    expect(set[0].rows[0]).toMatchObject({ name: 'view.executive.flow.lens.wholeDept', target: '4.3% *', _cls: 'hl' })
    expect(set[0].rows[1]).toMatchObject({ name: 'W1 !', delta: '+1.40', _cls: 'warn' })
    expect(set[0].rows[2]._cls).toBe('')
    expect(set[1].text).toContain('"n":"1"')
    expect(buildWorkerBlocks('z-prod', ctx(), t)[0].rows).toHaveLength(7)
  })

  it('trust lens lists the zone items only', () => {
    const z = buildTrustBlocks('z-material'.replace('material', 'mat'), ctx(), t)
    expect(z[0].rows).toHaveLength(1)
    expect(z[0].rows[0]).toMatchObject({ level: 'FAIL', zone: 'Z5 · MATERIAL', _cls: 'warn' })
    expect(buildTrustBlocks('all', ctx(), t)[0].rows).toHaveLength(4)
    expect(buildTrustBlocks('z-mold', ctx(), t)[0].type).toBe('note')
  })
})

describe('zone panels', () => {
  it('stock panel orders lenses with the current one first and flags a reconcile mismatch', () => {
    const blocks = buildStockModel(ctx({ selected: 'z-stock', stockLens: 'age', stockSel: '>365d' }), t)
    const keys = blocks.filter((b) => b.type === 'table').map((b) => b.key)
    expect(keys.slice(0, 2)).toEqual(['lens-age', 'locations'])
    const hl = blocks.find((b) => b.key === 'lens-age').rows.filter((r) => r._cls === 'hl')
    expect(hl.map((r) => r.label)).toEqual(['>365d'])
    expect(blocks.find((b) => b.type === 'flags').items.every((f) => !f.strong.includes('flagReconcile'))).toBe(true)

    const broken = JSON.parse(JSON.stringify(zones))
    broken.stock.lenses.gold[0].pcs = 10
    const flagged = buildStockModel(ctx({ zones: broken, selected: 'z-stock' }), t)
    expect(flagged.find((b) => b.type === 'flags').items.some((f) => f.strong.includes('flagReconcileStrong'))).toBe(true)
  })

  it('stock matrix is built from the api cells', () => {
    const blocks = buildStockModel(ctx({ selected: 'z-stock' }), t)
    const m = blocks.find((b) => b.key === 'matrix')
    expect(m.columns.map((c) => c.header)).toEqual(['view.executive.flow.panel.stock.colGold', '18K', '9K'])
    expect(m.rows.map((r) => [r.gold, r.s0, r.s1])).toEqual([
      ['Yellow', '60', '10'],
      ['White', '30', '-']
    ])
  })

  it('department panel without gold loss says so; with gold loss lists pending gold', () => {
    const design = buildProdStationModel('design', ctx(), t)
    expect(design.some((b) => b.type === 'note' && b.text.includes('noGoldLoss'))).toBe(true)
    const trim = buildProdStationModel('trim', ctx(), t)
    expect(tables(trim).map((b) => b.key)).toContain('pending')
    expect(trim.find((b) => b.type === 'flags').items.some((f) => f.strong.includes('flagScrapStrong'))).toBe(true)
    const gem = buildProdStationModel('gemSort', ctx(), t)
    const gl = tables(gem).find((b) => b.key === 'gl')
    expect(gl.rows[0].lossG).toBe('-')
    expect(gl.rows[0].send).toBe('100.0')
  })

  it('dimension table sums pieces and keeps unweighed departments out of loss', () => {
    const tb = buildDimTable('gold', production.departments, t)
    const total = tb.rows[tb.rows.length - 1]
    expect(total._cls).toBe('total')
    expect(total.pcs).toBe('700')
    expect(tb.rows.find((r) => r.key === 'gold-')._cls).toBe('warn')
  })

  it('sales panel never prints a US$ amount and keeps the held notes', () => {
    const blocks = buildPanelModel(ctx({ selected: 'z-sales' }), t)
    const text = JSON.stringify(blocks)
    expect(text).not.toMatch(/US\$ ?\d/)
    const months = tables(blocks).find((b) => b.key === 'sales-months')
    expect(months.rows[0].usd).toBe('23 / 15')
    expect(blocks.find((b) => b.type === 'flags').items).toHaveLength(2)
    expect(tables(blocks).find((b) => b.key === 'customers').rows[0].name).toBe('walk-in *')
  })

  it('compare block formats grams for material and a dash for receive', () => {
    const blocks = buildPanelModel(ctx({ compare: 'gold' }), t)
    const cmp = tables(blocks).find((b) => b.key === 'compare-gold')
    expect(cmp.rows).toHaveLength(6)
    const mat = cmp.rows.find((r) => r.key === 'cmp-z-mat')
    expect(mat.c0).toBe('-1,766.2')
    expect(cmp.rows.find((r) => r.key === 'cmp-z-recv').c0).toBe('-')
    expect(cmp.rows.find((r) => r.key === 'cmp-z-mold').c0).toBe('view.executive.flow.compare.na')
    expect(cmp.rows.find((r) => r.key === 'cmp-z-stock').c0).toBe('60')
  })
})
