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
const GT800_MADE_IN_FONT = [17, 17]

// แท็บ original — ชื่อสินค้า + บาร์โค้ด + เลขที่ผลิต-ราคา + บรรทัดทอง
// พิกัดชุดนี้เหมือนแท็บ original-qr ทุกจุด (verify กับกระดาษจริงแล้ว) — พับครึ่งป้ายที่ x≈425
// ฝั่งซ้าย (ชื่อ/บาร์โค้ด/เลขที่ผลิต/ทอง) ต้องจบก่อน x≈420 พลอยอยู่ฝั่งขวาที่ GT800_GEM_X
const GT800_O_NAME_X = 256
const GT800_O_NAME_Y = 31
const GT800_O_NAME_FONT = [16, 16]
const GT800_O_NAME_REF_FONT = 14 // ฟอนต์อ้างอิงที่ GT800_O_NAME_CHAR_W วัดมา (ไม่เปลี่ยนตาม GT800_O_NAME_FONT)
const GT800_O_NAME_CHAR_W = 7.2 // dot ต่อตัวอักษรที่ฟอนต์ GT800_O_NAME_REF_FONT ใช้ย่อฟอนต์อัตโนมัติเมื่อชื่อยาวเกินพื้นที่
const GT800_O_NAME_MIN_FONT = 10
const GT800_O_NAME_RIGHT_LIMIT = 420 // ขอบขวาสุดของฝั่งซ้าย (ต้องจบก่อนแนวพับ x≈425)

const GT800_O_BARCODE_X = 262
const GT800_O_BARCODE_Y = 47
const GT800_O_BARCODE_MODULE = 1
const GT800_O_BARCODE_RATIO = '3.0:1'
const GT800_O_BARCODE_HEIGHT = 18

const GT800_O_CODE_LINE_X = 256
const GT800_O_CODE_LINE_Y = 68

const GT800_O_GOLD_LINE_X = 256
const GT800_O_GOLD_LINE_Y = 86
const GT800_O_GOLD_LINE_FONT = [16, 16] // ไม่มี goldType นำหน้าอีกแล้ว (ชื่อสินค้ามีกะรัตอยู่ในตัวแล้ว)

// สัญลักษณ์หมายเหตุ (remark) แท็บ original — เลือกจากรายการตายตัวเท่านั้น (แทนการวาดปากกา) ไม่ใส่ในบาร์โค้ด
// kind: text = ตัวอักษร ASCII ด้วย ^A0 · circle/square = วาดด้วยกราฟิก ZPL (filled = thickness เท่าขนาด)
const GT800_O_REMARK_SIZE = 14 // ขนาด (dot) ของสัญลักษณ์ทุกแบบ ใช้เช็คที่ว่างด้วย — 14 เพื่อไม่ชนบาร์โค้ดที่ y=47 เมื่อวางบนแถวชื่อ (y31+14=45)
const GT800_O_REMARK_TEXT_FONT = 16
const GT800_O_REMARK_OUTLINE_THICKNESS = 2
const GT800_O_REMARK_GAP = 10 // ระยะห่างจากท้ายชื่อสินค้า/บรรทัดทองถึงสัญลักษณ์
const GT800_O_GOLD_LINE_CHAR_W = 7.1 // dot ต่อตัวอักษรของบรรทัดทอง (ฟอนต์ 16)

export const REMARK_SYMBOL_NONE = 'none'
const REMARK_SYMBOLS_TABLE = {
  star: { kind: 'text', text: '*', preview: '*' },
  hash: { kind: 'text', text: '#', preview: '#' },
  plus: { kind: 'text', text: '+', preview: '+' },
  at: { kind: 'text', text: '@', preview: '@' },
  'circle-filled': { kind: 'circle', filled: true, preview: '●' },
  'circle-outline': { kind: 'circle', filled: false, preview: '○' },
  'square-filled': { kind: 'square', filled: true, preview: '■' },
  'square-outline': { kind: 'square', filled: false, preview: '□' }
}
export const REMARK_SYMBOLS = Object.keys(REMARK_SYMBOLS_TABLE)

export function isKnownRemarkSymbol(key) {
  return typeof key === 'string' && Object.prototype.hasOwnProperty.call(REMARK_SYMBOLS_TABLE, key)
}

export function getRemarkPreviewChar(key) {
  return isKnownRemarkSymbol(key) ? REMARK_SYMBOLS_TABLE[key].preview : ''
}

