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
