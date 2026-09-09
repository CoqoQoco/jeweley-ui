import QRCode from 'qrcode'

import logoUrl from '@/assets/duangkaew-logo.png'

// วาดใบเสร็จทั้งใบเป็น canvas ฝั่งเว็บ — port logic มาจาก
// jewelry-print-bridge/Services/ReceiptImageBuilder.cs (เครื่องพิมพ์ HM-A300E วาดใบเสร็จจริงแบบนี้)
// เป้าหมาย: preview บนมือถือให้ "เท่าตัวจริง" ทั้งขนาด/เลย์เอาต์/ฟอนต์ ไม่ใช่แค่ dump ข้อความ
//
// ค่าคงที่ด้านล่างต้องตรงกับฝั่ง C# เป๊ะ — ถ้าแก้ค่าที่ ReceiptImageBuilder.cs (เช่นขนาดโลโก้/ระยะขอบ)
// ต้องตามแก้ที่นี่ด้วยเสมอ ไม่งั้น preview จะไม่ตรงกับใบเสร็จจริงอีก
const WIDTH_DOTS = 576 // ความกว้างหัวพิมพ์ HM-A300E — WidthDots
const COLUMNS = 47 // จำนวนตัวอักษรต่อบรรทัดที่ใบเสร็จใช้จัดคอลัมน์เงิน — Columns
const LINE_SPACING_EXTRA = 4 // px เผื่อระหว่างบรรทัด — LineSpacingExtra
const BOTTOM_MARGIN_DOTS = 60 // เผื่อฉีกกระดาษ — BottomMarginDots
const LOGO_WIDTH_DOTS = 360 // ความกว้างโลโก้ที่วาด — LogoWidthDots
const LOGO_TOP_MARGIN = 63 // ระยะเว้นขอบบนกระดาษถึงโลโก้ (8 มม. ที่ 200 dpi) — LogoTopMargin
const LOGO_BOTTOM_MARGIN = 4 // LogoBottomMargin
const LUMINANCE_THRESHOLD = 160 // ต่ำกว่านี้ถือว่าเป็นจุดหมึก — LuminanceThreshold
const PRINTER_DPI = 200

// QR ท้ายใบเสร็จ (บรรทัดสัญญาณ [[QR:<url>]]) — ค่าต้อง sync กับ ReceiptImageBuilder.cs (jewelry-print-bridge) เป๊ะ
// ห้ามแก้ที่นี่โดยไม่ตามแก้ฝั่งนั้นด้วย (และห้ามแตะไฟล์ฝั่งนั้นจากที่นี่)
const QR_SIZE_DOTS = 160 // ขนาด QR กว้าง=สูง — QrSizeDots
const QR_MARGIN_DOTS = 8 // ระยะเว้นเหนือ/ใต้ QR — QrMarginDots
const QR_TOTAL_HEIGHT_DOTS = QR_SIZE_DOTS + QR_MARGIN_DOTS * 2 // ความสูงที่บรรทัด QR กินทั้งหมด (176)
const QR_X_DOTS = (WIDTH_DOTS - QR_SIZE_DOTS) / 2 // กึ่งกลางใน 576 dots = 208

// ฟอนต์: ฝั่ง C# เลือกจากฟอนต์ที่ติดตั้งบนเครื่อง (PickMonospaceFontName / PickThaiFontName)
// ฝั่งเว็บไม่รู้ว่าเครื่องผู้ใช้ลงฟอนต์อะไรบ้าง จึงใช้ font stack ให้ browser fallback เอาเอง
const MONO_FONT_STACK = "Consolas, 'Courier New', monospace"
const THAI_FONT_STACK = "'Leelawadee UI', Tahoma, 'Microsoft Sans Serif', sans-serif"

// ความกว้างกระดาษจริง (mm) — ใช้ตั้งขนาดแสดงผลบนจอให้ "เท่าตัวจริง" ห้าม hardcode ค่า mm ซ้ำที่อื่น
export const RECEIPT_WIDTH_MM = (WIDTH_DOTS / PRINTER_DPI) * 25.4

// บรรทัดป้ายรวมเงิน (TOTAL (THB) / TOTAL (USD)) — ต้องเด่นเป็นแถบดำตัวขาว
// x ของข้อความยังคงเป็น 0 เหมือนบรรทัดอื่นทุกประการ เพื่อให้คอลัมน์ตัวเลขตรงกับ Subtotal ด้านบน
export function isTotalLine(line) {
  return String(line ?? '').trimStart().startsWith('TOTAL')
}

