// ซิงก์เกรดเพชรระหว่างตารางวัตถุดิบ (stock.materials) กับตารางประเมินราคา (tranItems)
// ในโมดัลแก้ไขสินค้าของหน้าใบเสนอราคา — สองตารางนี้เก็บข้อมูลแยกกันคนละ state
// เมื่อผู้ใช้เปลี่ยนเกรดเพชรในตารางวัตถุดิบ ตารางประเมินราคาไม่รู้ด้วย ฟังก์ชันชุดนี้ตรวจจับ
// การเปลี่ยนแปลงแล้วเสนอ (ไม่ auto apply) ว่าแถวไหนในตารางประเมินราคาควรอัปเดตข้อความเป็นอะไร

// ทำให้เกรดเปรียบเทียบกันได้แม้ตัวพิมพ์/ช่องว่างต่างกัน — คงเครื่องหมายจุลภาคไว้เพราะเป็นส่วนหนึ่งของเกรด (เช่น "G,SI")
export function normalizeGrade(text) {
  return String(text ?? '').toUpperCase().replace(/\s+/g, '')
}

// เทียบเกรดเพชรปัจจุบันใน materials กับเกรดตอนเปิดโมดัล (originalGrades)
// originalGrades: [{ index, typeCode }] โดย index อ้างตำแหน่งใน materials
export function getDiamondGradeChanges(materials, originalGrades) {
  const changes = []
  ;(originalGrades || []).forEach(({ index, typeCode }) => {
    const material = (materials || [])[index]
    if (!material) return
    const from = typeCode
    const to = material.typeCode
    if (!from || !to) return
    if (normalizeGrade(from) === normalizeGrade(to)) return
    changes.push({ index, from, to })
  })
  return changes
}

// สร้างแผนอัปเดตแถวในตารางประเมินราคา (tranItems) ให้ตรงกับเกรดเพชรที่เปลี่ยนไป
// พิจารณาเฉพาะแถว nameGroup === 'gem' (ทั้งเพชรและพลอยถูก map มาไว้กลุ่มเดียวกันตอน seed)
// แต่ละแถวจับคู่กับ change แรกที่ match เท่านั้น (ไม่ซ้ำ)
export function buildGradeSyncPlan({ materials, originalGrades, tranItems }) {
  const changes = getDiamondGradeChanges(materials, originalGrades)
  if (!changes.length) return []

  const plan = []
  ;(tranItems || []).forEach((row, rowIndex) => {
    if (String(row?.nameGroup || '').toLowerCase() !== 'gem') return

    const description = row?.nameDescription ?? ''

    for (const change of changes) {
      // 1) exact — ข้อความทั้งแถวคือเกรดล้วนๆ เช่น "G,VS1"
      if (normalizeGrade(description) === normalizeGrade(change.from)) {
        plan.push({ rowIndex, current: description, suggested: change.to, mode: 'exact' })
        return
      }

      // 2) coded — ข้อความมีรูปแบบ "<เกรด>-Diamond-..." เกรดอยู่ segment แรก
      if (/diamond|เพชร/i.test(description) && description.includes('-')) {
        const parts = description.split('-')
        if (normalizeGrade(parts[0]) === normalizeGrade(change.to)) {
          // segment แรกตรงกับเกรดใหม่อยู่แล้ว ไม่ต้องเสนออัปเดตแถวนี้
          return
        }
        parts[0] = change.to
        plan.push({ rowIndex, current: description, suggested: parts.join('-'), mode: 'coded' })
        return
      }

      // 3) manual — พูดถึงเพชรแต่รูปแบบข้อความไม่ตรงกับสองแบบข้างบน ต้องให้ผู้ใช้แก้เอง
      if (/diamond|dia|เพชร/i.test(description)) {
        plan.push({ rowIndex, current: description, suggested: null, mode: 'manual' })
        return
      }
    }
  })

  return plan
}
