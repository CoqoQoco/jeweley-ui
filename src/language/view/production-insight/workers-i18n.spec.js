// workers-i18n.spec.js — เหมือน capacity-i18n.spec.js/gold-i18n.spec.js: ยิง interpolate ข้อความหมวด
// "ช่างและค่าแรง" ด้วย vue-i18n จริง (ไม่ mock) ตรวจว่าทุก {placeholder} ที่ template ประกาศไว้ถูกแทนค่าจริง
// ครบ ไม่เหลือ "{"/"}" และไม่มีช่องว่างจากตัวเลขหาย — กันบั๊กชื่อ param ไม่ตรงแบบเดียวกับที่เจอในหมวดอื่น
//
// ชื่อ param ของ rules.WRK_*/FC_WAGES_NEXT_MONTH/FC_KEY_PERSON_RISK/ACT_* ยืนยันจาก API agent แล้ว 2026-10-01
// (final contract) — workers[]/workerNames[] resolve ผ่าน resolveFindingParams (formatWorkerNameList) ก่อน
// เข้า $t() เสมอ (รองรับทั้ง field `name`/`workerName` และ worker ที่มี wagePerJob+medianPerJob พ่วงมาด้วย —
// ดู insight-helpers.spec.js) deptKey resolve ผ่าน translateDept ปกติ ส่วน workerName (เอกพจน์,
// FC_KEY_PERSON_RISK) เป็นสตริงดิบจาก API ไม่ต้อง resolve เพิ่ม
import { describe, it, expect } from 'vitest'
import { createI18n } from 'vue-i18n'

import th from './th.js'

const i18n = createI18n({
  legacy: false,
  locale: 'th',
  messages: { th: { view: { productionInsight: th } } }
})

const t = i18n.global.t

function resolveTemplate(key) {
  return key.split('.').reduce((obj, part) => obj?.[part], th)
}

function placeholdersIn(template) {
  return [...new Set([...template.matchAll(/\{(\w+)\}/g)].map((m) => m[1]))]
}

const cases = [
  // workers/workerNames มาจาก resolveFindingParams (formatWorkerNameList) แปลงเป็นสตริงรายชื่อเดียวแล้วก่อน
  // ถึง $t() — เทสนี้จำลองค่าหลังแปลงแล้วตรงๆ (มี spec ของ formatWorkerNameList เองใน insight-helpers.spec.js)
  ['rules.WRK_CONCENTRATION', { deptKey: 'ฝัง', top2Share: 62, workers: 'หนิง และ สมชาย' }],
  ['rules.WRK_RATE_OUTLIER', { count: 3, workers: 'หนิง 1,290 ฿/งาน (ค่ากลาง 145)' }],
  ['rules.WRK_WAGE_PER_PLAN_RISING', { fromValue: '1,200', toValue: '1,450' }],
  ['rules.WRK_UNPAID_JOBS', { count: 12 }],
  ['rules.WRK_GOLD_REPEAT', { workers: 'สมชาย, สมหญิง และอีก 1 คน' }],
  ['rules.FC_WAGES_NEXT_MONTH', { projectedWages: '850,000', avgWages: '820,000' }],
  ['rules.FC_KEY_PERSON_RISK', { deptKey: 'แต่ง', workerName: 'สมชาย', queueDaysNow: 12, queueDaysWithout: 28 }],
  ['rules.ACT_CROSS_TRAIN', { deptKey: 'ฝัง', workerNames: 'สมชาย และ สมหญิง' }],
  ['rules.ACT_REVIEW_RATE', { workers: 'หนิง 1,290 ฿/งาน (ค่ากลาง 145)' }],
  ['rules.ACT_RECORD_WAGES', { count: 12 }],
  ['rules.ACT_TALK_WORKER_GOLD', { workers: 'สมชาย' }],
  // help.* — ไม่มี {placeholder} ในข้อความ (ไม่ต้องใส่ params)
  ['help.WRK_CONCENTRATION', {}],
  ['help.WRK_RATE_OUTLIER', {}],
  ['help.WRK_WAGE_PER_PLAN_RISING', {}],
  ['help.WRK_UNPAID_JOBS', {}],
  ['help.WRK_GOLD_REPEAT', {}],
  ['help.FC_WAGES_NEXT_MONTH', {}],
  ['help.FC_KEY_PERSON_RISK', {}],
  // UI-only templates (ไม่ใช่ rule code จาก backend)
  ['workers.detailTitle', { name: 'สมชาย' }]
]

describe('workers i18n param interpolation (vue-i18n ตัวจริง)', () => {
  cases.forEach(([key, params]) => {
    const template = resolveTemplate(key)

    it(`${key} template placeholders are all covered by the given params (test sanity check)`, () => {
      const declared = placeholdersIn(template)
      declared.forEach((name) => {
        expect(params, `template ${key} uses {${name}} but the test did not provide it`).toHaveProperty(name)
      })
    })

    it(`${key} interpolates every declared placeholder (no leftover "{"/"}" and no empty-number gaps)`, () => {
      const rendered = t(`view.productionInsight.${key}`, params)

      expect(rendered).not.toContain('{')
      expect(rendered).not.toContain('}')
      expect(rendered).not.toMatch(/%%/)

      placeholdersIn(template).forEach((name) => {
        expect(rendered).toContain(String(params[name]))
      })
    })
  })
})
