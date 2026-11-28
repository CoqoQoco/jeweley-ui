import { describe, it, expect } from 'vitest'

import { buildCheckItems, buildDuplicateRows } from './duplicate-outbound-helpers.js'

const plan = { wo: '6911008', woNumber: '13' }
const gems = [
  {
    code: 'SD0109',
    gemsOutbound: [
      { productionPlan: plan, issueQty: 6, issueQtyWeight: 0.16, isAlreadyOutbound: false },
      { productionPlan: plan, issueQty: 1, issueQtyWeight: 0.02, isAlreadyOutbound: false },
      { productionPlan: { wo: 'OLD', woNumber: '1' }, issueQty: 3, issueQtyWeight: 1, isAlreadyOutbound: true },
      { productionPlan: null, issueQty: 1, issueQtyWeight: 1, isAlreadyOutbound: false }
    ]
  },
  { code: 'NO-OUT' }
]

describe('buildCheckItems', () => {
  it('เฉพาะแถวใหม่ที่เลือกใบงานแล้ว และไม่ซ้ำ', () => {
    expect(buildCheckItems(gems)).toEqual([{ code: 'SD0109', wo: '6911008', woNumber: '13' }])
  })
})

describe('buildDuplicateRows', () => {
  it('รวมเบิกเดิมกับยอดครั้งนี้', () => {
    const rows = buildDuplicateRows(gems, [
      { code: 'SD0109', wo: '6911008', woNumber: '13', outboundRunning: 'PIO1', outboundDate: 'd', qty: 6, weight: 0.16 }
    ])
    expect(rows).toHaveLength(1)
    expect(rows[0].plan).toBe('6911008-13')
    expect(rows[0].previous).toHaveLength(1)
    expect(rows[0].nowQty).toBe(7)
    expect(rows[0].nowWeight).toBeCloseTo(0.18)
  })
  it('ไม่มีรายการซ้ำ = ว่าง', () => {
    expect(buildDuplicateRows(gems, [])).toEqual([])
  })
})
