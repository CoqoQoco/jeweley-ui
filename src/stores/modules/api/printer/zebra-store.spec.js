import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

vi.mock('@/axios/axios-helper.js', () => ({
  default: {
    zebraPrinter: {
      printZPL: vi.fn(),
      printsZPL: vi.fn(),
      getStatus: vi.fn()
    }
  }
}))

vi.mock('@/services/api/print-bridge-service.js', () => ({
  printZpl: vi.fn()
}))

vi.mock('@/services/api/printer-config-service.js', () => ({
  fetchPrinterList: vi.fn()
}))

import api from '@/axios/axios-helper.js'
import { printZpl } from '@/services/api/print-bridge-service.js'
import { fetchPrinterList } from '@/services/api/printer-config-service.js'
import {
  setBarcodeProfile,
  setBarcodePrinterName,
  setCopyDelayMs,
  setBarcodeRotate180,
  PRINTER_PROFILES
} from '@/services/api/barcode-printer-config.js'
import { zebraPrinterApi } from './zebra-store.js'

describe('zebraPrinterApi — เลือก template ตาม profile + ส่งงานตาม profile + เช็คสถานะ', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
    api.zebraPrinter.printZPL.mockReset()
    api.zebraPrinter.printsZPL.mockReset()
    api.zebraPrinter.getStatus.mockReset()
    printZpl.mockReset()
    fetchPrinterList.mockReset()
    setCopyDelayMs(0)
  })

  describe('profile legacy — พิมพ์ผ่าน Zebra Print Service (api.zebraPrinter)', () => {
    beforeEach(() => {
      setBarcodeProfile(PRINTER_PROFILES.LEGACY)
    })

    it('fetchZebraPrint เรียก api.zebraPrinter.printZPL ไม่เรียก bridge printZpl', async () => {
      api.zebraPrinter.printZPL.mockResolvedValue({ status: 'success' })

      const store = zebraPrinterApi()
      const res = await store.fetchZebraPrint({
        formValue: { stockNumber: 'RG-001', barcodeType: 'original', print: 1 }
      })

      expect(api.zebraPrinter.printZPL).toHaveBeenCalledTimes(1)
      expect(printZpl).not.toHaveBeenCalled()
      expect(res.status).toBe('success')
    })

    it('fetchZebraPrint: printZPL ตอบ error → คืน error ทันทีไม่พิมพ์ต่อ', async () => {
      api.zebraPrinter.printZPL.mockResolvedValue({ status: 'error', message: 'เครื่องพิมพ์ไม่ทำงาน' })

      const store = zebraPrinterApi()
      const res = await store.fetchZebraPrint({
        formValue: { stockNumber: 'RG-001', barcodeType: 'original', print: 3 }
      })

      expect(api.zebraPrinter.printZPL).toHaveBeenCalledTimes(1)
      expect(res.status).toBe('error')
    })

    it('fetchZebraPrints เรียก api.zebraPrinter.printsZPL ก้อนเดียว', async () => {
      api.zebraPrinter.printsZPL.mockResolvedValue({
        status: 'success',
        message: 'พิมพ์ทั้งหมด 2 รายการสำเร็จ',
        summary: { total: 2, success: 2, failed: 0 }
      })

      const store = zebraPrinterApi()
      const res = await store.fetchZebraPrints({
        formValue: [
          { stockNumber: 'A-001', barcodeType: 'original' },
          { stockNumber: 'B-002', barcodeType: 'cost-no-gold' }
        ]
      })

      expect(api.zebraPrinter.printsZPL).toHaveBeenCalledTimes(1)
      expect(printZpl).not.toHaveBeenCalled()
      expect(res.status).toBe('success')
      expect(res.summary).toEqual({ total: 2, success: 2, failed: 0 })
    })

    it('original-qr บนโปรไฟล์ legacy → error พิมพ์ได้แค่ GT800 ไม่เรียก printZPL', async () => {
      const store = zebraPrinterApi()
      const res = await store.fetchZebraPrint({
        formValue: {
          stockNumber: 'RG-001',
          barcodeType: 'original-qr',
          publicUrl: 'https://app.duangkeaw.com/p/abc',
          print: 1
        }
      })

      expect(api.zebraPrinter.printZPL).not.toHaveBeenCalled()
      expect(printZpl).not.toHaveBeenCalled()
      expect(res.status).toBe('error')
      expect(res.message).toContain('GT800')
    })
  })

  describe('profile gt800 — พิมพ์ผ่าน DK Print Bridge (printZpl)', () => {
    beforeEach(() => {
      setBarcodeProfile(PRINTER_PROFILES.GT800)
    })

    it('ยังไม่ได้ตั้งชื่อเครื่องพิมพ์ → error ไม่เรียก printZpl', async () => {
      setBarcodePrinterName('')

      const store = zebraPrinterApi()
      const res = await store.fetchZebraPrint({
        formValue: { stockNumber: 'RG-001', barcodeType: 'original', print: 1 }
      })

      expect(printZpl).not.toHaveBeenCalled()
      expect(res.status).toBe('error')
    })

    it('fetchZebraPrint เรียก printZpl ด้วยชื่อเครื่องพิมพ์ที่ตั้งไว้', async () => {
      setBarcodePrinterName('GT800 RAW')
      printZpl.mockResolvedValue({ success: true })

      const store = zebraPrinterApi()
      const res = await store.fetchZebraPrint({
        formValue: { stockNumber: 'RG-001', barcodeType: 'original', print: 1 }
      })

      expect(printZpl).toHaveBeenCalledTimes(1)
      expect(printZpl).toHaveBeenCalledWith({ printerName: 'GT800 RAW', zpl: expect.any(String) })
      expect(api.zebraPrinter.printZPL).not.toHaveBeenCalled()
      expect(res.status).toBe('success')
    })

    it('fetchZebraPrints เรียก printZpl ทีละรายการ', async () => {
      setBarcodePrinterName('GT800 RAW')
      printZpl.mockResolvedValue({ success: true })

      const store = zebraPrinterApi()
      const res = await store.fetchZebraPrints({
        formValue: [
          { stockNumber: 'A-001', barcodeType: 'original' },
          { stockNumber: 'B-002', barcodeType: 'x' }
        ]
      })

      expect(printZpl).toHaveBeenCalledTimes(2)
      expect(api.zebraPrinter.printsZPL).not.toHaveBeenCalled()
      expect(res.status).toBe('success')
      expect(res.summary).toEqual({ total: 2, success: 2, failed: 0 })
    })

    it('fetchZebraPrints: บางรายการพิมพ์ไม่สำเร็จ → status partial', async () => {
      setBarcodePrinterName('GT800 RAW')
      printZpl.mockResolvedValueOnce({ success: true }).mockRejectedValueOnce(new Error('printer offline'))

      const store = zebraPrinterApi()
      const res = await store.fetchZebraPrints({
        formValue: [
          { stockNumber: 'A-001', barcodeType: 'original' },
          { stockNumber: 'B-002', barcodeType: 'x' }
        ]
      })

      expect(res.status).toBe('partial')
      expect(res.summary).toEqual({ total: 2, success: 1, failed: 1 })
    })

    it('original-qr ไม่มี publicUrl → error ไม่เรียก printZpl', async () => {
      setBarcodePrinterName('GT800 RAW')

      const store = zebraPrinterApi()
      const res = await store.fetchZebraPrint({
        formValue: { stockNumber: 'RG-001', barcodeType: 'original-qr', publicUrl: '', print: 1 }
      })

      expect(printZpl).not.toHaveBeenCalled()
      expect(res.status).toBe('error')
    })

    it('rotate180 เปิดไว้ → ZPL ที่ส่งไป printZpl มี ^POI^PW600', async () => {
      setBarcodePrinterName('GT800 RAW')
      setBarcodeRotate180(true)
      printZpl.mockResolvedValue({ success: true })

      const store = zebraPrinterApi()
      await store.fetchZebraPrint({
        formValue: { stockNumber: 'RG-001', barcodeType: 'original', print: 1 }
      })

      const sentZpl = printZpl.mock.calls[0][0].zpl
      expect(sentZpl).toContain('^POI^PW600')
    })

    it('rotate180 ปิด (default) → ZPL ที่ส่งไป printZpl ไม่มี ^POI^PW600', async () => {
      setBarcodePrinterName('GT800 RAW')
      printZpl.mockResolvedValue({ success: true })

      const store = zebraPrinterApi()
      await store.fetchZebraPrint({
        formValue: { stockNumber: 'RG-001', barcodeType: 'original', print: 1 }
      })

      const sentZpl = printZpl.mock.calls[0][0].zpl
      expect(sentZpl).not.toContain('^POI')
    })

    it('original-qr มี publicUrl → ใช้ template QR (มี ^BQN) ไม่ตกไปแนวตั้ง', async () => {
      setBarcodePrinterName('GT800 RAW')
      printZpl.mockResolvedValue({ success: true })

      const store = zebraPrinterApi()
      const res = await store.fetchZebraPrint({
        formValue: {
          stockNumber: 'RG-001',
          barcodeType: 'original-qr',
          publicUrl: 'https://app.duangkeaw.com/p/abc',
          print: 1
        }
      })

      expect(printZpl).toHaveBeenCalledTimes(1)
      const sentZpl = printZpl.mock.calls[0][0].zpl
      expect(sentZpl).toContain('^BQN')
      expect(res.status).toBe('success')
    })
  })

  describe('fetchBarcodePrinterStatus', () => {
    it('legacy: service running → success', async () => {
      setBarcodeProfile(PRINTER_PROFILES.LEGACY)
      api.zebraPrinter.getStatus.mockResolvedValue({ service: { status: 'running' }, printer: {} })

      const store = zebraPrinterApi()
      const res = await store.fetchBarcodePrinterStatus()

      expect(res.profile).toBe('legacy')
      expect(res.status).toBe('success')
      expect(fetchPrinterList).not.toHaveBeenCalled()
    })

    it('legacy: service ไม่ได้ running → service-error', async () => {
      setBarcodeProfile(PRINTER_PROFILES.LEGACY)
      api.zebraPrinter.getStatus.mockResolvedValue({ service: { status: 'stopped' } })

      const store = zebraPrinterApi()
      const res = await store.fetchBarcodePrinterStatus()

      expect(res.status).toBe('service-error')
    })

    it('gt800: bridge ok + ตั้งชื่อไว้แล้ว และเจอในรายชื่อ → success', async () => {
      setBarcodeProfile(PRINTER_PROFILES.GT800)
      setBarcodePrinterName('GT800 RAW')
      fetchPrinterList.mockResolvedValue({ status: 'ok', printers: [{ name: 'GT800 RAW', label: 'GT800 RAW' }], detail: '' })

      const store = zebraPrinterApi()
      const res = await store.fetchBarcodePrinterStatus()

      expect(res.profile).toBe('gt800')
      expect(res.status).toBe('success')
      expect(api.zebraPrinter.getStatus).not.toHaveBeenCalled()
    })

    it('gt800: bridge ไม่ตอบ → bridge-error', async () => {
      setBarcodeProfile(PRINTER_PROFILES.GT800)
      fetchPrinterList.mockResolvedValue({ status: 'unreachable', printers: [], detail: 'connect refused' })

      const store = zebraPrinterApi()
      const res = await store.fetchBarcodePrinterStatus()

      expect(res.status).toBe('bridge-error')
    })

    it('gt800: ยังไม่ได้ตั้งชื่อเครื่องพิมพ์ → no-printer', async () => {
      setBarcodeProfile(PRINTER_PROFILES.GT800)
      setBarcodePrinterName('')
      fetchPrinterList.mockResolvedValue({ status: 'ok', printers: [{ name: 'X', label: 'X' }], detail: '' })

      const store = zebraPrinterApi()
      const res = await store.fetchBarcodePrinterStatus()

      expect(res.status).toBe('no-printer')
    })

    it('gt800: ตั้งชื่อไว้แต่หาไม่เจอในเครื่องนี้ → printer-not-found', async () => {
      setBarcodeProfile(PRINTER_PROFILES.GT800)
      setBarcodePrinterName('GT800 RAW')
      fetchPrinterList.mockResolvedValue({ status: 'ok', printers: [{ name: 'OTHER', label: 'OTHER' }], detail: '' })

      const store = zebraPrinterApi()
      const res = await store.fetchBarcodePrinterStatus()

      expect(res.status).toBe('printer-not-found')
    })

    it('profileOverride=gt800 แม้ saved profile เป็น legacy → เช็คผ่าน bridge ไม่ใช่ legacy', async () => {
      setBarcodeProfile(PRINTER_PROFILES.LEGACY)
      fetchPrinterList.mockResolvedValue({ status: 'ok', printers: [{ name: 'X', label: 'X' }], detail: '' })

      const store = zebraPrinterApi()
      const res = await store.fetchBarcodePrinterStatus(PRINTER_PROFILES.GT800)

      expect(res.profile).toBe('gt800')
      expect(api.zebraPrinter.getStatus).not.toHaveBeenCalled()
      expect(fetchPrinterList).toHaveBeenCalledTimes(1)
    })

    it('profileOverride=legacy แม้ saved profile เป็น gt800 → เช็คผ่าน Zebra Print Service ไม่ใช่ bridge', async () => {
      setBarcodeProfile(PRINTER_PROFILES.GT800)
      api.zebraPrinter.getStatus.mockResolvedValue({ service: { status: 'running' } })

      const store = zebraPrinterApi()
      const res = await store.fetchBarcodePrinterStatus(PRINTER_PROFILES.LEGACY)

      expect(res.profile).toBe('legacy')
      expect(fetchPrinterList).not.toHaveBeenCalled()
    })

    it('ไม่ส่ง profileOverride → ใช้ saved profile เหมือนเดิม', async () => {
      setBarcodeProfile(PRINTER_PROFILES.LEGACY)
      api.zebraPrinter.getStatus.mockResolvedValue({ service: { status: 'running' } })

      const store = zebraPrinterApi()
      const res = await store.fetchBarcodePrinterStatus()

      expect(res.profile).toBe('legacy')
      expect(fetchPrinterList).not.toHaveBeenCalled()
    })
  })
})
