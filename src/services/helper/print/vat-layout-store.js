const KEY = 'vat-print-layout'

export function getVatLayout() {
  try {
    const v = localStorage.getItem(KEY)
    if (!v) return null
    return JSON.parse(v)
  } catch {
    return null
  }
}

export function saveVatLayout(layout) {
  localStorage.setItem(KEY, JSON.stringify(layout))
}

export function clearVatLayout() {
  localStorage.removeItem(KEY)
}
