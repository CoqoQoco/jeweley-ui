import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import PrimeVue from 'primevue/config'
import { createI18n } from 'vue-i18n'

import MultiSelectGeneric from './MultiSelectGeneric.vue'

const i18n = createI18n({
  legacy: false,
  locale: 'th',
  messages: { th: { common: { label: { selectedCount: 'เลือก {count} รายการ' } } } }
})

const options = [
  { label: 'A', value: 1 },
  { label: 'B', value: 2 },
  { label: 'C', value: 3 },
  { label: 'D', value: 4 },
  { label: 'E', value: 5 }
]

const mountIt = (props = {}) =>
  mount(MultiSelectGeneric, {
    props: { options, optionValue: 'value', ...props },
    global: { plugins: [PrimeVue, i18n] }
  })

describe('MultiSelectGeneric', () => {
  it('shows one chip per value when within the limit', () => {
    const wrapper = mountIt({ modelValue: [1, 2] })
    expect(wrapper.findAll('.p-multiselect-token')).toHaveLength(2)
    expect(wrapper.text()).not.toContain('เลือก 2 รายการ')
  })

  it('collapses to a summary chip with a title listing labels when over the limit', () => {
    const wrapper = mountIt({ modelValue: [1, 2, 3] })
    const chips = wrapper.findAll('.p-multiselect-token')
    expect(chips).toHaveLength(1)
    expect(chips[0].text()).toBe('เลือก 3 รายการ')
    expect(chips[0].attributes('title')).toBe('A, B, C')
  })

  it('supports a custom {count} label', () => {
    const wrapper = mountIt({ modelValue: [1, 2, 3], selectedItemsLabel: '{count} items' })
    expect(wrapper.find('.p-multiselect-token').text()).toBe('3 items')
  })

  it('does not throw and shows no summary for null/undefined modelValue', () => {
    for (const modelValue of [null, undefined]) {
      const wrapper = mountIt({ modelValue })
      expect(wrapper.find('.p-multiselect-token').exists()).toBe(false)
    }
  })

  it('never collapses when maxSelectedLabels is 0', () => {
    const wrapper = mountIt({ modelValue: [1, 2, 3, 4, 5], maxSelectedLabels: 0 })
    expect(wrapper.findAll('.p-multiselect-token')).toHaveLength(5)
    expect(wrapper.text()).not.toContain('เลือก 5 รายการ')
  })
})
