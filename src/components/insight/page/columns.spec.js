import { describe, it, expect } from 'vitest'

import * as col from './columns.js'

const t = (key, params) => (params ? `${key}:${JSON.stringify(params)}` : key)

describe('column factories', () => {
  it('each factory produces a kind/field/header and accepts overrides', () => {
    expect(col.planLink()).toMatchObject({ kind: 'planLink', field: 'wo' })
    expect(col.mold()).toMatchObject({ kind: 'text', field: 'mold' })
    expect(col.product()).toMatchObject({ kind: 'product' })
    expect(col.dept({ minWidth: '1px' })).toMatchObject({ kind: 'dept', minWidth: '1px', withStatus: true })
    expect(col.workers()).toMatchObject({ kind: 'workers', tip: expect.any(String) })
    expect(col.lastUpdate()).toMatchObject({ kind: 'lastUpdate', tip: expect.any(String) })
    expect(col.date('d', 'h')).toMatchObject({ kind: 'date', field: 'd' })
    expect(col.days('n', 'h')).toMatchObject({ kind: 'number', align: 'right' })
    expect(col.number('n', 'h', 'decimal')).toMatchObject({ format: 'decimal' })
    expect(col.percent('p', 'h')).toMatchObject({ kind: 'percent' })
    expect(col.chip('c', 'h', () => 'pass', () => 'x')).toMatchObject({ kind: 'chip' })
    expect(col.sparkline('s', 'h', () => [])).toMatchObject({ kind: 'sparkline' })
    expect(col.shareBar('s', 'h')).toMatchObject({ kind: 'shareBar' })
  })

  it('every kind a factory emits is a registered COLUMN_KINDS member', () => {
    const cols = [col.planLink(), col.mold(), col.product(), col.dept(), col.workers(), col.lastUpdate(), col.date('a', 'b'), col.number('a', 'b'), col.percent('a', 'b'), col.chip('a', 'b'), col.sparkline('a', 'b'), col.shareBar('a', 'b')]
    cols.forEach((c) => expect(col.COLUMN_KINDS).toContain(c.kind))
  })
})

describe('toTableColumns (tip => header slot)', () => {
  it('clears the header prop for columns with a tip so the header is not rendered twice', () => {
    const cols = col.toTableColumns([col.workers(), col.mold()], t)
    expect(cols[0].header).toBe('')
    expect(cols[1].header).toBe('view.executive.production.colMold')
    expect(col.headerSlotColumns([col.workers(), col.mold()]).map((c) => c.field)).toEqual(['workers'])
  })

  it('supports function headers', () => {
    expect(col.resolveHeader({ header: (tt) => `${tt('a')}/${tt('b')}` }, t)).toBe('a/b')
    expect(col.resolveHeader({}, t)).toBe('')
  })
})

describe('formatting', () => {
  it('formatNumberValue handles formats and null', () => {
    expect(col.formatNumberValue(1234.5678, 'count')).toBe('1,235')
    expect(col.formatNumberValue(1.234, 'decimal')).toBe('1.23')
    expect(col.formatNumberValue(1.26, 'days')).toBe('1.3')
    expect(col.formatNumberValue(5, 'signed')).toBe('+5')
    expect(col.formatNumberValue(-5, 'signed')).toBe('−5')
    expect(col.formatNumberValue(0, 'signed')).toBe('± 0')
    expect(col.formatNumberValue(null)).toBeNull()
  })

  it('formatPercentValue', () => {
    expect(col.formatPercentValue(12.345)).toBe('12.35%')
    expect(col.formatPercentValue(undefined)).toBeNull()
  })

  it('getByPath reads nested values safely', () => {
    expect(col.getByPath({ median: { total: 3 } }, 'median.total')).toBe(3)
    expect(col.getByPath({}, 'median.total')).toBeUndefined()
  })
})