// ตรวจ/แกะ url จากบรรทัดสัญญาณ [[QR:<url>]] — คืน url string เมื่อ match (ว่างได้ เช่น '[[QR:]]' คืน ''),
// null เมื่อไม่ใช่บรรทัดสัญญาณเลย
// pattern ต้องตรงกับ ReceiptImageBuilder.cs (jewelry-print-bridge) เป๊ะ: trim ท้ายแล้วขึ้นต้น [[QR: ลงท้าย ]]
// (.*) ไม่ใช่ (.+) — ฝั่ง C# เช็คแค่ prefix/suffix เฉยๆ ไม่บังคับว่า url ต้องมีอย่างน้อย 1 ตัวอักษร
const QR_MARKER_LINE_PATTERN = /^\[\[QR:(.*)\]\]$/

export function parseQrMarkerLine(line) {
  const match = QR_MARKER_LINE_PATTERN.exec(String(line ?? '').trimEnd())
  return match ? match[1] : null
}

// อักขระที่ไม่ใช่ ASCII พิมพ์ได้ (code point > 0x7E) → ใช้ตัดสินใจว่าต้องสลับฟอนต์ไทย
function hasNonAsciiChar(line) {
  for (let i = 0; i < line.length; i++) {
    if (line.charCodeAt(i) > 0x7e) return true
  }
  return false
}

// แบ่งบรรทัดเป็นช่วงสลับ ASCII / ไม่ใช่ ASCII เช่น "Customer : คุณสมชาย ใจดี"
// -> [{text:"Customer : ", startIndex:0, isThai:false}, {text:"คุณสมชาย ใจดี", startIndex:11, isThai:true}]
// startIndex คือดัชนีตัวอักษรตัวแรกของ run นับจากต้นบรรทัด ใช้คำนวณตำแหน่งคอลัมน์ที่ "ควรจะ" อยู่
export function splitRuns(line) {
  const runs = []
  if (!line || line.length === 0) return runs

  let start = 0
  let currentIsThai = line.charCodeAt(0) > 0x7e
  for (let i = 1; i <= line.length; i++) {
    const isThai = i < line.length && line.charCodeAt(i) > 0x7e
    if (i === line.length || isThai !== currentIsThai) {
      runs.push({ text: line.slice(start, i), startIndex: start, isThai: currentIsThai })
      start = i
      currentIsThai = isThai
    }
  }
  return runs
}

// วางตำแหน่ง x ของแต่ละ run ตามคอลัมน์ (startIndex * charWidth) แล้วกันซ้อนทับด้วย cursor
// measureFn รับ run แล้วคืนความกว้างที่วัดจริง (ฉีดจากภายนอกได้ เพื่อเทสต์ไม่ต้องพึ่ง canvas จริง)
export function computeRunPositions(runs, charWidth, measureFn) {
  let cursor = 0
  const positions = []
  for (const run of runs) {
    const width = measureFn(run)
    const desiredX = run.startIndex * charWidth
    const x = Math.max(cursor, desiredX) // ยึดคอลัมน์เป็นหลัก แต่กันซ้อนทับ
    positions.push({ run, x, width })
    cursor = x + width
  }
  return { positions, totalWidth: cursor }
}

// ความสูงรวมของบรรทัดแบบผสม (ข้อความ + QR) — ใช้ list entries เดียวกับที่วาดจริงเสมอ (ดู buildLineEntries)
// QR กินคงที่ QR_TOTAL_HEIGHT_DOTS, QR ล้มเหลว (qr-skip) กินความสูง 0, ข้อความกิน lineHeight เท่ากันทุกบรรทัด
export function computeLinesContentHeight(lineEntries, lineHeight) {
  return lineEntries.reduce((sum, entry) => {
    if (entry.type === 'qr') return sum + QR_TOTAL_HEIGHT_DOTS
    if (entry.type === 'qr-skip') return sum
    return sum + lineHeight
  }, 0)
}

