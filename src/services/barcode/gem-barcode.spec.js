import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/services/api/print-bridge-service.js', () => ({
  printRaw: vi.fn().mockResolvedValue({ success: true }),
  getPrinterState: vi.fn().mockResolvedValue(null),
  checkBridgeHealth: vi.fn().mockResolvedValue(true)
}))

import { printRaw, getPrinterState, checkBridgeHealth } from '@/services/api/print-bridge-service.js'
import { setMaterialLabelPrinterName } from '@/services/api/barcode-printer-config.js'
import {
  gemBarcodeService,
  sanitizeLabelText,
  sanitizeBarcodeValue,
  MATERIAL_PRINTER_NOT_CONFIGURED_MESSAGE
} from './gem-barcode.js'

const data = {
  stockCode: '*SA0126*',
  barcode: 'SA0126',
  description: 'Ruby Round 3.0',
  date: '30/10/2026',
  goldType: '18K-A'
}

describe('sanitizeLabelText', () => {
  it('คืนค่าเดิมเมื่อเป็น ASCII ปกติ', () => {
    expect(sanitizeLabelText('Ruby Round 3.0')).toBe('Ruby Round 3.0')
  })

  it('ตัดอักษรไทยและวงเล็บว่าง', () => {
    expect(sanitizeLabelText('Ruby(ซองเจีย)')).toBe('Ruby')
  })

  it('ยุบช่องว่างและ trim', () => {
    expect(sanitizeLabelText('  ทับทิม  Ruby   Round ')).toBe('Ruby Round')
  })

  it('null/undefined → ว่าง', () => {
    expect(sanitizeLabelText(null)).toBe('')
    expect(sanitizeLabelText(undefined)).toBe('')
  })
})

describe('sanitizeBarcodeValue', () => {
  it('ตัดอักษรไทยและช่องว่าง', () => {
    expect(sanitizeBarcodeValue('SA01ก26 ')).toBe('SA0126')
  })
})

describe('generateEPL', () => {
  it('ข้อมูล ASCII ได้ template เดิม', () => {
    const epl = gemBarcodeService.generateEPL(data)
    expect(epl).toBe(
      [
        'N',
        'q319',
        'Q240,24',
        'S4',
        '',
        'A10,10,0,3,1,1,N,"*SA0126*"',
        '',
        'B90,50,0,1,2,3,60,N,"SA0126"',
        '',
        'A10,120,0,2,1,1,N,"Ruby Round 3.0"',
        '',
        'A10,150,0,1,1,1,N,"30/10/2026"',
        'A200,150,0,1,1,1,N,"18K-A"',
        '',
        'A10,180,0,1,1,1,N,"Duang Kaew Jewelry"',
        '',
        'P1'
      ].join('\n')
    )
  })

  it('ตัดอักษรไทยออกจากคำอธิบาย', () => {
    const epl = gemBarcodeService.generateEPL({ ...data, description: 'Ruby(ซองเจีย)' })
    expect(epl).toContain('A10,120,0,2,1,1,N,"Ruby"')
  })
})

describe('print path (DK Print Bridge)', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
    checkBridgeHealth.mockResolvedValue(true)
    getPrinterState.mockResolvedValue(null)
  })

  it('ยังไม่ตั้งเครื่องพิมพ์ → throw ข้อความไทย ไม่เรียก printRaw', async () => {
    await expect(gemBarcodeService.printBarcode(data)).rejects.toThrow(MATERIAL_PRINTER_NOT_CONFIGURED_MESSAGE)
    expect(printRaw).not.toHaveBeenCalled()
  })

  it('printBarcode ส่ง printRaw พร้อม printerName ที่ตั้งไว้', async () => {
    setMaterialLabelPrinterName('Honeywell PC42t')
    const res = await gemBarcodeService.printBarcode(data)
    expect(res.success).toBe(true)
    expect(printRaw).toHaveBeenCalledTimes(1)
    const arg = printRaw.mock.calls[0][0]
    expect(arg.printerName).toBe('Honeywell PC42t')
    expect(arg.text).toContain('B90,50,0,1,2,3,60,N,"SA0126"')
  })

  it('printBarcodes ตามจำนวนสำเนาต่อรายการ', async () => {
    setMaterialLabelPrinterName('Honeywell PC42t')
    const res = await gemBarcodeService.printBarcodes([data, { ...data, barcode: 'SA0127' }], 3)
    expect(res.total).toBe(6)
    const text = printRaw.mock.calls[0][0].text
    expect(text.split('P1').length - 1).toBe(6)
  })

  it('testPrinter: ไม่ได้ตั้งค่า → notConfigured', async () => {
    const res = await gemBarcodeService.testPrinter()
    expect(res.success).toBe(false)
    expect(res.notConfigured).toBe(true)
  })

  it('testPrinter: bridge ล่ม → fail', async () => {
    setMaterialLabelPrinterName('Honeywell PC42t')
    checkBridgeHealth.mockResolvedValue(false)
    const res = await gemBarcodeService.testPrinter()
    expect(res.success).toBe(false)
    expect(res.notConfigured).toBeUndefined()
  })

  it('testPrinter: เครื่อง offline → fail', async () => {
    setMaterialLabelPrinterName('Honeywell PC42t')
    getPrinterState.mockResolvedValue({ offline: true })
    expect((await gemBarcodeService.testPrinter()).success).toBe(false)
  })

  it('testPrinter: พร้อม → success', async () => {
    setMaterialLabelPrinterName('Honeywell PC42t')
    const res = await gemBarcodeService.testPrinter()
    expect(res.success && res.connected).toBe(true)
  })
})
