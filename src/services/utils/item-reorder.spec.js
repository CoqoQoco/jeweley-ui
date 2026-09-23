import { describe, it, expect } from 'vitest'
import { moveMovableItem } from './item-reorder.js'

function item(lineKey, movable = true) {
  return { lineKey, movable }
}

const isMovable = (i) => !!i && i.movable === true

describe('moveMovableItem', () => {
  it('สลับ 2 ตัวติดกัน — วาง before', () => {
    const items = [item('A'), item('B')]
    const result = moveMovableItem(items, 'B', 'A', 'before', isMovable)
    expect(result.map((i) => i.lineKey)).toEqual(['B', 'A'])
  })

  it('สลับ 2 ตัวติดกัน — วาง after', () => {
    const items = [item('A'), item('B')]
    const result = moveMovableItem(items, 'A', 'B', 'after', isMovable)
    expect(result.map((i) => i.lineKey)).toEqual(['B', 'A'])
  })

  it('ข้ามหมุด (รายการย้ายไม่ได้) แล้ว index ของหมุดไม่ขยับ', () => {
    const inv1 = item('INV1', false)
    const a = item('A', true)
    const inv2 = item('INV2', false)
    const b = item('B', true)
    const items = [inv1, a, inv2, b]

    const result = moveMovableItem(items, 'A', 'B', 'after', isMovable)

    expect(result.map((i) => i.lineKey)).toEqual(['INV1', 'B', 'INV2', 'A'])
    expect(result[0]).toBe(inv1)
    expect(result[2]).toBe(inv2)
  })

  it('ย้ายจากท้ายไปหัว (position before)', () => {
    const items = [item('A'), item('B'), item('C')]
    const result = moveMovableItem(items, 'C', 'A', 'before', isMovable)
    expect(result.map((i) => i.lineKey)).toEqual(['C', 'A', 'B'])
  })

  it('ย้ายจากหัวไปท้าย (position after)', () => {
    const items = [item('A'), item('B'), item('C')]
    const result = moveMovableItem(items, 'A', 'C', 'after', isMovable)
    expect(result.map((i) => i.lineKey)).toEqual(['B', 'C', 'A'])
  })

  it('from ไม่ movable → คืน reference เดิม', () => {
    const items = [item('A', false), item('B', true)]
    const result = moveMovableItem(items, 'A', 'B', 'after', isMovable)
    expect(result).toBe(items)
  })

  it('to ไม่ movable → คืน reference เดิม', () => {
    const items = [item('A', true), item('B', false)]
    const result = moveMovableItem(items, 'A', 'B', 'after', isMovable)
    expect(result).toBe(items)
  })

  it('lineKey ไม่มีจริง → คืน reference เดิม', () => {
    const items = [item('A'), item('B')]
    const result = moveMovableItem(items, 'A', 'NOT-EXIST', 'after', isMovable)
    expect(result).toBe(items)
  })

  it('from === to → คืน reference เดิม', () => {
    const items = [item('A'), item('B')]
    const result = moveMovableItem(items, 'A', 'A', 'after', isMovable)
    expect(result).toBe(items)
  })

  it('ผลลัพธ์เหมือนเดิม (วาง before ตัวที่อยู่ถัดไปอยู่แล้ว) → คืน reference เดิม', () => {
    const items = [item('A'), item('B')]
    const result = moveMovableItem(items, 'A', 'B', 'before', isMovable)
    expect(result).toBe(items)
  })

  it('ไม่ mutate input array และไม่ mutate element เดิม', () => {
    const a = item('A')
    const b = item('B')
    const items = [a, b]
    const snapshot = [...items]

    const result = moveMovableItem(items, 'B', 'A', 'before', isMovable)

    expect(items).toEqual(snapshot)
    expect(items[0]).toBe(a)
    expect(items[1]).toBe(b)
    expect(result).not.toBe(items)
    expect(result[0]).toBe(b)
    expect(result[1]).toBe(a)
  })
})
