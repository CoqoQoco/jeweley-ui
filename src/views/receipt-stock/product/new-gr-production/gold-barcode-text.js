import { resolveGoldTypeWord } from '@/services/helper/barcode/gold-type-name.js'

export function isGoldOrSilverMaterial(item) {
  return item?.type === 'Gold' || item?.type === 'Silver'
}

export function formatGoldBarcodeText(item, isSilverPlan = false) {
  const weight = `${item.qtyWeight ?? ''}`
  const unit = item.qtyWeightUnit ? ` ${item.qtyWeightUnit}` : ''
  const word = resolveGoldTypeWord(item.type, item.typeCode)
  const typeWord = !isSilverPlan && word ? ` ${word}` : ''
  return `${weight}${unit}${typeWord}`
}
