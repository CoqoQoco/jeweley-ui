import { classifyMaterial } from '@/services/helper/sale-material-columns.js'

const norm = (v) => String(v ?? '').trim()

const isDiamondMaterial = (m) => m?.type === 'Diamond'

function gemName(m) {
  return norm(m?.typeCode) || norm(m?.typeOrigin)
}

export function gemLabel(m) {
  const name = gemName(m)
  return isDiamondMaterial(m) ? `Diamond${name ? ` ${name}` : ''}` : name
}

export function gemKey(m) {
  return `${isDiamondMaterial(m) ? 'd:' : 'g:'}${gemName(m).toLowerCase()}`
}

function isGemLike(m) {
  const kind = classifyMaterial(m)
  return kind === 'gem' || kind === 'second'
}

export function defaultColumnFor(entry) {
  return entry?.isDiamond || entry?.type === 'Diamond' ? 'diamond' : 'stone'
}

export function listBillGemTypes(items) {
  const map = new Map()
  ;(items || []).forEach((item) => {
    const qty = item?.qty === undefined || item?.qty === null || item?.qty === '' ? 1 : Number(item.qty) || 0
    const seen = new Set()
    ;(Array.isArray(item?.materials) ? item.materials : []).forEach((m) => {
      if (!isGemLike(m)) return
      const key = gemKey(m)
      if (!map.has(key)) {
        map.set(key, { key, label: gemLabel(m), isDiamond: false, pieceCount: 0, totalWeight: 0 })
      }
      const entry = map.get(key)
      if (isDiamondMaterial(m)) entry.isDiamond = true
      entry.totalWeight += (Number(m.weight) || 0) * qty
      if (!seen.has(key)) {
        seen.add(key)
        entry.pieceCount += qty
      }
    })
  })
  return [...map.values()].sort((a, b) => {
    if (a.isDiamond !== b.isDiamond) return a.isDiamond ? -1 : 1
    return a.label.localeCompare(b.label) || a.key.localeCompare(b.key)
  })
}

export function splitBillWeights(materials, gemColumnMap = {}) {
  const map = gemColumnMap || {}
  let goldWeight = 0
  let stoneWeight = 0
  let diamondWeight = 0
  ;(Array.isArray(materials) ? materials : []).forEach((m) => {
    const weight = Number(m?.weight) || 0
    const kind = classifyMaterial(m)
    if (kind === 'metal') {
      goldWeight += weight
      return
    }
    if (kind !== 'gem' && kind !== 'second') return
    const column = map[gemKey(m)] ?? defaultColumnFor(m)
    if (column === 'stone') stoneWeight += weight
    else if (column === 'diamond') diamondWeight += weight
  })
  return { goldWeight, stoneWeight, diamondWeight }
}
