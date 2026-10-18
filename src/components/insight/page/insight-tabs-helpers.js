// insight-tabs-helpers.js — pure logic ของโหมด "แท็บ" ใน InsightPage (opt-in ด้วย config.tabs) — ห้าม import Vue/i18n
//
// config: tabs: [{ key, label }] (label = i18n key) · block ระดับบนสุดมี tab: '<key>' (ไม่ใส่ = แท็บข้อมูลแรก) · block ลูกใน row/group/detail
// ตามแท็บของ parent · source มี tab: '<key>' (หรือ array) ได้ — source นั้นยิงเมื่อแท็บแรกถูกเปิดแล้วเท่านั้น (ไม่ผูก tab = ยิงเสมอ)
// block ที่ถูกซ่อน/เลือกแสดงทีละอัน (เช่น ตารางใบงานสลับด้วย toggle) ระบุ reveal: { stateKey, value } → "ดู ›" ตั้ง state ให้ด้วย
//
// แท็บคงที่ 3 อัน (ทุก topic ที่ opt-in): problems (default) / forecast / actions — ค่าเดียวกับ query `sub=` (problems = default ไม่เขียนลง URL)

export const FIXED_SUB_TABS = ['problems', 'forecast', 'actions']
export const DEFAULT_SUB_TAB = 'problems'

export function hasTabs(config) {
  return Array.isArray(config?.tabs) && config.tabs.length > 0
}

export function dataTabKeys(config) {
  return hasTabs(config) ? config.tabs.map((tab) => tab.key) : []
}

// ค่า sub ที่ใช้ได้จริง — ไม่รู้จัก/ว่าง/topic ไม่ opt-in → default (problems)
export function resolveSubTab(value, config) {
  if (!hasTabs(config)) return DEFAULT_SUB_TAB
  return FIXED_SUB_TABS.includes(value) || dataTabKeys(config).includes(value) ? value : DEFAULT_SUB_TAB
}

export function isDataSubTab(value, config) {
  return dataTabKeys(config).includes(value)
}

// query ของ URL: default ไม่เขียน (คืน {}) · ค่าอื่นเขียน sub=<ค่า>
export function subTabToQuery(sub) {
  return sub && sub !== DEFAULT_SUB_TAB ? { sub } : {}
}

export function clearedSubTabQueryKeys(sub) {
  return sub && sub !== DEFAULT_SUB_TAB ? [] : ['sub']
}

// ตัวเลือกของแถบแท็บ: แท็บคงที่ 3 อัน (พร้อมจำนวน) แล้วตามด้วยแท็บข้อมูล — t = ฟังก์ชันแปล
export function buildSubTabOptions({ counts = {}, dataTabs = [], t }) {
  const fixed = [
    { value: 'problems', label: t('view.productionInsight.tabs.problems'), icon: 'bi-exclamation-triangle', count: counts.problems ?? 0, group: 'fixed' },
    { value: 'forecast', label: t('view.productionInsight.tabs.forecasts'), icon: 'bi-graph-up-arrow', count: counts.forecast ?? 0, group: 'fixed' },
    { value: 'actions', label: t('view.productionInsight.tabs.actions'), icon: 'bi-list-check', count: counts.actions ?? 0, group: 'fixed' }
  ]
  const data = dataTabs.map((tab) => ({ value: tab.value, label: tab.label, icon: '', count: null, group: 'data' }))
  return [...fixed, ...data]
}

// แท็บของ block ระดับบนสุด: tab ที่ระบุ ไม่งั้นแท็บข้อมูลแรก
export function resolveNodeTab(node, config) {
  return node?.tab || config.tabs[0].key
}

// block ระดับบนสุดของแต่ละแท็บ (ลำดับเดิมใน config)
export function blocksForTab(config, key) {
  return (config.blocks || []).filter((node) => resolveNodeTab(node, config) === key)
}

// ทุก node (รวมลูกใน row/group/detail) พร้อมแท็บที่สืบทอดจาก block ระดับบนสุด
function walk(nodes, config, inheritedTab, out) {
  ;(nodes || []).forEach((node) => {
    const tab = inheritedTab || resolveNodeTab(node, config)
    out.push({ node, tab })
    if (node.blocks) walk(node.blocks, config, tab, out)
    if (node.detail) walk(node.detail.blocks ? [node.detail, ...node.detail.blocks] : [node.detail], config, tab, out)
  })
  return out
}

export function flattenBlocksWithTab(config) {
  return walk(config.blocks, config, null, [])
}

// reportRef (= block id) → { tab, reveal } ที่ต้องเปิดเพื่อให้เห็น block นั้น · ไม่พบ → null
export function findTabForReportRef(config, reportRef) {
  if (!hasTabs(config) || !reportRef) return null
  const hit = flattenBlocksWithTab(config).find(({ node }) => node.id === reportRef)
  return hit ? { tab: hit.tab, reveal: hit.node.reveal || null } : null
}

// ตรวจ config ที่ opt-in: block ระดับบนสุดที่ไม่ระบุ tab / tab ที่ไม่มีใน config.tabs / source.tab ที่ไม่มี / key ชนกับแท็บคงที่
export function validateTabConfig(config) {
  const problems = []
  if (!hasTabs(config)) return problems
  const keys = dataTabKeys(config)
  keys.forEach((key) => {
    if (FIXED_SUB_TABS.includes(key)) problems.push(`tab key "${key}" collides with a fixed tab`)
  })
  if (new Set(keys).size !== keys.length) problems.push('duplicate tab keys')
  ;(config.blocks || []).forEach((node, index) => {
    if (!node.tab) problems.push(`block ${node.id || node.type || `#${index}`} has no tab`)
    else if (!keys.includes(node.tab)) problems.push(`block ${node.id || node.type || `#${index}`} has unknown tab "${node.tab}"`)
  })
  Object.entries(config.sources || {}).forEach(([name, source]) => {
    ;[].concat(source.tab || []).forEach((key) => {
      if (!keys.includes(key)) problems.push(`source ${name} has unknown tab "${key}"`)
    })
  })
  return problems
}

// source ถูกกั้นด้วยแท็บหรือไม่ (visited = แท็บข้อมูลที่เคยเปิด · null = ไม่ใช้โหมดแท็บ)
export function isSourceTabGated(source, visited) {
  if (!visited || !source?.tab) return false
  return ![].concat(source.tab).some((key) => visited.includes(key))
}
