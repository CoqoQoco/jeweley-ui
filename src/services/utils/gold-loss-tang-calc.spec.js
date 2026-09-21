import { describe, it, expect } from 'vitest'
import { calcGoldLossTang } from './gold-loss-tang-calc.js'

describe('calcGoldLossTang', () => {
  it('ตัวอย่าง verified จาก doc comment เดิม (ไม่มีรายการติ๊ก countInLoss) — lossBase = jobReturnedSum เหมือนเดิม', () => {
    const jobs = [{ goldWeightSend: 131.42, goldWeightCheck: 103.33 }]
    const returnedLines = [{ name: 'เศษทอง', weight: 26.37, countInCalc: true }]
    const calc = calcGoldLossTang(jobs, [], returnedLines, 3, 40)

    expect(calc.issuedTotal).toBeCloseTo(131.42, 4)
    expect(calc.returnedTotal).toBeCloseTo(129.70, 4)
    expect(calc.rawLoss).toBeCloseTo(1.72, 4)
    expect(calc.net).toBeCloseTo(-1.72, 4)
    expect(calc.lossBase).toBeCloseTo(103.33, 4)
    expect(calc.allowedLoss).toBeCloseTo(3.0999, 4)
    expect(calc.diffLoss).toBeCloseTo(1.3799, 4)
    expect(calc.money).toBeCloseTo(55.20, 2)
  })

  it('ไม่มี job, งานซ่อม/งานส่งติ๊ก countInLoss:true เข้าฐาน %Loss ส่วนอีกรายการไม่ติ๊ก', () => {
    const issuedLines = [{ name: 'ส่งงานซ่อมใส่ห่วง', weight: 176.99, countInCalc: true }]
    const returnedLines = [
      { name: 'ส่งงานซ่อมใส่ห่วง', weight: 158.20, countInCalc: true, countInLoss: true },
      { name: 'เศษทอง', weight: 16.25, countInCalc: true, countInLoss: false }
    ]
    const calc = calcGoldLossTang([], issuedLines, returnedLines, 3, 2300)

    expect(calc.returnedTotal).toBeCloseTo(174.45, 4)
    expect(calc.rawLoss).toBeCloseTo(2.54, 4)
    expect(calc.lossBase).toBeCloseTo(158.20, 4)
    expect(calc.allowedLoss).toBeCloseTo(4.746, 4)
    expect(calc.diffLoss).toBeCloseTo(2.206, 4)
    expect(calc.money).toBeCloseTo(5083, 0)
  })

  it('รายการ countInLoss:true แต่ countInCalc:false ต้องไม่ถูกนับเข้า lossBase', () => {
    const returnedLines = [
      { name: 'คืนตัวเรือนที่ไม่ได้ทำ', weight: 50, countInCalc: false, countInLoss: true }
    ]
    const calc = calcGoldLossTang([], [], returnedLines, 3, 100)

    expect(calc.lossBase).toBe(0)
    expect(calc.allowedLoss).toBe(0)
  })
})
