// column-prefs — pure helpers สำหรับ BaseDataTable (DataTableWithPaging.vue)
// เก็บลำดับ/การปักหมุดคอลัมน์ไว้ต่างหากจากตัว component เพื่อให้ unit test ได้
// โดยไม่ต้อง mount PrimeVue DataTable จริง

// localStorage key ต่อหน้า — รูปแบบ { order: string[], frozen: Record<string, 'left'|'right'|null> }
export function buildColumnPrefsStorageKey(columnPrefsKey) {
  return `table-cols-${columnPrefsKey}-dk`
}

// เรียง columns ตาม savedOrder (array ของ field name)
// - field ใน savedOrder ที่ไม่มีจริงใน columns (เช่นเปลี่ยนชื่อ/ลบคอลัมน์ไปแล้ว) → ข้าม ห้าม throw
// - field ใน columns ที่ไม่มีใน savedOrder → ต่อท้ายตามลำดับเดิมของ columns
export function applySavedColumnOrder(columns, savedOrder) {
  if (!Array.isArray(savedOrder) || savedOrder.length === 0) return columns

  const remaining = new Map(columns.map((col) => [col.field, col]))
  const ordered = []

  savedOrder.forEach((field) => {
    const col = remaining.get(field)
    if (col) {
      ordered.push(col)
      remaining.delete(field)
    }
  })

  columns.forEach((col) => {
    if (remaining.has(col.field)) ordered.push(col)
  })

  return ordered
}

// จำนวนคอลัมน์ระบบที่ BaseDataTable แทรกไว้หน้าคอลัมน์ dynamic (expander / selection)
// ต้องหักออกจาก dragIndex/dropIndex ที่ PrimeVue ส่งมาก่อน map กลับเข้า array ของเราเอง
export function computeReorderOffset({ expandable = false, selectionMode = false } = {}) {
  return (expandable ? 1 : 0) + (selectionMode ? 1 : 0)
}

// คำนวณลำดับ field ใหม่จาก column-reorder event ของ PrimeVue ({ dragIndex, dropIndex })
// คืน null เมื่อ index (หลังหัก offset) อยู่นอกขอบเขตของ currentOrder — ผู้เรียกไม่ต้อง save ต่อ
export function reorderColumnFields(currentOrder, dragIndex, dropIndex, offset = 0) {
  const from = dragIndex - offset
  const to = dropIndex - offset

  if (from < 0 || to < 0 || from >= currentOrder.length || to >= currentOrder.length) {
    return null
  }

  const next = [...currentOrder]
  const [moved] = next.splice(from, 1)
  next.splice(to, 0, moved)
  return next
}
