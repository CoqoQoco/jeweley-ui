/**
 * cost-check-calc.js
 * ฟังก์ชันคำนวณล้วน (pure functions) สำหรับ "ใบตรวจสอบต้นทุน" — เอกสารภายในเทียบต้นทุนกับราคาขาย
 * ก่อนส่งใบเสนอราคาให้ลูกค้า ห้าม import pdfmake ในไฟล์นี้ (แยกส่วนคำนวณออกจากส่วนวาด PDF)
 *
 * หลักการ: ไม่ปัดเศษระหว่างทาง (เหมือน money.js) — ปัดเฉพาะตอนแสดงผลในชั้น pdf-builder เท่านั้น
 * ทุกสูตรที่แตะราคาขาย/currency ต้องใช้ helper จาก money.js ตัวเดียวกับที่หน้าจอใบเสนอราคาใช้
 * (convertedUnitPrice, computeDocumentTotals) เพื่อให้ตัวเลขตรงกับที่ user เห็นบนจอเป๊ะ
 */

import { computeDocumentTotals, convertedUnitPrice } from '@/services/utils/money.js'

// เกณฑ์ "กำไรต่ำ" ค่าเริ่มต้น — export ไว้ให้ pdf-builder/ผู้เรียกอื่นปรับ threshold ได้โดยไม่ต้อง hardcode ซ้ำ
export const LOW_MARGIN_THRESHOLD_PERCENT = 15

// กลุ่มต้นทุนที่คาดหวังว่าจะมีครบเมื่อดึงข้อมูลมาจาก "เวอร์ชันต้นทุน" (cost version)
const COST_VERSION_EXPECTED_GROUPS = ['Gold', 'Worker', 'Embed', 'Gem']

function normalizeGroup(group) {
  return String(group || '').trim().toLowerCase()
}

/**
 * จัดกลุ่ม priceTransactions ตาม nameGroup — ใช้ร่วมกันทั้งการคำนวณ (partial cost version check)
 * และการวาดตารางต้นทุนในรายละเอียดแต่ละชิ้นบน PDF
 * @param {Array} priceTransactions
 * @returns {{Gold: Array, Worker: Array, Embed: Array, Gem: Array, ETC: Array}}
 */
export function groupPriceTransactionsByGroup(priceTransactions) {
  const groups = { Gold: [], Worker: [], Embed: [], Gem: [], ETC: [] }
  ;(Array.isArray(priceTransactions) ? priceTransactions : []).forEach((t) => {
    const normalized = normalizeGroup(t?.nameGroup)
    if (normalized === 'gold') groups.Gold.push(t)
    else if (normalized === 'worker') groups.Worker.push(t)
    else if (normalized === 'embed') groups.Embed.push(t)
    else if (normalized === 'gem') groups.Gem.push(t)
    else groups.ETC.push(t)
  })
  return groups
}

/**
 * ต้นทุนต่อหน่วยของ 1 รายการ = ผลรวม totalPrice ของทุกแถวใน priceTransactions (หน่วย THB)
 * @param {Object} item
 * @returns {number}
 */
export function calcItemCost(item) {
  const transactions = Array.isArray(item?.priceTransactions) ? item.priceTransactions : []
  return transactions.reduce((sum, t) => sum + (Number(t?.totalPrice) || 0), 0)
}

// รายชื่อกลุ่มที่ยังขาดเมื่อดึงจาก cost version — คืน null เมื่อไม่ใช่ cost version หรือมีครบ
function checkPartialCostVersionGroups(item) {
  if (item?.source !== 'costVersion') return null
  const transactions = Array.isArray(item?.priceTransactions) ? item.priceTransactions : []
  const presentGroups = new Set(transactions.map((t) => normalizeGroup(t?.nameGroup)))
  const missing = COST_VERSION_EXPECTED_GROUPS.filter((g) => !presentGroups.has(normalizeGroup(g)))
  return missing.length ? missing : null
}

