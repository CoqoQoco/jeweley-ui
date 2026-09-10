import { describe, it, expect, afterEach } from 'vitest'
import { PUBLIC_SITE_BASE_URL, buildPublicUrl } from './public-site-config.js'

describe('buildPublicUrl', () => {
  afterEach(() => {
    delete import.meta.env.VITE_PUBLIC_SITE_URL
  })

  it('ต่อ path ปกติเข้ากับ base', () => {
    expect(buildPublicUrl('/p/DK-123-abcd1234')).toBe(`${PUBLIC_SITE_BASE_URL}/p/DK-123-abcd1234`)
  })

  it('base มี / ท้าย → ตัดทิ้งก่อนต่อ ไม่ให้ได้ // ซ้ำ', () => {
    import.meta.env.VITE_PUBLIC_SITE_URL = 'https://example.com/'
    expect(buildPublicUrl('/p/abc')).toBe('https://example.com/p/abc')
  })

  it('path ไม่มี / นำหน้า → เติม / ให้', () => {
    expect(buildPublicUrl('p/abc')).toBe(`${PUBLIC_SITE_BASE_URL}/p/abc`)
  })

  it('path ว่าง → คืน base เฉยๆ ไม่ได้ undefined ต่อท้าย', () => {
    expect(buildPublicUrl('')).toBe(PUBLIC_SITE_BASE_URL)
  })

  it('path เป็น null → คืน base เฉยๆ', () => {
    expect(buildPublicUrl(null)).toBe(PUBLIC_SITE_BASE_URL)
  })
})
