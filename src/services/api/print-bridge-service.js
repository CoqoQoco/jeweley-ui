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

export async function printGeneric(payload) {
  const res = await fetch(`${BRIDGE_BASE}/print`, {
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

// ข้อความล้วน (ไม่ใช่ vat/bill ที่ backend เตรียม template ให้) — ใช้กับใบเสร็จ POS ที่หน้า print-station
// ดึงข้อความสำเร็จรูปจาก DB (tbt_print_job.payload) มาส่งพิมพ์ตรงๆ — printerName ไม่ส่งได้ บริดจ์ fallback เป็น DefaultPrinterName
export async function printRaw(payload) {
  const res = await fetch(`${BRIDGE_BASE}/print/raw`, {
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

// เรียกทุก 2 วิ จากหน้า /print-station เพื่อโชว์จุดเขียว/แดง — ห้าม throw เด็ดขาด
// (bridge ไม่ได้รันเป็นเรื่องปกติตอนเปิดคอมใหม่ ต้อง degrade เงียบ ไม่ทำให้ polling พัง)
export async function checkBridgeHealth() {
  try {
    const res = await fetch(`${BRIDGE_BASE}/health`)
    if (!res.ok) return false
    const text = await res.text()
    return text.trim().toLowerCase() === 'ok'
  } catch {
    return false
  }
}