describe('resolveCell', () => {
  it('number: nullAs, tip when missing, suffix, badge, action', () => {
    const c = col.number('wait', 'h', 'days', { path: 'median.wait', nullTip: 'tip.key', suffix: () => '(3 ใบ)', badge: () => 'ร่าง' })
    expect(col.resolveCell(c, { median: { wait: 2.25 } }, t)).toMatchObject({ text: '2.3', suffix: '(3 ใบ)', badge: 'ร่าง', tip: '' })
    expect(col.resolveCell(c, { median: {} }, t)).toMatchObject({ text: '—', tip: 'tip.key' })
    expect(col.resolveCell(col.number('n', 'h', 'count', { nullAs: '0' }), {}, t).text).toBe('0')

    const action = col.number('n', 'h', 'count', { onClick: () => {} })
    expect(col.resolveCell(action, { n: 2 }, t).asAction).toBe(true)
    expect(col.resolveCell(action, { n: 0 }, t).asAction).toBe(false)
  })

  it('number: unit is appended to values that exist and never to the fallback dash', () => {
    const c = col.number('d', 'h', 'days', { unit: 'unit.days' })
    expect(col.resolveCell(c, { d: 2.5 }, t).text).toBe('2.5 unit.days')
    expect(col.resolveCell(c, {}, t).text).toBe('—')
  })

  it('number: display override, colour and negative class', () => {
    const c = col.number('d', 'h', 'count', { display: (row) => `+${row.d}`, color: () => 'red', negativeClass: true })
    expect(col.resolveCell(c, { d: -3 }, t)).toMatchObject({ text: '+-3', color: 'red', negative: true })
  })

  it('dept: label from key fields with optional status line that is not duplicated', () => {
    const c = col.dept()
    expect(col.resolveCell(c, { departmentKey: 'setting', statusName: 'รอฝัง' }, t)).toMatchObject({ text: 'view.executive.department.setting', sub: 'รอฝัง' })
    // row.label (เช่น แถว "รวม" ที่ไม่ใช่แผนกจริง) ชนะการแปล department.* — ไม่ขึ้น key ดิบ
    expect(col.resolveCell(col.dept({ keyFields: ['key'], withStatus: false }), { key: 'total', label: 'รวม', isTotal: true }, t).text).toBe('รวม')
    const abnormal = col.dept({ keyFields: ['deptKey', 'departmentKey'], withStatus: false })
    expect(col.resolveCell(abnormal, { deptKey: 'trim', statusName: 'x' }, t)).toMatchObject({ text: 'view.executive.department.trim', sub: '' })
  })

  it('product, date, lastUpdate, workers, planLink, chip, sparkline, shareBar, percent, text', () => {
    expect(col.resolveCell(col.product(), { productNumber: 'P', productName: 'N' }, t)).toMatchObject({ primary: 'P', secondary: 'N' })
    expect(col.resolveCell(col.date('d', 'h'), { d: null }, t).text).toBe('—')
    expect(col.resolveCell(col.date('d', 'h'), { d: '2026-10-01T00:00:00' }, t).text).toBe('01/10/2026')
    expect(col.resolveCell(col.lastUpdate(), { lastActionDate: '2026-10-01T00:00:00', lastUpdateBy: 'ก', lastAction: 'ข' }, t)).toMatchObject({ text: '01/10/2026', sub: 'ก · ข' })
    expect(col.resolveCell(col.lastUpdate(), {}, t).sub).toBe('— · view.productionInsight.wip.lastActionCreated')
    expect(col.resolveCell(col.workers(), { workers: ['a', 'b'] }, t).display.allNames).toEqual(['a', 'b'])
    expect(col.resolveCell(col.planLink(), { woText: 'WO1' }, t).label).toBe('WO1')
    expect(col.resolveCell(col.chip('c', 'h', () => 'warning', (row, tt) => tt('x')), {}, t)).toMatchObject({ kind: 'chip', text: 'x' })
    expect(col.resolveCell(col.sparkline('s', 'h', (row) => row.v), { v: [1, 2] }, t).values).toEqual([1, 2])
    const share = col.shareBar('s', 'h', { wait: (r) => r.w, work: (r) => r.k, waitLabel: 'w', workLabel: 'k' })
    expect(col.resolveCell(share, { w: 3, k: 1 }, t)).toMatchObject({ hasData: true, waitPercent: 75, workPercent: 25 })
    expect(col.resolveCell(share, {}, t).hasData).toBe(false)
    expect(col.resolveCell(col.percent('p', 'h'), { p: 5 }, t).text).toBe('5%')
    expect(col.resolveCell(col.text('x', 'h', { value: () => 'a / b' }), {}, t).text).toBe('a / b')
  })
})

