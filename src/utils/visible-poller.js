/**
 * visible-poller — poller ที่หยุด fetch เองเมื่อ tab ถูกซ่อน (background tab)
 *
 * ใช้กัน badge polling (Ticket/CountOpen, Ticket/CountMyUnread, Notification/MyCount ฯลฯ)
 * ยิง API ถี่เกินจำเป็นตอน user ไม่ได้เปิดแท็บอยู่ — DB โดนโหลดฟรีทั้งวัน
 *
 * วิธีใช้:
 *   import { createVisiblePoller, DEFAULT_BADGE_POLL_INTERVAL } from '@/utils/visible-poller.js'
 *
 *   mounted() {
 *     this.poller = createVisiblePoller(() => this.myStore.fetchCount(), DEFAULT_BADGE_POLL_INTERVAL)
 *     this.poller.start()
 *   },
 *   beforeUnmount() {
 *     this.poller.stop()
 *   }
 *
 * พฤติกรรม:
 * - start() เรียก fn ทันที 1 ครั้ง แล้วเริ่ม setInterval
 * - ทุก tick: ข้ามถ้า tab ถูกซ่อน (document.hidden) หรือถ้า fn รอบก่อนยังไม่จบ (กัน request ซ้อน)
 * - เมื่อกลับมาเห็น tab อีกครั้ง (visibilitychange) และรอบสำเร็จล่าสุดห่างเกิน intervalMs แล้ว จะเรียก fn ทันที
 * - stop() เคลียร์ทั้ง interval และ listener, เรียกซ้ำได้ (idempotent)
 * - start() เรียกซ้ำจะไม่สร้าง interval/listener ซ้อน
 * - error จาก fn ถูกกลืนเงียบๆ เพราะเป็นแค่ background badge fetch
 */

export const DEFAULT_BADGE_POLL_INTERVAL = 180000 // 3 นาที

export function createVisiblePoller(fn, intervalMs = DEFAULT_BADGE_POLL_INTERVAL) {
  let intervalId = null
  let started = false
  let inFlight = false
  let lastRunAt = 0

  const run = () => {
    if (inFlight) return
    inFlight = true

    let result
    try {
      result = fn() // เรียก fn ทันที (sync) ให้ตรงกับพฤติกรรม polling เดิม
    } catch {
      inFlight = false
      return
    }

    Promise.resolve(result)
      .then(() => {
        lastRunAt = Date.now()
      })
      .catch(() => {
        // เงียบไว้ — fn เป็นแค่ badge fetch เบื้องหลัง ไม่ต้องแจ้ง error ผู้ใช้
      })
      .finally(() => {
        inFlight = false
      })
  }

  const tick = () => {
    if (document.hidden) return
    run()
  }

  const handleVisibilityChange = () => {
    if (document.hidden) return
    if (Date.now() - lastRunAt >= intervalMs) {
      run()
    }
  }

  return {
    start() {
      if (started) return
      started = true
      run()
      intervalId = setInterval(tick, intervalMs)
      document.addEventListener('visibilitychange', handleVisibilityChange)
    },

    stop() {
      started = false
      if (intervalId) {
        clearInterval(intervalId)
        intervalId = null
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }
}

export default createVisiblePoller
