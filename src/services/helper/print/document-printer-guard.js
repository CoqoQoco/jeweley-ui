import { confirmThenSubmit } from '@/composables/useConfirmSubmit.js'

function normalize(name) {
  return String(name || '').trim().toLowerCase()
}

export function isBarcodePrinter(name, barcodePrinterName) {
  const target = normalize(barcodePrinterName)
  return !!target && normalize(name) === target
}

// เครื่องพิมพ์ตั้งต้นของเอกสาร: เอาค่าแรกที่มีและไม่ใช่เครื่องพิมพ์ป้ายบาร์โค้ด (ใบเสร็จ/ใบกำกับห้ามหลุดไปออกเครื่อง GT800)
export function pickDocumentPrinter(candidates, barcodePrinterName) {
  const found = (candidates || []).find((name) => name && !isBarcodePrinter(name, barcodePrinterName))
  return found || null
}

// ก่อนส่งพิมพ์เอกสาร: ถ้าเครื่องที่เลือกคือเครื่องป้ายบาร์โค้ด ให้ถามยืนยัน (ยกเลิก = ไม่พิมพ์) ไม่ใช่เครื่องป้าย = พิมพ์ต่อทันที
export function confirmIfBarcodePrinter(printerName, barcodePrinterName, { message, title, confirmText, cancelText }, onProceed) {
  if (!isBarcodePrinter(printerName, barcodePrinterName)) {
    onProceed()
    return
  }
  confirmThenSubmit(message, title, onProceed, { confirmText, cancelText })
}
