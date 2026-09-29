// safety net — ตรวจ pure logic ที่สกัดมาจาก overview-tab-view.vue (verbatim) ด้วยค่าที่คำนวณมือไว้ล่วงหน้า
// ก่อน refactor ใดๆ ทั้งใน overview-tab-view.vue หรือ gold-loss-trend-view.vue (executive) — ถ้าตัวเลขที่นี่
// ยังผ่านหลัง refactor แปลว่าคณิตศาสตร์เดิมไม่เปลี่ยน (ทั้งสองหน้าถูกบังคับให้เรียก helper ชุดเดียวกัน)
import { describe, it, expect } from 'vitest'

import {
  computeLossPercent,
  computeThresholdPercent,
  roundDecimal,
  monthKeyOf,
  buildMonthRange,
  normalizeTangRow,
  normalizeSetterRow,
  aggregateMonthlyTotals,
  combineTotals,
  buildDeptKpi,
  sumWorkerTotals,
  buildWorkerRankingRows,
  calcWorkerRankingXaxisMax,
  calcWorkerRankingChartHeight,
  filterRowsByMonthKeys,
  formatDecimalTH,
  formatPercentTH
} from './slip-monthly-helpers.js'

// ---- fixtures: ช่างแต่ง (raw API shape ของ Worker/ReportGoldLossTangByWorker) ----
const RAW_TANG_ROWS = [
  { workerCode: 'A', workerName: 'Worker A', year: 2026, month: 7, slipCount: 2, totalIssued: 1000, totalReturned: 990, totalRawLoss: 10, totalAllowedLoss: 15, totalAllowedLossBase: 1000 },
  { workerCode: 'A', workerName: 'Worker A', year: 2026, month: 8, slipCount: 1, totalIssued: 800, totalReturned: 785, totalRawLoss: 15, totalAllowedLoss: 12, totalAllowedLossBase: 800 },
  { workerCode: 'B', workerName: 'Worker B', year: 2026, month: 8, slipCount: 1, totalIssued: 500, totalReturned: 495, totalRawLoss: 5, totalAllowedLoss: 7.5, totalAllowedLossBase: 500 },
  // edge case: ใบที่ไม่มีน้ำหนักจ่ายเลย (issued=0) — ต้องไม่ทำให้ %loss/threshold เพี้ยนเป็น NaN/Infinity
  { workerCode: 'C', workerName: 'Worker C', year: 2026, month: 8, slipCount: 1, totalIssued: 0, totalReturned: 0, totalRawLoss: 0, totalAllowedLoss: 0, totalAllowedLossBase: 0 }
]

// ---- fixtures: ช่างฝัง (raw API shape ของ Worker/ReportGoldLossSlipByWorker) ----
const RAW_SETTER_ROWS = [
  { workerCode: 'X', workerName: 'Worker X', year: 2026, month: 7, slipCount: 1, totalWeightSend: 200, totalWeightCheck: 198, totalWeightLossAllowed: 3 },
  { workerCode: 'X', workerName: 'Worker X', year: 2026, month: 8, slipCount: 1, totalWeightSend: 150, totalWeightCheck: 149.5, totalWeightLossAllowed: 2.25 },
  // edge case: ใบที่ไม่มีน้ำหนักส่งเลย (issued=0)
  { workerCode: 'Y', workerName: 'Worker Y', year: 2026, month: 8, slipCount: 1, totalWeightSend: 0, totalWeightCheck: 0, totalWeightLossAllowed: 0 }
]

describe('computeLossPercent', () => {
  it('คำนวณ %loss ปัด 2 ตำแหน่ง', () => {
    expect(computeLossPercent(10, 1000)).toBe(1)
    expect(computeLossPercent(20, 1300)).toBe(1.54)
    expect(computeLossPercent(0.5, 150)).toBe(0.33)
  })

  it('issued=0 (falsy) คืน 0 ไม่ใช่ NaN/Infinity', () => {
    expect(computeLossPercent(0, 0)).toBe(0)
  })
})

describe('computeThresholdPercent', () => {
  it('คำนวณเกณฑ์ในใบถ่วงน้ำหนัก ปัด 2 ตำแหน่ง', () => {
    expect(computeThresholdPercent(15, 1000)).toBe(1.5)
    expect(computeThresholdPercent(19.5, 1300)).toBe(1.5)
    expect(computeThresholdPercent(2.25, 149.5)).toBe(1.51)
  })

  it('allowedBase <= 0 คืน null (ยังไม่มีเกณฑ์ ไม่ใช่ 0)', () => {
    expect(computeThresholdPercent(0, 0)).toBeNull()
    expect(computeThresholdPercent(5, -1)).toBeNull()
  })
})

