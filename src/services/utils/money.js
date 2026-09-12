/**
 * money.js
 * ตัวกลางเดียวของระบบสำหรับปัดเศษเงินในเอกสารขาย (ใบเสนอราคา / ใบสั่งขาย / ใบแจ้งหนี้ ฯลฯ)
 *
 * เกณฑ์กลาง (ให้ตรงกับเครื่องคิดเลข): ไม่ปัดเศษระหว่างทางเลยสักจุด — ราคาต่อชิ้น ยอดต่อแถว
 * F.O.B ส่วนลดพิเศษ ส่วนเพิ่ม ค่าขนส่ง VAT คิดเต็มความละเอียดหมด แล้วปัดครั้งเดียวที่ยอดสุดท้าย
 * (grand total / C.I.F) เป็นทศนิยม 2 ตำแหน่งแบบ half-up away-from-zero — ใช้เกณฑ์เดียวกันทั้ง
 * สกุลต่างประเทศและ THB ไม่มีการปัดเป็นจำนวนเต็มอีกต่อไป และไม่มีบรรทัด ROUNDING บนเอกสาร
 *
 * ห้าม import อะไรจาก decimal.js ในไฟล์นี้เด็ดขาด (กัน circular import) —
 * decimal.js เป็นฝ่าย import/re-export จากไฟล์นี้แทน
 */

/**
 * true เมื่อสกุลเงินไม่ใช่ THB
 * @param {string} unit - รหัสสกุลเงิน
 * @returns {boolean}
 */
export function isForeignCurrency(unit) {
  return String(unit || '').trim().toUpperCase() !== 'THB'
}

/**
 * จำนวนตำแหน่งทศนิยมของเอกสาร — เดี๋ยวนี้คงที่ 2 ตำแหน่งเสมอ ไม่ว่าสกุลเงินใด (สกุลเงินไม่มีผล
 * ต่อความละเอียดอีกต่อไป) เก็บ signature (currencyUnit) ไว้เพื่อ backward compat กับผู้เรียกเดิม
 * @param {string} currencyUnit - ไม่ใช้แล้ว เก็บไว้เพื่อ compat
 * @returns {number}
 */
// eslint-disable-next-line no-unused-vars
export function moneyDecimals(currencyUnit) {
  return 2
}

/**
 * ปัดครึ่งขึ้นแบบ away-from-zero (เศษ < 0.5 ปัดทิ้ง, เศษ >= 0.5 ปัดขึ้น) ตามจำนวนตำแหน่งที่ระบุ
 *
 * ห้ามใช้ `Math.round(v * 100) / 100` ตรงๆ เพราะ JS มีบั๊กทศนิยม เช่น 1.005 * 100 ได้
 * 100.49999999999999 แล้วปัดผิดทิศ — ใช้เทคนิค "ต่อ string exponent" (num.toString() + 'eN')
 * แทนการคูณลอยตัวตรงๆ กัน drift นี้ (แบบเดียวกับ ceilMoney ใน mobile/pos/index-view.vue)
 *
 * รองรับค่าติดลบแบบ away-from-zero (แยกเครื่องหมายออกก่อนปัดค่าสัมบูรณ์ แล้วค่อยใส่เครื่องหมายกลับ)
 * ค่าที่ไม่ใช่ตัวเลขให้คืน 0
 *
 * @param {number|string} value
 * @param {number} decimals - default 0
 * @returns {number}
 */
export function roundHalfUp(value, decimals = 0) {
  const num = Number(value)
  if (!Number.isFinite(num)) return 0
  if (num === 0) return 0

  const sign = num < 0 ? -1 : 1
  const abs = Math.abs(num)

  const str = abs.toString()
  const factor = Math.pow(10, decimals)
  const scaled = /e/i.test(str) ? abs * factor : Number(`${str}e${decimals}`)
  const roundedScaled = Math.round(scaled)

  return sign * (roundedScaled / factor)
}

/**
 * ปัดเงินเป็นทศนิยม 2 ตำแหน่งเสมอ (currencyUnit ไม่มีผลต่อความละเอียดอีกต่อไป เก็บ signature
 * ไว้เพื่อ backward compat กับผู้เรียกเดิม)
 * @param {number|string} value
 * @param {string} currencyUnit - ไม่ใช้แล้ว เก็บไว้เพื่อ compat
 * @returns {number}
 */
// eslint-disable-next-line no-unused-vars
export function roundMoney(value, currencyUnit) {
  return roundHalfUp(value, 2)
}

