export function isGoldOrSilverMaterial(item) {
  return item?.type === 'Gold' || item?.type === 'Silver'
}

export function formatGoldBarcodeText(item, isSilverPlan = false) {
  const weight = `${item.qtyWeight ?? ''}`
  const unit = item.qtyWeightUnit ? ` ${item.qtyWeightUnit}` : ''
  const typeWord = !isSilverPlan && item.type ? ` ${item.type}` : ''
  return `${weight}${unit}${typeWord}`
}
