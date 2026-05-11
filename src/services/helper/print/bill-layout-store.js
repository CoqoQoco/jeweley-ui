import api from '@/axios/axios-helper.js'

export async function getBillLayout() {
  try {
    const data = await api.jewelry.get('PrintLayout/bill')
    if (!data || !data.layoutJson) return null
    return JSON.parse(data.layoutJson)
  } catch {
    return null
  }
}

export async function saveBillLayout(layout) {
  await api.jewelry.post('PrintLayout/bill', { layoutJson: JSON.stringify(layout) })
}

export async function clearBillLayout() {
  // no-op — ไม่ลบจาก DB; Reset UI-only
}
