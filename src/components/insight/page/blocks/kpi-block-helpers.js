// kpi-block-helpers.js — pure logic ของ KpiBlock (การ์ด StatCard จาก config)
import { formatNumberValue } from '../columns.js'

// format: 'count'|'decimal'|'days'|'signed'|'percent'|'text' — ค่า null = '—'
export function formatKpiValue(value, format = 'count') {
  if (value === null || value === undefined) return '—'
  if (format === 'text') return String(value)
  if (format === 'percent') return `${new Intl.NumberFormat('th-TH', { maximumFractionDigits: 1 }).format(value)}%`
  return formatNumberValue(value, format) ?? '—'
}

export function buildKpiCards(node, ctx, t) {
  return (node.cards || []).map((card, index) => ({
    key: card.id || `card-${index}`,
    icon: card.icon || 'bi-speedometer2',
    label: t(card.label),
    value: formatKpiValue(card.value(ctx), card.format),
    sub: card.sub ? card.sub(ctx, t) : '',
    tone: card.tone ? card.tone(ctx) : 'main',
    reportRef: card.reportRef || ''
  }))
}
