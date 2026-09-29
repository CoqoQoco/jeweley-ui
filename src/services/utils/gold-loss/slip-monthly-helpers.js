// slip-monthly-helpers.js — pure logic ของกราฟ Gold Loss จากใบ (SLIP) — สกัดออกมาจาก
// gold-loss-dashboard/components/overview-tab-view.vue แบบ verbatim (ไม่เปลี่ยนสูตรคำนวณ) เพื่อให้
// ใช้ร่วมกันได้ทั้ง gold-loss-dashboard (ต้นทาง) และหน้าภาพรวมผู้บริหาร /executive (ผู้ใช้ใหม่)
//
// "เกณฑ์ในใบ" (threshold%) = Σ allowed / Σ allowedBase × 100 (ถ่วงน้ำหนักตามน้ำหนักทอง ไม่ใช่ค่าเฉลี่ยตรงๆ —
// ยืนยันแล้วบน prod: เฉลี่ยตรงๆ 3.06% vs ถ่วงน้ำหนัก 2.48%) ช่างแต่ง: allowed=totalAllowedLoss,
// allowedBase=totalAllowedLossBase; ช่างฝัง: allowed=totalWeightLossAllowed, allowedBase=totalWeightCheck
import dayjs from 'dayjs'

export function computeLossPercent(loss, issued) {
  return issued ? Math.round((loss / issued) * 100 * 100) / 100 : 0
}

export function computeThresholdPercent(allowed, allowedBase) {
  return allowedBase > 0 ? Math.round((allowed / allowedBase) * 100 * 100) / 100 : null
}

export function roundDecimal(value) {
  return Math.round((value || 0) * 100) / 100
}

export function monthKeyOf(year, month) {
  return `${year}-${String(month).padStart(2, '0')}`
}

// สร้างรายเดือนแบบเต็มช่วง (รวมเดือนที่ไม่มีใบ)
export function buildMonthRange(startDate, endDate) {
  const months = []
  let cursor = dayjs(startDate).startOf('month')
  const last = dayjs(endDate).startOf('month')
  let guard = 0
  while (cursor.valueOf() <= last.valueOf() && guard < 120) {
    months.push({ year: cursor.year(), month: cursor.month() + 1 })
    cursor = cursor.add(1, 'month')
    guard += 1
  }
  return months
}

// map field ของ endpoint ช่างแต่ง (Worker/ReportGoldLossTangByWorker) ให้เป็น shape กลาง
export function normalizeTangRow(row) {
  return {
    workerCode: row.workerCode,
    workerName: row.workerName,
    year: row.year,
    month: row.month,
    slipCount: row.slipCount || 0,
    issued: row.totalIssued || 0,
    returned: row.totalReturned || 0,
    loss: row.totalRawLoss || 0,
    allowed: row.totalAllowedLoss || 0,
    allowedBase: row.totalAllowedLossBase || 0
  }
}

// ฝั่งช่างฝัง (Worker/ReportGoldLossSlipByWorker) ไม่มีฟิลด์ loss ตรงๆ ต้องคำนวณจาก
// totalWeightSend - totalWeightCheck เอง
export function normalizeSetterRow(row) {
  const issued = row.totalWeightSend || 0
  const returned = row.totalWeightCheck || 0
  return {
    workerCode: row.workerCode,
    workerName: row.workerName,
    year: row.year,
    month: row.month,
    slipCount: row.slipCount || 0,
    issued,
    returned,
    loss: issued - returned,
    allowed: row.totalWeightLossAllowed || 0,
    allowedBase: returned
  }
}

// รวมยอดรายเดือน (ข้ามช่าง) — ใช้กับ rows ที่ normalize แล้ว (shape กลาง)
export function aggregateMonthlyTotals(rows) {
  const map = new Map()
  rows.forEach((r) => {
    const key = monthKeyOf(r.year, r.month)
    const acc = map.get(key) || { issued: 0, loss: 0, allowed: 0, allowedBase: 0, slipCount: 0 }
    acc.issued += r.issued
    acc.loss += r.loss
    acc.allowed += r.allowed
    acc.allowedBase += r.allowedBase
    acc.slipCount += r.slipCount
    map.set(key, acc)
  })
  return map
}

