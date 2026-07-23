// forecast.js — คำนวณ "ประมาณการ" (frontend-only, ไม่ใช่ข้อมูลจริงจาก backend)
//
// ใช้กับ trend data รายวัน (เช่น dashboardStore.getTrends) เพื่อประมาณการยอดสิ้นเดือน
// ด้วยวิธี run-rate: ยอดสะสมของเดือนนี้ ÷ จำนวนวันที่ผ่านมา x จำนวนวันทั้งเดือน
//
// trends item ที่ต้องการ (field name ตาม TransactionTrend):
//   date, totalQuantityOut, totalQuantityWeightOut

import dayjs from 'dayjs'

const DEFAULT_MIN_DAYS_ELAPSED = 3

function roundValue(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

/**
 * @param {Array} trends - array ของ { date, totalQuantityOut, totalQuantityWeightOut, ... }
 * @param {Object} options - { minDaysElapsed, referenceDate }
 * @returns {Object} forecast result — { hasEnoughData: false, ... } เมื่อข้อมูลไม่พอ
 */
export function calculateMonthlyRunRateForecast(trends = [], options = {}) {
  const minDaysElapsed = options.minDaysElapsed ?? DEFAULT_MIN_DAYS_ELAPSED
  const referenceDate = options.referenceDate ? dayjs(options.referenceDate) : dayjs()

  const daysInMonth = referenceDate.daysInMonth()
  const daysElapsed = referenceDate.date()

  const currentMonthTrends = (trends || []).filter(
    (t) => t?.date && dayjs(t.date).isSame(referenceDate, 'month')
  )

  const hasEnoughData = currentMonthTrends.length > 0 && daysElapsed >= minDaysElapsed

  if (!hasEnoughData) {
    return {
      hasEnoughData: false,
      daysElapsed,
      daysInMonth,
      minDaysElapsed
    }
  }

  const dailyMap = new Map()
  currentMonthTrends.forEach((t) => {
    const day = dayjs(t.date).date()
    const prev = dailyMap.get(day) || { qty: 0, weight: 0 }
    dailyMap.set(day, {
      qty: prev.qty + (t.totalQuantityOut || 0),
      weight: prev.weight + (t.totalQuantityWeightOut || 0)
    })
  })

  let actualQuantityOut = 0
  let actualWeightOut = 0
  for (let day = 1; day <= daysElapsed; day++) {
    const entry = dailyMap.get(day)
    actualQuantityOut += entry?.qty || 0
    actualWeightOut += entry?.weight || 0
  }

  const dailyAvgQuantityOut = actualQuantityOut / daysElapsed
  const dailyAvgWeightOut = actualWeightOut / daysElapsed
  const forecastQuantityOut = dailyAvgQuantityOut * daysInMonth
  const forecastWeightOut = dailyAvgWeightOut * daysInMonth

  const categories = []
  const actualSeriesData = []
  const forecastSeriesData = []
  let runningQty = 0

  for (let day = 1; day <= daysInMonth; day++) {
    categories.push(referenceDate.date(day).format('DD/MM'))

    if (day <= daysElapsed) {
      const entry = dailyMap.get(day)
      runningQty += entry?.qty || 0
      actualSeriesData.push(roundValue(runningQty))
      forecastSeriesData.push(day === daysElapsed ? roundValue(runningQty) : null)
    } else {
      actualSeriesData.push(null)
      forecastSeriesData.push(roundValue(dailyAvgQuantityOut * day))
    }
  }

  return {
    hasEnoughData: true,
    daysElapsed,
    daysInMonth,
    minDaysElapsed,
    actualQuantityOut,
    actualWeightOut,
    dailyAvgQuantityOut,
    dailyAvgWeightOut,
    forecastQuantityOut,
    forecastWeightOut,
    categories,
    actualSeriesData,
    forecastSeriesData
  }
}

// projectMonthlySeries — ประมาณการ time-series รายเดือน (เช่น ค่าแรงรวม/เดือน) จาก series หลายจุด
//
// วิธีเลือก method:
//   - จุดข้อมูล >= 3 เดือน → linear trend (least-squares) บน index ของเดือน
//   - จุดข้อมูล = 2 เดือน  → moving average (เฉลี่ยจากจุดที่มี)
//   - จุดข้อมูล < 2 เดือน  → hasEnoughData: false (ข้อมูลไม่พอ ห้ามมโนตัวเลข)

const DEFAULT_TREND_MIN_POINTS = 3
const DEFAULT_MA_WINDOW = 3
const DEFAULT_FORECAST_MONTHS = 1

function nextYm(ym) {
  return dayjs(`${ym}-01`).add(1, 'month').format('YYYY-MM')
}

/**
 * @param {Array} points - array ของ { ym: 'YYYY-MM', value: number } เรียงจากเก่าไปใหม่
 * @param {Object} options - { monthsAhead, maWindow }
 * @returns {Object} { hasEnoughData, method, monthsUsed, projectedPoints: [{ ym, value }] }
 */
export function projectMonthlySeries(points = [], options = {}) {
  const monthsAhead = options.monthsAhead ?? DEFAULT_FORECAST_MONTHS
  const maWindow = options.maWindow ?? DEFAULT_MA_WINDOW

  const valid = (points || []).filter((p) => p && p.ym && Number.isFinite(p.value))

  if (valid.length < 2) {
    return { hasEnoughData: false, method: null, monthsUsed: valid.length, projectedPoints: [] }
  }

  const useTrend = valid.length >= DEFAULT_TREND_MIN_POINTS
  const method = useTrend ? 'linear-trend' : 'moving-average'
  const monthsUsed = useTrend ? valid.length : Math.min(maWindow, valid.length)

  const projectedPoints = []
  let lastYm = valid[valid.length - 1].ym

  if (useTrend) {
    const n = valid.length
    const xs = valid.map((_, i) => i)
    const ys = valid.map((p) => p.value)
    const sumX = xs.reduce((a, x) => a + x, 0)
    const sumY = ys.reduce((a, y) => a + y, 0)
    const sumXY = xs.reduce((a, x, i) => a + x * ys[i], 0)
    const sumXX = xs.reduce((a, x) => a + x * x, 0)
    const denom = n * sumXX - sumX * sumX
    const slope = denom !== 0 ? (n * sumXY - sumX * sumY) / denom : 0
    const intercept = (sumY - slope * sumX) / n

    for (let i = 1; i <= monthsAhead; i++) {
      const x = n - 1 + i
      const value = Math.max(0, roundValue(intercept + slope * x))
      lastYm = nextYm(lastYm)
      projectedPoints.push({ ym: lastYm, value })
    }
  } else {
    const window = valid.slice(-monthsUsed)
    const avg = window.reduce((a, p) => a + p.value, 0) / window.length

    for (let i = 1; i <= monthsAhead; i++) {
      lastYm = nextYm(lastYm)
      projectedPoints.push({ ym: lastYm, value: roundValue(Math.max(0, avg)) })
    }
  }

  return { hasEnoughData: true, method, monthsUsed, projectedPoints }
}