// ZPL ของสัญลักษณ์ที่พิกัด (x, y) ฐาน 203 dpi — คูณ dpiScale ด้วย s() · key ไม่รู้จัก/ว่าง → ''
export function buildRemarkSymbolZpl(key, x, y, dpiScale = 1) {
  if (!isKnownRemarkSymbol(key)) return ''
  const s = (n) => Math.round(n * dpiScale)
  const def = REMARK_SYMBOLS_TABLE[key]
  const size = s(GT800_O_REMARK_SIZE)
  const thickness = def.filled ? size : s(GT800_O_REMARK_OUTLINE_THICKNESS)
  const origin = `^FO${s(x)},${s(y)}`
  if (def.kind === 'text') {
    const font = s(GT800_O_REMARK_TEXT_FONT)
    return `${origin}^A0N,${font},${font}^FD${def.text}^FS`
  }
  if (def.kind === 'circle') return `${origin}^GC${size},${thickness},B^FS`
  return `${origin}^GB${size},${size},${thickness}^FS`
}

const GT800_GEM_X = 428// คอลัมน์พลอยฝั่งขวาของแนวพับ (ฝั่งซ้ายจบ x≈420, พับ x≈425) คงที่ทุก level — ที่ว่างถึงขอบขวา 594 = 166 dots
// ฟอนต์พลอย GT800 (original + แนวตั้ง) เป็นสี่เหลี่ยมจัตุรัสเสมอ (สูง = กว้าง) ใช้ขนาดเดียวทุกบรรทัดในป้าย
const GT800_GEM_FONT = 16 // ขนาดมาตรฐาน (ตรงกับข้อความอื่นบนป้าย) ระยะบรรทัด = ขนาดฟอนต์
const GT800_O_GEM_MAX_STACK_HEIGHT = 70 // พื้นที่ซ้อนบรรทัดพลอยตั้งแต่ GEM_START_Y (y31 → ~y101) 5 บรรทัดขึ้นไปจะลดขนาดให้พอดี (ใช้ทั้ง original และแนวตั้ง)
const GT800_O_GEM_MIN_HEIGHT = 8

// template แนวตั้ง (4 แท็บราคา)
const GT800_V_NAME_X = 256
const GT800_V_NAME_Y = 31

const GT800_V_GOLD_X = 256
const GT800_V_GOLD_Y = 46
const GT800_V_GOLD_FONT = [16, 16]

const GT800_V_BARCODE_X = 256 // ชิดซ้าย 6 dots เพื่อให้รหัส 12 ตัวจบก่อนแนวพับ x≈425
const GT800_V_BARCODE_Y = 61
const GT800_V_BARCODE_MODULE = 1
const GT800_V_BARCODE_RATIO = '3.0:1'
const GT800_V_BARCODE_HEIGHT = 18

const GT800_V_CODE_LINE_X = 256
const GT800_V_CODE_LINE_Y = 83
const GT800_V_CODE_LINE_FONT = [17, 17]
const GT800_V_CODE_LINE_CHAR_W = 8.9 // dot ต่อตัวอักษรที่ฟอนต์ 17
const GT800_V_GOLD_CHAR_W = 7.1 // dot ต่อตัวอักษรที่ฟอนต์ 16
const GT800_V_MIN_FONT = 10

// คอลัมน์พลอย — เลือก 2 ระดับอัตโนมัติตามความยาวบาร์โค้ด/ข้อความ
const GEM_START_Y = 31
// ใช้เลือกฟอนต์บรรทัดรหัส/ราคาของแท็บ original เท่านั้น (คอลัมน์พลอยคงที่ที่ GT800_GEM_X ทุกแท็บ)
const GEM_LEVELS = {
  ROOMY: { name: 'ROOMY', priceFontHorizontal: [18, 18] },
  TIGHT: { name: 'TIGHT', priceFontHorizontal: [17, 15] }
}

