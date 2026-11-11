import { isSilverMetal } from '@/services/helper/sale-material-columns.js'

export function getMetalMaterials(materials) {
  return Array.isArray(materials)
    ? materials.filter((m) => m && (m.type === 'Gold' || isSilverMetal(m)))
    : []
}

export function sumMetalWeight(materials) {
  return getMetalMaterials(materials).reduce((sum, m) => sum + (Number(m.weight) || 0), 0)
}
