// material-gem.config.spec.js — config พลอยของแท็บคลังวัตถุดิบ + helper หลายหน่วย (เม็ด/กะรัต) + ข้อความ rulesGem + Excel พลอย
import { describe, it, expect } from 'vitest'
import { createI18n } from 'vue-i18n'

import productionInsightTh from '@/language/view/production-insight/th.js'
import productionInsightEn from '@/language/view/production-insight/en.js'
import executiveTh from '@/language/view/executive/th.js'
import executiveEn from '@/language/view/executive/en.js'
import { BLOCK_TYPES } from '@/components/insight/page/blocks/block-types.js'
import { buildKpiCards } from '@/components/insight/page/blocks/kpi-block-helpers.js'
import { buildDonutChart } from '@/components/insight/page/blocks/donut-block-helpers.js'
import { collectBlockIds, findDuplicates, flattenBlocks, isNodeVisible } from '@/components/insight/page/insight-page-helpers.js'
import { validateTabConfig, blocksForTab } from '@/components/insight/page/insight-tabs-helpers.js'
import { resolveFindingParams, formatQtyList, formatQty } from '@/components/insight/insight-helpers.js'
import { materialGemConfig } from './material-gem.config.js'
import { buildMaterialGemSheets } from '../executive-insight-excel-stock-sales-material.js'
import { buildGemGroupRows, buildGemItemRows, remapGemFindings, kpiUnitEntries, formatUnitField, formatQtyUnit, policyFieldsFor, validatePolicyForm, buildPolicySaveBody, createPolicyForm } from './material-helpers.js'

const makeI18n = (locale, lang, exec) => createI18n({ legacy: false, locale, messages: { [locale]: { view: { productionInsight: lang, executive: exec, common: {} } } } })
const th = makeI18n('th', productionInsightTh, executiveTh)
const en = makeI18n('en', productionInsightEn, executiveEn)
const t = th.global.t

const overview = {
  asOf: '2026-10-30T09:00:00',
  unit: 'mixed',
  units: ['ct', 'pcs'],
  policy: { deadStockDays: 90, floorQty: 0 },
  kpi: {
    mixedUnits: true,
    itemCount: 30,
    withUsageCount: 10,
    zeroCount: 1,
    belowMinCount: 2,
    nearMinCount: 3,
    deadCount: 4,
    negativeCount: 1,
    onProcessStaleCount: 2,
    totalOnHand: 0,
    totalValue: 2500000,
    totalOnProcessValue: 1000,
    deadValue: 500,
    byUnit: [
      { unit: 'ct', itemCount: 10, totalOnHand: 123374.5, totalOnProcess: 5, deadOnHand: 2, negativeWeight: -3.25 },
      { unit: 'pcs', itemCount: 20, totalOnHand: 1200000, totalOnProcess: 40, deadOnHand: 7, negativeWeight: 0 }
    ]
  },
  groups: [
    { code: 'RB', name: 'ทับทิม', itemCount: 5, value: 100, byUnit: [{ unit: 'pcs', totalOnHand: 50, totalOnProcess: 0 }], negativeCount: 0 },
    { code: 'DM', name: 'เพชร', itemCount: 9, value: 900, byUnit: [{ unit: 'pcs', totalOnHand: 10, totalOnProcess: 1 }, { unit: 'ct', totalOnHand: 4.5, totalOnProcess: 0 }], negativeCount: 1 },
    { code: 'ZZ', name: 'ไม่มีราคา', itemCount: 1, value: 0, byUnit: [{ unit: 'ct', totalOnHand: 3, totalOnProcess: 0 }], negativeCount: 0 }
  ],
  items: [
    { itemKey: 'G1', code: 'G1', label: 'พลอย 1', groupName: 'ทับทิม', unit: 'pcs', onHand: 50, onProcess: 0, value: 100, onProcessValue: 0, status: 'ok', minSource: 'auto' },
    { itemKey: 'G2', code: 'G2', label: 'พลอย 2', groupName: 'เพชร', unit: 'ct', onHand: 4.5, onProcess: 0, value: 0, onProcessValue: 0, status: 'ok', minSource: 'override', neverConsumed: true }
  ],
  seriesByUnit: [
    { unit: 'ct', points: [{ month: '2026-09-01', inflow: 1, consumed: 2, returned: 0, other: 0, endStock: 5 }] },
    { unit: 'pcs', points: [{ month: '2026-09-01', inflow: 10, consumed: 20, returned: 0, other: 0, endStock: 500 }] }
  ],
  valueSeries: [{ month: '2026-09-01', inflowValue: 1000, consumedValue: 500, returnedValue: 0, endStockValue: 20000 }]
}
const ctx = (canManage = false) => ({ data: { Overview: overview }, filter: { kind: 'GEM', canManage }, t, loading: {}, state: { itemsFilter: 'all' } })