// เกณฑ์เลือก ROOMY/TIGHT (ปรับได้ที่เดียว)
const GT800_BARCODE_CHAR_EXTRA = 3
const GT800_BARCODE_CHAR_WIDTH = 11
const GT800_BARCODE_END_PAD = 2
const GT800_ROOMY_LINE_COUNT_THRESHOLD = 3
const GT800_ROOMY_LINE_MAX_LEN = 20
const GT800_ROOMY_GEM_MAX_LEN = 21
const GT800_GEM_RIGHT_EDGE = 594 // ขอบขวาสุดที่ข้อความพลอยยังไม่ถูกตัด (หัวป้ายสีขาวจบที่ x≈596)
const GT800_GEM_CHAR_W_RATIO = 0.46 // dot ต่อ 1 หน่วยความกว้างฟอนต์ (วัดจากภาพ Labelary) ใช้ย่อความกว้างอัตโนมัติเมื่อบรรทัดพลอยยาว
const GT800_GEM_MIN_FONT = 9 // ขนาดต่ำสุดเมื่อย่อเพราะบรรทัดยาว (ไม่ต่ำกว่าขนาดที่ได้จากจำนวนบรรทัด)

// แท็บ original-qr — บล็อกข้อความชิดซ้าย 4 บรรทัด (ไม่มีพลอย) + QR วางกลางพื้นที่ว่างด้านขวาของบล็อก
const GT800_QR_NAME_X = 256
const GT800_QR_NAME_Y = 31
const GT800_QR_NAME_FONT = [16, 16]

const GT800_QR_BARCODE_X = 262
const GT800_QR_BARCODE_Y = 47
const GT800_QR_BARCODE_MODULE = 1
const GT800_QR_BARCODE_RATIO = '3.0:1'
const GT800_QR_BARCODE_HEIGHT = 18 // สูงเท่า template แนวตั้ง

const GT800_QR_CODE_LINE_X = 256
const GT800_QR_CODE_LINE_Y = 68
const GT800_QR_CODE_LINE_FONT = [17, 17]

const GT800_QR_GOLD_LINE_X = 256
const GT800_QR_GOLD_LINE_Y = 86
const GT800_QR_GOLD_LINE_FONT = [16, 16] // ไม่มี goldType (18K) นำหน้าเหมือน template อื่น

// ประมาณความกว้างข้อความแต่ละบรรทัด (dot ต่อตัวอักษร ที่ dpiScale=1) แบบระมัดระวัง เพื่อหาขอบขวาสุดของบล็อกข้อความ (blockRight)
const GT800_QR_NAME_CHAR_W = 8.2
const GT800_QR_BARCODE_CHAR_W = 11 // ความกว้าง Code128 subset B โดยประมาณที่ module 1 คือ 11n+35 modules
const GT800_QR_BARCODE_QUIET = 35
const GT800_QR_CODE_LINE_CHAR_W = 8.9
const GT800_QR_GOLD_LINE_CHAR_W = 7.1

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

// ราคาบนป้ายบาร์โค้ดสินค้า — จำนวนเต็มล้วน ไม่มี comma ไม่มีทศนิยม (ตัดสตางค์ทิ้ง ไม่ปัดเศษ)
// แล้วตัดหลักสุดท้ายทิ้งและแทนด้วย R (เช่น 23000 → 2300R, 3050 → 305R)
// value <= 0 / null / undefined → '' (ไม่มีราคา)
export function formatLabelPrice(value) {
  const num = Number(value)
  if (value == null || !Number.isFinite(num) || num <= 0) return ''
  return `${String(Math.trunc(num)).slice(0, -1)}R`
}

// ─────────────────────────────────────────────────────────────
// Legacy (เครื่องเดิม, Zebra Print Service) — คัดลอกจาก 7048e5a^ ตรงตัวอักษร
// ห้ามแก้ตัวเลข/บั๊กเดิม (^F450 ตก O, เลขนำศูนย์ ^FO250,090 / ^FO025,050) เครื่องเดิมพิมพ์ถูกด้วยค่าชุดนี้
// ข้อยกเว้น 2 จุด: (1) ทุกจุดที่ใช้ formValue.stockNumber เปลี่ยนเป็น resolveLabelCode(formValue)
// (2) ข้อความราคาเปลี่ยนจากรูปแบบ th-TH ทศนิยม 2 ตำแหน่ง เป็น formatLabelPrice (จำนวนเต็ม ตัดหลักสุดท้ายแทนด้วย R)
// ─────────────────────────────────────────────────────────────

