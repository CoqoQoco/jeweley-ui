// โมดูลสร้าง ZPL ล้วน (pure) — ห้าม import อะไรทั้งสิ้น (ไม่มี @/, pinia, axios)
// ต้อง import ตรงจาก node script ธรรมดาได้ เพื่อใช้เรนเดอร์ตรวจ layout นอกเว็บ

// ─────────────────────────────────────────────────────────────
// GT800: ป้าย 75×13 มม. = 600×104 dots ที่ 203 dpi
// หางป้ายซ้าย x≈0–250 · หัวป้ายสีขาว x≈250–596 · แถบส้มด้านบนหัวป้าย y<30
// ค่าทั้งหมดด้านล่างเป็นพิกัดฐานที่ 203 dpi — generateGt800ZPL* จะคูณ dpiScale ให้เอง
// ปรับจูนได้ที่เดียว — แก้ constants เหล่านี้พอ
// ─────────────────────────────────────────────────────────────

const GT800_LABEL_HEIGHT = 104

const GT800_MADE_IN_X = 25
const GT800_MADE_IN_Y = 50
const GT800_MADE_IN_FONT = [15, 15]

// แถวบาร์โค้ด + บรรทัดเลขที่ผลิต-ราคา (template แนวนอน / แท็บ original)
const GT800_H_BARCODE_X = 262
const GT800_H_BARCODE_Y = 31
const GT800_H_BARCODE_MODULE = 1
const GT800_H_BARCODE_RATIO = '3.0:1'
const GT800_H_BARCODE_HEIGHT = 20

const GT800_H_CODE_LINE_X = 256
const GT800_H_CODE_LINE_Y = 56

// แถวล่าง: ประเภททอง + น้ำหนัก/ไซซ์ (template แนวนอน)
const GT800_BOTTOM_LINE_Y = 78
const GT800_BOTTOM_FONT = [15, 15]
const GT800_GOLDTYPE_X = 256
const GT800_GOLD_X_WITH_TYPE = 292
const GT800_GOLD_X_NO_TYPE = 256

// template แนวตั้ง (4 แท็บราคา)
const GT800_V_NAME_X = 256
const GT800_V_NAME_Y = 31
const GT800_V_NAME_FONT = [14, 14]

const GT800_V_GOLD_X = 256
const GT800_V_GOLD_Y = 46
const GT800_V_GOLD_FONT = [14, 14]

const GT800_V_BARCODE_X = 262
const GT800_V_BARCODE_Y = 61
const GT800_V_BARCODE_MODULE = 1
const GT800_V_BARCODE_RATIO = '3.0:1'
const GT800_V_BARCODE_HEIGHT = 18

const GT800_V_CODE_LINE_X = 256
const GT800_V_CODE_LINE_Y = 83
const GT800_V_CODE_LINE_FONT = [15, 15]

// คอลัมน์พลอย — เลือก 2 ระดับอัตโนมัติตามความยาวบาร์โค้ด/ข้อความ
const GEM_START_Y = 31
const GEM_LEVELS = {
  ROOMY: { name: 'ROOMY', x: 422, gemFont: [14, 15], lineHeight: 15, priceFontHorizontal: [16, 16] },
  TIGHT: { name: 'TIGHT', x: 472, gemFont: [12, 11], lineHeight: 14, priceFontHorizontal: [15, 13] }
}

// เกณฑ์เลือก ROOMY/TIGHT (ปรับได้ที่เดียว)
const GT800_BARCODE_START_X = 262 // จุดเริ่ม x ของบาร์โค้ด ใช้คำนวณความกว้างบาร์โค้ดโดยประมาณ
const GT800_BARCODE_CHAR_EXTRA = 3
const GT800_BARCODE_CHAR_WIDTH = 11
const GT800_BARCODE_END_PAD = 2
const GT800_ROOMY_BARCODE_SAFETY = 10
const GT800_ROOMY_BARCODE_END_MAX = 422
const GT800_ROOMY_LINE_COUNT_THRESHOLD = 3
const GT800_ROOMY_LINE_MAX_LEN = 20
const GT800_ROOMY_GEM_MAX_LEN = 24

// แท็บ original-qr — บล็อกข้อความชิดซ้าย 4 บรรทัด (ไม่มีพลอย) + QR วางกลางพื้นที่ว่างด้านขวาของบล็อก
const GT800_QR_NAME_X = 256
const GT800_QR_NAME_Y = 31
const GT800_QR_NAME_FONT = [14, 14]

