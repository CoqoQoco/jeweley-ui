import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import AnnouncementFeed from './announcement-feed.vue'

function createWrapper(propsOverride = {}) {
  return mount(AnnouncementFeed, {
    global: {
      mocks: {
        $t: (key, params) => (params ? `${key}:${JSON.stringify(params)}` : key),
        $i18n: { locale: 'th' },
        $router: { push: vi.fn() }
      },
      stubs: {
        'announcement-detail-modal': {
          name: 'AnnouncementDetailModalStub',
          props: ['showModal', 'item'],
          template: '<div class="detail-modal-stub" :data-show-modal="showModal"></div>'
        }
      }
    },
    props: {
      items: [],
      total: 0,
      canManage: false,
      ...propsOverride
    }
  })
}

const ITEMS = [
  { id: 1, title: 'ประกาศ A', body: 'เนื้อหา A', createBy: 'admin', publishStart: '2026-09-01T00:00:00' },
  { id: 2, title: 'ประกาศ B', body: 'เนื้อหา B', createBy: 'admin', publishStart: '2026-09-02T00:00:00' }
]

describe('AnnouncementFeed', () => {
  it('renders empty state when items=[]', () => {
    const wrapper = createWrapper({ items: [], total: 0 })

    expect(wrapper.find('.empty-state').exists()).toBe(true)
    expect(wrapper.find('.announcement-feed-list').exists()).toBe(false)
  })

  it('renders one card per item and keeps given order', () => {
    const wrapper = createWrapper({ items: ITEMS, total: ITEMS.length })

    const cards = wrapper.findAll('.announcement-card')
    expect(cards.length).toBe(2)
    expect(cards[0].find('.announcement-card__title').text()).toBe('ประกาศ A')
    expect(cards[1].find('.announcement-card__title').text()).toBe('ประกาศ B')
  })

  it('a) empty + canManage=false: shows emptyTitle, no createFirst button, no tips', () => {
    const wrapper = createWrapper({ items: [], total: 0, canManage: false })

    expect(wrapper.find('.empty-state__title').text()).toBe('view.announcement.feed.emptyTitle')
    expect(wrapper.text()).not.toContain('view.announcement.feed.createFirst')
    expect(wrapper.find('.empty-state__tips').exists()).toBe(false)
    expect(wrapper.find('.feed-toolbar').exists()).toBe(false)
  })

  it('b) empty + canManage=true: shows createFirst button and 3 tips, manage toolbar NOT rendered', () => {
    const wrapper = createWrapper({ items: [], total: 0, canManage: true })

    expect(wrapper.text()).toContain('view.announcement.feed.createFirst')
    expect(wrapper.find('.empty-state__tips').findAll('span').length).toBe(3)
    expect(wrapper.find('.feed-toolbar').exists()).toBe(false)
  })

  it('c) non-empty + canManage=true: manage toolbar button rendered', () => {
    const wrapper = createWrapper({ items: ITEMS, total: ITEMS.length, canManage: true })

    expect(wrapper.find('.feed-toolbar').exists()).toBe(true)
  })

  it('load-more button visible only when items.length < total and emits load-more', async () => {
    const wrapperFull = createWrapper({ items: ITEMS, total: ITEMS.length })
    expect(wrapperFull.find('.load-more-row').exists()).toBe(false)

    const wrapperMore = createWrapper({ items: ITEMS, total: 5 })
    expect(wrapperMore.find('.load-more-row').exists()).toBe(true)

    await wrapperMore.find('.load-more-row button').trigger('click')
    expect(wrapperMore.emitted('load-more')).toBeTruthy()
  })

  it('clicking a card opens the detail modal (modal receives showModal=true)', async () => {
    const wrapper = createWrapper({ items: ITEMS, total: ITEMS.length })

    expect(wrapper.find('.detail-modal-stub').attributes('data-show-modal')).toBe('false')

    await wrapper.findAll('.announcement-card')[0].trigger('click')

    expect(wrapper.find('.detail-modal-stub').attributes('data-show-modal')).toBe('true')
  })
})