describe('roundDecimal', () => {
  it('ปัด 2 ตำแหน่ง และ null/undefined เป็น 0', () => {
    expect(roundDecimal(1.005001)).toBeCloseTo(1.01, 2)
    expect(roundDecimal(null)).toBe(0)
    expect(roundDecimal(undefined)).toBe(0)
  })
})

describe('monthKeyOf / buildMonthRange', () => {
  it('monthKeyOf ใส่ 0 นำหน้าเดือนเสมอ', () => {
    expect(monthKeyOf(2026, 7)).toBe('2026-07')
    expect(monthKeyOf(2026, 12)).toBe('2026-12')
  })

  it('buildMonthRange สร้างทุกเดือนรวมเดือนต้น/ท้าย', () => {
    expect(buildMonthRange('2026-07-15', '2026-09-02')).toEqual([
      { year: 2026, month: 7 },
      { year: 2026, month: 8 },
      { year: 2026, month: 9 }
    ])
  })
})

describe('normalizeTangRow / normalizeSetterRow', () => {
  it('normalizeTangRow map field ตรง (loss = totalRawLoss ตรงๆ)', () => {
    expect(normalizeTangRow(RAW_TANG_ROWS[0])).toEqual({
      workerCode: 'A',
      workerName: 'Worker A',
      year: 2026,
      month: 7,
      slipCount: 2,
      issued: 1000,
      returned: 990,
      loss: 10,
      allowed: 15,
      allowedBase: 1000
    })
  })

  it('normalizeSetterRow คำนวณ loss = issued - returned เอง (ไม่มีฟิลด์ loss ตรงๆ จาก API)', () => {
    expect(normalizeSetterRow(RAW_SETTER_ROWS[0])).toEqual({
      workerCode: 'X',
      workerName: 'Worker X',
      year: 2026,
      month: 7,
      slipCount: 1,
      issued: 200,
      returned: 198,
      loss: 2,
      allowed: 3,
      allowedBase: 198
    })
  })

  it('edge case issued=0 ไม่พังทั้งสองฝั่ง', () => {
    expect(normalizeTangRow(RAW_TANG_ROWS[3]).loss).toBe(0)
    expect(normalizeSetterRow(RAW_SETTER_ROWS[2]).loss).toBe(0)
  })
})

describe('aggregateMonthlyTotals', () => {
  it('รวมยอดข้ามช่างต่อเดือนถูกต้อง (เดือนที่มีช่าง issued=0 ปนอยู่ด้วย)', () => {
    const rows = RAW_TANG_ROWS.map(normalizeTangRow)
    const totals = aggregateMonthlyTotals(rows)

    expect(totals.get('2026-07')).toEqual({ issued: 1000, loss: 10, allowed: 15, allowedBase: 1000, slipCount: 2 })
    expect(totals.get('2026-08')).toEqual({ issued: 1300, loss: 20, allowed: 19.5, allowedBase: 1300, slipCount: 3 })
  })
})

describe('buildDeptKpi', () => {
  it('รวมยอดทั้งช่วง + %loss + เกณฑ์ถ่วงน้ำหนัก', () => {
    const rows = RAW_TANG_ROWS.map(normalizeTangRow)
    expect(buildDeptKpi(rows)).toEqual({
      slipCount: 5,
      issued: 2300,
      returned: 2270,
      loss: 30,
      allowed: 34.5,
      allowedBase: 2300,
      lossPercent: 1.3,
      thresholdPercent: 1.5
    })
  })

  it('combineTotals อย่างเดียว (ไม่มี %) ตรงกับ totals ของ buildDeptKpi', () => {
    const rows = RAW_TANG_ROWS.map(normalizeTangRow)
    expect(combineTotals(rows)).toEqual({ slipCount: 5, issued: 2300, returned: 2270, loss: 30, allowed: 34.5, allowedBase: 2300 })
  })
})

