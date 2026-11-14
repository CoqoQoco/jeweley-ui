import { describe, it, expect } from 'vitest'
import {
  applyReads,
  applyCheckResult,
  chunkEpcs,
  countEntries,
  filterEntries,
  isNewEntry,
  shortEpc,
  uncheckedEpcs,
  epcListText,
  removeEntry,
  formatElapsed,
  summarizeBound,
  formatLotQty,
  NEW_BADGE_MS
} from './rfid-basket-logic.js'

const read = (epc, rssi, hits = 1, t = 1000) => ({ epc, rssi, hits, firstSeen: t, lastSeen: t })

describe('applyReads', () => {
  it('EPC ใหม่ขึ้นบนสุด ตัวแรกที่อ่านเจออยู่ล่างสุดของกลุ่มใหม่', () => {
    const base = applyReads([], [read('A', -60)])
    const next = applyReads(base, [read('B', -50), read('C', -55)])
    expect(next.map((e) => e.epc)).toEqual(['C', 'B', 'A'])
    expect(next[0].check).toBe('unchecked')
  })

  it('EPC เดิมคงตำแหน่ง สะสม hits และเก็บ rssi แรงสุด', () => {
    let entries = applyReads([], [read('A', -60, 2), read('B', -40, 1)])
    entries = applyReads(entries, [read('A', -50, 3, 2000)])
    const a = entries.find((e) => e.epc === 'A')
    expect(entries.map((e) => e.epc)).toEqual(['B', 'A'])
    expect(a.hits).toBe(5)
    expect(a.rssi).toBe(-50)
    expect(a.lastSeen).toBe(2000)
    expect(a.firstSeen).toBe(1000)
  })

  it('rssi อ่อนกว่าไม่ทับ และ rssi ที่ไม่มีไม่ทับค่าเดิม', () => {
    let entries = applyReads([], [read('A', -50)])
    entries = applyReads(entries, [read('A', -70), read('A', undefined)])
    expect(entries[0].rssi).toBe(-50)
  })

  it('ได้ rssi ภายหลังเมื่อครั้งแรกไม่มี', () => {
    let entries = applyReads([], [read('A', undefined)])
    entries = applyReads(entries, [read('A', -66)])
    expect(entries[0].rssi).toBe(-66)
  })

  it('แถวที่ไม่ถูกอ่านเป็นอ็อบเจ็กต์เดิม และ batch ว่างคืน array เดิม', () => {
    const entries = applyReads([], [read('A', -60), read('B', -60)])
    const next = applyReads(entries, [read('A', -60)])
    expect(next[0]).toBe(entries[0])
    expect(applyReads(entries, [])).toBe(entries)
  })
})

describe('filters / counts', () => {
  const entries = [
    { epc: 'A', check: 'found' },
    { epc: 'B', check: 'unbound' },
    { epc: 'C', check: 'unchecked' },
    { epc: 'D', check: 'found' }
  ]

  it('นับตามสถานะ', () => {
    expect(countEntries(entries)).toEqual({ total: 4, bound: 2, unbound: 1, unchecked: 1 })
  })

  it('กรองตามชิป', () => {
    expect(filterEntries(entries, 'all')).toHaveLength(4)
    expect(filterEntries(entries, 'bound').map((e) => e.epc)).toEqual(['A', 'D'])
    expect(filterEntries(entries, 'unbound').map((e) => e.epc)).toEqual(['B'])
    expect(filterEntries(entries, 'unchecked').map((e) => e.epc)).toEqual(['C'])
  })

  it('uncheckedEpcs / removeEntry / epcListText', () => {
    expect(uncheckedEpcs(entries)).toEqual(['C'])
    expect(removeEntry(entries, 'A')).toHaveLength(3)
    expect(epcListText(entries)).toBe('A\nB\nC\nD')
  })
})

