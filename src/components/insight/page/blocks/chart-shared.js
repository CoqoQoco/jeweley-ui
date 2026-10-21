// chart-shared.js — ตัวช่วยร่วมของ block donut / bar (pure — ห้าม import Vue/i18n)
import { CHART_PALETTE, CHART_TOKENS } from '@/services/utils/chart-colors.js'

const TH = 'th-TH'

// 'count' (จำนวนเต็ม คั่นหลักพัน) · 'decimal' (ทศนิยมไม่เกิน 2) · 'money0' (฿ ไม่มีทศนิยม) · 'percent' (1 ตำแหน่ง)
export function formatChartValue(value, format = 'count') {
  const n = Number(value) || 0
  switch (format) {
    case 'decimal':
      return new Intl.NumberFormat(TH, { maximumFractionDigits: 2 }).format(n)
    case 'money0':
      return `฿${new Intl.NumberFormat(TH, { maximumFractionDigits: 0 }).format(n)}`
    case 'percent':
      return `${new Intl.NumberFormat(TH, { maximumFractionDigits: 1 }).format(n)}%`
    default:
      return new Intl.NumberFormat(TH, { maximumFractionDigits: 0 }).format(n)
  }
}

// 'token:green' → CHART_TOKENS.green · 'palette:1' → CHART_PALETTE[1] · ไม่ระบุ → palette ตามลำดับ (วนซ้ำ)
export function resolveColorSpec(spec, index = 0) {
  if (!spec) return CHART_PALETTE[index % CHART_PALETTE.length]
  const [kind, name] = String(spec).split(':')
  if (kind === 'palette') return CHART_PALETTE[Number(name) % CHART_PALETTE.length]
  return CHART_TOKENS[name] || CHART_PALETTE[index % CHART_PALETTE.length]
}
