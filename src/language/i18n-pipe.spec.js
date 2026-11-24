import { describe, it, expect, vi, afterEach } from 'vitest'
import { createI18n } from 'vue-i18n'
import th from './th.js'
import en from './en.js'

// key path ที่ตั้งใจใช้ | เป็น plural จริง (ใส่ที่นี่เท่านั้น) — ข้อความทั่วไปต้องเขียน {'|'}
const PLURAL_ALLOWLIST = []

// key path ที่ตั้งใจใช้ linked message `@:key` จริง (ใส่ที่นี่เท่านั้น) — ข้อความทั่วไปต้องเขียน {'@'}
const LINKED_ALLOWLIST = []

function collectAts(node, path, out) {
  if (typeof node === 'string') {
    if (node.split("{'@'}").join('').includes('@') && !LINKED_ALLOWLIST.includes(path)) out.push(path)
  } else if (node && typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) collectAts(v, path ? `${path}.${k}` : k, out)
  }
}

function collectPipes(node, path, out) {
  if (typeof node === 'string') {
    if (node.split("{'|'}").join('').includes('|') && !PLURAL_ALLOWLIST.includes(path)) out.push(path)
  } else if (node && typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) collectPipes(v, path ? `${path}.${k}` : k, out)
  }
}

afterEach(() => vi.restoreAllMocks())

describe('i18n reserved chars (| plural, @ linked) must be escaped', () => {
  it.each([
    ['th', th],
    ['en', en]
  ])('%s: ไม่มี | ดิบในข้อความ (ต้องเขียน {\'|\'})', (_, messages) => {
    const bad = []
    collectPipes(messages, '', bad)
    expect(bad).toEqual([])
  })

  it('render view.stock.product.printTitle ได้ครบทั้งสองท่อน', () => {
    const i18n = createI18n({ legacy: true, locale: 'th', messages: { th } })
    expect(i18n.global.t('view.stock.product.printTitle', { stockNumber: 'DK1' })).toBe(
      'พิมพ์ป้ายสินค้า | เลขที่ผลิต: DK1'
    )
  })

  it.each([
    ['th', th],
    ['en', en]
  ])('%s: ไม่มี @ ดิบในข้อความ (ต้องเขียน {\'@\'})', (_, messages) => {
    const bad = []
    collectAts(messages, '', bad)
    expect(bad).toEqual([])
  })

  it.each([
    ['th', th, 'แอท (@)'],
    ['en', en, 'At (@)']
  ])('%s: render view.stock.product.remarkAt ได้ @ และไม่มี error/warn ตอนคอมไพล์', (locale, messages, expected) => {
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const i18n = createI18n({ legacy: true, locale, messages: { [locale]: messages } })
    expect(i18n.global.t('view.stock.product.remarkAt')).toBe(expected)
    expect(errSpy).not.toHaveBeenCalled()
    expect(warnSpy).not.toHaveBeenCalled()
  })
})
