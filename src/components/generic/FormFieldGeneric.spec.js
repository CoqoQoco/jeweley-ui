import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'

import FormFieldGeneric from './FormFieldGeneric.vue'

const slots = { default: '<input class="form-control" />' }

describe('FormFieldGeneric', () => {
  it('error: wrapper gets invalid class, message rendered with role=alert, control gets aria attrs', async () => {
    const wrapper = mount(FormFieldGeneric, { props: { label: 'L', error: 'required' }, slots })
    expect(wrapper.classes()).toContain('form-field--invalid')
    const small = wrapper.find('small')
    expect(small.text()).toBe('required')
    expect(small.attributes('role')).toBe('alert')
    const input = wrapper.find('input')
    expect(input.attributes('aria-invalid')).toBe('true')
    expect(input.attributes('aria-describedby')).toBe(small.attributes('id'))
  })

  it('no error: no invalid class, no message, no aria attrs; clearing error removes them', async () => {
    const wrapper = mount(FormFieldGeneric, { props: { label: 'L' }, slots })
    expect(wrapper.classes()).not.toContain('form-field--invalid')
    expect(wrapper.find('small').exists()).toBe(false)
    expect(wrapper.find('input').attributes('aria-invalid')).toBeUndefined()

    await wrapper.setProps({ error: 'x' })
    await wrapper.vm.$nextTick()
    expect(wrapper.find('input').attributes('aria-invalid')).toBe('true')
    await wrapper.setProps({ error: '' })
    await wrapper.vm.$nextTick()
    expect(wrapper.classes()).not.toContain('form-field--invalid')
    expect(wrapper.find('input').attributes('aria-invalid')).toBeUndefined()
    expect(wrapper.find('input').attributes('aria-describedby')).toBeUndefined()
  })
})

describe('FormFieldGeneric with PrimeVue-like Dropdown', () => {
  const dropdownSlot = `<div class="p-dropdown"><span class="p-dropdown-label p-inputtext" role="combobox" aria-describedby="hint"></span><div class="p-hidden-accessible"><input readonly /></div></div>`

  it('aria lands on the combobox only, preserves pre-existing describedby after error clears', async () => {
    const wrapper = mount(FormFieldGeneric, { props: { label: 'L', error: 'x' }, slots: { default: dropdownSlot } })
    const combo = wrapper.find('[role="combobox"]')
    const id = wrapper.find('small').attributes('id')
    expect(combo.attributes('aria-invalid')).toBe('true')
    expect(combo.attributes('aria-describedby')).toBe(`hint ${id}`)
    expect(wrapper.findAll('[aria-invalid]')).toHaveLength(1)

    await wrapper.setProps({ error: '' })
    await wrapper.vm.$nextTick()
    expect(combo.attributes('aria-invalid')).toBeUndefined()
    expect(combo.attributes('aria-describedby')).toBe('hint')
  })
})
