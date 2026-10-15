// insight-page-helpers.js — pure logic ของ InsightPage (template config-driven ของแท็บ Production Insight)
// ห้าม import Vue/Pinia/i18n ที่นี่ — เทสได้โดยไม่ต้อง mount component

import { formatISOString } from '@/services/utils/dayjs.js'

// Date | null → ISO string | null (ใช้ใน params() ของ source ให้ body ตรงกับ store method เดิมเป๊ะ)
export function isoOrNull(value) {
  return value ? formatISOString(value) : null
}

// text spec ของ config: string = i18n key, function(ctx, t) = คำนวณเอง (ใช้กับ title ที่มี params/range)
export function resolveText(spec, ctx, t) {
  if (typeof spec === 'function') return spec(ctx, t)
  if (typeof spec === 'string' && spec) return t(spec)
  return ''
}

// key ของแต่ละ source = JSON ของ params(filter, state) — เปลี่ยนเมื่อ params จริงของ source นั้นเปลี่ยนเท่านั้น
// (field ของ filter ที่ source ไม่ได้ใช้ไม่กระทบ) = ตัวกำหนด "1 request ต่อ endpoint ต่อการกด 1 ครั้ง"
export const DISABLED_SOURCE_KEY = '__disabled__'

// source.enabled(filter, state) = false → key คงที่ DISABLED_SOURCE_KEY (ไม่ยิง · เคลียร์ผลเดิม) — ใช้กับ source ที่ขึ้นกับการเลือก
// (เช่น WorkerMonthly ที่ยิงเมื่อคลิกแถวช่างแล้วเท่านั้น)
export function computeSourceKeys(sources, filter, state) {
  const keys = {}
  Object.entries(sources || {}).forEach(([name, source]) => {
    keys[name] = source.enabled && !source.enabled(filter, state) ? DISABLED_SOURCE_KEY : JSON.stringify(source.params ? source.params(filter, state) : null)
  })
  return keys
}

// ชื่อ source ที่ key ต่างจากรอบก่อน (รอบแรก prev ว่าง = ทุก source)
export function diffSourceKeys(prev, next) {
  return Object.keys(next || {}).filter((name) => (prev || {})[name] !== next[name])
}

// state ที่ต้อง reset หลัง source โหลดเสร็จ — config.state[key].resetOn = { source, value(data, current) }
export function buildStateResets(stateConfig, sourceName, data, currentState) {
  const patch = {}
  Object.entries(stateConfig || {}).forEach(([key, def]) => {
    if (def.resetOn && def.resetOn.source === sourceName) patch[key] = def.resetOn.value(data, currentState[key])
  })
  return patch
}

export function buildInitialState(stateConfig) {
  const state = {}
  Object.entries(stateConfig || {}).forEach(([key, def]) => {
    state[key] = typeof def.initial === 'function' ? def.initial() : (def.initial ?? null)
  })
  return state
}

export function isNodeVisible(node, ctx) {
  return typeof node.visible === 'function' ? !!node.visible(ctx) : true
}

// DOM id ของ block = insight-report-<id> (ให้ "ดู ›" ของ finding เลื่อนมาหา)
export function buildAnchorId(id) {
  return id ? `insight-report-${id}` : undefined
}

// ทุก node ใน config (รวม row/group/detail ซ้อนกัน) แบบ flat
export function flattenBlocks(blocks) {
  const result = []
  ;(blocks || []).forEach((node) => {
    result.push(node)
    if (node.blocks) result.push(...flattenBlocks(node.blocks))
    if (node.detail) result.push(...flattenBlocks([node.detail]))
  })
  return result
}

export function collectBlockIds(blocks) {
  return flattenBlocks(blocks)
    .map((node) => node.id)
    .filter(Boolean)
}

export function findDuplicates(list) {
  const seen = new Set()
  const dup = new Set()
  list.forEach((item) => {
    if (seen.has(item)) dup.add(item)
    seen.add(item)
  })
  return [...dup]
}

export function nodeKey(node, index) {
  return node.id || `${node.type || (node.row ? 'row' : 'node')}-${index}`
}

// props ของ BlockFrame จาก node config (title/tip/note เป็น i18n key หรือ function(ctx, t))
export function resolveFrameProps(node, ctx, t) {
  return {
    id: node.id || '',
    title: resolveText(node.title, ctx, t),
    titleTip: resolveText(node.titleTip, ctx, t),
    icon: node.icon || '',
    accent: node.accent || 'main',
    headerStyle: node.headerStyle || 'legend',
    notes: (node.notes || []).map((note) => resolveText(note, ctx, t)).filter(Boolean),
    // bare = ไม่วาด SectionCard (เนื้อหาอยู่ในกล่องของ group.card) · subtitle = หัวข้อย่อยตัวหนา (ใช้กับ bare)
    bare: !!node.bare,
    subtitle: resolveText(node.subtitle, ctx, t)
  }
}

// ป้ายแกน x แบบ dd/MM (th-TH) ของ bucketEnd — ใช้กับกราฟรายช่วงที่ไม่ใช่รายเดือน
export function formatBucketDayMonth(bucketEnd) {
  return bucketEnd ? new Intl.DateTimeFormat('th-TH', { day: '2-digit', month: '2-digit' }).format(new Date(bucketEnd)) : ''
}
