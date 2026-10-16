// ตรวจว่าทุก key ที่แท็บ Flow เรียกใช้มีทั้งไทยและอังกฤษ และชุด key ของสองภาษาตรงกัน
import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

import flowTh from '@/language/view/executive/flow-th.js'
import flowEn from '@/language/view/executive/flow-en.js'
import { t as fakeT, board, zones } from './flow-test-data.js'
import { buildPanelModel, buildCompareBlocks } from './flow-panel-models.js'
import { buildStationModels, buildBossTiles, buildGateLabels, zoneLabelText } from './flow-helpers.js'
import { ZONE_IDS, LENS_KEYS, COMPARE_KEYS, STOCK_LENS_KEYS, STATION_IDS } from './flow-layout.js'

const here = dirname(fileURLToPath(import.meta.url))
const PREFIX = 'view.executive.flow.'

function flatten(obj, prefix = '') {
  return Object.entries(obj).flatMap(([key, value]) =>
    value && typeof value === 'object' ? flatten(value, `${prefix}${key}.`) : [`${prefix}${key}`]
  )
}

const thKeys = new Set(flatten(flowTh))
const enKeys = new Set(flatten(flowEn))

// เก็บทุก key ที่ fakeT ถูกเรียกขณะ build model จริง (ครอบ key แบบ dynamic) แล้วตรวจกับไฟล์ภาษา
function collectUsedKeys() {
  const used = new Set()
  const t = (key, params) => {
    used.add(key)
    return fakeT(key, params)
  }
  const states = []
  ;['all', ...ZONE_IDS, ...STATION_IDS].forEach((selected) => {
    LENS_KEYS.forEach((lens) => {
      ;['', ...COMPARE_KEYS].forEach((compare) => {
        STOCK_LENS_KEYS.forEach((stockLens) => states.push({ board, zones, selected, lens, compare, stockLens, stockSel: '' }))
      })
    })
  })
  states.forEach((s) => {
    buildPanelModel(s, t)
    buildStationModels(s, { stockLens: s.stockLens }, t)
    buildGateLabels(s, t)
    buildBossTiles(board, t)
    ZONE_IDS.forEach((z) => zoneLabelText(z, s.lens, board, t))
  })
  ;['gold', 'size', 'ptype'].forEach((dim) => buildCompareBlocks(dim, { board, zones }, t))
  // ไม่มีข้อมูล → ทางแยกข้อความ "ไม่มีข้อมูล"
  buildPanelModel({ board: null, zones: {}, selected: 'z-prod', lens: 'worker', compare: 'gold' }, t)
  return [...used].filter((k) => k.startsWith(PREFIX)).map((k) => k.slice(PREFIX.length))
}

function staticKeysInVueFiles() {
  const dir = join(here, 'components', 'flow')
  const files = [...readdirSync(dir).filter((f) => f.endsWith('.vue')).map((f) => join(dir, f)), join(here, 'components', 'flow-view.vue')]
  const keys = new Set()
  files.forEach((file) => {
    const src = readFileSync(file, 'utf8')
    for (const m of src.matchAll(/view\.executive\.flow\.([A-Za-z0-9_.]+)(?=['"`])/g)) keys.add(m[1])
    for (const m of src.matchAll(/view\.executive\.flow\.([A-Za-z0-9_.]*)\$\{/g)) keys.add(`${m[1]}*`)
  })
  return [...keys]
}

describe('flow i18n', () => {
  it('has the same keys in Thai and English', () => {
    expect([...thKeys].filter((k) => !enKeys.has(k))).toEqual([])
    expect([...enKeys].filter((k) => !thKeys.has(k))).toEqual([])
  })

  it('has no empty messages', () => {
    const empty = (obj) => flatten(obj).filter((k) => !k.split('.').reduce((o, p) => o[p], obj))
    expect(empty(flowTh)).toEqual([])
    expect(empty(flowEn)).toEqual([])
  })

  it('defines every key used while building the models', () => {
    const missing = collectUsedKeys().filter((k) => !thKeys.has(k))
    expect([...new Set(missing)]).toEqual([])
  })

  it('defines every static key used in the components', () => {
    const keys = staticKeysInVueFiles().filter((k) => !k.endsWith('*'))
    expect(keys.filter((k) => !thKeys.has(k))).toEqual([])
  })

  it('defines the dynamic component keys', () => {
    const dynamic = [
      ...[1, 2, 3, 4].map((n) => `legend.age${n}`),
      ...['high', 'med', 'low'].map((c) => `boss.conf.${c}`),
      ...LENS_KEYS.map((l) => `lens.${l}`),
      ...['off', ...COMPARE_KEYS].map((c) => `compare.${c}`),
      ...STOCK_LENS_KEYS.map((l) => `stockLens.${l}`)
    ]
    expect(dynamic.filter((k) => !thKeys.has(k))).toEqual([])
  })

  it('never contains an unescaped pipe or at-sign that vue-i18n would parse', () => {
    const bad = [...thKeys, ...enKeys].filter(() => false)
    const check = (obj) => flatten(obj).filter((k) => /[|@]/.test(k.split('.').reduce((o, p) => o[p], obj).replace(/\{'[|@]'\}/g, '')))
    expect([...bad, ...check(flowTh), ...check(flowEn)]).toEqual([])
  })
})
