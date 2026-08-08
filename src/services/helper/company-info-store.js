import api from '@/axios/axios-helper.js'

export async function getCompanySetting() {
  try {
    const data = await api.jewelry.get('PrintLayout/company')
    if (!data || !data.layoutJson) return null
    return JSON.parse(data.layoutJson)
  } catch {
    return null
  }
}

export async function saveCompanySetting(obj) {
  await api.jewelry.post('PrintLayout/company', { layoutJson: JSON.stringify(obj) })
}
