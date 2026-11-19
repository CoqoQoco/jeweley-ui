import { formatGoldBarcodeText } from './gold-barcode-text.js'

export function buildMaterialBarcodeText(item, { isSilverPlan = false } = {}) {
  let display = ''

  if (item.type === 'Diamond') {
    display = `${item.qty ?? ''}${item.type ?? ''}${item.qtyWeight ?? ''}${
      item.qtyWeightUnit ? ` ${item.qtyWeightUnit}` : ''
    }${item.typeCode ? `, ${item.typeCode}` : ''}${item.size ? `, ${item.size}` : ''} ${
      item.region ? `, (${item.region})` : ''
    }`
  }

  if (item.type === 'Gold' || item.type === 'Silver') {
    display = formatGoldBarcodeText(item, isSilverPlan)
  }

  if (item.type === 'Gem') {
    display = `${item.qty ?? ''}${item.typeCode ?? ''}${item.qtyWeight ?? ''}${
      item.qtyWeightUnit ? ` ${item.qtyWeightUnit}` : ``
    }${item.size ? `, ${item.size}` : ''}${item.region ? `, (${item.region})` : ''}`
  }

  return display
}
