import { describe, it, expect } from 'vitest'
import { normalizeDocNo } from './photo-sheet-doc-no.js'

describe('normalizeDocNo', () => {
  it('trim ช่องว่างหัวท้าย', () => {
    expect(normalizeDocNo('  SO-001  ')).toBe('SO-001')
  })

  it('ค่าว่างหรือเว้นวรรคล้วน = สตริงว่าง', () => {
    expect(normalizeDocNo('')).toBe('')
    expect(normalizeDocNo('   ')).toBe('')
  })

  it('null/undefined ไม่กลายเป็นคำว่า undefined', () => {
    expect(normalizeDocNo(null)).toBe('')
    expect(normalizeDocNo(undefined)).toBe('')
  })
})
