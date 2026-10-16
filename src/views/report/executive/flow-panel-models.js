// flow-panel-models.js — สร้าง "block" ของแผงรายละเอียดใต้ฉาก Flow 3D จากข้อมูล API (pure, ไม่แตะ DOM)
// ทุก block เป็นข้อมูลล้วน แล้ว flow-panel.vue วาดด้วย generic component — ตัวเลขทุกตัวมาจาก board/zone response
//
// block ชนิดต่างๆ:
//   { type: 'heading', title, role }
//   { type: 'metrics', items: [{ key, label, value, unit, def, bad }] }
//   { type: 'table', key, title, note, legend, columns, rows, clickable }   rows: { key, <field>: string, _cls, go }
//   { type: 'note', text }
//   { type: 'flags', title, items: [{ strong, text }] }
//   { type: 'lens', title, blocks: [...] }
import { ZONE_CODE, ZONE_API, STATION_BY_ID, MOLD_STATIONS, PROD_STATIONS } from './flow-layout.js'
import {
  fmtInt,
  fmtDec,
  fmtG,
  fmtPercent,
  fmtShare,
  shareValue,
  fmtSigned,
  fmtThb,
  isNum
} from './flow-format.js'
import {
  K,
  zoneOf,
  buildCompare,
  buildWorkerLensModel,
  dimLabel,
  findLowestCompletedMonth,
  isUnknownLabel,
  lossG,
  lossPct,
  mergeDimension,
  normalizeCompareLabel,
  reconcileStockLenses,
  resolveDeptKey,
  trustItemsForSelection
} from './flow-helpers.js'

const num = (x) => (isNum(x) ? Number(x) : 0)
const list = (x) => (Array.isArray(x) ? x : [])

const col = (field, header, opts = {}) => ({ field, header, sortable: false, ...opts })
const right = { align: 'right' }
const metric = (key, label, value, unit = '', def = '', bad = false) => ({ key, label, value, unit, def, bad })
const flag = (strong, text) => ({ strong, text })
const AGE_TONES = [1, 2, 3, 4]

function flagsBlock(items, t, title) {
  return items.length ? [{ type: 'flags', title: title || t(K('panel.flagsTitle')), items }] : []
}

function missingBlock(t) {
  return [{ type: 'note', text: t(K('panel.noData')) }]
}

// ---------------------------------------------------------------- shared tables

function ageTable(dept, t) {
  const total = num(dept.openPcs)
  const labels = ['age14', 'age60', 'age179', 'age180']
  return {
    type: 'table',
    key: 'age',
    title: t(K('panel.prod.ageTitle')),
    legend: true,
    columns: [col('bucket', t(K('panel.prod.colAge'))), col('pcs', t(K('unit.pcs')), right), col('share', t(K('col.share')), right), col('plans', t(K('unit.plans')), right), col('bar', '', { bar: true, minWidth: '10rem' })],
    rows: [0, 1, 2, 3].map((i) => ({
      key: `age${i}`,
      bucket: t(K(`panel.prod.${labels[i]}`)),
      pcs: fmtInt(dept.agePcs?.[i]),
      share: fmtShare(dept.agePcs?.[i], total),
      plans: fmtInt(dept.agePlans?.[i]),
      bar: { pct: shareValue(dept.agePcs?.[i], total) || 0, tone: AGE_TONES[i] },
      _cls: i === 3 ? 'warn' : ''
    }))
  }
}

export function buildDimTable(dim, depts, t, { title, note } = {}) {
  const merged = mergeDimension(depts, dim)
  const totalPcs = merged.reduce((s, r) => s + r.pcs, 0)
  const acc = { plans: 0, pcs: 0, sendG: 0, sendW: 0, checkW: 0, pendingG: 0 }
  const rows = merged.map((r) => {
    acc.plans += r.plans
    acc.pcs += r.pcs
    acc.sendG += r.sendG
    acc.sendW += r.sendWeighedG
    acc.checkW += r.checkWeighedG
    acc.pendingG += r.pendingG
    const weighed = r.sendWeighedG > 0
    return {
      key: `${dim}-${r.label}`,
      label: dimLabel(dim, r.label, t),
      pcs: fmtInt(r.pcs),
      share: totalPcs ? fmtShare(r.pcs, totalPcs) : '-',
      plans: fmtInt(r.plans),
      send: r.sendG ? fmtG(r.sendG) : '-',
      lossG: weighed ? fmtG(lossG(r.sendWeighedG, r.checkWeighedG)) : '-',
      lossPct: weighed ? fmtPercent(lossPct(r.sendWeighedG, r.checkWeighedG)) : '-',
      pending: r.pendingG ? fmtG(r.pendingG) : '-',
      _cls: isUnknownLabel(r.label) ? 'warn' : ''
    }
  })
  const totalWeighed = acc.sendW > 0
  rows.push({
    key: `${dim}-total`,
    label: t(K('col.total')),
    pcs: fmtInt(acc.pcs),
    share: '',
    plans: fmtInt(acc.plans),
    send: acc.sendG ? fmtG(acc.sendG) : '-',
    lossG: totalWeighed ? fmtG(lossG(acc.sendW, acc.checkW)) : '-',
    lossPct: totalWeighed ? fmtPercent(lossPct(acc.sendW, acc.checkW)) : '-',
    pending: fmtG(acc.pendingG),
    _cls: 'total'
  })
  return {
    type: 'table',
    key: `dim-${dim}`,
    title: title || t(K(`panel.prod.dim.${dim}`)),
    note,
    columns: [
      col('label', t(K(`panel.prod.dimHead.${dim}`))),
      col('pcs', t(K('panel.prod.colPcsOpen')), right),
      col('share', t(K('col.share')), right),
      col('plans', t(K('unit.plans')), right),
      col('send', t(K('panel.prod.colSend90')), right),
      col('lossG', t(K('panel.prod.colLossG')), right),
      col('lossPct', t(K('panel.prod.colLossPct')), right),
      col('pending', t(K('panel.prod.colPendingG')), right)
    ],
    rows
  }
}

// ---------------------------------------------------------------- all-company overview

export function buildOverviewModel({ zones = {} } = {}, t) {
  const { mold, production, receive, stock, sales } = zones
  const stages = list(mold?.stages)
  const moldActive = stages.filter((s) => !s.isTerminal).reduce((s, r) => s + num(r.open), 0)
  const lastMonth = list(sales?.months).slice(-1)[0]
  const items = [
    metric('molds', t(K('panel.overview.molds')), mold ? fmtInt(mold.catalog?.activeMolds) : '-', t(K('unit.molds')), t(K('panel.overview.moldsDef'))),
    metric('moldJobs', t(K('panel.overview.moldJobs')), mold ? fmtInt(moldActive) : '-', t(K('unit.job')), t(K('panel.overview.moldJobsDef'))),
    metric('prod', t(K('panel.overview.prod')), production ? fmtInt(production.totals?.openPcs) : '-', t(K('unit.pcs')), production ? t(K('panel.overview.prodDef'), { plans: fmtInt(production.totals?.openPlans) }) : ''),
    metric('recv', t(K('panel.overview.recv')), receive ? fmtInt(receive.receivedThisMonthPieces) : '-', t(K('unit.pcs')), t(K('panel.overview.recvDef'))),
    metric('stock', t(K('panel.overview.stock')), stock ? fmtInt(stock.totals?.inStock) : '-', t(K('unit.pcs')), t(K('panel.overview.stockDef'))),
    metric('inv', t(K('panel.overview.inv'), { month: lastMonth?.month || '' }), lastMonth ? fmtThb(lastMonth.invThbAmount) : '-', '', lastMonth ? `${fmtInt(lastMonth.invThbCount)} ${t(K('unit.docs'))}` : ''),
    metric('so', t(K('panel.overview.so'), { month: lastMonth?.month || '' }), lastMonth ? fmtThb(lastMonth.soThbAmount) : '-', '', lastMonth ? `${fmtInt(lastMonth.soThbCount)} ${t(K('unit.docs'))}` : '')
  ]
  return [
    { type: 'heading', title: t(K('panel.overview.title')), role: t(K('panel.overview.role')) },
    { type: 'metrics', items }
  ]
}

