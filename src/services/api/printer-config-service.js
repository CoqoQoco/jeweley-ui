const BRIDGE_BASE = import.meta.env.VITE_PRINT_BRIDGE_URL || 'https://localhost:9443'

export async function getPrinterList() {
  try {
    const res = await fetch(`${BRIDGE_BASE}/printers`)
    if (!res.ok) return []
    const data = await res.json()
    if (!Array.isArray(data)) return []
    return data.map((s) => ({ label: s, name: s }))
  } catch {
    return []
  }
}
