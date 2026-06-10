const STATUS_CLASS_MAP = {
  Draft: 'box-status-process',
  Submitted: 'box-status-show',
  Approved: 'box-status-success',
  PartiallyConsumed: 'box-status-show',
  Consumed: 'box-status-next',
  Rejected: 'box-status-disable',
  Cancelled: 'box-status-disable',
}

const STATUS_LABEL_FALLBACK = {
  Draft: 'ร่าง',
  Submitted: 'รออนุมัติ',
  Approved: 'อนุมัติแล้ว',
  PartiallyConsumed: 'สร้างแผนบางส่วน',
  Consumed: 'สร้างแผนครบ',
  Rejected: 'ปฏิเสธ',
  Cancelled: 'ยกเลิก',
}

export function getPrePlanStatusClass(status) {
  return STATUS_CLASS_MAP[status] || 'box-status-process'
}

export function getPrePlanStatusLabel(status, masterStatuses = []) {
  const fromMaster = (masterStatuses || []).find((s) => s.code === status)
  return fromMaster?.description || STATUS_LABEL_FALLBACK[status] || status
}

export function getLinkedProgressClass(linked, total) {
  if (!total) return 'box-status-process'
  if (linked >= total) return 'box-status-success'
  if (linked > 0) return 'box-status-show'
  return 'box-status-process'
}