// ---------------------------------------------------------------- mold

function moldStageMetrics(stage, t) {
  const open = num(stage.open)
  const stalePct = open ? fmtShare(stage.stale180, open) : '-'
  return [
    metric('open', t(K('panel.mold.open')), fmtInt(stage.open), t(K('unit.job')), t(K('panel.mold.openDef'), { status: stage.status })),
    metric('stale', t(K('panel.mold.stale')), fmtInt(stage.stale180), `${t(K('unit.job'))} (${stalePct})`, t(K('panel.mold.staleDef')), !stage.isTerminal && num(stage.stale180) > 0),
    metric('within14', t(K('panel.mold.within14')), fmtInt(stage.within14d), t(K('unit.job')), t(K('panel.mold.within14Def'))),
    metric('median', t(K('panel.mold.median')), isNum(stage.medianDays) ? fmtInt(stage.medianDays) : '-', isNum(stage.medianDays) ? t(K('unit.days')) : '', t(K('panel.mold.ageDef'))),
    metric('max', t(K('panel.mold.max')), isNum(stage.maxDays) ? fmtInt(stage.maxDays) : '-', isNum(stage.maxDays) ? t(K('unit.days')) : '', t(K('panel.mold.ageDef'))),
    metric('newProcess', t(K('panel.mold.newProcess')), fmtInt(stage.newProcess), t(K('unit.job')), t(K('panel.mold.newProcessDef')))
  ]
}

function moldStageFlags(stage, t) {
  const open = num(stage.open)
  const status = Number(stage.status)
  if (open === 0) return [flag(t(K('panel.mold.flagEmptyStrong')), t(K('panel.mold.flagEmpty'), { status }))]
  if (!stage.isTerminal) {
    return [
      flag(
        t(K('panel.mold.flagStaleStrong')),
        t(K('panel.mold.flagStale'), { stale: fmtInt(stage.stale180), open: fmtInt(open), pct: fmtShare(stage.stale180, open), max: fmtInt(stage.maxDays) })
      )
    ]
  }
  return [flag('', t(K(status === 500 ? 'panel.mold.flagMelted' : 'panel.mold.flagTerminal')))]
}

export function buildMoldStationModel(status, { zones = {} } = {}, t) {
  const stage = list(zones.mold?.stages).find((s) => Number(s.status) === Number(status))
  const name = t(K(`moldStage.s${status}`))
  if (!stage) return [{ type: 'heading', title: `${t(K('panel.mold.prefix'))} · ${name}`, role: '' }, ...missingBlock(t)]
  return [
    { type: 'heading', title: `${t(K('panel.mold.prefix'))} · ${name}`, role: t(K('panel.mold.role'), { name }) },
    { type: 'metrics', items: moldStageMetrics(stage, t) },
    ...flagsBlock(moldStageFlags(stage, t), t)
  ]
}

export function buildMoldOverviewModel({ zones = {} } = {}, t) {
  const mold = zones.mold
  const heading = { type: 'heading', title: t(K('panel.mold.overviewTitle')), role: t(K('panel.mold.overviewRole')) }
  if (!mold) return [heading, ...missingBlock(t)]
  const stages = list(mold.stages)
  const active = stages.filter((s) => !s.isTerminal)
  const inProgress = active.reduce((s, r) => s + num(r.open), 0)
  const inProgressStale = active.reduce((s, r) => s + num(r.stale180), 0)
  const stored = stages.find((s) => Number(s.status) === 60)
  const melted = stages.find((s) => Number(s.status) === 500)
  const totalJobs = stages.reduce((s, r) => s + num(r.open), 0)
  const categories = list(mold.catalog?.categories)
  const categorized = categories.reduce((s, r) => s + num(r.molds), 0)
  const otherMolds = num(mold.catalog?.activeMolds) - categorized

  const blocks = [
    heading,
    {
      type: 'metrics',
      items: [
        metric('molds', t(K('panel.mold.activeMolds')), fmtInt(mold.catalog?.activeMolds), t(K('unit.molds')), t(K('panel.mold.activeMoldsDef'))),
        metric('jobs', t(K('panel.mold.totalJobs')), fmtInt(totalJobs), t(K('unit.job')), t(K('panel.mold.totalJobsDef'))),
        metric('inProgress', t(K('panel.mold.inProgress')), fmtInt(inProgress), t(K('unit.job')), t(K('panel.mold.inProgressDef'))),
        metric('inProgressStale', t(K('panel.mold.inProgressStale')), fmtInt(inProgressStale), `${t(K('unit.job'))} (${fmtShare(inProgressStale, inProgress)})`, t(K('panel.mold.staleDef')), inProgressStale > 0),
        metric('stored', t(K('panel.mold.stored')), fmtInt(stored?.open), t(K('unit.job')), t(K('panel.mold.storedDef'))),
        metric('melted', t(K('panel.mold.melted')), fmtInt(melted?.open), t(K('unit.job')), t(K('panel.mold.meltedDef')))
      ]
    },
    {
      type: 'table',
      key: 'mold-stages',
      title: t(K('panel.compareDepts')),
      clickable: true,
      columns: [
        col('name', t(K('col.dept'))),
        col('open', t(K('unit.job')), right),
        col('stale', t(K('panel.mold.colStale')), { ...right, className: 'flow-cell-warn' }),
        col('within14', t(K('panel.mold.colWithin14')), right),
        col('median', t(K('panel.mold.colMedian')), right),
        col('max', t(K('panel.mold.colMax')), right),
        col('newProcess', t(K('panel.mold.colNewProcess')), right)
      ],
      rows: stages.map((s) => {
        const station = MOLD_STATIONS.find((m) => m.status === Number(s.status))
        return {
          key: `stage-${s.status}`,
          name: t(K(`moldStage.s${s.status}`)),
          open: fmtInt(s.open),
          stale: fmtInt(s.stale180),
          within14: fmtInt(s.within14d),
          median: isNum(s.medianDays) ? fmtInt(s.medianDays) : '-',
          max: isNum(s.maxDays) ? fmtInt(s.maxDays) : '-',
          newProcess: fmtInt(s.newProcess),
          go: station?.id,
          _cls: 'clk'
        }
      })
    },
    {
      type: 'table',
      key: 'mold-categories',
      title: t(K('panel.mold.categoriesTitle')),
      columns: [col('category', t(K('panel.mold.colCategory'))), col('molds', t(K('unit.molds')), right), col('new90d', t(K('panel.mold.colNew90')), right)],
      rows: [
        ...categories.map((c) => ({ key: `cat-${c.category}`, category: String(c.category), molds: fmtInt(c.molds), new90d: fmtInt(c.new90d) })),
        ...(otherMolds > 0 ? [{ key: 'cat-other', category: t(K('panel.mold.otherCategory')), molds: fmtInt(otherMolds), new90d: '-' }] : [])
      ]
    }
  ]
  const flags = []
  if (inProgressStale > 0) {
    flags.push(flag(t(K('panel.mold.flagStaleStrong')), t(K('panel.mold.flagOverview'), { open: fmtInt(inProgress), stale: fmtInt(inProgressStale) })))
  }
  flags.push(flag(t(K('panel.mold.flagNoRankStrong')), t(K('panel.mold.flagNoRank'))))
  return [...blocks, ...flagsBlock(flags, t)]
}

// ---------------------------------------------------------------- production

function glRow(label, rows, send, check, t, weighed = true) {
  return {
    key: label,
    group: label,
    rows: fmtInt(rows),
    send: fmtG(send),
    check: weighed ? fmtG(check) : '-',
    lossG: weighed ? fmtG(lossG(send, check)) : '-',
    lossPct: weighed ? fmtPercent(lossPct(send, check)) : '-'
  }
}

function glColumns(t) {
  return [
    col('group', t(K('panel.prod.colPeriod'))),
    col('rows', t(K('panel.prod.colRows')), right),
    col('send', t(K('panel.prod.colSend')), right),
    col('check', t(K('panel.prod.colCheck')), right),
    col('lossG', t(K('panel.prod.colLossG')), right),
    col('lossPct', t(K('panel.prod.colLossPct')), right)
  ]
}

