// ย้ายลำดับรายการใน array ที่มีทั้งรายการ "ย้ายได้" และ "ย้ายไม่ได้" ปนกัน (drag-and-drop จัดลำดับสินค้าในใบสั่งขาย)

/**
 * ย้ายรายการที่ "ย้ายได้" (isMovable คืน true) ไปวางก่อน/หลังรายการเป้าหมายอีกตัวหนึ่ง
 * ส่วนรายการที่ "ย้ายไม่ได้" ทำหน้าที่เป็น "หมุดตรึง" — index สัมบูรณ์ของมันใน array ผลลัพธ์
 * ต้องเท่าเดิมเป๊ะเสมอ ไม่ว่าจะย้ายรายการอื่นไปทางไหนก็ตาม รายการที่ย้ายได้จะสลับกันเองเฉพาะ
 * ในช่องว่างที่เหลือ (ข้ามหมุดไปมาได้ แต่ไม่ดันหมุดให้ขยับ)
 *
 * เหตุผลของกติกา "หมุดตรึง": ในใบสั่งขาย รายการที่ออกใบแจ้งหนี้ไปแล้วผูกกับเอกสารที่พิมพ์มอบให้
 * ลูกค้าไปแล้ว ตำแหน่ง/ลำดับสัมพัทธ์ของมันจึงต้องคงที่ตลอดไป ห้ามมีการจัดเรียงใดๆ มาขยับอีก
 * ไม่งั้นลำดับที่เห็นบนใบสั่งขายกับใบแจ้งหนี้ที่พิมพ์ไปแล้วจะไม่ตรงกัน ผู้ใช้จึงย้ายลำดับได้เฉพาะ
 * รายการที่ยืนยันแล้วแต่ยังไม่ออกใบแจ้งหนี้เท่านั้น
 *
 * @param {Array<Object>} items - array ของ object ที่มี lineKey (เช่น this.stockItems)
 * @param {string} fromLineKey - lineKey ของรายการที่จะย้าย
 * @param {string} toLineKey - lineKey ของรายการเป้าหมาย (ตำแหน่งที่จะวางรายการที่ย้ายไว้ข้างๆ)
 * @param {'before'|'after'} [position='before'] - วางก่อนหรือหลังรายการเป้าหมาย
 * @param {(item: Object) => boolean} [isMovable] - เช็คว่ารายการนี้ย้ายได้หรือไม่ (default: ย้ายได้ทุกตัว)
 * @returns {Array<Object>} array ใหม่เมื่อมีการเปลี่ยนแปลงจริง (ไม่ mutate ของเดิม/element เดิม)
 *   หรือ reference เดิมของ items เมื่อเป็น no-op (from === to, หา lineKey ไม่เจอ, from/to ไม่ movable, หรือผลลัพธ์เหมือนเดิม)
 */
export function moveMovableItem(items, fromLineKey, toLineKey, position = 'before', isMovable = () => true) {
  if (!Array.isArray(items) || items.length === 0) return items
  if (fromLineKey === toLineKey) return items

  const fromItem = items.find((item) => item && item.lineKey === fromLineKey)
  const toItem = items.find((item) => item && item.lineKey === toLineKey)
  if (!fromItem || !toItem) return items
  if (!isMovable(fromItem) || !isMovable(toItem)) return items

  const slots = []
  const movables = []
  items.forEach((item, index) => {
    if (isMovable(item)) {
      slots.push(index)
      movables.push(item)
    }
  })

  const fromIndex = movables.findIndex((item) => item.lineKey === fromLineKey)
  const toIndex = movables.findIndex((item) => item.lineKey === toLineKey)

  let targetIndex = position === 'after' ? toIndex + 1 : toIndex
  if (fromIndex < targetIndex) {
    targetIndex -= 1
  }

  const reordered = [...movables]
  const [moved] = reordered.splice(fromIndex, 1)
  reordered.splice(targetIndex, 0, moved)

  const isUnchanged = reordered.every((item, index) => item === movables[index])
  if (isUnchanged) return items

  const result = [...items]
  slots.forEach((slotIndex, i) => {
    result[slotIndex] = reordered[i]
  })

  return result
}
