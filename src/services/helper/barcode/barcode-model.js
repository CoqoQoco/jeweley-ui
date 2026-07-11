export function buildBarcodeModel(stock) {
  const goldParts = []
  const gems = []

  if (stock?.materials?.length > 0) {
    stock.materials.forEach((material) => {
      switch (material.type) {
        case 'Gold':
        case 'Silver':
          if (material.typeBarcode) goldParts.push(material.typeBarcode)
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
    isSilver: stock?.productionTypeSize === 'SILVER',
    gold: goldParts.join(' '),
    gems,
    madeIn: 'MADE IN THAILAND',
    madeInText: 'XXXXXXXXXXX',
    stockNumber: stock?.stockNumber,
    mold: stock?.mold,
    size: stock?.size,
    productNameEn: stock?.productNameEn || '',
    productNumber: stock?.productNumber || ''
  }
}
