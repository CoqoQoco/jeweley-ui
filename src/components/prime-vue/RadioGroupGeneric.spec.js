import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, nextTick } from 'vue'
import PrimeVue from 'primevue/config'

import RadioGroupGeneric from './RadioGroupGeneric.vue'

const global = { plugins: [PrimeVue] }

const options = [
  { value: 'a4', label: 'A4' },
  { value: 'bill', label: 'Bill' },
  { value: 'vat', label: 'Vat' }
]

const Host = defineComponent({
  components: { RadioGroupGeneric },
  props: { options: { type: Array, default: () => options } },
  data: () => ({ v1: 'vat', v2: 'bill' }),
  template: `<div>
    <RadioGroupGeneric id="g1" v-model="v1" :options="options" optionValue="value" />
    <RadioGroupGeneric id="g2" v-model="v2" :options="options" optionValue="value" />
  </div>`
})

const checkedOf = (root) => root.findAll('input[type="radio"]').map((i) => i.element.checked)
const highlightOf = (root) => root.findAll('.p-radiobutton').map((r) => r.classes().includes('p-highlight'))

describe('RadioGroupGeneric', () => {
  it('moves checked state and highlight class when the value changes', async () => {
    const wrapper = mount(RadioGroupGeneric, {
      props: { modelValue: 'vat', options, optionValue: 'value' },
      global
    })
    expect(checkedOf(wrapper)).toEqual([false, false, true])
    expect(highlightOf(wrapper)).toEqual([false, false, true])

    await wrapper.setProps({ modelValue: 'a4' })
    await nextTick()
    expect(checkedOf(wrapper)).toEqual([true, false, false])
    expect(highlightOf(wrapper)).toEqual([true, false, false])
  })

  it('user selection updates the previously checked radio and emits', async () => {
    const wrapper = mount(Host, { global })
    const g1 = wrapper.find('#g1')
    const inputs = g1.findAll('input[type="radio"]')
    inputs[0].element.checked = true
    await inputs[0].trigger('change')
    await nextTick()
    expect(wrapper.vm.v1).toBe('a4')
    expect(checkedOf(g1)).toEqual([true, false, false])
    expect(highlightOf(g1)).toEqual([true, false, false])
    expect(checkedOf(wrapper.find('#g2'))).toEqual([false, true, false])
  })

  it('gives each instance a distinct input id and shared name per group', () => {
    const wrapper = mount(Host, { global })
    const ids = wrapper.findAll('input[type="radio"]').map((i) => i.attributes('id'))
    expect(new Set(ids).size).toBe(6)
    const names = (sel) => wrapper.find(sel).findAll('input').map((i) => i.attributes('name'))
    const n1 = names('#g1')
    const n2 = names('#g2')
    expect(new Set(n1).size).toBe(1)
    expect(n1[0]).toBeTruthy()
    expect(n1[0]).not.toBe(n2[0])
    wrapper.findAll('label').forEach((l) => {
      expect(wrapper.find(`#${l.attributes('for')}`).exists()).toBe(true)
    })
  })
})

describe('RadioGroupGeneric emit contract', () => {
  it('emits update:modelValue once on user pick and not when the parent changes the value', async () => {
    const wrapper = mount(RadioGroupGeneric, {
      props: { modelValue: 'vat', options, optionValue: 'value' },
      global
    })
    await wrapper.setProps({ modelValue: 'bill' })
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    const inputs = wrapper.findAll('input[type="radio"]')
    inputs[0].element.checked = true
    await inputs[0].trigger('change')
    expect(wrapper.emitted('update:modelValue')).toEqual([['a4']])
  })
})
