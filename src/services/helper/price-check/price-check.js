// ตรวจราคาผิดปกติก่อนบันทึก (StockProduct/PriceCheck) — pure logic แยกจาก UI เพื่อ test ได้

const CONTEXT_FIELDS = [
  'stockNumber',
  'skuCode',
  'wo',
  'woNumber',
  'moldDesign',
  'productTypeName',
  'productionType',
  'goldWeight',
  'gemPrice'
]

const hasValue = (v) => v !== undefined && v !== null && v !== ''

export const toPriceNumber = (v) => {
  if (v === null || v === undefined || v === '') return NaN
  return Number(String(v).replace(/,/g, ''))
}

// entry: { key, price, label?, ...CONTEXT_FIELDS } — ราคาว่าง/0/ติดลบไม่ต้องตรวจ
export const buildPriceCheckRequest = (entries) => {
  const items = []
  for (const entry of entries || []) {
    const price = toPriceNumber(entry?.price)
    if (!Number.isFinite(price) || price <= 0) continue
    const item = { key: String(entry.key), price }
    for (const field of CONTEXT_FIELDS) {
      if (hasValue(entry[field])) item[field] = entry[field]
    }
    items.push(item)
  }
  return { items }
}

// คืนเฉพาะแถวที่ผิดปกติ พร้อม price/label ที่ผู้ใช้กรอก (join ด้วย key)
export const pickOutliers = (entries, response) => {
  const byKey = new Map((entries || []).map((e) => [String(e.key), e]))
  const result = []
  for (const row of response?.items || []) {
    if (!row?.isOutlier) continue
    const entry = byKey.get(String(row.key))
    if (!entry) continue
    result.push({
      key: String(row.key),
      label: entry.label || '',
      price: toPriceNumber(entry.price),
      reasons: row.reasons || [],
      suggestedPrice: hasValue(row.suggestedPrice) ? Number(row.suggestedPrice) : null
    })
  }
  return result
}

// เรียก API (checkFn คืน null/undefined เมื่อล้มเหลว → ไม่ขวางการบันทึก)
export const findPriceOutliers = async (checkFn, entries) => {
  const request = buildPriceCheckRequest(entries)
  if (!request.items.length) return []
  const response = await checkFn(request.items)
  if (!response) return []
  const sent = new Set(request.items.map((i) => i.key))
  return pickOutliers(
    (entries || []).filter((e) => sent.has(String(e.key))),
    response
  )
}

export const formatPriceNumber = (value) => {
  const n = Number(value)
  if (!Number.isFinite(n)) return ''
  return n.toLocaleString('en-US', { maximumFractionDigits: 2 })
}

export const formatRatio = (value) => {
  const n = Number(value)
  if (!Number.isFinite(n)) return ''
  return n.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
}

const REASON_KEYS = {
  COST_RATIO: 'common.priceCheck.reason.COST_RATIO',
  TYPE_CEILING: 'common.priceCheck.reason.TYPE_CEILING',
  PREVIOUS_PRICE: 'common.priceCheck.reason.PREVIOUS_PRICE',
  SAME_WO: 'common.priceCheck.reason.SAME_WO',
  SAME_DESIGN: 'common.priceCheck.reason.SAME_DESIGN'
}

// t = ฟังก์ชันแปลของ vue-i18n ($t) — รหัสที่ไม่รู้จักจะถูกข้าม (คืน '')
export const formatReason = (t, reason) => {
  const key = REASON_KEYS[reason?.code]
  if (!key) return ''
  if (reason.code === 'COST_RATIO') {
    return t(key, { value: formatRatio(reason.value), reference: formatRatio(reason.reference) })
  }
  return t(key, { reference: formatPriceNumber(reason.reference) })
}

export const formatReasons = (t, reasons) =>
  (reasons || []).map((r) => formatReason(t, r)).filter(Boolean)

// ราคาที่แนะนำของแถวที่ผิดปกติ (ใช้ตอนกด "ใช้ราคาที่แนะนำ")
export const collectSuggestions = (outliers) =>
  (outliers || [])
    .filter((o) => o.suggestedPrice !== null && Number.isFinite(o.suggestedPrice))
    .map((o) => ({ key: o.key, price: o.suggestedPrice }))

// สรุปน้ำหนักทอง/เงิน (กรัม) และราคาพลอย+เพชรรวมจากวัตถุดิบของชิ้นงานในใบรับสินค้า
export const summarizeMaterials = (materials) => {
  let goldWeight = 0
  let gemPrice = 0
  for (const m of materials || []) {
    const qty = Number(m.qty) || 0
    const weight = Number(m.qtyWeight) || 0
    if (m.type === 'Gold' || m.type === 'Silver') {
      goldWeight += weight
    } else if (m.type === 'Gem' || m.type === 'Diamond') {
      gemPrice += qty * (Number(m.qtyPrice) || 0) + weight * (Number(m.qtyWeightPrice) || 0)
    }
  }
  return { goldWeight, gemPrice }
}