const GT800_QR_BARCODE_X = 262
const GT800_QR_BARCODE_Y = 47
const GT800_QR_BARCODE_MODULE = 1
const GT800_QR_BARCODE_RATIO = '3.0:1'
const GT800_QR_BARCODE_HEIGHT = 18 // สูงเท่า template แนวตั้ง

const GT800_QR_CODE_LINE_X = 256
const GT800_QR_CODE_LINE_Y = 68
const GT800_QR_CODE_LINE_FONT = [15, 15]

const GT800_QR_GOLD_LINE_X = 256
const GT800_QR_GOLD_LINE_Y = 86
const GT800_QR_GOLD_LINE_FONT = [14, 14] // ไม่มี goldType (18K) นำหน้าเหมือน template อื่น

// ประมาณความกว้างข้อความแต่ละบรรทัด (dot ต่อตัวอักษร ที่ dpiScale=1) แบบระมัดระวัง เพื่อหาขอบขวาสุดของบล็อกข้อความ (blockRight)
const GT800_QR_NAME_CHAR_W = 7.2
const GT800_QR_BARCODE_CHAR_W = 11 // ความกว้าง Code128 subset B โดยประมาณที่ module 1 คือ 11n+35 modules
const GT800_QR_BARCODE_QUIET = 35
const GT800_QR_CODE_LINE_CHAR_W = 7.8
const GT800_QR_GOLD_LINE_CHAR_W = 6.2

const GT800_QR_MIN_GAP = 10 // ระยะห่างขั้นต่ำจากท้ายบล็อกข้อความถึง QR
const GT800_QR_RIGHT_EDGE = 594 // ขอบขวาสุดที่ยังใช้ได้ของหัวป้ายสีขาว (เผื่อขอบเล็กน้อยจาก x≈596)
const GT800_QR_X = 534 // เพดานบนของ qrX (กันชนขอบเมื่อบล็อกข้อความสั้นมาก)
// ^FO นี้คือจุดเริ่ม (ค่าที่ใส่ใน ^FO จริง) แต่ Labelary เรนเดอร์ ^BQ เยื้องลงจากจุด ^FO เองราว 20 dot
// ทำให้ QR จริงไปอยู่ที่ y≈33 ซึ่งอยู่ในแถบใช้งานได้ y 30–103 (พ้นแถบส้มพิมพ์ล่วงหน้าที่ y<30) — ค่านี้ verify กับเครื่องพิมพ์จริงแล้ว
const GT800_QR_Y = 13
const GT800_QR_MAX_DOTS = 73 // ขนาดด้านยาวสุดของ QR ที่ยังพอดีกับแถบ

// ความจุ byte mode ECC L ต่อเวอร์ชัน QR — ใช้ประมาณเวอร์ชันจากความยาว URL
const QR_BYTE_CAPACITY = [
  { version: 1, capacity: 17 },
  { version: 2, capacity: 32 },
  { version: 3, capacity: 53 },
  { version: 4, capacity: 78 },
  { version: 5, capacity: 106 },
  { version: 6, capacity: 134 }
]

// ─────────────────────────────────────────────────────────────
// helpers
// ─────────────────────────────────────────────────────────────

// เลขที่ผลิตเก่าก่อนเสมอ ไม่งั้นใช้เลขใหม่
export function resolveLabelCode(formValue) {
  const origin = typeof formValue?.stockNumberOrigin === 'string' ? formValue.stockNumberOrigin.trim() : ''
  if (origin) return origin
  return formValue?.stockNumber || ''
}

// GT800 เท่านั้น — แทรกเว้นวรรคให้อ่านง่าย โดยไม่แตะข้อมูลจริงในระบบ ห้ามแตะเกรด (VS1, VVS2, SI1, G,VS1 ฯลฯ)
export function formatGemText(text) {
  if (!text) return text || ''
  let result = text
  result = result.replace(/([A-Za-z])(\d+\.\d+)/g, '$1 $2')
  result = result.replace(/(\d)(ct\.?)/gi, '$1 $2')
  return result
}

