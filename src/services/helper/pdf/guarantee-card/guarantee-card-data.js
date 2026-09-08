// เตรียมข้อมูลใบรับประกันสินค้า (Guarantee Card) จากรายการสินค้าใน Invoice
// silver lot: 1 บรรทัด qty N → พิมพ์ N การ์ด (1 การ์ด = 1 ชิ้นเสมอ), ทองยัง qty 1 = 1 การ์ด

function insertSpaceBeforeParen(name) {
  if (!name) return name
  return name.replace(/([^\s])\(/g, '$1 (')
}

function sumWeight(materials, type) {
  return materials
    .filter((m) => m.type === type)
    .reduce((sum, m) => sum + (Number(m.weight) || 0), 0)
}

function buildGemRows(materials) {
  const gemMaterials = materials.filter((m) => m.type === 'Gem')
  const groups = new Map()

  gemMaterials.forEach((m) => {
    const rawName = m.typeOrigin || m.typeName || m.typeCode || 'Gem'
    const name = insertSpaceBeforeParen(rawName)
    const weight = Number(m.weight) || 0
    groups.set(name, (groups.get(name) || 0) + weight)
  })

  return Array.from(groups.entries()).map(([name, weight]) => ({
    name,
    weight: weight.toFixed(2)
  }))
}

export function buildGuaranteeCardsFromItems(items) {
  if (!items || !Array.isArray(items)) return []

  return items.flatMap((item) => {
    const materials = Array.isArray(item.materials) ? item.materials : []

    const goldMaterials = materials.filter((m) => m.type === 'Gold')
    const goldWeight = goldMaterials.length ? sumWeight(materials, 'Gold').toFixed(2) : ''

    const diamondMaterials = materials.filter((m) => m.type === 'Diamond')
    const diamondWeight = diamondMaterials.length ? sumWeight(materials, 'Diamond').toFixed(2) : ''
    const firstDiamond = diamondMaterials[0]
    const diamondQuality = firstDiamond && firstDiamond.typeCode ? `${firstDiamond.typeCode} Color` : ''

    const qty = Math.max(1, Math.floor(Number(item.qty) || 1))

    return Array.from({ length: qty }, () => ({
      code: item.mold || item.productNumber || '',
      goodsSpecify: item.productNameEn || item.description || '',
      goldWeight,
      gemRows: buildGemRows(materials),
      diamondWeight,
      diamondQuality,
      imagePath: item.imagePath || '',
      imageBlobPath: item.imageBlobPath || '',
      stockNumber: item.stockNumber || '',
      productNumber: item.productNumber || '',
      selected: true
    }))
  })
}

// แปลง print log ดิบจาก Invoice/PrintLog/List → เฉพาะรายการใบรับประกัน เรียงเก่า→ใหม่พร้อมเลขรอบ
export function parseGuaranteeLogs(logs) {
  if (!logs || !Array.isArray(logs)) return []

  const guaranteeLogs = logs.filter((log) => log && log.paperType === 'guarantee-card')

  // API คืนใหม่สุดก่อน → กลับเป็นเก่าสุดก่อนเพื่อนับ round ตามลำดับเวลาออกจริง
  const sorted = [...guaranteeLogs].sort((a, b) => new Date(a.printedAt) - new Date(b.printedAt))

  return sorted.map((log, index) => {
    let parsed = {}
    try {
      parsed = log.data ? JSON.parse(log.data) : {}
    } catch {
      parsed = {}
    }
    if (!parsed || typeof parsed !== 'object') parsed = {}

    const stockNumbers = Array.isArray(parsed.stockNumbers) ? parsed.stockNumbers : []

    return {
      running: log.running,
      printedAt: log.printedAt,
      printedBy: log.printedBy,
      round: index + 1,
      stockNumbers,
      count: parsed.count ?? stockNumbers.length,
      signerTitle: parsed.signerTitle || ''
    }
  })
}

// สถิติการออกใบรับประกันต่อ stockNumber จากประวัติที่ parse แล้ว (entries เรียงเก่า→ใหม่)
export function buildCardIssueStats(cards, entries) {
  const stats = {}
  const list = Array.isArray(cards) ? cards : []
  const logEntries = Array.isArray(entries) ? entries : []
  const sortedEntries = [...logEntries].sort((a, b) => new Date(a.printedAt) - new Date(b.printedAt))

  list.forEach((card) => {
    const stockNumber = card.stockNumber
    if (!stockNumber) return

    const matches = sortedEntries.filter((entry) => (entry.stockNumbers || []).includes(stockNumber))

    if (!matches.length) {
      stats[stockNumber] = { count: 0, lastAt: null, lastBy: '' }
      return
    }

    const last = matches[matches.length - 1]
    stats[stockNumber] = {
      count: matches.length,
      lastAt: last.printedAt,
      lastBy: last.printedBy || ''
    }
  })

  return stats
}
