// flow-helpers.js — logic ล้วน (ไม่แตะ DOM/vue) ของแท็บ Flow ในหน้า /executive
// รับ response ของ ExecutiveReport/FlowBoard + FlowZone แล้วแปลงเป็น view-model ให้ component/scene ใช้
// `t` ที่รับเข้ามาคือ vue-i18n `$t` (key, params) — helper ไม่ import i18n เอง เพื่อ test ได้ตรงๆ
import {
  ZONE_IDS,
  ZONE_API,
  ZONE_CODE,
  STATIONS,
  STATION_IDS,
  STATION_BY_ID,
  LENS_KEYS,
  STOCK_LENS_KEYS,
  TILE_CONFIDENCE,
  TILE_TARGET
} from './flow-layout.js'
import { fmtInt, fmtG, fmtPercent, shareValue, fmtSigned, fmtThbCompact, isNum } from './flow-format.js'

export const K = (key) => `view.executive.flow.${key}`

export const PTYPE_CODES = ['R', 'P', 'E', 'B', 'N', 'G', 'T', 'ES', 'EL', 'EH', 'SE', 'ST', 'PART', 'CH', 'C', 'LK']
export const GOLD_CODES = ['YG', 'WG', 'PG', 'SV']

const num = (x) => (isNum(x) ? Number(x) : 0)
const list = (x) => (Array.isArray(x) ? x : [])

// ---------------------------------------------------------------- state (URL)

export const DEFAULT_STATE = Object.freeze({ selected: 'all', lens: 'default', compare: '', stockLens: 'sloc', stockSel: '' })

// zone ของ id ที่เลือก (all/ไม่รู้จัก → null)
export function zoneOf(id) {
  if (!id || id === 'all') return null
  if (ZONE_IDS.includes(id)) return id
  return STATION_BY_ID[id]?.zone || null
}

