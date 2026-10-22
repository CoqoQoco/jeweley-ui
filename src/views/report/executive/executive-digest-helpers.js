// executive-digest-helpers.js — pure logic ของการ์ด "สถานะรายโดเมน + เรื่องที่ต้องดูก่อน" (Executive Digest) บนหน้า /executive
// ข้อมูลมาจาก ExecutiveReport Digest (Report/Executive/Digest) — ข้อความ finding ใช้ i18n ชุดเดียวกับแต่ละแท็บ ไม่เขียนข้อความใหม่
// ห้าม import Vue/Pinia/i18n: ฟังก์ชันที่ต้องแปลรับ `t` มาจาก caller
import { buildFindingKey } from '@/components/insight/insight-helpers.js'
import { formatDateTime } from '@/services/utils/dayjs.js'
import { renderInsightText } from './executive-insight-excel-helpers.js'
import { renderSnapshotText } from './executive-insight-excel-stock-sales-material.js'
import { remapStockFindings } from './stock/stock-helpers.js'
import { remapSalesFindings, resolveSalesReportTarget } from './sales/sales-helpers.js'
import { remapMaterialFindings } from './material/material-helpers.js'
import { SECTION_VALUES } from '@/views/production/insight/insight-filters.js'

export const DIGEST_DOMAINS = ['production', 'sales', 'stock', 'material']

export const DIGEST_STATUSES = ['critical', 'warning', 'ok', 'unknown']

const DOMAIN_ICON = {
  production: 'bi-gear-wide-connected',
  sales: 'bi-cash-coin',
  stock: 'bi-box-seam',
  material: 'bi-gem'
}

// prefix ต้องตรงกับ config.i18nPrefix ของแต่ละแท็บ (มี spec ตรวจ) — production ใช้ rules ของ Production Insight ทุกหมวด
export const DIGEST_RULES_PREFIX = {
  production: 'view.productionInsight.rules',
  sales: 'view.productionInsight.salesInsight.rules',
  stock: 'view.productionInsight.stockInsight.rules',
  material: 'view.productionInsight.materialInsight.rules'
}

const REMAP_BY_DOMAIN = {
  sales: remapSalesFindings,
  stock: remapStockFindings,
  material: remapMaterialFindings
}

const STATUS_VIEW = {
  critical: { variant: 'critical', labelKey: 'view.executive.digest.status.critical' },
  warning: { variant: 'warning', labelKey: 'view.executive.digest.status.warning' },
  ok: { variant: 'ok', labelKey: 'view.executive.digest.status.ok' },
  unknown: { variant: 'unknown', labelKey: 'view.executive.digest.status.unknown' }
}

// status ที่ไม่รู้จัก/ว่าง = unknown (แสดงแบบ muted) — variant ใช้เป็น modifier class ของชิป
export function resolveStatusView(status) {
  return STATUS_VIEW[status] || STATUS_VIEW.unknown
}

export function resolveDomainLabelKey(domain) {
  return `view.executive.digest.domain.${domain}`
}

// การ์ดโดเมนเสมอ 4 ใบ เรียงตามแท็บ (ผลิต/ขายและเงิน/คลังสินค้า/คลังวัตถุดิบ) — โดเมนที่ API ไม่ส่ง/available=false = unknown ไม่ซ่อน
export function buildDomainCards(digest) {
  const byKey = Object.fromEntries((digest?.domains || []).map((d) => [d.key, d]))
  return DIGEST_DOMAINS.map((key) => {
    const item = byKey[key]
    const available = !!item && item.available !== false && item.status !== 'unknown'
    const status = available ? item.status : 'unknown'
    return {
      key,
      icon: DOMAIN_ICON[key],
      labelKey: resolveDomainLabelKey(key),
      status,
      statusView: resolveStatusView(status),
      available,
      problemCount: available ? item.problemCount || 0 : 0,
      forecastCount: available ? item.forecastCount || 0 : 0
    }
  })
}

