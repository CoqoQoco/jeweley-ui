let localIdCounter = 1

export function createEmptyItem() {
  return {
    _localId: localIdCounter++,
    moldCode: null,
    moldDetail: null,
    moldImageCad: null,
    moldImageFinish: null,
    productImageFile: null,
    productImagePreview: null,
    productType: null,
    productQty: null,
    productQtyUnit: null,
    productDetail: null,
    materials: [],
  }
}
