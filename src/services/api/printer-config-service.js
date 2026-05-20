const BRIDGE_BASE = import.meta.env.VITE_PRINT_BRIDGE_URL || 'https://localhost:9443'

export async function getPrinterList() {
  try {
    const res = await fetch(`${BRIDGE_BASE}/config`)
    if (!res.ok) return []
    const data = await res.json()
    return Array.isArray(data.printers) ? data.printers : []
  } catch {
    return []
  }
}