function splitGoldSilver(gl) {
  const out = { gold: { rows: 0, send: 0, check: 0 }, silver: { rows: 0, send: 0, check: 0 } }
  list(gl?.dims?.gold).forEach((r) => {
    const target = normalizeCompareLabel('gold', r.label) === 'SV' ? out.silver : out.gold
    target.rows += num(r.rows90)
    target.send += num(r.sendG90)
    target.check += num(r.checkG90)
  })
  return out
}

function pendingTable(gl, t) {
  const p = gl.pending || {}
  return {
    type: 'table',
    key: 'pending',
    columns: [col('group', t(K('panel.prod.pendingTitle'))), col('rows', t(K('panel.prod.colRows')), right), col('g', t(K('panel.prod.colWeightG')), right)],
    rows: [
      { key: 'p-all', group: t(K('col.all')), rows: fmtInt(p.rows), g: fmtG(p.g) },
      { key: 'p-worker', group: t(K('panel.prod.pendingWorker')), rows: fmtInt(p.workerRows), g: fmtG(p.workerG) },
      { key: 'p-queue', group: t(K('panel.prod.pendingQueue')), rows: fmtInt(p.queueRows), g: fmtG(p.queueG) }
    ]
  }
}

function workersBlocks(dept, t) {
  const w = dept.workers
  const name = t(`view.executive.department.${dept.key}`)
  if (!w) return [{ type: 'note', text: t(K('panel.prod.noWorkers')) }]
  return [
    { type: 'table', key: 'workers-title', title: t(K('panel.prod.workersTitle'), { name }), note: t(K('panel.prod.workersNote')), columns: [col('group', t(K('panel.prod.colGroup'))), col('plans', t(K('unit.plans')), right)], rows: [
      { key: 'w-named', group: t(K('panel.prod.workerNamed')), plans: fmtInt(w.namedPlans) },
      { key: 'w-queue', group: t(K('panel.prod.workerQueue')), plans: fmtInt(w.queuePlans) },
      { key: 'w-none', group: t(K('panel.prod.workerNone')), plans: fmtInt(w.nonePlans) },
      { key: 'w-test', group: t(K('panel.prod.workerTest')), plans: fmtInt(w.testPlans), _cls: num(w.testPlans) > 0 ? 'warn' : '' }
    ] },
    { type: 'table', key: 'workers-names', columns: [col('name', t(K('panel.prod.colWorkerName'))), col('plans', t(K('unit.plans')), right)], rows: list(w.names).map((n, i) => ({ key: `wn-${i}`, name: String(n.name), plans: fmtInt(n.plans) })) }
  ]
}

function deptFlags(dept, t) {
  const flags = []
  const open = num(dept.openPcs)
  const stale = num(dept.agePcs?.[3])
  flags.push(flag(t(K('panel.prod.flagStaleStrong')), t(K('panel.prod.flagStale'), { stale: fmtInt(stale), open: fmtInt(open), pct: fmtShare(stale, open), max: fmtInt(dept.maxDays) })))
  if (dept.key === 'rawPolish') flags.splice(0, 1, flag('', t(K('panel.prod.flagRawPolish'), { med: fmtInt(dept.medianDays), stale: fmtInt(stale), pct: fmtShare(stale, open) })))
  if (dept.key === 'plating') flags.push(flag(t(K('panel.prod.flagMedianStrong'), { med: fmtInt(dept.medianDays) }), t(K('panel.prod.flagMedian'))))
  if (num(dept.workers?.testPlans) > 0) flags.push(flag(t(K('panel.prod.flagTestStrong')), t(K('panel.prod.flagTest'), { n: fmtInt(dept.workers.testPlans) })))
  if (num(dept.workers?.nonePlans) > 0) flags.push(flag('', t(K('panel.prod.flagNone'), { n: fmtInt(dept.workers.nonePlans) })))
  if (num(dept.overduePcs) > 0 && dept.overduePcs === dept.openPcs) flags.push(flag('', t(K('panel.prod.flagAllOverdue'))))
  const unk = list(dept.dims?.gold).find((r) => isUnknownLabel(r.label))
  if (unk && num(unk.pcs) > 0) flags.push(flag(t(K('panel.prod.flagUnknownGoldStrong')), t(K('panel.prod.flagUnknownGold'), { n: fmtInt(unk.pcs), pct: fmtShare(unk.pcs, open) })))
  const gl = dept.goldLoss
  if (gl) {
    if (gl.notWeighed) flags.push(flag(t(K('panel.prod.flagNotWeighedStrong')), t(K('panel.prod.flagNotWeighed'))))
    if (gl.includesScrap) flags.push(flag(t(K('panel.prod.flagScrapStrong')), t(K('panel.prod.flagScrap'))))
    const p = gl.pending
    if (p) flags.push(flag(t(K('panel.prod.flagPendingStrong')), t(K('panel.prod.flagPending'), { rows: fmtInt(p.rows), g: fmtG(p.g), queue: fmtG(p.queueG), worker: fmtG(p.workerG) })))
  }
  return flags
}

export function buildProdStationModel(key, { zones = {} } = {}, t) {
  const dept = list(zones.production?.departments).find((d) => d.key === key)
  const name = t(`view.executive.department.${key}`)
  const heading = { type: 'heading', title: `${t(K('panel.prod.prefix'))} · ${name}`, role: t(K('panel.prod.role'), { name }) }
  if (!dept) return [heading, ...missingBlock(t)]
  const open = num(dept.openPcs)
  const gl = dept.goldLoss
  const items = [
    metric('open', t(K('panel.prod.mOpen')), fmtInt(dept.openPcs), t(K('unit.pcs')), t(K('panel.prod.mOpenDef'), { plans: fmtInt(dept.openPlans) })),
    metric('wait', t(K('panel.prod.mWait')), fmtInt(dept.waitPcs), t(K('unit.pcs')), t(K('panel.prod.mWaitDef'))),
    metric('work', t(K('panel.prod.mWork')), fmtInt(dept.workPcs), t(K('unit.pcs')), t(K('panel.prod.mWorkDef'))),
    metric('stale', t(K('panel.prod.mStale')), fmtInt(dept.agePcs?.[3]), `${t(K('unit.pcs'))} (${fmtShare(dept.agePcs?.[3], open)})`, t(K('panel.prod.mStaleDef'), { plans: fmtInt(dept.agePlans?.[3]) }), true),
    metric('beyond', t(K('panel.prod.mBeyond')), fmtInt(open - num(dept.agePcs?.[0])), `${t(K('unit.pcs'))} (${fmtShare(open - num(dept.agePcs?.[0]), open)})`, t(K('panel.prod.mBeyondDef'))),
    metric('overdue', t(K('panel.prod.mOverdue')), fmtInt(dept.overduePcs), `${t(K('unit.pcs'))} (${fmtShare(dept.overduePcs, open)})`, t(K('panel.prod.mOverdueDef'))),
    metric('median', t(K('panel.prod.mMedian')), fmtInt(dept.medianDays), t(K('unit.days')), t(K('panel.prod.mMedianDef'))),
    metric('max', t(K('panel.prod.mMax')), fmtInt(dept.maxDays), t(K('unit.days')), t(K('panel.prod.mMaxDef')))
  ]
  if (gl && !gl.notWeighed) {
    items.push(
      metric('loss90', t(K('panel.prod.mLoss90')), fmtG(lossG(gl.win90?.sendG, gl.win90?.checkG)), `g (${fmtPercent(lossPct(gl.win90?.sendG, gl.win90?.checkG))})`, t(K('panel.prod.mLoss90Def'), { send: fmtG(gl.win90?.sendG), check: fmtG(gl.win90?.checkG), rows: fmtInt(gl.win90?.rows) }), !!gl.includesScrap),
      metric('lossAll', t(K('panel.prod.mLossAll')), fmtG(lossG(gl.allTime?.sendG, gl.allTime?.checkG)), `g (${fmtPercent(lossPct(gl.allTime?.sendG, gl.allTime?.checkG))})`, t(K('panel.prod.mLossAllDef'), { send: fmtG(gl.allTime?.sendG), check: fmtG(gl.allTime?.checkG), rows: fmtInt(gl.allTime?.rows) }))
    )
  }
  const blocks = [heading, { type: 'metrics', items }, ageTable(dept, t)]
  if (gl) {
    const nw = !!gl.notWeighed
    const split = splitGoldSilver(gl)
    blocks.push({
      type: 'table',
      key: 'gl',
      title: nw ? t(K('panel.prod.glTitleNotWeighed'), { name }) : t(K('panel.prod.glTitle'), { name }),
      columns: glColumns(t),
      rows: [
        glRow(t(K('panel.prod.gl90')), gl.win90?.rows, gl.win90?.sendG, gl.win90?.checkG, t, !nw),
        glRow(t(K('panel.prod.gl90Gold')), split.gold.rows, split.gold.send, split.gold.check, t, !nw),
        glRow(t(K('panel.prod.gl90Silver')), split.silver.rows, split.silver.send, split.silver.check, t, !nw),
        glRow(t(K('panel.prod.glAll')), gl.allTime?.rows, gl.allTime?.sendG, gl.allTime?.checkG, t, !nw)
      ]
    })
    blocks.push(pendingTable(gl, t))
  } else {
    blocks.push({ type: 'note', text: t(K('panel.prod.noGoldLoss')) })
  }
  blocks.push(
    buildDimTable('gold', [dept], t, { note: gl ? t(K('panel.prod.dimNote')) : '' }),
    buildDimTable('size', [dept], t),
    buildDimTable('ptype', [dept], t),
    ...workersBlocks(dept, t),
    ...flagsBlock(deptFlags(dept, t), t)
  )
  return blocks
}

