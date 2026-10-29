// quality-excel.spec.js — sheet "คุณภาพข้อมูล" ของ Excel ทั้งหมด: แถวตัวตรวจ (ซ่อน available=false) → ข้อความปัญหา → วิธีแก้, ไทย/อังกฤษ
import { describe, it, expect } from 'vitest'
import { createI18n } from 'vue-i18n'

import productionInsightTh from '@/language/view/production-insight/th.js'
import productionInsightEn from '@/language/view/production-insight/en.js'
import executiveTh from '@/language/view/executive/th.js'
import executiveEn from '@/language/view/executive/en.js'
import { buildQualityExcelRows, buildQualitySheet } from './quality-excel.js'

const makeT = (locale, pi, ex) => createI18n({ legacy: false, locale, messages: { [locale]: { view: { productionInsight: pi, executive: ex } } } }).global.t
const th = makeT('th', productionInsightTh, executiveTh)
const en = makeT('en', productionInsightEn, executiveEn)

const overview = {
  asOf: '2026-10-22T09:00:00',
  checks: [
    { code: 'NO_COST', count: 23915, total: 29286, ratio: 81.664, severity: 'critical', impact: 'stockValuation', tab: 'stock', reportRef: 'stkCost', available: true },
    { code: 'PLACEHOLDER_WORKER_WIP', count: 0, total: 0, ratio: 0, severity: 'ok', impact: 'workerAccountability', tab: 'production', reportRef: 'wrkTable', available: false }
  ],
  problems: [{ code: 'DQ_NO_COST', severity: 'critical', params: { count: 23915, total: 29286, ratio: 81.664 }, reportRef: 'stkCost' }],
  forecasts: [],
  actions: [{ code: 'ACT_DQ_PRICE_NO_COST', ownerRole: 'productionManager', params: {} }]
}

describe('quality excel', () => {
  it('lists available checks, then problem texts, then action texts', () => {
    const rows = buildQualityExcelRows(overview, th)
    expect(rows[0]).toEqual({ check: 'ล็อตสินค้าในคลังที่ไม่มีต้นทุน (นับเป็นล็อต)', count: 23915, total: 29286, ratio: 81.66, status: 'วิกฤต', impact: 'มูลค่าสต็อกและกำไร', tab: 'คลังสินค้า' })
    const texts = rows.map((r) => r.check)
    expect(texts).not.toContain('งานค้างที่ช่างรอคิว')
    expect(texts).toContain('ล็อตสินค้าในคลัง 23,915 จาก 29,286 ล็อต (81.7%) ยังไม่มีต้นทุน ทำให้มูลค่าสต็อกและกำไรคำนวณไม่ได้ครบ')
    expect(texts.at(-1)).toBe('ตีราคาสินค้าที่ยังไม่มีต้นทุน (ผู้จัดการฝ่ายผลิต)')
    expect(texts.indexOf('ปัญหา')).toBeLessThan(texts.indexOf('วิธีแก้'))
  })

  it('builds the sheet with 7 headed columns in both languages and skips when there is no data', () => {
    const sheet = buildQualitySheet(overview, th)
    expect(sheet.sheetName).toBe('คุณภาพข้อมูล')
    expect(sheet.columns.map((c) => c.key)).toEqual(['check', 'count', 'total', 'ratio', 'status', 'impact', 'tab'])
    sheet.columns.forEach((c) => expect(c.header).not.toMatch(/^view\./))
    const sheetEn = buildQualitySheet(overview, en)
    expect(sheetEn.sheetName).toBe('Data quality')
    expect(sheetEn.data[0].check).toBe('In-stock lots without cost (counted as lots)')
    expect(buildQualitySheet(null, th)).toBeNull()
  })
})
