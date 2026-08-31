import api from '@/axios/axios-helper.js'

const MAX_TERMS_PER_GROUP = 50

export async function getTermHistory(options) {
  try {
    const data = await api.jewelry.get('PrintLayout/breakdown-terms', undefined, options)
    if (!data || !data.layoutJson) return {}
    const parsed = JSON.parse(data.layoutJson)
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

export async function saveTermHistory(obj, options) {
  await api.jewelry.post('PrintLayout/breakdown-terms', { layoutJson: JSON.stringify(obj) }, options)
}

// Pure function — คืน object ใหม่เสมอ ไม่ mutate history ที่ส่งเข้ามา
export function addTerms(history, nameGroup, terms) {
  const baseHistory = history && typeof history === 'object' ? history : {}
  const existing = Array.isArray(baseHistory[nameGroup]) ? baseHistory[nameGroup] : []
  const incoming = (Array.isArray(terms) ? terms : [terms])
    .map((term) => (typeof term === 'string' ? term.trim() : ''))
    .filter((term) => term.length > 0)

  // คำใหม่ไว้หน้าสุด แล้ว dedupe case-insensitive (ตัวที่อยู่ก่อนใน array ชนะ — เก็บตัวสะกดล่าสุดที่พิมพ์)
  const merged = [...incoming, ...existing]
  const seen = new Set()
  const deduped = []
  merged.forEach((term) => {
    const key = term.toLowerCase()
    if (seen.has(key)) return
    seen.add(key)
    deduped.push(term)
  })

  return {
    ...baseHistory,
    [nameGroup]: deduped.slice(0, MAX_TERMS_PER_GROUP)
  }
}
