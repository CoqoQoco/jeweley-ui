// kpi-block-helpers.js — pure logic ของ KpiBlock (การ์ด StatCard จาก config)
import { formatNumberValue } from '../columns.js'
import { formatDateTime } from '@/services/utils/dayjs.js'

// format: 'count'|'decimal'|'days'|'signed'|'percent'|'text' — ค่า null = '—'
export function formatKpiValue(value, format = 'count') {
  if (value === null || value === undefined) return '—'
  if (format === 'text') return String(value)
  if (format === 'percent') return `${new Intl.NumberFormat('th-TH', { maximumFractionDigits: 1 }).format(value)}%`
  if (format === 'money0') return `฿${new Intl.NumberFormat('th-TH', { maximumFractionDigits: 0 }).format(value)}`
  if (format === 'percent0') return `${new Intl.NumberFormat('th-TH', { maximumFractionDigits: 0 }).format(value)}%`
  return formatNumberValue(value, format) ?? '—'
}

// card.unit (i18n key) ต่อท้ายค่าที่มีข้อมูล (ค่าว่าง '—' ไม่ต่อหน่วย)
export function withKpiUnit(text, card, t) {
  return card.unit && text !== '—' ? `${text} ${t(card.unit)}` : text
}

// เวลาประมวลผลมุมขวาบนของกรอบ — node.asOf(ctx) คืน string|null (null = ไม่แสดง) · asOfLabel = i18n key ที่มี {date}
export function buildKpiAsOf(node, ctx, t) {
  const raw = node.asOf ? node.asOf(ctx) : null
  if (!raw) return ''
  return t(node.asOfLabel || 'view.executive.asOf', { date: formatDateTime(raw) })
}

// note บรรทัดใต้การ์ด (เห็นตรงๆ ไม่ใช่ tooltip) — i18n key หรือ function(ctx, t)
export function buildKpiFootNote(node, ctx, t) {
  if (!node.footNote) return ''
  return typeof node.footNote === 'function' ? node.footNote(ctx, t) : t(node.footNote)
}

export function buildKpiCards(node, ctx, t) {
  return (node.cards || []).map((card, index) => ({
    key: card.id || `card-${index}`,
    icon: card.icon || 'bi-speedometer2',
    label: typeof card.label === 'function' ? card.label(ctx, t) : t(card.label),
    value: withKpiUnit(formatKpiValue(card.value(ctx), card.format), card, t),
    sub: card.sub ? card.sub(ctx, t) : '',
    tone: card.tone ? card.tone(ctx) : 'main',
    reportRef: card.reportRef || '',
    // reportParams (optional) = params ที่ส่งต่อให้ ctx.goToReport / config.tabFor (เช่น workerType ของแถวการ์ด)
    ...(card.reportParams ? { reportParams: card.reportParams } : {})
  }))
}
