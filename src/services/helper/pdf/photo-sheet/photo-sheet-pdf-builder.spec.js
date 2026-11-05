import { describe, it, expect } from 'vitest'
import { buildPhotoCaption, chunkRows, toPhotoSheetItems, PhotoSheetPdfBuilder } from './photo-sheet-pdf-builder.js'

describe('photo-sheet-pdf-builder', () => {
  it('caption = ลำดับ) แล้วต่อรหัสแม่พิมพ์', () => {
    expect(buildPhotoCaption(8, 'NF742M559')).toBe('8)NF742M559')
    expect(buildPhotoCaption(1, '')).toBe('1)')
  })

  it('chunkRows แบ่งแถวละ 4', () => {
    const rows = chunkRows([1, 2, 3, 4, 5, 6, 7, 8, 9])
    expect(rows.map((r) => r.length)).toEqual([4, 4, 1])
  })

  it('toPhotoSheetItems เรียงลำดับ 1..n และถอยรหัส mold -> productNumber -> stockNumber', () => {
    const out = toPhotoSheetItems([
      { mold: 'M1', imagePath: 'a.jpg' },
      { productNumber: 'P2', imageBlobPath: 'Stock/b.jpg' },
      { stockNumber: 'S3' }
    ])
    expect(out.map((i) => `${i.seq}:${i.moldCode}`)).toEqual(['1:M1', '2:P2', '3:S3'])
    expect(out[0].imagePath).toBe('a.jpg')
    expect(out[2].imagePath).toBeNull()
  })

  it('รูปโหลดไม่ได้ -> กล่องว่างแต่ยังมี caption, แถวสุดท้ายเติมให้ครบ 4 คอลัมน์', () => {
    const builder = new PhotoSheetPdfBuilder({
      docNo: 'ZE028',
      items: [
        { seq: 1, moldCode: 'AA', imageBase64: 'data:image/png;base64,xx' },
        { seq: 2, moldCode: 'BB', imageBase64: null }
      ]
    })
    const def = builder.getDocDefinition()
    expect(def.content[0].text).toBe('ZE028')
    const row = def.content[1]
    expect(row.columns).toHaveLength(4)
    expect(row.columns[0].stack[0].image).toBeDefined()
    expect(row.columns[1].stack[0].canvas).toBeDefined()
    expect(row.columns[1].stack[1].text).toBe('2)BB')
  })
})