// ข้อความ finding ของ 1 รายการ — production ผ่าน renderInsightText (rules เดียวกับ 6 หมวดผลิต) · โดเมนอื่นผ่าน remap + prefix ของแท็บ
export function renderDigestText(t, domain, code, params, severity) {
  const remap = REMAP_BY_DOMAIN[domain]
  const finding = remap ? remap([{ code, params, severity }])[0] : { code, params, severity }
  if (domain === 'production') return renderInsightText(t, finding.code, finding.params)
  return renderSnapshotText(t, DIGEST_RULES_PREFIX[domain], finding.code, finding.params)
}

// top → findings ของ InsightFindingList: reportRef = tab (ให้ปุ่ม [ดู ›] แสดงเสมอ) · reportParams = ข้อมูลปลายทางครบสำหรับ resolveDigestNavigation
export function buildTopFindings(top, t) {
  return (top || []).map((item, index) => ({
    key: `${index}:${item.domain}:${buildFindingKey(item.code, item.params)}`,
    severity: item.severity,
    text: renderDigestText(t, item.domain, item.code, item.params, item.severity),
    tag: t(resolveDomainLabelKey(item.domain)),
    reportRef: item.tab || item.domain,
    reportParams: { domain: item.domain, tab: item.tab || item.domain, reportRef: item.reportRef || '', code: item.code, params: item.params || {} }
  }))
}

// ปลายทางของ [ดู ›] / การ์ดโดเมน → { tab, productionTarget, salesTarget }
// production: tab ของ digest = หมวดย่อย (wip|delivery|capacity|workers|gold|materials) → ตั้ง production view · ค่าที่ไม่รู้จักเปิดแท็บผลิตเฉยๆ
// sales: ถ้า finding มี reportRef 'salDue' → แท็บย่อย "บิลที่ต้องตาม" + ตัวสลับตาม code เหมือนปุ่ม [ดู ›] ในแท็บเอง · อื่นๆ เปิดแท็บเฉยๆ
export function resolveDigestNavigation(domain, target) {
  const nav = { tab: domain, productionTarget: null, salesTarget: null }
  if (!target) return nav
  if (domain === 'production' && SECTION_VALUES.includes(target.tab)) {
    nav.productionTarget = { view: target.tab }
  }
  if (domain === 'sales' && target.reportRef) {
    const resolved = resolveSalesReportTarget(target.reportRef, { ...(target.params || {}), findingCode: target.code })
    if (resolved?.tab) nav.salesTarget = { sub: resolved.tab, dueFilter: resolved.reveal?.value }
  }
  return nav
}

// ---- Excel ----

const X = 'view.executive.digest.excel'

// sheet "สรุปสถานะ": บล็อกโดเมน (สถานะ/ปัญหา/คาดการณ์) แล้วเว้นแถวตามด้วยเรื่องที่ต้องดูก่อน (โดเมน/ระดับ/ข้อความ)
// ทุกแถวใช้ key คอลัมน์ชุดเดียวกัน (c1..c4) เพราะ 2 บล็อกหัวคอลัมน์ต่างกัน
export function buildDigestExcelRows(digest, t) {
  const toRow = (cells) => Object.fromEntries(cells.map((cell, i) => [`c${i + 1}`, cell]))
  const cards = buildDomainCards(digest)
  const top = buildTopFindings(digest?.top, t)
  return [
    toRow([t(`${X}.colDomain`), t(`${X}.colStatus`), t(`${X}.colProblems`), t(`${X}.colForecasts`)]),
    ...cards.map((card) => toRow([t(card.labelKey), t(card.statusView.labelKey), card.available ? card.problemCount : '', card.available ? card.forecastCount : ''])),
    {},
    toRow([t(`${X}.colTopRank`), t(`${X}.colDomain`), t(`${X}.colSeverity`), t(`${X}.colText`)]),
    ...(digest?.top || []).map((item, index) => toRow([index + 1, top[index].tag, t(`view.executive.excel.insight.severity.${item.severity}`), top[index].text]))
  ]
}

export function buildDigestExcelSheet(digest, t) {
  const asOf = digest?.asOf ? t('view.executive.asOf', { date: formatDateTime(digest.asOf) }) : ''
  return {
    sheetName: t(`${X}.sheetName`),
    data: buildDigestExcelRows(digest, t),
    columns: [
      { header: asOf || t(`${X}.colDomain`), key: 'c1' },
      { header: '', key: 'c2' },
      { header: '', key: 'c3' },
      { header: '', key: 'c4' }
    ]
  }
}
