// gallery-helpers.js
//
// Pure helper functions ใช้ร่วมกันระหว่างจอจัดการรูป gallery ลูกค้า (StockProductGallery)
// ทั้งฝั่ง mobile (src/views/mobile/stock-product/photos-view.vue) และฝั่ง web
// (src/views/stock/product/image/components/customer-gallery/*) — กติกากลาง: 2 scope (SKU/MOLD)
// ≤4 รูปต่อ scope, resolved display order ที่ลูกค้าเห็น = SKU ก่อน MOLD (เรียงตาม sortOrder ภายในแต่ละ scope)

export const GALLERY_MAX_PER_SCOPE = 4

/**
 * buildGalleryPositionMap — คำนวณตำแหน่งของแต่ละรูปใน resolved display order รวม (SKU เรียง sortOrder ก่อน
 * แล้ว MOLD ต่อ, 0-based) ใช้กำหนด badge: 0=รูปหลัก, 1-3=เลขลำดับ, >=4=ไม่แสดงให้ลูกค้า (เกิน 4 รูปที่โชว์จริง)
 * @param {Array<{id: any, sortOrder?: number}>} skuImages
 * @param {Array<{id: any, sortOrder?: number}>} moldImages
 * @returns {Object<any, number>} id -> index ใน resolved order
 */
export function buildGalleryPositionMap(skuImages = [], moldImages = []) {
  const bySortOrder = (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
  const resolved = [...[...skuImages].sort(bySortOrder), ...[...moldImages].sort(bySortOrder)]
  const map = {}
  resolved.forEach((img, idx) => {
    map[img.id] = idx
  })
  return map
}

/**
 * classifyGalleryPosition — แปลงตำแหน่ง (จาก buildGalleryPositionMap) เป็นประเภท badge
 * (ไม่รวม label ข้อความ — caller ใส่ $t เอง เพราะ label ต่างกันตาม locale)
 * @param {number|undefined} position
 * @returns {'primary'|'number'|'hidden'}
 */
export function classifyGalleryPosition(position) {
  if (position === 0) return 'primary'
  if (position !== undefined && position <= 3) return 'number'
  return 'hidden'
}

/**
 * calcFreeSlots — จำนวนช่องว่างที่เหลือใน scope เดียว (≤4 รูปต่อ scope เสมอ)
 * @param {{ existingCount?: number, pendingCount?: number, max?: number }} args
 * @returns {number}
 */
export function calcFreeSlots({ existingCount = 0, pendingCount = 0, max = GALLERY_MAX_PER_SCOPE } = {}) {
  return Math.max(0, max - existingCount - pendingCount)
}

/**
 * runUploadQueue — ประมวลผล pending upload ทีละไฟล์ (sequential) จนกว่าจะไม่มี item สถานะ 'queued' เหลือ
 * mutate item ใน items ตรงๆ (reactive object ของ caller) — status: queued -> uploading -> done/error
 * caller เป็นผู้กันการเรียกซ้อน (เช่น flag isProcessingQueue) เอง — ฟังก์ชันนี้ไม่ track ภาวะนั้น
 * @param {Array<{status: string, progress: number, errorMessage: string}>} items
 * @param {(item: object) => Promise<any>} uploadFn
 * @param {{ onError?: (err: any) => string }} [options]
 */
export async function runUploadQueue(items, uploadFn, { onError } = {}) {
  let next = items.find((p) => p.status === 'queued')
  while (next) {
    next.status = 'uploading'
    next.progress = 0
    try {
      await uploadFn(next)
      next.status = 'done'
    } catch (err) {
      next.status = 'error'
      next.errorMessage = onError ? onError(err) : ''
    }
    next = items.find((p) => p.status === 'queued')
  }
}

/**
 * moveIdToIndex — ย้าย id จาก fromIndex ไปยัง toIndex ในลิสต์ id (ใช้ยิง Reorder ทั้งชุด)
 * @param {Array} ids
 * @param {number} fromIndex
 * @param {number} toIndex
 * @returns {Array} ลิสต์ id ใหม่ (ไม่แก้ ids เดิม)
 */
export function moveIdToIndex(ids, fromIndex, toIndex) {
  const next = [...ids]
  const [moved] = next.splice(fromIndex, 1)
  next.splice(toIndex, 0, moved)
  return next
}

/**
 * moveIdToFront — ตั้งเป็นรูปหลัก (ย้าย id ที่ index ไปไว้ index 0)
 */
export function moveIdToFront(ids, index) {
  return moveIdToIndex(ids, index, 0)
}

/**
 * swapIds — สลับตำแหน่ง 2 index (ใช้เลื่อนซ้าย/ขวาทีละช่อง)
 * @param {Array} ids
 * @param {number} indexA
 * @param {number} indexB
 * @returns {Array} ลิสต์ id ใหม่ (ไม่แก้ ids เดิม)
 */
export function swapIds(ids, indexA, indexB) {
  const next = [...ids]
  ;[next[indexA], next[indexB]] = [next[indexB], next[indexA]]
  return next
}