export function buildProdOverviewModel({ zones = {} } = {}, t) {
  const prod = zones.production
  const heading = { type: 'heading', title: t(K('panel.prod.overviewTitle')), role: t(K('panel.prod.overviewRole')) }
  if (!prod) return [heading, ...missingBlock(t)]
  const depts = list(prod.departments)
  const totals = prod.totals || {}
  const done = prod.done || {}
  const weighed = depts.filter((d) => d.goldLoss && !d.goldLoss.notWeighed)
  const sum = (arr, pick) => arr.reduce((s, d) => s + num(pick(d)), 0)
  const w90 = { rows: sum(weighed, (d) => d.goldLoss.win90?.rows), send: sum(weighed, (d) => d.goldLoss.win90?.sendG), check: sum(weighed, (d) => d.goldLoss.win90?.checkG) }
  const wAll = { rows: sum(weighed, (d) => d.goldLoss.allTime?.rows), send: sum(weighed, (d) => d.goldLoss.allTime?.sendG), check: sum(weighed, (d) => d.goldLoss.allTime?.checkG) }
  const withGl = depts.filter((d) => d.goldLoss)
  const pend = {
    rows: sum(withGl, (d) => d.goldLoss.pending?.rows),
    g: sum(withGl, (d) => d.goldLoss.pending?.g),
    queueG: sum(withGl, (d) => d.goldLoss.pending?.queueG),
    workerG: sum(withGl, (d) => d.goldLoss.pending?.workerG)
  }
  const split = { gold: { rows: 0, send: 0, check: 0 }, silver: { rows: 0, send: 0, check: 0 } }
  weighed.forEach((d) => {
    const s = splitGoldSilver(d.goldLoss)
    ;['gold', 'silver'].forEach((k) => {
      split[k].rows += s[k].rows
      split[k].send += s[k].send
      split[k].check += s[k].check
    })
  })
  const openPcs = num(totals.openPcs)

  const blocks = [
    heading,
    {
      type: 'metrics',
      items: [
        metric('open', t(K('panel.prod.mOpen')), fmtInt(totals.openPcs), t(K('unit.pcs')), t(K('panel.prod.ovOpenDef'), { plans: fmtInt(totals.openPlans) })),
        metric('stale', t(K('panel.prod.mStale')), fmtInt(totals.stalePcs), `${t(K('unit.pcs'))} (${fmtShare(totals.stalePcs, openPcs)})`, t(K('panel.prod.ovStaleDef'), { plans: fmtInt(totals.stalePlans) }), true),
        metric('overdue', t(K('panel.prod.mOverdue')), fmtInt(totals.overduePcs), `${t(K('unit.pcs'))} (${fmtShare(totals.overduePcs, openPcs)})`, t(K('panel.prod.mOverdueDef')), true),
        metric('created', t(K('panel.prod.ovCreated')), fmtInt(done.createdThisMonthPcs), t(K('unit.pcs')), t(K('panel.prod.ovCreatedDef'))),
        metric('completed', t(K('panel.prod.ovCompleted')), fmtInt(done.completedThisMonthPcs), t(K('unit.pcs')), t(K('panel.prod.ovCompletedDef'))),
        metric('melted', t(K('panel.prod.ovMelted')), fmtInt(done.meltedPcs), t(K('unit.pcs')), t(K('panel.prod.ovMeltedDef')))
      ]
    },
    {
      type: 'table',
      key: 'prod-depts',
      title: t(K('panel.compareDepts')),
      legend: true,
      note: t(K('panel.prod.ovTableNote')),
      clickable: true,
      columns: [
        col('name', t(K('col.dept'))),
        col('open', t(K('panel.prod.colOpen')), right),
        col('wait', t(K('panel.prod.colWait')), right),
        col('work', t(K('panel.prod.colWork')), right),
        col('bar', t(K('panel.prod.colAge')), { bar: true, minWidth: '9rem' }),
        col('stale', t(K('panel.prod.colStale')), { ...right, className: 'flow-cell-warn' }),
        col('overdue', t(K('panel.prod.colOverdue')), right),
        col('send', t(K('panel.prod.colSend90')), right),
        col('lossG', t(K('panel.prod.colLossG')), right),
        col('lossPct', t(K('panel.prod.colLossPct')), right),
        col('pending', t(K('panel.prod.colPendingG')), right)
      ],
      rows: [
        ...depts.map((d) => {
          const gl = d.goldLoss
          const nw = gl?.notWeighed
          const station = PROD_STATIONS.find((s) => s.key === d.key)
          return {
            key: `dept-${d.key}`,
            name: t(`view.executive.department.${d.key}`),
            open: fmtInt(d.openPcs),
            wait: fmtInt(d.waitPcs),
            work: fmtInt(d.workPcs),
            bar: { stack: [0, 1, 2, 3].map((i) => num(d.agePcs?.[i])) },
            stale: fmtInt(d.agePcs?.[3]),
            overdue: fmtInt(d.overduePcs),
            send: gl ? fmtG(gl.win90?.sendG) : '-',
            lossG: gl ? (nw ? t(K('label.notWeighedShort')) : fmtG(lossG(gl.win90?.sendG, gl.win90?.checkG))) : '-',
            lossPct: gl ? (nw ? t(K('label.notWeighedShort')) : fmtPercent(lossPct(gl.win90?.sendG, gl.win90?.checkG))) : '-',
            pending: gl ? fmtG(gl.pending?.g) : '-',
            go: station?.id,
            _cls: 'clk'
          }
        }),
        {
          key: 'dept-total',
          name: t(K('col.total')),
          open: fmtInt(totals.openPcs),
          wait: fmtInt(sum(depts, (d) => d.waitPcs)),
          work: fmtInt(sum(depts, (d) => d.workPcs)),
          bar: null,
          stale: fmtInt(totals.stalePcs),
          overdue: fmtInt(totals.overduePcs),
          send: `${fmtG(w90.send)}*`,
          lossG: fmtG(lossG(w90.send, w90.check)),
          lossPct: fmtPercent(lossPct(w90.send, w90.check)),
          pending: fmtG(pend.g),
          _cls: 'total'
        }
      ]
    },
    { type: 'note', text: t(K('panel.prod.ovFootnote')) },
    {
      type: 'table',
      key: 'metal-split',
      title: t(K('panel.prod.metalSplitTitle')),
      columns: [col('metal', t(K('panel.prod.colMetal'))), col('rows', t(K('panel.prod.colRows')), right), col('send', t(K('panel.prod.colSend')), right), col('check', t(K('panel.prod.colCheck')), right), col('lossG', t(K('panel.prod.colLossG')), right), col('lossPct', t(K('panel.prod.colLossPct')), right)],
      rows: [
        { key: 'm-gold', metal: t(K('panel.prod.metalGold')), rows: fmtInt(split.gold.rows), send: fmtG(split.gold.send), check: fmtG(split.gold.check), lossG: fmtG(lossG(split.gold.send, split.gold.check)), lossPct: fmtPercent(lossPct(split.gold.send, split.gold.check)) },
        { key: 'm-silver', metal: t(K('panel.prod.metalSilver')), rows: fmtInt(split.silver.rows), send: fmtG(split.silver.send), check: fmtG(split.silver.check), lossG: fmtG(lossG(split.silver.send, split.silver.check)), lossPct: fmtPercent(lossPct(split.silver.send, split.silver.check)) },
        { key: 'm-total', metal: t(K('col.total')), rows: fmtInt(w90.rows), send: fmtG(w90.send), check: fmtG(w90.check), lossG: fmtG(lossG(w90.send, w90.check)), lossPct: fmtPercent(lossPct(w90.send, w90.check)), _cls: 'total' }
      ]
    },
    {
      type: 'note',
      text: t(K('panel.prod.allTimeNote'), {
        send: fmtG(wAll.send),
        check: fmtG(wAll.check),
        loss: fmtG(lossG(wAll.send, wAll.check)),
        pct: fmtPercent(lossPct(wAll.send, wAll.check)),
        rows: fmtInt(pend.rows),
        g: fmtG(pend.g),
        queue: fmtG(pend.queueG),
        worker: fmtG(pend.workerG)
      })
    },
    ...castBlocks(prod.castCost, t),
    buildDimTable('gold', depts, t, { title: t(K('panel.prod.dimAllGold')), note: t(K('panel.prod.dimAllNote')) }),
    buildDimTable('size', depts, t, { title: t(K('panel.prod.dimAllSize')) }),
    buildDimTable('ptype', depts, t, { title: t(K('panel.prod.dimAllPtype')) })
  ]

  const flags = []
  flags.push(flag(t(K('panel.prod.ovFlagStaleStrong')), t(K('panel.prod.ovFlagStale'), { stale: fmtInt(totals.stalePcs), open: fmtInt(totals.openPcs), pct: fmtShare(totals.stalePcs, openPcs) })))
  const unknownGold = sum(depts, (d) => list(d.dims?.gold).filter((r) => isUnknownLabel(r.label)).reduce((s, r) => s + num(r.pcs), 0))
  if (unknownGold > 0) flags.push(flag(t(K('panel.prod.flagUnknownGoldStrong')), t(K('panel.prod.ovFlagUnknownGold'), { n: fmtInt(unknownGold), pct: fmtShare(unknownGold, openPcs) })))
  const trim = depts.find((d) => d.goldLoss?.includesScrap)
  if (trim) flags.push(flag(t(K('panel.prod.flagScrapStrong')), t(K('panel.prod.ovFlagScrap'), { pct: fmtPercent(lossPct(trim.goldLoss.win90?.sendG, trim.goldLoss.win90?.checkG)) })))
  const testPlans = sum(depts, (d) => d.workers?.testPlans)
  if (testPlans > 0) flags.push(flag(t(K('panel.prod.flagTestStrong')), t(K('panel.prod.ovFlagTest'), { n: fmtInt(testPlans) })))
  flags.push(flag(t(K('panel.prod.ovFlagQueueStrong')), t(K('panel.prod.ovFlagQueue'))))
  return [...blocks, ...flagsBlock(flags, t)]
}

