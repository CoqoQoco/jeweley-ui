// material.config.spec.js — sanity ของ config แท็บคลังวัตถุดิบ (ทอง): โหมดแท็บ, block ต่อแท็บ, reportRef → แท็บ+ตัวสลับ (รวมการ์ด KPI), i18n th+en, ข้อความ rule ทุก code, ไม่มี onProcess, config ไม่ reactive
import { describe, it, expect } from 'vitest'
import { createI18n } from 'vue-i18n'
import { reactive, isReactive } from 'vue'

import productionInsightTh from '@/language/view/production-insight/th.js'
import productionInsightEn from '@/language/view/production-insight/en.js'
import executiveTh from '@/language/view/executive/th.js'
import executiveEn from '@/language/view/executive/en.js'
import { BLOCK_TYPES } from '@/components/insight/page/blocks/block-types.js'
import { COLUMN_KINDS } from '@/components/insight/page/columns.js'
import { buildKpiCards } from '@/components/insight/page/blocks/kpi-block-helpers.js'
import { buildDonutChart } from '@/components/insight/page/blocks/donut-block-helpers.js'
import { collectBlockIds, findDuplicates, flattenBlocks, buildInitialState, isNodeVisible } from '@/components/insight/page/insight-page-helpers.js'
import { validateTabConfig, findTabForReportRef, blocksForTab, hasTabs, isSourceTabGated } from '@/components/insight/page/insight-tabs-helpers.js'
import { materialGoldConfig, getMaterialConfig } from './material.config.js'

const makeI18n = (locale, lang, exec) => createI18n({ legacy: false, locale, messages: { [locale]: { view: { productionInsight: lang, executive: exec, common: {} } } } })
const th = makeI18n('th', productionInsightTh, executiveTh)
const en = makeI18n('en', productionInsightEn, executiveEn)
const t = th.global.t

function collectI18nKeys(value, out = new Set()) {
  if (typeof value === 'string') {
    if (value.startsWith('view.productionInsight.materialInsight')) out.add(value)
  } else if (Array.isArray(value)) {
    value.forEach((item) => collectI18nKeys(item, out))
  } else if (value && typeof value === 'object') {
    Object.values(value).forEach((item) => collectI18nKeys(item, out))
  }
  return out
}

const overview = {
  asOf: '2026-10-21T09:00:00',
  policy: { deadStockDays: 90 },
  kpi: { itemCount: 20, withUsageCount: 12, totalOnHand: 1234.5, zeroCount: 1, belowMinCount: 2, nearMinCount: 0, deadCount: 4, deadOnHand: 99.5 },
  groups: [{ code: 'YG', name: 'ทอง', itemCount: 10, onHand: 800 }, { code: 'WG', name: 'ขาว', itemCount: 10, onHand: 434.5 }],
  items: []
}
const ctx = (canManage) => ({ data: { Overview: overview }, filter: { kind: 'GOLD', canManage }, t, loading: {}, state: { itemsFilter: 'all' } })

describe('material config structure', () => {
  const nodes = flattenBlocks(materialGoldConfig.blocks)

  it('ids are unique and block types known', () => {
    expect(findDuplicates(collectBlockIds([...materialGoldConfig.blocks, ...materialGoldConfig.floating]))).toEqual([])
    nodes.forEach((n) => expect(BLOCK_TYPES.concat(['slot']), n.id).toContain(n.type))
  })

  it('table columns use registered kinds; the editable table adds an icon action column', () => {
    nodes.filter((n) => n.type === 'table').forEach((n) => n.sections.forEach((s) => (s.columns || []).forEach((c) => expect(COLUMN_KINDS).toContain(c.kind))))
    const readOnly = materialGoldConfig.blocks.find((n) => n.id === 'matItems').sections[0].columns
    const editable = materialGoldConfig.blocks.find((n) => n.id === 'matItemsEdit').sections[0].columns
    expect(editable).toHaveLength(readOnly.length + 1)
    expect(editable.at(-1)).toMatchObject({ field: 'editText', actionIcon: 'bi-pencil' })
    expect(typeof editable.at(-1).onClick).toBe('function')
    expect(readOnly.some((c) => c.onClick)).toBe(false)
  })

  it('no on-process KPI or column for gold (onProcess is not maintained)', () => {
    const kpi = materialGoldConfig.blocks.find((n) => n.id === 'matKpi')
    expect(kpi.cards.map((c) => c.id)).toEqual(['items', 'onHand', 'attention', 'near', 'dead'])
    const fields = materialGoldConfig.blocks.find((n) => n.id === 'matItems').sections[0].columns.map((c) => c.field)
    expect(fields.some((f) => /onProcess/i.test(f))).toBe(false)
  })

  it('every static i18n key exists in th and en', () => {
    const keys = collectI18nKeys(materialGoldConfig)
    expect(keys.size).toBeGreaterThan(30)
    keys.forEach((key) => {
      expect(th.global.te(key, 'th'), `th ${key}`).toBe(true)
      expect(en.global.te(key, 'en'), `en ${key}`).toBe(true)
    })
  })

  it('Overview is the one eager source, not metal-scoped, requested with {kind, months} only', () => {
    expect(Object.keys(materialGoldConfig.sources)).toEqual(['Overview'])
    const source = materialGoldConfig.sources.Overview
    expect(source).toMatchObject({ endpoint: 'MaterialInsight/Overview', scoped: false })
    expect(source.params({ kind: 'GOLD', canManage: true })).toEqual({ kind: 'GOLD', months: 12 })
    expect(isSourceTabGated(source, [])).toBe(false)
    expect(materialGoldConfig.i18nPrefix).toBe('view.productionInsight.materialInsight.rules')
  })

  it('stays out of Vue reactivity and the kind map falls back to gold', () => {
    expect(isReactive(reactive({ config: materialGoldConfig }).config)).toBe(false)
    expect(getMaterialConfig('GOLD')).toBe(materialGoldConfig)
    expect(getMaterialConfig('GEM')).toBe(materialGoldConfig)
  })
})

