// เติมรูปจากสินค้ารหัสเดียวกัน (ตัดเลขท้าย) ให้แถวรับเข้า -- logic ล้วน ไม่แตะ API/DOM

export function needsImageSuggest(row, { onlyEmpty = false } = {}) {
  if (!row || row.isReceipt || row.topUpStockNumber) return false
  if (!String(row.productNumber ?? '').trim()) return false
  if (row.imagePath) return !onlyEmpty && row.imageSuggestAuto === true
  return true
}

export function buildImageSuggestItems(rows, keyOf, options) {
  return rows
    .filter((row) => needsImageSuggest(row, options))
    .map((row) => ({ key: keyOf(row), productNumber: String(row.productNumber).trim() }))
}

export function applyImageSuggestion(row, hit) {
  if (!row || !hit || !hit.imagePath) return false
  if (row.imagePath && row.imageSuggestAuto !== true) return false
  row.imageName = hit.imageName || null
  row.imagePath = hit.imagePath
  row.imageSuggestAuto = true
  row.imageSuggestSource = hit.sourceProductNumber || ''
  return true
}

export function clearImageSuggestFlag(row) {
  if (!row) return
  row.imageSuggestAuto = false
  row.imageSuggestSource = ''
}

export function dropAutoImage(row) {
  if (!row || row.imageSuggestAuto !== true) return false
  row.imageName = null
  row.imagePath = null
  clearImageSuggestFlag(row)
  return true
}

export function stripImageSuggestFields(row) {
  const copy = { ...row }
  delete copy.imageSuggestAuto
  delete copy.imageSuggestSource
  return copy
}
