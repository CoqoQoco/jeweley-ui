import { defineStore } from 'pinia'
import { storage } from '@/services/storage.js'

const CARTS_STORAGE_KEY = 'pos-carts'

function generateId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

// ลูกค้า default ของบิลใหม่ = "หน้าร้าน" (code WALKIN) — ดู reference_preplan... / plan B4
// WALKIN ต้องมีอยู่จริงใน tbm_customer ก่อน checkout จริง (user รัน SQL เอง — ไม่ใช่ scope ของ UI shard นี้)
function createEmptyCustomer() {
  return { code: 'WALKIN', name: '', tel: '' }
}

function createEmptyCart() {
  return {
    id: generateId(),
    items: [],
    customer: createEmptyCustomer(),
    discountBill: 0,
    note: '',
    // สร้างครั้งเดียวตอนเปิดบิล — ห้ามสร้างใหม่ทุกครั้งที่กดปุ่ม ไม่งั้นกันบิลซ้ำไม่ได้ (ใช้ตอน checkout งานชิ้นถัดไป)
    idempotencyKey: generateId(),
    // 'open' = แก้ไข/checkout ได้ตามปกติ, 'pending' = ยิง checkout ไปแล้วแต่เน็ตหลุด รอกดส่งอีกครั้งด้วย key เดิม
    status: 'open',
    // เก็บ payload/payments/items ที่ freeze ไว้ตอนยิง checkout ครั้งที่ fail — ใช้ resend ให้ผลตรงกับครั้งแรกเป๊ะ
    pendingCheckout: null,
    createdAt: new Date().toISOString()
  }
}

// localStorage อาจใช้ไม่ได้ (เต็ม / Safari private mode / ถูกปิด) — ต้องไม่ทำให้เปิดหน้า POS พังทั้งหน้า
function loadInitialState() {
  let saved = null
  try {
    saved = storage.getJSON(CARTS_STORAGE_KEY, null)
  } catch (err) {
    console.error('pos-cart-store: อ่าน localStorage ไม่สำเร็จ เริ่มบิลใหม่แทน', err)
  }
  if (saved && Array.isArray(saved.carts) && saved.carts.length > 0) {
    const activeCartId = saved.carts.some((c) => c.id === saved.activeCartId)
      ? saved.activeCartId
      : saved.carts[0].id
    // migrate cart เก่าที่ยังไม่มี status/pendingCheckout (persist ไว้ก่อนหน้านี้)
    const carts = saved.carts.map((c) => ({
      status: 'open',
      pendingCheckout: null,
      ...c
    }))
    return { carts, activeCartId }
  }
  const cart = createEmptyCart()
  return { carts: [cart], activeCartId: cart.id }
}

