import { useMasterApiStore } from '@/stores/modules/api/master-store.js'
import { buildGemLabelMeta } from './barcode-zpl.js'

let cachedSource = null
let cachedMeta = null

// โหลด master gem (รหัสย่อ/ลำดับ/ชื่ออังกฤษ) เป็น meta สำหรับป้าย GT800 — ล้มเหลวหรือ master ว่างคืน null (ตัวสร้าง ZPL ใช้ตารางสำรอง)
export async function loadGemLabelMeta() {
  try {
    const masterStore = useMasterApiStore()
    await masterStore.fetchGem()
    const source = masterStore.gem
    if (!Array.isArray(source) || source.length === 0) return null
    if (source !== cachedSource) {
      cachedMeta = buildGemLabelMeta(source)
      cachedSource = source
    }
    return cachedMeta
  } catch {
    return null
  }
}
