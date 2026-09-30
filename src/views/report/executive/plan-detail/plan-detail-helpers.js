// plan-detail-helpers.js — pure logic ของหน้า executive/plan-detail (read-only, boss ที่ไม่มี
// production:edit) — ห้าม import Vue/i18n ที่นี่ ข้อความ resolve เป็นหน้าที่ component เอง (component ต่อ
// $t() เองเสมอเหมือน pattern ของ insight-helpers.js/wip-trend-helpers.js)

const STATUS_VARIANT_SUCCESS = new Set([95, 100])
const STATUS_VARIANT_CANCELLED = new Set([500])

// สถานะ 'success' (95=บัตรต้นทุน, 100=สำเร็จ) / 'cancelled' (500=หลอม) / 'process' (ระหว่างผลิต — ทุกสถานะ
// อื่น) — คู่กับ getStatusSeverity เดิมใน plan-view/index-view.vue แต่ย่อเหลือ 3 กลุ่มความหมายเดียว
export function resolvePlanStatusVariant(status) {
  if (STATUS_VARIANT_SUCCESS.has(status)) return 'success'
  if (STATUS_VARIANT_CANCELLED.has(status)) return 'cancelled'
  return 'process'
}

// header (สถานะ) ปัจจุบันของแผน — ProductionPlanGet ไม่มี updateBy/updateDate ของตัวเองที่ root (มีแค่ระดับ
// header ต่อสถานะใน tbtProductionPlanStatusHeader) หา header ที่ status ตรงกับสถานะปัจจุบันของแผนก่อน
// ถ้าไม่เจอ fallback เป็น header ที่ updateDate/createDate ล่าสุด — ใช้ทั้งโชว์ "แก้ไขล่าสุดโดย/เมื่อ" และ
// highlight แถวประวัติที่เป็นสถานะปัจจุบัน
export function resolveCurrentStatusHeader(headers, currentStatus) {
  if (!headers || !headers.length) return null
  const exact = headers.find((h) => h.status === currentStatus)
  if (exact) return exact
  return headers.reduce((latest, h) => {
    const hTime = new Date(h.updateDate || h.createDate || 0).getTime()
    const latestTime = latest ? new Date(latest.updateDate || latest.createDate || 0).getTime() : -Infinity
    return hTime > latestTime ? h : latest
  }, null)
}

// รวมชื่อช่างหลัก + ช่างรอง (workerSub มีเฉพาะบางสถานะ เช่น ขัดชุบ) เป็นข้อความเดียว คั่นด้วย " / "
export function buildHistoryWorkerText(detail) {
  const parts = []
  if (detail?.worker) parts.push(`${detail.worker} - ${detail.workerName || ''}`.trim())
  if (detail?.workerSub) parts.push(`${detail.workerSub} - ${detail.workerSubName || ''}`.trim())
  return parts.join(' / ')
}

// "ทองส่ง/รับ (g)" — รวม 2 ค่าเป็นข้อความเดียว "ส่ง → รับ" (3 ตำแหน่งทศนิยมตาม convention เดิมของหน้า
// plan-process-view.vue) — คืน '—' เมื่อไม่มีทั้งคู่
export function formatWeightSendCheckPair(goldWeightSend, goldWeightCheck) {
  const send = goldWeightSend != null ? Number(goldWeightSend).toFixed(3) : null
  const check = goldWeightCheck != null ? Number(goldWeightCheck).toFixed(3) : null
  if (send == null && check == null) return '—'
  if (send != null && check != null) return `${send} → ${check}`
  return send != null ? `${send} →` : `→ ${check}`
}

// ประวัติการเดินงาน: 1 แถวต่อ 1 detail (header เดียวมีได้หลาย detail เช่นจ่ายทองหลายรอบในสถานะเดียวกัน) —
// เรียงใหม่→เก่า ตาม detail.requestDate (fallback header.createDate เมื่อ detail ไม่มีวันที่ของตัวเอง) —
// currentStatus ใช้ mark isCurrent ต่อแถว (ไม่ผูกกับ resolveCurrentStatusHeader เพราะ 1 สถานะมีได้หลายแถว)
export function buildPlanHistoryRows(headers, currentStatus) {
  if (!headers || !headers.length) return []

  const rows = headers.reduce((acc, header) => {
    const details = header.tbtProductionPlanStatusDetail || []
    if (!details.length) return acc

    const who = header.updateBy || header.createBy || ''
    const detailRows = details.map((detail, index) => ({
      key: `${header.status}-${detail.id ?? index}`,
      date: detail.requestDate || header.createDate || null,
      status: header.status,
      who,
      worker: buildHistoryWorkerText(detail),
      goldWeightText: formatWeightSendCheckPair(detail.goldWeightSend, detail.goldWeightCheck),
      wages: detail.totalWages ?? detail.wages ?? null,
      remark: detail.description || '',
      isCurrent: header.status === currentStatus
    }))

    return [...acc, ...detailRows]
  }, [])

  return rows.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
}

const PRICE_GROUP_KEYS = new Set(['Gold', 'Gem', 'Worker', 'Embed', 'ETC'])

// nameGroup ของ priceItems -> key ให้ component ต่อ $t(`...priceGroup.${key}`) เอง — คืน 'unknown' เมื่อไม่รู้จัก
export function resolvePriceGroupKey(nameGroup) {
  return PRICE_GROUP_KEYS.has(nameGroup) ? nameGroup : 'unknown'
}

// ยอดรวมต้นทุนทั้งหมด (ผลรวม totalPrice ของทุกแถว) — ตาม caltotalPrice เดิมของ plan-price-view.vue
export function sumPriceItemsTotal(priceItems) {
  return (priceItems || []).reduce((sum, item) => sum + (Number(item.totalPrice) || 0), 0)
}

// หา planStatus master item ตาม id — ProductionPlan/GetProductionPlanStatus คืน [{id, nameTh, ...}] โดย
// id ตรงกับค่า status/header.status ของแผน (ไม่ใช่ field "code" — ดู FormStatusView.vue getStatusName)
export function findStatusMasterById(statusMaster, id) {
  return (statusMaster || []).find((item) => item.id === id) || null
}