// รูปแบบ `z-prod.worker.gold` = [ที่เลือก][.lens][.stockLens] — ค่าไม่รู้จักถูกทิ้ง ไม่ throw
export function parseFlowState(raw) {
  const text = Array.isArray(raw) ? raw[0] : raw
  const state = { selected: 'all', lens: 'default', stockLens: 'sloc' }
  if (typeof text !== 'string' || !text) return state
  const parts = text.replace(/^#/, '').split('.')
  const head = parts[0]
  if (head === 'all' || ZONE_IDS.includes(head) || STATION_IDS.includes(head)) state.selected = head
  parts.slice(1).forEach((p) => {
    if (LENS_KEYS.includes(p) && p !== 'default') state.lens = p
    else if (STOCK_LENS_KEYS.includes(p)) state.stockLens = p
  })
  // แท่งคลังเป็นของ lens ปัจจุบัน ลิงก์เปิดแล้วไม่มีความหมาย → ใช้ทั้งโซน
  if (STATION_BY_ID[state.selected]?.kind === 'stockPad') state.selected = 'z-stock'
  return state
}

// state เริ่มต้นทั้งหมด → '' (ผู้เรียกลบ query ทิ้ง)
export function serializeFlowState({ selected = 'all', lens = 'default', stockLens = 'sloc' } = {}) {
  const parts = [selected]
  if (lens !== 'default') parts.push(lens)
  if (stockLens !== 'sloc') parts.push(stockLens)
  const text = parts.join('.')
  return text === 'all' ? '' : text
}

// ---------------------------------------------------------------- trust

export function trustByZone(trust) {
  const out = {}
  Object.values(ZONE_API).forEach((z) => {
    out[z] = []
  })
  list(trust).forEach((item) => {
    if (out[item.zone]) out[item.zone].push(item)
  })
  return out
}

// zoneId = id ของฉาก (z-prod ...) หรือ null = ทั้งบริษัท
export function countTrust(trust, zoneId = null) {
  const count = { fail: 0, warn: 0, info: 0 }
  const apiZone = zoneId ? ZONE_API[zoneId] : null
  list(trust).forEach((item) => {
    if (apiZone && item.zone !== apiZone) return
    if (count[item.level] !== undefined) count[item.level] += 1
  })
  return count
}

export function trustItemsForSelection(trust, selected) {
  const z = zoneOf(selected)
  const apiZone = z ? ZONE_API[z] : null
  return list(trust).filter((item) => !apiZone || item.zone === apiZone)
}

// ---------------------------------------------------------------- department / worker counts

const DEPT_ALIASES = {
  design: ['design', 'ออกแบบ'],
  trim: ['trim', 'แต่ง'],
  rawPolish: ['rawpolish', 'raw polish', 'ขัดดิบ'],
  gemSort: ['gemsort', 'gem sort', 'คัดพลอย'],
  setting: ['setting', 'ฝัง'],
  plating: ['plating', 'ขัดชุบ'],
  costCard: ['costcard', 'cost card', 'บัตรต้นทุน']
}

// lossVsTarget[].dept อาจเป็น key / ชื่อไทย / ชื่ออังกฤษ — แปลงเป็น key ของแผนกเสมอ
export function resolveDeptKey(dept) {
  if (dept === null || dept === undefined) return null
  const text = String(dept).trim().toLowerCase()
  const hit = Object.keys(DEPT_ALIASES).find((key) => DEPT_ALIASES[key].includes(text))
  return hit || null
}

export const WORKER_OVER_PP = 1

// นับช่าง/ร้าน (แถวที่ไม่ใช่แถวรวม) ที่ loss เกินเป้า >= 1 pp ต่อแผนก — เท่ากับ board.goldLoss.workersOverTargetCount ในภาพรวม
export function countWorkersOverTarget(lossVsTarget, thresholdPp = WORKER_OVER_PP) {
  const byDept = {}
  let total = 0
  list(lossVsTarget).forEach((set) => {
    const key = resolveDeptKey(set.dept) || String(set.dept)
    list(set.rows).forEach((row) => {
      if (row.isTotal) return
      if (num(row.deltaPp) >= thresholdPp) {
        byDept[key] = (byDept[key] || 0) + 1
        total += 1
      }
    })
  })
  return { byDept, total }
}

// ชุดเทียบเป้าที่เกี่ยวกับสถานี (deptKey = null → ทุกแผนก) พร้อมสรุปส่วนเกิน
export function buildWorkerLensModel(lossVsTarget, deptKey = null, thresholdPp = WORKER_OVER_PP) {
  const sets = list(lossVsTarget).filter((set) => !deptKey || resolveDeptKey(set.dept) === deptKey)
  let over = 0
  let excessG = 0
  sets.forEach((set) => {
    list(set.rows).forEach((row) => {
      if (row.isTotal) excessG += Math.max(0, num(row.excessG))
      else if (num(row.deltaPp) >= thresholdPp) over += 1
    })
  })
  return { sets, over, excessG }
}

// ---------------------------------------------------------------- dimension labels

const UNKNOWN_LABELS = ['', 'unknown', '(ไม่ระบุ)', 'n/a', 'na', 'null', '-', 'ไม่ระบุ']
export const isUnknownLabel = (label) => label === null || label === undefined || UNKNOWN_LABELS.includes(String(label).trim().toLowerCase())

const GOLD_SYNONYMS = { yellow: 'YG', white: 'WG', pink: 'PG', silver: 'SV', sv: 'SV', yg: 'YG', wg: 'WG', pg: 'PG' }
const SIZE_SET = ['18K', '9K', '14K', '10K', 'Silver']

export const COMPARE_BASE_COLUMNS = {
  gold: ['YG', 'WG', 'PG', 'SV', 'Unknown'],
  size: ['18K', '9K', '14K', '10K', 'Silver', 'Unknown'],
  ptype: ['R', 'P', 'E', 'ES', 'B', 'N', 'Other']
}

// label จากแหล่งต่างๆ → คอลัมน์ในชุดร่วม; อยู่นอกชุด → 'Other'
export function normalizeCompareLabel(dim, label) {
  const raw = label === null || label === undefined ? '' : String(label).trim()
  if (dim === 'gold') {
    if (isUnknownLabel(raw)) return 'Unknown'
    const code = GOLD_SYNONYMS[raw.toLowerCase()]
    return code || 'Other'
  }
  if (dim === 'size') {
    if (isUnknownLabel(raw)) return 'Unknown'
    const up = raw.toUpperCase()
    if (up === 'SILVER' || up === 'SV') return 'Silver'
    return SIZE_SET.includes(up) ? up : 'Other'
  }
  if (isUnknownLabel(raw)) return 'Other'
  const up = raw.toUpperCase()
  return COMPARE_BASE_COLUMNS.ptype.includes(up) && up !== 'OTHER' ? up : 'Other'
}

// ชื่อที่แสดงของ label ในตารางแยกมิติ
export function dimLabel(dim, label, t) {
  if (isUnknownLabel(label)) return dim === 'ptype' ? t(K('label.other')) : t(K('label.unknown'))
  const raw = String(label).trim()
  if (dim === 'gold' && GOLD_CODES.includes(raw.toUpperCase())) return `${raw.toUpperCase()} ${t(K(`gold.${raw.toUpperCase()}`))}`
  if (dim === 'ptype' && PTYPE_CODES.includes(raw.toUpperCase())) return `${raw.toUpperCase()} ${t(K(`ptype.${raw.toUpperCase()}`))}`
  return raw
}

export function compareColumnLabel(dim, key, t) {
  if (key === 'Unknown') return t(K('label.unknown'))
  if (key === 'Other') return t(K('label.other'))
  return dimLabel(dim, key, t)
}

// ---------------------------------------------------------------- compare zones

function foldInto(map, dim, label, value) {
  if (!isNum(value)) return
  const key = normalizeCompareLabel(dim, label)
  map[key] = (map[key] || 0) + Number(value)
}

function mixValues(board, scope, dim) {
  const key = dim === 'ptype' ? 'productType' : dim
  const rows = board?.mix?.[scope]?.[key]
  if (!Array.isArray(rows)) return null
  const map = {}
  rows.forEach((r) => foldInto(map, dim, r.label, r.pcs))
  return map
}

function wipValues(production, board, dim) {
  const depts = list(production?.departments)
  if (depts.length) {
    const map = {}
    depts.forEach((d) => list(d.dims?.[dim]).forEach((r) => foldInto(map, dim, r.label, r.pcs)))
    return map
  }
  return mixValues(board, 'wip', dim)
}

function materialValues(material, dim) {
  const rows = list(material?.goldRows)
  if (!material || dim === 'ptype') return null
  const map = {}
  rows.forEach((r) => foldInto(map, dim, dim === 'gold' ? r.code : r.sizeName ?? r.sizeCode, r.weight))
  return map
}

// ตารางเทียบทุกโซนในมิติเดียว — หน่วยต่างกันไม่บวกข้ามโซน (แต่ละแถวมี unit ของตัวเอง)
export function buildCompare(dim, { production, board, material } = {}, t) {
  const sources = [
    { zone: 'z-mold', kind: 'na' },
    { zone: 'z-prod', kind: 'values', unit: 'pcs', values: wipValues(production, board, dim) },
    { zone: 'z-recv', kind: 'unavailable' },
    { zone: 'z-stock', kind: 'values', unit: 'pcs', values: mixValues(board, 'stock', dim) },
    { zone: 'z-mat', kind: dim === 'ptype' || !material ? 'na' : 'values', unit: 'g', values: materialValues(material, dim) },
    { zone: 'z-sales', kind: 'values', unit: 'pcs', values: mixValues(board, 'sold', dim) }
  ]
  const base = COMPARE_BASE_COLUMNS[dim]
  const hasOther = sources.some((s) => s.values && s.values.Other !== undefined)
  const keys = dim === 'ptype' ? base : hasOther ? [...base, 'Other'] : base
  const rows = sources.map((s) => {
    const kind = s.kind === 'values' && !s.values ? 'unavailable' : s.kind
    const note = t(K(`compare.note.${ZONE_API[s.zone]}.${kind}`), { dim: t(K(`compare.dim.${dim}`)) })
    const unit = s.unit ? t(K(`compare.unit.${s.unit}`)) : ''
    const cells = kind === 'values' ? keys.map((k) => (s.values[k] === undefined ? null : s.values[k])) : keys.map(() => null)
    return { zone: s.zone, label: ZONE_CODE[s.zone], kind, cells, unit, unitKey: s.unit || '', note }
  })
  return { dim, keys, columns: keys.map((k) => ({ key: k, label: compareColumnLabel(dim, k, t) })), rows }
}

// ---------------------------------------------------------------- stock lenses reconcile

// ผลรวมของแต่ละ lens ต้องเท่ายอด IN_STOCK — ไม่เท่า = มีคอลัมน์ตกหล่น
export function reconcileStockLenses(stock) {
  const total = num(stock?.totals?.inStock)
  const lenses = STOCK_LENS_KEYS.filter((key) => Array.isArray(stock?.lenses?.[key])).map((key) => {
    const sum = list(stock.lenses[key]).reduce((s, r) => s + num(r.pcs), 0)
    return { key, sum, diff: sum - total, ok: sum === total }
  })
  return { total, lenses, ok: lenses.every((l) => l.ok) }
}

export function lensTotal(rows) {
  return list(rows).reduce((s, r) => s + num(r.pcs), 0)
}

// ---------------------------------------------------------------- months

// เดือนที่ผลิตเสร็จน้อยสุด (ไม่นับเดือนปัจจุบันที่ยังไม่จบ) — ใช้ไฮไลต์/สรุปใน tile
export function findLowestCompletedMonth(months) {
  const rows = list(months)
  const closed = rows.length > 1 ? rows.slice(0, -1) : rows
  if (!closed.length) return null
  return closed.reduce((min, r) => (num(r.completedPcs) < num(min.completedPcs) ? r : min), closed[0])
}

// ---------------------------------------------------------------- stations

export const SLOC_LABEL_MAX = 10

// ป้ายบนแท่งคลัง: lens คลังย่อยส่ง "ชื่อ" มา → ใช้รหัสคลังแทน; ไม่พบรหัส → ตัดด้วย … ; "Other N" คงเดิม
export function shortLocationLabel(label, locations) {
  const text = label === null || label === undefined ? '' : String(label)
  if (/^other(\s|$)/i.test(text)) return text
  const rows = list(locations)
  const byName = rows.find((l) => String(l.name ?? '') === text)
  if (byName && byName.code) return String(byName.code)
  if (rows.some((l) => String(l.code) === text)) return text
  return text.length > SLOC_LABEL_MAX ? `${text.slice(0, SLOC_LABEL_MAX - 1)}…` : text
}

const NA_TRUST = { level: 'na', text: '' }
const ok = { level: 'ok', text: '' }

function moldTrust(stage, t) {
  if (!stage) return NA_TRUST
  if (stage.isTerminal) return Number(stage.status) === 500 ? ok : { level: 'info', text: t(K('trust.terminal')) }
  if (num(stage.open) === 0) return ok
  return num(stage.stale180) > 0 ? { level: 'warn', text: t(K('trust.stale')) } : ok
}

function prodTrust(dept, overCount, t) {
  if (!dept) return NA_TRUST
  const stale = num(dept.agePcs?.[3])
  const parts = []
  if (dept.goldLoss?.includesScrap) parts.push(t(K('trust.scrapLoss')))
  if (dept.goldLoss?.notWeighed) parts.push(t(K('trust.notWeighed')))
  if (num(dept.workers?.testPlans) > 0) parts.push(t(K('trust.testWorker')))
  if (overCount > 0) parts.push(t(K('trust.overTarget')))
  if (!parts.length && stale > 0) parts.push(t(K('trust.stalePct'), { pct: Math.round(shareValue(stale, dept.openPcs) || 0) }))
  return { level: stale > 0 || parts.length ? 'warn' : 'ok', text: parts.join(', ') }
}

function workerTextOf(dept, overCount, t) {
  if (!dept) return null
  if (dept.key === 'trim') return t(K('worker.noDeptTarget'))
  if (dept.goldLoss?.notWeighed) return t(K('worker.notWeighed'))
  if (!dept.goldLoss) return null
  return t(K('worker.overTarget'), { n: fmtInt(overCount) })
}

const hasNegativeGold = (material) => {
  const rows = list(material?.goldRows)
  return rows.length > 0 && rows.some((r) => num(r.weight) < 0)
}

// สร้าง model ของทุกสถานี (ลำดับตาม STATIONS) — ข้อมูลโซนที่ยังไม่โหลดเป็น null ได้ สถานีจะแสดง "-"
export function buildStationModels({ board, zones = {} } = {}, { stockLens = 'sloc', stockSel = '' } = {}, t) {
  const { mold, production, receive, stock, material, sales } = zones
  const over = countWorkersOverTarget(production?.lossVsTarget).byDept
  const stockRows = list(stock?.lenses?.[stockLens])
  const stockMax = Math.max(0, ...stockRows.map((r) => num(r.pcs)))
  const unit = (k) => t(K(`unit.${k}`))

  return STATIONS.map((st) => {
    const base = { id: st.id, zone: st.zone, kind: st.kind, pos: st.pos, w: st.w, d: st.d, hold: false, visible: true, name: '', head: '-', trust: ok, workerText: null, timeText: null, decor: { type: 'none' } }

    if (st.kind === 'moldDept') {
      const stage = list(mold?.stages).find((s) => Number(s.status) === st.status) || null
      return {
        ...base,
        name: t(K(`moldStage.s${st.status}`)),
        head: stage ? `${fmtInt(stage.open)} ${unit('job')}` : '-',
        trust: moldTrust(stage, t),
        decor: stage ? { type: 'mold', open: num(stage.open), stale: num(stage.stale180) } : { type: 'none' }
      }
    }

    if (st.kind === 'prodDept') {
      const dept = list(production?.departments).find((d) => d.key === st.key) || null
      const overCount = over[st.key] || 0
      return {
        ...base,
        name: t(`view.executive.department.${st.key}`),
        head: dept ? `${fmtInt(dept.openPcs)} ${unit('pcs')}` : '-',
        trust: prodTrust(dept, overCount, t),
        workerText: workerTextOf(dept, overCount, t),
        decor: dept
          ? { type: 'prod', segs: [0, 1, 2, 3].map((i) => num(dept.agePcs?.[i])), cubes: num(dept.waitPcs) > 0 ? Math.min(6, Math.ceil(num(dept.waitPcs) / 900)) : 0 }
          : { type: 'none' }
      }
    }

    if (st.kind === 'recv') {
      const waiting = num(receive?.notReceivedPcs)
      return {
        ...base,
        name: t(K('station.recv')),
        head: receive ? `${fmtInt(receive.receivedThisMonthPieces)} ${unit('pcsPerMonth')}` : '-',
        trust: receive ? (waiting > 0 ? { level: 'warn', text: t(K('trust.waiting'), { n: fmtInt(waiting) }) } : ok) : NA_TRUST,
        timeText: receive ? t(K('time.recvThisMonth'), { n: fmtInt(receive.receivedThisMonthPieces) }) : null,
        decor: { type: 'recv' }
      }
    }

    if (st.kind === 'stockPad') {
      const row = stockRows[st.slot] || null
      const missing = num(stock?.totals?.costMissingPcs)
      return {
        ...base,
        visible: !!row,
        name: row ? (stockLens === 'sloc' ? shortLocationLabel(row.label, stock?.locations) : String(row.label)) : '',
        fullName: row ? String(row.label) : '',
        head: row ? fmtInt(row.pcs) : '',
        trust: row && missing > 0 ? { level: 'warn', text: t(K('trust.costMissing')) } : stock ? ok : NA_TRUST,
        decor: row ? { type: 'stockPad', value: num(row.pcs), max: stockMax, selected: !!stockSel && stockSel === row.label } : { type: 'none' }
      }
    }

    if (st.id === 'mat-gold') {
      const negative = hasNegativeGold(material)
      return {
        ...base,
        name: t(K('station.matGold')),
        head: material ? (negative ? t(K('head.negative')) : `${fmtInt(list(material.goldRows).length)} ${unit('rows')}`) : '-',
        trust: material ? (negative ? { level: 'fail', text: t(K('trust.negative')) } : ok) : NA_TRUST,
        decor: { type: 'matGold' }
      }
    }
    if (st.id === 'mat-gem') {
      return {
        ...base,
        name: t(K('station.matGem')),
        head: material ? `${fmtInt(material.totals?.gemRowsWithStock)} ${unit('rows')}` : '-',
        trust: material ? { level: 'warn', text: t(K('trust.unitKQ')) } : NA_TRUST,
        decor: { type: 'matGem' }
      }
    }

    // งานขาย
    const totals = sales?.totals
    const hasTrustPerson = list(board?.trust).some((i) => i.zone === 'sales' && /person/i.test(`${i.key}`))
    if (st.id === 'sale-quote') {
      return { ...base, name: t(K('station.quote')), head: totals ? fmtInt(totals.quotations) : '-', trust: totals ? ok : NA_TRUST, decor: totals ? { type: 'sales', value: num(totals.quotations), role: 'b2' } : { type: 'none' } }
    }
    if (st.id === 'sale-so') {
      return { ...base, name: t(K('station.so')), head: totals ? fmtInt(totals.salesOrders) : '-', trust: totals ? (hasTrustPerson ? { level: 'warn', text: t(K('trust.noSalePerson')) } : ok) : NA_TRUST, decor: totals ? { type: 'sales', value: num(totals.salesOrders), role: 'b1' } : { type: 'none' } }
    }
    if (st.id === 'sale-inv') {
      const held = !!(board?.sales?.usdAmountsHeld ?? sales?.usdAmountsHeld)
      return { ...base, name: t(K('station.invoice')), head: totals ? fmtInt(totals.invoices) : '-', trust: totals ? (held ? { level: 'fail', text: t(K('trust.usdHold')) } : ok) : NA_TRUST, decor: totals ? { type: 'sales', value: num(totals.invoices), role: 'dark' } : { type: 'none' } }
    }
    const paymentHeld = !!(board?.sales?.paymentHeld ?? sales?.paymentHeld)
    return { ...base, name: t(K('station.payment')), head: paymentHeld ? t(K('head.onHold')) : '-', hold: true, trust: paymentHeld ? { level: 'info', text: t(K('trust.onHold')) } : NA_TRUST, decor: { type: 'hold' } }
  }).map((s) => ({ ...s, warn: s.trust.level === 'warn' || s.trust.level === 'fail' }))
}

// ป้ายของสถานีตาม lens ที่เลือก
export function stationLabel(station, lens, t) {
  let value = station.head
  if (lens === 'time') value = station.timeText || '-'
  else if (lens === 'worker') value = station.workerText || '-'
  else if (lens === 'trust') {
    const { level, text } = station.trust
    if (level === 'na') value = '-'
    else if (level === 'ok') value = t(K('label.ok'))
    else value = `${level.toUpperCase()}${text ? ` · ${text}` : ''}`
  }
  const dim = (lens === 'time' && !station.timeText) || (lens === 'worker' && station.zone !== 'z-prod')
  return {
    name: station.name,
    value,
    badge: lens === 'default' && station.warn,
    dim,
    trustLevel: lens === 'trust' ? station.trust.level : 'x'
  }
}

// ป้ายหัวโซน
export function zoneLabelText(zoneId, lens, board, t) {
  const code = ZONE_CODE[zoneId]
  let extra = ''
  if (lens === 'trust') {
    const c = countTrust(board?.trust, zoneId)
    const parts = []
    if (c.fail) parts.push(`${c.fail} fail`)
    if (c.warn) parts.push(`${c.warn} warn`)
    if (c.info) parts.push(`${c.info} info`)
    extra = ` · ${parts.length ? parts.join(' ') : t(K('label.ok'))}`
  } else if (lens === 'time') {
    if (zoneId === 'z-prod') extra = ` · ${t(K('zoneLens.timeProd'), { n: fmtSigned(board?.flow?.backlogPcs) })}`
    else if (zoneId === 'z-sales') extra = ` · ${t(K('zoneLens.timeSales'), { date: String(board?.sales?.firstDateWithTotal || '-').slice(0, 10) })}`
    else if (zoneId === 'z-recv') extra = ` · ${t(K('zoneLens.timeRecv'))}`
    else extra = ` · ${t(K('zoneLens.noData'))}`
  } else if (lens === 'worker') {
    extra = zoneId === 'z-prod' ? ` · ${t(K('worker.overTarget'), { n: fmtInt(board?.goldLoss?.workersOverTargetCount) })}` : ` · ${t(K('zoneLens.na'))}`
  }
  return `${code}${extra}`
}

export function buildGateLabels({ zones = {} } = {}, t) {
  const stored = list(zones.mold?.stages).find((s) => Number(s.status) === 60)
  return [
    { id: 'A', name: t(K('gate.A')), value: stored ? t(K('gate.molds'), { n: fmtInt(stored.open) }) : '-' },
    { id: 'B', name: t(K('gate.B')), value: zones.receive ? t(K('gate.waiting'), { n: fmtInt(zones.receive.notReceivedPcs) }) : '-' },
    { id: 'C', name: t(K('gate.C')), value: zones.stock ? t(K('gate.inStock'), { n: fmtInt(zones.stock.totals?.inStock) }) : '-' }
  ]
}

// ---------------------------------------------------------------- boss board

function topGapPtype(mix) {
  const stock = list(mix?.stock?.productType)
  const sold = list(mix?.sold?.productType)
  const known = stock.filter((r) => PTYPE_CODES.includes(String(r.label).toUpperCase()))
  let best = null
  known.forEach((r) => {
    const sold1 = sold.find((s) => String(s.label).toUpperCase() === String(r.label).toUpperCase())
    const gap = num(r.percent) - num(sold1?.percent)
    if (!best || gap > best.gap) best = { code: String(r.label).toUpperCase(), stockPct: num(r.percent), soldPct: num(sold1?.percent), gap }
  })
  return best
}

function silverPercent(mixScope) {
  const row = list(mixScope?.gold).find((r) => normalizeCompareLabel('gold', r.label) === 'SV')
  return row ? num(row.percent) : null
}

// 6 tile ของกระดานผู้บริหาร — ตัวเลขทุกตัวมาจาก board; board ว่าง → []
export function buildBossTiles(board, t) {
  if (!board) return []
  const flow = board.flow || {}
  const loss = board.goldLoss || {}
  const nr = board.goldNotReturned || {}
  const sales = board.sales || {}
  const counts = countTrust(board.trust)
  const lowest = findLowestCompletedMonth(flow.months)
  const gap = topGapPtype(board.mix)
  const silverWip = silverPercent(board.mix?.wip)
  const silverSold = silverPercent(board.mix?.sold)
  const fails = list(board.trust).filter((i) => i.level === 'fail').slice(0, 2).map((i) => i.title)

  const tile = (key, title, value, lines) => ({ key, title, confidence: TILE_CONFIDENCE[key], value, lines: lines.filter(Boolean), target: TILE_TARGET[key].join('|') })
  return [
    tile('flow', t(K('boss.flow.title')), `${fmtSigned(flow.backlogPcs)} ${t(K('unit.pcs'))}`, [
      t(K('boss.flow.line1'), { created: fmtInt(flow.createdPcs12m), done: fmtInt(flow.completedPcs12m) }),
      lowest ? t(K('boss.flow.line2'), { month: lowest.month, n: fmtInt(lowest.completedPcs) }) : ''
    ]),
    tile('loss', t(K('boss.loss.title')), fmtPercent(loss.lossPercent), [
      t(K('boss.loss.line1'), { g: fmtInt(loss.lossG), gold: fmtPercent(loss.goldLossPercent), silver: fmtPercent(loss.silverLossPercent) }),
      t(K('boss.loss.line2'), { g: fmtG(loss.excessOverTargetG), n: fmtInt(loss.workersOverTargetCount) })
    ]),
    tile('notReturned', t(K('boss.notReturned.title')), `${fmtG(nr.goldG)} g`, [
      t(K('boss.notReturned.line1'), { g: fmtG(nr.silverG) }),
      t(K('boss.notReturned.line2'), { pct: fmtPercent(nr.queueSharePercent, 0) })
    ]),
    tile('sales', t(K('boss.sales.title')), fmtThbCompact(sales.thbTotalWithAmount), [
      t(K('boss.sales.line1'), { date: String(sales.firstDateWithTotal || '-').slice(0, 10) }),
      isNum(sales.currentVsPreviousPercent) ? t(K('boss.sales.line2'), { pct: fmtPercent(sales.currentVsPreviousPercent, 0) }) : '',
      isNum(sales.top2CustomerSharePercent) ? t(K('boss.sales.line3'), { pct: fmtPercent(sales.top2CustomerSharePercent, 0) }) : ''
    ]),
    tile('mix', t(K('boss.mix.title')), gap ? dimLabel('ptype', gap.code, t) : '-', [
      gap ? t(K('boss.mix.line1'), { stock: fmtPercent(gap.stockPct, 1), sold: fmtPercent(gap.soldPct, 1) }) : '',
      isNum(silverWip) && isNum(silverSold) ? t(K('boss.mix.line2'), { wip: fmtPercent(silverWip, 1), sold: fmtPercent(silverSold, 1) }) : ''
    ]),
    tile('trust', t(K('boss.trust.title')), `${counts.fail} fail`, [`${counts.warn} warn · ${counts.info} info`, fails.join(' · ')])
  ]
}

// ---------------------------------------------------------------- dimension merge (production overview)

// รวมมิติ (gold|size|ptype) ข้ามหลายแผนก: ชิ้น/ใบงานจาก dims + จ่ายทอง/loss/ทองยังไม่คืนจาก goldLoss.dims
export function mergeDimension(depts, dim) {
  const map = {}
  const row = (label) => (map[label] || (map[label] = { label, plans: 0, pcs: 0, rows90: 0, sendG: 0, sendWeighedG: 0, checkWeighedG: 0, pendingG: 0 }))
  list(depts).forEach((d) => {
    list(d.dims?.[dim]).forEach((r) => {
      const o = row(r.label ?? '')
      o.plans += num(r.plans)
      o.pcs += num(r.pcs)
    })
    const gl = d.goldLoss
    if (gl) {
      list(gl.dims?.[dim]).forEach((r) => {
        const o = row(r.label ?? '')
        o.rows90 += num(r.rows90)
        o.sendG += num(r.sendG90)
        o.pendingG += num(r.pendingG)
        if (!gl.notWeighed) {
          o.sendWeighedG += num(r.sendG90)
          o.checkWeighedG += num(r.checkG90)
        }
      })
    }
  })
  return Object.values(map).sort((a, b) => b.pcs - a.pcs || b.sendG - a.sendG)
}

export function lossG(send, check) {
  return num(send) - num(check)
}

export function lossPct(send, check) {
  return num(send) > 0 ? ((num(send) - num(check)) / num(send)) * 100 : null
}