// รวมยอดทั้งชุด (ไม่แยกเดือน/ช่าง) — ใช้คำนวณ KPI ต่อแผนก
export function combineTotals(rows) {
  return rows.reduce(
    (acc, r) => {
      acc.slipCount += r.slipCount
      acc.issued += r.issued
      acc.returned += r.returned
      acc.loss += r.loss
      acc.allowed += r.allowed
      acc.allowedBase += r.allowedBase
      return acc
    },
    { slipCount: 0, issued: 0, returned: 0, loss: 0, allowed: 0, allowedBase: 0 }
  )
}

export function buildDeptKpi(rows) {
  const totals = combineTotals(rows)
  return {
    ...totals,
    lossPercent: computeLossPercent(totals.loss, totals.issued),
    thresholdPercent: computeThresholdPercent(totals.allowed, totals.allowedBase)
  }
}

// รวมยอดช่วงทั้งหมดต่อ 1 ช่าง เรียงมากไปน้อยตาม loss — ต้นทางเดียวกันของทั้งกราฟอันดับ (top N + "อื่นๆ")
// และ Excel export รายช่าง (ไม่ตัด N) จึงต้องมี totalIssued ติดมาด้วยแม้กราฟจะไม่ได้ใช้ก็ตาม
export function sumWorkerTotals(rows) {
  const map = new Map()
  rows.forEach((r) => {
    const acc = map.get(r.workerCode) || {
      workerCode: r.workerCode,
      workerName: r.workerName,
      totalIssued: 0,
      totalLoss: 0,
      totalAllowed: 0,
      totalAllowedBase: 0
    }
    acc.totalIssued += r.issued
    acc.totalLoss += r.loss
    acc.totalAllowed += r.allowed
    acc.totalAllowedBase += r.allowedBase
    map.set(r.workerCode, acc)
  })
  return [...map.values()].sort((a, b) => b.totalLoss - a.totalLoss)
}

// อันดับ loss ต่อช่าง (สำหรับกราฟ) — ตัดที่ maxBars แถวแรก ที่เหลือรวมเป็น 1 แถว "อื่นๆ" (otherLabel ต้อง resolve จาก $t มาก่อน)
export function buildWorkerRankingRows(rows, { maxBars = 12, otherLabel = '' } = {}) {
  const totals = sumWorkerTotals(rows)
  const top = totals.slice(0, maxBars).map((w) => ({
    label: `${w.workerCode} ${w.workerName}`,
    loss: roundDecimal(w.totalLoss),
    allowed: roundDecimal(w.totalAllowed),
    thresholdPercent: computeThresholdPercent(w.totalAllowed, w.totalAllowedBase)
  }))

  if (totals.length > maxBars) {
    const otherTotals = totals.slice(maxBars).reduce(
      (acc, w) => {
        acc.loss += w.totalLoss
        acc.allowed += w.totalAllowed
        acc.allowedBase += w.totalAllowedBase
        return acc
      },
      { loss: 0, allowed: 0, allowedBase: 0 }
    )
    top.push({
      label: otherLabel,
      loss: roundDecimal(otherTotals.loss),
      allowed: roundDecimal(otherTotals.allowed),
      thresholdPercent: computeThresholdPercent(otherTotals.allowed, otherTotals.allowedBase)
    })
  }

  return top
}

// กันเส้นยอมให้ (goal marker) และ value label โผล่นอกกรอบแกนของกราฟอันดับ
export function calcWorkerRankingXaxisMax(rankingRows) {
  const values = rankingRows.flatMap((r) => [r.loss || 0, r.allowed || 0])
  const max = values.length ? Math.max(...values) : 0
  return max > 0 ? Math.ceil(max * 1.25) : undefined
}

// ความสูงกราฟอันดับต่อ 1 แท่ง (px) — ให้พอดีกับจำนวนช่าง
export function calcWorkerRankingChartHeight(rankingRows, { minHeight = 200, rowHeight = 34 } = {}) {
  return Math.max(minHeight, rankingRows.length * rowHeight + 60)
}

// slice rows (shape กลาง มี year/month) ด้วยรายการ monthKey ที่อนุญาต — ใช้กับ range toggle
// (เดือนนี้/3 เดือน) ฝั่งภาพรวมผู้บริหาร โดยไม่ยิง endpoint ซ้ำ
export function filterRowsByMonthKeys(rows, monthKeys) {
  const allowed = new Set(monthKeys)
  return rows.filter((r) => allowed.has(monthKeyOf(r.year, r.month)))
}

export function formatDecimalTH(value) {
  return new Intl.NumberFormat('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value || 0)
}

export function formatPercentTH(value) {
  return `${formatDecimalTH(value)}%`
}
