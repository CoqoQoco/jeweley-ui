// capacity-i18n.spec.js — เหมือน gold-i18n.spec.js/delivery-i18n.spec.js: ยิง interpolate ข้อความหมวด
// "กำลังการผลิต" ด้วย vue-i18n จริง (ไม่ mock) ตรวจว่าทุก {placeholder} ที่ template ประกาศไว้ถูกแทนค่าจริง
// ครบ ไม่เหลือ "{"/"}" และไม่มีช่องว่างจากตัวเลขหาย — กันบั๊กชื่อ param ไม่ตรงแบบเดียวกับที่เจอในหมวด
// delivery/gold
//
// ชื่อ param ด้านล่างตรงกับ final contract ที่ API agent ส่งมา — deptKey resolve ผ่าน translateDept (เหมือน
// wip) ก่อนเข้า $t() เสมอ ส่วน depts[]/peakMonth ผ่าน resolveFindingParams (formatDeptQueueList/
// formatThaiMonthYear) ก่อนแล้วเช่นกัน — เทสนี้ส่งเป็นสตริงที่แปลงแล้วตรงๆ (มี spec ของตัวเองใน
// insight-helpers.spec.js)
import { describe, it, expect } from 'vitest'
import { createI18n } from 'vue-i18n'

import th from './th.js'
import { resolveFindingParams, formatUnitLabel } from '@/components/insight/insight-helpers.js'

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

// ค่าพารามิเตอร์ตาม final contract จาก API agent
const cases = [
  ['rules.CAP_BACKLOG_MONTHS', { backlogMonths: 2.5, activeWip: 320, outputPerMonth: 128 }],
  // depts[] ถูก formatDeptQueueList ก่อนเข้า $t() แล้ว (ดู insight-helpers.spec.js) — จำลองสตริงที่แปลงแล้ว
  ['rules.CAP_QUEUE_BOTTLENECK', { depts: 'แต่ง ~37 วัน (รอ 180 ใบ), บัตรต้นทุน ~35 วัน (รอ 105 ใบ)' }],
  // peakMonth ถูก formatThaiMonthYear ก่อนเข้า $t() แล้ว (ดู insight-helpers.spec.js)
  ['rules.CAP_INFLOW_OVER_OUTPUT', { overloadMonths: 4, monthsInRange: 6, peakMonth: 'มิ.ย. 2026', peakInflow: 210, outputPerMonth: 128 }],
  // pendingActive มาแทน pendingOver30d ใน rule text แล้ว (ยืนยันจาก API agent 2026-10-01 — ตัวเลข pendingOver30d
  // ยังอยู่ใน costCardToDone เดิม แต่ไม่ได้ฝังในประโยคนี้แล้ว)
  ['rules.CAP_COSTCARD_SLOW', { medianDays: 12, p90Days: 28, pendingNow: 15, pendingActive: 11 }],
  ['rules.FC_BACKLOG_PROJECTED', { projectedWip: 420, months: 3, netPerMonth: 35 }],
  ['rules.FC_PEAK_RISK', { peakMonth: 'มิ.ย. 2026', peakInflow: 210, extraQueueDays: 8 }],
  ['rules.ACT_ADD_WORKER', { deptKey: 'ช่างแต่ง', workersNow: 4, queueDaysNow: 37, queueDaysPlusOne: 29 }],
  ['rules.ACT_SPEED_COSTCARD', { pendingActive: 11, pendingNow: 15, medianDays: 12 }],
  ['rules.ACT_CLEAN_STALE', { staleWip: 9 }],
  ['rules.ACT_SMOOTH_INFLOW', { outputPerMonth: 128 }],
  // KPI/what-if templates ของ capacity-kpi-group.vue/capacity-whatif-panel.vue (ไม่ใช่ rule code จาก backend)
  ['capacity.kpiInflowSub', { pieces: 450 }],
  ['capacity.kpiNetSubUp', { amount: 40, unit: 'ใบ' }],
  ['capacity.kpiNetSubDown', { amount: 40, unit: 'ชิ้น' }],
  ['capacity.kpiBacklogSub', { activeWip: 320, unit: 'ใบ' }],
  ['capacity.kpiInflowSubPlans', { plans: 90 }],
  ['rules.CAP_GROUP_BACKLOG_GROWING', { name: 'แหวน', by: 'ประเภทสินค้า', months: 3, addedPieces: '120', unit: 'คู่' }],
  ['capacity.breakdownChartTitle', { by: 'ทอง' }],
  ['capacity.kpiBottleneckDeptItem', { name: 'ช่างแต่ง', days: 37 }],
  ['capacity.kpiCostCardSub', { p90: 28, pending: 15 }],
  ['capacity.deptDetailTitle', { name: 'ช่างแต่ง' }],
  ['capacity.whatIfTotalQueueDays', { now: '80 วัน', new: '55 วัน' }],
  ['capacity.whatIfTotalBottleneck', { now: 'ช่างแต่ง', new: 'ฝังพลอย' }],
  // excludedDeptLabels มาจาก view.executive.department.* ต่อกันแล้วก่อนเข้า $t() (ดู capacity-whatif-panel.vue)
  ['capacity.whatIfExcludedNote', { depts: 'ออกแบบ, บัตรต้นทุน' }],
  // pendingActive/pendingStale เป็น field ใหม่ที่ API ยังไม่ส่งมาครบทุก response (nullable) — ตอนมีค่าโชว์
  // breakdown นี้ใต้ตัวเลข "ค้างอยู่ตอนนี้" ของ capacity-costcard-panel.vue
  ['capacity.costCardPendingBreakdown', { active: '11', stale: '4' }]
]

describe('capacity i18n param interpolation (vue-i18n ตัวจริง)', () => {
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

describe('CAP_GROUP_BACKLOG_GROWING end-to-end (resolveFindingParams + vue-i18n)', () => {
  const translateBy = (value, kind = 'by') => (kind === 'unit' ? formatUnitLabel(value, t) : t(`view.productionInsight.capacity.breakdownBy.${value}`))
  const render = (params) => t('view.productionInsight.rules.CAP_GROUP_BACKLOG_GROWING', resolveFindingParams(params, undefined, undefined, undefined, undefined, translateBy))

  it('renders the example sentence with the translated dimension and unit', () => {
    expect(render({ by: 'productType', key: 'RING', name: 'แหวน', months: 3, addedPieces: 120, unit: 'คู่' })).toBe(
      'แหวน (ประเภทสินค้า) งานเข้ามากกว่าผลิตออก 3 เดือนติด งานค้างเพิ่ม 120 คู่'
    )
  })

  it('translates by for gold / goldSize and unit "mixed" to ชิ้น/คู่, and groups thousands in addedPieces', () => {
    const text = render({ by: 'goldSize', key: '16', name: '16', months: 4, addedPieces: 12345, unit: 'mixed' })
    expect(text).toContain('(Gold size)')
    expect(text).toContain('12,345 ชิ้น/คู่')
    expect(render({ by: 'gold', key: 'YG', name: 'YG', months: 2, addedPieces: 5, unit: 'เส้น' })).toContain('(ทอง)')
  })

  it('translates raw plan unit codes PC./PR. into ชิ้น/คู่ in the sentence', () => {
    expect(render({ by: 'productType', key: 'R', name: 'แหวน', months: 3, addedPieces: 10, unit: 'PR.' })).toContain('10 คู่')
    expect(render({ by: 'productType', key: 'N', name: 'สร้อย', months: 3, addedPieces: 10, unit: 'PC.' })).toContain('10 ชิ้น')
  })
})