export const usePosCartStore = defineStore('posCart', {
  state: () => loadInitialState(),

  getters: {
    activeCart(state) {
      return state.carts.find((c) => c.id === state.activeCartId) || null
    },

    cartCount(state) {
      return state.carts.length
    },

    getCartById(state) {
      return (cartId) => state.carts.find((c) => c.id === cartId) || null
    },

    // จำนวนชิ้น (รวม qty ทุกบรรทัด) ของบิลที่ระบุ — ไม่ระบุ cartId = บิลที่ active
    cartItemCount() {
      return (cartId) => {
        const cart = cartId ? this.getCartById(cartId) : this.activeCart
        if (!cart) return 0
        return cart.items.reduce((sum, item) => sum + (Number(item.qty) || 0), 0)
      }
    },

    // ยอดรวมก่อนหักส่วนลดท้ายบิล (ฐาน THB)
    cartSubtotal() {
      return (cartId) => {
        const cart = cartId ? this.getCartById(cartId) : this.activeCart
        if (!cart) return 0
        return cart.items.reduce((sum, item) => {
          const price = Number(item.price) || 0
          const qty = Number(item.qty) || 1
          const discountPercent = Number(item.discountPercent) || 0
          return sum + price * qty * (1 - discountPercent / 100)
        }, 0)
      }
    },

    // ยอดรวมต่อบิล หลังหักส่วนลดท้ายบิล (ฐาน THB)
    cartTotal() {
      return (cartId) => {
        const cart = cartId ? this.getCartById(cartId) : this.activeCart
        if (!cart) return 0
        const subtotal = this.cartSubtotal(cart.id)
        const discountBill = Number(cart.discountBill) || 0
        return Math.max(subtotal - discountBill, 0)
      }
    }
  },

  actions: {
    // ห้ามปล่อยให้ setJSON throw ทะลุขึ้นไป — localStorage เต็ม/ถูกปิดต้องยังขายต่อได้ (แค่ไม่ persist ข้ามหน้า)
    persist() {
      try {
        storage.setJSON(CARTS_STORAGE_KEY, { carts: this.carts, activeCartId: this.activeCartId })
      } catch (err) {
        console.error('pos-cart-store: persist localStorage ไม่สำเร็จ (ขายต่อได้ปกติ แต่รีเฟรชหน้าจะไม่เห็นข้อมูลนี้)', err)
      }
    },

    newCart() {
      const cart = createEmptyCart()
      this.carts.push(cart)
      this.activeCartId = cart.id
      this.persist()
      return cart.id
    },

    switchCart(cartId) {
      if (this.carts.some((c) => c.id === cartId)) {
        this.activeCartId = cartId
        this.persist()
      }
    },

    removeCart(cartId) {
      const idx = this.carts.findIndex((c) => c.id === cartId)
      if (idx === -1) return
      this.carts.splice(idx, 1)
      if (this.carts.length === 0) {
        const cart = createEmptyCart()
        this.carts.push(cart)
        this.activeCartId = cart.id
      } else if (this.activeCartId === cartId) {
        this.activeCartId = this.carts[0].id
      }
      this.persist()
    },

    // กันเพิ่มสินค้าชิ้นเดิมซ้ำในบิลเดียวกัน — ตรรกะเดียวกับ create-view.vue (ของชิ้นเดียว)
    // คืนค่า { success:false, reason:'duplicate' } ให้ผู้เรียก (component) แสดง warning() เอง
    addItem(item, cartId) {
      const cart = cartId ? this.getCartById(cartId) : this.activeCart
      if (!cart) return { success: false, reason: 'no-cart' }
      if (item.stockNumber && cart.items.some((i) => i.stockNumber === item.stockNumber)) {
        return { success: false, reason: 'duplicate' }
      }
      cart.items.push({ ...item })
      this.persist()
      return { success: true }
    },

    updateItem(index, updatedItem, cartId) {
      const cart = cartId ? this.getCartById(cartId) : this.activeCart
      if (!cart || !cart.items[index]) return
      cart.items[index] = { ...updatedItem }
      this.persist()
    },

    removeItem(index, cartId) {
      const cart = cartId ? this.getCartById(cartId) : this.activeCart
      if (!cart) return
      cart.items.splice(index, 1)
      this.persist()
    },

    setCustomer(customer, cartId) {
      const cart = cartId ? this.getCartById(cartId) : this.activeCart
      if (!cart) return
      cart.customer = { ...createEmptyCustomer(), ...customer }
      this.persist()
    },

    clearActiveCart() {
      const idx = this.carts.findIndex((c) => c.id === this.activeCartId)
      if (idx === -1) return
      // createEmptyCart() ได้ id ใหม่เสมอ — ต้องอัปเดต activeCartId ตามด้วย ไม่งั้น activeCart
      // (carts.find โดย activeCartId) จะหาไม่เจอและกลายเป็น null ทันที (ตะกร้าหายหลังกด "ขายต่อ")
      const freshCart = createEmptyCart()
      this.carts[idx] = freshCart
      this.activeCartId = freshCart.id
      this.persist()
    },

    // ยิง checkout แล้ว fail แบบไม่รู้ผล (เน็ตหลุด/timeout) — freeze payload/payments/items ไว้ resend ด้วย idempotencyKey เดิม
    markCartPending(pendingCheckout, cartId) {
      const cart = cartId ? this.getCartById(cartId) : this.activeCart
      if (!cart) return
      cart.status = 'pending'
      cart.pendingCheckout = pendingCheckout
      this.persist()
    },

    // ใช้ทั้งตอน checkout สำเร็จ (ล้าง flag ค้าง) และตอนผู้ใช้กด "แก้ไขรายการแทน" (ยกเลิกรอส่ง กลับไปแก้บิลได้)
    clearCartPending(cartId) {
      const cart = cartId ? this.getCartById(cartId) : this.activeCart
      if (!cart) return
      cart.status = 'open'
      cart.pendingCheckout = null
      this.persist()
    }
  }
})