// ความสูงรวมของภาพใบเสร็จ = ส่วนหัว(โลโก้) + เนื้อหา(ข้อความ+QR ผสมกันจาก computeLinesContentHeight) + เผื่อฉีกกระดาษ
export function computeCanvasHeight(linesContentHeight, textTop = 0, bottomMarginDots = BOTTOM_MARGIN_DOTS) {
  return textTop + Math.ceil(linesContentHeight) + bottomMarginDots
}

// ปรับขนาดฟอนต์จนความกว้างของ 47 ตัวอักษรใกล้เคียง targetWidth มากที่สุด — ห้าม hardcode
// เพราะใบเสร็จจัดคอลัมน์เงินด้วยช่องว่าง ถ้าความกว้างเพี้ยนคอลัมน์จะไม่ตรงแนว (เหมือน FindFontSize ฝั่ง C#)
function findFontSize(ctx, targetWidth, sample) {
  const measure = (size) => {
    ctx.font = `${size}px ${MONO_FONT_STACK}`
    return ctx.measureText(sample).width
  }

  // ประมาณค่าเริ่มต้นจากอัตราส่วนเชิงเส้น (ความกว้างฟอนต์ผันตรงกับ point size โดยประมาณ)
  const coarseSize = 10
  const coarseWidth = measure(coarseSize)
  const estimate = coarseSize * (targetWidth / coarseWidth)

  // ไล่ละเอียดรอบค่าประมาณ หาไซส์ที่ทำให้ความกว้างใกล้ target ที่สุดจริง (วัดด้วย measureText จริงทุกครั้ง)
  let bestSize = estimate
  let bestWidth = measure(estimate)
  let bestDiff = Math.abs(bestWidth - targetWidth)

  const start = Math.max(1, estimate - 2)
  const end = estimate + 2
  for (let s = start; s <= end; s += 0.02) {
    const w = measure(s)
    const diff = Math.abs(w - targetWidth)
    if (diff < bestDiff) {
      bestDiff = diff
      bestSize = s
      bestWidth = w
    }
  }

  return { fontSize: bestSize, measuredWidth: bestWidth }
}

// วาดบรรทัดที่มีอังกฤษ (monospace) ปนไทย (ไม่ monospace) โดยยึดตำแหน่งคอลัมน์ของแต่ละ run ตาม charWidth
// ถ้าความกว้างรวมล้นกระดาษ ให้ย่อเฉพาะฟอนต์ไทยทีละ 0.5px จนพอดี (floor 4px) — ห้ามย่อฟอนต์ mono
function drawMixedLine(ctx, line, monoFontStr, baseFontSize, charWidth, color, y) {
  const runs = splitRuns(line)
  let thaiSize = baseFontSize

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const thaiFontStr = `${thaiSize}px ${THAI_FONT_STACK}`
    const measureFn = (run) => {
      ctx.font = run.isThai ? thaiFontStr : monoFontStr
      return ctx.measureText(run.text).width
    }
    const { positions, totalWidth } = computeRunPositions(runs, charWidth, measureFn)

    if (totalWidth <= WIDTH_DOTS || thaiSize <= 4) {
      ctx.fillStyle = color
      positions.forEach(({ run, x }) => {
        ctx.font = run.isThai ? thaiFontStr : monoFontStr
        ctx.fillText(run.text, x, y)
      })
      return
    }

    thaiSize -= 0.5
  }
}

// โหลดโลโก้เป็น HTMLImageElement — คืน null เมื่อโหลด/decode ไม่สำเร็จ (ไม่ throw ให้ผู้เรียกจัดการต่อโดยไม่มีโลโก้)
async function loadLogoImage() {
  const img = new Image()
  img.src = logoUrl
  if (typeof img.decode === 'function') {
    await img.decode()
  } else {
    await new Promise((resolve, reject) => {
      img.onload = resolve
      img.onerror = reject
    })
  }
  return img
}

