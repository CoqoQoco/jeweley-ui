const METAL_TYPES = ['Gold', 'Silver']

export function getMetalMaterials(materials) {
  return Array.isArray(materials) ? materials.filter((m) => m && METAL_TYPES.includes(m.type)) : []
}

export function sumMetalWeight(materials) {
  return getMetalMaterials(materials).reduce((sum, m) => sum + (Number(m.weight) || 0), 0)
}
