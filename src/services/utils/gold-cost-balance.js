/**
 * gold-cost-balance.js
 * Pure functions for the "สมดุลทอง" (gold weight balance) panel on the
 * ใบเบิกผสมทอง (plan-gold) create form.
 *
 * ⚠️ สูตรด้านล่างยังไม่ได้ยืนยันกับ domain — อนุมานจากชื่อฟิลด์เท่านั้น
 * ห้าม auto-fill ทับช่องขาด/เกินโดยตรง ต้องให้ user กดปุ่ม "ใช้ค่านี้" เอง
 * (ดู plan-gold/index-view.vue: applyMeltBalance / applyCastBalance)
 *
 * Rounding: round2() ปัดแบบ half-up (ties toward +Infinity) — reuse จาก
 * gold-loss-tang-calc.js เพื่อให้ตรงกับ backend .NET ToPositiveInfinity
 * (ห้ามใช้ Math.round ตรงๆ / เขียน rounding ใหม่ในไฟล์นี้)
 *
 * diff > 0 = ขาด (issued มากกว่า returned)
 * diff < 0 = เกิน (returned มากกว่า issued)
 * diff = 0 = สมดุลพอดี (ปุ่ม "ใช้ค่านี้" ควร disable)
 */
import { round2 } from './gold-loss-tang-calc.js'

/**
 * คำนวณสมดุลทองหลอม
 * สูตร: diff = meltWeight − returnMeltWeight − returnMeltScrapWeight
 *
 * ตัวอย่าง: meltWeight=120, returnMeltWeight=115, returnMeltScrapWeight=3.30
 *   → issued=120.00, returned=118.30, diff=1.70 (ขาด), amount=1.70
 *
 * @param {number|string} meltWeight - น้ำหนักเบิกทองหลอม
 * @param {number|string} returnMeltWeight - น้ำหนักคืนทองหลอม
 * @param {number|string} returnMeltScrapWeight - น้ำหนักคืนขี้เบ้า (หลอม)
 * @returns {{ issued: number, returned: number, diff: number, isShort: boolean, isOver: boolean, amount: number }}
 */
export function calcMeltBalance(meltWeight, returnMeltWeight, returnMeltScrapWeight) {
  const issued = round2(parseFloat(meltWeight) || 0)
  const returned = round2(
    (parseFloat(returnMeltWeight) || 0) + (parseFloat(returnMeltScrapWeight) || 0)
  )
  const diff = round2(issued - returned)

  return {
    issued,
    returned,
    diff,
    isShort: diff > 0,
    isOver: diff < 0,
    amount: round2(Math.abs(diff))
  }
}

/**
 * คำนวณสมดุลทองหล่อ
 * สูตร: diff = castWeight − (returnCastWeight + returnCastMoldWeight
 *              + returnCastBodyBrokenWeight + itemsReturnTotal
 *              + returnCastPowderWeight + returnCastScrapWeight)
 *
 * ตัวอย่าง: castWeight=200, returnCastWeight=150, returnCastMoldWeight=10,
 *   returnCastBodyBrokenWeight=5, itemsReturnTotal=30, returnCastPowderWeight=2,
 *   returnCastScrapWeight=1.50
 *   → issued=200.00, returned=198.50, diff=1.50 (ขาด), amount=1.50
 *
 * @param {number|string} castWeight - น้ำหนักเบิกทองหล่อ
 * @param {number|string} returnCastWeight - น้ำหนักคืนทองหล่อ
 * @param {number|string} returnCastMoldWeight - น้ำหนักคืนแม่พิมพ์
 * @param {number|string} returnCastBodyBrokenWeight - น้ำหนักคืนตัวเรือนเสีย
 * @param {number|string} itemsReturnTotal - ผลรวมน้ำหนักคืนตัวเรือน (จากตารางคืนตัวเรือน)
 * @param {number|string} returnCastPowderWeight - น้ำหนักคืนผงทอง
 * @param {number|string} returnCastScrapWeight - น้ำหนักคืนขี้เบ้า (หล่อ)
 * @returns {{ issued: number, returned: number, diff: number, isShort: boolean, isOver: boolean, amount: number }}
 */
export function calcCastBalance(
  castWeight,
  returnCastWeight,
  returnCastMoldWeight,
  returnCastBodyBrokenWeight,
  itemsReturnTotal,
  returnCastPowderWeight,
  returnCastScrapWeight
) {
  const issued = round2(parseFloat(castWeight) || 0)
  const returnedSum =
    (parseFloat(returnCastWeight) || 0) +
    (parseFloat(returnCastMoldWeight) || 0) +
    (parseFloat(returnCastBodyBrokenWeight) || 0) +
    (parseFloat(itemsReturnTotal) || 0) +
    (parseFloat(returnCastPowderWeight) || 0) +
    (parseFloat(returnCastScrapWeight) || 0)
  const returned = round2(returnedSum)
  const diff = round2(issued - returned)

  return {
    issued,
    returned,
    diff,
    isShort: diff > 0,
    isOver: diff < 0,
    amount: round2(Math.abs(diff))
  }
}
