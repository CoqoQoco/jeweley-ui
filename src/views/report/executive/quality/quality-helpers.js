// quality-helpers.js — pure logic ของแท็บ "คุณภาพข้อมูล" (ExecutiveReport/DataQuality) ที่ quality.config.js ใช้ — ห้าม import Vue/i18n
export const DATA_QUALITY_ENDPOINT = 'ExecutiveReport/DataQuality'

const S = 'view.productionInsight.qualityInsight'

// check.code (เสถียร) → code ของ finding ที่ API ส่งมาคู่กัน (ใช้หาแท็บปลายทางของ finding ที่กด [ดู ›])
export const CHECK_FINDING_CODE = {
  NO_COST: 'DQ_NO_COST',
  NEGATIVE_GOLD: 'DQ_NEGATIVE_GOLD',
  INVOICE_NO_DUE: 'DQ_INVOICE_NO_DUE',
  SO_NO_DELIVERY_DATE: 'DQ_SO_NO_DELIVERY',
  SO_NO_INVOICE: 'DQ_SO_NO_INVOICE',
  PLACEHOLDER_WORKER_WIP: 'DQ_PLACEHOLDER_WIP'
}

// finding code → แท็บ (โดเมน) ปลายทาง + reportRef สำรอง เมื่อ finding ไม่ได้ส่ง reportRef มา
const FINDING_DOMAIN = {
  DQ_NO_COST: 'stock',
  DQ_NEGATIVE_GOLD: 'material',
  DQ_INVOICE_NO_DUE: 'sales',
  DQ_SO_NO_DELIVERY: 'sales',
  DQ_SO_NO_INVOICE: 'sales',
  DQ_PLACEHOLDER_WIP: 'production'
}

// ตัวสลับของแท็บ "บิลที่ต้องตาม" ที่ตรงกับ finding (resolveSalesReportTarget อ่าน params.dueFilter)
const FINDING_PARAMS = { DQ_INVOICE_NO_DUE: { dueFilter: 'noDue' } }

export const IMPACT_KEYS = ['stockValuation', 'goldBalance', 'receivableAging', 'deliveryPlanning', 'revenueRecognition', 'workerAccountability']
export const CHECK_TAB_KEYS = ['stock', 'sales', 'material', 'production']
// แท็บ "ผลิต" รับปลายทางเป็นหมวดย่อย — ตัวตรวจช่างรอคิวอยู่ในหมวด "ช่าง"
const PRODUCTION_TARGET_TAB = 'workers'

export const STATUS_VARIANT = { critical: 'fail', warning: 'warning', ok: 'pass' }
export const STATUS_COLOR = { fail: 'var(--base-red)', warning: 'var(--base-warning)', pass: 'var(--base-green)' }

// body ของ request — ไม่ส่ง thresholds (ใช้ค่าเริ่มต้นของ API) · metal ถูกเติมโดย store (metal-scope)
export function buildOverviewParams() {
  return {}
}

const fmtInt = (value) => new Intl.NumberFormat('th-TH', { maximumFractionDigits: 0 }).format(Number(value) || 0)
const fmtRatio = (value) => new Intl.NumberFormat('th-TH', { maximumFractionDigits: 1 }).format(Number(value) || 0)
const fmtWeight = (value) => new Intl.NumberFormat('th-TH', { maximumFractionDigits: 2 }).format(Math.abs(Number(value) || 0))

// เฉพาะตัวตรวจที่ใช้งานได้จริง — available=false (ยังไม่พร้อม) ไม่โชว์และไม่นับ
export function visibleChecks(overview) {
  return (overview?.checks || []).filter((check) => check && check.available !== false)
}

export function resolveStatusVariant(severity) {
  return STATUS_VARIANT[severity] || 'pass'
}

export function buildKpi(overview) {
  const checks = visibleChecks(overview)
  const critical = checks.filter((c) => c.severity === 'critical').length
  const warning = checks.filter((c) => c.severity === 'warning').length
  const fromApi = Array.isArray(overview?.kpi?.affectedTabs) ? overview.kpi.affectedTabs : null
  const derived = [...new Set(checks.filter((c) => c.severity !== 'ok' && c.tab).map((c) => c.tab))]
  return {
    total: checks.length,
    problems: critical + warning,
    critical,
    passed: checks.filter((c) => c.severity === 'ok').length,
    affectedTabs: fromApi || derived
  }
}

function checkLabel(code, t) {
  return CHECK_FINDING_CODE[code] ? t(`${S}.checks.${code}`) : code
}

function impactLabel(impact, t) {
  if (!impact) return '—'
  return IMPACT_KEYS.includes(impact) ? t(`${S}.impact.${impact}`) : impact
}

export function tabLabel(tab, t) {
  return CHECK_TAB_KEYS.includes(tab) ? t(`${S}.tab.${tab}`) : tab || ''
}

// ปลายทางของ [ดู ›] → { domain, target } ที่ onDigestSelect(domain, target) ของหน้า executive รับ
export function resolveQualityNavigation({ tab, reportRef, findingCode }) {
  const domain = CHECK_TAB_KEYS.includes(tab) ? tab : FINDING_DOMAIN[findingCode] || 'production'
  return {
    domain,
    target: { tab: domain === 'production' ? PRODUCTION_TARGET_TAB : domain, reportRef: reportRef || '', code: findingCode || '', params: FINDING_PARAMS[findingCode] || {} }
  }
}

export function resolveFindingNavigation(reportRef, params) {
  const findingCode = params?.findingCode
  return resolveQualityNavigation({ tab: FINDING_DOMAIN[findingCode], reportRef, findingCode })
}

// แถวตาราง "รายการตรวจ" — เฉพาะตัวตรวจที่ available · ratio เป็นเปอร์เซ็นต์ 0-100 จาก API ตรงๆ
export function buildCheckRows(overview, t) {
  return visibleChecks(overview).map((check) => ({
    key: check.code,
    code: check.code,
    label: checkLabel(check.code, t),
    count: check.count ?? 0,
    total: check.total ?? 0,
    ratio: check.ratio ?? 0,
    severity: check.severity || 'ok',
    statusText: t(`view.productionInsight.status.${check.severity || 'ok'}`),
    impact: check.impact || '',
    impactText: impactLabel(check.impact, t),
    tab: check.tab || '',
    tabText: tabLabel(check.tab, t),
    reportRef: check.reportRef || '',
    navigation: resolveQualityNavigation({ tab: check.tab, reportRef: check.reportRef, findingCode: CHECK_FINDING_CODE[check.code] })
  }))
}

// ตัวเลขในข้อความ finding/action: ตัวคั่นหลักพัน · ratio ทศนิยมไม่เกิน 1 ตำแหน่ง · ทองติดลบแสดงเป็นขนาด (ข้อความมีคำว่า "ติดลบ" อยู่แล้ว)
// เสียบผ่าน config.filterFindings (ใช้ทั้งบนจอและใน Excel)
export function formatQualityFindings(items) {
  return (items || []).map((item) => {
    if (!item?.params) return item
    const params = { ...item.params }
    if (params.count != null) params.count = fmtInt(params.count)
    if (params.total != null) params.total = fmtInt(params.total)
    if (params.ratio != null) params.ratio = fmtRatio(params.ratio)
    if (params.negativeWeight != null) params.negativeWeight = fmtWeight(params.negativeWeight)
    return { ...item, params }
  })
}
