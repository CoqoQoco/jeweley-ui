import { describe, expect, it } from 'vitest'
import { bindLocation, piecesFromEntries, piecesSignature, summarizeTagReads, tagBadgeState } from './stock-tag-logic.js'

const found = (epc, stockNumber, productCode, extra = {}) => ({ epc, check: 'found', piece: { stockNumber, productCode, status: 'IN_STOCK', ...extra } })

describe('piecesFromEntries', () => {
  it('ได้เฉพาะแท็กที่พบสินค้า ไม่ซ้ำคู่', () => {
    const entries = [
      found('A', 'S1', 'P1'),
      found('B', 'S1', 'P1'),
      found('C', 'S1', 'P2'),
      { epc: 'D', check: 'unbound' },
      { epc: 'E', check: 'unchecked' }
    ]
    expect(piecesFromEntries(entries)).toEqual([
      { stockNumber: 'S1', productCode: 'P1' },
      { stockNumber: 'S1', productCode: 'P2' }
    ])
  })

  it('ตัดที่ 500 และข้ามชิ้นที่ไม่มี productCode', () => {
    const many = Array.from({ length: 600 }, (_, i) => found(`E${i}`, `S${i}`, 'P'))
    expect(piecesFromEntries(many)).toHaveLength(500)
    expect(piecesFromEntries([{ epc: 'X', check: 'found', piece: { stockNumber: 'S' } }])).toEqual([])
  })

  it('signature ไม่สนลำดับ', () => {
    const a = [{ stockNumber: 'S1', productCode: 'P1' }, { stockNumber: 'S2', productCode: 'P2' }]
    expect(piecesSignature(a)).toBe(piecesSignature([...a].reverse()))
  })
})

describe('summarizeTagReads', () => {
  it('นับอ่านได้/พบสินค้า/ไม่รู้จัก/ขายแล้ว/ยังไม่ตรวจ', () => {
    const entries = [
      found('A', 'S1', 'P1'),
      found('B', 'S1', 'P1'),
      found('C', 'S2', 'P1', { soldMismatch: true }),
      found('D', 'S3', 'P1', { status: 'SOLD' }),
      { epc: 'E', check: 'unbound' },
      { epc: 'F', check: 'unchecked' }
    ]
    expect(summarizeTagReads(entries)).toEqual({ read: 6, found: 3, unknown: 1, sold: 2, pending: 1 })
  })
})

describe('tagBadgeState', () => {
  it('จัดสถานะ ผูกครบ/ไม่ผูก/บางชิ้น', () => {
    expect(tagBadgeState({ tagTotalUnits: 3, tagBoundUnits: 3 })).toEqual({ kind: 'bound', bound: 3, total: 3 })
    expect(tagBadgeState({ tagTotalUnits: 3, tagBoundUnits: 0 })).toEqual({ kind: 'unbound', bound: 0, total: 3 })
    expect(tagBadgeState({ tagTotalUnits: 3, tagBoundUnits: 1 })).toEqual({ kind: 'partial', bound: 1, total: 3 })
  })

  it('ไม่มีข้อมูลหรือไม่มีชิ้น = none', () => {
    expect(tagBadgeState({}).kind).toBe('none')
    expect(tagBadgeState({ tagTotalUnits: 0, tagBoundUnits: 0 }).kind).toBe('none')
    expect(tagBadgeState(null).kind).toBe('none')
  })
})

describe('bindLocation', () => {
  it('ส่ง stock และ productCode เมื่อมี', () => {
    expect(bindLocation('DK1', 'R1')).toEqual({ path: '/stock/rfid-bind', query: { stock: 'DK1', productCode: 'R1' } })
    expect(bindLocation('DK1', '').query).toEqual({ stock: 'DK1' })
  })
})
