import { describe, it, expect } from 'vitest'
import { mapPieces, filterPieces, diffChangedKeys, mergeRecent, pieceKey, formatUnitLabel } from './rfid-tracking-helpers.js'

const raw = (stockNumber, epc = null) => ({ stockNumber, productCode: 'P1', epc, boundBy: epc ? 'ann' : null })

describe('rfid-tracking-helpers', () => {
  it('mapPieces ใส่ rowKey / isBound และค่า fallback', () => {
    const [a, b] = mapPieces([raw('S1', 'AA'), raw('S2')])
    expect(a).toMatchObject({ rowKey: 'S1|P1', isBound: true, epc: 'AA', boundBy: 'ann' })
    expect(b).toMatchObject({ isBound: false, epc: '-', boundBy: '-' })
  })

  it('pieceKey ใช้ unitId เมื่อมี (ล็อตเดียวหลายแถวต้อง key ไม่ซ้ำ) ไม่มีใช้ stock|product', () => {
    expect(pieceKey({ stockNumber: 'S1', productCode: 'P1', unitId: 7 })).toBe('u7')
    expect(pieceKey({ stockNumber: 'S1', productCode: 'P1', unitId: null })).toBe('S1|P1')
  })

  it('mapPieces: หลายชิ้นในล็อตเดียว rowKey ไม่ซ้ำ + unitLabel = unitNo/จำนวนชิ้นของล็อตในใบรับ', () => {
    const rows = mapPieces([1, 2, 3].map((n) => ({ ...raw('S1'), unitId: 100 + n, unitNo: n })))
    expect(new Set(rows.map((r) => r.rowKey)).size).toBe(3)
    expect(rows.map((r) => r.unitLabel)).toEqual(['1/3', '2/3', '3/3'])
  })

  it('formatUnitLabel', () => {
    expect(formatUnitLabel(3, 6)).toBe('3/6')
    expect(formatUnitLabel(3, 0)).toBe('3')
    expect(formatUnitLabel(null, 6)).toBe('-')
  })

  it('filterPieces แยก all / bound / unbound', () => {
    const pieces = mapPieces([raw('S1', 'AA'), raw('S2')])
    expect(filterPieces(pieces, 'all')).toHaveLength(2)
    expect(filterPieces(pieces, 'bound').map((p) => p.stockNumber)).toEqual(['S1'])
    expect(filterPieces(pieces, 'unbound').map((p) => p.stockNumber)).toEqual(['S2'])
  })

  it('diffChangedKeys: รอบแรก (prev=null) ไม่มีอะไรเปลี่ยน', () => {
    expect(diffChangedKeys(null, mapPieces([raw('S1', 'AA')]))).toEqual({})
  })

  it('diffChangedKeys: จับชิ้นที่ผูก/ยกเลิก/เปลี่ยน EPC', () => {
    const prev = mapPieces([raw('S1'), raw('S2', 'AA'), raw('S3', 'BB'), raw('S4')])
    const next = mapPieces([raw('S1', 'CC'), raw('S2'), raw('S3', 'DD'), raw('S4')])
    expect(diffChangedKeys(prev, next)).toEqual({ 'S1|P1': true, 'S2|P1': true, 'S3|P1': true })
  })

  it('mergeRecent: initial ใช้ตามที่ได้ (ใหม่→เก่า) และ cap', () => {
    const items = [{ id: 5 }, { id: 4 }, { id: 3 }]
    expect(mergeRecent([], items, { initial: true, cap: 2 }).map((i) => i.id)).toEqual([5, 4])
  })

  it('mergeRecent: sinceId (เก่า→ใหม่) ถูกกลับให้ใหม่อยู่บน, ไม่ซ้ำ id, ไม่เกิน cap', () => {
    const current = [{ id: 3 }, { id: 2 }, { id: 1 }]
    const merged = mergeRecent(current, [{ id: 3, isActive: false }, { id: 4 }, { id: 5 }], { cap: 4 })
    expect(merged.map((i) => i.id)).toEqual([5, 4, 3, 2])
    expect(merged[2].isActive).toBe(false)
  })
})