function formatMoney(value) {
  if (value == null || value <= 0) return ''
  return new Intl.NumberFormat('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)
}

// ─────────────────────────────────────────────────────────────
// Legacy (เครื่องเดิม, Zebra Print Service) — คัดลอกจาก 7048e5a^ ตรงตัวอักษร
// ห้ามแก้ตัวเลข/บั๊กเดิม (^F450 ตก O, เลขนำศูนย์ ^FO250,090 / ^FO025,050) เครื่องเดิมพิมพ์ถูกด้วยค่าชุดนี้
// ข้อยกเว้นเดียว: ทุกจุดที่ใช้ formValue.stockNumber เปลี่ยนเป็น resolveLabelCode(formValue)
// ─────────────────────────────────────────────────────────────

export function generateLegacyZPL(formValue) {
  const code = resolveLabelCode(formValue)

  // เริ่มต้น ZPL
  let zpl = '^XA^LL200^MD25^LT40^XZ'
  zpl += '^XA'

  // บาร์โค้ด
  zpl += `^FO248,35^BY1,3.0:1,25^BCN,Y,N,N^FD${code}^FS`

  // เลขที่ผลิต - ราคาขาย (เมื่อมีค่า)
  const salePriceText =
    formValue.salePrice != null && formValue.salePrice > 0
      ? new Intl.NumberFormat('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(
          formValue.salePrice
        )
      : ''
  const stockNumberLine = [code, salePriceText].filter(Boolean).join(' - ')
  zpl += `^FO248,65^A0N,20,18^FD${stockNumberLine}^FS`

  // gold and size
  zpl += `^FO250,090^A0N,14,16,B^FD${formValue.gold || ''} ${formValue.size || ''}^FS`

  // made in
  zpl += `^FO025,050^A0N,15,15,B^FD${formValue.madeIn || ''}^FS`

  // gold type
  zpl += `^FO420,045^A0N,14,16,B^FD${formValue.goldType || ''}^FS`

  // รายการอัญมณี
  if (Array.isArray(formValue.gems)) {
    let yPos = 15
    formValue.gems.forEach((gem) => {
      if (gem) {
        zpl += `^F450,${yPos}^A0N,14,16,B^FD${gem}^FS`
        yPos += 15
      }
    })
  }

  // จบ ZPL
  zpl += '^XZ'

  return zpl
}

export function generateLegacyZPLVertical(formValue) {
  const code = resolveLabelCode(formValue)

  // ใช้ label ขนาดเดิม เพิ่ม price row จึงสูงขึ้นเล็กน้อย
  const hasPrice = formValue.price != null && formValue.price > 0
  const labelHeight = hasPrice ? 220 : 200

  let zpl = `^XA^LL${labelHeight}^MD25^LT40^XZ`
  zpl += '^XA'

  // made in (ซ้าย เหมือน horizontal)
  zpl += `^FO025,050^A0N,15,15,B^FD${formValue.madeIn || ''}^FS`

  // productNameEn แทน mold (ไม่มี goldType ข้างๆ)
  zpl += `^FO252,10^A0N,20,18^FD${formValue.productNameEn || ''}^FS`

  // gold + size เหนือ barcode
  const sizeText = formValue.size ? ` #${formValue.size}` : ''
  zpl += `^FO250,030^A0N,14,16,B^FD${formValue.gold || ''}${sizeText}^FS`

  // barcode (ไม่มี stockNumber ใต้)
  zpl += `^FO248,048^BY1,3.0:1,25^BCN,Y,N,N^FD${code}^FS`

  // productNumber - price ไม่รวม gold
  const priceText = hasPrice
    ? new Intl.NumberFormat('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(formValue.price)
    : ''
  const priceLine = [formValue.productNumber, priceText].filter(Boolean).join(' - ')
  if (priceLine) {
    zpl += `^FO250,100^A0N,14,16,B^FD${priceLine}^FS`
  }

  // gems (ขวา เหมือน horizontal)
  if (Array.isArray(formValue.gems)) {
    let yPos = 15
    formValue.gems.forEach((gem) => {
      if (gem) {
        zpl += `^FO450,${yPos}^A0N,14,16,B^FD${gem}^FS`
        yPos += 15
      }
    })
  }

  zpl += '^XZ'

  return zpl
}

// ─────────────────────────────────────────────────────────────
// GT800 — layout ใหม่
// ─────────────────────────────────────────────────────────────

function chooseGemLevel({ code, gems, checkLines }) {
  const formattedGems = (Array.isArray(gems) ? gems : []).filter(Boolean).map(formatGemText)

  const barcodeEnd =
    GT800_BARCODE_START_X + (code.length + GT800_BARCODE_CHAR_EXTRA) * GT800_BARCODE_CHAR_WIDTH + GT800_BARCODE_END_PAD

  const fitsBarcode = barcodeEnd + GT800_ROOMY_BARCODE_SAFETY <= GT800_ROOMY_BARCODE_END_MAX

  const hasManyGemLines = formattedGems.length >= GT800_ROOMY_LINE_COUNT_THRESHOLD
  const linesFitLength =
    !hasManyGemLines || checkLines.every((line) => (line || '').length <= GT800_ROOMY_LINE_MAX_LEN)

  const longestGemLen = formattedGems.reduce((max, gem) => Math.max(max, gem.length), 0)
  const gemFitsLength = longestGemLen <= GT800_ROOMY_GEM_MAX_LEN

  const level = fitsBarcode && linesFitLength && gemFitsLength ? GEM_LEVELS.ROOMY : GEM_LEVELS.TIGHT

  return { level, barcodeEnd, formattedGems }
}

// คืนตำแหน่ง/ขนาด (level ROOMY/TIGHT ที่เลือก + ข้อความแต่ละบรรทัด) ให้ test ได้โดยไม่ต้องยุ่งกับ dpiScale
export function layoutGt800(formValue, template) {
  const code = resolveLabelCode(formValue)
  const gems = Array.isArray(formValue?.gems) ? formValue.gems : []

  if (template === 'original') {
    const salePriceText = formatMoney(formValue?.salePrice)
    const codeLine = [code, salePriceText].filter(Boolean).join(' - ')
    const { level, barcodeEnd, formattedGems } = chooseGemLevel({ code, gems, checkLines: [codeLine] })

    return {
      template: 'original',
      levelName: level.name,
      code,
      codeLine,
      barcodeEnd,
      gemColumnX: level.x,
      gemFont: level.gemFont,
      gemLineHeight: level.lineHeight,
      codeLineFont: level.priceFontHorizontal,
      formattedGems
    }
  }

  const sizeText = formValue?.size ? ` #${formValue.size}` : ''
  const goldSizeLine = `${formValue?.gold || ''}${sizeText}`
  const hasPrice = formValue?.price != null && formValue.price > 0
  const priceText = hasPrice ? formatMoney(formValue.price) : ''
  const codeLine = [formValue?.productNumber, priceText].filter(Boolean).join(' - ')

  const { level, barcodeEnd, formattedGems } = chooseGemLevel({
    code,
    gems,
    checkLines: [formValue?.productNameEn || '', goldSizeLine]
  })

  return {
    template: 'vertical',
    levelName: level.name,
    code,
    codeLine,
    goldSizeLine,
    barcodeEnd,
    gemColumnX: level.x,
    gemFont: level.gemFont,
    gemLineHeight: level.lineHeight,
    codeLineFont: GT800_V_CODE_LINE_FONT,
    formattedGems
  }
}

// header ร่วมของทุกแท็บ GT800 — เมื่อ rotate180 ให้แทรก ^POI^PW600 ต่อท้าย ^XA ตัวที่สอง (จุดเริ่ม label format)
// ^PW600 เป็นค่าคงที่ตามสเปกความกว้างป้าย ไม่คูณ dpiScale
function gt800Header(s, rotate180) {
  const header = `^XA^LL${s(GT800_LABEL_HEIGHT)}^MD15^LT0^XZ^XA`
  return rotate180 ? `${header}^POI^PW600` : header
}

function buildGemFieldsZpl(layout, s) {
  let fields = ''
  let y = GEM_START_Y
  layout.formattedGems.forEach((gem) => {
    fields += `^FO${s(layout.gemColumnX)},${s(y)}^A0N,${s(layout.gemFont[0])},${s(layout.gemFont[1])}^FD${gem}^FS`
    y += layout.gemLineHeight
  })
  return fields
}

export function generateGt800ZPL(formValue, dpiScale = 1, options = {}) {
  const s = (n) => Math.round(n * dpiScale)
  const layout = layoutGt800(formValue, 'original')

  let zpl = gt800Header(s, options.rotate180)

  zpl += `^FO${s(GT800_MADE_IN_X)},${s(GT800_MADE_IN_Y)}^A0N,${s(GT800_MADE_IN_FONT[0])},${s(GT800_MADE_IN_FONT[1])}^FD${formValue?.madeIn || ''}^FS`

  zpl += `^FO${s(GT800_H_BARCODE_X)},${s(GT800_H_BARCODE_Y)}^BY${s(GT800_H_BARCODE_MODULE)},${GT800_H_BARCODE_RATIO},${s(GT800_H_BARCODE_HEIGHT)}^BCN,${s(GT800_H_BARCODE_HEIGHT)},N,N^FD${layout.code}^FS`

  zpl += `^FO${s(GT800_H_CODE_LINE_X)},${s(GT800_H_CODE_LINE_Y)}^A0N,${s(layout.codeLineFont[0])},${s(layout.codeLineFont[1])}^FD${layout.codeLine}^FS`

  const goldSizeText = `${formValue?.gold || ''} ${formValue?.size || ''}`.trim()
  if (formValue?.goldType) {
    zpl += `^FO${s(GT800_GOLDTYPE_X)},${s(GT800_BOTTOM_LINE_Y)}^A0N,${s(GT800_BOTTOM_FONT[0])},${s(GT800_BOTTOM_FONT[1])}^FD${formValue.goldType}^FS`
    zpl += `^FO${s(GT800_GOLD_X_WITH_TYPE)},${s(GT800_BOTTOM_LINE_Y)}^A0N,${s(GT800_BOTTOM_FONT[0])},${s(GT800_BOTTOM_FONT[1])}^FD${goldSizeText}^FS`
  } else {
    zpl += `^FO${s(GT800_GOLD_X_NO_TYPE)},${s(GT800_BOTTOM_LINE_Y)}^A0N,${s(GT800_BOTTOM_FONT[0])},${s(GT800_BOTTOM_FONT[1])}^FD${goldSizeText}^FS`
  }

  zpl += buildGemFieldsZpl(layout, s)

  zpl += '^XZ'

  return zpl
}

// ประมาณเวอร์ชัน QR จากความยาว URL (byte mode ECC L) — ใช้ร่วมกันระหว่าง pickQrMagnification และ layoutGt800Qr
function resolveQrVersion(url) {
  const byteLength = (url || '').length
  const entry = QR_BYTE_CAPACITY.find((item) => byteLength <= item.capacity)
  return entry ? entry.version : QR_BYTE_CAPACITY[QR_BYTE_CAPACITY.length - 1].version
}

// เลือก magnification ของ QR ที่ยังพอดีกับแถบ (ไม่ต่ำกว่า 2)
export function pickQrMagnification(url) {
  const version = resolveQrVersion(url)
  const modules = 17 + 4 * version

  return modules * 3 <= GT800_QR_MAX_DOTS ? 3 : 2
}

// คืนตำแหน่ง/ขนาดของบล็อกข้อความ + QR (แท็บ original-qr) ให้ test/preview ใช้ได้โดยไม่ต้องยุ่งกับ dpiScale
export function layoutGt800Qr(formValue) {
  const code = resolveLabelCode(formValue)
  const productNameEn = formValue?.productNameEn || ''
  const codeLine = [code, formatMoney(formValue?.salePrice)].filter(Boolean).join(' - ')
  const goldLine = `${formValue?.gold || ''} ${formValue?.size || ''}`.trim()
  const url = formValue?.publicUrl || ''

  const blockRight = Math.max(
    GT800_QR_NAME_X + productNameEn.length * GT800_QR_NAME_CHAR_W,
    GT800_QR_BARCODE_X + (GT800_QR_BARCODE_CHAR_W * code.length + GT800_QR_BARCODE_QUIET),
    GT800_QR_CODE_LINE_X + codeLine.length * GT800_QR_CODE_LINE_CHAR_W,
    GT800_QR_GOLD_LINE_X + goldLine.length * GT800_QR_GOLD_LINE_CHAR_W
  )

  const version = resolveQrVersion(url)
  const mag = pickQrMagnification(url)
  const modules = 17 + 4 * version
  const qrSize = modules * mag

  const qrX = Math.round(
    Math.min(GT800_QR_X, Math.max(blockRight + GT800_QR_MIN_GAP, (blockRight + GT800_QR_RIGHT_EDGE) / 2 - qrSize / 2))
  )

  return { code, codeLine, goldLine, productNameEn, blockRight, qrSize, mag, qrX }
}

// แท็บ original-qr — บล็อกข้อความชิดซ้าย 4 บรรทัด (ไม่มีพลอย) + QR วางกลางพื้นที่ว่างด้านขวาของบล็อก
export function generateGt800ZPLQr(formValue, dpiScale = 1, options = {}) {
  const s = (n) => Math.round(n * dpiScale)
  const layout = layoutGt800Qr(formValue)
  const url = formValue?.publicUrl || ''

  let zpl = gt800Header(s, options.rotate180)

  zpl += `^FO${s(GT800_MADE_IN_X)},${s(GT800_MADE_IN_Y)}^A0N,${s(GT800_MADE_IN_FONT[0])},${s(GT800_MADE_IN_FONT[1])}^FD${formValue?.madeIn || ''}^FS`

  if (layout.productNameEn) {
    zpl += `^FO${s(GT800_QR_NAME_X)},${s(GT800_QR_NAME_Y)}^A0N,${s(GT800_QR_NAME_FONT[0])},${s(GT800_QR_NAME_FONT[1])}^FD${layout.productNameEn}^FS`
  }

  zpl += `^FO${s(GT800_QR_BARCODE_X)},${s(GT800_QR_BARCODE_Y)}^BY${s(GT800_QR_BARCODE_MODULE)},${GT800_QR_BARCODE_RATIO},${s(GT800_QR_BARCODE_HEIGHT)}^BCN,${s(GT800_QR_BARCODE_HEIGHT)},N,N^FD${layout.code}^FS`

  zpl += `^FO${s(GT800_QR_CODE_LINE_X)},${s(GT800_QR_CODE_LINE_Y)}^A0N,${s(GT800_QR_CODE_LINE_FONT[0])},${s(GT800_QR_CODE_LINE_FONT[1])}^FD${layout.codeLine}^FS`

  zpl += `^FO${s(GT800_QR_GOLD_LINE_X)},${s(GT800_QR_GOLD_LINE_Y)}^A0N,${s(GT800_QR_GOLD_LINE_FONT[0])},${s(GT800_QR_GOLD_LINE_FONT[1])}^FD${layout.goldLine}^FS`

  if (url) {
    const mag = Math.max(1, Math.round(layout.mag * dpiScale))
    zpl += `^FO${s(layout.qrX)},${s(GT800_QR_Y)}^BQN,2,${mag}^FDLA,${url}^FS`
  }

  zpl += '^XZ'

  return zpl
}

export function generateGt800ZPLVertical(formValue, dpiScale = 1, options = {}) {
  const s = (n) => Math.round(n * dpiScale)
  const layout = layoutGt800(formValue, 'vertical')

  let zpl = gt800Header(s, options.rotate180)

  zpl += `^FO${s(GT800_MADE_IN_X)},${s(GT800_MADE_IN_Y)}^A0N,${s(GT800_MADE_IN_FONT[0])},${s(GT800_MADE_IN_FONT[1])}^FD${formValue?.madeIn || ''}^FS`

  zpl += `^FO${s(GT800_V_NAME_X)},${s(GT800_V_NAME_Y)}^A0N,${s(GT800_V_NAME_FONT[0])},${s(GT800_V_NAME_FONT[1])}^FD${formValue?.productNameEn || ''}^FS`

  zpl += `^FO${s(GT800_V_GOLD_X)},${s(GT800_V_GOLD_Y)}^A0N,${s(GT800_V_GOLD_FONT[0])},${s(GT800_V_GOLD_FONT[1])}^FD${layout.goldSizeLine}^FS`

  zpl += `^FO${s(GT800_V_BARCODE_X)},${s(GT800_V_BARCODE_Y)}^BY${s(GT800_V_BARCODE_MODULE)},${GT800_V_BARCODE_RATIO},${s(GT800_V_BARCODE_HEIGHT)}^BCN,${s(GT800_V_BARCODE_HEIGHT)},N,N^FD${layout.code}^FS`

  if (layout.codeLine) {
    zpl += `^FO${s(GT800_V_CODE_LINE_X)},${s(GT800_V_CODE_LINE_Y)}^A0N,${s(layout.codeLineFont[0])},${s(layout.codeLineFont[1])}^FD${layout.codeLine}^FS`
  }

  zpl += buildGemFieldsZpl(layout, s)

  zpl += '^XZ'

  return zpl
}
