export const PRINT_BRIDGE_BASE_URL = import.meta.env.VITE_PRINT_BRIDGE_URL || 'https://localhost:9443'

const BRIDGE_BASE = PRINT_BRIDGE_BASE_URL

async function probeBridgeHealth(originalErr) {
  try {
    await fetch(`${BRIDGE_BASE}/health`, { mode: 'no-cors' })
    return { status: 'blocked', printers: [], detail: originalErr?.message || '' }
  } catch (probeErr) {
    return { status: 'unreachable', printers: [], detail: probeErr?.message || originalErr?.message || '' }
  }
}

export async function fetchPrinterList() {
  try {
    const res = await fetch(`${BRIDGE_BASE}/printers`)
    const data = await res.json()
    if (Array.isArray(data) && data.length > 0) {
      return { status: 'ok', printers: data.map((s) => ({ label: s, name: s })), detail: '' }
    }
    return { status: 'empty', printers: [], detail: '' }
  } catch (err) {
    return probeBridgeHealth(err)
  }
}

export async function getPrinterList() {
  const result = await fetchPrinterList()
  return result.printers
}
