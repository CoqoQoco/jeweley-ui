import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { usePosCartStore } from './pos-cart-store.js'

// silver lot: piece เดียวมีได้หลายชิ้น (qty ผูกกับ qtyAvailable ของ piece) — ทองยัง qtyAvailable 1 เสมอ
describe('posCartStore addItem/removeItem (silver lot)', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('a) สแกนเลขเดิมซ้ำ (silver lot) → qty +1 เมื่อยังไม่เกิน available', () => {
    const store = usePosCartStore()
    const item = { stockNumber: 'DK-SIL-001', qty: 1, qtyAvailable: 5 }

    const r1 = store.addItem({ ...item })
    expect(r1.success).toBe(true)
    expect(store.activeCart.items).toHaveLength(1)
    expect(store.activeCart.items[0].qty).toBe(1)

    const r2 = store.addItem({ ...item })
    expect(r2.success).toBe(true)
    expect(store.activeCart.items).toHaveLength(1)
    expect(store.activeCart.items[0].qty).toBe(2)
  })

  it('b) สแกนซ้ำจนเกินจำนวนพร้อมขาย → ปฏิเสธด้วย reason exceed-available', () => {
    const store = usePosCartStore()
    const item = { stockNumber: 'DK-SIL-002', qty: 1, qtyAvailable: 2 }

    store.addItem({ ...item }) // qty -> 1
    store.addItem({ ...item }) // qty -> 2 (เท่ากับ available แล้ว)

    const r3 = store.addItem({ ...item })
    expect(r3.success).toBe(false)
    expect(r3.reason).toBe('exceed-available')
    expect(store.activeCart.items).toHaveLength(1)
    expect(store.activeCart.items[0].qty).toBe(2)
  })

  it('c) ทอง (qtyAvailable 1) สแกนซ้ำ → ปฏิเสธทันทีเหมือนพฤติกรรมเดิม', () => {
    const store = usePosCartStore()
    const goldItem = { stockNumber: 'NEW00123', qty: 1, qtyAvailable: 1 }

    const r1 = store.addItem({ ...goldItem })
    expect(r1.success).toBe(true)

    const r2 = store.addItem({ ...goldItem })
    expect(r2.success).toBe(false)
    expect(r2.reason).toBe('exceed-available')
    expect(store.activeCart.items).toHaveLength(1)
    expect(store.activeCart.items[0].qty).toBe(1)
  })

  it('d) removeItem ลบรายการออกจากตะกร้าได้', () => {
    const store = usePosCartStore()
    store.addItem({ stockNumber: 'A1', qty: 1, qtyAvailable: 1 })
    store.addItem({ stockNumber: 'A2', qty: 1, qtyAvailable: 1 })

    store.removeItem(0)

    expect(store.activeCart.items).toHaveLength(1)
    expect(store.activeCart.items[0].stockNumber).toBe('A2')
  })
})
