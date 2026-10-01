// gold-i18n.spec.js — เหมือน delivery-i18n.spec.js: ยิง interpolate ข้อความ "ทองและ Loss" ด้วย vue-i18n
// จริง (ไม่ mock) ตรวจว่าทุก {placeholder} ที่ template ประกาศไว้ถูกแทนค่าจริงครบ ไม่เหลือ "{"/"}" และไม่มี
// ช่องว่างจากตัวเลขหาย — กันบั๊กชื่อ param ไม่ตรงแบบเดียวกับที่เจอในหมวด delivery
//
// ชื่อ param ด้านล่างตรงกับ contract สุดท้ายที่ API agent ส่งมา (EvaluateGold*/BuildActionParams) —
// workerType/metal เป็นค่าดิบ (เลข 50/80 / 'GOLD'|'SILVER') resolve ผ่าน translateWorkerType/translateMetal
// (เหมือน deptKey) ก่อนเข้า $t() เสมอ ในเทสนี้ส่งเป็นสตริงที่แปลแล้วตรงๆ (ไม่ผ่าน resolveFindingParams ซ้ำ
// เพราะมี spec ของตัวเองใน insight-helpers.spec.js)
import { describe, it, expect } from 'vitest'
import { createI18n } from 'vue-i18n'

import th from './th.js'
import executiveTh from '../executive/th.js'
import { STAGE_TARGET_WORKER_TYPE_ORDER, resolveStageTargetDeptKey } from '../../../views/production/insight/components/gold-stage-helpers.js'

const i18n = createI18n({
  legacy: false,
  locale: 'th',
  messages: { th: { view: { productionInsight: th, executive: executiveTh } } }
})

const t = i18n.global.t

function resolveTemplate(key) {
  return key.split('.').reduce((obj, part) => obj?.[part], th)
}

function placeholdersIn(template) {
  return [...new Set([...template.matchAll(/\{(\w+)\}/g)].map((m) => m[1]))]
}

