import { isPlaceholderItem } from '@/services/utils/copy-item.js'

const norm = (v) => String(v ?? '').trim()
const lower = (v) => norm(v).toLowerCase()

export function isSilverMetal(m) {
  if (!m) return false
  if (m.type === 'Silver') return true
  if (lower(m.type) !== 'gem') return false
  return lower(m.weightUnit).startsWith('g') && /^sil/i.test(norm(m.typeOrigin))
}

export function isCz(m) {
  if (!m || lower(m.type) !== 'gem') return false
  return lower(m.typeCode) === 'cubic zirconia' || norm(m.typeOrigin).toUpperCase() === 'CZ'
}

export function isSilverItem(item) {
  if (!item) return false
  const productionType = lower(item.productionType)
  if (productionType) return productionType.includes('silver')
  return (item.materials || []).some(isSilverMetal)
}

function isQualifyingItem(item) {
  if (!item || isPlaceholderItem(item)) return false
  return (Array.isArray(item.materials) && item.materials.length > 0) || !!norm(item.productionType)
}

export function getDocMaterialMode(items) {
  const list = (Array.isArray(items) ? items : []).filter(isQualifyingItem)
  return list.length > 0 && list.every(isSilverItem) ? 'silver' : 'gold'
}

export function classifyMaterial(m, mode = 'gold') {
  if (!m) return 'other'
  if (m.type === 'Gold' || isSilverMetal(m)) return 'metal'
  if (m.type === 'Diamond') return 'second'
  if (mode === 'silver' && isCz(m)) return 'second'
  if (m.type === 'Gem' || (mode === 'silver' && lower(m.type) === 'gem')) return 'gem'
  return 'other'
}

export function getColumnHeaders(mode = 'gold') {
  return mode === 'silver'
    ? { metal: 'Silver (gms)', second: 'CZ (cts)' }
    : { metal: 'Gold (gms)', second: 'Diamond (cts)' }
}

export function getMaterialLabel(m) {
  const code = norm(m?.typeCode)
  if (code) return code
  if (m?.type === 'Gold' || m?.type === 'Diamond') return ''
  const origin = norm(m?.typeOrigin)
  if (origin) return origin
  return isSilverMetal(m) ? 'SV' : ''
}

export function sumMaterialWeights(materials, mode = 'gold') {
  const sums = { metal: 0, second: 0, gem: 0 }
  ;(materials || []).forEach((m) => {
    const kind = classifyMaterial(m, mode)
    if (kind in sums) sums[kind] += Number(m.weight) || 0
  })
  return sums
}

export function calcNetWeight(sums) {
  return (sums.second + sums.gem) / 5 + sums.metal
}
