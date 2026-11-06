import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TicketDeployBadge from './ticket-deploy-badge.vue'

const mountBadge = (deployStatus) =>
  mount(TicketDeployBadge, {
    props: deployStatus === undefined ? {} : { deployStatus },
    global: { mocks: { $t: (k) => k } }
  })

describe('TicketDeployBadge', () => {
  it.each([
    ['none', 'view.ticket.deploy.none', 'deploy-none'],
    ['pending', 'view.ticket.deploy.pending', 'deploy-pending'],
    ['deployed', 'view.ticket.deploy.deployed', 'deploy-deployed']
  ])('แสดงสถานะ %s', (status, text, cls) => {
    const w = mountBadge(status)
    expect(w.text()).toBe(text)
    expect(w.classes()).toContain(cls)
  })

  it.each([['weird'], [''], [undefined]])('ค่าแปลก (%s) fallback เป็น none', (status) => {
    const w = mountBadge(status)
    expect(w.text()).toBe('view.ticket.deploy.none')
    expect(w.classes()).toContain('deploy-none')
  })
})
