const KEY = 'bill-print-layout'

export function getBillLayout() {
  try {
    const v = localStorage.getItem(KEY)
    if (!v) return null
    return JSON.parse(v)
  } catch {
    return null
  }
}

export function saveBillLayout(layout) {
  localStorage.setItem(KEY, JSON.stringify(layout))
}

export function clearBillLayout() {
  localStorage.removeItem(KEY)
}
