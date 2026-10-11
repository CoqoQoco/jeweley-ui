// plan-table-block-helpers.js — pure logic ของ PlanTableBlock (ตารางใบงานแบบ paged)

// body ของ request (ไม่รวม paging) จาก config.params(filter, state)
export function buildPlanTableBody(node, ctx) {
  return node.params ? node.params(ctx.filter, ctx.state) : {}
}

// key รวมของ params ทั้งหมด — เปลี่ยนเมื่อ params จริงเปลี่ยนเท่านั้น (watch ตัวเดียว = รีเซ็ตหน้า/ยิง 1 ครั้งต่อ action)
// node.keyParams (ถ้ามี) แทน params เป็นฐานของ key — ใช้เมื่อบาง field มีผลต่อ body แต่ไม่ควร trigger ยิงใหม่
// (เช่น riskWindowDays ที่มีผลเฉพาะโหมด dueSoon)
export function buildResetPagingKey(node, ctx) {
  const source = node.keyParams ? node.keyParams(ctx.filter, ctx.state) : buildPlanTableBody(node, ctx)
  return JSON.stringify(source)
}

export function buildPlanTableRequest(node, ctx, paging) {
  return { take: paging.take, skip: paging.skip, sort: paging.sort, ...buildPlanTableBody(node, ctx) }
}

// label/title = i18n key หรือ function(ctx, t) (เช่น label ที่มี {days} จาก filter)
export function buildToggleOptions(toggle, t, ctx) {
  const text = (spec) => (typeof spec === 'function' ? spec(ctx, t) : spec ? t(spec) : undefined)
  return (toggle?.options || []).map((option) => ({ value: option.value, label: text(option.label), title: text(option.title) }))
}

// chip "โฟกัส" ของตาราง (เช่น กรองเฉพาะแผนกที่คลิกจากตาราง lead time) — ว่าง = ไม่แสดง
export function resolveFocusChip(node, ctx, t) {
  const focus = node.focus
  if (!focus) return null
  const value = ctx.state?.[focus.stateKey]
  if (!value) return null
  return { value, text: focus.chipText(ctx, t, value), clearTip: focus.clearTip }
}
