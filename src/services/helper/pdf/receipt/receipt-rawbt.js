// สั่งพิมพ์ข้อความล้วน (จาก receipt-text-builder.js) ผ่าน RawBT โดยตรงด้วย Android intent URL
// สเปก: https://rawbt.ru/intents.html — เลี่ยงเส้นทางภาพ/PDF ทั้งหมดเพราะเครื่องพิมพ์ HPRT HM-A300E
// พ่นกระดาษมั่วเมื่อได้รับคำสั่ง raster (แต่โหมดข้อความทำงานปกติ)
const RAWBT_PACKAGE = 'ru.a402d.rawbtprinter'

// รอ RawBT พาโฟกัสออกจากหน้าเว็บ (visibilitychange -> hidden) ก่อนถือว่าเปิดสำเร็จ
// ถ้าเกิน timeout นี้แล้วหน้ายัง visible อยู่ แปลว่าไม่มีแอปรับ intent (ไม่ได้ติดตั้ง RawBT)
const FALLBACK_TIMEOUT_MS = 1500

function isAndroid() {
  if (typeof navigator === 'undefined') return false
  return /Android/i.test(navigator.userAgent || '')
}

// encodeURIComponent เข้ารหัสอักขระพิเศษของ intent URL ให้ปลอดภัยอยู่แล้ว (# & % space ฯลฯ)
export function buildRawBtIntentUrl(text) {
  const encoded = encodeURIComponent(text)
  return `intent:${encoded}#Intent;scheme=rawbt;package=${RAWBT_PACKAGE};end;`
}

// คืนสถานะเสมอ ไม่ค้างเงียบ — { success, reason } ให้ผู้เรียก (pos-done-view.vue) แจ้งผู้ใช้ต่อได้
// reason: 'not-android' | 'app-not-found' | 'intent-error' | 'rawbt-opened'
export function printReceiptText(text) {
  if (!isAndroid()) {
    return Promise.resolve({ success: false, reason: 'not-android' })
  }

  const intentUrl = buildRawBtIntentUrl(text)

  return new Promise((resolve) => {
    let settled = false

    const finish = (result) => {
      if (settled) return
      settled = true
      document.removeEventListener('visibilitychange', onVisibilityChange)
      resolve(result)
    }

    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        finish({ success: true, reason: 'rawbt-opened' })
      }
    }
    document.addEventListener('visibilitychange', onVisibilityChange)

    try {
      window.location.href = intentUrl
    } catch {
      finish({ success: false, reason: 'intent-error' })
      return
    }

    setTimeout(() => finish({ success: false, reason: 'app-not-found' }), FALLBACK_TIMEOUT_MS)
  })
}
