import api from '@/axios/axios-helper.js'
import { VAT_LAYOUT_KEY } from '@/services/helper/print/vat-layout-defaults.js'

export async function getVatLayout(layoutKey = VAT_LAYOUT_KEY) {
  try {
    const data = await api.jewelry.get(`PrintLayout/${layoutKey}`)
    if (!data || !data.layoutJson) return null
    return JSON.parse(data.layoutJson)
  } catch {
    return null
  }
}

export async function saveVatLayout(layout, layoutKey = VAT_LAYOUT_KEY) {
  await api.jewelry.post(`PrintLayout/${layoutKey}`, { layoutJson: JSON.stringify(layout) })
}

export async function clearVatLayout() {
  // no-op — ไม่ลบจาก DB; Reset UI-only
}
