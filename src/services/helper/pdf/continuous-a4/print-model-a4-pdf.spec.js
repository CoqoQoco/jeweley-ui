import { describe, it, expect } from 'vitest'

import { buildPrintModelA4DocDefinition } from './print-model-a4-pdf.js'

const generatedAt = new Date(2026, 10, 14, 9, 5)

const buildModel = () => ({
  paper: { widthHundredthInch: 900, heightHundredthInch: 1100 },
  pages: [
    [
      { x: 1, y: 2, text: 'INV-001', fontSize: 12, bold: true },
      { x: 5, y: 3, text: '1,234.00', fontSize: 10, align: 'right', width: 1.2 }
    ],
    [{ x: 0.5, y: 0.5, text: 'page2', fontSize: 10 }]
  ]
})

const scaleOf = (def) => {
  const rect = def.content.find((c) => c.canvas).canvas[0]
  return rect.w / (9 * 72)
}

describe('buildPrintModelA4DocDefinition', () => {
  it('is A4 portrait with zero margins and one canvas per model page', () => {
    const def = buildPrintModelA4DocDefinition(buildModel(), { generatedAt })
    expect(def.pageSize).toBe('A4')
    expect(def.pageMargins).toBe(0)
    expect(def.content.filter((c) => c.canvas)).toHaveLength(2)
    expect(def.content.filter((c) => c.canvas)[1].pageBreak).toBe('before')
  })

  it('scales left-aligned primitive coordinates and font size', () => {
    const def = buildPrintModelA4DocDefinition(buildModel(), { generatedAt })
    const scale = scaleOf(def)
    const rect = def.content.find((c) => c.canvas).canvas[0]
    const item = def.content.find((c) => c.text === 'INV-001')
    expect(item.absolutePosition.x).toBeCloseTo(rect.x + 1 * 72 * scale, 1)
    expect(item.absolutePosition.y).toBeCloseTo(rect.y + 2 * 72 * scale + 12 * scale * 0.25, 1)
    expect(item.fontSize).toBeCloseTo(12 * scale, 1)
    expect(item.bold).toBe(true)
    expect(scale).toBeLessThan(1)
    expect(rect.w + 2 * rect.x).toBeCloseTo(595.28, 1)
  })

  it('wraps right-aligned primitive in fixed-width table', () => {
    const def = buildPrintModelA4DocDefinition(buildModel(), { generatedAt })
    const scale = scaleOf(def)
    const right = def.content.find((c) => c.table && c.table.body[0][0].text === '1,234.00')
    expect(right.table.widths[0]).toBeCloseTo(1.2 * 72 * scale, 1)
    expect(right.table.body[0][0].alignment).toBe('right')
    expect(right.layout.paddingLeft()).toBe(0)
    expect(right.absolutePosition.x).toBeGreaterThan(0)
  })

  it('draws the paper border and the note with timestamp', () => {
    const def = buildPrintModelA4DocDefinition(buildModel(), { generatedAt })
    const rect = def.content.find((c) => c.canvas).canvas[0]
    expect(rect.type).toBe('rect')
    const notes = def.content.filter((c) => c.table && c.table.body[0][0].text?.startsWith('ฉบับตรวจ'))
    expect(notes).toHaveLength(2)
    expect(notes[0].table.body[0][0].text).toContain('14/11/2026 09:05')
  })

  it('collapses newlines in text to a single space', () => {
    const model = { pages: [[{ x: 1, y: 1, text: 'a\nb\r\nc', fontSize: 10 }]] }
    const def = buildPrintModelA4DocDefinition(model, { generatedAt })
    expect(def.content.some((c) => c.text === 'a b c')).toBe(true)
  })

  it('handles empty model with one blank page', () => {
    const def = buildPrintModelA4DocDefinition(null, { generatedAt })
    expect(def.content.filter((c) => c.canvas)).toHaveLength(1)
    const def2 = buildPrintModelA4DocDefinition({ pages: [] }, { generatedAt })
    expect(def2.content.filter((c) => c.canvas)).toHaveLength(1)
  })
})
