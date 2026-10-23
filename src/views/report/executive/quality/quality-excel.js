// quality-excel.js — pure row builder ของ sheet "คุณภาพข้อมูล" ใน "Excel ทั้งหมด" ของหน้า /executive (ExecutiveReport/DataQuality)
// แถว = ตัวตรวจที่ available เท่านั้น (เหมือนบนจอ) แล้วตามด้วยข้อความปัญหา/วิธีแก้ ผ่าน i18n ชุดเดียวกับแท็บ — ห้าม import Vue/Pinia/i18n: รับ `t` จาก caller
import { formatDate } from '@/services/utils/dayjs.js'
import { renderSnapshotText } from '../executive-insight-excel-stock-sales-material.js'
import { qualityConfig } from './quality.config.js'
import { buildCheckRows } from './quality-helpers.js'

const X = 'view.executive.excel.snapshot'
const K = 'view.executive.excel.insight'
const col = (header, key) => ({ header, key })

export function buildQualityExcelRows(overview, t) {
  const pick = (items) => qualityConfig.filterFindings(items || [])
  const checkRows = buildCheckRows(overview, t).map((row) => ({
    check: row.label,
    count: row.count,
    total: row.total,
    ratio: Number(Number(row.ratio).toFixed(2)),
    status: row.statusText,
    impact: row.impactText,
    tab: row.tabText
  }))
  const problems = pick(overview?.problems).map((f) => ({ check: renderSnapshotText(t, qualityConfig.i18nPrefix, f.code, f.params), count: '', total: '', ratio: '', status: f.severity ? t(`${K}.severity.${f.severity}`) : '', impact: '', tab: '' }))
  const actions = pick(overview?.actions).map((a) => {
    const text = renderSnapshotText(t, qualityConfig.i18nPrefix, a.code, a.params)
    const owner = a.ownerRole ? t(`view.productionInsight.ownerRole.${a.ownerRole}`) : ''
    return { check: owner ? `${text} (${owner})` : text, count: '', total: '', ratio: '', status: '', impact: '', tab: '' }
  })
  const section = (kind) => ({ check: t(`${K}.kind.${kind}`) })
  return [
    ...checkRows,
    ...(problems.length ? [{}, section('problem'), ...problems] : []),
    ...(actions.length ? [{}, section('action'), ...actions] : [])
  ]
}

export function buildQualitySheet(overview, t) {
  if (!overview) return null
  const asOf = overview.asOf ? t('view.executive.asOf', { date: formatDate(overview.asOf) }) : ''
  return {
    sheetName: t(`${X}.quality`),
    data: buildQualityExcelRows(overview, t),
    columns: [
      col(asOf || t(`${X}.qualityColCheck`), 'check'),
      col(t(`${X}.qualityColCount`), 'count'),
      col(t(`${X}.qualityColTotal`), 'total'),
      col(t(`${X}.qualityColRatio`), 'ratio'),
      col(t(`${X}.qualityColStatus`), 'status'),
      col(t(`${X}.qualityColImpact`), 'impact'),
      col(t(`${X}.qualityColTab`), 'tab')
    ]
  }
}
