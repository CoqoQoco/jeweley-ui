import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import PrimeVue from 'primevue/config'

import TabViewGeneric from './TabViewGeneric.vue'

const tabs = [
  { value: 'one', label: 'One' },
  { value: 'two', label: 'Two', group: 'g', groupLabel: 'Group' }
]

const mountTabs = (props = {}) =>
  mount(TabViewGeneric, {
    props: { modelValue: 'one', tabs, ...props },
    global: { plugins: [PrimeVue] },
    slots: { one: '<p>slot one</p>', two: '<p>slot two</p>' }
  })

describe('TabViewGeneric', () => {
  it('default variant is underline: no segmented class, group labels still rendered (other pages unchanged)', () => {
    const wrapper = mountTabs()
    expect(TabViewGeneric.props.variant.default).toBe('underline')
    expect(wrapper.classes()).not.toContain('tab-view-generic--segmented')
    expect(wrapper.find('.tab-view-generic__group-label').text()).toBe('Group')
  })

  it('variant="segmented" adds the modifier; tabs keep tablist/tab roles, aria-selected and emit on click', async () => {
    const wrapper = mountTabs({ variant: 'segmented' })
    expect(wrapper.classes()).toContain('tab-view-generic--segmented')
    const buttons = wrapper.findAll('.tab-view-generic__nav [role="tab"]')
    expect(buttons.map((b) => b.attributes('aria-selected'))).toEqual(['true', 'false'])
    expect(buttons[0].classes()).toContain('tab-view-generic__tab--active')
    await buttons[1].trigger('click')
    expect(wrapper.emitted('update:modelValue')).toEqual([['two']])
  })

  it('rejects unknown variants and keeps lazy mounting: only the visited tab content renders', () => {
    expect(TabViewGeneric.props.variant.validator('pills')).toBe(false)
    const wrapper = mountTabs({ variant: 'segmented' })
    expect(wrapper.text()).toContain('slot one')
    expect(wrapper.text()).not.toContain('slot two')
  })
})