function castBlocks(cast, t) {
  if (!cast) return []
  const win = cast.win90 || {}
  const all = cast.allTime || {}
  return [
    {
      type: 'table',
      key: 'cast',
      title: t(K('panel.prod.castTitle')),
      columns: [col('gold', t(K('panel.prod.colKind'))), col('rows', t(K('panel.prod.colCastRows')), right), col('weight', t(K('panel.prod.colCastWeight')), right), col('loss', t(K('panel.prod.colCastLoss')), right)],
      rows: [
        ...list(cast.byGold90).map((r, i) => ({ key: `cast-${i}`, gold: dimLabel('gold', r.gold, t), rows: fmtInt(r.rows), weight: fmtG(r.castWeightG), loss: fmtG(r.castLossG) })),
        { key: 'cast-total', gold: t(K('col.total')), rows: fmtInt(win.rows), weight: fmtG(win.castWeightG), loss: fmtG(win.castLossG), _cls: 'total' }
      ]
    },
    {
      type: 'note',
      text: t(K('panel.prod.castNote'), {
        melt: fmtG(win.meltWeightG),
        meltLoss: fmtG(win.meltLossG),
        rows: fmtInt(all.rows),
        cast: fmtG(all.castWeightG),
        loss: fmtG(all.castLossG)
      }) + (cast.note ? ` · ${cast.note}` : '')
    }
  ]
}

// ---------------------------------------------------------------- receive

export function buildReceiveModel({ zones = {} } = {}, t) {
  const r = zones.receive
  const heading = { type: 'heading', title: t(K('panel.recv.title')), role: t(K('panel.recv.role')) }
  if (!r) return [heading, ...missingBlock(t)]
  const jobs = (x) => t(K('panel.recv.jobsDef'), { jobs: fmtInt(x) })
  return [
    heading,
    {
      type: 'metrics',
      items: [
        metric('month', t(K('panel.recv.mMonth')), fmtInt(r.receivedThisMonthPieces), t(K('unit.pcs')), t(K('panel.recv.mMonthDef'))),
        metric('notRecv', t(K('panel.recv.mNotRecv')), fmtInt(r.notReceivedPcs), t(K('unit.pcs')), `${t(K('panel.recv.mNotRecvDef'))} · ${jobs(r.notReceivedJobs)}`, true),
        metric('recv', t(K('panel.recv.mRecv')), fmtInt(r.receivedPcs), t(K('unit.pcs')), `${t(K('panel.recv.mRecvDef'))} · ${jobs(r.receivedJobs)}`),
        metric('doneMonth', t(K('panel.recv.mDoneMonth')), fmtInt(r.completedThisMonthPcs), t(K('unit.pcs')), `${t(K('panel.recv.mDoneMonthDef'))} · ${jobs(r.completedThisMonthJobs)}`),
        metric('done', t(K('panel.recv.mDone')), fmtInt(num(r.notReceivedPcs) + num(r.receivedPcs)), t(K('unit.pcs')), `${t(K('panel.recv.mDoneDef'))} · ${jobs(num(r.notReceivedJobs) + num(r.receivedJobs))}`)
      ]
    },
    ...flagsBlock(
      [
        flag(t(K('panel.recv.flagNotRecvStrong'), { pcs: fmtInt(r.notReceivedPcs), jobs: fmtInt(r.notReceivedJobs) }), t(K('panel.recv.flagNotRecv'))),
        flag(t(K('panel.recv.flagMonthlyStrong')), t(K('panel.recv.flagMonthly')))
      ],
      t
    )
  ]
}

// ---------------------------------------------------------------- stock

