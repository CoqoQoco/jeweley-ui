import { describe, expect, it } from 'vitest'

import {
  applyImageSuggestion,
  buildImageSuggestItems,
  clearImageSuggestFlag,
  dropAutoImage,
  needsImageSuggest,
  stripImageSuggestFields
} from './image-suggest.js'

const hit = { key: 'a', imageName: 'x.jpg', imagePath: 'x.jpg', sourceProductNumber: 'NF706SD7YL2' }

describe('needsImageSuggest', () => {
  it('แถวว่างรูปและมีรหัส ต้อง suggest', () => {
    expect(needsImageSuggest({ productNumber: 'A-1', imagePath: '' })).toBe(true)
  })
  it('ข้ามแถวรับเข้าแล้ว / เติมยอดล็อต / ไม่มีรหัส', () => {
    expect(needsImageSuggest({ productNumber: 'A', isReceipt: true })).toBe(false)
    expect(needsImageSuggest({ productNumber: 'A', topUpStockNumber: 'S1' })).toBe(false)
    expect(needsImageSuggest({ productNumber: '  ' })).toBe(false)
  })
  it('รูปที่ผู้ใช้เลือกเองห้ามทับ แต่รูปที่ระบบเติมทับได้ (ยกเว้น onlyEmpty)', () => {
    expect(needsImageSuggest({ productNumber: 'A', imagePath: 'u.jpg' })).toBe(false)
    expect(needsImageSuggest({ productNumber: 'A', imagePath: 'u.jpg', imageSuggestAuto: true })).toBe(true)
    expect(needsImageSuggest({ productNumber: 'A', imagePath: 'u.jpg', imageSuggestAuto: true }, { onlyEmpty: true })).toBe(false)
  })
})

describe('buildImageSuggestItems', () => {
  it('สร้าง items เฉพาะแถวที่เข้าเกณฑ์', () => {
    const rows = [
      { id: 1, productNumber: ' A-1 ' },
      { id: 2, productNumber: 'B', imagePath: 'u.jpg' }
    ]
    expect(buildImageSuggestItems(rows, (r) => r.id)).toEqual([{ key: 1, productNumber: 'A-1' }])
  })
})

describe('applyImageSuggestion / dropAutoImage', () => {
  it('เติมรูปพร้อม flag', () => {
    const row = { productNumber: 'A', imagePath: null, imageYear: null }
    expect(applyImageSuggestion(row, hit)).toBe(true)
    expect(row).toMatchObject({ imagePath: 'x.jpg', imageSuggestAuto: true, imageSuggestSource: 'NF706SD7YL2', imageYear: null })
  })
  it('ไม่ทับรูปที่ผู้ใช้เลือกเอง', () => {
    const row = { imagePath: 'u.jpg', imageSuggestAuto: false }
    expect(applyImageSuggestion(row, hit)).toBe(false)
    expect(row.imagePath).toBe('u.jpg')
  })
  it('ล้างรูปเฉพาะที่ระบบเติม', () => {
    const auto = { imageName: 'x', imagePath: 'x', imageSuggestAuto: true }
    expect(dropAutoImage(auto)).toBe(true)
    expect(auto).toMatchObject({ imageName: null, imagePath: null, imageSuggestAuto: false })
    const manual = { imagePath: 'u.jpg', imageSuggestAuto: false }
    expect(dropAutoImage(manual)).toBe(false)
    expect(manual.imagePath).toBe('u.jpg')
  })
  it('ผู้ใช้เลือกรูปเอง ล้าง flag แล้วไม่ถูกทับ', () => {
    const row = { imagePath: 'x.jpg', imageSuggestAuto: true, imageSuggestSource: 'S' }
    clearImageSuggestFlag(row)
    expect(applyImageSuggestion(row, hit)).toBe(false)
  })
})

describe('stripImageSuggestFields', () => {
  it('ตัด flag ก่อนส่ง', () => {
    const out = stripImageSuggestFields({ a: 1, imageSuggestAuto: true, imageSuggestSource: 'S' })
    expect(out).toEqual({ a: 1 })
  })
})