// ตัดขอบขาวบน-ล่างของโลโก้ออก (แนวตั้งเท่านั้น — ห้ามครอปแนวนอน ไม่งั้นสเกลแนวนอนเพี้ยน)
// ต้องผสม alpha กับพื้นขาวก่อนหาลูมิแนนซ์ เหมือน CropLogoVertical ฝั่ง C# — logo.png ต้นฉบับมีขอบโปร่งใส
// เก็บเป็น R0 G0 B0 A0 ถ้าอ่าน RGB ตรงๆ โดยไม่มอง alpha จะเข้าใจผิดว่าขอบเป็นหมึกดำแล้วครอปไม่ได้เลย
function cropLogoVertical(img) {
  const width = img.naturalWidth
  const height = img.naturalHeight

  const sourceCanvas = document.createElement('canvas')
  sourceCanvas.width = width
  sourceCanvas.height = height
  const sourceCtx = sourceCanvas.getContext('2d')
  sourceCtx.drawImage(img, 0, 0)
  const { data } = sourceCtx.getImageData(0, 0, width, height)

  const rowHasInk = (y) => {
    const rowStart = y * width * 4
    for (let x = 0; x < width; x++) {
      const idx = rowStart + x * 4
      const r = data[idx]
      const g = data[idx + 1]
      const b = data[idx + 2]
      const a = data[idx + 3]
      const alpha = a / 255
      const effR = r * alpha + 255 * (1 - alpha) // ผสมกับพื้นขาวเหมือนตอนพิมพ์จริง
      const effG = g * alpha + 255 * (1 - alpha)
      const effB = b * alpha + 255 * (1 - alpha)
      const luminance = 0.299 * effR + 0.587 * effG + 0.114 * effB
      if (luminance < LUMINANCE_THRESHOLD) return true
    }
    return false
  }

  let inkTop = -1
  let inkBottom = -1
  for (let y = 0; y < height; y++) {
    if (rowHasInk(y)) {
      inkTop = y
      break
    }
  }
  if (inkTop >= 0) {
    for (let y = height - 1; y >= inkTop; y--) {
      if (rowHasInk(y)) {
        inkBottom = y
        break
      }
    }
  }

  // หาหมึกไม่เจอเลย (ภาพขาวล้วน) — ใช้เต็มภาพเหมือนเดิม ไม่ throw
  if (inkTop < 0 || inkBottom < 0) {
    return { sourceCanvas, top: 0, height }
  }

  return { sourceCanvas, top: inkTop, height: inkBottom - inkTop + 1 }
}

// เตรียมข้อมูลตำแหน่ง/ขนาดโลโก้สำหรับวาด — คืน null เมื่อโหลด/ประมวลผลโลโก้ไม่สำเร็จ (วาดใบเสร็จต่อโดยไม่มีโลโก้)
async function prepareLogo() {
  try {
    const img = await loadLogoImage()
    const cropped = cropLogoVertical(img)
    const drawWidth = LOGO_WIDTH_DOTS
    // หาร img.naturalWidth (ความกว้างเต็มก่อนครอป) เสมอ เพราะไม่ได้ครอปแนวนอน สเกลแนวนอนต้องคงเดิม
    const drawHeight = Math.round(cropped.height * (drawWidth / img.naturalWidth))
    return {
      sourceCanvas: cropped.sourceCanvas,
      sourceTop: cropped.top,
      sourceHeight: cropped.height,
      sourceWidth: img.naturalWidth,
      drawWidth,
      drawHeight,
      top: LOGO_TOP_MARGIN
    }
  } catch {
    return null
  }
}

// แปลงพิกเซลทั้งภาพเป็นขาว-ดำ 1-bit เหมือนที่ BitmapToCpclHex ฝั่ง C# ทำก่อนส่งเข้าเครื่องพิมพ์จริง
// (luminance = 0.299r + 0.587g + 0.114b, ต่ำกว่า LUMINANCE_THRESHOLD = จุดดำ) — ไม่งั้น preview จะเห็นโลโก้/สี
// เป็นสีเดิม (เช่นแดง) ทั้งที่เครื่องพิมพ์ 1-bit พ่นออกมาดำสนิทเสมอ ไม่ใช่ "เท่าตัวจริง" จริง
// ตัวอักษรฝั่ง C# วาดแบบ aliased (SingleBitPerPixelGridFit) อยู่แล้วจึงไม่กระทบ ส่วนฝั่งเว็บวาดแบบ antialiased
// threshold นี้เลยทำให้ขอบตัวอักษร/โลโก้คมขึ้นเป็นขาวดำสนิท ซึ่งเป็นพฤติกรรมที่ต้องการให้ตรงของจริง
//
// ห้ามผสม alpha ในขั้นนี้ (ต่างจาก cropLogoVertical ที่ต้องผสม) เพราะ canvas ใบเสร็จถูก fillRect ขาวทึบ
// ไปตั้งแต่ต้นแล้ว ทุกพิกเซลจึงเป็น alpha=255 อยู่แล้วเหมือน BitmapToCpclHex ฝั่ง C# ที่อ่าน RGB ตรงๆ ได้เลย
export function applyOneBitThreshold(data) {
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b
    const value = luminance < LUMINANCE_THRESHOLD ? 0 : 255
    data[i] = value
    data[i + 1] = value
    data[i + 2] = value
    data[i + 3] = 255
  }
  return data
}

