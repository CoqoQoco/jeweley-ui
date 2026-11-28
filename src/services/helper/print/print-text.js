export function wrapText(text, maxChars) {
  if (!text) return []
  const words = String(text).split(/\s+/)
  const lines = []
  let current = ''
  for (const word of words) {
    if (word.length === 0) continue
    if (word.length > maxChars) {
      if (current.length > 0) { lines.push(current); current = '' }
      for (let i = 0; i < word.length; i += maxChars) {
        lines.push(word.slice(i, i + maxChars))
      }
    } else if (current.length === 0) {
      current = word
    } else if (current.length + 1 + word.length <= maxChars) {
      current += ' ' + word
    } else {
      lines.push(current)
      current = word
    }
  }
  if (current.length > 0) lines.push(current)
  return lines
}

// ที่อยู่จาก master เป็น textarea: ตัดตามบรรทัดที่ผู้ใช้พิมพ์ก่อน แล้วค่อย wrap ตามความกว้าง (TK202611280003)
export function wrapAddressLines(text, maxChars, maxLines = Infinity) {
  if (!text) return []
  const lines = String(text).split(/\r?\n/).flatMap(part => wrapText(part, maxChars))
  return lines.slice(0, maxLines)
}