describe('formatting per unit', () => {
  it('pieces are whole numbers, carats keep up to 2 decimals, empty is a dash', () => {
    expect(formatQty(1200000.4, 'pcs')).toBe('1,200,000')
    expect(formatQty(123374.456, 'ct')).toBe('123,374.46')
    expect(formatQty(null, 'ct')).toBe('—')
    expect(formatQtyUnit(12, 'pcs', t)).toBe('12 เม็ด')
    expect(formatQtyUnit(1.5, 'ct', en.global.t)).toBe('1.5 ct')
  })

  it('lists units pieces-first and never adds them together; zero units are dropped', () => {
    expect(formatQtyList([{ unit: 'ct', total: 123374 }, { unit: 'pcs', total: 1200000 }], t)).toBe('1,200,000 เม็ด · 123,374 กะรัต')
    expect(formatQtyList([{ unit: 'ct', total: 0 }, { unit: 'pcs', total: 5 }], t)).toBe('5 เม็ด')
    expect(formatQtyList([{ unit: 'ct', total: 0 }], t)).toBe('0 กะรัต')
  })

  it('KPI entries come from byUnit, with a single gram entry as the gold fallback', () => {
    expect(formatUnitField(kpiUnitEntries(overview.kpi), 'totalOnHand', t)).toBe('1,200,000 เม็ด · 123,374.5 กะรัต')
    expect(formatUnitField(kpiUnitEntries(overview.kpi), 'negativeWeight', t, true)).toBe('3.25 กะรัต')
    expect(kpiUnitEntries({ totalOnHand: 10 })).toEqual([expect.objectContaining({ unit: 'g', totalOnHand: 10 })])
  })
})

describe('gem rows', () => {
  it('group rows are sorted by value with per-unit text', () => {
    const rows = buildGemGroupRows(overview.groups, t)
    expect(rows.map((r) => r.key)).toEqual(['DM', 'RB', 'ZZ'])
    expect(rows[0]).toMatchObject({ label: 'เพชร', value: 900, onHandText: '10 เม็ด · 4.5 กะรัต' })
  })

  it('item rows carry the unit label and flag items without a price', () => {
    const rows = buildGemItemRows(overview.items, 'all', t)
    expect(rows.find((r) => r.itemKey === 'G1')).toMatchObject({ unitText: 'เม็ด', noPrice: false })
    expect(rows.find((r) => r.itemKey === 'G2')).toMatchObject({ unitText: 'กะรัต', noPrice: true })
  })

  it('gem policy has no floor field; the form validates and saves without it', () => {
    expect(policyFieldsFor('GEM').map((f) => f.key)).not.toContain('floorQty')
    expect(policyFieldsFor('GOLD').map((f) => f.key)).toContain('floorQty')
    const fields = policyFieldsFor('GEM')
    const form = createPolicyForm({ windowMonths: 3, leadTimeDays: 7, safetyDays: 3, nearPercent: 150, deadStockDays: 90, minHistoryMonths: 3 })
    expect(validatePolicyForm(form, fields)).toEqual({})
    expect(validatePolicyForm(form)).toHaveProperty('floorQty')
    expect(buildPolicySaveBody('GEM', { ...form, safetyDays: 5 }, { safetyDays: 3, windowMonths: 3 }, fields)).toEqual({ kind: 'GEM', safetyDays: 5, leadTimeDays: 7, nearPercent: 150, deadStockDays: 90, minHistoryMonths: 3 })
  })
})