describe('material tabs', () => {
  const tabOf = (ref, params, canManage = false) => materialGoldConfig.tabFor(ref, params || {}, ctx(canManage)) || findTabForReportRef(materialGoldConfig, ref)

  it('opts in with the 4 data tabs and validates', () => {
    expect(hasTabs(materialGoldConfig)).toBe(true)
    expect(materialGoldConfig.tabs.map((x) => x.key)).toEqual(['overview', 'groups', 'trend', 'items'])
    expect(validateTabConfig(materialGoldConfig)).toEqual([])
  })

  it('blocks per tab', () => {
    const ids = (key) => blocksForTab(materialGoldConfig, key).map((n) => n.id)
    expect(ids('overview')).toEqual(['matKpi', 'matShare'])
    expect(ids('groups')).toEqual(['matGroups', 'matGroupTable', 'matSizeTable'])
    expect(ids('trend')).toEqual(['matTrend'])
    expect(ids('items')).toEqual(['matItemsToolbar', 'matItems', 'matItemsEdit'])
  })

  it('only the table matching the permission is visible', () => {
    const readOnly = materialGoldConfig.blocks.find((n) => n.id === 'matItems')
    const editable = materialGoldConfig.blocks.find((n) => n.id === 'matItemsEdit')
    expect([isNodeVisible(readOnly, ctx(false)), isNodeVisible(editable, ctx(false))]).toEqual([true, false])
    expect([isNodeVisible(readOnly, ctx(true)), isNodeVisible(editable, ctx(true))]).toEqual([false, true])
  })

  it('refs and findings route to the right tab / toggle', () => {
    expect(tabOf('matTrend').tab).toBe('trend')
    expect(tabOf('matItems', { findingCode: 'MAT_ZERO_STOCK' })).toMatchObject({ tab: 'items', reveal: { value: 'zero' }, anchor: 'matItems' })
    expect(tabOf('matItems', { findingCode: 'MAT_BELOW_MIN' }, true)).toMatchObject({ reveal: { value: 'below' }, anchor: 'matItemsEdit' })
    expect(tabOf('matItems', { findingCode: 'MAT_NEAR_MIN' }).reveal.value).toBe('near')
    expect(tabOf('matItems', { findingCode: 'MAT_DEAD_STOCK' }).reveal.value).toBe('dead')
    expect(tabOf('matOnProcess', {}).tab).toBe('items')
  })

  it('KPI cards link to their tab / toggle', () => {
    const kpi = materialGoldConfig.blocks.find((n) => n.id === 'matKpi')
    const targets = kpi.cards.map((c) => {
      const target = tabOf(c.reportRef, c.reportParams)
      return [c.id, target.tab, target.reveal?.value ?? null]
    })
    expect(targets).toEqual([['items', 'items', 'all'], ['onHand', 'groups', null], ['attention', 'items', 'zero'], ['near', 'items', 'near'], ['dead', 'items', 'dead']])
  })

  it('the items toolbar slot lists the five filters with KPI counts, shows the policy button only for managers and writes itemsFilter', () => {
    const slot = materialGoldConfig.blocks.find((n) => n.id === 'matItemsToolbar')
    const props = slot.props(ctx(true))
    expect(props.options.map((o) => o.value)).toEqual(['all', 'zero', 'below', 'near', 'dead'])
    expect(props.options[0].label).toContain('20')
    expect(props.canManage).toBe(true)
    expect(slot.props(ctx(false)).canManage).toBe(false)
    expect(buildInitialState(materialGoldConfig.state)).toEqual({ itemsFilter: 'all', minModal: null, policyDrawer: false })
    const spy = { state: {}, setState(key, value) { this.state[key] = value } }
    slot.events['update:modelValue'](spy, 'zero')
    slot.events['open-policy'](spy)
    expect(spy.state).toEqual({ itemsFilter: 'zero', policyDrawer: true })
  })

  it('the edit button stores the whole row in minModal; the floating slots close and reload Overview after saving', () => {
    const edit = materialGoldConfig.blocks.find((n) => n.id === 'matItemsEdit').sections[0].columns.at(-1)
    const calls = { state: {}, reloaded: [] }
    const spy = { state: calls.state, setState: (k, v) => (calls.state[k] = v), reload: (names) => calls.reloaded.push(names) }
    edit.onClick({ itemKey: 'YG|S1' }, spy)
    expect(calls.state.minModal).toEqual({ itemKey: 'YG|S1' })
    const [modalSlot, drawerSlot] = materialGoldConfig.floating
    modalSlot.events.saved(spy)
    drawerSlot.events.saved(spy)
    expect(calls.state).toMatchObject({ minModal: null, policyDrawer: false })
    expect(calls.reloaded).toEqual([['Overview'], ['Overview']])
    expect(modalSlot.props({ ...ctx(true), state: { minModal: { itemKey: 'a' } } })).toMatchObject({ isShow: true, kind: 'GOLD', policy: { deadStockDays: 90 } })
  })
})

