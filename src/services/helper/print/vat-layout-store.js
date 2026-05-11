import api from '@/axios/axios-helper.js'

export async function getVatLayout() {
  try {
    const data = await api.jewelry.get('PrintLayout/vat')
    if (!data || !data.layoutJson) return null
    return JSON.parse(data.layoutJson)
  } catch {
    return null
  }
}

export async function saveVatLayout(layout) {
  await api.jewelry.post('PrintLayout/vat', { layoutJson: JSON.stringify(layout) })
}

export async function clearVatLayout() {
  // no-op — ไม่ลบจาก DB; Reset UI-only
}
