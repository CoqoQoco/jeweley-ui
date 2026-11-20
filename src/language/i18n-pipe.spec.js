import { describe, it, expect } from 'vitest'
import { createI18n } from 'vue-i18n'
import th from './th.js'
import en from './en.js'

// key path ที่ตั้งใจใช้ | เป็น plural จริง (ใส่ที่นี่เท่านั้น) — ข้อความทั่วไปต้องเขียน {'|'}
const PLURAL_ALLOWLIST = []

function collectPipes(node, path, out) {
  if (typeof node === 'string') {
    if (node.split("{'|'}").join('').includes('|') && !PLURAL_ALLOWLIST.includes(path)) out.push(path)
  } else if (node && typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) collectPipes(v, path ? `${path}.${k}` : k, out)
  }
}

describe('i18n pipe is not plural separator', () => {
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
})
