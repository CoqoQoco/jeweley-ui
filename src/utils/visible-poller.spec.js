import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

import { createVisiblePoller, DEFAULT_BADGE_POLL_INTERVAL } from './visible-poller.js'

function setHidden(hidden) {
  Object.defineProperty(document, 'hidden', {
    configurable: true,
    get: () => hidden
  })
}

describe('visible-poller', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    setHidden(false)
  })

  afterEach(() => {
    vi.useRealTimers()
    setHidden(false)
  })

  it('exports the default badge poll interval (3 minutes)', () => {
    expect(DEFAULT_BADGE_POLL_INTERVAL).toBe(180000)
  })

  it('start() calls fn immediately then again every intervalMs while visible', async () => {
    const fn = vi.fn().mockResolvedValue()
    const poller = createVisiblePoller(fn, 1000)

    poller.start()
    expect(fn).toHaveBeenCalledTimes(1)

    await vi.advanceTimersByTimeAsync(1000)
    expect(fn).toHaveBeenCalledTimes(2)

    poller.stop()
  })

  it('skips a tick while the tab is hidden', async () => {
    const fn = vi.fn().mockResolvedValue()
    const poller = createVisiblePoller(fn, 1000)

    poller.start()
    await vi.advanceTimersByTimeAsync(0) // ให้ call แรกจบก่อน
    expect(fn).toHaveBeenCalledTimes(1)

    setHidden(true)
    await vi.advanceTimersByTimeAsync(1000) // tick ตอน tab ซ่อนอยู่ ต้องข้าม
    expect(fn).toHaveBeenCalledTimes(1)

    poller.stop()
  })

  it('skips a tick while the previous fn() call is still in-flight', async () => {
    let resolveFn
    const fn = vi.fn(
      () =>
        new Promise((resolve) => {
          resolveFn = resolve
        })
    )
    const poller = createVisiblePoller(fn, 1000)

    poller.start() // call #1 ค้างอยู่ (ยังไม่ resolve)
    expect(fn).toHaveBeenCalledTimes(1)

    await vi.advanceTimersByTimeAsync(1000) // tick ระหว่าง call #1 ยังไม่จบ ต้องข้าม ไม่ยิงซ้อน
    expect(fn).toHaveBeenCalledTimes(1)

    resolveFn()
    await vi.advanceTimersByTimeAsync(0) // ปล่อยให้ call #1 จบ

    await vi.advanceTimersByTimeAsync(1000) // tick ถัดไปเรียกได้ตามปกติ
    expect(fn).toHaveBeenCalledTimes(2)

    poller.stop()
  })

  it('refreshes immediately when the tab becomes visible again after the interval has elapsed', async () => {
    const fn = vi.fn().mockResolvedValue()
    const poller = createVisiblePoller(fn, 1000)

    poller.start()
    await vi.advanceTimersByTimeAsync(0) // ให้ call แรกจบและบันทึกเวลา lastRunAt
    expect(fn).toHaveBeenCalledTimes(1)

    setHidden(true)
    document.dispatchEvent(new Event('visibilitychange'))
    await vi.advanceTimersByTimeAsync(1500) // เกิน interval แล้วแต่ tab ยังซ่อนอยู่ ไม่ควรยิง
    expect(fn).toHaveBeenCalledTimes(1)

    setHidden(false)
    document.dispatchEvent(new Event('visibilitychange')) // กลับมาเห็น tab หลังจากเกิน interval แล้ว
    await vi.advanceTimersByTimeAsync(0)
    expect(fn).toHaveBeenCalledTimes(2)

    poller.stop()
  })

  it('does not refresh on visibilitychange when the interval has not elapsed yet', async () => {
    const fn = vi.fn().mockResolvedValue()
    const poller = createVisiblePoller(fn, 1000)

    poller.start()
    await vi.advanceTimersByTimeAsync(0)
    expect(fn).toHaveBeenCalledTimes(1)

    setHidden(true)
    document.dispatchEvent(new Event('visibilitychange'))
    setHidden(false)
    document.dispatchEvent(new Event('visibilitychange')) // สลับกลับเร็วมาก ยังไม่ถึง interval
    await vi.advanceTimersByTimeAsync(0)
    expect(fn).toHaveBeenCalledTimes(1)

    poller.stop()
  })

  it('stop() clears the interval and removes the visibilitychange listener', async () => {
    const fn = vi.fn().mockResolvedValue()
    const removeSpy = vi.spyOn(document, 'removeEventListener')
    const poller = createVisiblePoller(fn, 1000)

    poller.start()
    await vi.advanceTimersByTimeAsync(0)
    poller.stop()

    expect(removeSpy).toHaveBeenCalledWith('visibilitychange', expect.any(Function))

    await vi.advanceTimersByTimeAsync(5000) // ไม่มี tick เกิดขึ้นอีกหลัง stop
    expect(fn).toHaveBeenCalledTimes(1)

    removeSpy.mockRestore()
  })

  it('start() called twice does not create duplicate intervals or listeners', async () => {
    const fn = vi.fn().mockResolvedValue()
    const addSpy = vi.spyOn(document, 'addEventListener')
    const poller = createVisiblePoller(fn, 1000)

    poller.start()
    poller.start() // เรียกซ้ำต้องไม่ตั้ง interval/listener ซ้อน
    await vi.advanceTimersByTimeAsync(0)
    expect(fn).toHaveBeenCalledTimes(1)
    expect(
      addSpy.mock.calls.filter(([eventName]) => eventName === 'visibilitychange')
    ).toHaveLength(1)

    await vi.advanceTimersByTimeAsync(1000)
    expect(fn).toHaveBeenCalledTimes(2) // ไม่ใช่ 3 (ถ้า interval ซ้อนจะยิง 2 ครั้งต่อ tick)

    poller.stop()
    addSpy.mockRestore()
  })

  it('swallows errors thrown from fn without breaking the next tick', async () => {
    const fn = vi.fn().mockRejectedValueOnce(new Error('boom')).mockResolvedValue()
    const poller = createVisiblePoller(fn, 1000)

    poller.start()
    await vi.advanceTimersByTimeAsync(0)
    expect(fn).toHaveBeenCalledTimes(1)

    await vi.advanceTimersByTimeAsync(1000)
    expect(fn).toHaveBeenCalledTimes(2)

    poller.stop()
  })
})
