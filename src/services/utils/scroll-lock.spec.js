import { describe, it, expect, beforeEach, vi } from 'vitest'

import { lockBodyScroll, unlockBodyScroll, getBodyScrollLockCount } from './scroll-lock.js'

function setScrollbar(width) {
  vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(1000)
  vi.spyOn(document.documentElement, 'clientWidth', 'get').mockReturnValue(1000 - width)
}

describe('scroll-lock', () => {
  beforeEach(() => {
    while (getBodyScrollLockCount() > 0) unlockBodyScroll()
    vi.restoreAllMocks()
    document.body.removeAttribute('style')
  })

  it('locks on the first call and restores on the last release (counter)', () => {
    setScrollbar(0)
    lockBodyScroll()
    lockBodyScroll()
    expect(document.body.style.overflow).toBe('hidden')
    unlockBodyScroll()
    expect(document.body.style.overflow).toBe('hidden')
    unlockBodyScroll()
    expect(document.body.style.overflow).toBe('')
    expect(getBodyScrollLockCount()).toBe(0)
  })

  it('restores the previous overflow and paddingRight (e.g. main-bar sidebar lock) instead of clearing them', () => {
    document.body.style.overflow = 'hidden'
    document.body.style.paddingRight = '3px'
    setScrollbar(0)
    lockBodyScroll()
    unlockBodyScroll()
    expect(document.body.style.overflow).toBe('hidden')
    expect(document.body.style.paddingRight).toBe('3px')
  })

  it('compensates for the vanishing scrollbar and removes the compensation on release', () => {
    setScrollbar(15)
    lockBodyScroll()
    expect(document.body.style.paddingRight).toBe('15px')
    unlockBodyScroll()
    expect(document.body.style.paddingRight).toBe('')
  })

  it('adds no padding when there is no scrollbar', () => {
    setScrollbar(0)
    lockBodyScroll()
    expect(document.body.style.paddingRight).toBe('')
    unlockBodyScroll()
  })

  it('an unmatched unlock is safe and does not touch the body', () => {
    document.body.style.overflow = 'auto'
    unlockBodyScroll()
    expect(document.body.style.overflow).toBe('auto')
    expect(getBodyScrollLockCount()).toBe(0)
    setScrollbar(0)
    lockBodyScroll()
    unlockBodyScroll()
    unlockBodyScroll()
    expect(getBodyScrollLockCount()).toBe(0)
    expect(document.body.style.overflow).toBe('auto')
  })
})
