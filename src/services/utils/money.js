/**
 * money.js
 * ตัวกลางเดียวของระบบสำหรับปัดเศษเงินในเอกสารขาย (ใบเสนอราคา / ใบสั่งขาย / ใบแจ้งหนี้ ฯลฯ)
 *
 * เกณฑ์กลาง: ปัดครึ่งขึ้นแบบ away-from-zero (round half-up) ทุกจุด — เลิกใช้ ceil/floor
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
 * จำนวนตำแหน่งทศนิยมของเอกสารตามสกุลเงิน: ต่างประเทศ = 0 ตำแหน่ง, THB = 2 ตำแหน่ง
 * @param {string} currencyUnit
 * @returns {number}
 */
export function moneyDecimals(currencyUnit) {
  return isForeignCurrency(currencyUnit) ? 0 : 2
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
 * ปัดเงินตามความละเอียดของสกุลเอกสาร (ต่างประเทศ = จำนวนเต็ม, THB = 2 ตำแหน่ง)
 * @param {number|string} value
 * @param {string} currencyUnit
 * @returns {number}
 */
export function roundMoney(value, currencyUnit) {
  return roundHalfUp(value, moneyDecimals(currencyUnit))
}

/**
 * ปัดเป็นจำนวนเต็มด้วย half-up — ตัวแทนของ ceilToInteger เดิม (ceil ทุกค่าทำให้ยอดสุดท้ายเพี้ยน)
 * @param {number|string} value
 * @returns {number}
 */
export function roundToInteger(value) {
  return roundHalfUp(value, 0)
}

/**
 * ราคาต่อชิ้นหลังหักส่วนลด แปลงสกุล และปัดแล้ว — จุดปัดเศษหลักของทั้งระบบ
 * ทุกยอดที่คิดจากราคาต่อชิ้น (ยอดต่อแถว, ยอดรวมทั้งใบ) ต้องต่อยอดจากค่าที่ปัดแล้วนี้เท่านั้น
 * @param {Object} item - { appraisalPrice, discountPercent }
 * @param {number} currencyRate
 * @param {string} currencyUnit
 * @returns {number}
 */
export function convertedUnitPrice(item, currencyRate, currencyUnit) {
  const raw =
    ((Number(item?.appraisalPrice) || 0) * (1 - (Number(item?.discountPercent) || 0) / 100)) /
    (Number(currencyRate) || 1)
  return roundMoney(raw, currencyUnit)
}

/**
 * ยอดต่อแถว = convertedUnitPrice (ปัดแล้ว) × qty — ห้ามปัดหลังคูณ
 * เพราะลูกค้าต้องเอาราคาต่อชิ้นที่เห็นคูณจำนวนที่เห็นแล้วได้ยอดที่เห็นเป๊ะ
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
 * หัวใจสำคัญ: ต้องปัดเศษตั้งแต่ระดับ "ราคาต่อชิ้น" (convertedUnitPrice) ก่อนเสมอ แล้วคูณ qty
 * ได้ยอดต่อแถว (lineAmount) จากนั้นบวกยอดต่อแถวที่ปัดแล้วเข้าด้วยกันเป็น subTotal —
 * ห้ามบวกราคาดิบ (raw, ยังมีทศนิยม) แล้วค่อยปัดทีเดียวตอนจบ เพราะจะทำให้ยอดรวมที่ระบบคำนวณ
 * ไม่เท่ากับผลบวกของตัวเลขที่ลูกค้าเห็นจริงบนแต่ละแถว (ตัวอย่างจริงที่เจอ: ใบแจ้งหนี้ 184 แถว
 * ผลรวมช่อง Amount = 77,223 แต่ F.O.B ที่พิมพ์ = 77,312 เพราะปัดคนละจุดกัน)
 *
 * ส่วนลด/ส่วนเพิ่ม/ค่าขนส่ง/VAT ก็ปัดตามความละเอียดของสกุลเอกสารก่อนบวกเข้า afterSpecial เช่นกัน
 * เพื่อให้ "ผลบวกของบรรทัดที่พิมพ์บนเอกสารทุกบรรทัด" เท่ากับ grandTotalRaw เป๊ะ — ไม่มีเศษหลุด
 *
 * ยอดสุดท้าย (grandTotal) ปัดเป็นจำนวนเต็มด้วย half-up เสมอ (เลิกใช้ ceil) ส่วนต่างระหว่างยอด
 * ที่ปัดแล้วกับยอดดิบ (grandTotalRaw) คือ roundingAdjustment ที่พิมพ์เป็นบรรทัด ROUNDING บนเอกสาร
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

  const roundedSpecialDiscount = roundMoney(specialDiscount, currencyUnit)
  const roundedSpecialAddition = roundMoney(specialAddition, currencyUnit)
  const roundedFreight = roundMoney(freight, currencyUnit)

  const afterSpecial = subTotal - roundedSpecialDiscount + roundedSpecialAddition + roundedFreight
  const vatAmount = roundMoney((afterSpecial * (Number(vatPercent) || 0)) / 100, currencyUnit)
  const grandTotalRaw = afterSpecial + vatAmount
  const grandTotalRounded = roundToInteger(grandTotalRaw)
  const roundingAdjustment = grandTotalRounded - grandTotalRaw

  return {
    subTotal,
    specialDiscount: roundedSpecialDiscount,
    specialAddition: roundedSpecialAddition,
    freight: roundedFreight,
    afterSpecial,
    vatAmount,
    grandTotalRaw,
    grandTotalRounded,
    roundingAdjustment
  }
}
