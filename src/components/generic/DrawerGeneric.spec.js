import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'

import DrawerGeneric from './DrawerGeneric.vue'
import { getBodyScrollLockCount, unlockBodyScroll } from '@/services/utils/scroll-lock.js'

const mountDrawer = (props = {}) =>
  mount(DrawerGeneric, { props: { show: false, ...props }, slots: { content: '<p>x</p>' }, global: { stubs: { teleport: true, transition: false } } })

describe('DrawerGeneric scroll lock', () => {
  beforeEach(() => {
    vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(1000)
    vi.spyOn(document.documentElement, 'clientWidth', 'get').mockReturnValue(985)
    document.body.removeAttribute('style')
  })

  afterEach(() => {
    while (getBodyScrollLockCount() > 0) unlockBodyScroll()
    vi.restoreAllMocks()
  })

  it('locks the page while shown (with scrollbar compensation) and releases when hidden', async () => {
    const wrapper = mountDrawer()
    expect(document.body.style.overflow).toBe('')
    await wrapper.setProps({ show: true })
    expect(document.body.style.overflow).toBe('hidden')
    expect(document.body.style.paddingRight).toBe('15px')
    await wrapper.setProps({ show: false })
    expect(document.body.style.overflow).toBe('')
    expect(document.body.style.paddingRight).toBe('')
    wrapper.unmount()
  })

  it('locks when mounted already open and releases when unmounted while open', () => {
    const wrapper = mountDrawer({ show: true })
    expect(document.body.style.overflow).toBe('hidden')
    wrapper.unmount()
    expect(document.body.style.overflow).toBe('')
    expect(getBodyScrollLockCount()).toBe(0)
  })

  it('two open drawers do not unlock each other', async () => {
    const a = mountDrawer({ show: true })
    const b = mountDrawer({ show: true })
    await a.setProps({ show: false })
    expect(document.body.style.overflow).toBe('hidden')
    b.unmount()
    expect(document.body.style.overflow).toBe('')
    a.unmount()
  })

  it('ESC still emits close while shown and not after hiding', async () => {
    const wrapper = mountDrawer({ show: true })
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    expect(wrapper.emitted('close')).toHaveLength(1)
    await wrapper.setProps({ show: false })
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    expect(wrapper.emitted('close')).toHaveLength(1)
    wrapper.unmount()
  })
})
