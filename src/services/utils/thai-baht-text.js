const THAI_DIGITS = ['', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า']
const THAI_PLACES = ['', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน']

function readBelowMillion(numStr) {
  const len = numStr.length
  let result = ''
  for (let i = 0; i < len; i++) {
    const digit = Number(numStr[i])
    const placeIndex = len - i - 1
    if (digit === 0) continue

    if (placeIndex === 0) {
      // หลักหน่วย
      if (digit === 1 && len > 1) {
        result += 'เอ็ด'
      } else {
        result += THAI_DIGITS[digit]
      }
    } else if (placeIndex === 1) {
      // หลักสิบ
      if (digit === 1) {
        result += 'สิบ'
      } else if (digit === 2) {
        result += 'ยี่สิบ'
      } else {
        result += THAI_DIGITS[digit] + 'สิบ'
      }
    } else {
      result += THAI_DIGITS[digit] + THAI_PLACES[placeIndex]
    }
  }
  return result
}

function readInteger(intStr) {
  // Strip leading zeros
  const cleaned = intStr.replace(/^0+/, '')
  if (!cleaned) return 'ศูนย์'

  // Split by 6-digit chunks (ล้าน) from the right
  const chunks = []
  let remaining = cleaned
  while (remaining.length > 6) {
    chunks.unshift(remaining.slice(-6))
    remaining = remaining.slice(0, -6)
  }
  chunks.unshift(remaining)

  let result = ''
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i]
    const chunkText = readBelowMillion(chunk)
    if (chunkText) result += chunkText
    if (i < chunks.length - 1) result += 'ล้าน'
  }
  return result
}

export function convertAmountToThaiText(amount) {
  const num = Number(amount)
  if (!isFinite(num)) return ''

  const isNegative = num < 0
  const absVal = Math.abs(num)

  // Round to 2 decimals to avoid float artifacts
  const rounded = Math.round(absVal * 100) / 100
  const fixed = rounded.toFixed(2)
  const [intPart, decPart] = fixed.split('.')

  const bahtText = readInteger(intPart)
  const satangNum = Number(decPart)

  let result = ''
  if (satangNum === 0) {
    result = bahtText + 'บาทถ้วน'
  } else {
    const satangText = readBelowMillion(decPart.replace(/^0+/, '') || '0')
    // Edge: when decPart is "01" → readBelowMillion("1") → "หนึ่ง" → ok (no tens)
    // But "10" → "สิบ" — fine. "11" → "สิบเอ็ด" because len > 1.
    const satangFinal = satangText || THAI_DIGITS[satangNum] || ''
    result = bahtText + 'บาท' + satangFinal + 'สตางค์'
  }

  if (isNegative) result = 'ลบ' + result
  return result
}