export function buildStockModel({ zones = {}, stockLens = 'sloc', stockSel = '' } = {}, t) {
  const s = zones.stock
  const lensName = t(K(`stockLens.${stockLens}`))
  const heading = { type: 'heading', title: t(K('panel.stock.title')), role: t(K('panel.stock.role'), { lens: lensName }) }
  if (!s) return [heading, ...missingBlock(t)]
  const total = num(s.totals?.inStock)
  const tot = s.totals || {}
  const blocks = [
    heading,
    {
      type: 'metrics',
      items: [
        metric('inStock', t(K('panel.stock.mInStock')), fmtInt(total), t(K('unit.pcs')), t(K('panel.stock.mInStockDef'), { n: fmtInt(list(s.locations).length) })),
        metric('resSold', t(K('panel.stock.mResSold')), `${fmtInt(tot.reserved)} / ${fmtInt(tot.sold)}`, t(K('unit.pcs')), 'RESERVED / SOLD'),
        metric('cost', t(K('panel.stock.mCost')), fmtInt(tot.costRecordedPcs), `${t(K('unit.pcs'))} (${fmtShare(tot.costRecordedPcs, total)})`, t(K('panel.stock.mCostDef')), true),
        metric('noCost', t(K('panel.stock.mNoCost')), fmtInt(tot.costMissingPcs), `${t(K('unit.pcs'))} (${fmtShare(tot.costMissingPcs, total)})`, t(K('panel.stock.mNoCostDef')), true),
        metric('designs', t(K('panel.stock.mDesigns')), fmtInt(tot.designsInStock), t(K('unit.molds')), num(tot.designsInStock) ? t(K('panel.stock.mDesignsDef'), { avg: fmtDec(total / num(tot.designsInStock), 1) }) : '')
      ]
    }
  ]
  if (stockSel) blocks.push({ type: 'note', text: t(K('panel.stock.selected'), { name: stockSel }) })

  const lensTable = (key) => {
    const rows = list(s.lenses?.[key])
    return {
      type: 'table',
      key: `lens-${key}`,
      title: `${key === stockLens ? `${t(K('panel.stock.currentLens'))} · ` : ''}${t(K(`stockLens.${key}`))}`,
      columns: [col('label', t(K(`stockLens.${key}`))), col('pcs', t(K('unit.pcs')), right), col('share', t(K('col.share')), right)],
      rows: rows.map((r, i) => ({ key: `${key}-${i}`, label: String(r.label), pcs: fmtInt(r.pcs), share: fmtShare(r.pcs, total), _cls: stockSel && stockSel === r.label ? 'hl' : '' }))
    }
  }
  const locationsTable = {
    type: 'table',
    key: 'locations',
    title: `${stockLens === 'sloc' ? `${t(K('panel.stock.currentLens'))} · ` : ''}${t(K('panel.stock.locationsTitle'))}`,
    columns: [col('code', t(K('panel.stock.colLocCode'))), col('name', t(K('panel.stock.colLocName'))), col('sales', t(K('panel.stock.colSalesPoint'))), col('pcs', t(K('unit.pcs')), right), col('share', t(K('col.share')), right)],
    rows: list(s.locations).map((l) => ({ key: `loc-${l.code}`, code: String(l.code), name: String(l.name ?? ''), sales: l.isSalesPoint ? t(K('label.yes')) : '', pcs: fmtInt(l.pcs), share: fmtShare(l.pcs, total), _cls: stockSel && (stockSel === l.code || stockSel === l.name) ? 'hl' : '' }))
  }
  const order = [stockLens, ...['sloc', 'gold', 'size', 'type', 'age'].filter((k) => k !== stockLens)]
  order.forEach((k) => blocks.push(k === 'sloc' ? locationsTable : lensTable(k)))

  // เมทริกซ์ ทอง × เกรด
  const cells = list(s.matrix)
  const goldKeys = []
  const sizeKeys = []
  cells.forEach((c) => {
    if (!goldKeys.includes(c.gold)) goldKeys.push(c.gold)
    if (!sizeKeys.includes(c.size)) sizeKeys.push(c.size)
  })
  const at = (g, z) => cells.find((c) => c.gold === g && c.size === z)?.pcs
  blocks.push({
    type: 'table',
    key: 'matrix',
    title: t(K('panel.stock.matrixTitle')),
    columns: [col('gold', t(K('panel.stock.colGold'))), ...sizeKeys.map((z, i) => col(`s${i}`, String(z), right))],
    rows: goldKeys.map((g, gi) => ({
      key: `mx-${gi}`,
      gold: String(g),
      ...Object.fromEntries(sizeKeys.map((z, i) => [`s${i}`, num(at(g, z)) ? fmtInt(at(g, z)) : '-'])),
      _cls: stockSel && stockSel === g ? 'hl' : ''
    }))
  })

  const flags = [flag(t(K('panel.stock.flagNoValueStrong')), t(K('panel.stock.flagNoValue'), { rec: fmtInt(tot.costRecordedPcs), total: fmtInt(total) }))]
  const old = list(s.lenses?.age).find((r) => /365/.test(String(r.label)) && />/.test(String(r.label)))
  if (old) flags.push(flag(t(K('panel.stock.flagAgeStrong')), t(K('panel.stock.flagAge'), { n: fmtInt(old.pcs), pct: fmtShare(old.pcs, total) })))
  const rec = reconcileStockLenses(s)
  if (!rec.ok) {
    flags.push(flag(t(K('panel.stock.flagReconcileStrong')), t(K('panel.stock.flagReconcile'), { lenses: rec.lenses.filter((l) => !l.ok).map((l) => `${t(K(`stockLens.${l.key}`))} (${fmtSigned(l.diff)})`).join(', '), total: fmtInt(rec.total) })))
  }
  return [...blocks, ...flagsBlock(flags, t)]
}

// ---------------------------------------------------------------- material

export function buildMaterialModel({ zones = {} } = {}, t) {
  const m = zones.material
  const heading = { type: 'heading', title: t(K('panel.mat.title')), role: t(K('panel.mat.role')) }
  if (!m) return [heading, ...missingBlock(t)]
  const goldRows = list(m.goldRows)
  const allNegative = goldRows.length > 0 && goldRows.every((r) => num(r.weight) < 0)
  const anyNegative = goldRows.some((r) => num(r.weight) < 0)
  const blocks = [
    heading,
    {
      type: 'metrics',
      items: [
        metric('goldRows', t(K('panel.mat.mGoldRows')), fmtInt(goldRows.length), allNegative ? t(K('panel.mat.allNegative')) : t(K('unit.rows')), 'tbt_stock_gold', anyNegative),
        metric('gemRows', t(K('panel.mat.mGemRows')), fmtInt(m.totals?.gemRows), t(K('unit.rows')), 'tbt_stock_gem'),
        metric('gemStock', t(K('panel.mat.mGemStock')), fmtInt(m.totals?.gemRowsWithStock), t(K('unit.rows')), t(K('panel.mat.mGemStockDef')))
      ]
    },
    {
      type: 'table',
      key: 'gold-rows',
      title: t(K('panel.mat.goldTitle')),
      columns: [col('code', t(K('panel.mat.colCode'))), col('size', t(K('panel.mat.colSize'))), col('weight', t(K('panel.mat.colWeight')), right), col('onProcess', t(K('panel.mat.colOnProcess')), right)],
      rows: goldRows.map((r, i) => ({ key: `g-${i}`, code: String(r.code), size: `${r.sizeCode ?? ''}${r.sizeName ? ` (${r.sizeName})` : ''}`.trim(), weight: fmtG(r.weight), onProcess: fmtG(r.weightOnProcess) }))
    },
    {
      type: 'table',
      key: 'gold-tx',
      title: t(K('panel.mat.txTitle')),
      note: t(K('panel.mat.txNote')),
      columns: [col('code', t(K('panel.mat.colCode'))), col('type', t(K('panel.mat.colType')), right), col('rows', t(K('panel.prod.colRows')), right), col('weight', t(K('panel.mat.colTxWeight')), right)],
      rows: list(m.goldTx30d).map((r, i) => ({ key: `tx-${i}`, code: String(r.goldCode), type: String(r.type), rows: fmtInt(r.rows), weight: fmtG(r.weight) }))
    },
    {
      type: 'table',
      key: 'gems',
      title: t(K('panel.mat.gemTitle'), { n: fmtInt(list(m.gemGroups).length) }),
      note: t(K('panel.mat.gemNote')),
      columns: [col('group', t(K('panel.mat.colGroup'))), col('rows', t(K('panel.mat.colGemRows')), right), col('stock', t(K('panel.mat.colGemStockRows')), right), col('qtyK', t(K('panel.mat.colQtyK')), right), col('qtyQ', t(K('panel.mat.colQtyQ')), right)],
      rows: list(m.gemGroups).map((r, i) => ({ key: `gem-${i}`, group: String(r.group), rows: fmtInt(r.rows), stock: fmtInt(r.rowsWithStock), qtyK: num(r.qtyK) ? fmtInt(r.qtyK) : '-', qtyQ: num(r.qtyQ) ? fmtInt(r.qtyQ) : '-' }))
    }
  ]
  const flags = []
  if (anyNegative) flags.push(flag(t(K('panel.mat.flagNegativeStrong')), t(K('panel.mat.flagNegative'))))
  flags.push(flag(t(K('panel.mat.flagPartsStrong')), t(K('panel.mat.flagParts'))))
  return [...blocks, ...flagsBlock(flags, t)]
}

