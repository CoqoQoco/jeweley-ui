import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'

import ToggleGroupGeneric from './ToggleGroupGeneric.vue'

const options = [
  { value: 'a', label: 'A', title: 'tip A' },
  { value: 'b', label: 'B', icon: 'bi-list-check' }
]

describe('ToggleGroupGeneric', () => {
  it('default markup is unchanged: medium size, tablist/tab roles, aria-selected, active class, no icon', () => {
    const wrapper = mount(ToggleGroupGeneric, { props: { modelValue: 'a', options, ariaLabel: 'x' } })
    expect(wrapper.classes()).toEqual(['toggle-group'])
    expect(wrapper.attributes('role')).toBe('tablist')
    expect(wrapper.attributes('aria-label')).toBe('x')
    const buttons = wrapper.findAll('[role="tab"]')
    expect(buttons.map((b) => b.attributes('aria-selected'))).toEqual(['true', 'false'])
    expect(buttons[0].classes()).toContain('toggle-group__btn--active')
    expect(buttons[0].attributes('title')).toBe('tip A')
    expect(buttons[0].find('i').exists()).toBe(false)
  })

  it('size="sm" only adds the modifier class; invalid sizes are rejected by the validator', () => {
    const wrapper = mount(ToggleGroupGeneric, { props: { modelValue: 'a', options, size: 'sm' } })
    expect(wrapper.classes()).toContain('toggle-group--sm')
    expect(ToggleGroupGeneric.props.size.default).toBe('md')
    expect(ToggleGroupGeneric.props.size.validator('lg')).toBe(false)
  })

  it('optional option.icon renders a bootstrap icon before the label', () => {
    const wrapper = mount(ToggleGroupGeneric, { props: { modelValue: 'a', options } })
    const icon = wrapper.findAll('[role="tab"]')[1].find('i')
    expect(icon.classes()).toEqual(['bi', 'bi-list-check'])
  })

  it('emits only for a different value and never when disabled', async () => {
    const wrapper = mount(ToggleGroupGeneric, { props: { modelValue: 'a', options } })
    const buttons = wrapper.findAll('[role="tab"]')
    await buttons[0].trigger('click')
    await buttons[1].trigger('click')
    expect(wrapper.emitted('update:modelValue')).toEqual([['b']])
    const disabled = mount(ToggleGroupGeneric, { props: { modelValue: 'a', options, disabled: true } })
    await disabled.findAll('[role="tab"]')[1].trigger('click')
    expect(disabled.emitted('update:modelValue')).toBeUndefined()
  })
})
