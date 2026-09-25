import { describe, it, expect, beforeEach } from 'vitest'
import {
  getBarcodeProfile,
  setBarcodeProfile,
  getBarcodePrinterConfig,
  getBarcodeRotate180,
  setBarcodeRotate180,
  BARCODE_PROFILE_STORAGE_KEY,
  PRINTER_PROFILES
} from './barcode-printer-config.js'

describe('barcode profile config', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('ยังไม่เคยตั้งค่า → default เป็น legacy', () => {
    expect(getBarcodeProfile()).toBe(PRINTER_PROFILES.LEGACY)
  })

  it('setBarcodeProfile(gt800) แล้ว getBarcodeProfile คืน gt800', () => {
    setBarcodeProfile(PRINTER_PROFILES.GT800)
    expect(getBarcodeProfile()).toBe(PRINTER_PROFILES.GT800)
  })

  it('setBarcodeProfile(legacy) แล้ว getBarcodeProfile คืน legacy', () => {
    setBarcodeProfile(PRINTER_PROFILES.GT800)
    setBarcodeProfile(PRINTER_PROFILES.LEGACY)
    expect(getBarcodeProfile()).toBe(PRINTER_PROFILES.LEGACY)
  })

  it('ค่าแปลกๆ ในเก็บไว้ → fallback เป็น legacy', () => {
    localStorage.setItem(BARCODE_PROFILE_STORAGE_KEY, 'some-unknown-profile')
    expect(getBarcodeProfile()).toBe(PRINTER_PROFILES.LEGACY)
  })

  it('setBarcodeProfile ด้วยค่าแปลกๆ → เก็บเป็น legacy', () => {
    setBarcodeProfile('nonsense')
    expect(getBarcodeProfile()).toBe(PRINTER_PROFILES.LEGACY)
  })

  it('getBarcodePrinterConfig มี profile รวมอยู่ด้วย', () => {
    setBarcodeProfile(PRINTER_PROFILES.GT800)
    const config = getBarcodePrinterConfig()
    expect(config.profile).toBe(PRINTER_PROFILES.GT800)
  })
})

describe('barcode rotate180 config', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('ยังไม่เคยตั้งค่า → default เป็น false', () => {
    expect(getBarcodeRotate180()).toBe(false)
  })

  it('setBarcodeRotate180(true) แล้ว getBarcodeRotate180 คืน true', () => {
    setBarcodeRotate180(true)
    expect(getBarcodeRotate180()).toBe(true)
  })

  it('setBarcodeRotate180(false) แล้ว getBarcodeRotate180 คืน false', () => {
    setBarcodeRotate180(true)
    setBarcodeRotate180(false)
    expect(getBarcodeRotate180()).toBe(false)
  })

  it('getBarcodePrinterConfig มี rotate180 รวมอยู่ด้วย', () => {
    setBarcodeRotate180(true)
    const config = getBarcodePrinterConfig()
    expect(config.rotate180).toBe(true)
  })
})
