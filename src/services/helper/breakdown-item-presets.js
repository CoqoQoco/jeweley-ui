// ค่า data ภาษาอังกฤษคงที่ — ถูกบันทึกลง priceTransactions และพิมพ์ตรงๆ บน Break Down PDF ของลูกค้า
// จึงห้ามผ่าน $t() (ข้อความจะเปลี่ยนตาม locale ของคนกรอก) — pattern เดียวกับ gold-loss-line-options.js
export const BREAKDOWN_ITEM_PRESETS = {
  Gold: ['Alloy'],
  Gem: [],
  Worker: [
    'Wax / Casting / Polishing / Filing',
    'Rhodium',
    'Laser Hall Mark',
    'Stone Handling Charge',
    'Diamond Handling Charge'
  ],
  Embed: ['Diamond Setting', 'Stone Setting'],
  ETC: ['CAD Mould']
}

export function getPresetTerms(nameGroup) {
  return BREAKDOWN_ITEM_PRESETS[nameGroup] || []
}

// รวม preset + term history → option list ของ AutoCompleteGeneric
// dedupe case-insensitive (แนวเดียวกับ appraisal-items-table getStaticOptions) — preset มาก่อน history
// ให้ทั้ง code และ name เท่ากับตัวคำ เพื่อใช้ได้ทั้ง optionLabel='name' และ 'code'
export function getBreakdownTermOptions(nameGroup, termHistory) {
  const presets = getPresetTerms(nameGroup)
  const history = Array.isArray(termHistory?.[nameGroup]) ? termHistory[nameGroup] : []

  const seen = new Set()
  const out = []

  const pushTerm = (term, fromHistory) => {
    const trimmed = typeof term === 'string' ? term.trim() : ''
    if (!trimmed) return
    const key = trimmed.toLowerCase()
    if (seen.has(key)) return
    seen.add(key)
    out.push({ code: trimmed, name: trimmed, __fromHistory: fromHistory })
  }

  presets.forEach((term) => pushTerm(term, false))
  history.forEach((term) => pushTerm(term, true))

  return out
}
