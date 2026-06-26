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
    productImageBlobPath: null,
    productType: null,
    productQty: null,
    productQtyUnit: null,
    productDetail: null,
    materials: [],
  }
}

export function cloneItem(item) {
  if (!item) return item
  return {
    ...item,
    productImageFile: item.productImageFile,
    materials: (item.materials || []).map((m) => ({ ...m })),
  }
}

export function mapPlanMaterialsToPrePlan(planMaterials) {
  if (!Array.isArray(planMaterials)) return []
  return planMaterials.map((m, i) => ({
    id: Date.now() + i,
    gold: m.goldNavigation?.code ? { description: m.goldNavigation.code } : null,
    goldQty: m.goldQty ?? null,
    gem: m.gemNavigation?.code ? { description: m.gemNavigation.code } : null,
    gemShape: m.gemShapeNavigation?.code ? { description: m.gemShapeNavigation.code } : null,
    gemQty: m.gemQty ?? null,
    gemUnit: m.gemUnit ?? null,
    gemSize: m.gemSize ?? null,
    gemWeight: m.gemWeight ?? null,
    gemWeightUnit: m.gemWeightUnit ?? null,
    diamondQty: m.diamondQty ?? null,
    diamondUnit: m.diamondUnit ?? null,
    diamondSize: m.diamondSize ?? null,
    diamondWeight: m.diamondWeight ?? null,
    diamondWeightUnit: m.diamondWeightUnit ?? null,
    diamondQuality: m.diamondQuality ?? null,
  }))
}