// สร้าง QR เป็น HTMLImageElement จาก url ในบรรทัดสัญญาณ — คืน null เมื่อสร้าง/decode ไม่สำเร็จ
// (ไม่ throw ให้ buildLineEntries() ข้ามบรรทัดนั้นไปเฉยๆ ไม่วาด ไม่กินความสูง)
async function buildQrImage(url) {
  try {
    const dataUrl = await QRCode.toDataURL(url, { errorCorrectionLevel: 'M', width: QR_SIZE_DOTS, margin: 4 })
    const img = new Image()
    img.src = dataUrl
    if (typeof img.decode === 'function') {
      await img.decode()
    } else {
      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
      })
    }
    return img
  } catch {
    return null
  }
}

// pre-pass: แปลงแต่ละบรรทัดดิบเป็นชนิดที่จะวาด (ข้อความ / QR สำเร็จ+Image / QR ล้มเหลว=ข้าม) ก่อนคำนวณความสูง
// ต้องใช้ list เดียวกันทั้งตอนคำนวณความสูง (computeLinesContentHeight) และตอนวาดจริง (renderReceiptCanvas)
// ไม่งั้นความสูงที่คำนวณกับที่วาดจะไม่ตรงกัน
// (export ไว้ให้เทสได้)
export async function buildLineEntries(lines) {
  const entries = []
  for (const line of lines) {
    const qrUrl = parseQrMarkerLine(line)
    if (qrUrl === null) {
      entries.push({ type: 'text', text: line })
      continue
    }
    // url ว่าง/เว้นวรรคล้วน (เช่น '[[QR:]]' หรือ '[[QR:   ]]') — ข้ามทันทีโดยไม่เรียก buildQrImage()
    // ต้อง short-circuit ตรงนี้เหมือน C# ที่เช็ค string.IsNullOrWhiteSpace(qrUrl) ก่อนสร้าง QR เสมอ
    // ไม่งั้น QRCode.toDataURL('   ') จะสร้าง QR ของช่องว่างสำเร็จแล้ววาดออกมา ต่างจาก C# ที่ข้าม
    if (!qrUrl.trim()) {
      entries.push({ type: 'qr-skip' })
      continue
    }
    const image = await buildQrImage(qrUrl)
    entries.push(image ? { type: 'qr', image } : { type: 'qr-skip' })
  }
  return entries
}