/**
 * ราคาต่อชิ้นหลังหักส่วนลด แปลงสกุล — คืนค่าดิบ "ไม่ปัด" เพื่อให้คำนวณต่อได้ตรงกับเครื่องคิดเลข
 * เป๊ะทุกขั้น จุดปัดเศษเดียวของทั้งระบบอยู่ที่ grandTotalRounded ใน computeDocumentTotals เท่านั้น
 * @param {Object} item - { appraisalPrice, discountPercent }
 * @param {number} currencyRate
 * @param {string} currencyUnit - ไม่ใช้แล้ว เก็บไว้เพื่อ compat
 * @returns {number}
 */
// eslint-disable-next-line no-unused-vars
export function convertedUnitPrice(item, currencyRate, currencyUnit) {
  return (
    ((Number(item?.appraisalPrice) || 0) * (1 - (Number(item?.discountPercent) || 0) / 100)) /
    (Number(currencyRate) || 1)
  )
}

/**
 * ยอดต่อแถว = convertedUnitPrice (ดิบ ไม่ปัด) × qty — ไม่ปัดเศษระหว่างทาง
 * @param {Object} item - { appraisalPrice, discountPercent, qty }
 * @param {number} currencyRate
 * @param {string} currencyUnit
 * @returns {number}
 */
export function lineAmount(item, currencyRate, currencyUnit) {
  return convertedUnitPrice(item, currencyRate, currencyUnit) * (Number(item?.qty) || 0)
}

/**
 * คิดยอดรวมทั้งใบเอกสารขาย
 *
 * หัวใจสำคัญ (มาตรฐานใหม่ — ตรงกับเครื่องคิดเลข): ไม่ปัดเศษระหว่างทางเลยสักจุด ราคาต่อชิ้น
 * ยอดต่อแถว (lineAmount), subTotal, ส่วนลดพิเศษ, ส่วนเพิ่มพิเศษ, ค่าขนส่ง และ VAT ทุกตัวคิดด้วย
 * ค่าดิบเต็มความละเอียด แล้วบวกกันเป็น grandTotalRaw — จุดปัดเศษจุดเดียวของทั้งระบบคือ
 * grandTotalRounded (ปัดครึ่งขึ้น away-from-zero เป็นทศนิยม 2 ตำแหน่ง) เท่านั้น
 *
 * roundingAdjustment คงค่า 0 เสมอ (เลิกใช้บรรทัด ROUNDING บนเอกสารแล้ว) เก็บ key ไว้เพื่อ
 * backward compat กับโค้ดที่ยัง destructure ค่านี้อยู่
 *
 * @param {Object} options
 * @param {Array} options.items
 * @param {number} options.currencyRate
 * @param {string} options.currencyUnit
 * @param {number} [options.specialDiscount=0]
 * @param {number} [options.specialAddition=0]
 * @param {number} [options.freight=0]
 * @param {number} [options.vatPercent=0]
 * @returns {{
 *   subTotal: number,
 *   specialDiscount: number,
 *   specialAddition: number,
 *   freight: number,
 *   afterSpecial: number,
 *   vatAmount: number,
 *   grandTotalRaw: number,
 *   grandTotalRounded: number,
 *   roundingAdjustment: number
 * }}
 */
export function computeDocumentTotals({
  items,
  currencyRate,
  currencyUnit,
  specialDiscount = 0,
  specialAddition = 0,
  freight = 0,
  vatPercent = 0
} = {}) {
  const list = Array.isArray(items) ? items : []

  const subTotal = list.reduce(
    (sum, item) => sum + lineAmount(item, currencyRate, currencyUnit),
    0
  )

  const rawSpecialDiscount = Number(specialDiscount) || 0
  const rawSpecialAddition = Number(specialAddition) || 0
  const rawFreight = Number(freight) || 0

  const afterSpecial = subTotal - rawSpecialDiscount + rawSpecialAddition + rawFreight
  const vatAmount = (afterSpecial * (Number(vatPercent) || 0)) / 100
  const grandTotalRaw = afterSpecial + vatAmount
  const grandTotalRounded = roundHalfUp(grandTotalRaw, 2)
  const roundingAdjustment = 0

  return {
    subTotal,
    specialDiscount: rawSpecialDiscount,
    specialAddition: rawSpecialAddition,
    freight: rawFreight,
    afterSpecial,
    vatAmount,
    grandTotalRaw,
    grandTotalRounded,
    roundingAdjustment
  }
}

/**
 * แปลงยอดเงินเอกสารเป็น string ทศนิยม 2 ตำแหน่งพร้อม thousand separator เสมอ
 * (ใช้แสดงผลบนตารางเอกสารขาย — สกุลต่างประเทศแสดง 2 ตำแหน่งเหมือน THB ตามมาตรฐานใหม่)
 * ค่าที่ไม่ใช่ตัวเลขให้เป็น '0.00'
 * @param {number|string} value
 * @param {string} [locale='th-TH']
 * @returns {string}
 */
export function formatDocumentMoney(value, locale = 'th-TH') {
  const num = Number(value)
  if (!Number.isFinite(num)) return (0).toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return num.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
