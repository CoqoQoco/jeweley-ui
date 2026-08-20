/**
 * useActiveRowHighlight — mixin สำหรับไฮไลต์แถวที่ถูกคลิกล่าสุดในตาราง (PrimeVue DataTable / DataTableWithPaging)
 *
 * วิธีใช้ (ตารางเอกสาร — เทียบด้วย object identity เท่านั้น เช่น quotation-items-table):
 *   import activeRowHighlight from '@/composables/useActiveRowHighlight.js'
 *
 *   export default {
 *     mixins: [activeRowHighlight]
 *   }
 *
 *   <DataTable @row-click="onRowClick" :rowClass="getRowClass" ... />
 *
 * วิธีใช้ (หน้า list — คลิกแล้ว navigate ออกไปหน้า detail แล้วกลับมาต้องยังไฮไลต์อยู่):
 *   export default {
 *     mixins: [activeRowHighlight],
 *     data() {
 *       return {
 *         activeRowIdField: 'number',                     // field ที่ใช้เทียบ id ของแถว
 *         activeRowStorage: 'active-row-my-list-dk'        // key sessionStorage เก็บ id ล่าสุด
 *       }
 *     }
 *   }
 *
 *   <BaseDataTable @row-click="onRowClick" :rowClass="getRowClass" ... />
 *
 * หมายเหตุ: ปุ่ม action (view/edit) ที่ $router.push ออกจากหน้า ต้องเรียก this.setActiveRow(data)
 * เองด้วย เพราะอาจไม่ผ่าน @row-click ของแถว
 *
 * โหมด focus-activation (ตารางเอกสารที่มี input ในแถว เช่น quotation-items-table):
 * PrimeVue's DataTable.onRowClick จะ return ก่อนเสมอโดยไม่ยิง `row-click` เมื่อ event.target
 * เป็น element ที่ click ได้ (input/textarea/button/a หรือลูกของ .p-button/.p-checkbox/.p-radiobutton)
 * ทำให้คลิก "เข้าไปในช่อง input" ของแถว (สิ่งที่ user ทำบ่อยที่สุด) ไม่ไฮไลต์แถว
 * แก้ด้วย focusin event (bubbles) จับที่ wrapper รอบ <DataTable> แทน — component ต้อง:
 *   1. เพิ่ม `computed: { activeRowItems() { return this.someArrayBoundToDataTableValue } }`
 *      (ห้ามใส่ใน data() — จะชนกับ mixin computed key เดียวกัน ให้ computed ของ component override แทน)
 *   2. เพิ่ม `@focusin="onRowFocusIn"` ที่ element ที่ครอบ <DataTable> (ไม่ใช่ตัว <DataTable> เอง)
 *
 * ทำไมต้องเทียบด้วย "index เข้า activeRowItems" แทน object identity ตรงๆ (สำคัญ — ห้าม "ปรับให้ง่ายลง"):
 * ตารางเอกสารบางตัว (เช่น stock-items-table) ผูก :value กับ computed ที่ .map() สร้าง object ใหม่ทุกครั้งที่
 * re-evaluate (เช่น stockItemsWithGrouping) — พอ setActiveRow ทำให้ component re-render computed จะ re-run
 * แล้ว object ที่เคยเก็บไว้ใน activeRowRef จะไม่ใช่ instance เดียวกับ item ใน array อีกต่อไป (stale reference)
 * ทำให้ `data === activeRowRef` เป็น false เสมอ ไม่ไฮไลต์อะไรเลย แก้โดยจำ "index" ไว้แทน แล้วเทียบ
 * `this.activeRowItems[this.activeRowIndex] === data` ซึ่งทั้งสองฝั่งอ่านจาก array instance เดียวกัน ณ ขณะ
 * render จึงชี้ object เดียวกันเสมอไม่ว่า array จะถูกสร้างใหม่กี่รอบก็ตาม
 */