// ค่าพารามิเตอร์ตาม contract สุดท้ายจาก API agent — ทุก code มี metal แล้ว (เทียบ GOLD→ทอง/SILVER→เงิน)
const cases = [
  ['rules.GOLD_EXCESS_OVER_ALLOWANCE', { workerType: 'ช่างฝัง', metal: 'ทอง', excessGram: 3.5, excessMoney: '12,500' }],
  ['rules.GOLD_LOSS_ABOVE_TARGET', { workerType: 'ช่างฝัง', metal: 'ทอง', lossPercent: 2.5, targetPercent: 2 }],
  ['rules.GOLD_ALLOWANCE_ABOVE_TARGET', { workerType: 'ช่างแต่ง', metal: 'เงิน', allowedPercent: 2.2, targetPercent: 2 }],
  ['rules.GOLD_MOST_WORKERS_OVER', { workerType: 'ช่างฝัง', metal: 'ทอง', overCount: 4, workerCount: 10, percent: 40 }],
  // workers มาจาก resolveFindingParams (formatWorkerNameList) แปลงเป็นสตริงรายชื่อเดียวแล้วก่อนถึง $t() —
  // เทสนี้จำลองค่าหลังแปลงแล้วตรงๆ (มี spec ของ formatWorkerNameList เองใน insight-helpers.spec.js)
  ['rules.GOLD_REPEAT_OFFENDER', { workerType: 'ช่างฝัง', metal: 'ทอง', buckets: 3, workers: 'ขวัญชัย, ณฐกร, ศิริมงคล และอีก 1 คน' }],
  ['rules.GOLD_SLIP_COVERAGE_LOW', { workerType: 'ช่างแต่ง', metal: 'เงิน', coveragePercent: 60, coverageJobs: 12, coverageTotalJobs: 20 }],
  ['rules.FC_GOLD_EXCESS_PROJECTED', { workerType: 'ช่างฝัง', metal: 'ทอง', avgMonthlyExcessGram: 2.1, avgMonthlyExcessMoney: '4,500' }],
  ['rules.FC_GOLD_LOSS_RISING', { workerType: 'ช่างฝัง', metal: 'ทอง', fromPercent: 1.5, toPercent: 2.8, buckets: 3 }],
  ['rules.ACT_COMPLETE_SLIPS', { workerType: 'ช่างแต่ง', metal: 'เงิน', uncoveredCount: 7 }],
  // ACT_TALK_WORKER โชว์ได้ถึง 5 คน (ตามที่สั่ง) — จำลองค่าที่ formatWorkerNameList(workers, count, 5) คืนมา
  ['rules.ACT_TALK_WORKER', { workerType: 'ช่างฝัง', metal: 'ทอง', workers: 'หนึ่ง, สอง, สาม, สี่, ห้า และอีก 1 คน' }],
  // API ส่ง lossPercent มาด้วยเสมอแล้ว (contract follow-up) — ข้อความโชว์ครบ 3 ค่า Loss จริง/ยอมให้/เป้า
  ['rules.ACT_REVIEW_ALLOWANCE', { workerType: 'ช่างแต่ง', metal: 'เงิน', lossPercent: 2.5, allowedPercent: 2.2, targetPercent: 2 }],
  ['rules.ACT_CHECK_WEIGHING', { workerType: 'ช่างฝัง', metal: 'ทอง', excessGram: 3.5 }],
  // ส่วน "Loss ตามใบงานรายแผนก (จ่าย − รับ)" — deptKey/topDeptKey เป็น string dept key เดียวกับ wip/capacity
  // ('trim'/'rawPolish'/'gemSort'/'setting'/'plating') resolve ผ่าน translateDept → view.executive.department.*
  // ตัวเดียวกับหมวดอื่นทุกประการ (ยืนยันจาก API agent — ไม่ใช่รหัสตัวเลขแยกชุดแบบที่เข้าใจผิดตอนแรก) — เทสนี้
  // จำลองค่าหลังแปลแล้วตรงๆ ใช้ label จริงจาก view.executive.department (ดู describe block ท้ายไฟล์ที่ตรวจ
  // end-to-end ว่า view.executive.department.rawPolish/setting/plating = ขัดดิบ/ฝัง/ขัดชุบ จริง)
  ['rules.GOLD_STAGE_ABOVE_TARGET', { deptKey: 'ฝัง', metal: 'ทอง', diffPercent: 2.5, targetPercent: 2 }],
  ['rules.GOLD_STAGE_PENDING_RETURN', { metal: 'ทอง', count: 5, gram: 12.5, topDeptKey: 'แต่ง' }],
  ['rules.GOLD_STAGE_OUTLIER_JOBS', { metal: 'เงิน', count: 3 }],
  ['rules.FC_GOLD_STAGE_RISING', { deptKey: 'ขัดชุบ', metal: 'ทอง', fromPercent: 1.2, toPercent: 2.1 }],
  // finding severity 'info' ใหม่ — ยืนยัน param จาก API agent 2026-10-01: metal/count/gram/topDeptKey
  ['rules.GOLD_STAGE_QUEUED', { metal: 'ทอง', count: 5, gram: 1.2, topDeptKey: 'ขัดชุบ' }],
  ['rules.ACT_RECEIVE_PENDING', { count: 5, gram: 12.5 }],
  ['rules.ACT_CHECK_STAGE', { deptKey: 'ขัดดิบ', diffPercent: 2.5, targetPercent: 2 }],
  // คอลัมน์ "ค้างไม่รับคืน" ของ gold-stage-table.vue แยก 2 บรรทัด — count/gram format เป็นสตริงมาจาก
  // formatCount/formatGram ของ component เองก่อนเข้า $t() แล้ว (เหมือน ACT_RECEIVE_PENDING)
  ['gold.stagePendingWithWorker', { count: '3', gram: '1.23' }],
  ['gold.stagePendingQueue', { count: '2', gram: '0.45' }],
  // KPI subtitle templates ของ gold-kpi-group.vue (ไม่ใช่ rule code จาก backend)
  ['gold.kpiLossPercentSub', { allowed: 2.5, target: 2 }],
  ['gold.kpiExcessGram', { metal: 'เงิน' }],
  ['gold.kpiExcessGramSub', { money: '12,500' }],
  ['gold.kpiCoveragePercentSub', { jobs: 18, total: 20 }],
  ['gold.seriesRawLoss', { metal: 'เงิน' }],
  ['gold.seriesAllowedLoss', { metal: 'เงิน' }],
  ['gold.netMoneyPositive', { amount: '500 บาท' }],
  ['gold.netMoneyNegative', { amount: '500 บาท' }],
  // table title ของ gold-over-slips-panel.vue — metal param มาจาก metalLabel computed ของ component เอง
  ['gold.overSlipsTitle', { metal: 'เงิน' }],
  // titleTip แชร์กัน 3 panel (over-slips/trend/worker-ranking) — metal มาจาก prop ของแต่ละ component
  ['help.goldMoneySemantics', { metal: 'เงิน' }],
  // help.* ของ 4 code ที่ resolveHelpText ส่ง metal ไปด้วยอยู่แล้ว (whitelist ใน HELP_KEY_CODES)
  ['help.GOLD_EXCESS_OVER_ALLOWANCE', { metal: 'เงิน' }],
  ['help.GOLD_MOST_WORKERS_OVER', { metal: 'เงิน' }],
  ['help.GOLD_REPEAT_OFFENDER', { metal: 'เงิน' }],
  ['help.FC_GOLD_EXCESS_PROJECTED', { metal: 'เงิน' }],
  // codeLabel ของ action "เกี่ยวข้องกับ" — metal มาจาก params ของ action ที่ relatedCodes สังกัดอยู่
  ['codeLabel.GOLD_EXCESS_OVER_ALLOWANCE', { metal: 'เงิน' }],
  ['codeLabel.FC_GOLD_EXCESS_PROJECTED', { metal: 'เงิน' }],
  // help.* ของ 4 code ใหม่ส่วน "Loss ตามใบงานรายแผนก" (ไม่มี metal — GOLD_STAGE_OUTLIER_JOBS/PENDING_RETURN
  // ไม่ส่ง deptKey มาด้วย แต่ resolveHelpText ก็ยังส่ง metal ที่มากับ finding params ปกติถ้ามี — เคสนี้ help
  // text ไม่ได้ใช้ {metal}/{deptKey} เลยจึงไม่ต้องใส่ params)
  ['help.GOLD_STAGE_ABOVE_TARGET', {}],
  ['help.GOLD_STAGE_PENDING_RETURN', {}],
  ['help.GOLD_STAGE_OUTLIER_JOBS', {}],
  ['help.FC_GOLD_STAGE_RISING', {}],
  // gold-stage-department-panel.vue detail title (ไม่ใช่ rule code จาก backend)
  ['gold.stageDetailTitle', { name: 'ฝัง' }]
]

describe('gold i18n param interpolation (vue-i18n ตัวจริง)', () => {
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

// ยืนยัน end-to-end ว่า target record (scope='STAGE', workerType 60/80/90) แปลเป็นชื่อแผนกที่ถูกต้องจริง —
// ยืนยันจาก API agent (ตรวจ ProductionInsightRuleEngine.cs): 60=rawPolish(ขัดดิบ)/80=setting(ฝัง)/
// 90=plating(ขัดชุบ) — resolveStageTargetDeptKey แปลงเป็น string key แล้ว view.executive.department.* (ที่
// ยืม i18n instance ของ executive th.js เข้ามาในเทสนี้) แปลเป็นชื่อไทยสุดท้าย
describe('STAGE target workerType (60/80/90) label resolution end-to-end', () => {
  const expected = { 60: 'ขัดดิบ', 80: 'ฝัง', 90: 'ขัดชุบ' }

  STAGE_TARGET_WORKER_TYPE_ORDER.forEach((workerType) => {
    it(`workerType ${workerType} resolves to "${expected[workerType]}"`, () => {
      const deptKey = resolveStageTargetDeptKey(workerType)
      expect(t(`view.executive.department.${deptKey}`)).toBe(expected[workerType])
    })
  })
})
