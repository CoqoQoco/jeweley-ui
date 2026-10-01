// delivery-i18n.spec.js — ยิง interpolate ข้อความ "ส่งงานตรงเวลา" ด้วย vue-i18n จริง (ไม่ mock) โดยส่ง
// พารามิเตอร์ชื่อเดียวกับที่ jewelry-api ProductionInsightRuleEngine.cs ส่งมาจริง (EvaluateDlv*/FC_DLV*/
// BuildActionParams) + พารามิเตอร์ของ DeliveryKpiGroup subtitle — กันบั๊กชื่อ param ไม่ตรงที่ทำให้ตัวเลข/%
// หายไปเงียบๆ (vue-i18n แทนค่า key ที่หาไม่เจอด้วยสตริงว่าง ไม่ใช่ปล่อย "{key}" ค้างไว้ให้เห็นชัดๆ)
//
// วิธีตรวจ: ดึงชื่อ placeholder ({xxx}) ออกจาก template string ตรงๆ (ไม่ hardcode สมมติว่า message ไหนต้อง
// ใช้ param ตัวไหนบ้าง) แล้วยืนยันว่าค่าที่ส่งเข้าไปของทุก placeholder ที่ template ประกาศไว้จริงๆ ปรากฏอยู่ใน
// ข้อความที่ render ออกมาครบ — ถ้า template สะกดชื่อ param ผิด (ไม่ตรงกับที่ API ส่ง) ค่านั้นจะหายไปจาก
// ข้อความเงียบๆ ตามพฤติกรรมจริงของ vue-i18n (ไม่ throw ไม่คงเหลือ "{key}" ให้เห็น) — ทดสอบ repro ไว้แล้วว่า
// vue-i18n ทำงานแบบนี้จริง (ดู comment ในไฟล์คู่กัน)
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

// params ตรงกับที่ ProductionInsightRuleEngine.cs ส่งจริงต่อ code (ดู EvaluateDlv*/EvaluateFcDlv*/
// BuildActionParams) — เผื่อ param ที่ template อาจไม่ได้ใช้ทุกตัวก็ไม่เป็นไร (เช็คเฉพาะ placeholder ที่
// template ประกาศไว้จริงเท่านั้น) deptKey/bottleneckDept ใช้ค่าภาษาไทยสมมติแทนการ resolve ผ่าน
// translateDept จริง (การ resolve deptKey เป็นหน้าที่ของ insight-helpers.js เอง มี spec ของตัวเอง)
const cases = [
  ['rules.DLV_ONTIME_BELOW_TARGET', { onTimePercent: 42, targetPercent: 95, bottleneckDept: 'ฝัง' }],
  ['rules.DLV_LEAD_UNDERESTIMATED', { planned: 3, actual: 7, suggested: 6 }],
  ['rules.DLV_OPEN_OVERDUE', { count: 5, openCount: 20, percent: 25 }],
  ['rules.DLV_STUCK_AFTER_COSTCARD', { count: 3 }],
  ['rules.FC_DLV_AT_RISK', { count: 4, days: 30 }],
  ['rules.FC_DLV_ONTIME_DECLINING', { fromPercent: 90, toPercent: 70, buckets: 3, bottleneckDept: 'ฝัง' }],
  ['rules.ACT_SET_REALISTIC_DUE', { suggestedLeadDays: 6 }],
  ['rules.ACT_EXPEDITE_AT_RISK', { atRisk: 4, overdue: 5 }],
  ['rules.ACT_CLOSE_COSTCARD', { count: 3 }],
  ['rules.ACT_FIX_BOTTLENECK', { deptKey: 'ฝัง' }],
  // DeliveryKpiGroup subtitle (ไม่ใช่ rule code จาก backend แต่ประกอบจาก kpi/targetPercent — เจอบั๊ก % ซ้ำ
  // ที่นี่จริง: formatPercent() ใส่ % มาด้วยแล้ว ซ้ำกับ "%" ที่ hardcode ไว้ในข้อความ)
  ['delivery.kpiOnTimeSubTarget', { target: 80, completed: '1,000', onTime: '703' }],
  ['delivery.kpiOnTimeSubNoTarget', { completed: '1,000', onTime: '703' }],
  ['delivery.kpiLeadCompareSub', { planned: 3, suggested: 6 }],
  ['delivery.kpiOpenOverdueSub', { all: 12, open: 40 }]
]

describe('delivery i18n param interpolation (vue-i18n ตัวจริง)', () => {
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

      // เฉพาะ placeholder ที่ template ประกาศไว้จริงเท่านั้นที่ต้องปรากฏในผลลัพธ์ — ถ้าชื่อ param ในข้อความ
      // ไม่ตรงกับที่ส่งมา vue-i18n จะแทนด้วยสตริงว่างเงียบๆ ทำให้ค่านั้นหายไปจากผลลัพธ์
      placeholdersIn(template).forEach((name) => {
        expect(rendered).toContain(String(params[name]))
      })
    })
  })
})
