import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AnnouncementCard from './announcement-card.vue'

function createWrapper(itemOverride = {}, propsOverride = {}) {
  return mount(AnnouncementCard, {
    global: {
      mocks: {
        $t: (key, params) => (params ? `${key}:${JSON.stringify(params)}` : key),
        $i18n: { locale: 'th' }
      }
    },
    props: {
      item: {
        id: 1,
        title: 'ประกาศทดสอบ',
        body: 'เนื้อหาทดสอบ',
        createBy: 'admin',
        publishStart: '2026-09-01T00:00:00',
        isPinned: false,
        audience: 'all',
        ...itemOverride
      },
      compact: true,
      ...propsOverride
    }
  })
}

describe('AnnouncementCard', () => {
  it('a) ไม่แสดง dev tag เมื่อ audience=all', () => {
    const wrapper = createWrapper({ audience: 'all' })

    expect(wrapper.find('.announcement-card__tag--dev').exists()).toBe(false)
  })

  it('b) แสดงข้อความ dev tag เมื่อ audience=dev', () => {
    const wrapper = createWrapper({ audience: 'dev' })

    const devTag = wrapper.find('.announcement-card__tag--dev')
    expect(devTag.exists()).toBe(true)
    expect(devTag.text()).toContain('view.announcement.devOnlyTag')
  })

  it('c) แสดง pinned tag เมื่อ isPinned=true', () => {
    const wrapper = createWrapper({ isPinned: true })

    expect(wrapper.find('.announcement-card__tag--pinned').exists()).toBe(true)
  })

  it('d) คลิกที่การ์ด emit เหตุการณ์ open', async () => {
    const wrapper = createWrapper()

    await wrapper.trigger('click')

    expect(wrapper.emitted('open')).toBeTruthy()
  })
})