// ---------------------------------------------------------------- sales

export function buildSalesModel({ board, zones = {} } = {}, t) {
  const s = zones.sales
  const heading = { type: 'heading', title: t(K('panel.sales.title')), role: t(K('panel.sales.role')) }
  if (!s) return [heading, ...missingBlock(t)]
  const months = list(s.months)
  const last = months[months.length - 1]
  const b = board?.sales
  const items = []
  if (last) {
    items.push(
      metric('inv', t(K('panel.sales.mInv'), { month: last.month }), `${fmtInt(last.invThbCount)} ${t(K('unit.docs'))}`, fmtThb(last.invThbAmount), t(K('panel.sales.mInvDef'))),
      metric('so', t(K('panel.sales.mSo'), { month: last.month }), `${fmtInt(last.soThbCount)} ${t(K('unit.docs'))}`, fmtThb(last.soThbAmount), t(K('panel.sales.mSoDef'))),
      metric('quote', t(K('panel.sales.mQuote'), { month: last.month }), `${fmtInt(last.quotes)} ${t(K('unit.docs'))}`, '', t(K('panel.sales.mQuoteDef')))
    )
  }
  if (b) items.push(metric('thbTotal', t(K('panel.sales.mThbTotal'), { date: String(b.firstDateWithTotal || '-').slice(0, 10) }), fmtThb(b.thbTotalWithAmount), '', t(K('panel.sales.mThbTotalDef')), true))
  items.push(metric('totals', t(K('panel.sales.mTotals')), `${fmtInt(s.totals?.quotations)} / ${fmtInt(s.totals?.salesOrders)} / ${fmtInt(s.totals?.invoices)}`, t(K('unit.docs')), t(K('panel.sales.mTotalsDef'))))

  const thbTotal = b ? num(b.thbTotalWithAmount) : list(s.channels).reduce((x, c) => x + num(c.thbAmount), 0)
  const blocks = [heading, { type: 'metrics', items }, salesMonthsTable(months, t, t(K('panel.sales.pipelineTitle')))]
  blocks.push({
    type: 'table',
    key: 'channels',
    title: t(K('panel.sales.channelTitle')),
    columns: [col('code', t(K('panel.sales.colChannel'))), col('n', t(K('panel.sales.colInvThbN')), right), col('thb', t(K('panel.sales.colInvThb')), right), col('share', t(K('panel.sales.colShareThb')), right), col('usd', t(K('panel.sales.colInvUsd')), right)],
    rows: list(s.channels).map((c, i) => ({ key: `ch-${i}`, code: c.code ? String(c.code) : t(K('panel.sales.noChannel')), n: fmtInt(c.thbInvoices), thb: fmtInt(c.thbAmount), share: fmtShare(c.thbAmount, thbTotal), usd: fmtInt(c.usdInvoices) }))
  })
  blocks.push({
    type: 'table',
    key: 'customers',
    title: t(K('panel.sales.customerTitle'), { n: fmtInt(list(s.customers).length) }),
    columns: [col('code', t(K('panel.sales.colCode'))), col('name', t(K('panel.sales.colName'))), col('n', t(K('panel.sales.colInvoice')), right), col('thb', 'THB', right), col('share', t(K('col.share')), right)],
    rows: list(s.customers).map((c, i) => ({ key: `cu-${i}`, code: String(c.code), name: `${c.name ?? ''}${c.isBucket ? ' *' : ''}`, n: fmtInt(c.invoiceCount), thb: fmtInt(c.thb), share: isNum(c.sharePercent) ? fmtPercent(c.sharePercent, 1) : fmtShare(c.thb, thbTotal) }))
  })
  if (list(s.customers).some((c) => c.isBucket)) blocks.push({ type: 'note', text: t(K('panel.sales.bucketNote')) })
  blocks.push({
    type: 'table',
    key: 'persons',
    title: t(K('panel.sales.personTitle')),
    columns: [col('name', t(K('panel.sales.colPerson'))), col('n', t(K('panel.sales.colInvoice')), right), col('thb', 'THB', right)],
    rows: list(s.salePersons).map((p, i) => ({ key: `sp-${i}`, name: isUnknownLabel(p.name) ? t(K('label.unknown')) : String(p.name), n: fmtInt(p.invoices), thb: fmtInt(p.thb), _cls: isUnknownLabel(p.name) ? 'hl' : '' }))
  })
  const flags = []
  if (s.usdAmountsHeld ?? b?.usdAmountsHeld) flags.push(flag(t(K('panel.sales.flagUsdStrong')), t(K('panel.sales.flagUsd'))))
  if (s.paymentHeld ?? b?.paymentHeld) flags.push(flag(t(K('panel.sales.flagPaymentStrong')), t(K('panel.sales.flagPayment'))))
  return [...blocks, ...flagsBlock(flags, t)]
}

function salesMonthsTable(months, t, title) {
  return {
    type: 'table',
    key: 'sales-months',
    title,
    columns: [
      col('month', t(K('col.month'))),
      col('quotes', t(K('panel.sales.colQuotes')), right),
      col('soN', t(K('panel.sales.colSoN')), right),
      col('soThb', t(K('panel.sales.colSoThb')), right),
      col('invN', t(K('panel.sales.colInvThbN')), right),
      col('invThb', t(K('panel.sales.colInvThb')), right),
      col('usd', t(K('panel.sales.colUsdCounts')), right)
    ],
    rows: months.map((m) => ({ key: `sm-${m.month}`, month: String(m.month), quotes: fmtInt(m.quotes), soN: fmtInt(m.soThbCount), soThb: fmtInt(m.soThbAmount), invN: fmtInt(m.invThbCount), invThb: fmtInt(m.invThbAmount), usd: `${fmtInt(m.soUsdCount)} / ${fmtInt(m.invUsdCount)}` }))
  }
}

// ---------------------------------------------------------------- lens blocks

export function buildTimeBlocks(selected, { board, zones = {} } = {}, t) {
  const z = zoneOf(selected)
  if (z === 'z-sales') {
    if (!zones.sales) return missingBlock(t)
    return [salesMonthsTable(list(zones.sales.months), t, t(K('lens.timeTitle'))), { type: 'note', text: t(K('lens.timeSalesNote')) }]
  }
  if (z === 'z-recv') {
    if (!zones.receive) return missingBlock(t)
    return [
      {
        type: 'table',
        key: 'recv-months',
        title: t(K('lens.timeTitle')),
        columns: [col('month', t(K('col.month'))), col('pcs', t(K('panel.recv.colNewStock')), right)],
        rows: list(zones.receive.months).map((m) => ({ key: `rm-${m.month}`, month: String(m.month), pcs: fmtInt(m.newStockPieces) }))
      },
      { type: 'note', text: t(K('lens.timeRecvNote')) }
    ]
  }
  if (z === 'z-prod' || !z) {
    const flow = board?.flow
    if (!flow) return missingBlock(t)
    const lowest = findLowestCompletedMonth(flow.months)
    const rows = list(flow.months).map((m) => ({
      key: `fm-${m.month}`,
      month: String(m.month),
      created: fmtInt(m.createdPcs),
      completed: fmtInt(m.completedPcs),
      diff: fmtSigned(num(m.createdPcs) - num(m.completedPcs)),
      _cls: lowest && lowest.month === m.month ? 'hl' : ''
    }))
    rows.push({ key: 'fm-total', month: t(K('lens.total12')), created: fmtInt(flow.createdPcs12m), completed: fmtInt(flow.completedPcs12m), diff: fmtSigned(flow.backlogPcs), _cls: 'total' })
    return [
      {
        type: 'table',
        key: 'flow-months',
        title: t(K('lens.timeTitle')),
        columns: [col('month', t(K('col.month'))), col('created', t(K('lens.colCreated')), right), col('completed', t(K('lens.colCompleted')), right), col('diff', t(K('lens.colDiff')), right)],
        rows
      },
      ...(lowest ? [{ type: 'note', text: t(K('lens.timeProdNote'), { month: lowest.month, n: fmtInt(lowest.completedPcs) }) }] : [])
    ]
  }
  return [{ type: 'note', text: t(K('lens.timeNone')) }]
}