// วาดใบเสร็จทั้งใบเป็น canvas — ยึดตามลำดับขั้นตอนของ Build() ฝั่ง C# ทุกประการ
// คืน HTMLCanvasElement กว้าง WIDTH_DOTS (576) — โยน error เฉพาะกรณีที่ canvas ใช้งานไม่ได้เลย (browser ไม่รองรับ)
// ผู้เรียก (component) ต้อง catch ไว้ตกกลับไปแสดง <pre> ข้อความเดิม
export async function renderReceiptCanvas(text) {
  const lines = String(text ?? '').replace(/\r\n/g, '\n').split('\n')

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('canvas 2d context ไม่รองรับ')

  ctx.textBaseline = 'top'

  const sample = '0'.repeat(COLUMNS)
  const { fontSize, measuredWidth } = findFontSize(ctx, WIDTH_DOTS, sample)
  const charWidth = measuredWidth / COLUMNS // ใช้จัดตำแหน่ง x ของแต่ละ run ให้ตรงคอลัมน์ — ห้าม hardcode WIDTH_DOTS/COLUMNS
  const monoFontStr = `${fontSize}px ${MONO_FONT_STACK}`

  ctx.font = monoFontStr
  const metrics = ctx.measureText(sample)
  const hasFontBoundingBox =
    typeof metrics.fontBoundingBoxAscent === 'number' && typeof metrics.fontBoundingBoxDescent === 'number'
  const lineHeight =
    (hasFontBoundingBox ? metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent : fontSize * 1.2) +
    LINE_SPACING_EXTRA

  const lineEntries = await buildLineEntries(lines)

  const logo = await prepareLogo()
  const textTop = logo ? logo.top + logo.drawHeight + LOGO_BOTTOM_MARGIN : 0
  const linesContentHeight = computeLinesContentHeight(lineEntries, lineHeight)
  const heightDots = computeCanvasHeight(linesContentHeight, textTop, BOTTOM_MARGIN_DOTS)

  // resize canvas ล้าง context state ทั้งหมด (font/fillStyle/textBaseline) — ต้องตั้งใหม่หลัง resize เสมอ
  canvas.width = WIDTH_DOTS
  canvas.height = heightDots
  ctx.textBaseline = 'top'
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, WIDTH_DOTS, heightDots) // ต้องเคลียร์พื้นขาวก่อนวาดโลโก้เสมอ

  if (logo) {
    // โลโก้ต้นฉบับ 300x300 px วาดที่ 360 จุด = upscale — ต้องใช้ interpolation คุณภาพสูง กันขอบเบลอ/หยัก
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
    const logoX = (WIDTH_DOTS - logo.drawWidth) / 2
    ctx.drawImage(
      logo.sourceCanvas,
      0,
      logo.sourceTop,
      logo.sourceWidth,
      logo.sourceHeight,
      logoX,
      logo.top,
      logo.drawWidth,
      logo.drawHeight
    )
  }

  let y = textTop
  for (const entry of lineEntries) {
    if (entry.type === 'qr-skip') continue // QR สร้างไม่สำเร็จ — ข้ามบรรทัดนั้น ไม่วาด ไม่กินความสูง

    if (entry.type === 'qr') {
      y += QR_MARGIN_DOTS
      // ปิด smoothing ก่อนวาด QR เสมอ กันโมดูลเบลอจนสแกนไม่ติด (ภาพผ่าน 1-bit threshold ต่อ)
      // แล้วคืนค่าเดิมหลังวาดเสร็จ เพราะโลโก้ (วาดไปแล้วด้านบน) ต้องใช้ smoothing
      const prevSmoothing = ctx.imageSmoothingEnabled
      ctx.imageSmoothingEnabled = false
      ctx.drawImage(entry.image, QR_X_DOTS, y, QR_SIZE_DOTS, QR_SIZE_DOTS)
      ctx.imageSmoothingEnabled = prevSmoothing
      y += QR_SIZE_DOTS + QR_MARGIN_DOTS
      continue
    }

    const line = entry.text
    if (isTotalLine(line)) {
      // แถบดำตัวขาว — x ยังคงเป็น 0 เหมือนบรรทัดอื่น ห้ามขยับเข้าไปเว้นขอบ
      ctx.fillStyle = '#000000'
      ctx.fillRect(0, y, WIDTH_DOTS, lineHeight)
      ctx.fillStyle = '#ffffff'
      ctx.font = monoFontStr
      ctx.fillText(line, 0, y)
    } else if (hasNonAsciiChar(line)) {
      drawMixedLine(ctx, line, monoFontStr, fontSize, charWidth, '#000000', y)
    } else {
      ctx.fillStyle = '#000000'
      ctx.font = monoFontStr
      ctx.fillText(line, 0, y)
    }
    y += lineHeight // ห้ามเปลี่ยน — ทุกบรรทัดต้องกินความสูงเท่ากันเสมอไม่ว่าจะใช้ฟอนต์ไหน
  }

  // แปลงเป็นขาว-ดำ 1-bit ทั้งภาพให้ตรงกับที่เครื่องพิมพ์พ่นออกมาจริง (ดู applyOneBitThreshold ด้านบน)
  // getImageData พังได้ถ้า canvas ถูก taint (ไม่ควรเกิดกับ asset ใน bundle เอง แต่กันไว้) — ถ้าพังให้ใช้ภาพสีเดิม
  // ดีกว่าทำให้ preview ทั้งอันตกไป fallback <pre>
  try {
    const imageData = ctx.getImageData(0, 0, WIDTH_DOTS, heightDots)
    applyOneBitThreshold(imageData.data)
    ctx.putImageData(imageData, 0, 0)
  } catch {
    // เก็บภาพสีเดิมไว้ ดีกว่าไม่มี preview เลย
  }

  return canvas
}