describe('gem config structure', () => {
  const nodes = flattenBlocks(materialGemConfig.blocks)

  it('ids unique, types known, tabs valid, same report ids as gold', () => {
    expect(findDuplicates(collectBlockIds([...materialGemConfig.blocks, ...materialGemConfig.floating]))).toEqual([])
    nodes.forEach((n) => expect(BLOCK_TYPES.concat(['slot']), n.id).toContain(n.type))
    expect(validateTabConfig(materialGemConfig)).toEqual([])
    expect(blocksForTab(materialGemConfig, 'overview').map((n) => n.id)).toEqual(['matKpi', 'matShare'])
    expect(blocksForTab(materialGemConfig, 'groups').map((n) => n.id)).toEqual(['matGroups', 'matGroupTable'])
    expect(blocksForTab(materialGemConfig, 'trend').map((n) => n.id)).toEqual(['matTrendPcs', 'matTrendCt', 'matTrend'])
    expect(blocksForTab(materialGemConfig, 'items').map((n) => n.id)).toEqual(['matItemsToolbar', 'matItems', 'matItemsEdit'])
    expect(materialGemConfig.i18nPrefix).toBe('view.productionInsight.materialInsight.rulesGem')
    expect(materialGemConfig.sources.Overview.params({ kind: 'GEM' })).toEqual({ kind: 'GEM', months: 12 })
  })

  it('every static i18n key exists in th and en', () => {
    const keys = new Set()
    const walk = (v) => {
      if (typeof v === 'string') v.startsWith('view.productionInsight.materialInsight') && keys.add(v)
      else if (Array.isArray(v)) v.forEach(walk)
      else if (v && typeof v === 'object') Object.values(v).forEach(walk)
    }
    walk(materialGemConfig)
    expect(keys.size).toBeGreaterThan(25)
    keys.forEach((key) => {
      expect(th.global.te(key, 'th'), `th ${key}`).toBe(true)
      expect(en.global.te(key, 'en'), `en ${key}`).toBe(true)
    })
  })

  it('trend charts show only the units the response has; the value chart reads valueSeries', () => {
    const [pcs, ct, value] = ['matTrendPcs', 'matTrendCt', 'matTrend'].map((id) => materialGemConfig.blocks.find((n) => n.id === id))
    expect([isNodeVisible(pcs, ctx()), isNodeVisible(ct, ctx())]).toEqual([true, true])
    const pcsOnly = { ...ctx(), data: { Overview: { ...overview, units: ['pcs'] } } }
    expect([isNodeVisible(pcs, pcsOnly), isNodeVisible(ct, pcsOnly)]).toEqual([true, false])
    expect(pcs.points(ctx())[0].endStock).toBe(500)
    expect(ct.points(ctx())[0].endStock).toBe(5)
    expect(value.points(ctx())[0].endStockValue).toBe(20000)
  })

  it('only the table matching the permission is visible and the edit column opens the modal with the whole row', () => {
    const readOnly = materialGemConfig.blocks.find((n) => n.id === 'matItems')
    const editable = materialGemConfig.blocks.find((n) => n.id === 'matItemsEdit')
    expect([isNodeVisible(readOnly, ctx(false)), isNodeVisible(editable, ctx(false))]).toEqual([true, false])
    expect([isNodeVisible(readOnly, ctx(true)), isNodeVisible(editable, ctx(true))]).toEqual([false, true])
    const state = {}
    editable.sections[0].columns.at(-1).onClick({ itemKey: 'G1' }, { setState: (k, v) => (state[k] = v) })
    expect(state.minModal).toEqual({ itemKey: 'G1' })
    const [modalSlot] = materialGemConfig.floating
    expect(modalSlot.props({ ...ctx(true), state: { minModal: { itemKey: 'G1' } } })).toMatchObject({ isShow: true, kind: 'GEM' })
  })

  it('item quantity cells use the row unit and show no-price items clearly', () => {
    const columns = materialGemConfig.blocks.find((n) => n.id === 'matItems').sections[0].columns
    const onHand = columns.find((c) => c.field === 'onHand')
    const value = columns.find((c) => c.field === 'value')
    expect(onHand.display({ unit: 'pcs' }, t, 12)).toBe('12 เม็ด')
    expect(onHand.display({ unit: 'ct' }, t, 1.25)).toBe('1.25 กะรัต')
    expect(value.display({}, t, 0)).toBe('—')
    expect(value.display({}, t, 1234.5)).toBe('฿1,235')
    expect(value.badge({ noPrice: true }, t)).toBe('ไม่มีราคา')
    expect(value.badge({ noPrice: false }, t)).toBe('')
  })
})

describe('gem KPI cards and donut', () => {
  it('headline is the value in THB, quantities are per unit, onProcess card exists', () => {
    const kpi = materialGemConfig.blocks.find((n) => n.id === 'matKpi')
    const cards = buildKpiCards(kpi, ctx(), t)
    const byId = Object.fromEntries(cards.map((c) => [c.key, c]))
    expect(cards.map((c) => c.key)).toEqual(['items', 'onHand', 'attention', 'negative', 'near', 'dead', 'onProcess'])
    expect(byId.onHand.value).toBe('฿2,500,000')
    expect(byId.onHand.sub).toBe('คงเหลือ 1,200,000 เม็ด · 123,374.5 กะรัต')
    expect(byId.negative.sub).toBe('ติดลบรวม 3.25 กะรัต')
    expect(byId.dead.sub).toContain('7 เม็ด · 2 กะรัต')
    expect(byId.dead.sub).toContain('฿500')
    expect(byId.onProcess).toMatchObject({ value: '฿1,000', tone: 'warning' })
    expect(byId.onProcess.sub).toContain('40 เม็ด · 5 กะรัต')
  })

  it('donut: value share by gem type (zero-value types are not plotted) with the THB total in the centre', () => {
    const donut = materialGemConfig.blocks.find((n) => n.id === 'matShare')
    const chart = buildDonutChart(donut, donut.slices(ctx()), t, ctx())
    expect(chart.series).toEqual([900, 100])
    expect(chart.options.plotOptions.pie.donut.labels.total.formatter()).toBe('฿1,000')
  })
})