describe('chipList / bold / chip border', () => {
  it('chipList resolves one line per item (label + chip), empty list stays empty', () => {
    const c = col.chipList('gems', 'h', (row, ctx, tt) => (row.gems || []).map((g) => ({ label: `${g}${ctx.suffix}`, chipText: tt('chip'), variant: 'green' })))
    expect(col.resolveCell(c, { gems: ['a', 'b'] }, t, { suffix: '!' }).lines).toEqual([
      { label: 'a!', chipText: 'chip', variant: 'green' },
      { label: 'b!', chipText: 'chip', variant: 'green' }
    ])
    expect(col.resolveCell(c, {}, t, { suffix: '' }).lines).toEqual([])
    expect(col.COLUMN_KINDS).toContain('chipList')
  })

  it('number bold only applies when a value exists', () => {
    const c = col.number('n', 'h', 'count', { bold: true })
    expect(col.resolveCell(c, { n: 1 }, t).bold).toBe(true)
    expect(col.resolveCell(c, {}, t).bold).toBe(false)
  })

  it('chip can use its own colour and border colour', () => {
    const c = col.chip('s', 'h', () => 'grey', () => 'x', { color: () => 'C', borderColor: () => 'B' })
    expect(col.resolveCell(c, {}, t)).toMatchObject({ color: 'C', borderColor: 'B' })
    const d = col.chip('s', 'h', () => 'pass', () => 'x')
    expect(col.resolveCell(d, {}, t).borderColor).toBe(col.resolveCell(d, {}, t).color)
  })
})

describe('percent digits / emphasisWhen', () => {
  it('percent uses 2 decimals by default and digits override', () => {
    expect(col.resolveCell(col.percent('p', 'h'), { p: 40.256 }, t).text).toBe('40.26%')
    expect(col.resolveCell(col.percent('p', 'h', { digits: 1 }), { p: 40.256 }, t).text).toBe('40.3%')
    expect(col.resolveCell(col.percent('p', 'h', { digits: 1 }), {}, t).text).toBe('—')
  })

  it('emphasisWhen(raw,row) wins over negativeClass and never applies to missing values', () => {
    const c = col.number('n', 'h', 'count', { emphasisWhen: (raw) => raw > 0 })
    expect(col.resolveCell(c, { n: 3 }, t).negative).toBe(true)
    expect(col.resolveCell(c, { n: -3 }, t).negative).toBe(false)
    expect(col.resolveCell(c, {}, t).negative).toBe(false)
    expect(col.resolveCell(col.number('n', 'h', 'count', { emphasisWhen: () => true }), { n: 0 }, t).negative).toBe(true)
  })
})

describe('stacked / bold fn / sup', () => {
  it('stacked resolves primary + secondary and registers the kind', () => {
    const c = col.stacked('name', 'h', (row) => ({ primary: row.name, secondary: row.code }))
    expect(col.resolveCell(c, { name: 'สมชาย', code: 'W1' }, t)).toMatchObject({ kind: 'stacked', primary: 'สมชาย', secondary: 'W1', strong: true })
    expect(col.resolveCell(col.stacked('n', 'h', () => ({ primary: 'a' }), { strong: false }), {}, t)).toMatchObject({ secondary: '', strong: false })
    expect(col.COLUMN_KINDS).toContain('stacked')
  })

  it('bold can be a per-row function and sup is shown only with a value', () => {
    const c = col.number('n', 'h', 'count', { bold: (row) => row.flag, sup: (row) => (row.s ? 's' : '') })
    expect(col.resolveCell(c, { n: 1, flag: true, s: true }, t)).toMatchObject({ bold: true, sup: 's' })
    expect(col.resolveCell(c, { n: 1, flag: false }, t)).toMatchObject({ bold: false, sup: '' })
    expect(col.resolveCell(c, {}, t)).toMatchObject({ bold: false, sup: '' })
  })
})

describe('header / tip functions and text render', () => {
  it('header function receives (t, ctx); tip can be a function of (ctx, t)', () => {
    const c = col.number('n', (tt, ctx) => `${tt('k')}-${ctx.unit}`, 'count', { tip: (ctx, tt) => `${tt('tip')}:${ctx.unit}` })
    expect(col.resolveHeader(c, t, { unit: 'piece' })).toBe('k-piece')
    expect(col.resolveTipText(c, { unit: 'piece' }, t)).toBe('tip:piece')
    expect(col.resolveTipText({ tip: 'k.tip' }, {}, t)).toBe('k.tip')
    expect(col.toTableColumns([c], t, { unit: 'plan' })[0].header).toBe('')
    expect(col.toTableColumns([col.number('n', (tt, ctx) => `h-${ctx.unit}`, 'count')], t, { unit: 'plan' })[0].header).toBe('h-plan')
  })

  it('text render(row, t) overrides reading the field', () => {
    expect(col.resolveCell(col.text('u', 'h', { render: (row, tt) => `${row.u}-${tt('x')}` }), { u: 'PC' }, t).text).toBe('PC-x')
  })
})
