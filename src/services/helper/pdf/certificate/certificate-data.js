// เตรียมข้อมูลใบรับรองสินค้า (Certificate of Authenticity) จากรายการสินค้าใน Invoice
// silver lot: 1 บรรทัด qty N → พิมพ์ N ใบ (1 ใบ = 1 ชิ้นเสมอ) เหมือน buildGuaranteeCardsFromItems

import dayjs from 'dayjs'
import 'dayjs/locale/en'

const GOLD_TYPE_METAL_NAME = {
  YG: 'Yellow Gold',
  WG: 'White Gold',
  PG: 'Pink Gold',
  RG: 'Rose Gold'
}

const GEM_SHAPE_MAP = {
  OV: 'Oval',
  RD: 'Round',
  PS: 'Pear',
  MQ: 'Marquise',
  EM: 'Emerald Cut',
  CU: 'Cushion',
  PR: 'Princess',
  HT: 'Heart',
  TR: 'Trillion',
  BG: 'Baguette',
  SQ: 'Square'
}

const GEM_ORIGIN_MAP = {
  BUR: 'Myanmar (Burma)',
  BURMA: 'Myanmar (Burma)',
  CYL: 'Sri Lanka (Ceylon)',
  CEY: 'Sri Lanka (Ceylon)',
  CEYLON: 'Sri Lanka (Ceylon)',
  MOZ: 'Mozambique',
  THA: 'Thailand',
  TH: 'Thailand',
  MAD: 'Madagascar',
  AFR: 'Africa',
  VN: 'Vietnam'
}

function formatIssueDate(date) {
  return dayjs(date).locale('en').format('D MMMM YYYY')
}

function sumWeight(materials, type) {
  return materials
    .filter((m) => m.type === type)
    .reduce((sum, m) => sum + (Number(m.weight) || 0), 0)
}

function sumQty(materials) {
  return materials.reduce((sum, m) => sum + (Number(m.qty) || 0), 0)
}

// โลหะ: ใช้ productionTypeSize + productionType ก่อนเสมอ (เช่น "18K Yellow Gold")
// ไม่มี → map จาก typeCode ของ material Gold ตัวแรก
function deriveMetal(item, goldMaterials) {
  const productionTypeSize = (item.productionTypeSize || '').trim()
  const productionType = (item.productionType || '').trim()
  if (productionTypeSize || productionType) {
    return [productionTypeSize, productionType].filter(Boolean).join(' ')
  }

  const firstGold = goldMaterials[0]
  if (firstGold && firstGold.typeCode) {
    const mapped = GOLD_TYPE_METAL_NAME[firstGold.typeCode.trim().toUpperCase()]
    if (mapped) return mapped
  }

  return ''
}

// พลอยเม็ดหลัก = material type Gem ที่ weight มากที่สุด
function pickMainGem(gemMaterials) {
  if (!gemMaterials.length) return null
  return gemMaterials.reduce(
    (max, m) => ((Number(m.weight) || 0) > (Number(max.weight) || 0) ? m : max),
    gemMaterials[0]
  )
}

// ชื่อพลอย — ใช้ typeCode ก่อนเสมอ (เป็นชื่อสะอาดอยู่แล้ว เช่น "Sapphire")
// ไม่มี typeCode ค่อย fallback ไป typeOrigin ตัดวงเล็บออก เช่น "Ruby(BUR)" → "Ruby"
// (typeOrigin บางเคสเป็นคำย่อ เช่น "Sap(Cyl)" ตัดวงเล็บอย่างเดียวจะได้ "Sap" ไม่ใช่ชื่อเต็ม จึงต้องใช้ typeCode นำก่อน)
function deriveGemVariety(material) {
  const typeCode = (material.typeCode || '').trim()
  if (typeCode) return typeCode
  if (!material.typeOrigin) return ''
  return String(material.typeOrigin).split('(')[0].trim()
}

function deriveGemSpecies(variety) {
  const v = (variety || '').toLowerCase().trim()
  if (!v) return ''

  const matches = (keyword) => v.includes(keyword) || keyword.includes(v)

  if (matches('ruby') || matches('sapphire')) return 'Corundum'
  if (matches('emerald') || matches('aquamarine')) return 'Beryl'
  if (matches('amethyst') || matches('citrine')) return 'Quartz'
  if (matches('tsavorite') || matches('rhodolite') || matches('garnet')) return 'Garnet'
  return ''
}

// อ่านโค้ดในวงเล็บของ typeOrigin แล้ว map เป็นชื่อประเทศ — โค้ดที่ไม่รู้จักคงข้อความเดิมไว้ให้ผู้ใช้แก้เอง
function parseGemOrigin(typeOrigin) {
  if (!typeOrigin) return ''
  const match = String(typeOrigin).match(/\(([^)]+)\)/)
  if (!match) return ''
  const code = match[1].trim()
  if (!code) return ''
  return GEM_ORIGIN_MAP[code.toUpperCase()] || code
}

