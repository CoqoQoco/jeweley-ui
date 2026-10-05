// materials-i18n.spec.js — เหมือน workers-i18n.spec.js/capacity-i18n.spec.js: ยิง interpolate ข้อความหมวด
// "วัตถุดิบที่กระทบการผลิต" ด้วย vue-i18n จริง (ไม่ mock) ตรวจว่าทุก {placeholder} ที่ template ประกาศไว้ถูก
// แทนค่าจริงครบ ไม่เหลือ "{"/"}" และไม่มีช่องว่างจากตัวเลขหาย — กันบั๊กชื่อ param ไม่ตรงแบบเดียวกับที่เจอใน
// หมวดอื่น — ชื่อ param ยืนยันจาก API agent final contract แล้ว (2026-10-02)
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
  ['rules.MAT_GEM_WAITING', { count: 12, medianDays: 5 }],
  ['rules.MAT_READY_NOT_ISSUED', { count: 4 }],
  ['rules.MAT_GEM_SHORT', { plans: 8, lines: 15 }],
  ['rules.MAT_SPEC_UNMATCHED', { lines: 6, percent: 3 }],
  ['rules.FC_GEM_SHORT_UPCOMING', { plans: 10, lines: 18 }],
  ['rules.FC_GEM_STOCKOUT', { count: 3, days: 14 }],
  ['rules.ACT_ISSUE_READY', { count: 4 }],
  ['rules.ACT_BUY_GEMS', { lines: 15 }],
  ['rules.ACT_FIX_GEM_SPEC', { lines: 6 }],
  // deptKey resolve ผ่าน resolveFindingParams (translateDept) ก่อนเข้า $t() แล้ว — เทสนี้จำลองค่าหลังแปลแล้ว
  ['rules.ACT_ADD_GEM_SORTER', { deptKey: 'คัดพลอย' }],
  // help.* — ไม่มี {placeholder} ในข้อความ
  ['help.MAT_GEM_WAITING', {}],
  ['help.MAT_READY_NOT_ISSUED', {}],
  ['help.MAT_GEM_SHORT', {}],
  ['help.MAT_SPEC_UNMATCHED', {}],
  ['help.FC_GEM_SHORT_UPCOMING', {}],
  ['help.FC_GEM_STOCKOUT', {}],
  // UI-only templates (ไม่ใช่ rule code จาก backend)
  ['materials.kpiWaitingPlansSub', { days: 5 }],
  ['materials.kpiIssueMedianSub', { days: 9 }],
  ['materials.kpiShortLinesSub', { plans: 8 }],
  ['materials.kpiMatchedPercentSub', { matched: 45, total: 50 }],
  ['materials.gemStatusShortWithAvailable', { available: 3 }]
]

describe('materials i18n param interpolation (vue-i18n ตัวจริง)', () => {
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