const activeRowHighlight = {
  data() {
    return {
      activeRowRef: null,
      activeRowId: null,
      // index ของแถวที่คลิกล่าสุดใน activeRowItems ณ ขณะ set — ใช้แทน object identity เพราะ
      // array ที่มาจาก computed แบบ .map() จะสร้าง object ใหม่ทุก re-render (ดู comment บนสุดของไฟล์)
      activeRowIndex: null,
      // component ที่ต้องการโหมด id + sessionStorage (หน้า list) ให้ override 2 ค่านี้ใน data() ของตัวเอง
      activeRowIdField: null,
      activeRowStorage: null
    }
  },

  computed: {
    // component ที่ต้องการ focus-activation ให้ override เป็น array เดียวกับที่ผูกกับ :value ของ DataTable
    activeRowItems() {
      return null
    }
  },

  mounted() {
    this.restoreActiveRow()
  },

  methods: {
    onRowClick(event) {
      // PrimeVue's row-click payload มี index ของแถวใน array ที่ render อยู่แล้ว — ใช้ต่อ
      this.setActiveRow(event.data, event.index)
    },

    // PrimeVue กลืน row-click เมื่อคลิกที่ input/textarea/button ในแถว (isClickable check)
    // เลยต้องดัก focusin (bubbles) แทน เพื่อให้พิมพ์ลงช่อง input ในแถวแล้วแถวไฮไลต์ด้วย
    onRowFocusIn(event) {
      const tr = event?.target?.closest?.('tr[data-p-index]')
      if (!tr) return

      const index = Number(tr.dataset.pIndex)
      if (!Number.isInteger(index)) return

      const rows = this.activeRowItems
      const row = Array.isArray(rows) ? rows[index] : null
      if (row) this.setActiveRow(row, index)
    },

    // index (optional) = ตำแหน่งของ row ใน activeRowItems ณ ขณะคลิก/focus — ใช้แก้ปัญหา stale
    // object reference จาก computed array ที่ .map() สร้าง object ใหม่ทุก re-render (ดู comment บนไฟล์)
    // หน้า list เรียก setActiveRow(data) โดยไม่ส่ง index ได้ตามปกติ — จะ fallback ไปใช้ activeRowIdField แทน
    setActiveRow(row, index) {
      this.activeRowRef = row
      this.activeRowIndex = Number.isInteger(index) ? index : null

      if (!this.activeRowIdField) return

      const id = row?.[this.activeRowIdField] ?? null
      this.activeRowId = id

      if (this.activeRowStorage && id !== null) {
        try {
          sessionStorage.setItem(this.activeRowStorage, String(id))
        } catch {
          // private mode / storage ถูกปิด — ข้ามไปเงียบๆ
        }
      }
    },

    isActiveRow(data) {
      // 1) หน้า list (มี activeRowIdField) — เทียบด้วย id เหมือนเดิม ยืนยันแล้วว่าใช้งานได้จริง
      if (this.activeRowIdField) {
        if (this.activeRowId == null) return false
        const value = data?.[this.activeRowIdField]
        if (value === null || value === undefined) return false
        return String(value) === String(this.activeRowId)
      }

      // 2) ตารางเอกสาร — เทียบด้วย index เข้า activeRowItems (array instance เดียวกัน ณ ขณะ render)
      // กัน stale reference จาก computed แบบ .map() ที่สร้าง object ใหม่ทุกรอบ
      if (this.activeRowIndex !== null && Array.isArray(this.activeRowItems)) {
        return this.activeRowItems[this.activeRowIndex] === data
      }

      // 3) fallback — object identity ตรงๆ (เช่น ยังไม่เคย setActiveRow ด้วย index)
      return data === this.activeRowRef
    },

    getRowClass(data) {
      return this.isActiveRow(data) ? 'row-active' : ''
    },

    restoreActiveRow() {
      if (!this.activeRowStorage) return

      try {
        this.activeRowId = sessionStorage.getItem(this.activeRowStorage)
      } catch {
        this.activeRowId = null
      }
    },

    scrollToActiveRow() {
      this.$nextTick(() => {
        this.$el?.querySelector('tr.row-active')?.scrollIntoView({ block: 'nearest' })
      })
    }
  }
}

export default activeRowHighlight