// "5x4 OV " → { measurement: '5.0 x 4.0 mm', shape: 'Oval' } — อ่านไม่ได้ = ค่าว่างทั้งคู่
function parseGemSize(sizeStr) {
  if (!sizeStr) return { measurement: '', shape: '' }

  const match = String(sizeStr)
    .trim()
    .match(/^([\d.]+)\s*[xX]\s*([\d.]+)\s*([A-Za-z]*)$/)
  if (!match) return { measurement: '', shape: '' }

  const w = Number(match[1])
  const h = Number(match[2])
  if (Number.isNaN(w) || Number.isNaN(h)) return { measurement: '', shape: '' }

  const measurement = `${w.toFixed(1)} x ${h.toFixed(1)} mm`
  const shapeCode = (match[3] || '').trim().toUpperCase()
  const shape = GEM_SHAPE_MAP[shapeCode] || ''

  return { measurement, shape }
}

function buildGemBlock(material) {
  const variety = deriveGemVariety(material)
  return {
    gemVariety: variety,
    gemSpecies: deriveGemSpecies(variety),
    gemOrigin: parseGemOrigin(material.typeOrigin),
    gemWeight: `${(Number(material.weight) || 0).toFixed(2)} ct`,
    ...parseGemSize(material.size)
  }
}

export function buildCertificatesFromItems(items, options = {}) {
  if (!items || !Array.isArray(items)) return []

  const issueDate = formatIssueDate(options.now || new Date())

  return items.flatMap((item) => {
    const materials = Array.isArray(item.materials) ? item.materials : []
    // fallback ปลอดภัย — ใช้ typeOrigin จาก enrich ถ้ามี ไม่งั้นใช้ typeCode แทน (ตาม material-summary.js)
    const enrichedMaterials = materials.map((m) => ({
      ...m,
      typeOrigin: m.typeOrigin || m.typeCode || ''
    }))

    const itemNo = item.stockNumberOrigin || item.productNumber || ''
    const certificateNo = `DKC-${itemNo}`

    const goldMaterials = enrichedMaterials.filter((m) => m.type === 'Gold')
    const metalWeight = goldMaterials.length ? `${sumWeight(enrichedMaterials, 'Gold').toFixed(2)} g` : ''
    const metal = deriveMetal(item, goldMaterials)

    const diamondMaterials = enrichedMaterials.filter((m) => m.type === 'Diamond')
    const hasDiamond = diamondMaterials.length > 0
    const diamondPcs = hasDiamond ? Math.round(sumQty(diamondMaterials)) : ''
    const diamondWeight = hasDiamond ? `${sumWeight(enrichedMaterials, 'Diamond').toFixed(2)} ct` : ''
    const diamondQuality = diamondMaterials[0]?.typeCode || ''

    const gemMaterials = enrichedMaterials.filter((m) => m.type === 'Gem')
    const mainGem = pickMainGem(gemMaterials)
    const gemBlock = mainGem
      ? buildGemBlock(mainGem)
      : { gemVariety: '', gemSpecies: '', gemOrigin: '', gemWeight: '', measurement: '', shape: '' }

    const qty = Math.max(1, Math.floor(Number(item.qty) || 1))

    const base = {
      certificateNo,
      itemNo,
      issueDate,
      description: item.productNameEn || '',
      model: item.mold || '',
      metal,
      metalWeight,
      itemSize: item.size || '',
      diamondPcs,
      diamondWeight,
      diamondQuality,
      hasDiamond,
      hasGem: !!mainGem,
      gemVariety: gemBlock.gemVariety,
      gemSpecies: gemBlock.gemSpecies,
      gemOrigin: gemBlock.gemOrigin,
      gemWeight: gemBlock.gemWeight,
      gemMeasurement: gemBlock.measurement,
      gemShape: gemBlock.shape,
      gemCut: '',
      gemColor: '',
      treatment: '',
      comment: '',
      stockNumber: item.stockNumber || '',
      productNumber: item.productNumber || '',
      imagePath: item.imagePath || '',
      imageBlobPath: item.imageBlobPath || '',
      selected: true
    }

    return Array.from({ length: qty }, () => ({ ...base }))
  })
}

// แปลง print log ดิบจาก Invoice/PrintLog/List → เฉพาะรายการใบรับรอง เรียงเก่า→ใหม่พร้อมเลขรอบ
export function parseCertificateLogs(logs) {
  if (!logs || !Array.isArray(logs)) return []

  const certificateLogs = logs.filter((log) => log && log.paperType === 'certificate')

  // API คืนใหม่สุดก่อน → กลับเป็นเก่าสุดก่อนเพื่อนับ round ตามลำดับเวลาออกจริง
  const sorted = [...certificateLogs].sort((a, b) => new Date(a.printedAt) - new Date(b.printedAt))

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

// สถิติการออกใบรับรองต่อ stockNumber จากประวัติที่ parse แล้ว (entries เรียงเก่า→ใหม่)
export function buildCertificateIssueStats(certificates, entries) {
  const stats = {}
  const list = Array.isArray(certificates) ? certificates : []
  const logEntries = Array.isArray(entries) ? entries : []
  const sortedEntries = [...logEntries].sort((a, b) => new Date(a.printedAt) - new Date(b.printedAt))

  list.forEach((certificate) => {
    const stockNumber = certificate.stockNumber
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
