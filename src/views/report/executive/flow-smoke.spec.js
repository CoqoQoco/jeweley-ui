// smoke: mount แผงรายละเอียดด้วย i18n จริง + PrimeVue จริง กัน template/slot พังตอน runtime
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import PrimeVue from 'primevue/config'

import th from '@/language/th.js'
import en from '@/language/en.js'
import FlowPanel from './components/flow/flow-panel.vue'
import FlowBossBoard from './components/flow/flow-boss-board.vue'
import FlowChipBar from './components/flow/flow-chip-bar.vue'
import FlowLensBar from './components/flow/flow-lens-bar.vue'
import { buildPanelModel } from './flow-panel-models.js'
import { buildBossTiles, buildStationModels } from './flow-helpers.js'
import { board, zones } from './flow-test-data.js'

const make = (locale) => createI18n({ legacy: false, locale, fallbackLocale: 'th', messages: { th, en } })
const opts = (locale) => ({ global: { plugins: [make(locale), PrimeVue], stubs: { SectionCardGeneric: { template: '<div><slot /></div>' } } } })

describe('flow components smoke', () => {
  ;['th', 'en'].forEach((locale) => {
    it(`renders every panel in ${locale} without leftover i18n keys`, () => {
      const i18n = make(locale)
      const t = (k, p) => i18n.global.t(k, p)
      ;['all', 'z-mold', 'z-prod', 'z-recv', 'z-stock', 'z-mat', 'z-sales', 'p-trim', 'm-design'].forEach((selected) => {
        const blocks = buildPanelModel({ board, zones, selected, lens: 'worker', compare: 'gold', stockLens: 'sloc', stockSel: '' }, t)
        const wrapper = mount(FlowPanel, { props: { blocks }, ...opts(locale) })
        expect(wrapper.text()).not.toContain('view.executive.flow')
        expect(wrapper.text().length).toBeGreaterThan(20)
        wrapper.unmount()
      })
    })

    it(`renders boss tiles, lens bar and chip bar in ${locale}`, () => {
      const i18n = make(locale)
      const t = (k, p) => i18n.global.t(k, p)
      const tiles = buildBossTiles(board, t)
      const boss = mount(FlowBossBoard, { props: { tiles }, ...opts(locale) })
      expect(boss.findAll('button')).toHaveLength(6)
      boss.findAll('button')[1].trigger('click')
      expect(boss.emitted('select')[0]).toEqual(['z-prod|worker|'])
      const lens = mount(FlowLensBar, { props: { lens: 'time', compare: '' }, ...opts(locale) })
      expect(lens.findAll('button')).toHaveLength(8)
      const stations = buildStationModels({ board, zones }, {}, t)
      const chips = mount(FlowChipBar, { props: { selected: 'z-prod', stations }, ...opts(locale) })
      expect(chips.findAll('button').length).toBe(7 + 7 + 5)
      expect(chips.text()).not.toContain('view.executive.flow')
    })
  })
})
