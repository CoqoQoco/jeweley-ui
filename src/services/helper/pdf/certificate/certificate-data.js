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

export function formatIssueDate(date) {
  return dayjs(date).locale('en').format('D MMMM YYYY')
}

// รหัส WALKIN ใน prod ใช้ร่วมกันโดยลูกค้าหน้าร้าน 17 ชื่อ (20 ใบแจ้งหนี้) — ห้ามผูกตราสินค้าเข้ากับ
// customerCode นี้เด็ดขาด ไม่งั้นลูกค้าหน้าร้านคนอื่นจะโดน auto-fill ตราสินค้าของคนก่อนไปด้วย
export function isWalkInCustomer(customerCode) {
  return String(customerCode || '').trim().toUpperCase() === 'WALKIN'
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
      photoSource: 'stock',
      customImagePath: null,
      selected: true
    }

    return Array.from({ length: qty }, () => ({ ...base }))
  })
}

// จับคู่ snapshot(data) ของแต่ละแถวจาก Certificate/List — คืน {} เสมอถ้า parse ไม่ได้ ไม่ปล่อยพัง UI
function parseCertificateSnapshotJson(dataJson) {
  let parsed = {}
  try {
    parsed = dataJson ? JSON.parse(dataJson) : {}
  } catch {
    parsed = {}
  }
  return parsed && typeof parsed === 'object' ? parsed : {}
}

// จัดกลุ่มแถวจาก Certificate/List (flat, ใหม่สุดก่อน) ตาม batch → 1 batch = 1 รอบพิมพ์
// นับเลขรอบเก่า→ใหม่ (round 1 = รอบแรกสุด) แต่ผลลัพธ์ที่คืนเรียงใหม่สุดก่อนเพื่อแสดงผล
export function groupCertificateHistory(rows) {
  if (!Array.isArray(rows) || !rows.length) return []

  const parsedRows = rows.map((row) => {
    const snapshot = parseCertificateSnapshotJson(row.data)
    return { ...row, snapshot, isLegacy: snapshot.legacy === true }
  })

  const batchMap = new Map()
  parsedRows.forEach((row) => {
    if (!batchMap.has(row.batch)) batchMap.set(row.batch, [])
    batchMap.get(row.batch).push(row)
  })

  const groups = [...batchMap.entries()].map(([batch, groupRows]) => {
    const sortedRows = [...groupRows].sort((a, b) => (a.issueNo || 0) - (b.issueNo || 0))
    const first = sortedRows[0] || {}
    return {
      batch,
      printedAt: first.createDate,
      printedBy: first.createBy || '',
      brandName: first.brandName || '',
      count: sortedRows.length,
      rows: sortedRows
    }
  })

  const oldestFirst = [...groups].sort((a, b) => new Date(a.printedAt) - new Date(b.printedAt))
  const withRound = oldestFirst.map((group, index) => ({ ...group, round: index + 1 }))

  return withRound.reverse()
}

// สถิติการออกใบรับรองต่อ stockNumber จากแถวดิบของ Certificate/List (ไม่ต้อง group ก่อน)
export function buildCertificateIssueStatsFromHistory(certificates, rows) {
  const stats = {}
  const list = Array.isArray(certificates) ? certificates : []
  const historyRows = Array.isArray(rows) ? rows : []

  list.forEach((certificate) => {
    const stockNumber = certificate.stockNumber
    if (!stockNumber) return

    const matches = historyRows
      .filter((row) => row.stockNumber === stockNumber)
      .sort((a, b) => new Date(a.createDate) - new Date(b.createDate))

    if (!matches.length) {
      stats[stockNumber] = { count: 0, lastAt: null, lastBy: '' }
      return
    }

    const last = matches[matches.length - 1]
    stats[stockNumber] = {
      count: matches.length,
      lastAt: last.createDate,
      lastBy: last.createBy || ''
    }
  })

  return stats
}

// snapshot ที่บันทึกลง Certificate/Create data (JSON string) — ห้ามมี base64 ใดๆ ปนอยู่เด็ดขาด
// resolvedImagePath = path รูปที่ใช้พิมพ์จริงรอบนี้ (อัปโหลดใหม่/มาจากประวัติ) ไม่ใช่รูปสต็อกเดิม
export function buildCertificateSnapshot(certificate, brand, signerTitle, resolvedImagePath) {
  return {
    certificateNo: certificate.certificateNo,
    itemNo: certificate.itemNo,
    issueDate: certificate.issueDate,
    description: certificate.description,
    model: certificate.model,
    metal: certificate.metal,
    metalWeight: certificate.metalWeight,
    itemSize: certificate.itemSize,
    diamondPcs: certificate.diamondPcs,
    diamondWeight: certificate.diamondWeight,
    diamondQuality: certificate.diamondQuality,
    hasDiamond: certificate.hasDiamond,
    hasGem: certificate.hasGem,
    gemVariety: certificate.gemVariety,
    gemSpecies: certificate.gemSpecies,
    gemOrigin: certificate.gemOrigin,
    gemWeight: certificate.gemWeight,
    gemMeasurement: certificate.gemMeasurement,
    gemShape: certificate.gemShape,
    gemCut: certificate.gemCut,
    gemColor: certificate.gemColor,
    treatment: certificate.treatment,
    comment: certificate.comment,
    stockNumber: certificate.stockNumber,
    productNumber: certificate.productNumber,
    imagePath: certificate.imagePath || '',
    imageBlobPath: certificate.imageBlobPath || '',
    photoSource: certificate.photoSource || 'stock',
    customImagePath: resolvedImagePath || null,
    brand: {
      mode: brand?.mode || 'dk',
      name: brand?.name || '',
      logoPath: brand?.logoPath || null,
      showManufacturer: brand?.showManufacturer !== false,
      showQr: brand?.showQr === true
    },
    signerTitle
  }
}

// คืนค่า certificate fields จาก snapshot ที่ parse แล้ว (ไม่รวม brand/signerTitle — ผู้เรียกอ่านจาก snapshot เอง)
// resetIssueDate: true = ใช้กับ "โหลดมาแก้ไข" (วันที่ออกใบใหม่เป็นวันนี้), false = ใช้กับ "พิมพ์ซ้ำ/ดู PDF" (คงวันที่เดิม)
export function restoreCertificateFromSnapshot(snapshot, options = {}) {
  const certificateFields = { ...(snapshot || {}) }
  delete certificateFields.brand
  delete certificateFields.signerTitle

  return {
    ...certificateFields,
    issueDate: options.resetIssueDate ? formatIssueDate(new Date()) : certificateFields.issueDate,
    selected: true
  }
}
