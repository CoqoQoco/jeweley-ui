import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'

import InsightSubTabs from './insight-sub-tabs.vue'

const tabs = [
  { value: 'problems', label: 'P', icon: 'bi-x', count: 2, group: 'fixed' },
  { value: 'forecast', label: 'F', icon: '', count: 0, group: 'fixed' },
  { value: 'trend', label: 'T', icon: '', count: null, group: 'data' }
]

const mountTabs = (modelValue = 'problems') => mount(InsightSubTabs, { props: { modelValue, tabs, ariaLabel: 'x', dataLabel: 'deep' } })

describe('InsightSubTabs', () => {
  it('renders two segmented tablists (fixed | data) with aria-selected, counts for fixed tabs only and one divider before the data group', () => {
    const wrapper = mountTabs('forecast')
    expect(wrapper.attributes('role')).toBe('group')
    expect(wrapper.findAll('[role="tablist"]')).toHaveLength(2)
    expect(wrapper.findAll('.toggle-group--sm')).toHaveLength(2)
    const buttons = wrapper.findAll('[role="tab"]')
    expect(buttons.map((b) => b.text())).toEqual(['P (2)', 'F (0)', 'T'])
    expect(buttons.map((b) => b.attributes('aria-selected'))).toEqual(['false', 'true', 'false'])
    // ทุกปุ่ม tab เข้าถึงได้ (ไม่ใช้ roving tabindex) — ลูกศรเลื่อนข้ามปุ่ม
    expect(buttons.map((b) => b.attributes('tabindex'))).toEqual([undefined, undefined, undefined])
    expect(wrapper.findAll('[role="separator"]')).toHaveLength(1)
  })

  it('the group caption is a non-interactive label: not a tab, not a button, not focusable, hidden from assistive tech', () => {
    const wrapper = mountTabs('problems')
    const caption = wrapper.find('.insight-sub-tabs__group-label')
    expect(caption.text()).toBe('deep')
    expect(caption.element.tagName).toBe('SPAN')
    expect(caption.attributes('aria-hidden')).toBe('true')
    expect(caption.attributes('role')).toBeUndefined()
    expect(caption.attributes('tabindex')).toBeUndefined()
    expect(caption.find('button').exists()).toBe(false)
    expect(wrapper.findAll('[role="tab"]').map((b) => b.text())).not.toContain('deep')
    expect(wrapper.findAll('button')).toHaveLength(3)
  })

  it('only the selected tab carries the active class together with aria-selected', () => {
    const wrapper = mountTabs('trend')
    const buttons = wrapper.findAll('[role="tab"]')
    expect(buttons.map((b) => b.classes().includes('toggle-group__btn--active'))).toEqual([false, false, true])
    expect(buttons.map((b) => b.attributes('aria-selected'))).toEqual(['false', 'false', 'true'])
  })

  it('click and arrow keys emit update:modelValue; arrows stop at the ends', async () => {
    const wrapper = mountTabs('problems')
    const buttons = wrapper.findAll('[role="tab"]')
    await buttons[2].trigger('click')
    await buttons[0].trigger('keydown.right')
    await buttons[0].trigger('keydown.left')
    await buttons[2].trigger('keydown.right')
    expect(wrapper.emitted('update:modelValue').map((e) => e[0])).toEqual(['trend', 'forecast'])
  })

  it('has no divider when there is only one group', () => {
    const wrapper = mount(InsightSubTabs, { props: { modelValue: 'problems', tabs: tabs.slice(0, 2) } })
    expect(wrapper.find('[role="separator"]').exists()).toBe(false)
  })
})

describe('InsightSubTabs — segmented look and navigation', () => {
  it('a group with no selected tab renders no active button (the other group owns the selection)', () => {
    const wrapper = mountTabs('trend')
    const groups = wrapper.findAll('[role="tablist"]')
    expect(groups[0].findAll('.toggle-group__btn--active')).toHaveLength(0)
    expect(groups[1].findAll('.toggle-group__btn--active')).toHaveLength(1)
  })

  it('arrow keys cross the group boundary (forecast -> trend) and the icon renders before the label', async () => {
    const wrapper = mountTabs('forecast')
    const buttons = wrapper.findAll('[role="tab"]')
    await buttons[1].trigger('keydown.right')
    expect(wrapper.emitted('update:modelValue').at(-1)).toEqual(['trend'])
    const other = mountTabs('problems')
    await other.findAll('[role="tab"]')[2].trigger('keydown.left')
    expect(other.emitted('update:modelValue').at(-1)).toEqual(['forecast'])
    expect(buttons[0].find('i.bi.bi-x').exists()).toBe(true)
  })
})