export function generateLegacyZPL(formValue) {
  const code = resolveLabelCode(formValue)

  // เริ่มต้น ZPL
  let zpl = '^XA^LL200^MD25^LT40^XZ'
  zpl += '^XA'

  // บาร์โค้ด
  zpl += `^FO248,35^BY1,3.0:1,25^BCN,Y,N,N^FD${code}^FS`

  // เลขที่ผลิต - ราคาขาย (เมื่อมีค่า)
  const salePriceText = formValue.hidePrice ? '' : formatLabelPrice(formValue.salePrice)
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
  const hasPrice = !formValue.hidePrice && formValue.price != null && formValue.price > 0
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
  const priceText = hasPrice ? formatLabelPrice(formValue.price) : ''
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

function formatGt800Gems(gems) {
  return (Array.isArray(gems) ? gems : []).filter(Boolean).map(formatGemText)
}

// ตำแหน่งท้ายบาร์โค้ด (ประมาณ) — ฝั่งซ้ายต้องจบก่อน GT800_O_NAME_RIGHT_LIMIT
function estimateGt800BarcodeEnd(code, startX) {
  return startX + (code.length + GT800_BARCODE_CHAR_EXTRA) * GT800_BARCODE_CHAR_WIDTH + GT800_BARCODE_END_PAD
}

function chooseGemLevel({ gems, checkLines }) {
  const formattedGems = formatGt800Gems(gems)

  const hasManyGemLines = formattedGems.length >= GT800_ROOMY_LINE_COUNT_THRESHOLD
  const linesFitLength =
    !hasManyGemLines || checkLines.every((line) => (line || '').length <= GT800_ROOMY_LINE_MAX_LEN)

  const longestGemLen = formattedGems.reduce((max, gem) => Math.max(max, gem.length), 0)
  const gemFitsLength = longestGemLen <= GT800_ROOMY_GEM_MAX_LEN

  const level = linesFitLength && gemFitsLength ? GEM_LEVELS.ROOMY : GEM_LEVELS.TIGHT

  return { level, formattedGems }
}

// ขนาดฟอนต์พลอยสี่เหลี่ยมจัตุรัส: 16 เมื่อซ้อนไม่เกินพื้นที่, 5 บรรทัดขึ้นไปลดตามพื้นที่ซ้อน แล้วย่อเท่ากันทั้งสูง/กว้างเมื่อบรรทัดยาวสุดล้นขอบขวา
function computeGt800GemFont(lineCount, longestLen, x) {
  const byLines = Math.max(
    GT800_O_GEM_MIN_HEIGHT,
    Math.min(GT800_GEM_FONT, Math.floor(GT800_O_GEM_MAX_STACK_HEIGHT / Math.max(1, lineCount)))
  )
  const budget = GT800_GEM_RIGHT_EDGE - x
  const byWidth = Math.floor(budget / (Math.max(1, longestLen) * GT800_GEM_CHAR_W_RATIO))
  const size = Math.min(byLines, Math.max(GT800_GEM_MIN_FONT, byWidth))
  return { font: [size, size], lineHeight: size }
}

function longestLength(lines) {
  return lines.reduce((max, line) => Math.max(max, line.length), 0)
}

// ย่อฟอนต์ข้อความฝั่งซ้ายอัตโนมัติ (สี่เหลี่ยมจัตุรัส) ถ้ากว้างเกินพื้นที่ก่อนแนวพับ x≈420
// charW = dot ต่อตัวอักษรที่ฟอนต์ refFont
function fitGt800LeftFont({ text, x, baseFont, charW, refFont, minFont }) {
  const budget = GT800_O_NAME_RIGHT_LIMIT - x
  const estWidth = text.length * charW * (baseFont[0] / refFont)
  if (estWidth <= budget) return baseFont
  const size = Math.max(minFont, Math.floor((refFont * budget) / (text.length * charW)))
  return [size, size]
}

function computeGt800NameFont(name) {
  return fitGt800LeftFont({
    text: name,
    x: GT800_O_NAME_X,
    baseFont: GT800_O_NAME_FONT,
    charW: GT800_O_NAME_CHAR_W,
    refFont: GT800_O_NAME_REF_FONT,
    minFont: GT800_O_NAME_MIN_FONT
  })
}

// ไซซ์บนบรรทัดทอง (แท็บ original) — ตัดช่องว่าง, ว่างหรือมีแค่ # ตัดทิ้ง, ไม่ขึ้นต้นด้วย # ให้เติมให้
// export ไว้ให้ preview บนจอ (barcode-demo-view.vue) ใช้ logic เดียวกับ ZPL จริง ไม่ต้องเขียนซ้ำ
export function normalizeGt800Size(size) {
  const trimmed = (size || '').trim()
  if (!trimmed || trimmed === '#') return ''
  return trimmed.startsWith('#') ? trimmed : `#${trimmed}`
}

// ตำแหน่งสัญลักษณ์หมายเหตุ: ท้ายชื่อสินค้าก่อน → ไม่พอที่ใช้ท้ายบรรทัดทอง → ไม่พอทั้งคู่คืน null (UI เตือน)
function placeGt800Remark(productNameEn, nameFont, goldLine) {
  const nameWidth = productNameEn
    ? productNameEn.length * GT800_O_NAME_CHAR_W * (nameFont[0] / GT800_O_NAME_REF_FONT) + GT800_O_REMARK_GAP
    : 0
  const nameX = Math.round(GT800_O_NAME_X + nameWidth)
  if (nameX + GT800_O_REMARK_SIZE <= GT800_O_NAME_RIGHT_LIMIT) {
    return { x: nameX, y: GT800_O_NAME_Y, row: 'name' }
  }

  const goldWidth = goldLine ? goldLine.length * GT800_O_GOLD_LINE_CHAR_W + GT800_O_REMARK_GAP : 0
  const goldX = Math.round(GT800_O_GOLD_LINE_X + goldWidth)
  if (goldX + GT800_O_REMARK_SIZE <= GT800_O_NAME_RIGHT_LIMIT) {
    return { x: goldX, y: GT800_O_GOLD_LINE_Y, row: 'gold' }
  }

  return null
}

// คืนตำแหน่ง/ขนาด (level ROOMY/TIGHT ที่เลือก + ข้อความแต่ละบรรทัด) ให้ test ได้โดยไม่ต้องยุ่งกับ dpiScale
export function layoutGt800(formValue, template) {
  const code = resolveLabelCode(formValue)
  const gems = Array.isArray(formValue?.gems) ? formValue.gems : []

  if (template === 'original') {
    const salePriceText = formValue?.hidePrice ? '' : formatLabelPrice(formValue?.salePrice)
    const codeLine = [code, salePriceText].filter(Boolean).join(' - ')
    const { level, formattedGems } = chooseGemLevel({ gems, checkLines: [codeLine] })

    const productNameEn = formValue?.productNameEn || ''
    const nameFont = computeGt800NameFont(productNameEn)
    const sizeText = normalizeGt800Size(formValue?.size)
    const goldLine = [formValue?.gold || '', sizeText].filter(Boolean).join(' ')

    const gem = computeGt800GemFont(formattedGems.length, longestLength(formattedGems), GT800_GEM_X)

    const remarkKey = isKnownRemarkSymbol(formValue?.remarkSymbol) ? formValue.remarkSymbol : ''
    const remarkPlacement = remarkKey ? placeGt800Remark(productNameEn, nameFont, goldLine) : null

    return {
      template: 'original',
      remark: remarkPlacement ? { key: remarkKey, ...remarkPlacement } : null,
      remarkNoRoom: !!remarkKey && !remarkPlacement,
      levelName: level.name,
      code,
      codeLine,
      barcodeEnd: estimateGt800BarcodeEnd(code, GT800_O_BARCODE_X),
      productNameEn,
      nameFont,
      goldLine,
      gemColumnX: GT800_GEM_X,
      gemFont: gem.font,
      gemLineHeight: gem.lineHeight,
      codeLineFont: level.priceFontHorizontal,
      formattedGems
    }
  }

  const sizeText = formValue?.size ? ` #${formValue.size}` : ''
  const goldSizeLine = `${formValue?.gold || ''}${sizeText}`
  const hasPrice = !formValue?.hidePrice && formValue?.price != null && formValue.price > 0
  const priceText = hasPrice ? formatLabelPrice(formValue.price) : ''
  const codeLine = [formValue?.productNumber, priceText].filter(Boolean).join(' - ')

  const formattedGems = formatGt800Gems(gems)
  const gem = computeGt800GemFont(formattedGems.length, longestLength(formattedGems), GT800_GEM_X)
  const productNameEn = formValue?.productNameEn || ''

  return {
    template: 'vertical',
    code,
    codeLine,
    goldSizeLine,
    productNameEn,
    nameFont: computeGt800NameFont(productNameEn),
    goldFont: fitGt800LeftFont({
      text: goldSizeLine,
      x: GT800_V_GOLD_X,
      baseFont: GT800_V_GOLD_FONT,
      charW: GT800_V_GOLD_CHAR_W,
      refFont: GT800_V_GOLD_FONT[0],
      minFont: GT800_V_MIN_FONT
    }),
    barcodeEnd: estimateGt800BarcodeEnd(code, GT800_V_BARCODE_X),
    gemColumnX: GT800_GEM_X,
    gemFont: gem.font,
    gemLineHeight: gem.lineHeight,
    codeLineFont: fitGt800LeftFont({
      text: codeLine,
      x: GT800_V_CODE_LINE_X,
      baseFont: GT800_V_CODE_LINE_FONT,
      charW: GT800_V_CODE_LINE_CHAR_W,
      refFont: GT800_V_CODE_LINE_FONT[0],
      minFont: GT800_V_MIN_FONT
    }),
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
  const x = s(layout.gemColumnX)
  layout.formattedGems.forEach((gem) => {
    fields += `^FO${x},${s(y)}^A0N,${s(layout.gemFont[0])},${s(layout.gemFont[1])}^FD${gem}^FS`
    y += layout.gemLineHeight
  })
  return fields
}

export function generateGt800ZPL(formValue, dpiScale = 1, options = {}) {
  const s = (n) => Math.round(n * dpiScale)
  const layout = layoutGt800(formValue, 'original')

  let zpl = gt800Header(s, options.rotate180)

  zpl += `^FO${s(GT800_MADE_IN_X)},${s(GT800_MADE_IN_Y)}^A0N,${s(GT800_MADE_IN_FONT[0])},${s(GT800_MADE_IN_FONT[1])}^FD${formValue?.madeIn || ''}^FS`

  if (layout.productNameEn) {
    zpl += `^FO${s(GT800_O_NAME_X)},${s(GT800_O_NAME_Y)}^A0N,${s(layout.nameFont[0])},${s(layout.nameFont[1])}^FD${layout.productNameEn}^FS`
  }

  zpl += `^FO${s(GT800_O_BARCODE_X)},${s(GT800_O_BARCODE_Y)}^BY${s(GT800_O_BARCODE_MODULE)},${GT800_O_BARCODE_RATIO},${s(GT800_O_BARCODE_HEIGHT)}^BCN,${s(GT800_O_BARCODE_HEIGHT)},N,N^FD${layout.code}^FS`

  zpl += `^FO${s(GT800_O_CODE_LINE_X)},${s(GT800_O_CODE_LINE_Y)}^A0N,${s(layout.codeLineFont[0])},${s(layout.codeLineFont[1])}^FD${layout.codeLine}^FS`

  zpl += `^FO${s(GT800_O_GOLD_LINE_X)},${s(GT800_O_GOLD_LINE_Y)}^A0N,${s(GT800_O_GOLD_LINE_FONT[0])},${s(GT800_O_GOLD_LINE_FONT[1])}^FD${layout.goldLine}^FS`

  if (layout.remark) {
    zpl += buildRemarkSymbolZpl(layout.remark.key, layout.remark.x, layout.remark.y, dpiScale)
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
  const salePriceText = formValue?.hidePrice ? '' : formatLabelPrice(formValue?.salePrice)
  const codeLine = [code, salePriceText].filter(Boolean).join(' - ')
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

  zpl += `^FO${s(GT800_V_NAME_X)},${s(GT800_V_NAME_Y)}^A0N,${s(layout.nameFont[0])},${s(layout.nameFont[1])}^FD${layout.productNameEn}^FS`

  zpl += `^FO${s(GT800_V_GOLD_X)},${s(GT800_V_GOLD_Y)}^A0N,${s(layout.goldFont[0])},${s(layout.goldFont[1])}^FD${layout.goldSizeLine}^FS`

  zpl += `^FO${s(GT800_V_BARCODE_X)},${s(GT800_V_BARCODE_Y)}^BY${s(GT800_V_BARCODE_MODULE)},${GT800_V_BARCODE_RATIO},${s(GT800_V_BARCODE_HEIGHT)}^BCN,${s(GT800_V_BARCODE_HEIGHT)},N,N^FD${layout.code}^FS`

  if (layout.codeLine) {
    zpl += `^FO${s(GT800_V_CODE_LINE_X)},${s(GT800_V_CODE_LINE_Y)}^A0N,${s(layout.codeLineFont[0])},${s(layout.codeLineFont[1])}^FD${layout.codeLine}^FS`
  }

  zpl += buildGemFieldsZpl(layout, s)

  zpl += '^XZ'

  return zpl
}
