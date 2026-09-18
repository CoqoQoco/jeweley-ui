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

// ฉลากบาร์โค้ด (ZPL) — printerName ต้องส่งเสมอ เพราะถ้าไม่ส่ง bridge จะ fallback ไปที่ DefaultPrinterName
// ซึ่งตอนนี้คือเครื่องพิมพ์บิล (EPSON LQ-310) ทำให้ฉลากไปออกผิดเครื่อง
export async function printZpl({ printerName, zpl }) {
  if (!printerName) {
    throw new Error('ยังไม่ได้ตั้งค่าเครื่องพิมพ์บาร์โค้ด กรุณาไปตั้งค่าที่หน้าตั้งค่าเครื่องพิมพ์บาร์โค้ดก่อนพิมพ์ครับ')
  }
  return await printRaw({ printerName, text: zpl })
}

// ภาพ+โลโก้ (CPCL) — ใช้ text ชุดเดียวกับ printRaw แต่ bridge วาดเป็นภาพทั้งใบก่อนส่งพิมพ์
export async function printImage(payload) {
  const res = await fetch(`${BRIDGE_BASE}/print/image`, {
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