describe('gem findings', () => {
  const resolve = (params, i18n = th) => resolveFindingParams(params, undefined, undefined, undefined, undefined, undefined, (entries) => formatQtyList(entries, (k) => i18n.global.t(k)))

  it('mixed units: byUnit becomes "X เม็ด · Y กะรัต" in every rule text', () => {
    const [item] = remapGemFindings([{ code: 'MAT_DEAD_STOCK', params: { count: 3, days: 90, byUnit: [{ unit: 'ct', total: 2 }, { unit: 'pcs', total: 7 }] } }], undefined, undefined, overview)
    const text = th.global.t('view.productionInsight.materialInsight.rulesGem.MAT_DEAD_STOCK', resolve(item.params))
    expect(text).toBe('วัตถุดิบค้างนิ่ง (ไม่เคลื่อนไหวเกิน 90 วัน) 3 รายการ รวม 7 เม็ด · 2 กะรัต')
    const textEn = en.global.t('view.productionInsight.materialInsight.rulesGem.MAT_DEAD_STOCK', resolve(item.params, en))
    expect(textEn).toContain('7 pcs · 2 ct')
  })

  it('single unit: the scalar total gets the unit of the response; no unit known leaves the finding untouched', () => {
    const [item] = remapGemFindings([{ code: 'MAT_ON_PROCESS_STALE', params: { count: 1, days: 14, totalOnProcess: 12 } }], undefined, undefined, { units: ['pcs'] })
    expect(th.global.t('view.productionInsight.materialInsight.rulesGem.MAT_ON_PROCESS_STALE', resolve(item.params))).toContain('รวม 12 เม็ด')
    const raw = { code: 'MAT_ON_PROCESS_STALE', params: { count: 1, totalOnProcess: 12 } }
    expect(remapGemFindings([raw], undefined, undefined, { units: ['pcs', 'ct'] })[0]).toBe(raw)
  })

  it('negative-balance finding keeps the inbound remap and every rule code interpolates fully in th and en', () => {
    expect(remapGemFindings([{ code: 'MAT_NEGATIVE_BALANCE', params: { ledgerHasInbound: true } }])[0].code).toBe('MAT_NEGATIVE_BALANCE_INBOUND')
    const params = { count: 2, topItems: 'A, B', days: 90, totalWeight: '1 เม็ด', totalOnHand: '1 เม็ด', totalOnProcess: '1 เม็ด', leadDays: 7, minCoverDays: 3, historyMonths: 3, zeroCount: 1, belowCount: 2, stockoutCount: 0 }
    Object.keys(productionInsightTh.materialInsight.rulesGem).forEach((code) => {
      ;[th, en].forEach((i18n) => {
        const key = `view.productionInsight.materialInsight.rulesGem.${code}`
        const text = i18n.global.t(key, params)
        expect(text, code).not.toBe(key)
        expect(text, code).not.toContain('{')
      })
    })
    expect(Object.keys(productionInsightTh.materialInsight.rulesGem)).toEqual(Object.keys(productionInsightEn.materialInsight.rulesGem))
  })
})

describe('gem Excel sheets', () => {
  it('items carry unit + value, series are listed per unit, value series is its own sheet; headers are translated', () => {
    const sheets = buildMaterialGemSheets(overview, { t, config: materialGemConfig, kindLabel: 'พลอย' })
    expect(sheets.map((s) => s.sheetName)).toEqual(['พลอย-สรุปปัญหา', 'พลอย-รายการ', 'พลอย-รายเดือน', 'พลอย-มูลค่ารายเดือน'])
    sheets.forEach((s) => expect(s.sheetName.length).toBeLessThanOrEqual(31))
    expect(sheets[1].data[0].code).toContain('พลอย')
    const g1 = sheets[1].data.find((r) => r.code === 'G1')
    expect(g1).toMatchObject({ type: 'ทับทิม', unit: 'เม็ด', onHand: '50', value: '100.00' })
    const g2 = sheets[1].data.find((r) => r.code === 'G2')
    expect(g2).toMatchObject({ unit: 'กะรัต', onHand: '4.50', value: '0.00', lastMove: 'ไม่เคยเบิก' })
    expect(sheets[2].data.filter((r) => r.unit && r.month).map((r) => r.unit)).toEqual(['กะรัต', 'เม็ด'])
    expect(sheets[3].data.find((r) => r.endStockValue)).toMatchObject({ endStockValue: '20,000.00' })
    ;[th, en].forEach((i18n) => {
      buildMaterialGemSheets(overview, { t: i18n.global.t, config: materialGemConfig, kindLabel: 'x' }).forEach((s) => s.columns.forEach((c) => expect(c.header).not.toMatch(/^view\./)))
    })
  })
})
