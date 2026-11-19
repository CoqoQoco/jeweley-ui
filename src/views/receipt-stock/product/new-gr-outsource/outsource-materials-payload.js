import { buildMaterialBarcodeText } from '../new-gr-production/material-barcode-text.js'

export function buildOutsourceMaterials(materials, { isSilverPlan = false } = {}) {
  return (materials || []).map((m) => {
    const totalPrice =
      (Number(m.qty) || 0) * (Number(m.qtyPrice) || 0) +
      (Number(m.qtyWeight) || 0) * (Number(m.qtyWeightPrice) || 0)

    return {
      ...m,
      weight: Number(m.qtyWeight) || null,
      weightUnit: m.qtyWeightUnit,
      price: totalPrice || null,
      typeBarcode: buildMaterialBarcodeText(m, { isSilverPlan }) || m.typeBarcode || null
    }
  })
}
