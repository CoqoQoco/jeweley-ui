// stock-age.js — แยกปี/เดือนจาก ageDays (จำนวนวัน) ใช้ร่วมกันระหว่างหน้า stock product dashboard
// (stock-aging-view.vue ตาราง "รายชิ้นค้างนาน" + production-balance-view.vue การ์ด "แบบที่ต้องดูแล")
// เพื่อให้มีจุดเดียวที่ตัดสินใจเรื่องรูปแบบอายุ
//
// หมายเหตุ: เดือน = floor(เศษวัน / 30) ไม่ใช่ calendar month จริง — ตั้งใจให้ตรงกับตัวเลขที่ตรวจสอบกับ
// prod แล้ว (เช่น 28 ปี 2 เดือน)
export const splitAgeDays = (ageDays) => {
  const safeDays = ageDays || 0
  const years = Math.floor(safeDays / 365)
  const months = Math.floor((safeDays % 365) / 30)
  return { years, months }
}
