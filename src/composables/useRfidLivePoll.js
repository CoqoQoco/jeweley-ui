/**
 * useRfidLivePoll — เรียก task (async) ซ้ำตามรอบเวลาแบบ "live" สำหรับหน้าติดตามผูกแท็ก RFID
 *
 * กติกา:
 *  - ไม่เรียกซ้อน: รอ task รอบก่อนจบก่อนจึงนับเวลารอบถัดไป (setTimeout ต่อรอบ ไม่ใช่ setInterval)
 *  - หยุดเมื่อแท็บถูกซ่อน (document.hidden) และเริ่มรอบใหม่ทันทีเมื่อกลับมาเห็น
 *  - task throw → failures++ แล้วถ่วงเวลา x2 ต่อครั้ง (ไม่เกิน maxBackoffMs); สำเร็จ → รีเซ็ตเป็น intervalMs
 *    (error ถูกแสดง/ปิดโดย axios-helper แล้ว — ตัวนี้ catch เพื่อคุมรอบเท่านั้น)
 *  - stop() / ปลด component (เมื่อเรียกใน setup()) → ล้าง timer + ถอด listener
 *
 * วิธีใช้ (Options API ผ่าน setup()):
 *   setup() {
 *     const poll = useRfidLivePoll(() => fetchSomething())
 *     return { poll }
 *   }
 *   // แล้ว this.poll.start() / this.poll.stop()
 */
import { ref, getCurrentInstance, onBeforeUnmount } from 'vue'

export const RFID_POLL_INTERVAL_MS = 3000
export const RFID_POLL_MAX_BACKOFF_MS = 30000

export function useRfidLivePoll(task, { intervalMs = RFID_POLL_INTERVAL_MS, maxBackoffMs = RFID_POLL_MAX_BACKOFF_MS } = {}) {
  const running = ref(false)
  const failures = ref(0)

  let timer = null
  let inFlight = false

  const isHidden = () => typeof document !== 'undefined' && document.hidden === true

  function nextDelay() {
    if (!failures.value) return intervalMs
    return Math.min(intervalMs * 2 ** failures.value, maxBackoffMs)
  }

  function clearTimer() {
    if (timer !== null) {
      clearTimeout(timer)
      timer = null
    }
  }

  function schedule(delay) {
    clearTimer()
    timer = setTimeout(tick, delay)
  }

  async function tick() {
    timer = null
    if (!running.value || isHidden() || inFlight) return
    inFlight = true
    try {
      await task()
      failures.value = 0
    } catch {
      failures.value += 1
    } finally {
      inFlight = false
    }
    if (running.value && !isHidden()) schedule(nextDelay())
  }

  function onVisibilityChange() {
    if (!running.value) return
    if (isHidden()) {
      clearTimer()
    } else if (!inFlight && timer === null) {
      schedule(0)
    }
  }

  function start() {
    if (running.value) return
    running.value = true
    failures.value = 0
    if (typeof document !== 'undefined') document.addEventListener('visibilitychange', onVisibilityChange)
    if (!isHidden()) schedule(0)
  }

  function stop() {
    running.value = false
    clearTimer()
    if (typeof document !== 'undefined') document.removeEventListener('visibilitychange', onVisibilityChange)
  }

  if (getCurrentInstance()) onBeforeUnmount(stop)

  return { running, failures, start, stop }
}
