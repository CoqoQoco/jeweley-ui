import { storage } from '@/services/storage.js'

export const BARCODE_PRINTER_STORAGE_KEY = 'print-bridge-printer-barcode'
export const BARCODE_DPI_STORAGE_KEY = 'print-bridge-barcode-dpi'
export const BARCODE_DELAY_STORAGE_KEY = 'print-bridge-barcode-delay'
export const BARCODE_PROFILE_STORAGE_KEY = 'print-bridge-barcode-profile'

// template ฉลากปัจจุบันเขียนพิกัดไว้ที่หัวพิมพ์ 203 dpi
export const BASE_DPI = 203
export const DEFAULT_BARCODE_DPI = 203
export const DEFAULT_COPY_DELAY_MS = 800

// เครื่องเดิม (Zebra Print Service, พอร์ต 7003) vs เครื่องใหม่ Zebra GT800 (ผ่าน DK Print Bridge)
export const PRINTER_PROFILES = { LEGACY: 'legacy', GT800: 'gt800' }

const VALID_DPI = [203, 300]

export function getBarcodePrinterName() {
  return storage.getItem(BARCODE_PRINTER_STORAGE_KEY, '') || ''
}

export function setBarcodePrinterName(name) {
  if (name) {
    storage.setItem(BARCODE_PRINTER_STORAGE_KEY, name)
  } else {
    storage.removeItem(BARCODE_PRINTER_STORAGE_KEY)
  }
}

export function getBarcodeDpi() {
  const raw = Number(storage.getItem(BARCODE_DPI_STORAGE_KEY, DEFAULT_BARCODE_DPI))
  return VALID_DPI.includes(raw) ? raw : DEFAULT_BARCODE_DPI
}

export function setBarcodeDpi(dpi) {
  storage.setItem(BARCODE_DPI_STORAGE_KEY, dpi)
}

export function getCopyDelayMs() {
  const raw = Number(storage.getItem(BARCODE_DELAY_STORAGE_KEY, DEFAULT_COPY_DELAY_MS))
  return Number.isFinite(raw) && raw > 0 ? raw : DEFAULT_COPY_DELAY_MS
}

export function setCopyDelayMs(ms) {
  storage.setItem(BARCODE_DELAY_STORAGE_KEY, ms)
}

// template เดิมเขียนพิกัดไว้ที่ 203 dpi — เครื่องพิมพ์หัว 300 dpi ต้องคูณพิกัดทุกจุดด้วย scale นี้ ไม่งั้นฉลากจะเล็กลง
export function getDpiScale() {
  return getBarcodeDpi() / BASE_DPI
}

// ค่าเริ่มต้น = เครื่องเดิม (ร้านยังใช้เครื่องเดิมเป็นหลัก) — ค่าที่ไม่รู้จักหรือว่างก็ fallback มาเครื่องเดิม
export function getBarcodeProfile() {
  const raw = storage.getItem(BARCODE_PROFILE_STORAGE_KEY, PRINTER_PROFILES.LEGACY)
  return raw === PRINTER_PROFILES.GT800 ? PRINTER_PROFILES.GT800 : PRINTER_PROFILES.LEGACY
}

export function setBarcodeProfile(profile) {
  storage.setItem(
    BARCODE_PROFILE_STORAGE_KEY,
    profile === PRINTER_PROFILES.GT800 ? PRINTER_PROFILES.GT800 : PRINTER_PROFILES.LEGACY
  )
}

export function getBarcodePrinterConfig() {
  return {
    profile: getBarcodeProfile(),
    printerName: getBarcodePrinterName(),
    dpi: getBarcodeDpi(),
    dpiScale: getDpiScale(),
    copyDelayMs: getCopyDelayMs()
  }
}