export function buildWorkerBlocks(selected, { zones = {} } = {}, t) {
  const z = zoneOf(selected)
  if (z && z !== 'z-prod') return [{ type: 'note', text: t(K('lens.workerOnlyProd')) }]
  const st = STATION_BY_ID[selected]
  const deptKey = st?.kind === 'prodDept' ? st.key : null
  if (deptKey === 'trim') return [{ type: 'note', text: t(K('lens.workerTrim')) }]
  if (deptKey === 'gemSort') return [{ type: 'note', text: t(K('lens.workerGem')) }]
  if (deptKey === 'design' || deptKey === 'costCard') return [{ type: 'note', text: t(K('lens.workerNoIssue')) }]
  if (!zones.production) return missingBlock(t)

  const model = buildWorkerLensModel(zones.production.lossVsTarget, deptKey)
  const rows = []
  model.sets.forEach((set, si) => {
    const key = resolveDeptKey(set.dept)
    const deptName = key ? t(`view.executive.department.${key}`) : String(set.dept)
    list(set.rows).forEach((r, i) => {
      const isTotal = !!r.isTotal
      const over = !isTotal && num(r.deltaPp) >= 1
      rows.push({
        key: `w-${si}-${i}`,
        dept: i === 0 ? deptName : '',
        metal: i === 0 ? t(K(`lens.metal.${String(set.metal).toUpperCase()}`)) : '',
        name: isTotal ? t(K('lens.wholeDept')) : `${r.name}${over ? ' !' : ''}`,
        rows: fmtInt(r.rows),
        send: fmtG(r.sendG),
        loss: fmtPercent(r.lossPercent),
        target: `${fmtPercent(set.targetPercent, 1)}${set.isSystemDefault ? ' *' : ''}`,
        delta: fmtSigned(r.deltaPp, 2),
        excess: fmtG(r.excessG),
        _cls: isTotal ? 'hl' : over ? 'warn' : ''
      })
    })
  })
  const anySystem = model.sets.some((s) => s.isSystemDefault)
  return [
    {
      type: 'table',
      key: 'worker-lens',
      title: t(K('lens.workerTitle')),
      columns: [
        col('dept', t(K('col.dept'))),
        col('metal', t(K('panel.prod.colMetal'))),
        col('name', t(K('lens.colWorker'))),
        col('rows', t(K('panel.prod.colRows')), right),
        col('send', t(K('panel.prod.colSend')), right),
        col('loss', t(K('panel.prod.colLossPct')), right),
        col('target', t(K('lens.colTarget')), right),
        col('delta', t(K('lens.colDelta')), right),
        col('excess', t(K('lens.colExcess')), right)
      ],
      rows
    },
    { type: 'note', text: t(K('lens.workerNote'), { excess: fmtG(model.excessG), n: fmtInt(model.over) }) + (anySystem ? ` · ${t(K('lens.systemDefaultNote'))}` : '') }
  ]
}

export function buildTrustBlocks(selected, { board } = {}, t) {
  const z = zoneOf(selected)
  const items = trustItemsForSelection(board?.trust, selected)
  const apiToUi = Object.fromEntries(Object.entries(ZONE_API).map(([ui, api]) => [api, ui]))
  const blocks = [
    items.length
      ? {
          type: 'table',
          key: 'trust',
          title: `${t(K('lens.trustTitle'))} · ${z ? ZONE_CODE[z] : t(K('lens.allZones'))}`,
          columns: [col('level', t(K('lens.colLevel'))), col('zone', t(K('lens.colZone'))), col('title', t(K('lens.colTopic'))), col('evidence', t(K('lens.colEvidence'))), col('owner', t(K('lens.colOwner')))],
          rows: items.map((i, idx) => ({ key: `t-${idx}`, level: String(i.level).toUpperCase(), zone: ZONE_CODE[apiToUi[i.zone]] || String(i.zone), title: String(i.title), evidence: String(i.evidence ?? ''), owner: String(i.owner ?? ''), _cls: i.level === 'fail' ? 'warn' : '' }))
        }
      : { type: 'note', text: t(K('lens.trustNone')) }
  ]
  return blocks
}

export function buildCompareBlocks(dim, ctx, t) {
  const c = buildCompare(dim, { production: ctx.zones?.production, board: ctx.board, material: ctx.zones?.material }, t)
  return [
    {
      type: 'table',
      key: `compare-${dim}`,
      title: `${t(K('lens.compareTitle'), { dim: t(K(`compare.dim.${dim}`)) })}`,
      columns: [col('zone', t(K('lens.colZone'))), ...c.columns.map((x, i) => col(`c${i}`, x.label, right)), col('unit', t(K('compare.unitCol'))), col('note', t(K('compare.noteCol')))],
      rows: c.rows.map((r) => ({
        key: `cmp-${r.zone}`,
        zone: r.label,
        ...Object.fromEntries(r.cells.map((v, i) => [`c${i}`, r.kind === 'na' ? (i === 0 ? t(K('compare.na')) : '') : r.kind === 'unavailable' ? '-' : v === null ? '-' : r.unitKey === 'g' ? fmtG(v) : fmtInt(v)])),
        unit: r.unit,
        note: r.note
      }))
    },
    { type: 'note', text: t(K('compare.footnote')) }
  ]
}

// ---------------------------------------------------------------- compose

// ลำดับ: compare → lens (time|worker|trust) → block หลักของสิ่งที่เลือก
export function buildPanelModel(ctx, t) {
  const { selected = 'all', lens = 'default', compare = '' } = ctx
  const blocks = []
  if (compare) blocks.push({ type: 'lens', key: 'compare', blocks: buildCompareBlocks(compare, ctx, t) })
  if (lens === 'time') blocks.push({ type: 'lens', key: 'time', title: t(K('lens.titleTime')), blocks: buildTimeBlocks(selected, ctx, t) })
  if (lens === 'worker') blocks.push({ type: 'lens', key: 'worker', title: t(K('lens.titleWorker')), blocks: buildWorkerBlocks(selected, ctx, t) })
  if (lens === 'trust') blocks.push({ type: 'lens', key: 'trust', title: t(K('lens.titleTrust')), blocks: buildTrustBlocks(selected, ctx, t) })
  blocks.push(...buildBaseBlocks(ctx, t))
  return blocks
}

export function buildBaseBlocks(ctx, t) {
  const { selected = 'all' } = ctx
  if (selected === 'all') return buildOverviewModel(ctx, t)
  const st = STATION_BY_ID[selected]
  if (!st) {
    switch (selected) {
      case 'z-mold':
        return buildMoldOverviewModel(ctx, t)
      case 'z-prod':
        return buildProdOverviewModel(ctx, t)
      case 'z-recv':
        return buildReceiveModel(ctx, t)
      case 'z-stock':
        return buildStockModel(ctx, t)
      case 'z-mat':
        return buildMaterialModel(ctx, t)
      case 'z-sales':
        return buildSalesModel(ctx, t)
      default:
        return buildOverviewModel(ctx, t)
    }
  }
  if (st.kind === 'moldDept') return buildMoldStationModel(st.status, ctx, t)
  if (st.kind === 'prodDept') return buildProdStationModel(st.key, ctx, t)
  if (st.kind === 'recv') return buildReceiveModel(ctx, t)
  if (st.kind === 'stockPad') return buildStockModel(ctx, t)
  if (st.kind === 'mat') return buildMaterialModel(ctx, t)
  return buildSalesModel(ctx, t)
}

