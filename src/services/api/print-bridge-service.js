const BRIDGE_BASE = import.meta.env.VITE_PRINT_BRIDGE_URL || 'https://localhost:9443'

export async function printVat(payload) {
  const res = await fetch(`${BRIDGE_BASE}/print/vat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok || data.success === false) {
    throw new Error(data.error || `Print failed (HTTP ${res.status})`)
  }
  return data
}

export async function printBill(payload) {
  const res = await fetch(`${BRIDGE_BASE}/print/bill`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok || data.success === false) {
    throw new Error(data.error || `Print failed (HTTP ${res.status})`)
  }
  return data
}

export async function getPrinters() {
  const res = await fetch(`${BRIDGE_BASE}/printers`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}
