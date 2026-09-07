// sale-summary-data.js — รวมยอดรายการสินค้าตามประเภทสินค้า สำหรับใบสรุปตามประเภทสินค้า
// ใช้ร่วมกันทั้ง PDF และ Excel builder (ห้ามเขียน logic การจัดกลุ่มซ้ำที่อื่น)
//
// ตัวเลขต้องกระทบยอดกับ Invoice/Quotation เดิม:
//   - น้ำหนัก "ไม่" คูณจำนวน (qty) — รวมดิบตาม item.materials เหมือนแถว Total ของเอกสารเดิม
//   - ยอดเงิน คูณจำนวน (qty)

const GOLD_TYPE_RE = /^\d+K$/i

/**
 * แยกประเภทสินค้า/ประเภททอง จาก description เช่น "18K EARRING Diamond" -> EARRING / 18K
 * @param {string} description
 * @returns {{ goldType: string, productType: string }}
 */
function parseFromDescription(description) {
  const desc = (description || '').trim()
  if (!desc) return { goldType: 'N/A', productType: 'OTHER' }

  const tokens = desc.split(/\s+/)
  let idx = 0
  let goldType = 'N/A'
  if (tokens[0] && GOLD_TYPE_RE.test(tokens[0])) {
    goldType = tokens[0].toUpperCase()
    idx = 1
  }
  const productType = (tokens[idx] || 'OTHER').toUpperCase()
  return { goldType, productType }
}

/**
 * แปลง master ประเภทสินค้า (Master/MasterProductType) → map code -> ชื่อภาษาอังกฤษ
 * เอกสารใบสรุปเป็นภาษาอังกฤษทั้งใบ จึงต้องใช้ nameEn ไม่ใช่ productTypeName (ที่เป็นภาษาไทย)
 * @param {Array} productTypes - master rows { code, nameEn, nameTh }
 * @returns {Object} map code -> nameEn
 */
export function buildProductTypeLabelMap(productTypes) {
  const list = Array.isArray(productTypes) ? productTypes : []
  return list.reduce((map, item) => {
    const code = String(item?.code ?? '').trim()
    const nameEn = String(item?.nameEn ?? '').trim()
    if (code && nameEn) map[code] = nameEn
    return map
  }, {})
}

function lookupProductTypeLabel(productTypeLabels, code) {
  const key = String(code ?? '').trim()
  if (!key || !productTypeLabels) return ''

  const value =
    productTypeLabels instanceof Map
      ? productTypeLabels.get(key)
      : Object.prototype.hasOwnProperty.call(productTypeLabels, key)
        ? productTypeLabels[key]
        : ''

  return String(value ?? '').trim()
}

function sumMaterialWeight(materials, type) {
  if (!materials || !Array.isArray(materials)) return 0
  return materials.reduce((sum, m) => {
    if (!m || m.type !== type) return sum
    return sum + (Number(m.weight) || 0)
  }, 0)
}

/**
 * รวมยอดรายการสินค้าเป็นกลุ่มตามประเภทสินค้า
 * @param {Array} items - รายการสินค้าของใบเสนอราคา/ใบแจ้งหนี้
 * @param {Object} options
 * @param {number} [options.divisor=1] - ตัวหารอัตราแลกเปลี่ยน (currencyMultiplier / currencyRate)
 * @param {boolean} [options.groupByGoldType=false] - true = แยกกลุ่มตามประเภททองด้วย
 * @param {Object|Map} [options.productTypeLabels={}] - map code -> ชื่อประเภทสินค้าภาษาอังกฤษ
 * @returns {{ groups: Array, totals: Object }}
 */
export function buildSaleSummaryGroups(
  items,
  { divisor = 1, groupByGoldType = false, productTypeLabels = {} } = {}
) {
  const list = Array.isArray(items) ? items : []
  const rate = Number(divisor) || 1
  const map = new Map()
  const totals = {
    qty: 0,
    netWeight: 0,
    goldWeight: 0,
    stoneWeight: 0,
    diamondWeight: 0,
    amount: 0
  }

  list.forEach((item) => {
    if (!item) return

    const parsed = parseFromDescription(item.description)
    // ลำดับการเลือกชื่อประเภท: master (nameEn) → productTypeName → parse จาก description → OTHER
    const masterLabel = lookupProductTypeLabel(productTypeLabels, item.productType)
    const explicitType = String(item.productTypeName || '').trim()
    const productType = (masterLabel || explicitType || parsed.productType).toUpperCase()
    const label = groupByGoldType ? `${productType} - ${parsed.goldType}` : productType

    const qty = Number(item.qty) || 0
    const goldWeight = sumMaterialWeight(item.materials, 'Gold')
    const diamondWeight = sumMaterialWeight(item.materials, 'Diamond')
    const stoneWeight = sumMaterialWeight(item.materials, 'Gem')
    const netWeight = (diamondWeight + stoneWeight) / 5 + goldWeight

    const appraisalPrice = Number(item.appraisalPrice) || 0
    const discountPercent = Number(item.discountPercent) || 0
    const amount = ((appraisalPrice * (1 - discountPercent / 100)) / rate) * qty

    if (!map.has(label)) {
      map.set(label, {
        label,
        qty: 0,
        netWeight: 0,
        goldWeight: 0,
        stoneWeight: 0,
        diamondWeight: 0,
        amount: 0
      })
    }

    const group = map.get(label)
    group.qty += qty
    group.netWeight += netWeight
    group.goldWeight += goldWeight
    group.stoneWeight += stoneWeight
    group.diamondWeight += diamondWeight
    group.amount += amount

    totals.qty += qty
    totals.netWeight += netWeight
    totals.goldWeight += goldWeight
    totals.stoneWeight += stoneWeight
    totals.diamondWeight += diamondWeight
    totals.amount += amount
  })

  const groups = [...map.values()].sort((a, b) => a.label.localeCompare(b.label))
  return { groups, totals }
}
