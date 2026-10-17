import { applyGoldTypeName } from './gold-type-name.js'

export function buildBarcodeModel(stock) {
  const goldParts = []
  const gems = []

  if (stock?.materials?.length > 0) {
    stock.materials.forEach((material) => {
      switch (material.type) {
        case 'Gold':
        case 'Silver':
          if (material.typeBarcode) {
            goldParts.push(applyGoldTypeName(material.typeBarcode, material.typeCode))
          }
          break
        case 'Gem':
        case 'Diamond':
          gems.push(material.typeBarcode)
          break
      }
    })
  }

  return {
    goldType: stock?.productionTypeSize,
    isSilver: String(stock?.productionTypeSize || '').toUpperCase() === 'SILVER',
    gold: goldParts.join(' '),
    gems,
    madeIn: 'MADE IN THAILAND',
    madeInText: 'XXXXXXXXXXX',
    stockNumber: stock?.stockNumber,
    stockNumberOrigin: stock?.stockNumberOrigin,
    mold: stock?.mold,
    size: stock?.size,
    productNameEn: stock?.productNameEn || '',
    productNumber: stock?.productNumber || '',
    salePrice: stock?.productPrice ?? null
  }
}
