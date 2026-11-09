import { describe, it, expect } from 'vitest'
import { buildPhotoCaption, chunkRows, toPhotoSheetItems, PhotoSheetPdfBuilder } from './photo-sheet-pdf-builder.js'

describe('photo-sheet-pdf-builder', () => {
  it('caption = ลำดับ) แล้วต่อรหัสแม่พิมพ์', () => {
    expect(buildPhotoCaption(8, 'NF742M559')).toBe('8) NF742M559')
    expect(buildPhotoCaption(1, '')).toBe('1) ')
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
    const row = def.content[0]
    expect(row.columns).toHaveLength(4)
    expect(row.columns[0].stack[0].image).toBeDefined()
    expect(row.columns[1].stack[0].canvas).toBeDefined()
    expect(row.columns[1].stack[1].text).toBe('2) BB')
  })

  it('เลขเอกสารอยู่ใน header กึ่งกลางทุกหน้า ไม่อยู่ใน content', () => {
    const def = new PhotoSheetPdfBuilder({ docNo: 'ZE028', items: [{ seq: 1, moldCode: 'AA' }] }).getDocDefinition()
    for (const page of [1, 2]) {
      const h = def.header(page)
      expect(h.text).toBe('ZE028')
      expect(h.alignment).toBe('center')
      expect(h.fontSize).toBe(22)
      expect(h.bold).toBe(true)
    }
    expect(def.content.some((c) => c.text === 'ZE028')).toBe(false)
    expect(def.content).toHaveLength(1)
  })

  it('margin บนเว้นที่ให้ header, ซ้าย/ขวา/ล่างคงเดิม', () => {
    const def = new PhotoSheetPdfBuilder({ docNo: 'ZE028', items: [] }).getDocDefinition()
    expect(def.pageMargins).toEqual([30, 60, 30, 30])
  })

  it('docNo ว่าง -> header ว่างไม่พัง', () => {
    const def = new PhotoSheetPdfBuilder({ docNo: '', items: [] }).getDocDefinition()
    expect(def.header(1).text).toBe('')
    expect(def.content).toEqual([])
  })
})