describe('material KPI cards, donut and rule texts', () => {
  it('KPI values use grams and thousands separators with tones from counts', () => {
    const kpi = materialGoldConfig.blocks.find((n) => n.id === 'matKpi')
    const cards = buildKpiCards(kpi, ctx(false), t)
    expect(cards.map((c) => c.value)).toEqual(['20', '1,234.5 g', '3', '0', '4'])
    expect(cards.map((c) => c.tone)).toEqual(['main', 'main', 'warning', 'green', 'warning'])
  })

  it('donut: on-hand by gold group with the grams total in the centre', () => {
    const donut = materialGoldConfig.blocks.find((n) => n.id === 'matShare')
    const chart = buildDonutChart(donut, donut.slices(ctx(false)), t, ctx(false))
    expect(chart.series).toEqual([800, 434.5])
    expect(chart.options.plotOptions.pie.donut.labels.total.formatter()).toBe('1,234.5 g')
  })

  const codes = {
    MAT_ZERO_STOCK: { count: 2, topItems: 'A, B' },
    MAT_BELOW_MIN: { count: 2, topItems: 'A, B' },
    MAT_NEAR_MIN: { count: 2, topItems: 'A, B' },
    MAT_DEAD_STOCK: { count: 3, totalOnHand: '12.5', days: 90 },
    MAT_ON_PROCESS_STALE: { count: 1, totalOnProcess: '2', days: 14 },
    FC_MAT_STOCKOUT: { count: 2, topItems: 'A, B', leadDays: 7, minCoverDays: 3.5, historyMonths: 3, windowMonths: 3 },
    ACT_REORDER_MATERIAL: { zeroCount: 1, belowCount: 2, stockoutCount: 0 },
    ACT_CLEAR_DEAD_STOCK: { count: 3, totalOnHand: '12.5' },
    ACT_RETURN_ON_PROCESS: { count: 1, totalOnProcess: '2' },
    ACT_REVIEW_MIN: { count: 2 }
  }

  it('every rule code has a th and en text that interpolates fully; the forecast carries the usage-history caveat', () => {
    Object.entries(codes).forEach(([code, params]) => {
      const key = `view.productionInsight.materialInsight.rules.${code}`
      ;[th, en].forEach((i18n) => {
        const text = i18n.global.t(key, params)
        expect(text, code).not.toBe(key)
        expect(text, code).not.toContain('{')
      })
    })
    expect(th.global.t('view.productionInsight.materialInsight.rules.FC_MAT_STOCKOUT', codes.FC_MAT_STOCKOUT)).toContain('ข้อมูลเบิกใช้ 3 เดือน')
  })

  it('related-action labels exist', () => {
    ;['MAT_ZERO_STOCK', 'MAT_BELOW_MIN', 'MAT_NEAR_MIN', 'MAT_DEAD_STOCK', 'MAT_ON_PROCESS_STALE', 'FC_MAT_STOCKOUT'].forEach((code) => {
      expect(productionInsightTh.codeLabel[code], code).toBeTruthy()
      expect(productionInsightEn.codeLabel[code], code).toBeTruthy()
    })
  })
})
