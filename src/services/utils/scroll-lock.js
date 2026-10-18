// scroll-lock.js — ล็อกการเลื่อนหน้า (document body) ขณะมี overlay (เช่น DrawerGeneric) เปิดอยู่
// ตัวนับระดับ module: ล็อกครั้งแรกเท่านั้นที่จำค่า overflow/paddingRight เดิมของ body แล้วตั้ง overflow hidden + เติม paddingRight เท่าความกว้าง scrollbar
// (กันหน้าสะเทือนตอน scrollbar หาย) · ปลดล็อกครั้งสุดท้ายคืนค่าเดิม · เรียก unlock เกินจำนวน lock ไม่ทำอะไร
let lockCount = 0
let saved = null

export function lockBodyScroll() {
  lockCount += 1
  if (lockCount > 1) return
  const { body, documentElement } = document
  saved = { overflow: body.style.overflow, paddingRight: body.style.paddingRight }
  const gap = Math.max(0, window.innerWidth - documentElement.clientWidth)
  if (gap > 0) {
    const current = parseFloat(window.getComputedStyle(body).paddingRight) || 0
    body.style.paddingRight = `${current + gap}px`
  }
  body.style.overflow = 'hidden'
}

export function unlockBodyScroll() {
  if (lockCount === 0) return
  lockCount -= 1
  if (lockCount > 0 || !saved) return
  document.body.style.overflow = saved.overflow
  document.body.style.paddingRight = saved.paddingRight
  saved = null
}

export function getBodyScrollLockCount() {
  return lockCount
}
