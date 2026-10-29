import { applyGoldTypeName } from './gold-type-name.js'

const LABEL_GOLD_COLOR_CODES = ['WG', 'YG', 'PG']
const LABEL_GOLD_COLOR_BY_NAME = { 'WHITE GOLD': 'WG', 'YELLOW GOLD': 'YG', 'PINK GOLD': 'PG' }
const LABEL_KARATS = ['18K', '14K', '9K']

// สีทองบนป้ายเล็ก: typeCode ของ material ทองก่อน ไม่มีค่อยดูชื่อ productionType — ได้เฉพาะ WG/YG/PG (เงิน/สีอื่น = '')
export function resolveLabelGoldColor(stock) {
  const goldMaterial = (stock?.materials || []).find((m) => m.type === 'Gold' && m.typeCode)
  const fromCode = String(goldMaterial?.typeCode ?? '').trim().toUpperCase()
  if (LABEL_GOLD_COLOR_CODES.includes(fromCode)) return fromCode
  return LABEL_GOLD_COLOR_BY_NAME[String(stock?.productionType ?? '').trim().toUpperCase()] || ''
}

// กะรัตบนป้ายเล็ก: จาก productionTypeSize เท่านั้น (18K/14K/9K) — Silver/ค่าอื่น = ''
export function resolveLabelKarat(stock) {
  const normalized = String(stock?.productionTypeSize ?? '').trim().toUpperCase().replace(/\s+/g, '')
  return LABEL_KARATS.includes(normalized) ? normalized : ''
}

// น้ำหนักทอง (ตัวเลขล้วน) จากข้อความ typeBarcode ของ material ทอง/เงิน (เช่น "11.78 g. White Gold") — หลายแถวรวมกัน
export function resolveLabelGoldWeight(stock) {
  const weights = (stock?.materials || [])
    .filter((m) => (m.type === 'Gold' || m.type === 'Silver') && m.typeBarcode)
    .map((m) => String(m.typeBarcode).match(/^\s*(\d+(?:\.\d+)?)/)?.[1])
    .filter(Boolean)
  if (weights.length === 0) return ''
  if (weights.length === 1) return weights[0]
  return String(Math.round(weights.reduce((sum, w) => sum + Number(w), 0) * 100) / 100)
}

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
    salePrice: stock?.productPrice ?? null,
    goldWeight: resolveLabelGoldWeight(stock),
    goldColorCode: resolveLabelGoldColor(stock),
    goldKarat: resolveLabelKarat(stock)
  }
}
