import { describe, it, expect, vi, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'

import CopyButtonGeneric from './CopyButtonGeneric.vue'

const mountButton = (props = {}) =>
  mount(CopyButtonGeneric, {
    props: { value: 'dkm_secret', ...props },
    global: { mocks: { $t: (key) => key } }
  })

afterEach(() => {
  vi.restoreAllMocks()
  delete navigator.clipboard
})

describe('CopyButtonGeneric', () => {
  it('writes the value to the clipboard, swaps to check icon + copied label and announces via aria-live', async () => {
    const writeText = vi.fn().mockResolvedValue()
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true })
    const wrapper = mountButton()
    expect(wrapper.find('i').classes()).toContain('bi-clipboard')
    await wrapper.find('button').trigger('click')
    await flushPromises()
    expect(writeText).toHaveBeenCalledWith('dkm_secret')
    expect(wrapper.find('i').classes()).toContain('bi-check2')
    expect(wrapper.text()).toContain('common.btn.copied')
    expect(wrapper.find('[aria-live="polite"]').text()).toBe('common.btn.copied')
    expect(wrapper.emitted('copied')).toHaveLength(1)
  })

  it('emits fail (and stays unchecked) when neither clipboard API nor execCommand works', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: vi.fn().mockRejectedValue(new Error('denied')) },
      configurable: true
    })
    document.execCommand = vi.fn().mockReturnValue(false)
    const wrapper = mountButton()
    await wrapper.find('button').trigger('click')
    await flushPromises()
    expect(wrapper.emitted('fail')).toHaveLength(1)
    expect(wrapper.emitted('copied')).toBeUndefined()
    expect(wrapper.find('i').classes()).toContain('bi-clipboard')
  })

  it('is disabled when value is empty', () => {
    const wrapper = mountButton({ value: '' })
    expect(wrapper.find('button').attributes('disabled')).toBeDefined()
  })
})