// รูปแบบตัวเลขสำหรับข้อความ warning เท่านั้น (ไม่กระทบการคำนวณ) — 2 ตำแหน่งทศนิยม คั่นหลักพัน
function formatThb(value) {
  const num = Number(value) || 0
  return num.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

/**
 * ประเมิน warning ของ 1 รายการ ตามลำดับความสำคัญ:
 * - NO_COST: ไม่มีต้นทุนเลย (ทำให้ตัวเลขอื่นๆ ที่อิงต้นทุนไม่มีความหมาย จึงข้ามเช็คส่วนอื่นทั้งหมด)
 * - LOSS: ขาดทุน (สุทธิ < ต้นทุน) — ถ้าเข้าเงื่อนไขนี้แล้วไม่ต้องเตือน LOW_MARGIN ซ้ำ (กำไรติดลบสื่อความรุนแรงกว่าอยู่แล้ว)
 * - LOW_MARGIN: กำไรเป็นบวกแต่ต่ำกว่า threshold
 * - APPRAISAL_MISMATCH: ราคาตั้งขายที่บันทึกไว้ ไม่ตรงกับ ต้นทุน×มาร์กอัป เกินเกณฑ์ (max(1 บาท, 0.1% ของราคาที่คาดหวัง)
 *   เผื่อ rounding drift ปกติของรายการที่ยอดใหญ่ — ไม่ใช่แค่ค่าคงที่ 1 บาทตายตัว)
 * - PARTIAL_COST_VERSION: ดึงต้นทุนมาจาก cost version แต่ไม่ครบทุกกลุ่ม (Gold/Worker/Embed/Gem)
 */
function buildItemWarnings({ item, cost, netThb, profitPct, appraisal, expectedAppraisal, lowMarginThreshold }) {
  const warnings = []
  const noCost = !(cost > 0)

  if (noCost) {
    warnings.push({
      code: 'NO_COST',
      severity: 'orange',
      message: 'ไม่มีข้อมูลต้นทุน (ไม่มีรายการต้นทุน หรือต้นทุนรวมเป็น 0)'
    })
  } else {
    if (netThb < cost) {
      warnings.push({
        code: 'LOSS',
        severity: 'red',
        message: 'ขาดทุน: ราคาขายสุทธิต่ำกว่าต้นทุน'
      })
    } else if (profitPct < lowMarginThreshold / 100) {
      warnings.push({
        code: 'LOW_MARGIN',
        severity: 'orange',
        message: `กำไรต่ำกว่า ${lowMarginThreshold}%`
      })
    }

    // เกณฑ์แปรผันตามขนาดรายการ กันไม่ให้รายการยอดใหญ่ (เช่นหลักแสน) โดนเตือนจาก rounding drift ปกติ
    const mismatchTolerance = Math.max(1, expectedAppraisal * 0.001)
    if (Math.abs(appraisal - expectedAppraisal) > mismatchTolerance) {
      warnings.push({
        code: 'APPRAISAL_MISMATCH',
        severity: 'orange',
        message: `ราคาตั้งขาย ${formatThb(appraisal)} ไม่เท่ากับ ต้นทุน×มาร์กอัป ${formatThb(expectedAppraisal)}`
      })
    }
  }

  const missingGroups = noCost ? null : checkPartialCostVersionGroups(item)
  if (missingGroups) {
    warnings.push({
      code: 'PARTIAL_COST_VERSION',
      severity: 'orange',
      message: `ต้นทุนอาจไม่ครบ (ดึงจากเวอร์ชันต้นทุน แต่ไม่มีกลุ่ม: ${missingGroups.join(', ')})`
    })
  }

  return warnings
}

/**
 * severity รวมของรายการ — 'red' ถ้ามี warning สีแดงอย่างน้อย 1 ตัว ไม่งั้น 'orange' ถ้ามี warning ใดๆ ไม่งั้น null
 * @param {Array} warnings
 * @returns {'red'|'orange'|null}
 */
export function getWorstSeverity(warnings) {
  if (!Array.isArray(warnings) || !warnings.length) return null
  return warnings.some((w) => w.severity === 'red') ? 'red' : 'orange'
}

/**
 * คำนวณเทียบต้นทุน-ราคาขายของ 1 รายการ (ต่อหน่วย + รวมต่อบรรทัด × qty)
 *
 * @param {Object} item - quotation item { qty, appraisalPrice, discountPercent, priceTransactions, source, ... }
 * @param {Object} options
 * @param {number} options.currencyRate - customer.currencyMultiplier
 * @param {string} options.currencyUnit - customer.currencyUnit
 * @param {number} options.markup - customer.markup
 * @param {number} [options.lowMarginThreshold=LOW_MARGIN_THRESHOLD_PERCENT]
 * @returns {Object}
 */
export function calcItemCostCheck(item, options = {}) {
  const {
    currencyRate = 1,
    currencyUnit = 'THB',
    markup = 0,
    lowMarginThreshold = LOW_MARGIN_THRESHOLD_PERCENT
  } = options

  const qty = Number(item?.qty) || 0
  const cost = calcItemCost(item)
  const appraisal = Number(item?.appraisalPrice) || 0
  const discountPercent = Number(item?.discountPercent) || 0

  // สุทธิ THB = appraisalPrice (เป็น THB อยู่แล้ว) หักส่วนลด% — ไม่หารอัตราแลกเปลี่ยน
  const netThb = appraisal * (1 - discountPercent / 100)
  // สุทธิสกุลขาย = สูตรเดียวกับที่หน้าจอใบเสนอราคาใช้ (convertedUnitPrice) ต้องตรงกันเป๊ะ
  const netForeign = convertedUnitPrice(item, currencyRate, currencyUnit)

  const profit = netThb - cost
  const profitPct = netThb ? profit / netThb : 0
  const expectedAppraisal = cost * (Number(markup) || 0)

  const warnings = buildItemWarnings({
    item,
    cost,
    netThb,
    profitPct,
    appraisal,
    expectedAppraisal,
    lowMarginThreshold
  })

  return {
    qty,
    cost,
    appraisal,
    discountPercent,
    netThb,
    netForeign,
    profit,
    profitPct,
    expectedAppraisal,
    // ยอดรวมต่อบรรทัด (× qty) — ใช้แสดงในตารางสรุปหน้า 1
    lineCost: cost * qty,
    lineAppraisal: appraisal * qty,
    lineNetThb: netThb * qty,
    lineNetForeign: netForeign * qty,
    lineProfit: profit * qty,
    warnings,
    severity: getWorstSeverity(warnings)
  }
}

/**
 * คำนวณยอดรวมทั้งใบ (เทียบต้นทุน-กำไรระดับเอกสาร) — ใช้ computeDocumentTotals ตัวกลางเดียวกับหน้าจอ
 * เพื่อให้ยอด F.O.B / VAT / grand total ตรงกับที่แสดงบนใบเสนอราคาเป๊ะ
 *
 * กำไรเอกสาร (THB) = (subTotal − specialDiscount + specialAddition) × rate − Σ(cost × qty)
 * หมายเหตุ: freight และ VAT ไม่รวมในกำไร (แสดงแยกในยอดรวมเฉยๆ เพราะไม่ใช่ต้นทุนสินค้า)
 *
 * @param {Object} options
 * @param {Array} options.items
 * @param {number} options.currencyRate
 * @param {string} options.currencyUnit
 * @param {number} [options.specialDiscount=0]
 * @param {number} [options.specialAddition=0]
 * @param {number} [options.freight=0]
 * @param {number} [options.vatPercent=0]
 * @param {number} [options.markup=0]
 * @param {number} [options.lowMarginThreshold=LOW_MARGIN_THRESHOLD_PERCENT]
 * @returns {Object}
 */
export function computeCostCheckDocument(options = {}) {
  const {
    items,
    currencyRate = 1,
    currencyUnit = 'THB',
    specialDiscount = 0,
    specialAddition = 0,
    freight = 0,
    vatPercent = 0,
    markup = 0,
    lowMarginThreshold = LOW_MARGIN_THRESHOLD_PERCENT
  } = options

  const list = Array.isArray(items) ? items : []
  const itemChecks = list.map((item) =>
    calcItemCostCheck(item, { currencyRate, currencyUnit, markup, lowMarginThreshold })
  )

  const totals = computeDocumentTotals({
    items: list,
    currencyRate,
    currencyUnit,
    specialDiscount,
    specialAddition,
    freight,
    vatPercent
  })

  const totalCost = itemChecks.reduce((sum, c) => sum + c.lineCost, 0)
  const totalAppraisal = itemChecks.reduce((sum, c) => sum + c.lineAppraisal, 0)
  const totalNetThb = itemChecks.reduce((sum, c) => sum + c.lineNetThb, 0)
  const totalNetForeign = itemChecks.reduce((sum, c) => sum + c.lineNetForeign, 0)

  const rate = Number(currencyRate) || 1
  const netSaleThb = (totals.subTotal - totals.specialDiscount + totals.specialAddition) * rate
  const profitThb = netSaleThb - totalCost
  const profitPct = netSaleThb ? profitThb / netSaleThb : 0

  const warningCount = itemChecks.reduce((sum, c) => sum + c.warnings.length, 0)

  return {
    items: itemChecks,
    totals,
    totalCost,
    totalAppraisal,
    totalNetThb,
    totalNetForeign,
    netSaleThb,
    profitThb,
    profitPct,
    warningCount
  }
}
