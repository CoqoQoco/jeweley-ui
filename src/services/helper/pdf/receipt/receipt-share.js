const DEFAULT_FILENAME = 'receipt.pdf'

// ตรวจว่า browser รองรับ Web Share API แบบไฟล์จริง (ไม่ใช่แค่ navigator.share เฉยๆ)
export function canShareFiles() {
  if (typeof navigator === 'undefined') return false
  if (typeof navigator.share !== 'function' || typeof navigator.canShare !== 'function') return false

  try {
    const probeFile = new File(['receipt-probe'], 'probe.pdf', { type: 'application/pdf' })
    return navigator.canShare({ files: [probeFile] })
  } catch {
    return false
  }
}

function toFile(blob, filename) {
  return new File([blob], filename, { type: blob?.type || 'application/pdf' })
}

// fallback สุดท้ายที่ต้องทำงานได้เสมอ — save ไฟล์ผ่าน anchor download
export function downloadReceipt(blob, filename) {
  const name = filename || DEFAULT_FILENAME
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = name
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
  return { method: 'download', success: true }
}

// ยิงเข้า Web Share API (LINE / Mail / AirDrop ฯลฯ) — fallback เป็น download เมื่อเครื่องไม่รองรับ
// ผู้ใช้กดยกเลิก share sheet (AbortError) ถือเป็นเรื่องปกติ ไม่ throw ไม่ error แดง
export async function shareReceipt(blob, filename) {
  const name = filename || DEFAULT_FILENAME

  if (!canShareFiles()) {
    return downloadReceipt(blob, name)
  }

  const file = toFile(blob, name)

  try {
    await navigator.share({ files: [file], title: name })
    return { method: 'share', success: true }
  } catch (err) {
    if (err && err.name === 'AbortError') {
      return { method: 'share', success: false, cancelled: true }
    }
    return { ...downloadReceipt(blob, name), method: 'download-fallback', shareError: err?.message || null }
  }
}

// เปิดใบเสร็จแล้วสั่งพิมพ์ — มือถือที่รองรับ share ให้ใช้ share sheet เลือกแอปเครื่องพิมพ์ (Bluetooth/AirPrint)
// เครื่องที่ไม่รองรับ ให้เปิดแท็บใหม่แล้วสั่ง window.print() แทน สุดท้าย fallback เป็น download
export async function printReceipt(blob) {
  if (canShareFiles()) {
    const result = await shareReceipt(blob, DEFAULT_FILENAME)
    return { ...result, method: result.method === 'share' ? 'print-share' : result.method }
  }

  const url = URL.createObjectURL(blob)
  let printWindow = null

  try {
    printWindow = window.open(url, '_blank')
  } catch {
    printWindow = null
  }

  if (!printWindow) {
    URL.revokeObjectURL(url)
    return downloadReceipt(blob, DEFAULT_FILENAME)
  }

  printWindow.addEventListener('load', () => {
    printWindow.focus()
    printWindow.print()
  })
  setTimeout(() => URL.revokeObjectURL(url), 60000)

  return { method: 'print-window', success: true }
}
