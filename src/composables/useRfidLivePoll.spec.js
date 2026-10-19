import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useRfidLivePoll } from './useRfidLivePoll.js'

function setHidden(hidden) {
  Object.defineProperty(document, 'hidden', { configurable: true, get: () => hidden })
  document.dispatchEvent(new Event('visibilitychange'))
}

describe('useRfidLivePoll', () => {
  let poll

  beforeEach(() => {
    vi.useFakeTimers()
    setHidden(false)
  })

  afterEach(() => {
    poll?.stop()
    vi.useRealTimers()
    setHidden(false)
  })

  it('เรียกทันทีตอน start แล้วซ้ำทุก 3 วินาที', async () => {
    const task = vi.fn().mockResolvedValue()
    poll = useRfidLivePoll(task)
    poll.start()
    await vi.advanceTimersByTimeAsync(0)
    expect(task).toHaveBeenCalledTimes(1)
    await vi.advanceTimersByTimeAsync(3000)
    expect(task).toHaveBeenCalledTimes(2)
    await vi.advanceTimersByTimeAsync(3000)
    expect(task).toHaveBeenCalledTimes(3)
  })

  it('ไม่เรียกซ้อนเมื่อ task ยังไม่จบ', async () => {
    let resolveTask
    const task = vi.fn(() => new Promise((r) => (resolveTask = r)))
    poll = useRfidLivePoll(task)
    poll.start()
    await vi.advanceTimersByTimeAsync(10000)
    expect(task).toHaveBeenCalledTimes(1)
    resolveTask()
    await vi.advanceTimersByTimeAsync(3000)
    expect(task).toHaveBeenCalledTimes(2)
  })

  it('หยุดเมื่อแท็บซ่อน และเรียกทันทีเมื่อกลับมาเห็น', async () => {
    const task = vi.fn().mockResolvedValue()
    poll = useRfidLivePoll(task)
    poll.start()
    await vi.advanceTimersByTimeAsync(0)
    expect(task).toHaveBeenCalledTimes(1)
    setHidden(true)
    await vi.advanceTimersByTimeAsync(20000)
    expect(task).toHaveBeenCalledTimes(1)
    setHidden(false)
    await vi.advanceTimersByTimeAsync(0)
    expect(task).toHaveBeenCalledTimes(2)
  })

  it('เริ่มตอนแท็บซ่อนอยู่ → ยังไม่เรียกจนกว่าจะเห็น', async () => {
    setHidden(true)
    const task = vi.fn().mockResolvedValue()
    poll = useRfidLivePoll(task)
    poll.start()
    await vi.advanceTimersByTimeAsync(10000)
    expect(task).not.toHaveBeenCalled()
    setHidden(false)
    await vi.advanceTimersByTimeAsync(0)
    expect(task).toHaveBeenCalledTimes(1)
  })

  it('error → ถ่วงเวลา x2 ไม่เกินเพดาน และรีเซ็ตเมื่อสำเร็จ', async () => {
    const task = vi.fn().mockRejectedValue(new Error('fail'))
    poll = useRfidLivePoll(task, { intervalMs: 1000, maxBackoffMs: 4000 })
    poll.start()
    await vi.advanceTimersByTimeAsync(0)
    expect(task).toHaveBeenCalledTimes(1)
    expect(poll.failures.value).toBe(1)
    await vi.advanceTimersByTimeAsync(1999)
    expect(task).toHaveBeenCalledTimes(1)
    await vi.advanceTimersByTimeAsync(1)
    expect(task).toHaveBeenCalledTimes(2)
    expect(poll.failures.value).toBe(2)
    await vi.advanceTimersByTimeAsync(4000)
    expect(task).toHaveBeenCalledTimes(3)
    await vi.advanceTimersByTimeAsync(4000)
    expect(task).toHaveBeenCalledTimes(4)

    task.mockResolvedValue()
    await vi.advanceTimersByTimeAsync(4000)
    expect(task).toHaveBeenCalledTimes(5)
    expect(poll.failures.value).toBe(0)
    await vi.advanceTimersByTimeAsync(1000)
    expect(task).toHaveBeenCalledTimes(6)
  })

  it('stop() หยุดรอบถัดไปและถอด listener', async () => {
    const task = vi.fn().mockResolvedValue()
    poll = useRfidLivePoll(task)
    poll.start()
    await vi.advanceTimersByTimeAsync(0)
    poll.stop()
    expect(poll.running.value).toBe(false)
    await vi.advanceTimersByTimeAsync(20000)
    expect(task).toHaveBeenCalledTimes(1)
    setHidden(true)
    setHidden(false)
    await vi.advanceTimersByTimeAsync(0)
    expect(task).toHaveBeenCalledTimes(1)
  })

  it('stop() ระหว่าง task กำลังวิ่ง ไม่ตั้งรอบใหม่', async () => {
    let resolveTask
    const task = vi.fn(() => new Promise((r) => (resolveTask = r)))
    poll = useRfidLivePoll(task)
    poll.start()
    await vi.advanceTimersByTimeAsync(0)
    poll.stop()
    resolveTask()
    await vi.advanceTimersByTimeAsync(20000)
    expect(task).toHaveBeenCalledTimes(1)
  })
})