describe('summarizeBound', () => {
  const found = (epc, stockNumber, productCode, extra = {}) => ({ epc, check: 'found', piece: { stockNumber, productCode, lotQty: 50, ...extra } })

  it('แท็ก 2 ดวงของล็อตเดียวกันนับเป็น 1 สินค้า แต่ 2 ชิ้น (ไม่ใช้ lotQty)', () => {
    const entries = [found('A', 'DK1', 'P1'), found('B', 'DK1', 'P1'), found('C', 'DK2', 'P2')]
    expect(summarizeBound(entries)).toEqual({ products: 2, pieces: 3 })
  })

  it('มี unitId นับชิ้นตาม unitId ไม่ซ้ำ', () => {
    const entries = [found('A', 'DK1', 'P1', { unitId: 7 }), found('B', 'DK1', 'P1', { unitId: 7 }), found('C', 'DK1', 'P1', { unitId: 8 })]
    expect(summarizeBound(entries)).toEqual({ products: 1, pieces: 2 })
  })

  it('ไม่นับชิ้นที่ขายแล้ว (SOLD หรือ soldMismatch)', () => {
    const entries = [
      found('A', 'DK1', 'P1'),
      found('B', 'DK2', 'P2', { unitId: 1, unitStatus: 'SOLD' }),
      found('C', 'DK3', 'P3', { soldMismatch: true })
    ]
    expect(summarizeBound(entries)).toEqual({ products: 1, pieces: 1 })
  })

  it('ไม่นับแถวที่ยังไม่ตรวจ/ไม่ผูก และตะกร้าว่างได้ 0', () => {
    const entries = [{ epc: 'X', check: 'unbound' }, { epc: 'Y', check: 'unchecked' }]
    expect(summarizeBound(entries)).toEqual({ products: 0, pieces: 0 })
    expect(summarizeBound([])).toEqual({ products: 0, pieces: 0 })
  })
})

describe('formatLotQty', () => {
  it('เลขเต็มไม่มีทศนิยม เศษแสดง 2 ตำแหน่ง', () => {
    expect(formatLotQty(1)).toBe('1')
    expect(formatLotQty(50)).toBe('50')
    expect(formatLotQty(1.5)).toBe('1.50')
    expect(formatLotQty(null)).toBe('0')
  })
})

describe('applyCheckResult', () => {
  it('found -> piece, notFound -> unbound, ที่ไม่อยู่ในคำตอบคงเดิม', () => {
    const entries = [
      { epc: 'AA', check: 'unchecked' },
      { epc: 'BB', check: 'unchecked' },
      { epc: 'CC', check: 'unchecked' }
    ]
    const piece = { epc: 'aa', stockNumber: 'DK1', productCode: 'P1' }
    const next = applyCheckResult(entries, { items: [piece], notFound: ['bb'] })
    expect(next[0]).toMatchObject({ check: 'found', piece })
    expect(next[1].check).toBe('unbound')
    expect(next[2]).toBe(entries[2])
  })

  it('EPC ที่ส่งไปตรวจแต่ไม่อยู่ใน items/notFound ถือว่าตรวจแล้ว ไม่ผูก (ไม่ค้างยังไม่ตรวจ)', () => {
    const entries = [
      { epc: 'AA', check: 'unchecked' },
      { epc: 'BAD', check: 'unchecked' },
      { epc: 'NOTSENT', check: 'unchecked' }
    ]
    const next = applyCheckResult(entries, { items: [{ epc: 'AA' }], notFound: [] }, ['AA', 'BAD'])
    expect(next[1].check).toBe('unbound')
    expect(next[2]).toBe(entries[2])
    expect(uncheckedEpcs(next)).toEqual(['NOTSENT'])
  })

  it('ตรวจซ้ำแล้วแท็กที่เคยผูกกลายเป็นไม่ผูก ล้าง piece เดิม', () => {
    const entries = [{ epc: 'AA', check: 'found', piece: { stockNumber: 'X' } }]
    const next = applyCheckResult(entries, { items: [], notFound: ['AA'] })
    expect(next[0].check).toBe('unbound')
    expect(next[0].piece).toBeUndefined()
  })
})

describe('chunk / format', () => {
  it('แบ่งทีละ 100', () => {
    const epcs = Array.from({ length: 250 }, (_, i) => String(i))
    expect(chunkEpcs(epcs).map((c) => c.length)).toEqual([100, 100, 50])
    expect(chunkEpcs([])).toEqual([])
  })

  it('shortEpc: …12 ตัวท้ายกลุ่มละ 4, สั้นแสดงเต็ม', () => {
    expect(shortEpc('E280116060000205ABCD1234')).toBe('…0205 ABCD 1234')
    expect(shortEpc('ABCDEF')).toBe('ABCDEF')
  })

  it('isNewEntry ภายใน 4 วินาที', () => {
    expect(isNewEntry({ firstSeen: 1000 }, 1000 + NEW_BADGE_MS - 1)).toBe(true)
    expect(isNewEntry({ firstSeen: 1000 }, 1000 + NEW_BADGE_MS)).toBe(false)
  })

  it('formatElapsed', () => {
    expect(formatElapsed(75)).toBe('01:15')
  })
})
