const num = (v) => Number(v) || 0
const sumBy = (list, type, f) => list.filter((m) => m.type === type).reduce((s, m) => s + num(m[f]), 0)
const firstUnit = (list, type, f, fb) => (list.find((m) => m.type === type && m[f])?.[f]) || fb

export function summarizeMaterials(materials = []) {
  const list = Array.isArray(materials) ? materials : []
  return {
    goldWeight: sumBy(list, 'Gold', 'weight').toFixed(2),
    goldWeightUnit: firstUnit(list, 'Gold', 'weightUnit', 'gms'),
    diamondPcs: Math.round(sumBy(list, 'Diamond', 'qty')),
    diamondPcsUnit: firstUnit(list, 'Diamond', 'qtyUnit', 'เม็ด'),
    diamondCarat: sumBy(list, 'Diamond', 'weight').toFixed(2),
    diamondCaratUnit: firstUnit(list, 'Diamond', 'weightUnit', 'ct'),
    gemPcs: Math.round(sumBy(list, 'Gem', 'qty')),
    gemPcsUnit: firstUnit(list, 'Gem', 'qtyUnit', 'เม็ด'),
    gemCarat: sumBy(list, 'Gem', 'weight').toFixed(2),
    gemCaratUnit: firstUnit(list, 'Gem', 'weightUnit', 'ct')
  }
}