describe('sumWorkerTotals', () => {
  it('รวมยอดทั้งช่วงต่อช่าง เรียง loss มากไปน้อย', () => {
    const rows = RAW_TANG_ROWS.map(normalizeTangRow)
    expect(sumWorkerTotals(rows)).toEqual([
      { workerCode: 'A', workerName: 'Worker A', totalIssued: 1800, totalLoss: 25, totalAllowed: 27, totalAllowedBase: 1800 },
      { workerCode: 'B', workerName: 'Worker B', totalIssued: 500, totalLoss: 5, totalAllowed: 7.5, totalAllowedBase: 500 },
      { workerCode: 'C', workerName: 'Worker C', totalIssued: 0, totalLoss: 0, totalAllowed: 0, totalAllowedBase: 0 }
    ])
  })
})

describe('buildWorkerRankingRows', () => {
  it('ไม่เกิน maxBars ไม่ต้องรวม "อื่นๆ"', () => {
    const rows = RAW_TANG_ROWS.map(normalizeTangRow)
    expect(buildWorkerRankingRows(rows, { maxBars: 12, otherLabel: 'อื่นๆ' })).toEqual([
      { label: 'A Worker A', loss: 25, allowed: 27, thresholdPercent: 1.5 },
      { label: 'B Worker B', loss: 5, allowed: 7.5, thresholdPercent: 1.5 },
      { label: 'C Worker C', loss: 0, allowed: 0, thresholdPercent: null }
    ])
  })

  it('เกิน maxBars รวมส่วนเกินเป็นแถว "อื่นๆ" แถวเดียว', () => {
    const rows = RAW_TANG_ROWS.map(normalizeTangRow)
    const result = buildWorkerRankingRows(rows, { maxBars: 2, otherLabel: 'อื่นๆ' })
    expect(result).toEqual([
      { label: 'A Worker A', loss: 25, allowed: 27, thresholdPercent: 1.5 },
      { label: 'B Worker B', loss: 5, allowed: 7.5, thresholdPercent: 1.5 },
      { label: 'อื่นๆ', loss: 0, allowed: 0, thresholdPercent: null }
    ])
  })
})

describe('calcWorkerRankingXaxisMax / calcWorkerRankingChartHeight', () => {
  const rankingRows = buildWorkerRankingRows(RAW_TANG_ROWS.map(normalizeTangRow), { maxBars: 12, otherLabel: 'อื่นๆ' })

  it('xaxis max = ceil(max(loss,allowed) * 1.25)', () => {
    expect(calcWorkerRankingXaxisMax(rankingRows)).toBe(34)
  })

  it('xaxis max = undefined เมื่อไม่มีแถวเลย', () => {
    expect(calcWorkerRankingXaxisMax([])).toBeUndefined()
  })

  it('chart height ใช้ min height เมื่อจำนวนแถวน้อย', () => {
    expect(calcWorkerRankingChartHeight(rankingRows, { minHeight: 200, rowHeight: 34 })).toBe(200)
  })

  it('chart height โตตามจำนวนแถวเมื่อเกิน min height', () => {
    const manyRows = Array.from({ length: 10 }, (_, i) => ({ label: `w${i}`, loss: 1, allowed: 1, thresholdPercent: null }))
    expect(calcWorkerRankingChartHeight(manyRows, { minHeight: 200, rowHeight: 34 })).toBe(10 * 34 + 60)
  })
})

describe('filterRowsByMonthKeys', () => {
  it('กรองเฉพาะเดือนที่อยู่ใน monthKeys ที่ระบุ', () => {
    const rows = RAW_TANG_ROWS.map(normalizeTangRow)
    const filtered = filterRowsByMonthKeys(rows, ['2026-08'])
    expect(filtered.map((r) => r.workerCode).sort()).toEqual(['A', 'B', 'C'])
    expect(filtered.every((r) => r.month === 8)).toBe(true)
  })

  it('ไม่มี monthKey ตรงเลย คืน array ว่าง', () => {
    const rows = RAW_TANG_ROWS.map(normalizeTangRow)
    expect(filterRowsByMonthKeys(rows, ['2025-01'])).toEqual([])
  })
})

describe('formatDecimalTH / formatPercentTH', () => {
  it('ใส่ comma คั่นหลักพัน + ทศนิยม 2 ตำแหน่งเสมอ', () => {
    expect(formatDecimalTH(1234.5)).toBe('1,234.50')
    expect(formatDecimalTH(0)).toBe('0.00')
    expect(formatDecimalTH(null)).toBe('0.00')
  })

  it('formatPercentTH ต่อ % ท้าย formatDecimalTH', () => {
    expect(formatPercentTH(1.5)).toBe('1.50%')
  })
})
