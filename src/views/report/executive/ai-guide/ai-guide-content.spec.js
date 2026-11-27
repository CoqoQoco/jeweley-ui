import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import PrimeVue from 'primevue/config'

import th from '@/language/th.js'
import en from '@/language/en.js'
import thGuide from '@/language/view/ai-connector/th.js'
import enGuide from '@/language/view/ai-connector/en.js'

import indexView from './index-view.vue'
import {
  GUIDE_CATEGORIES,
  GUIDE_TOOLS,
  GUIDE_SENSITIVE_VALUES,
  GUIDE_NOT_YET_KEYS,
  GUIDE_TIP_KEYS,
  GUIDE_APP_KEYS
} from './ai-guide-content.js'

const questions = GUIDE_CATEGORIES.flatMap((c) => c.questions)
const lookup = (obj, path) => path.split('.').reduce((o, k) => (o ? o[k] : undefined), obj)

// metric_code ที่ seed ใน tbm_ai_glossary (jewelry-api 20261124_01_ai_connector.sql ข้อ 9) — เพิ่ม/ลบแถวต้องแก้ที่นี่ด้วย (docs/ai-connector.md checklist ข้อ 11)
const GLOSSARY_CODES = [
  'stale_plan',
  'unpaid_invoice',
  'so_gold_rate',
  'diff_loss',
  'worker_slip_mixed_metal',
  'weight_actual',
  'stock_gold_negative',
  'production_receipt_legacy',
  'bottleneck',
  'customer_open_plan',
  'melted_plan'
]

describe('ai-guide-content', () => {
  it('glossary questions only reference real glossary metric codes', () => {
    const glossaryQs = questions.filter((q) => q.tool === 'get_glossary')
    expect(glossaryQs.length).toBeGreaterThan(0)
    for (const q of glossaryQs) for (const f of q.fields) expect(GLOSSARY_CODES).toContain(f)
  })

  it('has 8 categories with unique question keys', () => {
    expect(GUIDE_CATEGORIES).toHaveLength(8)
    const keys = questions.map((q) => q.key)
    expect(new Set(keys).size).toBe(keys.length)
  })

  it('every question uses a known tool, has fields and valid sensitive values', () => {
    for (const q of questions) {
      expect(GUIDE_TOOLS).toContain(q.tool)
      expect(q.fields.length).toBeGreaterThan(0)
      for (const s of q.sensitive) expect(GUIDE_SENSITIVE_VALUES).toContain(s)
    }
  })

  it('every i18n key exists in both th and en, and no text has unescaped @ or |', () => {
    const paths = [
      ...GUIDE_CATEGORIES.map((c) => `guide.cat.${c.key}`),
      ...GUIDE_CATEGORIES.filter((c) => c.requires).map((c) => `guide.catRequires.${c.key}`),
      ...questions.map((q) => `guide.q.${q.key}`),
      ...questions.flatMap((q) => q.sensitive.map((s) => `guide.needs.${s}`)),
      ...GUIDE_NOT_YET_KEYS.map((k) => `guide.notYet.${k}`),
      ...GUIDE_TIP_KEYS.map((k) => `guide.tips.${k}`),
      'guide.tips.masked',
      'guide.startFreeForm',
      ...GUIDE_APP_KEYS.map((k) => `guide.app${k.charAt(0).toUpperCase()}${k.slice(1)}`)
    ]
    for (const lang of [thGuide, enGuide]) {
      for (const path of paths) {
        const text = lookup(lang, path)
        expect(typeof text, path).toBe('string')
        expect(text.length, path).toBeGreaterThan(0)
        expect(text.replace(/\{'[@|]'\}/g, ''), path).not.toMatch(/[@|]/)
      }
    }
  })
})

describe('ai-guide index-view smoke (real i18n)', () => {
  it('renders every question as real text with a copy button, and tags sensitive ones', () => {
    setActivePinia(createPinia())
    const i18n = createI18n({ legacy: false, locale: 'th', fallbackLocale: 'th', globalInjection: true, messages: { th, en } })
    const wrapper = mount(indexView, {
      global: {
        plugins: [i18n, PrimeVue],
        mocks: { $router: { push: () => {} } },
        stubs: { PageHeaderGeneric: { template: '<div><slot name="actions" /></div>' } }
      }
    })
    expect(wrapper.findAll('.question-row')).toHaveLength(questions.length)
    expect(wrapper.text()).toContain('ยอดบิลที่ยังไม่ได้รับเงินเลยรวมเท่าไหร่')
    expect(wrapper.text()).toContain('ต้องเปิด: ต้นทุน')
    expect(wrapper.text()).toContain('ยังถามไม่ได้')
    expect(wrapper.text()).toContain('Gemini: พิมพ์ @ แล้วเลือก Dk Jewelry')
  })
})
